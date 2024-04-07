<script setup lang="ts">
import { LinkItem } from "@/clients/slack/blockModels";

defineProps<{
  item: LinkItem;
}>();
</script>

<template>
  <a
    target="_blank"
    class="link"
    :class="{
      bold: item.style?.bold,
      code: item.style?.code,
      strike: item.style?.strike,
    }"
    :href="item.url"
  >
    {{ item.text ?? item.url }}
  </a>
</template>

<style scoped>
.link {
  font-size: inherit;
  line-height: inherit;
  word-wrap: anywhere;
  text-decoration: none;
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
