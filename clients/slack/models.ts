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

export interface Message {
  iid: string; // ???
  team: string;
  channel: {
    id: string;
    is_channel: boolean;
    is_group: boolean;
    is_im: boolean;
    is_mpim: boolean;
    is_shared: boolean;
    is_org_shared: boolean;
    is_ext_shared: boolean;
    is_private: boolean;
  };
  type: "message";
  user: string;
  username: string; // tadashi-aikawa
  ts: string;
  blocks?: Block[];
  text: string;
  permalink: string;
  no_reactions: boolean;
  attachments?: {
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
    pretext: string;
    text: string;
  }[];
}
