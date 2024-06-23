import { getConversationsReplies, getPermalink } from "@/clients/slack";
import { Message } from "@/clients/slack/models";
import { channelsByIdCache } from "@/global-cache";
import { defineStore } from "pinia";
import { visibledButtonsStorage } from "@/utils/storage";

export const cardActionButtonTypes = [
  "open-browser",
  "open-slack",
  "lock-on",
  "stock",
  "json",
  "copy-text",
  "copy-link",
];
export type CardActionButtonType = (typeof cardActionButtonTypes)[number];

// 設定に関するグローバルストア
// TODO: ここに集約したい
export const useSettingStore = defineStore("setting", () => {
  const visibledButtons = ref<CardActionButtonType[]>([]);
  visibledButtonsStorage.watch((xs) => {
    visibledButtons.value = xs;
  });

  const init = async () => {
    visibledButtons.value = await visibledButtonsStorage.getValue();
  };
  init();

  return {
    visibledButtons,
  };
});

export const useThreadDrawerStore = defineStore("threadDrawer", () => {
  const show = ref(false);
  const channel = ref("");
  const threadTs = ref("");

  const loading = ref(false);
  const messages = ref<Message[]>([]);

  const openThread = (_channel: string, _threadTs: string) => {
    channel.value = _channel;
    threadTs.value = _threadTs;
    show.value = true;
  };

  // default: 1000件なのでpagingは考慮しない (100かもしれないけどそれでも問題ないかなと)
  const search = async () => {
    loading.value = true;

    const repliesRes = await getConversationsReplies({
      channel: channel.value,
      ts: threadTs.value,
    });
    if (repliesRes.isErr()) {
      loading.value = false;
      return showErrorToast(repliesRes.error);
    }

    const permalinkRes = await getPermalink({
      channel: channel.value,
      message_ts: threadTs.value,
    });
    if (permalinkRes.isErr()) {
      loading.value = false;
      return showErrorToast(permalinkRes.error);
    }

    loading.value = false;

    // https://api.slack.com/methods/chat.getPermalink でthreadTsのpermalinkを取得
    // ホストを抜き出してcreatePermalink をメッセージの数だけ呼び出す (これでリクエスト量を減らせる)
    messages.value = repliesRes.value.messages.map((m) => ({
      ...m,
      channel: channelsByIdCache[channel.value],
      permalink: permalinkRes.value.permalink.replace(
        /\/p.+\?/,
        `/p${m.ts.replace(".", "")}?`,
      ),
    }));
  };

  watchEffect(async () => {
    if (!channel.value || !threadTs.value || !show.value) {
      return;
    }

    await search();
  });

  return { show, openThread, messages, loading, threadTs };
});
