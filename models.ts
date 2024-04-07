export interface Channel {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  is_mpim: boolean;
  is_shared: boolean;
  is_org_shared: boolean;
  is_ext_shared: boolean;
  is_private: boolean;
  is_archived: boolean;
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
