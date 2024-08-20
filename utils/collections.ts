export function sorter<T, U extends number | string>(
  toOrdered: (t: T) => U,
  order: "asc" | "desc" = "asc",
) {
  return (a: T, b: T) =>
    order === "asc"
      ? toOrdered(a) > toOrdered(b)
        ? 1
        : toOrdered(b) > toOrdered(a)
          ? -1
          : 0
      : toOrdered(a) < toOrdered(b)
        ? 1
        : toOrdered(b) < toOrdered(a)
          ? -1
          : 0;
}

export function uniqBy<T>(values: T[], fn: (x: T) => string | number): T[] {
  const m = new Map<string | number, T>();
  values.forEach((x) => {
    const k = fn(x);
    if (!m.has(k)) {
      m.set(k, x);
    }
  });
  return Array.from(m.values());
}

export const count = (values: string[]): { [value: string]: number } => {
  const ret: { [value: string]: number } = {};
  for (const value of values) {
    if (ret[value]) {
      ret[value]++;
    } else {
      ret[value] = 1;
    }
  }
  return ret;
};

export function smartLineBreakSplit(text: string): string[] {
  return text.split("\n").filter((x) => x);
}

export const keyBy = <T>(
  values: T[],
  toKey: (t: T) => string,
): { [key: string]: T } =>
  values.reduce(
    (prev, cur, _1, _2, k = toKey(cur)) => ((prev[k] = cur), prev),
    {} as { [key: string]: T },
  );

/**
 * nullableな値がnull/undefinedでないことを確認し、型を保証します
 */
export function isPresent<T>(arg: T | null | undefined): arg is T {
  return arg != null;
}
