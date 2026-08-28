/**
 * Bốn trang tài liệu của khung trưng bày: Tổng quan, Ba vai, cấu hình luồng vai, và trang
 * tự kiểm tra (không nằm trên thanh điều hướng — dùng để xác nhận cả 70 màn còn render được).
 */

import { html, icon, raw } from 'wnd/ui.js';
import { PLANES, SCREENS, screensOfPlane } from 'wnd/registry.js';
import { STRATEGIES } from 'wnd/data/strategies.js';

/* ------------------------------------------------------------------ tổng quan */

const LOOP = ['Tình huống', 'Lựa chọn', 'Hậu quả', 'Nhận thức', 'Lặp lại'];

export function overviewPage() {
  const liveCount = SCREENS.filter((s) => s.live).length;
  return html`<div class="wnd-doc">

    <section class="wnd-hero">
      <span class="wnd-eyebrow">${icon('sparkles')}Demo sản phẩm</span>
      <h1 class="wnd-h1">Rồi Sao Nữa — học kỹ năng sống bằng cách tự quyết định</h1>
      <p class="wnd-quote">“Con chọn thế nào… rồi sao nữa?”</p>
      <p class="wnd-lede">Trẻ 6–10 tuổi được đặt vào một tình huống có thật trong đời sống, tự chọn
        cách xử lý, rồi thấy điều gì đến sau lựa chọn đó. Không chấm điểm, không xếp hạng, không so
        con này với con kia — thứ trẻ mang về là <b>cách xử lý mà trẻ đã tự tìm ra</b>.</p>
      <div class="wnd-row wnd-row--wrap">
        <a class="wn-btn wn-btn--primary" href="#/ba-vai/nguoi-xem">${icon('play')}Chơi thử một truyện</a>
        <a class="wn-btn wn-btn--outline" href="#/man-hinh">${icon('grid')}Xem ${SCREENS.length} màn hình</a>
      </div>
    </section>

    <section class="wnd-cards">
      <div class="wnd-card"><div class="wnd-stat"><b>${SCREENS.length}</b><span>màn hình dựng đủ</span></div></div>
      <div class="wnd-card"><div class="wnd-stat"><b>${PLANES.length}</b><span>mặt phẳng đối tượng</span></div></div>
      <div class="wnd-card"><div class="wnd-stat"><b>${liveCount}</b><span>màn bấm được thật</span></div></div>
      <div class="wnd-card"><div class="wnd-stat"><b>5</b><span>chiến lược trong sổ của trẻ</span></div></div>
    </section>

    <section class="wnd-section">
      <div class="wnd-section__head">
        <h2 class="wnd-h2">Vòng học</h2>
        <p>Sản phẩm không dạy lý thuyết. Nó dựng một môi trường an toàn để trẻ thử, sai, và hiểu ra.</p>
      </div>
      <div class="wnd-loop">
        ${LOOP.map((step, i) => html`
          <span class="wnd-loop__step">${step}</span>
          ${i < LOOP.length - 1 ? html`<span class="wnd-loop__arrow">${icon('arrowRight')}</span>` : ''}
        `)}
        <span class="wnd-loop__arrow">${icon('refresh')}</span>
      </div>
      <div class="wnd-flowbar">
        ${icon('lightbulb')}
        <span>Và một vòng thứ hai, chậm hơn: <b>người dùng đề xuất → hệ thống ghi nhận →
        biên tập duyệt → nội dung tốt lên</b>. Trẻ không chỉ đọc, trẻ còn viết.</span>
      </div>
    </section>

    <section class="wnd-section">
      <div class="wnd-section__head">
        <h2 class="wnd-h2">Không có điểm. Có một cuốn sổ.</h2>
        <p>Hệ điểm 0–100 đã bị gỡ khỏi sản phẩm vì nó mâu thuẫn với chính bộ luật sư phạm:
          không chấm điểm đạo đức trẻ, không xếp hạng công khai, không hiển thị phán xét.
          Thay vào đó, mỗi lựa chọn có thể gắn một <b>chiến lược</b>; chọn xong thì chiến lược vào sổ.
          Sổ chỉ cộng dồn, không có tổng, không có gì để so.</p>
      </div>
      <div class="wnd-strategies">
        ${STRATEGIES.map((s) => html`<div class="wnd-strategy">
          <span class="wnd-strategy__icon">${icon(s.icon)}</span>
          <b>${s.name}</b><span>${s.description}</span>
        </div>`)}
      </div>
    </section>

    <section class="wnd-section">
      <div class="wnd-section__head">
        <h2 class="wnd-h2">Sáu chỗ đứng, một sản phẩm</h2>
        <p>Cùng một thư viện truyện trông rất khác tuỳ ai đang nhìn. Khác biệt nằm ở
          <b>giới hạn</b> — đăng nhập, dữ liệu, quyền của phụ huynh — chứ không phải ở việc dựng
          sáu sản phẩm rời nhau.</p>
      </div>
      <div class="wnd-planes">
        ${PLANES.map((p) => html`<a class="wnd-plane" href="#/man-hinh/${screensOfPlane(p.id)[0]?.id || ''}">
          <span class="wnd-plane__badge" style="background:${p.color}">${icon(p.icon)}</span>
          <span class="wnd-plane__body"><b>${p.name}</b><span>${p.blurb}</span></span>
          <span class="wnd-plane__n">${screensOfPlane(p.id).length} màn ${raw('&rsaquo;')}</span>
        </a>`)}
      </div>
    </section>

    <section class="wnd-section">
      <div class="wnd-section__head">
        <h2 class="wnd-h2">Vòng lặp nội dung, nhìn thấy được</h2>
        <p>Ba vai trong demo dùng chung một kho dữ liệu. Truyện mà bạn soạn ở vai tác giả, sau khi
          bạn tự duyệt ở vai quản trị, sẽ xuất hiện thật trong thư viện của trẻ.</p>
      </div>
      <div class="wnd-roles">
        ${ROLES.map((r, i) => html`<a class="wnd-role" href="#/ba-vai/${r.id}">
          <span class="wnd-role__num">Vai ${i + 1}</span>
          <h3>${r.label}</h3>
          <p>${r.blurb}</p>
          <span class="wnd-role__cta">${r.cta}${icon('arrowRight')}</span>
        </a>`)}
      </div>
    </section>

    <section class="wnd-section">
      <div class="wnd-section__head">
        <h2 class="wnd-h2">Về bản demo này</h2>
      </div>
      <div class="wnd-cards">
        <div class="wnd-card">
          <div class="wnd-card__icon">${icon('zap')}</div>
          <h3>Không cần máy chủ</h3>
          <p>Toàn bộ là HTML, CSS và JavaScript thuần. Không framework, không bước build,
             không gọi API. Mở là chạy.</p>
        </div>
        <div class="wnd-card">
          <div class="wnd-card__icon">${icon('image')}</div>
          <h3>Tranh sinh tại chỗ</h3>
          <p>Mọi bìa truyện và tranh minh hoạ là SVG được sinh từ màu thể loại, nên sắc nét ở mọi
             cỡ và tự đổi theo giao diện sáng/tối.</p>
        </div>
        <div class="wnd-card">
          <div class="wnd-card__icon">${icon('shieldCheck')}</div>
          <h3>Dữ liệu là hư cấu</h3>
          <p>Truyện, tên người, số liệu báo cáo đều viết mới cho bản demo. Không có dữ liệu thật
             của bất kỳ trẻ em hay phụ huynh nào.</p>
        </div>
      </div>
    </section>
  </div>`;
}

