export function formatEuroCents(cents) {
  if (typeof cents !== "number" || !Number.isInteger(cents) || cents < 0) {
    return "€?";
  }
  const euros = Math.floor(cents / 100);
  const remainder = cents % 100;
  return `€${euros}.${String(remainder).padStart(2, "0")}`;
}
