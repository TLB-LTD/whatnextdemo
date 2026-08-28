/**
 * Thư viện thực tế của phiên demo = truyện biên tập + truyện người dùng đã được duyệt.
 *
 * Đây chính là chỗ vòng lặp nội dung khép lại: khi vai quản trị bấm xuất bản, bản UGC đi qua
 * hàm này và xuất hiện trong thư viện của trẻ mà không cần tải lại trang.
 */

import { allStories } from 'wnd/data/catalog.js';
import { publishedUgcStories } from 'wnd/state.js';

export function library() {
  return allStories(publishedUgcStories());
}

export function findStory(codeOrId) {
  const all = library();
  return all.find((s) => s.code === codeOrId || String(s.id) === String(codeOrId));
}

export function firstPlayable() {
  return library()[0];
}
