/**
 * Bộ dựng giao diện tối giản.
 *
 * `html` là template tag TỰ THOÁT chuỗi. Bất cứ thứ gì muốn chèn nguyên markup phải đi qua
 * `raw()` — nên chữ người dùng gõ trong trình soạn UGC không bao giờ trở thành thẻ HTML.
 */

import { icon as iconMarkup, starIcon as starMarkup } from 'wnd/icons.js';
import { artSvg, placeholderArt } from 'wnd/art.js';

class Raw {
  constructor(value) { this.value = value; }
  toString() { return this.value; }
}

export const raw = (value) => new Raw(value == null ? '' : String(value));

export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function part(v) {
  if (v == null || v === false || v === true) return '';
  if (v instanceof Raw) return v.value;
  if (Array.isArray(v)) return v.map(part).join('');
  return esc(v);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i += 1) out += part(values[i]) + strings[i + 1];
  return raw(out);
}

/* ---------------------------------------------------------------------- DOM */

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function mount(el, content) {
  el.innerHTML = part(content);
  return el;
}

/** Uỷ quyền sự kiện — sống sót qua mọi lần render lại. */
export function on(root, event, selector, handler) {
  root.addEventListener(event, (e) => {
    const target = e.target instanceof Element ? e.target.closest(selector) : null;
    if (target && root.contains(target)) handler(e, target);
  });
}

/* --------------------------------------------------------------- nguyên tố */

export const icon = (name, cls = '') => raw(iconMarkup(name, cls));
export const art = (opts) => raw(artSvg(opts));
export const artPlaceholder = (label) => raw(placeholderArt(label));

export function attrs(map) {
  const out = Object.entries(map)
    .filter(([, v]) => v != null && v !== false)
    .map(([k, v]) => (v === true ? k : `${k}="${esc(v)}"`))
    .join(' ');
  return raw(out);
}

export function btn(label, o = {}) {
  const kind = o.kind || 'secondary';
  const cls = ['wn-btn', `wn-btn--${kind}`, o.block && 'wn-btn--block', o.sm && 'wn-btn--sm', o.cls]
    .filter(Boolean).join(' ');
  return html`<button type="button" class="${cls}" ${attrs({
    'data-act': o.act, 'data-arg': o.arg, disabled: o.disabled,
    'aria-label': o.ariaLabel, title: o.title,
  })}>${o.icon ? icon(o.icon) : ''}${label}</button>`;
}

export function iconBtn(name, o = {}) {
  return html`<button type="button" class="wn-icobtn ${o.cls || ''}" ${attrs({
    'data-act': o.act, 'data-arg': o.arg, 'aria-label': o.label, title: o.label, disabled: o.disabled,
  })}>${icon(name)}</button>`;
}

export function chip(label, o = {}) {
  return html`<button type="button" class="wn-chip ${o.static ? 'wn-chip--static' : ''} ${o.cls || ''}"
    ${attrs({ 'aria-pressed': o.on == null ? null : String(!!o.on), 'data-act': o.act, 'data-arg': o.arg, disabled: o.disabled })}
    >${o.icon ? icon(o.icon) : ''}${label}</button>`;
}

export function badge(label, tone = 'neutral', iconName) {
  return html`<span class="wn-badge wn-badge--${tone}">${iconName ? icon(iconName) : ''}${label}</span>`;
}

export function banner(text, tone = 'info', iconName) {
  const fallback = { info: 'info', warning: 'alertTriangle', success: 'checkCircle', danger: 'alertCircle' }[tone];
  return html`<div class="wn-banner wn-banner--${tone}" role="${tone === 'danger' ? 'alert' : 'note'}">
    ${icon(iconName || fallback)}<div>${text}</div></div>`;
}

export function stars(value, o = {}) {
  const n = Math.round(value);
  const items = [1, 2, 3, 4, 5].map((i) => raw(starMarkup(i <= n)));
  return html`<span class="wn-stars ${o.lg ? 'wn-stars--lg' : ''}" role="img"
    aria-label="${value} trên 5 sao">${items}</span>`;
}

