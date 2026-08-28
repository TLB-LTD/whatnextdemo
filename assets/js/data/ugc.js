/**
 * Sáng tác của người dùng: mẫu khởi tạo, vòng đời duyệt, và hàng đợi biên tập.
 *
 * Nguyên tắc của mẫu: MẪU VIẾT CẤU TRÚC VÀ GỢI Ý, KHÔNG BAO GIỜ VIẾT HỘ VĂN.
 * Vì thế mọi `text` trong mẫu đều rỗng, chỉ có `hint` — tác giả nhìn thấy gợi ý mờ trong ô
 * nhập, và cái xuất hiện trong truyện là chữ của chính tác giả.
 */

export const UGC_STATUS = {
  draft:          { label: 'Bản nháp',        tone: 'neutral', icon: 'edit' },
  submitted:      { label: 'Đã gửi',          tone: 'info',    icon: 'send' },
  under_review:   { label: 'Đang duyệt',      tone: 'info',    icon: 'eye' },
  needs_revision: { label: 'Cần chỉnh sửa',   tone: 'warning', icon: 'alertTriangle' },
  approved:       { label: 'Đã chấp nhận',    tone: 'success', icon: 'checkCircle' },
  published:      { label: 'Đã xuất bản',     tone: 'success', icon: 'bookOpen' },
  rejected:       { label: 'Không duyệt',     tone: 'danger',  icon: 'x' },
};

/** Vòng đời thật, kể cả nhánh gỡ bài. Không có đường tắt nào khác. */
export const UGC_TRANSITIONS = {
  draft: ['submitted'],
  submitted: ['under_review', 'rejected'],
  under_review: ['needs_revision', 'approved', 'rejected'],
  needs_revision: ['submitted', 'under_review'],
  approved: ['published', 'needs_revision'],
  published: ['needs_revision'],
  rejected: [],
};

/** Điều kiện gửi duyệt — khác hẳn điều kiện lưu nháp. */
export const SUBMIT_RULES = [
  { code: 'min_scenes',  label: 'Có ít nhất 5 trang truyện' },
  { code: 'one_start',   label: 'Có đúng một trang mở đầu' },
  { code: 'text_lines',  label: 'Mỗi trang có 1–3 dòng chữ' },
  { code: 'choice_count', label: 'Trang thường có 2–3 lựa chọn' },
  { code: 'resolved',    label: 'Mọi lựa chọn đều có trang tiếp hoặc đoạn kết' },
  { code: 'reachable',   label: 'Không có trang nào bị bỏ quên' },
  { code: 'has_ending',  label: 'Có ít nhất một đoạn kết đi tới được' },
  { code: 'meta',        label: 'Đã có tên truyện, bìa, thể loại và nhóm tuổi' },
];

