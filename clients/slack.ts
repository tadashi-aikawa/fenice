import {
  createGetDefaultHeaders,
  createPostDefaultHeaders,
  getRequest,
  postRequest,
} from "./slack/base";

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
    headers: await createGetDefaultHeaders(),
  });
}

export async function postChatPostMessage(args: {
  channel: string;
  text: string;
}) {
  return await postRequest<{
    ok: boolean;
  }>({
    path: "/chat.postMessage",
    json: {
      channel: args.channel,
      text: args.text,
    },
    headers: await createPostDefaultHeaders(),
  });
}
