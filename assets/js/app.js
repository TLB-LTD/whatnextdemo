/**
 * Khung trưng bày: thanh trên, rail, sân khấu, và bộ điều phối màn hình.
 *
 * Mọi màn đều theo một hợp đồng duy nhất (xem registry.js), nên chỗ này không biết gì về nội
 * dung — nó chỉ dựng khung thiết bị, bơm state, và chuyển tiếp `data-act` về đúng màn.
 */

import { html, mount, qs, on, icon, raw, toast } from 'wnd/ui.js';
import { PLANES, SCREENS, SCREEN_BY_ID, screensOfPlane, neighbours } from 'wnd/registry.js';
import { getState, subscribe, resetDemo } from 'wnd/state.js';
import * as router from 'wnd/router.js';
import { overviewPage, rolesPage, roleFlowPage, selfCheckPage } from 'wnd/pages.js';
import { designSystemPage } from 'wnd/designsystem.js';

const VIEWPORTS = [
  { id: 'm', label: 'Khổ điện thoại (390px)', icon: 'smartphone', w: 390, h: 780 },
  { id: 't', label: 'Khổ máy tính bảng (834px)', icon: 'tablet', w: 834, h: 820 },
  { id: 'd', label: 'Khổ máy tính (1280px)', icon: 'monitor', w: 1280, h: 800 },
];

const THEMES = [
  { id: 'light', label: 'Giao diện sáng', icon: 'sun' },
  { id: 'dark', label: 'Giao diện tối', icon: 'moon' },
  { id: 'system', label: 'Theo hệ thống', icon: 'monitor' },
];

const SECTIONS = [
  { id: 'tong-quan', label: 'Tổng quan', icon: 'compass' },
  { id: 'ba-vai', label: 'Ba vai', icon: 'users' },
  { id: 'man-hinh', label: 'Màn hình', icon: 'grid' },
  { id: 'he-thiet-ke', label: 'Hệ thiết kế', icon: 'palette' },
];

const prefs = {
  viewport: read('wnd_vp', 'd'),
  theme: read('wnd_theme', 'system'),
  tech: read('wnd_tech', '0') === '1',
};

function read(key, fallback) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, value); } catch { /* trình duyệt chặn site data */ }
}

const stage = qs('#wnd-stage');
const rail = qs('#wnd-rail');

/* Bối cảnh của màn đang mở — sống qua các lần vẽ lại, chết khi đổi màn. */
let host = null;

/* ------------------------------------------------------------------- chrome */

function renderTopbar() {
  mount(qs('#wnd-sections'), html`${SECTIONS.map((s) => html`<a href="#/${s.id}"
    ${raw(router.path().startsWith('/' + s.id) ? 'aria-current="page"' : '')}
    >${icon(s.icon)}<span>${s.label}</span></a>`)}`);

  mount(qs('#wnd-viewport'), html`${VIEWPORTS.map((v) => html`<button type="button"
    data-vp="${v.id}" aria-pressed="${v.id === prefs.viewport ? 'true' : 'false'}"
    aria-label="${v.label}" title="${v.label}">${icon(v.icon)}</button>`)}`);

  /* Ba nút icon — đúng như hệ thiết kế yêu cầu, không phải dropdown. */
  mount(qs('#wnd-theme'), html`${THEMES.map((t) => html`<button type="button"
    data-theme-btn="${t.id}" aria-pressed="${t.id === prefs.theme ? 'true' : 'false'}"
    aria-label="${t.label}" title="${t.label}">${icon(t.icon)}</button>`)}`);

  mount(qs('#wnd-menu-toggle'), icon('menu'));
}

function renderRail(activeId) {
  const groups = PLANES.map((p) => ({ plane: p, items: screensOfPlane(p.id) }));
  mount(rail, html`
    <div class="wnd-rail__search">
      <input type="search" id="wnd-rail-q" placeholder="Tìm màn hình…" aria-label="Tìm màn hình">
    </div>
    ${groups.map((g) => html`<div class="wnd-rail__group" data-plane="${g.plane.id}">
      <div class="wnd-rail__grouphead">
        <span class="wnd-dot" style="background:${g.plane.color}"></span>
        ${g.plane.name}<span class="wnd-count">${g.items.length}</span>
      </div>
      ${g.items.map((s) => html`<a href="#/man-hinh/${s.id}" data-name="${s.name.toLowerCase()}"
        ${raw(s.id === activeId ? 'aria-current="page"' : '')}
        >${s.name}${s.live ? html`<span class="wnd-live">Sống</span>` : ''}</a>`)}
    </div>`)}
  `);
}