export function starPicker(value, o = {}) {
  const labels = ['Chưa thích lắm', 'Tạm được', 'Được', 'Thích', 'Rất thích'];
  return html`<div class="wn-starpick" role="radiogroup" aria-label="Chọn số sao">
    ${[1, 2, 3, 4, 5].map((i) => html`<button type="button" role="radio"
      aria-checked="${i === value ? 'true' : 'false'}" aria-label="${i} sao — ${labels[i - 1]}"
      class="${i <= value ? 'is-on' : ''}" data-act="${o.act || 'rate'}" data-arg="${i}"
      >${raw(starMarkup(i <= value))}</button>`)}
  </div>`;
}

export function histogram(counts) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return html`<div class="wn-stack-2">${[5, 4, 3, 2, 1].map((s) => {
    const c = counts[s] || 0;
    return html`<div class="wn-histbar">
      <span>${s} sao</span>
      <span class="wn-histbar__track"><span class="wn-histbar__fill" style="width:${Math.round((c / total) * 100)}%"></span></span>
      <span>${c}</span>
    </div>`;
  })}</div>`;
}

export function kpi(label, value, note) {
  return html`<div class="wn-kpi">
    <span class="wn-kpi__label">${label}</span>
    <span class="wn-kpi__value">${value}</span>
    ${note ? html`<span class="wn-kpi__note">${note}</span>` : ''}
  </div>`;
}

export function empty(iconName, title, body, action) {
  return html`<div class="wn-empty">
    ${icon(iconName)}
    <div class="wn-stack-1">
      <b class="wn-label">${title}</b>
      ${body ? html`<span class="wn-caption">${body}</span>` : ''}
    </div>
    ${action || ''}
  </div>`;
}

export function skeletonGrid(n = 6) {
  return html`<div class="wn-grid" aria-busy="true" aria-label="Đang tải">
    ${Array.from({ length: n }, () => html`<div class="wn-stack-2">
      <div class="wn-skel wn-cover--34"></div>
      <div class="wn-skel" style="height:13px;width:88%"></div>
      <div class="wn-skel" style="height:11px;width:56%"></div>
    </div>`)}
  </div>`;
}

export function skeletonRows(n = 6) {
  return html`<div class="wn-stack-3" aria-busy="true" aria-label="Đang tải">
    ${Array.from({ length: n }, () => html`<div class="wn-skel" style="height:44px"></div>`)}
  </div>`;
}

export function progressSegments(total, current) {
  return html`<div class="wn-progress" role="progressbar" aria-valuemin="1"
    aria-valuemax="${total}" aria-valuenow="${current}" aria-label="Tiến trình truyện">
    ${Array.from({ length: total }, (_, i) => {
      const cls = i + 1 < current ? 'is-done' : i + 1 === current ? 'is-now' : '';
      return html`<span class="${cls}"></span>`;
    })}
  </div>`;
}

export function cover(story, o = {}) {
  const ratio = o.ratio || '34';
  return html`<div class="wn-cover wn-cover--${ratio} ${o.cls || ''}">
    ${art({ seed: story.code, motif: story.art?.motif, time: story.art?.time,
            tint: o.tint, alt: `Bìa truyện ${story.title}` })}
    ${o.overlay || ''}
  </div>`;
}

export function storyCard(story, o = {}) {
  return html`<button type="button" class="wn-storycard" data-act="${o.act || 'open-story'}" data-arg="${story.id}">
    ${cover(story, { ratio: '34', tint: o.tint, overlay: o.overlay })}
    <span class="wn-storycard__title">${story.title}</span>
    <span class="wn-storycard__meta">${o.meta || story.categoryName}</span>
  </button>`;
}

export function sheet(inner, o = {}) {
  return html`<div class="wn-scrim" data-act="${o.closeAct || 'close-sheet'}"></div>
  <div class="wn-sheet" role="dialog" aria-modal="true" aria-label="${o.label || 'Bảng thao tác'}">
    <div class="wn-sheet__handle"></div>${inner}</div>`;
}

