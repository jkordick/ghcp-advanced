import { describe, expect, it } from "vitest";
import { makeApp } from "../_helpers/app.js";

describe("frontend assets", () => {
  it("GET / serves the SPA index.html", async () => {
    const { app } = makeApp();
    const res = (await app.fetch(new Request("http://localhost/"))) as Response;
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/<main id="app"/);
    expect(body).toMatch(/src="\/app\/main\.js"/);
  });

  it("GET /app/views/cart.js exposes the disabled checkout button (SC-005 / FR-033)", async () => {
    const { app } = makeApp();
    const res = (await app.fetch(
      new Request("http://localhost/app/views/cart.js")
    )) as Response;
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/<button[^>]*disabled[^>]*>\s*Checkout \(coming soon\)/);
  });
});
