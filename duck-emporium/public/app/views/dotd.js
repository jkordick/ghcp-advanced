import { get } from "../api.js";
import { formatEuroCents } from "../format.js";

function escape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function dotdView(mount) {
  const res = await get("/api/duck-of-the-day");
  if (!res.ok || !res.body) {
    mount.innerHTML = `<div class="error">Could not load today's pick.</div>`;
    return;
  }
  if (res.body.duck === null) {
    mount.innerHTML = `
      <section class="dotd-card">
        <h2>Duck of the Day</h2>
        <p>${escape(res.body.message)}</p>
      </section>
    `;
    return;
  }
  const d = res.body.duck;
  mount.innerHTML = `
    <section class="dotd-card">
      <h2>Duck of the Day</h2>
      <span class="category">${escape(d.category)}</span>
      <h3>${escape(d.name)}</h3>
      <p><em>${escape(d.tagline)}</em></p>
      <p class="price">${formatEuroCents(d.priceCents)}</p>
      <div class="actions" style="display:flex;justify-content:center;">
        <a class="button" href="${escape(res.body.detailUrl)}">See the full story →</a>
      </div>
    </section>
  `;
}
