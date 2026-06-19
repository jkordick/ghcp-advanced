import type { Context, ErrorHandler, MiddlewareHandler } from "hono";
import { z } from "zod";
import {
  CatalogEmptyError,
  DuckNotFoundError,
  DuplicateNameError,
  LineNotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../domain/errors.js";

type ErrorEnvelope = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};

function envelope(
  code: string,
  message: string,
  fields?: Record<string, string>
): ErrorEnvelope {
  const body: ErrorEnvelope = { error: { code, message } };
  if (fields) body.error.fields = fields;
  return body;
}

function zodToFields(err: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    if (!(key in fields)) fields[key] = issue.message;
  }
  return fields;
}

function mapError(c: Context, err: unknown): Response {
  if (err instanceof ValidationError) {
    return c.json(envelope("VALIDATION_FAILED", err.message, err.fields), 400);
  }
  if (err instanceof z.ZodError) {
    return c.json(
      envelope("VALIDATION_FAILED", "validation failed", zodToFields(err)),
      400
    );
  }
  if (err instanceof DuckNotFoundError || err instanceof LineNotFoundError) {
    return c.json(envelope("NOT_FOUND", err.message), 404);
  }
  if (err instanceof DuplicateNameError) {
    return c.json(envelope("DUPLICATE_NAME", err.message, err.fields), 409);
  }
  if (err instanceof UnauthorizedError) {
    return c.json(envelope("UNAUTHORIZED", err.message), 401);
  }
  if (err instanceof CatalogEmptyError) {
    return c.json(
      envelope(
        "CATALOG_EMPTY",
        "Service temporarily unavailable, please try again."
      ),
      503
    );
  }
  console.error("[duck-emporium] unhandled error:", err);
  return c.json(
    envelope("INTERNAL", "Service temporarily unavailable, please try again."),
    500
  );
}

/** Hono onError handler (preferred surface for caught route errors). */
export const errorHandler: ErrorHandler = (err, c) => mapError(c, err);

/** Backwards-compatible middleware form, kept for parity with the plan. */
export const errorMapper: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (err) {
    return mapError(c, err);
  }
};
