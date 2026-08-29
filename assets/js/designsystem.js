/**
 * Trang Hệ thiết kế.
 *
 * Phần tương phản KHÔNG phải bảng chép tay: nó tính lại tỉ lệ WCAG ngay trên trình duyệt từ
 * chính các giá trị token, nên nếu ai đó đổi một màu thì con số ở đây đổi theo và dấu "Đạt"
 * có thể chuyển thành "Trượt". Đúng tinh thần cổng CI của sản phẩm.
 */

import { html, icon, raw } from 'wnd/ui.js';
import {
  BRAND, GENRE, COLOR, SPACE, RADIUS, TEXT, MOTION, DENSITY, BREAKPOINT,
  CONTRAST_PAIRS, contrastRatio, resolveToken,
} from 'wnd/tokens.js';

const SEMANTIC_ROWS = [
  ['bg', 'Nền trang'],
  ['surface', 'Mặt phẳng nội dung'],
  ['surfaceRaised', 'Mặt phẳng nổi — chỉ cho sheet và hộp thoại'],
  ['text', 'Chữ chính'],
  ['textSecondary', 'Chữ phụ'],
  ['muted', 'Chữ mờ'],
  ['border', 'Chỉ làm đường kẻ — không bao giờ làm viền control'],
  ['borderStrong', 'Viền input, viền lựa chọn, vòng focus'],
  ['accent', 'Màu hành động'],
  ['onAccent', 'Chữ trên nút chính'],
  ['brand', 'Logo và khoảnh khắc thương hiệu'],
  ['success', 'Thành công'],
  ['warning', 'Cảnh báo'],
  ['danger', 'Nguy hiểm'],
];

const RULES = [
  { n: 'R1', title: 'Ba mật độ, một ngôn ngữ',
    body: 'Trẻ chạm 48dp và đọc chữ ≥17px. Tác giả và phụ huynh 44px, chữ 15px. Mật độ là một tham số, không phải bộ token thứ hai.',
    forbid: 'Một mật độ duy nhất khiến màn trẻ em trông như form quản trị.' },
  { n: 'R2', title: 'Một hành động chính mỗi vùng',
    body: 'Còn lại là hành động phụ hoặc icon.', forbid: 'Một thanh bốn nút ngang hàng nhau.',
    demo: 'r2' },
  { n: 'R3', title: 'Nội dung là chrome',
    body: 'Lồng tối đa hai cấp: trang rồi tới thẻ.', forbid: 'Thẻ trong thẻ trong panel.' },
  { n: 'R4', title: 'Ba mặt phẳng, không thang elevation',
    body: 'Nền · mặt phẳng · mặt phẳng nổi. Đổ bóng là một token, không phải sáu mức.',
    forbid: 'Thang elevation sáu mức kiểu Material.' },
  { n: 'R5', title: 'Mẫu số tiến trình không bao giờ đổi',
    body: 'Trẻ nhìn thanh vạch là biết còn bao xa, và con số không nhảy giữa chừng.',
    forbid: '“Bước 7 / 33” — rồi lát sau thành 7 / 41.', demo: 'r5' },
  { n: 'R6', title: 'Không lộ định danh máy ra giao diện',
    body: 'Người dùng thấy “Thiếu nhi (6–10)”, không thấy mã nhóm tuổi. Thấy tên chiến lược, không thấy mã.',
    forbid: 'Mã trang, mã nhóm tuổi, đường dẫn lưu trữ, thông báo lỗi kỹ thuật.', demo: 'r6' },
  { n: 'R7', title: 'Màu không bao giờ là tín hiệu duy nhất',
    body: 'Mọi trạng thái đều có icon, chữ và màu cùng lúc.', forbid: 'Một banner chỉ đổi màu để báo lỗi.',
    demo: 'r7' },
  { n: 'R8', title: 'Chuyển động phải mang thông tin',
    body: 'Chỉ ba việc: đổi trạng thái, nối tiếp không gian, khoá thao tác. Luôn tôn trọng thiết lập giảm chuyển động.',
    forbid: 'Hiệu ứng trang trí, parallax.' },
  { n: 'R9', title: 'Không tạo cảm giác cấp bách giả trên màn trẻ em',
    body: 'Trẻ quay lại vì truyện hay, không vì sợ mất chuỗi ngày.',
    forbid: 'Chuỗi ngày, đồng hồ đếm ngược, chấm đỏ, thưởng đăng nhập.', demo: 'r9' },
  { n: 'R10', title: 'Ăn mừng phải xứng đáng',
    body: 'Pháo giấy chỉ rơi ở đoạn kết thật sự tích cực.',
    forbid: 'Pháo giấy cho mọi đoạn kết — như thế thì kết nào cũng thành phần thưởng.' },
  { n: 'R11', title: 'Không phán xét, không dạy đời',
    body: 'Màn kết nói “Điều đã xảy ra” và “Một cách khác có thể là…”.',
    forbid: '“Sai rồi”, “Con thua rồi”.', demo: 'r11' },
  { n: 'R12', title: 'Gõ chữ là thiêng liêng',
    body: 'Không lần vẽ lại nào được phép cướp con trỏ hay xoá chữ đang gõ dở.',
    forbid: 'Tự lưu xong thì dựng lại cả ô nhập.' },
  { n: 'R13', title: 'Một kiểu loading mỗi bề mặt',
    body: 'Khung xám theo đúng hình dạng nội dung sắp tới. Vòng xoay chỉ dành cho thao tác khoá màn.',
    forbid: 'Một vòng xoay trơ trọi giữa màn.', demo: 'r13' },
  { n: 'R14', title: 'Đổi giao diện là ba nút icon',
    body: 'Sáng · Tối · Theo hệ thống, luôn nhìn thấy cả ba.',
    forbid: 'Một ô chọn xổ xuống hoặc một dãy chữ.', demo: 'r14' },
  { n: 'R15', title: 'Phá huỷ phải hoàn tác được',
    body: 'Ưu tiên hoàn tác (không thêm thao tác nào) hơn hỏi lại (thêm một thao tác).',
    forbid: 'Nút xoá sạch dữ liệu, không hỏi, không hoàn tác.', demo: 'r15' },
  { n: 'R16', title: 'Độ sâu modal tối đa một cấp',
    body: 'Một sheet không được mở ra một sheet khác.',
    forbid: 'Hộp thoại cắt ảnh mở từ sheet mở từ trang.' },
];

