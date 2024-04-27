<script setup lang="ts">
// @ts-expect-error package.jsonのexportsに.d.tsファイルの定義がないから
import { Mentionable } from "vue-mention";
import { User } from "@/clients/slack/models";

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
</script>

<template>
  <Mentionable
    :keys="['@']"
    :items="userSuggestions"
    offset="6"
    :limit="10"
    insert-space
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
