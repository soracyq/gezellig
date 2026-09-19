import { useEffect } from "react";
import { Platform } from "react-native";

// Text inputs handle their own Enter events. Buttons and links keep native
// keyboard activation; modal dialogs and IME composition must not advance Review.
export function useReviewEnter(enabled: boolean, advance: () => void) {
  useEffect(() => {
    if (!enabled || Platform.OS !== "web" || typeof document === "undefined")
      return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== "Enter" ||
        event.repeat ||
        event.isComposing ||
        event.keyCode === 229 ||
        event.defaultPrevented ||
        event.shiftKey ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
      )
        return;
      const target = event.target;
      if (document.querySelector('[aria-modal="true"], [role="dialog"]'))
        return;
      if (
        target instanceof Element &&
        target.closest(
          'input, textarea, button, a, [role="button"], [role="link"], [contenteditable="true"]',
        )
      )
        return;
      event.preventDefault();
      advance();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled, advance]);
}
