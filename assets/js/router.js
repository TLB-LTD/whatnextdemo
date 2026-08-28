/**
 * Router bằng hash — cố ý, vì GitHub Pages phục vụ ở đường dẫn con và không có history
 * fallback. Hash cũng làm mọi liên kết trong demo copy-dán được nguyên vẹn.
 */

const routes = [];
let notFound = null;
let current = null;

export function route(pattern, handler) {
  const keys = [];
  const rx = new RegExp('^' + pattern.replace(/:([a-z]+)/gi, (_, k) => {
    keys.push(k);
    return '([^/]+)';
  }) + '$');
  routes.push({ rx, keys, handler });
}

export function setNotFound(handler) {
  notFound = handler;
}

export function path() {
  const h = window.location.hash.replace(/^#/, '');
  return h || '/tong-quan';
}

export function go(to, { replace = false } = {}) {
  const target = '#' + (to.startsWith('/') ? to : '/' + to);
  if (window.location.hash === target) { resolve(); return; }
  if (replace) window.location.replace(target);
  else window.location.hash = target;
}

export function resolve() {
  const p = path();
  current = p;
  for (const r of routes) {
    const m = p.match(r.rx);
    if (!m) continue;
    const params = {};
    r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
    r.handler(params, p);
    return;
  }
  if (notFound) notFound(p);
}

export function currentPath() {
  return current;
}

export function start() {
  window.addEventListener('hashchange', resolve);
  resolve();
}
