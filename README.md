# AI Public Arsenal

Open-source skills for AI coding assistants — Squad Protocol Engine v4 with protocol-driven management, harness engineering, real validation, and dual-path discovery.

[![npm version](https://img.shields.io/npm/v/@gutomec/ai-public-arsenal)](https://npmjs.com/package/@gutomec/ai-public-arsenal)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> Works with **Claude Code** · **Codex** · **Gemini CLI** · **Cursor** · **Antigravity** · **Windsurf** · **OpenCode**

## Installation

```bash
# Skills CLI (recommended)
npx skills add gutomec/ai-public-arsenal@squads

# npm registry
npm install @gutomec/ai-public-arsenal

# Direct from GitHub
npm install github:gutomec/ai-public-arsenal
```

See [INSTALLATION.md](INSTALLATION.md) for all options and the GitHub-first approach.

## Quick Start

After installing the `squads` skill, open your AI coding assistant and run:

```bash
# List all squads on your machine
*list-squads

# Create a new squad from scratch
*create-squad my-awesome-squad

# Validate a squad before running
*validate-squad my-awesome-squad

# Run a squad workflow
*run-workflow my-awesome-squad main-pipeline
```

Squads are discovered from two locations: `./squads/` (project-local) and `~/squads/` (global). Project-local takes precedence on name collisions.

## What Are Squads?

A squad is a team of AI agents that work together. You define the agents, their tasks, and how they pass work between each other — then run the whole thing with one command.

Think of it like a CI pipeline, but for AI work. A legal review squad might have an extractor pulling key clauses, an analyst flagging risks, a writer summarizing findings, and a validator checking everything. You define it once in YAML, and any project can use it.

Each squad is a directory with:

- **Agents** — specialized AI workers (markdown files with persona, tools, instructions)
- **Tasks** — specific work assignments with pre/post conditions
- **Workflows** — execution order (pipelines, parallel, DAG)
- **Schemas** — JSON Schema validation for agent outputs
- **Config** — coding standards, tech stack, settings

## Skills

| Skill | Version | Description |
|---|---|---|
| **[squads](skills/squads/SKILL.md)** | 4.0.0 | Protocol-driven multi-agent squad management with harness engineering |

### Squad Protocol Engine v4

The `squads` skill is built around [SQUAD_PROTOCOL.md](skills/squads/SQUAD_PROTOCOL.md) — a single source of truth that defines how squads are structured, validated, and executed.

**What it does:**

- **Discovers** squads from `./squads/` and `~/squads/` using filesystem scan
- **Creates** squads with proper structure (agents, tasks, workflows, schemas)
- **Validates** squad integrity (structural checks, schema validation, dependency audit)
- **Activates** squads by registering their agents as available commands
- **Executes** workflows with state management, checkpoints, and resume
- **Upgrades** v1/v2 squads to v3/v4 with backward compatibility

**Runtime protections:**

- **Doom loop detection** — stops agents that keep producing identical output
- **Ralph loop retry** — when a step fails, retries with a fresh context instead of accumulated noise
- **Real validation** — checks outputs against JSON Schema (ajv) before passing to the next agent
- **Context compaction** — trims handoff data to prevent context window overflow
- **Filesystem collaboration** — large artifacts go to disk instead of through context
- **Execution traces** — records timing, I/O, retries, and failures per step
- **Self-verify** — agents check their own work before handing off
- **DAG workflows** — dependency-based execution, not just sequential pipelines

**Backward compatible** — v1 and v2 squads run without changes. New features are opt-in via the `harness:` block in `squad.yaml`.

## Structure

Everything lives under `skills/squads/`:

| Path | What | Files |
|---|---|---|
| [`SKILL.md`](skills/squads/SKILL.md) | Skill entry point | 1 |
| [`SQUAD_PROTOCOL.md`](skills/squads/SQUAD_PROTOCOL.md) | Protocol specification (source of truth) | 1 |
| [`references/`](skills/squads/references/) | Protocol docs (discovery → context-engineering) | 10 |
| [`schemas/`](skills/squads/schemas/) | JSON Schema for agent, squad, task | 3 |
| [`templates/`](skills/squads/templates/) | Scaffolding for new squads | 4 |
| [`scripts/`](skills/squads/scripts/) | Shell utilities (activate, validate) | 2 |
| [`lib/`](skills/squads/lib/) | JS helpers (discovery, display) | 2 |

## Squad Lifecycle Triggers

Squads can emit lifecycle events during execution. Triggers are opt-in per squad:

```yaml
# In squad.yaml
triggers:
  enabled: true
  display: inline    # inline | log | both
  events:
    squad: true      # squad start/end
    agent: true      # agent start/end
    task: true       # task start/end
```

Events are emitted as stream markers (structured HTML comments). Frontends that understand the format can render progress bars, flow graphs, and agent status indicators. Terminals just ignore them.

Set `display: log` to persist events to `.aios/squad-triggers/{squad}.jsonl` for offline analysis.

## Distribution

GitHub is the single source of truth. All channels stay in sync automatically.

| Channel | Command | Always Latest? |
|---|---|---|
| **Skills CLI** | `npx skills add gutomec/ai-public-arsenal@squads` | ✅ |
| **npm** | `npm install @gutomec/ai-public-arsenal` | ✅ |
| **Git clone** | `git clone https://github.com/gutomec/ai-public-arsenal.git` | ✅ |

## References

- [SQUAD_PROTOCOL.md](skills/squads/SQUAD_PROTOCOL.md) — protocol specification
- [01-discovery.md](skills/squads/references/01-discovery.md) — squad discovery engine
- [02-creation.md](skills/squads/references/02-creation.md) — creating new squads
- [03-validation.md](skills/squads/references/03-validation.md) — validation checklist
- [07-execution.md](skills/squads/references/07-execution.md) — workflow execution
- [08-harness.md](skills/squads/references/08-harness.md) — harness engineering (doom loop, ralph loop, traces)
- [INSTALLATION.md](INSTALLATION.md) — installation guide

## License

MIT — see [LICENSE](LICENSE) for details.
