<script setup lang="ts">
import { onMounted } from "vue";
import { Channel } from "../models";
import { getUsersConversations } from "@/clients/slack";

const model = defineModel<Channel | null>();

const channels = ref<Channel[]>([]);

onMounted(async () => {
  const [res, err] = (
    await getUsersConversations({
      exclude_archived: true,
      limit: 999,
      types: "public_channel,private_channel",
    })
  ).unwrap();
  if (err) {
    showErrorToast(err);
    return;
  }

  channels.value = res.channels;
});

const customFilter = (value: string, query: string) =>
  query.split(" ").every((q) => value.includes(q));
</script>

<template>
  <v-autocomplete
    v-model="model"
    :items="channels"
    item-title="name"
    return-object
    :custom-filter="customFilter"
    clearable
    variant="outlined"
    label="投稿channel"
    placeholder="スペース区切りでand検索"
    auto-select-first
  />
</template>