/* --------------------------------------------------------------------- ba vai */

const ROLES = [
  {
    id: 'nguoi-xem', label: 'Người xem — trẻ đọc truyện', icon: 'bookOpen',
    blurb: 'Đọc một truyện phân nhánh từ đầu tới cuối, thấy sổ chiến lược đầy dần, và dừng lại ở một màn kết không phán xét.',
    cta: 'Chơi thử',
    screenId: 'child-player',
    steps: [
      'Chọn một cách xử lý — mỗi lựa chọn dẫn sang một trang khác nhau, không có lựa chọn nào bị chấm sai.',
      'Khi con khám phá một cách mới, một chip ngắn hiện lên rồi tự ẩn. Không có “+5 điểm”.',
      'Bấm nút loa để nghe kể (trình duyệt có giọng tiếng Việt thì đọc thật).',
      'Thử “Con có cách khác không?” — đề xuất được gửi mà không chặn luồng chơi.',
      'Đi tới màn kết: điều đã xảy ra · một cách khác · câu hỏi suy ngẫm · cách con đã dùng · thẻ trò chuyện cùng bố mẹ.',
    ],
  },
  {
    id: 'nguoi-sang-tac', label: 'Người sáng tạo — trẻ viết truyện', icon: 'wand',
    blurb: 'Bắt đầu từ một mẫu theo chiến lược, soạn từng trang trên canvas 9:16, xem cây nhánh mọc dần, rồi gửi duyệt.',
    cta: 'Soạn thử',
    screenId: 'ugc-scene-edit',
    steps: [
      'Gõ nội dung cho trang truyện — chữ vào thẳng, không mất con trỏ khi tự lưu.',
      'Thêm lựa chọn (tối đa 3) và trỏ mỗi lựa chọn tới một trang khác hoặc một đoạn kết.',
      'Mở “Nhánh & trang kết” để xem chỗ nào còn dở — nhánh chưa xong là bình thường khi đang nháp.',
      'Sang “Tổng kết & gửi”: checklist bật đủ tám điều kiện thì nút Gửi duyệt mới sáng.',
      'Gửi xong, truyện của bạn nằm trong hàng đợi ở vai Người quản trị.',
    ],
  },
  {
    id: 'nguoi-quan-tri', label: 'Người quản trị — biên tập duyệt', icon: 'shieldCheck',
    blurb: 'Mở hàng đợi, đọc truyện, trao đổi hai chiều với tác giả, rồi chuyển trạng thái theo đúng vòng đời thật.',
    cta: 'Duyệt thử',
    screenId: 'admin-ugc-workspace',
    steps: [
      'Chọn một bản trong hàng đợi bên trái và đọc graph ở giữa.',
      'Nhắn cho tác giả trong thread bên phải — tin của bạn hiện ngay ở phía tác giả.',
      'Bấm “Yêu cầu chỉnh sửa” và xem trạng thái đổi theo đúng vòng đời, không có đường tắt.',
      'Bấm “Chấp nhận & xuất bản” cho một bản đã ổn.',
      'Quay về thư viện của trẻ — truyện vừa duyệt đã có mặt ở đó.',
    ],
  },
];

