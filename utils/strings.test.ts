import { test, expect } from "bun:test";
import { doSinglePatternMatching, getQueriesFromUrl } from "./strings";

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

test.each([
  ["http://hoge.com?a=1&b=2", "a", "1"],
  ["http://hoge.com?a=1&b=2", "b", "2"],
  ["http://hoge.com", "b", null],
])(
  `getQueriesFromUrl("%s", "%s")`,
  (
    url: string,
    query: string,
    expected: ReturnType<typeof getQueriesFromUrl>,
  ) => {
    expect(getQueriesFromUrl(url, query)).toEqual(expected);
  },
);
