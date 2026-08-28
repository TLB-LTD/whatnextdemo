/**
 * Sinh tranh minh hoạ bằng SVG.
 *
 * Vì sao không dùng ảnh: bộ minh hoạ thật của sản phẩm nặng 8 MB cho 36 file, không đổi theo
 * sáng/tối, và demo thì cần hàng trăm khung hình. Ở đây mỗi khung là ~1 KB chuỗi, sắc nét ở mọi
 * độ phân giải, và tự đổi bảng màu theo theme.
 *
 * Màu lấy từ token thể loại (adventure / mystery / horror / puzzle) hoặc màu nhấn — không tự
 * chế màu mới. Biến thể đến từ bố cục và thời điểm trong ngày, không đến từ hue tuỳ tiện.
 *
 * Khung vẽ luôn là 9:16 (đúng quy định ảnh của sản phẩm) và cắt bằng `slice`, nên cùng một bức
 * dùng được cho bìa dọc, thẻ 3:4 và banner 16:9.
 */

import { GENRE, BRAND, mix, activeMode } from 'wnd/tokens.js';

const W = 360;
const H = 640;

/* Băm chuỗi thành số — cùng một truyện luôn ra cùng một bức. */
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
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

/* Ánh xạ danh mục → một trong năm sắc thái đã có token. Không thêm màu mới. */
const TINT_BY_CATEGORY = {
  adventure: GENRE.adventure, nature: GENRE.adventure, science: GENRE.adventure,
  puzzle_mystery: GENRE.puzzle, creativity: GENRE.puzzle, nonfiction: GENRE.puzzle,
  horror: GENRE.horror,
  fantasy: GENRE.mystery, history_culture: GENRE.mystery, bedtime: GENRE.mystery,
};

export function tintFor(categoryCode, mode = activeMode()) {
  const base = TINT_BY_CATEGORY[categoryCode] || (mode === 'dark' ? BRAND.accent400 : BRAND.accent600);
  return base;
}

/** Kiểu nút lựa chọn của trình phát, theo đúng bộ preset có sẵn. */
export function choiceStyleFor(categoryCode) {
  if (categoryCode === 'horror') return 'light_horror';
  if (TINT_BY_CATEGORY[categoryCode] === GENRE.adventure) return 'adventure';
  if (TINT_BY_CATEGORY[categoryCode] === GENRE.puzzle) return 'puzzle';
  if (TINT_BY_CATEGORY[categoryCode] === GENRE.mystery) return 'mystery';
  return 'default';
}

function palette(tint, time, mode) {
  const dark = mode === 'dark';
  const ink = dark ? '#0B1016' : '#0F172A';
  const paper = dark ? '#131A22' : '#FFFFFF';

  const scheme = {
    day:   { skyTop: mix(tint, paper, dark ? 0.72 : 0.86), skyBot: mix(tint, paper, dark ? 0.5 : 0.62), orb: mix(tint, '#FFF3D6', 0.7), orbY: 132 },
    dusk:  { skyTop: mix(tint, ink, dark ? 0.55 : 0.24),   skyBot: mix(tint, '#FFB86B', dark ? 0.42 : 0.55), orb: '#FFD79A', orbY: 250 },
    night: { skyTop: mix(tint, ink, 0.82),                 skyBot: mix(tint, ink, 0.58), orb: dark ? '#DCE9F7' : '#EAF2FB', orbY: 118 },
  }[time] || {};

  return {
    ...scheme,
    ink,
    paper,
    tint,
    far:  mix(tint, ink, dark ? 0.6 : 0.34),
    mid:  mix(tint, ink, dark ? 0.72 : 0.5),
    near: mix(tint, ink, dark ? 0.84 : 0.68),
    ground: mix(tint, ink, dark ? 0.88 : 0.74),
    skin: dark ? '#E8C9A8' : '#F2D2B0',
    accentWarm: mix(tint, '#FFC46B', 0.55),
  };
}

/* --------------------------------------------------------------- nguyên liệu */

