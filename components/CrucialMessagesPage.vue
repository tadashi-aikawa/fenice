<script setup lang="ts">
import { Message } from "@/models";
import { unreadMessagesStorage } from "@/utils/storage";
import PostCard from "./PostCard.vue";

const messages = ref<Message[]>([]);
onMounted(async () => {
  messages.value = await unreadMessagesStorage.getValue();
  unreadMessagesStorage.watch((newValue) => {
    messages.value = newValue;
  });
});
</script>

<template>
  <div class="d-flex flex-column align-center pa-5">
    <div style="width: 750px; height: 95vh; overflow-y: auto">
      <transition-group name="list">
        <PostCard
          :key="message.ts"
          v-for="message in messages"
          :message="message"
        />
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translatex(360px);
}
</style>
