/**
 * Luồng đọc truyện — dùng chung cho trẻ đã đăng nhập, khách chơi thử, và bản xem trước của
 * tác giả. Ba bề mặt khác nhau về giới hạn, không khác nhau về cách chơi.
 *
 * Những chỗ cố ý làm đúng đặc tả:
 *  · tiến trình là N vạch theo tổng số trang, không bao giờ hiện phần trăm
 *  · sau khi chạm một lựa chọn: đánh dấu, khoá các lựa chọn còn lại, chờ 400ms rồi chuyển trang
 *  · khám phá chiến lược lần đầu hiện một chip ngắn 1,2 giây — không có "+N điểm"
 *  · màn kết có đủ năm khối, và pháo giấy chỉ rơi khi đoạn kết thật sự tích cực
 */

import { html, icon, raw, art, progressSegments, btn, iconBtn, sheet, confetti, reducedMotion, qs } from 'wnd/ui.js';
import { STRATEGY_BY_CODE } from 'wnd/data/strategies.js';
import { recordStrategies, markFinished, sendProposal } from 'wnd/state.js';

export function newSession(story) {
  return {
    storyCode: story.code,
    sceneCode: story.startScene,
    step: 1,
    picked: null,
    ending: null,
    flash: null,
    used: [],
    sheet: null,
    proposalText: '',
    speaking: false,
  };
}

function sceneOf(story, s) {
  return story.sceneByCode[s.sceneCode];
}

/* --------------------------------------------------------------- giọng đọc */

function speak(text, onEnd) {
  if (!('speechSynthesis' in window)) { onEnd(); return false; }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\n/g, '. '));
    u.lang = 'vi-VN';
    u.rate = 0.92;
    const vi = window.speechSynthesis.getVoices().find((v) => /vi/i.test(v.lang));
    if (vi) u.voice = vi;
    u.onend = onEnd;
    u.onerror = onEnd;
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    onEnd();
    return false;
  }
}

/* ------------------------------------------------------------------- render */

export function renderPlayer(ctx, sess, story, o = {}) {
  const ending = sess.ending ? story.endingByCode[sess.ending] : null;
  return html`<div class="wn-player">
    <div class="wn-player__top">
      ${iconBtn('chevronLeft', { label: 'Thoát truyện', act: ending ? 'exit' : 'exit-ask' })}
      <div style="flex:1;min-width:0">
        ${progressSegments(story.totalScenes, ending ? story.totalScenes : sess.step)}
        <div class="wn-micro" style="margin-top:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          ${story.title}${o.preview ? ' · bản xem trước' : ''}
        </div>
      </div>
      ${iconBtn('moreVertical', { label: 'Thêm', act: 'menu' })}
    </div>
    ${o.banner || ''}
    ${ending ? endingView(ctx, sess, story, ending, o) : sceneView(ctx, sess, story, o)}
    ${sess.flash ? html`<div class="wn-chipflash" role="status">${icon('sparkles')}Cách mới: ${sess.flash}</div>` : ''}
    ${sess.sheet === 'proposal' ? proposalSheet(sess) : ''}
    ${sess.sheet === 'menu' ? menuSheet() : ''}
    ${sess.sheet === 'exit' ? exitSheet() : ''}
  </div>`;
}

function sceneView(ctx, sess, story, o) {
  const scene = sceneOf(story, sess);
  if (!scene) return html`<div class="wn-empty">${icon('alertCircle')}<b>Không tìm thấy trang này</b></div>`;
  const choices = scene.choices || [];
  const tint = o.tint;

  const textBlock = html`<p class="wn-player__text">${scene.text}</p>`;

  const choiceList = html`<div class="wn-player__choices">
    ${choices.map((c, i) => html`<button type="button"
      class="wn-choice wn-choice--${story.choiceStyle} ${sess.picked === i ? 'is-picked' : ''}"
      data-act="choose" data-arg="${i}" ${raw(sess.picked != null ? 'disabled' : '')}>
      <span class="wn-choice__num">${i + 1}</span>
      <span style="flex:1">${c.text}</span>
      ${sess.picked === i ? icon('check') : ''}
    </button>`)}
  </div>`;

  return html`<div class="wn-player__body wn-scenefade" data-scene="${scene.code}">
    <div class="wn-player__stage">
      ${art({ seed: story.code + scene.code, motif: scene.art?.motif, time: scene.art?.time,
              tint, alt: `Minh hoạ: ${scene.text.split('\n')[0]}` })}
      <div class="wn-player__scrim">
        <div class="wn-row" style="margin-bottom:var(--wn-space-3)">
          <button type="button" class="wn-icobtn wn-icobtn--onart" data-act="audio"
            aria-label="${sess.speaking ? 'Dừng đọc' : 'Nghe kể trang này'}">
            ${icon(sess.speaking ? 'pause' : 'volume')}</button>
          <span class="wn-micro" style="color:rgba(255,255,255,.82)">
            ${sess.speaking ? 'Đang đọc…' : 'Nghe kể'}</span>
        </div>
        ${textBlock}
      </div>
    </div>
    <div class="wn-player__panel">
      <div class="wn-player__paneltext wn-stack-3" style="margin-bottom:var(--wn-space-5)">
        <div class="wn-row">
          <button type="button" class="wn-icobtn" data-act="audio"
            aria-label="${sess.speaking ? 'Dừng đọc' : 'Nghe kể trang này'}"
            style="border:1px solid var(--wn-border-strong)">${icon(sess.speaking ? 'pause' : 'volume')}</button>
          <span class="wn-caption">${sess.speaking ? 'Đang đọc…' : 'Nghe kể trang này'}</span>
        </div>
        ${textBlock}
      </div>
      ${choices.length ? choiceList : btn('Tiếp tục', { kind: 'primary', block: true, act: 'choose', arg: '0' })}
      <div class="wn-player__hint">
        <button type="button" class="wn-btn wn-btn--ghost wn-btn--sm" data-act="open-proposal"
          >${icon('lightbulb')}Con có cách khác không?</button>
      </div>
    </div>
  </div>`;
}

