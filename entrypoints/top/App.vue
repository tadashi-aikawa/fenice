<script setup lang="ts">
import AuthenticationContainer from "@/components/AuthenticationContainer.vue";
import PostView from "@/components/PostView.vue";
import { accessTokenStorage } from "@/utils/storage";
import { ref } from "vue";

const accessToken = ref("");
onBeforeMount(async () => {
  accessToken.value = (await accessTokenStorage.getValue()) ?? "";
});
</script>

<template>
  <v-app>
    <template v-if="accessToken">
      <PostView />
    </template>
    <template v-else>
      <AuthenticationContainer v-model="accessToken" />
    </template>
  </v-app>
</template>
