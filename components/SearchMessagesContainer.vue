<script setup lang="ts">
import { quickReactionEmojisStorage, updateMessages } from "@/utils/storage";
import PostCard from "./PostCard.vue";
import { Message } from "@/clients/slack/models";
import { getSearchMessages } from "@/clients/slack";
import SearchMessageQueryInput, {
  SearchCondition,
} from "./SearchMessageQueryInput.vue";
import Loading from "./Loading.vue";
import { useCardActions } from "@/composables/CardActions";
import { ts2Divider } from "@/utils/date";

const searchCondition = ref<SearchCondition>({
  query: "",
  option: { bot: false },
});

const emit = defineEmits<{
  "show:thread": [message: Message];
}>();

const { reactAsEmoji, showThread, stock } = useCardActions();

const loading = ref(false);
const messages = ref<Message[]>([]);

const loadingPaging = ref(false);
const nextCursor = ref<string>("");

const reactionEmojis = ref<string[]>([]);
onMounted(async () => {
  reactionEmojis.value = await quickReactionEmojisStorage.getValue();
  quickReactionEmojisStorage.watch((newValue) => {
    reactionEmojis.value = newValue;
  });
});

const search = async (cond: SearchCondition) => {
  loading.value = true;

  const [res, error] = (
    await getSearchMessages({
      query: cond.query,
      sort: "timestamp",
      search_exclude_bots: !cond.option.bot,
      cursor: "*",
    })
  ).unwrap();

  loading.value = false;

  if (error) {
    return showErrorToast(error);
  }

  nextCursor.value = res.messages.paging.next_cursor;
  messages.value = res.messages.matches;
};

const searchPaging = async () => {
  const cond = searchCondition.value;
  loadingPaging.value = true;

  const [res, error] = (
    await getSearchMessages({
      query: cond.query,
      sort: "timestamp",
      search_exclude_bots: !cond.option.bot,
      cursor: nextCursor.value,
    })
  ).unwrap();

  loadingPaging.value = false;

  if (error) {
    return showErrorToast(error);
  }

  nextCursor.value = res.messages.paging.next_cursor;
  messages.value = messages.value.concat(res.messages.matches);
};

const hideMessage = (message: Message) => {
  messages.value = messages.value.filter((x) => x.ts !== message.ts);
};

const handleUpdateSearchCondition = (cond: SearchCondition) => {
  searchCondition.value = cond;
};

const handleClickThread = (message: Message) => {
  showThread(message);
  emit("show:thread", message);
};
</script>

<template>
  <div class="d-flex flex-column align-center pa-5">
    <SearchMessageQueryInput
      @search="search"
      @update:condition="handleUpdateSearchCondition"
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
              enable-stock
              enable-thread
              @click:reaction="reactAsEmoji"
              @click:read="hideMessage"
              @click:stock="stock"
              @click:thread="handleClickThread"
            />
          </template>
        </transition-group>
        <v-btn
          v-if="nextCursor !== ''"
          :loading="loadingPaging"
          style="width: 100%"
          color="primary"
          variant="tonal"
          @click="searchPaging"
          >次の20件を検索する</v-btn
        >
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
