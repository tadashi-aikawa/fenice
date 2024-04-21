<script setup lang="ts">
import { Attachment } from "@/clients/slack/models";
import Block from "./blocks/Block.vue";
import MrkdwnView from "./blocks/mrkdwn/MrkdwnView.vue";
import AttachmentField from "./blocks/AttachmentField.vue";
import AttachmentMessageCard from "./AttachmentMessageCard.vue";

defineProps<{
  attachment: Attachment;
}>();
</script>

<template>
  <div>
    <template v-if="attachment.message_blocks">
      <AttachmentMessageCard
        v-for="message_block in attachment.message_blocks"
        :key="message_block.ts"
        :message-block="message_block"
        :author-icon="attachment.author_icon"
        :author-name="attachment.author_name"
        :from-url="attachment.from_url"
      />
    </template>

    <template v-else-if="attachment.blocks">
      <v-sheet max-width="625" class="mb-3" :elevation="2">
        <div
          style="width: 625px"
          class="d-flex flex-column px-3 pt-1 pb-2 ga-3"
        >
          <template v-for="block in attachment.blocks">
            <Block :item="block" style="font-size: 14px" />
          </template>
        </div>
      </v-sheet>
    </template>

    <template v-else-if="attachment.fields">
      <v-sheet max-width="625" class="mb-3" :elevation="2">
        <div
          style="width: 625px"
          class="d-flex flex-column px-3 pt-1 pb-2 ga-3"
        >
          <h4
            v-if="attachment.title"
            class="font-weight-bold"
            style="font-size: 125%"
          >
            <a :href="attachment.title_link" target="_blank"
              ><MrkdwnView :text="attachment.title"
            /></a>
          </h4>
          <p v-if="attachment.text">
            <MrkdwnView :text="attachment.text" />
          </p>
          <div class="d-flex flex-wrap">
            <template v-for="field in attachment.fields">
              <AttachmentField :item="field" style="font-size: 14px" />
            </template>
          </div>
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

              <div v-if="attachment.service_name" class="d-flex ga-1">
                <img
                  v-if="attachment.service_icon"
                  :src="attachment.service_icon"
                  width="18px"
                  height="18px"
                />
                <b>{{ attachment.service_name }}</b>
              </div>

              <div v-if="attachment.author_name" class="d-flex ga-1">
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
