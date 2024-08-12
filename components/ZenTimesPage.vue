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
  <div class="grid-container">
    <DestToggle v-model="dest" class="dest" />

    <div class="form">
      <template v-if="dest">
        <PostForm :dest="dest" />
        <div v-if="lockOnMessage" class="d-flex flex-column align-center">
          <span class="py-3" style="font-size: 24px">↓</span>
          <PostCard :message="lockOnMessage" />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template:
    " .... ....  .... ....  ...." 45px
    " .... dest  .... form  ...." auto
    " .... ....  .... ....  ...." 45px
    / auto 300px 30px 680px auto;
}
.dest {
  grid-area: dest;
}
.form {
  grid-area: form;
}
</style>
