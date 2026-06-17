# Story 9 — Web frontend

**ID:** `web-frontend`
**Persona:** Quincy Quacker (customer)
**Priority:** Should

## Story

> **As** a customer visiting The Rubber Duck Emporium,
> **I want** a web-based user interface served by the same application,
> **so that** I can browse ducks, manage my cart, take the quiz, and check out — all from a browser without needing curl or Postman.

## Acceptance criteria

- The server serves a single-page HTML frontend at `GET /` (or a static file route like `/app`).
- The frontend consumes the existing JSON API endpoints — no new backend routes are required.
- **Catalog page**: displays all ducks with name, category, price, and tagline. Includes search/filter controls (free text, category dropdown, price range).
- **Duck detail view**: shows full description, personality traits, stock status, and an "Add to Cart" button.
- **Duck of the Day**: prominently featured on the catalog page or its own section.
- **Cart**: shows current items with quantities, line totals, and a running total. Supports quantity changes and item removal. Includes a "Proceed to Checkout" action.
- **Checkout form**: collects shipping name, email, address, and a (mocked) card number. Displays the order confirmation (order ID, items, total) on success. Shows validation errors inline.
- **Personality quiz**: presents questions one at a time (or all at once), submits answers, and displays the recommended duck with its message.
- The frontend is functional without a build step — vanilla HTML/CSS/JS, or a single bundled file, served as static assets.
- The UI is usable on both desktop and mobile viewports (responsive layout, no horizontal scroll).
- Errors from the API (400, 404, 409) are displayed to the user in a human-friendly way.

## Out of scope (do NOT add)

- Server-side rendering or templating engines.
- A JavaScript framework that requires a build pipeline (React, Vue, Svelte, etc. are overkill here).
- Authentication UI for Dr. Mallard's admin endpoints — admin stays curl-only.
- Image assets for ducks — text/emoji placeholders are fine.
- Offline support or service workers.

## Notes

- Keep it simple: a single `index.html` with embedded or linked CSS/JS is perfectly valid.
- Use `fetch()` against the existing API. The frontend is served from the same origin, so no CORS issues.
- This story depends on all API stories (1–8) being complete — the frontend is a skin over the existing endpoints.

## Open questions to resolve during `/sdd-spec`

- Should the frontend be a single HTML file or split into `index.html` + `style.css` + `app.js`?
- Where should static files live? (`duck-emporium/public/` served via Hono's `serveStatic`?)
- Should the quiz be a multi-step wizard or a single scrollable form?
