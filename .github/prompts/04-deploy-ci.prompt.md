---
agent: 'deployment-engineer'
description: Phase 4 — Emit the CI pipeline for the modernized system. Files only, no live runs.
---

Emit a CI pipeline that builds, tests and scans the modernized code. Read `docs/modernization/03a-architecture/target-architecture.md` for the runtime and platform.

Produce:

- `.github/workflows/ci.yml` with stages: checkout, setup, build, unit tests, **phase-3b acceptance tests** (gating), security scan, IaC lint (if IaC exists), package.
- `docs/modernization/04-deploy/pipeline.md` explaining each stage, its inputs, and its failure semantics.

Rules:

- Reference secrets by name only. Never hard-code values.
- Acceptance tests from every rewritten module must run and gate the workflow.
- The workflow must run from a fresh clone with only public dependencies.
- Do **not** execute the workflow, do **not** publish anything. Emit files only.

Print the files added and stop.
