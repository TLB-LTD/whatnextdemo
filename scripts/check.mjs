/**
 * Cổng kiểm tra tĩnh — chạy `node scripts/check.mjs`.
 *
 * Bốn loại lỗi mà trình duyệt KHÔNG kêu, nên phải bắt ở đây:
 *
 *   1. gọi một icon không tồn tại   → `icon()` trả chuỗi rỗng, nút mất icon mà không ai biết
 *   2. `ctx.go()` tới màn không có  → người dùng rơi vào trang "không tìm thấy"
 *   3. trùng id màn hoặc Screen ID  → router mở nhầm màn
 *   4. class CSS chưa định nghĩa    → khối rơi về `display:block`, `gap` biến mất, không ai thấy
 *
 * Không phụ thuộc gì ngoài Node.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];

function jsFiles(dir, out = []) {
  for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) jsFiles(rel, out);
    else if (e.name.endsWith('.js')) out.push(rel);
  }
  return out;
}

const files = jsFiles('assets/js');
const read = (f) => readFileSync(join(root, f), 'utf8');

/* 1 ------------------------------------------------------------- icon ---- */
const iconSrc = read('assets/js/icons.js');
const defined = new Set([...iconSrc.matchAll(/^ {2}([a-zA-Z]+): '/gm)].map((m) => m[1]));

for (const f of files) {
  for (const m of read(f).matchAll(/\bicon\('([a-zA-Z]+)'/g)) {
    if (!defined.has(m[1])) problems.push(`${f}: gọi icon('${m[1]}') nhưng chưa định nghĩa`);
  }
}
const catIcons = [...read('assets/js/data/catalog.js')
  .matchAll(/(?:^|[{,]\s*)[a-z_]+: '([a-zA-Z]+)'/gm)];
const catBlock = read('assets/js/data/catalog.js').split('CATEGORY_ICON = {')[1]?.split('};')[0] || '';
for (const m of catBlock.matchAll(/'([a-zA-Z]+)'/g)) {
  if (!defined.has(m[1])) problems.push(`catalog.js: icon thể loại '${m[1]}' chưa định nghĩa`);
}

/* 2 ------------------------------------------------------------ tuyến ---- */
const registry = read('assets/js/registry.js');
const screenIds = new Set();
const sids = new Set();
for (const f of files.filter((x) => x.includes('/screens/'))) {
  for (const m of read(f).matchAll(/^ {4}id: '([a-z0-9-]+)'/gm)) {
    if (screenIds.has(m[1])) problems.push(`trùng id màn: ${m[1]}`);
    screenIds.add(m[1]);
  }
  for (const m of read(f).matchAll(/^ {4}sid: '([A-Z0-9-]+)'/gm)) {
    if (sids.has(m[1])) problems.push(`trùng Screen ID: ${m[1]}`);
    sids.add(m[1]);
  }
}
for (const f of files) {
  for (const m of read(f).matchAll(/'\/man-hinh\/([a-z0-9-]+)'/g)) {
    if (!screenIds.has(m[1])) problems.push(`${f}: điều hướng tới màn không tồn tại '${m[1]}'`);
  }
}

/* 3 ------------------------------------------------- dữ liệu tham chiếu -- */
const storyCodes = new Set(
  [...read('assets/js/data/stories.js').matchAll(/code: '(wn-demo-[a-z0-9-]+)'/g)].map((m) => m[1]),
);
for (const f of ['assets/js/data/analytics.js', 'assets/js/data/people.js']) {
  for (const m of read(f).matchAll(/'(wn-demo-[a-z0-9-]+)'/g)) {
    if (storyCodes.has(m[1])) continue;
    const hasTitle = new RegExp(`'${m[1]}'[^\\n]*title:`).test(read(f));
    if (!hasTitle) problems.push(`${f}: nhắc tới truyện '${m[1]}' không tồn tại và không có title thay thế`);
  }
}

/* 4 ------------------------------------------- id trùng trong một SVG ---- */
for (const f of files) {
  const src = read(f);
  for (const m of src.matchAll(/<(linearGradient|radialGradient|filter|clipPath) id="([a-z-]+)"/g)) {
    if (!m[2].includes('${')) problems.push(`${f}: <${m[1]} id="${m[2]}"> là id cố định — hai SVG trên cùng trang sẽ dùng chung`);
  }
}

/* 5 ------------------------------------------- class CSS chưa định nghĩa -- */
/* Trình duyệt bỏ qua một class không tồn tại mà không kêu gì: khối rơi về `display:block`
   và mọi `gap` biến mất. Đối chiếu tên dùng trong markup với tên định nghĩa trong CSS. */
const cssSrc = ['assets/css/tokens.css', 'assets/css/wn.css', 'assets/css/app.css']
  .map(read).join('\n');
const cssClasses = new Set([...cssSrc.matchAll(/\.(wnd?-[A-Za-z0-9_-]+)/g)].map((m) => m[1]));

for (const f of [...files, 'index.html']) {
  for (const m of read(f).matchAll(/class="([^"`]*)"/g)) {
    for (const name of m[1].split(/\s+/)) {
      /* Tên dựng bằng nội suy (`wn-badge--${tone}`) chỉ kiểm được lúc chạy — bỏ qua ở đây. */
      if (!/^wnd?-/.test(name) || name.includes('$')) continue;
      if (!cssClasses.has(name)) problems.push(`${f}: dùng class .${name} nhưng CSS chưa định nghĩa`);
    }
  }
}

/* -------------------------------------------------------------- kết quả -- */
console.log(`icon đã định nghĩa: ${defined.size}`);
console.log(`màn đã đăng ký    : ${screenIds.size}`);
console.log(`Screen ID         : ${sids.size}`);
console.log(`class CSS         : ${cssClasses.size}`);
if (problems.length) {
  console.log(`\n${problems.length} vấn đề:`);
  problems.forEach((p) => console.log('  ✗ ' + p));
  process.exit(1);
}
console.log('\nĐạt — không có vấn đề nào.');
