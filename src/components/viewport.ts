/** Viewport-sized reading pages. Native form elements stay in the same DOM. */
import { button } from './chrome';
import { h } from './dom';

const cleanups = new WeakMap<HTMLElement, () => void>();

export function disposePages(container: HTMLElement): void {
  for (const pager of container.querySelectorAll<HTMLElement>('.viewport-pager')) cleanups.get(pager)?.();
}

export function pagedView(content: HTMLElement): HTMLElement {
  let page = 0;
  let pages = 1;
  let previousOffset = 0;
  let scheduled = 0;
  const flow = h('div', { class: 'page-flow' }, content);
  const frame = h('div', { class: 'page-window' }, flow);
  const counter = h('span', { class: 'page-counter', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const previous = button('Previous page', () => go(page - 1), { secondary: true });
  const next = button('Next page', () => go(page + 1), { secondary: true });
  const controls = h('nav', { class: 'page-controls', 'aria-label': 'Screen pages' }, previous, counter, next);
  const root = h('div', { class: 'viewport-pager' }, frame, controls);
  const stride = () => frame.clientWidth + Number.parseFloat(getComputedStyle(flow).columnGap);

  function go(index: number): void {
    // Focus may arrive immediately after opening a screen or expanding credits.
    // Measure now as well as on resize so it can reveal newly created pages.
    if (frame.clientWidth && frame.clientHeight) {
      pages = Math.max(1, Math.ceil((frame.scrollWidth + Number.parseFloat(getComputedStyle(flow).columnGap) - 1) / stride()));
    }
    page = Math.max(0, Math.min(pages - 1, index));
    const offset = page * stride();
    if (Math.abs(frame.scrollLeft - offset) > 1) frame.scrollLeft = offset;
    previousOffset = frame.scrollLeft;
    previous.disabled = page === 0;
    next.disabled = page === pages - 1;
    counter.textContent = `Page ${page + 1} of ${pages}`;
    controls.classList.toggle('single-page', pages === 1);
    root.dataset.page = String(page + 1);
    root.dataset.pages = String(pages);
  }

  function measure(): void {
    cancelAnimationFrame(scheduled);
    scheduled = requestAnimationFrame(() => {
      if (!root.isConnected || !frame.clientWidth || !frame.clientHeight) return;
      pages = Math.max(1, Math.ceil((frame.scrollWidth + Number.parseFloat(getComputedStyle(flow).columnGap) - 1) / stride()));
      go(page);
    });
  }

  // Keyboard focus and browser accessibility navigation also turn the page.
  frame.addEventListener('focusin', (event) => {
    const target = event.target as HTMLElement;
    const left = target.getBoundingClientRect().left - frame.getBoundingClientRect().left + frame.scrollLeft;
    go(Math.floor((left + 1) / stride()));
  });
  frame.addEventListener('scroll', () => {
    const offset = frame.scrollLeft;
    if (Math.abs(offset - previousOffset) < 1) return;
    const index = offset > previousOffset ? Math.ceil(offset / stride()) : Math.floor(offset / stride());
    go(index);
  });
  const resize = new ResizeObserver(measure);
  resize.observe(frame);
  const changes = new MutationObserver(measure);
  changes.observe(content, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['open', 'hidden'] });
  void document.fonts.ready.then(measure);
  cleanups.set(root, () => { cancelAnimationFrame(scheduled); resize.disconnect(); changes.disconnect(); });
  measure();
  return root;
}

/** Explanations and other long reading material use the same page controls. */
export function readingDialog(title: string, content: HTMLElement): HTMLDialogElement {
  const heading = h('h2', { tabindex: -1 }, title);
  const close = button('Close', () => dialog.close(), { secondary: true });
  const dialog = h('dialog', { class: 'about reading-dialog', 'aria-label': title },
    pagedView(h('div', { class: 'about-body' }, heading, content)),
    h('div', { class: 'dialog-actions' }, close),
  );
  dialog.addEventListener('close', () => { disposePages(dialog); dialog.remove(); });
  return dialog;
}
