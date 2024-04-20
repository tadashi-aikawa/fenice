<script setup lang="ts">
import { Message, User } from "@/clients/slack/models";
import { ts2display } from "@/utils/date";
import HighlightCode from "./HighlightCode.vue";
import { usersByIdCache } from "@/global-cache";
import Block from "./blocks/Block.vue";
import Attachement from "./Attachement.vue";
import { toBrowserUrl, toDisplayChannelName } from "@/utils/strings";
import File from "./File.vue";
import Emoji from "./blocks/Emoji.vue";

interface Props {
  message: Message;
  reactionEmojis?: string[];
  readIcon?: `mdi-${string}`;
}
const props = withDefaults(defineProps<Props>(), {
  reactionEmojis: () => [],
  readIcon: "mdi-check-circle-outline",
});

const emit = defineEmits<{
  "click:read": [message: Message];
  "click:reaction": [message: Message, emoji: string];
}>();

const reactedEmojis = ref<Set<string>>(new Set());

const handleOpenBrowser = async () => {
  const url = toBrowserUrl(props.message.permalink);

  const tab = (
    await browser.tabs.query({
      url: "https://app.slack.com/client/*",
    })
  ).at(0);

  if (tab) {
    await browser.tabs.update(tab.id, {
      url,
      active: true,
    });
  } else {
    await browser.tabs.create({ url });
  }
};
const handleOpenSlack = async () => {
  await browser.tabs.create({ url: props.message.permalink });
};

const handleClickRead = () => {
  emit("click:read", props.message);
};

const handleClickEmojiReaction = (emoji: string) => {
  reactedEmojis.value.add(emoji);
  emit("click:reaction", props.message, emoji);
};

const postUser = computed<User | null>(
  () => usersByIdCache[props.message.user],
);
const postUsername = computed(
  () => postUser.value?.real_name ?? props.message.username,
);
const postUserImage = computed(
  () => postUser.value?.profile.image_72 ?? "/icon/384.png",
);

const channel = computed(() => props.message.channel);
const channelName = computed(() => toDisplayChannelName(channel.value));
</script>

<template>
  <v-card variant="elevated" max-width="720" class="mb-3" :elevation="2">
    <v-card-item class="ma-0 pa-0">
      <div class="d-flex">
        <div class="read-button" @click="handleClickRead">
          <v-icon size="large">{{ readIcon }}</v-icon>
        </div>

        <div style="width: 675px" class="px-3 pt-1 pb-2">
          <div class="d-flex align-center my-1 ga-2">
            <div class="text-body-2 font-weight-bold d-flex align-top ga-2">
              <img :src="postUserImage" width="36px" height="36px" />
              <div>
                <div>
                  {{ postUsername }}
                </div>
                <div class="text-caption text-grey-darken-1">
                  <span>{{ channelName }}</span>
                  <span class="ml-3">
                    <v-icon size="small">mdi-clock-outline</v-icon>
                    <span style="margin-left: 2px">{{
                      ts2display(message.ts)
                    }}</span>
                  </span>
                </div>
              </div>
            </div>
            <v-spacer />
            <v-btn
              icon="mdi-google-chrome"
              @click="handleOpenBrowser"
              variant="tonal"
              density="compact"
              style="color: goldenrod"
            />
            <v-btn
              icon="mdi-slack"
              @click="handleOpenSlack"
              variant="tonal"
              density="compact"
              style="color: goldenrod"
            />
            <v-menu location="end">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-code-json"
                  variant="plain"
                  density="compact"
                  v-bind="props"
                />
              </template>
              <HighlightCode
                :content="JSON.stringify(props.message, null, 2)"
                language="json"
                style="width: 570px; white-space: pre-wrap"
              />
            </v-menu>
          </div>

          <v-divider class="pb-3" />

          <template v-for="block in message.blocks ?? []">
            <Block :item="block" style="font-size: 14px" />
          </template>

          <template v-for="f in message.files ?? []">
            <File :file="f" class="mt-4 ml-4" />
          </template>

          <template v-for="at in message.attachments ?? []">
            <Attachement :attachment="at" class="mt-4 ml-4" />
          </template>

          <div class="d-flex align-center text-grey-darken-1 mt-3">
            <v-slide-group style="max-width: 640px">
              <v-slide-group-item>
                <v-btn
                  v-for="emoji in reactionEmojis"
                  :key="emoji"
                  :variant="reactedEmojis.has(emoji) ? 'tonal' : 'elevated'"
                  icon
                  density="compact"
                  class="mx-1"
                  :class="
                    reactedEmojis.has(emoji)
                      ? 'reaction-emoji-button__reacted'
                      : 'reaction-emoji-button'
                  "
                  @click="handleClickEmojiReaction(emoji)"
                >
                  <Emoji :item="{ type: 'emoji', name: emoji }" />
                </v-btn>
              </v-slide-group-item>
            </v-slide-group>
          </div>
        </div>
      </div>
    </v-card-item>
  </v-card>
</template>

<style scoped>
.read-button {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 10px;
  color: darkgrey;
  border-right: dashed 1px lightgrey;
}
.read-button:hover {
  background-color: rgba(144, 188, 144, 0.4);
}

.reaction-emoji-button {
  opacity: 0.25;
}
.reaction-emoji-button:hover {
  opacity: 1;
}

.reaction-emoji-button__reacted {
  opacity: 1;
}
</style>
