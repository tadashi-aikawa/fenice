export function deepEquals(one: any, other: any): boolean {
  return JSON.stringify(one) === JSON.stringify(other);
}
