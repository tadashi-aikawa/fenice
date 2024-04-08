<script setup lang="ts">
import { UserItem } from "@/clients/slack/blockModels";
import { usersByIdCache } from "@/global-cache";

const props = defineProps<{
  item: UserItem;
}>();

const userName = computed(
  () => usersByIdCache[props.item.user_id]?.name ?? "存在しないユーザー",
);
</script>

<template>
  <span class="user">@{{ userName }}</span>
</template>

<style scoped>
.user {
  color: dodgerblue;
  background-color: powderblue;
  line-height: 30px;
  border-radius: 2px;
  padding-left: 2px;
  padding-right: 2px;
}
</style>
