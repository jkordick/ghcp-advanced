import { describe, expect, it } from "vitest";
import { makeApp, parseSetCookie } from "../_helpers/app.js";

describe("happy-path integration", () => {
  it("browse → filter → detail → add×2 → patch → delete → empty", async () => {
    const { app } = makeApp();

    // 1) Browse: list all ducks
    const listRes = (await app.fetch(
      new Request("http://localhost/api/ducks")
    )) as Response;
    expect(listRes.status).toBe(200);
    const listBody = (await listRes.json()) as {
      ducks: Array<{ id: string; category: string; priceCents: number }>;
      total: number;
    };
    expect(listBody.total).toBeGreaterThan(0);

    // 2) Search/filter by category
    const filtered = (await app.fetch(
      new Request("http://localhost/api/ducks?category=Debugging")
    )) as Response;
    expect(filtered.status).toBe(200);
    const filteredBody = (await filtered.json()) as {
      ducks: Array<{ id: string; category: string }>;
    };
    expect(filteredBody.ducks.length).toBeGreaterThan(0);
    for (const d of filteredBody.ducks) {
      expect(d.category).toBe("Debugging");
    }

    // 3) Detail
    const chosen = filteredBody.ducks[0]!;
    const detail = (await app.fetch(
      new Request(`http://localhost/api/ducks/${chosen.id}`)
    )) as Response;
    expect(detail.status).toBe(200);
    const detailBody = (await detail.json()) as {
      id: string;
      priceCents: number;
    };
    expect(detailBody.id).toBe(chosen.id);
    const unit = detailBody.priceCents;

    // 4) Add to cart twice (same duck), capturing the session cookie
    const add1 = (await app.fetch(
      new Request("http://localhost/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ duckId: chosen.id, quantity: 1 }),
      })
    )) as Response;
    expect(add1.status).toBe(201);
    const setCookie = add1.headers.get("set-cookie");
    expect(setCookie).not.toBeNull();
    const parsed = parseSetCookie(setCookie!);
    expect(parsed.name).toBe("de_session");
    const cookieHeader = `${parsed.name}=${parsed.value}`;

    const add2 = (await app.fetch(
      new Request("http://localhost/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json", cookie: cookieHeader },
        body: JSON.stringify({ duckId: chosen.id, quantity: 1 }),
      })
    )) as Response;
    expect(add2.status).toBe(201);

    // 5) Fetch cart → quantity 2 and total = unit × 2
    const cart1 = (await app.fetch(
      new Request("http://localhost/api/cart", {
        headers: { cookie: cookieHeader },
      })
    )) as Response;
    const cart1Body = (await cart1.json()) as {
      lines: Array<{ duckId: string; quantity: number; lineTotalCents: number }>;
      totalCents: number;
    };
    expect(cart1Body.lines).toHaveLength(1);
    expect(cart1Body.lines[0]!.duckId).toBe(chosen.id);
    expect(cart1Body.lines[0]!.quantity).toBe(2);
    expect(cart1Body.lines[0]!.lineTotalCents).toBe(unit * 2);
    expect(cart1Body.totalCents).toBe(unit * 2);

    // 6) Patch quantity → 1
    const patchRes = (await app.fetch(
      new Request(`http://localhost/api/cart/items/${chosen.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", cookie: cookieHeader },
        body: JSON.stringify({ quantity: 1 }),
      })
    )) as Response;
    expect(patchRes.status).toBe(200);
    const patchBody = (await patchRes.json()) as {
      lines: Array<{ quantity: number; lineTotalCents: number }>;
      totalCents: number;
    };
    expect(patchBody.lines[0]!.quantity).toBe(1);
    expect(patchBody.totalCents).toBe(unit);

    // 7) Delete line → empty cart
    const delRes = (await app.fetch(
      new Request(`http://localhost/api/cart/items/${chosen.id}`, {
        method: "DELETE",
        headers: { cookie: cookieHeader },
      })
    )) as Response;
    expect(delRes.status).toBe(200);

    const finalCart = (await app.fetch(
      new Request("http://localhost/api/cart", {
        headers: { cookie: cookieHeader },
      })
    )) as Response;
    const finalBody = (await finalCart.json()) as {
      lines: unknown[];
      totalCents: number;
    };
    expect(finalBody.lines).toEqual([]);
    expect(finalBody.totalCents).toBe(0);
  });
});
