<script setup lang="ts">
import { EmojiItem } from "@/clients/slack/blockModels";
import { emojiCache } from "@/global-cache";

const props = defineProps<{
  item: EmojiItem;
}>();

const emojiStr = computed(() =>
  String.fromCodePoint(parseInt(props.item.unicode!, 16)),
);
const emojiUrl = computed(() => emojiCache[props.item.name]);
</script>

<template>
  <template v-if="item.unicode">
    <span style="font-size: 18px">{{ emojiStr }}</span>
  </template>
  <template v-else>
    <img
      :src="emojiUrl"
      style="vertical-align: -3px; margin-left: 1px"
      width="18px"
      height="18px"
      :alt="item.name"
    />
  </template>
</template>
