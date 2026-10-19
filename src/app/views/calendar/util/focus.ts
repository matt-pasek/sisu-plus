const SETTLE_MS = 300;

// A deleted note's block leaves the page a moment after its popover closes, which would drop focus to the body.
export const restoreFocus = (target: HTMLElement | null, fallback: HTMLElement | null): void => {
  target?.focus({ preventScroll: true });
  if (!fallback) return;
  window.setTimeout(() => {
    if (!target?.isConnected && document.activeElement === document.body) fallback.focus({ preventScroll: true });
  }, SETTLE_MS);
};
