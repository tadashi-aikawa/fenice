import { Message } from "@/models";

export const accessTokenStorage =
  storage.defineItem<string>("local:accessToken");
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

// Settings
export const clientIdStorage = storage.defineItem<string>("local:clientId");
export const clientSecretStorage =
  storage.defineItem<string>("local:clientSecret");
export const crucialMessageConditionsStorage = storage.defineItem<string[]>(
  "local:crucialMessageConditionsStorage",
  { defaultValue: [] },
); // 改行区切り複数指定
