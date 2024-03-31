<script setup lang="ts">
import CharaLoading from "./CharaLoading.vue";

defineProps<{
  loading: boolean;
}>();
</script>

<template>
  <v-overlay
    :model-value="loading"
    class="align-center justify-center"
    persistent
  >
    <div style="display: flex; justify-content: center; width: 95vw">
      <CharaLoading />
    </div>
  </v-overlay>
</template>
