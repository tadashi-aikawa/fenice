<script setup lang="ts">
import { Message } from "@/models";
import { ts2display } from "@/utils/date";

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
</script>

<template>
  <v-card variant="elevated" max-width="720" class="mb-3" :elevation="2">
    <v-card-item class="ma-0 pa-0">
      <div class="d-flex">
        <div class="read-button" @click="handleClickRead">
          <v-icon size="large">mdi-check-circle-outline</v-icon>
        </div>

        <div style="width: 100%" class="px-3 pt-1 pb-2">
          <div class="d-flex align-center my-1 ga-2">
            <div class="text-body-2 font-weight-bold">
              {{ message.username }}
            </div>
            <v-spacer />
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