function showRail(show, activeId) {
  rail.hidden = !show;
  if (show) renderRail(activeId);
  setRail(false);
  qs('#wnd-menu-toggle').style.display = show ? '' : 'none';
}

/** Ngăn kéo và lớp mờ của nó luôn đi cùng nhau — một chỗ bật tắt, không hai. */
function setRail(open) {
  rail.classList.toggle('is-open', open);
  qs('#wnd-rail-scrim').classList.toggle('is-on', open);
  qs('#wnd-menu-toggle').setAttribute('aria-expanded', String(open));
}

function railOpen() {
  return rail.classList.contains('is-open');
}

/* -------------------------------------------------------- sân khấu màn hình */

function viewport() {
  return VIEWPORTS.find((v) => v.id === prefs.viewport) || VIEWPORTS[2];
}

function frameFor(screen) {
  if (screen.frame === 'phone') return VIEWPORTS[0];
  if (screen.frame === 'desktop' && prefs.viewport !== 'd') return VIEWPORTS[2];
  return viewport();
}

/**
 * Khổ HIỆU DỤNG — bề rộng khung thật sự có được, không phải bề rộng người dùng chọn.
 *
 * CSS trong khung phản ứng theo `@container`, tức bề rộng THẬT. JS của màn lại rẽ nhánh bố cục
 * theo `ctx.viewport`. Hai nguồn sự thật này lệch nhau ngay khi cửa sổ hẹp hơn khổ đã chọn —
 * một điện thoại 360px vẫn báo 'd', và màn soạn truyện sẽ chọn bố cục hai cột 360px + 1fr cho
 * một khung ba trăm pixel. Kẹp lại ở đây, một lần, cho cả 70 màn.
 */
function effectiveFrame(screen) {
  const vp = frameFor(screen);
  const pad = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--wnd-canvas-pad'),
  ) || 0;
  const room = stage.clientWidth - pad * 2;
  const w = room > 0 ? Math.min(vp.w, Math.round(room)) : vp.w;
  return { ...vp, w, id: w < 768 ? 'm' : w < 1024 ? 't' : 'd' };
}

function screenHost(screen, opts = {}) {
  const vp = effectiveFrame(screen);
  const ctx = {
    screen,
    local: screen.init({ state: getState(), viewport: vp.id }) || {},
    view: (opts.stateId || screen.states[0].id),
    viewport: vp.id,
    embedded: !!opts.embedded,
    rerender: () => paintFrame(ctx),
    go: router.go,
    toast,
  };
  host = ctx;
  return ctx;
}

/**
 * Vẽ lại khung — và giữ nguyên con trỏ nhập.
 *
 * Luật R12 nói "gõ chữ là thiêng liêng": không lần vẽ lại nào được phép cướp caret. Ở đây làm
 * một lần cho tất cả: ghi nhớ ô đang gõ cùng vị trí con trỏ, vẽ xong thì trả lại. Nhờ vậy mọi
 * màn có thể vẽ lại tự do mà người dùng không bao giờ mất chữ đang gõ dở.
 */
function paintFrame(ctx) {
  const target = qs('#wnd-frame-viewport');
  if (!target) return;
  const s = ctx.screen;

  const active = document.activeElement;
  const keepField = active && target.contains(active) && active.dataset ? active.dataset.field : null;
  const selStart = keepField ? active.selectionStart : null;
  const selEnd = keepField ? active.selectionEnd : null;

  target.innerHTML =
    `<div class="wn" data-density="${s.density}">${String(s.render(ctx))}</div>`;

  if (keepField) {
    const again = target.querySelector(`[data-field="${CSS.escape(keepField)}"]`);
    if (again) {
      again.focus({ preventScroll: true });
      try { again.setSelectionRange(selStart, selEnd); } catch { /* input số/email không cho */ }
    }
  }

  s.after(ctx, target);
  focusIntoOverlay(target);

  const bar = qs('#wnd-statebar');
  if (bar) {
    bar.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.arg === ctx.view));
    });
  }
}

function frameMarkup(ctx) {
  const vp = effectiveFrame(ctx.screen);
  return html`<div class="wnd-frame" style="--wnd-frame-w:${vp.w}px">
    <div class="wnd-frame__chrome">
      <span class="wnd-frame__dots"><i></i><i></i><i></i></span>
      <span class="wnd-frame__url">${ctx.screen.name} — ${vp.w}px</span>
      <span>${ctx.screen.density === 'child' ? 'chạm 48' : 'chạm 44'}</span>
    </div>
    <div class="wnd-frame__viewport" id="wnd-frame-viewport" style="--wnd-frame-h:${vp.h}px"></div>
  </div>`;
}

