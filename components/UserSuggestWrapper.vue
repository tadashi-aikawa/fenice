<script setup lang="ts">
import { User } from "@/clients/slack/models";
import { lastMentionedUserMapStorage } from "@/utils/storage";
import { DateTime } from "owlelia";
// @ts-expect-error package.jsonのexportsに.d.tsファイルの定義がないから
import { Mentionable } from "vue-mention";

type UserSuggestion = { value: string; label: string; user: User };
const userSuggestions = ref<UserSuggestion[]>([]);
onMounted(async () => {
  const to = (users: User[]) =>
    users
      .filter((x) => !x.deleted)
      .map((x) => ({
        value: x.name,
        label: x.name,
        user: x,
      }));

  usersCacheStorage.watch((newValue) => {
    userSuggestions.value = to(newValue.members);
  });
  userSuggestions.value = to((await usersCacheStorage.getValue()).members);
});

const lastMentionedByUser = ref<Record<string, number>>({});
onMounted(async () => {
  lastMentionedUserMapStorage.watch((newValue) => {
    lastMentionedByUser.value = newValue;
  });
  lastMentionedByUser.value = await lastMentionedUserMapStorage.getValue();
});

const suggestions = computed(() =>
  userSuggestions.value
    .sort(sorter((x) => Number(x.value.startsWith(keyword.value)), "desc"))
    .sort(sorter((x) => lastMentionedByUser.value[x.user.id] ?? -1, "desc")),
);

const handleApply = (item: UserSuggestion) => {
  lastMentionedUserMapStorage.setValue({
    [item.user.id]: DateTime.now().unix,
    ...lastMentionedByUser.value,
  });
};

const keyword = ref("");
const search = (word: string) => {
  keyword.value = word;
};
</script>

<template>
  <Mentionable
    :keys="['@']"
    :items="suggestions"
    offset="6"
    :limit="10"
    insert-space
    @apply="handleApply"
    @search="search"
  >
    <slot></slot>

    <template v-slot:item="{ item }">
      <div class="d-flex align-center ga-2" style="font-size: 16px">
        <img :src="item.user.profile.image_24" />
        <span style="font-weight: bold">
          {{ item.user.real_name }}
        </span>
        <span class="username">
          {{ item.user.name }}
        </span>
      </div>
    </template>
    <template v-slot:no-result> <div style="display: none" /></template>
  </Mentionable>
</template>
