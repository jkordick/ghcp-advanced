import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createApp, type AppEnv } from "../../src/server.js";
import { createCatalogStore, type CatalogStore } from "../../src/domain/catalog.js";
import { createCartStore } from "../../src/domain/cart.js";
import { createDotdPicker } from "../../src/domain/dotd.js";
import type { Hono } from "hono";

export const TEST_ADMIN_SECRET = "test-admin-secret";

export type TestSeedDuck = {
  id: string;
  name: string;
  category: string;
  priceCents: number;
  tagline: string;
  description: string;
  personality: string[];
};

export const DEFAULT_SEED: TestSeedDuck[] = [
  {
    id: "alpha-duck",
    name: "Alpha Duck",
    category: "Debugging",
    priceCents: 1000,
    tagline: "stoic tagline",
    description: "Description A",
    personality: ["calm"],
  },
  {
    id: "beta-duck",
    name: "Beta Duck",
    category: "Philosopher",
    priceCents: 2500,
    tagline: "Tagline B",
    description: "Description B",
    personality: ["wise"],
  },
  {
    id: "gamma-duck",
    name: "Gamma Duck",
    category: "Maritime",
    priceCents: 1500,
    tagline: "Tagline C",
    description: "Description C",
    personality: ["bold"],
  },
];

export function makeApp(
  seed: TestSeedDuck[] = DEFAULT_SEED,
  options: { now?: () => Date; random?: () => number } = {}
): {
  app: Hono<AppEnv>;
  dir: string;
  dataFile: string;
  catalog: CatalogStore;
} {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "duck-app-"));
  const seedFile = path.join(dir, "catalog.seed.json");
  const dataFile = path.join(dir, "catalog.json");
  fs.writeFileSync(
    seedFile,
    JSON.stringify({ version: 1, ducks: seed }, null, 2),
    "utf8"
  );
  const catalog = createCatalogStore(dataFile);
  const cart = createCartStore();
  const dotd = createDotdPicker({
    catalog,
    now: options.now,
    random: options.random,
  });
  const app = createApp({
    catalog,
    cart,
    dotd,
    adminSecret: TEST_ADMIN_SECRET,
  });
  return { app, dir, dataFile, catalog };
}

export const RICH_SEED: TestSeedDuck[] = [
  ...DEFAULT_SEED,
  {
    id: "second-debug-duck",
    name: "Second Debug Duck",
    category: "Debugging",
    priceCents: 1100,
    tagline: "a backup debugger",
    description: "For long debugging sessions.",
    personality: ["patient"],
  },
  {
    id: "plato-duck",
    name: "Plato Duck",
    category: "Philosopher",
    priceCents: 2700,
    tagline: "the form of the duck",
    description: "Allegorical and serene.",
    personality: ["wise"],
  },
  {
    id: "captain-duck",
    name: "Captain Duck",
    category: "Maritime",
    priceCents: 1800,
    tagline: "all hands on deck",
    description: "Commands the pond.",
    personality: ["bold"],
  },
  {
    id: "yoga-duck",
    name: "Yoga Duck",
    category: "Wellness",
    priceCents: 2000,
    tagline: "breathe in, breathe out",
    description: "Centered and calm.",
    personality: ["serene"],
  },
  {
    id: "meditation-duck",
    name: "Meditation Duck",
    category: "Wellness",
    priceCents: 2200,
    tagline: "sit with it",
    description: "For quiet moments.",
    personality: ["calm"],
  },
  {
    id: "golden-anniversary-duck",
    name: "Golden Anniversary Duck",
    category: "Limited Edition",
    priceCents: 9999,
    tagline: "rare and dignified",
    description: "Numbered, gilded.",
    personality: ["exclusive"],
  },
  {
    id: "midnight-duck",
    name: "Midnight Duck",
    category: "Limited Edition",
    priceCents: 8888,
    tagline: "the rarest hour",
    description: "Available once.",
    personality: ["exclusive"],
  },
];

export type ParsedSetCookie = {
  name: string;
  value: string;
  attributes: Record<string, string | true>;
};

export function parseSetCookie(header: string): ParsedSetCookie {
  const parts = header.split(";").map((p) => p.trim());
  const first = parts[0] ?? "";
  const eqIdx = first.indexOf("=");
  const name = first.slice(0, eqIdx);
  const value = first.slice(eqIdx + 1);
  const attributes: Record<string, string | true> = {};
  for (const attr of parts.slice(1)) {
    const i = attr.indexOf("=");
    if (i === -1) {
      attributes[attr.toLowerCase()] = true;
    } else {
      attributes[attr.slice(0, i).toLowerCase()] = attr.slice(i + 1);
    }
  }
  return { name, value, attributes };
}

export function cookieHeaderFromSetCookie(
  setCookieHeader: string
): string {
  const parsed = parseSetCookie(setCookieHeader);
  return `${parsed.name}=${parsed.value}`;
}
