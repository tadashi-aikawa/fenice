<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

defineProps<{
  disabled: boolean;
}>();
</script>

<template>
  <v-badge v-if="!disabled" v-bind="$attrs">
    <slot></slot>
  </v-badge>
  <template v-else>
    <slot></slot>
  </template>
</template>
