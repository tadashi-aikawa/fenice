<script setup lang="ts">
import slackMessageParser from "slack-message-parser";
import MrkdwnNode from "./MrkdwnNode.vue";

const props = defineProps<{
  text: string;
}>();

const tree = computed(() =>
  slackMessageParser(
    // XXX: slack-message-parserの挙動により一部無理やり調整している
    //      完璧な対応は不可能なので頻度の高いものを優先
    props.text
      .split("\n")
      .map((line) =>
        line
          // Block quoteが成立しない問題の回避
          .replaceAll(/^>/g, "&gt;")
          // `<url|name>` がそのまま表示されてしまう問題の回避
          .replaceAll(/`</g, "<")
          .replaceAll(/>`/g, ">"),
      )
      .join("\n"),
  ),
);
</script>

<template>
  <template v-for="node in tree.children">
    <MrkdwnNode :node="node" />
  </template>
</template>
