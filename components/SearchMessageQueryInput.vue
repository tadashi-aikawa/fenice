<script setup lang="ts">
import { lastSelectedChannelMapStorage } from "@/utils/storage";
import { DateTime } from "owlelia";
import {
  VAutocomplete,
  VBtn,
  VBtnToggle,
  VTextField,
  VTooltip,
} from "vuetify/components";

const query = ref<string>("");
const channel = ref<string>("");

export type SearchCondition = {
  query: string;
  option: { bot: boolean; "100": boolean };
};

type SearchFlg = "bot" | "100";
const flags = ref<SearchFlg[]>([]);

const channels = ref<string[]>([]);
onMounted(async () => {
  channels.value = (await channelsCacheStorage.getValue()).channels.map(
    (x) => x.name,
  );
  channelsCacheStorage.watch((newValue) => {
    channels.value = newValue.channels.map((x) => x.name);
  });
});

const lastSelectedChannelMap = ref<Record<string, number>>({});
onMounted(async () => {
  lastSelectedChannelMapStorage.watch((newValue) => {
    lastSelectedChannelMap.value = newValue;
  });
  lastSelectedChannelMap.value = await lastSelectedChannelMapStorage.getValue();
});

const sortedChannels = computed(() =>
  channels.value.toSorted(
    sorter((x) => lastSelectedChannelMap.value[x] ?? -1, "desc"),
  ),
);

const emit = defineEmits<{
  search: [condition: SearchCondition];
  "update:condition": [condition: SearchCondition];
}>();

const searchCondition = computed(() => {
  let q = query.value;
  if (channel.value) {
    q += ` in:#${channel.value}`;
  }

  return {
    query: q,
    option: {
      bot: flags.value.includes("bot"),
      "100": flags.value.includes("100"),
    },
  };
});
watch(
  () => searchCondition.value,
  (cond) => {
    emit("update:condition", cond);
  },
  { immediate: true },
);

const customFilter = (value: string, query: string) =>
  query.split(" ").every((q) => value.includes(q));

const handleSearch = async (_channel: string | null) => {
  if (!_channel) {
    return;
  }

  await nextTick();
  emit("search", searchCondition.value);

  if (channel.value) {
    lastSelectedChannelMapStorage.setValue({
      ...lastSelectedChannelMap.value,
      [channel.value]: DateTime.now().unix,
    });
  }
};
</script>

<template>
  <div>
    <v-text-field
      v-model="query"
      variant="outlined"
      prepend-inner-icon="mdi-magnify"
      placeholder="検索クエリを入力"
      hide-details
      density="compact"
      @keyup.enter.exact="handleSearch"
    ></v-text-field>

    <div class="d-flex align-center ga-3">
      <v-autocomplete
        v-model="channel"
        :items="sortedChannels"
        density="compact"
        :custom-filter="customFilter"
        clearable
        bg-color="white"
        variant="outlined"
        label="絞り込むchannel"
        placeholder="スペース区切りでand絞り込み"
        class="mt-3 mb-1"
        auto-select-first
        clear-on-select
        hide-details
        @update:model-value="handleSearch"
      />
      <v-btn-toggle v-model="flags" multiple variant="elevated" color="primary">
        <v-tooltip text="botを検索に含めるか?" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-robot-outline"
              value="bot"
              v-bind="props"
              class="mt-2"
            />
          </template>
        </v-tooltip>
        <v-tooltip text="検索件数を100件にするか?" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-cash-100"
              value="100"
              v-bind="props"
              class="mt-2"
            />
          </template>
        </v-tooltip>
      </v-btn-toggle>
    </div>
  </div>
</template>
