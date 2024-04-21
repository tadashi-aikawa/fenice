<script setup lang="ts">
import { AttachmentField } from "../../clients/slack/blockModels";
import MrkdwnView from "./mrkdwn/MrkdwnView.vue";

defineProps<{
  item: AttachmentField;
}>();
</script>

<template>
  <div style="width: 50%" class="my-1">
    <div class="font-weight-bold">{{ item.title }}</div>
    <MrkdwnView :text="item.value" />
  </div>
</template>
