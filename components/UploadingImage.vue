<script setup lang="ts">
import { Resource } from "@/models";

defineProps<{
  uploading: boolean;
  file: Resource;
  width: string;
  height: string;
}>();
</script>

<template>
  <div style="position: relative">
    <template v-if="file.type === 'video' && !file.thumbnail">
      <v-progress-circular :style="{ width, height }" />
    </template>
    <template v-else>
      <img
        :src="file.thumbnail ?? file.blobUrl"
        :width="width"
        :height="height"
      />
    </template>

    <v-overlay
      :model-value="uploading"
      contained
      class="justify-center align-center"
    >
      <v-progress-circular indeterminate />
    </v-overlay>
  </div>
</template>
