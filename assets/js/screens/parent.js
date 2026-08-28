/**
 * Mặt phẳng phụ huynh — chủ tài khoản.
 *
 * Mật độ `parent`: chạm 44, chữ 15. Ở đây được phép có bảng, biểu đồ và nhiều số hơn — nhưng
 * KHÔNG có số nào chấm điểm đứa trẻ. Báo cáo nói về nội dung con đã gặp, không xếp hạng con.
 */

import {
  html, icon, raw, art, cover, btn, iconBtn, badge, banner, empty, kpi, avatar,
  relTime, num, skeletonRows,
} from 'wnd/ui.js';
import { portalShell, pageHead, wordmark, barChart, sparkline } from 'wnd/screens/_kit.js';
import { AGE_BANDS, RATING_ORDER, RATING_LABEL, CATEGORIES } from 'wnd/data/catalog.js';
import { library, findStory } from 'wnd/data/library.js';
import { PARENT, CHILDREN, HISTORY, PROPOSALS, SKILL_REPORT, SUGGESTED } from 'wnd/data/people.js';
import { STRATEGIES } from 'wnd/data/strategies.js';
import { getState } from 'wnd/state.js';

const KID = CHILDREN[0];

function authShell(title, inner, foot) {
  return html`<div class="wn-screen">
    <div class="wn-scroll" style="display:grid;grid-template-columns:minmax(0,1fr);min-height:100%">
      <div class="wn-two-col" style="min-height:100%;gap:0">
        <div class="wn-only-wide" style="padding:var(--wn-space-12) var(--wn-space-10);
          background:linear-gradient(160deg, color-mix(in srgb, var(--wn-brand) 16%, var(--wn-bg)), var(--wn-bg));
          display:grid;align-content:center;gap:var(--wn-space-5)">
          ${wordmark(38)}
          <h2 class="wn-headline" style="max-width:22ch">Tài khoản của người lớn, hồ sơ của các con</h2>
          <p class="wn-compact wn-dim" style="max-width:40ch">Một tài khoản quản lý nhiều hồ sơ trẻ.
            Mỗi con có tiến trình riêng, sổ chiến lược riêng, và trần nội dung riêng do bố mẹ đặt.</p>
          <ul class="wn-stack-2">
            ${['Không thu email của trẻ', 'Không quảng cáo trong luồng đọc', 'Xoá dữ liệu bất cứ lúc nào']
              .map((t) => html`<li class="wn-row" style="gap:8px">
                <span style="color:var(--wn-success)">${icon('check')}</span>
                <span class="wn-caption">${t}</span></li>`)}
          </ul>
        </div>
        <div style="display:grid;place-items:center;padding:var(--wn-space-8) var(--wn-gutter)">
          <div class="wn-card wn-stack" style="width:100%;max-width:420px">
            <div class="wn-only-narrow" style="justify-self:center">${wordmark(32)}</div>
            <h1 class="wn-title">${title}</h1>
            ${inner}
          </div>
        </div>
      </div>
    </div>
    ${foot || ''}
  </div>`;
}

