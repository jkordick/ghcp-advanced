---
agent: 'module-rewriter'
description: Phase 3b — Implement ONE slice of the module rewrite. Tests first, smallest change, verify parity.
---

Implement one slice of the module rewrite. A slice is a group of acceptance tests small enough to review in a single sitting. Ask which slice if it is not obvious.

Loop:

1. Add or extend the runnable test code for the slice. Base it on `docs/modernization/03b-rewrite/<module>/acceptance-tests.md`.
2. Run the tests. They must **fail** against the current implementation before you write any production code.
3. Implement the smallest change in the new codebase that makes them pass. Do not exceed the slice.
4. Run the full module test suite. All previously passing tests must still pass.
5. Confirm the public surface still matches `docs/modernization/03b-rewrite/<module>/interface.md`.

Hard rules:

- If a business rule is ambiguous, **stop** and add the question to `docs/modernization/01-rediscovery/open-questions.md`. Do not invent behavior.
- Do not reintroduce anything the substitution audit marked `retire`.
- Do not touch the legacy code path.

When the slice is green, append its status to `docs/modernization/03b-rewrite/<module>/parity.md`: test id, status, commit ref. Stop and wait for review before the next slice.
