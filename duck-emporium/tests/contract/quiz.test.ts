import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeApp, RICH_SEED } from "../_helpers/app.js";

const VALID_SUBMISSION = {
  answers: {
    "q1-bug": "methodical",
    "q2-vibe": "analytical",
    "q3-place": "desk",
    "q4-drink": "coffee",
    "q5-quote": "line47",
  },
};

describe("quiz contract (US8)", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
  });
  afterEach(() => {
    logSpy.mockRestore();
  });

  it("GET /api/quiz returns the canonical question bank", async () => {
    const { app } = makeApp(RICH_SEED);
    const res = (await app.fetch(
      new Request("http://localhost/api/quiz")
    )) as Response;
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      questions: Array<{ id: string; prompt: string; answers: unknown[] }>;
    };
    expect(body.questions.length).toBeGreaterThanOrEqual(5);
    for (const q of body.questions) {
      expect(typeof q.id).toBe("string");
      expect(typeof q.prompt).toBe("string");
      expect(Array.isArray(q.answers)).toBe(true);
    }
  });

  it("POST /api/quiz returns a duck + message + detailUrl `/#/ducks/<slug>`", async () => {
    const { app } = makeApp(RICH_SEED);
    const res = (await app.fetch(
      new Request("http://localhost/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(VALID_SUBMISSION),
      })
    )) as Response;
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      duck: { id: string; category: string };
      message: string;
      detailUrl: string;
    };
    expect(body.duck.id).toBe("alpha-duck");
    expect(body.message.length).toBeGreaterThan(0);
    expect(body.detailUrl).toBe("/#/ducks/alpha-duck");
  });

  it("POST /api/quiz returns 400 with fields for missing or unknown answers", async () => {
    const { app } = makeApp(RICH_SEED);
    const res = (await app.fetch(
      new Request("http://localhost/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          answers: { "q1-bug": "not-a-real-answer" },
        }),
      })
    )) as Response;
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: { code: string; fields?: Record<string, string> };
    };
    expect(body.error.code).toBe("VALIDATION_FAILED");
    expect(body.error.fields?.["q1-bug"]).toMatch(/unknown/i);
    expect(body.error.fields?.["q2-vibe"]).toMatch(/missing/i);
  });

  it("POST /api/quiz with a non-object body returns 400", async () => {
    const { app } = makeApp(RICH_SEED);
    const res = (await app.fetch(
      new Request("http://localhost/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(["not", "an", "object"]),
      })
    )) as Response;
    expect(res.status).toBe(400);
  });

  it("POST /api/quiz must not mutate the cart or emit any audit log (FR-029)", async () => {
    const { app } = makeApp(RICH_SEED);

    // Seed a cart via add-to-cart, then snapshot it.
    const addRes = (await app.fetch(
      new Request("http://localhost/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ duckId: "alpha-duck", quantity: 2 }),
      })
    )) as Response;
    expect(addRes.status).toBe(201);
    const setCookie = addRes.headers.get("set-cookie")!;
    const cookieHeader = setCookie.split(";")[0]!;

    const cartBefore = (await app.fetch(
      new Request("http://localhost/api/cart", {
        headers: { cookie: cookieHeader },
      })
    )) as Response;
    const beforeText = await cartBefore.text();

    logSpy.mockClear();

    const quizRes = (await app.fetch(
      new Request("http://localhost/api/quiz", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: cookieHeader,
        },
        body: JSON.stringify(VALID_SUBMISSION),
      })
    )) as Response;
    expect(quizRes.status).toBe(200);

    const cartAfter = (await app.fetch(
      new Request("http://localhost/api/cart", {
        headers: { cookie: cookieHeader },
      })
    )) as Response;
    const afterText = await cartAfter.text();
    expect(afterText).toBe(beforeText);

    const auditLines = logSpy.mock.calls
      .map((args) => String(args[0] ?? ""))
      .filter((line) => line.startsWith("[audit]"));
    expect(auditLines).toEqual([]);
  });
});
