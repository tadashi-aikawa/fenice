<script setup lang="ts">
import { ImageBlock } from "@/clients/slack/blockModels";

defineProps<{
  item: ImageBlock;
}>();
</script>

<template>
  <div class="mt-4">
    <img :src="item.image_url" style="max-width: 400px; max-height: 480px" />
  </div>
</template>
