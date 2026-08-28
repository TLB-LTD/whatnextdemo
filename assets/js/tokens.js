/**
 * Bản JS của token — cho SVG và cho trang Hệ thiết kế tự tính tương phản.
 * Giá trị phải khớp assets/css/tokens.css. Đây là bản sao có chủ đích:
 * CSS var không đọc được từ trong chuỗi SVG sinh động.
 */

export const BRAND = {
  accent50: '#EFF7FE', accent100: '#DCEDFD', accent200: '#BBDCFB', accent300: '#8AC5F8',
  accent400: '#3D9CF5', accent500: '#2B8AE8', accent600: '#1B75C9', accent700: '#145C9E',
  accent800: '#134E85', accent900: '#13416E',
};

export const GENRE = {
  adventure: '#EA580C',
  mystery: '#7C3AED',
  horror: '#991B1B',
  puzzle: '#0D9488',
};

export const COLOR = {
  light: {
    bg: '#F0F4FA', surface: '#FFFFFF', surfaceRaised: '#FFFFFF',
    text: '#0F172A', textSecondary: '#475569', muted: '#5C6B7A',
    border: '#E2E8F0', borderStrong: '#7C8CA0',
    accent: '#1B75C9', accentHover: '#145C9E', onAccent: '#FFFFFF',
    brand: '#3D9CF5', focus: '#1B75C9',
    success: '#047857', warning: '#B45309', danger: '#B91C1C', info: '#1B75C9',
  },
  dark: {
    bg: '#0F1419', surface: '#1A222D', surfaceRaised: '#212B38',
    text: '#F1F5F9', textSecondary: '#CBD5E1', muted: '#94A3B8',
    border: '#334155', borderStrong: '#64748B',
    accent: '#3D9CF5', accentHover: '#8AC5F8', onAccent: '#0F1419',
    brand: '#3D9CF5', focus: '#3D9CF5',
    success: '#34D399', warning: '#FBBF24', danger: '#F87171', info: '#3D9CF5',
  },
};

export const SPACE = {
  '0.5': 2, 1: 4, '1.5': 6, 2: 8, '2.5': 10, 3: 12, 4: 16,
  '4.5': 18, 5: 20, '5.5': 22, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64,
};

export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };

export const TEXT = {
  display:     { size: 32, height: 1.2,  weight: 700, use: 'Tiêu đề lớn nhất' },
  headline:    { size: 24, height: 1.25, weight: 700, use: 'Tiêu đề mục' },
  title:       { size: 20, height: 1.3,  weight: 600, use: 'Tiêu đề card / màn' },
  readerBody:  { size: 18, height: 1.45, weight: 400, use: 'Nội dung truyện, mọi màn của trẻ' },
  body:        { size: 16, height: 1.5,  weight: 400, use: 'Mặc định' },
  bodyCompact: { size: 15, height: 1.45, weight: 400, use: 'Màn tác giả và phụ huynh' },
  label:       { size: 14, height: 1.4,  weight: 600, use: 'Nút, nhãn trường' },
  caption:     { size: 13, height: 1.4,  weight: 400, use: 'Phụ đề, mô tả' },
  micro:       { size: 12, height: 1.35, weight: 500, use: 'Ghi chú, badge' },
};

export const MOTION = {
  fast: 150, base: 250, scene: 400, toast: 1200,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export const DENSITY = {
  child:   { tapTarget: 48, bodyStyle: 'readerBody',  gutter: 20, label: 'Trẻ' },
  creator: { tapTarget: 44, bodyStyle: 'bodyCompact', gutter: 16, label: 'Tác giả' },
  parent:  { tapTarget: 44, bodyStyle: 'bodyCompact', gutter: 16, label: 'Phụ huynh' },
};

export const BREAKPOINT = {
  webTablet: 768, webDesktop: 1024, contentMax: 1200,
  appTabletShortestSide: 600, appWideWidth: 900,
};

/** 20 cặp tương phản là cổng CI của sản phẩm — trang Hệ thiết kế kiểm lại ngay trên trình duyệt. */
export const CONTRAST_PAIRS = [
  { name: 'Chữ trên nút chính (sáng)', fg: 'light.onAccent', bg: 'light.accent', min: 4.5 },
  { name: 'Chữ nhấn trên nền surface (sáng)', fg: 'light.accent', bg: 'light.surface', min: 4.5 },
  { name: 'Chữ nội dung (sáng)', fg: 'light.text', bg: 'light.bg', min: 4.5 },
  { name: 'Chữ phụ (sáng)', fg: 'light.textSecondary', bg: 'light.surface', min: 4.5 },
  { name: 'Chữ mờ (sáng)', fg: 'light.muted', bg: 'light.surface', min: 4.5 },
  { name: 'Viền control (sáng)', fg: 'light.borderStrong', bg: 'light.surface', min: 3.0 },
  { name: 'Vòng focus (sáng)', fg: 'light.focus', bg: 'light.bg', min: 3.0 },
  { name: 'Thành công (sáng)', fg: 'light.success', bg: 'light.surface', min: 4.5 },
  { name: 'Cảnh báo (sáng)', fg: 'light.warning', bg: 'light.surface', min: 4.5 },
  { name: 'Nguy hiểm (sáng)', fg: 'light.danger', bg: 'light.surface', min: 4.5 },
  { name: 'Chữ trên nút chính (tối)', fg: 'dark.onAccent', bg: 'dark.accent', min: 4.5 },
  { name: 'Chữ nhấn trên nền surface (tối)', fg: 'dark.accent', bg: 'dark.surface', min: 4.5 },
  { name: 'Chữ nội dung (tối)', fg: 'dark.text', bg: 'dark.bg', min: 4.5 },
  { name: 'Chữ phụ (tối)', fg: 'dark.textSecondary', bg: 'dark.surface', min: 4.5 },
  { name: 'Chữ mờ (tối)', fg: 'dark.muted', bg: 'dark.surface', min: 4.5 },
  { name: 'Viền control (tối)', fg: 'dark.borderStrong', bg: 'dark.surface', min: 3.0 },
  { name: 'Vòng focus (tối)', fg: 'dark.focus', bg: 'dark.bg', min: 3.0 },
  { name: 'Thành công (tối)', fg: 'dark.success', bg: 'dark.surface', min: 4.5 },
  { name: 'Cảnh báo (tối)', fg: 'dark.warning', bg: 'dark.surface', min: 4.5 },
  { name: 'Nguy hiểm (tối)', fg: 'dark.danger', bg: 'dark.surface', min: 4.5 },
];

export function resolveToken(path) {
  const [mode, key] = path.split('.');
  return COLOR[mode] && COLOR[mode][key];
}

function channel(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

export function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Tỉ lệ tương phản WCAG 2.x, làm tròn 2 chữ số. */
export function contrastRatio(fgHex, bgHex) {
  const a = relativeLuminance(fgHex);
  const b = relativeLuminance(bgHex);
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  return Math.round(ratio * 100) / 100;
}

/** Trộn hai màu hex theo tỉ lệ 0..1 — dùng để dựng gradient trong SVG. */
export function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const out = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('');
}

/** Chế độ màu đang thực sự hiển thị (đã giải quyết "theo hệ thống"). */
export function activeMode() {
  const t = document.documentElement.dataset.theme;
  if (t === 'light' || t === 'dark') return t;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
