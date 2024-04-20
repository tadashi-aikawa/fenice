<script setup lang="ts">
const query = defineModel({ default: "" });

const emit = defineEmits<{
  enter: [query: string];
}>();
</script>

<template>
  <v-text-field
    v-model="query"
    variant="outlined"
    prepend-inner-icon="mdi-magnify"
    placeholder="検索クエリを入力"
    @keyup.enter.exact="emit('enter', query)"
  ></v-text-field>
</template>