function swatch(hex, name, note) {
  return html`<div class="wnd-swatch">
    <div class="wnd-swatch__chip" style="background:${hex}"></div>
    <div class="wnd-swatch__meta"><b>${name}</b><code>${hex}</code>${note ? html`<span class="wn-micro">${note}</span>` : ''}</div>
  </div>`;
}

function ruleDemo(kind) {
  const pairs = {
    r2: [
      html`<div class="wn-row"><button class="wn-btn wn-btn--primary wn-btn--sm">Bắt đầu</button>
        <button class="wn-btn wn-btn--ghost wn-btn--sm">Để sau</button></div>`,
      html`<div class="wn-row wn-row--wrap">
        <button class="wn-btn wn-btn--primary wn-btn--sm">Lưu</button>
        <button class="wn-btn wn-btn--primary wn-btn--sm">Gửi</button>
        <button class="wn-btn wn-btn--primary wn-btn--sm">Xem</button>
        <button class="wn-btn wn-btn--primary wn-btn--sm">Xoá</button></div>`,
    ],
    r5: [
      html`<div class="wn-progress" style="max-width:200px">
        ${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => html`<span class="${i < 4 ? 'is-done' : i === 4 ? 'is-now' : ''}"></span>`)}
      </div><span class="wn-micro">Tám vạch, luôn là tám</span>`,
      html`<span class="wn-label">Bước 7 / 33</span>
        <div class="wn-micro" style="color:var(--wn-danger)">…lát sau thành 7 / 41</div>`,
    ],
    r6: [
      html`<span class="wn-chip wn-chip--static">Thiếu nhi (6–10)</span>
        <span class="wn-chip wn-chip--static" style="margin-left:6px">Nhờ giúp đỡ</span>`,
      html`<span class="wn-chip wn-chip--static">age_6_10</span>
        <span class="wn-chip wn-chip--static" style="margin-left:6px">nho_giup_do</span>`,
    ],
    r7: [
      html`<div class="wn-banner wn-banner--danger">${icon('alertCircle')}<div>Chưa gửi được. Thử lại giúp mình nhé.</div></div>`,
      html`<div style="padding:14px 16px;border-radius:12px;background:color-mix(in srgb, var(--wn-danger) 12%, var(--wn-surface))">
        Chưa gửi được.</div>`,
    ],
    r9: [
      html`<span class="wn-chip wn-chip--static">${icon('bookOpen')}Đọc tiếp “Cái bình vỡ”</span>`,
      html`<span class="wn-chip wn-chip--static" style="border-color:var(--wn-danger);color:var(--wn-danger)">
        ${icon('zap')}Chuỗi 6 ngày — còn 2 giờ!</span>`,
    ],
    r11: [
      html`<b class="wn-label">Điều đã xảy ra</b>
        <p class="wn-caption" style="margin-top:4px">Bà nghe xong thì thở ra và xoa đầu con.</p>`,
      html`<b class="wn-label" style="color:var(--wn-danger)">Sai rồi!</b>
        <p class="wn-caption" style="margin-top:4px">Con đã chọn nhầm.</p>`,
    ],
    r13: [
      html`<div class="wn-stack-2"><div class="wn-skel" style="height:64px"></div>
        <div class="wn-skel" style="height:12px;width:70%"></div></div>`,
      html`<div style="display:grid;place-items:center;height:88px">
        <div style="width:26px;height:26px;border-radius:999px;border:3px solid var(--wn-border);
        border-top-color:var(--wn-accent);animation:wn-spin 1s linear infinite"></div></div>`,
    ],
    r14: [
      html`<div class="wnd-segmented" style="pointer-events:none">
        <button aria-pressed="true">${icon('sun')}</button>
        <button>${icon('moon')}</button><button>${icon('monitor')}</button></div>`,
      html`<select class="wn-input" style="max-width:200px" disabled>
        <option>Giao diện: Sáng</option></select>`,
    ],
    r15: [
      html`<div class="wn-banner wn-banner--info">${icon('info')}<div>Đã xoá trang 4.
        <b style="color:var(--wn-accent);margin-left:6px">Hoàn tác</b></div></div>`,
      html`<button class="wn-btn wn-btn--danger wn-btn--sm">${icon('trash')}Xoá tất cả</button>`,
    ],
  }[kind];
  if (!pairs) return '';
  return html`<div class="wnd-vs">
    <div class="wnd-vs__box wnd-vs__box--ok">
      <span class="wnd-vs__tag">${icon('check')}Làm thế này</span>${pairs[0]}</div>
    <div class="wnd-vs__box wnd-vs__box--no">
      <span class="wnd-vs__tag">${icon('x')}Không làm thế này</span>${pairs[1]}</div>
  </div>`;
}

