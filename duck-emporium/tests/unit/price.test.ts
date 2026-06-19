import { describe, it, expect } from "vitest";
import { formatEuroCents } from "../../src/lib/price.js";

describe("formatEuroCents", () => {
  it("formats zero as €0.00", () => {
    expect(formatEuroCents(0)).toBe("€0.00");
  });

  it("formats whole-euro values with two minor digits", () => {
    expect(formatEuroCents(100)).toBe("€1.00");
    expect(formatEuroCents(2500)).toBe("€25.00");
  });

  it("formats sub-euro and mid-cent values", () => {
    expect(formatEuroCents(1)).toBe("€0.01");
    expect(formatEuroCents(99)).toBe("€0.99");
    expect(formatEuroCents(1499)).toBe("€14.99");
  });

  it("formats large values without truncation", () => {
    expect(formatEuroCents(999999)).toBe("€9999.99");
  });

  it("rejects negative integers", () => {
    expect(() => formatEuroCents(-1)).toThrow();
  });

  it("rejects non-integer numbers", () => {
    expect(() => formatEuroCents(1.5)).toThrow();
    expect(() => formatEuroCents(Number.NaN)).toThrow();
  });
});
