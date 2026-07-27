---
agent: 'deployment-engineer'
description: Phase 4 — Emit infrastructure-as-code for the target platform chosen in phase 3a.
---

Emit infrastructure-as-code for the platform chosen in `docs/modernization/03a-architecture/target-architecture.md`. Use the IaC flavor that phase 3a specified (Bicep / Terraform / Pulumi / etc.). If phase 3a did not pick one, **stop and ask**.

Produce, under `infra/`:

- Network and identity foundations.
- Compute (containers / functions / app service / etc. per phase 3a).
- Data stores per phase 3a's data-model decision.
- Observability wiring (logs, metrics, traces, health checks).
- Parameter files for `dev`, `staging`, `production` — differences only in scale and secret refs.

Also write `docs/modernization/04-deploy/observability.md` describing the signals the platform will emit and how they map back to rediscovered business rules where relevant.

Rules:

- Secrets are referenced from a vault by name. No inline values.
- Do **not** run `apply`, `az deployment`, `terraform apply`, `pulumi up`, or any equivalent. Emit files only.
- Templates must be runnable from a fresh clone with only the documented prerequisites.

Print the files added and stop.
