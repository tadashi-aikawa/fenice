<script lang="ts" setup>
import { showSuccessToast } from "@/utils/toast";
import {
  Dest,
  Resource,
  dest2channel,
  isImageResource,
  isMessage,
  isVideoResource,
} from "@/models";
import { postChatPostMessage, postFilesUpload } from "@/clients/slack";
import UploadingImage from "./UploadingImage.vue";
import { ImageBlock, SectionBlock } from "@/clients/slack/models";
import { doSinglePatternMatching } from "@/utils/strings";
import { isEmoji, usersByNameCache } from "@/global-cache";
import EmojiSuggestWrapper from "./EmojiSuggestWrapper.vue";
import UserSuggestWrapper from "./UserSuggestWrapper.vue";
import { updateLastUsedEmojis } from "@/utils/storage";
import MrkdwnView from "./blocks/mrkdwn/MrkdwnView.vue";
import { refDebounced, onKeyStroke } from "@vueuse/core";

const props = defineProps<{
  dest: Dest;
}>();

const emit = defineEmits<{
  posted: [];
}>();

const tab = ref("edit");
const text = ref("");
const files = ref<Resource[]>([]);

const uploadings = ref<boolean[]>([]);
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

  const _dest = props.dest;
  const hasAttachments = imageBlocks.length > 0 || videoBlocks.length > 0;

  const channel = dest2channel(_dest).id;
  const thread_ts = isMessage(_dest) ? _dest.ts : undefined;

  const res = hasAttachments
    ? await postChatPostMessage({
        channel,
        thread_ts,
        blocks: [...sectionBlocks, ...imageBlocks, ...videoBlocks],
      })
    : await postChatPostMessage({ channel, thread_ts, text: text.value });

  const [_, err] = res.unwrap();

  posting.value = false;

  if (err) {
    showErrorToast(err);
    return;
  }

  await updateLastUsedEmojis(usedEmojis.value);

  text.value = "";
  files.value = [];
  uploadings.value = [];
  showSuccessToast(`投稿に成功しました`);

  emit("posted");
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

  const i = files.value.length;

  const attachmentFile = {
    type: fileType,
    blobUrl: URL.createObjectURL(file),
  } as Resource;
  files.value.push(attachmentFile);
  uploadings.value.push(true);

  const _dest = props.dest;
  const [res, err] = (
    await postFilesUpload({
      channel: dest2channel(_dest).id,
      file,
    })
  ).unwrap();

  uploadings.value[i] = false;

  if (err) {
    showErrorToast(err);
    return;
  }

  const f = files.value[i];
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
    doSinglePatternMatching(debouncedText.value, /@[^ \n]+/g)
      .map((x) => usersByNameCache[x.slice(1)])
      .filter(isPresent),
    (x) => x.id,
  ),
);

const usedEmojis = computed(() =>
  uniqBy(
    doSinglePatternMatching(debouncedText.value, /:[^ \n]+:/g)
      .map((x) => x.slice(1, x.length - 1))
      .filter(isEmoji),
    (x) => x,
  ),
);

const enabledPost = computed(() => {
  if (!text.value && files.value.length === 0) {
    return false;
  }

  if (uploadings.value.some(Boolean)) {
    return false;
  }

  if (posting.value) {
    return false;
  }

  return true;
});

const debouncedText = refDebounced(text, 300);

const input = ref<HTMLElement | null>();
onKeyStroke("o", (e) => {
  // Alt+O でトグル
  if (hasModifierKeyPressedOnly(e, "alt")) {
    if (tab.value === "edit") {
      tab.value = "preview";
    } else {
      tab.value = "edit";
      setTimeout(() => {
        input?.value?.focus();
      }, 0);
    }
  }
});
</script>

<template>
  <v-card
    v-if="dest"
    :elevation="4"
    class="d-flex flex-column align-center pa-5 pt-3 pb-1"
  >
    <div>
      <v-tabs
        v-model="tab"
        align-tabs="center"
        color="deep-purple-accent-4"
        density="compact"
      >
        <v-tab value="edit">Edit</v-tab>
        <v-tab value="preview">Preview</v-tab>
      </v-tabs>

      <v-window v-model="tab" class="mb-3">
        <v-window-item
          key="edit"
          value="edit"
          transition="none"
          reverse-transition="none"
        >
          <EmojiSuggestWrapper>
            <UserSuggestWrapper>
              <v-textarea
                ref="input"
                v-model="text"
                style="width: 640px"
                :rows="12"
                hide-details
                @paste="handlePaste"
                @keyup.ctrl.enter.exact="postMessage"
                @keyup.meta.enter.exact="postMessage"
              />
            </UserSuggestWrapper>
          </EmojiSuggestWrapper>
        </v-window-item>

        <v-window-item
          key="preview"
          value="preview"
          transition="none"
          reverse-transition="none"
        >
          <div
            class="pa-4"
            style="
              width: 640px;
              height: 320px;
              border: solid 1px lightgray;
              border-radius: 6px;
              font-size: 16px;
              overflow-y: auto;
            "
          >
            <MrkdwnView :text="debouncedText" />
          </div>
        </v-window-item>
      </v-window>
    </div>

    <div class="d-flex ga-3 mb-3">
      <img v-for="user in mentionUsers" :src="user.profile.image_48" />
    </div>

    <div class="d-flex ga-5">
      <UploadingImage
        v-for="(f, i) in files"
        :uploading="uploadings[i]"
        :file="f"
        width="160px"
        height="160px"
        class="mb-3"
      />
    </div>

    <v-btn
      :disabled="!enabledPost"
      :loading="posting"
      style="width: 240px"
      class="mb-3"
      prepend-icon="mdi-send-variant"
      color="primary"
      @click="postMessage"
      >ポストする</v-btn
    >
  </v-card>
</template>
