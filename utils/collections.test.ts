import { test, expect } from "bun:test";
import { smartLineBreakSplit } from "./collections";

test.each([
  ["", []],
  ["a", ["a"]],
  ["a\nb", ["a", "b"]],
  ["\n", []],
])(
  `smartLineBreakSplit("%s")`,
  (text: string, expected: ReturnType<typeof smartLineBreakSplit>) => {
    expect(smartLineBreakSplit(text)).toEqual(expected);
  },
);
