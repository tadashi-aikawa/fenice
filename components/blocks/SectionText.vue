<script setup lang="ts">
import { SectionText } from "@/clients/slack/blockModels";
import MrkdwnView from "./mrkdwn/MrkdwnView.vue";

defineProps<{
  item: SectionText;
}>();
</script>

<template>
  <div>
    <template v-if="item.type === 'plain_text'">
      {{ item.text }}
    </template>
    <template v-else-if="item.type === 'mrkdwn'">
      <MrkdwnView :text="item.text" />
    </template>
  </div>
</template>