export const TEMPLATES = [
  {
    code: 'blank',
    name: 'Bắt đầu trắng',
    strategy: null,
    summary: 'Một trang mở đầu và một đoạn kết. Còn lại con tự dựng.',
    scenes: [
      { code: 's1', isStart: true, hint: 'Chuyện bắt đầu ở đâu, có ai?', choices: [
        { hint: 'Nhân vật có thể làm gì?', next: 's2' },
        { hint: 'Còn cách nào khác?', next: 's2' },
      ] },
      { code: 's2', isEnding: true, endingCode: 'fin', hint: 'Cuối cùng thì chuyện gì đã xảy ra?' },
    ],
    endings: [{ code: 'fin', title: 'Kết thúc' }],
  },
  {
    code: 'noi_cam_xuc',
    name: 'Nói ra cảm xúc',
    strategy: 'nhan_biet_cam_xuc',
    summary: 'Nhân vật đang có một cảm xúc mạnh và phải chọn nói ra hay giữ lại.',
    scenes: [
      { code: 's1', isStart: true, hint: 'Chuyện gì vừa xảy ra làm nhân vật khó chịu?', choices: [
        { hint: 'Nói ra ngay với ai đó', next: 's2', strategy: 'noi_ro_nhu_cau' },
        { hint: 'Giữ trong lòng', next: 's3' },
        { hint: 'Dừng lại gọi tên cảm xúc trước', next: 's4', strategy: 'nhan_biet_cam_xuc' },
      ] },
      { code: 's2', hint: 'Người kia phản ứng thế nào?', choices: [
        { hint: 'Nói tiếp điều mình cần', next: 's5', strategy: 'noi_ro_nhu_cau' },
        { hint: 'Thôi không nói nữa', next: 's3' },
      ] },
      { code: 's3', hint: 'Giữ trong lòng thì chuyện gì tới sau đó?', choices: [
        { hint: 'Cuối cùng vẫn nói ra', next: 's5', strategy: 'noi_ro_nhu_cau' },
        { hint: 'Để yên như vậy', ending: 'fin_giu' },
      ] },
      { code: 's4', hint: 'Nhân vật gọi tên được cảm xúc gì?', choices: [
        { hint: 'Đi tìm người để nói', next: 's2', strategy: 'noi_ro_nhu_cau' },
        { hint: 'Tự làm dịu lại rồi tính tiếp', next: 's5' },
      ] },
      { code: 's5', isEnding: true, endingCode: 'fin_noi', hint: 'Nói ra rồi thì mọi thứ thế nào?' },
      { code: 's6', isEnding: true, endingCode: 'fin_giu', hint: 'Không nói thì mọi thứ thế nào?' },
    ],
    endings: [
      { code: 'fin_noi', title: 'Nói ra được' },
      { code: 'fin_giu', title: 'Giữ lại trong lòng' },
    ],
  },
  {
    code: 'ban_ru_lam_sai',
    name: 'Bạn rủ làm điều sai',
    strategy: 'xem_xet_hau_qua',
    summary: 'Một lời rủ rê hấp dẫn, và nhân vật phải nghĩ trước một bước.',
    scenes: [
      { code: 's1', isStart: true, hint: 'Bạn rủ làm việc gì?', choices: [
        { hint: 'Đồng ý ngay', next: 's2' },
        { hint: 'Xin nghĩ một lát', next: 's3', strategy: 'xem_xet_hau_qua' },
        { hint: 'Từ chối và nói lý do', next: 's4', strategy: 'noi_ro_nhu_cau' },
      ] },
      { code: 's2', hint: 'Làm rồi thì gặp chuyện gì?', choices: [
        { hint: 'Dừng lại giữa chừng', next: 's5', strategy: 'ton_trong_ranh_gioi' },
        { hint: 'Làm tới cùng', ending: 'fin_toicung' },
      ] },
      { code: 's3', hint: 'Nhân vật nghĩ tới điều gì sẽ xảy ra?', choices: [
        { hint: 'Đề nghị một cách khác cho cả hai', next: 's6', strategy: 'noi_ro_nhu_cau' },
        { hint: 'Vẫn đi cùng bạn', next: 's2' },
      ] },
      { code: 's4', hint: 'Bạn phản ứng ra sao khi bị từ chối?', choices: [
        { hint: 'Rủ bạn làm việc khác', next: 's6', strategy: 'noi_ro_nhu_cau' },
        { hint: 'Ai đi đường nấy', next: 's5' },
      ] },
      { code: 's5', hint: 'Sau khi dừng lại thì sao?', choices: [
        { hint: 'Kể cho người lớn nghe', ending: 'fin_ke', strategy: 'nho_giup_do' },
        { hint: 'Giữ cho riêng mình', ending: 'fin_toicung' },
      ] },
      { code: 's6', isEnding: true, endingCode: 'fin_cachkhac', hint: 'Cách khác ấy diễn ra thế nào?' },
      { code: 's7', isEnding: true, endingCode: 'fin_ke', hint: 'Kể ra rồi thì sao?' },
      { code: 's8', isEnding: true, endingCode: 'fin_toicung', hint: 'Đi tới cùng thì kết cục ra sao?' },
    ],
    endings: [
      { code: 'fin_cachkhac', title: 'Tìm được cách khác' },
      { code: 'fin_ke', title: 'Kể với người lớn' },
      { code: 'fin_toicung', title: 'Đi tới cùng' },
    ],
  },
  {
    code: 'nguoi_la_hoi_chuyen',
    name: 'Người lạ hỏi chuyện',
    strategy: 'ton_trong_ranh_gioi',
    summary: 'Một người lạ bắt chuyện. Nhân vật giữ khoảng cách thế nào?',
    scenes: [
      { code: 's1', isStart: true, hint: 'Người lạ xuất hiện ở đâu, nói gì?', choices: [
        { hint: 'Lùi lại, giữ khoảng cách', next: 's2', strategy: 'ton_trong_ranh_gioi' },
        { hint: 'Hỏi lại cho rõ', next: 's3' },
        { hint: 'Đi tìm người lớn tin được', next: 's4', strategy: 'nho_giup_do' },
      ] },
      { code: 's2', hint: 'Người lạ làm gì tiếp?', choices: [
        { hint: 'Nói rõ mình sẽ chờ ở đây', next: 's4', strategy: 'noi_ro_nhu_cau' },
        { hint: 'Bỏ đi chỗ khác', next: 's4' },
      ] },
      { code: 's3', hint: 'Câu trả lời của họ có hợp lý không?', choices: [
        { hint: 'Không hợp lý — đi tìm người lớn', next: 's4', strategy: 'nho_giup_do' },
        { hint: 'Nghe có vẻ được — đi theo', next: 's5' },
      ] },
      { code: 's4', isEnding: true, endingCode: 'fin_antoan', hint: 'Cuối cùng nhân vật ở đâu, với ai?' },
      { code: 's5', isEnding: true, endingCode: 'fin_theo', hint: 'Đi theo rồi thì chuyện gì xảy ra?' },
    ],
    endings: [
      { code: 'fin_antoan', title: 'Ở chỗ an toàn' },
      { code: 'fin_theo', title: 'Đi theo người lạ' },
    ],
  },
  {
    code: 'giu_loi_hua',
    name: 'Giữ lời hứa',
    strategy: 'noi_ro_nhu_cau',
    summary: 'Nhân vật đã hứa một việc, rồi hoàn cảnh thay đổi.',
    scenes: [
      { code: 's1', isStart: true, hint: 'Nhân vật đã hứa điều gì với ai?', choices: [
        { hint: 'Cố giữ lời bằng mọi giá', next: 's2' },
        { hint: 'Nói thật là mình không làm được', next: 's3', strategy: 'noi_ro_nhu_cau' },
        { hint: 'Im lặng, hy vọng không ai nhớ', next: 's4' },
      ] },
      { code: 's2', hint: 'Cố giữ lời thì phải đánh đổi gì?', choices: [
        { hint: 'Nhờ ai đó giúp một tay', next: 's5', strategy: 'nho_giup_do' },
        { hint: 'Tự làm cho xong', next: 's5' },
      ] },
      { code: 's3', hint: 'Người kia phản ứng thế nào khi nghe?', choices: [
        { hint: 'Cùng tìm cách khác', next: 's5', strategy: 'noi_ro_nhu_cau' },
        { hint: 'Họ buồn, nhân vật làm gì tiếp?', next: 's2' },
      ] },
      { code: 's4', hint: 'Im lặng rồi thì sao?', choices: [
        { hint: 'Cuối cùng vẫn nói', next: 's3', strategy: 'noi_ro_nhu_cau' },
        { hint: 'Để chuyện trôi qua', ending: 'fin_troiqua' },
      ] },
      { code: 's5', isEnding: true, endingCode: 'fin_giuduoc', hint: 'Kết cục của lời hứa ấy là gì?' },
      { code: 's6', isEnding: true, endingCode: 'fin_troiqua', hint: 'Không ai nhắc tới nữa thì sao?' },
    ],
    endings: [
      { code: 'fin_giuduoc', title: 'Giữ được, theo cách khác' },
      { code: 'fin_troiqua', title: 'Chuyện trôi qua' },
    ],
  },
];

