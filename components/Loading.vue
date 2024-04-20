<script setup lang="ts">
import CharaLoading from "./CharaLoading.vue";

defineProps<{
  loading: boolean;
  message?: string;
}>();
</script>

<template>
  <div style="margin-top: 15px">
    <div class="d-flex flex-column align-center" style="height: 125px">
      <CharaLoading size="small" style="margin-top: 30px" />
    </div>
    <div class="d-flex flex-column align-center">
      <span class="text-subtitle-1 text-grey-lighten-1 font-weight-bold">{{
        message
      }}</span>
    </div>
  </div>
</template>
