/**
 * Mặt phẳng công khai — trang marketing. Người đọc ở đây là người lớn, nên mật độ là `parent`
 * (chạm 44, chữ 15). Không màn nào trong nhóm này chạm tới nội dung truyện thật.
 */

import { html, icon, raw, art, cover } from 'wnd/ui.js';
import { marketingShell, heroSection, wordmark } from 'wnd/screens/_kit.js';
import { allStories } from 'wnd/data/catalog.js';
import { STRATEGIES } from 'wnd/data/strategies.js';

const stories = allStories();
const hero = stories[2];

function phoneMock(story, caption) {
  return html`<div style="max-width:300px;margin-inline:auto;position:relative">
    <div style="border-radius:32px;padding:10px;background:var(--wn-surface);
      box-shadow:var(--wn-shadow-raised);border:1px solid var(--wn-border)">
      <div class="wn-cover wn-cover--916" style="border-radius:24px">
        ${art({ seed: story.code, motif: story.art.motif, time: story.art.time, alt: `Minh hoạ truyện ${story.title}` })}
        <div style="position:absolute;inset:auto 0 0 0;padding:16px;
          background:linear-gradient(to top, rgba(9,14,20,.9), rgba(9,14,20,.1))">
          <div class="wn-progress" style="margin-bottom:12px">
            ${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => html`<span class="${i < 4 ? 'is-done' : i === 4 ? 'is-now' : ''}"></span>`)}
          </div>
          <p style="color:#fff;font-size:15px;line-height:1.45;margin-bottom:12px">${caption}</p>
          <div class="wn-stack-2">
            <span style="display:block;background:rgba(255,255,255,.94);color:#0F172A;border-radius:14px;
              padding:11px 14px;font-size:14px;font-weight:600">Lùi lại một bước</span>
            <span style="display:block;background:rgba(255,255,255,.16);color:#fff;border-radius:14px;
              padding:11px 14px;font-size:14px;font-weight:600;border:1px solid rgba(255,255,255,.4)">Đi tìm bác bảo vệ</span>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

const HOW = [
  { icon: 'bookOpen', title: 'Một tình huống có thật',
    body: 'Bạn thân làm vỡ đồ chơi. Người lạ ở cổng trường. Không phải bài học, là một buổi chiều bình thường.' },
  { icon: 'gitBranch', title: 'Trẻ tự chọn',
    body: 'Hai tới ba cách xử lý, không cách nào bị dán nhãn đúng hay sai.' },
  { icon: 'target', title: 'Hậu quả hiện ra',
    body: 'Câu chuyện đi tiếp theo hướng trẻ vừa chọn. Chọn khác thì thấy khác.' },
  { icon: 'lightbulb', title: 'Rồi trẻ nhận ra',
    body: 'Màn kết kể lại điều đã xảy ra, gợi một cách khác, và mở một câu hỏi để hai bố mẹ con cùng nói.' },
];

export const landingScreens = [
  {
    id: 'landing-home', plane: 'marketing', density: 'parent', icon: 'home',
    sid: 'LANDING-HOME', name: 'Trang chủ',
    desc: 'Điểm chạm đầu tiên: nói được sản phẩm là gì trong một câu, rồi mở đường vào bản đọc thử.',
    render() {
      return marketingShell('landing-home', html`
        ${heroSection({
          eyebrow: 'Cho trẻ 6–10 tuổi',
          title: 'Học kỹ năng sống bằng cách tự quyết định',
          lede: 'Mỗi truyện là một tình huống có thật. Con chọn cách xử lý, rồi thấy điều gì đến sau đó. Không chấm điểm, không xếp hạng — con mang về cách xử lý mà con tự tìm ra.',
          actions: html`
            <span class="wn-btn wn-btn--primary">${icon('play')}Đọc thử ngay trên web</span>
            <span class="wn-btn wn-btn--outline">${icon('download')}Tải ứng dụng</span>`,
          foot: 'Không cần tài khoản để đọc thử. Đăng ký chỉ khi muốn lưu hành trình của con.',
          media: phoneMock(hero, 'Tan học. Mẹ chưa tới. Một chú đứng ngoài cổng gọi đúng tên con.'),
        })}

        <section class="wn-pad-lg">
          <div class="wn-contentmax">
            <div class="wn-sectionhead"><h2>Cách hoạt động</h2></div>
            <div class="wn-cols-4">
              ${HOW.map((h, i) => html`<div class="wn-card wn-stack-2">
                <span class="wn-badge wn-badge--info">Bước ${i + 1}</span>
                <div style="color:var(--wn-accent)">${icon(h.icon)}</div>
                <b class="wn-label">${h.title}</b>
                <p class="wn-caption">${h.body}</p>
              </div>`)}
            </div>
          </div>
        </section>

        <section class="wn-pad-lg" style="background:var(--wn-surface);border-block:1px solid var(--wn-border)">
          <div class="wn-contentmax wn-two-col" style="align-items:center">
            <div class="wn-stack">
              <span class="wn-badge wn-badge--success">${icon('checkCircle')}Không có điểm số</span>
              <h2 class="wn-headline">Con không nhận điểm. Con khám phá ra cách xử lý.</h2>
              <p class="wn-reader wn-dim">Mỗi lựa chọn có thể gắn một chiến lược. Khi con chọn, chiến lược
                đó vào sổ của con. Sổ chỉ cộng dồn — không có tổng, không có thứ hạng, không có gì để
                so với bạn khác.</p>
            </div>
            <div class="wn-cols-2">
              ${STRATEGIES.map((s) => html`<div class="wn-card wn-stack-2" style="padding:var(--wn-space-4)">
                <span style="width:34px;height:34px;border-radius:999px;display:grid;place-items:center;
                  background:color-mix(in srgb, var(--wn-brand) 18%, transparent);color:var(--wn-accent)">${icon(s.icon)}</span>
                <b class="wn-label">${s.name}</b>
                <span class="wn-micro">${s.description}</span>
              </div>`)}
            </div>
          </div>
        </section>

        <section class="wn-pad-lg">
          <div class="wn-contentmax">
            <div class="wn-sectionhead"><h2>Có gì trong thư viện</h2>
              <span class="wn-spacer"></span><span class="wn-caption">${stories.length} truyện</span></div>
            <div class="wn-grid">
              ${stories.slice(0, 8).map((s) => html`<div class="wn-stack-2">
                ${cover(s, { ratio: '34' })}
                <b class="wn-label">${s.title}</b>
                <span class="wn-micro">${s.categoryName} · ${s.estimatedMinutes} phút</span>
              </div>`)}
            </div>
          </div>
        </section>

        <section class="wn-pad-lg" style="background:var(--wn-surface);border-top:1px solid var(--wn-border)">
          <div class="wn-contentmax wn-cols-3">
            <div class="wn-card wn-stack-2">
              <div style="color:var(--wn-accent)">${icon('volume')}</div>
              <b class="wn-label">Nghe được, không cần biết đọc</b>
              <p class="wn-caption">Mỗi trang có giọng kể. Bé chưa đọc thạo vẫn tự chơi được một mình.</p>
            </div>
            <div class="wn-card wn-stack-2">
              <div style="color:var(--wn-accent)">${icon('wand')}</div>
              <b class="wn-label">Con cũng viết được truyện</b>
              <p class="wn-caption">Có trình soạn dành riêng cho trẻ. Truyện được người lớn duyệt trước khi ai đó đọc.</p>
            </div>
            <div class="wn-card wn-stack-2">
              <div style="color:var(--wn-accent)">${icon('shieldCheck')}</div>
              <b class="wn-label">Phụ huynh giữ tay lái</b>
              <p class="wn-caption">Đặt trần nội dung theo từng hồ sơ trẻ, xem con đã gặp những tình huống nào.</p>
            </div>
          </div>
        </section>
      `);
    },
  },

  {
    id: 'landing-parents', plane: 'marketing', density: 'parent', icon: 'users',
    sid: 'LANDING-PARENTS', name: 'Dành cho phụ huynh',
    desc: 'Trang thuyết phục người trả tiền: an toàn dữ liệu, quyền kiểm soát, và cách đồng hành cùng con.',
    render() {
      return marketingShell('landing-parents', html`
        ${heroSection({
          eyebrow: 'Dành cho phụ huynh',
          title: 'Bố mẹ không phải đứng ngoài',
          lede: 'Mỗi truyện kết thúc bằng một thẻ trò chuyện — một câu để hỏi con tối nay. Cổng phụ huynh cho biết con đã gặp những tình huống gì, mà không biến con thành một bảng số liệu.',
          actions: html`<span class="wn-btn wn-btn--primary">Mở cổng phụ huynh</span>
            <span class="wn-btn wn-btn--outline">Xem chính sách dữ liệu trẻ em</span>`,
          media: html`<div class="wn-card wn-stack-3">
            <span class="wn-badge wn-badge--info">${icon('message')}Thẻ trò chuyện cùng bố mẹ</span>
            <p class="wn-reader">“Hỏi con: <i>Hôm nào con làm hỏng một thứ gì của bố mẹ, con muốn bố mẹ
              phản ứng thế nào?</i>”</p>
            <hr class="wn-divider">
            <span class="wn-caption">Xuất hiện ở cuối truyện <b>Cái bình vỡ</b> — hôm nay con vừa đọc.</span>
          </div>`,
        })}

        <section class="wn-pad-lg">
          <div class="wn-contentmax wn-stack-6">
            <div class="wn-sectionhead"><h2>Bố mẹ kiểm soát được những gì</h2></div>
            <div class="wn-cols-3">
              ${[
                ['shield', 'Trần nội dung theo từng con', 'Đặt mức phân loại tối đa cho mỗi hồ sơ. Truyện vượt mức sẽ không hiện ra, kể cả trong tìm kiếm.'],
                ['users', 'Nhiều hồ sơ, một tài khoản', 'Mỗi con một hồ sơ riêng, tiến trình riêng, sổ chiến lược riêng.'],
                ['lock', 'Tối thiểu hoá dữ liệu trẻ', 'Không thu email của trẻ. Hồ sơ con chỉ có biệt danh và nhóm tuổi.'],
                ['clock', 'Không có cơ chế gây nghiện', 'Không chuỗi ngày, không đếm ngược, không chấm đỏ. Con quay lại vì truyện hay.'],
                ['award', 'Không so con này với con kia', 'Không có bảng xếp hạng công khai trong sản phẩm.'],
                ['message', 'Góp ý được ghi nhận', 'Bố mẹ đề xuất thêm cách xử lý cho một tình huống; đội nội dung đọc và trả lời.'],
              ].map(([ic, t, b]) => html`<div class="wn-card wn-stack-2">
                <div style="color:var(--wn-accent)">${icon(ic)}</div>
                <b class="wn-label">${t}</b><p class="wn-caption">${b}</p></div>`)}
            </div>
          </div>
        </section>

        <section class="wn-pad-lg" style="background:var(--wn-surface);border-top:1px solid var(--wn-border)">
          <div class="wn-contentmax wn-stack">
            <h2 class="wn-headline">Ba câu hỏi bố mẹ hay hỏi nhất</h2>
            <div class="wn-stack-3">
              ${[
                ['Con đọc một mình có được không?', 'Được. Mọi truyện đều có giọng kể, và không truyện nào có nút dẫn ra ngoài ứng dụng. Nhưng phần hay nhất là câu hỏi cuối truyện — cái đó cần bố mẹ.'],
                ['Có quảng cáo không?', 'Không có quảng cáo trong luồng đọc của trẻ.'],
                ['Truyện do trẻ viết thì kiểm soát thế nào?', 'Mọi truyện của người dùng đều phải qua biên tập trước khi xuất hiện trong thư viện chung. Tác giả và biên tập trao đổi hai chiều cho tới khi bản truyện đủ ổn.'],
              ].map(([q, a]) => html`<div class="wn-card wn-stack-2">
                <b class="wn-label">${q}</b><p class="wn-caption">${a}</p></div>`)}
            </div>
          </div>
        </section>
      `);
    },
  },

  {
    id: 'landing-compose', plane: 'marketing', density: 'parent', icon: 'wand',
    sid: 'LANDING-COMPOSE', name: 'Giới thiệu sáng tác',
    desc: 'Cửa vào việc sáng tác: giải thích luật viết truyện và quy trình duyệt trước khi trẻ bắt đầu.',
    render() {
      return marketingShell('landing-compose', html`
        ${heroSection({
          eyebrow: 'Sáng tác',
          title: 'Con cũng viết được một truyện có nhánh',
          lede: 'Bắt đầu từ một mẫu, viết từng trang, nối các lựa chọn lại thành cây. Khi thấy ổn thì gửi cho đội duyệt — và đội duyệt sẽ nhắn lại cho con.',
          actions: html`<span class="wn-btn wn-btn--primary">${icon('wand')}Viết trên web</span>
            <span class="wn-btn wn-btn--outline">${icon('smartphone')}Viết trong ứng dụng</span>`,
          media: html`<div class="wn-card wn-stack-3">
            <b class="wn-label">Luật viết truyện</b>
            <ul class="wn-stack-2">
              ${['5 đến 30 trang', 'Mỗi trang 1–3 dòng chữ', '2 đến 3 lựa chọn ở mỗi điểm rẽ',
                 'Mỗi lựa chọn phải dẫn đi đâu đó', 'Ảnh dọc 9:16, dưới 1 MB'].map((r) => html`
                <li class="wn-row" style="gap:8px"><span style="color:var(--wn-success)">${icon('check')}</span>
                  <span class="wn-caption">${r}</span></li>`)}
            </ul>
          </div>`,
        })}
        <section class="wn-pad-lg">
          <div class="wn-contentmax">
            <div class="wn-sectionhead"><h2>Truyện của con đi qua những đâu</h2></div>
            <div class="wn-cols-4">
              ${[['edit', 'Nháp', 'Con viết. Nhánh dở dang là chuyện bình thường, vẫn lưu được.'],
                 ['send', 'Gửi duyệt', 'Chỉ mở khi truyện đủ 5 trang và mọi lựa chọn đều có đích.'],
                 ['message', 'Trao đổi', 'Đội duyệt nhắn cho con chỗ nào cần rõ hơn. Con sửa rồi gửi lại.'],
                 ['bookOpen', 'Xuất bản', 'Truyện vào thư viện chung, có tên con là tác giả.'],
              ].map(([ic, t, b], i) => html`<div class="wn-card wn-stack-2">
                <span class="wn-badge wn-badge--neutral">${i + 1}</span>
                <div style="color:var(--wn-accent)">${icon(ic)}</div>
                <b class="wn-label">${t}</b><p class="wn-caption">${b}</p></div>`)}
            </div>
          </div>
        </section>
      `);
    },
  },

  {
    id: 'landing-download', plane: 'marketing', density: 'parent', icon: 'download',
    sid: 'LANDING-DOWNLOAD', name: 'Tải ứng dụng',
    desc: 'Ba đường vào sản phẩm: hai cửa hàng ứng dụng và bản chạy thẳng trên trình duyệt.',
    render() {
      return marketingShell('landing-download', html`
        <section class="wn-pad-lg" style="padding-block:var(--wn-space-12)">
          <div class="wn-contentmax wn-stack-6" style="text-align:center;justify-items:center">
            ${wordmark(44)}
            <h1 class="wn-display">Bắt đầu ở đâu cũng được</h1>
            <p class="wn-reader wn-dim" style="max-width:56ch">Cùng một tài khoản, cùng một tiến trình.
              Con đọc dở trên điện thoại thì mở web đọc tiếp đúng chỗ đó.</p>
            <div class="wn-cols-3" style="width:100%;max-width:820px;text-align:left">
              ${[['smartphone', 'App Store', 'Cho iPhone và iPad', 'Sắp có'],
                 ['smartphone', 'Google Play', 'Cho điện thoại Android', 'Sắp có'],
                 ['monitor', 'Trình duyệt', 'Không cần cài gì', 'Dùng được ngay'],
              ].map(([ic, t, b, tag]) => html`<div class="wn-card wn-stack-3">
                <div style="color:var(--wn-accent)">${icon(ic)}</div>
                <b class="wn-title">${t}</b>
                <span class="wn-caption">${b}</span>
                <span class="wn-badge ${tag === 'Sắp có' ? 'wn-badge--neutral' : 'wn-badge--success'}"
                  >${tag === 'Sắp có' ? icon('clock') : icon('check')}${tag}</span>
              </div>`)}
            </div>
            <div class="wn-card wn-row" style="max-width:520px;text-align:left;gap:var(--wn-space-5)">
              <div style="width:104px;height:104px;flex:none;border-radius:var(--wn-radius-md);
                background:repeating-conic-gradient(var(--wn-text) 0 25%, transparent 0 50%) 0 0/16px 16px;
                border:6px solid var(--wn-surface);outline:1px solid var(--wn-border)"></div>
              <div class="wn-stack-1">
                <b class="wn-label">Quét để mở trên điện thoại</b>
                <span class="wn-caption">Mã sẽ đưa bạn tới đúng cửa hàng của thiết bị.</span>
              </div>
            </div>
          </div>
        </section>
      `);
    },
  },

  {
    id: 'landing-privacy', plane: 'marketing', density: 'parent', icon: 'lock',
    sid: 'LANDING-PRIVACY', name: 'Quyền riêng tư',
    desc: 'Bản văn công khai về dữ liệu trẻ em — cùng nội dung dùng để đối chiếu hồ sơ hai cửa hàng ứng dụng.',
    render() { return marketingShell('landing-privacy', legalPage('Chính sách quyền riêng tư', PRIVACY)); },
  },

  {
    id: 'landing-terms', plane: 'marketing', density: 'parent', icon: 'fileText',
    sid: 'LANDING-TERMS', name: 'Điều khoản',
    desc: 'Điều khoản sử dụng, cùng bố cục một cột với mục lục neo bên phải trên khổ rộng.',
    render() { return marketingShell('landing-terms', legalPage('Điều khoản sử dụng', TERMS)); },
  },
];

const PRIVACY = [
  ['Phạm vi', 'Chính sách mô tả cách thu thập, sử dụng, lưu trữ và bảo vệ thông tin khi dùng website, cổng phụ huynh và ứng dụng di động.'],
  ['Dữ liệu có thể thu thập', 'Tài khoản phụ huynh (email, mật khẩu đã băm). Hồ sơ trẻ (biệt danh, nhóm tuổi hoặc năm sinh — tối thiểu hoá). Hoạt động trong ứng dụng (tiến trình đọc, lựa chọn đã chọn, thời điểm). Đề xuất nội dung. Định danh thiết bị cho chế độ khách. Nhật ký kỹ thuật phục vụ bảo mật và vận hành.'],
  ['Mục đích', 'Cung cấp dịch vụ, bảo mật, hỗ trợ người dùng, tuân thủ pháp luật. Không dùng dữ liệu trẻ em cho quảng cáo nhắm mục tiêu.'],
  ['Chia sẻ', 'Không bán dữ liệu trẻ em. Chỉ chia sẻ với nhà cung cấp hạ tầng theo hợp đồng, hoặc với cơ quan có thẩm quyền khi luật bắt buộc.'],
  ['Trẻ em và phụ huynh', 'Tài khoản do người lớn quản lý. Không thu email của trẻ để đăng nhập. Phụ huynh có thể yêu cầu truy cập, sửa hoặc xoá dữ liệu của con.'],
  ['Lưu trữ và bảo mật', 'Kết nối mã hoá, kiểm soát truy cập, tối thiểu hoá dữ liệu. Giữ trong thời gian tài khoản hoạt động và theo nghĩa vụ pháp lý.'],
  ['Quyền của người dùng', 'Truy cập, sửa, xoá, hạn chế, phản đối và khiếu nại theo luật địa phương.'],
  ['Thay đổi chính sách', 'Ngày cập nhật hiển thị trên trang; thay đổi lớn sẽ được thông báo thêm trong ứng dụng.'],
];

const TERMS = [
  ['Chấp nhận điều khoản', 'Khi tạo tài khoản hoặc dùng dịch vụ, người dùng đồng ý với các điều khoản này.'],
  ['Tài khoản', 'Tài khoản do người lớn tạo và chịu trách nhiệm. Hồ sơ trẻ nằm dưới tài khoản của người lớn đó.'],
  ['Nội dung do người dùng tạo', 'Tác giả giữ quyền với nội dung mình viết và cấp cho nền tảng quyền hiển thị trong dịch vụ. Mọi nội dung phải qua kiểm duyệt trước khi công khai.'],
  ['Hành vi bị cấm', 'Nội dung bạo lực, thù ghét, quấy rối, lộ thông tin cá nhân của trẻ; can thiệp kỹ thuật vào dịch vụ; mạo danh.'],
  ['Kiểm duyệt', 'Nền tảng có thể yêu cầu chỉnh sửa, từ chối hoặc gỡ nội dung. Lý do gửi cho tác giả bằng ngôn ngữ trung tính.'],
  ['Giới hạn trách nhiệm', 'Dịch vụ cung cấp nội dung giáo dục, không thay thế tư vấn chuyên môn về tâm lý hay y tế.'],
  ['Chấm dứt', 'Người dùng có thể xoá tài khoản bất cứ lúc nào. Nền tảng có thể tạm ngừng tài khoản vi phạm.'],
  ['Liên hệ', 'Mọi câu hỏi về điều khoản xin gửi qua kênh hỗ trợ trong ứng dụng.'],
];

function legalPage(title, sections) {
  return html`<section class="wn-pad-lg">
    <div class="wn-contentmax" style="display:grid;gap:var(--wn-space-8)">
      <div class="wn-stack-2">
        <span class="wn-badge wn-badge--neutral">${icon('fileText')}Bản 1.0 · cập nhật 28/08/2026</span>
        <h1 class="wn-display">${title}</h1>
        <p class="wn-caption">Bản văn minh hoạ cho demo. Bản chính thức sẽ do bộ phận pháp chế rà soát
          trước khi phát hành.</p>
      </div>
      <div style="display:grid;gap:var(--wn-space-6);grid-template-columns:minmax(0,1fr)">
        <div class="wn-prose">
          ${sections.map(([h, b], i) => html`<div style="margin-bottom:var(--wn-space-6)">
            <h3 style="font-size:var(--wn-text-title);font-weight:600;margin-bottom:6px">${i + 1}. ${h}</h3>
            <p class="wn-compact wn-dim">${b}</p>
          </div>`)}
        </div>
      </div>
    </div>
  </section>`;
}
