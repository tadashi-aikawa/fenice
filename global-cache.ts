import { AsyncResult, DateTime, err, ok } from "owlelia";
import { getUserList } from "./clients/slack";
import { User } from "./clients/slack/models";
import { DEFAULT_USERS_CACHE } from "./utils/storage";
import { RequestError } from "./clients/slack/base";

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
