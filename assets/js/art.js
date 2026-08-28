/**
 * Bộ dựng tranh minh hoạ bằng SVG.
 *
 * Vì sao không dùng ảnh chụp: bộ minh hoạ thật của sản phẩm nặng 8 MB cho 36 tệp, không đổi
 * theo sáng/tối, và demo cần hàng trăm khung hình khác nhau. Ở đây mỗi bức là ~2–4 KB chuỗi,
 * sắc nét ở mọi độ phân giải, và tự đổi bảng màu theo giao diện.
 *
 * Sáu thứ làm cho một bức đọc ra là TRANH chứ không phải sơ đồ — bản trước thiếu cả sáu:
 *
 *   1. Nguồn sáng có thật     mặt trời/trăng đặt ở một chỗ, và MỌI vật đổ bóng cùng hướng
 *   2. Rim light              viền sáng mỏng ở cạnh hướng về nguồn sáng
 *   3. Bóng tiếp đất          vệt tối nhoè dưới chân mỗi vật — thiếu nó là vật lơ lửng
 *   4. Chiều sâu khí quyển    lớp càng xa càng ngả về màu trời và càng nhoè
 *   5. Kết cấu                hạt nhiễu rất nhẹ phá mảng màu phẳng
 *   6. Hình hài nhân vật      đầu, tóc, mặt, thân có mặt sáng mặt tối, tay, chân, giày
 *
 * Màu vẫn chỉ lấy từ token thể loại và ramp thương hiệu — không tự chế màu mới. Biến thể đến
 * từ bố cục, thời điểm trong ngày và ánh sáng, không đến từ hue tuỳ tiện.
 *
 * Khung vẽ luôn 9:16 (đúng quy định ảnh của sản phẩm) và cắt bằng `slice`. Bố cục đặt điểm nhìn
 * quanh y≈330 nên cùng một bức dùng được cho bìa dọc 9:16, thẻ 3:4 và banner 16:9 mà chủ thể
 * không bao giờ bị cắt mất.
 */

import { GENRE, BRAND, mix, activeMode } from 'wnd/tokens.js';

const W = 360;
const H = 640;
const HORIZON = 368;
const STAND = 452;

/* --------------------------------------------------------------- tiện ích */

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let s = hash(String(seed)) || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const n = (v) => Math.round(v * 10) / 10;

/* ------------------------------------------------------ ánh xạ danh mục */

const TINT_BY_CATEGORY = {
  adventure: GENRE.adventure, nature: GENRE.adventure, science: GENRE.adventure,
  puzzle_mystery: GENRE.puzzle, creativity: GENRE.puzzle, nonfiction: GENRE.puzzle,
  horror: GENRE.horror,
  fantasy: GENRE.mystery, history_culture: GENRE.mystery, bedtime: GENRE.mystery,
};

export function tintFor(categoryCode, mode = activeMode()) {
  return TINT_BY_CATEGORY[categoryCode]
    || (mode === 'dark' ? BRAND.accent400 : BRAND.accent600);
}

export function choiceStyleFor(categoryCode) {
  if (categoryCode === 'horror') return 'light_horror';
  const t = TINT_BY_CATEGORY[categoryCode];
  if (t === GENRE.adventure) return 'adventure';
  if (t === GENRE.puzzle) return 'puzzle';
  if (t === GENRE.mystery) return 'mystery';
  return 'default';
}

/* ------------------------------------------------------------ bảng màu */

const HAIR = ['#1F1A17', '#2E211B', '#3B2A20', '#151317'];
const CLOTH_HUES = ['#E4572E', '#2C7DA0', '#57886C', '#B5651D', '#7A4E9E', '#C9A227'];

function palette(tint, time, mode, r) {
  const dark = mode === 'dark';
  const ink = dark ? '#080C11' : '#101823';
  const paper = dark ? '#111821' : '#FFFFFF';

  /* Trời ba chặng màu: đỉnh lạnh, giữa chuyển, chân trời ấm — mắt đọc ra chiều sâu ngay. */
  const sky = {
    day: {
      top: mix(tint, dark ? ink : '#EAF4FF', dark ? 0.62 : 0.80),
      mid: mix(tint, dark ? ink : '#F4FAFF', dark ? 0.48 : 0.66),
      low: mix(tint, dark ? '#5A6B7E' : '#FFF6E4', dark ? 0.42 : 0.58),
      sun: dark ? '#DDE9F5' : '#FFF1C9', sunX: 272, sunY: 116, sunR: 30, warmth: 0.30,
    },
    dusk: {
      top: mix(tint, ink, dark ? 0.70 : 0.46),
      mid: mix(tint, '#C0619B', dark ? 0.52 : 0.40),
      low: mix(tint, '#FFB067', dark ? 0.46 : 0.62),
      sun: '#FFD79A', sunX: 92, sunY: 292, sunR: 26, warmth: 0.62,
    },
    night: {
      top: mix(tint, ink, 0.88),
      mid: mix(tint, ink, 0.76),
      low: mix(tint, ink, 0.60),
      sun: dark ? '#E6EEF8' : '#F1F6FC', sunX: 282, sunY: 104, sunR: 20, warmth: 0.12,
    },
  }[time] || {};

  const base = mix(tint, ink, dark ? 0.58 : 0.36);
  /* Chiều sâu khí quyển: lớp càng xa càng ngả về màu chân trời. */
  const far = mix(base, sky.low, 0.60);
  const midL = mix(base, sky.low, 0.34);
  const near = mix(base, ink, 0.16);
  const fore = mix(base, ink, 0.44);

  return {
    ink, paper, tint, time, dark,
    skyTop: sky.top, skyMid: sky.mid, skyLow: sky.low,
    sun: sky.sun, sunX: sky.sunX, sunY: sky.sunY, sunR: sky.sunR, warmth: sky.warmth,
    far, mid: midL, near, fore,
    ground: mix(base, ink, 0.30),
    groundLit: mix(base, sky.low, 0.28),
    groundDark: mix(base, ink, 0.56),
    wall: mix(tint, paper, dark ? 0.80 : 0.90),
    wallShade: mix(tint, ink, dark ? 0.66 : 0.28),
    floor: mix(tint, ink, dark ? 0.70 : 0.44),
    floorLit: mix(tint, sky.low, dark ? 0.52 : 0.30),
    wood: mix('#8A5A34', ink, dark ? 0.46 : 0.10),
    woodDark: mix('#8A5A34', ink, dark ? 0.66 : 0.36),
    warm: mix(sky.sun, '#FF9E3D', 0.35),
    glass: mix(sky.mid, paper, 0.30),
    skin: dark ? '#D9AE8A' : '#F0C9A4',
    skinShade: dark ? '#B98B69' : '#D9A97F',
    hair: HAIR[Math.floor((r ? r() : 0.3) * HAIR.length)],
    cloth: CLOTH_HUES[Math.floor((r ? r() : 0.5) * CLOTH_HUES.length)],
    rim: mix(sky.sun, paper, 0.35),
  };
}

