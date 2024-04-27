<script setup lang="ts">
// @ts-expect-error package.jsonのexportsに.d.tsファイルの定義がないから
import { Mentionable } from "vue-mention";
import { getUnicodeEmojis } from "@/utils/strings";
import Emoji from "./blocks/Emoji.vue";
import { lastUsedByEmojiStorage } from "@/utils/storage";
import { DateTime } from "owlelia";

type EmojiSuggestion = { value: string; label: string };
const unicodeEmojiSuggestions = getUnicodeEmojis().map((x) => ({
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
    emojiSuggestions.value = to(Object.keys(newValue.emoji)).concat(
      unicodeEmojiSuggestions,
    );
  });

  emojiSuggestions.value = to(
    Object.keys((await emojiCacheStorage.getValue()).emoji),
  ).concat(unicodeEmojiSuggestions);
});

const lastUsedByEmoji = ref<Record<string, number>>({});
onMounted(async () => {
  lastUsedByEmojiStorage.watch((newValue) => {
    lastUsedByEmoji.value = newValue;
  });
  lastUsedByEmoji.value = await lastUsedByEmojiStorage.getValue();
});

const suggestions = computed(() =>
  emojiSuggestions.value.sort(
    sorter((x) => lastUsedByEmoji.value[x.label] ?? -1, "desc"),
  ),
);

const handleApply = (item: EmojiSuggestion) => {
  lastUsedByEmojiStorage.setValue({
    [item.label]: DateTime.now().unix,
    ...lastUsedByEmoji.value,
  });
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
