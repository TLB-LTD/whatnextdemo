/**
 * Danh mục: nhóm tuổi, thể loại, và bảng tra truyện.
 *
 * Nhãn hiển thị luôn là chữ người đọc được ("Thiếu nhi (6–10)"), không bao giờ là mã máy
 * ("age_6_10") — đó là một luật của hệ thiết kế, không phải sở thích.
 */

import { STORIES } from 'wnd/data/stories.js';
import { tintFor, choiceStyleFor } from 'wnd/art.js';

export const AGE_BANDS = [
  { id: 1, code: 'age_0_5',     label: 'Mầm non (0–5)',        min: 0,  max: 5,   attestTier: 1 },
  { id: 2, code: 'age_6_10',    label: 'Thiếu nhi (6–10)',     min: 6,  max: 10,  attestTier: 1, focus: true },
  { id: 3, code: 'age_11_15',   label: 'Thiếu niên (11–15)',   min: 11, max: 15,  attestTier: 2 },
  { id: 4, code: 'age_16_17',   label: 'Thiếu niên lớn (16–17)', min: 16, max: 17, attestTier: 2 },
  { id: 5, code: 'age_18_24',   label: 'Thanh niên (18–24)',   min: 18, max: 24,  attestTier: 3 },
  { id: 6, code: 'age_25_35',   label: 'Trưởng thành (25–35)', min: 25, max: 35,  attestTier: 3 },
  { id: 7, code: 'age_36_45',   label: 'Trưởng thành (36–45)', min: 36, max: 45,  attestTier: 3 },
  { id: 8, code: 'age_46_60',   label: 'Trung niên (46–60)',   min: 46, max: 60,  attestTier: 3 },
  { id: 9, code: 'age_60_plus', label: 'Người lớn (60+)',      min: 60, max: 120, attestTier: 3 },
];

export const BAND_BY_CODE = Object.fromEntries(AGE_BANDS.map((b) => [b.code, b]));

export const CATEGORIES = [
  { code: 'adventure',      name: 'Phiêu lưu' },
  { code: 'puzzle_mystery', name: 'Câu đố & bí ẩn' },
  { code: 'horror',         name: 'Kinh dị nhẹ' },
  { code: 'fantasy',        name: 'Kỳ ảo' },
  { code: 'realistic',      name: 'Đời thường' },
  { code: 'science',        name: 'Khoa học' },
  { code: 'history_culture', name: 'Lịch sử & văn hoá' },
  { code: 'eq',             name: 'Kỹ năng cảm xúc' },
  { code: 'social',         name: 'Gia đình & bạn bè' },
  { code: 'habits_safety',  name: 'Thói quen & an toàn' },
  { code: 'nature',         name: 'Thiên nhiên' },
  { code: 'creativity',     name: 'Sáng tạo' },
  { code: 'humor',          name: 'Hài hước' },
  { code: 'bedtime',        name: 'Đi ngủ' },
  { code: 'nonfiction',     name: 'Phi hư cấu' },
  { code: 'children_skills', name: 'Kỹ năng cho trẻ' },
  { code: 'romance',        name: 'Tình cảm nhẹ' },
];

export const CATEGORY_BY_CODE = Object.fromEntries(CATEGORIES.map((c) => [c.code, c]));

/** Mỗi thể loại một icon riêng — chip thể loại không còn là mười bảy viên thuốc giống nhau. */
export const CATEGORY_ICON = {
  adventure: 'map', puzzle_mystery: 'key', horror: 'ghost', fantasy: 'wand',
  realistic: 'home', science: 'flask', history_culture: 'landmark', eq: 'smile',
  social: 'users', habits_safety: 'shieldCheck', nature: 'leaf', creativity: 'palette',
  humor: 'laugh', bedtime: 'moonStar', nonfiction: 'fileText',
  children_skills: 'handHeart', romance: 'heart',
};

export const categoryIcon = (code) => CATEGORY_ICON[code] || 'bookOpen';

/** Sở thích trong onboarding — gom thành ba nhóm để trẻ không phải đọc 17 dòng. */
export const INTEREST_GROUPS = [
  { name: 'Kỹ năng', tags: ['Cảm xúc', 'Giao tiếp', 'An toàn', 'Bạn bè'] },
  { name: 'Giải trí', tags: ['Trinh thám', 'Phiêu lưu', 'Hài hước', 'Gia đình'] },
  { name: 'Tư duy', tags: ['Logic', 'Giải đố', 'Ra quyết định'] },
];

