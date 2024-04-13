export type Block = SectionBlock | RichTextBlock;

export interface SectionBlock {
  block_id: string;
  type: "section";
  text: {
    text: string;
    type: "mrkdwn";
    verbatim: boolean;
  };
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
  elements: TextItem[];
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
