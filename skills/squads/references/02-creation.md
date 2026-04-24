# Squad Creation

## When to load
Intent: CREATE (keywords: create, new, scaffold, generate, build squad)

## Protocol Reference
SQUAD_PROTOCOL_V4.md §5–§8

## Creation Pipeline

### Phase 1: Elicitation

| Question | Field | Default |
|----------|-------|---------|
| Squad purpose? | `description` | — |
| Squad name? (kebab-case) | `name` | derived from purpose |
| Target runtimes? | `runtime_requirements` | [claude-code] |
| Required features? | `features_required` | [max_turns, tool_whitelist, handoff_artifacts] |
| Domain/tags? | `tags` | — |
| How many agents? | `components.agents` | 3 |
| Agent roles? | agent definitions | — |
| Slash command prefix? | `slashPrefix` | first 3 chars of name |

### Phase 2: Scaffold

```bash
mkdir -p ~/squads/{name}/{agents,tasks,workflows,schemas}
```

### Phase 3: Generate squad.yaml (v4)

```yaml
name: my-squad
version: "1.0.0"
protocol: "4.0"
description: "What this squad does"
author: "author"
license: MIT
slashPrefix: msq
tags: [domain, keywords]

runtime_requirements:
  minimum:
    - runtime: claude-code
      version: ">=2.0.0"
  compatible:
    - runtime: gemini-cli
      version: ">=1.0.0"
  incompatible: []

features_required:
  - max_turns
  - tool_whitelist
  - handoff_artifacts

features_optional:
  - subagent_spawning
  - project_memory

components:
  agents:
    - agents/agent-one.md
    - agents/agent-two.md
  tasks:
    - tasks/task-one.md
    - tasks/task-two.md
  workflows:
    - workflows/main-pipeline.yaml

contracts:
  task-one → task-two: schemas/task-one-output.json

ui:
  icon: "🔬"
  category: "research"
  agents_metadata:
    agent-one:
      icon: "🔍"
      archetype: Builder
    agent-two:
      icon: "📊"
      archetype: Guardian

memory:
  persistent:
    enabled: true
    scope: project
    file: SQUAD_MEMORY.md
    max_chars: 40000
    garbage_collection:
      max_learned_facts: 200
      review_interval_days: 30
      conflict_resolution: replace

runtimes:
  claude-code:
    # CC-specific config (optional)
  codex:
    # Codex-specific config (optional)
```

### Phase 4: Generate agents (v4 flat frontmatter)

Use template: `templates/agent-cc.md.tmpl` (updated for v4).

```yaml
---
name: agent-name
description: "[Verb] [domain]. Use when [trigger]. Do NOT use for [anti-pattern]."
maxTurns: 25
tools: [read, write, bash]
model: sonnet
---

You are [specific role] for [domain]. You [primary action]. You [primary boundary].

# Guidelines

## DO
- [Principle 1]
- [Principle 2]
- [Principle 3]

## DO NOT
- [Anti-pattern 1]
- [Anti-pattern 2]

# Process
1. [Step 1]
2. [Step 2]
3. [Step 3]

# Output
[Format] at [location]

## GOOD example
[Concrete example]

## BAD example (do NOT produce)
[What to avoid + why]

# Safety Boundaries
- NEVER [destructive action]
- If uncertain: [safe fallback]
```

**Rules:**
- `maxTurns` is **mandatory** (P4).
- Body target: 1000–2000 tokens. Max: 1.5% of target context window.
- Prose only in body — no YAML.
- 4 sections minimum: identity + Guidelines + Process + Output.
- Use portable semantic tool names (`read`, `write`, `grep`, etc.). Override per runtime under `runtimes.{id}.tools` if needed.

### Phase 5: Generate tasks (v4 flat frontmatter)

Use template: `templates/task-cc.md.tmpl`.

```yaml
---
name: task-name
description: "What this accomplishes"
---

# Task Name

## Input
[What this receives]

## Steps
1. [Step]
2. [Step]

## Output
[What to produce, where to save]

## Acceptance Criteria
- [Binary verifiable criterion]
- [Binary verifiable criterion]

## Output Schema
[Inline description or reference to schemas/task-name.json]
```

**Rules:**
- Tasks do NOT have owners. Workflows bind agents to tasks.
- Acceptance criteria must be binary and verifiable.
- Declare output schema if downstream tasks consume this output.

### Phase 6: Generate workflow

```yaml
name: main_pipeline
description: "What this workflow accomplishes"

steps:
  - id: step-1
    agent: agent-one
    task: task-one
    depends_on: []
  - id: step-2
    agent: agent-two
    task: task-two
    depends_on: [step-1]

success_indicators:
  - "All target files processed"
  - "Output schema validated"
  - "No unaddressed critical findings"
```

### Phase 7: Validate

Run `*squad validate {name}` → must pass all Core blocking checks.

---

## Runtime-Specific Details

| Runtime | Notes on creation |
|---------|------------------|
| Claude Code | [adapters/claude-code.md §4](../adapters/claude-code.md#4-frontmatter-mapping) |
| Gemini CLI | [adapters/gemini-cli.md §4](../adapters/gemini-cli.md#4-frontmatter-mapping) |
| Codex | [adapters/codex.md §4](../adapters/codex.md#4-frontmatter-mapping) |
| Cursor | [adapters/cursor.md §4](../adapters/cursor.md#4-frontmatter-mapping) |
| Antigravity | [adapters/antigravity.md §4](../adapters/antigravity.md#4-frontmatter-mapping) |
