<script setup lang="ts">
import { VSheet } from "vuetify/components";

defineProps<{
  title: string;
  type: string;
}>();
</script>

<template>
  <v-sheet elevation="2" class="pa-3" style="max-width: 520px">
    <div class="d-flex ga-1 text-grey">
      <v-avatar>
        <v-img alt="Fenice" src="/icon/384.png" style="filter: grayscale(1)" />
      </v-avatar>
      <div class="pl-1">
        <h3>{{ title }}</h3>
        <div class="text-caption mb-3">
          {{ type }}形式はFeniceでサポートされていません
        </div>
      </div>
    </div>
  </v-sheet>
</template>

<style scoped>
.link {
  text-decoration: none;
}
</style>
