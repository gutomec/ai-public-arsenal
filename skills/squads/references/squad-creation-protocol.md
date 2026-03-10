# Squad Creation Protocol — Step by Step

## Phase 1: Elicitation

Before creating any files, gather these requirements:

| Question | Required | Example |
|----------|----------|---------|
| Squad name? | YES | `my-squad` |
| Purpose/domain? | YES | "Content creation pipeline" |
| What agents are needed? | YES | researcher, writer, editor |
| Collaboration pattern? | YES | pipeline, hub-spoke, review, parallel |
| Slash prefix (2-4 chars)? | YES | `ms` |
| Author? | YES | "Your Name" |
| Dependencies (npm/python)? | NO | `puppeteer@^23.0.0` |
| MCP tools needed? | NO | `browser`, `filesystem` |
| Habilitar triggers? | NO | `true` (lifecycle events) |
| Habilitar flow tracking? | NO | terminal (ASCII), browser (A2UI), ou ambos |

If the user provides incomplete info, ask targeted questions. Never create a squad without at minimum: name, purpose, agents, and prefix.

If the user wants triggers, add the `triggers` section ao `squad.yaml` (see `triggers-protocol.md` for full spec).

If the user wants flow tracking (rastreamento visual de delegação entre agents), add `triggers.flow` section ao `squad.yaml`. Perguntar: "Deseja habilitar flow tracking? Opções: terminal (ASCII), browser (A2UI), ou ambos." See `flow-tracker-protocol.md` for full spec.

## Phase 2: Naming

Apply these conventions strictly:

- **Squad name**: `kebab-case` (e.g., `content-pipeline`)
- **Prefix**: 2-4 lowercase characters (e.g., `cp`)
- **Agent IDs**: `{prefix}-{role}` (e.g., `cp-researcher`)
- **Task IDs**: `{prefix}-{role}-{verb}-{noun}.md` (e.g., `cp-researcher-gather-sources.md`)
- **Workflow files**: `{descriptive-name}.yaml` (e.g., `main-pipeline.yaml`)

## Phase 3: Scaffold Directory

```bash
mkdir -p squads/{name}/agents
mkdir -p squads/{name}/tasks
mkdir -p squads/{name}/workflows
mkdir -p squads/{name}/config
mkdir -p squads/{name}/checklists
mkdir -p squads/{name}/templates
mkdir -p squads/{name}/tools
mkdir -p squads/{name}/scripts
mkdir -p squads/{name}/data
mkdir -p squads/{name}/references
```

## Phase 4: Generate squad.yaml

Use the schema from `squad-yaml-schema.md`. Required fields:

```yaml
name: "{squad-name}"
version: "1.0.0"
description: "{description}"
author: "{author}"
license: MIT
slashPrefix: "{prefix}"

components:
  agents:
    - "{prefix}-{role1}.md"
    - "{prefix}-{role2}.md"
  tasks:
    - "{prefix}-{role1}-{verb}-{noun}.md"
  workflows:
    - "main-pipeline.yaml"
  checklists: []
  templates: []
  tools: []
  scripts: []

config:
  extends: none
  coding-standards: config/coding-standards.md
  tech-stack: config/tech-stack.md

dependencies:
  node: []
  python: []
  squads: []

tags:
  - "{domain-tag}"
```

## Phase 5: Generate Agent Files

For each agent, create `agents/{prefix}-{role}.md` following the schema in `agent-schema.md`. Each agent must include:

- YAML frontmatter with `agent.id`, `agent.name`, `persona`, `commands`, `dependencies`
- Markdown body with Quick Commands table, Collaboration section, Anti-patterns
- Collaboration must document: Receives From, Hands Off To, Shared Artifacts

## Phase 6: Generate Task Files

For each agent command, create `tasks/{prefix}-{role}-{verb}-{noun}.md` following the schema in `task-schema.md`. Each task must include:

- YAML frontmatter with `task`, `responsavel`, `Entrada`, `Saida`, `Checklist`
- Pre-conditions and post-conditions
- Markdown body with description

## Phase 7: Generate Config Files

Create minimal config files:

### config/coding-standards.md
```markdown
# {Squad Name} — Coding Standards
## Language & Style
- {rules specific to this squad's domain}
## File Organization
- {how files should be organized}
```

### config/tech-stack.md
```markdown
# {Squad Name} — Tech Stack
## Core Technologies
| Technology | Purpose | Version |
|-----------|---------|---------|
| {tech} | {purpose} | {version} |
```

## Phase 8: Generate README.md

```markdown
# {Squad Name}
{description}
## Agents
| Agent | Role | Commands |
|-------|------|----------|
| `{prefix}-{role}` | {role description} | `*{cmd1}`, `*{cmd2}` |
## Quick Start
1. Register: `*register-squad {name}`
2. Activate: `/SQUADS:{name}:{agent-id}`
## Workflows
- **{workflow-name}**: {description}
```

## Phase 9: Post-Creation

1. **Validate**: Run `*validate-squad {name}` (see `validation-checklist.md`)
2. **Register**: Run `*register-squad {name}` (see `registration-protocol.md`)
3. **Test**: Activate one agent via slash command and verify it loads correctly
