<script lang="ts" setup>
import { showSuccessToast } from "@/utils/toast";
import ChannelSelect from "./ChannelSelect.vue";
import { Channel } from "@/models";
import { postChatPostMessage } from "@/clients/slack";

const channel = ref<Channel | null>(null);
const text = ref("");
const posting = ref(false);

const postMessage = async () => {
  posting.value = true;

  const [_, err] = (
    await postChatPostMessage({ channel: channel.value!.id, text: text.value })
  ).unwrap();

  posting.value = false;

  if (err) {
    showErrorToast(err);
    return;
  }

  text.value = "";
  showSuccessToast(`channelに投稿しました`);
};
</script>

<template>
  <div class="d-flex flex-column align-center ga-1 pa-6 ma-6">
    <ChannelSelect v-model="channel" />
    <v-textarea v-model="text" style="width: 480px" />
    <v-btn
      :disabled="!channel"
      :loading="posting"
      @click="postMessage"
      class="ml-3"
      style="width: 240px"
      >ポストする</v-btn
    >
  </div>
</template>
