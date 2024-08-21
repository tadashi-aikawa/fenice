<script setup lang="ts">
import { getSearchMessages } from "@/clients/slack";
import { Message } from "@/clients/slack/models";
import { useCardActions } from "@/composables/CardActions";
import { count } from "@/utils/collections";
import { ts2Divider } from "@/utils/date";
import { quickReactionEmojisStorage } from "@/utils/storage";
import apexchart from "vue3-apexcharts";
import { VBtn, VDivider } from "vuetify/components";
import Loading from "./Loading.vue";
import PostCard from "./PostCard.vue";
import SearchMessageQueryInput, {
  SearchCondition,
} from "./SearchMessageQueryInput.vue";

const searchCondition = ref<SearchCondition>({
  query: "",
  option: { bot: false, "100": false },
});

const emit = defineEmits<{
  "show:thread": [message: Message];
}>();

const { reactAsEmoji, showThread, stock } = useCardActions();

const loading = ref(false);
const messages = ref<Message[]>([]);
const countByChannelName = computed(() =>
  count(messages.value.map((x) => x.channel.name)),
);
const graphHeight = computed(
  () => (Object.keys(countByChannelName.value).length + 1) * 50 || 0,
);
const series = computed(() => [
  {
    data: Object.values(countByChannelName.value).sort(
      sorter((x) => x, "desc"),
    ),
  },
]);
const options = computed(() => ({
  chart: {
    width: 480,
    height: Math.min(graphHeight.value, 900),
  },
  plotOptions: {
    bar: {
      horizontal: true,
    },
  },
  yaxis: {
    opposite: true,
    reversed: true,
    tooltip: {
      enabled: false,
    },
    labels: {
      maxWidth: 300,
    },
  },
  xaxis: {
    categories: Object.entries(countByChannelName.value)
      .sort(sorter(([_, count]) => count, "desc"))
      .map(([n, _]) => n),
  },
  tooltip: { enabled: false },
}));

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
      count: cond.option["100"] ? 100 : 20,
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
      count: cond.option["100"] ? 100 : 20,
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
  <div class="d-flex">
    <div class="d-flex flex-column pa-5">
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
          >
            次の{{ searchCondition.option["100"] ? 100 : 20 }}件を検索する
          </v-btn>
        </template>
      </div>
    </div>

    <apexchart type="bar" :options="options" :series="series"></apexchart>
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
