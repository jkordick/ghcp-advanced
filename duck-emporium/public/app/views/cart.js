import { del, get, patch } from "../api.js";
import { formatEuroCents } from "../format.js";

function escape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderEmpty(mount) {
  mount.innerHTML = `
    <section>
      <h2>Your cart</h2>
      <div class="empty">Your cart is empty. <a href="#/">Browse the catalog</a>.</div>
      <div class="cart-summary">
        <span class="total">Total €0.00</span>
        <div class="cart-actions">
          <button type="button" disabled title="Coming soon">Checkout (coming soon)</button>
        </div>
      </div>
    </section>
  `;
}

function renderCart(mount, cart, onCartChanged) {
  if (cart.lines.length === 0) {
    renderEmpty(mount);
    return;
  }
  mount.innerHTML = `
    <section>
      <h2>Your cart</h2>
      <table class="cart-table">
        <thead>
          <tr>
            <th>Duck</th>
            <th>Unit price</th>
            <th>Quantity</th>
            <th>Line total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${cart.lines
            .map(
              (line) => `
            <tr data-duck="${escape(line.duckId)}">
              <td data-label="Duck"><strong>${escape(line.name)}</strong></td>
              <td data-label="Unit price"><span class="price">${formatEuroCents(
                line.unitPriceCents
              )}</span></td>
              <td data-label="Quantity">
                <input type="number" min="1" step="1" value="${line.quantity}" data-qty aria-label="Quantity for ${escape(
                  line.name
                )}" />
              </td>
              <td data-label="Line total"><span class="price">${formatEuroCents(
                line.lineTotalCents
              )}</span></td>
              <td data-label="">
                <button type="button" class="secondary" data-remove>Remove</button>
              </td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
      <div class="cart-summary">
        <span class="total">Total ${formatEuroCents(cart.totalCents)}</span>
        <div class="cart-actions">
          <button type="button" disabled title="Coming soon">Checkout (coming soon)</button>
        </div>
      </div>
    </section>
  `;

  for (const row of mount.querySelectorAll("tr[data-duck]")) {
    const duckId = row.getAttribute("data-duck");
    const qty = row.querySelector("input[data-qty]");
    const removeBtn = row.querySelector("button[data-remove]");
    qty.addEventListener("change", async () => {
      const v = Number(qty.value);
      if (!Number.isInteger(v) || v < 1) {
        qty.value = "1";
        return;
      }
      qty.disabled = true;
      const res = await patch(`/api/cart/items/${encodeURIComponent(duckId)}`, {
        quantity: v,
      });
      qty.disabled = false;
      if (res.ok) {
        renderCart(mount, res.body, onCartChanged);
        if (onCartChanged) onCartChanged();
      }
    });
    removeBtn.addEventListener("click", async () => {
      removeBtn.disabled = true;
      const res = await del(`/api/cart/items/${encodeURIComponent(duckId)}`);
      removeBtn.disabled = false;
      if (res.ok) {
        renderCart(mount, res.body, onCartChanged);
        if (onCartChanged) onCartChanged();
      }
    });
  }
}

export async function cartView(mount, _params, { onCartChanged } = {}) {
  const res = await get("/api/cart");
  if (!res.ok || !res.body) {
    mount.innerHTML = `<div class="error">Could not load cart.</div>`;
    return;
  }
  renderCart(mount, res.body, onCartChanged);
}
