---
agent: 'target-architect'
description: Phase 3a — Make ONE architectural decision, cited and reviewable in isolation.
---

Make **one** target-architecture decision. Ask which one if it is not obvious. Candidates:

- Target runtime and platform.
- Module / service boundaries.
- Data model and migration path from the legacy schema.
- Integration contract replacing a specific legacy integration.
- Cross-cutting concern (auth, logging, config, secrets, observability).
- Migration strategy (default: strangler-fig).
- Named risk with mitigation.

Inputs you may read:

- `docs/modernization/01-rediscovery/` (all files).
- `docs/modernization/02-substitution-audit/audit.md`.

Append to `docs/modernization/03a-architecture/target-architecture.md` under a heading for this decision:

- The choice, in one sentence.
- Justification, in 2–4 sentences, citing the rediscovery / audit rows it depends on.
- A mermaid diagram if it clarifies boundaries or data flow.
- Explicit consequences (what this decision forces or forbids in later phases).

If the choice is genuinely open, list two options with trade-offs and **stop without picking**. Never write implementation code or per-module rewrite tasks — that is phase 3b.

Print the decision heading and the rediscovery/audit rows it consumed. Stop.
