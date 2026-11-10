/** Focus a visible form control/heading with the existing sticky-header scroll offset. */
export function focusAndReveal(control: HTMLElement | null) {
  if (!control) return;
  control.focus({ preventScroll: true });
  const header = document.querySelector<HTMLElement>("[data-form-header]");
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  const anchor = control.closest<HTMLElement>("[data-field], label") ?? control;
  window.scrollTo({
    top: Math.max(0, window.scrollY + anchor.getBoundingClientRect().top - headerHeight - 16),
    behavior: "instant",
  });
}
