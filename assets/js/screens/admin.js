/**
 * Mặt phẳng vận hành — biên tập và kiểm duyệt. Ngoài bốn mặt phẳng người dùng cuối.
 *
 * Báo cáo ở đây chỉ có số TỔNG HỢP theo truyện / trang / lựa chọn. Không có một dòng nào ở mức
 * cá nhân: để tối ưu nội dung thì không cần biết trẻ nào đã chọn gì.
 *
 * Không gian duyệt là màn sống quan trọng nhất của demo — nó đóng vòng lặp: bản mà bạn vừa soạn
 * ở vai tác giả, duyệt xong sẽ xuất hiện trong thư viện của trẻ.
 */

import {
  html, icon, raw, art, artPlaceholder, btn, iconBtn, badge, banner, empty, kpi, avatar,
  relTime, num, pct, skeletonRows,
} from 'wnd/ui.js';
import { adminShell, pageHead, dateRangeBar, barChart, sparkline } from 'wnd/screens/_kit.js';
import { UGC_STATUS, UGC_TRANSITIONS } from 'wnd/data/ugc.js';
import { CATEGORIES, AGE_BANDS, GATE_LEVELS, RATING_LABEL, categoryIcon } from 'wnd/data/catalog.js';
import { library, findStory } from 'wnd/data/library.js';
import { STRATEGIES } from 'wnd/data/strategies.js';
import { PROPOSALS, MODERATORS } from 'wnd/data/people.js';
import {
  KPIS, DAILY_SESSIONS, STORY_METRICS, SCENE_DROPOFF, CHOICE_DISTRIBUTION,
  PROPOSAL_STATS, AUDIO_STATS, CMS_ROWS, CMS_STATUS, DATE_RANGE,
} from 'wnd/data/analytics.js';
import { getState, transitionUgc, postThread, update } from 'wnd/state.js';
import { treeSvg } from 'wnd/flows/compose.js';

const TRANSITION_LABEL = {
  submitted: 'Nhận vào hàng đợi',
  under_review: 'Nhận duyệt',
  needs_revision: 'Yêu cầu chỉnh sửa',
  approved: 'Chấp nhận',
  published: 'Xuất bản',
  rejected: 'Không duyệt',
};

