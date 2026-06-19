import { z } from "zod";

/**
 * Persisted Duck shape (FR-004, FR-038, FR-040).
 * The full schema is used to validate file contents on load and as the
 * canonical type for API responses.
 */
export const duckSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(80),
  category: z.string().min(1).max(40),
  priceCents: z.number().int().nonnegative(),
  tagline: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  personality: z
    .array(z.string().min(1).max(40))
    .min(1)
    .max(8),
});

export type Duck = z.infer<typeof duckSchema>;

/**
 * Curator-add input. `id` is server-derived (slug). `.strict()` rejects any
 * unknown field (notably `stock`, FR-016, Q11).
 */
export const createDuckInputSchema = z
  .object({
    name: z.string().min(1).max(80),
    category: z.string().min(1).max(40),
    priceCents: z.number().int().nonnegative(),
    tagline: z.string().min(1).max(120),
    description: z.string().min(1).max(2000),
    personality: z
      .array(z.string().min(1).max(40))
      .min(1)
      .max(8),
  })
  .strict();

export type CreateDuckInput = z.infer<typeof createDuckInputSchema>;

/** On-disk catalog file shape. */
export const catalogFileSchema = z.object({
  version: z.literal(1),
  ducks: z.array(duckSchema),
});

export type CatalogFile = z.infer<typeof catalogFileSchema>;
