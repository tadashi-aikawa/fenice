<script setup lang="ts">
import { onMounted } from "vue";
import { getUsersConversations } from "@/clients/slack";
import { Channel } from "@/clients/slack/models";
import { selectedChannelIdsStorage } from "@/utils/storage";
import { isPresent } from "@/utils/collections";

const activeChannel = defineModel<Channel | null>();

const channels = ref<Channel[]>([]);
const selectedChannels = ref<Channel[]>([]);

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

  channels.value = res.channels;

  const channelById = keyBy(res.channels, (x) => x.id);
  const channelIds = await selectedChannelIdsStorage.getValue();
  selectedChannels.value = channelIds
    .map((x) => channelById[x])
    .filter(isPresent);
});

const customFilter = (value: string, query: string) =>
  query.split(" ").every((q) => value.includes(q));

const handleUpdate = async (channels: Channel[]) => {
  const channelIds = channels.map((x) => x.id);

  // 選択していたchannelを削除した場合はdeactivateする
  if (activeChannel.value && !channelIds.includes(activeChannel.value.id)) {
    activeChannel.value = null;
  }

  await selectedChannelIdsStorage.setValue(channelIds);
};
</script>

<template>
  <div class="d-flex align-center ga-3 mb-3">
    <v-btn-toggle
      v-model="activeChannel"
      color="primary"
      rounded="0"
      group
      density="compact"
    >
      <template v-for="ch in selectedChannels">
        <v-btn :value="ch" style="text-transform: unset">
          #{{ ch.name }}
        </v-btn>
      </template>
    </v-btn-toggle>
    <v-menu location="bottom center" :close-on-content-click="false">
      <template v-slot:activator="{ props }">
        <v-btn
          prepend-icon="mdi-pencil"
          variant="tonal"
          style="color: goldenrod"
          v-bind="props"
          >Edit</v-btn
        >
      </template>
      <v-autocomplete
        v-model="selectedChannels"
        :items="channels"
        item-title="name"
        return-object
        :custom-filter="customFilter"
        clearable
        chips
        closable-chips
        clear-on-select
        bg-color="white"
        variant="outlined"
        label="投稿するchannelの候補を選択"
        placeholder="スペース区切りでand検索"
        multiple
        style="width: 480px"
        class="mt-5"
        @update:model-value="handleUpdate"
      />
    </v-menu>
  </div>
</template>
