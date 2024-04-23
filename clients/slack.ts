import { AsyncResult } from "owlelia";
import { RequestError, getRequest, postRequest } from "./slack/base";
import { PostBlock, Channel, Message, User, Usergroup } from "./slack/models";

type HasString<C> = C extends string ? true : false;

export async function getSearchMessages<C extends string | undefined>(args: {
  query: string;
  sort: "timestamp";
  cursor?: C;
  count?: number; // def: 20
  search_exclude_bots?: boolean; // undocumented: https://stackoverflow.com/questions/61939243/exclude-bot-users-from-slack-search-api-results
}) {
  return await getRequest<{
    ok: boolean;
    query: string;
    messages: {
      total: number;
      paging: HasString<C> extends true
        ? {
            count: number;
            total: number;
            next_cursor: string | ""; // 空文字はなしの意味
          }
        : {
            count: number;
            total: number;
            page: number; // 現在ページ
            pages: number; // ページ総数
          };
      matches: Message[];
    };
  }>({
    path: "/search.messages",
    query: args,
  });
}

export async function getEmojiList() {
  return await getRequest<{
    ok: boolean;
    emoji: { [name: string]: string };
    cache_ts: string;
  }>({
    path: "/emoji.list",
  });
}

export async function getUsersList(args: { cursor?: string }) {
  return await getRequest<{
    ok: boolean;
    offset?: string;
    members: User[];
    cache_ts: number;
    response_metadata: {
      next_cursor: string | "";
    };
  }>({
    path: "/users.list",
    query: args,
  });
}

export async function getUsergroupsList() {
  return await getRequest<{
    ok: boolean;
    usergroups: Usergroup[];
  }>({
    path: "/usergroups.list",
  });
}

export async function getConversationsList(args: {
  cursor?: string;
  exclude_archived?: boolean;
  limit?: number; // 1000以下
  types?: string;
}) {
  return await getRequest<{
    ok: boolean;
    channels: Channel[];
    response_metadata: {
      next_cursor: string | "";
    };
  }>({
    path: "/conversations.list",
    query: args,
  });
}

export async function getUsersConversations(args: {
  exclude_archived?: boolean;
  limit?: number; // 1000以下
  types?: string;
}) {
  return await getRequest<{
    ok: boolean;
    channels: Channel[];
  }>({
    path: "/users.conversations",
    query: args,
  });
}

export async function postChatPostMessage<R extends { ok: boolean }>(args: {
  channel: string;
  text: string;
  thread_ts?: string;
}): AsyncResult<R, RequestError>;
export async function postChatPostMessage<R extends { ok: boolean }>(args: {
  channel: string;
  blocks: PostBlock[];
  thread_ts?: string;
}): AsyncResult<R, RequestError>;
export async function postChatPostMessage<R extends { ok: boolean }>(
  args: {
    channel: string;
    thread_ts?: string;
  } & ({ text: string } | { blocks: PostBlock[] }),
): AsyncResult<R, RequestError> {
  return await postRequest<R>({
    path: "/chat.postMessage",
    json: {
      channel: args.channel,
      thread_ts: args.thread_ts,
      ...("text" in args ? { text: args.text } : { blocks: args.blocks }),
    },
  });
}

export async function postReactionsAdd(args: {
  channel: string;
  name: string;
  timestamp: string;
}) {
  const formData = new FormData();
  formData.append("channel", args.channel);
  formData.append("name", args.name);
  formData.append("timestamp", args.timestamp);

  return await postRequest<{
    ok: boolean;
  }>({
    path: "/reactions.add",
    formData,
  });
}

export async function postFilesUpload(args: { channel?: string; file: File }) {
  const formData = new FormData();
  if (args.channel) {
    formData.append("channel", args.channel);
  }
  formData.append("file", args.file);

  return await postRequest<{
    ok: boolean;
    file: {
      id: string;
      name: string;
      title: string;
      filetype: string;
      mimetype: string;
      permalink: string;
      thumb_64: string;
      thumb_80: string;
      thumb_160: string;
      thumb_360: string;
      thumb_360_h: string;
      thumb_360_w: string;
      thumb_video: string; // 動画だけ?
      url_private: string;
      url_private_download: string;
      user: string;
      user_team: string;
    };
  }>({
    path: "/files.upload",
    formData,
  });
}

export async function postOauthV2Access(args: {
  client_id: string;
  client_secret: string;
  grant_type: "refresh_token";
  refresh_token: string;
}) {
  const formData = new FormData();
  formData.append("client_id", args.client_id);
  formData.append("client_secret", args.client_secret);
  formData.append("grant_type", args.grant_type);
  formData.append("refresh_token", args.refresh_token);

  return await postRequest<{
    ok: boolean;
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>({
    path: "/oauth.v2.access",
    formData,
  });
}
