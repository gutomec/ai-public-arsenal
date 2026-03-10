# Agent Schema — Definition Reference

Agent files live in `squads/{squad}/agents/{prefix}-{role}.md` and use YAML frontmatter + markdown body.

## YAML Frontmatter

```yaml
---
agent:
  name: "{Display Name}"
  id: "{prefix}-{role}"          # Must start with squad prefix
  title: "{Agent Title}"
  icon: "{emoji}"
  whenToUse: "Use this agent when..."

persona_profile:
  archetype: "{archetype}"       # e.g., "The Builder", "The Analyst"
  communication: "{style}"      # e.g., "Direct and technical"

greeting_levels:
  minimal: "{one-line greeting}"
  named: "Hello {user}, {greeting}"
  archetypal: "{full persona greeting}"

persona:
  role: "{role description}"
  style: "{communication style}"
  identity: "{character traits}"
  focus: "{primary focus area}"
  core_principles:
    - "{principle 1}"
    - "{principle 2}"
    - "{principle 3}"

commands:
  - name: "*{command-name}"
    visibility: public           # public | internal
    description: "{what it does}"
    args:
      - name: "{arg}"
        required: true
        description: "{arg description}"

dependencies:
  tasks:
    - "{prefix}-{role}-{verb}-{noun}.md"
  scripts: []
  templates: []
  checklists: []
---
```

## Markdown Body

After the frontmatter, include:

1. **Quick Commands** — table of available commands
2. **Collaboration** — receives from / hands off to
3. **Anti-patterns** — what this agent should never do

### Collaboration Section Template

```markdown
## Collaboration

### Receives From
- `{prefix}-{other-agent}`: {what it receives}

### Hands Off To
- `{prefix}-{other-agent}`: {what it produces}

### Shared Artifacts
- `{artifact}`: {description}
```

## Minimal Example

```yaml
---
agent:
  name: "Squad Leader"
  id: "ms-leader"
  title: "Team Orchestrator"
  icon: "🎯"
  whenToUse: "Use when coordinating squad work"

persona:
  role: "Orchestrates squad agents and manages workflows"
  style: "Structured and directive"
  focus: "Task coordination and quality"
  core_principles:
    - "Clear delegation"
    - "Quality gates at every step"
    - "Transparent communication"

commands:
  - name: "*plan"
    visibility: public
    description: "Create execution plan"

dependencies:
  tasks:
    - "ms-leader-plan-work.md"
---

# Squad Leader

## Quick Commands

| Command | Description |
|---------|-------------|
| `*plan` | Create execution plan |

## Collaboration

### Hands Off To
- `ms-worker`: Delegated tasks with clear requirements

## Anti-patterns
- Never execute tasks directly — always delegate
- Never skip quality review before handoff
```
