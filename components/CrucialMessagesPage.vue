<script setup lang="ts">
import {
  quickReactionEmojisStorage,
  unreadMessagesStorage,
} from "@/utils/storage";
import PostCard from "./PostCard.vue";
import { sleep } from "@/utils/os";
import { Message } from "@/clients/slack/models";
import { postReactionsAdd } from "@/clients/slack";
import { showInfoToast } from "@/utils/toast";

const messages = ref<Message[]>([]);
const reactionEmojis = ref<string[]>([]);
onMounted(async () => {
  messages.value = await unreadMessagesStorage.getValue();
  unreadMessagesStorage.watch((newValue) => {
    messages.value = newValue;
  });

  reactionEmojis.value = await quickReactionEmojisStorage.getValue();
  quickReactionEmojisStorage.watch((newValue) => {
    reactionEmojis.value = newValue;
  });
});

const markAsRead = async (message: Message) => {
  const unreadMessages = await unreadMessagesStorage.getValue();
  const newUnreadMessages = unreadMessages.filter((x) => x.ts !== message.ts);

  const readByTs = await readByTsStorage.getValue();
  readByTs[message.ts] = true;

  await unreadMessagesStorage.setValue(newUnreadMessages);
  await readByTsStorage.setValue(readByTs);
};

const markAllAsRead = async () => {
  for (const message of messages.value) {
    await markAsRead(message);
    await sleep(10);
  }
};

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
</script>

<template>
  <div class="d-flex flex-column align-center pa-5">
    <div
      class="pa-1 mt-3"
      style="width: 750px; height: calc(100vh - 125px); overflow-y: auto"
    >
      <transition-group name="list">
        <PostCard
          :key="message.ts"
          v-for="message in messages"
          :message="message"
          @click:read="markAsRead"
          @click:reaction="reactAsEmoji"
          :reaction-emojis="reactionEmojis"
        />
      </transition-group>
    </div>

    <v-btn
      prepend-icon="mdi-check-circle-outline"
      color="warning"
      style="position: absolute; right: 30px; top: 30px"
      @click="markAllAsRead"
      >すべて既読にする</v-btn
    >
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translatex(360px);
}
</style>
