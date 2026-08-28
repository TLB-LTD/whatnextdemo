/**
 * Kho trạng thái dùng chung cho cả ba vai.
 *
 * Vì sao một kho duy nhất: việc tác giả gửi truyện và việc biên tập duyệt truyện phải nhìn
 * thấy được từ phía trẻ. Nếu mỗi luồng giữ state riêng thì demo chỉ là ba màn rời nhau.
 *
 * Lưu ở localStorage nên người xem đóng tab mở lại vẫn còn. Mọi truy cập đều bọc try/catch:
 * cửa sổ ẩn danh và trình duyệt chặn site data vẫn phải chạy được, chỉ là không nhớ.
 */

import { UGC_SEED } from 'wnd/data/ugc.js';

const KEY = 'wnd_state_v1';

function seed() {
  return {
    version: 1,
    /* Sổ chiến lược của trẻ: code -> { times, firstStoryTitle, at } */
    notebook: {},
    /* Truyện đã lưu, theo mã truyện */
    saved: ['wn-demo-dem-mat-dien'],
    /* Đánh giá của trẻ: storyCode -> { stars, text, at } */
    ratings: {},
    /* Đã đọc xong truyện nào, mã ending nào */
    finished: {},
    /* Đã xác nhận nội dung cho truyện nào (cổng cấp 3) */
    acked: [],
    /* Sáng tác: bản seed + bản người xem tự soạn trong phiên */
    ugc: UGC_SEED.map((u) => ({ ...u, thread: [...u.thread] })),
    /* Bản UGC đã xuất bản -> nhập vào thư viện của trẻ */
    publishedUgcIds: [502],
    /* Sở thích đã chọn trong onboarding */
    prefs: { bandCode: 'age_6_10', interests: ['Cảm xúc', 'Bạn bè'], genres: ['realistic', 'social'] },
    /* Đề xuất "cách khác" trẻ gửi trong lúc chơi */
    proposalsSent: [],
    /* Bản soạn đang mở trong trình soạn thảo */
    composerId: null,
  };
}

let state = load();
const listeners = new Set();

function load() {
  try {
    const rawText = localStorage.getItem(KEY);
    if (!rawText) return seed();
    const saved = JSON.parse(rawText);
    if (!saved || saved.version !== 1) return seed();
    return { ...seed(), ...saved };
  } catch {
    return seed();
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* Cửa sổ ẩn danh hoặc site data bị chặn — demo vẫn chạy, chỉ không nhớ giữa các phiên. */
  }
}

export function getState() {
  return state;
}

