export interface AttachmentField {
  title: string;
  value: string;
  short: boolean;
}

export interface AttachmentMessageBlock {
  channel: string;
  message: {
    blocks: Block[];
  };
  ts: string;
}

export type Block = SectionBlock | ContextBlock | RichTextBlock | ActionsBlock;

export interface SectionBlock {
  block_id: string;
  type: "section";
  text?: SectionText;
  fields?: SectionText[];
}

export interface ContextBlock {
  block_id: string;
  type: "context";
  elements: ContextBlockElement[];
}

export interface RichTextBlock {
  block_id: string;
  type: "rich_text";
  elements: (
    | RichTextSectionItem
    | RichTextListItem
    | RichTextQuoteItem
    | RichTextPreformattedItem
  )[];
}

export interface ActionsBlock {
  block_id: string;
  type: "actions";
  // XXX: 今のところ対応予定はないのでelementsは適当
  elements: unknown[];
}

//---

export type SectionText = PlainSectionText | MrkdwnSectionText;
interface PlainSectionText {
  type: "plain_text";
  text: string;
}
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

//---

export interface RichTextListItem {
  type: "rich_text_list";
  indent: number; // 0から
  border: number;
  style: "bullet";
  elements: RichTextSectionItem[];
}

//---

export interface RichTextSectionItem {
  type: "rich_text_section";
  elements: (TextItem | LinkItem | UserItem | UsergroupItem | EmojiItem)[];
}

export interface RichTextQuoteItem {
  type: "rich_text_quote";
  elements: (TextItem | LinkItem | UserItem | UsergroupItem | EmojiItem)[];
}

export interface RichTextPreformattedItem {
  type: "rich_text_preformatted";
  border: number;
  elements: (TextItem | LinkItem)[];
}

//---

export interface TextItem {
  type: "text";
  text: string;
  style?: {
    bold?: boolean;
    code?: boolean;
    strike?: boolean;
  };
}
export interface LinkItem {
  type: "link";
  url: string;
  text?: string;
  style?: {
    bold?: boolean;
    code?: boolean;
    strike?: boolean;
  };
}
export interface UserItem {
  type: "user";
  user_id: string;
}
export interface UsergroupItem {
  type: "usergroup";
  usergroup_id: string;
}
export interface EmojiItem {
  type: "emoji";
  name: string;
  unicode?: string;
}
