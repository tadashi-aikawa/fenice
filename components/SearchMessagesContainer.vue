<script setup lang="ts">
import { quickReactionEmojisStorage } from "@/utils/storage";
import PostCard from "./PostCard.vue";
import { Channel, Message } from "@/clients/slack/models";
import { getSearchMessages, postReactionsAdd } from "@/clients/slack";
import SearchMessageQueryInput from "./SearchMessageQueryInput.vue";
import Loading from "./Loading.vue";
import { useCardActions } from "@/composables/CardActions";
import { ts2Divider } from "@/utils/date";

const loading = ref(false);

const messages = ref<Message[]>([]);
const reactionEmojis = ref<string[]>([]);
onMounted(async () => {
  reactionEmojis.value = await quickReactionEmojisStorage.getValue();
  quickReactionEmojisStorage.watch((newValue) => {
    reactionEmojis.value = newValue;
  });
});

const search = async (query: string, option: { bot: boolean }) => {
  loading.value = true;

  const [res, error] = (
    await getSearchMessages({
      query,
      sort: "timestamp",
      search_exclude_bots: !option.bot,
    })
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
          <template :key="message.ts" v-for="(message, i) in messages">
            <div
              v-if="ts2Divider(message.ts, messages[i - 1]?.ts)"
              class="d-flex align-center my-4 ga-2"
            >
              <v-divider />
              <div
                class="text-caption text-grey-darken-2 font-weight-bold"
                style="white-space: nowrap"
              >
                {{ ts2Divider(message.ts, messages[i - 1]?.ts) }}
              </div>
              <v-divider />
            </div>
            <PostCard
              :message="message"
              :reaction-emojis="reactionEmojis"
              read-icon="mdi-eye-off"
              disable-unread
              @click:reaction="reactAsEmoji"
              @click:read="hideMessage"
            />
          </template>
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
