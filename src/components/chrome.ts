/** Page furniture shared by every screen: letterhead, progress, stamps and icons. */

import { DEPARTMENT, GAME_NOTICE, TAGLINE } from '../content/copy';
import { h, svg } from './dom';
import { SEAL_SVG } from './seal';

export const ICON_CHECKBOX = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M8 12.5l3 3 5-6.5"/></svg>`;
export const ICON_TICK = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12.5l3.5 3.5 7.5-8.5"/></svg>`;

export function letterhead(): HTMLElement {
  const [first, second] = ['The Department of', 'Human Verification'];
  return h(
    'header',
    { class: 'letterhead' },
    svg(SEAL_SVG),
    h(
      'div',
      {},
      h('p', { class: 'letterhead-title' }, h('span', {}, first), h('span', {}, second), h('span', { class: 'visually-hidden' }, `${DEPARTMENT}.`)),
      h('div', { class: 'letterhead-rule', 'aria-hidden': 'true' }),
      h('p', { class: 'tagline' }, TAGLINE),
    ),
  );
}

export function footer(onAbout: () => void): HTMLElement {
  return h(
    'footer',
    { class: 'footer' },
    h('p', {}, GAME_NOTICE),
    h('p', {}, h('button', { type: 'button', class: 'link-button', onclick: onAbout }, 'About this game'), ' · No camera · Nothing leaves your device'),
  );
}

export function progress(current: number, total: number): HTMLElement {
  const dots = h('ol', { class: 'dots', 'aria-hidden': 'true' });
  for (let i = 0; i < total; i++) dots.append(h('li', { class: `dot${i < current ? ' done' : i === current ? ' current' : ''}` }));
  return h(
    'div',
    { class: 'progress' },
    h('span', { 'aria-hidden': 'true' }, `Step ${current + 1} of ${total}`),
    h('span', { class: 'visually-hidden' }, `Assessment ${current + 1} of ${total}.`),
    dots,
  );
}

export function stamp(text: string, kind: string, animate: boolean): HTMLElement {
  return h('span', { class: `stamp ${kind}${animate ? ' animate' : ''}` }, text);
}

export function button(label: string, onclick: (event: Event) => void, options: { secondary?: boolean; wide?: boolean; icon?: string } = {}): HTMLButtonElement {
  const el = h('button', { type: 'button', class: `button${options.secondary ? ' secondary' : ''}${options.wide ? ' wide' : ''}`, onclick });
  if (options.icon) el.append(svg(options.icon));
  el.append(label);
  return el;
}
