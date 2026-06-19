import { randomUUID } from "node:crypto";
import { getCookie, setCookie } from "hono/cookie";
import type { MiddlewareHandler } from "hono";

export const SESSION_COOKIE_NAME = "de_session";

export type SessionVariables = {
  sessionId: string;
};

/**
 * Read the `de_session` cookie if present, otherwise mint a UUID and set it
 * with HttpOnly + SameSite=Lax + Path=/, no Max-Age (browser-session
 * lifetime per FR-006 / spec Q15). The chosen session ID is exposed on the
 * Hono context as `sessionId`.
 */
export const sessionCookie: MiddlewareHandler<{
  Variables: SessionVariables;
}> = async (c, next) => {
  let id = getCookie(c, SESSION_COOKIE_NAME);
  if (!id) {
    id = randomUUID();
    setCookie(c, SESSION_COOKIE_NAME, id, {
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
    });
  }
  c.set("sessionId", id);
  await next();
};
