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
    <CharaLoading />
  </v-overlay>
</template>
