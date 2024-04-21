<script setup lang="ts">
import { AttachmentMessageBlock } from "@/clients/slack/blockModels";
import { channelsByIdCache } from "@/global-cache";
import Block from "./blocks/Block.vue";

const props = defineProps<{
  messageBlock: AttachmentMessageBlock;
  authorIcon: string;
  authorName: string;
  fromUrl: string;
}>();

// XXX: モデルがもやもやする... url
const handleOpenSlack = (link: string) => {
  window.open(link, "_blank");
};

const channelName = computed(() =>
  toDisplayChannelName(channelsByIdCache[props.messageBlock.channel]),
);
</script>

<template>
  <v-sheet max-width="625" class="mb-3" :elevation="2">
    <div class="d-flex">
      <div style="width: 625px" class="px-3 pt-1 pb-2">
        <div class="d-flex align-center my-1 ga-2">
          <div class="text-body-2 font-weight-bold d-flex align-top ga-2">
            <img :src="authorIcon" width="36px" height="36px" />
            <div>
              <div>
                {{ authorName }}
              </div>
              <div class="text-caption text-grey-darken-1">
                {{ channelName }}
              </div>
            </div>
          </div>
          <v-spacer />
          <v-btn
            icon="mdi-slack"
            @click="handleOpenSlack(fromUrl)"
            variant="tonal"
            density="compact"
            style="color: goldenrod"
          />
        </div>

        <v-divider class="pb-3" />

        <div class="d-flex flex-column ga-3">
          <template v-for="block in messageBlock.message.blocks">
            <Block :item="block" style="font-size: 14px" />
          </template>
        </div>

        <div class="d-flex justify-end text-grey-darken-1 ga-1 mt-3">
          <v-icon>mdi-clock</v-icon>
          <span>{{ ts2display(messageBlock.ts) }}</span>
        </div>
      </div>
    </div>
  </v-sheet>
</template>
