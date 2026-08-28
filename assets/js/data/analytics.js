/**
 * Số liệu cho console báo cáo. Tất cả là số minh hoạ, tổng hợp ở mức truyện / trang / lựa chọn.
 * Cố ý không có một dòng nào ở mức cá nhân: báo cáo nội dung không cần biết trẻ nào.
 */

export const DATE_RANGE = { from: '2026-07-30', to: '2026-08-28', tz: 'Asia/Ho_Chi_Minh (UTC+7)' };

export const KPIS = [
  { label: 'Phiên đọc', value: 18432, note: '+12% so với 30 ngày trước' },
  { label: 'Đọc trọn truyện', value: 11907, note: 'Tỉ lệ hoàn thành 64,6%' },
  { label: 'Chiến lược khám phá', value: 26841, note: 'Trung bình 1,5 mỗi phiên' },
  { label: 'Truyện đang xuất bản', value: 12, note: '1 truyện từ người dùng' },
];

/** Chuỗi 30 ngày — dựng bằng công thức để không phải chép tay 30 con số. */
export const DAILY_SESSIONS = Array.from({ length: 30 }, (_, i) => {
  const weekend = (i % 7 === 5 || i % 7 === 6) ? 1.34 : 1;
  const trend = 1 + i * 0.012;
  return Math.round(420 * weekend * trend + Math.sin(i / 2.4) * 46);
});

export const STORY_METRICS = [
  { code: 'wn-demo-nguoi-la-cong-truong', starts: 4106, completes: 3181, minutes: 6.2 },
  { code: 'wn-demo-cai-binh-vo',          starts: 3182, completes: 2416, minutes: 6.8 },
  { code: 'wn-demo-ban-ru-tron-hoc',      starts: 2470, completes: 1502, minutes: 7.4 },
  { code: 'wn-demo-dem-mat-dien',         starts: 2010, completes: 1740, minutes: 4.1 },
  { code: 'wn-demo-con-meo-di-lac',       starts: 1922, completes: 1584, minutes: 5.0 },
  { code: 'wn-demo-ngay-dau-chuyen-lop',  starts: 1755, completes: 1290, minutes: 5.3 },
  { code: 'wn-demo-bi-mat-cua-ban',       starts: 1688, completes: 1109, minutes: 5.6 },
  { code: 'wn-demo-cau-do-cua-ong',       starts: 1440, completes: 951,  minutes: 5.1 },
  { code: 'wn-demo-chiec-cap-nang',       starts: 1204, completes: 1024, minutes: 3.8 },
  { code: 'wn-demo-chuyen-o-cho-que',     starts: 1096, completes: 902,  minutes: 4.0 },
  { code: 'wn-demo-hop-mau-bi-mat',       starts: 902,  completes: 640,  minutes: 4.4 },
  { code: 'wn-demo-tieng-dong-tren-gac',  starts: 640,  completes: 402,  minutes: 6.5 },
];

/** Rơi rụng theo trang của một truyện — chọn truyện có nhánh dài nhất để thấy rõ chỗ tắc. */
export const SCENE_DROPOFF = {
  'wn-demo-ban-ru-tron-hoc': [
    { scene: 'Trang 1 — Bo rủ ra bãi', entered: 2470, left: 96 },
    { scene: 'Trang 2 — Nghĩ một lát', entered: 1402, left: 71 },
    { scene: 'Trang 3 — Lách cổng sau', entered: 812, left: 214 },
    { scene: 'Trang 4 — Bo buông tay', entered: 654, left: 48 },
    { scene: 'Trang 7 — Cô đang điểm danh', entered: 726, left: 133 },
    { scene: 'Trang 8 — Cổng trường khóa', entered: 402, left: 186 },
    { scene: 'Trang 10 — Ở lại nói với cô', entered: 488, left: 20 },
  ],
  'wn-demo-cai-binh-vo': [
    { scene: 'Trang 1 — Bình rơi', entered: 3182, left: 74 },
    { scene: 'Trang 2 — Đứng yên thở', entered: 1610, left: 40 },
    { scene: 'Trang 3 — Giấu xuống gầm ghế', entered: 902, left: 168 },
    { scene: 'Trang 4 — Mẹ trong bếp', entered: 1884, left: 62 },
    { scene: 'Trang 8 — Mẹ im lặng', entered: 402, left: 121 },
    { scene: 'Trang 9 — Nhặt mảnh vỡ', entered: 1502, left: 18 },
  ],
};

