<script setup lang="ts">
// @ts-expect-error package.jsonのexportsに.d.tsファイルの定義がないから
import { Mentionable } from "vue-mention";
import { fallbackEmojiMap, getUnicodeEmojis } from "@/utils/strings";
import Emoji from "./blocks/Emoji.vue";
import { lastUsedEmojiMapStorage, updateLastUsedEmojis } from "@/utils/storage";

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
});

const lastUsedByEmoji = ref<Record<string, number>>({});
onMounted(async () => {
  lastUsedEmojiMapStorage.watch((newValue) => {
    lastUsedByEmoji.value = newValue;
  });
  lastUsedByEmoji.value = await lastUsedEmojiMapStorage.getValue();
});

const suggestions = computed(() =>
  emojiSuggestions.value.sort(
    sorter((x) => lastUsedByEmoji.value[x.label] ?? -1, "desc"),
  ),
);

const handleApply = async (item: EmojiSuggestion) => {
  await updateLastUsedEmojis([item.label]);
};
</script>

<template>
  <Mentionable
    :keys="[':']"
    :items="suggestions"
    offset="6"
    :limit="10"
    insert-space
    @apply="handleApply"
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
