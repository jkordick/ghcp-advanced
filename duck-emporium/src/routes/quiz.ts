import { Hono } from "hono";
import type { CatalogStore } from "../domain/catalog.js";
import { ValidationError } from "../domain/errors.js";
import {
  getQuestions,
  scoreSubmission,
  type QuizSubmission,
} from "../domain/quiz.js";

export function createQuizRoutes(catalog: CatalogStore): Hono {
  const app = new Hono();

  app.get("/", (c) => {
    return c.json({ questions: getQuestions() });
  });

  app.post("/", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      throw new ValidationError("request body must be valid JSON");
    }
    if (
      !body ||
      typeof body !== "object" ||
      typeof (body as { answers?: unknown }).answers !== "object" ||
      (body as { answers?: unknown }).answers === null
    ) {
      throw new ValidationError("validation failed", {
        answers: "must be an object mapping questionId to answerId",
      });
    }
    const submission = body as QuizSubmission;
    const result = scoreSubmission(submission, catalog);
    return c.json(result);
  });

  return app;
}