export const adminScreens = [
  {
    id: 'admin-dashboard', plane: 'ops', density: 'creator', icon: 'barChart', frame: 'desktop',
    sid: 'ADM-DASHBOARD', name: 'Tổng quan vận hành',
    desc: 'Việc cần làm hôm nay và sức khoẻ nội dung. Điểm vào của cả khu quản trị.',
    live: true,
    init: () => ({}),
    render(ctx) {
      const st = getState();
      const queue = st.ugc.filter((u) => ['submitted', 'under_review', 'needs_revision'].includes(u.status));
      const pending = PROPOSALS.filter((p) => p.status === 'pending');
      return adminShell('admin-dashboard', html`
        ${pageHead('Tổng quan', 'Việc cần xử lý và số liệu 30 ngày gần nhất.', null, 'barChart')}
        <div class="wn-cols-4" style="margin-bottom:var(--wn-space-5)">
          ${KPIS.map((k, i) => kpi(k.label, num(k.value), k.note,
            ['activity', 'checkCircle', 'handHeart', 'bookOpen'][i]))}
        </div>
        <div class="wn-two-col" style="margin-bottom:var(--wn-space-5)">
          <div class="wn-card wn-stack-3">
            <div class="wn-row"><b class="wn-label" style="flex:1">Phiên đọc theo ngày</b>
              <span class="wn-micro">${DATE_RANGE.from} → ${DATE_RANGE.to}</span></div>
            ${sparkline(DAILY_SESSIONS, { height: 130 })}
          </div>
          <div class="wn-card wn-stack-3">
            <b class="wn-label">Cần xử lý</b>
            <button type="button" class="wn-card wn-card--flat wn-row" data-act="queue"
              style="cursor:pointer;width:100%;text-align:left;padding:var(--wn-space-3)">
              <span style="color:var(--wn-warning)">${icon('layers')}</span>
              <span class="wn-stack-1" style="flex:1"><b class="wn-label">${queue.length} bản sáng tác</b>
                <span class="wn-caption">đang chờ hoặc đang trao đổi</span></span>${icon('chevronRight')}</button>
            <button type="button" class="wn-card wn-card--flat wn-row" data-act="proposals"
              style="cursor:pointer;width:100%;text-align:left;padding:var(--wn-space-3)">
              <span style="color:var(--wn-info)">${icon('message')}</span>
              <span class="wn-stack-1" style="flex:1"><b class="wn-label">${pending.length} đề xuất</b>
                <span class="wn-caption">từ phụ huynh và trẻ</span></span>${icon('chevronRight')}</button>
            <button type="button" class="wn-card wn-card--flat wn-row" data-act="stories"
              style="cursor:pointer;width:100%;text-align:left;padding:var(--wn-space-3)">
              <span style="color:var(--wn-muted)">${icon('book')}</span>
              <span class="wn-stack-1" style="flex:1"><b class="wn-label">1 truyện chờ biên tập</b>
                <span class="wn-caption">trong CMS nội dung</span></span>${icon('chevronRight')}</button>
          </div>
        </div>
        <div class="wn-card wn-stack-3">
          <b class="wn-label">Truyện được đọc nhiều nhất</b>
          ${barChart(STORY_METRICS.slice(0, 6).map((m) => ({
            label: (findStory(m.code) || {}).title || m.code, value: m.starts })))}
        </div>
      `);
    },
    act(ctx, act) {
      const map = { queue: 'admin-ugc-queue', proposals: 'admin-proposal-review', stories: 'admin-story-list' };
      if (map[act]) ctx.go('/man-hinh/' + map[act]);
    },
  },

  {
    id: 'admin-story-list', plane: 'ops', density: 'creator', icon: 'book', frame: 'desktop',
    sid: 'ADM-STORY-LIST', name: 'Danh sách truyện',
    desc: 'CMS nội dung biên tập. Trạng thái xuất bản tách hẳn khỏi vòng đời duyệt của truyện người dùng.',
    live: true,
    states: [{ id: 'default', label: 'Mặc định' }, { id: 'loading', label: 'Đang tải' }],
    init: () => ({ q: '', status: '' }),
    render(ctx) {
      if (ctx.view === 'loading') return adminShell('admin-story-list', html`${skeletonRows(9)}`);
      let rows = CMS_ROWS;
      if (ctx.local.status) rows = rows.filter((r) => r.status === ctx.local.status);
      if (ctx.local.q) rows = rows.filter((r) => {
        const s = findStory(r.code);
        return (s ? s.title : r.code).toLowerCase().includes(ctx.local.q.toLowerCase());
      });
      return adminShell('admin-story-list', html`
        ${pageHead('Truyện', `${CMS_ROWS.length} truyện trong hệ thống.`,
          btn('Tạo truyện', { kind: 'primary', act: 'new', icon: 'plus' }), 'book')}
        <div class="wn-card wn-card--flat wn-row wn-row--wrap" style="margin-bottom:var(--wn-space-4);padding:var(--wn-space-3)">
          <input class="wn-input" style="max-width:280px" placeholder="Tìm theo tên truyện…"
            data-field="q" value="${ctx.local.q}" aria-label="Tìm truyện">
          <div class="wn-row wn-row--wrap">
            ${[['', 'Tất cả'], ['published', 'Đang xuất bản'], ['review', 'Chờ biên tập'], ['draft', 'Nháp']]
              .map(([v, l]) => html`<button type="button" class="wn-chip ${ctx.local.status === v ? 'is-on' : ''}"
                data-act="status" data-arg="${v}">${l}</button>`)}
          </div>
        </div>
        <div class="wn-tablewrap"><table class="wn-table wn-table--clickable">
          <thead><tr><th>Truyện</th><th>Thể loại</th><th>Trang</th><th>Đoạn kết</th>
            <th>Trạng thái</th><th>Sửa lần cuối</th><th></th></tr></thead>
          <tbody>${rows.map((r) => {
            const s = findStory(r.code);
            const cms = CMS_STATUS[r.status];
            return html`<tr data-act="open" data-arg="${r.code}" tabindex="0" role="button"
              aria-label="Mở ${s ? s.title : r.title}">
              <td><b>${s ? s.title : r.title || 'Truyện chưa đặt tên'}</b></td>
              <td>${s ? html`${icon(categoryIcon(s.categoryCode))} ${s.categoryName}` : '—'}</td>
              <td>${r.scenes}</td><td>${r.endings}</td>
              <td>${badge(cms.label, cms.tone)}</td>
              <td>${r.updated}</td>
              <td>${icon('chevronRight')}</td>
            </tr>`;
          })}</tbody>
        </table></div>
        ${!rows.length ? empty('search', 'Không có truyện nào khớp bộ lọc', 'Thử xoá bộ lọc.',
          btn('Xoá bộ lọc', { kind: 'outline', act: 'clear' })) : ''}
      `);
    },
    act(ctx, act, arg, e, el) {
      if (act === 'status') { ctx.local.status = arg; ctx.rerender(); }
      if (act === '__field' && arg === 'q') { ctx.local.q = el.value; ctx.rerender(); }
      if (act === 'clear') { ctx.local.status = ''; ctx.local.q = ''; ctx.rerender(); }
      if (act === 'open' || act === 'new') ctx.go('/man-hinh/admin-story-edit');
    },
  },

  {
    id: 'admin-story-edit', plane: 'ops', density: 'creator', icon: 'edit', frame: 'desktop',
    sid: 'ADM-STORY-EDIT', name: 'Sửa truyện',
    desc: 'Metadata và cổng nội dung. Xuất bản chỉ mở khi graph hợp lệ — nút và lý do nằm cạnh nhau.',
    live: true,
    init: () => ({ gate: 1 }),
    render(ctx) {
      const s = findStory('wn-demo-cai-binh-vo');
      return adminShell('admin-story-edit', html`
        ${pageHead(s.title, 'Mã nội bộ ẩn với người đọc — chỉ dùng trong khu quản trị.',
          html`<div class="wn-row">${btn('Xem trước', { kind: 'outline', icon: 'eye' })}
            ${btn('Lưu', { kind: 'primary', icon: 'save', act: 'save' })}</div>`)}
        <div class="wn-aside-col">
          <div class="wn-stack-4">
            <div class="wn-card wn-stack-3">
              <b class="wn-label">Bìa truyện</b>
              <div class="wn-cover wn-cover--34">${art({ seed: s.code, motif: s.art.motif, time: s.art.time, alt: '' })}</div>
              ${btn('Đổi bìa', { kind: 'outline', sm: true, icon: 'image' })}
            </div>
            <div class="wn-card wn-stack-3">
              <b class="wn-label">Trạng thái</b>
              ${badge('Đang xuất bản', 'success', 'checkCircle')}
              <span class="wn-micro">Xuất bản lần đầu 18/08/2026</span>
              ${btn('Gỡ khỏi thư viện', { kind: 'outline', sm: true, icon: 'alertTriangle' })}
            </div>
          </div>
          <div class="wn-stack-4">
            <div class="wn-card wn-stack-4">
              <b class="wn-label">Thông tin</b>
              <div class="wn-field"><label for="a-title">Tên truyện</label>
                <input class="wn-input" id="a-title" value="${s.title}"></div>
              <div class="wn-field"><label for="a-desc">Mô tả ngắn</label>
                <textarea class="wn-textarea" id="a-desc" rows="2">${s.shortDescription}</textarea></div>
              <div class="wn-cols-2">
                <div class="wn-field"><label for="a-cat">Thể loại</label>
                  <select class="wn-select" id="a-cat">${CATEGORIES.map((c) => html`<option
                    ${raw(c.code === s.categoryCode ? 'selected' : '')}>${c.name}</option>`)}</select></div>
                <div class="wn-field"><label for="a-band">Nhóm tuổi</label>
                  <select class="wn-select" id="a-band">${AGE_BANDS.map((b) => html`<option
                    ${raw(b.code === s.ageBandCode ? 'selected' : '')}>${b.label}</option>`)}</select></div>
              </div>
              <div class="wn-cols-2">
                <div class="wn-field"><label for="a-min">Thời lượng (phút)</label>
                  <input class="wn-input" id="a-min" value="${s.estimatedMinutes}"></div>
                <div class="wn-field"><label for="a-rate">Phân loại nội dung</label>
                  <select class="wn-select" id="a-rate">${Object.entries(RATING_LABEL).map(([k, v]) => html`<option
                    ${raw(k === s.contentRating ? 'selected' : '')}>${v}</option>`)}</select></div>
              </div>
              <label class="wn-row" style="gap:10px;cursor:pointer">
                <input type="checkbox" checked style="width:20px;height:20px;accent-color:var(--wn-accent)">
                <span class="wn-compact">Cho khách chơi thử không cần đăng nhập</span></label>
            </div>

            <div class="wn-card wn-stack-3">
              <b class="wn-label">${icon('shield')} Cổng nội dung</b>
              <p class="wn-caption">Chọn mức chặt nhất mà truyện này cần. Mức càng cao càng nhiều điều kiện.</p>
              ${GATE_LEVELS.map((g) => html`<label class="wn-row wn-row--top" style="gap:10px;cursor:pointer">
                <input type="radio" name="gate" ${raw(ctx.local.gate === g.level ? 'checked' : '')}
                  data-act="gate" data-arg="${g.level}" style="width:18px;height:18px;margin-top:3px;accent-color:var(--wn-accent)">
                <span class="wn-stack-1"><b class="wn-label">Mức ${g.level} — ${g.name}</b>
                  <span class="wn-caption">${g.note}</span></span></label>`)}
            </div>

            <div class="wn-card wn-stack-3">
              <b class="wn-label">Kiểm tra trước khi xuất bản</b>
              ${['Có đúng một trang mở đầu', 'Mọi lựa chọn đều có đích', 'Mọi trang đều tới được',
                 'Có ít nhất một đoạn kết tới được', 'Bìa đúng tỉ lệ 9:16']
                .map((t) => html`<div class="wn-row" style="gap:10px">
                  <span style="color:var(--wn-success)">${icon('checkCircle')}</span>
                  <span class="wn-compact">${t}</span></div>`)}
              ${banner('Graph hợp lệ. Truyện đủ điều kiện xuất bản.', 'success')}
            </div>
          </div>
        </div>
      `);
    },
    act(ctx, act, arg) {
      if (act === 'gate') { ctx.local.gate = Number(arg); ctx.rerender(); }
      if (act === 'save') ctx.toast('Đã lưu.');
    },
  },

  {
    id: 'admin-scene-editor', plane: 'ops', density: 'creator', icon: 'image', frame: 'desktop',
    sid: 'ADM-SCENE-EDITOR', name: 'Editor trang truyện',
    desc: 'Danh sách trang bên trái, nội dung bên phải. Đổi thứ tự bằng kéo thả, xoá luôn hoàn tác được.',
    live: true,
    init: () => ({ i: 0 }),
    render(ctx) {
      const s = findStory('wn-demo-cai-binh-vo');
      const scene = s.scenes[Math.min(ctx.local.i, s.scenes.length - 1)];
      return adminShell('admin-scene-editor', html`
        ${pageHead(`${s.title} · trang truyện`, `${s.scenes.length} trang, ${s.endings.length} đoạn kết.`,
          btn('Lưu', { kind: 'primary', icon: 'save', act: 'save' }))}
        <div class="wn-aside-col">
          <div class="wn-card wn-card--pad0" style="overflow:hidden">
            ${s.scenes.map((sc, i) => html`<button type="button" data-act="pick" data-arg="${i}"
              style="display:flex;gap:10px;align-items:center;width:100%;text-align:left;border:0;cursor:pointer;
                padding:var(--wn-space-3) var(--wn-space-4);min-height:44px;
                border-top:${i ? '1px solid var(--wn-border)' : '0'};
                background:${i === ctx.local.i ? 'color-mix(in srgb, var(--wn-accent) 10%, transparent)' : 'transparent'}">
              <span class="wn-choice__num">${i + 1}</span>
              <span class="wn-stack-1" style="flex:1;min-width:0">
                <b class="wn-label" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                  >${sc.text.split('\n')[0]}</b>
                <span class="wn-micro">${(sc.choices || []).length} lựa chọn</span></span>
              ${icon('moreVertical')}
            </button>`)}
          </div>
          <div class="wn-stack-4">
            <div class="wn-two-col">
              <div class="wn-card wn-stack-3">
                <b class="wn-label">Ảnh của trang</b>
                <div class="wn-cover wn-cover--916" style="max-width:220px">
                  ${art({ seed: s.code + scene.code, motif: scene.art?.motif, time: scene.art?.time, alt: '' })}</div>
                <div class="wn-row">${btn('Đổi ảnh', { kind: 'outline', sm: true, icon: 'image' })}
                  ${btn('Cắt 9:16', { kind: 'ghost', sm: true, icon: 'crop' })}</div>
              </div>
              <div class="wn-card wn-stack-3">
                <div class="wn-field"><label for="sc-text">Nội dung</label>
                  <textarea class="wn-textarea" id="sc-text" rows="4">${scene.text}</textarea>
                  <span class="wn-hint">1–3 dòng. Xuống dòng bằng Enter.</span></div>
                <div class="wn-field"><label for="sc-audio">Giọng kể</label>
                  <div class="wn-row"><input class="wn-input" id="sc-audio" value="giong-ke-trang-${ctx.local.i + 1}.m4a" readonly>
                    ${iconBtn('play', { label: 'Nghe thử' })}${iconBtn('trash', { label: 'Xoá âm thanh' })}</div></div>
                <label class="wn-row" style="gap:10px;cursor:pointer">
                  <input type="checkbox" ${raw(ctx.local.i === 0 ? 'checked' : '')}
                    style="width:20px;height:20px;accent-color:var(--wn-accent)">
                  <span class="wn-compact">Trang mở đầu</span></label>
              </div>
            </div>
            <div class="wn-card wn-stack-3">
              <b class="wn-label">Cây nhánh của truyện</b>
              <div class="wn-tree">${treeSvg({
                scenes: s.scenes.map((sc, i) => ({ code: sc.code, text: sc.text,
                  isStart: i === 0, isEnding: false, choices: sc.choices || [] })),
                endings: s.endings,
              }, scene.code)}</div>
            </div>
          </div>
        </div>
      `);
    },
    act(ctx, act, arg) {
      if (act === 'pick') { ctx.local.i = Number(arg); ctx.rerender(); }
      if (act === 'save') ctx.toast('Đã lưu trang truyện.');
    },
  },

  {
    id: 'admin-choice-edit', plane: 'ops', density: 'creator', icon: 'gitBranch', frame: 'desktop',
    sid: 'ADM-CHOICE-EDIT', name: 'Editor lựa chọn',
    desc: 'Nơi gắn chiến lược cho một lựa chọn. Không có trọng số, không có điểm — có hoặc không.',
    live: true,
    init: () => ({ i: 0 }),
    render(ctx) {
      const s = findStory('wn-demo-cai-binh-vo');
      const scene = s.scenes[0];
      return adminShell('admin-choice-edit', html`
        ${pageHead('Lựa chọn của trang 1', scene.text.split('\n')[0],
          btn('Lưu', { kind: 'primary', icon: 'save', act: 'save' }))}
        ${banner('Gắn chiến lược là cách tác giả nói “lựa chọn này thể hiện điều gì”. '
          + 'Không có chiến lược tiêu cực, không có trọng số. Bỏ trống là câu trả lời hợp lệ.', 'info')}
        <div class="wn-stack-3" style="margin-top:var(--wn-space-4)">
          ${scene.choices.map((c, i) => html`<div class="wn-card wn-stack-3">
            <div class="wn-row">
              <span class="wn-choice__num">${i + 1}</span>
              <input class="wn-input" value="${c.text}" aria-label="Chữ của lựa chọn ${i + 1}">
              ${iconBtn('trash', { label: 'Xoá lựa chọn' })}
            </div>
            <div class="wn-cols-2">
              <div class="wn-field"><label>Dẫn tới</label>
                <select class="wn-select">
                  ${s.scenes.map((sc, si) => html`<option ${raw(sc.code === c.next ? 'selected' : '')}
                    >Trang ${si + 1} — ${sc.text.split('\n')[0].slice(0, 28)}…</option>`)}
                  ${s.endings.map((en) => html`<option ${raw(en.code === c.ending ? 'selected' : '')}
                    >Đoạn kết — ${en.title}</option>`)}
                </select></div>
              <div class="wn-field"><label>Giọng đọc lựa chọn</label>
                <input class="wn-input" value="${c.text ? 'chua-gan.m4a' : ''}" placeholder="Chưa gắn"></div>
            </div>
            <div class="wn-field">
              <label>Chiến lược thể hiện qua lựa chọn này</label>
              <div class="wn-row wn-row--wrap">
                ${STRATEGIES.map((st) => html`<button type="button"
                  class="wn-chip ${c.strategy === st.code ? 'is-on' : ''}" data-act="noop"
                  aria-pressed="${c.strategy === st.code ? 'true' : 'false'}">${icon(st.icon)}${st.name}</button>`)}
              </div>
              <span class="wn-hint">${c.strategy
                ? 'Trẻ chọn nhánh này lần đầu sẽ thấy chip “Cách mới”.'
                : 'Chưa gắn — lựa chọn này không ghi gì vào sổ của trẻ.'}</span>
            </div>
          </div>`)}
          ${btn('Thêm lựa chọn', { kind: 'outline', act: 'noop', icon: 'plus' })}
        </div>
      `);
    },
    act(ctx, act) { if (act === 'save' || act === 'noop') ctx.toast('Thay đổi được lưu khi bấm Lưu.'); },
  },

  {
    id: 'admin-ending-edit', plane: 'ops', density: 'creator', icon: 'flag', frame: 'desktop',
    sid: 'ADM-ENDING-EDIT', name: 'Editor đoạn kết',
    desc: 'Năm khối của màn kết được soạn ở đây, kể cả câu hỏi suy ngẫm và thẻ trò chuyện cùng bố mẹ.',
    live: true,
    init: () => ({ i: 0 }),
    render(ctx) {
      const s = findStory('wn-demo-cai-binh-vo');
      const en = s.endings[Math.min(ctx.local.i, s.endings.length - 1)];
      return adminShell('admin-ending-edit', html`
        ${pageHead(`${s.title} · đoạn kết`, `${s.endings.length} đoạn kết trong truyện này.`,
          btn('Lưu', { kind: 'primary', icon: 'save', act: 'save' }))}
        <div class="wn-row wn-row--wrap" style="margin-bottom:var(--wn-space-4)">
          ${s.endings.map((e, i) => html`<button type="button" class="wn-chip ${i === ctx.local.i ? 'is-on' : ''}"
            data-act="pick" data-arg="${i}">${icon(e.isPositive ? 'award' : 'flag')}${e.title}</button>`)}
        </div>
        <div class="wn-aside-col">
          <div class="wn-card wn-stack-3">
            <b class="wn-label">Tranh đoạn kết</b>
            <div class="wn-cover wn-cover--916">
              ${art({ seed: s.code + en.code, motif: en.art?.motif, time: en.art?.time, alt: '' })}</div>
            <label class="wn-row" style="gap:10px;cursor:pointer">
              <input type="checkbox" ${raw(en.isPositive ? 'checked' : '')}
                style="width:20px;height:20px;accent-color:var(--wn-accent)">
              <span class="wn-compact">Đoạn kết tích cực</span></label>
            <span class="wn-hint">Chỉ đoạn kết tích cực mới có pháo giấy. Bật cho mọi đoạn kết là biến
              phần thưởng thành thứ vô nghĩa.</span>
          </div>
          <div class="wn-card wn-stack-4">
            <div class="wn-field"><label for="e-title">Tiêu đề</label>
              <input class="wn-input" id="e-title" value="${en.title}"></div>
            <div class="wn-field"><label for="e-sum">1 · Điều đã xảy ra</label>
              <textarea class="wn-textarea" id="e-sum" rows="3">${en.summaryText}</textarea>
              <span class="wn-hint">Kể lại, không phán xét. Tránh “sai rồi”, “con thua rồi”.</span></div>
            <div class="wn-field"><label for="e-alt">2 · Một cách khác có thể là…</label>
              <textarea class="wn-textarea" id="e-alt" rows="2">${en.alternativeHint}</textarea></div>
            <div class="wn-field"><label for="e-q">3 · Câu hỏi suy ngẫm</label>
              <textarea class="wn-textarea" id="e-q" rows="2">${en.reflectionQuestion}</textarea></div>
            <div class="wn-field"><label>4 · Cách con đã dùng</label>
              <div class="wn-banner wn-banner--info">${icon('info')}
                <div>Khối này sinh tự động từ những chiến lược trẻ đã chọn trên đường đi. Không soạn tay.</div></div></div>
            <div class="wn-field"><label for="e-parent">5 · Thẻ trò chuyện cùng bố mẹ</label>
              <textarea class="wn-textarea" id="e-parent" rows="2">${en.parentTalkPrompt}</textarea>
              <span class="wn-hint">Một câu để người lớn hỏi con tối nay.</span></div>
          </div>
        </div>
      `);
    },
    act(ctx, act, arg) {
      if (act === 'pick') { ctx.local.i = Number(arg); ctx.rerender(); }
      if (act === 'save') ctx.toast('Đã lưu đoạn kết.');
    },
  },

  {
    id: 'admin-proposal-review', plane: 'ops', density: 'creator', icon: 'message', frame: 'desktop',
    sid: 'ADM-PROPOSAL-REVIEW', name: 'Duyệt đề xuất',
    desc: 'Đề xuất “cách khác” từ trẻ và phụ huynh. Một chiều — trả lời bằng một câu, không mở thread.',
    live: true,
    init: () => ({ open: 302 }),
    render(ctx) {
      const st = getState();
      const sent = st.proposalsSent.map((p, i) => ({ id: 900 + i, ...p, rationale: 'Gửi từ trình phát trong phiên demo.', reply: null }));
      const rows = [...sent, ...PROPOSALS];
      const active = rows.find((p) => p.id === ctx.local.open) || rows[0];
      const tone = { pending: ['Chờ duyệt', 'warning'], approved: ['Đã tiếp nhận', 'success'], rejected: ['Không dùng', 'neutral'] };
      return adminShell('admin-proposal-review', html`
        ${pageHead('Đề xuất người dùng', `${rows.filter((p) => p.status === 'pending').length} đề xuất đang chờ.`)}
        <div class="wn-aside-col">
          <div class="wn-stack-2">
            ${rows.map((p) => {
              const s = findStory(p.storyCode);
              return html`<button type="button" class="wn-card wn-card--flat wn-stack-2" data-act="open" data-arg="${p.id}"
                style="cursor:pointer;text-align:left;width:100%;padding:var(--wn-space-3);
                  border-color:${active && p.id === active.id ? 'var(--wn-accent)' : 'var(--wn-border)'}">
                <div class="wn-row"><b class="wn-label" style="flex:1">${s ? s.title : '—'}</b>
                  ${badge(tone[p.status][0], tone[p.status][1])}</div>
                <span class="wn-caption" style="display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;
                  -webkit-box-orient:vertical;overflow:hidden">${p.idea}</span>
                <span class="wn-micro">${relTime(p.at)}</span>
              </button>`;
            })}
          </div>
          ${active ? html`<div class="wn-card wn-stack-4">
            <div class="wn-row wn-row--wrap">
              <b class="wn-title" style="flex:1">${(findStory(active.storyCode) || {}).title || '—'}</b>
              ${badge(tone[active.status][0], tone[active.status][1])}
            </div>
            <div class="wn-stack-1"><b class="wn-label">Nội dung đề xuất</b><p class="wn-compact">${active.idea}</p></div>
            <div class="wn-stack-1"><b class="wn-label">Lý do người gửi đưa ra</b>
              <p class="wn-compact wn-dim">${active.rationale}</p></div>
            <hr class="wn-divider">
            <div class="wn-field"><label for="p-reply">Trả lời người gửi</label>
              <textarea class="wn-textarea" id="p-reply" rows="3"
                placeholder="Ngôn ngữ trung tính, cảm ơn trước khi từ chối.">${active.reply || ''}</textarea></div>
            <div class="wn-row wn-row--wrap">
              ${btn('Tiếp nhận vào backlog nội dung', { kind: 'primary', act: 'accept', icon: 'check' })}
              ${btn('Không dùng lần này', { kind: 'outline', act: 'reject' })}
            </div>
          </div>` : ''}
        </div>
      `);
    },
    act(ctx, act, arg) {
      if (act === 'open') { ctx.local.open = Number(arg); ctx.rerender(); }
      if (act === 'accept') ctx.toast('Đã tiếp nhận và trả lời người gửi.');
      if (act === 'reject') ctx.toast('Đã trả lời. Đề xuất được đánh dấu không dùng lần này.');
    },
  },

  {
    id: 'admin-ugc-queue', plane: 'ops', density: 'creator', icon: 'layers', frame: 'desktop',
    sid: 'ADM-UGC-QUEUE', name: 'Hàng đợi sáng tác',
    desc: 'Mọi bản của người dùng và trạng thái hiện tại. Bản bạn vừa gửi ở vai tác giả nằm ngay đây.',
    live: true,
    states: [{ id: 'default', label: 'Mặc định' }, { id: 'loading', label: 'Đang tải' }],
    init: () => ({ status: '' }),
    render(ctx) {
      if (ctx.view === 'loading') return adminShell('admin-ugc-queue', html`${skeletonRows(7)}`);
      const st = getState();
      let rows = st.ugc;
      if (ctx.local.status) rows = rows.filter((u) => u.status === ctx.local.status);
      return adminShell('admin-ugc-queue', html`
        ${pageHead('Hàng đợi sáng tác', `${st.ugc.length} bản trong hệ thống.`, null, 'layers')}
        <div class="wn-card wn-card--flat wn-row wn-row--wrap" style="margin-bottom:var(--wn-space-4);padding:var(--wn-space-3)">
          <input class="wn-input" style="max-width:260px" placeholder="Tìm theo tên truyện…" aria-label="Tìm">
          <div class="wn-row wn-row--wrap">
            <button type="button" class="wn-chip ${!ctx.local.status ? 'is-on' : ''}" data-act="f" data-arg="">Tất cả</button>
            ${Object.entries(UGC_STATUS).map(([k, v]) => html`<button type="button"
              class="wn-chip ${ctx.local.status === k ? 'is-on' : ''}" data-act="f" data-arg="${k}"
              >${icon(v.icon)}${v.label}</button>`)}
          </div>
        </div>
        <div class="wn-tablewrap"><table class="wn-table wn-table--clickable">
          <thead><tr><th>Truyện</th><th>Tác giả</th><th>Trang</th><th>Trạng thái</th>
            <th>Cập nhật</th><th>Trao đổi</th><th></th></tr></thead>
          <tbody>${rows.map((u) => {
            const s = UGC_STATUS[u.status];
            const msgs = u.thread.filter((m) => m.role !== 'system').length;
            return html`<tr data-act="open" data-arg="${u.id}" tabindex="0" role="button"
              aria-label="Mở bản ${u.title}">
              <td><b>${u.title}</b><br><span class="wn-micro">${u.description.slice(0, 54)}</span></td>
              <td><span class="wn-row" style="gap:8px">${avatar(u.ownerName, { size: 24 })}${u.ownerName}</span></td>
              <td>${u.scenes.length}</td>
              <td>${badge(s.label, s.tone, s.icon)}</td>
              <td>${relTime(u.updatedAt)}</td>
              <td>${msgs ? `${msgs} tin` : html`<span class="wn-quiet">—</span>`}</td>
              <td>${icon('chevronRight')}</td>
            </tr>`;
          })}</tbody>
        </table></div>
        ${!rows.length ? empty('layers', 'Không có bản nào trong bộ lọc này',
          'Bỏ bộ lọc để xem toàn bộ hàng đợi.', btn('Xoá bộ lọc', { kind: 'outline', act: 'f', arg: '' })) : ''}
      `);
    },
    act(ctx, act, arg) {
      if (act === 'f') { ctx.local.status = arg || ''; ctx.rerender(); }
      if (act === 'open') {
        update((s) => { s.reviewingUgcId = Number(arg); });
        ctx.go('/man-hinh/admin-ugc-workspace');
      }
    },
  },

  {
    id: 'admin-ugc-workspace', plane: 'ops', density: 'creator', icon: 'eye', frame: 'desktop',
    sid: 'ADM-UGC-WORKSPACE', name: 'Không gian duyệt',
    desc: 'Ba cột: thông tin · truyện · trao đổi. Chấp nhận và xuất bản ở đây thì thư viện của trẻ có ngay.',
    live: true,
    init: () => ({ reply: '', dialog: null, note: '', publicNote: '' }),
    render(ctx) {
      const st = getState();
      const queue = st.ugc;
      const u = queue.find((x) => x.id === st.reviewingUgcId)
        || queue.find((x) => x.status !== 'draft') || queue[0];
      if (!u) return adminShell('admin-ugc-workspace', empty('layers', 'Hàng đợi trống', 'Chưa có bản nào để duyệt.'));
      const s = UGC_STATUS[u.status];
      /* `submitted` là hành động của TÁC GIẢ (gửi / gửi lại), không phải của biên tập —
         nên nút đó không xuất hiện ở đây dù vòng đời cho phép. */
      const allowed = (UGC_TRANSITIONS[u.status] || []).filter((t) => t !== 'submitted');

      return adminShell('admin-ugc-workspace', html`
        ${pageHead(u.title, `Tác giả ${u.ownerName} · cập nhật ${relTime(u.updatedAt)}`,
          html`<div class="wn-row">${badge(s.label, s.tone, s.icon)}
            ${btn('Về hàng đợi', { kind: 'ghost', act: 'queue', icon: 'arrowLeft' })}</div>`)}

        <div style="display:grid;gap:var(--wn-space-5);grid-template-columns:230px minmax(0,1fr) 330px;align-items:start">

          <div class="wn-stack-3">
            <div class="wn-card wn-card--pad0">
              ${queue.map((q, i) => html`<button type="button" data-act="pick" data-arg="${q.id}"
                style="display:grid;gap:3px;width:100%;text-align:left;border:0;cursor:pointer;
                  padding:var(--wn-space-3);border-top:${i ? '1px solid var(--wn-border)' : '0'};
                  background:${q.id === u.id ? 'color-mix(in srgb, var(--wn-accent) 10%, transparent)' : 'transparent'}">
                <b class="wn-label" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q.title}</b>
                <span>${badge(UGC_STATUS[q.status].label, UGC_STATUS[q.status].tone)}</span>
              </button>`)}
            </div>
            <div class="wn-card wn-stack-2">
              <b class="wn-label">Thông tin</b>
              <div class="wn-cover wn-cover--916">${u.scenes.length
                ? art({ seed: 'ugc' + u.id, motif: u.art.motif, time: u.art.time, alt: '' })
                : artPlaceholder('Chưa có bìa')}</div>
              <span class="wn-micro">Thể loại: ${(CATEGORIES.find((c) => c.code === u.categoryCode) || {}).name || '—'}</span>
              <span class="wn-micro">Dành cho: ${(AGE_BANDS.find((b) => b.code === u.ageBandCode) || {}).label || '—'}</span>
              <span class="wn-micro">Tạo: ${relTime(u.createdAt)}</span>
            </div>
          </div>

          <div class="wn-stack-3">
            <div class="wn-card wn-stack-3">
              <b class="wn-label">Cây nhánh</b>
              <div class="wn-tree">${treeSvg({
                scenes: u.scenes.map((sc) => ({ code: sc.code, text: sc.text || '',
                  isStart: !!sc.isStart, isEnding: !!sc.isEnding, choices: sc.choices || [] })),
                endings: u.endings || [],
              })}</div>
            </div>
            <div class="wn-card wn-stack-3">
              <b class="wn-label">Nội dung (chỉ đọc)</b>
              ${u.scenes.map((sc, i) => html`<div class="wn-card wn-card--flat wn-stack-2" style="padding:var(--wn-space-3)">
                <div class="wn-row"><span class="wn-choice__num">${i + 1}</span>
                  ${sc.isStart ? badge('Mở đầu', 'info', 'flag') : ''}
                  ${sc.isEnding ? badge('Trang kết', 'success', 'award') : ''}</div>
                <p class="wn-compact" style="white-space:pre-line">${sc.text || '(chưa có chữ)'}</p>
                ${(sc.choices || []).length ? html`<div class="wn-stack-1">
                  ${sc.choices.map((c, ci) => html`<span class="wn-micro">${ci + 1}. ${c.text || '(chưa có chữ)'}
                    ${c.next ? `→ trang ${u.scenes.findIndex((x) => x.code === c.next) + 1}`
                             : c.ending ? '→ đoạn kết' : '— chưa nối'}</span>`)}
                </div>` : ''}
              </div>`)}
            </div>
          </div>

          <div class="wn-stack-3">
            <div class="wn-card wn-stack-3">
              <b class="wn-label">Trao đổi với tác giả</b>
              <div class="wn-thread" style="max-height:280px;overflow:auto">
                ${u.thread.length ? u.thread.map((m) => html`<div class="wn-msg wn-msg--${m.role === 'staff' ? 'author' : m.role}">
                  ${m.role !== 'system' ? html`<span class="wn-msg__meta">
                    ${m.role === 'staff' ? 'Bạn' : u.ownerName} · ${relTime(m.at)}</span>` : ''}
                  <div class="wn-msg__bubble">${m.anchor ? html`<span class="wn-badge wn-badge--neutral"
                    style="margin-bottom:6px">${icon('fileText')}${m.anchor}</span><br>` : ''}${m.body}</div>
                </div>`) : html`<p class="wn-caption">Chưa có tin nào.</p>`}
              </div>
              <div class="wn-field">
                <label for="w-reply">Nhắn cho tác giả</label>
                <textarea class="wn-textarea" id="w-reply" rows="3" data-field="reply"
                  placeholder="Nói rõ chỗ nào cần sửa và vì sao."></textarea>
              </div>
              ${btn('Gửi tin', { kind: 'secondary', block: true, act: 'send', icon: 'send' })}
            </div>

            <div class="wn-card wn-stack-3">
              <b class="wn-label">Chuyển trạng thái</b>
              ${allowed.length ? html`<div class="wn-stack-2">
                ${allowed.map((to) => html`${btn(TRANSITION_LABEL[to] || to, {
                  kind: to === 'rejected' ? 'outline' : to === 'published' || to === 'approved' ? 'primary' : 'secondary',
                  block: true, act: 'to', arg: to,
                  icon: UGC_STATUS[to].icon })}`)}
              </div>` : html`<p class="wn-caption">Trạng thái này là điểm cuối, không chuyển đi đâu được nữa.</p>`}
              <span class="wn-micro">${icon('info')} Vòng đời: nháp → gửi → đang duyệt ⇄ cần chỉnh sửa →
                chấp nhận → xuất bản. Có nhánh không duyệt, và có đường gỡ bài.</span>
            </div>
          </div>
        </div>

        ${ctx.local.dialog === 'reject' ? html`
          <div class="wn-scrim" data-act="close"></div>
          <div class="wn-dialog" role="dialog" aria-modal="true" aria-label="Từ chối bản gửi">
            <div class="wn-stack-4">
              <b class="wn-title">Không duyệt bản này</b>
              <div class="wn-field"><label for="r-int">Lý do nội bộ <span style="color:var(--wn-danger)">*</span></label>
                <textarea class="wn-textarea" id="r-int" rows="2" data-field="note"
                  placeholder="Chỉ đội duyệt đọc được."></textarea></div>
              <div class="wn-field"><label for="r-pub">Thông báo cho tác giả <span style="color:var(--wn-danger)">*</span></label>
                <textarea class="wn-textarea" id="r-pub" rows="3" data-field="publicNote"
                  placeholder="Giọng trung tính. Cảm ơn trước, rồi nói lý do ngắn gọn."></textarea>
                <span class="wn-hint">Tác giả là trẻ em. Câu này con sẽ đọc.</span></div>
              <div class="wn-row">
                ${btn('Xác nhận không duyệt', { kind: 'danger', act: 'reject-ok' })}
                ${btn('Huỷ', { kind: 'ghost', act: 'close' })}
              </div>
            </div>
          </div>` : ''}
      `);
    },
    act(ctx, act, arg, e, el) {
      const st = getState();
      const queue = st.ugc;
      const u = queue.find((x) => x.id === st.reviewingUgcId)
        || queue.find((x) => x.status !== 'draft') || queue[0];
      if (!u) return;

      if (act === 'pick') update((s) => { s.reviewingUgcId = Number(arg); });
      if (act === 'queue') ctx.go('/man-hinh/admin-ugc-queue');
      if (act === 'close') { ctx.local.dialog = null; ctx.rerender(); }
      if (act === '__field') { ctx.local[arg] = el.value; }

      if (act === 'send') {
        const t = (ctx.local.reply || '').trim();
        if (!t) { ctx.toast('Viết nội dung trước khi gửi.'); return; }
        postThread(u.id, { role: 'staff', author: MODERATORS[0].name, body: t });
        ctx.local.reply = '';
        ctx.rerender();
        ctx.toast('Đã gửi tin. Tác giả nhìn thấy ngay trong phần Trao đổi.');
      }

      if (act === 'to') {
        if (arg === 'rejected') { ctx.local.dialog = 'reject'; ctx.rerender(); return; }
        const note = {
          under_review: 'Đội duyệt đã nhận bản này và đang đọc.',
          needs_revision: (ctx.local.reply || '').trim() || 'Đội duyệt muốn tác giả chỉnh vài chỗ.',
          approved: 'Bản này đã được chấp nhận.',
          published: 'Truyện đã được xuất bản vào thư viện.',
        }[arg];
        update((s) => { s.reviewingUgcId = u.id; });
        transitionUgc(u.id, arg, note, arg === 'needs_revision' ? 'staff' : 'system');
        ctx.local.reply = '';
        ctx.rerender();
        ctx.toast(arg === 'published'
          ? 'Đã xuất bản. Mở thư viện của trẻ để thấy truyện này.'
          : `Đã chuyển sang “${UGC_STATUS[arg].label}”.`);
      }

      if (act === 'reject-ok') {
        if (!(ctx.local.note || '').trim() || !(ctx.local.publicNote || '').trim()) {
          ctx.toast('Cần cả lý do nội bộ và thông báo cho tác giả.');
          return;
        }
        transitionUgc(u.id, 'rejected', ctx.local.publicNote.trim(), 'staff');
        ctx.local.dialog = null;
        ctx.local.note = '';
        ctx.local.publicNote = '';
        ctx.rerender();
        ctx.toast('Đã đánh dấu không duyệt và gửi thông báo cho tác giả.');
      }
    },
  },

  {
    id: 'admin-report-home', plane: 'ops', density: 'creator', icon: 'trendingUp', frame: 'desktop',
    sid: 'ADM-REPORT-HOME', name: 'Báo cáo · tổng quan',
    desc: 'Khung chung của mọi tab báo cáo: khoảng thời gian, múi giờ, xuất CSV, và KPI tổng.',
    live: true,
    init: () => ({}),
    render() {
      return adminShell('admin-report-home', html`
        ${pageHead('Báo cáo', 'Số liệu tổng hợp. Không có dòng nào ở mức cá nhân.', null, 'trendingUp')}
        ${dateRangeBar(DATE_RANGE)}
        ${banner('Báo cáo chỉ hiển thị metric tổng hợp theo truyện, trang và lựa chọn. '
          + 'Không liệt kê tên trẻ, email hay bất kỳ định danh cá nhân nào.', 'info', 'shield')}
        <div class="wn-cols-4" style="margin:var(--wn-space-5) 0">
          ${KPIS.map((k, i) => kpi(k.label, num(k.value), k.note,
            ['activity', 'checkCircle', 'handHeart', 'bookOpen'][i]))}
        </div>
        <div class="wn-card wn-stack-3" style="margin-bottom:var(--wn-space-5)">
          <b class="wn-label">Phiên đọc theo ngày</b>
          ${sparkline(DAILY_SESSIONS, { height: 170 })}
          <span class="wn-micro">Cuối tuần luôn cao hơn — đúng với hành vi đọc cùng bố mẹ.</span>
        </div>
        <div class="wn-cols-3">
          ${[['admin-report-stories', 'barChart', 'Hiệu năng truyện', 'Bắt đầu, hoàn thành, tỉ lệ đọc trọn.'],
             ['admin-report-scenes', 'trendingUp', 'Rơi rụng theo trang', 'Người đọc bỏ ở trang nào.'],
             ['admin-report-choices', 'gitBranch', 'Phân bố lựa chọn', 'Nhánh nào được chọn nhiều.'],
             ['admin-report-proposals', 'message', 'Thống kê đề xuất', 'Người dùng góp ý ở truyện nào.'],
             ['admin-report-audio', 'volume', 'Sử dụng âm thanh', 'Nghe, nghe lại, nghe hết.'],
            ].map(([id, ic, t, b]) => html`<button type="button" class="wn-card wn-stack-2"
              data-act="go" data-arg="${id}" style="cursor:pointer;text-align:left">
              <span style="color:var(--wn-accent)">${icon(ic)}</span>
              <b class="wn-label">${t}</b><span class="wn-caption">${b}</span></button>`)}
        </div>
      `);
    },
    act(ctx, act, arg) { if (act === 'go') ctx.go('/man-hinh/' + arg); },
  },

  {
    id: 'admin-report-stories', plane: 'ops', density: 'creator', icon: 'barChart', frame: 'desktop',
    sid: 'ADM-REPORT-STORIES', name: 'Báo cáo · hiệu năng truyện',
    desc: 'Bảng sắp xếp được: bắt đầu, hoàn thành, tỉ lệ đọc trọn, thời lượng trung bình.',
    live: true,
    init: () => ({ sort: 'starts' }),
    render(ctx) {
      const rows = [...STORY_METRICS].sort((a, b) => {
        if (ctx.local.sort === 'rate') return (b.completes / b.starts) - (a.completes / a.starts);
        if (ctx.local.sort === 'minutes') return b.minutes - a.minutes;
        return b[ctx.local.sort] - a[ctx.local.sort];
      });
      const head = [['starts', 'Bắt đầu'], ['completes', 'Hoàn thành'], ['rate', 'Tỉ lệ đọc trọn'], ['minutes', 'Phút trung bình']];
      return adminShell('admin-report-stories', html`
        ${pageHead('Hiệu năng truyện', 'Sắp xếp bằng cách bấm vào tiêu đề cột.', null, 'barChart')}
        ${dateRangeBar(DATE_RANGE)}
        <div class="wn-tablewrap" style="margin-top:var(--wn-space-4)"><table class="wn-table">
          <thead><tr><th>Truyện</th>
            ${head.map(([k, l]) => html`<th style="cursor:pointer" data-act="sort" data-arg="${k}"
              aria-sort="${ctx.local.sort === k ? 'descending' : 'none'}">
              ${l}${ctx.local.sort === k ? icon('sortDown') : ''}</th>`)}
          </tr></thead>
          <tbody>${rows.map((m) => {
            const s = findStory(m.code);
            const rate = m.completes / m.starts;
            return html`<tr>
              <td><b>${s ? s.title : m.code}</b><br><span class="wn-micro">${s ? s.categoryName : ''}</span></td>
              <td>${num(m.starts)}</td>
              <td>${num(m.completes)}</td>
              <td><span class="wn-row" style="gap:8px">
                <span style="width:64px;height:8px;border-radius:999px;overflow:hidden;
                  background:color-mix(in srgb, var(--wn-border) 70%, transparent)">
                  <span style="display:block;height:100%;width:${Math.round(rate * 100)}%;
                    background:${rate > 0.7 ? 'var(--wn-success)' : rate > 0.55 ? 'var(--wn-accent)' : 'var(--wn-warning)'}"></span>
                </span><b>${pct(rate)}</b></span></td>
              <td>${String(m.minutes).replace('.', ',')}′</td>
            </tr>`;
          })}</tbody>
        </table></div>
      `);
    },
    act(ctx, act, arg) { if (act === 'sort') { ctx.local.sort = arg; ctx.rerender(); } },
  },

  {
    id: 'admin-report-scenes', plane: 'ops', density: 'creator', icon: 'trendingUp', frame: 'desktop',
    sid: 'ADM-REPORT-SCENES', name: 'Báo cáo · rơi rụng theo trang',
    desc: 'Trang nào người đọc bỏ nhiều nhất. Đây là chỗ đội nội dung nhìn để biết cần viết lại đoạn nào.',
    live: true,
    init: () => ({ story: 'wn-demo-ban-ru-tron-hoc' }),
    render(ctx) {
      const rows = SCENE_DROPOFF[ctx.local.story] || [];
      const worst = rows.reduce((a, b) => (b.left / b.entered > a.left / a.entered ? b : a), rows[0]);
      return adminShell('admin-report-scenes', html`
        ${pageHead('Rơi rụng theo trang', 'Chọn một truyện để xem người đọc dừng lại ở đâu.', null, 'trendingUp')}
        ${dateRangeBar(DATE_RANGE)}
        <div class="wn-row wn-row--wrap" style="margin:var(--wn-space-4) 0">
          ${Object.keys(SCENE_DROPOFF).map((code) => html`<button type="button"
            class="wn-chip ${ctx.local.story === code ? 'is-on' : ''}" data-act="s" data-arg="${code}"
            >${(findStory(code) || {}).title || code}</button>`)}
        </div>
        ${worst ? banner(`Rơi nhiều nhất ở “${worst.scene}” — ${pct(worst.left / worst.entered)} người đọc dừng tại đây.`,
          'warning') : ''}
        <div class="wn-tablewrap" style="margin-top:var(--wn-space-4)"><table class="wn-table">
          <thead><tr><th>Trang</th><th>Vào trang</th><th>Rời tại đây</th><th>Tỉ lệ rời</th></tr></thead>
          <tbody>${rows.map((r) => {
            const rate = r.left / r.entered;
            return html`<tr>
              <td><b>${r.scene}</b></td><td>${num(r.entered)}</td><td>${num(r.left)}</td>
              <td><span class="wn-row" style="gap:8px">
                <span style="width:80px;height:8px;border-radius:999px;overflow:hidden;
                  background:color-mix(in srgb, var(--wn-border) 70%, transparent)">
                  <span style="display:block;height:100%;width:${Math.round(rate * 320)}%;max-width:100%;
                    background:${rate > 0.2 ? 'var(--wn-danger)' : rate > 0.1 ? 'var(--wn-warning)' : 'var(--wn-success)'}"></span>
                </span><b>${pct(rate)}</b></span></td>
            </tr>`;
          })}</tbody>
        </table></div>
      `);
    },
    act(ctx, act, arg) { if (act === 's') { ctx.local.story = arg; ctx.rerender(); } },
  },

  {
    id: 'admin-report-choices', plane: 'ops', density: 'creator', icon: 'gitBranch', frame: 'desktop',
    sid: 'ADM-REPORT-CHOICES', name: 'Báo cáo · phân bố lựa chọn',
    desc: 'Ở một điểm rẽ, trẻ chọn gì. Cột chiến lược cho biết nhánh nào đang dạy được điều gì.',
    live: true,
    init: () => ({ story: 'wn-demo-cai-binh-vo' }),
    render(ctx) {
      const d = CHOICE_DISTRIBUTION[ctx.local.story];
      const total = d.options.reduce((n, o) => n + o.count, 0);
      return adminShell('admin-report-choices', html`
        ${pageHead('Phân bố lựa chọn', 'Chọn truyện, rồi xem một điểm rẽ.', null, 'gitBranch')}
        ${dateRangeBar(DATE_RANGE)}
        <div class="wn-row wn-row--wrap" style="margin:var(--wn-space-4) 0">
          ${Object.keys(CHOICE_DISTRIBUTION).map((code) => html`<button type="button"
            class="wn-chip ${ctx.local.story === code ? 'is-on' : ''}" data-act="s" data-arg="${code}"
            >${(findStory(code) || {}).title || code}</button>`)}
        </div>
        <div class="wn-card wn-stack-4">
          <b class="wn-label">${d.scene}</b>
          ${barChart(d.options.map((o) => ({ label: o.label, value: o.count })), { fmt: (v) => `${num(v)} · ${pct(v / total)}` })}
          <hr class="wn-divider">
          <div class="wn-tablewrap"><table class="wn-table">
            <thead><tr><th>Lựa chọn</th><th>Lượt chọn</th><th>Tỉ lệ</th><th>Chiến lược gắn kèm</th></tr></thead>
            <tbody>${d.options.map((o) => html`<tr>
              <td>${o.label}</td><td>${num(o.count)}</td><td>${pct(o.count / total)}</td>
              <td>${o.strategy ? badge(o.strategy, 'info', 'handHeart') : html`<span class="wn-quiet">không gắn</span>`}</td>
            </tr>`)}</tbody>
          </table></div>
          <span class="wn-micro">${icon('info')} Một lựa chọn không gắn chiến lược không phải lỗi —
            đôi khi một cách xử lý đơn giản là không thể hiện điều gì.</span>
        </div>
      `);
    },
    act(ctx, act, arg) { if (act === 's') { ctx.local.story = arg; ctx.rerender(); } },
  },

  {
    id: 'admin-report-proposals', plane: 'ops', density: 'creator', icon: 'message', frame: 'desktop',
    sid: 'ADM-REPORT-PROPOSALS', name: 'Báo cáo · đề xuất',
    desc: 'Người dùng góp ý nhiều ở truyện nào. Truyện nhiều đề xuất thường là truyện thiếu một nhánh.',
    live: true,
    init: () => ({}),
    render() {
      const p = PROPOSAL_STATS;
      return adminShell('admin-report-proposals', html`
        ${pageHead('Thống kê đề xuất', `${num(p.total)} đề xuất trong 30 ngày.`, null, 'message')}
        ${dateRangeBar(DATE_RANGE)}
        <div class="wn-cols-3" style="margin:var(--wn-space-4) 0">
          ${p.byStatus.map((s, i) => kpi(s.status, num(s.count), `${pct(s.count / p.total)} tổng số`,
            ['clock', 'checkCircle', 'minus'][i]))}
        </div>
        <div class="wn-two-col">
          <div class="wn-card wn-stack-3">
            <b class="wn-label">Truyện nhận nhiều đề xuất nhất</b>
            ${barChart(p.topStories.map((t) => ({ label: (findStory(t.code) || {}).title || t.code, value: t.count })))}
          </div>
          <div class="wn-card wn-stack-3">
            <b class="wn-label">Đọc con số này thế nào</b>
            <p class="wn-caption">Một truyện nhận nhiều đề xuất không có nghĩa là truyện dở. Thường là
              người đọc muốn một cách xử lý mà truyện chưa có — đó là gợi ý viết thêm nhánh, không phải
              tín hiệu gỡ bài.</p>
            <div class="wn-banner wn-banner--info">${icon('lightbulb')}
              <div>“Bạn rủ trốn tiết” dẫn đầu vì nhiều người muốn nhánh “rủ bạn cùng quay về”.</div></div>
          </div>
        </div>
      `);
    },
  },

  {
    id: 'admin-report-audio', plane: 'ops', density: 'creator', icon: 'volume', frame: 'desktop',
    sid: 'ADM-REPORT-AUDIO', name: 'Báo cáo · âm thanh',
    desc: 'Giọng kể được nghe bao nhiêu, nghe lại bao nhiêu, nghe hết bao nhiêu — theo từng truyện.',
    live: true,
    init: () => ({}),
    render() {
      const a = AUDIO_STATS;
      return adminShell('admin-report-audio', html`
        ${pageHead('Sử dụng âm thanh', `${pct(a.coverage)} số trang đã có giọng kể.`, null, 'volume')}
        ${dateRangeBar(DATE_RANGE)}
        <div class="wn-cols-3" style="margin:var(--wn-space-4) 0">
          ${kpi('Độ phủ giọng kể', pct(a.coverage), 'trên tổng số trang đã xuất bản', 'volume')}
          ${kpi('Lượt phát', num(a.rows.reduce((n, r) => n + r.plays, 0)), 'trong 30 ngày', 'play')}
          ${kpi('Lượt nghe lại', num(a.rows.reduce((n, r) => n + r.replays, 0)), 'người đọc bấm nghe lại', 'refresh')}
        </div>
        <div class="wn-tablewrap"><table class="wn-table">
          <thead><tr><th>Truyện</th><th>Phát</th><th>Nghe lại</th><th>Nghe hết</th></tr></thead>
          <tbody>${a.rows.map((r) => html`<tr>
            <td><b>${(findStory(r.code) || {}).title || r.code}</b></td>
            <td>${num(r.plays)}</td>
            <td>${num(r.replays)} <span class="wn-micro">(${pct(r.replays / r.plays)})</span></td>
            <td><span class="wn-row" style="gap:8px">
              <span style="width:70px;height:8px;border-radius:999px;overflow:hidden;
                background:color-mix(in srgb, var(--wn-border) 70%, transparent)">
                <span style="display:block;height:100%;width:${Math.round(r.completion * 100)}%;
                  background:var(--wn-accent)"></span></span><b>${pct(r.completion)}</b></span></td>
          </tr>`)}</tbody>
        </table></div>
        <div class="wn-banner wn-banner--info" style="margin-top:var(--wn-space-4)">${icon('info')}
          <div>Tỉ lệ nghe lại cao ở truyện an toàn là dấu hiệu tốt: trẻ nghe lại đoạn quan trọng.</div></div>
      `);
    },
  },
];
