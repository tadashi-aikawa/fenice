<script setup lang="ts">
import { RichTextPreformattedItem } from "@/clients/slack/blockModels";
import Text from "./Text.vue";
import Link from "./Link.vue";

defineProps<{
  item: RichTextPreformattedItem;
}>();
</script>

<template>
  <div class="pre">
    <template v-for="childItem in item.elements">
      <Text v-if="childItem.type === 'text'" :item="childItem" />
      <Link v-if="childItem.type === 'link'" :item="childItem" />
      <template v-else> <b>今はFeniceでサポートしていない形式です</b></template>
    </template>
  </div>
</template>

<style scoped>
.pre {
  font-family: monospace;
  font-size: 85%;
  line-height: 16px;
  white-space: pre-wrap;
  word-wrap: anywhere;
  max-width: 95%;
  padding: 10px;
  margin-top: 5px;
  border-radius: 7px;
  border: solid 1px lightgrey;
  background-color: ghostwhite;
  vertical-align: baseline;
}
</style>
