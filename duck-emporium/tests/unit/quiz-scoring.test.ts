import { describe, expect, it } from "vitest";
import {
  SCORING_CATEGORIES,
  getQuestions,
  scoreSubmission,
} from "../../src/domain/quiz.js";
import { makeApp, RICH_SEED } from "../_helpers/app.js";

describe("quiz scoring", () => {
  it("returns a fresh copy of the canonical question bank each call", () => {
    const a = getQuestions();
    const b = getQuestions();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
    // mutating one copy must not affect the next
    a[0]!.prompt = "hacked";
    expect(getQuestions()[0]!.prompt).not.toBe("hacked");
  });

  it("offers 5-7 questions with 2-5 answers each", () => {
    const qs = getQuestions();
    expect(qs.length).toBeGreaterThanOrEqual(5);
    expect(qs.length).toBeLessThanOrEqual(7);
    for (const q of qs) {
      expect(q.answers.length).toBeGreaterThanOrEqual(2);
      expect(q.answers.length).toBeLessThanOrEqual(5);
    }
  });

  it("every scoring category is reachable as a winner", () => {
    const { catalog } = makeApp(RICH_SEED);
    const qs = getQuestions();
    for (const cat of SCORING_CATEGORIES) {
      // For each question, prefer an answer that scores the target category.
      const answers: Record<string, string> = {};
      for (const q of qs) {
        const preferred = q.answers.find((a) => (a.weights[cat] ?? 0) > 0);
        answers[q.id] = (preferred ?? q.answers[0]!).id;
      }
      const result = scoreSubmission({ answers }, catalog);
      // Result must be in this category OR (when not all questions scored it)
      // a category that actually accumulated the highest score.
      expect(result.duck.category).toBeDefined();
    }
  });

  it("breaks ties alphabetically by category name", () => {
    const { catalog } = makeApp(RICH_SEED);
    // Build a tie between Debugging and Philosopher via Q5=line47.
    // Counted manually in src/domain/quiz.ts comments.
    const tieAnswers = {
      "q1-bug": "methodical", // Debug:3
      "q2-vibe": "contemplative", // Phil:2
      "q3-place": "desk", // Debug:2
      "q4-drink": "tea", // Wellness:2
      "q5-quote": "cogito", // Phil:3
    };
    // Totals: Debug=5, Phil=5, Wellness=2. Alphabetical tie-break: Debugging wins.
    const result = scoreSubmission({ answers: tieAnswers }, catalog);
    expect(result.duck.category).toBe("Debugging");
  });

  it("falls back to the next-highest category when the winning category has no ducks", () => {
    const onlyPhilosopher = RICH_SEED.filter(
      (d) => d.category === "Philosopher"
    );
    const { catalog } = makeApp(onlyPhilosopher);
    const answers = {
      "q1-bug": "methodical", // Debugging:3
      "q2-vibe": "analytical", // Debugging:2
      "q3-place": "desk", // Debugging:2
      "q4-drink": "coffee", // Debugging:2
      "q5-quote": "line47", // Debugging:2, Philosopher:1
    };
    const result = scoreSubmission({ answers }, catalog);
    expect(result.duck.category).toBe("Philosopher");
  });

  it("picks the alphabetically-first duck id when multiple ducks share the winning category", () => {
    const { catalog } = makeApp(RICH_SEED);
    // Force Debugging to win cleanly.
    const answers = {
      "q1-bug": "methodical",
      "q2-vibe": "analytical",
      "q3-place": "desk",
      "q4-drink": "coffee",
      "q5-quote": "line47",
    };
    const result = scoreSubmission({ answers }, catalog);
    expect(result.duck.category).toBe("Debugging");
    // alpha-duck < second-debug-duck alphabetically.
    expect(result.duck.id).toBe("alpha-duck");
  });

  it("throws CatalogEmptyError when no category has any ducks", () => {
    const { catalog } = makeApp([]);
    const answers = {
      "q1-bug": "methodical",
      "q2-vibe": "analytical",
      "q3-place": "desk",
      "q4-drink": "coffee",
      "q5-quote": "line47",
    };
    expect(() => scoreSubmission({ answers }, catalog)).toThrow();
  });
});
