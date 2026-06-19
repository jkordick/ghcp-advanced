import type { CatalogStore } from "./catalog.js";
import type { Duck } from "./duck.js";

export type DailyPick = {
  utcDay: string;
  duckId: string;
};

export type DotdResult = { duck: Duck } | { empty: true };

export type DotdPicker = {
  pick(): DotdResult;
};

export type CreateDotdPickerOptions = {
  catalog: CatalogStore;
  now?: () => Date;
  random?: () => number;
};

/**
 * Daily-pick picker per data-model.md / FR-022. State lives in a single
 * private slot; lost on restart by design.
 */
export function createDotdPicker(opts: CreateDotdPickerOptions): DotdPicker {
  const now = opts.now ?? (() => new Date());
  const random = opts.random ?? Math.random;
  let slot: DailyPick | undefined;

  return {
    pick(): DotdResult {
      const today = utcDay(now());
      if (slot?.utcDay === today) {
        const cached = opts.catalog.findById(slot.duckId);
        if (cached) return { duck: cached };
      }
      const all = opts.catalog.list();
      if (all.length === 0) return { empty: true };
      const chosen = all[Math.floor(random() * all.length)]!;
      slot = { utcDay: today, duckId: chosen.id };
      return { duck: chosen };
    },
  };
}

function utcDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
