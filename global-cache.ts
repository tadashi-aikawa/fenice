import { AsyncResult, DateTime, err, ok } from "owlelia";
import { getConversationsList, getUserList } from "./clients/slack";
import { Channel, User } from "./clients/slack/models";
import {
  DEFAULT_CHANNELS_CACHE,
  DEFAULT_USERS_CACHE,
  channelsCacheStorage,
} from "./utils/storage";
import { RequestError } from "./clients/slack/base";

// ユーザーキャッシュ
export let usersByIdCache: { [id: string]: User } = {};
export async function clearUsersCaches() {
  usersByIdCache = {};
  await usersCacheStorage.setValue(DEFAULT_USERS_CACHE);
}
export async function refreshUsersCaches(): AsyncResult<
  { users: User[]; cacheTs: number },
  RequestError
> {
  let users: User[] = [];
  let cacheTs = DateTime.now().unix;
  let nextCursor = "";

  while (true) {
    const [res, error] = (await getUserList({ cursor: nextCursor })).unwrap();
    if (error) {
      error.message = `ユーザーキャッシュのリフレッシュに失敗しました。${error.message}`;
      return err(error);
    }

    users = users.concat(res.members);
    cacheTs = res.cache_ts;

    nextCursor = res.response_metadata.next_cursor;
    if (!nextCursor) {
      break;
    }
  }

  return ok({ users, cacheTs });
}

// channelキャッシュ
export let channelsByIdCache: { [id: string]: Channel } = {};
export async function clearChannelsCaches() {
  channelsByIdCache = {};
  await channelsCacheStorage.setValue(DEFAULT_CHANNELS_CACHE);
}
export async function refreshChannelsCaches(): AsyncResult<
  { channels: Channel[]; cacheTs: number },
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

  return ok({ channels, cacheTs: DateTime.now().unix });
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
}