function hills(p, y, color, amp, r) {
  const pts = [];
  for (let x = -20; x <= W + 20; x += 45) {
    pts.push(`${x},${(y + Math.sin((x + r() * 60) / 70) * amp).toFixed(1)}`);
  }
  return `<path d="M-20,${H} L${pts.join(' L')} L${W + 20},${H} Z" fill="${color}"/>`;
}

function tree(x, y, h, color) {
  const w = h * 0.52;
  return `<g fill="${color}">
    <rect x="${x - h * 0.05}" y="${y - h * 0.3}" width="${h * 0.1}" height="${h * 0.32}" rx="2"/>
    <path d="M${x} ${y - h} L${x + w / 2} ${y - h * 0.55} L${x - w / 2} ${y - h * 0.55} Z"/>
    <path d="M${x} ${y - h * 0.78} L${x + w * 0.62} ${y - h * 0.28} L${x - w * 0.62} ${y - h * 0.28} Z"/>
  </g>`;
}

function building(x, y, w, h, color, lit, litColor) {
  let win = '';
  const cols = Math.max(1, Math.floor(w / 22));
  const rows = Math.max(1, Math.floor(h / 30));
  for (let c = 0; c < cols; c += 1) {
    for (let rr = 0; rr < rows; rr += 1) {
      if (!lit(c, rr)) continue;
      win += `<rect x="${x + 9 + c * 22}" y="${y + 14 + rr * 30}" width="9" height="13" rx="2" fill="${litColor}" opacity="0.85"/>`;
    }
  }
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${color}"/>${win}</g>`;
}

function figure(x, y, s, bodyColor, p, pose = 'stand') {
  const head = s * 0.3;
  const armY = y - s * 0.62;
  const arms = pose === 'reach'
    ? `<path d="M${x - s * 0.3} ${armY} L${x - s * 0.55} ${armY - s * 0.22}" stroke="${bodyColor}" stroke-width="${s * 0.14}" stroke-linecap="round"/>`
    : `<path d="M${x - s * 0.3} ${armY} L${x - s * 0.44} ${armY + s * 0.26}" stroke="${bodyColor}" stroke-width="${s * 0.14}" stroke-linecap="round"/>`;
  return `<g>
    ${arms}
    <path d="M${x - s * 0.3} ${y} q0 ${-s * 0.72} ${s * 0.3} ${-s * 0.72} q${s * 0.3} 0 ${s * 0.3} ${s * 0.72} Z" fill="${bodyColor}"/>
    <path d="M${x + s * 0.3} ${armY} L${x + s * 0.46} ${armY + s * 0.24}" stroke="${bodyColor}" stroke-width="${s * 0.14}" stroke-linecap="round"/>
    <circle cx="${x}" cy="${y - s * 0.88}" r="${head}" fill="${p.skin}"/>
    <path d="M${x - head} ${y - s * 0.94} a${head} ${head} 0 0 1 ${head * 2} 0 z" fill="${mix(bodyColor, p.ink, 0.35)}"/>
  </g>`;
}

function room(p, wallTop) {
  return `
    <rect x="0" y="0" width="${W}" height="${wallTop}" fill="${mix(p.tint, p.paper, 0.82)}"/>
    <rect x="0" y="${wallTop}" width="${W}" height="${H - wallTop}" fill="${mix(p.tint, p.ink, 0.5)}"/>
    <rect x="46" y="86" width="150" height="150" rx="10" fill="${p.skyBot}" stroke="${p.near}" stroke-width="6"/>
    <path d="M121 86 V236 M46 161 H196" stroke="${p.near}" stroke-width="6"/>`;
}

/* ------------------------------------------------------------------ mô típ */

