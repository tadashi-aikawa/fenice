<script lang="ts" setup>
import { showSuccessToast } from "@/utils/toast";
import JoinnedChannelSelect from "./JoinnedChannelSelect.vue";
import { Channel } from "@/models";
import { postChatPostMessage, postFilesUpload } from "@/clients/slack";
import UploadingImage from "./UploadingImage.vue";
import { ImageBlock } from "@/clients/slack/models";

const channel = ref<Channel | null>(null);
const text = ref("");
const images = ref<{ blobUrl: string; url?: string; thumbnail?: string }[]>([]);

const uploading = ref(false);
const posting = ref(false);

const postMessage = async () => {
  posting.value = true;

  const imageBlocks: ImageBlock[] = images.value.map((x) => ({
    type: "image",
    image_url: x.url!,
    alt_text: "image",
  }));

  const res = await postChatPostMessage({
    channel: channel.value!.id,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: text.value,
        },
      },
      ...imageBlocks,
      { type: "divider" },
      {
        type: "context",
        elements: [
          {
            type: "image",
            image_url:
              "https://github.com/tadashi-aikawa/fenice/raw/master/public/icon/384.png",
            alt_text: "fenice",
          },
          {
            type: "mrkdwn",
            text: "Posted via Fenice",
          },
        ],
      },
    ],
  });

  const [_, err] = res.unwrap();

  posting.value = false;

  if (err) {
    showErrorToast(err);
    return;
  }

  text.value = "";
  images.value = [];
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

  images.value = [{ blobUrl: URL.createObjectURL(file) }];

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

  images.value[0].url = res.file.url_private;
  images.value[0].thumbnail = res.file.thumb_160;
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
      <v-textarea
        v-model="text"
        style="width: 640px"
        @paste="handlePaste"
        @keyup.ctrl.enter.exact="postMessage"
        @keyup.meta.enter.exact="postMessage"
      />

      <UploadingImage
        v-if="images.length > 0"
        :uploading="uploading"
        :src="images?.[0]?.thumbnail ?? images?.[0]?.blobUrl"
        width="160px"
        height="160px"
      />

      <v-btn
        :disabled="(!text && !images) || uploading || posting"
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
