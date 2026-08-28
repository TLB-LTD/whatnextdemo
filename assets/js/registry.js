/**
 * Sổ đăng ký màn hình.
 *
 * Mỗi màn là một object cùng một hợp đồng, nên khung trưng bày, thanh trạng thái và trang
 * tự kiểm tra không cần biết gì về nội dung bên trong:
 *
 *   id       khoá trong URL
 *   plane    mặt phẳng đối tượng
 *   name     tên tiếng Việt (thứ người xem đọc)
 *   sid      Screen ID kỹ thuật (chỉ hiện khi bật Chế độ kỹ thuật)
 *   desc     một câu mục đích
 *   density  child | creator | parent  → quyết định cỡ chạm và cỡ chữ
 *   frame    'phone' ép khung hẹp; mặc định theo khổ đang chọn
 *   live     true nếu màn có state thật
 *   states   danh sách trạng thái xem được (mặc định / rỗng / đang tải / lỗi)
 *   init     tạo state cục bộ
 *   render   trả markup
 *   act      xử lý data-act
 *   after    chạy sau khi markup đã gắn vào DOM (hiệu ứng cần phần tử thật)
 */

import { landingScreens } from 'wnd/screens/landing.js';
import { guestScreens } from 'wnd/screens/guest.js';
import { childScreens } from 'wnd/screens/child.js';
import { ugcScreens } from 'wnd/screens/ugc.js';
import { parentScreens } from 'wnd/screens/parent.js';
import { adminScreens } from 'wnd/screens/admin.js';

export const PLANES = [
  {
    id: 'marketing', name: 'Công khai', icon: 'compass', color: 'var(--wn-brand)',
    blurb: 'Người lớn tìm hiểu sản phẩm. Không có hồ sơ trẻ, không gọi tới nội dung truyện.',
  },
  {
    id: 'guest', name: 'Khách chơi thử', icon: 'eye', color: 'var(--wn-genre-puzzle)',
    blurb: 'Đọc thử không cần tài khoản. Mọi giới hạn đều là lời mời, không phải bức tường.',
  },
  {
    id: 'child', name: 'Trẻ đọc truyện', icon: 'bookOpen', color: 'var(--wn-genre-adventure)',
    blurb: 'Mặt phẳng chính. Chạm 48dp, chữ đọc 18px, không con số nào để so sánh.',
  },
  {
    id: 'ugc', name: 'Trẻ sáng tác', icon: 'wand', color: 'var(--wn-genre-mystery)',
    blurb: 'Cũng là trẻ, nhưng ở vai tác giả — mật độ dày hơn vì phải thao tác nhiều.',
  },
  {
    id: 'parent', name: 'Phụ huynh', icon: 'users', color: 'var(--wn-accent)',
    blurb: 'Chủ tài khoản: quản lý hồ sơ trẻ, đặt trần nội dung, xem hoạt động.',
  },
  {
    id: 'ops', name: 'Vận hành', icon: 'layers', color: 'var(--wn-muted)',
    blurb: 'Biên tập và kiểm duyệt. Ngoài bốn mặt phẳng người dùng cuối.',
  },
];

export const PLANE_BY_ID = Object.fromEntries(PLANES.map((p) => [p.id, p]));

const DEFAULT_STATES = [{ id: 'default', label: 'Mặc định' }];

function normalise(s) {
  return {
    density: 'child',
    states: DEFAULT_STATES,
    live: false,
    init: () => ({}),
    act: () => {},
    after: () => {},
    ...s,
  };
}

export const SCREENS = [
  ...landingScreens,
  ...guestScreens,
  ...childScreens,
  ...ugcScreens,
  ...parentScreens,
  ...adminScreens,
].map(normalise);

export const SCREEN_BY_ID = Object.fromEntries(SCREENS.map((s) => [s.id, s]));

export function screensOfPlane(planeId) {
  return SCREENS.filter((s) => s.plane === planeId);
}

export function neighbours(id) {
  const i = SCREENS.findIndex((s) => s.id === id);
  return { prev: i > 0 ? SCREENS[i - 1] : null, next: i >= 0 && i < SCREENS.length - 1 ? SCREENS[i + 1] : null };
}
