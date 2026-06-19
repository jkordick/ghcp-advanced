/**
 * URL-safe slug derivation per data-model.md.
 * Throws if the cleaned-up result is empty (e.g., a name of only punctuation).
 */
export function slug(name: string): string {
  const out = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (out.length === 0) {
    throw new Error("slug: name produced an empty slug");
  }
  return out;
}
