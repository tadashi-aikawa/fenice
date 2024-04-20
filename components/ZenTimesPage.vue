<script lang="ts" setup>
import { showSuccessToast } from "@/utils/toast";
import { Resource, isImageResource, isVideoResource } from "@/models";
import { postChatPostMessage, postFilesUpload } from "@/clients/slack";
import UploadingImage from "./UploadingImage.vue";
import { Channel, ImageBlock, SectionBlock } from "@/clients/slack/models";
import FavoriteChannelToggle from "./FavoriteChannelToggle.vue";

const channel = ref<Channel | null>(null);
const text = ref("");
const files = ref<Resource[]>([]);

const uploading = ref(false);
const posting = ref(false);

const postMessage = async () => {
  posting.value = true;

  const sectionBlocks: SectionBlock[] = text.value
    ? [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: text.value,
          },
        },
      ]
    : [];
  const imageBlocks: ImageBlock[] = files.value
    .filter(isImageResource)
    .map((x) => ({
      type: "image",
      image_url: x.url!,
      alt_text: "image",
    }));
  const videoBlocks: SectionBlock[] = files.value
    .filter(isVideoResource)
    .map((x) => ({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<${x.url!}| >`,
      },
    }));

  const res = await postChatPostMessage({
    channel: channel.value!.id,
    blocks: [
      ...sectionBlocks,
      ...imageBlocks,
      ...videoBlocks,
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
  files.value = [];
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

  const fileType = file.type.startsWith("image/")
    ? "image"
    : file.type.startsWith("video/")
      ? "video"
      : undefined;
  if (!fileType) {
    return;
  }

  e.preventDefault();

  files.value = [{ type: fileType, blobUrl: URL.createObjectURL(file) }];

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

  const f = files.value[0];
  switch (f.type) {
    case "image":
      f.url = res.file.url_private;
      f.thumbnail = res.file.thumb_160;
      break;
    case "video":
      f.url = res.file.permalink;
      f.thumbnail = res.file.thumb_video;
      break;
  }
};
</script>

<template>
  <div class="d-flex flex-column align-center ga-1 pa-6 ma-6">
    <FavoriteChannelToggle v-model="channel" />
    <v-card
      v-if="channel"
      :elevation="4"
      class="d-flex flex-column align-center pa-5"
    >
      <v-textarea
        v-model="text"
        style="width: 640px"
        :rows="12"
        @paste="handlePaste"
        @keyup.ctrl.enter.exact="postMessage"
        @keyup.meta.enter.exact="postMessage"
      />

      <UploadingImage
        v-if="files.length > 0"
        :uploading="uploading"
        :file="files[0]"
        width="160px"
        height="160px"
      />

      <v-btn
        :disabled="(!text && files.length === 0) || uploading || posting"
        :loading="posting"
        style="width: 240px"
        class="mt-3"
        prepend-icon="mdi-send-variant"
        color="primary"
        @click="postMessage"
        >ポストする</v-btn
      >
    </v-card>
  </div>
</template>
