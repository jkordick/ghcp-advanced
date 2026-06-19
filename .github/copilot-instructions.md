# Project: ghcp-advanced

This is a documentation/workshop repository. The deliverable is `docs/workshop.md`, rendered via [MoaW](https://moaw.dev).

## Conventions

- Workshop content lives in `docs/workshop.md` and follows the MoaW frontmatter schema (`type: workshop`, `level`, `navigation_levels`, etc.).
- Use `##` and `###` for the side-bar navigation. Keep `navigation_levels: 3`.
- Code samples are TypeScript / Node 20+ with ES modules, Express, and `node:`-prefixed imports.
- Shell examples use POSIX syntax; provide PowerShell only when behavior differs.
- Keep callouts in MoaW format: `<div class="info|tip|warning" data-title="…"> > … </div>`.
- Never inline secrets, tokens or personal data in examples.

## What this repo intentionally does NOT do

- It does not ship runnable application code. The "Rubber Duck Emporium" example in Chapter 2 is meant to be built by the reader, *with Copilot*, using the user stories in `user-stories/` as input to the SDD loop.
- It does not pin specific Copilot UI labels — the product evolves; describe features by capability, not by exact menu names.

## Style

- Direct, second-person voice ("you do X").
- Short paragraphs. Tables and callouts over walls of text.
- Each chapter ends with something the reader can *do*, not just *read*.