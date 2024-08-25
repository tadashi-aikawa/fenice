<script setup lang="ts">
import { getSearchMessages } from "@/clients/slack";
import { Message } from "@/clients/slack/models";
import { useCardActions } from "@/composables/CardActions";
import { maxBy, minBy } from "@/utils/collections";
import { ts2Divider, ts2display } from "@/utils/date";
import { deepEquals } from "@/utils/functions";
import { quickReactionEmojisStorage } from "@/utils/storage";
import { useScroll } from "@vueuse/core";
import { VBtn, VDivider } from "vuetify/components";
import Loading from "./Loading.vue";
import PostCard from "./PostCard.vue";
import SearchChannelGraph from "./SearchChannelGraph.vue";
import SearchMessageQueryInput, {
  SearchCondition,
} from "./SearchMessageQueryInput.vue";
import SearchMessageTimeGraph from "./SearchMessageTimeGraph.vue";
import SearchUserGraph from "./SearchUserGraph.vue";

const searchCondition = ref<SearchCondition>({
  query: "",
  option: { bot: false, "100": false },
});

const emit = defineEmits<{
  "show:thread": [message: Message];
}>();

const { reactAsEmoji, showThread, stock } = useCardActions();
const loading = ref(false);

interface Filter {
  channel: string | null;
  userName: string | null;
}
const createEmptyFilter = () => ({ channel: null, userName: null });
const filter = ref<Filter>(createEmptyFilter());
const channelGraphRef = ref<any | null>(null);
const userGraphRef = ref<any | null>(null);
const resetFilter = () => {
  filter.value = createEmptyFilter();
  channelGraphRef.value.clearSelection();
  userGraphRef.value.clearSelection();
};

const messages = ref<Message[]>([]);

const filteredMessages = computed(() =>
  messages.value.filter((x) => {
    if (filter.value.channel && filter.value.channel !== x.channel.name) {
      return false;
    }
    if (filter.value.userName && filter.value.userName !== x.username) {
      return false;
    }
    return true;
  }),
);

const container = ref<HTMLElement | null>(null);
const { y } = useScroll(container);
watch(
  () => filter.value,
  async (newO, oldO) => {
    if (deepEquals(newO, oldO)) {
      return;
    }

    await nextTick();
    y.value = 0;
  },
  { deep: true },
);

const loadingPaging = ref(false);
const nextCursor = ref<string>("");

const reactionEmojis = ref<string[]>([]);
onMounted(async () => {
  reactionEmojis.value = await quickReactionEmojisStorage.getValue();
  quickReactionEmojisStorage.watch((newValue) => {
    reactionEmojis.value = newValue;
  });
});

const latestDisplayDate = computed(() =>
  ts2display(
    maxBy(
      messages.value.map((m) => m.ts),
      Number,
    ),
    { onlyDate: true },
  ),
);

const oldestDisplayDate = computed(() =>
  ts2display(
    minBy(
      messages.value.map((m) => m.ts),
      Number,
    ),
    { onlyDate: true },
  ),
);

const search = async (cond: SearchCondition) => {
  loading.value = true;

  const [res, error] = (
    await getSearchMessages({
      query: cond.query,
      sort: "timestamp",
      search_exclude_bots: !cond.option.bot,
      cursor: "*",
      count: cond.option["100"] ? 100 : 20,
    })
  ).unwrap();

  loading.value = false;

  if (error) {
    return showErrorToast(error);
  }

  resetFilter();
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
      count: cond.option["100"] ? 100 : 20,
    })
  ).unwrap();

  loadingPaging.value = false;

  if (error) {
    return showErrorToast(error);
  }

  nextCursor.value = res.messages.paging.next_cursor;
  messages.value = messages.value.concat(res.messages.matches);
  await nextTick();
  channelGraphRef.value.selectByName(filter.value.channel);
  userGraphRef.value.selectByName(filter.value.userName);
};

const handleClickThread = (message: Message) => {
  showThread(message);
  emit("show:thread", message);
};

const handleChangeChannelGraphFilter = (ch: string | null) => {
  if (ch != null) {
    userGraphRef.value.clearSelection();
  }
  filter.value.channel = ch;
};
const handleChangeUserGraphFilter = (userName: string | null) => {
  if (userName != null) {
    channelGraphRef.value.clearSelection();
  }
  filter.value.userName = userName;
};
</script>

<template>
  <div class="d-flex">
    <div class="d-flex flex-column pa-5">
      <SearchMessageQueryInput
        @search="search"
        @update:condition="(cond) => (searchCondition = cond)"
        style="width: 745px"
        class="pr-5"
      />
      <div
        ref="container"
        class="pa-1 pr-3 mt-3 mb-1"
        style="width: 710px; height: calc(100vh - 205px); overflow-y: auto"
      >
        <template v-if="loading">
          <Loading :loading="loading" message="メッセージを検索中です" />
        </template>
        <template v-else>
          <template :key="message.ts" v-for="(message, i) in filteredMessages">
            <div
              v-if="ts2Divider(message.ts, filteredMessages[i - 1]?.ts)"
              class="d-flex align-center my-4 ga-2"
            >
              <v-divider />
              <div
                class="text-caption text-grey-darken-2 font-weight-bold"
                style="white-space: nowrap"
              >
                {{ ts2Divider(message.ts, filteredMessages[i - 1]?.ts) }}
              </div>
              <v-divider />
            </div>
            <PostCard
              :message="message"
              :reaction-emojis="reactionEmojis"
              enable-stock
              enable-thread
              @click:reaction="reactAsEmoji"
              @click:stock="stock"
              @click:thread="handleClickThread"
            />
          </template>
          <v-btn
            v-if="nextCursor !== ''"
            :loading="loadingPaging"
            style="width: 100%"
            color="primary"
            variant="tonal"
            @click="searchPaging"
          >
            次の{{ searchCondition.option["100"] ? 100 : 20 }}件を検索する
          </v-btn>
        </template>
      </div>
    </div>

    <div class="d-flex flex-column align-center">
      <h1 v-if="messages.length > 0" class="pa-6">
        <span style="font-size: 1.5em" class="text-primary">{{
          messages.length
        }}</span>
        <span class="pl-2">件の投稿</span>
        <span class="pl-2 text-grey-darken-1"
          >({{ oldestDisplayDate }} ~ {{ latestDisplayDate }})</span
        >
      </h1>
      <div class="d-flex">
        <SearchChannelGraph
          ref="channelGraphRef"
          :messages="messages"
          @change:selection="handleChangeChannelGraphFilter"
        />
        <SearchUserGraph
          ref="userGraphRef"
          :messages="messages"
          @change:selection="handleChangeUserGraphFilter"
        />
      </div>
      <div class="mt-3">
        <SearchMessageTimeGraph :messages="filteredMessages" />
      </div>
    </div>
  </div>
</template>