export function dialog(inner, o = {}) {
  return html`<div class="wn-scrim" data-act="${o.closeAct || 'close-sheet'}"></div>
  <div class="wn-dialog" role="dialog" aria-modal="true" aria-label="${o.label || 'Hộp thoại'}">${inner}</div>`;
}

export function appbar(title, o = {}) {
  return html`<header class="wn-appbar ${o.cls || ''}">
    ${o.back ? iconBtn('chevronLeft', { label: 'Quay lại', act: o.back }) : ''}
    ${o.lead || ''}
    <h1 class="wn-appbar__title">${title}</h1>
    ${o.actions || ''}
  </header>`;
}

export function tabs(items, active, act = 'tab') {
  return html`<div class="wn-tabs" role="tablist">
    ${items.map((t) => html`<button type="button" role="tab" class="wn-tab"
      aria-selected="${t.id === active ? 'true' : 'false'}" data-act="${act}" data-arg="${t.id}"
      >${t.label}</button>`)}
  </div>`;
}

export function bottomNav(items, active, act = 'nav') {
  return html`<nav class="wn-bottomnav" aria-label="Điều hướng chính">
    ${items.map((t) => html`<button type="button" data-act="${act}" data-arg="${t.id}"
      ${attrs({ 'aria-current': t.id === active ? 'page' : null })}
      >${icon(t.icon)}<span>${t.label}</span></button>`)}
  </nav>`;
}

export function avatar(name, o = {}) {
  const size = o.size || 40;
  const initial = String(name || '?').trim().charAt(0).toUpperCase();
  return html`<span aria-hidden="true" style="width:${size}px;height:${size}px;border-radius:999px;
    display:grid;place-items:center;flex:none;font-weight:700;font-size:${Math.round(size * 0.42)}px;
    background:color-mix(in srgb, ${o.tint || 'var(--wn-brand)'} 22%, var(--wn-surface));
    color:${o.tint || 'var(--wn-accent)'}">${initial}</span>`;
}

/* ------------------------------------------------------------------ tiện ích */

export function relTime(iso) {
  const then = new Date(iso).getTime();
  const diff = Math.round((Date.now() - then) / 1000);
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function num(n) {
  return new Intl.NumberFormat('vi-VN').format(n);
}

export function pct(n) {
  return `${Math.round(n * 100)}%`;
}

export function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let toastTimer = null;
export function toast(message) {
  const host = qs('#wnd-toasts');
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'wnd-toast';
  el.textContent = message;
  host.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2600);
}

/** Ăn mừng — chỉ gọi khi ending thực sự tích cực (R10), và im lặng khi người dùng tắt hiệu ứng. */
export function confetti(container) {
  if (!container || reducedMotion()) return;
  const colors = ['var(--wn-brand)', 'var(--wn-genre-adventure)', 'var(--wn-genre-puzzle)', 'var(--wn-warning)'];
  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:60';
  for (let i = 0; i < 46; i += 1) {
    const p = document.createElement('i');
    const size = 5 + Math.random() * 6;
    p.style.cssText = `position:absolute;top:-14px;left:${Math.random() * 100}%;
      width:${size}px;height:${size * 1.7}px;border-radius:2px;
      background:${colors[i % colors.length]};opacity:${0.65 + Math.random() * 0.35};
      animation:wnd-fall ${1400 + Math.random() * 1200}ms cubic-bezier(.25,.6,.4,1) ${Math.random() * 380}ms forwards`;
    layer.appendChild(p);
  }
  container.appendChild(layer);
  setTimeout(() => layer.remove(), 3200);
}

if (!document.getElementById('wnd-confetti-kf')) {
  const style = document.createElement('style');
  style.id = 'wnd-confetti-kf';
  style.textContent = '@keyframes wnd-fall{to{transform:translateY(115%) rotate(540deg);opacity:0}}';
  document.head.appendChild(style);
}
