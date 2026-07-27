---
agent: 'substitution-auditor'
description: Phase 2 — Walk one category or subsystem of the rediscovery and produce audit rows.
---

Do one pass of the substitution audit. Ask which **category** or **subsystem** to cover if it is not obvious from the conversation. Suggested categories:

- Home-grown code with a modern equivalent (libraries, platform primitives).
- Dated integrations (SOAP, batch file drops, custom SFTP, on-prem MQ).
- Unfit data stores (mismatched access patterns, EOL engines).
- EOL runtimes / frameworks / base images.
- Cloud-hostile operational assumptions (local FS state, in-memory singletons, "SSH in and restart").

Append rows to `docs/modernization/02-substitution-audit/audit.md`:

| legacy element | rediscovery ref | verdict | reason | trade-off |
|---|---|---|---|---|

Rules:

- `verdict` is exactly one of: `keep-as-is` | `replace-with-library` | `replace-with-platform` | `retire`.
- Every row cites a specific line in `docs/modernization/01-rediscovery/`.
- A `replace-*` verdict without an explicit trade-off is not accepted.
- Do **not** name specific target frameworks, propose service boundaries, or write code. That is phase 3a.

Stop after the pass, print the rows added, and wait for review.
