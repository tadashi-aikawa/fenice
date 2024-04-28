<script lang="ts" setup>
import { showSuccessToast } from "@/utils/toast";
import {
  Dest,
  Resource,
  dest2channel,
  isChannel,
  isImageResource,
  isVideoResource,
} from "@/models";
import { postChatPostMessage, postFilesUpload } from "@/clients/slack";
import UploadingImage from "./UploadingImage.vue";
import { ImageBlock, SectionBlock, PostBlock } from "@/clients/slack/models";
import { doSinglePatternMatching } from "@/utils/strings";
import { isEmoji, usersByNameCache } from "@/global-cache";
import EmojiSuggestWrapper from "./EmojiSuggestWrapper.vue";
import UserSuggestWrapper from "./UserSuggestWrapper.vue";
import { updateLastUsedEmojis } from "@/utils/storage";

const props = defineProps<{
  dest: Dest;
}>();

const text = ref("");
const files = ref<Resource[]>([]);
const excludeCaption = ref(false);

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
  const captionBlocks: PostBlock[] = excludeCaption.value
    ? []
    : [
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
      ];

  const _dest = props.dest;
  const res = await postChatPostMessage({
    channel: dest2channel(_dest).id,
    thread_ts: !isChannel(_dest) ? _dest.ts : undefined,
    blocks: [
      ...sectionBlocks,
      ...imageBlocks,
      ...videoBlocks,
      ...captionBlocks,
    ],
  });

  const [_, err] = res.unwrap();

  posting.value = false;

  if (err) {
    showErrorToast(err);
    return;
  }

  await updateLastUsedEmojis(usedEmojis.value);

  text.value = "";
  files.value = [];
  showSuccessToast(`投稿に成功しました`);
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
  const _dest = props.dest;
  const [res, err] = (
    await postFilesUpload({
      channel: dest2channel(_dest).id,
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

const mentionUsers = computed(() =>
  uniqBy(
    doSinglePatternMatching(text.value, /@[^ \n]+/g)
      .map((x) => usersByNameCache[x.slice(1)])
      .filter(isPresent),
    (x) => x.id,
  ),
);

const usedEmojis = computed(() =>
  uniqBy(
    doSinglePatternMatching(text.value, /:[^ \n]+:/g)
      .map((x) => x.slice(1, x.length - 1))
      .filter(isEmoji),
    (x) => x,
  ),
);
</script>

<template>
  <v-card
    v-if="dest"
    :elevation="4"
    class="d-flex flex-column align-center pa-5 pb-1"
  >
    <EmojiSuggestWrapper>
      <UserSuggestWrapper>
        <v-textarea
          v-model="text"
          style="width: 640px"
          :rows="12"
          @paste="handlePaste"
          @keyup.ctrl.enter.exact="postMessage"
          @keyup.meta.enter.exact="postMessage"
        />
      </UserSuggestWrapper>
    </EmojiSuggestWrapper>

    <div class="d-flex ga-3">
      <img v-for="user in mentionUsers" :src="user.profile.image_48" />
    </div>

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
      class="mt-3 mb-1"
      prepend-icon="mdi-send-variant"
      color="primary"
      @click="postMessage"
      >ポストする</v-btn
    >

    <v-checkbox
      v-model="excludeCaption"
      color="primary"
      label="captionを投稿に含めない"
      hide-details
    />
  </v-card>
</template>
