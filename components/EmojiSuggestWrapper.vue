<script setup lang="ts">
// @ts-expect-error package.jsonのexportsに.d.tsファイルの定義がないから
import { Mentionable } from "vue-mention";
import { fallbackEmojiMap, getUnicodeEmojis } from "@/utils/strings";
import Emoji from "./blocks/Emoji.vue";
import {
  lastUsedEmojiMapStorage,
  maxNumberOfEmojiSuggestionsStorage,
  updateLastUsedEmojis,
} from "@/utils/storage";

type EmojiSuggestion = { value: string; label: string };

const unicodeEmojiSuggestions = getUnicodeEmojis().map((x) => ({
  value: `${x}:`,
  label: x,
}));
const fallbackEmojiSuggestions = Object.keys(fallbackEmojiMap).map((x) => ({
  value: `${x}:`,
  label: x,
}));
const emojiSuggestions = ref<EmojiSuggestion[]>([]);
const limit = ref(10);

onMounted(async () => {
  const to = (emojis: string[]) =>
    emojis.map((x) => ({
      value: `${x}:`,
      label: x,
    }));

  emojiCacheStorage.watch((newValue) => {
    emojiSuggestions.value = to(Object.keys(newValue.emoji))
      .concat(unicodeEmojiSuggestions)
      .concat(fallbackEmojiSuggestions);
  });

  emojiSuggestions.value = to(
    Object.keys((await emojiCacheStorage.getValue()).emoji),
  )
    .concat(unicodeEmojiSuggestions)
    .concat(fallbackEmojiSuggestions);

  limit.value = await maxNumberOfEmojiSuggestionsStorage.getValue();
  maxNumberOfEmojiSuggestionsStorage.watch((newValue) => {
    limit.value = newValue;
  });
});

const lastUsedByEmoji = ref<Record<string, number>>({});
onMounted(async () => {
  lastUsedEmojiMapStorage.watch((newValue) => {
    lastUsedByEmoji.value = newValue;
  });
  lastUsedByEmoji.value = await lastUsedEmojiMapStorage.getValue();
});

const suggestions = computed(() =>
  emojiSuggestions.value
    .sort(sorter((x) => x.value.length))
    .sort(sorter((x) => lastUsedByEmoji.value[x.label] ?? -1, "desc"))
    .sort(sorter((x) => Number(x.value.startsWith(keyword.value)), "desc")),
);

const handleApply = async (item: EmojiSuggestion) => {
  await updateLastUsedEmojis([item.label]);
};

const keyword = ref("");
const search = (word: string) => {
  keyword.value = word;
};
</script>

<template>
  <Mentionable
    :keys="[':']"
    :items="suggestions"
    offset="6"
    :limit="limit"
    insert-space
    @apply="handleApply"
    @search="search"
  >
    <slot></slot>

    <template v-slot:item="{ item }">
      <div class="d-flex align-center ga-2" style="font-size: 16px">
        <Emoji :item="{ type: 'emoji', name: item.label }" />
        <span>
          {{ item.label }}
        </span>
      </div>
    </template>
    <template v-slot:no-result> <div style="display: none" /></template>
  </Mentionable>
</template>
