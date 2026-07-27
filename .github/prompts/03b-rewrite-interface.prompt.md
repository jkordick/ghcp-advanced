---
agent: 'module-rewriter'
description: Phase 3b — Define a legacy-identical interface contract for ONE module (strangler-fig switch point).
---

Define the interface contract for the module being rewritten. The contract must let the new implementation replace the legacy one **behind the same interface**, so traffic can be shifted gradually.

Write `docs/modernization/03b-rewrite/<module>/interface.md` with:

- **Entry points** — the exact program / procedure / transaction names callers use today.
- **Input shape** — copybook or record layout, field-by-field, with PICTURE clauses preserved.
- **Output shape** — same treatment.
- **Error / return-code semantics** — every value the legacy code can return and what it means.
- **Side effects** — DB rows, files written, messages sent, in the order they happen.
- **Switch point** — where in the runtime the new implementation is selected (feature flag, router, CICS routing, config toggle). Reference the migration strategy from phase 3a.

If any of the above cannot be answered from the rediscovery artifacts, stop and add the gap to `docs/modernization/01-rediscovery/open-questions.md`. Do not paper over unknowns. Stop when the file is complete.