const MOTIFS = {
  kitchen(p, r) {
    return `${room(p, 400)}
      <rect x="24" y="400" width="${W - 48}" height="86" rx="10" fill="${mix(p.tint, p.paper, 0.62)}"/>
      <rect x="24" y="392" width="${W - 48}" height="16" rx="8" fill="${mix(p.tint, p.ink, 0.28)}"/>
      <ellipse cx="248" cy="392" rx="34" ry="9" fill="${p.ink}" opacity="0.16"/>
      <path d="M232 392 q4 -54 16 -54 q12 0 16 54 z" fill="${p.accentWarm}"/>
      <path d="M226 392 h44 l-4 10 h-36 z" fill="${mix(p.accentWarm, p.ink, 0.3)}"/>
      ${figure(118, 392, 118, p.tint, p, 'reach')}
      <circle cx="286" cy="330" r="5" fill="${p.accentWarm}" opacity="0.8"/>
      <circle cx="300" cy="352" r="3.4" fill="${p.accentWarm}" opacity="0.6"/>`;
  },

  broken(p, r) {
    return `${room(p, 400)}
      <rect x="24" y="400" width="${W - 48}" height="86" rx="10" fill="${mix(p.tint, p.paper, 0.62)}"/>
      <rect x="24" y="392" width="${W - 48}" height="16" rx="8" fill="${mix(p.tint, p.ink, 0.28)}"/>
      <g fill="${p.accentWarm}">
        <path d="M214 392 l16 -34 l10 8 z"/>
        <path d="M244 392 l6 -26 l14 12 z"/>
        <path d="M270 392 l14 -18 l8 18 z"/>
      </g>
      <path d="M206 392 h96" stroke="${mix(p.accentWarm, p.ink, 0.4)}" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
      ${figure(112, 392, 122, p.tint, p)}`;
  },

  schoolgate(p, r) {
    return `
      <rect width="${W}" height="${H}" fill="url(#sky)"/>
      <circle cx="286" cy="${p.orbY}" r="34" fill="${p.orb}" opacity="0.9"/>
      ${hills(p, 358, p.far, 12, r)}
      ${building(-10, 214, 170, 200, p.mid, (c, i) => (c + i) % 3 !== 1, p.accentWarm)}
      ${building(196, 254, 174, 160, p.far, (c, i) => (c * 2 + i) % 3 === 0, p.accentWarm)}
      <rect x="0" y="404" width="${W}" height="${H - 404}" fill="${p.ground}"/>
      <g stroke="${p.near}" stroke-width="9" stroke-linecap="round">
        <path d="M92 404 V296"/><path d="M268 404 V296"/><path d="M92 300 H268"/>
      </g>
      <g stroke="${p.near}" stroke-width="5" opacity="0.85">
        <path d="M124 404 V308"/><path d="M156 404 V308"/><path d="M204 404 V308"/><path d="M236 404 V308"/>
      </g>
      ${tree(38, 404, 118, p.mid)}
      ${figure(180, 470, 128, p.tint, p)}
      ${figure(276, 452, 96, mix(p.tint, p.paper, 0.42), p)}`;
  },

  playground(p, r) {
    return `
      <rect width="${W}" height="${H}" fill="url(#sky)"/>
      <circle cx="72" cy="${p.orbY}" r="30" fill="${p.orb}" opacity="0.9"/>
      ${hills(p, 372, p.far, 16, r)}
      ${hills(p, 424, p.mid, 10, r)}
      <rect x="0" y="452" width="${W}" height="${H - 452}" fill="${p.ground}"/>
      <g stroke="${p.near}" stroke-width="8" stroke-linecap="round" fill="none">
        <path d="M232 452 L262 336 L300 452"/><path d="M262 336 H196"/>
        <path d="M214 342 V404"/><path d="M240 342 V404"/>
        <rect x="206" y="404" width="42" height="9" rx="4" fill="${p.accentWarm}" stroke="none"/>
      </g>
      ${tree(58, 452, 132, p.mid)}${tree(112, 452, 96, p.far)}
      ${figure(150, 500, 122, p.tint, p, 'reach')}`;
  },

  street(p, r) {
    return `
      <rect width="${W}" height="${H}" fill="url(#sky)"/>
      <circle cx="292" cy="${p.orbY}" r="28" fill="${p.orb}" opacity="0.85"/>
      ${building(-14, 168, 128, 250, p.far, (c, i) => (c + i) % 2 === 0, p.accentWarm)}
      ${building(118, 224, 108, 194, p.mid, (c, i) => (c * 3 + i) % 4 !== 2, p.accentWarm)}
      ${building(232, 190, 146, 228, p.far, (c, i) => (c + i * 2) % 3 === 1, p.accentWarm)}
      <rect x="0" y="410" width="${W}" height="${H - 410}" fill="${p.ground}"/>
      <path d="M0 470 H${W}" stroke="${mix(p.ground, p.paper, 0.28)}" stroke-width="5" stroke-dasharray="26 22"/>
      <g stroke="${p.near}" stroke-width="6" stroke-linecap="round">
        <path d="M312 410 V300"/><circle cx="312" cy="292" r="11" fill="${p.accentWarm}" stroke="none"/>
      </g>
      ${figure(128, 476, 126, p.tint, p)}`;
  },

  forest(p, r) {
    let trees = '';
    for (let i = 0; i < 9; i += 1) {
      const x = 12 + i * 42 + r() * 14;
      const h = 150 + r() * 130;
      trees += tree(x, 430 + (i % 2) * 22, h, i % 2 ? p.far : p.mid);
    }
    return `
      <rect width="${W}" height="${H}" fill="url(#sky)"/>
      <circle cx="196" cy="${p.orbY}" r="40" fill="${p.orb}" opacity="0.55"/>
      ${hills(p, 400, mix(p.far, p.ink, 0.2), 18, r)}
      ${trees}
      <rect x="0" y="470" width="${W}" height="${H - 470}" fill="${p.ground}"/>
      <path d="M150 ${H} q34 -70 26 -140" stroke="${mix(p.ground, p.paper, 0.2)}" stroke-width="38" fill="none" stroke-linecap="round" opacity="0.55"/>
      ${figure(178, 528, 120, p.tint, p)}`;
  },

  classroom(p, r) {
    let desks = '';
    for (let i = 0; i < 3; i += 1) {
      const y = 402 + i * 62;
      const inset = 40 - i * 14;
      desks += `<rect x="${inset}" y="${y}" width="${W - inset * 2}" height="26" rx="6" fill="${mix(p.tint, p.paper, 0.6 - i * 0.1)}"/>`;
    }
    return `${room(p, 356)}
      <rect x="212" y="96" width="132" height="96" rx="8" fill="${mix(p.tint, p.ink, 0.62)}" stroke="${p.near}" stroke-width="6"/>
      <g stroke="${mix(p.paper, p.tint, 0.25)}" stroke-width="4" stroke-linecap="round" opacity="0.8">
        <path d="M228 128 H302"/><path d="M228 148 H322"/><path d="M228 168 H278"/>
      </g>
      ${desks}
      ${figure(96, 400, 104, p.tint, p)}`;
  },

  bedroom(p, r) {
    return `${room(p, 392)}
      <rect x="0" y="392" width="${W}" height="${H - 392}" fill="${mix(p.tint, p.ink, 0.56)}"/>
      <rect x="34" y="404" width="${W - 68}" height="122" rx="14" fill="${mix(p.tint, p.paper, 0.5)}"/>
      <rect x="46" y="392" width="88" height="44" rx="12" fill="${p.paper}" opacity="0.9"/>
      <rect x="34" y="452" width="${W - 68}" height="74" rx="12" fill="${p.accentWarm}" opacity="0.85"/>
      <circle cx="296" cy="330" r="18" fill="${p.orb}" opacity="0.75"/>
      <g stroke="${p.orb}" stroke-width="3" opacity="0.5">
        <path d="M296 300 v-14M296 374 v-14M266 330 h-14M340 330 h-14"/>
      </g>`;
  },

  library(p, r) {
    let shelf = '';
    for (let row = 0; row < 3; row += 1) {
      const y = 120 + row * 92;
      shelf += `<rect x="30" y="${y + 66}" width="${W - 60}" height="10" rx="4" fill="${p.near}"/>`;
      let x = 40;
      while (x < W - 60) {
        const w = 12 + Math.round(r() * 12);
        const h = 40 + Math.round(r() * 24);
        shelf += `<rect x="${x}" y="${y + 66 - h}" width="${w}" height="${h}" rx="2" fill="${mix(p.tint, p.paper, 0.25 + r() * 0.5)}"/>`;
        x += w + 4;
      }
    }
    return `${room(p, 430)}
      <rect x="0" y="0" width="${W}" height="430" fill="${mix(p.tint, p.paper, 0.86)}"/>
      ${shelf}
      <rect x="0" y="430" width="${W}" height="${H - 430}" fill="${mix(p.tint, p.ink, 0.52)}"/>
      ${figure(214, 520, 118, p.tint, p, 'reach')}`;
  },

  yard(p, r) {
    return `
      <rect width="${W}" height="${H}" fill="url(#sky)"/>
      <circle cx="266" cy="${p.orbY}" r="32" fill="${p.orb}" opacity="0.88"/>
      ${hills(p, 386, p.far, 14, r)}
      <g>
        <path d="M60 400 L152 322 L244 400 Z" fill="${p.mid}"/>
        <rect x="82" y="396" width="140" height="96" rx="6" fill="${mix(p.tint, p.paper, 0.52)}"/>
        <rect x="132" y="436" width="40" height="56" rx="4" fill="${p.near}"/>
        <rect x="96" y="416" width="26" height="26" rx="3" fill="${p.accentWarm}" opacity="0.9"/>
        <rect x="184" y="416" width="26" height="26" rx="3" fill="${p.accentWarm}" opacity="0.9"/>
      </g>
      <rect x="0" y="492" width="${W}" height="${H - 492}" fill="${p.ground}"/>
      ${tree(300, 500, 150, p.mid)}
      ${figure(64, 548, 116, p.tint, p)}`;
  },
};

