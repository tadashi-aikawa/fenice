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
      <PostCard v-for="message in messages" :message="message" />
    </div>
  </div>
</template>
