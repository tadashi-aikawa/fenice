<script setup lang="ts">
import { quickReactionEmojisStorage } from "@/utils/storage";
import PostCard from "./PostCard.vue";
import { Channel, Message } from "@/clients/slack/models";
import { getSearchMessages, postReactionsAdd } from "@/clients/slack";
import SearchMessageQueryInput from "./SearchMessageQueryInput.vue";
import Loading from "./Loading.vue";
import { useCardActions } from "@/composables/CardActions";

const loading = ref(false);

const messages = ref<Message[]>([]);
const reactionEmojis = ref<string[]>([]);
onMounted(async () => {
  reactionEmojis.value = await quickReactionEmojisStorage.getValue();
  quickReactionEmojisStorage.watch((newValue) => {
    reactionEmojis.value = newValue;
  });
});

const search = async (query: string) => {
  loading.value = true;

  const [res, error] = (
    await getSearchMessages({ query, sort: "timestamp" })
  ).unwrap();

  loading.value = false;

  if (error) {
    return showErrorToast(error);
  }

  messages.value = res.messages.matches;
};

const { reactAsEmoji } = useCardActions();

const hideMessage = (message: Message) => {
  messages.value = messages.value.filter((x) => x.ts !== message.ts);
};
</script>

<template>
  <div class="d-flex flex-column align-center pa-5">
    <SearchMessageQueryInput
      @enter="search"
      style="width: 745px"
      class="pr-5"
    />
    <div
      class="pa-1 mt-3 mb-1"
      style="width: 750px; height: calc(100vh - 205px); overflow-y: auto"
    >
      <template v-if="loading">
        <Loading :loading="loading" message="メッセージを検索中です" />
      </template>
      <template v-else>
        <transition-group name="list">
          <PostCard
            :key="message.ts"
            v-for="message in messages"
            :message="message"
            :reaction-emojis="reactionEmojis"
            read-icon="mdi-eye-off"
            disable-unread
            @click:reaction="reactAsEmoji"
            @click:read="hideMessage"
          />
        </transition-group>
      </template>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translatex(360px);
}
</style>
