import { AsyncNullable, DateTime } from "owlelia";
import { RequestError } from "@/clients/slack/base";
import {
  refreshAllUserCaches,
  refreshAllUsergroupsCaches,
  refreshChannelsCaches,
  refreshEmojiCaches,
} from "@/global-cache";

export function useCache() {
  const loadingCache = ref(false);
  const loadingCacheMessage = ref("");

  const refreshUsersCache = async (): AsyncNullable<RequestError> => {
    loadingCache.value = true;
    loadingCacheMessage.value =
      "ユーザーキャッシュをリフレッシュしています。この処理はしばらくかかりますのでこのままお待ちください。";
    const [members, err] = (await refreshAllUserCaches()).unwrap();
    loadingCache.value = false;
    if (err) {
      return err;
    }

    await usersCacheStorage.setValue({
      updated: DateTime.now().unix,
      members,
    });
  };

  const refreshUsergroupsCache = async (): AsyncNullable<RequestError> => {
    loadingCache.value = true;
    loadingCacheMessage.value =
      "ユーザーグループキャッシュをリフレッシュしています。この処理はしばらくかかりますのでこのままお待ちください。";
    const [usergroups, err] = (await refreshAllUsergroupsCaches()).unwrap();
    loadingCache.value = false;
    if (err) {
      return err;
    }

    await usergroupsCacheStorage.setValue({
      updated: DateTime.now().unix,
      usergroups,
    });
  };

  const refreshChannelsCache = async (): AsyncNullable<RequestError> => {
    loadingCache.value = true;
    loadingCacheMessage.value =
      "Channelキャッシュをリフレッシュしています。この処理はしばらくかかりますのでこのままお待ちください。";
    const [channels, err] = (await refreshChannelsCaches()).unwrap();
    loadingCache.value = false;
    if (err) {
      return err;
    }

    await channelsCacheStorage.setValue({
      updated: DateTime.now().unix,
      channels,
    });
  };

  const refreshEmojiCache = async (): AsyncNullable<RequestError> => {
    loadingCache.value = true;
    loadingCacheMessage.value = "絵文字キャッシュをリフレッシュしています。";
    const [emoji, err] = (await refreshEmojiCaches()).unwrap();
    loadingCache.value = false;
    if (err) {
      return err;
    }

    await emojiCacheStorage.setValue({
      updated: DateTime.now().unix,
      emoji,
    });
  };

  return {
    loadingCache,
    loadingCacheMessage,
    refreshUsersCache,
    refreshUsergroupsCache,
    refreshChannelsCache,
    refreshEmojiCache,
  };
}
