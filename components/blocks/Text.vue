<script setup lang="ts">
import { TextItem } from "@/clients/slack/blockModels";

defineProps<{
  item: TextItem;
}>();
</script>

<template>
  <span class="text">
    {{ item.text }}
  </span>
</template>

<style scoped>
.text {
  font-size: inherit;
  line-height: inherit;
  white-space: pre-wrap;
}
</style>
