<script setup lang="ts">
import { RichTextBlock } from "../../clients/slack/blockModels";
import RichTextList from "./RichTextList.vue";
import RichTextPreformatted from "./RichTextPreformatted.vue";
import RichTextQuote from "./RichTextQuote.vue";
import RichTextSection from "./RichTextSection.vue";

defineProps<{
  item: RichTextBlock;
}>();
</script>

<template>
  <div>
    <template v-for="childItem in item.elements">
      <RichTextSection
        v-if="childItem.type === 'rich_text_section'"
        :item="childItem"
      />
      <RichTextQuote
        v-if="childItem.type === 'rich_text_quote'"
        :item="childItem"
      />
      <RichTextList
        v-else-if="childItem.type === 'rich_text_list'"
        :item="childItem"
      />
      <RichTextPreformatted
        v-else-if="childItem.type === 'rich_text_preformatted'"
        :item="childItem"
      />
      <template v-else> <b>今はFeniceでサポートしていない形式です</b></template>
    </template>
  </div>
</template>
