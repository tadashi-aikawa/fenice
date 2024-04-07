<script setup lang="ts">
import { Message, User } from "@/clients/slack/models";
import { ts2display } from "@/utils/date";
import HighlightCode from "./HighlightCode.vue";
import { usersByIdCache } from "@/global-cache";
import Block from "./blocks/Block.vue";

const props = defineProps<{
  message: Message;
}>();

const emit = defineEmits<{
  "click:read": [message: Message];
}>();

const handleOpenSlack = () => {
  window.open(props.message.permalink, "_blank");
};

const displayMessage = computed(() => {
  if (props.message.text) {
    return props.message.text;
  }

  if (props.message.attachments) {
    return props.message.attachments
      .map(
        (x) => `---
${x.fallback}
> ${x.author_name}
> ${x.text}
---`,
      )
      .join("\n\n");
  }

  return "今の実装では解析ができません。Feniceのバージョンアップをお待ちください。";
});

const handleClickRead = () => {
  emit("click:read", props.message);
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
const channelName = computed(() =>
  channel.value.is_private
    ? `🔒 ${channel.value.name}`
    : `#${channel.value.name}`,
);
</script>

<template>
  <v-card variant="elevated" max-width="720" class="mb-3" :elevation="2">
    <v-card-item class="ma-0 pa-0">
      <div class="d-flex">
        <div class="read-button" @click="handleClickRead">
          <v-icon size="large">mdi-check-circle-outline</v-icon>
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
                  {{ channelName }}
                </div>
              </div>
            </div>
            <v-spacer />
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

          <template v-for="block in message.blocks">
            <Block :item="block" style="font-size: 14px" />
          </template>

          <div class="d-flex justify-end text-grey-darken-1 ga-1 mt-3">
            <v-icon>mdi-clock</v-icon>
            <span>{{ ts2display(message.ts) }}</span>
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
</style>
