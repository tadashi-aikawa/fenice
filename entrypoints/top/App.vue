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
import { initGlobalCaches } from "@/global-cache";
import SearchMessagesContainer from "@/components/SearchMessagesContainer.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import { onKeyStroke } from "@vueuse/core";
import { hasModifierKeyPressed, hasModifierKeyPressedOnly } from "@/utils/keys";
import * as pkg from "../../package.json";
import { useThreadDrawerStore } from "@/stores";
import ThreadContainer from "@/components/ThreadContainer.vue";
import { useCache } from "@/composables/useCache";

const version = pkg.version;

type Page = "zen-times" | "crucial-messages" | "settings";
const page = ref<Page>("zen-times");

const searchDrawer = ref<boolean>(false);
let serialTabNo = 1;
const tabs = ref<number[]>([1]);
const currentTab = ref(1);

const threadDrawerStore = useThreadDrawerStore();

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

const {
  loadingCacheMessage,
  refreshEmojiCache,
  refreshChannelsCache,
  refreshUsersCache,
  refreshUsergroupsCache,
} = useCache();

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

const movePreviousTab = () => {
  const index = tabs.value.findIndex((x) => x === currentTab.value)!;
  if (index === 0) {
    currentTab.value = tabs.value.at(-1)!;
    return;
  }

  currentTab.value = tabs.value[index - 1];
};
const moveNextTab = () => {
  const index = tabs.value.findIndex((x) => x === currentTab.value)!;
  if (index === tabs.value.length - 1) {
    currentTab.value = tabs.value[0];
    return;
  }

  currentTab.value = tabs.value[index + 1];
};

const handleClickAddTab = () => {
  serialTabNo++;
  tabs.value.push(serialTabNo);
  currentTab.value = serialTabNo;
};
const handleClickRemoveTab = (tab: number) => {
  if (tab === currentTab.value) {
    const index = tabs.value.findIndex((x) => x === currentTab.value)!;
    currentTab.value =
      index === tabs.value.length - 1
        ? tabs.value[index - 1]
        : (currentTab.value = tabs.value[index + 1]);
  }
  tabs.value = tabs.value.filter((x) => x !== tab);
};

onKeyStroke("j", (e) => {
  // Alt+J で2画面のトグル
  if (!hasModifierKeyPressedOnly(e, "alt")) {
    return;
  }
  // accessTokenがない場合は認証できていないので無効
  if (!accessToken.value) {
    return;
  }

  switch (page.value) {
    case "zen-times":
      page.value = "crucial-messages";
      break;
    case "crucial-messages":
      page.value = "zen-times";
      break;
    case "settings":
      page.value = "zen-times";
      break;
    default:
      throw new ExhaustiveError(page.value);
  }
});

onKeyStroke("o", (e) => {
  // accessTokenがない場合は認証できていないので無効
  if (!accessToken.value) {
    return;
  }
  // Alt+o でトグル
  if (hasModifierKeyPressedOnly(e, "alt")) {
    searchDrawer.value = !searchDrawer.value;
  }
});
onKeyStroke("Escape", (e) => {
  // accessTokenがない場合は認証できていないので無効
  if (!accessToken.value) {
    return;
  }
  // ESCで閉じる
  if (hasModifierKeyPressed(e)) {
    return;
  }

  searchDrawer.value = false;
});
onKeyStroke("8", (e) => {
  // accessTokenがない場合は認証できていないので無効
  if (!accessToken.value) {
    return;
  }
  if (hasModifierKeyPressedOnly(e, "alt")) {
    movePreviousTab();
    e.preventDefault();
  }
});
onKeyStroke("9", (e) => {
  // accessTokenがない場合は認証できていないので無効
  if (!accessToken.value) {
    return;
  }
  if (hasModifierKeyPressedOnly(e, "alt")) {
    moveNextTab();
    e.preventDefault();
  }
});
</script>

<template>
  <v-app>
    <v-layout>
      <v-navigation-drawer v-if="accessToken" expand-on-hover rail>
        <v-list>
          <v-list-item title="Fenice" :subtitle="`v${version}`">
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

      <v-main>
        <div class="pa-6 d-flex" style="height: calc(100vh - 60px)">
          <div class="flex-grow-1" style="min-width: 0">
            <KeepAlive>
              <component :is="currentPage" />
            </KeepAlive>
          </div>

          <div
            v-if="threadDrawerStore.show"
            style="width: 750px"
            class="border-s-lg"
          >
            <ThreadContainer
              @posted="threadDrawerStore.show = false"
              @click:close-thread="threadDrawerStore.show = false"
            />
          </div>
        </div>

        <div class="d-flex ga-3 pa-1 px-2 border-t-sm">
          <v-spacer />
          <v-btn
            icon="mdi-comment-search"
            variant="tonal"
            color="primary"
            @click="searchDrawer = !searchDrawer"
          ></v-btn>
        </div>
      </v-main>

      <v-navigation-drawer
        v-model="searchDrawer"
        :inert="!searchDrawer"
        location="end"
        width="800"
        temporary
      >
        <v-tabs v-model="currentTab" align-tabs="title">
          <v-tab v-for="tab in tabs" :key="tab" :value="tab"
            >{{ tab }}
            <v-btn
              v-if="tabs.length > 1"
              icon="mdi-minus"
              density="compact"
              size="small"
              style="position: absolute; right: 1px"
              @click.stop="handleClickRemoveTab(tab)"
            ></v-btn
          ></v-tab>
          <div class="d-flex align-end mb-1 ml-2">
            <v-btn
              icon="mdi-plus"
              density="compact"
              @click="handleClickAddTab"
            ></v-btn>
          </div>
        </v-tabs>
        <v-window v-model="currentTab">
          <v-window-item
            v-for="tab in tabs"
            :key="tab"
            :value="tab"
            transition="none"
            reverse-transition="none"
          >
            <SearchMessagesContainer @show:thread="searchDrawer = false" />
          </v-window-item>
        </v-window>
      </v-navigation-drawer>
    </v-layout>

    <LoadingOverlay :loading="loadingCache" :message="loadingCacheMessage" />
  </v-app>
</template>
