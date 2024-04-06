import { getSearchMessages } from "./clients/slack";

export interface Channel {
  id: string;
  name: string;
}

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

export type Message = NonNullable<
  Awaited<ReturnType<typeof getSearchMessages>>["_ok"]
>["messages"]["matches"][number];
