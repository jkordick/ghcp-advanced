---
agent: 'deployment-engineer'
description: Phase 4 — Document the strangler-fig cutover, promotion and rollback path. No live traffic changes.
---

Document how a rewritten module goes from "green in CI" to "serving production traffic" — and how it comes back safely if it doesn't.

Produce:

- `docs/modernization/04-deploy/promotion.md` — dev → staging → production, with the gates at each hop (which tests, which approvals, which health signals).
- `docs/modernization/04-deploy/cutover.md` — the strangler-fig traffic-shifting mechanism for one rewritten module: where the switch lives (router / feature flag / CICS routing / config), the shift schedule (e.g. 1% → 10% → 50% → 100%), and the acceptance criteria for each step.
- `docs/modernization/04-deploy/rollback.md` — how to revert traffic to the legacy path at each shift step, and what state (data, in-flight transactions, side effects) needs reconciliation.

Rules:

- Cite the interface contract from `docs/modernization/03b-rewrite/<module>/interface.md` — the switch only works if the contract holds.
- Cite the phase-3a migration strategy.
- Do **not** perform any live traffic change, deployment, or feature-flag toggle. Documents only.

Print the files added and stop.
