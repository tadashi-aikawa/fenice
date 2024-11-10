<script setup lang="ts">
import { VIcon, VSheet } from "vuetify/components";
</script>

<template>
  <v-sheet elevation="2" class="pa-3" style="max-width: 520px">
    <div class="d-flex ga-1 align-center text-grey">
      <v-icon style="font-size: 2.4em">mdi-grave-stone</v-icon>
      <h3>このファイルは削除されました</h3>
    </div>
  </v-sheet>
</template>

<style scoped>
.link {
  text-decoration: none;
}
</style>
