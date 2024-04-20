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
    if (error) {
      if (error.title === "already_reacted") {
        return showInfoToast(`既に :${emoji}: でリアクション済です`);
      }
      return showErrorToast(error);
    }

    showSuccessToast(`:${emoji}: でリアクションしました`);
  };

  return {
    reactAsEmoji,
  };
}