function endingView(ctx, sess, story, ending, o) {
  const used = sess.used.map((c) => STRATEGY_BY_CODE[c]).filter(Boolean);
  return html`<div class="wn-player__body wn-scenefade" id="wn-ending">
    <div class="wn-player__stage">
      ${art({ seed: story.code + ending.code, motif: ending.art?.motif, time: ending.art?.time,
              tint: o.tint, hero: true, alt: `Minh hoạ đoạn kết ${ending.title}` })}
      <div class="wn-player__scrim">
        <span class="wn-badge ${ending.isPositive ? 'wn-badge--success' : 'wn-badge--neutral'}"
          style="margin-bottom:10px">${icon(ending.isPositive ? 'award' : 'flag')}${ending.title}</span>
      </div>
    </div>
    <div class="wn-player__panel">
      <div class="wn-only-wide" style="margin-bottom:var(--wn-space-2)">
        <span class="wn-badge ${ending.isPositive ? 'wn-badge--success' : 'wn-badge--neutral'}"
          >${icon(ending.isPositive ? 'award' : 'flag')}${ending.title}</span>
      </div>

      <section class="wn-stack-2">
        <b class="wn-label">Điều đã xảy ra</b>
        <p class="wn-reader">${ending.summaryText}</p>
      </section>

      <section class="wn-card wn-card--flat wn-stack-2" style="padding:var(--wn-space-4)">
        <b class="wn-label">${icon('gitBranch')} Một cách khác có thể là…</b>
        <p class="wn-compact wn-dim">${ending.alternativeHint}</p>
        ${btn('Thử nhánh khác', { kind: 'outline', sm: true, act: 'replay', icon: 'refresh' })}
      </section>

      <section class="wn-stack-2">
        <b class="wn-label">${icon('lightbulb')} Câu hỏi để nghĩ thêm</b>
        <p class="wn-compact wn-dim">${ending.reflectionQuestion}</p>
        <textarea class="wn-textarea" rows="2" data-field="reflect"
          placeholder="Con có thể viết ra đây, hoặc chỉ nghĩ trong đầu cũng được."></textarea>
      </section>

      ${used.length ? html`<section class="wn-stack-2">
        <b class="wn-label">${icon('bookmark')} Cách con đã dùng</b>
        <div class="wn-row wn-row--wrap">
          ${used.map((s) => html`<span class="wn-chip wn-chip--static">${icon(s.icon)}${s.name}</span>`)}
        </div>
      </section>` : ''}

      <section class="wn-banner wn-banner--info">
        ${icon('users')}
        <div><b>Thẻ trò chuyện cùng bố mẹ</b><br>${ending.parentTalkPrompt}</div>
      </section>

      <div class="wn-stack-2" style="margin-top:auto">
        ${btn('Chơi lại', { kind: 'primary', block: true, act: 'replay', icon: 'refresh' })}
        ${btn('Về thư viện', { kind: 'secondary', block: true, act: 'exit' })}
      </div>
    </div>
  </div>`;
}

function proposalSheet(sess) {
  return sheet(html`<div class="wn-stack">
        <div class="wn-stack-1">
          <b class="wn-title">Con có cách khác không?</b>
          <span class="wn-caption">Người lớn ở đội nội dung sẽ đọc. Nếu hay, cách của con có thể
            được thêm vào truyện.</span>
        </div>
        <textarea class="wn-textarea" rows="4" data-field="proposal"
          placeholder="Ví dụ: con sẽ rủ bạn cùng đi nói với cô.">${sess.proposalText}</textarea>
        <div class="wn-row">
          ${btn('Gửi cho đội nội dung', { kind: 'primary', act: 'send-proposal', icon: 'send' })}
          ${btn('Để sau', { kind: 'ghost', act: 'close-sheet' })}
        </div>
      </div>`, { label: 'Đề xuất cách khác' });
}

