<script setup lang="ts">
import { RichTextSectionItem } from "@/clients/slack/blockModels";
import Text from "./Text.vue";
import Link from "./Link.vue";
import User from "./User.vue";
import Emoji from "./Emoji.vue";

defineProps<{
  item: RichTextSectionItem;
}>();
</script>

<template>
  <template v-for="childItem in item.elements">
    <Text v-if="childItem.type === 'text'" :item="childItem" />
    <Link v-else-if="childItem.type === 'link'" :item="childItem" />
    <User v-else-if="childItem.type === 'user'" :item="childItem" />
    <Emoji v-else-if="childItem.type === 'emoji'" :item="childItem" />
  </template>
</template>
