<script setup lang="ts">
import { ContextBlock } from "@/clients/slack/models";
import MrkdwnView from "./mrkdwn/MrkdwnView.vue";

defineProps<{
  item: ContextBlock;
}>();
</script>

<template>
  <div class="context">
    <template v-for="el in item.elements">
      <template v-if="el.type === 'image'">
        <img :src="el.image_url" width="18px" />
      </template>
      <template v-else-if="el.type === 'mrkdwn'">
        <span class="mr-3">
          <MrkdwnView :text="el.text" />
        </span>
      </template>
    </template>
  </div>
</template>

<style scoped>
.context {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  font-size: 90%;
  color: grey;
}
</style>
