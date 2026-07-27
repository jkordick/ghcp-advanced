---
agent: 'cobol-archaeologist'
description: Phase 1 — Reverse-engineer the data model from copybooks, DDL and defensive code.
---

Reverse-engineer the data model. Sources, in order of trust:

1. DDL / DB schema files.
2. Copybooks and record layouts.
3. Invariants enforced only by defensive `IF` / `EVALUATE` in program code.

Append to `docs/modernization/01-rediscovery/data-model.md`:

- Entities with their fields, types and PICTURE clauses.
- Relationships (foreign keys, composite keys, "join by convention").
- Invariants — including the ones only enforced in code, not in the schema. Cite the file/line.
- Value domains for encoded fields (status codes, type flags) with the meaning of each code.

If an entity is ambiguous or the meaning of a code cannot be inferred, log it to `docs/modernization/01-rediscovery/open-questions.md`.

Add a mermaid ER diagram at the top of the file when helpful. Stop when the current pass is done and print what was added.
