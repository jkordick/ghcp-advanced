import { register, start } from "./router.js";
import { get } from "./api.js";
import { catalogView } from "./views/catalog.js";
import { detailView } from "./views/detail.js";
import { cartView } from "./views/cart.js";
import { dotdView } from "./views/dotd.js";
import { quizView } from "./views/quiz.js";

async function refreshCartBadge() {
  const res = await get("/api/cart");
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  const total = res.body && Array.isArray(res.body.lines)
    ? res.body.lines.reduce((acc, l) => acc + l.quantity, 0)
    : 0;
  badge.textContent = String(total);
}

function syncActiveNav() {
  const hash = window.location.hash || "#/";
  for (const a of document.querySelectorAll(".site-nav a[data-nav]")) {
    const href = a.getAttribute("href") || "";
    const active =
      href === hash ||
      (hash.startsWith("#/ducks/") && href === "#/") ||
      (hash === "#/" && href === "#/");
    a.classList.toggle("is-active", active);
  }
}

const ctx = { onCartChanged: refreshCartBadge };

register("/", (mount) => catalogView(mount));
register("/ducks/:slug", (mount, params) => detailView(mount, params, ctx));
register("/cart", (mount, params) => cartView(mount, params, ctx));
register("/dotd", (mount) => dotdView(mount));
register("/quiz", (mount) => quizView(mount));

window.addEventListener("hashchange", syncActiveNav);

start();
syncActiveNav();
refreshCartBadge();