export const RATING_ORDER = ['G', 'PG', 'PG_13', 'R', 'ADULT_18'];
export const RATING_LABEL = {
  G: 'Mọi lứa tuổi', PG: 'Có người lớn cùng xem', PG_13: 'Từ 13 tuổi',
  R: 'Từ 17 tuổi', ADULT_18: 'Chỉ người lớn',
};

/** Bảng năm cấp cổng nội dung — hiển thị nguyên văn trên màn Hệ thiết kế và màn admin. */
export const GATE_LEVELS = [
  { level: 1, name: 'Nhắc nhẹ', note: 'Vẫn cho vào, kèm một dòng lưu ý.' },
  { level: 2, name: 'Chặn theo tuổi', note: 'Khoảng tuổi người xem phải giao với khoảng tuổi của truyện.' },
  { level: 3, name: 'Xác nhận nội dung', note: 'Cần một lần xác nhận trước khi mở truyện.' },
  { level: 4, name: 'Tuổi đã khai báo', note: 'Bắt buộc có năm sinh thật trong hồ sơ.' },
  { level: 5, name: 'Trần phụ huynh', note: 'Không vượt mức phân loại mà phụ huynh đặt.' },
];

function decorate(story) {
  const cat = CATEGORY_BY_CODE[story.categoryCode];
  const band = BAND_BY_CODE[story.ageBandCode];
  return {
    ...story,
    categoryName: cat ? cat.name : 'Khác',
    bandLabel: band ? band.label : '',
    minAge: band ? band.min : 6,
    maxAge: band ? band.max : 10,
    choiceStyle: choiceStyleFor(story.categoryCode),
    sceneByCode: Object.fromEntries(story.scenes.map((s) => [s.code, s])),
    endingByCode: Object.fromEntries(story.endings.map((e) => [e.code, e])),
    totalScenes: story.scenes.length,
  };
}

const baseCatalog = STORIES.map(decorate);

/** Truyện UGC được xuất bản trong phiên demo cũng đi qua đúng cửa này. */
export function decorateStory(story) {
  return decorate(story);
}

export function allStories(extra = []) {
  return [...baseCatalog, ...extra.map(decorate)];
}

export function tintOf(story, mode) {
  return tintFor(story.categoryCode, mode);
}

/** Nhóm truyện theo thể loại, bỏ nhóm rỗng — thư viện không bao giờ hiện mục trống. */
export function groupByCategory(stories) {
  const map = new Map();
  stories.forEach((s) => {
    if (!map.has(s.categoryCode)) map.set(s.categoryCode, []);
    map.get(s.categoryCode).push(s);
  });
  return CATEGORIES
    .filter((c) => map.has(c.code))
    .map((c) => ({ ...c, stories: map.get(c.code) }));
}

/**
 * Cổng nội dung, rút gọn đúng phần nhìn thấy được: trần tuổi lấy `max` của nhóm CHỨA tuổi đó,
 * không lấy chính con số tuổi — lấy con số thì một bé 6 tuổi sẽ không đọc được truyện nào
 * trong nhóm 6–10.
 */
export function evaluateAccess(story, viewer) {
  const band = BAND_BY_CODE[viewer.bandCode] || BAND_BY_CODE.age_6_10;
  const ceiling = viewer.parentalMaxRating;

  if (ceiling && RATING_ORDER.indexOf(story.contentRating) > RATING_ORDER.indexOf(ceiling)) {
    return { allowed: false, reason: 'parental',
      message: `Phụ huynh đã đặt trần nội dung ở mức “${RATING_LABEL[ceiling]}”.` };
  }
  if (story.ageGateLevel >= 2 && (story.maxAge < band.min || story.minAge > band.max)) {
    return { allowed: false, reason: 'age',
      message: `Truyện này dành cho ${story.bandLabel}. Nhóm tuổi đang chọn là ${band.label}.` };
  }
  if (story.ageGateLevel >= 3 && !viewer.acked) {
    return { allowed: true, needsAck: true,
      message: story.accessNotice || 'Truyện này cần một lần xác nhận trước khi mở.' };
  }
  if (!viewer.loggedIn && !story.guestPlayAllowed) {
    return { allowed: false, reason: 'guest',
      message: 'Truyện này cần đăng nhập mới đọc được.' };
  }
  return { allowed: true, notice: story.ageGateLevel === 1 ? story.accessNotice : null };
}
