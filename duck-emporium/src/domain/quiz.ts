import type { CatalogStore } from "./catalog.js";
import type { Duck } from "./duck.js";
import { CatalogEmptyError, ValidationError } from "./errors.js";

export const SCORING_CATEGORIES = [
  "Debugging",
  "Philosopher",
  "Maritime",
  "Wellness",
  "Limited Edition",
] as const;

export type ScoringCategory = (typeof SCORING_CATEGORIES)[number];

export type QuizAnswer = {
  id: string;
  label: string;
  weights: Partial<Record<ScoringCategory, 1 | 2 | 3>>;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  answers: QuizAnswer[];
};

export type QuizSubmission = {
  answers: Record<string, string>;
};

export type QuizResult = {
  duck: Duck;
  message: string;
  detailUrl: string;
};

const QUESTIONS: QuizQuestion[] = [
  {
    id: "q1-bug",
    prompt: "How do you tackle a tough bug?",
    answers: [
      {
        id: "methodical",
        label: "Methodically, line by line.",
        weights: { Debugging: 3 },
      },
      {
        id: "philosophical",
        label: "Ask why the bug exists at all.",
        weights: { Philosopher: 2, Debugging: 1 },
      },
      {
        id: "charge",
        label: "Charge in and refactor.",
        weights: { Maritime: 2 },
      },
      {
        id: "walk",
        label: "Take a walk and come back fresh.",
        weights: { Wellness: 2 },
      },
    ],
  },
  {
    id: "q2-vibe",
    prompt: "Pick a vibe.",
    answers: [
      {
        id: "analytical",
        label: "Analytical.",
        weights: { Debugging: 2 },
      },
      {
        id: "contemplative",
        label: "Contemplative.",
        weights: { Philosopher: 2 },
      },
      {
        id: "adventurous",
        label: "Adventurous.",
        weights: { Maritime: 2 },
      },
      { id: "calm", label: "Calm.", weights: { Wellness: 2 } },
      {
        id: "exclusive",
        label: "Exclusive.",
        weights: { "Limited Edition": 3 },
      },
    ],
  },
  {
    id: "q3-place",
    prompt: "Pick a workspace.",
    answers: [
      {
        id: "desk",
        label: "A tidy desk with three monitors.",
        weights: { Debugging: 2 },
      },
      {
        id: "library",
        label: "A quiet old library.",
        weights: { Philosopher: 2 },
      },
      {
        id: "boat",
        label: "The deck of a small boat.",
        weights: { Maritime: 2 },
      },
      {
        id: "bath",
        label: "A warm bath, candles lit.",
        weights: { Wellness: 2 },
      },
      {
        id: "museum",
        label: "A velvet-roped museum gallery.",
        weights: { "Limited Edition": 2 },
      },
    ],
  },
  {
    id: "q4-drink",
    prompt: "Pick a drink.",
    answers: [
      {
        id: "coffee",
        label: "Strong coffee.",
        weights: { Debugging: 2 },
      },
      {
        id: "tea",
        label: "Herbal tea.",
        weights: { Wellness: 2 },
      },
      {
        id: "grog",
        label: "Grog.",
        weights: { Maritime: 2 },
      },
      {
        id: "champagne",
        label: "Champagne.",
        weights: { "Limited Edition": 2 },
      },
    ],
  },
  {
    id: "q5-quote",
    prompt: "Pick a quote.",
    answers: [
      {
        id: "line47",
        label: "\"The answer is in line 47.\"",
        weights: { Debugging: 2, Philosopher: 1 },
      },
      {
        id: "cogito",
        label: "\"I think, therefore I quack.\"",
        weights: { Philosopher: 3 },
      },
      {
        id: "set-sail",
        label: "\"Set sail!\"",
        weights: { Maritime: 2 },
      },
      {
        id: "breathe",
        label: "\"Breathe.\"",
        weights: { Wellness: 2 },
      },
      {
        id: "rare",
        label: "\"Rare and beautiful.\"",
        weights: { "Limited Edition": 2 },
      },
    ],
  },
];

const MESSAGES: Record<ScoringCategory, string> = {
  Debugging:
    "You are pragmatic and patient. Your duck is a steady debugging companion.",
  Philosopher:
    "You think before you quack. Your duck loves the long view.",
  Maritime:
    "You are bold and ready to set sail. Your duck packs sea legs.",
  Wellness: "You move at your own pace. Your duck floats calmly beside you.",
  "Limited Edition":
    "You appreciate the rare and the beautiful. Your duck is one of a kind.",
};

export function getQuestions(): QuizQuestion[] {
  // Return a fresh deep copy so callers cannot mutate the canonical bank.
  return QUESTIONS.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    answers: q.answers.map((a) => ({
      id: a.id,
      label: a.label,
      weights: { ...a.weights },
    })),
  }));
}

export function scoreSubmission(
  submission: QuizSubmission,
  catalog: CatalogStore
): QuizResult {
  const fields: Record<string, string> = {};
  const submitted = submission.answers ?? {};
  const submittedKeys = new Set(Object.keys(submitted));

  for (const q of QUESTIONS) {
    const aId = submitted[q.id];
    if (aId === undefined) {
      fields[q.id] = "missing answer";
    } else if (!q.answers.some((a) => a.id === aId)) {
      fields[q.id] = "unknown answer id";
    }
    submittedKeys.delete(q.id);
  }
  for (const extra of submittedKeys) {
    fields[extra] = "unknown question id";
  }
  if (Object.keys(fields).length > 0) {
    throw new ValidationError("validation failed", fields);
  }

  const scores = new Map<ScoringCategory, number>();
  for (const cat of SCORING_CATEGORIES) scores.set(cat, 0);
  for (const q of QUESTIONS) {
    const aId = submitted[q.id]!;
    const answer = q.answers.find((a) => a.id === aId)!;
    for (const [cat, weight] of Object.entries(answer.weights) as Array<
      [ScoringCategory, number]
    >) {
      scores.set(cat, (scores.get(cat) ?? 0) + weight);
    }
  }

  // Rank categories by score (desc), then alphabetical (asc) for ties.
  const ranked = [...scores.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1;
  });

  for (const [winningCategory] of ranked) {
    const candidates = catalog
      .list()
      .filter((d) => d.category === winningCategory)
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    if (candidates.length > 0) {
      const duck = candidates[0]!;
      return {
        duck,
        message: MESSAGES[winningCategory],
        detailUrl: `/#/ducks/${duck.id}`,
      };
    }
  }
  throw new CatalogEmptyError();
}
