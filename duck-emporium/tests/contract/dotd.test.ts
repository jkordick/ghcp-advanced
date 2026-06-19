import { describe, expect, it } from "vitest";
import { makeApp } from "../_helpers/app.js";

function fixedClock(iso: string): () => Date {
  return () => new Date(iso);
}

describe("GET /api/duck-of-the-day (US7)", () => {
  it("returns the same duck on 100 sequential calls within the same UTC day", async () => {
    const { app } = makeApp(undefined, {
      now: fixedClock("2025-06-15T10:00:00Z"),
    });
    const first = (await app.fetch(
      new Request("http://localhost/api/duck-of-the-day")
    )) as Response;
    expect(first.status).toBe(200);
    const firstBody = (await first.json()) as {
      duck: { id: string };
      detailUrl: string;
    };
    expect(firstBody.duck).not.toBeNull();
    expect(firstBody.detailUrl).toBe(`/#/ducks/${firstBody.duck.id}`);

    for (let i = 0; i < 99; i++) {
      const res = (await app.fetch(
        new Request("http://localhost/api/duck-of-the-day")
      )) as Response;
      expect(res.status).toBe(200);
      const body = (await res.json()) as { duck: { id: string } };
      expect(body.duck.id).toBe(firstBody.duck.id);
    }
  });

  it("re-picks once the UTC day advances", async () => {
    let dayIndex = 0;
    const days = [
      new Date("2025-06-15T23:00:00Z"),
      new Date("2025-06-16T00:30:00Z"),
    ];
    const { app } = makeApp(undefined, {
      now: () => days[dayIndex]!,
      // Bias to pick distinct ducks across days by alternating index.
      random: () => (dayIndex === 0 ? 0 : 0.99),
    });
    const r1 = (await app.fetch(
      new Request("http://localhost/api/duck-of-the-day")
    )) as Response;
    const b1 = (await r1.json()) as { duck: { id: string } };
    dayIndex = 1;
    const r2 = (await app.fetch(
      new Request("http://localhost/api/duck-of-the-day")
    )) as Response;
    const b2 = (await r2.json()) as { duck: { id: string } };
    expect(b1.duck.id).not.toBe(b2.duck.id);
  });

  it("returns null duck with a graceful message when the catalog is empty", async () => {
    const { app } = makeApp([]);
    const res = (await app.fetch(
      new Request("http://localhost/api/duck-of-the-day")
    )) as Response;
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      duck: null;
      message: string;
    };
    expect(body.duck).toBeNull();
    expect(body.message.length).toBeGreaterThan(0);
  });
});
