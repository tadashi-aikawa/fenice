import { getSearchMessages } from "@/clients/slack";
import { RequestError } from "@/clients/slack/base";
import { Message } from "@/models";
import { uniqBy } from "@/utils/collections";
import {
  crucialMessageConditionsStorage,
  unreadMessagesStorage,
} from "@/utils/storage";
import { AsyncResult, DateTime, err, ok } from "owlelia";

async function searchMessages(
  queries: string[],
): AsyncResult<Message[], RequestError[]> {
  let results: Message[] = [];
  let errors = [];

  for (const q of queries) {
    const [res, err] = (
      await getSearchMessages({
        query: [q, `after: ${DateTime.today().minusDays(2).displayDate}`].join(
          " ",
        ),
        sort: "timestamp",
        count: 100,
      })
    ).unwrap();
    if (err) {
      errors.push(err);
    } else {
      results = results.concat(res.messages.matches);
    }
  }

  return errors.length > 0 ? err(errors) : ok(results);
}

export default defineBackground(() => {
  // FIXME: オプションで設定できるようにしたい
  browser.alarms.create("", { periodInMinutes: 0.5 });
  browser.alarms.onAlarm.addListener(async (_alarm) => {
    const conditions = await crucialMessageConditionsStorage.getValue();
    if (conditions.length === 0) {
      return;
    }

    const timestamp = DateTime.now().unix.toString();
    const [messages, errors] = (await searchMessages(conditions)).unwrap();
    if (errors) {
      const errorMessage = errors
        .map((x) => `[${x.title}] ${x.message}`)
        .join("\n");
      browser.notifications.create(timestamp, {
        title: "検索に失敗",
        message: errorMessage,
        type: "basic",
        iconUrl:
          "https://github.com/tadashi-aikawa/fenice/raw/master/public/icon/384.png",
      });
      return;
    }

    const readByTs = await readByTsStorage.getValue();
    const uniqMessages = uniqBy(
      messages.filter((x) => !(x.ts in readByTs)),
      (m) => m.ts,
    );
    const unreadMessages = await unreadMessagesStorage.getValue();
    const newMessages = uniqMessages.filter(
      (x) => !unreadMessages.find((um) => um.ts === x.ts),
    );

    if (newMessages.length === 0) {
      return;
    }

    const title = `${newMessages.length}件の新しいメッセージがあります`;
    browser.notifications.create(timestamp, {
      title,
      message: "todo",
      type: "basic",
      iconUrl:
        "https://github.com/tadashi-aikawa/fenice/raw/master/public/icon/384.png",
    });

    const newUnreadMessages = unreadMessages
      .concat(newMessages)
      .toSorted(sorter((x) => Number(x.ts), "desc"));

    await unreadMessagesStorage.setValue(newUnreadMessages);
  });
});
