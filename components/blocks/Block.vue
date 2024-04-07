<script setup lang="ts">
import { Block } from "../../clients/slack/blockModels";
import RichTextList from "./RichTextList.vue";
import RichTextPreformatted from "./RichTextPreformatted.vue";
import RichTextSection from "./RichTextSection.vue";

defineProps<{
  item: Block;
}>();
</script>

<template>
  <div>
    <template v-for="childItem in item.elements">
      <RichTextSection
        v-if="childItem.type === 'rich_text_section'"
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
    </template>
  </div>
</template>
