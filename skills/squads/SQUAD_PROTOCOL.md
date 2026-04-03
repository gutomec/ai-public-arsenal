# Squad Protocol Specification

```
Title:    Squad Protocol Specification
Version:  1.0.0
Status:   PROPOSED
Date:     2026-04-02
Authors:  Genesis Planning Nirvana
License:  MIT
```

## Table of Contents

1.  [Introduction](#1-introduction)
2.  [Terminology and Conventions](#2-terminology-and-conventions)
3.  [Design Principles](#3-design-principles)
4.  [Squad Definition and Structure](#4-squad-definition-and-structure)
5.  [Agent Specification and Lifecycle](#5-agent-specification-and-lifecycle)
6.  [Task Specification and Lifecycle](#6-task-specification-and-lifecycle)
7.  [Workflow Orchestration](#7-workflow-orchestration)
8.  [Message Format and Communication](#8-message-format-and-communication)
9.  [Tool System and MCP Integration](#9-tool-system-and-mcp-integration)
10. [State Management and Persistence](#10-state-management-and-persistence)
11. [Context Engineering and Compaction](#11-context-engineering-and-compaction)
12. [Error Handling and Recovery](#12-error-handling-and-recovery)
13. [Quality Gates and Validation](#13-quality-gates-and-validation)
14. [Security Considerations](#14-security-considerations)
15. [Versioning and Evolution](#15-versioning-and-evolution)
16. [Implementation Checklist](#16-implementation-checklist)
17. [References](#17-references)
18. [Appendix A: Complete JSON Schemas](#appendix-a-complete-json-schemas)
19. [Appendix B: State Machine Diagrams](#appendix-b-state-machine-diagrams)
20. [Appendix C: Format Guidance](#appendix-c-format-guidance)

---

## 1. Introduction

### 1.1 Purpose

The Squad Protocol defines a portable, implementation-agnostic standard for
multi-agent AI systems. A **squad** is a self-contained unit of agents, tasks,
workflows, and supporting artifacts that collectively accomplish a domain of
work.

### 1.2 Scope

This specification covers:

- Structural definition of squads and their components
- Agent identity, authority, capabilities, and lifecycle
- Task definition, dependency resolution, and execution
- Workflow types, orchestration patterns, and execution modes
- Inter-agent and agent-to-tool communication formats
- Context window engineering and compaction strategies
- Error detection, recovery, and escalation
- Quality gates and constitutional enforcement
- Security boundaries and permission models
- Protocol versioning

### 1.3 Enforcement Model

This protocol contains two categories of mechanism:

| Category | How Enforced | Guarantee Level | Example |
|----------|-------------|-----------------|---------|
| **Harness-enforced** | Runtime code in the harness prevents violations deterministically | HARD | Permission deny rules, tool `isConcurrencySafe` checks, `partitionToolCalls()`, denial tracking limits |
| **Prompt-instruction-based** | LLM system prompts instruct agents to follow rules; no runtime gate prevents violation | SOFT | Agent authority boundaries, constitutional articles, handoff artifact generation, boundary model L1/L2 protections via `.claude/settings.json` deny rules |

Every normative requirement in this specification is tagged with its enforcement category:
- `[HARNESS]` = deterministic runtime enforcement
- `[PROMPT]` = prompt-instruction enforcement (LLM-dependent)
- `[SCHEMA]` = JSON Schema validation (deterministic at load time)
- `[HYBRID]` = combination (e.g., deny rules enforced by harness, but agent delegation is prompt-based)

### 1.4 Evidence Base

| Source | Key Modules Referenced |
|--------|----------------------|
| Claude Code Harness | `withRetry.ts`, `denialTracking.ts`, `toolOrchestration.ts`, `forkedAgent.ts`, `compact.ts`, `autoCompact.ts`, `coordinatorMode.ts`, `permissions.ts` |
| Reference Implementation | `recovery-handler.js`, `squad-schema.json`, `agent-schema.json`, `task-schema.json`, `constitution.md`, workflow rules |

### 1.5 Audience

- **Implementors** building squad-compliant runtimes
- **Squad authors** defining agent teams and workflows
- **Tool providers** integrating with squad systems via MCP
- **Platform operators** deploying and monitoring squad execution

---

## 2. Terminology and Conventions

### 2.1 RFC 2119 Keywords

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT",
"SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this
document are to be interpreted as described in [RFC 2119].

### 2.2 Definitions

| Term | Definition |
|------|-----------|
| **Squad** | A self-contained package of agents, tasks, workflows, and artifacts with a manifest. |
| **Agent** | An autonomous entity with a defined persona, authority scope, capabilities, and commands. |
| **Task** | A discrete unit of work with typed inputs, outputs, steps, validation criteria, and error handling. |
| **Workflow** | A directed composition of tasks with execution rules, gates, and lifecycle management. |
| **Harness** | The runtime environment that loads, validates, and executes squads. |
| **Context Window** | The finite token budget available to an agent for reasoning. |
| **Compaction** | The process of reducing context size while preserving essential information. |
| **Quality Gate** | A checkpoint that MUST pass before execution may proceed. |
| **Doom Loop** | A pathological state where an agent repeatedly attempts a denied action. |
| **Ralph Loop** | An iterative QA review-fix cycle with bounded iterations. |
| **MCP** | Model Context Protocol — the standard for agent-to-tool communication. |
| **Wave** | A group of tasks within a workflow that MAY execute concurrently. |

---

## 3. Design Principles

### P1: Task-First Architecture

Tasks are the primary unit of work. Workflows compose tasks. Agents execute
tasks. The entry point is always a task, never an agent.

### P2: Fail-Closed Defaults `[HARNESS]`

Every permission, capability, and concurrency flag MUST default to the most
restrictive setting. Capabilities are opt-in.

> **Source:** Claude Code `toolOrchestration.ts` — `partitionToolCalls()` treats parse failures as non-concurrent (line ~103: "If isConcurrencySafe throws...treat as not safe").

### P3: Explicit Authority Boundaries `[HYBRID]`

Each agent has an exclusive authority scope. Operations outside that scope
MUST be delegated, never assumed. Authority boundaries are defined in agent
YAML files and `.claude/rules/agent-authority.md` `[PROMPT]`, with deny rules
in `.claude/settings.json` providing harness-level enforcement for file operations `[HARNESS]`.

### P4: Bounded Iteration `[HARNESS + PROMPT]`

All iterative processes MUST have explicit maximum iteration counts.
Unbounded loops are prohibited.

| Mechanism | Bound | Enforcement |
|-----------|-------|-------------|
| Denial tracking | maxConsecutive=3, maxTotal=20 | `[HARNESS]` — `denialTracking.ts` |
| QA Loop | maxIterations=5 | `[PROMPT]` — agent schema default |
| Recovery handler | maxRetries=3 | `[PROMPT]` — `recovery-handler.js` |
| API retry | DEFAULT_MAX_RETRIES=10 | `[HARNESS]` — `withRetry.ts` |

### P5: Context Budget Awareness `[HARNESS]`

Agents MUST operate within finite context windows. The harness MUST
implement automatic compaction when token usage approaches limits.

> **Source:** Claude Code `autoCompact.ts` — triggers when estimated tokens exceed `getEffectiveContextWindowSize(model)`.

### P6: Idempotent Operations

All state-modifying operations SHOULD be idempotent. Retrying a failed
operation MUST NOT produce duplicate side effects.

### P7: Observable Execution `[PROMPT]`

Every significant event (task start, agent switch, error, recovery) MUST
emit structured telemetry. CLI-first observation is preferred over UI.

### P8: Constitutional Governance `[PROMPT]`

Inviolable rules (constitutional articles) guide agent behavior. Violations
are caught through quality gates and review processes. Constitutional rules
are prompt-instruction-based, NOT automatic runtime gates.

> **Enforcement reality:** The "gates" described are task-level checks embedded in task instructions (e.g., `dev-develop-story.md` includes a WARN for CLI-first), not automated code-level enforcement.

### P9: Graceful Degradation `[PROMPT]`

System failures MUST degrade gracefully through progressive strategies:
retry, rollback, skip, escalate.

### P10: Prompt Cache Stability `[HARNESS]`

Built-in tool and message ordering MUST be deterministic to maximize
prompt cache hit rates.

> **Source:** Claude Code sorts built-in tools by prefix for prompt cache stability.

### P11: No Invention `[PROMPT]`

Every specification, requirement, and implementation decision MUST trace
to an explicit source. No features may be invented during execution.

### P12: Semantic Versioning

All squads, schemas, and protocol versions MUST follow SemVer 2.0.0.

---

## 4. Squad Definition and Structure

### 4.1 Manifest Schema `[SCHEMA]`

Every squad MUST contain a `squad.yaml` manifest at its root. The manifest
MUST conform to the following schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Squad Manifest",
  "type": "object",
  "required": ["name", "version"],
  "properties": {
    "name": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "minLength": 2,
      "maxLength": 50,
      "description": "Squad name in kebab-case"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "SemVer version"
    },
    "short-title": {
      "type": "string",
      "maxLength": 100,
      "description": "Short title for the squad"
    },
    "description": {
      "type": "string",
      "maxLength": 500
    },
    "author": {
      "type": "string"
    },
    "license": {
      "type": "string",
      "enum": ["MIT", "Apache-2.0", "ISC", "GPL-3.0", "UNLICENSED"],
      "default": "MIT"
    },
    "slashPrefix": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "Prefix for slash commands"
    },
    "runtime": {
      "type": "object",
      "properties": {
        "minVersion": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$"
        },
        "type": {
          "type": "string",
          "enum": ["squad"],
          "description": "Must be 'squad'"
        }
      }
    },
    "requires": {
      "type": "object",
      "description": "Runtime requirements",
      "properties": {
        "node": { "type": "string", "description": "Node.js version (e.g., >=18.0.0)" },
        "harness": { "type": "string", "description": "Harness version (e.g., >=2.0.0)" }
      }
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Keywords for discovery"
    },
    "components": {
      "type": "object",
      "description": "Task-first: tasks are primary entry point",
      "properties": {
        "tasks":      { "type": "array", "items": { "type": "string" }, "description": "List of task files (primary - task-first!)" },
        "agents":     { "type": "array", "items": { "type": "string" } },
        "workflows":  { "type": "array", "items": { "type": "string" } },
        "checklists": { "type": "array", "items": { "type": "string" } },
        "templates":  { "type": "array", "items": { "type": "string" } },
        "tools":      { "type": "array", "items": { "type": "string" } },
        "scripts":    { "type": "array", "items": { "type": "string" } }
      }
    },
    "scripts": {
      "type": "object",
      "description": "Script definitions organized by category",
      "additionalProperties": {
        "type": "array",
        "items": { "type": "string" }
      }
    },
    "config": {
      "type": "object",
      "properties": {
        "extends": {
          "type": "string",
          "enum": ["extend", "override", "none"],
          "default": "extend"
        },
        "coding-standards": { "type": "string" },
        "tech-stack": { "type": "string" },
        "source-tree": { "type": "string" }
      }
    },
    "dependencies": {
      "type": "object",
      "properties": {
        "node":   { "type": "array", "items": { "type": "string" } },
        "python": { "type": "array", "items": { "type": "string" } },
        "squads": { "type": "array", "items": { "type": "string" } }
      }
    },
    "mcps": {
      "type": "object",
      "description": "MCP server configurations",
      "additionalProperties": true
    },
    "integration": {
      "type": "object",
      "description": "Integration configurations (CI/CD, code review tools, etc.)",
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

### 4.2 Directory Structure

A compliant squad MUST use the following directory layout:

```
{squad-name}/
  squad.yaml              # REQUIRED: manifest
  agents/                 # Agent definition files
    {agent-id}.yaml
  tasks/                  # Task definition files (primary)
    {task-name}.md
  workflows/              # Workflow definition files
    {workflow-name}.yaml
  checklists/             # Quality checklists
    {checklist-name}.md
  templates/              # Reusable templates
    {template-name}.md
  tools/                  # Tool scripts
    {tool-name}.{ext}
  scripts/                # Automation scripts
    {script-name}.{ext}
  data/                   # Static data files
    {data-name}.{ext}
```

### 4.3 Validation `[SCHEMA + PROMPT]`

Squad validation performs checks at load time. The implementation uses
a flexible, graceful approach:

| Check | How | Enforcement |
|-------|-----|-------------|
| Manifest schema | AJV against `squad-schema.json` | `[SCHEMA]` — deterministic |
| File references | Verify referenced files exist | `[HARNESS]` — loader checks |
| Agent schemas | Validate against `agent-schema.json` | `[SCHEMA]` — at load |
| Task format | Check task markdown structure | `[PROMPT]` — flexible parsing |
| Cross-references | Resolve inter-component refs | `[HARNESS]` — loader warnings |
| Workflow DAGs | Check for cycles, validate task refs | `[PROMPT]` — workflow engine |

> **Note:** Schema validation is strict, but structural checks produce warnings
> rather than hard blocks for most issues.

### 4.4 Configuration Hierarchy

Configuration resolves through 3 levels with increasing specificity:

```
Framework Defaults → Project Config → Squad Local Config
```

The `config.extends` field controls merge behavior:

| Value | Behavior |
|-------|----------|
| `extend` | Squad config merges on top of framework defaults |
| `override` | Squad config replaces framework defaults entirely |
| `none` | No framework config is inherited |

### 4.5 Boundary Model `[HYBRID]`

The protocol defines a 4-layer boundary model for protecting artifacts:

| Layer | Mutability | Enforcement | Description |
|-------|-----------|-------------|-------------|
| **L1** Framework Core | NEVER modify | `[HARNESS]` — `.claude/settings.json` deny rules | Core runtime, constitution, CLI entrypoints |
| **L2** Framework Templates | NEVER modify | `[HARNESS]` — `.claude/settings.json` deny rules | Reference tasks, templates, checklists, workflows |
| **L3** Project Config | Conditional | `[HARNESS]` — `.claude/settings.json` allow rules | Data files, agent memory, project config |
| **L4** Project Runtime | ALWAYS modify | No restrictions | Stories, packages, squads, tests |

> L1/L2 protection is enforced by Claude Code's deny rules in `.claude/settings.json`, which ARE harness-enforced. The boundary model is real, not just prompt-based.

---

## 5. Agent Specification and Lifecycle

### 5.1 Agent Definition Format `[SCHEMA]`

Agents are defined in **YAML files** (see [Appendix C](#appendix-c-format-guidance) for format guidance).

The complete Agent Schema includes these fields:

**Required fields:** `agent`, `persona`, `commands`

**Full field inventory:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `agent` | object | YES | Core identification: `name`, `id`, `title`, `icon`, `whenToUse`, `customization` |
| `persona` | object | YES | Role, style, identity, focus, core_principles, responsibility_boundaries |
| `commands` | array | YES | Available commands with name, visibility, args, description |
| `IDE-FILE-RESOLUTION` | array | no | Instructions for resolving file paths in IDE context |
| `REQUEST-RESOLUTION` | string | no | Instructions for matching user requests to commands |
| `activation-instructions` | array | no | Steps to execute when agent is activated |
| `persona_profile` | object | no | Personality: archetype, zodiac, communication (tone, emoji_frequency, vocabulary, greeting_levels, signature_closing) |
| `core_principles` | array | no | Guiding principles for agent behavior |
| `dependencies` | object | no | External resources: tasks, templates, checklists, data, tools, git_restrictions, code_review_integration, decision_logging |
| `develop-story` | object | no | Story development workflow (for @dev agent) |
| `autoClaude` | object | no | Autonomous capabilities: specPipeline, execution, recovery, qa, memory, worktree |

### 5.2 Agent Types

#### 5.2.1 Squad Agents (Domain-Specific) `[PROMPT]`

Domain agents defined in squad manifests with full personas, commands, and
authority boundaries. Examples from a reference implementation:

| Agent ID | Persona | Exclusive Authority |
|----------|---------|-------------------|
| `dev` | Dex | Code implementation, local git operations |
| `qa` | Quinn | Quality review, test execution, QA verdicts |
| `architect` | Aria | Architecture decisions, complexity assessment |
| `pm` | Morgan | Epic orchestration, requirements, spec writing |
| `po` | Pax | Story validation, backlog prioritization |
| `sm` | River | Story creation, template selection |
| `devops` | Gage | `git push`, PR creation, CI/CD, MCP management |
| `analyst` | Alex | Research, dependency analysis |
| `data-engineer` | Dara | Schema design, migrations, query optimization |
| `ux-design-expert` | Uma | UX/UI design, frontend specs |
| `master` | — | Framework governance, can execute ANY task, override boundaries |

#### 5.2.2 Harness Agents (Runtime-Spawned) `[HARNESS]`

Agents created by the harness runtime for execution. Based on Claude Code's
agent spawning patterns:

| Type | Purpose | Tool Access | Model |
|------|---------|-------------|-------|
| `general-purpose` | Full task execution | All tools | Default (inherit) |
| `explore` | Read-only investigation | READ-ONLY tools (disallows Agent, Edit, Write, NotebookEdit, ExitPlanMode) | External: Haiku; Internal: inherit |
| `coordinator` | Multi-agent orchestration | AgentTool, SendMessageTool, TaskStopTool, SyntheticOutputTool, TeamCreateTool, TeamDeleteTool | Default |
| `worker` | Execution under coordinator | ASYNC_AGENT_ALLOWED_TOOLS minus internal tools | Default |
| `fork` | Prompt-cache-sharing subagent | Inherited from parent (filtered) | Default |

### 5.3 Agent Authority Matrix `[PROMPT]`

> **Enforcement reality:** Agent authority is prompt-instruction-based.
> The agent YAML files and `.claude/rules/agent-authority.md` define exclusive operations,
> but NO harness code prevents `@dev` from running `git push`. The deny rules in
> `.claude/settings.json` protect file paths (L1/L2 boundaries) but do NOT enforce
> agent-specific command restrictions. Authority is respected because the LLM follows
> its system prompt — not because the harness blocks violations.

Every agent SHOULD have an explicitly defined authority scope:

```yaml
# Example: agent authority in agent YAML
dependencies:
  git_restrictions:
    allowed_operations: ["git add", "git commit", "git status"]
    blocked_operations: ["git push"]
    redirect_message: "Delegate to @devops for push operations"
```

### 5.4 Agent Lifecycle State Machine

```
                    ┌──────────┐
                    │  UNLOADED │
                    └─────┬─────┘
                          │ load(manifest)
                          ▼
                    ┌───────────┐
             ┌──── │  LOADED    │ ◄──── validate()
             │     └─────┬─────┘
             │           │ activate(@agent)
             │           ▼
             │     ┌───────────┐
             │     │  ACTIVE    │ ◄──┐
             │     └─────┬─────┘    │
             │           │          │ resume(handoff)
             │      ┌────┴────┐    │
             │      ▼         ▼    │
             │  execute()  handoff()
             │      │         │
             │      │         ▼
             │      │   ┌──────────┐
             │      │   │ SUSPENDED │──┘
             │      │   └──────────┘
             │      ▼
             │  ┌───────────┐
             │  │ EXECUTING  │
             │  └─────┬─────┘
             │        │ complete() | fail() | timeout()
             │        ▼
             │  ┌───────────┐
             └─►│ UNLOADED   │
                └───────────┘
```

### 5.5 Agent Handoff Protocol `[PROMPT]`

> **Enforcement reality:** Agent handoff with ~379-token compaction
> is LLM self-compaction guided by prompt instructions, NOT a harness-enforced feature.
> The rules instruct the LLM to "mentally generate a handoff artifact" — there is no
> code that automatically generates or enforces it.

When switching between agents, the **LLM is instructed** to generate a compact
handoff artifact:

#### Handoff Artifact Schema

```yaml
handoff:
  from_agent: "{current_agent_id}"
  to_agent: "{new_agent_id}"
  story_context:
    story_id: "{active story ID}"
    story_path: "{active story path}"
    story_status: "{current status}"
    current_task: "{last task being worked on}"
    branch: "{current git branch}"
  decisions: [...]      # max 5
  files_modified: [...]  # max 10
  blockers: [...]        # max 3
  next_action: "{what the incoming agent should do}"
```

#### Handoff Constraints

| Constraint | Value | Enforcement |
|-----------|-------|-------------|
| Max artifact size | 500 tokens | `[PROMPT]` |
| Max retained summaries | 3 (oldest discarded) | `[PROMPT]` |
| Target compaction | ~379 tokens | `[PROMPT]` — measured target |
| Savings per switch | 33-57% vs retaining full persona | `[PROMPT]` — estimated |

### 5.6 Fork Subagent Pattern `[HARNESS]`

For parallel execution within a single agent session, the protocol supports
**fork subagents** that share the parent's prompt cache:

1. The fork MUST inherit the parent's full conversation as a prefix
2. The API request prefix MUST be byte-identical to maximize cache hits
3. Recursive forking MUST be prevented (detect via `FORK_BOILERPLATE_TAG`)
4. The fork receives a filtered tool set appropriate to its task

> **Source:** Claude Code `forkSubagent.ts`, `forkedAgent.ts`.

---

## 6. Task Specification and Lifecycle

### 6.1 Task Definition Format

Tasks are defined as **Markdown files with YAML frontmatter**. See [Appendix C](#appendix-c-format-guidance) for format guidance.

The complete Task Schema:

**Required fields:** `task` (with `task.name` and `task.responsavel`)

**Full field inventory:**

| Field | Type | Description |
|-------|------|-------------|
| `frontmatter` | object | YAML frontmatter: templates, tools, checklists |
| `task` | object | Core: `name`, `responsavel`, `responsavel_type` (Agente/User/System), `atomic_layer` |
| `inputs` | array | Parameters: `campo`, `tipo`, `origem`, `obrigatorio`, `validacao`, `default` |
| `outputs` | array | Results: `campo`, `tipo`, `destino`, `persistido` |
| `executionModes` | object | Modes: `yolo`, `interactive`, `preflight` with defaults |
| `preConditions` | array | Pre-execution checks: `condition`, `errorMessage` |
| `steps` | array | Ordered steps: `id`, `description`, `actions`, `validation`, `onFailure` |
| `autoClaude` | object | Config: `version`, `deterministic`, `elicit`, `composable`, `pipelinePhase`, `complexity`, `verification`, `selfCritique`, `recovery`, `contextRequirements` |

#### Pipeline Phases (from schema enum)

```
spec-gather, spec-assess, spec-research, spec-write, spec-critique,
plan-create, plan-context, plan-execute, plan-verify,
recovery-track, recovery-rollback,
qa-review, qa-fix,
memory-capture, memory-extract,
worktree-manage, general
```

#### Execution Modes

| Mode | Prompts | Use Case |
|------|---------|----------|
| `yolo` | 0-1 | Fast, autonomous execution |
| `interactive` | 5-10 | Balanced, educational |
| `preflight` | comprehensive | Planning-heavy |

#### Step Failure Handling

| Value | Behavior |
|-------|----------|
| `halt` | Stop execution immediately (default) |
| `retry` | Retry the step |
| `skip` | Skip and continue |
| `escalate` | Escalate to human |

### 6.2 Task Types

The protocol recognizes 7 task types, based on execution environment:

| Type | Description |
|------|-------------|
| `local_bash` | Shell command execution |
| `local_agent` | Agent-mediated task on local system |
| `remote_agent` | Agent task on remote system |
| `in_process_teammate` | Peer agent in same process |
| `local_workflow` | Composite workflow task |
| `monitor_mcp` | MCP server monitoring task |
| `dream` | Background speculative task |

### 6.3 Task Lifecycle State Machine

```
PENDING → QUEUED → RUNNING ⇄ PAUSED
                     │
              ┌──────┼──────┐
              ▼      ▼      ▼
          COMPLETED FAILED  CANCELLED
                     │
                     ▼
                  RETRYING → RUNNING
```

---

## 7. Workflow Orchestration

### 7.1 Workflow Types

| Workflow | Type | Description |
|----------|------|-------------|
| Story Development Cycle (SDC) | Sequential (4-phase) | Create → Validate → Implement → QA |
| QA Loop | Iterative | Review → Fix → Re-review (max 5 iterations) |
| Spec Pipeline | Sequential (6-phase, skippable) | Gather → Assess → Research → Write → Critique → Plan |
| Brownfield Discovery | Sequential (10-phase) | Architecture → DB → UX → Draft → Reviews → Final |

### 7.2 Story Development Cycle

```
@sm create → @po validate → @dev implement → @qa gate → @devops push
```

| Phase | Agent | Task | Output |
|-------|-------|------|--------|
| 1. Create | @sm | `create-next-story.md` | `{epic}.{story}.story.md` |
| 2. Validate | @po | `validate-next-story.md` | GO (>=7/10) or NO-GO |
| 3. Implement | @dev | `dev-develop-story.md` | Working code |
| 4. QA Gate | @qa | `qa-gate.md` | PASS / CONCERNS / FAIL / WAIVED |

### 7.3 QA Loop

```
@qa review → verdict → @dev fixes → re-review (max 5 iterations)
```

**Verdicts:** APPROVE (complete), REJECT (fix + re-review), BLOCKED (escalate immediately)

**Escalation triggers:** `max_iterations_reached`, `verdict_blocked`, `fix_failure`, `manual_escalate`

### 7.4 Spec Pipeline

| Phase | Agent | Output | Skip Condition |
|-------|-------|--------|---------------|
| 1. Gather | @pm | `requirements.json` | Never |
| 2. Assess | @architect | `complexity.json` | source=simple |
| 3. Research | @analyst | `research.json` | SIMPLE class |
| 4. Write | @pm | `spec.md` | Never |
| 5. Critique | @qa | `critique.json` | Never |
| 6. Plan | @architect | `implementation.yaml` | If APPROVED |

**Complexity Classes:** SIMPLE (<=8), STANDARD (9-15), COMPLEX (>=16)

---

## 8. Message Format and Communication

### 8.1 Message Types

| Message Type | Direction | Purpose | Example |
|-------------|-----------|---------|---------|
| `REQUEST` | Agent → Agent | Ask another agent to perform work | "@devops please push" |
| `INFORM` | Agent → Agent | Share results or status | "QA verdict: PASS" |
| `DELEGATE` | Agent → Agent | Formally hand off a task | Handoff artifact |
| `ESCALATE` | Agent → Human | Request human intervention | Recovery escalation report |

### 8.2 Standardized Error Message Format

```json
{
  "type": "error",
  "timestamp": "2026-04-02T10:30:00Z",
  "source": {
    "agent_id": "dev",
    "task_name": "implement-feature",
    "step_id": "3.1"
  },
  "error": {
    "code": "TASK_STEP_FAILED",
    "category": "transient | state | configuration | dependency | fatal",
    "message": "Human-readable description",
    "details": {},
    "recovery_hint": "Suggested recovery action"
  },
  "context": {
    "story_id": "2.1",
    "attempt": 1,
    "max_attempts": 3
  }
}
```

**Error categories** (from `recovery-handler.js` `_classifyError()`):

| Category | Pattern | Default Strategy |
|----------|---------|-----------------|
| `transient` | timeout, network, connection refused | `retry_same_approach` |
| `state` | state corrupt, inconsistent, out of sync | `rollback_and_retry` |
| `configuration` | config missing, env not set | `skip_phase` (non-critical) or `escalate_to_human` |
| `dependency` | module not found, package missing | `trigger_recovery_workflow` |
| `fatal` | out of memory, heap overflow, unrecoverable | `escalate_to_human` |

---

## 9. Tool System and MCP Integration

### 9.1 Tool Concurrency Model `[HARNESS]`

The harness partitions tool calls into concurrent and sequential batches:

```typescript
// From toolOrchestration.ts
function partitionToolCalls(toolUses, tools): Batch[] {
  // For each tool call:
  // 1. Parse input
  // 2. If parse succeeds, check tool.isConcurrencySafe(parsedInput)
  // 3. If isConcurrencySafe throws (e.g., shell-quote parse failure), treat as NOT safe
  // 4. Adjacent concurrency-safe calls are merged into one batch
  // 5. Non-safe calls get their own batch
}
```

**Key guarantee:** Parse failures and `isConcurrencySafe` exceptions default to
sequential execution (fail-closed).

> **Source:** Claude Code `toolOrchestration.ts` lines 84-115.

### 9.2 Tool Tiers

| Tier | Loading | Examples |
|------|---------|---------|
| **1** (Always) | Session start | Read, Write, Edit, Bash, Grep, Glob, Task, Agent |
| **2** (Deferred) | Agent activation / on-demand | git, code review tools, context7, supabase |
| **3** (Deferred) | Via tool search | EXA, Playwright, Apify, Code-Graph |

### 9.3 MCP Integration `[HARNESS]`

MCP servers are configured in the squad manifest under `mcps` and in
`.claude/settings.json`. The harness manages MCP server lifecycle,
tool discovery, and resource access.

**MCP governance rule `[PROMPT]`:** Only `@devops` manages MCP infrastructure
(add/remove/configure servers). Other agents are consumers only.

---

## 10. State Management and Persistence

### 10.1 State Layers

| Layer | Scope | Persistence | Location |
|-------|-------|-------------|----------|
| Session state | Current conversation | In-memory | Runtime |
| Agent memory | Per-agent across sessions | File | `agents/{id}/MEMORY.md` |
| Story state | Development progress | File | `docs/stories/{id}.story.md` |
| Handoff artifacts | Agent switch context | File (gitignored) | `.squad-state/handoffs/` |
| Escalation reports | Recovery artifacts | File (gitignored) | `.squad-state/escalations/` |
| QA loop status | Review cycle state | File | `qa/loop-status.json` |

---

## 11. Context Engineering and Compaction

### 11.1 Token Budget Numbers

| Parameter | Value | Source |
|-----------|-------|--------|
| Default context window | 200,000 tokens | `context.ts` — `MODEL_CONTEXT_WINDOW_DEFAULT = 200_000` |
| 1M context (Sonnet 4, Opus 4.6) | 1,000,000 tokens | `context.ts` `modelSupports1M()` |
| Max output tokens (default) | 32,000 tokens | `context.ts` — `MAX_OUTPUT_TOKENS_DEFAULT = 32_000` |
| Max output tokens (upper) | 64,000 tokens | `context.ts` — `MAX_OUTPUT_TOKENS_UPPER_LIMIT = 64_000` |
| Capped default (slot optimization) | 8,000 tokens | `context.ts` — `CAPPED_DEFAULT_MAX_TOKENS = 8_000` |
| Escalated max tokens | 64,000 tokens | `context.ts` — `ESCALATED_MAX_TOKENS = 64_000` |
| Compact max output tokens | 20,000 tokens | `context.ts` — `COMPACT_MAX_OUTPUT_TOKENS = 20_000` |
| Max output for summary | 20,000 tokens | `autoCompact.ts` — `MAX_OUTPUT_TOKENS_FOR_SUMMARY = 20_000` |

### 11.2 Auto-Compaction Trigger `[HARNESS]`

Auto-compaction triggers when estimated token count exceeds:

```
effectiveWindow = min(contextWindow, CLAUDE_CODE_AUTO_COMPACT_WINDOW)
                  - min(maxOutputTokensForModel, 20_000)
```

> **Source:** `autoCompact.ts` `getEffectiveContextWindowSize()` lines 33-49.

### 11.3 Compaction Services

The Claude Code harness provides these compaction mechanisms:

| Service | File | Purpose |
|---------|------|---------|
| `autoCompact` | `autoCompact.ts` | Automatic trigger based on token estimation |
| `compact` | `compact.ts` | Core compaction via forked agent summarization |
| `microCompact` | `microCompact.ts` | Lightweight, targeted compaction |
| `apiMicrocompact` | `apiMicrocompact.ts` | API-level micro-compaction |
| `sessionMemoryCompact` | `sessionMemoryCompact.ts` | Session memory extraction |
| `postCompactCleanup` | `postCompactCleanup.ts` | Post-compaction resource cleanup |
| `compactWarningHook` | `compactWarningHook.ts` | Warning before compaction |

---

## 12. Error Handling and Recovery

### 12.1 API Retry with Backoff `[HARNESS]`

```typescript
// From withRetry.ts

const BASE_DELAY_MS = 500
const DEFAULT_MAX_RETRIES = 10
const PERSISTENT_MAX_BACKOFF_MS = 5 * 60 * 1000  // 5 minutes
const PERSISTENT_RESET_CAP_MS = 6 * 60 * 60 * 1000  // 6 hours
const MAX_529_RETRIES = 3

// Retry delay formula (getRetryDelay):
function getRetryDelay(attempt, retryAfterHeader, maxDelayMs = 32000) {
  if (retryAfterHeader) return parseInt(retryAfterHeader) * 1000
  const baseDelay = min(BASE_DELAY_MS * 2^(attempt-1), maxDelayMs)
  const jitter = random() * 0.25 * baseDelay
  return baseDelay + jitter
}
```

**Concrete delay progression (no retry-after header):**

| Attempt | Base Delay | With 25% Jitter Range |
|---------|-----------|----------------------|
| 1 | 500ms | 500-625ms |
| 2 | 1,000ms | 1,000-1,250ms |
| 3 | 2,000ms | 2,000-2,500ms |
| 4 | 4,000ms | 4,000-5,000ms |
| 5 | 8,000ms | 8,000-10,000ms |
| 6 | 16,000ms | 16,000-20,000ms |
| 7+ | 32,000ms (cap) | 32,000-40,000ms |

**Persistent mode (unattended):** Uses `PERSISTENT_MAX_BACKOFF_MS` = 5 minutes cap,
with `PERSISTENT_RESET_CAP_MS` = 6 hours absolute cap. Chunks waits into 30-second
heartbeat intervals to prevent idle detection.

### 12.2 Denial Tracking `[HARNESS]`

```typescript
// From denialTracking.ts (complete file, 46 lines)
const DENIAL_LIMITS = {
  maxConsecutive: 3,
  maxTotal: 20,
}

// When shouldFallbackToPrompting() returns true:
// consecutive >= 3 OR total >= 20
// → classifier stops auto-allowing, falls back to user prompting
```

### 12.3 Recovery Handler `[PROMPT]`

Recovery strategies from `recovery-handler.js`:

| Strategy | Constant | When Selected |
|----------|----------|---------------|
| `retry_same_approach` | `RecoveryStrategy.RETRY_SAME_APPROACH` | Transient errors, first attempts |
| `rollback_and_retry` | `RecoveryStrategy.ROLLBACK_AND_RETRY` | State errors, circular approach detected |
| `skip_phase` | `RecoveryStrategy.SKIP_PHASE` | Non-critical config errors |
| `escalate_to_human` | `RecoveryStrategy.ESCALATE_TO_HUMAN` | Max retries reached, fatal errors |
| `trigger_recovery_workflow` | `RecoveryStrategy.TRIGGER_RECOVERY_WORKFLOW` | Dependency errors |

> **Note:** Enum KEYS are SCREAMING_SNAKE (`RETRY_SAME_APPROACH`), but VALUES are `lowercase_snake` (`'retry_same_approach'`). Use the values when implementing.

### 12.4 Recovery Cascade

Default escalation order:

```
retry_same_approach (attempt 1)
  → rollback_and_retry (attempt 2+, or circular detection)
    → escalate_to_human (attempt >= maxRetries, or fatal)
```

Configuration: `maxRetries` defaults to 3, `autoEscalate` defaults to `true`.

---

## 13. Quality Gates and Validation

### 13.1 Constitutional Articles `[PROMPT]`

| Article | Principle | Severity | Gate Enforcement |
|---------|-----------|----------|-----------------|
| I | CLI First | NON-NEGOTIABLE | WARN in `dev-develop-story.md` if UI created before CLI |
| II | Agent Authority | NON-NEGOTIABLE | Via agent definitions (no additional gate) |
| III | Story-Driven Development | MUST | BLOCK in `dev-develop-story.md` if no valid story |
| IV | No Invention | MUST | Spec pipeline critique phase |
| V | Quality First | MUST | QA gate phases |
| VI | Absolute Imports | SHOULD | Linting |

> **Enforcement reality:** Gates are embedded in task instructions — they are PROMPT-level checks, not
> automated code-level gates. The severity labels (BLOCK/WARN/INFO) describe the intended
> response when a human or LLM detects a violation, not an automated enforcement mechanism.

### 13.2 QA Gate Checks

The QA gate task performs 7 quality checks:

| Check | Verdict |
|-------|---------|
| Acceptance criteria met | PASS/FAIL |
| Tests passing | PASS/FAIL |
| Code quality | PASS/CONCERNS |
| Story file updated | PASS/FAIL |
| File list accurate | PASS/FAIL |
| No regressions | PASS/FAIL |
| Documentation updated | PASS/WAIVED |

**Gate verdicts:** PASS, CONCERNS, FAIL, WAIVED

---

## 14. Security Considerations

### 14.1 Permission Model `[HARNESS]`

Claude Code implements a layered permission system:

#### External Permission Modes (user-facing)

| Mode | Behavior |
|------|----------|
| `default` | Ask user for each tool use |
| `acceptEdits` | Auto-allow file edits, ask for others |
| `bypassPermissions` | Allow all operations without asking |
| `dontAsk` | Never prompt — deny if not explicitly allowed |
| `plan` | Planning mode — no mutations allowed |

#### Internal Permission Modes (not user-addressable)

| Mode | Behavior |
|------|----------|
| `auto` | Classifier-based auto-approval (feature-gated) |
| `bubble` | Bubble permission decision to parent |

There are 5 external modes + 2 internal modes = 7 total.

#### Permission Behaviors

Three outcomes for any permission check: `allow`, `deny`, `ask`.
Plus an internal `passthrough` for delegation.

#### Permission Rule Sources

Rules come from: `userSettings`, `projectSettings`, `localSettings`,
`flagSettings`, `policySettings`, `cliArg`, `command`, `session`.

### 14.2 Boundary Enforcement `[HARNESS]`

File-level protection via `.claude/settings.json` deny rules prevents
agents from modifying L1/L2 artifacts. This is deterministic runtime
enforcement — the harness rejects the file operation before it reaches
the filesystem.

---

## 15. Versioning and Evolution

### 15.1 Protocol Versioning

The protocol follows SemVer 2.0.0:

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| New optional field | Minor | Adding `tags` to squad schema |
| Breaking schema change | Major | Renaming required field |
| Bug fix / clarification | Patch | Fixing documentation |

### 15.2 Schema Versioning

Squad schemas include version tracking via `autoClaude.version`.

---

## 16. Implementation Checklist

### Minimum Viable Squad Implementation

- [ ] Squad manifest validates against `squad-schema.json`
- [ ] Agent definitions validate against `agent-schema.json`
- [ ] Task definitions follow Markdown + YAML frontmatter format
- [ ] Task-first architecture: workflows compose tasks, not agents
- [ ] Agent authority boundaries defined (even if prompt-only)
- [ ] At least one workflow (SDC or similar) implemented
- [ ] QA loop with bounded iterations (max 5)
- [ ] Recovery handling with bounded retries (max 3)
- [ ] Context compaction strategy (manual or automatic)
- [ ] Boundary model: L1/L2 immutability enforced somehow
- [ ] Error messages follow standardized format (Section 8.2)
- [ ] All iterative processes have explicit bounds

### Aspirational (not yet implemented anywhere)

- [ ] Formal invariant verification
- [ ] Cross-squad dependency resolution
- [ ] Multi-harness interoperability testing
- [ ] Automated constitutional gate enforcement (code-level, not prompt-level)

---

## 17. References

| Reference | Location |
|-----------|----------|
| Claude Code harness | `claude-code-main/src/` |
| Squad schemas | `squad-schema.json`, `agent-schema.json`, `task-schema.json` |
| Constitutional rules | `constitution.md` |
| Agent authority rules | `agent-authority.md` |
| Workflow execution rules | `workflow-execution.md` |
| Agent handoff rules | `agent-handoff.md` |
| Recovery handler | `recovery-handler.js` |
| RFC 2119 | https://www.rfc-editor.org/rfc/rfc2119 |
| MCP Specification | https://modelcontextprotocol.io |
| SemVer 2.0.0 | https://semver.org |

---

## Appendix A: Complete JSON Schemas

### A.1 Squad Schema

See Section 4.1 for the complete schema. Source: `squad-schema.json`.

### A.2 Agent Schema

See Section 5.1 for the field inventory. Full schema: `agent-schema.json`.

### A.3 Task Schema

See Section 6.1 for the field inventory. Full schema: `task-schema.json`.

---

## Appendix B: State Machine Diagrams

See Sections 5.4 (Agent Lifecycle) and 6.3 (Task Lifecycle) for ASCII diagrams.

---

## Appendix C: Format Guidance

### When to Use YAML

- **Squad manifests** (`squad.yaml`) — always YAML
- **Agent definitions** (`agents/{id}.yaml`) — always YAML
- **Workflow definitions** (`workflows/{name}.yaml`) — always YAML
- **Configuration files** — always YAML
- **Structured data** (inputs/outputs schemas) — always YAML

### When to Use Markdown

- **Task definitions** (`tasks/{name}.md`) — Markdown with YAML frontmatter
- **Checklists** (`checklists/{name}.md`) — Markdown
- **Templates** (`templates/{name}.md`) — Markdown
- **Documentation** — Markdown

### Task Format Example

```markdown
---
templates:
  - ../templates/code-review.md
tools:
  - bash
  - grep
checklists:
  - ../checklists/code-quality.md
---

# Task: implement-feature

## Task Definition
- **name:** implementFeature()
- **responsavel:** @dev
- **responsavel_type:** Agente

## Inputs
- **story_path** (string, required): Path to the story file

## Steps
1. Read the story file and extract acceptance criteria
2. Create implementation plan
3. Implement each criterion
4. Run tests
5. Update story file with progress

## Validation
- All acceptance criteria marked as complete
- Tests passing
- No linting errors
```

---

*End of Squad Protocol Specification v1.0.0*
