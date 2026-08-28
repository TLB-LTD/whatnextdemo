/**
 * Mặt phẳng của trẻ — mặt phẳng chính của sản phẩm.
 *
 * Mật độ `child` ở khắp nơi: chạm 48dp, chữ đọc 18px, lề 20px. Không màn nào trong nhóm này
 * có con số để so sánh, không có chuỗi ngày, không có chấm đỏ.
 */

import {
  html, icon, raw, art, cover, btn, iconBtn, badge, banner, empty, chip,
  skeletonGrid, storyCard, stars, starPicker, histogram, avatar, relTime, num, confetti,
} from 'wnd/ui.js';
import { readerShell, childHeader, storySection, favOverlay, wordmark } from 'wnd/screens/_kit.js';
import { CATEGORIES, AGE_BANDS, INTEREST_GROUPS, groupByCategory } from 'wnd/data/catalog.js';
import { library, findStory } from 'wnd/data/library.js';
import { STRATEGIES } from 'wnd/data/strategies.js';
import { CHILDREN, HISTORY, NOTIFICATIONS } from 'wnd/data/people.js';
import { getState, toggleSaved, saveRating } from 'wnd/state.js';
import { newSession, renderPlayer, playerAct } from 'wnd/flows/play.js';

const ME = CHILDREN[0];

