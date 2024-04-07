<script setup lang="ts">
import Prism from "prismjs";
import { computed } from "vue";

type Language = "json";

const props = defineProps<{
  content: string;
  language: Language;
}>();

const highlighted = computed(() =>
  // 色を付ける. 色以外はclassのCSSで指定
  Prism.highlight(
    props.content,
    Prism.languages[props.language],
    props.language,
  ),
);
const className = computed(() => `language-${props.language}`);
</script>

<template>
  <pre v-html="highlighted" :class="className"></pre>
</template>
