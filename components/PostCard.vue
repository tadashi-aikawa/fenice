<script setup lang="ts">
import { Message } from "@/models";
import { ts2display } from "@/utils/date";

const props = defineProps<{
  message: Message;
}>();

const handleOpenSlack = () => {
  window.open(props.message.permalink, "_blank");
};
const handleRead = async () => {
  const unreadMessages = await unreadMessagesStorage.getValue();
  const newUnreadMessages = unreadMessages.filter(
    (x) => x.ts !== props.message.ts,
  );

  const readByTs = await readByTsStorage.getValue();
  readByTs[props.message.ts] = true;

  await unreadMessagesStorage.setValue(newUnreadMessages);
  await readByTsStorage.setValue(readByTs);
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
</script>

<template>
  <v-card variant="flat" max-width="720" class="mb-5" :elevation="4">
    <v-card-item>
      <div class="d-flex align-center my-1 ga-2">
        <div class="text-body-2 font-weight-bold">
          {{ message.username }}
        </div>
        <v-spacer />
        <v-btn
          icon="mdi-check-circle-outline"
          @click="handleRead"
          variant="tonal"
          density="compact"
          style="color: forestgreen"
        />
        <v-btn
          icon="mdi-slack"
          @click="handleOpenSlack"
          variant="tonal"
          density="compact"
          style="color: goldenrod"
        />
      </div>

      <v-divider class="pb-3" />
      <pre class="text-caption" style="white-space: pre-wrap">{{
        displayMessage
      }}</pre>
      <div class="d-flex justify-end text-grey-darken-1 ga-1 mt-3">
        <v-icon>mdi-clock</v-icon>
        <span>{{ ts2display(message.ts) }}</span>
      </div>
    </v-card-item>
  </v-card>
</template>
