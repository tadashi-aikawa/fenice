<script setup lang="ts">
import Badge from "@/components/Badge.vue";
import Loading from "@/components/Loading.vue";
import CrucialMessagesPage from "@/components/CrucialMessagesPage.vue";
import OnlyPostPage from "@/components/OnlyPostPage.vue";
import Settings from "@/entrypoints/settings/App.vue";
import { ExhaustiveError } from "@/utils/errors";
import {
  DEFAULT_CHANNELS_CACHE,
  DEFAULT_EMOJI_CACHE,
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
  refreshUsersCaches,
} from "@/global-cache";
import { RequestError } from "@/clients/slack/base";

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
const loadingCacheMessage = ref("");

const refreshUsersCache = async (): AsyncNullable<RequestError> => {
  loadingCacheMessage.value =
    "ユーザーキャッシュをリフレッシュしています。この処理はしばらくかかりますのでこのままお待ちください。";
  const [members, err] = (await refreshUsersCaches()).unwrap();
  if (err) {
    return err;
  }

  await usersCacheStorage.setValue({
    updated: DateTime.now().unix,
    members,
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

    <Loading :loading="loadingCache" :message="loadingCacheMessage" />
  </v-app>
</template>
