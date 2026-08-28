/**
 * Nhân vật của demo. Toàn bộ là hư cấu — không có dữ liệu thật của ai.
 * Tên hiển thị của trẻ cố tình là biệt danh, không phải họ tên đầy đủ.
 */

export const PARENT = {
  id: 1,
  displayName: 'Nguyễn Thu Hà',
  email: 'phuhuynh@vidu.demo',
  province: 'Hà Nội',
  ward: 'Phường Ngọc Hà',
  birthYear: 1991,
  needsProfile: false,
  parentalMaxRating: 'PG',
};

export const CHILDREN = [
  {
    id: 7, name: 'Bống', birthYear: 2018, bandCode: 'age_6_10',
    tint: 'var(--wn-genre-adventure)',
    interests: ['Cảm xúc', 'Bạn bè', 'Phiêu lưu'],
    genres: ['realistic', 'social', 'nature'],
    minutesThisWeek: 84,
    parentalMaxRating: 'PG',
  },
  {
    id: 8, name: 'Cua', birthYear: 2015, bandCode: 'age_11_15',
    tint: 'var(--wn-genre-puzzle)',
    interests: ['Giải đố', 'Logic', 'Trinh thám'],
    genres: ['puzzle_mystery', 'science', 'horror'],
    minutesThisWeek: 46,
    parentalMaxRating: 'PG_13',
  },
];

export const MODERATORS = [
  { id: 21, name: 'Trần Minh', role: 'Biên tập viên' },
  { id: 22, name: 'Lê Phương', role: 'Kiểm duyệt nội dung' },
];

/** Lịch sử đọc dựng sẵn để màn Lịch sử và Tổng quan phụ huynh không trống. */
export const HISTORY = [
  { storyCode: 'wn-demo-cai-binh-vo', at: '2026-08-27T19:20:00Z', endingCode: 'e_cungnoi', completed: 2 },
  { storyCode: 'wn-demo-nguoi-la-cong-truong', at: '2026-08-26T18:05:00Z', endingCode: 'e_chome', completed: 1 },
  { storyCode: 'wn-demo-dem-mat-dien', at: '2026-08-25T20:40:00Z', endingCode: 'e_ketchuyen', completed: 1 },
  { storyCode: 'wn-demo-ban-ru-tron-hoc', at: '2026-08-24T17:30:00Z', endingCode: null, completed: 0 },
  { storyCode: 'wn-demo-con-meo-di-lac', at: '2026-08-22T16:10:00Z', endingCode: 'e_veve', completed: 1 },
];

export const PROPOSALS = [
  {
    id: 301, storyCode: 'wn-demo-cai-binh-vo', sceneCode: 's1', status: 'approved',
    at: '2026-08-24T10:12:00Z',
    idea: 'Cho thêm lựa chọn “Chụp ảnh chỗ vỡ để nhớ mà kể lại cho đúng”.',
    rationale: 'Con nhà mình hay quên chi tiết khi kể lại, chụp ảnh giúp con nói rõ hơn.',
    reply: 'Cảm ơn anh chị. Đã thêm vào bản cập nhật tháng sau.',
  },
  {
    id: 302, storyCode: 'wn-demo-ban-ru-tron-hoc', sceneCode: 's3', status: 'pending',
    at: '2026-08-27T08:45:00Z',
    idea: 'Nên có nhánh “rủ bạn cùng quay về” chứ không chỉ về một mình.',
    rationale: 'Về một mình vẫn để bạn ở lại ngoài đó.',
    reply: null,
  },
  {
    id: 303, storyCode: 'wn-demo-chiec-cap-nang', sceneCode: 's3', status: 'rejected',
    at: '2026-08-20T21:02:00Z',
    idea: 'Thêm lựa chọn nghỉ học một buổi.',
    rationale: 'Có hôm con mệt thật.',
    reply: 'Cảm ơn góp ý. Nhánh này nằm ngoài phạm vi quyết định của trẻ nên nhóm nội dung xin phép không thêm.',
  },
];

export const NOTIFICATIONS = [
  {
    id: 401, kind: 'ugc', at: '2026-08-28T09:12:00Z', unread: true,
    title: 'Đội duyệt đã nhắn về truyện “Hộp bút của Tí”',
    body: 'Có một chỗ cần con viết rõ hơn ở trang 3.',
  },
  {
    id: 402, kind: 'ugc', at: '2026-08-26T14:30:00Z', unread: false,
    title: 'Truyện “Ngày mưa ở sân trường” đã được xuất bản',
    body: 'Truyện của con giờ đã có trong thư viện.',
  },
  {
    id: 403, kind: 'system', at: '2026-08-21T07:00:00Z', unread: false,
    title: 'Có 3 truyện mới trong mục Gia đình & bạn bè',
    body: 'Xem thử xem có truyện nào con thích không.',
  },
];

export const SKILL_REPORT = [
  { name: 'Nhận biết cảm xúc', met: 9, note: 'Gặp nhiều nhất trong “Cái bình vỡ”.' },
  { name: 'Nói rõ nhu cầu', met: 7, note: 'Bống hay chọn nhánh nói thẳng.' },
  { name: 'Nhờ giúp đỡ', met: 5, note: 'Xuất hiện ở các truyện an toàn.' },
  { name: 'Tôn trọng ranh giới', met: 3, note: 'Còn ít — thử “Người lạ ở cổng trường”.' },
  { name: 'Xem xét hậu quả', met: 6, note: 'Tăng đều trong hai tuần gần đây.' },
];

export const SUGGESTED = ['wn-demo-bi-mat-cua-ban', 'wn-demo-ngay-dau-chuyen-lop', 'wn-demo-hop-mau-bi-mat'];
