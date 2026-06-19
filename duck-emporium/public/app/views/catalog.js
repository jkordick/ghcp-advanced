import { get } from "../api.js";
import { formatEuroCents } from "../format.js";

const state = {
  q: "",
  categories: new Set(),
  minPriceCents: "",
  maxPriceCents: "",
  knownCategories: new Set(),
};

function escape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildQuery() {
  const params = new URLSearchParams();
  if (state.q.trim()) params.set("q", state.q.trim());
  for (const c of state.categories) params.append("category", c);
  if (state.minPriceCents !== "")
    params.set("minPriceCents", String(state.minPriceCents));
  if (state.maxPriceCents !== "")
    params.set("maxPriceCents", String(state.maxPriceCents));
  const s = params.toString();
  return s ? `?${s}` : "";
}

function renderControls(mount, onChange) {
  const cats = [...state.knownCategories].sort();
  mount.innerHTML = `
    <section class="hero">
      <h1>Find your debugging companion.</h1>
      <p>Hand-picked rubber ducks for thinkers, sailors, and the perpetually mid-refactor. Browse the pond, take the quiz, or check today's featured duck.</p>
    </section>
    <section class="catalog-controls" aria-label="filters">
      <div>
        <label for="q">Search</label>
        <input id="q" type="text" placeholder="duck, philosophy, debugging…" value="${escape(
          state.q
        )}" />
      </div>
      <div>
        <label>Categories</label>
        <div class="category-list">
          ${cats
            .map(
              (c) => `
            <label>
              <input type="checkbox" data-category value="${escape(c)}" ${
                state.categories.has(c) ? "checked" : ""
              } />
              <span>${escape(c)}</span>
            </label>`
            )
            .join("")}
        </div>
      </div>
      <div class="price-range">
        <div>
          <label for="minPrice">Min price (€)</label>
          <input id="minPrice" type="number" min="0" step="0.01" />
        </div>
        <div>
          <label for="maxPrice">Max price (€)</label>
          <input id="maxPrice" type="number" min="0" step="0.01" />
        </div>
      </div>
    </section>
    <section id="duck-results" aria-live="polite">
      <p class="loading">Loading ducks…</p>
    </section>
  `;
  const qEl = mount.querySelector("#q");
  qEl.addEventListener("input", () => {
    state.q = qEl.value;
    onChange();
  });
  for (const cb of mount.querySelectorAll("input[data-category]")) {
    cb.addEventListener("change", () => {
      if (cb.checked) state.categories.add(cb.value);
      else state.categories.delete(cb.value);
      onChange();
    });
  }
  const minEl = mount.querySelector("#minPrice");
  const maxEl = mount.querySelector("#maxPrice");
  minEl.addEventListener("change", () => {
    const v = minEl.value;
    state.minPriceCents = v === "" ? "" : Math.round(Number(v) * 100);
    onChange();
  });
  maxEl.addEventListener("change", () => {
    const v = maxEl.value;
    state.maxPriceCents = v === "" ? "" : Math.round(Number(v) * 100);
    onChange();
  });
}

function renderResults(mount, data) {
  const target = mount.querySelector("#duck-results");
  if (!data || !data.ducks) {
    target.innerHTML = `<div class="error">Could not load ducks.</div>`;
    return;
  }
  if (data.ducks.length === 0 && data.total === 0) {
    target.innerHTML = `<div class="empty">The pond is empty. Please check back soon.</div>`;
    return;
  }
  if (data.ducks.length === 0) {
    target.innerHTML = `<div class="empty">No ducks match your filters. Try clearing one.</div>`;
    return;
  }
  target.innerHTML = `
    <div class="duck-grid">
      ${data.ducks
        .map(
          (d) => `
        <article class="duck-card">
          <span class="category">${escape(d.category)}</span>
          <h3>${escape(d.name)}</h3>
          <p>${escape(d.tagline)}</p>
          <span class="price">${formatEuroCents(d.priceCents)}</span>
          <a href="#/ducks/${encodeURIComponent(d.id)}">View details →</a>
        </article>`
        )
        .join("")}
    </div>
  `;
}

export async function catalogView(mount) {
  // initial fetch (no filters) to discover categories
  const first = await get("/api/ducks");
  if (first.ok && first.body && Array.isArray(first.body.ducks)) {
    for (const d of first.body.ducks) state.knownCategories.add(d.category);
  }
  let pending = 0;
  const refresh = async () => {
    pending++;
    const myTurn = pending;
    const res = await get(`/api/ducks${buildQuery()}`);
    if (myTurn !== pending) return; // stale
    renderResults(mount, res.body);
  };
  renderControls(mount, refresh);
  renderResults(mount, first.body);
}