export const CHOICE_DISTRIBUTION = {
  'wn-demo-cai-binh-vo': {
    scene: 'Trang 1 — Bình rơi làm ba mảnh',
    options: [
      { label: 'Đứng yên một lát, thở một hơi', count: 1610, strategy: 'Nhận biết cảm xúc' },
      { label: 'Chạy xuống bếp tìm mẹ', count: 866, strategy: 'Nhờ giúp đỡ' },
      { label: 'Gom mảnh vỡ giấu xuống gầm ghế', count: 632, strategy: null },
    ],
  },
  'wn-demo-nguoi-la-cong-truong': {
    scene: 'Trang 1 — Chú lạ gọi đúng tên',
    options: [
      { label: 'Đi tìm bác bảo vệ', count: 2244, strategy: 'Nhờ giúp đỡ' },
      { label: 'Lùi lại, đứng trong cổng', count: 1408, strategy: 'Tôn trọng ranh giới' },
      { label: '“Chú là ai ạ?”', count: 454, strategy: 'Nói rõ nhu cầu' },
    ],
  },
};

export const PROPOSAL_STATS = {
  total: 486,
  byStatus: [
    { status: 'Chờ duyệt', count: 74, tone: 'warning' },
    { status: 'Đã tiếp nhận', count: 318, tone: 'success' },
    { status: 'Không dùng', count: 94, tone: 'neutral' },
  ],
  topStories: [
    { code: 'wn-demo-ban-ru-tron-hoc', count: 121 },
    { code: 'wn-demo-cai-binh-vo', count: 96 },
    { code: 'wn-demo-bi-mat-cua-ban', count: 68 },
    { code: 'wn-demo-nguoi-la-cong-truong', count: 54 },
  ],
};

export const AUDIO_STATS = {
  coverage: 0.83,
  rows: [
    { code: 'wn-demo-cai-binh-vo', plays: 2740, replays: 918, completion: 0.71 },
    { code: 'wn-demo-nguoi-la-cong-truong', plays: 3602, replays: 1204, completion: 0.78 },
    { code: 'wn-demo-dem-mat-dien', plays: 1806, replays: 742, completion: 0.84 },
    { code: 'wn-demo-ban-ru-tron-hoc', plays: 1990, replays: 508, completion: 0.62 },
    { code: 'wn-demo-chiec-cap-nang', plays: 1044, replays: 226, completion: 0.69 },
  ],
};

/** Bảng nội dung cho CMS — trạng thái biên tập, khác với vòng đời UGC. */
export const CMS_ROWS = [
  { code: 'wn-demo-cai-binh-vo', status: 'published', scenes: 9, endings: 3, updated: '2026-08-18' },
  { code: 'wn-demo-ban-ru-tron-hoc', status: 'published', scenes: 11, endings: 4, updated: '2026-08-19' },
  { code: 'wn-demo-nguoi-la-cong-truong', status: 'published', scenes: 8, endings: 2, updated: '2026-08-22' },
  { code: 'wn-demo-chiec-cap-nang', status: 'published', scenes: 4, endings: 2, updated: '2026-08-11' },
  { code: 'wn-demo-bi-mat-cua-ban', status: 'published', scenes: 5, endings: 2, updated: '2026-08-12' },
  { code: 'wn-demo-dem-mat-dien', status: 'published', scenes: 4, endings: 1, updated: '2026-08-14' },
  { code: 'wn-demo-con-meo-di-lac', status: 'published', scenes: 4, endings: 1, updated: '2026-08-15' },
  { code: 'wn-demo-hop-mau-bi-mat', status: 'published', scenes: 5, endings: 4, updated: '2026-08-16' },
  { code: 'wn-demo-cau-do-cua-ong', status: 'published', scenes: 6, endings: 3, updated: '2026-08-17' },
  { code: 'wn-demo-ngay-dau-chuyen-lop', status: 'published', scenes: 6, endings: 2, updated: '2026-08-20' },
  { code: 'wn-demo-tieng-dong-tren-gac', status: 'review', scenes: 5, endings: 2, updated: '2026-08-25' },
  { code: 'wn-demo-chuyen-o-cho-que', status: 'published', scenes: 4, endings: 2, updated: '2026-08-21' },
  { code: 'wn-demo-buoi-truc-nhat', title: 'Buổi trực nhật', status: 'draft', scenes: 2, endings: 0, updated: '2026-08-28' },
];

export const CMS_STATUS = {
  draft: { label: 'Nháp', tone: 'neutral' },
  review: { label: 'Chờ biên tập', tone: 'warning' },
  published: { label: 'Đang xuất bản', tone: 'success' },
  archived: { label: 'Đã gỡ', tone: 'neutral' },
};
