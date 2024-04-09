import { Block } from "./blockModels";

// TODO: Blockと統合したい。。
export type PostBlock = SectionBlock | ImageBlock | ContextBlock | DividerBlock;

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
  type: "mrkdwn" | "plain_text";
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

// API
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

export interface Message {
  iid: string; // ???
  team: string;
  channel: Channel;
  type: "message";
  user: string;
  username: string; // tadashi-aikawa
  ts: string;
  blocks?: Block[];
  text: string;
  permalink: string;
  no_reactions: boolean;
  attachments?: Attachment[];
}

export interface Channel {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean; // 単DM
  is_mpim: boolean; // 複数人DM
  is_shared: boolean;
  is_org_shared: boolean;
  is_ext_shared: boolean;
  is_private: boolean;
  is_archived: boolean;
}

export interface Attachment {
  author_icon: string;
  author_link: string;
  author_name: string;
  color: string;
  fallback: string;
  footer: string;
  footer_icon: string;
  id: number;
  // この下は関連ありそう
  mrkdwn_in: string[];
  pretext: string; // option?
  text: string; // option?
  from_url: string;

  image_url?: string;
  image_width?: number;
  image_height?: number;

  title?: string;
  service_name?: string;
  blocks?: Block[];
  message_blocks?: {
    channel: string;
    message: {
      blocks: Block[];
    };
    ts: string;
  }[];
}
