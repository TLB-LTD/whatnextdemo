/**
 * Mặt phẳng khách — đọc thử không cần tài khoản.
 *
 * Nguyên tắc xuyên suốt: mọi giới hạn đều là một LỜI MỜI, không phải một bức tường. Khách bị
 * chặn ở đâu thì ở đó phải nói rõ đăng nhập được thêm gì, chứ không chỉ nói "cần đăng nhập".
 */

import { html, icon, raw, art, cover, btn, badge, banner, empty, skeletonGrid, storyCard, sheet } from 'wnd/ui.js';
import { readerShell, storySection, wordmark } from 'wnd/screens/_kit.js';
import { AGE_BANDS, CATEGORIES, categoryIcon, evaluateAccess } from 'wnd/data/catalog.js';
import { library, findStory } from 'wnd/data/library.js';
import { newSession, renderPlayer, playerAct } from 'wnd/flows/play.js';
import { getState, selectStory } from 'wnd/state.js';

const GUEST_BANDS = AGE_BANDS.slice(0, 4);

export const guestScreens = [
  {
    id: 'guest-age-pick', plane: 'guest', density: 'child', icon: 'users',
    sid: 'GUEST-AGE-PICK', name: 'Chọn nhóm tuổi',
    desc: 'Cửa đầu tiên của khách. Chọn nhóm tuổi để thư viện lọc đúng nội dung — chưa cần biết tên ai.',
    live: true,
    states: [{ id: 'default', label: 'Mặc định' }, { id: 'loading', label: 'Đang tải' }],
    init: () => ({ picked: null }),
    render(ctx) {
      if (ctx.view === 'loading') {
        return readerShell({ appbar: false, content: html`<div class="wn-pad-lg wn-stack">
          <div class="wn-skel" style="height:28px;width:64%"></div>
          <div class="wn-skel" style="height:16px;width:80%"></div>
          <div class="wn-cols-2">${[1, 2, 3, 4].map(() => html`<div class="wn-skel" style="height:150px"></div>`)}</div>
        </div>` });
      }
      return readerShell({
        appbar: false,
        content: html`<div class="wn-pad-lg wn-stack-6">
          <div class="wn-stack-2" style="text-align:center;justify-items:center">
            ${wordmark(40)}
            <h1 class="wn-headline" style="margin-top:var(--wn-space-3)">Con bao nhiêu tuổi?</h1>
            <p class="wn-reader wn-dim">Chọn giúp một nhóm tuổi để mình đưa đúng truyện.
              Có thể đổi lại bất cứ lúc nào.</p>
          </div>
          <div class="wn-cols-2">
            ${GUEST_BANDS.map((b) => html`<button type="button"
              class="wn-card" data-act="pick" data-arg="${b.code}"
              style="cursor:pointer;text-align:left;display:grid;gap:var(--wn-space-3);
                border-color:${ctx.local.picked === b.code ? 'var(--wn-accent)' : 'var(--wn-border)'};
                border-width:${ctx.local.picked === b.code ? '2px' : '1px'};padding:var(--wn-space-4)">
              <span class="wn-cover wn-cover--169" style="border-radius:var(--wn-radius-md)">
                ${art({ seed: 'band-' + b.code, motif: ['yard', 'playground', 'library', 'street'][b.id % 4],
                        time: 'day', alt: '' })}</span>
              <b class="wn-title">${b.label}</b>
              <span class="wn-caption">${b.focus ? 'Nhóm sản phẩm tập trung nhất hiện nay' : `Từ ${b.min} đến ${b.max} tuổi`}</span>
            </button>`)}
          </div>
          ${ctx.local.picked
            ? btn('Vào thư viện', { kind: 'primary', block: true, act: 'enter', icon: 'arrowRight' })
            : html`<p class="wn-caption" style="text-align:center">Chọn một nhóm để đi tiếp.</p>`}
          <p class="wn-micro" style="text-align:center">Bố mẹ đã có tài khoản?
            <b style="color:var(--wn-accent)">Đăng nhập</b></p>
        </div>`,
      });
    },
    act(ctx, act, arg) {
      if (act === 'pick') { ctx.local.picked = arg; ctx.rerender(); }
      if (act === 'enter') ctx.go('/man-hinh/guest-age-attest');
    },
  },

  {
    id: 'guest-age-attest', plane: 'guest', density: 'child', icon: 'shield',
    sid: 'GUEST-AGE-ATTEST', name: 'Xác nhận độ tuổi',
    desc: 'Hai bước: nhắc nhẹ rồi mới xác nhận. Bước hai chỉ hiện với nhóm tuổi cần mức xác nhận cao hơn.',
    live: true,
    init: () => ({ step: 1, agreed: false, year: '' }),
    render(ctx) {
      const s = ctx.local;
      return readerShell({
        appbar: false,
        content: html`<div class="wn-pad-lg" style="display:grid;place-items:center;min-height:100%">
          <div class="wn-card wn-stack" style="max-width:460px">
            ${s.step === 1 ? html`
              <span class="wn-badge wn-badge--info">${icon('info')}Bước 1 / 2</span>
              <h2 class="wn-title">Một lưu ý nhỏ trước khi vào</h2>
              <p class="wn-reader wn-dim">Thư viện có vài truyện hợp với bạn lớn hơn. Mình sẽ ẩn bớt
                những truyện đó cho nhóm tuổi bạn vừa chọn.</p>
              <div class="wn-banner wn-banner--info">${icon('users')}
                <div>Nếu người lớn đang ngồi cạnh, đây là lúc tốt để cùng chọn.</div></div>
              ${btn('Tôi hiểu rồi', { kind: 'primary', block: true, act: 'next' })}
            ` : html`
              <span class="wn-badge wn-badge--warning">${icon('shield')}Bước 2 / 2</span>
              <h2 class="wn-title">Xác nhận giúp mình</h2>
              <label class="wn-row wn-row--top" style="cursor:pointer;gap:var(--wn-space-3)">
                <input type="checkbox" data-act="agree" ${raw(s.agreed ? 'checked' : '')}
                  style="width:22px;height:22px;margin-top:2px;accent-color:var(--wn-accent)">
                <span class="wn-compact">Có người lớn trong nhà biết bạn đang dùng ứng dụng này.</span>
              </label>
              <div class="wn-field">
                <label for="attest-year">Năm sinh <span class="wn-quiet">(không bắt buộc)</span></label>
                <input class="wn-input" id="attest-year" inputmode="numeric" placeholder="Ví dụ: 2018"
                  data-field="year" value="${s.year}">
                <span class="wn-hint">Điền năm sinh giúp mình chọn truyện chính xác hơn.</span>
              </div>
              ${btn('Vào thư viện', { kind: 'primary', block: true, act: 'done', disabled: !s.agreed })}
              ${btn('Quay lại', { kind: 'ghost', block: true, act: 'back' })}
            `}
          </div>
        </div>`,
      });
    },
    act(ctx, act, arg, e, el) {
      const s = ctx.local;
      if (act === 'next') { s.step = 2; ctx.rerender(); }
      if (act === 'back') { s.step = 1; ctx.rerender(); }
      if (act === 'agree') { s.agreed = el.checked; ctx.rerender(); }
      if (act === '__field' && arg === 'year') s.year = el.value;
      if (act === 'done') ctx.go('/man-hinh/guest-library');
    },
  },

  {
    id: 'guest-library', plane: 'guest', density: 'child', icon: 'bookOpen',
    sid: 'GUEST-LIBRARY', name: 'Thư viện khách',
    desc: 'Chỉ hiện truyện đã xuất bản và cho phép chơi thử. Truyện cần tài khoản vẫn thấy được, kèm lời mời.',
    live: true,
    states: [{ id: 'default', label: 'Mặc định' }, { id: 'loading', label: 'Đang tải' },
             { id: 'empty', label: 'Rỗng' }],
    init: () => ({ cat: null }),
    render(ctx) {
      const all = library().filter((s) => s.ageBandCode === 'age_6_10');
      if (ctx.view === 'loading') {
        return readerShell({ title: 'Thư viện', content: html`<div class="wn-pad">${skeletonGrid(8)}</div>` });
      }
      if (ctx.view === 'empty') {
        return readerShell({ title: 'Thư viện', content: empty('search', 'Chưa có truyện nào khớp bộ lọc',
          'Thử bỏ bớt bộ lọc hoặc đổi nhóm tuổi.',
          btn('Xoá bộ lọc', { kind: 'outline', act: 'clear' })) });
      }
      const shown = ctx.local.cat ? all.filter((s) => s.categoryCode === ctx.local.cat) : all;
      const heading = ctx.local.cat
        ? CATEGORIES.find((c) => c.code === ctx.local.cat).name
        : 'Truyện cho nhóm 6–10';
      return readerShell({
        title: 'Thư viện',
        actions: html`<span class="wn-badge wn-badge--neutral">${icon('users')}Khách · Thiếu nhi (6–10)</span>`,
        content: html`
          <div class="wn-pad" style="padding-bottom:0">
            <div class="wn-banner wn-banner--info" style="margin-bottom:var(--wn-space-4)">
              ${icon('info')}
              <div><b>Đang đọc ở chế độ khách.</b> Đăng nhập để lưu chỗ đang đọc, lưu truyện yêu
                thích và giữ sổ chiến lược của con.</div>
            </div>
            <div class="wn-row wn-row--wrap" role="group" aria-label="Lọc theo thể loại">
              <button type="button" class="wn-chip ${!ctx.local.cat ? 'is-on' : ''}" data-act="cat" data-arg=""
                aria-pressed="${!ctx.local.cat ? 'true' : 'false'}">${icon('grid')}Tất cả</button>
              ${CATEGORIES.filter((c) => all.some((s) => s.categoryCode === c.code)).map((c) => html`
                <button type="button" class="wn-chip ${ctx.local.cat === c.code ? 'is-on' : ''}"
                  data-act="cat" data-arg="${c.code}" aria-pressed="${ctx.local.cat === c.code ? 'true' : 'false'}"
                  >${icon(categoryIcon(c.code))}${c.name}</button>`)}
            </div>
          </div>
          ${storySection(heading, shown, {
            act: 'open', meta: (s) => `${s.categoryName} · ${s.estimatedMinutes} phút${s.guestPlayAllowed ? '' : ' · cần đăng nhập'}`,
          })}
          <div class="wn-pad">
            <div class="wn-card wn-card--flat wn-row wn-row--wrap">
              ${icon('userPlus')}
              <span class="wn-caption" style="flex:1;min-width:180px">Tạo tài khoản miễn phí để lưu
                hành trình của con.</span>
              ${btn('Đăng ký', { kind: 'primary', sm: true, act: 'gate' })}
            </div>
          </div>`,
        tab: 'library',
      });
    },
    act(ctx, act, arg) {
      if (act === 'cat') { ctx.local.cat = arg || null; ctx.rerender(); }
      if (act === 'clear') { ctx.local.cat = null; ctx.view = 'default'; ctx.rerender(); }
      if (act === 'open') { selectStory(arg); ctx.go('/man-hinh/guest-story-detail'); }
      if (act === 'gate') ctx.go('/man-hinh/guest-softgate');
    },
  },

  {
    id: 'guest-story-detail', plane: 'guest', density: 'child', icon: 'book',
    sid: 'GUEST-STORY-DETAIL', name: 'Chi tiết truyện (khách)',
    desc: 'Cùng bố cục với bản của trẻ, khác ở chỗ nút lưu và ô đánh giá đều dẫn tới lời mời đăng ký.',
    live: true,
    states: [{ id: 'default', label: 'Cho chơi thử' }, { id: 'gated', label: 'Cần đăng nhập' }],
    init: () => ({}),
    render(ctx) {
      const story = ctx.view === 'gated'
        ? findStory('wn-demo-tieng-dong-tren-gac')
        : (findStory(getState().selectedStoryCode) || library()[0]);
      const access = evaluateAccess(story, { bandCode: 'age_6_10', loggedIn: false, acked: false });
      return readerShell({
        title: 'Chi tiết truyện', back: 'back',
        actions: html`<button type="button" class="wn-icobtn" data-act="fav" aria-label="Lưu truyện">${icon('heart')}</button>`,
        content: html`<div class="wn-pad wn-stack-5">
          <div class="wn-aside-col">
            <div>${cover(story, { ratio: '34' })}</div>
            <div class="wn-stack-3">
              <div class="wn-stack-1">
                <h2 class="wn-headline">${story.title}</h2>
                <span class="wn-caption">${story.categoryName} · ${story.bandLabel} · ${story.estimatedMinutes} phút</span>
              </div>
              <p class="wn-reader">${story.shortDescription}</p>
              ${!access.allowed || access.needsAck
                ? banner(access.message, access.allowed ? 'warning' : 'warning')
                : ''}
              ${!story.guestPlayAllowed
                ? html`<div class="wn-stack-2">
                    ${btn('Đăng nhập để đọc truyện này', { kind: 'primary', block: true, act: 'gate', icon: 'lock' })}
                    <span class="wn-micro">Truyện dành cho nhóm lớn hơn, cần hồ sơ có năm sinh.</span>
                  </div>`
                : btn('Bắt đầu đọc', { kind: 'primary', block: true, act: 'play', icon: 'play' })}
              <div class="wn-row">
                <span class="wn-caption">${icon('star')} ${String(story.rating.average).replace('.', ',')}
                  · ${story.rating.count} đánh giá</span>
              </div>
            </div>
          </div>
          <hr class="wn-divider">
          <div class="wn-card wn-card--flat wn-stack-2">
            <b class="wn-label">${icon('lock')} Đánh giá truyện</b>
            <p class="wn-caption">Cần đăng nhập để gửi đánh giá. Bạn vẫn đọc được nhận xét của người khác.</p>
            ${btn('Đăng nhập', { kind: 'outline', sm: true, act: 'gate' })}
          </div>
        </div>`,
      });
    },
    act(ctx, act) {
      if (act === 'play') ctx.go('/man-hinh/guest-player');
      if (act === 'fav' || act === 'gate') ctx.go('/man-hinh/guest-softgate');
      if (act === 'back') ctx.go('/man-hinh/guest-library');
    },
  },

  {
    id: 'guest-player', plane: 'guest', density: 'child', icon: 'play',
    sid: 'GUEST-PLAYER', name: 'Trình phát (khách)',
    desc: 'Cùng trình phát với trẻ đã đăng nhập. Tiến trình chỉ nằm trên thiết bị này cho tới khi có tài khoản.',
    live: true,
    init() {
      const story = findStory(getState().selectedStoryCode) || library()[0];
      return { sess: newSession(story), storyCode: story.code };
    },
    render(ctx) {
      const story = findStory(ctx.local.storyCode);
      return renderPlayer(ctx, ctx.local.sess, story, {
        banner: html`<div style="padding:var(--wn-space-2) var(--wn-gutter);background:color-mix(in srgb, var(--wn-warning) 12%, var(--wn-surface));
          border-bottom:1px solid color-mix(in srgb, var(--wn-warning) 30%, transparent)">
          <span class="wn-micro">${icon('info')} Đang đọc ở chế độ khách — tiến trình chỉ lưu trên thiết bị này.</span>
        </div>`,
      });
    },
    act(ctx, act, arg, e, el) {
      const story = findStory(ctx.local.storyCode);
      if (playerAct(ctx, ctx.local.sess, story, act, arg, {}, el)) return;
      if (act === 'exit') ctx.go('/man-hinh/guest-library');
    },
  },

  {
    id: 'guest-softgate', plane: 'guest', density: 'child', icon: 'userPlus',
    sid: 'UX-SOFT-GATE-REGISTER', name: 'Lời mời đăng ký',
    desc: 'Cửa mềm dùng chung cho mọi chỗ cần tài khoản. Nói lợi ích trước, và luôn có đường “để sau”.',
    live: true,
    frame: 'phone',
    init: () => ({}),
    render() {
      return html`<div class="wn-screen">
        <div class="wn-scroll wn-pad" style="opacity:.35;pointer-events:none">
          ${[1, 2, 3, 4].map(() => html`<div class="wn-skel" style="height:120px;margin-bottom:12px"></div>`)}
        </div>
        ${sheet(html`<div class="wn-stack">
            <div class="wn-stack-1">
              <b class="wn-title">Lưu hành trình của con</b>
              <span class="wn-caption">Miễn phí, và bố mẹ là người giữ tài khoản.</span>
            </div>
            <ul class="wn-stack-3">
              ${[['bookmark', 'Lưu truyện con thích', 'Mở lại đúng chỗ đang đọc dở, trên bất kỳ thiết bị nào.'],
                 ['handHeart', 'Giữ sổ chiến lược', 'Những cách xử lý con đã khám phá không bị mất.'],
                 ['users', 'Bố mẹ đồng hành', 'Thẻ trò chuyện cuối mỗi truyện, và một trang tổng quan cho người lớn.'],
              ].map(([ic, t, b]) => html`<li class="wn-row wn-row--top">
                <span style="color:var(--wn-accent);margin-top:2px">${icon(ic)}</span>
                <span class="wn-stack-1"><b class="wn-label">${t}</b><span class="wn-caption">${b}</span></span>
              </li>`)}
            </ul>
            <div class="wn-stack-2">
              ${btn('Tạo tài khoản', { kind: 'primary', block: true })}
              ${btn('Đã có tài khoản — Đăng nhập', { kind: 'secondary', block: true })}
              ${btn('Để sau', { kind: 'ghost', block: true, act: 'later' })}
            </div>
          </div>`, { label: 'Lời mời đăng ký', closeAct: 'later' })}
      </div>`;
    },
    act(ctx, act) {
      /* Chạm lớp mờ, bấm "Để sau", hay bấm Escape — cùng một lối ra. */
      if (act === 'later' || act === 'close-sheet') ctx.go('/man-hinh/guest-library');
    },
  },
];
