import * as fs from "node:fs";
import * as path from "node:path";
import {
  catalogFileSchema,
  type CreateDuckInput,
  type Duck,
} from "./duck.js";
import {
  DuckNotFoundError,
  DuplicateNameError,
  ValidationError,
} from "./errors.js";
import { slug } from "../lib/slug.js";

export type SearchQuery = {
  q?: string;
  categories?: string[];
  minPriceCents?: number;
  maxPriceCents?: number;
};

export type CatalogStore = {
  list(): Duck[];
  findById(id: string): Duck | undefined;
  search(query: SearchQuery): Duck[];
  add(input: CreateDuckInput): Duck;
};

/**
 * Create a JSON-file-backed catalog store.
 *
 * - On first call, if `dataFilePath` does not exist, copy the seed file
 *   (`<dirname>/catalog.seed.json` by default) into it.
 * - The full duck array lives in memory after load.
 * - Writes are atomic: write to a temp file in the same directory, then
 *   rename over the destination.
 */
export function createCatalogStore(
  dataFilePath: string,
  seedFilePath?: string
): CatalogStore {
  const dataPath = path.resolve(dataFilePath);
  const seedPath = seedFilePath
    ? path.resolve(seedFilePath)
    : path.join(path.dirname(dataPath), "catalog.seed.json");

  if (!fs.existsSync(dataPath)) {
    if (!fs.existsSync(seedPath)) {
      throw new Error(
        `catalog: neither data file (${dataPath}) nor seed file (${seedPath}) exists`
      );
    }
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.copyFileSync(seedPath, dataPath);
  }

  const raw = fs.readFileSync(dataPath, "utf8");
  const parsed = catalogFileSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(
      `catalog: file at ${dataPath} is not a valid catalog: ${parsed.error.message}`
    );
  }

  const ducks: Duck[] = [...parsed.data.ducks];

  function persist(): void {
    const tmp = `${dataPath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(
      tmp,
      JSON.stringify({ version: 1, ducks }, null, 2),
      "utf8"
    );
    fs.renameSync(tmp, dataPath);
  }

  function list(): Duck[] {
    return [...ducks];
  }

  function findById(id: string): Duck | undefined {
    return ducks.find((d) => d.id === id);
  }

  function search(query: SearchQuery): Duck[] {
    const q = query.q?.trim().toLowerCase();
    const cats = query.categories?.map((c) => c.toLowerCase());
    const min = query.minPriceCents;
    const max = query.maxPriceCents;
    return ducks.filter((d) => {
      if (q && q.length > 0) {
        const hay = `${d.name} ${d.tagline} ${d.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (cats && cats.length > 0) {
        if (!cats.includes(d.category.toLowerCase())) return false;
      }
      if (typeof min === "number" && d.priceCents < min) return false;
      if (typeof max === "number" && d.priceCents > max) return false;
      return true;
    });
  }

  function add(input: CreateDuckInput): Duck {
    let id: string;
    try {
      id = slug(input.name);
    } catch {
      throw new ValidationError("validation failed", {
        name: "name produced an empty slug after normalization",
      });
    }
    const lowerName = input.name.toLowerCase();
    for (const existing of ducks) {
      if (existing.id === id || existing.name.toLowerCase() === lowerName) {
        throw new DuplicateNameError(input.name);
      }
    }
    const duck: Duck = { id, ...input };
    ducks.push(duck);
    try {
      persist();
    } catch (err) {
      ducks.pop();
      throw err;
    }
    return duck;
  }

  return { list, findById, search, add };
}

export { DuckNotFoundError };
