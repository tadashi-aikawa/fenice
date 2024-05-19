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
import { doSinglePatternMatching, escapeMrkdwn } from "@/utils/strings";
import {
  isEmoji,
  usergroupsByHandleCache,
  usersByNameCache,
} from "@/global-cache";
import { updateLastUsedEmojis } from "@/utils/storage";
import MrkdwnView from "./blocks/mrkdwn/MrkdwnView.vue";
import { onKeyStroke, refDebounced } from "@vueuse/core";
import CodeMirrorMessageForm from "./CodeMirrorMessageForm.vue";

const props = defineProps<{
  dest: Dest;
}>();

const emit = defineEmits<{
  posted: [];
}>();

const text = ref("");
const files = ref<Resource[]>([]);

const uploadings = ref<boolean[]>([]);
const posting = ref(false);

const postMessage = async () => {
  if (!enabledPost.value) {
    return;
  }

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
    : await postChatPostMessage({
        channel,
        thread_ts,
        // コードブロックの中でも書式が有効になるので無効化する
        text: toMrkdwn(text.value, { escapeInCodeBlock: true }),
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
const debouncedMrkdwnText = computed(() => toMrkdwn(debouncedText.value));

const input = ref<HTMLElement | null>();
const mode = ref<"edit" | "preview">("edit");

// 投稿メッセージを厳密なmrkdwnに可能な限り変換する (主にメンションなどに)
const toMrkdwn = (str: string, option?: { escapeInCodeBlock?: boolean }) => {
  const transformMentions = (str: string): string => {
    return str.replaceAll(/@([^ \n]+)/g, (_, s) => {
      if (s === "channel" || s === "here") {
        return `<!${s}>`;
      }

      const userId = usersByNameCache[s]?.id;
      if (userId) {
        return `<@${userId}>`;
      }

      const groupId = usergroupsByHandleCache[s]?.id;
      if (groupId) {
        return `<!subteam^${groupId}>`;
      }

      // メンションターゲットが存在しなければそのまま
      return `@${s}`;
    });
  };

  const lines = str.split("\n");
  const mrkdwnLines = [];
  let inCodeBlock = false;

  for (const line of lines) {
    const beginBlock = !inCodeBlock && line.startsWith("```");
    if (beginBlock) {
      inCodeBlock = true;
    }

    mrkdwnLines.push(
      inCodeBlock
        ? option?.escapeInCodeBlock
          ? escapeMrkdwn(line)
          : line
        : transformMentions(line),
    );

    if (!beginBlock && inCodeBlock && line.endsWith("```")) {
      inCodeBlock = false;
    }
  }

  return mrkdwnLines.join("\n");
};

const enterEditMode = async () => {
  mode.value = "edit";
  await sleep(0);
  input.value?.focus();
};

const enterPreviewMode = async () => {
  mode.value = "preview";
};

onKeyStroke("p", async (e) => {
  // Alt+p でプレビュー切り替え
  if (hasModifierKeyPressedOnly(e, "alt")) {
    switch (mode.value) {
      case "preview":
        await enterEditMode();
        break;
      case "edit":
        await enterPreviewMode();
        break;
      default:
        throw new ExhaustiveError(mode.value);
    }
  }
});

onKeyStroke("Enter", async (e) => {
  if (
    hasModifierKeyPressedOnly(e, "ctrl") ||
    hasModifierKeyPressedOnly(e, "meta")
  ) {
    e.stopPropagation();
    await postMessage();
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
      <template v-if="mode === 'edit'">
        <CodeMirrorMessageForm
          v-model="text"
          autofocus
          width="640px"
          max-height="480px"
          @paste="handlePaste"
          style="border: solid 1px lightgray; border-radius: 6px; padding: 12px"
        ></CodeMirrorMessageForm>
      </template>

      <template v-else-if="mode === 'preview'">
        <v-hover>
          <template v-slot:default="{ isHovering, props }">
            <div
              v-bind="props"
              class="preview pa-4"
              :class="{ hovering: isHovering }"
              tabindex="0"
              @focusin="enterEditMode"
              style="font-size: 14px"
            >
              <MrkdwnView :text="debouncedMrkdwnText" />
            </div>
          </template>
        </v-hover>
      </template>
    </div>

    <div class="d-flex ga-3 my-3">
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
      @focus="mode = 'preview'"
      >ポストする</v-btn
    >
  </v-card>
</template>

<style scoped>
.preview {
  width: 640px;
  max-height: 480px;
  border: solid 1px lightgray;
  border-radius: 6px;
  font-size: 16px;
  overflow-y: auto;
  transition: background-color 0.5s;
}
.preview.hovering {
  background-color: whitesmoke;
  cursor: pointer;
  transition: background-color 0.5s;
}
</style>
