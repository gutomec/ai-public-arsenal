# Task Schema — Definition Reference

Task files live in `squads/{squad}/tasks/{prefix}-{role}-{verb}-{noun}.md` and use YAML frontmatter + markdown body.

## YAML Frontmatter

```yaml
---
task: "{functionName}()"         # Callable function name
responsavel: "{prefix}-{role}"   # Agent responsible for execution
atomic_layer: Organism           # Atom | Molecule | Organism | Template | Page

Entrada:                         # Inputs
  param1:
    type: string
    required: true
    description: "{what this input is}"
  param2:
    type: object
    required: false
    description: "{optional input}"

Saida:                           # Outputs
  result:
    type: string
    description: "{what this produces}"
  artifacts:
    type: array
    description: "{files or data created}"

Checklist:
  pre:                           # Pre-conditions (must be true before execution)
    - "{condition 1}"
    - "{condition 2}"
  post:                          # Post-conditions (must be true after execution)
    - "{condition 1}"
    - "{condition 2}"

Performance:
  duration: "{estimated time}"   # e.g., "2-5 minutes"
  cost: "{resource cost}"       # e.g., "low", "medium", "high"
  cacheable: false
  parallelizable: false

Error Handling:
  strategy: retry                # retry | fallback | abort
  retry:
    max_attempts: 3
    delay: "1s"
  fallback: "{fallback action}"

Metadata:
  version: "1.0.0"
  dependencies:
    - "{other-task}"
---
```

## Markdown Body

After the frontmatter, include:

1. **Description** — what this task does
2. **Pipeline Diagram** — visual flow (optional)
3. **Examples** — usage examples

### Pipeline Diagram Template

```markdown
## Pipeline

\`\`\`
Input → [Step 1] → [Step 2] → [Step 3] → Output
\`\`\`
```

## Minimal Example

```yaml
---
task: "planWork()"
responsavel: "ms-leader"
atomic_layer: Organism

Entrada:
  requirements:
    type: string
    required: true
    description: "Work requirements to plan"

Saida:
  plan:
    type: object
    description: "Execution plan with task assignments"

Checklist:
  pre:
    - "Requirements are clear and complete"
    - "Squad agents are available"
  post:
    - "Plan covers all requirements"
    - "Each task assigned to an agent"

Performance:
  duration: "1-3 minutes"
  cost: low
  cacheable: false
  parallelizable: false

Error Handling:
  strategy: retry
  retry:
    max_attempts: 2
    delay: "1s"
  fallback: "Ask user to clarify requirements"

Metadata:
  version: "1.0.0"
  dependencies: []
---

# Plan Work

Creates an execution plan by breaking requirements into tasks and assigning them to squad agents.

## Pipeline

\`\`\`
Requirements → [Analyze] → [Break Down] → [Assign] → Execution Plan
\`\`\`
```

## Naming Convention

Format: `{prefix}-{agent-role}-{verb}-{noun}.md`

| Part | Rule | Example |
|------|------|---------|
| prefix | Squad's slashPrefix | `bc`, `ms` |
| agent-role | Agent role (without prefix) | `renderer`, `leader` |
| verb | Action verb | `create`, `analyze`, `validate` |
| noun | Target noun | `html`, `report`, `plan` |

Examples: `bc-renderer-create-html-template.md`, `ms-leader-plan-work.md`
