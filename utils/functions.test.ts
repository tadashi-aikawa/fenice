import { expect, test } from "bun:test";
import { deepEquals } from "./functions";

test.each([
  [[1, 2], [1, 2], true],
  [{ a: 1, b: 1 }, { a: 1, b: 1 }, true],
])(
  `deepEquals("%o", "%o")`,
  (
    one: Parameters<typeof deepEquals>[0],
    other: Parameters<typeof deepEquals>[1],
    expected: ReturnType<typeof deepEquals>,
  ) => {
    expect(deepEquals(one, other)).toEqual(expected);
  },
);
