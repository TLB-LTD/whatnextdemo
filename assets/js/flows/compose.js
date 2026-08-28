/**
 * Luồng sáng tác: mẫu khởi tạo, hai cổng kiểm tra, và cây nhánh vẽ trực tiếp bằng SVG.
 *
 * Điểm quan trọng nhất của luồng này là phân biệt hai cổng:
 *   · cổng NHÁP  — gần như luôn qua. Nhánh làm dở là trạng thái bình thường của việc viết.
 *   · cổng GỬI   — chặt: đủ trang, một trang mở đầu, mọi lựa chọn có đích, mọi trang tới được.
 * Trộn hai cổng làm một là cách nhanh nhất để tác giả nhỏ tuổi bỏ cuộc giữa chừng.
 */

import { raw } from 'wnd/ui.js';
import { TEMPLATE_BY_CODE, SUBMIT_RULES } from 'wnd/data/ugc.js';
import { getState, createUgcStory, patchUgc, findUgc } from 'wnd/state.js';

const MOTIFS = ['classroom', 'yard', 'playground', 'kitchen', 'street', 'library', 'bedroom', 'schoolgate'];

/** Dựng bản nháp từ một mẫu. Mẫu viết CẤU TRÚC và GỢI Ý, không viết hộ văn. */
export function draftFromTemplate(code, title) {
  const t = TEMPLATE_BY_CODE[code] || TEMPLATE_BY_CODE.blank;
  return {
    title: title || '',
    description: '',
    categoryCode: '',
    ageBandCode: 'age_6_10',
    templateCode: t.code,
    art: { motif: MOTIFS[Math.floor(Math.random() * MOTIFS.length)], time: 'day' },
    hasCover: false,
    scenes: t.scenes.map((s, i) => ({
      code: s.code,
      order: i,
      text: '',
      hint: s.hint,
      isStart: !!s.isStart,
      isEnding: !!s.isEnding,
      endingCode: s.endingCode || null,
      choices: (s.choices || []).map((c) => ({
        text: '', hint: c.hint, next: c.next || null, ending: c.ending || null, strategy: c.strategy || null,
      })),
    })),
    endings: t.endings.map((e) => ({ ...e })),
  };
}

/** Bản nháp đang mở; tạo mới nếu chưa có, để mọi màn trong luồng nói về cùng một truyện. */
export function currentDraft() {
  const st = getState();
  let draft = st.composerId ? findUgc(st.composerId) : null;
  if (!draft) {
    const id = createUgcStory(draftFromTemplate('noi_cam_xuc', ''));
    draft = findUgc(id);
  }
  return draft;
}

export function saveDraft(patch) {
  const st = getState();
  if (!st.composerId) return;
  patchUgc(st.composerId, patch);
}

/* ------------------------------------------------------------------ kiểm tra */

function reachable(draft) {
  const start = draft.scenes.find((s) => s.isStart) || draft.scenes[0];
  if (!start) return new Set();
  const seen = new Set([start.code]);
  const queue = [start];
  while (queue.length) {
    const s = queue.shift();
    (s.choices || []).forEach((c) => {
      if (!c.next || seen.has(c.next)) return;
      const nxt = draft.scenes.find((x) => x.code === c.next);
      if (nxt) { seen.add(nxt.code); queue.push(nxt); }
    });
  }
  return seen;
}

export function validateDraft(draft) {
  const scenes = draft.scenes || [];
  const normal = scenes.filter((s) => !s.isEnding);
  const seen = reachable(draft);

  const result = {
    min_scenes: scenes.length >= 5,
    one_start: scenes.filter((s) => s.isStart).length === 1,
    text_lines: scenes.every((s) => {
      const lines = String(s.text || '').split('\n').filter((l) => l.trim());
      return lines.length >= 1 && lines.length <= 3;
    }),
    choice_count: normal.every((s) => (s.choices || []).length >= 2 && (s.choices || []).length <= 3),
    resolved: normal.every((s) => (s.choices || []).every((c) =>
      (c.next && scenes.some((x) => x.code === c.next)) || (c.ending && draft.endings.some((e) => e.code === c.ending)))),
    reachable: scenes.every((s) => seen.has(s.code)),
    has_ending: scenes.some((s) => s.isEnding && seen.has(s.code))
      || scenes.some((s) => (s.choices || []).some((c) => c.ending)),
    meta: !!(draft.title && draft.title.trim() && draft.hasCover && draft.categoryCode && draft.ageBandCode),
  };

  return {
    checks: SUBMIT_RULES.map((r) => ({ ...r, ok: !!result[r.code] })),
    ok: SUBMIT_RULES.every((r) => result[r.code]),
    reachableSet: seen,
  };
}

/** Cổng nháp — cố ý dễ. Chỉ chặn những thứ làm hỏng dữ liệu, không chặn việc viết dở. */
export function draftGate(draft) {
  const problems = [];
  if (draft.scenes.length > 30) problems.push('Truyện đang có hơn 30 trang.');
  const codes = draft.scenes.map((s) => s.code);
  if (new Set(codes).size !== codes.length) problems.push('Có hai trang trùng mã.');
  if (draft.scenes.some((s) => (s.choices || []).length > 3)) problems.push('Có trang nhiều hơn 3 lựa chọn.');
  return problems;
}

/** Nhánh còn dở: lựa chọn chưa trỏ đi đâu. */
export function openBranches(draft) {
  const out = [];
  draft.scenes.forEach((s, si) => {
    if (s.isEnding) return;
    (s.choices || []).forEach((c, ci) => {
      if (!c.next && !c.ending) out.push({ sceneIndex: si, sceneCode: s.code, choiceIndex: ci, text: c.text || c.hint });
    });
  });
  return out;
}

