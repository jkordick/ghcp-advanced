/**
 * Render integer EUR cents as a "€X.YY" string (FR-038).
 * Throws on negative or non-integer input — money values must always be
 * non-negative integer cents at this point in the pipeline.
 */
export function formatEuroCents(cents: number): string {
  if (!Number.isInteger(cents) || cents < 0) {
    throw new Error(
      "formatEuroCents: cents must be a non-negative integer, got " + cents
    );
  }
  const euros = Math.floor(cents / 100);
  const minor = cents % 100;
  return `€${euros}.${minor.toString().padStart(2, "0")}`;
}
