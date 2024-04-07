<script setup lang="ts">
import { RichTextQuoteItem } from "@/clients/slack/blockModels";
import Text from "./Text.vue";
import Link from "./Link.vue";
import User from "./User.vue";
import Emoji from "./Emoji.vue";

defineProps<{
  item: RichTextQuoteItem;
}>();
</script>

<template>
  <div class="cite">
    <template v-for="childItem in item.elements">
      <Text v-if="childItem.type === 'text'" :item="childItem" />
      <Link v-else-if="childItem.type === 'link'" :item="childItem" />
      <User v-else-if="childItem.type === 'user'" :item="childItem" />
      <Emoji v-else-if="childItem.type === 'emoji'" :item="childItem" />
    </template>
  </div>
</template>

<style scoped>
.cite {
  padding: 0 10px;
  margin-bottom: 10px;
  border: 0 solid lightgrey;
  border-left-width: 4px;
  opacity: 0.8;
}
</style>