/* ---------------------------------------------------------------- cây nhánh */

/**
 * Bố cục theo lớp: cột = độ sâu tính từ trang mở đầu, hàng = thứ tự gặp.
 * Đủ dùng cho graph vài chục node và đọc được ngay, không cần thư viện layout.
 */
export function treeSvg(draft, activeCode) {
  const scenes = draft.scenes || [];
  if (!scenes.length) return raw('');
  const start = scenes.find((s) => s.isStart) || scenes[0];

  const depth = new Map([[start.code, 0]]);
  const queue = [start];
  while (queue.length) {
    const s = queue.shift();
    (s.choices || []).forEach((c) => {
      if (!c.next || depth.has(c.next)) return;
      const nxt = scenes.find((x) => x.code === c.next);
      if (!nxt) return;
      depth.set(c.next, depth.get(s.code) + 1);
      queue.push(nxt);
    });
  }
  scenes.forEach((s) => { if (!depth.has(s.code)) depth.set(s.code, 0); });

  const cols = new Map();
  scenes.forEach((s) => {
    const d = depth.get(s.code);
    if (!cols.has(d)) cols.set(d, []);
    cols.get(d).push(s);
  });

  const CW = 132;
  const CH = 62;
  const NW = 104;
  const NH = 40;
  const maxRow = Math.max(...Array.from(cols.values(), (v) => v.length));
  const w = (Math.max(...cols.keys()) + 1) * CW + 24;
  const h = maxRow * CH + 24;

  const pos = new Map();
  cols.forEach((list, d) => {
    const offset = (maxRow - list.length) * CH / 2;
    list.forEach((s, i) => pos.set(s.code, { x: 12 + d * CW, y: 12 + offset + i * CH }));
  });

  let edges = '';
  scenes.forEach((s) => {
    const a = pos.get(s.code);
    (s.choices || []).forEach((c) => {
      const b = c.next ? pos.get(c.next) : null;
      if (!a) return;
      if (!b) {
        edges += `<path d="M${a.x + NW} ${a.y + NH / 2} h20" stroke="var(--wn-warning)"
          stroke-width="2" stroke-dasharray="4 4" fill="none"/>
          <circle cx="${a.x + NW + 24}" cy="${a.y + NH / 2}" r="4" fill="var(--wn-warning)"/>`;
        return;
      }
      const x1 = a.x + NW;
      const y1 = a.y + NH / 2;
      const x2 = b.x;
      const y2 = b.y + NH / 2;
      const mid = (x1 + x2) / 2;
      edges += `<path d="M${x1} ${y1} C${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}"
        stroke="var(--wn-border-strong)" stroke-width="1.6" fill="none"/>`;
    });
  });

  let nodes = '';
  scenes.forEach((s, i) => {
    const p = pos.get(s.code);
    const active = s.code === activeCode;
    const filled = !!(s.text && s.text.trim());
    const fill = s.isEnding
      ? 'color-mix(in srgb, var(--wn-success) 16%, var(--wn-surface))'
      : filled ? 'var(--wn-surface)' : 'color-mix(in srgb, var(--wn-warning) 12%, var(--wn-surface))';
    const stroke = active ? 'var(--wn-accent)' : s.isEnding ? 'var(--wn-success)' : 'var(--wn-border-strong)';
    const label = s.isEnding ? 'Kết' : `Trang ${i + 1}`;
    nodes += `<g>
      <rect x="${p.x}" y="${p.y}" width="${NW}" height="${NH}" rx="10" fill="${fill}"
        stroke="${stroke}" stroke-width="${active ? 2.4 : 1.4}"/>
      <text x="${p.x + 12}" y="${p.y + 17}" font-size="11" font-weight="700"
        fill="var(--wn-text)" font-family="system-ui, sans-serif">${label}</text>
      <text x="${p.x + 12}" y="${p.y + 31}" font-size="10"
        fill="var(--wn-muted)" font-family="system-ui, sans-serif">${
          filled ? escapeSvg(s.text.split('\n')[0].slice(0, 15)) : 'chưa có chữ'}</text>
    </g>`;
  });

  return raw(`<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img"
    aria-label="Cây nhánh của truyện, ${scenes.length} trang">${edges}${nodes}</svg>`);
}

function escapeSvg(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ------------------------------------------------------------ thao tác trang */

export function addScene(draft) {
  const n = draft.scenes.length + 1;
  let code = `s${n}`;
  let i = n;
  while (draft.scenes.some((s) => s.code === code)) { i += 1; code = `s${i}`; }
  draft.scenes.push({
    code, order: draft.scenes.length, text: '', hint: 'Chuyện gì xảy ra ở trang này?',
    isStart: draft.scenes.length === 0, isEnding: false, endingCode: null,
    choices: [
      { text: '', hint: 'Lựa chọn thứ nhất', next: null, ending: null, strategy: null },
      { text: '', hint: 'Lựa chọn thứ hai', next: null, ending: null, strategy: null },
    ],
  });
  return code;
}

export function removeScene(draft, code) {
  draft.scenes = draft.scenes.filter((s) => s.code !== code);
  draft.scenes.forEach((s) => (s.choices || []).forEach((c) => { if (c.next === code) c.next = null; }));
  if (draft.scenes.length && !draft.scenes.some((s) => s.isStart)) draft.scenes[0].isStart = true;
}
