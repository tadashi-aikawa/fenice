<script setup lang="ts">
import { Node, NodeType } from "slack-message-parser";
import MrkdownNode from "./MrkdwnNode.vue";
import { emojiCache, getEmojiUrl, usersByIdCache } from "@/global-cache";

defineProps<{
  node: Node;
}>();
</script>

<template>
  <template v-if="node.type === NodeType.Text">
    <span class="text">{{ node.text }}</span>
  </template>

  <template v-else-if="node.type === NodeType.ChannelLink">💩</template>

  <template v-else-if="node.type === NodeType.UserLink">
    <span class="user"
      >@{{ usersByIdCache[node.userID]?.name ?? "unknown_user" }}</span
    >
  </template>

  <template v-else-if="node.type === NodeType.URL">
    <a target="_blank" class="link" :href="node.url">
      <template v-if="node.label">
        <template v-for="c in node.label">
          <MrkdownNode :node="c" />
        </template>
      </template>
      <template v-else>
        {{ node.url }}
      </template>
    </a>
  </template>

  <template v-else-if="node.type === NodeType.Command">
    <template v-for="c in node.label">
      <MrkdownNode :node="c" />
    </template>
  </template>

  <template v-else-if="node.type === NodeType.Emoji">
    <span v-if="name2emoji(node.name)">{{ name2emoji(node.name) }}</span>
    <img
      v-else
      :src="getEmojiUrl(node.name)"
      style="vertical-align: -3px; margin-left: 1px"
      width="18px"
      height="18px"
      :alt="node.name"
    />
  </template>

  <template v-else-if="node.type === NodeType.PreText">
    <div class="pre">{{ node.text }}</div>
  </template>

  <template v-else-if="node.type === NodeType.Code">
    <span class="code">{{ node.text }}</span>
  </template>

  <template v-else-if="node.type === NodeType.Italic">
    <span class="italic">
      <template v-for="c in node.children">
        <MrkdownNode :node="c" />
      </template>
    </span>
  </template>

  <template v-else-if="node.type === NodeType.Bold">
    <span class="bold">
      <template v-for="c in node.children">
        <MrkdownNode :node="c" />
      </template>
    </span>
  </template>

  <template v-else-if="node.type === NodeType.Strike">
    <span class="strike">
      <template v-for="c in node.children">
        <MrkdownNode :node="c" />
      </template>
    </span>
  </template>

  <template v-else-if="node.type === NodeType.Quote">
    <div class="cite">
      <template v-for="c in node.children">
        <MrkdownNode :node="c" />
      </template>
    </div>
  </template>

  <template v-else-if="node.type === NodeType.Root">
    <template v-for="c in node.children">
      <MrkdownNode :node="c" />
    </template>
  </template>
</template>

<style scoped>
.text {
  font-size: inherit;
  line-height: inherit;
  white-space: pre-wrap;
}
.bold {
  font-weight: bold;
}
.italic {
  font-style: italic;
}
.code {
  color: #d7355e;
  background-color: #f7f7f7;
  border: solid 1px lightgrey;
  font-size: 90%;
  padding: 1px 2px;
  margin: 2px;
  border-radius: 3px;
  vertical-align: baseline;
  line-height: 24px;
}
.strike {
  text-decoration: line-through;
}
.link {
  font-size: inherit;
  line-height: inherit;
  word-wrap: anywhere;
  text-decoration: none;
}
.pre {
  font-family: monospace;
  font-size: 85%;
  line-height: 16px;
  white-space: pre-wrap;
  word-wrap: anywhere;
  max-width: 95%;
  padding: 10px;
  margin-top: 5px;
  border-radius: 7px;
  border: solid 1px lightgrey;
  background-color: ghostwhite;
  vertical-align: baseline;
}
.cite {
  padding: 0 10px;
  margin-bottom: 10px;
  border: 0 solid lightgrey;
  border-left-width: 4px;
  opacity: 0.8;
}
.user {
  color: dodgerblue;
  background-color: powderblue;
  line-height: 30px;
  border-radius: 2px;
  padding-left: 2px;
  padding-right: 2px;
}
</style>
