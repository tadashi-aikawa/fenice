export function hasModifierKeyPressed(event: KeyboardEvent): boolean {
  return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

export function hasModifierKeyPressedOnly(
  event: KeyboardEvent,
  key: "alt" | "ctrl" | "meta" | "shift",
): boolean {
  switch (key) {
    case "alt":
      return (
        event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey
      );
    case "ctrl":
      return (
        !event.altKey && event.ctrlKey && !event.metaKey && !event.shiftKey
      );
    case "meta":
      return (
        !event.altKey && !event.ctrlKey && event.metaKey && !event.shiftKey
      );
    case "shift":
      return (
        !event.altKey && !event.ctrlKey && !event.metaKey && event.shiftKey
      );
    default:
      throw new ExhaustiveError(key);
  }
}
