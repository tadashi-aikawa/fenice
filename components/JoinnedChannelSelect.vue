<script setup lang="ts">
import { onMounted } from "vue";
import { getUsersConversations } from "@/clients/slack";
import { DateTime } from "owlelia";
import { sorter } from "@/utils/collections";
import { Channel } from "@/clients/slack/models";

const model = defineModel<Channel | null>();

const channels = ref<Channel[]>([]);

onMounted(async () => {
  const [res, err] = (
    await getUsersConversations({
      exclude_archived: true,
      limit: 1000,
      types: "public_channel,private_channel",
    })
  ).unwrap();
  if (err) {
    showErrorToast(err);
    return;
  }

  channels.value = await sortChennels(res.channels);
});

const sortChennels = async (channels: Channel[]) => {
  const mapping = await lastSelectedByChannelId.getValue();
  return channels.toSorted(sorter(({ id }) => mapping[id] ?? 0, "desc"));
};

const customFilter = (value: string, query: string) =>
  query.split(" ").every((q) => value.includes(q));

const handleUpdate = async (channel?: Channel) => {
  if (!channel) {
    return;
  }

  const m = await lastSelectedByChannelId.getValue();
  m[channel.id] = DateTime.now().unix;
  await lastSelectedByChannelId.setValue(m);

  channels.value = await sortChennels(channels.value);
};
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
    style="width: 480px"
    @update:model-value="handleUpdate"
  />
</template>
