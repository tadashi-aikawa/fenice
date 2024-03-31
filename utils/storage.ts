export const clientIdStorage = storage.defineItem<string>("local:clientId");
export const clientSecretStorage =
  storage.defineItem<string>("local:clientSecret");
export const accessTokenStorage =
  storage.defineItem<string>("local:accessToken");
export const lastSelectedByChannelId = storage.defineItem<
  Record<string, number>
>("local:lastSelectedByChannelId", { defaultValue: {} });
