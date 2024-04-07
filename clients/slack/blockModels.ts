export interface Block {
  block_id: string;
  type: "rich_text";
  elements: (
    | RichTextSectionItem
    | RichTextListItem
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
  elements: (TextItem | LinkItem | UserItem | EmojiItem)[];
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
}
export interface LinkItem {
  type: "link";
  url: string;
  text?: string;
}
export interface UserItem {
  type: "user";
  user_id: string;
}
export interface EmojiItem {
  type: "emoji";
  name: string;
  unicode?: string;
}
