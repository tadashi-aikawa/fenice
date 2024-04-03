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

export function smartLineBreakSplit(text: string): string[] {
  return text.split("\n").filter((x) => x);
}
