<script setup lang="ts">
import { Message } from "@/models";
import { ts2display } from "@/utils/date";

const props = defineProps<{
  message: Message;
}>();

const handleOpenSlack = () => {
  window.open(props.message.permalink, "_blank");
};
</script>

<template>
  <v-card variant="flat" max-width="720" class="mb-5 pa-2" :elevation="4">
    <v-card-item>
      <div class="text-overline mb-1">
        {{ message.channel.id }}
      </div>
      <div class="text-h6 mb-1">
        {{ message.username }}
      </div>
      <div class="text-caption">{{ message.text }}</div>
      <span>{{ ts2display(message.ts) }}</span>
    </v-card-item>
    <v-card-action class="d-flex justify-center">
      <v-btn size="small" variant="tonal" @click="handleOpenSlack"
        >Slackで開く</v-btn
      >
    </v-card-action>
  </v-card>
</template>
