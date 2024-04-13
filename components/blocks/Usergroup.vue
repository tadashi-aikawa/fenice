<script setup lang="ts">
import { UsergroupItem } from "@/clients/slack/blockModels";
import { usergroupsByIdCache } from "@/global-cache";

const props = defineProps<{
  item: UsergroupItem;
}>();

const usergroupName = computed(() => {
  console.log(usergroupsByIdCache);
  const a =
    usergroupsByIdCache[props.item.usergroup_id]?.handle ?? "unknown_group";
  return a;
});
</script>

<template>
  <span class="usergroup">@{{ usergroupName }}</span>
</template>

<style scoped>
.usergroup {
  color: forestgreen;
  background-color: lightgreen;
  line-height: 30px;
  border-radius: 2px;
  padding-left: 2px;
  padding-right: 2px;
}
</style>
