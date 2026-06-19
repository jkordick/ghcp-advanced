import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { config } from "./config.js";
import { errorHandler } from "./middleware/error-mapper.js";
import {
  sessionCookie,
  type SessionVariables,
} from "./middleware/session-cookie.js";
import { createCatalogStore, type CatalogStore } from "./domain/catalog.js";
import { createCartStore, type CartStore } from "./domain/cart.js";
import { createDotdPicker, type DotdPicker } from "./domain/dotd.js";
import { createCatalogRoutes } from "./routes/catalog.js";
import { createCartRoutes } from "./routes/cart.js";
import { createAdminRoutes } from "./routes/admin.js";
import { createDotdRoutes } from "./routes/dotd.js";
import { createQuizRoutes } from "./routes/quiz.js";

export type AppDeps = {
  catalog: CatalogStore;
  cart: CartStore;
  dotd: DotdPicker;
  adminSecret: string;
};

export type AppEnv = { Variables: SessionVariables };

/**
 * Build a Hono app. All deps are injected so tests construct a fresh app
 * per test (tmp-dir catalog, fresh in-memory cart) and call `app.fetch()`
 * directly — no server bootstrap, no port binding.
 */
export function createApp(deps: AppDeps): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.onError(errorHandler);
  app.use("*", sessionCookie);

  app.route("/api/ducks", createCatalogRoutes(deps.catalog));
  app.route("/api/cart", createCartRoutes(deps.cart, deps.catalog));
  app.route("/api/admin", createAdminRoutes(deps.catalog, deps.adminSecret));
  app.route("/api/duck-of-the-day", createDotdRoutes(deps.dotd));
  app.route("/api/quiz", createQuizRoutes(deps.catalog));

  // Static fallback for the SPA. Mounted last so /api/* wins.
  app.use(
    "/*",
    serveStatic({
      root: "./public",
      rewriteRequestPath: (p) => (p === "/" ? "/index.html" : p),
    })
  );

  return app;
}

export function startServer(port: number = config.port): void {
  const catalog = createCatalogStore(config.dataFile);
  const cart = createCartStore();
  const dotd = createDotdPicker({ catalog });
  const app = createApp({
    catalog,
    cart,
    dotd,
    adminSecret: config.adminSecret,
  });
  console.log(
    `[duck-emporium] catalog seeded: ${catalog.list().length} ducks`
  );
  serve({ fetch: app.fetch, port }, ({ port: actualPort }) => {
    console.log(
      `[duck-emporium] listening on http://localhost:${actualPort}`
    );
  });
}

const isMain =
  process.argv[1] !== undefined &&
  (process.argv[1].endsWith("server.ts") ||
    process.argv[1].endsWith("server.js"));

if (isMain) {
  startServer();
}