export function rolesPage() {
  return html`<div class="wnd-doc">
    <section class="wnd-hero">
      <span class="wnd-eyebrow">${icon('users')}Ba luồng bấm được thật</span>
      <h1 class="wnd-h1">Một vòng lặp nội dung, ba chỗ đứng</h1>
      <p class="wnd-lede">Ba vai dưới đây không phải ba màn hình tĩnh. Chúng dùng chung một kho dữ
        liệu trong trình duyệt của bạn: việc bạn làm ở vai này, vai kia nhìn thấy. Đi hết cả ba là
        đi hết vòng đời của một truyện, từ lúc chưa có chữ nào tới lúc nằm trong thư viện.</p>
    </section>

    <div class="wnd-roles">
      ${ROLES.map((r, i) => html`<a class="wnd-role" href="#/ba-vai/${r.id}">
        <span class="wnd-role__num">Vai ${i + 1}</span>
        <h3>${r.label}</h3>
        <p>${r.blurb}</p>
        <ol class="wnd-role__steps">${r.steps.slice(0, 3).map((s) => html`<li>${icon('check')}<span>${s}</span></li>`)}</ol>
        <span class="wnd-role__cta">${r.cta}${icon('arrowRight')}</span>
      </a>`)}
    </div>

    <div class="wnd-flowbar">
      ${icon('gitBranch')}
      <span><b>Đường đi của một truyện:</b> nháp → gửi → đang duyệt → cần chỉnh sửa ⇄ đang duyệt →
      chấp nhận → xuất bản. Có cả nhánh không duyệt và nhánh gỡ bài. Demo đi đúng đường này,
      không có nút nào nhảy tắt.</span>
    </div>
  </div>`;
}

