import { describe, it, expect } from "vitest";
import {
  makeApp,
  parseSetCookie,
  cookieHeaderFromSetCookie,
} from "../_helpers/app.js";

async function getSessionCookie(
  app: Awaited<ReturnType<typeof makeApp>>["app"]
): Promise<string> {
  const res = await app.fetch(new Request("http://localhost/api/cart"));
  const header = res.headers.get("set-cookie");
  if (!header) throw new Error("expected a Set-Cookie header on first cart GET");
  return cookieHeaderFromSetCookie(header);
}

describe("cart contract", () => {
  it("GET /api/cart on no cookie returns an empty cart and sets de_session", async () => {
    const { app } = makeApp();
    const res = await app.fetch(new Request("http://localhost/api/cart"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ lines: [], totalCents: 0 });

    const sc = res.headers.get("set-cookie");
    expect(sc).toBeTruthy();
    const parsed = parseSetCookie(sc!);
    expect(parsed.name).toBe("de_session");
    expect(parsed.value).toMatch(/^[0-9a-f-]{36}$/i);
    expect(parsed.attributes["httponly"]).toBe(true);
    expect(parsed.attributes["samesite"]).toBe("Lax");
    expect(parsed.attributes["path"]).toBe("/");
    expect(parsed.attributes["max-age"]).toBeUndefined();
    expect(parsed.attributes["expires"]).toBeUndefined();
  });

  it("POST /api/cart/items returns 201 with the updated cart (FR-006)", async () => {
    const { app } = makeApp();
    const cookie = await getSessionCookie(app);
    const res = await app.fetch(
      new Request("http://localhost/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ duckId: "alpha-duck", quantity: 2 }),
      })
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      lines: Array<{ duckId: string; quantity: number; lineTotalCents: number }>;
      totalCents: number;
    };
    expect(body.lines).toHaveLength(1);
    expect(body.lines[0]!.duckId).toBe("alpha-duck");
    expect(body.lines[0]!.quantity).toBe(2);
    expect(body.totalCents).toBe(2000);
  });

  it("POST with quantity: 0 returns 400 with fields.quantity (FR-009)", async () => {
    const { app } = makeApp();
    const cookie = await getSessionCookie(app);
    const res = await app.fetch(
      new Request("http://localhost/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ duckId: "alpha-duck", quantity: 0 }),
      })
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: { code: string; fields?: Record<string, string> };
    };
    expect(body.error.code).toBe("VALIDATION_FAILED");
    expect(body.error.fields?.quantity).toBeTypeOf("string");
  });

  it("POST with unknown duckId returns 404", async () => {
    const { app } = makeApp();
    const cookie = await getSessionCookie(app);
    const res = await app.fetch(
      new Request("http://localhost/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ duckId: "ghost-duck" }),
      })
    );
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("PATCH on an existing line returns 200 with updated quantity (FR-007)", async () => {
    const { app } = makeApp();
    const cookie = await getSessionCookie(app);
    await app.fetch(
      new Request("http://localhost/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ duckId: "alpha-duck", quantity: 2 }),
      })
    );
    const res = await app.fetch(
      new Request("http://localhost/api/cart/items/alpha-duck", {
        method: "PATCH",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ quantity: 5 }),
      })
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { lines: Array<{ quantity: number }> };
    expect(body.lines[0]!.quantity).toBe(5);
  });

  it("PATCH on a missing line returns 404", async () => {
    const { app } = makeApp();
    const cookie = await getSessionCookie(app);
    const res = await app.fetch(
      new Request("http://localhost/api/cart/items/alpha-duck", {
        method: "PATCH",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ quantity: 5 }),
      })
    );
    expect(res.status).toBe(404);
  });

  it("DELETE on an existing line returns 200 with the line removed (FR-007)", async () => {
    const { app } = makeApp();
    const cookie = await getSessionCookie(app);
    await app.fetch(
      new Request("http://localhost/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ duckId: "alpha-duck" }),
      })
    );
    const res = await app.fetch(
      new Request("http://localhost/api/cart/items/alpha-duck", {
        method: "DELETE",
        headers: { cookie },
      })
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { lines: unknown[] };
    expect(body.lines).toEqual([]);
  });

  it("two cookies yield independent carts (FR-006)", async () => {
    const { app } = makeApp();
    const cookieA = await getSessionCookie(app);
    const cookieB = await getSessionCookie(app);
    expect(cookieA).not.toBe(cookieB);

    await app.fetch(
      new Request("http://localhost/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json", cookie: cookieA },
        body: JSON.stringify({ duckId: "alpha-duck" }),
      })
    );
    const cartB = await app.fetch(
      new Request("http://localhost/api/cart", {
        headers: { cookie: cookieB },
      })
    );
    const bodyB = (await cartB.json()) as { lines: unknown[] };
    expect(bodyB.lines).toEqual([]);
  });
});
