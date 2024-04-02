<script setup lang="ts">
import { Message } from "@/models";
import { unreadMessagesStorage } from "@/utils/storage";

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
      <v-card
        v-for="message in messages"
        color="primary"
        variant="tonal"
        max-width="720"
        class="mb-3"
      >
        <v-card-item>
          <div class="text-overline mb-1">
            {{ message.channel.id }}
          </div>
          <div class="text-h6 mb-1">
            {{ message.username }}
          </div>
          <div class="text-caption">{{ message.text }}</div>
        </v-card-item>
      </v-card>
    </div>
  </div>
</template>
