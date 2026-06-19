const routes = [];

export function register(pattern, viewFactory) {
  routes.push({ pattern, viewFactory, regex: patternToRegex(pattern) });
}

function patternToRegex(pattern) {
  const params = [];
  const source = pattern.replace(/:([A-Za-z0-9_]+)/g, (_, name) => {
    params.push(name);
    return "([^/]+)";
  });
  return { regex: new RegExp(`^${source}$`), params };
}

function matchRoute(hash) {
  const path = hash.replace(/^#/, "") || "/";
  for (const route of routes) {
    const m = route.regex.regex.exec(path);
    if (m) {
      const params = {};
      route.regex.params.forEach((name, i) => {
        params[name] = decodeURIComponent(m[i + 1]);
      });
      return { route, params };
    }
  }
  return null;
}

async function render() {
  const mount = document.getElementById("app");
  if (!mount) return;
  const match = matchRoute(window.location.hash);
  if (!match) {
    mount.innerHTML =
      '<div class="empty">Page not found. <a href="#/">Go home</a>.</div>';
    return;
  }
  mount.innerHTML = '<p class="loading">Loading…</p>';
  try {
    await match.route.viewFactory(mount, match.params);
  } catch (err) {
    mount.innerHTML = `<div class="error">Something went wrong: ${escape(
      String(err && err.message ? err.message : err)
    )}</div>`;
  }
}

function escape(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function start() {
  window.addEventListener("hashchange", render);
  if (!window.location.hash) window.location.hash = "#/";
  else render();
}

export function navigate(hash) {
  window.location.hash = hash;
}