export const TEMPLATE_BY_CODE = Object.fromEntries(TEMPLATES.map((t) => [t.code, t]));

/**
 * Hàng đợi biên tập dựng sẵn. Mỗi bản có đủ graph để xem trước được, và một thread thật —
 * người quản trị trong demo bấm chuyển trạng thái là thread nối tiếp ngay.
 */
export const UGC_SEED = [
  {
    id: 501,
    title: 'Hộp bút của Tí',
    description: 'Tí mượn hộp bút của bạn mà quên trả. Hôm sau bạn hỏi.',
    categoryCode: 'social', ageBandCode: 'age_6_10',
    ownerName: 'Bống', ownerKind: 'child',
    status: 'needs_revision',
    createdAt: '2026-08-20T09:00:00Z', updatedAt: '2026-08-28T09:12:00Z',
    art: { motif: 'classroom', time: 'day' },
    scenes: [
      { code: 's1', isStart: true, text: 'Tí mở cặp và thấy hộp bút của Na vẫn nằm trong đó.\nHôm qua Tí quên trả.', choices: [
        { text: 'Mang sang trả và nói xin lỗi', next: 's2', strategy: 'noi_ro_nhu_cau' },
        { text: 'Để đến giờ ra chơi hẵng trả', next: 's3' },
      ] },
      { code: 's2', text: 'Na cầm hộp bút, cười.\n“Tớ tưởng mất rồi.”', choices: [
        { text: 'Hỏi Na có cần gì không', next: 's4' },
        { text: 'Về chỗ ngồi', next: 's4' },
      ] },
      { code: 's3', text: 'Đến giờ ra chơi thì Na đã đi ra sân.\nTí cầm hộp bút đi tìm.', choices: [
        { text: 'Tìm khắp sân', next: 's4' },
        { text: 'Nhờ bạn khác đưa hộ', next: 's5', strategy: 'nho_giup_do' },
      ] },
      { code: 's4', text: 'Cuối cùng hộp bút cũng về đúng chỗ.', choices: [
        { text: 'Hết', ending: 'fin_tra' },
      ] },
      { code: 's5', isEnding: true, endingCode: 'fin_nho', text: 'Bạn kia đưa hộ. Na nhận được, nhưng không biết ai trả.' },
    ],
    endings: [
      { code: 'fin_tra', title: 'Trả tận tay' },
      { code: 'fin_nho', title: 'Nhờ người đưa hộ' },
    ],
    thread: [
      { role: 'system', at: '2026-08-25T10:00:00Z', body: 'Bản gửi duyệt được tiếp nhận.' },
      { role: 'staff', at: '2026-08-26T08:30:00Z', author: 'Trần Minh',
        body: 'Truyện dễ thương. Trang 4 đang kết hơi vội — con thử viết thêm một dòng cho biết Tí thấy thế nào nhé.', anchor: 'Trang 4' },
      { role: 'author', at: '2026-08-26T19:10:00Z', author: 'Bống',
        body: 'Dạ con sửa rồi ạ. Con thêm câu Tí thấy nhẹ người.' },
      { role: 'staff', at: '2026-08-28T09:12:00Z', author: 'Trần Minh',
        body: 'Còn một chỗ nữa: trang 3 có lựa chọn “Tìm khắp sân” chưa dẫn đi đâu rõ. Con kiểm tra lại giúp nhé.', anchor: 'Trang 3' },
    ],
  },
  {
    id: 502,
    title: 'Ngày mưa ở sân trường',
    description: 'Mưa to, cả lớp kẹt lại trong hành lang. Một bạn không có áo mưa.',
    categoryCode: 'eq', ageBandCode: 'age_6_10',
    ownerName: 'Cua', ownerKind: 'child',
    status: 'published',
    createdAt: '2026-08-10T09:00:00Z', updatedAt: '2026-08-26T14:30:00Z',
    art: { motif: 'schoolgate', time: 'dusk' },
    scenes: [
      { code: 's1', isStart: true, text: 'Mưa như trút. Cả lớp đứng nép trong hành lang.\nMi không mang áo mưa.', choices: [
        { text: 'Rủ Mi đi chung áo mưa', next: 's2', strategy: 'noi_ro_nhu_cau' },
        { text: 'Chờ xem có ai rủ trước không', next: 's3' },
      ] },
      { code: 's2', text: 'Hai đứa chui chung một cái áo mưa.\nVai Mi vẫn ướt, nhưng Mi cười.', choices: [
        { text: 'Đi chậm lại cho vừa nhau', next: 's4' },
        { text: 'Chạy thật nhanh', next: 's4' },
      ] },
      { code: 's3', text: 'Mọi người về gần hết. Mi vẫn đứng đó.', choices: [
        { text: 'Bây giờ mới rủ', next: 's2', strategy: 'noi_ro_nhu_cau' },
        { text: 'Về một mình', next: 's5' },
      ] },
      { code: 's4', isEnding: true, endingCode: 'fin_chung', text: 'Về tới cổng thì cả hai đều ướt một nửa, và cùng cười.' },
      { code: 's5', isEnding: true, endingCode: 'fin_rieng', text: 'Về đến nhà, áo khô. Nhưng cả tối cứ nghĩ tới Mi đứng ở hành lang.' },
    ],
    endings: [
      { code: 'fin_chung', title: 'Ướt một nửa' },
      { code: 'fin_rieng', title: 'Về một mình' },
    ],
    thread: [
      { role: 'system', at: '2026-08-20T10:00:00Z', body: 'Bản gửi duyệt được tiếp nhận.' },
      { role: 'staff', at: '2026-08-24T11:00:00Z', author: 'Lê Phương',
        body: 'Rất tốt. Đội duyệt chấp nhận và đã xuất bản.' },
    ],
  },
  {
    id: 503,
    title: 'Cái kẹo cuối cùng',
    description: 'Còn một cái kẹo trong hộp, mà có hai đứa.',
    categoryCode: 'social', ageBandCode: 'age_6_10',
    ownerName: 'Bống', ownerKind: 'child',
    status: 'submitted',
    createdAt: '2026-08-27T08:00:00Z', updatedAt: '2026-08-28T07:40:00Z',
    art: { motif: 'kitchen', time: 'day' },
    scenes: [
      { code: 's1', isStart: true, text: 'Trong hộp còn đúng một cái kẹo.\nEm cũng đang nhìn vào đó.', choices: [
        { text: 'Bẻ đôi', next: 's2', strategy: 'noi_ro_nhu_cau' },
        { text: 'Nhường hẳn cho em', next: 's3' },
        { text: 'Lấy trước', next: 's4' },
      ] },
      { code: 's2', text: 'Hai nửa không đều nhau lắm.\nEm chọn nửa to hơn.', choices: [
        { text: 'Không sao', next: 's5' },
        { text: '“Sao em lấy miếng to?”', next: 's5' },
      ] },
      { code: 's3', text: 'Em cầm kẹo, chạy đi.\nMột lát sau em quay lại, đưa lại nửa cái.', choices: [
        { text: 'Nhận', next: 's5' },
        { text: '“Em ăn đi.”', next: 's5' },
      ] },
      { code: 's4', text: 'Em không nói gì, chỉ đứng nhìn cái hộp rỗng.', choices: [
        { text: 'Đưa lại cho em', next: 's3' },
        { text: 'Ăn hết', next: 's6' },
      ] },
      { code: 's5', isEnding: true, endingCode: 'fin_chia', text: 'Cái kẹo hết rất nhanh. Nhưng buổi chiều thì còn dài.' },
      { code: 's6', isEnding: true, endingCode: 'fin_motminh', text: 'Kẹo ngọt. Chỉ có điều ăn một mình thì nhanh chán.' },
    ],
    endings: [
      { code: 'fin_chia', title: 'Chia nhau' },
      { code: 'fin_motminh', title: 'Ăn một mình' },
    ],
    thread: [
      { role: 'system', at: '2026-08-28T07:40:00Z', body: 'Bản gửi duyệt được tiếp nhận.' },
    ],
  },
  {
    id: 504,
    title: 'Bí mật dưới gầm cầu thang',
    description: 'Bản nháp đang viết dở.',
    categoryCode: 'puzzle_mystery', ageBandCode: 'age_6_10',
    ownerName: 'Cua', ownerKind: 'child',
    status: 'draft',
    createdAt: '2026-08-28T06:10:00Z', updatedAt: '2026-08-28T06:55:00Z',
    art: { motif: 'library', time: 'night' },
    scenes: [
      { code: 's1', isStart: true, text: 'Dưới gầm cầu thang có một cái hộp thiếc.\nKhông ai biết của ai.', choices: [
        { text: 'Mở ra xem', next: 's2' },
        { text: 'Hỏi bà trước', next: null },
      ] },
      { code: 's2', text: 'Trong hộp là mấy tấm vé xem phim đã cũ.', choices: [
        { text: 'Đem hỏi bà', next: null },
      ] },
    ],
    endings: [],
    thread: [],
  },
];
