import {
  DuckNotFoundError,
  LineNotFoundError,
  ValidationError,
} from "./errors.js";
import type { CatalogStore } from "./catalog.js";
import type { Duck } from "./duck.js";

export type CartLine = {
  duckId: string;
  quantity: number;
};

export type Cart = {
  sessionId: string;
  lines: CartLine[];
};

export type CartLineView = CartLine & {
  name: string;
  priceCents: number;
  lineTotalCents: number;
};

export type CartView = {
  lines: CartLineView[];
  totalCents: number;
};

export type CartStore = {
  getCart(sessionId: string): Cart;
  addLine(sessionId: string, duckId: string, quantity?: number): Cart;
  setLineQuantity(sessionId: string, duckId: string, quantity: number): Cart;
  removeLine(sessionId: string, duckId: string): Cart;
  toView(cart: Cart, catalog: CatalogStore): CartView;
};

function assertPositiveInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new ValidationError("validation failed", {
      [field]: "must be a positive integer",
    });
  }
}

export function createCartStore(): CartStore {
  const carts = new Map<string, Cart>();

  function getOrCreate(sessionId: string): Cart {
    let cart = carts.get(sessionId);
    if (!cart) {
      cart = { sessionId, lines: [] };
      carts.set(sessionId, cart);
    }
    return cart;
  }

  function clone(cart: Cart): Cart {
    return { sessionId: cart.sessionId, lines: cart.lines.map((l) => ({ ...l })) };
  }

  return {
    getCart(sessionId) {
      return clone(getOrCreate(sessionId));
    },

    addLine(sessionId, duckId, quantity = 1) {
      assertPositiveInteger(quantity, "quantity");
      const cart = getOrCreate(sessionId);
      const existing = cart.lines.find((l) => l.duckId === duckId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.lines.push({ duckId, quantity });
      }
      return clone(cart);
    },

    setLineQuantity(sessionId, duckId, quantity) {
      assertPositiveInteger(quantity, "quantity");
      const cart = getOrCreate(sessionId);
      const line = cart.lines.find((l) => l.duckId === duckId);
      if (!line) throw new LineNotFoundError(duckId);
      line.quantity = quantity;
      return clone(cart);
    },

    removeLine(sessionId, duckId) {
      const cart = getOrCreate(sessionId);
      const idx = cart.lines.findIndex((l) => l.duckId === duckId);
      if (idx === -1) throw new LineNotFoundError(duckId);
      cart.lines.splice(idx, 1);
      return clone(cart);
    },

    toView(cart, catalog) {
      const lines: CartLineView[] = [];
      let totalCents = 0;
      for (const line of cart.lines) {
        const duck: Duck | undefined = catalog.findById(line.duckId);
        if (!duck) {
          // The duck was removed from the catalog while in someone's cart —
          // not currently possible since catalog has no delete, but be defensive.
          throw new DuckNotFoundError(line.duckId);
        }
        const lineTotalCents = duck.priceCents * line.quantity;
        totalCents += lineTotalCents;
        lines.push({
          duckId: line.duckId,
          quantity: line.quantity,
          name: duck.name,
          priceCents: duck.priceCents,
          lineTotalCents,
        });
      }
      return { lines, totalCents };
    },
  };
}
