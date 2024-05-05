import { postReactionsAdd } from "@/clients/slack";
import { Message } from "@/clients/slack/models";
import { useThreadDrawerStore } from "@/stores";

export function useCardActions() {
  const { openThread } = useThreadDrawerStore();

  const reactionEmojis = ref<string[]>([]);
  onMounted(async () => {
    reactionEmojis.value = await quickReactionEmojisStorage.getValue();
    quickReactionEmojisStorage.watch((newValue) => {
      reactionEmojis.value = newValue;
    });
  });

  const reactAsEmoji = async (message: Message, emoji: string) => {
    const error = (
      await postReactionsAdd({
        channel: message.channel.id,
        name: emoji,
        timestamp: message.ts,
      })
    )._err;
    if (!error) {
      return;
    }
    // リアクション済でも期待結果は変わらないのでスルー
    if (error.title === "already_reacted") {
      return;
    }

    return showErrorToast(error);
  };

  const stock = async (message: Message) => {
    await updateMessages([message], { forceUnread: true });
    showSuccessToast("重要メッセージに追加しました");
  };

  const showThread = (channel: string, threadTs: string) => {
    openThread(channel, threadTs);
  };

  return {
    reactionEmojis,
    reactAsEmoji,
    stock,
    showThread,
  };
}
