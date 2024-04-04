import { AsyncResult } from "owlelia";
import { RequestError, getRequest, postRequest } from "./slack/base";
import { Block } from "./slack/models";

export async function getSearchMessages(args: {
  query: string;
  sort: "timestamp";
  count?: number; // def: 20
}) {
  return await getRequest<{
    ok: boolean;
    query: string;
    messages: {
      total: number;
      paging: {
        count: number;
        total: number;
        page: number; // 現在ページ
        pages: number; // ページ総数
      };
      matches: {
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
      }[];
    };
  }>({
    path: "/search.messages",
    query: args,
  });
}

export async function getUsersConversations(args: {
  exclude_archived?: boolean;
  limit?: number;
  types?: string;
}) {
  return await getRequest<{
    ok: boolean;
    channels: {
      id: string;
      name: string;
      is_group: boolean;
      is_im: boolean;
      is_mpim: boolean;
      is_private: boolean;
      is_archived: boolean;
    }[];
  }>({
    path: "/users.conversations",
    query: args,
  });
}

export async function postChatPostMessage<R extends { ok: boolean }>(args: {
  channel: string;
  text: string;
}): AsyncResult<R, RequestError>;
export async function postChatPostMessage<R extends { ok: boolean }>(args: {
  channel: string;
  blocks: Block[];
}): AsyncResult<R, RequestError>;
export async function postChatPostMessage<R extends { ok: boolean }>(
  args: {
    channel: string;
  } & ({ text: string } | { blocks: Block[] }),
): AsyncResult<R, RequestError> {
  return await postRequest<R>({
    path: "/chat.postMessage",
    json: {
      channel: args.channel,
      ...("text" in args ? { text: args.text } : { blocks: args.blocks }),
    },
  });
}

export async function postFilesUpload(args: { channel: string; file: File }) {
  const formData = new FormData();
  formData.append("channel", args.channel);
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
