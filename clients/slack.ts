import { AsyncResult, Result } from "owlelia";
import { RequestError, getRequest, postRequest } from "./slack/base";
import { Block } from "./slack/models";

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
    query: {
      exlude_archived: args.exclude_archived,
      limit: args.limit,
      types: args.types,
    },
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