/* ---------------------------------------------------------------- defs */

function defs(p, id, hero) {
  return `<defs>
    <linearGradient id="sky-${id}" x1="0" y1="0" x2="0.14" y2="1">
      <stop offset="0" stop-color="${p.skyTop}"/>
      <stop offset="0.56" stop-color="${p.skyMid}"/>
      <stop offset="1" stop-color="${p.skyLow}"/>
    </linearGradient>
    <radialGradient id="glow-${id}" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${p.sun}" stop-opacity="${p.time === 'night' ? 0.5 : 0.85}"/>
      <stop offset="0.45" stop-color="${p.sun}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${p.sun}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ground-${id}" x1="0" y1="0" x2="0.1" y2="1">
      <stop offset="0" stop-color="${p.groundLit}"/>
      <stop offset="1" stop-color="${p.groundDark}"/>
    </linearGradient>
    <linearGradient id="floor-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.floorLit}"/>
      <stop offset="1" stop-color="${p.floor}"/>
    </linearGradient>
    <linearGradient id="spill-${id}" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="${p.sun}" stop-opacity="0.34"/>
      <stop offset="1" stop-color="${p.sun}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="vig-${id}" cx="0.5" cy="0.4" r="0.76">
      <stop offset="0.52" stop-color="${p.ink}" stop-opacity="0"/>
      <stop offset="1" stop-color="${p.ink}" stop-opacity="${p.dark ? 0.52 : 0.26}"/>
    </radialGradient>
    <filter id="far-${id}" x="-8%" y="-8%" width="116%" height="116%">
      <feGaussianBlur stdDeviation="1.5"/></filter>
    <filter id="soft-${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5"/></filter>
    <filter id="shade-${id}" x="-40%" y="-60%" width="180%" height="240%">
      <feGaussianBlur stdDeviation="3.2"/></filter>${hero ? `
    <filter id="bokeh-${id}" x="-12%" y="-12%" width="124%" height="124%">
      <feGaussianBlur stdDeviation="7"/></filter>
    <filter id="grain-${id}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" result="t"/>
      <feColorMatrix in="t" type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="${p.dark ? 0.20 : 0.13}"/></feComponentTransfer>
    </filter>` : ''}
  </defs>`;
}

/* --------------------------------------------------------- mảnh dựng hình */

function skyPlate(p, id) {
  const isNight = p.time === 'night';
  let stars = '';
  if (isNight) {
    const r = rng('stars' + id);
    for (let i = 0; i < 34; i += 1) {
      const x = r() * W;
      const y = r() * 300;
      stars += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(0.6 + r() * 1.1)}"
        fill="${p.sun}" opacity="${n(0.25 + r() * 0.55)}"/>`;
    }
  }
  return `<rect width="${W}" height="${H}" fill="url(#sky-${id})"/>
    ${stars}
    <circle cx="${p.sunX}" cy="${p.sunY}" r="${p.sunR * 3.6}" fill="url(#glow-${id})"/>
    <circle cx="${p.sunX}" cy="${p.sunY}" r="${p.sunR}" fill="${p.sun}"
      opacity="${isNight ? 0.92 : 0.96}"/>
    ${isNight ? `<circle cx="${p.sunX + p.sunR * 0.42}" cy="${p.sunY - p.sunR * 0.3}"
      r="${p.sunR * 0.9}" fill="${p.skyTop}" opacity="0.9"/>` : ''}`;
}

function clouds(p, id, r) {
  if (p.time === 'night') return '';
  let out = `<g filter="url(#soft-${id})" opacity="${p.time === 'dusk' ? 0.5 : 0.62}">`;
  for (let i = 0; i < 3; i += 1) {
    const x = 30 + r() * 300;
    const y = 60 + r() * 170;
    const s = 0.7 + r() * 0.9;
    const c = mix(p.paper, p.skyLow, p.time === 'dusk' ? 0.4 : 0.12);
    out += `<g transform="translate(${n(x)} ${n(y)}) scale(${n(s)})" fill="${c}">
      <ellipse cx="0" cy="0" rx="38" ry="13"/>
      <ellipse cx="-16" cy="-6" rx="20" ry="12"/>
      <ellipse cx="14" cy="-8" rx="24" ry="14"/>
    </g>`;
  }
  return out + '</g>';
}

function birds(p, r) {
  if (p.time === 'night') return '';
  let out = `<g stroke="${mix(p.ink, p.skyMid, 0.35)}" stroke-width="1.4" fill="none"
    stroke-linecap="round" opacity="0.55">`;
  for (let i = 0; i < 3; i += 1) {
    const x = 40 + r() * 240;
    const y = 90 + r() * 90;
    const s = 0.7 + r() * 0.6;
    out += `<path d="M${n(x)} ${n(y)} q${n(4 * s)} ${n(-3.4 * s)} ${n(8 * s)} 0
      q${n(4 * s)} ${n(-3.4 * s)} ${n(8 * s)} 0"/>`;
  }
  return out + '</g>';
}

function ridge(y, amp, color, r, seedShift) {
  const pts = [];
  for (let x = -24; x <= W + 24; x += 36) {
    pts.push(`${x},${n(y + Math.sin((x + seedShift) / 62) * amp + Math.sin(x / 23) * amp * 0.3)}`);
  }
  return `<path d="M-24,${H} L${pts.join(' L')} L${W + 24},${H} Z" fill="${color}"/>`;
}

