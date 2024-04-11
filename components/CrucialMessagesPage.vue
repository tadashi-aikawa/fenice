<script setup lang="ts">
import { unreadMessagesStorage } from "@/utils/storage";
import PostCard from "./PostCard.vue";
import { sleep } from "@/utils/os";
import { Message } from "@/clients/slack/models";

const messages = ref<Message[]>([]);
onMounted(async () => {
  messages.value = await unreadMessagesStorage.getValue();
  unreadMessagesStorage.watch((newValue) => {
    messages.value = newValue;
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
</script>

<template>
  <div class="d-flex flex-column align-center pa-5">
    <div style="width: 750px; height: 95vh; overflow-y: auto">
      <transition-group name="list">
        <PostCard
          :key="message.ts"
          v-for="message in messages"
          :message="message"
          @click:read="markAsRead"
        />
      </transition-group>
    </div>

    <v-btn
      prepend-icon="mdi-check-circle-outline"
      color="warning"
      style="position: absolute; right: 10px; top: 10px"
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
