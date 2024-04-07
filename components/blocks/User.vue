<script setup lang="ts">
import { UserItem } from "@/clients/slack/blockModels";
import { usersByIdCache } from "@/global-cache";

const props = defineProps<{
  item: UserItem;
}>();

const user = computed(() => usersByIdCache[props.item.user_id]);
</script>

<template>
  <span class="user">@{{ user.name }}</span>
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