function captionMarkup(ctx) {
  const s = ctx.screen;
  const plane = PLANES.find((p) => p.id === s.plane);
  return html`<div class="wnd-caption">
    <div class="wnd-caption__main">
      <div class="wnd-caption__title">${s.name}</div>
      <div class="wnd-caption__desc">${s.desc}</div>
    </div>
    <div class="wnd-caption__side">
      <span class="wn-badge wn-badge--neutral" style="color:${plane.color}">${plane.name}</span>
      ${prefs.tech ? html`<span class="wnd-id">${s.sid}</span>` : ''}
      ${s.states.length > 1 ? html`<div class="wnd-statebar" id="wnd-statebar" role="group" aria-label="Trạng thái màn">
        ${s.states.map((st) => html`<button type="button" data-act="__state" data-arg="${st.id}"
          aria-pressed="${st.id === ctx.view ? 'true' : 'false'}">${st.label}</button>`)}
      </div>` : ''}
      <button type="button" class="wn-chip" data-tech aria-pressed="${prefs.tech ? 'true' : 'false'}"
        title="Hiện Screen ID kỹ thuật">${icon('fileText')}Chế độ kỹ thuật</button>
    </div>
  </div>`;
}

function renderScreenPage(id) {
  const screen = SCREEN_BY_ID[id];
  if (!screen) { renderNotFound(); return; }
  showRail(true, id);
  const ctx = screenHost(screen);
  const nb = neighbours(id);
  stage.className = 'wnd-stage wnd-stage--canvas';
  mount(stage, html`<div class="wnd-canvaswrap">
    ${frameMarkup(ctx)}
    ${captionMarkup(ctx)}
    <div class="wnd-prevnext">
      ${nb.prev ? html`<a href="#/man-hinh/${nb.prev.id}">${icon('arrowLeft')}<span>${nb.prev.name}</span></a>`
                : html`<span class="wnd-ph"></span>`}
      ${nb.next ? html`<a class="is-next" href="#/man-hinh/${nb.next.id}"><span>${nb.next.name}</span>${icon('arrowRight')}</a>`
                : html`<span class="wnd-ph"></span>`}
    </div>
  </div>`);
  paintFrame(ctx);
  /* Không cướp focus khi màn mở sẵn một lớp phủ — lớp phủ vừa nhận focus xong. */
  if (!overlayIn(stage)) stage.focus({ preventScroll: true });
  stage.scrollTop = 0;
}

/* Trang "ba vai" nhúng cùng bộ máy màn hình, thêm dải bước ở trên. */
function renderRoleFlow(roleId) {
  showRail(false);
  stage.className = 'wnd-stage wnd-stage--canvas';
  const cfg = roleFlowPage(roleId);
  if (!cfg) { renderNotFound(); return; }
  const screen = SCREEN_BY_ID[cfg.screenId];
  const ctx = screenHost(screen, { embedded: true });
  mount(stage, html`<div class="wnd-canvaswrap">
    <div class="wnd-caption" style="max-width:${effectiveFrame(screen).w}px">
      <div class="wnd-caption__main">
        <div class="wnd-caption__title">${cfg.title}</div>
        <div class="wnd-caption__desc">${cfg.desc}</div>
      </div>
      <div class="wnd-caption__side">
        <a class="wn-btn wn-btn--ghost wn-btn--sm" href="#/ba-vai">${icon('arrowLeft')}Ba vai</a>
        ${cfg.nextRole ? html`<a class="wn-btn wn-btn--primary wn-btn--sm" href="#/ba-vai/${cfg.nextRole.id}"
          >${cfg.nextRole.label}${icon('arrowRight')}</a>` : ''}
      </div>
    </div>
    ${frameMarkup(ctx)}
    <div class="wnd-caption" style="max-width:${effectiveFrame(screen).w}px">
      <div class="wnd-caption__main">
        <div class="wn-label" style="margin-bottom:6px">Thử lần lượt</div>
        <ol class="wnd-role__steps">${cfg.steps.map((s) => html`<li>${icon('check')}<span>${s}</span></li>`)}</ol>
      </div>
      <div class="wnd-caption__side">
        <button type="button" class="wn-btn wn-btn--outline wn-btn--sm" data-reset>${icon('refresh')}Đặt lại demo</button>
      </div>
    </div>
  </div>`);
  paintFrame(ctx);
  stage.scrollTop = 0;
}

