import { AsyncResult, err, ok } from "owlelia";
import {
  getConversationsList,
  getEmojiList,
  getUsersList,
  getUsergroupsList,
} from "./clients/slack";
import { Channel, User, Usergroup } from "./clients/slack/models";
import {
  DEFAULT_CHANNELS_CACHE,
  DEFAULT_EMOJI_CACHE,
  DEFAULT_USERGROUPS_CACHE,
  DEFAULT_USERS_CACHE,
} from "./utils/storage";
import { RequestError } from "./clients/slack/base";

// ユーザーキャッシュ
export let usersByIdCache: { [id: string]: User } = {};
export let usersByNameCache: { [name: string]: User } = {}; // アルファベット名
export async function clearUsersCaches() {
  usersByIdCache = {};
  usersByNameCache = {};
  await usersCacheStorage.setValue(DEFAULT_USERS_CACHE);
}
export async function refreshAllUserCaches(): AsyncResult<
  User[],
  RequestError
> {
  let users: User[] = [];
  let nextCursor = "";

  while (true) {
    const [res, error] = (await getUsersList({ cursor: nextCursor })).unwrap();
    if (error) {
      error.message = `全ユーザーの取得に失敗しました。${error.message}`;
      return err(error);
    }

    users = users.concat(res.members);

    nextCursor = res.response_metadata.next_cursor;
    if (!nextCursor) {
      break;
    }
  }

  return ok(users);
}

// ユーザーグループキャッシュ
export let usergroupsByIdCache: { [id: string]: Usergroup } = {};
export async function clearUsergroupsCaches() {
  usergroupsByIdCache = {};
  await usergroupsCacheStorage.setValue(DEFAULT_USERGROUPS_CACHE);
}
export async function refreshAllUsergroupsCaches(): AsyncResult<
  Usergroup[],
  RequestError
> {
  const [res, error] = (await getUsergroupsList()).unwrap();
  if (error) {
    error.message = `ユーザーグループのリフレッシュに失敗しました。${error.message}`;
    return err(error);
  }

  return ok(res.usergroups);
}

// channelキャッシュ
export let channelsByIdCache: { [id: string]: Channel } = {};
export async function clearChannelsCaches() {
  channelsByIdCache = {};
  await channelsCacheStorage.setValue(DEFAULT_CHANNELS_CACHE);
}
export async function refreshChannelsCaches(): AsyncResult<
  Channel[],
  RequestError
> {
  let channels: Channel[] = [];
  let nextCursor = "";

  while (true) {
    const [res, error] = (
      await getConversationsList({
        cursor: nextCursor,
        limit: 1000,
        exclude_archived: true,
        types: "public_channel,private_channel",
      })
    ).unwrap();
    if (error) {
      error.message = `Channelキャッシュのリフレッシュに失敗しました。${error.message}`;
      return err(error);
    }

    channels = channels.concat(res.channels);

    nextCursor = res.response_metadata.next_cursor;
    if (!nextCursor) {
      break;
    }
  }

  return ok(channels);
}

// emojiキャッシュ
export let emojiCache: { [name: string]: string } = {};
export async function clearEmojiCaches() {
  emojiCache = {};
  await emojiCacheStorage.setValue(DEFAULT_EMOJI_CACHE);
}
export async function refreshEmojiCaches(): AsyncResult<
  { [name: string]: string },
  RequestError
> {
  const [res, error] = (await getEmojiList()).unwrap();
  if (error) {
    error.message = `絵文字キャッシュのリフレッシュに失敗しました。${error.message}`;
    return err(error);
  }

  return ok(res.emoji);
}
export function getEmojiUrl(name: string): string {
  const resource = emojiCache[name];
  if (resource?.startsWith("alias:")) {
    return emojiCache[resource.replace("alias:", "")];
  }

  return resource;
}

// 初期化
export async function initGlobalCaches() {
  usersByIdCache = keyBy(
    (await usersCacheStorage.getValue()).members,
    (x) => x.id,
  );
  usersByNameCache = keyBy(
    (await usersCacheStorage.getValue()).members,
    (x) => x.name,
  );
  usersCacheStorage.watch((newVal) => {
    usersByIdCache = keyBy(newVal.members, (x) => x.id);
    usersByNameCache = keyBy(newVal.members, (x) => x.name);
  });

  usergroupsByIdCache = keyBy(
    (await usergroupsCacheStorage.getValue()).usergroups,
    (x) => x.id,
  );
  usergroupsCacheStorage.watch((newVal) => {
    usergroupsByIdCache = keyBy(newVal.usergroups, (x) => x.id);
  });

  channelsByIdCache = keyBy(
    (await channelsCacheStorage.getValue()).channels,
    (x) => x.id,
  );
  channelsCacheStorage.watch((newVal) => {
    channelsByIdCache = keyBy(newVal.channels, (x) => x.id);
  });

  emojiCache = (await emojiCacheStorage.getValue()).emoji;
  emojiCacheStorage.watch((newVal) => {
    emojiCache = newVal.emoji;
  });
}