export function roleFlowPage(roleId) {
  const i = ROLES.findIndex((r) => r.id === roleId);
  if (i === -1) return null;
  const r = ROLES[i];
  const next = ROLES[(i + 1) % ROLES.length];
  return {
    title: r.label,
    desc: r.blurb,
    screenId: r.screenId,
    steps: r.steps,
    nextRole: next.id === r.id ? null : { id: next.id, label: 'Vai tiếp theo' },
  };
}

/* ------------------------------------------------------------ tự kiểm tra */

export function selfCheckPage(screens) {
  const rows = [];
  let failed = 0;
  screens.forEach((s) => {
    let status = 'ok';
    let detail = '';
    try {
      const ctx = { screen: s, local: s.init({ state: {}, viewport: 'd' }) || {},
        view: s.states[0].id, viewport: 'd', rerender() {}, go() {}, toast() {} };
      const out = String(s.render(ctx));
      if (!out || out.length < 40) { status = 'thin'; detail = `chỉ ${out.length} ký tự`; }
      s.states.forEach((st) => {
        ctx.view = st.id;
        String(s.render(ctx));
      });
    } catch (err) {
      status = 'error';
      detail = err && err.message ? err.message : String(err);
      failed += 1;
    }
    rows.push({ s, status, detail });
  });

  const byPlane = PLANES.map((p) => ({
    plane: p,
    total: rows.filter((r) => r.s.plane === p.id).length,
    bad: rows.filter((r) => r.s.plane === p.id && r.status === 'error').length,
  }));

  return html`<div class="wnd-doc wnd-doc--narrow">
    <section class="wnd-hero">
      <span class="wnd-eyebrow">${icon('checkCircle')}Tự kiểm tra</span>
      <h1 class="wnd-h1">${screens.length} màn · ${failed} lỗi</h1>
      <p class="wnd-lede">Trang này gọi hàm dựng của từng màn, ở từng trạng thái, và bắt mọi
        ngoại lệ. Nếu con số lỗi khác 0 thì có màn đang hỏng.</p>
    </section>

    <section class="wnd-section">
      <div class="wnd-tablewrap"><table class="wnd-table">
        <thead><tr><th>Mặt phẳng</th><th>Số màn</th><th>Kết quả</th></tr></thead>
        <tbody>${byPlane.map((b) => html`<tr>
          <td>${b.plane.name}</td><td>${b.total}</td>
          <td>${b.bad === 0
            ? html`<span class="wnd-pass">${icon('check')}Đạt</span>`
            : html`<span class="wnd-fail">${icon('x')}${b.bad} lỗi</span>`}</td>
        </tr>`)}</tbody>
      </table></div>
    </section>

    ${rows.some((r) => r.status !== 'ok') ? html`<section class="wnd-section">
      <h2 class="wnd-h2">Chi tiết</h2>
      ${rows.filter((r) => r.status !== 'ok').map((r) => html`<div class="wnd-check__row">
        <span>${r.s.name} <code>${r.s.sid}</code></span>
        <span class="${r.status === 'error' ? 'wnd-fail' : 'wnd-pass'}">${r.detail}</span>
      </div>`)}
    </section>` : ''}
  </div>`;
}
