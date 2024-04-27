import { Channel, Message, User, Usergroup } from "@/clients/slack/models";

export const accessTokenStorage =
  storage.defineItem<string>("local:accessToken");
export const refreshTokenStorage =
  storage.defineItem<string>("local:refreshToken");
export const lastSelectedByChannelId = storage.defineItem<
  Record<string, number>
>("local:lastSelectedByChannelId", { defaultValue: {} });
export const unreadMessagesStorage = storage.defineItem<Message[]>(
  "local:unreadMessages",
  { defaultValue: [] },
);
export const readByTsStorage = storage.defineItem<{
  [ts: string]: true;
}>("local:readMessages", { defaultValue: {} });
export const selectedChannelIdsStorage = storage.defineItem<string[]>(
  "local:selectedChannelIds",
  { defaultValue: [] },
);
export const lockOnMessageStorage = storage.defineItem<Message | null>(
  "local:lockOnMessage",
  { defaultValue: null },
);

// Personalized
export const lastMentionedUserMapStorage = storage.defineItem<
  Record<string, number>
>("local:lastMentionedUserMap", { defaultValue: {} });
export const lastUsedEmojiMapStorage = storage.defineItem<
  Record<string, number>
>("local:lastUsedEmojiMap", { defaultValue: {} });

// Settings
export const clientIdStorage = storage.defineItem<string>("local:clientId");
export const clientSecretStorage =
  storage.defineItem<string>("local:clientSecret");
export const crucialMessageConditionsStorage = storage.defineItem<string[]>(
  "local:crucialMessageConditionsStorage",
  { defaultValue: [] },
); // 改行区切り複数指定
export const quickReactionEmojisStorage = storage.defineItem<string[]>(
  "local:quickReactionEmojisStorage",
  { defaultValue: [] },
); // 改行区切り複数指定

// Caches
export const DEFAULT_USERS_CACHE = { updated: -1, members: [] };
export const usersCacheStorage = storage.defineItem<{
  updated: number;
  members: User[];
}>("local:usersCache", {
  defaultValue: DEFAULT_USERS_CACHE,
});

export const DEFAULT_USERGROUPS_CACHE = { updated: -1, usergroups: [] };
export const usergroupsCacheStorage = storage.defineItem<{
  updated: number;
  usergroups: Usergroup[];
}>("local:usergroupsCache", {
  defaultValue: DEFAULT_USERGROUPS_CACHE,
});

export const DEFAULT_CHANNELS_CACHE = { updated: -1, channels: [] };
export const channelsCacheStorage = storage.defineItem<{
  updated: number;
  channels: Channel[];
}>("local:channelsCache", {
  defaultValue: DEFAULT_CHANNELS_CACHE,
});

export const DEFAULT_EMOJI_CACHE = { updated: -1, emoji: {} };
export const emojiCacheStorage = storage.defineItem<{
  updated: number;
  emoji: { [name: string]: string };
}>("local:emojiCache", {
  defaultValue: DEFAULT_EMOJI_CACHE,
});
