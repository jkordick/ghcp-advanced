# ghcp-advanced

**An advanced GitHub Copilot tutorial focused on Spec-Driven Development (SDD).**

This is a [MoaW](https://moaw.dev) workshop. The best way to read it is rendered:

👉 **[Open the workshop on MoaW](https://moaw.dev/workshop/gh:jkordick/ghcp-advanced/main/docs/)**

Or read the raw markdown: [`docs/workshop.md`](docs/workshop.md).

## What you'll learn

1. **Getting Started with GitHub Copilot**: a single broad chapter for anyone who has never (or barely) used GitHub Copilot. It covers inline completions, Chat, Agent mode, the Copilot CLI, custom instructions, prompt files, tools and MCP servers.
2. **Spec-Driven Development (SDD)**: You will learn how to make specifications, drive what GitHub Copilot builds for you, and you will do it end-to-end on a small TypeScript/Node feature.
3. **Introduction of [spec-kit](https://github.com/github/spec-kit)** as a tool to use spec driven development conveniently with most agentic coding tools.
4. (soon) **How to use [squad](https://github.com/bradygaster/squad)** open-source framework for orchestrating multi-agent development teams.
5. **App modernization**: a dedicated chapter on how to use GitHub Copilot to modernize legacy apps, with two hands-on tracks (spec-kit-driven and GitHub Copilot-native custom agents + prompts).
6. **Context Engineering**: Theory foundations (LLMs, agents, context rot) followed by hands-on exercises adding instructions, scoped rules, and skills to a pre-built project.
7. (soon) **Agentic Workflows**
8. **The GitHub Copilot SDK**: Embed Copilot directly into your own apps — open sessions, stream responses, and let Copilot call custom tools you define in TypeScript/Node.
9. **Security, Sandboxing and Guardrails**: How to use Copilot safely in your organization, and how to build your own guardrails for your own agentic AI.

## Pre-reqs

- A GitHub account with Copilot access (Free, Pro, Business or Enterprise)
- VS Code with the GitHub Copilot + Copilot Chat extensions
- Node.js 20+
- GitHub CLI (`gh`) and the `gh copilot` extension

See [the Pre-requisites section of the workshop](docs/workshop.md#pre-requisites) for more details.

## License

MIT — see [LICENSE](LICENSE).

## Credits

Inspired by the excellent [GitHub Copilot HoL by @Philess](https://moaw.dev/workshop/gh:Philess/GHCopilotHoL/main/docs/).


### Julia's to do list
- optional: before creating the spec, ask GHCP to break down the user-stories into reasonable sized github issues, and then generate the spec based on the issues; would need github access + github mcp
- add spec-kit for app mod section
- add squad section
- save the world
