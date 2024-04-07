import { AsyncResult, err, ok } from "owlelia";
import {
  getConversationsList,
  getEmojiList,
  getUserList,
} from "./clients/slack";
import { Channel, User } from "./clients/slack/models";
import {
  DEFAULT_CHANNELS_CACHE,
  DEFAULT_EMOJI_CACHE,
  DEFAULT_USERS_CACHE,
  channelsCacheStorage,
  emojiCacheStorage,
} from "./utils/storage";
import { RequestError } from "./clients/slack/base";

// ユーザーキャッシュ
export let usersByIdCache: { [id: string]: User } = {};
export async function clearUsersCaches() {
  usersByIdCache = {};
  await usersCacheStorage.setValue(DEFAULT_USERS_CACHE);
}
export async function refreshUsersCaches(): AsyncResult<User[], RequestError> {
  let users: User[] = [];
  let nextCursor = "";

  while (true) {
    const [res, error] = (await getUserList({ cursor: nextCursor })).unwrap();
    if (error) {
      error.message = `ユーザーキャッシュのリフレッシュに失敗しました。${error.message}`;
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

// 初期化
export async function initGlobalCaches() {
  usersByIdCache = keyBy(
    (await usersCacheStorage.getValue()).members,
    (x) => x.id,
  );
  usersCacheStorage.watch((newVal) => {
    usersByIdCache = keyBy(newVal.members, (x) => x.id);
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