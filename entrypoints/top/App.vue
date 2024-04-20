<script setup lang="ts">
import Badge from "@/components/Badge.vue";
import CrucialMessagesPage from "@/components/CrucialMessagesPage.vue";
import ZenTimesPage from "@/components/ZenTimesPage.vue";
import Settings from "@/entrypoints/settings/App.vue";
import { ExhaustiveError } from "@/utils/errors";
import {
  DEFAULT_CHANNELS_CACHE,
  DEFAULT_EMOJI_CACHE,
  DEFAULT_USERGROUPS_CACHE,
  accessTokenStorage,
  channelsCacheStorage,
  emojiCacheStorage,
  unreadMessagesStorage,
  usersCacheStorage,
} from "@/utils/storage";
import { AsyncNullable, DateTime } from "owlelia";
import {
  initGlobalCaches,
  refreshChannelsCaches,
  refreshEmojiCaches,
  refreshAllUsergroupsCaches,
  refreshAllUserCaches,
} from "@/global-cache";
import { RequestError } from "@/clients/slack/base";
import SearchMessagesContainer from "@/components/SearchMessagesContainer.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";

type Page = "zen-times" | "crucial-messages" | "settings";
const page = ref<Page>("zen-times");
const rightDrawer = ref<boolean>(false);

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
const loadingCacheMessage = ref("");

const refreshUsersCache = async (): AsyncNullable<RequestError> => {
  loadingCacheMessage.value =
    "ユーザーキャッシュをリフレッシュしています。この処理はしばらくかかりますのでこのままお待ちください。";
  const [members, err] = (await refreshAllUserCaches()).unwrap();
  if (err) {
    return err;
  }

  await usersCacheStorage.setValue({
    updated: DateTime.now().unix,
    members,
  });
};

const refreshUsergroupsCache = async (): AsyncNullable<RequestError> => {
  loadingCacheMessage.value =
    "ユーザーグループキャッシュをリフレッシュしています。この処理はしばらくかかりますのでこのままお待ちください。";
  const [usergroups, err] = (await refreshAllUsergroupsCaches()).unwrap();
  if (err) {
    return err;
  }

  await usergroupsCacheStorage.setValue({
    updated: DateTime.now().unix,
    usergroups,
  });
};

const refreshChannelsCache = async (): AsyncNullable<RequestError> => {
  loadingCacheMessage.value =
    "Channelキャッシュをリフレッシュしています。この処理はしばらくかかりますのでこのままお待ちください。";
  const [channels, err] = (await refreshChannelsCaches()).unwrap();
  if (err) {
    return err;
  }

  await channelsCacheStorage.setValue({
    updated: DateTime.now().unix,
    channels,
  });
};

const refreshEmojiCache = async (): AsyncNullable<RequestError> => {
  loadingCacheMessage.value = "絵文字キャッシュをリフレッシュしています。";
  const [emoji, err] = (await refreshEmojiCaches()).unwrap();
  if (err) {
    return err;
  }

  await emojiCacheStorage.setValue({
    updated: DateTime.now().unix,
    emoji,
  });
};

onMounted(async () => {
  loadingCache.value = true;
  loadingCacheMessage.value = "キャッシュを読み込み中です。";

  await initGlobalCaches();

  // アクセストークンがないと通信ができないので
  if (!accessToken) {
    loadingCache.value = false;
    loadingCacheMessage.value = "";
    return;
  }

  // FIXME: 条件はあとで決める

  const usersCache = await usersCacheStorage.getValue();
  if (usersCache.updated === DEFAULT_USERS_CACHE.updated) {
    const err = await refreshUsersCache();
    if (err) {
      showErrorToast(err);
    }
  }

  const usergroupsCache = await usergroupsCacheStorage.getValue();
  if (usergroupsCache.updated === DEFAULT_USERGROUPS_CACHE.updated) {
    const err = await refreshUsergroupsCache();
    if (err) {
      showErrorToast(err);
    }
  }

  const channelsCache = await channelsCacheStorage.getValue();
  if (channelsCache.updated === DEFAULT_CHANNELS_CACHE.updated) {
    const err = await refreshChannelsCache();
    if (err) {
      showErrorToast(err);
    }
  }

  const emojiCache = await emojiCacheStorage.getValue();
  if (emojiCache.updated === DEFAULT_EMOJI_CACHE.updated) {
    const err = await refreshEmojiCache();
    if (err) {
      showErrorToast(err);
    }
  }

  loadingCache.value = false;
  loadingCacheMessage.value = "";
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
    case "zen-times":
      return ZenTimesPage;
    case "crucial-messages":
      return CrucialMessagesPage;
    case "settings":
      return Settings;
    default:
      throw new ExhaustiveError(page.value);
  }
});

browser.runtime.onMessage.addListener((message: { page: Page }) => {
  page.value = message.page;
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
          <v-list-item title="Fenice" subtitle="for ${user}">
            <template v-slot:prepend>
              <v-avatar>
                <v-img alt="Fenice" src="/icon/384.png" />
              </v-avatar>
            </template>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list nav @click:select="handleClickItem">
          <v-list-item
            title="禅 times"
            value="zen-times"
            :active="page === 'zen-times'"
            accesskey="k"
          >
            <template v-slot:prepend>
              <v-icon icon="mdi-meditation" size="x-large"></v-icon>
            </template>
          </v-list-item>
          <Badge
            :disabled="unreadCount === 0"
            color="primary"
            :content="unreadCount"
            location="top start"
            offset-x="32"
            offset-y="7"
          >
            <v-list-item
              title="重要メッセージ"
              value="crucial-messages"
              :active="page === 'crucial-messages'"
              accesskey="j"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-message-alert" size="x-large"></v-icon>
              </template>
            </v-list-item>
          </Badge>
          <v-list-item
            title="設定"
            value="settings"
            :active="page === 'settings'"
          >
            <template v-slot:prepend>
              <v-icon icon="mdi-cog" size="x-large"></v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main class="pa-6">
        <KeepAlive>
          <component :is="currentPage" />
        </KeepAlive>
      </v-main>

      <v-btn
        icon="mdi-comment-search"
        size="x-large"
        variant="tonal"
        color="primary"
        style="position: absolute; bottom: 15px; right: 15px"
        @click="rightDrawer = !rightDrawer"
      ></v-btn>

      <v-navigation-drawer
        v-model="rightDrawer"
        temporary
        location="end"
        width="800px"
      >
        <SearchMessagesContainer />
      </v-navigation-drawer>
    </v-layout>

    <LoadingOverlay :loading="loadingCache" :message="loadingCacheMessage" />
  </v-app>
</template>
