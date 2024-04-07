<script setup lang="ts">
import { TextItem } from "@/clients/slack/blockModels";

defineProps<{
  item: TextItem;
}>();
</script>

<template>
  <span
    class="text"
    :class="{
      bold: item.style?.bold,
      code: item.style?.code,
      strike: item.style?.strike,
    }"
  >
    {{ item.text }}
  </span>
</template>

<style scoped>
.text {
  font-size: inherit;
  line-height: inherit;
  white-space: pre-wrap;
}
.bold {
  font-weight: bold;
}
.code {
  color: #d7355e;
  background-color: #f7f7f7;
  border: solid 1px lightgrey;
  font-size: 90%;
  padding: 1px 2px;
  margin: 2px;
  border-radius: 3px;
  vertical-align: baseline;
  line-height: 24px;
}
.strike {
  text-decoration: line-through;
}
</style>
