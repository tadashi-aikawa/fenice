<script setup lang="ts">
import AuthenticationContainer from "@/components/AuthenticationContainer.vue";
import Badge from "@/components/Badge.vue";
import CrucialMessagesPage from "@/components/CrucialMessagesPage.vue";
import OnlyPostPage from "@/components/OnlyPostPage.vue";
import { accessTokenStorage, unreadMessagesStorage } from "@/utils/storage";
import { ref } from "vue";

const accessToken = ref("");
onBeforeMount(async () => {
  accessToken.value = (await accessTokenStorage.getValue()) ?? "";
});

type Page = "only-post" | "crucial-messages";
const page = ref<Page>("only-post");

const handleClickItem = ({ id }: { id: unknown }) => {
  page.value = id as Page;
};

const unreadCount = ref<number>(0);
onMounted(async () => {
  unreadMessagesStorage.watch((newValue) => {
    unreadCount.value = newValue.length;
  });
  unreadCount.value = (await unreadMessagesStorage.getValue()).length;
});

const currentPage = computed(() =>
  page.value === "only-post"
    ? OnlyPostPage
    : page.value === "crucial-messages"
      ? CrucialMessagesPage
      : undefined,
);
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
              :active="page === 'only-post'"
            ></v-list-item>
            <Badge
              :disabled="unreadCount === 0"
              color="primary"
              :content="unreadCount"
              location="top start"
              offset-x="32"
              offset-y="7"
            >
              <v-list-item
                prepend-icon="mdi-message-alert"
                title="重要なメッセージ確認"
                value="crucial-messages"
                :active="page === 'crucial-messages'"
              ></v-list-item>
            </Badge>
          </v-list>
        </v-navigation-drawer>

        <v-main>
          <KeepAlive>
            <component :is="currentPage" />
          </KeepAlive>
        </v-main>
      </v-layout>
    </template>

    <template v-else>
      <AuthenticationContainer v-model="accessToken" />
    </template>
  </v-app>
</template>