function renderDoc(content, { canvas = false } = {}) {
  showRail(false);
  host = null;
  stage.className = 'wnd-stage' + (canvas ? ' wnd-stage--canvas' : '');
  mount(stage, content);
  stage.scrollTop = 0;
}

function renderNotFound() {
  renderDoc(html`<div class="wnd-doc wnd-doc--narrow">
    <div class="wnd-hero">
      <span class="wnd-eyebrow">Không tìm thấy</span>
      <h1 class="wnd-h1">Trang này không có trong demo</h1>
      <p class="wnd-lede">Có thể đường dẫn đã cũ. Quay lại danh sách màn hình để xem toàn bộ 70 màn.</p>
      <a class="wn-btn wn-btn--primary" href="#/man-hinh" style="justify-self:start">Xem danh sách màn hình</a>
    </div>
  </div>`);
}

/**
 * Sheet và hộp thoại: đưa focus vào trong khi mở, và giữ Tab quẩn bên trong.
 * Không có bước này thì người dùng bàn phím vẫn tab ra sau lưng lớp phủ mà không biết.
 */
let overlaySignature = '';

function overlayIn(root) {
  return root.querySelector('.wn-sheet, .wn-dialog');
}

function focusables(el) {
  return Array.from(el.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]),'
    + ' textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((n) => n.offsetParent !== null);
}

function focusIntoOverlay(root) {
  const box = overlayIn(root);
  const sig = box ? box.getAttribute('aria-label') || 'overlay' : '';
  if (sig === overlaySignature) return;
  overlaySignature = sig;
  if (!box) return;
  const first = focusables(box)[0];
  if (first) first.focus({ preventScroll: true });
}

/* ------------------------------------------------------------------ sự kiện */

function bind() {
  /* Bỏ qua tới nội dung — là nút chứ không phải liên kết hash, vì hash là địa chỉ của router:
     một `href="#wnd-stage"` sẽ bị router hiểu thành một tuyến không tồn tại. */
  on(document, 'click', '[data-skip]', () => {
    stage.setAttribute('tabindex', '-1');
    stage.focus();
    stage.scrollIntoView({ block: 'start' });
  });

  /* Escape đóng lớp phủ; Tab quẩn trong lớp phủ; Enter/Space kích hoạt hàng bảng bấm được. */
  document.addEventListener('keydown', (e) => {
    const frame = qs('#wnd-frame-viewport');

    if (e.key === 'Escape' && railOpen()) {
      e.preventDefault();
      setRail(false);
      qs('#wnd-menu-toggle').focus();
      return;
    }

    if (e.key === 'Escape' && host && frame && overlayIn(frame)) {
      e.preventDefault();
      host.screen.act(host, 'close-sheet', null, e, null);
      return;
    }

    if (e.key === 'Tab' && frame) {
      const box = overlayIn(frame);
      if (!box) return;
      const list = focusables(box);
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      return;
    }

    if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof Element) {
      const row = e.target.closest('tr[data-act]');
      if (row) { e.preventDefault(); row.click(); }
    }
  });

  /* Đổi khổ màn hình */
  on(document, 'click', '[data-vp]', (e, el) => {
    prefs.viewport = el.dataset.vp;
    write('wnd_vp', prefs.viewport);
    renderTopbar();
    router.resolve();
  });

  /* Đổi giao diện — ba nút icon */
  on(document, 'click', '[data-theme-btn]', (e, el) => {
    prefs.theme = el.dataset.themeBtn;
    write('wnd_theme', prefs.theme);
    document.documentElement.dataset.theme = prefs.theme;
    renderTopbar();
    router.resolve();
  });

  on(document, 'click', '[data-tech]', () => {
    prefs.tech = !prefs.tech;
    write('wnd_tech', prefs.tech ? '1' : '0');
    router.resolve();
  });

  on(document, 'click', '[data-reset]', () => {
    resetDemo();
    toast('Đã đặt lại demo về trạng thái ban đầu');
    router.resolve();
  });

  on(document, 'click', '#wnd-menu-toggle', () => setRail(!railOpen()));
  on(document, 'click', '#wnd-rail-scrim', () => setRail(false));
  on(document, 'click', '.wnd-rail a', () => setRail(false));

  /* Lọc rail theo tên */
  document.addEventListener('input', (e) => {
    if (e.target.id !== 'wnd-rail-q') return;
    const q = e.target.value.trim().toLowerCase();
    rail.querySelectorAll('a[data-name]').forEach((a) => {
      a.style.display = !q || a.dataset.name.includes(q) ? '' : 'none';
    });
    rail.querySelectorAll('.wnd-rail__group').forEach((g) => {
      const any = Array.from(g.querySelectorAll('a')).some((a) => a.style.display !== 'none');
      g.style.display = any ? '' : 'none';
    });
  });

  /* Chuyển tiếp mọi hành động trong khung về màn đang mở */
  on(document, 'click', '[data-act]', (e, el) => {
    if (!host) return;
    if (!el.closest('#wnd-frame-viewport') && el.dataset.act !== '__state') return;
    const act = el.dataset.act;
    const arg = el.dataset.arg;
    if (act === '__state') { host.view = arg; host.rerender(); return; }
    e.preventDefault();
    host.screen.act(host, act, arg, e, el);
  });

  /* Trường nhập trong khung: gửi thẳng cho màn, không vẽ lại để khỏi mất con trỏ (R12) */
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-field]');
    if (!el || !host) return;
    host.screen.act(host, '__field', el.dataset.field, e, el);
  });

  document.addEventListener('submit', (e) => {
    if (!host || !e.target.closest('#wnd-frame-viewport')) return;
    e.preventDefault();
  });

  /* Cửa sổ đổi bề rộng → khổ hiệu dụng có thể sang bậc khác. Chỉ vẽ lại khi ĐỔI BẬC: vẽ lại là
     chạy lại `screen.init()`, tức xoá sạch phiên đọc dở — quá đắt để trả cho mỗi pixel. */
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!host || effectiveFrame(host.screen).id === host.viewport) return;
      router.resolve();
    }, 160);
  });

  /* Đổi theme hệ thống → tranh SVG phải vẽ lại theo bảng màu mới */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (prefs.theme === 'system') router.resolve();
  });

  subscribe(() => {
    if (host) host.rerender();
  });
}

