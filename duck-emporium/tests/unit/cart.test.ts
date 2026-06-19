import { describe, it, expect } from "vitest";
import { createCartStore } from "../../src/domain/cart.js";
import {
  LineNotFoundError,
  ValidationError,
} from "../../src/domain/errors.js";

const catalogStub = {
  list: () => [],
  search: () => [],
  add: () => {
    throw new Error("not used");
  },
  findById: (id: string) => {
    const map: Record<
      string,
      { id: string; name: string; priceCents: number; category: string; tagline: string; description: string; personality: string[] }
    > = {
      "alpha-duck": {
        id: "alpha-duck",
        name: "Alpha Duck",
        priceCents: 1000,
        category: "X",
        tagline: "t",
        description: "d",
        personality: ["p"],
      },
      "beta-duck": {
        id: "beta-duck",
        name: "Beta Duck",
        priceCents: 2500,
        category: "X",
        tagline: "t",
        description: "d",
        personality: ["p"],
      },
    };
    return map[id];
  },
};

describe("cart store", () => {
  it("addLine creates a line with default quantity 1", () => {
    const cart = createCartStore();
    const result = cart.addLine("s1", "alpha-duck");
    expect(result.lines).toEqual([{ duckId: "alpha-duck", quantity: 1 }]);
  });

  it("addLine accepts explicit quantity > 1", () => {
    const cart = createCartStore();
    const result = cart.addLine("s1", "alpha-duck", 3);
    expect(result.lines).toEqual([{ duckId: "alpha-duck", quantity: 3 }]);
  });

  it("adding the same duck twice increments the quantity (FR-006)", () => {
    const cart = createCartStore();
    cart.addLine("s1", "alpha-duck", 2);
    const result = cart.addLine("s1", "alpha-duck", 3);
    expect(result.lines).toEqual([{ duckId: "alpha-duck", quantity: 5 }]);
  });

  it("addLine rejects non-positive or non-integer quantities", () => {
    const cart = createCartStore();
    expect(() => cart.addLine("s1", "alpha-duck", 0)).toThrow(ValidationError);
    expect(() => cart.addLine("s1", "alpha-duck", -1)).toThrow(ValidationError);
    expect(() => cart.addLine("s1", "alpha-duck", 1.5)).toThrow(ValidationError);
  });

  it("setLineQuantity rejects non-positive quantities", () => {
    const cart = createCartStore();
    cart.addLine("s1", "alpha-duck", 2);
    expect(() => cart.setLineQuantity("s1", "alpha-duck", 0)).toThrow(
      ValidationError
    );
  });

  it("setLineQuantity throws LineNotFoundError when the line does not exist", () => {
    const cart = createCartStore();
    expect(() =>
      cart.setLineQuantity("s1", "alpha-duck", 1)
    ).toThrow(LineNotFoundError);
  });

  it("removeLine deletes the entry", () => {
    const cart = createCartStore();
    cart.addLine("s1", "alpha-duck", 2);
    cart.addLine("s1", "beta-duck", 1);
    const result = cart.removeLine("s1", "alpha-duck");
    expect(result.lines).toEqual([{ duckId: "beta-duck", quantity: 1 }]);
  });

  it("removeLine throws LineNotFoundError when missing", () => {
    const cart = createCartStore();
    expect(() => cart.removeLine("s1", "alpha-duck")).toThrow(LineNotFoundError);
  });

  it("toView resolves names, prices, and computes totals", () => {
    const cart = createCartStore();
    cart.addLine("s1", "alpha-duck", 2);
    cart.addLine("s1", "beta-duck", 1);
    const view = cart.toView(cart.getCart("s1"), catalogStub);
    expect(view.totalCents).toBe(1000 * 2 + 2500);
    expect(view.lines).toEqual([
      {
        duckId: "alpha-duck",
        quantity: 2,
        name: "Alpha Duck",
        priceCents: 1000,
        lineTotalCents: 2000,
      },
      {
        duckId: "beta-duck",
        quantity: 1,
        name: "Beta Duck",
        priceCents: 2500,
        lineTotalCents: 2500,
      },
    ]);
  });

  it("isolates carts across sessions", () => {
    const cart = createCartStore();
    cart.addLine("s1", "alpha-duck", 2);
    cart.addLine("s2", "beta-duck", 1);
    expect(cart.getCart("s1").lines).toEqual([
      { duckId: "alpha-duck", quantity: 2 },
    ]);
    expect(cart.getCart("s2").lines).toEqual([
      { duckId: "beta-duck", quantity: 1 },
    ]);
  });
});
