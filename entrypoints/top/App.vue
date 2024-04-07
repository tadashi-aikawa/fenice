<script setup lang="ts">
import { getUserList } from "@/clients/slack";
import { User } from "@/clients/slack/models";
import Badge from "@/components/Badge.vue";
import Loading from "@/components/Loading.vue";
import CrucialMessagesPage from "@/components/CrucialMessagesPage.vue";
import OnlyPostPage from "@/components/OnlyPostPage.vue";
import Settings from "@/entrypoints/settings/App.vue";
import { ExhaustiveError } from "@/utils/errors";
import {
  accessTokenStorage,
  unreadMessagesStorage,
  usersCacheStorage,
} from "@/utils/storage";
import { DateTime } from "owlelia";
import { initGlobalCaches } from "@/global-cache";

type Page = "only-post" | "crucial-messages" | "settings";
const page = ref<Page>("only-post");

// nullは未取得. 空文字はなし
const accessToken = ref<string | null>(null);
onBeforeMount(async () => {
  const token = (await accessTokenStorage.getValue()) ?? "";
  accessToken.value = token;
});
onMounted(async () => {
  accessTokenStorage.watch((newValue) => {
    accessToken.value = newValue ?? "";
  });
});

const unreadCount = ref<number>(0);
onMounted(async () => {
  unreadMessagesStorage.watch((newValue) => {
    unreadCount.value = newValue.length;
  });
  unreadCount.value = (await unreadMessagesStorage.getValue()).length;
});

const loadingCache = ref(false);
onMounted(async () => {
  // いったんここで...
  await initGlobalCaches();

  const usersCache = await usersCacheStorage.getValue();
  // FIXME: 条件はあとで決める
  if (accessToken.value && usersCache.updated === DEFAULT_USERS_CACHE.updated) {
    loadingCache.value = true;

    let members: User[] = [];
    let cacheTs = DateTime.now().unix;
    let nextCursor = "";
    while (true) {
      const [res, err] = (await getUserList({ cursor: nextCursor })).unwrap();
      if (err) {
        showErrorToast(err);
        loadingCache.value = false;
        return;
      }

      members = members.concat(res.members);
      cacheTs = res.cache_ts;

      nextCursor = res.response_metadata.next_cursor;
      if (!nextCursor) {
        break;
      }
    }

    await usersCacheStorage.setValue({ updated: cacheTs, members });
    loadingCache.value = false;
  }
});

const currentPage = computed(() => {
  // トークンがない場合は設定画面(認証設定)に強制
  if (accessToken.value === "") {
    return Settings;
  }
  // まだ取得できていない
  if (!accessToken.value) {
    return undefined;
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

const handleClickItem = ({ id }: { id: unknown }) => {
  page.value = id as Page;
};
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
            accesskey="k"
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
              accesskey="j"
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

    <Loading
      :loading="loadingCache"
      message="キャッシュをロード中です。この処理はしばらくかかります..."
    />
  </v-app>
</template>
