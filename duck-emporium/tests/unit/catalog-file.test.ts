import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createCatalogStore } from "../../src/domain/catalog.js";
import { DuplicateNameError, ValidationError } from "../../src/domain/errors.js";

const SEED = {
  version: 1,
  ducks: [
    {
      id: "alpha-duck",
      name: "Alpha Duck",
      category: "Debugging",
      priceCents: 1000,
      tagline: "Tagline A",
      description: "Description A",
      personality: ["calm"],
    },
    {
      id: "beta-duck",
      name: "Beta Duck",
      category: "Philosopher",
      priceCents: 2500,
      tagline: "stoic Tagline B",
      description: "Description B",
      personality: ["wise"],
    },
    {
      id: "gamma-duck",
      name: "Gamma Duck",
      category: "Maritime",
      priceCents: 1500,
      tagline: "Tagline C",
      description: "stoic Description C",
      personality: ["bold"],
    },
  ],
};

function makeTmpDir(): {
  dir: string;
  dataFile: string;
  seedFile: string;
} {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "duck-catalog-"));
  const seedFile = path.join(dir, "catalog.seed.json");
  const dataFile = path.join(dir, "catalog.json");
  fs.writeFileSync(seedFile, JSON.stringify(SEED, null, 2), "utf8");
  return { dir, dataFile, seedFile };
}

describe("catalog file store", () => {
  let dirs: ReturnType<typeof makeTmpDir>;

  beforeEach(() => {
    dirs = makeTmpDir();
  });

  it("creates the data file from the seed when missing", () => {
    expect(fs.existsSync(dirs.dataFile)).toBe(false);
    const store = createCatalogStore(dirs.dataFile);
    expect(fs.existsSync(dirs.dataFile)).toBe(true);
    expect(store.list()).toHaveLength(3);
  });

  it("returns [] for a seed with an empty ducks array", () => {
    fs.writeFileSync(
      dirs.seedFile,
      JSON.stringify({ version: 1, ducks: [] }),
      "utf8"
    );
    const store = createCatalogStore(dirs.dataFile);
    expect(store.list()).toEqual([]);
  });

  it("persists added ducks across reload (round-trip via tmp dir)", () => {
    const store1 = createCatalogStore(dirs.dataFile);
    const created = store1.add({
      name: "Delta Duck",
      category: "Wellness",
      priceCents: 1799,
      tagline: "Be the duck.",
      description: "Calm.",
      personality: ["centred"],
    });
    expect(created.id).toBe("delta-duck");

    const store2 = createCatalogStore(dirs.dataFile);
    const reloaded = store2.findById("delta-duck");
    expect(reloaded?.name).toBe("Delta Duck");
    expect(store2.list()).toHaveLength(4);
  });

  it("throws DuplicateNameError on case-insensitive name match", () => {
    const store = createCatalogStore(dirs.dataFile);
    expect(() =>
      store.add({
        name: "ALPHA DUCK",
        category: "Debugging",
        priceCents: 1000,
        tagline: "Tagline",
        description: "Description",
        personality: ["calm"],
      })
    ).toThrow(DuplicateNameError);
  });

  it("throws DuplicateNameError on slug collision", () => {
    const store = createCatalogStore(dirs.dataFile);
    expect(() =>
      store.add({
        name: "alpha duck!",
        category: "Debugging",
        priceCents: 1000,
        tagline: "Tagline",
        description: "Description",
        personality: ["calm"],
      })
    ).toThrow(DuplicateNameError);
  });

  it("throws ValidationError when slug is empty after cleanup", () => {
    const store = createCatalogStore(dirs.dataFile);
    expect(() =>
      store.add({
        name: "!!!",
        category: "Debugging",
        priceCents: 1000,
        tagline: "Tagline",
        description: "Description",
        personality: ["calm"],
      })
    ).toThrow(ValidationError);
  });

  it("filters AND-combined: q + category + price range", () => {
    const store = createCatalogStore(dirs.dataFile);
    const result = store.search({
      q: "stoic",
      categories: ["Philosopher"],
      minPriceCents: 0,
      maxPriceCents: 3000,
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("beta-duck");
  });

  it("treats min/max price bounds as inclusive", () => {
    const store = createCatalogStore(dirs.dataFile);
    const result = store.search({
      minPriceCents: 1500,
      maxPriceCents: 2500,
    });
    expect(result.map((d) => d.id).sort()).toEqual([
      "beta-duck",
      "gamma-duck",
    ]);
  });

  it("returns [] when no duck matches", () => {
    const store = createCatalogStore(dirs.dataFile);
    expect(store.search({ q: "zzzzz" })).toEqual([]);
  });
});
