# 🦆 The Rubber Duck Emporium - User Stories

> "*Where every bug meets its match.*"

This folder contains the user stories for the hands-on exercise in [Chapter 2](../docs/workshop.md#chapter-2--spec-driven-development-the-main-course) of the workshop. You will use them as **raw input** for Spec-Driven Development — the whole point is that user stories are *not yet specs*. Your job, together with your agentic AI, is to turn them into specs, plans, tasks and code.

## The product

**The Rubber Duck Emporium** is a (definitely real, totally legitimate) online shop that sells specialty rubber ducks for every conceivable problem in life. Flagship lines include:

- 🪲 **Debugging Ducks** — stare at your code with judgmental glass eyes
- 🧙 **Philosopher Ducks** — Socrates Duck only answers in questions
- 🏴‍☠️ **Maritime Ducks** — pirate, captain, kraken-survivor editions
- 🧘 **Wellness Ducks** — for when your code *and* your soul need help
- 🎩 **Limited Editions** — Edgar Allan Poe Duck ("Quoth the duck, nevermore")

## Personas

| Persona            | Description                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| **Quincy Quacker** | A customer. Browses, searches, buys ducks. Reads reviews. Occasionally takes the duck personality quiz at 2 AM. |
| **Dr. Mallard**    | The Duck Curator. Internal admin. Adds new ducks, edits descriptions, retires ducks that don't sell.  |

## Constraints (apply to ALL stories)

- **Stack:** TypeScript, Node 20+, ES modules. Express is the recommended framework — but Fastify, Hono, or even raw `node:http` work too.
- **Storage:** A local JSON file or SQLite is fine. No cloud services required.
- **Auth:** A single shared admin password from an env var for Dr. Mallard. No real user accounts for Quincy.
- **Payment:** **Mocked.** Never integrate a real payment provider in this workshop.
- **Tests:** Each story's acceptance criteria must be covered by at least one automated test (`vitest`). 

## Story index

| #  | ID                      | Title                              | Persona      | Priority   | Notes                                  |
| -- | ----------------------- | ---------------------------------- | ------------ | ---------- | -------------------------------------- |
| 1  | `browse-catalog`        | Browse the duck catalog            | Quincy       | MVP        | Foundation for everything else         |
| 2  | `duck-detail`           | View a duck's detail page          | Quincy       | MVP        |                                        |
| 3  | `add-to-cart`           | Add ducks to a cart                | Quincy       | MVP        | In-memory or session-scoped is fine    |
| 4  | `checkout`              | Check out with a mocked payment    | Quincy       | MVP        | Generates an order confirmation        |
| 5  | `search-and-filter`     | Search and filter the catalog      | Quincy       | Should     | By category, price range, free text   |
| 6  | `curator-add-duck`      | Curator adds a new duck            | Dr. Mallard  | Should     | Admin-only, password-protected         |
| 7  | `duck-of-the-day`       | Daily featured duck                | Quincy       | Could      | Deterministic per day                  |
| 8  | `personality-quiz`      | "Which duck are you?" quiz         | Quincy       | Could      | The funny one. Don't underestimate it. |
| 9  | `web-frontend`          | Web frontend                       | Quincy       | Should     | SPA over existing API, no build step   |

🦆