export function designSystemPage() {
  const results = CONTRAST_PAIRS.map((p) => {
    const fg = resolveToken(p.fg);
    const bg = resolveToken(p.bg);
    const ratio = contrastRatio(fg, bg);
    return { ...p, fg, bg, ratio, pass: ratio >= p.min };
  });
  const passed = results.filter((r) => r.pass).length;

  return html`<div class="wnd-doc">

    <section class="wnd-hero">
      <span class="wnd-eyebrow">${icon('palette')}Hệ thiết kế</span>
      <h1 class="wnd-h1">Một nguồn token, hai biểu hiện, mười sáu luật</h1>
      <p class="wnd-lede">Màu, khoảng cách, chữ và chuyển động đều đến từ một tệp token duy nhất và
        được sinh ra cho cả web lẫn ứng dụng. Không có bảng nào ở đây được gõ tay lần thứ hai —
        kể cả bảng tương phản bên dưới, vốn được tính lại ngay trong trình duyệt bạn đang mở.</p>
    </section>

    <section class="wnd-section">
      <div class="wnd-section__head">
        <h2 class="wnd-h2">Kiểm tra tương phản</h2>
        <p>Hai mươi cặp bắt buộc, ở cả hai giao diện. Chữ thường cần ≥ 4,5:1; viền và vòng focus
          cần ≥ 3:1. Đây là điều kiện để một thay đổi màu được phép đi tiếp.</p>
      </div>
      <div class="wnd-cards" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
        <div class="wnd-card"><div class="wnd-stat"><b>${passed}/${results.length}</b><span>cặp đạt ngưỡng</span></div></div>
        <div class="wnd-card"><div class="wnd-stat"><b>2,89:1</b><span>màu thương hiệu trên nền trắng — vì sao nền sáng phải dùng accent đậm hơn</span></div></div>
        <div class="wnd-card"><div class="wnd-stat"><b>4,74:1</b><span>nút chính ở giao diện sáng</span></div></div>
        <div class="wnd-card"><div class="wnd-stat"><b>5,55:1</b><span>nút chính ở giao diện tối</span></div></div>
      </div>
      <div class="wnd-tablewrap"><table class="wnd-table">
        <thead><tr><th>Cặp</th><th>Chữ</th><th>Nền</th><th>Tỉ lệ</th><th>Ngưỡng</th><th>Kết quả</th></tr></thead>
        <tbody>${results.map((r) => html`<tr>
          <td>${r.name}</td>
          <td><code>${r.fg}</code></td>
          <td><code>${r.bg}</code></td>
          <td><span style="display:inline-flex;align-items:center;gap:8px">
            <span style="width:34px;height:20px;border-radius:5px;display:grid;place-items:center;
              background:${r.bg};color:${r.fg};font-weight:700;font-size:11px">Aa</span>
            <b>${r.ratio.toFixed(2)}:1</b></span></td>
          <td>${r.min.toFixed(1)}:1</td>
          <td>${r.pass ? html`<span class="wnd-pass">${icon('check')}Đạt</span>`
                       : html`<span class="wnd-fail">${icon('x')}Trượt</span>`}</td>
        </tr>`)}</tbody>
      </table></div>
    </section>

    <section class="wnd-section">
      <div class="wnd-section__head">
        <h2 class="wnd-h2">Màu</h2>
        <p>Toàn bộ ramp nằm trên một sắc độ. Màu thương hiệu giữ nguyên cho logo, nhưng màu hành
          động ở nền sáng phải đậm hơn để qua được ngưỡng đọc.</p>
      </div>
      <h3 class="wnd-h3">Ramp thương hiệu</h3>
      <div class="wnd-swatches">${Object.entries(BRAND).map(([k, v]) => swatch(v, k.replace('accent', 'accent-')))}</div>
      <h3 class="wnd-h3">Màu thể loại</h3>
      <div class="wnd-swatches">${Object.entries(GENRE).map(([k, v]) => swatch(v, k))}</div>
      <h3 class="wnd-h3">Màu ngữ nghĩa</h3>
      <div class="wnd-tablewrap"><table class="wnd-table">
        <thead><tr><th>Token</th><th>Giao diện sáng</th><th>Giao diện tối</th><th>Dùng ở đâu</th></tr></thead>
        <tbody>${SEMANTIC_ROWS.map(([key, note]) => html`<tr>
          <td><code>${key}</code></td>
          <td><span style="display:inline-flex;align-items:center;gap:8px">
            <i style="width:18px;height:18px;border-radius:5px;border:1px solid var(--wn-border);
              background:${COLOR.light[key]};display:inline-block"></i><code>${COLOR.light[key]}</code></span></td>
          <td><span style="display:inline-flex;align-items:center;gap:8px">
            <i style="width:18px;height:18px;border-radius:5px;border:1px solid var(--wn-border);
              background:${COLOR.dark[key]};display:inline-block"></i><code>${COLOR.dark[key]}</code></span></td>
          <td>${note}</td>
        </tr>`)}</tbody>
      </table></div>
    </section>

    <section class="wnd-section">
      <div class="wnd-section__head">
        <h2 class="wnd-h2">Chữ — hai vai, một thang</h2>
        <p>Bề mặt của trẻ đọc ở 18px. Bề mặt của tác giả và phụ huynh ở 15px. Không có thang thứ hai.</p>
      </div>
      <div class="wnd-card">
        ${Object.entries(TEXT).map(([name, t]) => html`<div class="wnd-typerow">
          <span class="wnd-typerow__meta">${name} · ${t.size}px / ${t.height} / ${t.weight}</span>
          <span class="wnd-typerow__sample" style="font-size:${t.size}px;line-height:${t.height};font-weight:${t.weight}"
            >Con chọn thế nào, rồi sao nữa?</span>
        </div>`)}
      </div>
      <div class="wnd-tablewrap"><table class="wnd-table">
        <thead><tr><th>Vai</th><th>Dùng ở</th></tr></thead>
        <tbody>${Object.entries(TEXT).map(([name, t]) => html`<tr><td><code>${name}</code></td><td>${t.use}</td></tr>`)}</tbody>
      </table></div>
    </section>

    <section class="wnd-section">
      <div class="wnd-section__head">
        <h2 class="wnd-h2">Khoảng cách, bo góc, chuyển động</h2>
        <p>Thang base 4 kèm nửa bước — chọn để nuốt trọn những con số lẻ vốn đã nằm sẵn trong code
          (6, 10, 18, 22) thay vì bắt cả codebase đi làm tròn.</p>
      </div>
      <div class="wnd-card wn-stack-2">
        ${Object.entries(SPACE).map(([k, v]) => html`<div class="wnd-scaleline">
          <span style="width:52px"><code>${k}</code></span>
          <i style="width:${v}px"></i><span>${v}px</span>
        </div>`)}
      </div>
      <div class="wnd-cards">
        <div class="wnd-card">
          <h3>Bo góc</h3>
          <div class="wn-row wn-row--wrap">${Object.entries(RADIUS).map(([k, v]) => html`
            <span style="display:grid;gap:6px;justify-items:center">
              <i style="width:52px;height:40px;background:color-mix(in srgb, var(--wn-accent) 18%, transparent);
                border-radius:${Math.min(v, 26)}px;display:block"></i>
              <span class="wn-micro">${k} · ${v}</span></span>`)}</div>
        </div>
        <div class="wnd-card">
          <h3>Chuyển động</h3>
          <p><code>fast ${MOTION.fast}ms</code> · <code>base ${MOTION.base}ms</code> ·
             <code>scene ${MOTION.scene}ms</code> · <code>toast ${MOTION.toast}ms</code></p>
          <p><code>${MOTION.easing}</code></p>
          <p>Bốn con số này không phải khẩu vị: 400ms là thời lượng chuyển trang truyện đã chốt
             trong đặc tả, 1200ms là thời lượng chip phản hồi.</p>
        </div>
        <div class="wnd-card">
          <h3>Ba mật độ</h3>
          <div class="wn-stack-2">${Object.entries(DENSITY).map(([k, d]) => html`
            <div class="wn-row"><b class="wn-label" style="width:78px">${d.label}</b>
              <span class="wn-caption">chạm ${d.tapTarget}px · chữ ${TEXT[d.bodyStyle].size}px · lề ${d.gutter}px</span></div>`)}
          </div>
        </div>
        <div class="wnd-card">
          <h3>Điểm gãy</h3>
          <p><code>${BREAKPOINT.webTablet}</code> máy tính bảng · <code>${BREAKPOINT.webDesktop}</code> máy tính ·
             <code>${BREAKPOINT.contentMax}</code> bề rộng nội dung tối đa.</p>
          <p>Trong ứng dụng, máy tính bảng được nhận theo cạnh ngắn ≥ ${BREAKPOINT.appTabletShortestSide}px —
             không theo bề rộng, vì tablet dựng đứng sẽ bị nhầm là điện thoại.</p>
        </div>
      </div>
    </section>

    <section class="wnd-section">
      <div class="wnd-section__head">
        <h2 class="wnd-h2">Mười sáu luật</h2>
        <p>Mỗi luật nêu rõ thứ nó <b>cấm</b>. Một luật không cấm điều gì thì không phải luật —
          nó chỉ là một lời khuyên.</p>
      </div>
      <div class="wnd-card">
        ${RULES.map((r) => html`<div class="wnd-rule">
          <span class="wnd-rule__n">${r.n}</span>
          <div class="wnd-rule__body">
            <b>${r.title}</b>
            <p>${r.body}</p>
            <span class="wnd-rule__forbid">${icon('x')} ${r.forbid}</span>
            ${r.demo ? ruleDemo(r.demo) : ''}
          </div>
        </div>`)}
      </div>
    </section>

    ${raw('<style>@keyframes wn-spin{to{transform:rotate(360deg)}}</style>')}
  </div>`;
}
