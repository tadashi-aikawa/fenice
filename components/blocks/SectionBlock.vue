<script setup lang="ts">
import { SectionBlock } from "@/clients/slack/models";

defineProps<{
  item: SectionBlock;
}>();
</script>

<template>
  <div>
    {{ item.text.text }}
  </div>
</template>
