import type { MiddlewareHandler } from "hono";
import { UnauthorizedError } from "../domain/errors.js";

export const ADMIN_HEADER = "X-Admin-Secret";

/**
 * Plain-string compare of the X-Admin-Secret header against the configured
 * secret. No rate limit, no constant-time compare — workshop scope (Q2).
 */
export function createAdminAuth(secret: string): MiddlewareHandler {
  return async (c, next) => {
    const provided = c.req.header(ADMIN_HEADER);
    if (!provided || provided !== secret) {
      throw new UnauthorizedError();
    }
    await next();
  };
}
