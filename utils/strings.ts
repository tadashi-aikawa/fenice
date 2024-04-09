import { Channel } from "@/clients/slack/models";
import { usersByIdCache, usersByNameCache } from "@/global-cache";

export function toDisplayChannelName(channel: Channel) {
  if (channel.is_im) {
    return `📬 ${usersByIdCache[channel.name]?.real_name}`;
  }
  if (channel.is_mpim) {
    const members = channel.name
      .replace("mpdm-", "")
      .replace(/-\d+$/, "")
      .split("--")
      .map((x) => usersByNameCache[x]?.real_name)
      .join(", ");
    return `🏠 ${members}`;
  }
  if (channel.is_private) {
    return `🔒 ${channel.name}`;
  }
  if (channel.is_channel) {
    return `#${channel.name}`;
  }

  return `🔒 ${channel.name}`;
}
