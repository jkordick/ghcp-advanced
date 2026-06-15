---
published: true
type: workshop
title: GitHub Copilot Advanced — Spec-Driven Development
short_title: GHCP Advanced — SDD
description: Learn the fundamentals of GitHub Copilot and then go deep on Spec-Driven Development (SDD), the discipline of letting specifications drive your AI-assisted code.
level: intermediate
authors:
  - Julia Kordick
contacts:
  - "@jkordick"
duration_minutes: 180
tags: GitHub, Copilot, AI, Spec-Driven Development, SDD, TypeScript, Node, CLI
navigation_levels: 3
navigation_numbering: true
---

# GitHub Copilot Advanced — Spec-Driven Development

*Version 1.0 — June 2026*

Welcome! This workshop has two parts:

1. **Getting Started with GitHub Copilot** — a single broad chapter for anyone who has never (or barely) used Copilot. It covers completions, Chat, Agent mode, the Copilot CLI, custom instructions, prompt files, chatmodes and MCP servers.
2. **Spec-Driven Development (SDD)** — the main focus. You will learn how to make specifications, not vibes, drive what Copilot builds for you, and you will do it end-to-end on a small TypeScript/Node feature.

A third optional chapter introduces the [Spec Kit](https://github.com/github/spec-kit) tool for teams that are allowed to install it.

<div class="info" data-title="Who is this for?">

> Developers, tech leads and architects who want to use GitHub Copilot **deliberately** instead of reactively. No prior Copilot experience is required — Chapter 1 catches you up fast.

</div>

<div class="warning" data-title="Heads up">

> GitHub Copilot evolves quickly. UI labels, menu locations and feature names may shift between releases. If something looks slightly different in your VS Code, search the Command Palette (`Cmd/Ctrl+Shift+P`) — the feature is almost certainly still there.

</div>

---

## Pre-requisites

You need the following before starting:

|                                 |                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------ |
| A GitHub account                | [Create free GitHub account](https://github.com/join)                          |
| GitHub Copilot access           | Free, Pro, Business or Enterprise — see below                                  |
| Visual Studio Code              | [Download](https://code.visualstudio.com/)                                     |
| GitHub Copilot extension(s)     | [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) and [Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat) |
| Node.js 20+ and npm             | [Install](https://nodejs.org)                                                  |
| GitHub CLI                      | [Install](https://cli.github.com/)                                             |
| Copilot CLI                     | Installed via `gh extension install github/gh-copilot` (see Chapter 1.2)       |
| A terminal                      | Any modern shell (bash, zsh, pwsh)                                             |

### Getting Copilot access

- **Individual free / Pro:** sign up at [github.com/github-copilot/signup](https://github.com/github-copilot/signup).
- **Through your organization:** request access at [github.com/settings/copilot](https://github.com/settings/copilot).

<div class="info" data-title="Enterprise note">

> Some features in this workshop (Agent mode, MCP, the Spec Kit CLI) may be restricted by your organization's policy. The workshop is structured so that each section is **independently useful**; skip what you cannot use.

</div>

---

# Chapter 1 — Getting Started with GitHub Copilot

> If you have never (or only barely) used GitHub Copilot, **start here**. This chapter is intentionally broad and merges what older tutorials call "Level 1 to 3". Skim it if you are already comfortable.

## 1.1 Copilot in VS Code

Open any folder in VS Code with the Copilot extensions installed. You will use four surfaces:

### Inline completions (ghost text)

Start typing and Copilot suggests grey "ghost text". Accept with `Tab`, dismiss with `Esc`, cycle alternatives with `Alt+]` / `Alt+[`.

**Try it.** Create `hello.ts` and type:

```ts
// returns the nth Fibonacci number
function fib(n: number): number {
```

Let Copilot complete the body. Now add a second comment `// returns the nth prime` above a new function and watch how *prior context in the file* steers the suggestion.

### Inline chat (`Cmd/Ctrl+I`)

Select code, press `Cmd/Ctrl+I`, and ask for a transformation: *"add input validation and JSDoc"*, *"convert to async/await"*, *"write a unit test for this"*.

### Chat view (`Cmd/Ctrl+Alt+I`)

The Chat side panel is for conversation about your code. Use `#` to attach context (files, symbols, selection) and `/` for built-in commands (`/explain`, `/fix`, `/tests`, `/new`).

```text
#file:src/auth.ts /explain why does login() throw on empty passwords?
```

### Agent mode

In the Chat view, switch the mode picker from **Ask** to **Agent**. Agent mode can read, create and edit files across your workspace, run terminal commands (with your approval) and iterate until a task is done. This is the surface you will lean on most in Chapter 2.

<div class="tip" data-title="Pick the right mode">

> - **Ask** — questions, explanations, no file changes
> - **Edit** — focused multi-file edits you fully control
> - **Agent** — autonomous task execution; best for spec-driven work

</div>

## 1.2 The Copilot CLI

Copilot is not just an IDE feature. Install the CLI extension for `gh`:

```bash
gh extension install github/gh-copilot
```

Now you can:

```bash
# Ask: what does this shell command do?
gh copilot explain "tar -xzvf archive.tar.gz -C ./out"

# Suggest: how do I do X?
gh copilot suggest "find all files larger than 100MB modified in the last week"
```

There is also a standalone **Copilot CLI** (`copilot`) that gives you an agent in your terminal — the same kind of agent you are talking to right now. Install per the [docs](https://docs.github.com/en/copilot/github-copilot-in-the-cli). It is excellent for spec-driven work outside an IDE (CI scripts, infra repos, anywhere you live in the shell).

**Try it.**

```bash
gh copilot suggest "create a new git branch named feat/login and push it"
```

Read the explanation before running anything. **Never blindly execute** suggested shell commands.

## 1.3 Custom instructions

Copilot reads project-level instructions from `.github/copilot-instructions.md`. Put your *durable* rules there — language, framework, style, testing expectations, things you would otherwise repeat in every prompt.

This repo ships with one. Open [`.github/copilot-instructions.md`](https://github.com/jkordick/ghcp-advanced/blob/main/.github/copilot-instructions.md) and read it. Notice it is short, declarative and project-scoped — not a wall of text.

**Try it.** Add this line to your own project:

```markdown
- All new TypeScript code must use ES modules and `node:`-prefixed imports.
```

Then ask Copilot in Chat: *"create a small file utility that reads a JSON file"*. The output should respect the rule without you mentioning it.

You can also scope instructions with `.github/instructions/*.instructions.md` and a frontmatter `applyTo:` glob — useful in monorepos.

## 1.4 Prompt files

Prompt files (`*.prompt.md`) are **reusable prompts** stored in your repo. They show up in Chat as runnable commands.

Create `.github/prompts/new-feature.prompt.md`:

```markdown
---
mode: agent
description: Scaffold a new feature using our spec-driven workflow
---
You are helping me add a new feature.

1. Ask me clarifying questions until you have an unambiguous spec.
2. Write the spec to `specs/<feature>/spec.md`.
3. Propose a task list in `specs/<feature>/tasks.md`.
4. Wait for my approval before writing code.
```

Run it from Chat with `/new-feature`. Prompt files are the *primitive* you will build SDD on top of in Chapter 2.

## 1.5 Chatmodes

Chatmodes (`*.chatmode.md`) define a **persona + toolset + system prompt** that you switch into from the mode picker. Example: a `Spec Author` chatmode that disables code edits and forces the model to only ask questions and write markdown specs.

```markdown
---
description: Spec Author — only asks questions and writes specs, never edits code.
tools: ['codebase', 'search']
---
You are a senior product engineer acting as a spec author. Never write production
code. Your only outputs are clarifying questions and markdown files under `specs/`.
Stop after producing a spec and wait for explicit approval.
```

Save it as `.github/chatmodes/spec-author.chatmode.md` and pick it from the mode dropdown.

## 1.6 MCP servers

The [Model Context Protocol](https://modelcontextprotocol.io) lets Copilot connect to external tools — issue trackers, databases, browsers, your own services. Configure servers per workspace in `.vscode/mcp.json`:

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

Once connected, Agent mode can call those tools by name. For SDD, an MCP server pointing at your issue tracker is gold: Copilot can read the original ticket, write the spec, and link the PR back.

<div class="info" data-title="Enterprise"> 

> MCP servers may be governed by allow-lists. Check with your platform team before adding new ones.

</div>

## 1.7 Quick mental model

| Surface              | Use for                                          |
| -------------------- | ------------------------------------------------ |
| Inline completion    | Local, line-level help                           |
| Inline chat          | Targeted edits to a selection                    |
| Chat (Ask)           | Questions, explanations                          |
| Chat (Edit)          | Controlled multi-file edits                      |
| Chat (Agent)         | Autonomous tasks — the SDD workhorse             |
| Copilot CLI          | Same power, in the terminal / CI                 |
| Instructions         | Durable, project-wide rules                      |
| Prompt files         | Reusable, parameterizable workflows              |
| Chatmodes            | Personas + tool scoping for a class of tasks     |
| MCP servers          | Real-world tools and data the agent can use      |

You now have the full toolbox. The rest of the workshop is about **using it well**.

---

# Chapter 2 — Spec-Driven Development (the main course)

## 2.1 Why spec-driven?

Most people use Copilot like this:

> *"build me a REST API for managing tasks"*

…and then spend the next hour wrestling with what the model assumed. This is **vibe coding**: you ship intent, the model ships interpretation, and the gap between them becomes bugs.

**Spec-Driven Development (SDD)** flips that order:

```
Idea  →  Spec  →  Plan  →  Tasks  →  Code  →  Verify
        ─────────  the model helps with each step, but YOU own the spec  ─────────
```

The spec is a short, reviewable artifact that pins down **what** must be true when the feature is done. The plan and tasks are *derived* from it. The code is *implemented against* it. Tests *verify* it.

You gain three things:

1. **Reviewability.** A 1-page spec is something a human (or a second AI) can review. 800 lines of generated code is not.
2. **Reusability.** Specs survive rewrites. Code does not.
3. **Determinism.** Two runs from the same spec converge. Two runs from the same vibe diverge.

<div class="tip" data-title="Rule of thumb">

> If you cannot describe the feature in a one-page spec, you do not yet understand it well enough to delegate it to an agent.

</div>

## 2.2 The SDD loop in detail

### Step 1 — Idea → Spec

Open Agent mode. Paste your rough idea. Then say:

> Do not write code yet. Ask me clarifying questions one at a time until you can produce an unambiguous spec. When ready, write it to `specs/<slug>/spec.md` using this outline: Problem, Users, Scope (in/out), Functional requirements, Non-functional requirements, Acceptance criteria, Open questions.

This step is **slow on purpose**. Expect 5–15 questions. Answer them.

### Step 2 — Spec → Plan

Once the spec is accepted, prompt:

> Based on `specs/<slug>/spec.md`, write `specs/<slug>/plan.md`: chosen approach, key components, data model, external dependencies, risks. No code.

### Step 3 — Plan → Tasks

> From the plan, generate `specs/<slug>/tasks.md` as a numbered checklist. Each task must be independently testable and small enough to complete in <15 min. Include acceptance criteria per task.

### Step 4 — Tasks → Code

Now — and only now — let the agent code. One task at a time:

> Implement task #1 from `tasks.md`. Stop and run tests after each file change. Do not start task #2.

### Step 5 — Verify

For each task, the agent should produce or update tests that map back to acceptance criteria in the spec. Your review question is always: *"does this satisfy the spec?"* — not *"is this clever code?"*.

## 2.3 Hands-on: build a "URL shortener" with SDD

You will build a tiny TypeScript/Node CLI that shortens URLs and stores them locally. Total time: ~45 min.

### 2.3.1 Scaffold

```bash
mkdir url-shrink && cd url-shrink
npm init -y
npm i -D typescript tsx vitest @types/node
npx tsc --init
mkdir -p src specs/shrink
git init && git add -A && git commit -m "scaffold"
```

Add a minimal `.github/copilot-instructions.md`:

```markdown
# Project: url-shrink
- Language: TypeScript (ES modules), Node 20+.
- Use `node:`-prefixed built-ins.
- Tests live next to source as `*.test.ts`, run with `vitest`.
- Never edit `specs/**` without explicit instruction.
- Follow the workflow in `.github/prompts/sdd-*.prompt.md`.
```

### 2.3.2 Add the SDD prompt files

Create `.github/prompts/sdd-spec.prompt.md`:

```markdown
---
mode: agent
description: Drive the user from idea to spec.
---
Goal: produce `specs/{slug}/spec.md`.

Rules:
- Ask clarifying questions ONE at a time.
- Do not write code or non-spec files.
- When confident, write the spec using the outline:
  Problem, Users, Scope (in/out), Functional requirements,
  Non-functional requirements, Acceptance criteria, Open questions.
- Stop after writing the spec and wait for approval.
```

Create `.github/prompts/sdd-plan.prompt.md`, `sdd-tasks.prompt.md`, `sdd-implement.prompt.md` following the same pattern (one step each, no shortcuts).

### 2.3.3 Run the loop

In Chat (Agent mode):

```text
/sdd-spec
I want a tiny CLI that takes a long URL and returns a short code, and can resolve a short code back to the URL. Local file storage is fine.
```

Answer the questions. Review `specs/shrink/spec.md`. Iterate until you are happy.

Then:

```text
/sdd-plan
```

Then:

```text
/sdd-tasks
```

Then, task by task:

```text
/sdd-implement task 1
```

```text
/sdd-implement task 2
```

…and so on. **Commit after every passing task.** The git history becomes a living trace of the spec being satisfied step by step.

### 2.3.4 What you should notice

- The agent stops asking *"what did you mean by…?"* mid-implementation — because you front-loaded that in the spec.
- When a test fails, the fix is local to one task, not a sprawling rewrite.
- If you change your mind, you edit the spec and re-run from Step 2. The plan, tasks and code regenerate cleanly.
- A teammate can review `spec.md` + `tasks.md` in 5 minutes and know exactly what shipped.

## 2.4 SDD in the Copilot CLI

Everything above works in the terminal too. Same prompt files, same instructions — just invoked from `copilot` or driven by `gh copilot`. This is how you bring SDD to:

- repos without an IDE workflow (infra, scripts, data pipelines)
- CI jobs that generate code from specs on every PR
- pair sessions over SSH

## 2.5 Anti-patterns to avoid

| Anti-pattern                                       | Fix                                                      |
| -------------------------------------------------- | -------------------------------------------------------- |
| "Just one big prompt that builds the whole thing"  | Split into Spec → Plan → Tasks                           |
| Editing code and spec in the same agent turn       | Two separate prompt files, two separate approvals        |
| Letting the agent invent acceptance criteria       | You write them; the agent only proposes drafts          |
| Specs that describe code ("use a Map<string,…>")    | Specs describe **behavior**; plans describe code         |
| No tests                                           | Each task's "done" = test exists and passes              |

---

# Chapter 3 (optional) — Spec Kit

[Spec Kit](https://github.com/github/spec-kit) is GitHub's open-source toolkit that formalizes the loop you just did by hand. It ships a `specify` CLI that scaffolds the `specs/` layout, prompt files and chatmodes for you, and integrates with several AI agents.

<div class="warning" data-title="Enterprise check">

> Some organizations restrict which CLIs developers can install (`uv`, `uvx`, `npx`, etc.). If `specify` is not allowed in your environment, you have already learned the underlying workflow in Chapter 2 — keep using it.

</div>

## 3.1 Install

```bash
# Using uv (recommended by the project)
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify --help
```

## 3.2 Initialize a project

```bash
specify init my-feature --ai copilot
cd my-feature
```

This creates a structured layout with the SDD phases (`/specify`, `/plan`, `/tasks`, `/implement`) pre-wired as slash commands.

## 3.3 Run the same loop, but guided

In Copilot Chat:

```text
/specify build a URL shortener CLI...
/plan
/tasks
/implement
```

Compare what Spec Kit generates against the hand-rolled prompts from Chapter 2. You will recognize every step — Spec Kit just removes the boilerplate.

## 3.4 When to choose which

| Situation                                                | Use                                |
| -------------------------------------------------------- | ---------------------------------- |
| Locked-down enterprise, no extra tools allowed           | Chapter 2 (hand-rolled prompts)    |
| Greenfield repo, you control tooling                      | Spec Kit                           |
| Teaching SDD to a team for the first time                 | Chapter 2 first, Spec Kit later    |
| Multi-agent project (Copilot + others)                    | Spec Kit (it abstracts the agent)  |

---

# Wrap-up

You have learned:

- The full surface area of GitHub Copilot — IDE, CLI, instructions, prompts, chatmodes, MCP.
- A repeatable, reviewable, agent-friendly development loop: **Idea → Spec → Plan → Tasks → Code → Verify.**
- How to apply that loop with raw Copilot, and (optionally) with Spec Kit.

## Where to go next

- [GitHub Copilot docs](https://docs.github.com/en/copilot)
- [Awesome Copilot](https://github.com/github/awesome-copilot) — community prompts, chatmodes, instructions
- [Spec Kit](https://github.com/github/spec-kit)
- [Model Context Protocol](https://modelcontextprotocol.io)
- The original [GH Copilot HoL](https://moaw.dev/workshop/gh:Philess/GHCopilotHoL/main/docs/) — broader product tour this workshop builds on

<div class="tip" data-title="One thing to try tomorrow">

> Pick the next ticket in your backlog. Before writing a line of code, open Agent mode and run a `/sdd-spec` style prompt. Time-box it to 20 minutes. Notice how much sharper your understanding of the work becomes — that is the real win of SDD.

</div>

Happy spec-driving! 🚀
