<script setup lang="ts">
import { VBadge } from "vuetify/components";

defineProps<{
  disabled: boolean;
  color?: VBadge["color"];
  content?: VBadge["content"];
  location?: VBadge["location"];
  offsetX?: VBadge["offsetX"];
  offsetY?: VBadge["offsetY"];
}>();
</script>

<template>
  <v-badge
    v-if="!disabled"
    :color="color"
    :content="content"
    :location="location"
    :offset-x="offsetX"
    :offset-y="offsetY"
  >
    <slot></slot>
  </v-badge>
  <template v-else>
    <slot></slot>
  </template>
</template>
