import { postReactionsAdd } from "@/clients/slack";
import { Message } from "@/clients/slack/models";

export function useCardActions() {
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

  return {
    reactAsEmoji,
  };
}
