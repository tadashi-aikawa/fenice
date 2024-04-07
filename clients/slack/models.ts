export type Block = SectionBlock | ImageBlock | ContextBlock | DividerBlock;

export interface SectionBlock {
  type: "section";
  text: SectionText;
}

export interface ImageBlock {
  type: "image";
  image_url: string;
  alt_text: string;
}

export interface ContextBlock {
  type: "context";
  elements: ContextBlockElement[];
}

export interface DividerBlock {
  type: "divider";
}

export type SectionText = MrkdwnSectionText;
interface MrkdwnSectionText {
  type: "mrkdwn";
  text: string;
}

type ContextBlockElement = ImageContextBlockElement | MrkdwnContextBlockElement;
interface ImageContextBlockElement {
  type: "image";
  image_url: string;
  alt_text: string;
}
interface MrkdwnContextBlockElement {
  type: "mrkdwn";
  text: string;
}

export interface User {
  id: string;
  name: string;
  real_name: string; // 日本語
  deleted: boolean;
  is_bot: boolean;
  is_app_user: boolean;
  is_restricted: boolean;
  is_ultra_restricted: boolean;
  profile: {
    title: string;
    image_24: string;
    image_32: string;
    image_48: string;
    image_72: string;
    image_192: string;
    image_512: string;
    image_1024: string;
  };
}
