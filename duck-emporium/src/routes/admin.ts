import { Hono } from "hono";
import { z } from "zod";
import type { CatalogStore } from "../domain/catalog.js";
import { createDuckInputSchema } from "../domain/duck.js";
import { ValidationError } from "../domain/errors.js";
import { createAdminAuth } from "../middleware/admin-auth.js";

export function createAdminRoutes(
  catalog: CatalogStore,
  adminSecret: string
): Hono {
  const app = new Hono();
  app.use("*", createAdminAuth(adminSecret));

  app.post("/ducks", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      throw new ValidationError("request body must be valid JSON");
    }
    const parsed = createDuckInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("validation failed", zodFields(parsed.error));
    }
    const duck = catalog.add(parsed.data);
    console.log(
      `[audit] ${new Date().toISOString()} duck_added name="${duck.name}" slug="${duck.id}"`
    );
    return c.json(duck, 201);
  });

  return app;
}

function zodFields(err: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    if (issue.code === "unrecognized_keys" && Array.isArray(issue.keys)) {
      for (const key of issue.keys) {
        if (!(key in fields)) fields[key] = "unknown field is not allowed";
      }
      continue;
    }
    const key = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    if (!(key in fields)) fields[key] = issue.message;
  }
  return fields;
}
