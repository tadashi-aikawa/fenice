import { getSearchMessages, postOauthV2Access } from "@/clients/slack";
import { RequestError } from "@/clients/slack/base";
import { Message } from "@/clients/slack/models";
import { uniqBy } from "@/utils/collections";
import {
  crucialMessageConditionsStorage,
  lastBackgroundSearchMessageTimestampStorage,
  refreshTokenStorage,
  updateMessages,
} from "@/utils/storage";
import { AsyncResult, DateTime, err, ok } from "owlelia";

const FENICE_ICON_URL =
  "https://github.com/tadashi-aikawa/fenice/raw/master/public/icon/384.png";

async function searchMessages(
  queries: string[],
): AsyncResult<Message[], RequestError[]> {
  let results: Message[] = [];
  let errors = [];

  for (const q of queries) {
    const [res, err] = (
      await getSearchMessages({
        query: [
          q,
          `after:${DateTime.today().minusDays(2).displayDate}`,
          `-from:me`,
        ].join(" "),
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

async function refreshTokens() {
  const accessToken = await accessTokenStorage.getValue();
  if (!accessToken) {
    return;
  }

  const refreshToken = await refreshTokenStorage.getValue();
  const clientId = await clientIdStorage.getValue();
  const clientSecret = await clientSecretStorage.getValue();
  if (!refreshToken || !clientId || !clientSecret) {
    return;
  }

  const [res, error] = (
    await postOauthV2Access({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    })
  ).unwrap();
  if (error) {
    browser.notifications.create({
      title: error.title,
      message: error.message,
      type: "basic",
      iconUrl: FENICE_ICON_URL,
    });
    return;
  }

  await accessTokenStorage.setValue(res.access_token);
  await refreshTokenStorage.setValue(res.refresh_token);
}

export default defineBackground(() => {
  // アイコンクリック時の処理
  browser.action.onClicked.addListener(() => {
    browser.tabs.create({ url: browser.runtime.getURL("/top.html") });
  });

  // 通知クリック時の処理
  const notifiedIds = new Set<string>();
  browser.notifications.onClicked.addListener(async (nid) => {
    if (!notifiedIds.has(nid)) {
      return;
    }
    notifiedIds.delete(nid);

    const feniceTab = (await browser.tabs.query({ title: "Fenice" })).at(0);
    if (!feniceTab?.id) {
      return;
    }

    const windowId = (await browser.windows.get(feniceTab.windowId!))?.id;
    if (windowId) {
      browser.windows.update(windowId, { focused: true });
    }

    browser.tabs.update(feniceTab.id, {
      active: true,
    });
    browser.tabs.sendMessage(feniceTab.id, { page: "crucial-messages" });
  });

  // 定期検索処理
  // 検索頻度は設定値によるがalermは頻繁に実行させないとservice workerが停止するっぽいので
  // また、ここでstoreの非同期値をとるとservice workerが無効化されそう
  browser.alarms.create("background-search", { periodInMinutes: 1 });
  // 1時間に深い意味はない. 管理者権限のような強い操作はできないので10分などまで縮める必要はないと判断
  browser.alarms.create("background-refresh-token", { periodInMinutes: 60 });

  browser.alarms.onAlarm.addListener(async (alarm) => {
    console.debug(`[${DateTime.now().rfc3339}] 📣 alermの登録処理を実行`);

    // 完璧ではないけど一旦これで十分
    const feniceTab = (await browser.tabs.query({ title: "Fenice" })).at(0);
    if (!feniceTab) {
      return;
    }

    if (alarm.name === "background-refresh-token") {
      await refreshTokens();
      return;
    }

    if (alarm.name === "background-search") {
      const intervalMinutes = await searchIntervalMinutesStorage.getValue();
      const lastTimestamp =
        await lastBackgroundSearchMessageTimestampStorage.getValue();
      if (
        DateTime.now().diffSeconds(DateTime.of(lastTimestamp)) <
        intervalMinutes * 60
      ) {
        console.debug(
          "[${DateTime.now().rfc3339}] 🥃 間隔が設定値未満なのでスキップ",
        );
        console.debug({ lastTimestamp, intervalMinutes });
        return;
      }

      const conditions = await crucialMessageConditionsStorage.getValue();
      if (conditions.length === 0) {
        return;
      }

      const accessToken = await accessTokenStorage.getValue();
      if (!accessToken) {
        return;
      }

      const timestamp = DateTime.now().unix;
      await lastBackgroundSearchMessageTimestampStorage.setValue(timestamp);

      const [messages, errors] = (await searchMessages(conditions)).unwrap();
      if (errors) {
        const errorMessage = errors
          .map((x) => `[${x.title}] ${x.message}`)
          .join("\n");
        const includesExpiredError = errors.find(
          (x) => x.title === "token_expired",
        );
        browser.notifications.create(timestamp.toString(), {
          title: includesExpiredError
            ? "アクセストークンの有効期限が切れました"
            : "検索に失敗",
          message: includesExpiredError
            ? "Slackとの再認証が必要です"
            : errorMessage,
          type: "basic",
          iconUrl: FENICE_ICON_URL,
        });
        return;
      }

      const newMessages = await updateMessages(messages);
      if (newMessages.length === 0) {
        return;
      }

      const channelNames = uniqBy(
        newMessages.map((x) => (x.channel.is_im ? x.username : x.channel.name)),
        (x) => x,
      ).join("\n");
      const title = `${newMessages.length}件の新しいメッセージがあります`;
      const notificationId = await browser.notifications.create(
        timestamp.toString(),
        {
          title,
          message: `${channelNames}`,
          type: "basic",
          iconUrl: FENICE_ICON_URL,
        },
      );
      notifiedIds.add(notificationId);
    }
  });
});
