/**
 * Khung chung của các bề mặt: marketing, trình đọc, cổng phụ huynh, bảng vận hành.
 *
 * Dùng lại khung là cách giữ cho 70 màn trông như MỘT sản phẩm chứ không phải 70 bản vẽ rời.
 */

import { html, icon, raw, cover, storyCard, badge, avatar, num } from 'wnd/ui.js';
import { PARENT, CHILDREN } from 'wnd/data/people.js';

/* ------------------------------------------------------------------ marketing */

const MARKETING_NAV = [
  { id: 'landing-home', label: 'Trang chủ' },
  { id: 'landing-parents', label: 'Dành cho phụ huynh' },
  { id: 'landing-compose', label: 'Sáng tác truyện' },
  { id: 'landing-download', label: 'Tải ứng dụng' },
];

export function wordmark(size = 30) {
  return raw(`<span style="display:flex;align-items:center;gap:9px">
    <svg viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true" style="border-radius:${Math.round(size * 0.28)}px">
      <rect width="32" height="32" rx="9" fill="var(--wn-brand)"></rect>
      <path d="M7 10.5h3.7l1.9 6.6 1.9-6.6h2.8l1.9 6.6 1.9-6.6H25l-3.8 11.5h-3.7L16 16.3l-1.5 5.7h-3.7z" fill="#fff"></path>
    </svg>
    <b style="font-size:${Math.round(size * 0.53)}px;letter-spacing:-0.02em">Rồi Sao Nữa</b>
  </span>`);
}

