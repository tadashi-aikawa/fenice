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
