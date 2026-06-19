import { describe, it, expect } from "vitest";
import { makeApp } from "../_helpers/app.js";

describe("GET /api/ducks (US1 browse, US4 search/filter)", () => {
  it("returns the full seeded catalog", async () => {
    const { app } = makeApp();
    const res = await app.fetch(new Request("http://localhost/api/ducks"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ducks: unknown[]; total: number };
    expect(body.total).toBe(3);
    expect(body.ducks).toHaveLength(3);
  });

  it("exposes the full Duck shape", async () => {
    const { app } = makeApp();
    const res = await app.fetch(new Request("http://localhost/api/ducks"));
    const body = (await res.json()) as {
      ducks: Array<{
        id: string;
        name: string;
        category: string;
        priceCents: number;
        tagline: string;
        description: string;
        personality: string[];
      }>;
    };
    const sample = body.ducks[0]!;
    expect(sample.id).toBeTypeOf("string");
    expect(sample.name).toBeTypeOf("string");
    expect(sample.category).toBeTypeOf("string");
    expect(sample.priceCents).toBeTypeOf("number");
    expect(Number.isInteger(sample.priceCents)).toBe(true);
    expect(sample.tagline).toBeTypeOf("string");
    expect(sample.description).toBeTypeOf("string");
    expect(Array.isArray(sample.personality)).toBe(true);
  });

  it("returns { ducks: [], total: 0 } when the catalog is empty (FR-003)", async () => {
    const { app } = makeApp([]);
    const res = await app.fetch(new Request("http://localhost/api/ducks"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ducks: [], total: 0 });
  });

  it("returns 400 on malformed minPriceCents", async () => {
    const { app } = makeApp();
    const res = await app.fetch(
      new Request("http://localhost/api/ducks?minPriceCents=abc")
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: { code: string; fields?: Record<string, string> };
    };
    expect(body.error.code).toBe("VALIDATION_FAILED");
    expect(body.error.fields?.minPriceCents).toBeTypeOf("string");
  });

  it("matches free text against name/tagline/description case-insensitively", async () => {
    const { app } = makeApp();
    const res = await app.fetch(
      new Request("http://localhost/api/ducks?q=STOIC")
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      ducks: Array<{ id: string }>;
      total: number;
    };
    expect(body.total).toBe(1);
    expect(body.ducks[0]!.id).toBe("alpha-duck");
  });

  it("treats repeated category= params as OR within the filter", async () => {
    const { app } = makeApp();
    const res = await app.fetch(
      new Request(
        "http://localhost/api/ducks?category=Debugging&category=Maritime"
      )
    );
    const body = (await res.json()) as { ducks: Array<{ id: string }> };
    expect(body.ducks.map((d) => d.id).sort()).toEqual([
      "alpha-duck",
      "gamma-duck",
    ]);
  });

  it("treats minPriceCents/maxPriceCents as inclusive bounds", async () => {
    const { app } = makeApp();
    const res = await app.fetch(
      new Request(
        "http://localhost/api/ducks?minPriceCents=1500&maxPriceCents=2500"
      )
    );
    const body = (await res.json()) as { ducks: Array<{ id: string }> };
    expect(body.ducks.map((d) => d.id).sort()).toEqual([
      "beta-duck",
      "gamma-duck",
    ]);
  });

  it("combines q + category + price filters with AND", async () => {
    const { app } = makeApp();
    const res = await app.fetch(
      new Request(
        "http://localhost/api/ducks?q=tagline&category=Philosopher&maxPriceCents=3000"
      )
    );
    const body = (await res.json()) as { ducks: Array<{ id: string }> };
    expect(body.ducks).toHaveLength(1);
    expect(body.ducks[0]!.id).toBe("beta-duck");
  });

  it("returns an empty array with total:0 when no match (FR-015)", async () => {
    const { app } = makeApp();
    const res = await app.fetch(
      new Request("http://localhost/api/ducks?q=zzzzz")
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ducks: [], total: 0 });
  });
});

describe("GET /api/ducks/:slug (US2 detail)", () => {
  it("returns the full Duck for a known slug", async () => {
    const { app } = makeApp();
    const res = await app.fetch(
      new Request("http://localhost/api/ducks/alpha-duck")
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { id: string; name: string };
    expect(body.id).toBe("alpha-duck");
    expect(body.name).toBe("Alpha Duck");
  });

  it("returns 404 with code NOT_FOUND for an unknown slug", async () => {
    const { app } = makeApp();
    const res = await app.fetch(
      new Request("http://localhost/api/ducks/no-such-duck")
    );
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("NOT_FOUND");
  });
});