/* ------------------------------------------------------------------- khởi động */

function boot() {
  document.documentElement.dataset.theme = prefs.theme;
  renderTopbar();
  bind();

  router.route('/tong-quan', () => { renderDoc(overviewPage()); renderTopbar(); });
  router.route('/ba-vai', () => { renderDoc(rolesPage()); renderTopbar(); });
  router.route('/ba-vai/:role', (p) => { renderRoleFlow(p.role); renderTopbar(); });
  router.route('/man-hinh', () => {
    showRail(true, null);
    stage.className = 'wnd-stage';
    mount(stage, galleryPage());
    stage.scrollTop = 0;
    renderTopbar();
  });
  router.route('/man-hinh/:id', (p) => { renderScreenPage(p.id); renderTopbar(); });
  router.route('/he-thiet-ke', () => { renderDoc(designSystemPage()); renderTopbar(); });
  router.route('/tu-kiem-tra', () => { renderDoc(selfCheckPage(SCREENS)); renderTopbar(); });
  router.setNotFound(renderNotFound);

  router.start();
}

function galleryPage() {
  return html`<div class="wnd-doc">
    <div class="wnd-hero">
      <span class="wnd-eyebrow">${SCREENS.length} màn hình · ${PLANES.length} mặt phẳng</span>
      <h1 class="wnd-h1">Toàn bộ màn hình</h1>
      <p class="wnd-lede">Cùng một sản phẩm nhìn từ sáu chỗ đứng khác nhau. Mỗi màn mở trong khung
        thiết bị thật, đổi được khổ và giao diện, và những màn đánh dấu <b>Sống</b> thì bấm được.</p>
    </div>
    ${PLANES.map((p) => {
      const items = screensOfPlane(p.id);
      return html`<section class="wnd-section">
        <div class="wnd-section__head">
          <h2 class="wnd-h2" style="display:flex;align-items:center;gap:10px">
            <span class="wnd-dot" style="width:10px;height:10px;border-radius:999px;background:${p.color}"></span>
            ${p.name}
            <span class="wn-badge wn-badge--neutral">${items.length} màn</span>
          </h2>
          <p>${p.blurb}</p>
        </div>
        <div class="wnd-cards">
          ${items.map((s) => html`<a class="wnd-card wnd-card--link" href="#/man-hinh/${s.id}">
            <div class="wnd-card__icon" style="background:color-mix(in srgb, ${p.color} 14%, transparent);color:${p.color}">
              ${icon(s.icon || p.icon)}
            </div>
            <h3>${s.name}${s.live ? html` <span class="wnd-live">Sống</span>` : ''}</h3>
            <p>${s.desc}</p>
          </a>`)}
        </div>
      </section>`;
    })}
  </div>`;
}

boot();
