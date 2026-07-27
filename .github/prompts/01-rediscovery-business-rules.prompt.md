---
agent: 'cobol-archaeologist'
description: Phase 1 — Extract business rules for ONE module/program. Reviewable in a single sitting.
---

Extract business rules for **one** module or program. Ask which one if it is not obvious from the conversation. Use `docs/modernization/01-rediscovery/repo-map.md` for orientation.

Read only the files that belong to that module (main program + its copybooks + directly-called subprograms). Do not sweep the whole repo.

Append findings to `docs/modernization/01-rediscovery/business-rules.md` under a heading for the module:

- One rule per bullet, in plain English.
- Cite `path/to/file:LINE` for every rule.
- Give a worked example (input → output) for anything non-trivial.
- Preserve edge cases explicitly — including branches that look dead but might not be.

If something cannot be resolved from the code alone, **stop and add it to** `docs/modernization/01-rediscovery/open-questions.md` with the file reference. Never guess.

When done, print a short summary: module name, rule count, open questions raised. Then stop.