export const MOTIF_NAMES = Object.keys(MOTIFS);

/**
 * @param {object} o
 * @param {string} o.motif  tên mô típ, mặc định chọn theo seed
 * @param {string} o.tint   màu hex (dùng tintFor)
 * @param {string} o.time   'day' | 'dusk' | 'night'
 * @param {string} o.seed   khoá cố định để bức tranh không đổi giữa các lần render
 * @param {string} o.mode   'light' | 'dark'
 */
export function artSvg(o = {}) {
  const mode = o.mode || activeMode();
  const seed = String(o.seed || o.motif || 'wn');
  const r = rng(seed);
  const names = MOTIF_NAMES;
  const motif = MOTIFS[o.motif] ? o.motif : names[hash(seed) % names.length];
  const time = o.time || ['day', 'dusk', 'night'][hash(seed + 'time') % 3];
  const p = palette(o.tint || tintFor(null, mode), time, mode);
  const gid = 'g' + (hash(seed + motif + time + mode) % 100000).toString(36);

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img"
   aria-label="${o.alt ? String(o.alt).replace(/"/g, '&quot;') : 'Tranh minh hoạ'}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.skyTop}"/>
      <stop offset="1" stop-color="${p.skyBot}"/>
    </linearGradient>
    <radialGradient id="vig-${gid}" cx="0.5" cy="0.42" r="0.78">
      <stop offset="0.55" stop-color="${p.ink}" stop-opacity="0"/>
      <stop offset="1" stop-color="${p.ink}" stop-opacity="${mode === 'dark' ? 0.5 : 0.24}"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${p.skyBot}"/>
  ${MOTIFS[motif](p, r)}
  <rect width="${W}" height="${H}" fill="url(#vig-${gid})"/>
</svg>`;
}

/** Ô ảnh trống của trình soạn — khác hẳn tranh thật để không nhầm là đã có ảnh. */
export function placeholderArt(label = 'Chưa có ảnh') {
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">
    <rect width="${W}" height="${H}" fill="var(--wn-border)"/>
    <g stroke="var(--wn-border-strong)" stroke-width="2" opacity="0.8" fill="none">
      <rect x="112" y="272" width="136" height="100" rx="10"/>
      <circle cx="148" cy="304" r="12"/>
      <path d="m118 358 44-40a10 10 0 0 1 14 0l66 54"/>
    </g>
    <text x="180" y="410" text-anchor="middle" fill="var(--wn-muted)"
      font-family="system-ui, sans-serif" font-size="17" font-weight="600">${label}</text>
  </svg>`;
}