/** Cây: thân + ba tán chồng nhau, tán dưới tối hơn — đủ để đọc ra khối. */
function tree(x, groundY, h, color, p) {
  const w = h * 0.56;
  const dark = mix(color, p.ink, 0.3);
  const lit = mix(color, p.sun, 0.22);
  return `<g>
    <ellipse cx="${n(x)}" cy="${n(groundY + 1)}" rx="${n(w * 0.42)}" ry="${n(h * 0.035)}"
      fill="${p.ink}" opacity="0.26" filter="url(#shade-${p._id})"/>
    <path d="M${n(x - h * 0.035)} ${n(groundY)} L${n(x - h * 0.022)} ${n(groundY - h * 0.42)}
      l${n(h * 0.044)} 0 L${n(x + h * 0.035)} ${n(groundY)} Z" fill="${mix(p.wood, p.ink, 0.2)}"/>
    <ellipse cx="${n(x)}" cy="${n(groundY - h * 0.52)}" rx="${n(w * 0.52)}" ry="${n(h * 0.22)}" fill="${dark}"/>
    <ellipse cx="${n(x - w * 0.18)}" cy="${n(groundY - h * 0.66)}" rx="${n(w * 0.40)}" ry="${n(h * 0.20)}" fill="${color}"/>
    <ellipse cx="${n(x + w * 0.16)}" cy="${n(groundY - h * 0.76)}" rx="${n(w * 0.34)}" ry="${n(h * 0.18)}" fill="${lit}"/>
  </g>`;
}

function grassTufts(p, y, count, r) {
  let out = `<g stroke="${mix(p.groundDark, p.sun, 0.18)}" stroke-width="1.5"
    stroke-linecap="round" opacity="0.5" fill="none">`;
  for (let i = 0; i < count; i += 1) {
    const x = r() * W;
    const yy = y + r() * (H - y) * 0.7;
    const hgt = 4 + r() * 7;
    out += `<path d="M${n(x)} ${n(yy)} q${n(-2)} ${n(-hgt * 0.7)} ${n(-1)} ${n(-hgt)}"/>
      <path d="M${n(x + 3)} ${n(yy)} q${n(2)} ${n(-hgt * 0.6)} ${n(3)} ${n(-hgt * 0.85)}"/>`;
  }
  return out + '</g>';
}

