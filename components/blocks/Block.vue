<script setup lang="ts">
import { Block } from "../../clients/slack/blockModels";
import RichTextBlock from "./RichTextBlock.vue";
import SectionBlock from "./SectionBlock.vue";

defineProps<{
  item: Block;
}>();
</script>

<template>
  <div>
    <template v-if="item.type === 'section'">
      <SectionBlock :item="item" />
    </template>
    <template v-if="item.type === 'rich_text'">
      <RichTextBlock :item="item" />
    </template>
  </div>
</template>