function exitSheet() {
  return sheet(html`<div class="wn-stack">
        <div class="wn-stack-1">
          <b class="wn-title">Thoát truyện?</b>
          <span class="wn-caption">Con đang đọc dở. Thoát bây giờ thì lần sau bắt đầu lại từ đầu.</span>
        </div>
        <div class="wn-stack-2">
          ${btn('Đọc tiếp', { kind: 'primary', block: true, act: 'close-sheet' })}
          ${btn('Thoát', { kind: 'secondary', block: true, act: 'exit' })}
        </div>
      </div>`, { label: 'Thoát truyện' });
}

function menuSheet() {
  return sheet(html`<div class="wn-stack-2">
      ${btn('Bắt đầu lại từ đầu', { kind: 'secondary', block: true, act: 'replay', icon: 'refresh' })}
      ${btn('Thoát truyện', { kind: 'secondary', block: true, act: 'exit' })}
      ${btn('Đóng', { kind: 'ghost', block: true, act: 'close-sheet' })}
    </div>`, { label: 'Thêm' });
}

/* ------------------------------------------------------------------- hành động */

export function playerAct(ctx, sess, story, act, arg, o = {}, el = null) {
  switch (act) {
    case 'choose': {
      if (sess.picked != null) return true;
      const scene = sceneOf(story, sess);
      const choice = (scene.choices || [])[Number(arg)];
      if (!choice) {
        /* Trang không có lựa chọn. Nếu là trang kết thì đóng truyện; nếu không, đó là một
           nhánh tác giả bỏ dở — vẫn phải đưa người đọc tới một đoạn kết chứ không để chết đứng. */
        finish(ctx, sess, story, scene.endingCode || (story.endings[0] || {}).code, o);
        return true;
      }
      sess.picked = Number(arg);
      ctx.rerender();

      if (choice.strategy && !o.preview) {
        const fresh = recordStrategies([choice.strategy], story.title);
        if (fresh.length) {
          sess.flash = STRATEGY_BY_CODE[fresh[0]].name;
          setTimeout(() => { sess.flash = null; ctx.rerender(); }, 1250);
        }
      }
      if (choice.strategy && !sess.used.includes(choice.strategy)) sess.used.push(choice.strategy);

      const delay = reducedMotion() ? 60 : 420;
      setTimeout(() => {
        sess.picked = null;
        if (choice.ending) { finish(ctx, sess, story, choice.ending, o); return; }
        const nextScene = story.sceneByCode[choice.next];
        if (!nextScene) { finish(ctx, sess, story, (story.endings[0] || {}).code, o); return; }
        if (nextScene.isEnding && nextScene.endingCode) { finish(ctx, sess, story, nextScene.endingCode, o); return; }
        sess.sceneCode = choice.next;
        sess.step = Math.min(sess.step + 1, story.totalScenes);
        ctx.rerender();
      }, delay);
      return true;
    }

    case 'audio': {
      const scene = sess.ending ? null : sceneOf(story, sess);
      const text = scene ? scene.text : (story.endingByCode[sess.ending] || {}).summaryText || '';
      if (sess.speaking) {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        sess.speaking = false;
        ctx.rerender();
        return true;
      }
      sess.speaking = true;
      ctx.rerender();
      const started = speak(text, () => { sess.speaking = false; ctx.rerender(); });
      if (!started) {
        ctx.toast('Trình duyệt này chưa có giọng đọc tiếng Việt.');
        setTimeout(() => { sess.speaking = false; ctx.rerender(); }, 900);
      }
      return true;
    }

    case 'menu': sess.sheet = 'menu'; ctx.rerender(); return true;

    case 'exit-ask':
      /* Đang đọc dở thì hỏi lại — thoát nhầm giữa truyện là mất cả mạch. */
      if (sess.ending) return false;
      sess.sheet = 'exit';
      ctx.rerender();
      return true;
    case 'open-proposal': sess.sheet = 'proposal'; ctx.rerender(); return true;
    case 'close-sheet': sess.sheet = null; ctx.rerender(); return true;

    case 'send-proposal': {
      const text = (sess.proposalText || '').trim();
      if (text.length < 5) { ctx.toast('Viết thêm một chút để đội nội dung hiểu ý con nhé.'); return true; }
      if (!o.preview) sendProposal(story.code, sess.sceneCode, text);
      sess.proposalText = '';
      sess.sheet = null;
      ctx.rerender();
      ctx.toast('Cảm ơn con! Đội nội dung sẽ đọc đề xuất này.');
      return true;
    }

    case 'replay': {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      Object.assign(sess, newSession(story));
      ctx.rerender();
      return true;
    }

    case '__field':
      /* Không vẽ lại ở đây: gõ chữ là thiêng liêng, mất caret là mất người dùng. */
      if (arg === 'proposal' && el) sess.proposalText = el.value;
      return true;

    default:
      return false;
  }
}

function finish(ctx, sess, story, endingCode, o) {
  const ending = story.endingByCode[endingCode] || story.endings[0];
  sess.ending = ending ? ending.code : null;
  sess.picked = null;
  if (!o.preview && ending) markFinished(story.code, ending.code);
  ctx.rerender();
  if (ending && ending.isPositive) {
    const host = qs('#wn-ending');
    if (host) confetti(host);
  }
}
