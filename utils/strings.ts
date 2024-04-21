import { Channel } from "@/clients/slack/models";
import { usersByIdCache, usersByNameCache } from "@/global-cache";

import * as emoji from "node-emoji";

export function toDisplayChannelName(channel: Channel | undefined) {
  if (!channel) {
    return "❓Unknown channel";
  }

  if (channel.is_im) {
    return `📬${usersByIdCache[channel.name]?.real_name}`;
  }
  if (channel.is_mpim) {
    const members = channel.name
      .replace("mpdm-", "")
      .replace(/-\d+$/, "")
      .split("--")
      .map((x) => usersByNameCache[x]?.real_name)
      .join(", ");
    return `🏠${members}`;
  }

  let channelName = channel.name;
  if (channel.is_private) {
    channelName = `🔒${channelName}`;
  }
  if (channel.is_channel) {
    channelName = `#${channelName}`;
  }
  if (channel.is_archived) {
    channelName = `🧊${channelName}`;
  }

  return channelName;
}

export function name2emoji(name: string): string | undefined {
  return emoji.get(name) ?? fallbackEmojiMap[name];
}

export function toBrowserUrl(permalink: string): string {
  return permalink.replace("/archives", "/messages");
}

// Feniceで対応できなかった絵文字を気合でmappingしていく
const fallbackEmojiMap = {
  cut_of_meat: "🥩",
  bow: "🙇",
  "man-bowing": "🙇‍♂️",
  "woman-bowing": "🙇‍♀️",
} as Record<string, string>;
