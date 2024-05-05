import { getConversationsReplies } from "@/clients/slack";
import { Message } from "@/clients/slack/models";
import { channelsByIdCache } from "@/global-cache";
import { defineStore } from "pinia";

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

    const [res, error] = (
      await getConversationsReplies({
        channel: channel.value,
        ts: threadTs.value,
      })
    ).unwrap();

    loading.value = false;

    if (error) {
      return showErrorToast(error);
    }

    messages.value = res.messages.map((m) => ({
      ...m,
      channel: channelsByIdCache[channel.value],
      permalink: "FIXME: いつか追加する",
    }));
  };

  watchEffect(async () => {
    if (!channel.value || !threadTs.value || !show.value) {
      return;
    }

    await search();
  });

  return { show, openThread, messages, loading };
});
