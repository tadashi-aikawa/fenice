<script setup lang="ts">
import { File } from "@/clients/slack/models";

defineProps<{
  file: File;
}>();
</script>

<template>
  <div>
    <template
      v-if="['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(file.filetype)"
    >
      <a :href="file.url_private" target="_blank" style="text-decoration: none">
        <img :src="file.url_private" style="max-width: 600px" />
      </a>
    </template>
    <template v-else-if="['mp4'].includes(file.filetype)">
      <video muted controls :src="file.url_private" style="max-width: 600px" />
    </template>
    <template v-else>
      <b>今はFeniceでサポートしていない形式です</b>
    </template>
  </div>
</template>
