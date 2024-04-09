<script setup lang="ts">
import slackMessageParser from "slack-message-parser";
import MrkdwnNode from "./MrkdwnNode.vue";

const props = defineProps<{
  text: string;
}>();

const tree = computed(() =>
  // XXX: `<http://...|hoge>` がリンクではなく丸ごとインラインコードとみなされてしまうため無理やり回避
  slackMessageParser(props.text.replaceAll("`<", "<").replaceAll(">`", ">")),
);
</script>

<template>
  <template v-for="node in tree.children">
    <MrkdwnNode :node="node" />
  </template>
</template>
