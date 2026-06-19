import { Hono } from "hono";
import { z } from "zod";
import type { CatalogStore } from "../domain/catalog.js";
import { DuckNotFoundError, ValidationError } from "../domain/errors.js";

const intParam = z
  .string()
  .regex(/^-?\d+$/, "must be an integer")
  .transform((v) => Number.parseInt(v, 10));

function parseSearchQuery(raw: URLSearchParams) {
  const out: {
    q?: string;
    categories?: string[];
    minPriceCents?: number;
    maxPriceCents?: number;
  } = {};

  const q = raw.get("q");
  if (q && q.trim().length > 0) out.q = q.trim();

  const categories = raw.getAll("category").filter((c) => c.length > 0);
  if (categories.length > 0) out.categories = categories;

  const min = raw.get("minPriceCents");
  if (min !== null) {
    const parsed = intParam.safeParse(min);
    if (!parsed.success) {
      throw new ValidationError("validation failed", {
        minPriceCents: "must be an integer",
      });
    }
    if (parsed.data < 0) {
      throw new ValidationError("validation failed", {
        minPriceCents: "must be non-negative",
      });
    }
    out.minPriceCents = parsed.data;
  }

  const max = raw.get("maxPriceCents");
  if (max !== null) {
    const parsed = intParam.safeParse(max);
    if (!parsed.success) {
      throw new ValidationError("validation failed", {
        maxPriceCents: "must be an integer",
      });
    }
    if (parsed.data < 0) {
      throw new ValidationError("validation failed", {
        maxPriceCents: "must be non-negative",
      });
    }
    out.maxPriceCents = parsed.data;
  }

  return out;
}

export function createCatalogRoutes(catalog: CatalogStore): Hono {
  const app = new Hono();

  app.get("/", (c) => {
    const url = new URL(c.req.url);
    const query = parseSearchQuery(url.searchParams);
    const hasAnyFilter =
      query.q !== undefined ||
      query.categories !== undefined ||
      query.minPriceCents !== undefined ||
      query.maxPriceCents !== undefined;
    const ducks = hasAnyFilter ? catalog.search(query) : catalog.list();
    return c.json({ ducks, total: ducks.length });
  });

  app.get("/:slug", (c) => {
    const slug = c.req.param("slug");
    const duck = catalog.findById(slug);
    if (!duck) throw new DuckNotFoundError(slug);
    return c.json(duck);
  });

  return app;
}
