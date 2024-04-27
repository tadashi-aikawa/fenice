import { test, expect } from "bun:test";
import { doSinglePatternMatching } from "./strings";

test.each([
  ["aa bb cc", /a+/g, ["aa"]],
  ["@aaa @bbb @ccc", /@[^ ]+/g, ["@aaa", "@bbb", "@ccc"]],
  ["@aaa @bbb\n@ccc", /@[^ \n]+/g, ["@aaa", "@bbb", "@ccc"]],
])(
  `doSinglePatternMatching("%s", "%s")`,
  (
    text: string,
    pattern: RegExp,
    expected: ReturnType<typeof doSinglePatternMatching>,
  ) => {
    expect(doSinglePatternMatching(text, pattern)).toEqual(expected);
  },
);
