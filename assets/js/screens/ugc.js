/**
 * Mặt phẳng sáng tác — vẫn là trẻ, nhưng ở vai tác giả.
 *
 * Mật độ `creator`: chạm 44, chữ 15. Màn soạn thảo phải chứa nhiều thao tác, nên nó dày hơn
 * màn đọc — nhưng vẫn là một ngôn ngữ, không phải một bộ token thứ hai.
 *
 * Trên khổ hẹp, form nằm trong bottom sheet đè lên canvas 9:16 (đúng metaphor của trình soạn).
 * Trên khổ rộng, cùng form ấy nằm ở cột phải. Chỉ MỘT bản form tồn tại trong DOM tại một thời
 * điểm — nếu dựng hai bản rồi ẩn bằng CSS thì con trỏ nhập sẽ nhảy giữa hai ô.
 */

import {
  html, icon, raw, art, artPlaceholder, btn, iconBtn, badge, banner, empty, avatar, relTime,
} from 'wnd/ui.js';
import { readerShell } from 'wnd/screens/_kit.js';
import { CATEGORIES, AGE_BANDS } from 'wnd/data/catalog.js';
import { TEMPLATES, UGC_STATUS, SUBMIT_RULES } from 'wnd/data/ugc.js';
import { STRATEGIES, STRATEGY_BY_CODE } from 'wnd/data/strategies.js';
import { getState, patchUgc, findUgc, createUgcStory, postThread, transitionUgc, update } from 'wnd/state.js';
import {
  currentDraft, draftFromTemplate, validateDraft, draftGate, openBranches, treeSvg, addScene, removeScene,
} from 'wnd/flows/compose.js';
import { newSession, renderPlayer, playerAct } from 'wnd/flows/play.js';
import { decorateStory } from 'wnd/data/catalog.js';

const STEPS = ['Thông tin', 'Trang truyện', 'Nhánh', 'Gửi'];

function stepper(active) {
  return html`<div class="wn-row" style="gap:var(--wn-space-2);padding:var(--wn-space-2) var(--wn-gutter);
    background:var(--wn-surface);border-bottom:1px solid var(--wn-border);overflow-x:auto">
    ${STEPS.map((s, i) => html`<span class="wn-row" style="gap:6px;white-space:nowrap;
      color:${i + 1 === active ? 'var(--wn-accent)' : 'var(--wn-muted)'};
      font-size:var(--wn-text-caption);font-weight:${i + 1 === active ? '600' : '500'}">
      <span style="width:20px;height:20px;border-radius:999px;display:grid;place-items:center;
        font-size:11px;font-weight:700;
        background:${i + 1 === active ? 'var(--wn-accent)' : 'color-mix(in srgb, var(--wn-border) 60%, transparent)'};
        color:${i + 1 === active ? 'var(--wn-on-accent)' : 'var(--wn-muted)'}">${i + 1}</span>
      ${s}${i < STEPS.length - 1 ? raw('&nbsp;·') : ''}
    </span>`)}
  </div>`;
}

/** Bản nháp giả lập dùng cho các màn chỉ trưng bày, không đụng vào kho thật. */
function sampleDraft() {
  const d = draftFromTemplate('ban_ru_lam_sai', 'Cái kẹo cuối cùng');
  d.categoryCode = 'social';
  d.hasCover = true;
  d.scenes[0].text = 'Trong hộp còn đúng một cái kẹo.\nEm cũng đang nhìn vào đó.';
  d.scenes[0].choices[0].text = 'Bẻ đôi';
  d.scenes[0].choices[1].text = 'Nhường hẳn cho em';
  return d;
}

