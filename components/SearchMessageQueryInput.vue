<script setup lang="ts">
const query = defineModel("query", { default: "" });
const channel = defineModel("channel", { default: "" });
const channels = ref<string[]>([]);

type SearchFlg = "bot";
const flags = ref<SearchFlg[]>([]);

onMounted(async () => {
  channels.value = (await channelsCacheStorage.getValue()).channels.map(
    (x) => x.name,
  );
  channelsCacheStorage.watch((newValue) => {
    channels.value = newValue.channels.map((x) => x.name);
  });
});

const emit = defineEmits<{
  enter: [query: string, option: { bot: boolean }];
}>();

const customFilter = (value: string, query: string) =>
  query.split(" ").every((q) => value.includes(q));

const handleSearch = () => {
  let q = query.value;
  if (channel.value) {
    q += ` in:#${channel.value}`;
  }

  emit("enter", q, { bot: flags.value.includes("bot") });
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
      <v-combobox
        v-model="channel"
        :items="channels"
        density="compact"
        :custom-filter="customFilter"
        clearable
        clear-on-select
        bg-color="white"
        variant="outlined"
        label="絞り込むchannel"
        placeholder="スペース区切りでand検索"
        class="mt-3 mb-1"
        auto-select-first
        hide-details
        @keyup.enter.exact="handleSearch"
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
      </v-btn-toggle>
    </div>
  </div>
</template>
