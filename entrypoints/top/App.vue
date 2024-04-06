<script setup lang="ts">
import AuthenticationContainer from "@/components/AuthenticationContainer.vue";
import Badge from "@/components/Badge.vue";
import CrucialMessagesPage from "@/components/CrucialMessagesPage.vue";
import OnlyPostPage from "@/components/OnlyPostPage.vue";
import Settings from "@/entrypoints/settings/App.vue";
import { ExhaustiveError } from "@/utils/errors";
import { accessTokenStorage, unreadMessagesStorage } from "@/utils/storage";
import { ref } from "vue";

const accessToken = ref("");

onBeforeMount(async () => {
  const token = (await accessTokenStorage.getValue()) ?? "";
  accessToken.value = token;
});

type Page = "only-post" | "crucial-messages" | "settings";
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

  accessTokenStorage.watch((newValue) => {
    accessToken.value = newValue ?? "";
  });
});

const currentPage = computed(() => {
  // トークンがない場合は設定画面(認証設定)に強制
  if (!accessToken.value) {
    return Settings;
  }

  switch (page.value) {
    case "only-post":
      return OnlyPostPage;
    case "crucial-messages":
      return CrucialMessagesPage;
    case "settings":
      return Settings;
    default:
      throw new ExhaustiveError(page.value);
  }
});
</script>

<template>
  <v-app>
    <v-layout>
      <v-navigation-drawer v-if="accessToken" expand-on-hover rail>
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
          <v-list-item
            prepend-icon="mdi-cog"
            title="設定"
            value="settings"
            :active="page === 'settings'"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <KeepAlive>
          <component :is="currentPage" />
        </KeepAlive>
      </v-main>
    </v-layout>
  </v-app>
</template>
