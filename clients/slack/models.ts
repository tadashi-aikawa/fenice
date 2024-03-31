export type Block = SectionBlock | ImageBlock;

export interface SectionBlock {
  type: "section";
  text: SectionText;
}

export interface ImageBlock {
  type: "image";
  image_url: string;
  alt_text: string;
}

export type SectionText = MrkdwnSectionText;
interface MrkdwnSectionText {
  type: "mrkdwn";
  text: string;
}
