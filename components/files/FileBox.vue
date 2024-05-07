<script setup lang="ts">
defineProps<{
  url: string;
  title: string;
  subtitle: string;
  icon: `mdi-${string}`;
  color: string;
  previewImage?: string;
}>();
</script>

<template>
  <v-sheet elevation="2" class="pa-3" style="max-width: 520px">
    <div class="d-flex ga-1">
      <v-icon style="font-size: 3.8em" :style="{ color }">{{ icon }}</v-icon>
      <div>
        <a :href="url" class="link">
          <h3>{{ title }}</h3>
        </a>
        <div class="text-caption mb-3">{{ subtitle }}</div>
      </div>
    </div>

    <a :href="url" target="_blank" class="link">
      <img
        :src="previewImage"
        style="max-width: 480px; max-height: 480px; border-radius: 8px"
      />
    </a>
  </v-sheet>
</template>

<style scoped>
.link {
  text-decoration: none;
}
</style>
