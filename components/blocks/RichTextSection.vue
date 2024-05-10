<script setup lang="ts">
import { RichTextSectionItem } from "@/clients/slack/blockModels";
import Text from "./Text.vue";
import Link from "./Link.vue";
import User from "./User.vue";
import Emoji from "./Emoji.vue";
import Usergroup from "./Usergroup.vue";
import Broadcast from "./Broadcast.vue";
import Channel from "./Channel.vue";

defineProps<{
  item: RichTextSectionItem;
}>();
</script>

<template>
  <template v-for="childItem in item.elements">
    <Text v-if="childItem.type === 'text'" :item="childItem" />
    <Link v-else-if="childItem.type === 'link'" :item="childItem" />
    <User v-else-if="childItem.type === 'user'" :item="childItem" />
    <Usergroup v-else-if="childItem.type === 'usergroup'" :item="childItem" />
    <Broadcast v-else-if="childItem.type === 'broadcast'" :item="childItem" />
    <Emoji v-else-if="childItem.type === 'emoji'" :item="childItem" />
    <Channel v-else-if="childItem.type === 'channel'" :item="childItem" />
    <template v-else> <b>今はFeniceでサポートしていない形式です</b></template>
  </template>
</template>
