/**
 * Thư viện thực tế của phiên demo = truyện biên tập + truyện người dùng đã được duyệt.
 *
 * Đây chính là chỗ vòng lặp nội dung khép lại: khi vai quản trị bấm xuất bản, bản UGC đi qua
 * hàm này và xuất hiện trong thư viện của trẻ mà không cần tải lại trang.
 */

import { allStories } from 'wnd/data/catalog.js';
import { publishedUgcStories } from 'wnd/state.js';

let cache = null;
let cacheKey = '';

/**
 * Một lần vẽ màn thư viện gọi hàm này hàng chục lần (mỗi chip thể loại một lần). Nhớ lại theo
 * danh sách bản UGC đã xuất bản là đủ: khoá đổi đúng lúc biên tập xuất bản một truyện mới.
 */
export function library() {
  const published = publishedUgcStories();
  const key = published.map((s) => s.code + ':' + s.title).join('|');
  if (cache && key === cacheKey) return cache;
  cacheKey = key;
  cache = allStories(published);
  return cache;
}

export function findStory(codeOrId) {
  const all = library();
  return all.find((s) => s.code === codeOrId || String(s.id) === String(codeOrId));
}

export function firstPlayable() {
  return library()[0];
}
