import { get, post } from "../api.js";
import { formatEuroCents } from "../format.js";

function escape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function detailView(mount, params, { onCartChanged } = {}) {
  const slug = params.slug;
  const res = await get(`/api/ducks/${encodeURIComponent(slug)}`);
  if (!res.ok || !res.body || res.body.error) {
    mount.innerHTML = `<div class="empty">This duck has waddled away. <a href="#/">Back to catalog</a>.</div>`;
    return;
  }
  const duck = res.body;
  mount.innerHTML = `
    <article class="detail">
      <a class="back-link" href="#/">← Back to catalog</a>
      <span class="category">${escape(duck.category)}</span>
      <h2>${escape(duck.name)}</h2>
      <p class="price">${formatEuroCents(duck.priceCents)}</p>
      <p><em>${escape(duck.tagline)}</em></p>
      <p>${escape(duck.description)}</p>
      <ul class="tags">
        ${duck.personality.map((t) => `<li>${escape(t)}</li>`).join("")}
      </ul>
      <div class="actions">
        <button id="add-to-cart" type="button">Add to cart</button>
        <span id="add-status" class="status" role="status"></span>
      </div>
    </article>
  `;
  const btn = mount.querySelector("#add-to-cart");
  const status = mount.querySelector("#add-status");
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    status.textContent = "Adding…";
    const result = await post("/api/cart/items", {
      duckId: duck.id,
      quantity: 1,
    });
    btn.disabled = false;
    if (result.ok) {
      status.textContent = "Added!";
      if (onCartChanged) onCartChanged();
    } else {
      const msg =
        (result.body && result.body.error && result.body.error.message) ||
        "Could not add to cart.";
      status.textContent = msg;
    }
  });
}
