import { DateTime } from "owlelia";

export function ts2display(ts: string): string {
  const timestamp = Number(ts);
  return DateTime.of(timestamp).displayDateTime;
}
