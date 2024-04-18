<script setup lang="ts">
import { smartLineBreakSplit } from "@/utils/collections";
import {
  channelsCacheStorage,
  crucialMessageConditionsStorage,
  emojiCacheStorage,
  quickReactionEmojisStorage,
} from "@/utils/storage";
import AuthenticationContainer from "@/components/AuthenticationContainer.vue";
import { DateTime } from "owlelia";
import {
  clearChannelsCaches,
  clearEmojiCaches,
  clearUsergroupsCaches,
  clearUsersCaches,
} from "@/global-cache";
import Emoji from "@/components/blocks/Emoji.vue";

interface State {
  tab: "auth" | "search" | "appearance" | "cache";
  accessToken: string;
  clientId: string;
  clientSecret: string;
  crucialMessageConditions: string;
  quickReactionEmojis: string;
  cache: {
    users?: { lastUpdated: string; num: number };
    usergroups?: { lastUpdated: string; num: number };
    channels?: { lastUpdated: string; num: number };
    emoji?: { lastUpdated: string; num: number };
  };
}
const state = reactive<State>({
  tab: "auth",
  accessToken: "",
  clientId: "",
  clientSecret: "",
  crucialMessageConditions: "",
  quickReactionEmojis: "",
  cache: {},
});

const updateCacheMeta = async () => {
  const userCache = await usersCacheStorage.getValue();
  const usergroupCache = await usergroupsCacheStorage.getValue();
  const channelCache = await channelsCacheStorage.getValue();
  const emojiCache = await emojiCacheStorage.getValue();

  state.cache = {
    ...state.cache,
    users: {
      lastUpdated: DateTime.of(userCache.updated).displayDateTime,
      num: userCache.members.length,
    },
    usergroups: {
      lastUpdated: DateTime.of(usergroupCache.updated).displayDateTime,
      num: usergroupCache.usergroups.length,
    },
    channels: {
      lastUpdated: DateTime.of(channelCache.updated).displayDateTime,
      num: channelCache.channels.length,
    },
    emoji: {
      lastUpdated: DateTime.of(emojiCache.updated).displayDateTime,
      num: Object.keys(emojiCache.emoji).length,
    },
  };
};

onBeforeMount(async () => {
  state.accessToken = (await accessTokenStorage.getValue()) ?? "";
  state.clientId = (await clientIdStorage.getValue()) ?? "";
  state.clientSecret = (await clientSecretStorage.getValue()) ?? "";
  state.crucialMessageConditions =
    (await crucialMessageConditionsStorage.getValue())?.join("\n") ?? "";
  state.quickReactionEmojis =
    (await quickReactionEmojisStorage.getValue())?.join("\n") ?? "";

  await updateCacheMeta();
});

const toCacheMessage = (cache?: {
  lastUpdated: string;
  num: number;
}): string => {
  if (!cache) {
    return "読み込み中";
  }

  return cache.num > 0
    ? `キャッシュ数: ${cache.num}, 最終更新: ${cache.lastUpdated}`
    : "キャッシュは存在しません";
};

const handleClickSave = async () => {
  await clientIdStorage.setValue(state.clientId);
  await clientSecretStorage.setValue(state.clientSecret);
  await crucialMessageConditionsStorage.setValue(
    smartLineBreakSplit(state.crucialMessageConditions),
  );
  await quickReactionEmojisStorage.setValue(
    smartLineBreakSplit(state.quickReactionEmojis),
  );
  showSuccessToast("設定が更新されました");
};

const clearAuth = async () => {
  await accessTokenStorage.setValue("");
  state.accessToken = "";
  showSuccessToast("Slackとの認証をクリアしました");
};

const clearCache = async (
  target: "users" | "usergroups" | "channels" | "emoji",
) => {
  switch (target) {
    case "users":
      await clearUsersCaches();
      break;
    case "usergroups":
      await clearUsergroupsCaches();
      break;
    case "channels":
      await clearChannelsCaches();
      break;
    case "emoji":
      await clearEmojiCaches();
      break;
    default:
      throw new ExhaustiveError(target);
  }

  await updateCacheMeta();
  showSuccessToast("キャッシュをクリアしました");
};

const emojis = computed(() => {
  if (!state.quickReactionEmojis.trim()) {
    return [];
  }
  return smartLineBreakSplit(state.quickReactionEmojis);
});
</script>

<template>
  <v-container style="width: 800px">
    <v-card :elevation="2">
      <v-tabs v-model="state.tab" align-tabs="center">
        <v-tab value="auth">Auth</v-tab>
        <v-tab value="search">Search</v-tab>
        <v-tab value="appearance">Appearance</v-tab>
        <v-tab value="cache">Cache</v-tab>
      </v-tabs>

      <v-window v-model="state.tab" class="pa-5">
        <v-window-item value="auth">
          <div class="d-flex flex-column align-center">
            <v-text-field
              v-model="state.clientId"
              label="Slack appのclient_id"
              required
              style="width: 480px"
            />
            <v-text-field
              v-model="state.clientSecret"
              label="Slack appのclient_secret"
              type="password"
              required
              style="width: 480px"
            />

            <template v-if="state.accessToken">
              <v-btn color="warning" @click="clearAuth"
                >Slackの認証クリア</v-btn
              >
            </template>
            <template v-else>
              <AuthenticationContainer
                v-model="state.accessToken"
                :client-id="state.clientId"
                :client-secret="state.clientSecret"
              />
            </template>
          </div>
        </v-window-item>

        <v-window-item value="search">
          <v-textarea
            v-model="state.crucialMessageConditions"
            label="重要メッセージの条件 (改行区切りで複数指定)"
            auto-grow
          />
        </v-window-item>

        <v-window-item value="appearance">
          <v-textarea
            v-model="state.quickReactionEmojis"
            label="リアクションの絵文字 (改行区切りで複数指定)(ex: smile)"
            auto-grow
          />
          <div class="d-flex ga-2">
            <template v-for="emoji in emojis">
              <v-btn variant="elevated" icon density="compact">
                <Emoji :item="{ type: 'emoji', name: emoji }" />
              </v-btn>
            </template>
          </div>
        </v-window-item>

        <v-window-item value="cache">
          <v-list lines="two">
            <v-list-item
              title="ユーザーキャッシュ"
              :subtitle="toCacheMessage(state.cache.users)"
            >
              <template v-slot:append>
                <v-btn color="warning" @click="clearCache('users')"
                  >クリア</v-btn
                >
              </template>
            </v-list-item>

            <v-list-item
              title="ユーザーグループキャッシュ"
              :subtitle="toCacheMessage(state.cache.usergroups)"
            >
              <template v-slot:append>
                <v-btn color="warning" @click="clearCache('usergroups')"
                  >クリア</v-btn
                >
              </template>
            </v-list-item>

            <v-list-item
              title="Channelキャッシュ"
              :subtitle="toCacheMessage(state.cache.channels)"
            >
              <template v-slot:append>
                <v-btn color="warning" @click="clearCache('channels')"
                  >クリア</v-btn
                >
              </template>
            </v-list-item>

            <v-list-item
              title="絵文字キャッシュ"
              :subtitle="toCacheMessage(state.cache.emoji)"
            >
              <template v-slot:append>
                <v-btn color="warning" @click="clearCache('emoji')"
                  >クリア</v-btn
                >
              </template>
            </v-list-item>
          </v-list>
        </v-window-item>
      </v-window>
    </v-card>

    <div class="d-flex justify-center ga-4 mt-4">
      <v-btn color="primary" @click="handleClickSave">更新</v-btn>
    </div>
  </v-container>
</template>
