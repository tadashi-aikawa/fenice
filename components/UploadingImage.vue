<script setup lang="ts">
defineProps<{
  uploading: boolean;
  src: string;
  width: string;
  height: string;
}>();
</script>

<template>
  <div style="position: relative">
    <img :src="src" :width="width" :height="height" />
    <v-overlay
      :model-value="uploading"
      contained
      class="justify-center align-center"
    >
      <v-progress-circular indeterminate />
    </v-overlay>
  </div>
</template>
