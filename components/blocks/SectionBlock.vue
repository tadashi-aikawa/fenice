<script setup lang="ts">
import { SectionBlock } from "@/clients/slack/blockModels";
import MrkdwnView from "./mrkdwn/MrkdwnView.vue";

defineProps<{
  item: SectionBlock;
}>();
</script>

<template>
  <div>
    <template v-if="item.text.type === 'plain_text'">
      {{ item.text.text }}
    </template>
    <template v-else-if="item.text.type === 'mrkdwn'">
      <MrkdwnView :text="item.text.text" />
    </template>
  </div>
</template>