export function marketingShell(activeId, content) {
  return html`<div class="wn-screen">
    <header class="wn-appbar" style="gap:var(--wn-space-5);padding-inline:var(--wn-space-6)">
      ${wordmark(30)}
      <nav class="wn-row wn-only-wide" style="gap:2px;margin-left:var(--wn-space-4)" aria-label="Điều hướng">
        ${MARKETING_NAV.map((n) => html`<span class="wn-btn wn-btn--ghost wn-btn--sm"
          style="${n.id === activeId ? 'color:var(--wn-accent);background:color-mix(in srgb,var(--wn-accent) 10%,transparent)'
                                     : 'color:var(--wn-text-secondary)'}">${n.label}</span>`)}
      </nav>
      <span class="wn-spacer"></span>
      <span class="wn-only-narrow">${icon('menu')}</span>
      <span class="wn-btn wn-btn--outline wn-btn--sm wn-only-wide">Cổng phụ huynh</span>
      <span class="wn-btn wn-btn--primary wn-btn--sm">Đọc trên web</span>
    </header>
    <div class="wn-scroll">
      ${content}
      <footer style="border-top:1px solid var(--wn-border);background:var(--wn-surface);
        padding:var(--wn-space-8) var(--wn-gutter)">
        <div class="wn-contentmax wn-stack-4" style="gap:var(--wn-space-4)">
          <div class="wn-row wn-row--wrap" style="justify-content:space-between">
            ${wordmark(26)}
            <div class="wn-row wn-row--wrap" style="gap:var(--wn-space-5)">
              <span class="wn-caption">Quyền riêng tư</span>
              <span class="wn-caption">Điều khoản</span>
              <span class="wn-caption">Liên hệ</span>
            </div>
          </div>
          <p class="wn-micro">Nội dung dành cho trẻ 6–10 tuổi. Tài khoản do người lớn quản lý.
            Đây là bản demo — mọi truyện và số liệu đều là hư cấu.</p>
        </div>
      </footer>
    </div>
  </div>`;
}

export function heroSection(o) {
  return html`<section style="padding:var(--wn-space-12) var(--wn-gutter);
    background:linear-gradient(180deg, color-mix(in srgb, var(--wn-brand) 9%, var(--wn-bg)), var(--wn-bg))">
    <div class="wn-contentmax wn-two-col" style="align-items:center">
      <div class="wn-stack">
        ${o.eyebrow ? html`<span class="wn-badge wn-badge--info">${icon('sparkles')}${o.eyebrow}</span>` : ''}
        <h1 style="font-size:clamp(26px,4.2cqw,40px);line-height:1.12;font-weight:700;letter-spacing:-0.025em">${o.title}</h1>
        <p class="wn-reader wn-dim" style="max-width:52ch">${o.lede}</p>
        <div class="wn-row wn-row--wrap">${o.actions}</div>
        ${o.foot ? html`<p class="wn-caption">${o.foot}</p>` : ''}
      </div>
      <div>${o.media}</div>
    </div>
  </section>`;
}

/* --------------------------------------------------------------- trình đọc */

export const READER_TABS = [
  { id: 'home', label: 'Trang chủ', icon: 'home' },
  { id: 'library', label: 'Truyện', icon: 'bookOpen' },
  { id: 'mine', label: 'Của tôi', icon: 'bookmark' },
  { id: 'parent', label: 'Phụ huynh', icon: 'users' },
];

export function readerShell(o) {
  return html`<div class="wn-screen">
    ${o.appbar === false ? '' : html`<header class="wn-appbar">
      ${o.back ? html`<button type="button" class="wn-icobtn" data-act="${o.back}" aria-label="Quay lại">${icon('chevronLeft')}</button>` : ''}
      ${o.lead || ''}
      <h1 class="wn-appbar__title">${o.title}</h1>
      ${o.actions || ''}
    </header>`}
    <div class="wn-scroll">${o.content}</div>
    ${o.tab ? html`<nav class="wn-bottomnav" aria-label="Điều hướng chính">
      ${READER_TABS.map((t) => html`<button type="button" data-act="tab" data-arg="${t.id}"
        ${raw(t.id === o.tab ? 'aria-current="page"' : '')}>${icon(t.icon)}<span>${t.label}</span></button>`)}
    </nav>` : ''}
    ${o.overlay || ''}
  </div>`;
}

export function childHeader(child) {
  return html`<div class="wn-row" style="padding:var(--wn-gutter) var(--wn-gutter) 0">
    ${avatar(child.name, { size: 40, tint: child.tint })}
    <div class="wn-stack-1" style="flex:1;min-width:0">
      <b class="wn-title">Chào ${child.name}!</b>
      <span class="wn-caption">Hôm nay đọc gì?</span>
    </div>
    <button type="button" class="wn-icobtn" data-act="notifications" aria-label="Thông báo">${icon('bell')}</button>
  </div>`;
}

export function storySection(title, stories, o = {}) {
  return html`<section class="wn-pad" style="padding-top:var(--wn-space-5)">
    <div class="wn-sectionhead">
      <h2>${o.icon ? icon(o.icon) : ''}${title}</h2>
      ${o.more ? html`<span class="wn-spacer"></span><span class="wn-caption">${o.more}</span>` : ''}
    </div>
    ${stories.length
      ? html`<div class="wn-grid">${stories.map((s) => storyCard(s, {
          act: o.act, meta: o.meta ? o.meta(s) : `${s.categoryName} · ${s.estimatedMinutes} phút`,
          overlay: o.overlay ? o.overlay(s) : null,
        }))}</div>`
      : html`<p class="wn-caption">${o.empty || 'Chưa có truyện nào ở đây.'}</p>`}
  </section>`;
}

export function favOverlay(saved, code) {
  return html`<button type="button" class="wn-icobtn wn-icobtn--onart wn-storycard__fav"
    data-act="fav" data-arg="${code}" aria-pressed="${saved ? 'true' : 'false'}"
    aria-label="${saved ? 'Bỏ lưu truyện' : 'Lưu truyện'}"
    style="${saved ? 'color:var(--wn-warning)' : ''}">${icon(saved ? 'heartFull' : 'heart')}</button>`;
}

/* --------------------------------------------------------- cổng phụ huynh */

export const PORTAL_NAV = [
  { id: 'summary', label: 'Tổng quan', icon: 'barChart' },
  { id: 'children', label: 'Hồ sơ trẻ', icon: 'users' },
  { id: 'skills', label: 'Báo cáo kỹ năng', icon: 'award' },
  { id: 'history', label: 'Lịch sử học', icon: 'clock' },
  { id: 'suggest', label: 'Gợi ý nội dung', icon: 'lightbulb' },
  { id: 'proposals', label: 'Đề xuất đã gửi', icon: 'message' },
];

export function portalShell(activeId, content, o = {}) {
  return html`<div class="wn-screen">
    <header class="wn-appbar" style="padding-inline:var(--wn-space-5)">
      ${wordmark(26)}
      <span class="wn-caption wn-only-wide" style="margin-left:8px">Cổng phụ huynh</span>
      <span class="wn-spacer"></span>
      <span class="wn-caption wn-only-wide">${PARENT.displayName}</span>
      ${avatar(PARENT.displayName, { size: 32, tint: 'var(--wn-accent)' })}
    </header>
    <div class="wn-scroll wn-pad-lg">
      <div class="wn-contentmax" style="display:grid;gap:var(--wn-space-6)">
        ${o.hideNav ? '' : html`<nav class="wn-row wn-row--wrap" aria-label="Mục trong cổng">
          ${PORTAL_NAV.map((n) => html`<span class="wn-chip ${n.id === activeId ? 'is-on' : ''}"
            >${icon(n.icon)}${n.label}</span>`)}
        </nav>`}
        ${o.childBar === false ? '' : childSelector(o.child || CHILDREN[0])}
        ${content}
      </div>
    </div>
  </div>`;
}

export function childSelector(active) {
  return html`<div class="wn-card wn-card--flat wn-row wn-row--wrap" style="padding:var(--wn-space-4)">
    <span class="wn-label">Đang xem hồ sơ</span>
    <div class="wn-row wn-row--wrap" style="gap:var(--wn-space-2)">
      ${CHILDREN.map((c) => html`<span class="wn-chip ${c.id === active.id ? 'is-on' : ''}"
        >${avatar(c.name, { size: 20, tint: c.tint })}${c.name}</span>`)}
    </div>
    <span class="wn-spacer"></span>
    <span class="wn-caption">${active.minutesThisWeek} phút tuần này</span>
  </div>`;
}

/* -------------------------------------------------------------- vận hành */

export const ADMIN_NAV = [
  { id: 'admin-dashboard', label: 'Tổng quan', icon: 'barChart' },
  { id: 'admin-story-list', label: 'Truyện', icon: 'book' },
  { id: 'admin-story-edit', label: 'Sửa truyện', icon: 'edit', sub: true },
  { id: 'admin-scene-editor', label: 'Trang truyện', icon: 'image', sub: true },
  { id: 'admin-choice-edit', label: 'Lựa chọn', icon: 'gitBranch', sub: true },
  { id: 'admin-ending-edit', label: 'Đoạn kết', icon: 'flag', sub: true },
  { id: 'admin-proposal-review', label: 'Đề xuất người dùng', icon: 'message' },
  { id: 'admin-ugc-queue', label: 'Hàng đợi UGC', icon: 'layers' },
  { id: 'admin-ugc-workspace', label: 'Không gian duyệt', icon: 'eye', sub: true },
  { id: 'admin-report-home', label: 'Báo cáo', icon: 'trendingUp' },
  { id: 'admin-report-stories', label: 'Hiệu năng truyện', icon: 'barChart', sub: true },
  { id: 'admin-report-scenes', label: 'Rơi rụng theo trang', icon: 'trendingUp', sub: true },
  { id: 'admin-report-choices', label: 'Phân bố lựa chọn', icon: 'gitBranch', sub: true },
  { id: 'admin-report-proposals', label: 'Thống kê đề xuất', icon: 'message', sub: true },
  { id: 'admin-report-audio', label: 'Sử dụng âm thanh', icon: 'volume', sub: true },
];

export function adminShell(activeId, content, o = {}) {
  return html`<div class="wn-screen">
    <header class="wn-appbar" style="padding-inline:var(--wn-space-5)">
      ${wordmark(24)}
      <span class="wn-badge wn-badge--neutral" style="margin-left:8px">Khu vực nội bộ</span>
      <span class="wn-spacer"></span>
      ${o.toolbar || ''}
      ${avatar('Trần Minh', { size: 30, tint: 'var(--wn-muted)' })}
    </header>
    <nav class="wn-only-narrow" aria-label="Mục quản trị"
      style="border-bottom:1px solid var(--wn-border);background:var(--wn-surface);
      overflow-x:auto;scrollbar-width:none">
      <div class="wn-row" style="gap:var(--wn-space-2);padding:var(--wn-space-2) var(--wn-gutter);width:max-content">
        ${ADMIN_NAV.filter((n) => !n.sub || n.id === activeId).map((n) => html`<span
          class="wn-chip ${n.id === activeId ? 'is-on' : ''}">${icon(n.icon)}${n.label}</span>`)}
      </div>
    </nav>
    <div style="flex:1;display:flex;min-height:0">
      <nav class="wn-only-wide" aria-label="Mục quản trị"
        style="width:236px;flex:none;border-right:1px solid var(--wn-border);background:var(--wn-surface);
        overflow:auto;padding:var(--wn-space-3) 0">
        ${ADMIN_NAV.map((n) => html`<span style="display:flex;align-items:center;gap:9px;
          padding:8px var(--wn-space-4) 8px ${n.sub ? 'var(--wn-space-10)' : 'var(--wn-space-4)'};
          font-size:var(--wn-text-caption);border-left:2px solid ${n.id === activeId ? 'var(--wn-accent)' : 'transparent'};
          color:${n.id === activeId ? 'var(--wn-accent)' : 'var(--wn-text-secondary)'};
          font-weight:${n.id === activeId ? '600' : '400'};
          background:${n.id === activeId ? 'color-mix(in srgb, var(--wn-accent) 9%, transparent)' : 'transparent'}">
          ${n.sub ? '' : icon(n.icon)}${n.label}</span>`)}
      </nav>
      <div class="wn-scroll wn-pad-lg" style="flex:1;min-width:0">${content}</div>
    </div>
  </div>`;
}

export function pageHead(title, sub, right, iconName) {
  return html`<div class="wn-row wn-row--wrap" style="margin-bottom:var(--wn-space-5)">
    <div class="wn-stack-1" style="flex:1;min-width:220px">
      <h1 class="wn-headline" style="display:inline-flex;align-items:center;gap:10px"
        >${iconName ? icon(iconName) : ''}${title}</h1>
      ${sub ? html`<p class="wn-caption">${sub}</p>` : ''}
    </div>
    ${right || ''}
  </div>`;
}

export function dateRangeBar(range) {
  return html`<div class="wn-card wn-card--flat wn-row wn-row--wrap" style="padding:var(--wn-space-3) var(--wn-space-4)">
    ${icon('calendar')}
    <span class="wn-caption"><b>${range.from}</b> → <b>${range.to}</b></span>
    <span class="wn-caption wn-quiet">${range.tz}</span>
    <span class="wn-spacer"></span>
    <span class="wn-btn wn-btn--secondary wn-btn--sm">Áp dụng</span>
    <span class="wn-btn wn-btn--ghost wn-btn--sm">${icon('refresh')}Làm mới</span>
    <span class="wn-btn wn-btn--ghost wn-btn--sm">${icon('download')}Xuất CSV</span>
  </div>`;
}

/* ---------------------------------------------------------------- biểu đồ */

export function barChart(rows, o = {}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return html`<div class="wn-stack-2">${rows.map((r) => html`
    <div style="display:grid;grid-template-columns:minmax(120px,1.4fr) 3fr auto;gap:var(--wn-space-3);align-items:center">
      <span class="wn-caption" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.label}</span>
      <span style="height:16px;border-radius:999px;background:color-mix(in srgb, var(--wn-border) 60%, var(--wn-surface));overflow:hidden">
        <span style="display:block;height:100%;width:${Math.round((r.value / max) * 100)}%;border-radius:999px;
          background:${r.color || 'var(--wn-accent)'}"></span></span>
      <b class="wn-caption" style="min-width:56px;text-align:right">${o.fmt ? o.fmt(r.value) : num(r.value)}</b>
    </div>`)}</div>`;
}

let sparkSeq = 0;

export function sparkline(values, o = {}) {
  sparkSeq += 1;
  const gid = `sp${sparkSeq}`;
  const w = 640;
  const h = o.height || 120;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(max - min, 1);
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - ((v - min) / span) * (h - 16) - 8,
  ]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;
  return raw(`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img"
    aria-label="Xu hướng ${values.length} ngày, thấp nhất ${min}, cao nhất ${max}"
    style="width:100%;height:${h}px;display:block">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--wn-accent)" stop-opacity="0.28"/>
      <stop offset="1" stop-color="var(--wn-accent)" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${area}" fill="url(#${gid})"/>
    <path d="${line}" fill="none" stroke="var(--wn-accent)" stroke-width="2.5"
      stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
  </svg>`);
}

export { cover, storyCard, badge, avatar };
