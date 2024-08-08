import { Channel, Message, User, Usergroup } from "@/clients/slack/models";
import { DateTime } from "owlelia";

// ----------------------------------
// App state
// ----------------------------------
export const accessTokenStorage =
  storage.defineItem<string>("local:accessToken");
export const refreshTokenStorage =
  storage.defineItem<string>("local:refreshToken");
export const lastSelectedByChannelId = storage.defineItem<
  Record<string, number>
>("local:lastSelectedByChannelId", { defaultValue: {} });
export const selectedChannelIdsStorage = storage.defineItem<string[]>(
  "local:selectedChannelIds",
  { defaultValue: [] },
);
export const lockOnMessageStorage = storage.defineItem<Message | null>(
  "local:lockOnMessage",
  { defaultValue: null },
);
export const lastBackgroundSearchMessageTimestampStorage =
  storage.defineItem<number>(
    "local:lastBackgroundSearchMessageTimestampStorage",
    { defaultValue: 0 },
  );

// ----------------------------------
// Message
// ----------------------------------
export const unreadMessagesStorage = storage.defineItem<Message[]>(
  "local:unreadMessages",
  { defaultValue: [] },
);
export const readByTsStorage = storage.defineItem<{
  [ts: string]: true;
}>("local:readMessages", { defaultValue: {} });
/**
 * messagesと取得済メッセージの既読状態などを考慮し、状態を更新したうえで、新規メッセージのリストを返却します
 */
export async function updateMessages(
  messages: Message[],
  option?: { forceUnread?: boolean },
): Promise<Message[]> {
  let uniqMessages = uniqBy(messages, (m) => m.ts);
  if (!option?.forceUnread) {
    const readByTs = await readByTsStorage.getValue();
    uniqMessages = uniqMessages.filter((x) => !(x.ts in readByTs));
  }

  const unreadMessages = await unreadMessagesStorage.getValue();
  const newMessages = uniqMessages.filter(
    (x) => !unreadMessages.find((um) => um.ts === x.ts),
  );
  if (newMessages.length === 0) {
    return [];
  }

  const newUnreadMessages = unreadMessages
    .concat(newMessages)
    .toSorted(sorter((x) => Number(x.ts), "desc"));
  await unreadMessagesStorage.setValue(newUnreadMessages);

  return newMessages;
}

// ----------------------------------
// Personalized
// ----------------------------------
export const lastMentionedUserMapStorage = storage.defineItem<
  Record<string, number>
>("local:lastMentionedUserMap", { defaultValue: {} });

export const lastUsedEmojiMapStorage = storage.defineItem<
  Record<string, number>
>("local:lastUsedEmojiMap", { defaultValue: {} });
export async function updateLastUsedEmojis(emojis: string[]) {
  const value = await lastUsedEmojiMapStorage.getValue();
  const now = DateTime.now().unix;

  const newMap = emojis
    .map((x) => ({ [x]: now }))
    .reduce((a, x) => ({ ...a, ...x }), {});

  lastUsedEmojiMapStorage.setValue({
    ...value,
    ...newMap,
  });
}

// ----------------------------------
// Settings
// ----------------------------------

// auth
export const clientIdStorage = storage.defineItem<string>("local:clientId");
export const clientSecretStorage =
  storage.defineItem<string>("local:clientSecret");

// search
export const crucialMessageConditionsStorage = storage.defineItem<string[]>(
  "local:crucialMessageConditionsStorage",
  { defaultValue: [] },
); // 改行区切り複数指定
export const searchIntervalMinutesStorage = storage.defineItem<number>(
  "local:searchIntervalMinutesStorage",
  { defaultValue: 5 },
);

// appearance
export const visibledButtonsStorage = storage.defineItem<string[]>(
  "local:visibledButtonStorage",
  { defaultValue: ["open-browser", "lock-on", "stock"] },
);
export const quickReactionEmojisStorage = storage.defineItem<string[]>(
  "local:quickReactionEmojisStorage",
  { defaultValue: [] },
); // 改行区切り複数指定
export const maxNumberOfEmojiSuggestionsStorage = storage.defineItem<number>(
  "local:maxNumberOfEmojiSuggestions",
  { defaultValue: 20 },
); // 隠しオプション(非公開)

// ----------------------------------
// Caches
// ----------------------------------
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
