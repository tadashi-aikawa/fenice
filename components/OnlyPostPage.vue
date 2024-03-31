<script lang="ts" setup>
import { showSuccessToast } from "@/utils/toast";
import JoinnedChannelSelect from "./JoinnedChannelSelect.vue";
import { Channel } from "@/models";
import { postChatPostMessage, postFilesUpload } from "@/clients/slack";
import UploadingImage from "./UploadingImage.vue";

const channel = ref<Channel | null>(null);
const text = ref("");
const image = ref<{ blobUrl: string; url?: string; thumbnail?: string } | null>(
  null,
);

const uploading = ref(false);
const posting = ref(false);

const postMessage = async () => {
  posting.value = true;

  const res = image.value
    ? await postChatPostMessage({
        channel: channel.value!.id,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: text.value,
            },
          },
          {
            type: "image",
            image_url: image.value?.url!,
            alt_text: "image",
          },
        ],
      })
    : await postChatPostMessage({
        channel: channel.value!.id,
        text: text.value,
      });

  const [_, err] = res.unwrap();

  posting.value = false;

  if (err) {
    showErrorToast(err);
    return;
  }

  text.value = "";
  image.value = null;
  showSuccessToast(`channelに投稿しました`);
};

const handlePaste = async (e: ClipboardEvent) => {
  const dataType = e.clipboardData?.types.at(0);
  if (dataType !== "Files" && dataType !== "text/html") {
    return;
  }

  const file = e.clipboardData?.files.item(0);
  if (!file) {
    return;
  }

  image.value = { blobUrl: URL.createObjectURL(file) };

  uploading.value = true;
  const [res, err] = (
    await postFilesUpload({
      channel: channel.value!.id,
      file,
    })
  ).unwrap();
  uploading.value = false;

  if (err) {
    showErrorToast(err);
    return;
  }

  image.value.url = res.file.url_private;
  image.value.thumbnail = res.file.thumb_160;
};
</script>

<template>
  <div class="d-flex flex-column align-center ga-1 pa-6 ma-6">
    <JoinnedChannelSelect v-model="channel" />
    <v-card
      v-if="channel"
      :elevation="4"
      class="d-flex flex-column align-center pa-5"
    >
      <v-textarea v-model="text" style="width: 640px" @paste="handlePaste" />

      <UploadingImage
        v-if="image"
        :uploading="uploading"
        :src="image?.thumbnail ?? image?.blobUrl"
        width="160px"
        height="160px"
      />

      <v-btn
        :disabled="(!text && !image) || uploading || posting"
        :loading="posting"
        @click="postMessage"
        style="width: 240px"
        class="mt-3"
        prepend-icon="mdi-send-variant"
        color="primary"
        >ポストする</v-btn
      >
    </v-card>
  </div>
</template>
