<script setup lang="ts">
import { RichTextListItem } from "@/clients/slack/blockModels";
import RichTextSection from "./RichTextSection.vue";

defineProps<{
  item: RichTextListItem;
}>();
</script>

<template>
  <ul class="ul" :style="{ 'margin-left': `${20 * item.indent}px` }">
    <template v-for="childItem in item.elements">
      <li :class="item.style">
        <RichTextSection
          v-if="childItem.type === 'rich_text_section'"
          :item="childItem"
        />
        <template v-else>
          <b>今はFeniceでサポートしていない形式です</b></template
        >
      </li>
    </template>
  </ul>
</template>

<style scoped>
.ul {
  padding-left: 25px;
}
.bullet {
  list-style: disc;
  line-height: 22px;
}
.ordered {
  list-style: decimal;
  line-height: 22px;
}
</style>