/** `fn` nhận state và sửa tại chỗ; trả về false nếu không có gì đổi để khỏi vẽ lại. */
export function update(fn) {
  const result = fn(state);
  if (result === false) return state;
  persist();
  listeners.forEach((l) => l(state));
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function resetDemo() {
  state = seed();
  persist();
  listeners.forEach((l) => l(state));
}

/* ------------------------------------------------------- thao tác nghiệp vụ */

/** Ghi các chiến lược lần đầu khám phá; trả về danh sách MỚI để hiện chip trong lúc chơi. */
export function recordStrategies(codes, storyTitle) {
  const fresh = [];
  update((s) => {
    codes.filter(Boolean).forEach((code) => {
      const entry = s.notebook[code];
      if (!entry) {
        s.notebook[code] = { times: 1, firstStoryTitle: storyTitle, at: new Date().toISOString() };
        fresh.push(code);
      } else {
        entry.times += 1;
      }
    });
  });
  return fresh;
}

export function toggleSaved(storyCode) {
  let nowSaved = false;
  update((s) => {
    const i = s.saved.indexOf(storyCode);
    if (i === -1) { s.saved.push(storyCode); nowSaved = true; } else { s.saved.splice(i, 1); }
  });
  return nowSaved;
}

export function markFinished(storyCode, endingCode) {
  update((s) => {
    const prev = s.finished[storyCode] || { count: 0 };
    s.finished[storyCode] = { count: prev.count + 1, endingCode, at: new Date().toISOString() };
  });
}

export function saveRating(storyCode, stars, text) {
  update((s) => {
    s.ratings[storyCode] = { stars, text, at: new Date().toISOString() };
  });
}

export function ackStory(storyCode) {
  update((s) => { if (!s.acked.includes(storyCode)) s.acked.push(storyCode); });
}

export function sendProposal(storyCode, sceneCode, idea) {
  update((s) => {
    s.proposalsSent.unshift({ storyCode, sceneCode, idea, at: new Date().toISOString(), status: 'pending' });
  });
}

/* ------------------------------------------------------------ sáng tác UGC */

let nextUgcId = 600;

export function createUgcStory(draft) {
  const id = nextUgcId;
  nextUgcId += 1;
  update((s) => {
    s.ugc.unshift({
      id, status: 'draft', ownerName: 'Bống', ownerKind: 'child',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      thread: [], ...draft,
    });
    s.composerId = id;
  });
  return id;
}

export function patchUgc(id, patch) {
  update((s) => {
    const story = s.ugc.find((u) => u.id === id);
    if (!story) return false;
    Object.assign(story, patch, { updatedAt: new Date().toISOString() });
    return true;
  });
}

export function findUgc(id) {
  return state.ugc.find((u) => u.id === Number(id));
}

export function postThread(id, message) {
  update((s) => {
    const story = s.ugc.find((u) => u.id === Number(id));
    if (!story) return false;
    story.thread.push({ at: new Date().toISOString(), ...message });
    story.updatedAt = new Date().toISOString();
    return true;
  });
}

export function transitionUgc(id, to, note, actor = 'staff') {
  update((s) => {
    const story = s.ugc.find((u) => u.id === Number(id));
    if (!story) return false;
    story.status = to;
    story.updatedAt = new Date().toISOString();
    if (note) {
      story.thread.push({ role: actor, at: new Date().toISOString(), body: note,
        author: actor === 'staff' ? 'Trần Minh' : story.ownerName });
    }
    if (to === 'published' && !s.publishedUgcIds.includes(story.id)) {
      s.publishedUgcIds.push(story.id);
    }
    if (to === 'needs_revision') {
      s.publishedUgcIds = s.publishedUgcIds.filter((x) => x !== story.id);
    }
    return true;
  });
}

/** Bản UGC đã xuất bản, đổi sang đúng hình dạng một truyện trong thư viện. */
export function publishedUgcStories() {
  return state.ugc
    .filter((u) => state.publishedUgcIds.includes(u.id) && u.status === 'published')
    .map((u) => ({
      id: 900 + u.id,
      code: `wn-ugc-${u.id}`,
      title: u.title,
      shortDescription: u.description,
      categoryCode: u.categoryCode,
      ageBandCode: u.ageBandCode,
      contentRating: 'G',
      ageGateLevel: 1,
      estimatedMinutes: Math.max(3, Math.round(u.scenes.length * 0.8)),
      guestPlayAllowed: true,
      audio: false,
      fromUgc: true,
      author: { name: u.ownerName, kind: 'child' },
      rating: { average: 0, count: 0, hist: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
      playCount: 0,
      art: u.art,
      startScene: (u.scenes.find((sc) => sc.isStart) || u.scenes[0] || {}).code,
      scenes: u.scenes.map((sc) => ({
        code: sc.code, text: sc.text || '', art: u.art,
        choices: (sc.choices || []).map((c) => ({
          text: c.text, next: c.next || undefined, ending: c.ending || undefined, strategy: c.strategy,
        })),
      })),
      endings: (u.endings || []).map((e) => ({
        code: e.code, type: 'neutral', isPositive: true, title: e.title, art: u.art,
        summaryText: (u.scenes.find((sc) => sc.endingCode === e.code) || {}).text
          || 'Câu chuyện dừng lại ở đây.',
        alternativeHint: 'Thử một nhánh khác xem tác giả đã viết gì ở đó.',
        reflectionQuestion: 'Nếu con là tác giả, con sẽ viết tiếp thế nào?',
        parentTalkPrompt: 'Hỏi con: “Truyện này do một bạn nhỏ viết. Con muốn nhắn gì cho bạn ấy?”',
      })),
    }));
}
