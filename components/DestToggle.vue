<script setup lang="ts">
import { onMounted } from "vue";
import { getUsersConversations } from "@/clients/slack";
import { Channel, Message } from "@/clients/slack/models";
import {
  lockOnMessageStorage,
  selectedChannelIdsStorage,
} from "@/utils/storage";
import { isPresent } from "@/utils/collections";
import { Dest, isChannel, isMessage } from "@/models";

const dest = defineModel<Dest | null>({ default: null });

const channels = ref<Channel[]>([]);
const selectedChannels = ref<Channel[]>([]);
const lockOnMessage = ref<Message | null>(null);

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

  lockOnMessage.value = await lockOnMessageStorage.getValue();
  lockOnMessageStorage.watch((newValue) => {
    lockOnMessage.value = newValue;
  });
});

const customFilter = (value: string, query: string) =>
  query.split(" ").every((q) => value.includes(q));

const handleUpdate = async (channels: Channel[]) => {
  const channelIds = channels.map((x) => x.id);

  // 選択していたchannelを削除した場合はdeactivateする
  if (isChannel(dest.value) && !channelIds.includes(dest.value.id)) {
    dest.value = null;
  }

  await selectedChannelIdsStorage.setValue(channelIds);
};

watch(
  () => lockOnMessage.value,
  (m) => {
    if (isMessage(dest.value)) {
      dest.value = m;
    }
  },
);

const handleClickRemoveDest = (channel: Channel) => {
  const newChannels = selectedChannels.value.filter((x) => x.id !== channel.id);
  selectedChannels.value = newChannels;
  handleUpdate(newChannels);
};
</script>

<template>
  <div class="d-flex flex-column ga-3 mb-3" style="width: 300px">
    <v-btn-toggle
      v-model="dest"
      color="primary"
      rounded="0"
      group
      style="height: 100%; width: 300px; display: contents"
    >
      <v-btn
        v-if="lockOnMessage"
        :value="lockOnMessage"
        style="text-transform: unset; height: 36px; width: 300px"
      >
        <v-icon>mdi-target-variant</v-icon>
        <span>Lock thread</span>
      </v-btn>
      <template v-for="ch in selectedChannels">
        <v-btn
          :value="ch"
          style="
            text-transform: unset;
            height: 36px;
            width: 300px;
            justify-content: flex-start;
            overflow-x: hidden;
            text-wrap: nowrap;
            text-overflow: ellipsis;
          "
        >
          <v-icon
            @click.stop="handleClickRemoveDest(ch)"
            tabindex="-1"
            class="mr-1"
          >
            mdi-close-circle-outline
          </v-icon>
          <span>#{{ ch.name }}</span>
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
