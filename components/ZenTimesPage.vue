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
import {
  ImageBlock,
  SectionBlock,
  PostBlock,
  User,
} from "@/clients/slack/models";
import FavoriteChannelToggle from "./FavoriteChannelToggle.vue";
import { Mentionable } from "vue-mention";

const dest = ref<Dest | null>(null);
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

  const _dest = dest.value!;
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
  const _dest = dest.value!;
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
  <div class="d-flex flex-column align-center ga-1 pa-6 ma-6">
    <FavoriteChannelToggle v-model="dest" />
    <v-card
      v-if="dest"
      :elevation="4"
      class="d-flex flex-column align-center pa-5 pb-1"
    >
      <Mentionable :keys="['@']" :items="userSuggestions" offset="6">
        <v-textarea
          v-model="text"
          style="width: 640px"
          :rows="12"
          @paste="handlePaste"
          @keyup.ctrl.enter.exact="postMessage"
          @keyup.meta.enter.exact="postMessage"
        />
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
  </div>
</template>
