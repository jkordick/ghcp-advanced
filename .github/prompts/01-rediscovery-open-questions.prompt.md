---
agent: 'cobol-archaeologist'
description: Phase 1 — Sweep the rediscovery artifacts for gaps, guesses and unresolved behavior.
---

Sweep everything under `docs/modernization/01-rediscovery/` for things that need a human answer. Do **not** re-read the legacy code — this is an audit of the artifacts you have already produced.

Look for:

- Rules stated in hedging language ("appears to", "seems to", "probably").
- Enum values or status codes without a documented meaning.
- Integrations without an owner or purpose.
- Branches noted as "possibly dead" without confirmation.
- Contradictions between `business-rules.md`, `data-model.md` and `integrations.md`.

Consolidate every finding into `docs/modernization/01-rediscovery/open-questions.md` with:

- The specific artifact reference.
- The question, phrased so a domain expert can answer yes/no or fill a blank.
- The blast radius if the answer is wrong (which downstream phase depends on it).

Print the count of open questions grouped by blast radius and stop.