export const ugcScreens = [
  {
    id: 'ugc-guide', plane: 'ugc', density: 'creator', icon: 'bookOpen',
    sid: 'CHILD-UGC-GUIDE', name: 'Hướng dẫn sáng tác',
    desc: 'Bắt buộc đọc trước khi vào trình soạn. Nói rõ luật viết và việc truyện sẽ được người lớn duyệt.',
    live: true,
    init: () => ({ scrolled: false }),
    render(ctx) {
      const rules = [
        ['layers', 'Từ 5 đến 30 trang', 'Ít hơn 5 trang thì câu chuyện chưa kịp rẽ nhánh.'],
        ['fileText', 'Mỗi trang 1–3 dòng', 'Trang dài quá thì người đọc nhỏ tuổi bỏ giữa chừng.'],
        ['gitBranch', '2 hoặc 3 lựa chọn', 'Mỗi lựa chọn phải dẫn tới một trang khác hoặc một đoạn kết.'],
        ['image', 'Ảnh dọc 9:16, dưới 1 MB', 'Sai tỉ lệ thì có công cụ cắt ngay trong ứng dụng.'],
        ['shieldCheck', 'Không có tên thật, số điện thoại, địa chỉ', 'Kể cả của con lẫn của bạn con.'],
      ];
      return readerShell({
        title: 'Trước khi bắt đầu', back: 'back',
        content: html`<div class="wn-pad wn-stack-5">
          <div class="wn-stack-2">
            <h2 class="wn-headline">Vài điều cần biết</h2>
            <p class="wn-compact wn-dim">Đọc hết trang này rồi mới mở được trình soạn — không phải để làm khó,
              mà để con không phải viết lại từ đầu vì một luật chưa biết.</p>
          </div>
          <div class="wn-stack-3">
            ${rules.map(([ic, t, b]) => html`<div class="wn-card wn-row wn-row--top" style="padding:var(--wn-space-4)">
              <span style="color:var(--wn-accent);margin-top:2px">${icon(ic)}</span>
              <span class="wn-stack-1"><b class="wn-label">${t}</b><span class="wn-caption">${b}</span></span>
            </div>`)}
          </div>
          <div class="wn-banner wn-banner--warning">${icon('users')}
            <div><b>Truyện của con sẽ được người lớn đọc trước.</b> Đội duyệt có thể nhắn lại để con
              chỉnh vài chỗ. Khi nào ổn thì truyện mới vào thư viện chung.</div></div>
          <div class="wn-card wn-card--flat wn-stack-2">
            <b class="wn-label">Xem một truyện mẫu</b>
            <span class="wn-caption">Mở «Cái bình vỡ» ở chế độ đọc để thấy một truyện đủ nhánh trông thế nào.</span>
            ${btn('Mở truyện mẫu', { kind: 'outline', sm: true, act: 'sample', icon: 'eye' })}
          </div>
          <label class="wn-row wn-row--top" style="cursor:pointer;gap:var(--wn-space-3)">
            <input type="checkbox" data-act="ack" ${raw(ctx.local.scrolled ? 'checked' : '')}
              style="width:22px;height:22px;margin-top:2px;accent-color:var(--wn-accent)">
            <span class="wn-compact">Con đã đọc hết và hiểu những điều trên.</span>
          </label>
          ${btn('Bắt đầu tạo truyện', { kind: 'primary', block: true, act: 'start',
                icon: 'arrowRight', disabled: !ctx.local.scrolled })}
        </div>`,
      });
    },
    act(ctx, act, arg, e, el) {
      if (act === 'ack') { ctx.local.scrolled = el.checked; ctx.rerender(); }
      if (act === 'start') ctx.go('/man-hinh/ugc-template');
      if (act === 'sample') ctx.go('/man-hinh/child-player');
      if (act === 'back') ctx.go('/man-hinh/child-my-home');
    },
  },

  {
    id: 'ugc-template', plane: 'ugc', density: 'creator', icon: 'wand',
    sid: 'CHILD-UGC-TEMPLATE-PICK', name: 'Chọn mẫu bắt đầu',
    desc: 'Truyện mới luôn bắt đầu từ một khung có sẵn. Mẫu viết cấu trúc và gợi ý — không viết hộ văn.',
    live: true,
    init: () => ({ pick: 'noi_cam_xuc', title: '' }),
    render(ctx) {
      const t = TEMPLATES.find((x) => x.code === ctx.local.pick) || TEMPLATES[0];
      const preview = draftFromTemplate(t.code, ctx.local.title);
      return readerShell({
        title: 'Tạo truyện mới', back: 'back',
        content: html`
          ${stepper(1)}
          <div class="wn-pad wn-stack-5">
            <div class="wn-field">
              <label for="ugc-title">Tên truyện</label>
              <input class="wn-input" id="ugc-title" data-field="title" value="${ctx.local.title}"
                placeholder="Ví dụ: Cái kẹo cuối cùng">
              <span class="wn-hint">Đổi lại lúc nào cũng được.</span>
            </div>
            <div class="wn-stack-3">
              <b class="wn-label">Bắt đầu từ đâu?</b>
              ${TEMPLATES.map((tp) => html`<button type="button" class="wn-card wn-row wn-row--top"
                data-act="pick" data-arg="${tp.code}" style="cursor:pointer;text-align:left;width:100%;
                  padding:var(--wn-space-4);border-width:${ctx.local.pick === tp.code ? '2px' : '1px'};
                  border-color:${ctx.local.pick === tp.code ? 'var(--wn-accent)' : 'var(--wn-border)'}">
                <span style="color:${ctx.local.pick === tp.code ? 'var(--wn-accent)' : 'var(--wn-muted)'};margin-top:2px">
                  ${icon(ctx.local.pick === tp.code ? 'checkCircle' : 'circleDashed')}</span>
                <span class="wn-stack-1" style="flex:1">
                  <b class="wn-label">${tp.name}</b>
                  <span class="wn-caption">${tp.summary}</span>
                  <span class="wn-micro">${tp.scenes.length} trang khung${tp.strategy
                    ? ` · gợi ý chiến lược “${STRATEGY_BY_CODE[tp.strategy].name}”` : ''}</span>
                </span>
              </button>`)}
            </div>
            <div class="wn-card wn-card--flat wn-stack-2">
              <b class="wn-label">Khung sẽ trông thế này</b>
              <div class="wn-tree">${treeSvg(preview)}</div>
              <span class="wn-micro">${icon('info')} Ô vàng là trang chưa có chữ — mẫu cố ý để trống
                để con tự viết. Chấm vàng cuối nhánh là chỗ chưa nối.</span>
            </div>
            ${btn('Tạo và bắt đầu viết', { kind: 'primary', block: true, act: 'create', icon: 'arrowRight' })}
          </div>`,
      });
    },
    act(ctx, act, arg, e, el) {
      if (act === 'pick') { ctx.local.pick = arg; ctx.rerender(); }
      if (act === '__field' && arg === 'title') ctx.local.title = el.value;
      if (act === 'create') {
        const d = draftFromTemplate(ctx.local.pick, ctx.local.title.trim() || 'Truyện chưa đặt tên');
        createUgcStory(d);
        ctx.toast('Đã tạo bản nháp. Tự lưu sau mỗi thay đổi.');
        ctx.go('/man-hinh/ugc-meta');
      }
      if (act === 'back') ctx.go('/man-hinh/ugc-guide');
    },
  },

  {
    id: 'ugc-meta', plane: 'ugc', density: 'creator', icon: 'image',
    sid: 'CHILD-UGC-META', name: 'Thông tin truyện',
    desc: 'Bìa 9:16 là nhân vật chính của màn này. Tên, mô tả, thể loại và nhóm tuổi mở ra từ bìa.',
    live: true,
    init: () => ({ sheet: null }),
    render(ctx) {
      const d = currentDraft();
      const wide = ctx.viewport === 'd';
      const coverBox = html`<div class="wn-cover wn-cover--916" style="max-width:300px;margin-inline:auto">
        ${d.hasCover
          ? art({ seed: 'ugc' + d.id, motif: d.art.motif, time: d.art.time, alt: 'Bìa truyện' })
          : artPlaceholder('Chạm để thêm bìa')}
        <button type="button" class="wn-icobtn wn-icobtn--onart" data-act="cover"
          style="position:absolute;right:10px;bottom:10px" aria-label="Đổi ảnh bìa">${icon('image')}</button>
        ${!wide ? html`
          <button type="button" data-act="sheet" data-arg="title"
            style="position:absolute;left:10px;top:10px;max-width:70%;text-align:left;cursor:pointer;
              background:rgba(15,23,42,.6);color:#fff;border:0;border-radius:12px;padding:8px 12px;
              font-size:13px;font-weight:600;backdrop-filter:blur(6px)">
            ${d.title || 'Đặt tên truyện'} ${icon('edit')}</button>
          <button type="button" class="wn-icobtn wn-icobtn--onart" data-act="sheet" data-arg="desc"
            style="position:absolute;left:10px;bottom:10px" aria-label="Viết mô tả">${icon('fileText')}</button>` : ''}
      </div>`;

      const form = html`<div class="wn-stack-4">
        <div class="wn-field">
          <label for="m-title">Tên truyện</label>
          <input class="wn-input" id="m-title" data-field="title" value="${d.title}" placeholder="Ví dụ: Cái kẹo cuối cùng">
        </div>
        <div class="wn-field">
          <label for="m-desc">Mô tả ngắn</label>
          <textarea class="wn-textarea" id="m-desc" rows="3" data-field="description"
            placeholder="Một câu để người đọc biết truyện nói về chuyện gì.">${d.description}</textarea>
        </div>
        <div class="wn-field">
          <label>Thể loại</label>
          <div class="wn-row wn-row--wrap">
            ${CATEGORIES.slice(0, 10).map((c) => html`<button type="button"
              class="wn-chip ${d.categoryCode === c.code ? 'is-on' : ''}" data-act="cat" data-arg="${c.code}"
              aria-pressed="${d.categoryCode === c.code ? 'true' : 'false'}">${c.name}</button>`)}
          </div>
        </div>
        <div class="wn-field">
          <label>Truyện dành cho</label>
          <div class="wn-row wn-row--wrap">
            ${AGE_BANDS.slice(0, 3).map((b) => html`<button type="button"
              class="wn-chip ${d.ageBandCode === b.code ? 'is-on' : ''}" data-act="band" data-arg="${b.code}"
              aria-pressed="${d.ageBandCode === b.code ? 'true' : 'false'}">${b.label}</button>`)}
          </div>
        </div>
      </div>`;

      const ready = !!(d.title && d.title.trim() && d.hasCover && d.categoryCode);
      return readerShell({
        title: 'Tạo truyện', back: 'back',
        actions: html`<span class="wn-micro" style="white-space:nowrap">${icon('save')} Đã lưu nháp</span>`,
        content: html`
          ${stepper(1)}
          <div class="wn-pad">
            ${wide
              ? html`<div class="wn-two-col">${coverBox}<div>${form}</div></div>`
              : html`<div class="wn-stack-4">${coverBox}
                  <div class="wn-stack-2">
                    <button type="button" class="wn-card wn-row" data-act="sheet" data-arg="cat"
                      style="cursor:pointer;width:100%;text-align:left;padding:var(--wn-space-3) var(--wn-space-4)">
                      ${icon('grid')}<span class="wn-stack-1" style="flex:1"><b class="wn-label">Thể loại</b>
                      <span class="wn-caption">${d.categoryCode ? CATEGORIES.find((c) => c.code === d.categoryCode).name : 'Chưa chọn'}</span></span>
                      ${icon('chevronRight')}</button>
                    <button type="button" class="wn-card wn-row" data-act="sheet" data-arg="band"
                      style="cursor:pointer;width:100%;text-align:left;padding:var(--wn-space-3) var(--wn-space-4)">
                      ${icon('users')}<span class="wn-stack-1" style="flex:1"><b class="wn-label">Dành cho</b>
                      <span class="wn-caption">${AGE_BANDS.find((b) => b.code === d.ageBandCode).label}</span></span>
                      ${icon('chevronRight')}</button>
                  </div>
                </div>`}
          </div>
          <div class="wn-sticky-cta">
            ${btn('Tiếp — viết trang truyện', { kind: 'primary', block: true, act: 'next',
                  icon: 'arrowRight', disabled: !ready })}
            ${!ready ? html`<p class="wn-micro" style="text-align:center;margin-top:8px">
              Cần có tên truyện, ảnh bìa và thể loại trước khi đi tiếp.</p>` : ''}
          </div>
          ${ctx.local.sheet ? metaSheet(ctx, d) : ''}`,
      });
    },
    act(ctx, act, arg, e, el) {
      const d = currentDraft();
      if (act === 'sheet') { ctx.local.sheet = arg; ctx.rerender(); }
      if (act === 'close-sheet') { ctx.local.sheet = null; ctx.rerender(); }
      if (act === 'cover') { patchUgc(d.id, { hasCover: true }); ctx.toast('Đã chọn bìa và cắt về tỉ lệ 9:16.'); }
      if (act === 'cat') { patchUgc(d.id, { categoryCode: arg }); }
      if (act === 'band') { patchUgc(d.id, { ageBandCode: arg }); }
      if (act === '__field') {
        /* Ghi thẳng vào kho, KHÔNG vẽ lại — nếu vẽ lại thì caret nhảy về đầu ô. */
        const patch = {};
        patch[arg] = el.value;
        update((s) => { const st = s.ugc.find((u) => u.id === d.id); if (st) Object.assign(st, patch); return false; });
      }
      if (act === 'next') ctx.go('/man-hinh/ugc-scene-edit');
      if (act === 'back') ctx.go('/man-hinh/ugc-template');
    },
  },

  {
    id: 'ugc-scene-edit', plane: 'ugc', density: 'creator', icon: 'edit',
    sid: 'CHILD-UGC-SCENE-EDIT', name: 'Soạn trang truyện',
    desc: 'Một trang là một node. Viết chữ, thêm lựa chọn, nối lựa chọn sang trang khác hoặc một đoạn kết.',
    live: true,
    init: () => ({ i: 0, sheet: null }),
    render(ctx) {
      const d = currentDraft();
      const wide = ctx.viewport === 'd';
      const i = Math.min(ctx.local.i, Math.max(0, d.scenes.length - 1));
      const scene = d.scenes[i];
      if (!scene) {
        return readerShell({ title: 'Soạn truyện',
          content: empty('fileText', 'Truyện chưa có trang nào',
            'Thêm trang đầu tiên để bắt đầu.', btn('Thêm trang', { kind: 'primary', act: 'add', icon: 'plus' })) });
      }

      const stage = html`<div class="wn-cover wn-cover--916" style="max-width:${wide ? '340px' : '300px'};margin-inline:auto">
        ${scene.text.trim()
          ? art({ seed: 'ugc' + d.id + scene.code, motif: d.art.motif, time: d.art.time, alt: '' })
          : artPlaceholder('Trang chưa có ảnh')}
        <div style="position:absolute;right:10px;top:10px;display:grid;gap:8px">
          ${iconBtn('image', { label: 'Ảnh của trang', act: 'noop', cls: 'wn-icobtn--onart' })}
          ${iconBtn('mic', { label: 'Âm thanh của trang', act: 'noop', cls: 'wn-icobtn--onart' })}
          ${!wide ? iconBtn('edit', { label: 'Chữ và lựa chọn', act: 'sheet', arg: 'edit', cls: 'wn-icobtn--onart' }) : ''}
        </div>
        ${!wide ? html`<div style="position:absolute;inset:auto 0 0 0;padding:12px;
          background:linear-gradient(to top, rgba(9,14,20,.9), transparent)">
          <button type="button" data-act="sheet" data-arg="edit"
            style="width:100%;text-align:left;background:rgba(255,255,255,.94);border:0;border-radius:14px;
              padding:11px 14px;cursor:pointer;font-size:14px;color:#0F172A">
            ${scene.text.trim() ? scene.text.split('\n')[0] : 'Thêm nội dung trang truyện'}</button>
        </div>` : ''}
      </div>`;

      const editor = sceneEditor(d, scene, i);

      return readerShell({
        title: `Trang ${i + 1} / ${d.scenes.length}`, back: 'back',
        actions: html`<span class="wn-micro" style="white-space:nowrap">${icon('save')} Tự lưu</span>
          ${iconBtn('moreVertical', { label: 'Mục lục trang', act: 'sheet', arg: 'toc' })}`,
        content: html`
          ${stepper(2)}
          <div class="wn-pad">
            ${wide
              ? html`<div style="display:grid;grid-template-columns:360px minmax(0,1fr);gap:var(--wn-space-6);align-items:start">
                  ${stage}<div>${editor}</div></div>`
              : stage}
          </div>
          <div class="wn-pad" style="padding-top:0">
            <div class="wn-row">
              ${btn('Trước', { kind: 'secondary', sm: true, act: 'prev', disabled: i === 0, icon: 'chevronLeft' })}
              <span class="wn-spacer"></span>
              ${btn('Thêm trang', { kind: 'ghost', sm: true, act: 'add', icon: 'plus' })}
              ${btn('Sau', { kind: 'secondary', sm: true, act: 'next', disabled: i >= d.scenes.length - 1, icon: 'chevronRight' })}
            </div>
          </div>
          <div class="wn-sticky-cta">
            ${btn('Đi đến trang kết thúc', { kind: 'primary', block: true, act: 'branches', icon: 'gitBranch' })}
          </div>
          ${ctx.local.sheet === 'edit' ? html`<div class="wn-scrim" data-act="close-sheet"></div>
            <div class="wn-sheet" role="dialog" aria-modal="true" aria-label="Chữ và lựa chọn">
              <div class="wn-sheet__handle"></div>${editor}
              ${btn('Xong', { kind: 'primary', block: true, act: 'close-sheet', cls: 'wn-stack' })}
            </div>` : ''}
          ${ctx.local.sheet === 'toc' ? tocSheet(d, i) : ''}`,
      });
    },
    act(ctx, act, arg, e, el) {
      const d = currentDraft();
      const i = Math.min(ctx.local.i, Math.max(0, d.scenes.length - 1));
      const scene = d.scenes[i];
      const commit = () => patchUgc(d.id, { scenes: d.scenes });

      switch (act) {
        case 'sheet': ctx.local.sheet = arg; ctx.rerender(); break;
        case 'close-sheet': ctx.local.sheet = null; ctx.rerender(); break;
        case 'prev': ctx.local.i = Math.max(0, i - 1); ctx.rerender(); break;
        case 'next': ctx.local.i = Math.min(d.scenes.length - 1, i + 1); ctx.rerender(); break;
        case 'goto': ctx.local.i = Number(arg); ctx.local.sheet = null; ctx.rerender(); break;
        case 'add': { addScene(d); commit(); ctx.local.i = d.scenes.length - 1; ctx.rerender(); break; }
        case 'del': {
          if (d.scenes.length <= 1) { ctx.toast('Truyện cần ít nhất một trang.'); break; }
          removeScene(d, scene.code); commit();
          ctx.local.i = Math.max(0, i - 1); ctx.rerender();
          ctx.toast('Đã xoá trang. Hoàn tác?');
          break;
        }
        case 'toggle-end': {
          scene.isEnding = !scene.isEnding;
          if (scene.isEnding) {
            scene.choices = [];
            if (!scene.endingCode) scene.endingCode = (d.endings[0] || {}).code || 'fin';
          } else if (!scene.choices.length) {
            scene.choices = [
              { text: '', hint: 'Lựa chọn thứ nhất', next: null, ending: null },
              { text: '', hint: 'Lựa chọn thứ hai', next: null, ending: null },
            ];
          }
          commit(); ctx.rerender(); break;
        }
        case 'add-choice': {
          if (scene.choices.length >= 3) { ctx.toast('Một trang chỉ nên có tối đa 3 lựa chọn.'); break; }
          scene.choices.push({ text: '', hint: 'Lựa chọn mới', next: null, ending: null });
          commit(); ctx.rerender(); break;
        }
        case 'del-choice': { scene.choices.splice(Number(arg), 1); commit(); ctx.rerender(); break; }
        case 'link': {
          const [ci, target] = arg.split(':');
          const c = scene.choices[Number(ci)];
          if (target.startsWith('e_') || d.endings.some((en) => en.code === target)) { c.ending = target; c.next = null; }
          else { c.next = target || null; c.ending = null; }
          commit(); ctx.rerender(); break;
        }
        case 'strategy': {
          const [ci, code] = arg.split(':');
          const c = scene.choices[Number(ci)];
          c.strategy = c.strategy === code ? null : code;
          commit(); ctx.rerender(); break;
        }
        case 'set-start': {
          d.scenes.forEach((s) => { s.isStart = s.code === scene.code; });
          commit(); ctx.rerender(); break;
        }
        case '__field': {
          /* Không rerender: giữ caret. Ghi thẳng rồi để lần vẽ sau đọc lại. */
          if (arg === 'text') scene.text = el.value;
          else if (arg.startsWith('choice:')) scene.choices[Number(arg.split(':')[1])].text = el.value;
          patchUgc(d.id, { scenes: d.scenes });
          break;
        }
        case 'branches': ctx.go('/man-hinh/ugc-branches'); break;
        case 'back': ctx.go('/man-hinh/ugc-meta'); break;
        case 'noop': ctx.toast('Trình chọn ảnh và ghi âm mở ở đây trong bản đầy đủ.'); break;
        default: break;
      }
    },
  },

  {
    id: 'ugc-branches', plane: 'ugc', density: 'creator', icon: 'gitBranch',
    sid: 'CHILD-UGC-BRANCHES-COMPLETION', name: 'Nhánh & trang kết',
    desc: 'Hub tiến độ: bao nhiêu nhánh đã kết thúc, nhánh nào còn dở, và mở thẳng tới trang cần sửa.',
    live: true,
    init: () => ({}),
    render(ctx) {
      const d = currentDraft();
      const open = openBranches(d);
      const totalChoices = d.scenes.reduce((n, s) => n + (s.choices || []).length, 0);
      const done = totalChoices - open.length;
      const v = validateDraft(d);
      return readerShell({
        title: 'Nhánh & trang kết', back: 'back',
        content: html`
          ${stepper(3)}
          <div class="wn-pad wn-stack-5">
            <div class="wn-card wn-stack-3">
              <div class="wn-row">
                <b class="wn-title" style="flex:1">${done} / ${totalChoices} nhánh đã nối xong</b>
                ${open.length ? badge(`${open.length} còn dở`, 'warning', 'alertTriangle')
                              : badge('Đủ hết', 'success', 'check')}
              </div>
              <div class="wn-progress">
                ${Array.from({ length: Math.max(totalChoices, 1) }, (_, i) => html`
                  <span class="${i < done ? 'is-done' : ''}"></span>`)}
              </div>
              <span class="wn-caption">Nhánh làm dở là chuyện bình thường khi đang viết —
                bản nháp vẫn lưu được. Chỉ khi gửi duyệt mới cần nối hết.</span>
            </div>

            <div class="wn-card wn-card--flat wn-stack-2">
              <b class="wn-label">Cây nhánh</b>
              <div class="wn-tree">${treeSvg(d)}</div>
            </div>

            ${open.length ? html`<div class="wn-stack-2">
              <b class="wn-label">Còn phải nối</b>
              ${open.map((b) => html`<button type="button" class="wn-card wn-row" data-act="goto" data-arg="${b.sceneIndex}"
                style="cursor:pointer;width:100%;text-align:left;padding:var(--wn-space-3) var(--wn-space-4)">
                <span style="color:var(--wn-warning)">${icon('alertTriangle')}</span>
                <span class="wn-stack-1" style="flex:1">
                  <b class="wn-label">Trang ${b.sceneIndex + 1} · lựa chọn ${b.choiceIndex + 1}</b>
                  <span class="wn-caption">${b.text || 'Chưa có chữ'} — chưa trỏ đi đâu</span>
                </span>
                ${icon('chevronRight')}
              </button>`)}
            </div>` : html`<div class="wn-banner wn-banner--success">${icon('checkCircle')}
              <div>Mọi lựa chọn đều đã có đích. Con có thể sang bước tổng kết.</div></div>`}

            ${btn('Tổng kết & gửi', { kind: 'primary', block: true, act: 'final',
                  icon: 'arrowRight', disabled: open.length > 0 })}
            ${open.length ? html`<p class="wn-micro" style="text-align:center">
              Nút mở khi mọi lựa chọn đã có trang tiếp hoặc đoạn kết.</p>` : ''}
          </div>`,
      });
    },
    act(ctx, act, arg) {
      if (act === 'goto') ctx.go('/man-hinh/ugc-scene-edit');
      if (act === 'final') ctx.go('/man-hinh/ugc-final-review');
      if (act === 'back') ctx.go('/man-hinh/ugc-scene-edit');
    },
  },

  {
    id: 'ugc-final-review', plane: 'ugc', density: 'creator', icon: 'checkCircle',
    sid: 'CHILD-UGC-FINAL-REVIEW', name: 'Tổng kết & gửi',
    desc: 'Tám điều kiện, kiểm tra thật. Nút gửi duyệt chỉ sáng khi cả tám đều đạt.',
    live: true,
    init: () => ({}),
    render(ctx) {
      const d = currentDraft();
      const v = validateDraft(d);
      const gate = draftGate(d);
      return readerShell({
        title: 'Tổng kết & gửi', back: 'back',
        content: html`
          ${stepper(4)}
          <div class="wn-pad wn-stack-5">
            <div class="wn-card wn-row wn-row--top">
              <div style="width:88px;flex:none">
                <div class="wn-cover wn-cover--916">${d.hasCover
                  ? art({ seed: 'ugc' + d.id, motif: d.art.motif, time: d.art.time, alt: '' })
                  : artPlaceholder('Chưa có bìa')}</div>
              </div>
              <div class="wn-stack-1" style="flex:1">
                <b class="wn-title">${d.title || 'Chưa đặt tên'}</b>
                <span class="wn-caption">${d.scenes.length} trang · ${d.endings.length} đoạn kết
                  · ${d.categoryCode ? CATEGORIES.find((c) => c.code === d.categoryCode)?.name : 'chưa chọn thể loại'}</span>
                <span class="wn-micro">${UGC_STATUS[d.status].label} · sửa lần cuối ${relTime(d.updatedAt)}</span>
              </div>
            </div>

            ${gate.length ? banner(gate.join(' '), 'danger') : ''}

            <div class="wn-stack-2">
              <b class="wn-label">Điều kiện gửi duyệt</b>
              ${v.checks.map((c) => html`<div class="wn-row" style="gap:10px">
                <span style="color:${c.ok ? 'var(--wn-success)' : 'var(--wn-muted)'}">
                  ${icon(c.ok ? 'checkCircle' : 'circleDashed')}</span>
                <span class="wn-compact" style="color:${c.ok ? 'var(--wn-text)' : 'var(--wn-text-secondary)'}">${c.label}</span>
              </div>`)}
            </div>

            <div class="wn-stack-2">
              ${btn('Xem trước cả truyện', { kind: 'outline', block: true, act: 'preview', icon: 'eye' })}
              ${btn('Lưu nháp', { kind: 'secondary', block: true, act: 'save', icon: 'save' })}
              ${btn('Gửi duyệt', { kind: 'primary', block: true, act: 'submit', icon: 'send', disabled: !v.ok })}
              ${!v.ok ? html`<p class="wn-micro" style="text-align:center">
                Còn ${v.checks.filter((c) => !c.ok).length} điều kiện chưa đạt. Bản nháp vẫn được lưu bình thường.</p>` : ''}
            </div>
          </div>`,
      });
    },
    act(ctx, act) {
      const d = currentDraft();
      if (act === 'preview') ctx.go('/man-hinh/ugc-preview');
      if (act === 'save') ctx.toast('Đã lưu nháp.');
      if (act === 'submit') {
        transitionUgc(d.id, 'submitted', 'Bản gửi duyệt được tiếp nhận.', 'system');
        ctx.toast('Đã gửi. Bản của con đang nằm trong hàng đợi biên tập.');
        ctx.go('/man-hinh/ugc-submit');
      }
      if (act === 'back') ctx.go('/man-hinh/ugc-branches');
    },
  },

  {
    id: 'ugc-preview', plane: 'ugc', density: 'child', icon: 'eye',
    sid: 'CHILD-UGC-PREVIEW', name: 'Xem trước cả truyện',
    desc: 'Chính trình phát của trẻ, chạy trên bản nháp. Không ghi vào sổ chiến lược, không tính lượt đọc.',
    live: true,
    init() {
      const d = currentDraft();
      const story = draftToStory(d);
      return { sess: newSession(story), story };
    },
    render(ctx) {
      const story = ctx.local.story;
      return renderPlayer(ctx, ctx.local.sess, story, {
        preview: true,
        banner: html`<div style="padding:var(--wn-space-2) var(--wn-gutter);
          background:color-mix(in srgb, var(--wn-warning) 14%, var(--wn-surface));
          border-bottom:1px solid color-mix(in srgb, var(--wn-warning) 32%, transparent)">
          <span class="wn-micro">${icon('eye')} Bản xem trước — chưa ai thấy trừ con.</span>
        </div>`,
      });
    },
    act(ctx, act, arg, e, el) {
      if (playerAct(ctx, ctx.local.sess, ctx.local.story, act, arg, { preview: true }, el)) return;
      if (act === 'exit') ctx.go('/man-hinh/ugc-final-review');
    },
  },

  {
    id: 'ugc-submit', plane: 'ugc', density: 'creator', icon: 'send',
    sid: 'CHILD-UGC-SUBMIT', name: 'Đã gửi duyệt',
    desc: 'Xác nhận sau khi gửi: cho biết chuyện gì xảy ra tiếp và bao lâu thì có tin.',
    live: true,
    init: () => ({}),
    render(ctx) {
      const d = currentDraft();
      return readerShell({
        title: 'Đã gửi duyệt', back: 'back',
        content: html`<div class="wn-pad wn-stack-6" style="place-content:center;justify-items:center;text-align:center;min-height:80%">
          <span style="width:78px;height:78px;border-radius:999px;display:grid;place-items:center;
            background:color-mix(in srgb, var(--wn-success) 16%, transparent);color:var(--wn-success)">
            ${icon('checkCircle')}</span>
          <div class="wn-stack-2" style="max-width:36ch">
            <h2 class="wn-headline">Đã gửi «${d.title}»</h2>
            <p class="wn-reader wn-dim">Đội duyệt sẽ đọc và nhắn lại cho con. Trong lúc chờ, con vẫn
              xem lại truyện được, nhưng chưa sửa được nữa.</p>
          </div>
          <div class="wn-card wn-stack-3" style="width:100%;text-align:left">
            <b class="wn-label">Tiếp theo sẽ là</b>
            ${[['eye', 'Đội duyệt đọc truyện'], ['message', 'Nếu cần sửa, họ nhắn cho con trong phần Trao đổi'],
               ['bookOpen', 'Khi ổn, truyện vào thư viện chung với tên con là tác giả']]
              .map(([ic, t], i) => html`<div class="wn-row" style="gap:10px">
                <span class="wn-badge wn-badge--neutral">${i + 1}</span>
                <span style="color:var(--wn-accent)">${icon(ic)}</span>
                <span class="wn-compact">${t}</span></div>`)}
          </div>
          <div class="wn-stack-2" style="width:100%">
            ${btn('Mở phần trao đổi', { kind: 'primary', block: true, act: 'thread', icon: 'message' })}
            ${btn('Về Sáng tác của tôi', { kind: 'secondary', block: true, act: 'list' })}
          </div>
        </div>`,
      });
    },
    act(ctx, act) {
      if (act === 'thread') ctx.go('/man-hinh/ugc-review-thread');
      if (act === 'list' || act === 'back') ctx.go('/man-hinh/ugc-list');
    },
  },

  {
    id: 'ugc-list', plane: 'ugc', density: 'creator', icon: 'folder',
    sid: 'CHILD-UGC-LIST', name: 'Sáng tác của tôi',
    desc: 'Mọi bản của con và trạng thái hiện tại. Chỉ bản nháp và bản cần chỉnh sửa mới mở được để sửa.',
    live: true,
    states: [{ id: 'default', label: 'Mặc định' }, { id: 'empty', label: 'Rỗng' }],
    init: () => ({}),
    render(ctx) {
      const st = getState();
      const mine = ctx.view === 'empty' ? [] : st.ugc.filter((u) => u.ownerName === 'Bống');
      return readerShell({
        title: 'Sáng tác của tôi', back: 'back',
        actions: iconBtn('plus', { label: 'Tạo truyện mới', act: 'new' }),
        content: mine.length
          ? html`<div class="wn-pad wn-stack-3">
              ${mine.map((u) => {
                const s = UGC_STATUS[u.status];
                const editable = ['draft', 'needs_revision'].includes(u.status);
                return html`<button type="button" class="wn-card wn-row" data-act="open" data-arg="${u.id}"
                  style="cursor:pointer;width:100%;text-align:left;padding:var(--wn-space-3)">
                  <span style="width:56px;flex:none"><span class="wn-cover wn-cover--916">
                    ${u.scenes.length ? art({ seed: 'ugc' + u.id, motif: u.art.motif, time: u.art.time, alt: '' })
                                      : artPlaceholder('')}</span></span>
                  <span class="wn-stack-1" style="flex:1;min-width:0">
                    <b class="wn-label">${u.title}</b>
                    <span class="wn-caption">${u.scenes.length} trang · sửa ${relTime(u.updatedAt)}</span>
                    ${badge(s.label, s.tone, s.icon)}
                  </span>
                  ${editable ? icon('edit') : icon('eye')}
                </button>`;
              })}
              ${btn('Tạo truyện mới', { kind: 'outline', block: true, act: 'new', icon: 'plus' })}
            </div>`
          : empty('wand', 'Chưa có bản sáng tác nào',
              'Bắt đầu từ một mẫu — mẫu dựng sẵn khung, con viết phần chữ.',
              btn('Bắt đầu sáng tác', { kind: 'primary', act: 'new', icon: 'plus' })),
      });
    },
    act(ctx, act, arg) {
      if (act === 'new') ctx.go('/man-hinh/ugc-guide');
      if (act === 'open') {
        const u = findUgc(Number(arg));
        update((s) => { s.composerId = Number(arg); });
        if (u && ['draft', 'needs_revision'].includes(u.status)) ctx.go('/man-hinh/ugc-scene-edit');
        else ctx.go('/man-hinh/ugc-review-thread');
      }
      if (act === 'back') ctx.go('/man-hinh/child-my-home');
    },
  },

  {
    id: 'ugc-review-thread', plane: 'ugc', density: 'creator', icon: 'message',
    sid: 'CHILD-UGC-REVIEW-THREAD', name: 'Trao đổi với đội duyệt',
    desc: 'Phía tác giả của cùng một cuộc trao đổi mà biên tập nhìn thấy. Chỉ trả lời được khi bản đang cần chỉnh sửa.',
    live: true,
    init: () => ({ text: '' }),
    render(ctx) {
      const st = getState();
      const u = st.ugc.find((x) => x.id === 501) || st.ugc[0];
      const s = UGC_STATUS[u.status];
      const canReply = u.status === 'needs_revision';
      return readerShell({
        title: u.title, back: 'back',
        actions: badge(s.label, s.tone, s.icon),
        content: html`<div class="wn-pad wn-stack-5">
          ${u.status === 'needs_revision' ? html`<div class="wn-banner wn-banner--warning">
            ${icon('alertTriangle')}
            <div><b>Đội duyệt muốn con chỉnh vài chỗ.</b> Sửa xong thì bấm gửi lại — không phải làm lại từ đầu.</div>
          </div>` : ''}

          <div class="wn-thread">
            ${u.thread.map((m) => html`<div class="wn-msg wn-msg--${m.role}">
              ${m.role !== 'system' ? html`<span class="wn-msg__meta">
                ${m.role === 'staff' ? `${m.author} · Đội duyệt` : 'Con'} · ${relTime(m.at)}</span>` : ''}
              <div class="wn-msg__bubble">
                ${m.anchor ? html`<span class="wn-badge wn-badge--neutral" style="margin-bottom:6px">
                  ${icon('fileText')}${m.anchor}</span><br>` : ''}
                ${m.body}
              </div>
            </div>`)}
          </div>

          <div class="wn-card wn-stack-3">
            <div class="wn-field">
              <label for="reply">Trả lời đội duyệt</label>
              <textarea class="wn-textarea" id="reply" rows="3" data-field="reply"
                ${raw(canReply ? '' : 'disabled')}
                placeholder="${canReply ? 'Con viết ở đây…' : 'Chỉ trả lời được khi bản đang cần chỉnh sửa.'}"></textarea>
            </div>
            <div class="wn-row wn-row--wrap">
              ${btn('Gửi', { kind: 'primary', act: 'send', icon: 'send', disabled: !canReply })}
              ${btn('Sửa truyện', { kind: 'secondary', act: 'edit', icon: 'edit', disabled: !canReply })}
              ${btn('Gửi lại để duyệt', { kind: 'outline', act: 'resubmit', icon: 'refresh', disabled: !canReply })}
            </div>
          </div>
        </div>`,
      });
    },
    act(ctx, act, arg, e, el) {
      const st = getState();
      const u = st.ugc.find((x) => x.id === 501) || st.ugc[0];
      if (act === '__field' && arg === 'reply') ctx.local.text = el.value;
      if (act === 'send') {
        const t = (ctx.local.text || '').trim();
        if (!t) { ctx.toast('Viết gì đó trước khi gửi nhé.'); return; }
        postThread(u.id, { role: 'author', author: u.ownerName, body: t });
        ctx.local.text = '';
        ctx.rerender();
      }
      if (act === 'edit') { update((s) => { s.composerId = u.id; }); ctx.go('/man-hinh/ugc-scene-edit'); }
      if (act === 'resubmit') {
        transitionUgc(u.id, 'submitted', 'Tác giả đã gửi lại bản sửa.', 'system');
        ctx.toast('Đã gửi lại. Bản của con quay về hàng đợi.');
      }
      if (act === 'back') ctx.go('/man-hinh/ugc-list');
    },
  },
];

