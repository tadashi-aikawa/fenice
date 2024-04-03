<script setup lang="ts">
import { Message } from "@/models";
import { ts2display } from "@/utils/date";

const props = defineProps<{
  message: Message;
}>();

const handleOpenSlack = () => {
  window.open(props.message.permalink, "_blank");
};
const handleRead = async () => {
  const unreadMessages = await unreadMessagesStorage.getValue();
  const newUnreadMessages = unreadMessages.filter(
    (x) => x.ts !== props.message.ts,
  );

  const readByTs = await readByTsStorage.getValue();
  readByTs[props.message.ts] = true;

  await unreadMessagesStorage.setValue(newUnreadMessages);
  await readByTsStorage.setValue(readByTs);
};
</script>

<template>
  <v-card variant="flat" max-width="720" class="mb-5" :elevation="4">
    <v-card-item>
      <div class="text-overline mb-1">
        {{ message.username }}
      </div>
      <div class="text-caption">{{ message.text }}</div>
      <span>{{ ts2display(message.ts) }}</span>
      <div>{{ message.ts }}</div>
    </v-card-item>
    <v-card-actions class="d-flex justify-center">
      <v-btn size="small" variant="tonal" @click="handleRead">既読にする</v-btn>
      <v-btn size="small" variant="tonal" @click="handleOpenSlack"
        >Slackで開く</v-btn
      >
    </v-card-actions>
  </v-card>
</template>
