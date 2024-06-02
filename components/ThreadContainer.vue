<script setup lang="ts">
import PostCard from "./PostCard.vue";
import Loading from "./Loading.vue";
import { useCardActions } from "@/composables/CardActions";
import { useThreadDrawerStore } from "@/stores";
import PostForm from "./PostForm.vue";
import { useScroll } from "@vueuse/core";

const emit = defineEmits<{
  posted: [];
  "click:closeThread": [];
}>();

const { reactAsEmoji, stock, reactionEmojis } = useCardActions();
const utdStore = useThreadDrawerStore();

const dest = computed(() => utdStore.messages[0]);

const container = ref<HTMLElement | null>(null);
const { y } = useScroll(container);
watch(
  () => utdStore.messages,
  async (_) => {
    await sleep(0);
    y.value = Number.MAX_SAFE_INTEGER;
  },
);
</script>

<template>
  <div class="d-flex flex-column align-center pt-2 pl-5">
    <v-btn
      icon="mdi-close"
      variant="tonal"
      density="compact"
      color="primary"
      style="position: absolute; right: 15px; top: 30px"
      @click="emit('click:closeThread')"
    ></v-btn>
    <div class="d-flex align-center ga-3">
      <v-icon size="x-large">mdi-forum</v-icon>
      <span class="font-weight-bold text-h6">スレッド</span>
    </div>
    <div
      ref="container"
      class="pa-1 mt-3 mb-1 pb-6 pr-3"
      style="width: 720px; height: calc(100vh - 150px); overflow-y: auto"
    >
      <template v-if="utdStore.loading">
        <Loading :loading="utdStore.loading" message="メッセージを検索中です" />
      </template>
      <template v-else>
        <transition-group name="list">
          <template :key="message.ts" v-for="message in utdStore.messages">
            <PostCard
              :message="message"
              :reaction-emojis="reactionEmojis"
              enable-stock
              @click:reaction="reactAsEmoji"
              @click:stock="stock"
            />
          </template>
        </transition-group>
        <PostForm v-if="dest" :dest="dest" @posted="emit('posted')" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.list-leave-active {
  transition: all 0.2s ease-in;
}
.list-leave-to {
  opacity: 0;
  transform: translatex(360px);
}

.list-enter-active {
  transition: all 0.2s linear;
}
.list-enter-from {
  opacity: 0;
}
</style>
