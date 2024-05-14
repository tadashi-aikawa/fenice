<script setup lang="ts">
import {
  quickReactionEmojisStorage,
  unreadMessagesStorage,
} from "@/utils/storage";
import PostCard from "./PostCard.vue";
import { sleep } from "@/utils/os";
import { Message } from "@/clients/slack/models";
import { useCardActions } from "@/composables/CardActions";

const { reactAsEmoji, showThread } = useCardActions();

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
  const unreadMessages = await unreadMessagesStorage.getValue();
  const newUnreadMessages = unreadMessages.filter(
    (x) => !messages.value.map((t) => t.ts).includes(x.ts),
  );

  const readByTs = await readByTsStorage.getValue();
  for (const m of messages.value) {
    readByTs[m.ts] = true;
  }

  await unreadMessagesStorage.setValue(newUnreadMessages);
  await readByTsStorage.setValue(readByTs);
};
</script>

<template>
  <div class="d-flex flex-column align-center pa-5">
    <div
      class="pa-1 py-3"
      style="width: 750px; height: calc(100vh - 125px); overflow-y: auto"
    >
      <transition-group name="list">
        <PostCard
          :key="message.ts"
          v-for="message in messages"
          read-icon="mdi-check-circle-outline"
          :message="message"
          enable-thread
          @click:read="markAsRead"
          @click:reaction="reactAsEmoji"
          @click:thread="showThread"
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
.list-leave-active {
  transition: all 0.2s ease-in;
}
.list-leave-to {
  opacity: 0;
  transform: translatex(360px);
}

.list-enter-active {
  transition: all 0.2s linear;
}
.list-enter-from {
  opacity: 0;
}
</style>