export const parentScreens = [
  {
    id: 'parent-login', plane: 'parent', density: 'parent', icon: 'lock',
    sid: 'PH-AUTH-LOGIN', name: 'Đăng nhập',
    desc: 'Ba đường vào: mật khẩu, mã một lần qua điện thoại, hoặc tài khoản mạng xã hội.',
    live: true,
    states: [{ id: 'default', label: 'Mặc định' }, { id: 'error', label: 'Sai mật khẩu' }],
    init: () => ({ tab: 'password' }),
    render(ctx) {
      const err = ctx.view === 'error';
      return authShell('Đăng nhập', html`
        <div class="wn-tabs" role="tablist" style="border-radius:var(--wn-radius-md);overflow:hidden">
          <button type="button" role="tab" class="wn-tab" data-act="tab" data-arg="password"
            aria-selected="${ctx.local.tab === 'password' ? 'true' : 'false'}">Mật khẩu</button>
          <button type="button" role="tab" class="wn-tab" data-act="tab" data-arg="otp"
            aria-selected="${ctx.local.tab === 'otp' ? 'true' : 'false'}">Mã một lần</button>
        </div>
        ${err ? banner('Email hoặc mật khẩu chưa đúng. Thử lại giúp mình nhé.', 'danger') : ''}
        ${ctx.local.tab === 'password' ? html`
          <div class="wn-field">
            <label for="lg-id">Email, tên đăng nhập hoặc số điện thoại</label>
            <input class="wn-input" id="lg-id" value="phuhuynh@vidu.demo" autocomplete="username">
          </div>
          <div class="wn-field">
            <label for="lg-pw">Mật khẩu</label>
            <input class="wn-input" id="lg-pw" type="password" value="••••••••" autocomplete="current-password">
            <span class="wn-hint"><b style="color:var(--wn-accent)">Quên mật khẩu?</b></span>
          </div>
          ${btn('Đăng nhập', { kind: 'primary', block: true, act: 'in' })}
        ` : html`
          <div class="wn-field">
            <label for="lg-phone">Số điện thoại</label>
            <input class="wn-input" id="lg-phone" inputmode="tel" placeholder="09xx xxx xxx">
            <span class="wn-hint">Mình gửi một mã sáu chữ số, dùng một lần.</span>
          </div>
          ${btn('Gửi mã', { kind: 'primary', block: true, act: 'otp', icon: 'send' })}
        `}
        <div class="wn-row"><hr class="wn-divider" style="flex:1"><span class="wn-micro">hoặc</span><hr class="wn-divider" style="flex:1"></div>
        <div class="wn-stack-2">
          ${btn('Tiếp tục với Google', { kind: 'outline', block: true })}
          ${btn('Tiếp tục với Apple', { kind: 'outline', block: true })}
        </div>
        <p class="wn-caption" style="text-align:center">Chưa có tài khoản?
          <b style="color:var(--wn-accent);cursor:pointer" data-act="reg">Đăng ký</b></p>
      `);
    },
    act(ctx, act, arg) {
      if (act === 'tab') { ctx.local.tab = arg; ctx.rerender(); }
      if (act === 'in') ctx.go('/man-hinh/parent-dashboard');
      if (act === 'otp') ctx.go('/man-hinh/parent-otp');
      if (act === 'reg') ctx.go('/man-hinh/parent-register');
    },
  },

  {
    id: 'parent-register', plane: 'parent', density: 'parent', icon: 'userPlus',
    sid: 'PH-AUTH-REGISTER', name: 'Đăng ký',
    desc: 'Chỉ hỏi những gì cần để tạo tài khoản. Hồ sơ trẻ tạo ở bước sau, và chỉ cần biệt danh.',
    live: true,
    init: () => ({}),
    render() {
      return authShell('Tạo tài khoản', html`
        <div class="wn-field"><label for="rg-id">Email hoặc số điện thoại</label>
          <input class="wn-input" id="rg-id" placeholder="ban@vidu.demo"></div>
        <div class="wn-field"><label for="rg-pw">Mật khẩu</label>
          <input class="wn-input" id="rg-pw" type="password" placeholder="Ít nhất 8 ký tự"></div>
        <div class="wn-field"><label for="rg-pw2">Nhập lại mật khẩu</label>
          <input class="wn-input" id="rg-pw2" type="password"></div>
        <label class="wn-row wn-row--top" style="gap:var(--wn-space-3);cursor:pointer">
          <input type="checkbox" style="width:20px;height:20px;margin-top:2px;accent-color:var(--wn-accent)">
          <span class="wn-caption">Tôi là người lớn và đồng ý với Điều khoản cùng Chính sách quyền riêng tư.</span>
        </label>
        ${btn('Tạo tài khoản', { kind: 'primary', block: true, act: 'go' })}
        <p class="wn-caption" style="text-align:center">Đã có tài khoản?
          <b style="color:var(--wn-accent);cursor:pointer" data-act="login">Đăng nhập</b></p>
      `);
    },
    act(ctx, act) {
      if (act === 'go') ctx.go('/man-hinh/parent-profile-complete');
      if (act === 'login') ctx.go('/man-hinh/parent-login');
    },
  },

  {
    id: 'parent-otp', plane: 'parent', density: 'parent', icon: 'key',
    sid: 'PH-AUTH-OTP', name: 'Nhập mã một lần',
    desc: 'Sáu ô số, dán được cả chuỗi. Có đường quay lại đổi số nếu gõ nhầm.',
    live: true,
    init: () => ({ digits: ['', '', '', '', '', ''] }),
    render(ctx) {
      return authShell('Nhập mã vừa gửi', html`
        <p class="wn-caption">Mình vừa gửi một mã sáu số tới <b>09xx xxx 128</b>.</p>
        <div class="wn-row" style="gap:8px;justify-content:center">
          ${ctx.local.digits.map((d, i) => html`<input class="wn-input" inputmode="numeric" maxlength="1"
            data-field="d${i}" value="${d}" aria-label="Chữ số thứ ${i + 1}"
            style="width:46px;text-align:center;font-size:20px;font-weight:700;padding-inline:0">`)}
        </div>
        ${btn('Xác nhận', { kind: 'primary', block: true, act: 'ok' })}
        <p class="wn-caption" style="text-align:center">Chưa nhận được mã?
          <b style="color:var(--wn-accent)">Gửi lại sau 42 giây</b></p>
        <p class="wn-micro" style="text-align:center;cursor:pointer" data-act="back">Đổi số điện thoại</p>
      `);
    },
    act(ctx, act, arg, e, el) {
      if (act === '__field' && arg.startsWith('d')) ctx.local.digits[Number(arg.slice(1))] = el.value;
      if (act === 'ok') ctx.go('/man-hinh/parent-dashboard');
      if (act === 'back') ctx.go('/man-hinh/parent-login');
    },
  },

  {
    id: 'parent-profile-complete', plane: 'parent', density: 'parent', icon: 'user',
    sid: 'PH-PARENT-PROFILE-COMPLETE', name: 'Hoàn tất hồ sơ',
    desc: 'Hiện khi tài khoản còn thiếu thông tin. Luôn có nút “Để sau” — không bẫy người dùng ở đây.',
    live: true,
    init: () => ({}),
    render() {
      return authShell('Hoàn tất hồ sơ', html`
        <p class="wn-caption">Vài thông tin để mình gợi ý nội dung sát hơn. Tất cả đều sửa được sau.</p>
        <div class="wn-field"><label for="pf-name">Họ và tên</label>
          <input class="wn-input" id="pf-name" value="${PARENT.displayName}"></div>
        <div class="wn-cols-2">
          <div class="wn-field"><label for="pf-gender">Giới tính</label>
            <select class="wn-select" id="pf-gender"><option>Nữ</option><option>Nam</option><option>Khác</option></select></div>
          <div class="wn-field"><label for="pf-year">Năm sinh</label>
            <select class="wn-select" id="pf-year"><option>1991</option><option>1990</option><option>1992</option></select></div>
        </div>
        <div class="wn-cols-2">
          <div class="wn-field"><label for="pf-prov">Tỉnh / thành</label>
            <select class="wn-select" id="pf-prov"><option>${PARENT.province}</option><option>TP. Hồ Chí Minh</option></select></div>
          <div class="wn-field"><label for="pf-ward">Phường / xã</label>
            <select class="wn-select" id="pf-ward"><option>${PARENT.ward}</option><option>Phường Kim Mã</option></select></div>
        </div>
        <span class="wn-hint">Tỉnh và phường phải điền cùng nhau, hoặc bỏ trống cả hai.</span>
        ${btn('Lưu và tiếp tục', { kind: 'primary', block: true, act: 'go' })}
        ${btn('Để sau', { kind: 'ghost', block: true, act: 'go' })}
      `);
    },
    act(ctx, act) { if (act === 'go') ctx.go('/man-hinh/parent-children'); },
  },

  {
    id: 'parent-gate', plane: 'parent', density: 'parent', icon: 'shield', frame: 'phone',
    sid: 'PH-AUTH-PARENT-GATE', name: 'Cổng phụ huynh',
    desc: 'Chặn nhẹ giữa khu của trẻ và khu của người lớn. Một phép tính là đủ — đây không phải bảo mật.',
    live: true,
    init: () => ({ answer: '' }),
    render(ctx) {
      return html`<div class="wn-screen" style="display:grid;place-items:center;padding:var(--wn-gutter)">
        <div class="wn-card wn-stack" style="max-width:380px">
          <span style="width:52px;height:52px;border-radius:999px;display:grid;place-items:center;
            background:color-mix(in srgb, var(--wn-accent) 12%, transparent);color:var(--wn-accent)">${icon('shield')}</span>
          <div class="wn-stack-1">
            <b class="wn-title">Khu vực dành cho người lớn</b>
            <span class="wn-caption">Nhờ bố mẹ trả lời giúp câu này.</span>
          </div>
          <div class="wn-field">
            <label for="gate">Bảy nhân tám bằng bao nhiêu?</label>
            <input class="wn-input" id="gate" inputmode="numeric" data-field="a" value="${ctx.local.answer}"
              placeholder="Nhập số">
          </div>
          ${btn('Vào', { kind: 'primary', block: true, act: 'in' })}
          ${btn('Quay lại chỗ của con', { kind: 'ghost', block: true, act: 'back' })}
          <p class="wn-micro">Cổng này chỉ để tránh trẻ vào nhầm, không phải một lớp bảo mật.</p>
        </div>
      </div>`;
    },
    act(ctx, act, arg, e, el) {
      if (act === '__field') ctx.local.answer = el.value;
      if (act === 'in') {
        if (ctx.local.answer.trim() === '56') ctx.go('/man-hinh/parent-dashboard');
        else ctx.toast('Chưa đúng. Thử lại nhé.');
      }
      if (act === 'back') ctx.go('/man-hinh/child-home');
    },
  },

  {
    id: 'parent-dashboard', plane: 'parent', density: 'parent', icon: 'barChart',
    sid: 'PH-DASHBOARD', name: 'Tổng quan',
    desc: 'Con đã gặp những tình huống nào, trong bao lâu. Không có điểm, không có bảng xếp hạng.',
    live: true,
    states: [{ id: 'default', label: 'Mặc định' }, { id: 'loading', label: 'Đang tải' }],
    init: () => ({}),
    render(ctx) {
      if (ctx.view === 'loading') {
        return portalShell('summary', html`${skeletonRows(6)}`, { childBar: false });
      }
      const st = getState();
      const found = STRATEGIES.filter((s) => st.notebook[s.code]);
      const week = [22, 0, 16, 12, 0, 18, 16];
      return portalShell('summary', html`
        ${pageHead('Tổng quan', `Hoạt động của ${KID.name} trong bảy ngày gần nhất.`, null, 'barChart')}
        <div class="wn-cols-4">
          ${kpi('Truyện đã đọc', '9', '3 truyện trong tuần này', 'bookOpen')}
          ${kpi('Thời gian đọc', `${KID.minutesThisWeek} phút`, 'trung bình 12 phút mỗi lần', 'clock')}
          ${kpi('Cách đã khám phá', `${found.length} / ${STRATEGIES.length}`, 'ghi trong sổ chiến lược', 'handHeart')}
          ${kpi('Đề xuất đã gửi', String(PROPOSALS.length), '1 đang chờ đội nội dung', 'message')}
        </div>
        <div class="wn-two-col">
          <div class="wn-card wn-stack-3">
            <b class="wn-label">Phút đọc theo ngày</b>
            ${barChart(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => ({ label: d, value: week[i] })),
                       { fmt: (v) => (v ? `${v}′` : '—') })}
            <span class="wn-micro">Không có mục tiêu ngày, không có chuỗi ngày. Số này để bố mẹ biết,
              không phải để con phải đạt.</span>
          </div>
          <div class="wn-card wn-stack-3">
            <b class="wn-label">Cách con đã dùng</b>
            ${found.length
              ? html`<div class="wn-row wn-row--wrap">${found.map((s) => html`
                  <span class="wn-chip wn-chip--static">${icon(s.icon)}${s.name}</span>`)}</div>`
              : html`<p class="wn-caption">Con chưa đọc truyện nào trong phiên này. Thử vai
                  “Người xem” để thấy sổ đầy dần.</p>`}
            ${btn('Xem báo cáo kỹ năng', { kind: 'outline', sm: true, act: 'skills', icon: 'award' })}
          </div>
        </div>
        <div class="wn-card wn-stack-3">
          <div class="wn-row"><b class="wn-label" style="flex:1">Gần đây con đã đọc</b>
            ${btn('Xem tất cả', { kind: 'ghost', sm: true, act: 'history' })}</div>
          <div class="wn-tablewrap"><table class="wn-table">
            <thead><tr><th>Truyện</th><th>Kết thúc</th><th>Lúc</th></tr></thead>
            <tbody>${HISTORY.slice(0, 4).map((h) => {
              const s = findStory(h.storyCode);
              const en = s && h.endingCode ? s.endingByCode[h.endingCode] : null;
              return html`<tr><td>${s ? s.title : '—'}</td>
                <td>${en ? en.title : html`<span class="wn-quiet">đang đọc dở</span>`}</td>
                <td>${relTime(h.at)}</td></tr>`;
            })}</tbody>
          </table></div>
        </div>
      `, { child: KID });
    },
    act(ctx, act) {
      if (act === 'skills') ctx.go('/man-hinh/parent-skill-report');
      if (act === 'history') ctx.go('/man-hinh/parent-history');
    },
  },

  {
    id: 'parent-children', plane: 'parent', density: 'parent', icon: 'users',
    sid: 'PH-CHILDREN-LIST', name: 'Hồ sơ trẻ',
    desc: 'Mỗi con một thẻ, kèm trần nội dung đang áp dụng. Thêm hồ sơ chỉ cần biệt danh và nhóm tuổi.',
    live: true,
    states: [{ id: 'default', label: 'Mặc định' }, { id: 'empty', label: 'Chưa có hồ sơ' }],
    init: () => ({}),
    render(ctx) {
      const kids = ctx.view === 'empty' ? [] : CHILDREN;
      return portalShell('children', html`
        ${pageHead('Hồ sơ trẻ', 'Tiến trình và sổ chiến lược của mỗi con là riêng biệt.',
          btn('Thêm hồ sơ', { kind: 'primary', act: 'add', icon: 'plus' }), 'users')}
        ${kids.length ? html`<div class="wn-cols-2">
          ${kids.map((c) => html`<div class="wn-card wn-stack-3">
            <div class="wn-row">
              ${avatar(c.name, { size: 52, tint: c.tint })}
              <div class="wn-stack-1" style="flex:1">
                <b class="wn-title">${c.name}</b>
                <span class="wn-caption">${AGE_BANDS.find((b) => b.code === c.bandCode).label}</span>
              </div>
              ${iconBtn('edit', { label: `Sửa hồ sơ ${c.name}`, act: 'edit', arg: String(c.id) })}
            </div>
            <hr class="wn-divider">
            <div class="wn-row wn-row--wrap">
              ${badge(`Trần nội dung: ${RATING_LABEL[c.parentalMaxRating]}`, 'info', 'shield')}
              ${badge(`${c.minutesThisWeek} phút tuần này`, 'neutral', 'clock')}
            </div>
            <div class="wn-row wn-row--wrap">
              ${c.interests.map((t) => html`<span class="wn-chip wn-chip--static">${t}</span>`)}
            </div>
          </div>`)}
        </div>` : empty('userPlus', 'Chưa có hồ sơ trẻ nào',
            'Tạo hồ sơ đầu tiên — chỉ cần một biệt danh và nhóm tuổi.',
            btn('Tạo hồ sơ', { kind: 'primary', act: 'add', icon: 'plus' }))}
      `, { child: KID, childBar: false });
    },
    act(ctx, act) {
      if (act === 'edit' || act === 'add') ctx.go('/man-hinh/parent-child-edit');
    },
  },

  {
    id: 'parent-child-edit', plane: 'parent', density: 'parent', icon: 'edit',
    sid: 'PH-CHILD-EDIT', name: 'Sửa hồ sơ trẻ',
    desc: 'Nơi đặt trần nội dung. Xoá hồ sơ nằm riêng, có cảnh báo rõ về thứ sẽ mất.',
    live: true,
    init: () => ({ cap: KID.parentalMaxRating, confirm: false }),
    render(ctx) {
      return portalShell('children', html`
        ${pageHead(`Hồ sơ của ${KID.name}`, 'Thay đổi lưu ngay khi bấm Lưu.',
          btn('Quay lại danh sách', { kind: 'ghost', act: 'back', icon: 'arrowLeft' }))}
        <div class="wn-two-col">
          <div class="wn-card wn-stack-4">
            <div class="wn-row">
              ${avatar(KID.name, { size: 64, tint: KID.tint })}
              ${btn('Đổi ảnh', { kind: 'outline', sm: true, icon: 'image' })}
            </div>
            <div class="wn-field"><label for="c-name">Biệt danh</label>
              <input class="wn-input" id="c-name" value="${KID.name}">
              <span class="wn-hint">Dùng biệt danh, không dùng họ tên đầy đủ của con.</span></div>
            <div class="wn-field"><label for="c-band">Nhóm tuổi</label>
              <select class="wn-select" id="c-band">
                ${AGE_BANDS.slice(0, 4).map((b) => html`<option ${raw(b.code === KID.bandCode ? 'selected' : '')}
                  >${b.label}</option>`)}
              </select></div>
            <div class="wn-field"><label for="c-year">Năm sinh <span class="wn-quiet">(không bắt buộc)</span></label>
              <input class="wn-input" id="c-year" value="${KID.birthYear}">
              <span class="wn-hint">Có năm sinh thì hệ thống lọc chính xác hơn ở những truyện cần tuổi thật.</span></div>
            ${btn('Lưu thay đổi', { kind: 'primary', act: 'save' })}
          </div>
          <div class="wn-stack">
            <div class="wn-card wn-stack-3">
              <b class="wn-label">${icon('shield')} Trần nội dung</b>
              <p class="wn-caption">Truyện vượt mức này sẽ không hiện ra với ${KID.name}, kể cả khi tìm kiếm.</p>
              <div class="wn-row wn-row--wrap">
                ${RATING_ORDER.map((r) => html`<button type="button"
                  class="wn-chip ${ctx.local.cap === r ? 'is-on' : ''}" data-act="cap" data-arg="${r}"
                  aria-pressed="${ctx.local.cap === r ? 'true' : 'false'}">${RATING_LABEL[r]}</button>`)}
              </div>
              ${banner(`Đang áp dụng: ${RATING_LABEL[ctx.local.cap]}`, 'info', 'shield')}
            </div>
            <div class="wn-card wn-stack-3" style="border-color:color-mix(in srgb, var(--wn-danger) 34%, transparent)">
              <b class="wn-label" style="color:var(--wn-danger)">${icon('trash')} Xoá hồ sơ</b>
              <p class="wn-caption">Xoá hồ sơ sẽ xoá tiến trình đọc, truyện đã lưu và sổ chiến lược của
                ${KID.name}. Truyện con đã viết và được xuất bản thì vẫn ở lại thư viện.</p>
              ${ctx.local.confirm
                ? html`<div class="wn-row">
                    ${btn('Xác nhận xoá', { kind: 'danger', act: 'del2' })}
                    ${btn('Huỷ', { kind: 'ghost', act: 'cancel' })}</div>`
                : btn('Xoá hồ sơ này', { kind: 'outline', act: 'del' })}
            </div>
          </div>
        </div>
      `, { child: KID, childBar: false });
    },
    act(ctx, act, arg) {
      if (act === 'cap') { ctx.local.cap = arg; ctx.rerender(); }
      if (act === 'save') ctx.toast('Đã lưu hồ sơ.');
      if (act === 'del') { ctx.local.confirm = true; ctx.rerender(); }
      if (act === 'cancel') { ctx.local.confirm = false; ctx.rerender(); }
      if (act === 'del2') { ctx.local.confirm = false; ctx.rerender(); ctx.toast('Đã xoá hồ sơ. Hoàn tác?'); }
      if (act === 'back') ctx.go('/man-hinh/parent-children');
    },
  },

  {
    id: 'parent-skill-report', plane: 'parent', density: 'parent', icon: 'award',
    sid: 'PH-SKILL-REPORT', name: 'Báo cáo kỹ năng',
    desc: 'Con đã gặp mỗi nhóm kỹ năng bao nhiêu lần. Đây là bản đồ nội dung, không phải bảng điểm.',
    live: true,
    init: () => ({}),
    render() {
      return portalShell('skills', html`
        ${pageHead('Báo cáo kỹ năng', `Số lần ${KID.name} gặp từng nhóm tình huống trong 30 ngày.`, null, 'award')}
        ${banner('Con số ở đây nói về NỘI DUNG con đã gặp, không nói con giỏi hay kém. '
          + 'Một nhóm ít lần chỉ nghĩa là con chưa gặp nhiều tình huống loại đó.', 'info')}
        <div class="wn-two-col">
          <div class="wn-card wn-stack-3">
            <b class="wn-label">Đã gặp bao nhiêu lần</b>
            ${barChart(SKILL_REPORT.map((s) => ({ label: s.name, value: s.met })), { fmt: (v) => `${v} lần` })}
          </div>
          <div class="wn-card wn-stack-3">
            <b class="wn-label">Ghi chú</b>
            ${SKILL_REPORT.map((s) => html`<div class="wn-row wn-row--top" style="gap:10px">
              <span style="color:var(--wn-accent);margin-top:2px">${icon('bookOpen')}</span>
              <span class="wn-stack-1"><b class="wn-label">${s.name}</b>
                <span class="wn-caption">${s.note}</span></span>
            </div>`)}
          </div>
        </div>
        <div class="wn-card wn-stack-3">
          <b class="wn-label">Nhóm con ít gặp nhất</b>
          <p class="wn-caption">“Tôn trọng ranh giới” mới xuất hiện 3 lần. Vài truyện dưới đây có nhiều
            tình huống loại này.</p>
          <div class="wn-grid">
            ${['wn-demo-nguoi-la-cong-truong', 'wn-demo-hop-mau-bi-mat', 'wn-demo-con-meo-di-lac']
              .map(findStory).filter(Boolean).map((s) => html`<div class="wn-stack-2">
                ${cover(s, { ratio: '34' })}<b class="wn-label">${s.title}</b>
                <span class="wn-micro">${s.categoryName}</span></div>`)}
          </div>
        </div>
      `, { child: KID });
    },
  },

  {
    id: 'parent-history', plane: 'parent', density: 'parent', icon: 'clock',
    sid: 'PH-LEARNING-HISTORY', name: 'Lịch sử học',
    desc: 'Dòng thời gian: truyện nào, kết thúc nào, và những cách xử lý con đã chọn trên đường đi.',
    live: true,
    states: [{ id: 'default', label: 'Mặc định' }, { id: 'empty', label: 'Rỗng' }],
    init: () => ({}),
    render(ctx) {
      const rows = ctx.view === 'empty' ? [] : HISTORY;
      return portalShell('history', html`
        ${pageHead('Lịch sử học', `Những gì ${KID.name} đã đọc, mới nhất trước.`, null, 'clock')}
        ${rows.length ? html`<div class="wn-stack-3">
          ${rows.map((h) => {
            const s = findStory(h.storyCode);
            if (!s) return '';
            const en = h.endingCode ? s.endingByCode[h.endingCode] : null;
            return html`<div class="wn-card wn-row wn-row--top">
              <span style="width:64px;flex:none">${cover(s, { ratio: '34' })}</span>
              <div class="wn-stack-2" style="flex:1;min-width:0">
                <div class="wn-row wn-row--wrap">
                  <b class="wn-label">${s.title}</b>
                  <span class="wn-spacer"></span>
                  <span class="wn-micro">${relTime(h.at)}</span>
                </div>
                <span class="wn-caption">${en ? `Kết thúc: ${en.title}` : 'Đang đọc dở'}
                  · đọc ${h.completed || 0} lần</span>
                ${en ? html`<div class="wn-banner wn-banner--info" style="padding:10px 12px">
                  ${icon('message')}<div><b>Thẻ trò chuyện:</b> ${en.parentTalkPrompt}</div></div>` : ''}
              </div>
            </div>`;
          })}
        </div>` : empty('clock', 'Chưa có hoạt động nào',
            'Khi con đọc xong một truyện, mục này sẽ có nội dung.')}
      `, { child: KID });
    },
  },

  {
    id: 'parent-suggest', plane: 'parent', density: 'parent', icon: 'lightbulb',
    sid: 'PH-CONTENT-SUGGEST', name: 'Gợi ý nội dung',
    desc: 'Gợi ý dựa trên những nhóm tình huống con ít gặp, kèm lý do vì sao gợi ý truyện đó.',
    live: true,
    init: () => ({}),
    render() {
      const items = SUGGESTED.map(findStory).filter(Boolean);
      const why = ['Có nhiều tình huống về giữ bí mật và nhờ người lớn giúp.',
        'Nhân vật phải nói ra điều mình cần trong một lớp học mới.',
        'Xoay quanh việc hỏi xin phép trước khi dùng đồ của người khác.'];
      return portalShell('suggest', html`
        ${pageHead('Gợi ý nội dung', `Chọn theo nhóm tình huống ${KID.name} còn ít gặp.`, null, 'lightbulb')}
        <div class="wn-stack-3">
          ${items.map((s, i) => html`<div class="wn-card wn-row wn-row--top">
            <span style="width:78px;flex:none">${cover(s, { ratio: '34' })}</span>
            <div class="wn-stack-2" style="flex:1">
              <b class="wn-title">${s.title}</b>
              <span class="wn-caption">${s.categoryName} · ${s.estimatedMinutes} phút</span>
              <p class="wn-compact wn-dim">${s.shortDescription}</p>
              <div class="wn-banner wn-banner--info" style="padding:10px 12px">
                ${icon('lightbulb')}<div><b>Vì sao gợi ý:</b> ${why[i] || ''}</div></div>
            </div>
            <div class="wn-stack-2" style="flex:none">
              ${btn('Thêm vào danh sách của con', { kind: 'outline', sm: true, icon: 'plus' })}
              ${btn('Bỏ qua', { kind: 'ghost', sm: true })}
            </div>
          </div>`)}
        </div>
      `, { child: KID });
    },
  },

  {
    id: 'parent-proposals', plane: 'parent', density: 'parent', icon: 'message',
    sid: 'PH-PROPOSALS-LIST', name: 'Đề xuất đã gửi',
    desc: 'Bố mẹ và con đề xuất thêm cách xử lý cho một tình huống. Trạng thái và phản hồi đều minh bạch.',
    live: true,
    states: [{ id: 'default', label: 'Mặc định' }, { id: 'empty', label: 'Rỗng' }],
    init: () => ({ open: 301 }),
    render(ctx) {
      const st = getState();
      const sent = st.proposalsSent.map((p, i) => ({
        id: 900 + i, storyCode: p.storyCode, sceneCode: p.sceneCode, status: 'pending',
        at: p.at, idea: p.idea, rationale: 'Gửi từ trình phát trong phiên demo này.', reply: null,
      }));
      const rows = ctx.view === 'empty' ? [] : [...sent, ...PROPOSALS];
      const tone = { pending: ['Chờ duyệt', 'warning', 'clock'], approved: ['Đã tiếp nhận', 'success', 'check'],
        rejected: ['Không dùng', 'neutral', 'x'] };
      const active = rows.find((p) => p.id === ctx.local.open) || rows[0];
      return portalShell('proposals', html`
        ${pageHead('Đề xuất đã gửi', 'Mỗi đề xuất đều được đội nội dung đọc và trả lời.',
          btn('Gửi đề xuất mới', { kind: 'primary', act: 'new', icon: 'plus' }), 'message')}
        ${rows.length ? html`<div class="wn-aside-col">
          <div class="wn-stack-2">
            ${rows.map((p) => {
              const s = findStory(p.storyCode);
              const [label, t, ic] = tone[p.status];
              return html`<button type="button" class="wn-card wn-card--flat wn-stack-2"
                data-act="open" data-arg="${p.id}" style="cursor:pointer;text-align:left;width:100%;
                  padding:var(--wn-space-3) var(--wn-space-4);
                  border-color:${active && p.id === active.id ? 'var(--wn-accent)' : 'var(--wn-border)'}">
                <div class="wn-row"><b class="wn-label" style="flex:1">${s ? s.title : '—'}</b>${badge(label, t, ic)}</div>
                <span class="wn-caption" style="display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;
                  -webkit-box-orient:vertical;overflow:hidden">${p.idea}</span>
                <span class="wn-micro">${relTime(p.at)}</span>
              </button>`;
            })}
          </div>
          ${active ? html`<div class="wn-card wn-stack-4">
            <div class="wn-row wn-row--wrap">
              <b class="wn-title" style="flex:1">${(findStory(active.storyCode) || {}).title || '—'}</b>
              ${badge(tone[active.status][0], tone[active.status][1], tone[active.status][2])}
            </div>
            <div class="wn-stack-1"><b class="wn-label">Đề xuất</b>
              <p class="wn-compact">${active.idea}</p></div>
            <div class="wn-stack-1"><b class="wn-label">Vì sao</b>
              <p class="wn-compact wn-dim">${active.rationale}</p></div>
            <hr class="wn-divider">
            <div class="wn-stack-1"><b class="wn-label">Phản hồi từ đội nội dung</b>
              ${active.reply
                ? html`<div class="wn-banner wn-banner--success">${icon('message')}<div>${active.reply}</div></div>`
                : html`<p class="wn-caption">Chưa có phản hồi. Thường mất vài ngày làm việc.</p>`}</div>
          </div>` : ''}
        </div>` : empty('message', 'Chưa gửi đề xuất nào',
            'Trong lúc con đọc, chạm “Con có cách khác không?” để gửi một cách xử lý mới.')}
      `, { child: KID });
    },
    act(ctx, act, arg) {
      if (act === 'open') { ctx.local.open = Number(arg); ctx.rerender(); }
      if (act === 'new') ctx.go('/man-hinh/child-proposal');
    },
  },
];
