import { getSearchMessages } from "./clients/slack";

export interface Channel {
  id: string;
  name: string;
}

export type Message = NonNullable<
  Awaited<ReturnType<typeof getSearchMessages>>["_ok"]
>["messages"]["matches"][number];
