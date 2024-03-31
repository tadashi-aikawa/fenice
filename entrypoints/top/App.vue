<script setup lang="ts">
import AuthenticationContainer from "@/components/AuthenticationContainer.vue";
import OnlyPostView from "@/components/OnlyPostPage.vue";
import { accessTokenStorage } from "@/utils/storage";
import { ref } from "vue";

const accessToken = ref("");
onBeforeMount(async () => {
  accessToken.value = (await accessTokenStorage.getValue()) ?? "";
});

type Page = "only-post" | "???";
const page = ref<Page>("only-post");

const handleClickItem = ({ id }: { id: unknown }) => {
  page.value = id as Page;
};
</script>

<template>
  <v-app>
    <template v-if="accessToken">
      <v-layout>
        <v-navigation-drawer expand-on-hover rail>
          <v-list>
            <v-list-item
              title="Fenice"
              subtitle="for ${user}"
              prepend-avatar="/icon/384.png"
            ></v-list-item>
          </v-list>

          <v-divider></v-divider>

          <v-list nav @click:select="handleClickItem">
            <v-list-item
              prepend-icon="mdi-lead-pencil"
              title="投稿だけ機能"
              value="only-post"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-help-box"
              title="???"
              value="???"
            ></v-list-item>
          </v-list>
        </v-navigation-drawer>

        <v-main>
          <template v-if="page === 'only-post'">
            <OnlyPostView />
          </template>
          <template v-if="page === '???'">
            <span>TODO</span>
          </template>
        </v-main>
      </v-layout>
    </template>

    <template v-else>
      <AuthenticationContainer v-model="accessToken" />
    </template>
  </v-app>
</template>