/* --------------------------------------------------------------- mảnh dùng chung */

function sceneEditor(d, scene, i) {
  const targets = d.scenes.filter((s) => s.code !== scene.code);
  return html`<div class="wn-stack-4">
    <div class="wn-row wn-row--wrap">
      <b class="wn-label" style="flex:1">Trang ${i + 1}</b>
      <button type="button" class="wn-chip ${scene.isStart ? 'is-on' : ''}" data-act="set-start"
        aria-pressed="${scene.isStart ? 'true' : 'false'}">${icon('flag')}Trang mở đầu</button>
      <button type="button" class="wn-chip ${scene.isEnding ? 'is-on' : ''}" data-act="toggle-end"
        aria-pressed="${scene.isEnding ? 'true' : 'false'}">${icon('award')}Kết thúc nhánh</button>
      ${iconBtn('trash', { label: 'Xoá trang này', act: 'del' })}
    </div>

    <div class="wn-field">
      <label for="scene-text">Chữ của trang ${scene.isEnding ? '(đoạn kết)' : ''}</label>
      <textarea class="wn-textarea" id="scene-text" rows="3" data-field="text"
        placeholder="${scene.hint || 'Viết 1 đến 3 dòng.'}">${scene.text}</textarea>
      <span class="wn-hint">${scene.hint ? `Gợi ý: ${scene.hint}` : 'Một đến ba dòng thôi.'}</span>
    </div>

    ${scene.isEnding
      ? html`<div class="wn-banner wn-banner--success">${icon('flag')}
          <div>Đây là trang kết của một nhánh. Trang kết không có lựa chọn.</div></div>`
      : html`<div class="wn-stack-3">
          <div class="wn-row">
            <b class="wn-label" style="flex:1">Lựa chọn (${scene.choices.length}/3)</b>
            ${btn('Thêm', { kind: 'ghost', sm: true, act: 'add-choice', icon: 'plus',
                  disabled: scene.choices.length >= 3 })}
          </div>
          ${scene.choices.map((c, ci) => html`<div class="wn-card wn-card--flat wn-stack-2"
            style="padding:var(--wn-space-3)">
            <div class="wn-row">
              <span class="wn-choice__num" style="--wn-choice-tint:var(--wn-accent)">${ci + 1}</span>
              <input class="wn-input" data-field="choice:${ci}" value="${c.text}"
                placeholder="${c.hint || 'Nhân vật làm gì?'}" aria-label="Chữ của lựa chọn ${ci + 1}">
              ${iconBtn('trash', { label: 'Xoá lựa chọn', act: 'del-choice', arg: String(ci) })}
            </div>
            <div class="wn-row wn-row--wrap" style="gap:6px">
              <span class="wn-micro" style="width:100%">Dẫn tới</span>
              ${targets.map((t, ti) => html`<button type="button"
                class="wn-chip ${c.next === t.code ? 'is-on' : ''}" data-act="link" data-arg="${ci}:${t.code}"
                >Trang ${d.scenes.indexOf(t) + 1}</button>`)}
              ${d.endings.map((en) => html`<button type="button"
                class="wn-chip ${c.ending === en.code ? 'is-on' : ''}" data-act="link" data-arg="${ci}:${en.code}"
                >${icon('flag')}${en.title}</button>`)}
              ${!c.next && !c.ending ? badge('Chưa nối', 'warning', 'alertTriangle') : ''}
            </div>
            <div class="wn-row wn-row--wrap" style="gap:6px">
              <span class="wn-micro" style="width:100%">Lựa chọn này thể hiện điều gì? (không bắt buộc)</span>
              ${STRATEGIES.map((s) => html`<button type="button"
                class="wn-chip ${c.strategy === s.code ? 'is-on' : ''}" data-act="strategy" data-arg="${ci}:${s.code}"
                >${icon(s.icon)}${s.name}</button>`)}
            </div>
          </div>`)}
        </div>`}
  </div>`;
}

