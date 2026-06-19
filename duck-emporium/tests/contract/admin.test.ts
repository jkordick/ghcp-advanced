import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeApp, TEST_ADMIN_SECRET } from "../_helpers/app.js";

const validDuck = {
  name: "Captain Quack",
  category: "Maritime",
  priceCents: 1899,
  tagline: "Arr.",
  description: "A seafaring duck.",
  personality: ["brave", "loud"],
};

function adminPost(
  app: ReturnType<typeof makeApp>["app"],
  body: unknown,
  headers: Record<string, string> = {}
): Promise<Response> {
  return Promise.resolve(
    app.fetch(
      new Request("http://localhost/api/admin/ducks", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...headers,
        },
        body: JSON.stringify(body),
      })
    )
  );
}

describe("admin contract", () => {
  let logs: string[];

  beforeEach(() => {
    logs = [];
    vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
      logs.push(args.join(" "));
    });
  });

  it("returns 401 when X-Admin-Secret header is missing", async () => {
    const { app } = makeApp();
    const res = await adminPost(app, validDuck);
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 when X-Admin-Secret is wrong", async () => {
    const { app } = makeApp();
    const res = await adminPost(app, validDuck, {
      "x-admin-secret": "nope",
    });
    expect(res.status).toBe(401);
  });

  it("returns 201 with the full Duck including server-derived slug", async () => {
    const { app } = makeApp();
    const res = await adminPost(app, validDuck, {
      "x-admin-secret": TEST_ADMIN_SECRET,
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      id: string;
      name: string;
      category: string;
    };
    expect(body.id).toBe("captain-quack");
    expect(body.name).toBe("Captain Quack");
    expect(body.category).toBe("Maritime");
  });

  it("returns 409 DUPLICATE_NAME on case-insensitive name match", async () => {
    const { app } = makeApp();
    await adminPost(app, validDuck, { "x-admin-secret": TEST_ADMIN_SECRET });
    const res = await adminPost(
      app,
      { ...validDuck, name: "CAPTAIN QUACK" },
      { "x-admin-secret": TEST_ADMIN_SECRET }
    );
    expect(res.status).toBe(409);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("DUPLICATE_NAME");
  });

  it("returns 409 on slug collision from different casing/punctuation", async () => {
    const { app } = makeApp();
    await adminPost(app, validDuck, { "x-admin-secret": TEST_ADMIN_SECRET });
    const res = await adminPost(
      app,
      { ...validDuck, name: "captain---quack!" },
      { "x-admin-secret": TEST_ADMIN_SECRET }
    );
    expect(res.status).toBe(409);
  });

  it("returns 400 with fields.priceCents for negative price", async () => {
    const { app } = makeApp();
    const res = await adminPost(
      app,
      { ...validDuck, priceCents: -10 },
      { "x-admin-secret": TEST_ADMIN_SECRET }
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: { code: string; fields?: Record<string, string> };
    };
    expect(body.error.code).toBe("VALIDATION_FAILED");
    expect(body.error.fields?.priceCents).toBeTypeOf("string");
  });

  it("returns 400 with fields.name when name is missing", async () => {
    const { app } = makeApp();
    const { name: _omitted, ...withoutName } = validDuck;
    void _omitted;
    const res = await adminPost(app, withoutName, {
      "x-admin-secret": TEST_ADMIN_SECRET,
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: { fields?: Record<string, string> };
    };
    expect(body.error.fields?.name).toBeTypeOf("string");
  });

  it("returns 400 with fields.stock when stock is present (FR-016, Q11)", async () => {
    const { app } = makeApp();
    const res = await adminPost(
      app,
      { ...validDuck, stock: 5 },
      { "x-admin-secret": TEST_ADMIN_SECRET }
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: { fields?: Record<string, string> };
    };
    expect(body.error.fields?.stock).toBeTypeOf("string");
  });

  it("a successful add appears in subsequent GET /api/ducks", async () => {
    const { app } = makeApp();
    await adminPost(app, validDuck, {
      "x-admin-secret": TEST_ADMIN_SECRET,
    });
    const listRes = await app.fetch(
      new Request("http://localhost/api/ducks")
    );
    const list = (await listRes.json()) as {
      ducks: Array<{ id: string }>;
      total: number;
    };
    expect(list.total).toBe(4);
    expect(list.ducks.find((d) => d.id === "captain-quack")).toBeTruthy();
  });

  it("emits exactly one audit line on success (FR-020)", async () => {
    const { app } = makeApp();
    await adminPost(app, validDuck, {
      "x-admin-secret": TEST_ADMIN_SECRET,
    });
    const auditLines = logs.filter((l) => l.startsWith("[audit] "));
    expect(auditLines).toHaveLength(1);
    expect(auditLines[0]).toMatch(
      /^\[audit\] \S+ duck_added name=".+" slug=".+"$/
    );
  });
});
