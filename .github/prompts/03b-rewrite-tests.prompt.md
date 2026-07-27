---
agent: 'module-rewriter'
description: Phase 3b — Derive behavior-preserving acceptance tests for ONE module before any rewrite.
---

Derive acceptance tests for **one** module — the same module you intend to rewrite next. Ask which one if it is not obvious.

Sources:

- `docs/modernization/01-rediscovery/business-rules.md` (the module's section).
- `docs/modernization/01-rediscovery/data-model.md` for input/output shapes.

Produce `docs/modernization/03b-rewrite/<module>/acceptance-tests.md`:

- One test per row: `test id | business rule ref | input | expected output | notes`.
- Cover every business rule for the module. If a rule has multiple branches (including edge cases marked "possibly dead"), test each branch.
- If a rule is ambiguous, **stop** and add the question to `docs/modernization/01-rediscovery/open-questions.md`. Never invent expected outputs.

Do **not** write test code yet and do **not** touch the new implementation. This is the acceptance contract, in table form, ready for review. Print the test count and any questions raised. Stop.
