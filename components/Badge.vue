<script setup lang="ts">
defineProps<{
  disabled: boolean;
}>();
</script>

<template>
  <v-badge v-if="!disabled">
    <slot></slot>
  </v-badge>
  <template v-else>
    <slot></slot>
  </template>
</template>
