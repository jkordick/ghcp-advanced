import { Hono } from "hono";
import type { DotdPicker } from "../domain/dotd.js";

export const DOTD_EMPTY_MESSAGE =
  "The pond is empty today, come back tomorrow.";

export function createDotdRoutes(picker: DotdPicker): Hono {
  const app = new Hono();
  app.get("/", (c) => {
    const result = picker.pick();
    if ("empty" in result) {
      return c.json({ duck: null, message: DOTD_EMPTY_MESSAGE });
    }
    return c.json({
      duck: result.duck,
      detailUrl: `/#/ducks/${result.duck.id}`,
    });
  });
  return app;
}
