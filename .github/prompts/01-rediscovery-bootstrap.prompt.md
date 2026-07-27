---
agent: 'cobol-archaeologist'
description: Phase 1 — Bootstrap rediscovery. Scan the repo, produce a high-level map and a curated AGENTS.md.
---

Bootstrap the rediscovery of this legacy IBM COBOL application. No business rules, data model or integrations yet — just orientation.

Do the following and stop:

1. Walk the repository and produce a **high-level map** at `docs/modernization/01-rediscovery/repo-map.md`:
   - Programs (`*.cbl`, `*.CBL`) grouped by subsystem, one line each.
   - Copybooks (`*.cpy`), JCL, DDL/DB schemas, config, tests.
   - Anything unusual (generated code, vendor drops, dead directories).
2. Draft `AGENTS.md` at the repo root with the minimum an agent needs to work here:
   - What this codebase is, in 3–5 lines.
   - Directory conventions and naming rules you inferred.
   - Files/folders the agent should **not** modify during rediscovery.
   - How to run existing tests / builds if such tooling exists.
3. List the subsystems you would tackle first, worst, and last, with a one-line reason each. Put this at the bottom of `repo-map.md` as *Suggested reading order*.

**Do not** extract business rules, propose modernization, or edit legacy code. Cite `path/to/file:LINE` for anything specific.