/** Nhà: khối tường + mái + cửa + cửa sổ sáng đèn, có mặt tối và bóng tiếp đất. */
function house(x, groundY, w, h, p, lit) {
  const roofH = h * 0.42;
  const wall = mix(p.mid, p.paper, 0.24);
  const shade = mix(wall, p.ink, 0.30);
  const roof = mix(p.near, p.ink, 0.10);
  const win = lit ? p.warm : mix(p.glass, p.ink, 0.25);
  return `<g>
    <ellipse cx="${n(x + w / 2)}" cy="${n(groundY + 2)}" rx="${n(w * 0.62)}" ry="${n(h * 0.05)}"
      fill="${p.ink}" opacity="0.3" filter="url(#shade-${p._id})"/>
    <rect x="${n(x)}" y="${n(groundY - h)}" width="${n(w)}" height="${n(h)}" fill="${wall}"/>
    <rect x="${n(x + w * 0.62)}" y="${n(groundY - h)}" width="${n(w * 0.38)}" height="${n(h)}" fill="${shade}"/>
    <path d="M${n(x - w * 0.09)} ${n(groundY - h)} L${n(x + w / 2)} ${n(groundY - h - roofH)}
      L${n(x + w * 1.09)} ${n(groundY - h)} Z" fill="${roof}"/>
    <path d="M${n(x + w / 2)} ${n(groundY - h - roofH)} L${n(x + w * 1.09)} ${n(groundY - h)}
      L${n(x + w * 0.72)} ${n(groundY - h)} Z" fill="${mix(roof, p.ink, 0.24)}"/>
    <rect x="${n(x + w * 0.40)}" y="${n(groundY - h * 0.56)}" width="${n(w * 0.22)}"
      height="${n(h * 0.56)}" rx="2" fill="${mix(p.woodDark, p.ink, 0.1)}"/>
    <rect x="${n(x + w * 0.10)}" y="${n(groundY - h * 0.78)}" width="${n(w * 0.20)}"
      height="${n(h * 0.24)}" rx="2" fill="${win}" opacity="${lit ? 0.95 : 0.7}"/>
    <rect x="${n(x + w * 0.72)}" y="${n(groundY - h * 0.78)}" width="${n(w * 0.18)}"
      height="${n(h * 0.24)}" rx="2" fill="${win}" opacity="${lit ? 0.7 : 0.5}"/>
    ${lit ? `<path d="M${n(x + w * 0.10)} ${n(groundY - h * 0.54)} l${n(w * 0.20)} 0
      l${n(w * 0.34)} ${n(h * 0.54)} l${n(-w * 0.62)} 0 Z" fill="url(#spill-${p._id})"/>` : ''}
  </g>`;
}

function buildingRow(p, id, x0, count, baseY, r, colour) {
  let out = '';
  let x = x0;
  for (let i = 0; i < count; i += 1) {
    const w = 46 + r() * 44;
    const h = 90 + r() * 130;
    const body = colour || (i % 2 ? p.mid : p.far);
    out += `<rect x="${n(x)}" y="${n(baseY - h)}" width="${n(w)}" height="${n(h)}" rx="3" fill="${body}"/>
      <rect x="${n(x + w * 0.66)}" y="${n(baseY - h)}" width="${n(w * 0.34)}" height="${n(h)}"
        fill="${mix(body, p.ink, 0.26)}"/>`;
    const cols = Math.max(1, Math.floor(w / 18));
    const rows = Math.max(1, Math.floor(h / 26));
    for (let c = 0; c < cols; c += 1) {
      for (let k = 0; k < rows; k += 1) {
        if (r() > 0.52) continue;
        out += `<rect x="${n(x + 7 + c * 18)}" y="${n(baseY - h + 12 + k * 26)}" width="8" height="11"
          rx="1.5" fill="${p.warm}" opacity="${n(0.45 + r() * 0.5)}"/>`;
      }
    }
    x += w + 6 + r() * 10;
  }
  return out;
}

/**
 * Nhân vật. Đầu có tóc và mặt, thân có mặt sáng mặt tối, có tay, chân, giày,
 * viền sáng phía nguồn sáng, và bóng tiếp đất — thiếu bóng là nhân vật lơ lửng.
 */
function figure(x, y, h, p, o = {}) {
  const litFromLeft = p.sunX < W / 2;
  const cloth = o.cloth || p.cloth;
  const clothLit = mix(cloth, p.sun, 0.20);
  const clothShade = mix(cloth, p.ink, 0.34);
  const hair = o.hair || p.hair;
  const r = h * 0.112;
  const headY = y - h * 0.855;
  const shoulderY = y - h * 0.685;
  const hipY = y - h * 0.375;
  const bw = h * 0.155;
  const dir = litFromLeft ? -1 : 1;

  const arm = (side) => {
    const sx = x + side * bw * 0.92;
    const raised = o.pose === 'reach' && side === (o.reachSide || -1);
    const ex = sx + side * h * (raised ? 0.14 : 0.07);
    const ey = raised ? shoulderY - h * 0.16 : hipY + h * 0.035;
    const mx = sx + side * h * (raised ? 0.13 : 0.055);
    const my = raised ? shoulderY - h * 0.03 : (shoulderY + ey) / 2;
    return `<path d="M${n(sx)} ${n(shoulderY + h * 0.02)} Q${n(mx)} ${n(my)} ${n(ex)} ${n(ey)}"
        stroke="${side === dir ? clothLit : clothShade}" stroke-width="${n(h * 0.072)}"
        stroke-linecap="round" fill="none"/>
      <circle cx="${n(ex)}" cy="${n(ey)}" r="${n(h * 0.032)}" fill="${p.skin}"/>`;
  };

  const leg = (side) => {
    const hx = x + side * bw * 0.42;
    const fx = x + side * bw * 0.52;
    return `<path d="M${n(hx)} ${n(hipY - h * 0.02)} L${n(fx)} ${n(y - h * 0.03)}"
        stroke="${mix(cloth, p.ink, side === dir ? 0.48 : 0.62)}" stroke-width="${n(h * 0.078)}"
        stroke-linecap="round" fill="none"/>
      <ellipse cx="${n(fx + side * h * 0.012)}" cy="${n(y - h * 0.012)}" rx="${n(h * 0.052)}"
        ry="${n(h * 0.024)}" fill="${mix(p.ink, cloth, 0.2)}"/>`;
  };

  return `<g>
    <ellipse cx="${n(x - dir * h * 0.05)}" cy="${n(y + h * 0.012)}" rx="${n(h * 0.20)}"
      ry="${n(h * 0.042)}" fill="${p.ink}" opacity="0.34" filter="url(#shade-${p._id})"/>
    ${leg(-1)}${leg(1)}
    ${arm(litFromLeft ? 1 : -1)}
    <path d="M${n(x - bw)} ${n(hipY)}
      C${n(x - bw * 1.02)} ${n(shoulderY + h * 0.06)} ${n(x - bw * 0.86)} ${n(shoulderY)} ${n(x - bw * 0.72)} ${n(shoulderY - h * 0.012)}
      L${n(x + bw * 0.72)} ${n(shoulderY - h * 0.012)}
      C${n(x + bw * 0.86)} ${n(shoulderY)} ${n(x + bw * 1.02)} ${n(shoulderY + h * 0.06)} ${n(x + bw)} ${n(hipY)}
      Q${n(x)} ${n(hipY + h * 0.045)} ${n(x - bw)} ${n(hipY)} Z" fill="${clothLit}"/>
    <path d="M${n(x + bw * 0.1)} ${n(shoulderY - h * 0.008)}
      L${n(x + bw * 0.72)} ${n(shoulderY - h * 0.012)}
      C${n(x + bw * 0.86)} ${n(shoulderY)} ${n(x + bw * 1.02)} ${n(shoulderY + h * 0.06)} ${n(x + bw)} ${n(hipY)}
      Q${n(x + bw * 0.5)} ${n(hipY + h * 0.03)} ${n(x + bw * 0.1)} ${n(hipY + h * 0.012)} Z"
      fill="${clothShade}" opacity="${litFromLeft ? 0.95 : 0.25}"/>
    <path d="M${n(x - bw * 0.1)} ${n(shoulderY - h * 0.008)}
      L${n(x - bw * 0.72)} ${n(shoulderY - h * 0.012)}
      C${n(x - bw * 0.86)} ${n(shoulderY)} ${n(x - bw * 1.02)} ${n(shoulderY + h * 0.06)} ${n(x - bw)} ${n(hipY)}
      Q${n(x - bw * 0.5)} ${n(hipY + h * 0.03)} ${n(x - bw * 0.1)} ${n(hipY + h * 0.012)} Z"
      fill="${clothShade}" opacity="${litFromLeft ? 0.25 : 0.95}"/>
    ${arm(litFromLeft ? -1 : 1)}
    <rect x="${n(x - h * 0.028)}" y="${n(headY + r * 0.72)}" width="${n(h * 0.056)}"
      height="${n(h * 0.05)}" fill="${p.skinShade}"/>
    <circle cx="${n(x)}" cy="${n(headY)}" r="${n(r)}" fill="${p.skin}"/>
    <path d="M${n(x - r)} ${n(headY + r * 0.14)} a${n(r)} ${n(r)} 0 0 1 ${n(r * 2)} 0
      q${n(-r * 0.3)} ${n(-r * 0.42)} ${n(-r)} ${n(-r * 0.36)}
      q${n(-r * 0.7)} ${n(-r * 0.06)} ${n(-r)} ${n(r * 0.36)} Z" fill="${hair}"/>
    <path d="M${n(x + dir * r * 0.86)} ${n(headY - r * 0.34)}
      a${n(r)} ${n(r)} 0 0 ${dir > 0 ? 1 : 0} ${n(-dir * r * 0.1)} ${n(r * 1.5)}"
      stroke="${p.rim}" stroke-width="${n(r * 0.18)}" fill="none" opacity="0.55" stroke-linecap="round"/>
    <circle cx="${n(x - r * 0.36)}" cy="${n(headY + r * 0.06)}" r="${n(r * 0.115)}" fill="${p.ink}"/>
    <circle cx="${n(x + r * 0.36)}" cy="${n(headY + r * 0.06)}" r="${n(r * 0.115)}" fill="${p.ink}"/>
    <path d="M${n(x - r * 0.26)} ${n(headY + r * 0.42)} q${n(r * 0.26)} ${n(r * 0.24)} ${n(r * 0.52)} 0"
      stroke="${mix(p.ink, p.skin, 0.25)}" stroke-width="${n(r * 0.1)}" fill="none" stroke-linecap="round"/>
    <ellipse cx="${n(x - r * 0.6)}" cy="${n(headY + r * 0.32)}" rx="${n(r * 0.18)}" ry="${n(r * 0.11)}"
      fill="#E88A7D" opacity="0.35"/>
    <ellipse cx="${n(x + r * 0.6)}" cy="${n(headY + r * 0.32)}" rx="${n(r * 0.18)}" ry="${n(r * 0.11)}"
      fill="#E88A7D" opacity="0.35"/>
  </g>`;
}

/** Nội thất: tường + phào + sàn phối cảnh + cửa sổ hắt sáng. */
function interior(p, id, o = {}) {
  const wallBottom = o.wallBottom || 348;
  const skirt = 10;
  let boards = '';
  for (let i = 1; i < 9; i += 1) {
    const t = i / 9;
    const y = wallBottom + (H - wallBottom) * t * t;
    boards += `<path d="M0 ${n(y)} H${W}" stroke="${mix(p.floor, p.ink, 0.3)}"
      stroke-width="${n(0.6 + t * 1.4)}" opacity="0.4"/>`;
  }
  const win = o.window !== false;
  return `<rect x="0" y="0" width="${W}" height="${n(wallBottom)}" fill="${p.wall}"/>
    <rect x="0" y="0" width="${W}" height="${n(wallBottom)}" fill="${p.wallShade}" opacity="0.16"/>
    <rect x="0" y="${n(wallBottom - skirt)}" width="${W}" height="${skirt}" fill="${mix(p.wall, p.ink, 0.24)}"/>
    <rect x="0" y="${n(wallBottom)}" width="${W}" height="${n(H - wallBottom)}" fill="url(#floor-${id})"/>
    ${boards}
    ${win ? `<g>
      <rect x="${o.winX || 40}" y="72" width="150" height="158" rx="6"
        fill="${p.glass}" stroke="${mix(p.wall, p.ink, 0.34)}" stroke-width="7"/>
      <path d="M${(o.winX || 40) + 75} 72 V230 M${o.winX || 40} 151 H${(o.winX || 40) + 150}"
        stroke="${mix(p.wall, p.ink, 0.34)}" stroke-width="6"/>
      <rect x="${o.winX || 40}" y="72" width="150" height="158" rx="6" fill="url(#glow-${id})" opacity="0.5"/>
      <path d="M${(o.winX || 40)} 230 h150 l86 ${n(H - 230)} h-322 Z"
        fill="url(#spill-${id})" opacity="0.6"/>
    </g>` : ''}`;
}

function table(x, y, w, h, p) {
  return `<g>
    <ellipse cx="${n(x + w / 2)}" cy="${n(y + h + 3)}" rx="${n(w * 0.52)}" ry="7"
      fill="${p.ink}" opacity="0.28" filter="url(#shade-${p._id})"/>
    <rect x="${n(x + 10)}" y="${n(y + 10)}" width="8" height="${n(h)}" fill="${p.woodDark}"/>
    <rect x="${n(x + w - 18)}" y="${n(y + 10)}" width="8" height="${n(h)}" fill="${p.woodDark}"/>
    <rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="12" rx="4" fill="${p.wood}"/>
    <rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="4" rx="2"
      fill="${mix(p.wood, p.sun, 0.3)}" opacity="0.7"/>
  </g>`;
}

/* ------------------------------------------------------------- mô típ */

const MOTIFS = {
  /* Bếp: bàn, bình hoa còn nguyên, ánh sáng cửa sổ hắt qua sàn */
  kitchen(p, id, r) {
    return `${interior(p, id, { wallBottom: 344, winX: 34 })}
      <rect x="212" y="196" width="128" height="10" rx="3" fill="${mix(p.wood, p.ink, 0.2)}"/>
      <g>${[0, 1, 2].map((i) => `<rect x="${222 + i * 34}" y="${168}" width="22" height="28" rx="3"
        fill="${mix(p.tint, p.paper, 0.55)}"/>`).join('')}</g>
      ${table(184, 396, 150, 56, p)}
      <g>
        <ellipse cx="258" cy="394" rx="26" ry="7" fill="${p.ink}" opacity="0.22"/>
        <path d="M242 394 q3 -46 16 -46 q13 0 16 46 z" fill="${mix(p.warm, p.paper, 0.2)}"/>
        <path d="M250 394 q1 -44 8 -44 q3 0 5 12 q-8 12 -6 32 z" fill="${p.paper}" opacity="0.35"/>
        <path d="M244 358 q14 -8 28 0" stroke="${mix(p.warm, p.ink, 0.35)}" stroke-width="3" fill="none"/>
        <g stroke="${mix('#4E7A3E', p.ink, 0.2)}" stroke-width="2.4" fill="none" stroke-linecap="round">
          <path d="M256 350 q-6 -22 -14 -30"/><path d="M260 350 q2 -26 10 -32"/><path d="M258 350 q0 -18 -2 -26"/>
        </g>
        <circle cx="240" cy="318" r="7" fill="#E4638A"/><circle cx="270" cy="316" r="6.5" fill="#F0A03C"/>
        <circle cx="256" cy="322" r="5.5" fill="#E8D14F"/>
      </g>
      ${figure(104, STAND, 176, p, { pose: 'reach', reachSide: 1 })}`;
  },

  /* Cùng căn bếp, nhưng bình đã vỡ — dùng cho đúng cảnh mở đầu của truyện */
  broken(p, id, r) {
    return `${interior(p, id, { wallBottom: 344, winX: 34 })}
      ${table(184, 396, 150, 56, p)}
      <ellipse cx="258" cy="392" rx="22" ry="6" fill="${p.ink}" opacity="0.14"/>
      <g>
        <ellipse cx="250" cy="502" rx="74" ry="14" fill="${p.ink}" opacity="0.22" filter="url(#shade-${id})"/>
        <path d="M198 500 l14 -34 l13 8 l-5 26 z" fill="${mix(p.warm, p.paper, 0.24)}"/>
        <path d="M196 500 l16 -32 l4 3 l-9 29 z" fill="${mix(p.warm, p.ink, 0.22)}" opacity="0.55"/>
        <path d="M232 500 l7 -25 l15 12 l-3 13 z" fill="${mix(p.warm, p.paper, 0.38)}"/>
        <path d="M268 500 l19 -18 l8 18 z" fill="${mix(p.warm, p.paper, 0.12)}"/>
        <path d="M182 500 h124" stroke="${mix(p.warm, p.ink, 0.42)}" stroke-width="2.4"
          stroke-linecap="round" opacity="0.5"/>
        <g stroke="${mix('#4E7A3E', p.ink, 0.24)}" stroke-width="2.4" fill="none" stroke-linecap="round">
          <path d="M226 498 q-18 -8 -30 4"/><path d="M280 498 q16 -6 26 6"/>
        </g>
        <circle cx="188" cy="504" r="6" fill="#E4638A"/>
        <circle cx="306" cy="506" r="5.5" fill="#F0A03C"/>
        <circle cx="252" cy="508" r="4.5" fill="#E8D14F"/>
      </g>
      ${figure(96, STAND, 176, p, { pose: 'still' })}`;
  },

  /* Cổng trường lúc tan học */
  schoolgate(p, id, r) {
    return `${skyPlate(p, id)}${clouds(p, id, r)}${birds(p, r)}
      <g filter="url(#far-${id})">${ridge(HORIZON - 18, 12, p.far, r, 40)}</g>
      <g>${buildingRow(p, id, -14, 3, HORIZON + 6, r, p.mid)}</g>
      <rect x="0" y="${HORIZON + 4}" width="${W}" height="${H - HORIZON - 4}" fill="url(#ground-${id})"/>
      <path d="M0 ${HORIZON + 4} H${W} v10 H0 Z" fill="${p.groundDark}" opacity="0.35"/>
      <g>
        <rect x="86" y="${HORIZON - 96}" width="10" height="102" rx="3" fill="${p.near}"/>
        <rect x="264" y="${HORIZON - 96}" width="10" height="102" rx="3" fill="${p.near}"/>
        <rect x="82" y="${HORIZON - 108}" width="196" height="13" rx="5" fill="${mix(p.near, p.ink, 0.18)}"/>
        <text x="180" y="${HORIZON - 98}" text-anchor="middle" font-size="8" letter-spacing="1.6"
          font-family="system-ui, sans-serif" fill="${mix(p.paper, p.near, 0.2)}" opacity="0.8">TRƯỜNG</text>
        ${[0, 1, 2, 3, 4].map((i) => `<rect x="${112 + i * 30}" y="${HORIZON - 88}" width="5"
          height="92" rx="2" fill="${mix(p.near, p.ink, 0.1)}" opacity="0.9"/>`).join('')}
      </g>
      ${tree(30, HORIZON + 26, 132, p.mid, p)}
      ${tree(330, HORIZON + 34, 108, mix(p.mid, p.ink, 0.12), p)}
      ${grassTufts(p, HORIZON + 20, 16, r)}
      ${figure(148, STAND, 176, p, { pose: 'still' })}
      ${figure(232, STAND - 14, 138, p, { pose: 'reach', reachSide: -1, cloth: '#7A4E9E' })}`;
  },

  /* Sân chơi: cầu trượt, xích đu */
  playground(p, id, r) {
    return `${skyPlate(p, id)}${clouds(p, id, r)}${birds(p, r)}
      <g filter="url(#far-${id})">${ridge(HORIZON - 8, 16, p.far, r, 120)}</g>
      ${ridge(HORIZON + 22, 9, p.mid, r, 60)}
      <rect x="0" y="${HORIZON + 40}" width="${W}" height="${H - HORIZON - 40}" fill="url(#ground-${id})"/>
      <g>
        <ellipse cx="262" cy="${HORIZON + 44}" rx="56" ry="8" fill="${p.ink}" opacity="0.24" filter="url(#shade-${id})"/>
        <path d="M226 ${HORIZON + 42} L262 ${HORIZON - 66} L300 ${HORIZON + 42}"
          stroke="${p.near}" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M262 ${HORIZON - 66} L196 ${HORIZON + 42}" stroke="${mix(p.near, p.ink, 0.2)}"
          stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M262 ${HORIZON - 62} q-40 30 -62 104" stroke="${mix('#E4572E', p.ink, 0.12)}"
          stroke-width="11" fill="none" stroke-linecap="round"/>
        <g stroke="${mix(p.near, p.ink, 0.1)}" stroke-width="3.4">
          <path d="M232 ${HORIZON - 58} V${HORIZON - 6}"/><path d="M254 ${HORIZON - 58} V${HORIZON - 6}"/>
        </g>
        <rect x="226" y="${HORIZON - 8}" width="34" height="7" rx="3" fill="${p.warm}"/>
      </g>
      ${tree(48, HORIZON + 52, 152, p.mid, p)}
      ${tree(112, HORIZON + 40, 104, mix(p.mid, p.far, 0.4), p)}
      ${grassTufts(p, HORIZON + 46, 20, r)}
      ${figure(134, STAND + 8, 178, p, { pose: 'reach', reachSide: -1 })}`;
  },

  /* Phố lúc chiều muộn */
  street(p, id, r) {
    return `${skyPlate(p, id)}${clouds(p, id, r)}
      <g filter="url(#far-${id})">${buildingRow(p, id, -20, 4, HORIZON - 6, r, p.far)}</g>
      ${buildingRow(p, id, -10, 3, HORIZON + 10, r, p.mid)}
      <rect x="0" y="${HORIZON + 8}" width="${W}" height="${H - HORIZON - 8}" fill="url(#ground-${id})"/>
      <path d="M0 ${HORIZON + 8} H${W} v6 H0 Z" fill="${p.groundDark}" opacity="0.4"/>
      <path d="M-40 ${H} L150 ${HORIZON + 14} H210 L400 ${H} Z" fill="${mix(p.groundDark, p.ink, 0.18)}"/>
      ${[0, 1, 2, 3].map((i) => {
        const t = i / 4;
        const y = HORIZON + 30 + t * t * 260;
        const wq = 4 + t * 12;
        return `<rect x="${n(180 - wq / 2)}" y="${n(y)}" width="${n(wq)}" height="${n(6 + t * 16)}"
          rx="2" fill="${mix(p.paper, p.groundDark, 0.25)}" opacity="0.5"/>`;
      }).join('')}
      <g>
        <rect x="306" y="${HORIZON - 96}" width="6" height="104" fill="${p.near}"/>
        <path d="M309 ${HORIZON - 96} q0 -14 -16 -16" stroke="${p.near}" stroke-width="6" fill="none"/>
        <ellipse cx="291" cy="${HORIZON - 110}" rx="9" ry="6" fill="${p.warm}"/>
        <circle cx="291" cy="${HORIZON - 108}" r="34" fill="url(#glow-${id})" opacity="0.55"/>
      </g>
      ${figure(120, STAND + 16, 182, p, { pose: 'still' })}`;
  },

  /* Rừng: nhiều lớp cây, sương giữa các lớp */
  forest(p, id, r) {
    let far = '';
    let mid = '';
    let near = '';
    for (let i = 0; i < 7; i += 1) far += tree(10 + i * 56 + r() * 20, HORIZON + 6, 120 + r() * 60, p.far, p);
    for (let i = 0; i < 5; i += 1) mid += tree(-10 + i * 92 + r() * 26, HORIZON + 52, 180 + r() * 90, p.mid, p);
    for (let i = 0; i < 3; i += 1) near += tree(-20 + i * 168 + r() * 30, H - 30, 300 + r() * 110, p.fore, p);
    return `${skyPlate(p, id)}
      <g filter="url(#far-${id})" opacity="0.95">${ridge(HORIZON - 20, 14, p.far, r, 200)}${far}</g>
      <rect x="0" y="${HORIZON - 40}" width="${W}" height="120" fill="${p.skyLow}" opacity="0.30"/>
      ${mid}
      <rect x="0" y="${HORIZON + 46}" width="${W}" height="${H - HORIZON - 46}" fill="url(#ground-${id})"/>
      <path d="M120 ${H} q54 -110 46 -196 h34 q10 92 60 196 Z"
        fill="${mix(p.groundLit, p.paper, 0.12)}" opacity="0.45"/>
      ${grassTufts(p, HORIZON + 54, 26, r)}
      ${figure(176, STAND + 40, 186, p, { pose: 'still' })}
      <g opacity="0.85">${near}</g>`;
  },

  /* Lớp học nhìn từ cuối lớp */
  classroom(p, id, r) {
    let desks = '';
    for (let i = 0; i < 3; i += 1) {
      const t = i / 3;
      const y = 402 + i * 74;
      const inset = 26 - i * 12;
      const wq = W - inset * 2;
      desks += `<ellipse cx="${W / 2}" cy="${n(y + 34)}" rx="${n(wq * 0.5)}" ry="6"
          fill="${p.ink}" opacity="0.22" filter="url(#shade-${id})"/>
        <rect x="${n(inset)}" y="${n(y + 12)}" width="${n(wq)}" height="26" fill="${p.woodDark}" opacity="0.6"/>
        <rect x="${n(inset)}" y="${n(y)}" width="${n(wq)}" height="14" rx="4" fill="${p.wood}"/>
        <rect x="${n(inset)}" y="${n(y)}" width="${n(wq)}" height="4" rx="2"
          fill="${mix(p.wood, p.sun, 0.34)}" opacity="0.7"/>`;
    }
    return `${interior(p, id, { wallBottom: 336, winX: 22 })}
      <g>
        <rect x="212" y="88" width="132" height="98" rx="5" fill="${mix(p.tint, p.ink, 0.66)}"
          stroke="${mix(p.wood, p.ink, 0.2)}" stroke-width="7"/>
        <g stroke="${mix(p.paper, p.tint, 0.2)}" stroke-width="3.4" stroke-linecap="round" opacity="0.75">
          <path d="M228 120 H304"/><path d="M228 140 H322"/><path d="M228 160 H278"/>
        </g>
        <rect x="226" y="190" width="104" height="6" rx="3" fill="${mix(p.wood, p.ink, 0.28)}"/>
      </g>
      ${desks}
      ${figure(70, 424, 148, p, { pose: 'still', cloth: '#2C7DA0' })}`;
  },

  /* Phòng ngủ đêm, đèn ngủ ấm */
  bedroom(p, id, r) {
    return `${interior(p, id, { wallBottom: 356, window: false })}
      <g>
        <rect x="196" y="96" width="128" height="126" rx="6" fill="${p.glass}"
          stroke="${mix(p.wall, p.ink, 0.3)}" stroke-width="7"/>
        <path d="M260 96 V222 M196 159 H324" stroke="${mix(p.wall, p.ink, 0.3)}" stroke-width="6"/>
        <circle cx="292" cy="132" r="16" fill="${p.sun}" opacity="0.9"/>
        <circle cx="292" cy="132" r="46" fill="url(#glow-${id})"/>
        ${[[218, 118], [236, 186], [306, 196], [212, 200]].map(([cx, cy]) =>
          `<circle cx="${cx}" cy="${cy}" r="1.6" fill="${p.sun}" opacity="0.8"/>`).join('')}
      </g>
      <g>
        <ellipse cx="180" cy="${H - 46}" rx="150" ry="12" fill="${p.ink}" opacity="0.3" filter="url(#shade-${id})"/>
        <rect x="26" y="404" width="308" height="104" rx="12" fill="${mix(p.wood, p.ink, 0.2)}"/>
        <rect x="26" y="418" width="308" height="90" rx="10" fill="${mix(p.tint, p.paper, 0.42)}"/>
        <path d="M26 448 h308 v60 a10 10 0 0 1 -10 10 H36 a10 10 0 0 1 -10 -10 Z"
          fill="${mix('#4C7BA8', p.ink, p.dark ? 0.4 : 0.06)}"/>
        <path d="M26 448 h308 v10 H26 Z" fill="${p.paper}" opacity="0.5"/>
        <rect x="42" y="398" width="92" height="40" rx="14" fill="${p.paper}" opacity="0.92"/>
        <rect x="42" y="398" width="92" height="12" rx="6" fill="${p.sun}" opacity="0.25"/>
      </g>
      <g>
        <rect x="286" y="376" width="52" height="10" rx="4" fill="${p.woodDark}"/>
        <rect x="298" y="386" width="28" height="34" rx="3" fill="${p.wood}"/>
        <circle cx="312" cy="358" r="13" fill="${p.warm}"/>
        <circle cx="312" cy="358" r="44" fill="url(#glow-${id})" opacity="0.7"/>
      </g>`;
  },

  /* Thư viện / tủ sách */
  library(p, id, r) {
    let shelves = '';
    for (let row = 0; row < 3; row += 1) {
      const y = 118 + row * 88;
      shelves += `<rect x="24" y="${y + 62}" width="${W - 48}" height="9" rx="3" fill="${p.woodDark}"/>
        <rect x="24" y="${y + 62}" width="${W - 48}" height="3" fill="${mix(p.wood, p.sun, 0.4)}" opacity="0.6"/>`;
      let x = 34;
      while (x < W - 46) {
        const bw = 11 + Math.round(r() * 13);
        const bh = 34 + Math.round(r() * 26);
        const tone = mix(p.tint, r() > 0.5 ? p.paper : p.warm, 0.2 + r() * 0.55);
        shelves += `<rect x="${n(x)}" y="${n(y + 62 - bh)}" width="${bw}" height="${bh}" rx="2" fill="${tone}"/>
          <rect x="${n(x)}" y="${n(y + 62 - bh)}" width="2.5" height="${bh}" fill="${mix(tone, p.ink, 0.3)}"/>
          <rect x="${n(x + 3)}" y="${n(y + 62 - bh + 6)}" width="${bw - 6}" height="3" rx="1.5"
            fill="${mix(tone, p.paper, 0.6)}" opacity="0.7"/>`;
        x += bw + 3;
      }
    }
    return `${interior(p, id, { wallBottom: 408, window: false })}
      <rect x="0" y="0" width="${W}" height="408" fill="${mix(p.wall, p.wood, 0.18)}"/>
      <rect x="14" y="96" width="${W - 28}" height="290" rx="6" fill="${mix(p.wood, p.ink, 0.46)}"/>
      ${shelves}
      <rect x="0" y="0" width="${W}" height="408" fill="url(#vig-${id})" opacity="0.5"/>
      ${table(18, 486, 168, 54, p)}
      <g>
        <rect x="52" y="470" width="46" height="12" rx="2" fill="${mix(p.tint, p.paper, 0.4)}"/>
        <rect x="58" y="462" width="38" height="10" rx="2" fill="${mix(p.warm, p.paper, 0.3)}"/>
      </g>
      ${figure(258, 536, 184, p, { pose: 'reach', reachSide: -1, cloth: '#57886C' })}`;
  },

  /* Sân nhà, hàng rào, cây */
  yard(p, id, r) {
    return `${skyPlate(p, id)}${clouds(p, id, r)}${birds(p, r)}
      <g filter="url(#far-${id})">${ridge(HORIZON - 12, 13, p.far, r, 300)}</g>
      ${house(96, HORIZON + 44, 156, 104, p, p.time !== 'day')}
      <rect x="0" y="${HORIZON + 42}" width="${W}" height="${H - HORIZON - 42}" fill="url(#ground-${id})"/>
      <g>
        ${Array.from({ length: 9 }, (_, i) => `<rect x="${n(-6 + i * 44)}" y="${HORIZON + 24}"
          width="9" height="42" rx="3" fill="${mix(p.paper, p.mid, 0.26)}"/>`).join('')}
        <rect x="-6" y="${HORIZON + 34}" width="${W + 12}" height="6" fill="${mix(p.paper, p.mid, 0.34)}"/>
      </g>
      ${tree(304, HORIZON + 78, 172, p.mid, p)}
      ${grassTufts(p, HORIZON + 50, 22, r)}
      ${figure(76, STAND + 24, 172, p, { pose: 'still', cloth: '#C9A227' })}`;
  },
};

export const MOTIF_NAMES = Object.keys(MOTIFS);

/**
 * @param {object} o
 * @param {string} o.motif  tên mô típ; mặc định chọn theo seed
 * @param {string} o.tint   màu hex lấy từ token (dùng `tintFor`)
 * @param {string} o.time   'day' | 'dusk' | 'night'
 * @param {string} o.seed   khoá cố định để bức tranh không đổi giữa các lần vẽ
 * @param {string} o.mode   'light' | 'dark'
 * @param {boolean} o.hero  bật hạt nhiễu và nhoè tiền cảnh — chỉ cho khung lớn, thẻ nhỏ thì tắt
 * @param {string} o.alt    mô tả cho screen reader
 */
export function artSvg(o = {}) {
  const mode = o.mode || activeMode();
  const seed = String(o.seed || o.motif || 'wn');
  const r = rng(seed);
  const motif = MOTIFS[o.motif] ? o.motif : MOTIF_NAMES[hash(seed) % MOTIF_NAMES.length];
  const time = o.time || ['day', 'dusk', 'night'][hash(seed + 'time') % 3];
  const id = 'a' + (hash(seed + motif + time + mode) % 1679616).toString(36);
  const hero = !!o.hero;
  const p = palette(o.tint || tintFor(null, mode), time, mode, r);
  p._id = id;

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img"
   aria-label="${o.alt ? esc(o.alt) : 'Tranh minh hoạ'}">
  ${defs(p, id, hero)}
  <rect width="${W}" height="${H}" fill="${p.skyMid}"/>
  ${MOTIFS[motif](p, id, r)}
  <rect width="${W}" height="${H}" fill="url(#vig-${id})"/>
  ${hero ? `<rect width="${W}" height="${H}" filter="url(#grain-${id})" opacity="0.55"/>` : ''}
</svg>`;
}

/** Ô ảnh trống của trình soạn — cố ý trông khác hẳn tranh thật để không ai nhầm là đã có ảnh. */
export function placeholderArt(label = 'Chưa có ảnh') {
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img"
    aria-label="${esc(label)}">
    <rect width="${W}" height="${H}" fill="var(--wn-border)"/>
    <g stroke="var(--wn-border-strong)" stroke-width="2" opacity="0.85" fill="none">
      <rect x="112" y="264" width="136" height="100" rx="10"/>
      <circle cx="148" cy="296" r="12"/>
      <path d="m118 350 44-40a10 10 0 0 1 14 0l66 54"/>
    </g>
    <text x="180" y="402" text-anchor="middle" fill="var(--wn-muted)"
      font-family="system-ui, sans-serif" font-size="17" font-weight="600">${esc(label)}</text>
  </svg>`;
}
