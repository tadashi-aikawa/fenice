<script setup lang="ts">
import { BroadcastItem } from "@/clients/slack/blockModels";

const props = defineProps<{
  item: BroadcastItem;
}>();
</script>

<template>
  <span class="broadcast">@{{ item.range }}</span>
</template>

<style scoped>
.broadcast {
  color: coral;
  background-color: lightyellow;
  font-weight: bold;
  line-height: 30px;
  border-radius: 2px;
  padding-left: 2px;
  padding-right: 2px;
}
</style>
