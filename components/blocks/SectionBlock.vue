<script setup lang="ts">
import { SectionBlock } from "@/clients/slack/blockModels";
import SectionText from "./SectionText.vue";

defineProps<{
  item: SectionBlock;
}>();
</script>

<template>
  <div>
    <template v-if="item.text">
      <SectionText :item="item.text" />
    </template>
    <template v-if="item.fields">
      <div class="d-flex ga-8">
        <SectionText v-for="f in item.fields" :item="f" />
      </div>
    </template>
  </div>
</template>