function tocSheet(d, active) {
  return html`<div class="wn-scrim" data-act="close-sheet"></div>
    <div class="wn-sheet" role="dialog" aria-modal="true" aria-label="Mục lục trang">
      <div class="wn-sheet__handle"></div>
      <div class="wn-stack-2">
        <b class="wn-label">Các trang trong truyện</b>
        ${d.scenes.map((s, i) => html`<button type="button" class="wn-card wn-card--flat wn-row"
          data-act="goto" data-arg="${i}" style="cursor:pointer;width:100%;text-align:left;
            padding:var(--wn-space-3);border-color:${i === active ? 'var(--wn-accent)' : 'var(--wn-border)'}">
          <span class="wn-choice__num">${i + 1}</span>
          <span class="wn-stack-1" style="flex:1;min-width:0">
            <b class="wn-label">${s.isEnding ? 'Trang kết' : `Trang ${i + 1}`}</b>
            <span class="wn-caption" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
              >${s.text ? s.text.split('\n')[0] : 'chưa có chữ'}</span>
          </span>
          ${s.isStart ? badge('Mở đầu', 'info', 'flag') : ''}
        </button>`)}
      </div>
    </div>`;
}

/** Đổi bản nháp sang hình dạng một truyện để trình phát chạy được không cần sửa gì. */
export function draftToStory(d) {
  return decorateStory({
    id: 900 + d.id,
    code: `ugc-draft-${d.id}`,
    title: d.title || 'Truyện chưa đặt tên',
    shortDescription: d.description || '',
    categoryCode: d.categoryCode || 'realistic',
    ageBandCode: d.ageBandCode || 'age_6_10',
    contentRating: 'G', ageGateLevel: 1, estimatedMinutes: 4,
    guestPlayAllowed: true, audio: false,
    author: { name: d.ownerName || 'Bống', kind: 'child' },
    rating: { average: 0, count: 0, hist: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    playCount: 0, art: d.art,
    startScene: (d.scenes.find((s) => s.isStart) || d.scenes[0] || {}).code,
    scenes: d.scenes.map((s) => ({
      code: s.code, art: d.art,
      text: s.text || '(trang này chưa có chữ)',
      isEnding: s.isEnding, endingCode: s.endingCode,
      choices: (s.choices || []).filter((c) => c.next || c.ending)
        .map((c) => ({ text: c.text || '(lựa chọn chưa có chữ)', next: c.next, ending: c.ending, strategy: c.strategy })),
    })),
    endings: d.endings.map((e) => ({
      code: e.code, type: 'neutral', isPositive: true, title: e.title, art: d.art,
      summaryText: (d.scenes.find((s) => s.endingCode === e.code) || {}).text || 'Câu chuyện dừng lại ở đây.',
      alternativeHint: 'Quay lại thử một nhánh khác xem con đã viết gì ở đó.',
      reflectionQuestion: 'Con muốn người đọc nghĩ gì sau khi tới đây?',
      parentTalkPrompt: 'Hỏi con: “Vì sao con cho nhân vật kết thúc như vậy?”',
    })),
  });
}
