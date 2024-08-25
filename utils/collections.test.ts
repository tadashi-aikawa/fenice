import { expect, test } from "bun:test";
import {
  countBy,
  max,
  maxBy,
  min,
  minBy,
  smartLineBreakSplit,
} from "./collections";

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

test.each([
  [[3, 1, 2], 3],
  [[1, 2, 3], 3],
  [[3, 2, 1], 3],
])(
  `max("%s")`,
  (numbers: Parameters<typeof max>[0], expected: ReturnType<typeof max>) => {
    expect(max(numbers)).toEqual(expected);
  },
);

test.each([
  [[3, 1, 2], 1],
  [[1, 2, 3], 1],
  [[3, 2, 1], 1],
])(
  `min("%s")`,
  (numbers: Parameters<typeof min>[0], expected: ReturnType<typeof min>) => {
    expect(min(numbers)).toEqual(expected);
  },
);

test.each([
  [[13, 22, 31], (x: any) => x, 31],
  [[13, 22, 31], (x: any) => x % 10, 13],
])(
  `maxBy("%s")`,
  (
    numbers: Parameters<typeof maxBy>[0],
    toNum: Parameters<typeof maxBy>[1],
    expected: ReturnType<typeof maxBy>,
  ) => {
    expect(maxBy(numbers, toNum)).toEqual(expected);
  },
);

test.each([
  [[13, 22, 31], (x: any) => x, 13],
  [[13, 22, 31], (x: any) => x % 10, 31],
])(
  `minBy("%s")`,
  (
    numbers: Parameters<typeof minBy>[0],
    toNum: Parameters<typeof minBy>[1],
    expected: ReturnType<typeof minBy>,
  ) => {
    expect(minBy(numbers, toNum)).toEqual(expected);
  },
);

test.each([
  [
    [10, 12, 20, 30, 33],
    (x: any) => String(x % 10),
    { "0": 3, "2": 1, "3": 1 },
  ],
])(
  `countBy`,
  (
    values: Parameters<typeof countBy>[0],
    fn: Parameters<typeof countBy>[1],
    expected: ReturnType<typeof countBy>,
  ) => {
    expect(countBy(values, fn)).toEqual(expected);
  },
);
