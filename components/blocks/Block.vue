<script setup lang="ts">
import { Block } from "../../clients/slack/blockModels";
import ContextBlock from "./ContextBlock.vue";
import DividerBlock from "./DividerBlock.vue";
import ImageBlock from "./ImageBlock.vue";
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
    <template v-else-if="item.type === 'context'">
      <ContextBlock :item="item" />
    </template>
    <template v-else-if="item.type === 'rich_text'">
      <RichTextBlock :item="item" />
    </template>
    <template v-else-if="item.type === 'actions'">
      <!-- actionsは敢えて表示しない -->
    </template>
    <template v-else-if="item.type === 'image'">
      <ImageBlock :item="item" />
    </template>
    <template v-else-if="item.type === 'divider'">
      <DividerBlock />
    </template>
    <template v-else> <b>今はFeniceでサポートしていない形式です</b></template>
  </div>
</template>
