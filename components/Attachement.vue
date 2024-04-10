<script setup lang="ts">
import { Attachment } from "@/clients/slack/models";
import { channelsByIdCache } from "@/global-cache";
import { ts2display } from "@/utils/date";
import Block from "./blocks/Block.vue";
import { toDisplayChannelName } from "@/utils/strings";
import MrkdwnView from "./blocks/mrkdwn/MrkdwnView.vue";

defineProps<{
  attachment: Attachment;
}>();

// XXX: モデルがもやもやする... url
const handleOpenSlack = (link: string) => {
  window.open(link, "_blank");
};

const toChannelName = (id: string) =>
  toDisplayChannelName(channelsByIdCache[id]);
</script>

<template>
  <div>
    <template v-if="attachment.message_blocks">
      <template v-for="message_block in attachment.message_blocks">
        <v-sheet max-width="625" class="mb-3" :elevation="2">
          <div class="d-flex">
            <div style="width: 625px" class="px-3 pt-1 pb-2">
              <div class="d-flex align-center my-1 ga-2">
                <div class="text-body-2 font-weight-bold d-flex align-top ga-2">
                  <img
                    :src="attachment.author_icon"
                    width="36px"
                    height="36px"
                  />
                  <div>
                    <div>
                      {{ attachment.author_name }}
                    </div>
                    <div class="text-caption text-grey-darken-1">
                      {{ toChannelName(message_block.channel) }}
                    </div>
                  </div>
                </div>
                <v-spacer />
                <v-btn
                  icon="mdi-slack"
                  @click="handleOpenSlack(attachment.from_url)"
                  variant="tonal"
                  density="compact"
                  style="color: goldenrod"
                />
              </div>

              <v-divider class="pb-3" />

              <template v-for="block in message_block.message.blocks">
                <Block :item="block" style="font-size: 14px" />
              </template>

              <div class="d-flex justify-end text-grey-darken-1 ga-1 mt-3">
                <v-icon>mdi-clock</v-icon>
                <span>{{ ts2display(message_block.ts) }}</span>
              </div>
            </div>
          </div>
        </v-sheet>
      </template>
    </template>

    <template v-else-if="attachment.blocks">
      <v-sheet max-width="625" class="mb-3" :elevation="2">
        <div style="width: 625px" class="px-3 pt-1 pb-2">
          <template v-for="block in attachment.blocks">
            <Block :item="block" style="font-size: 14px" />
          </template>
        </div>
      </v-sheet>
    </template>

    <template v-else>
      <v-sheet max-width="625" class="mb-3" :elevation="2">
        <div class="d-flex">
          <div style="width: 625px" class="px-3 pt-1 pb-2">
            <div class="text-caption d-flex flex-column align-top ga-1">
              <img
                v-if="attachment.image_url"
                :src="attachment.image_url"
                style="max-width: 600px"
              />
              <div class="d-flex ga-1">
                <img
                  v-if="attachment.author_icon"
                  :src="attachment.author_icon"
                  width="18px"
                  height="18px"
                />
                <b>{{ attachment.author_name }}</b>
              </div>
              <h4 v-if="attachment.title">
                <MrkdwnView :text="attachment.title" />
              </h4>
              <p v-if="attachment.pretext">
                <MrkdwnView :text="attachment.pretext" />
              </p>
              <p v-if="attachment.text">
                <MrkdwnView :text="attachment.text" />
              </p>
            </div>
          </div>
        </div>
      </v-sheet>
    </template>
  </div>
</template>
