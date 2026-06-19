import { describe, it, expect } from "vitest";
import { slug } from "../../src/lib/slug.js";

describe("slug", () => {
  it("passes through alphanumeric input lowercased", () => {
    expect(slug("socrates")).toBe("socrates");
    expect(slug("Duck123")).toBe("duck123");
  });

  it("replaces spaces with single dashes", () => {
    expect(slug("Socrates Duck")).toBe("socrates-duck");
    expect(slug("Captain   Quack")).toBe("captain-quack");
  });

  it("lowercases mixed case", () => {
    expect(slug("ZEN MASTER Duck")).toBe("zen-master-duck");
  });

  it("collapses punctuation runs to a single dash", () => {
    expect(slug("Captain---!@# Plunder")).toBe("captain-plunder");
    expect(slug("Foo & Bar's Duck!")).toBe("foo-bar-s-duck");
  });

  it("trims leading and trailing dashes", () => {
    expect(slug("   Foo Bar   ")).toBe("foo-bar");
    expect(slug("---bar---")).toBe("bar");
  });

  it("throws when the input is empty after cleanup", () => {
    expect(() => slug("")).toThrow();
    expect(() => slug("!!!")).toThrow();
    expect(() => slug("   ")).toThrow();
  });
});
