<script setup lang="ts">
import { LinkItem } from "@/clients/slack/blockModels";

defineProps<{
  item: LinkItem;
}>();
</script>

<template>
  <a target="_blank" class="link" :href="item.url">
    {{ item.text ?? item.url }}
  </a>
</template>

<style scoped>
.link {
  font-size: inherit;
  line-height: inherit;
  word-wrap: anywhere;
}
</style>
