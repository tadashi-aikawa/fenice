<script setup lang="ts">
import { File } from "@/clients/slack/models";
import { VIcon } from "vuetify/components";
import FileBox from "./files/FileBox.vue";

defineProps<{
  file: File;
}>();
</script>

<template>
  <div>
    <template
      v-if="['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(file.filetype)"
    >
      <a :href="file.url_private" target="_blank" class="link">
        <img
          :src="file.url_private"
          style="max-width: 400px; max-height: 480px; border-radius: 8px"
        />
      </a>
    </template>

    <template v-else-if="['mp4'].includes(file.filetype)">
      <video
        muted
        controls
        :src="file.url_private"
        style="max-width: 400px; max-height: 480px"
      />
    </template>

    <template v-else-if="file.filetype === 'gdoc'">
      <FileBox
        :url="file.url_private"
        :title="file.name"
        subtitle="Google Docs"
        icon="mdi-text-box"
        color="blue"
        :preview-image="file.thumb_480"
      />
    </template>

    <template v-else-if="file.filetype === 'gpres'">
      <FileBox
        :url="file.url_private"
        :title="file.name"
        subtitle="Google Presentation"
        icon="mdi-file-presentation-box"
        color="gold"
        :preview-image="file.thumb_480"
      />
    </template>

    <template v-else-if="file.filetype === 'gsheet'">
      <FileBox
        :url="file.url_private"
        :title="file.name"
        subtitle="Google Spreadsheet"
        icon="mdi-google-spreadsheet"
        color="green"
        :preview-image="file.thumb_480"
      />
    </template>

    <template v-else-if="file.filetype === 'xlsx'">
      <FileBox
        :url="file.url_private"
        :title="file.name"
        subtitle="Excel (xlsx)"
        icon="mdi-microsoft-excel"
        color="green"
        :preview-image="file.thumb_480"
      />
    </template>

    <template v-else-if="file.filetype === 'pdf'">
      <FileBox
        :url="file.url_private"
        :title="file.name"
        subtitle="PDF"
        icon="mdi-file-pdf-box"
        color="red"
        :preview-image="file.thumb_pdf"
      />
    </template>

    <template v-else-if="['zip'].includes(file.filetype)">
      <v-icon>mdi-zip-box-outline</v-icon>
      <a :href="file.url_private">{{ file.name }}</a>
    </template>

    <template v-else>
      <b>今はFeniceでサポートしていない形式です</b>
    </template>
  </div>
</template>

<style scoped>
.link {
  text-decoration: none;
}
</style>
