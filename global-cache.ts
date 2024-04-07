import { User } from "./clients/slack/models";
import { DEFAULT_USERS_CACHE } from "./utils/storage";

export let usersByIdCache: { [id: string]: User } = {};

export async function initGlobalCaches() {
  usersByIdCache = keyBy(
    (await usersCacheStorage.getValue()).members,
    (x) => x.id,
  );

  usersCacheStorage.watch((newVal) => {
    usersByIdCache = keyBy(newVal.members, (x) => x.id);
  });
}

export async function clearGlobalCaches() {
  usersByIdCache = {};
  await usersCacheStorage.setValue(DEFAULT_USERS_CACHE);
}
