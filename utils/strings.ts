import * as emoji from "node-emoji";

export function name2emoji(name: string): string | undefined {
  return emoji.get(name) ?? fallbackEmojiMap[name];
}

export function getUnicodeEmojis(): string[] {
  return emoji.search("").map((x) => x.name);
}

export function toBrowserUrl(permalink: string): string {
  return permalink.replace("/archives", "/messages");
}

export function getQueriesFromUrl(url: string, query: string): string | null {
  const params = new URL(url).searchParams;
  return params.get(query);
}

/**
 * 1種類のパターンでパターンマッチした結果を文字列のリストで取得します
 */
export function doSinglePatternMatching(
  text: string,
  pattern: RegExp,
): string[] {
  return Array.from(text.matchAll(pattern)).map((x) => x[0]);
}

// Feniceで対応できなかった絵文字を気合でmappingしていく
export const fallbackEmojiMap = {
  cut_of_meat: "🥩",
  bow: "🙇",
  "man-bowing": "🙇‍♂️",
  "woman-bowing": "🙇‍♀️",
} as Record<string, string>;

export function escapeMrkdwn(str: string): string {
  return str
    .replaceAll(/&/g, "&amp;")
    .replaceAll(/>/g, "&gt;")
    .replaceAll(/</g, "&lt;");
}

export function unescapeMrkdwn(str: string): string {
  return str
    .replaceAll(/&amp;/g, "&")
    .replaceAll(/&gt;/g, ">")
    .replaceAll(/&lt;/g, "<");
}
