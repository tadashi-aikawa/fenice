<script setup lang="ts">
import { VOverlay } from "vuetify/components";
import CharaLoading from "./CharaLoading.vue";

defineProps<{
  loading: boolean;
  message?: string;
}>();
</script>

<template>
  <v-overlay
    :model-value="loading"
    class="align-center justify-center"
    persistent
  >
    <div class="d-flex flex-column align-center" style="height: 135px">
      <CharaLoading />
    </div>
    <div class="d-flex flex-column align-center">
      <span class="text-h6 text-grey-lighten-3 font-weight-bold">{{
        message
      }}</span>
    </div>
  </v-overlay>
</template>
