---
agent: 'cobol-archaeologist'
description: Phase 1 — Inventory every external touchpoint of the legacy system.
---

Inventory every place this system talks to the outside world. Append to `docs/modernization/01-rediscovery/integrations.md`:

- Databases and tables accessed (with the programs that touch them).
- Files read/written — including fixed filesystem paths, dataset names, and expected record layouts.
- Message queues, sockets, CICS/IMS transactions, and any hard-coded hostnames or IPs.
- Third-party or partner systems referenced by name in code or JCL.
- Batch schedules / cron / JCL job triggers.

For each entry: cite `path/to/file:LINE`, note direction (in / out / both), and note whether it is *load-bearing* (production-critical) or *legacy-only* (test fixtures, migration scripts).

If you find a reference to a system whose purpose is unclear, add it to `docs/modernization/01-rediscovery/open-questions.md`. Do not guess what a partner system does.

Stop when the current pass is done and print what was added.
