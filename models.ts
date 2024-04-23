import { Channel, Message } from "./clients/slack/models";

interface ImageResource {
  type: "image";
  blobUrl: string;
  url?: string;
  thumbnail?: string;
}
interface VideoResource {
  type: "video";
  blobUrl: string;
  url?: string;
  thumbnail?: string;
}
export type Resource = ImageResource | VideoResource;
export const isImageResource = (r: Resource): r is ImageResource =>
  r.type === "image";
export const isVideoResource = (r: Resource): r is VideoResource =>
  r.type === "video";

export type Dest = Channel | Message;
export const isChannel = (d: Dest | null): d is Channel =>
  d != null && !("channel" in d);
export const dest2channel = (d: Dest): Channel =>
  isChannel(d) ? d : d.channel;
