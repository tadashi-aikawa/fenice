<script setup lang="ts">
import { ChannelItem } from "@/clients/slack/blockModels";
import { channelsByIdCache } from "@/global-cache";

const props = defineProps<{
  item: ChannelItem;
}>();

const channelName = computed(
  () => channelsByIdCache[props.item.channel_id]?.name ?? "存在しないchannel",
);
</script>

<template>
  <span class="channel">#{{ channelName }}</span>
</template>

<style scoped>
.channel {
  color: dodgerblue;
  background-color: whitesmoke;
  line-height: 30px;
  border-radius: 2px;
  padding-left: 2px;
  padding-right: 2px;
}
</style>