export const childScreens = [
  {
    id: 'child-splash', plane: 'child', icon: 'sparkles', frame: 'phone',
    sid: 'CHILD-SPLASH', name: 'Màn mở ứng dụng',
    desc: 'Nửa giây thương hiệu rồi chuyển tiếp. Không quảng cáo, không nút, không đếm ngược.',
    render() {
      return html`<div class="wn-screen" style="display:grid;place-items:center;
        background:linear-gradient(160deg, color-mix(in srgb, var(--wn-brand) 22%, var(--wn-bg)), var(--wn-bg))">
        <div class="wn-stack-3" style="justify-items:center;text-align:center">
          ${wordmark(56)}
          <span class="wn-caption">Con chọn thế nào… rồi sao nữa?</span>
          <span class="wn-skel" style="width:120px;height:4px;border-radius:999px;margin-top:20px"></span>
        </div>
      </div>`;
    },
  },

  {
    id: 'child-onboard', plane: 'child', icon: 'bookOpen', frame: 'phone',
    sid: 'CHILD-ONBOARD', name: 'Giới thiệu cách chơi',
    desc: 'Ba trang giới thiệu, bỏ qua được ở mọi bước. Một slide một ý — không ba cột chữ.',
    live: true,
    init: () => ({ i: 0 }),
    render(ctx) {
      const slides = [
        { icon: 'bookOpen', t: 'Mỗi truyện là một tình huống', b: 'Chuyện xảy ra ở nhà, ở trường, ở sân chơi — những chỗ con đi qua mỗi ngày.', motif: 'schoolgate' },
        { icon: 'gitBranch', t: 'Con là người quyết định', b: 'Có hai hoặc ba cách xử lý. Không cách nào bị chấm là sai.', motif: 'playground' },
        { icon: 'handHeart', t: 'Rồi con giữ lại cách của mình', b: 'Cách con vừa dùng sẽ được ghi vào Sổ chiến lược để con nhớ.', motif: 'yard' },
      ];
      const s = slides[ctx.local.i];
      return html`<div class="wn-screen">
        <div class="wn-row" style="padding:var(--wn-space-3) var(--wn-gutter)">
          <span class="wn-spacer"></span>
          <button type="button" class="wn-btn wn-btn--ghost wn-btn--sm" data-act="skip">Bỏ qua</button>
        </div>
        <div class="wn-scroll wn-pad wn-stack-6" style="place-content:center;justify-items:center;text-align:center">
          <div class="wn-cover wn-cover--34" style="width:min(280px,72%)">
            ${art({ seed: 'onboard' + ctx.local.i, motif: s.motif, time: 'day', alt: '' })}
          </div>
          <div class="wn-stack-2" style="max-width:34ch">
            <h2 class="wn-headline">${s.t}</h2>
            <p class="wn-reader wn-dim">${s.b}</p>
          </div>
          <div class="wn-row" style="gap:8px">
            ${slides.map((_, i) => html`<span style="width:${i === ctx.local.i ? '22px' : '8px'};height:8px;
              border-radius:999px;background:${i === ctx.local.i ? 'var(--wn-accent)' : 'var(--wn-border-strong)'};
              transition:width var(--wn-motion-base) var(--wn-easing)"></span>`)}
          </div>
        </div>
        <div class="wn-sticky-cta">
          ${btn(ctx.local.i === slides.length - 1 ? 'Bắt đầu' : 'Tiếp',
                { kind: 'primary', block: true, act: 'next', icon: 'arrowRight' })}
        </div>
      </div>`;
    },
    act(ctx, act) {
      if (act === 'next') {
        if (ctx.local.i >= 2) { ctx.go('/man-hinh/child-prefs-age'); return; }
        ctx.local.i += 1; ctx.rerender();
      }
      if (act === 'skip') ctx.go('/man-hinh/child-home');
    },
  },

  {
    id: 'child-prefs-age', plane: 'child', icon: 'users', frame: 'phone',
    sid: 'CHILD-ONBOARD-PREFS-AGE', name: 'Onboarding · độ tuổi',
    desc: 'Bước 1/3. Mẫu số “trên 3 bước” không bao giờ đổi giữa chừng.',
    live: true,
    init: () => ({ pick: 'age_6_10' }),
    render(ctx) { return prefsStep(ctx, 1); },
    act(ctx, act, arg) {
      if (act === 'pick') { ctx.local.pick = arg; ctx.rerender(); }
      if (act === 'next') ctx.go('/man-hinh/child-prefs-tags');
      if (act === 'skip') ctx.go('/man-hinh/child-home');
    },
  },

  {
    id: 'child-prefs-tags', plane: 'child', icon: 'sparkles', frame: 'phone',
    sid: 'CHILD-ONBOARD-PREFS-TAGS', name: 'Onboarding · sở thích',
    desc: 'Bước 2/3. Chọn nhiều được, tối đa 8 để không quá tải.',
    live: true,
    init: () => ({ tags: ['Cảm xúc', 'Bạn bè'] }),
    render(ctx) { return prefsStep(ctx, 2); },
    act(ctx, act, arg) {
      if (act === 'tag') {
        const i = ctx.local.tags.indexOf(arg);
        if (i >= 0) ctx.local.tags.splice(i, 1);
        else if (ctx.local.tags.length < 8) ctx.local.tags.push(arg);
        else ctx.toast('Chọn tối đa 8 sở thích thôi nhé.');
        ctx.rerender();
      }
      if (act === 'next') ctx.go('/man-hinh/child-prefs-genres');
      if (act === 'back') ctx.go('/man-hinh/child-prefs-age');
      if (act === 'skip') ctx.go('/man-hinh/child-home');
    },
  },

  {
    id: 'child-prefs-genres', plane: 'child', icon: 'grid', frame: 'phone',
    sid: 'CHILD-ONBOARD-PREFS-GENRES', name: 'Onboarding · thể loại',
    desc: 'Bước 3/3. Xong bước này thì trang chủ đã được cá nhân hoá.',
    live: true,
    init: () => ({ genres: ['realistic', 'social'] }),
    render(ctx) { return prefsStep(ctx, 3); },
    act(ctx, act, arg) {
      if (act === 'genre') {
        const i = ctx.local.genres.indexOf(arg);
        if (i >= 0) ctx.local.genres.splice(i, 1); else ctx.local.genres.push(arg);
        ctx.rerender();
      }
      if (act === 'next' || act === 'skip') ctx.go('/man-hinh/child-home');
      if (act === 'back') ctx.go('/man-hinh/child-prefs-tags');
    },
  },

  {
    id: 'child-select-profile', plane: 'child', icon: 'user',
    sid: 'CHILD-SELECT-PROFILE', name: 'Chọn hồ sơ người đọc',
    desc: 'Mỗi con một hồ sơ, một tiến trình, một sổ chiến lược. Thêm hồ sơ mới cần người lớn.',
    live: true,
    states: [{ id: 'default', label: 'Mặc định' }, { id: 'empty', label: 'Chưa có hồ sơ' }],
    init: () => ({ pick: ME.id }),
    render(ctx) {
      if (ctx.view === 'empty') {
        return readerShell({ title: 'Chọn hồ sơ người đọc',
          content: empty('userPlus', 'Chưa có hồ sơ nào',
            'Người lớn tạo hồ sơ đầu tiên cho con, chỉ cần một biệt danh và nhóm tuổi.',
            btn('Tạo hồ sơ đầu tiên', { kind: 'primary', icon: 'plus' })) });
      }
      return readerShell({
        title: 'Chọn hồ sơ người đọc',
        content: html`<div class="wn-pad wn-stack-5">
          <p class="wn-caption">Chạm vào tên con để bắt đầu.</p>
          <div class="wn-cols-2">
            ${CHILDREN.map((c) => html`<button type="button" class="wn-card" data-act="pick" data-arg="${c.id}"
              style="cursor:pointer;display:grid;gap:var(--wn-space-3);justify-items:center;text-align:center;
                border-color:${ctx.local.pick === c.id ? 'var(--wn-accent)' : 'var(--wn-border)'};
                border-width:${ctx.local.pick === c.id ? '2px' : '1px'}">
              ${avatar(c.name, { size: 72, tint: c.tint })}
              <b class="wn-title">${c.name}</b>
              <span class="wn-caption">${AGE_BANDS.find((b) => b.code === c.bandCode).label}</span>
              ${ctx.local.pick === c.id ? badge('Đang chọn', 'info', 'check') : ''}
            </button>`)}
            <button type="button" class="wn-card" data-act="add"
              style="cursor:pointer;display:grid;gap:var(--wn-space-3);justify-items:center;text-align:center;
                border-style:dashed;box-shadow:none">
              <span style="width:72px;height:72px;border-radius:999px;display:grid;place-items:center;
                background:color-mix(in srgb, var(--wn-border) 55%, transparent);color:var(--wn-muted)">${icon('plus')}</span>
              <b class="wn-title">Thêm hồ sơ</b>
              <span class="wn-caption">Cần người lớn xác nhận</span>
            </button>
          </div>
          ${btn('Vào đọc truyện', { kind: 'primary', block: true, act: 'go', icon: 'arrowRight' })}
          <p class="wn-micro" style="text-align:center">Đây là thiết bị chung? Có thể đổi hồ sơ bất cứ lúc nào.</p>
        </div>`,
      });
    },
    act(ctx, act, arg) {
      if (act === 'pick') { ctx.local.pick = Number(arg); ctx.rerender(); }
      if (act === 'add') ctx.toast('Thêm hồ sơ mới cần cổng phụ huynh — xem mặt phẳng Phụ huynh.');
      if (act === 'go') ctx.go('/man-hinh/child-home');
    },
  },

  {
    id: 'child-home', plane: 'child', icon: 'home',
    sid: 'CHILD-HOME', name: 'Trang chủ của trẻ',
    desc: 'Hai khối: đang đọc dở và gợi ý theo sở thích. Không có chuỗi ngày, không có nhiệm vụ hằng ngày.',
    live: true,
    states: [{ id: 'default', label: 'Mặc định' }, { id: 'loading', label: 'Đang tải' }],
    init: () => ({}),
    render(ctx) {
      const all = library();
      if (ctx.view === 'loading') {
        return readerShell({ appbar: false, tab: 'home',
          content: html`<div class="wn-pad wn-stack">${skeletonGrid(4)}</div>` });
      }
      const st = getState();
      const resuming = HISTORY.filter((h) => !h.endingCode).map((h) => findStory(h.storyCode)).filter(Boolean);
      const suggested = all.filter((s) => ME.genres.includes(s.categoryCode)).slice(0, 6);
      const fresh = all.filter((s) => s.fromUgc);
      return readerShell({
        appbar: false, tab: 'home',
        content: html`
          ${childHeader(ME)}
          ${resuming.length ? storySection('Đang đọc dở', resuming, {
            act: 'open', meta: () => 'Chạm để đọc tiếp',
          }) : ''}
          ${fresh.length ? storySection('Bạn nhỏ vừa viết', fresh, {
            act: 'open', meta: (s) => `Tác giả: ${s.author.name}`,
          }) : ''}
          ${storySection('Gợi ý cho con', suggested, {
            act: 'open',
            overlay: (s) => favOverlay(st.saved.includes(s.code)),
          })}
          <div class="wn-pad">
            <button type="button" class="wn-card wn-row" data-act="notebook" style="cursor:pointer;width:100%;text-align:left">
              <span style="width:44px;height:44px;border-radius:999px;display:grid;place-items:center;
                background:color-mix(in srgb, var(--wn-brand) 18%, transparent);color:var(--wn-accent)">${icon('handHeart')}</span>
              <span class="wn-stack-1" style="flex:1">
                <b class="wn-label">Sổ chiến lược</b>
                <span class="wn-caption">Con đã khám phá ${Object.keys(st.notebook).length} trong ${STRATEGIES.length} cách</span>
              </span>
              ${icon('chevronRight')}
            </button>
          </div>`,
      });
    },
    act(ctx, act) {
      if (act === 'open') ctx.go('/man-hinh/child-story-detail');
      if (act === 'notebook') ctx.go('/man-hinh/child-notebook');
      if (act === 'tab') ctx.go('/man-hinh/child-library');
      if (act === 'notifications') ctx.go('/man-hinh/child-notifications');
      if (act === 'fav') ctx.rerender();
    },
  },

  {
    id: 'child-library', plane: 'child', icon: 'bookOpen',
    sid: 'CHILD-LIBRARY', name: 'Thư viện của trẻ',
    desc: 'Lưới truyện có lọc và nút lưu ngay trên thẻ. Chạm vào tim không mở truyện — chỉ bật/tắt lưu.',
    live: true,
    states: [{ id: 'default', label: 'Mặc định' }, { id: 'loading', label: 'Đang tải' },
             { id: 'empty', label: 'Rỗng' }],
    init: () => ({ cat: null, q: '' }),
    render(ctx) {
      if (ctx.view === 'loading') {
        return readerShell({ title: 'Truyện', tab: 'library', content: html`<div class="wn-pad">${skeletonGrid(8)}</div>` });
      }
      const st = getState();
      let all = library().filter((s) => s.ageBandCode === ME.bandCode);
      if (ctx.local.cat) all = all.filter((s) => s.categoryCode === ctx.local.cat);
      if (ctx.local.q) all = all.filter((s) => s.title.toLowerCase().includes(ctx.local.q.toLowerCase()));
      if (ctx.view === 'empty') all = [];
      const groups = groupByCategory(all);
      return readerShell({
        title: 'Truyện', tab: 'library',
        actions: iconBtn('search', { label: 'Tìm truyện', act: 'search' }),
        content: html`
          <div class="wn-pad" style="padding-bottom:0">
            <div class="wn-row wn-row--wrap" role="group" aria-label="Lọc theo thể loại">
              <button type="button" class="wn-chip ${!ctx.local.cat ? 'is-on' : ''}" data-act="cat" data-arg="">Tất cả</button>
              ${CATEGORIES.filter((c) => library().some((s) => s.categoryCode === c.code)).map((c) => html`
                <button type="button" class="wn-chip ${ctx.local.cat === c.code ? 'is-on' : ''}"
                  data-act="cat" data-arg="${c.code}">${c.name}</button>`)}
            </div>
          </div>
          ${all.length
            ? groups.map((g) => storySection(g.name, g.stories, {
                act: 'open',
                overlay: (s) => favOverlay(st.saved.includes(s.code)),
              }))
            : html`<div class="wn-pad">${empty('search', 'Chưa có truyện nào ở đây',
                'Thử bỏ bộ lọc để xem toàn bộ thư viện.',
                btn('Xoá bộ lọc', { kind: 'outline', act: 'clear' }))}</div>`}`,
      });
    },
    act(ctx, act, arg) {
      if (act === 'cat') { ctx.local.cat = arg || null; ctx.view = 'default'; ctx.rerender(); }
      if (act === 'clear') { ctx.local.cat = null; ctx.local.q = ''; ctx.view = 'default'; ctx.rerender(); }
      if (act === 'open') ctx.go('/man-hinh/child-story-detail');
      if (act === 'fav') { ctx.toast('Đã lưu vào “Của tôi”.'); }
      if (act === 'search') ctx.toast('Ô tìm kiếm mở ngay trên thanh tiêu đề trong bản đầy đủ.');
      if (act === 'tab') ctx.go(arg === 'mine' ? '/man-hinh/child-my-home' : '/man-hinh/child-home');
    },
  },

  {
    id: 'child-story-detail', plane: 'child', icon: 'book',
    sid: 'CHILD-STORY-DETAIL', name: 'Chi tiết truyện',
    desc: 'Hai tab: Tổng quan và Đánh giá. Nút bắt đầu luôn dính đáy màn, trong tầm ngón cái.',
    live: true,
    init: () => ({ tab: 'overview' }),
    render(ctx) {
      const story = findStory('wn-demo-cai-binh-vo');
      const st = getState();
      const saved = st.saved.includes(story.code);
      const finished = st.finished[story.code];
      return readerShell({
        title: 'Chi tiết truyện', back: 'back',
        actions: html`<button type="button" class="wn-icobtn" data-act="fav"
          aria-label="${saved ? 'Bỏ lưu truyện' : 'Lưu truyện'}"
          style="${saved ? 'color:var(--wn-warning)' : ''}">${icon('heart')}</button>`,
        content: html`
          <div class="wn-pad">
            <div class="wn-aside-col">
              <div>${cover(story, { ratio: '34' })}</div>
              <div class="wn-stack-3">
                <div class="wn-stack-1">
                  <h2 class="wn-headline">${story.title}</h2>
                  <span class="wn-caption">${story.categoryName} · ${story.bandLabel} · ${story.estimatedMinutes} phút</span>
                </div>
                <div class="wn-row wn-row--wrap">
                  ${stars(story.rating.average)}
                  <span class="wn-caption">${String(story.rating.average).replace('.', ',')} · ${story.rating.count} đánh giá</span>
                  ${story.audio ? badge('Có giọng kể', 'info', 'volume') : ''}
                  ${finished ? badge(`Đã đọc ${finished.count} lần`, 'success', 'check') : ''}
                </div>
              </div>
            </div>
          </div>
          <div style="position:sticky;top:0;z-index:4">
            ${html`<div class="wn-tabs" role="tablist">
              <button type="button" role="tab" class="wn-tab" data-act="tab" data-arg="overview"
                aria-selected="${ctx.local.tab === 'overview' ? 'true' : 'false'}">Tổng quan</button>
              <button type="button" role="tab" class="wn-tab" data-act="tab" data-arg="ratings"
                aria-selected="${ctx.local.tab === 'ratings' ? 'true' : 'false'}">Đánh giá</button>
            </div>`}
          </div>
          <div class="wn-pad wn-stack-5">
            ${ctx.local.tab === 'overview' ? html`
              <p class="wn-reader">${story.shortDescription}</p>
              <div class="wn-stack-2">
                <b class="wn-label">Truyện này giúp con luyện</b>
                <div class="wn-row wn-row--wrap">
                  ${['nhan_biet_cam_xuc', 'noi_ro_nhu_cau', 'xem_xet_hau_qua']
                    .map((c) => STRATEGIES.find((s) => s.code === c))
                    .map((s) => html`<span class="wn-chip wn-chip--static">${icon(s.icon)}${s.name}</span>`)}
                </div>
              </div>
              <div class="wn-banner wn-banner--info">${icon('users')}
                <div>Cuối truyện có một câu hỏi để hai bố mẹ con cùng nói. Đọc xong nhớ ghé qua.</div></div>
            ` : ratingsBlock(ctx, story)}
          </div>
          <div class="wn-sticky-cta">
            ${btn(finished ? 'Đọc lại từ đầu' : 'Bắt đầu đọc',
                  { kind: 'primary', block: true, act: 'play', icon: 'play' })}
          </div>`,
      });
    },
    act(ctx, act, arg, e, el) {
      const story = findStory('wn-demo-cai-binh-vo');
      if (act === 'tab') { ctx.local.tab = arg; ctx.rerender(); }
      if (act === 'fav') { toggleSaved(story.code); }
      if (act === 'play') ctx.go('/man-hinh/child-player');
      if (act === 'back') ctx.go('/man-hinh/child-library');
      if (act === 'rate') { ctx.local.stars = Number(arg); ctx.rerender(); }
      if (act === '__field' && arg === 'review') ctx.local.review = el.value;
      if (act === 'send-rating') {
        const n = ctx.local.stars || 0;
        const text = (ctx.local.review || '').trim();
        if (!n) { ctx.toast('Chọn số sao trước nhé.'); return; }
        if (n <= 2 && text.length < 10) { ctx.toast('Với 1–2 sao, viết giúp ít nhất 10 ký tự lý do.'); return; }
        saveRating(story.code, n, text);
        ctx.toast('Đã gửi đánh giá. Cảm ơn con!');
      }
    },
  },

  {
    id: 'child-story-ratings', plane: 'child', icon: 'star',
    sid: 'CHILD-STORY-RATINGS', name: 'Tab đánh giá',
    desc: 'Điểm trung bình, phân bố sao, và form đánh giá. Một hoặc hai sao thì bắt buộc viết lý do.',
    live: true,
    init: () => ({ tab: 'ratings', stars: 0, review: '' }),
    render(ctx) {
      const story = findStory('wn-demo-nguoi-la-cong-truong');
      return readerShell({
        title: 'Đánh giá', back: 'back',
        content: html`<div class="wn-pad wn-stack-5">${ratingsBlock(ctx, story)}</div>`,
      });
    },
    act(ctx, act, arg, e, el) {
      const story = findStory('wn-demo-nguoi-la-cong-truong');
      if (act === 'rate') { ctx.local.stars = Number(arg); ctx.rerender(); }
      if (act === '__field' && arg === 'review') ctx.local.review = el.value;
      if (act === 'send-rating') {
        const n = ctx.local.stars || 0;
        const text = (ctx.local.review || '').trim();
        if (!n) { ctx.toast('Chọn số sao trước nhé.'); return; }
        if (n <= 2 && text.length < 10) { ctx.toast('Với 1–2 sao, viết giúp ít nhất 10 ký tự lý do.'); return; }
        saveRating(story.code, n, text);
        ctx.toast('Đã gửi đánh giá. Cảm ơn con!');
      }
      if (act === 'back') ctx.go('/man-hinh/child-story-detail');
    },
  },

  {
    id: 'child-player', plane: 'child', icon: 'play',
    sid: 'CHILD-PLAYER', name: 'Trình phát truyện',
    desc: 'Trái tim của sản phẩm. Chọn một cách xử lý, xem chuyện đi tiếp, và thấy sổ chiến lược đầy dần.',
    live: true,
    init() {
      const story = findStory('wn-demo-cai-binh-vo');
      return { sess: newSession(story), storyCode: story.code };
    },
    render(ctx) {
      const story = findStory(ctx.local.storyCode);
      return renderPlayer(ctx, ctx.local.sess, story, {});
    },
    act(ctx, act, arg, e, el) {
      const story = findStory(ctx.local.storyCode);
      if (playerAct(ctx, ctx.local.sess, story, act, arg, {}, el)) return;
      if (act === 'exit') ctx.go('/man-hinh/child-library');
    },
  },

  {
    id: 'child-proposal', plane: 'child', icon: 'lightbulb', frame: 'phone',
    sid: 'CHILD-PROPOSAL-MODAL', name: 'Đề xuất cách khác',
    desc: 'Mở từ trình phát, không chặn luồng chơi. Trẻ vẫn chọn nhánh chính sau khi đóng.',
    live: true,
    init() {
      const story = findStory('wn-demo-ban-ru-tron-hoc');
      const sess = newSession(story);
      sess.sheet = 'proposal';
      return { sess, storyCode: story.code };
    },
    render(ctx) {
      const story = findStory(ctx.local.storyCode);
      return renderPlayer(ctx, ctx.local.sess, story, {});
    },
    act(ctx, act, arg, e, el) {
      const story = findStory(ctx.local.storyCode);
      if (playerAct(ctx, ctx.local.sess, story, act, arg, {}, el)) return;
      if (act === 'exit') ctx.go('/man-hinh/child-player');
    },
  },

  {
    id: 'child-ending', plane: 'child', icon: 'award',
    sid: 'CHILD-ENDING', name: 'Màn kết truyện',
    desc: 'Năm khối: điều đã xảy ra · một cách khác · câu hỏi suy ngẫm · cách con đã dùng · thẻ trò chuyện.',
    live: true,
    states: [{ id: 'default', label: 'Kết tích cực' }, { id: 'neutral', label: 'Kết trung tính' }],
    init() {
      const story = findStory('wn-demo-cai-binh-vo');
      const sess = newSession(story);
      sess.ending = 'e_cungnoi';
      sess.step = story.totalScenes;
      sess.used = ['nhan_biet_cam_xuc', 'noi_ro_nhu_cau', 'nho_giup_do'];
      return { sess, storyCode: story.code };
    },
    render(ctx) {
      const story = findStory(ctx.local.storyCode);
      ctx.local.sess.ending = ctx.view === 'neutral' ? 'e_trong' : 'e_cungnoi';
      ctx.local.sess.used = ctx.view === 'neutral' ? ['xem_xet_hau_qua'] : ['nhan_biet_cam_xuc', 'noi_ro_nhu_cau', 'nho_giup_do'];
      return renderPlayer(ctx, ctx.local.sess, story, {});
    },
    /* Màn này mở thẳng vào đoạn kết nên không đi qua hàm kết thúc của trình phát —
       phải tự bắn pháo giấy, và chỉ khi đoạn kết thật sự tích cực (R10). */
    after(ctx, root) {
      const story = findStory(ctx.local.storyCode);
      const ending = story.endingByCode[ctx.local.sess.ending];
      if (!ending || !ending.isPositive) return;
      const host = root.querySelector('#wn-ending');
      if (host) confetti(host);
    },
    act(ctx, act, arg, e, el) {
      const story = findStory(ctx.local.storyCode);
      if (act === 'replay') { ctx.go('/man-hinh/child-player'); return; }
      if (playerAct(ctx, ctx.local.sess, story, act, arg, {}, el)) return;
      if (act === 'exit') ctx.go('/man-hinh/child-library');
    },
  },

  {
    id: 'child-replay', plane: 'child', icon: 'refresh',
    sid: 'CHILD-REPLAY', name: 'Chơi lại',
    desc: 'Sau khi đọc xong, trẻ thấy mình đã đi nhánh nào và còn nhánh nào chưa mở.',
    live: true,
    init: () => ({}),
    render(ctx) {
      const story = findStory('wn-demo-cai-binh-vo');
      const seen = ['e_cungnoi'];
      return readerShell({
        title: 'Chơi lại', back: 'back',
        content: html`<div class="wn-pad wn-stack-5">
          <div class="wn-card wn-row">
            <div style="width:72px;flex:none">${cover(story, { ratio: '34' })}</div>
            <div class="wn-stack-1">
              <b class="wn-title">${story.title}</b>
              <span class="wn-caption">Con đã đọc ${seen.length} trong ${story.endings.length} kết thúc</span>
            </div>
          </div>
          <div class="wn-stack-2">
            <b class="wn-label">Những kết thúc của truyện này</b>
            ${story.endings.map((en) => {
              const found = seen.includes(en.code);
              return html`<div class="wn-card wn-card--flat wn-row" style="padding:var(--wn-space-4);
                opacity:${found ? '1' : '.62'}">
                <span style="color:${found ? 'var(--wn-success)' : 'var(--wn-muted)'}">
                  ${icon(found ? 'checkCircle' : 'circleDashed')}</span>
                <span class="wn-stack-1" style="flex:1">
                  <b class="wn-label">${found ? en.title : 'Chưa mở'}</b>
                  <span class="wn-caption">${found ? en.summaryText.slice(0, 74) + '…' : 'Thử một cách xử lý khác để tới đây.'}</span>
                </span>
              </div>`;
            })}
          </div>
          <div class="wn-banner wn-banner--info">${icon('info')}
            <div>Chơi lại là bắt đầu một lượt mới từ đầu. Sổ chiến lược của con vẫn giữ nguyên.</div></div>
          ${btn('Bắt đầu lượt mới', { kind: 'primary', block: true, act: 'play', icon: 'refresh' })}
          ${btn('Về thư viện', { kind: 'ghost', block: true, act: 'back' })}
        </div>`,
      });
    },
    act(ctx, act) {
      if (act === 'play') ctx.go('/man-hinh/child-player');
      if (act === 'back') ctx.go('/man-hinh/child-library');
    },
  },

  {
    id: 'child-history', plane: 'child', icon: 'clock',
    sid: 'CHILD-HISTORY', name: 'Lịch sử đã đọc',
    desc: 'Danh sách theo thời gian, kèm kết thúc đã tới. Không có tổng thời gian, không có mục tiêu ngày.',
    live: true,
    states: [{ id: 'default', label: 'Mặc định' }, { id: 'empty', label: 'Rỗng' }],
    init: () => ({}),
    render(ctx) {
      if (ctx.view === 'empty') {
        return readerShell({ title: 'Đã đọc', back: 'back',
          content: empty('clock', 'Chưa có truyện nào ở đây',
            'Đọc xong một truyện là nó xuất hiện ngay.',
            btn('Tới thư viện', { kind: 'primary', act: 'back' })) });
      }
      return readerShell({
        title: 'Đã đọc', back: 'back',
        content: html`<div class="wn-pad wn-stack-3">
          ${HISTORY.map((h) => {
            const s = findStory(h.storyCode);
            if (!s) return '';
            const ending = h.endingCode ? s.endingByCode[h.endingCode] : null;
            return html`<button type="button" class="wn-card wn-row" data-act="open" data-arg="${s.code}"
              style="cursor:pointer;text-align:left;width:100%;padding:var(--wn-space-3)">
              <span style="width:56px;flex:none">${cover(s, { ratio: '34' })}</span>
              <span class="wn-stack-1" style="flex:1;min-width:0">
                <b class="wn-label">${s.title}</b>
                <span class="wn-caption">${ending ? `Kết thúc: ${ending.title}` : 'Đang đọc dở'} · ${relTime(h.at)}</span>
              </span>
              ${ending ? badge(`${h.completed} lần`, 'neutral') : badge('Đọc tiếp', 'info', 'play')}
            </button>`;
          })}
        </div>`,
      });
    },
    act(ctx, act) {
      if (act === 'open') ctx.go('/man-hinh/child-story-detail');
      if (act === 'back') ctx.go('/man-hinh/child-my-home');
    },
  },

  {
    id: 'child-profile', plane: 'child', icon: 'user',
    sid: 'CHILD-PROFILE', name: 'Hồ sơ của trẻ',
    desc: 'Avatar, nhóm tuổi, và những cách xử lý con đã gặp. Không có điểm, không có hạng.',
    live: true,
    init: () => ({}),
    render(ctx) {
      const st = getState();
      const found = STRATEGIES.filter((s) => st.notebook[s.code]);
      return readerShell({
        title: 'Hồ sơ của con', back: 'back',
        actions: iconBtn('settings', { label: 'Cài đặt', act: 'settings' }),
        content: html`<div class="wn-pad wn-stack-5">
          <div class="wn-stack-3" style="justify-items:center;text-align:center">
            ${avatar(ME.name, { size: 92, tint: ME.tint })}
            <div class="wn-stack-1">
              <b class="wn-headline">${ME.name}</b>
              <span class="wn-caption">${AGE_BANDS.find((b) => b.code === ME.bandCode).label}</span>
            </div>
            ${btn('Đổi ảnh đại diện', { kind: 'outline', sm: true, act: 'avatar', icon: 'image' })}
          </div>
          <hr class="wn-divider">
          <div class="wn-stack-2">
            <b class="wn-label">Cách con đã dùng</b>
            ${found.length
              ? html`<div class="wn-row wn-row--wrap">${found.map((s) => html`
                  <span class="wn-chip wn-chip--static">${icon(s.icon)}${s.name}</span>`)}</div>`
              : html`<p class="wn-caption">Đọc một truyện là sổ bắt đầu có chữ.</p>`}
          </div>
          <div class="wn-cols-2">
            <button type="button" class="wn-card wn-stack-2" data-act="history" style="cursor:pointer;text-align:left">
              <span style="color:var(--wn-accent)">${icon('clock')}</span>
              <b class="wn-label">Đã đọc</b><span class="wn-caption">${HISTORY.length} truyện</span>
            </button>
            <button type="button" class="wn-card wn-stack-2" data-act="saved" style="cursor:pointer;text-align:left">
              <span style="color:var(--wn-accent)">${icon('bookmark')}</span>
              <b class="wn-label">Đã lưu</b><span class="wn-caption">${st.saved.length} truyện</span>
            </button>
          </div>
          ${btn('Đổi hồ sơ khác', { kind: 'secondary', block: true, act: 'switch', icon: 'users' })}
        </div>`,
      });
    },
    act(ctx, act) {
      if (act === 'history') ctx.go('/man-hinh/child-history');
      if (act === 'saved') ctx.go('/man-hinh/child-my-saved');
      if (act === 'switch') ctx.go('/man-hinh/child-select-profile');
      if (act === 'settings') ctx.go('/man-hinh/child-settings');
      if (act === 'back') ctx.go('/man-hinh/child-my-home');
      if (act === 'avatar') ctx.toast('Chọn ảnh rồi cắt vuông — hộp thoại cắt ảnh dùng chung với bìa truyện.');
    },
  },

  {
    id: 'child-my-home', plane: 'child', icon: 'bookmark',
    sid: 'CHILD-MY-HOME', name: 'Của tôi (hub)',
    desc: 'Ba ô lớn: đã lưu, sáng tác, sổ chiến lược. Mỗi ô có trạng thái rỗng riêng.',
    live: true,
    init: () => ({}),
    render(ctx) {
      const st = getState();
      const mine = st.ugc.filter((u) => u.ownerName === ME.name);
      const inReview = mine.filter((u) => ['submitted', 'under_review', 'needs_revision'].includes(u.status));
      const found = Object.keys(st.notebook).length;
      const tiles = [
        { act: 'saved', icon: 'bookmark', title: 'Đã lưu', note: st.saved.length ? `${st.saved.length} truyện` : 'Chưa lưu truyện nào',
          badge: st.saved.length ? String(st.saved.length) : null },
        { act: 'ugc', icon: 'wand', title: 'Sáng tác', note: mine.length ? `${mine.length} bản` : 'Chưa có bản nào',
          badge: inReview.length ? 'Đang duyệt' : null },
        { act: 'notebook', icon: 'handHeart', title: 'Sổ chiến lược', note: `${found} / ${STRATEGIES.length} cách đã khám phá` },
      ];
      return readerShell({
        title: 'Của tôi', tab: 'mine',
        actions: iconBtn('bell', { label: 'Thông báo', act: 'notifications' }),
        content: html`<div class="wn-pad wn-stack-3">
          ${tiles.map((t) => html`<button type="button" class="wn-card wn-row" data-act="${t.act}"
            style="cursor:pointer;text-align:left;width:100%;min-height:88px">
            <span style="width:48px;height:48px;border-radius:var(--wn-radius-md);display:grid;place-items:center;
              background:color-mix(in srgb, var(--wn-accent) 12%, transparent);color:var(--wn-accent)">${icon(t.icon)}</span>
            <span class="wn-stack-1" style="flex:1">
              <b class="wn-title">${t.title}</b>
              <span class="wn-caption">${t.note}</span>
            </span>
            ${t.badge ? badge(t.badge, 'info') : ''}
            ${icon('chevronRight')}
          </button>`)}
          <hr class="wn-divider">
          <div class="wn-cols-2">
            <button type="button" class="wn-card wn-stack-2" data-act="history" style="cursor:pointer;text-align:left">
              ${icon('clock')}<b class="wn-label">Đã đọc</b></button>
            <button type="button" class="wn-card wn-stack-2" data-act="profile" style="cursor:pointer;text-align:left">
              ${icon('user')}<b class="wn-label">Hồ sơ của con</b></button>
          </div>
        </div>`,
      });
    },
    act(ctx, act) {
      const map = { saved: 'child-my-saved', ugc: 'ugc-list', notebook: 'child-notebook',
        history: 'child-history', profile: 'child-profile', notifications: 'child-notifications' };
      if (map[act]) ctx.go('/man-hinh/' + map[act]);
      if (act === 'tab') ctx.go('/man-hinh/child-home');
    },
  },

  {
    id: 'child-my-saved', plane: 'child', icon: 'heart',
    sid: 'CHILD-MY-SAVED', name: 'Truyện đã lưu',
    desc: 'Cùng loại thẻ với thư viện, sắp mới lưu trước. Bỏ lưu ngay tại chỗ, có hoàn tác.',
    live: true,
    states: [{ id: 'default', label: 'Mặc định' }, { id: 'empty', label: 'Rỗng' }],
    init: () => ({}),
    render(ctx) {
      const st = getState();
      const saved = ctx.view === 'empty' ? [] : st.saved.map(findStory).filter(Boolean);
      return readerShell({
        title: 'Đã lưu', back: 'back',
        content: saved.length
          ? storySection(`${saved.length} truyện`, saved, {
              act: 'open', overlay: () => favOverlay(true) })
          : empty('heart', 'Chưa có truyện nào được lưu',
              'Chạm vào trái tim trên trang truyện để lưu lại đọc sau.',
              btn('Tới thư viện', { kind: 'primary', act: 'back' })),
      });
    },
    act(ctx, act, arg) {
      if (act === 'open') ctx.go('/man-hinh/child-story-detail');
      if (act === 'back') ctx.go('/man-hinh/child-my-home');
      if (act === 'fav') ctx.toast('Đã bỏ lưu. Hoàn tác?');
    },
  },

  {
    id: 'child-notebook', plane: 'child', icon: 'handHeart',
    sid: 'CHILD-STRATEGY-NOTEBOOK', name: 'Sổ chiến lược',
    desc: 'Cả năm mục đều hiện. Mục chưa khám phá thì mờ đi chứ không giấu — trẻ cần thấy còn gì để tìm.',
    live: true,
    init: () => ({}),
    render(ctx) {
      const st = getState();
      const found = STRATEGIES.filter((s) => st.notebook[s.code]).length;
      return readerShell({
        title: 'Sổ chiến lược', back: 'back',
        content: html`<div class="wn-pad wn-stack-5">
          <div class="wn-card wn-card--flat wn-stack-2">
            <b class="wn-title">Con đã khám phá ${found} trong ${STRATEGIES.length} cách</b>
            <span class="wn-caption">Sổ chỉ cộng dồn. Không có tổng, không có thứ hạng, không có gì để
              so với bạn khác.</span>
            <div class="wn-progress" style="margin-top:6px">
              ${STRATEGIES.map((s, i) => html`<span class="${st.notebook[s.code] ? 'is-done' : ''}"></span>`)}
            </div>
          </div>
          <div class="wn-cols-auto">
            ${STRATEGIES.map((s) => {
              const e = st.notebook[s.code];
              return html`<div class="wn-card wn-stack-2" style="opacity:${e ? '1' : '.58'}">
                <span style="width:44px;height:44px;border-radius:999px;display:grid;place-items:center;
                  background:color-mix(in srgb, var(--wn-brand) ${e ? '20' : '10'}%, transparent);
                  color:${e ? 'var(--wn-accent)' : 'var(--wn-muted)'}">${icon(s.icon)}</span>
                <b class="wn-label">${s.name}</b>
                <p class="wn-caption">${s.description}</p>
                ${e
                  ? html`<span class="wn-micro">${icon('sparkles')} Khám phá lần đầu trong
                      «${e.firstStoryTitle}» · đã dùng ${e.times} lần</span>`
                  : html`<span class="wn-micro">${icon('circleDashed')} ${s.promptForChild}</span>`}
              </div>`;
            })}
          </div>
          ${found < STRATEGIES.length
            ? btn('Tìm cách còn thiếu trong thư viện', { kind: 'primary', block: true, act: 'library', icon: 'bookOpen' })
            : banner('Con đã tìm ra đủ năm cách. Giờ là lúc dùng chúng ngoài đời.', 'success', 'award')}
        </div>`,
      });
    },
    act(ctx, act) {
      if (act === 'library') ctx.go('/man-hinh/child-library');
      if (act === 'back') ctx.go('/man-hinh/child-my-home');
    },
  },

  {
    id: 'child-notifications', plane: 'child', icon: 'bell',
    sid: 'CHILD-NOTIFICATIONS', name: 'Thông báo',
    desc: 'Chỉ thông báo về truyện của chính con. Không có thông báo mời quay lại, không có nhắc nhở ép buộc.',
    live: true,
    states: [{ id: 'default', label: 'Mặc định' }, { id: 'empty', label: 'Rỗng' }],
    init: () => ({}),
    render(ctx) {
      const items = ctx.view === 'empty' ? [] : NOTIFICATIONS;
      return readerShell({
        title: 'Thông báo', back: 'back',
        content: items.length
          ? html`<div class="wn-pad wn-stack-2">
              ${items.map((n) => html`<button type="button" class="wn-card wn-row wn-row--top"
                data-act="open" data-arg="${n.id}" style="cursor:pointer;text-align:left;width:100%;
                background:${n.unread ? 'color-mix(in srgb, var(--wn-accent) 6%, var(--wn-surface))' : 'var(--wn-surface)'}">
                <span style="color:var(--wn-accent);margin-top:2px">${icon(n.kind === 'ugc' ? 'wand' : 'info')}</span>
                <span class="wn-stack-1" style="flex:1">
                  <b class="wn-label">${n.title}</b>
                  <span class="wn-caption">${n.body}</span>
                  <span class="wn-micro">${relTime(n.at)}</span>
                </span>
                ${n.unread ? badge('Mới', 'info') : ''}
              </button>`)}
            </div>`
          : empty('bell', 'Chưa có thông báo nào', 'Khi đội duyệt nhắn về truyện của con, tin sẽ hiện ở đây.'),
      });
    },
    act(ctx, act) {
      if (act === 'open') ctx.go('/man-hinh/ugc-review-thread');
      if (act === 'back') ctx.go('/man-hinh/child-my-home');
    },
  },

  {
    id: 'child-settings', plane: 'child', icon: 'settings',
    sid: 'CHILD-SETTINGS', name: 'Cài đặt',
    desc: 'Đổi giao diện bằng ba nút icon, đổi nhóm tuổi, đổi sở thích. Khu vực phụ huynh có cửa riêng.',
    live: true,
    init: () => ({ theme: 'system' }),
    render(ctx) {
      const rows = [
        ['users', 'Đổi hồ sơ', 'Đang dùng hồ sơ của ' + ME.name, 'switch'],
        ['sparkles', 'Sở thích đọc', ME.interests.join(' · '), 'prefs'],
        ['bell', 'Thông báo', 'Chỉ tin về truyện của con', 'notif'],
        ['shield', 'Khu vực phụ huynh', 'Cần người lớn xác nhận', 'parent'],
      ];
      return readerShell({
        title: 'Cài đặt', back: 'back',
        content: html`<div class="wn-pad wn-stack-5">
          <div class="wn-card wn-stack-3">
            <b class="wn-label">Giao diện</b>
            <div class="wn-row" role="group" aria-label="Chọn giao diện">
              ${[['sun', 'light', 'Sáng'], ['moon', 'dark', 'Tối'], ['monitor', 'system', 'Theo máy']]
                .map(([ic, id, label]) => html`<button type="button" class="wn-chip ${ctx.local.theme === id ? 'is-on' : ''}"
                  data-act="theme" data-arg="${id}" aria-pressed="${ctx.local.theme === id ? 'true' : 'false'}"
                  >${icon(ic)}${label}</button>`)}
            </div>
            <span class="wn-micro">Ba nút, luôn nhìn thấy cả ba. Không dùng ô chọn xổ xuống.</span>
          </div>
          <div class="wn-card wn-card--pad0">
            ${rows.map(([ic, t, sub, act], i) => html`<button type="button" data-act="${act}"
              style="display:flex;gap:var(--wn-space-3);align-items:center;width:100%;text-align:left;
                padding:var(--wn-space-4);background:transparent;border:0;cursor:pointer;min-height:var(--wn-tap);
                border-top:${i ? '1px solid var(--wn-border)' : '0'}">
              <span style="color:var(--wn-accent)">${icon(ic)}</span>
              <span class="wn-stack-1" style="flex:1"><b class="wn-label">${t}</b>
                <span class="wn-caption">${sub}</span></span>
              ${icon('chevronRight')}
            </button>`)}
          </div>
          <p class="wn-micro" style="text-align:center">Phiên bản demo · dữ liệu chỉ nằm trên máy bạn</p>
        </div>`,
      });
    },
    act(ctx, act, arg) {
      if (act === 'theme') { ctx.local.theme = arg; ctx.rerender();
        ctx.toast('Trong bản thật, lựa chọn này lưu ngay trên máy.'); }
      if (act === 'switch') ctx.go('/man-hinh/child-select-profile');
      if (act === 'prefs') ctx.go('/man-hinh/child-prefs-tags');
      if (act === 'parent') ctx.go('/man-hinh/parent-gate');
      if (act === 'notif') ctx.go('/man-hinh/child-notifications');
      if (act === 'back') ctx.go('/man-hinh/child-profile');
    },
  },
];

/* ------------------------------------------------------------------ mảnh dùng chung */

function prefsStep(ctx, step) {
  const titles = ['Con bao nhiêu tuổi?', 'Con thích chuyện kiểu gì?', 'Thể loại nào con muốn thấy nhiều hơn?'];
  const body = step === 1
    ? html`<div class="wn-cols-2">
        ${AGE_BANDS.slice(0, 4).map((b) => html`<button type="button" class="wn-card"
          data-act="pick" data-arg="${b.code}" style="cursor:pointer;display:grid;gap:var(--wn-space-2);
            justify-items:center;text-align:center;padding:var(--wn-space-5);
            border-color:${ctx.local.pick === b.code ? 'var(--wn-accent)' : 'var(--wn-border)'};
            border-width:${ctx.local.pick === b.code ? '2px' : '1px'}">
          <span style="font-size:26px;font-weight:700;color:var(--wn-accent)">${b.min}–${b.max}</span>
          <span class="wn-caption">${b.label.split(' (')[0]}</span>
        </button>`)}
      </div>`
    : step === 2
      ? html`<div class="wn-stack-5">
          ${INTEREST_GROUPS.map((g) => html`<div class="wn-stack-2">
            <b class="wn-label">${g.name}</b>
            <div class="wn-row wn-row--wrap">
              ${g.tags.map((t) => html`<button type="button"
                class="wn-chip ${ctx.local.tags.includes(t) ? 'is-on' : ''}" data-act="tag" data-arg="${t}"
                aria-pressed="${ctx.local.tags.includes(t) ? 'true' : 'false'}"
                >${ctx.local.tags.includes(t) ? icon('check') : ''}${t}</button>`)}
            </div>
          </div>`)}
          <span class="wn-micro">Đã chọn ${ctx.local.tags.length} / 8</span>
        </div>`
      : html`<div class="wn-row wn-row--wrap">
          ${CATEGORIES.slice(0, 12).map((c) => html`<button type="button"
            class="wn-chip ${ctx.local.genres.includes(c.code) ? 'is-on' : ''}" data-act="genre" data-arg="${c.code}"
            aria-pressed="${ctx.local.genres.includes(c.code) ? 'true' : 'false'}"
            >${ctx.local.genres.includes(c.code) ? icon('check') : ''}${c.name}</button>`)}
        </div>`;

  return html`<div class="wn-screen">
    <div class="wn-row" style="padding:var(--wn-space-3) var(--wn-gutter)">
      ${step > 1 ? html`<button type="button" class="wn-icobtn" data-act="back" aria-label="Quay lại">${icon('chevronLeft')}</button>` : ''}
      <span class="wn-caption">Bước ${step} / 3</span>
      <span class="wn-spacer"></span>
      <button type="button" class="wn-btn wn-btn--ghost wn-btn--sm" data-act="skip">Bỏ qua</button>
    </div>
    <div class="wn-progress" style="margin:0 var(--wn-gutter)">
      ${[1, 2, 3].map((i) => html`<span class="${i < step ? 'is-done' : i === step ? 'is-now' : ''}"></span>`)}
    </div>
    <div class="wn-scroll wn-pad wn-stack-6" style="padding-top:var(--wn-space-6)">
      <h2 class="wn-headline">${titles[step - 1]}</h2>
      ${body}
    </div>
    <div class="wn-sticky-cta">
      ${btn(step === 3 ? 'Xong' : 'Tiếp', { kind: 'primary', block: true, act: 'next', icon: 'arrowRight' })}
    </div>
  </div>`;
}

function ratingsBlock(ctx, story) {
  const st = getState();
  const mine = st.ratings[story.code];
  const picked = ctx.local.stars || (mine ? mine.stars : 0);
  const comments = [
    { name: 'Phụ huynh của Mít', stars: 5, at: '2026-08-26T10:00:00Z',
      text: 'Con nhà mình đọc xong tự kể lại chuyện ở lớp. Câu hỏi cuối truyện dùng được ngay.' },
    { name: 'Bo', stars: 4, at: '2026-08-24T14:30:00Z',
      text: 'Cháu thích đoạn cuối. Nhưng cháu muốn có thêm nhánh nữa.' },
    { name: 'Phụ huynh của Na', stars: 5, at: '2026-08-21T09:12:00Z',
      text: 'Tranh đẹp, chữ vừa mắt, không có quảng cáo.' },
  ];
  return html`<div class="wn-stack-5">
    <div class="wn-card wn-card--flat wn-row wn-row--wrap" style="gap:var(--wn-space-6)">
      <div class="wn-stack-1" style="text-align:center">
        <b style="font-size:38px;line-height:1;font-weight:700">${String(story.rating.average).replace('.', ',')}</b>
        ${stars(story.rating.average)}
        <span class="wn-micro">${story.rating.count} đánh giá</span>
      </div>
      <div style="flex:1;min-width:200px">${histogram(story.rating.hist)}</div>
    </div>

    <div class="wn-card wn-stack-3">
      <b class="wn-label">${mine ? 'Đánh giá của con' : 'Con thấy truyện này thế nào?'}</b>
      ${starPicker(picked)}
      <div class="wn-field">
        <label for="review">Chia sẻ thêm ${picked && picked <= 2 ? html`<span style="color:var(--wn-danger)">(bắt buộc với 1–2 sao)</span>` : html`<span class="wn-quiet">(không bắt buộc)</span>`}</label>
        <textarea class="wn-textarea" id="review" rows="3" data-field="review"
          placeholder="Vì sao con chọn mức này?">${mine ? mine.text : ''}</textarea>
        <span class="wn-hint">Với 1–2 sao cần ít nhất 10 ký tự để đội nội dung hiểu được ý con.</span>
      </div>
      ${btn('Gửi đánh giá', { kind: 'primary', act: 'send-rating', icon: 'send' })}
    </div>

    <div class="wn-stack-3">
      <b class="wn-label">Người khác nói gì</b>
      ${comments.map((c) => html`<div class="wn-card wn-card--flat wn-row wn-row--top" style="padding:var(--wn-space-4)">
        ${avatar(c.name, { size: 36 })}
        <div class="wn-stack-1" style="flex:1">
          <div class="wn-row" style="gap:8px">
            <b class="wn-label">${c.name}</b>${stars(c.stars)}
            <span class="wn-spacer"></span><span class="wn-micro">${relTime(c.at)}</span>
          </div>
          <p class="wn-caption">${c.text}</p>
        </div>
      </div>`)}
      ${btn('Xem thêm', { kind: 'ghost', act: 'more' })}
    </div>
  </div>`;
}
