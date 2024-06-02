<script lang="ts" setup>
import { Dest, isChannel } from "@/models";
import DestToggle from "./DestToggle.vue";
import PostCard from "./PostCard.vue";
import PostForm from "./PostForm.vue";

const dest = ref<Dest | null>(null);

const lockOnMessage = computed(() =>
  isChannel(dest.value) ? null : dest.value,
);
</script>

<template>
  <div class="d-flex justify-center ga-6 ma-6">
    <DestToggle v-model="dest" />

    <div v-if="dest">
      <PostForm :dest="dest" />
      <div v-if="lockOnMessage" class="d-flex flex-column align-center">
        <span class="py-3" style="font-size: 24px">↓</span>
        <PostCard :message="lockOnMessage" />
      </div>
    </div>
  </div>
</template>
