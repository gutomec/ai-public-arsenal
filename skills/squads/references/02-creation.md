# Squad Creation

## When to load
Intent: CREATE (keywords: create, new, scaffold, generate, build squad)

## Protocol Reference
SQUAD_PROTOCOL.md Sections 4.1 (Manifest Schema), 4.2 (Directory Structure), 5.1 (Agent Schema), 6.1 (Task Schema)

## Creation Pipeline

### Phase 1: Elicitation
Ask the user these REQUIRED questions:

| Question | Field | Default |
|----------|-------|---------|
| What is the squad's purpose? | description | — |
| Squad name? (kebab-case) | name | derived from purpose |
| What domain does it serve? | tags | — |
| How many agents? | components.agents | 3 |
| What are their roles? | agent definitions | — |
| What tasks do they perform? | components.tasks | — |
| Slash command prefix? | slashPrefix | first 3 chars of name |

### Phase 2: Naming Conventions
- Squad name: `kebab-case`, 2-50 chars, pattern `^[a-z0-9-]+$`
- Agent IDs: `kebab-case`, e.g., `backend-dev`, `qa-reviewer`
- Agent files: `{agent-id}.yaml` in `agents/`
- Task files: `{task-name}.md` in `tasks/`
- Workflow files: `{workflow-name}.yaml` in `workflows/`
- Slash prefix: short, unique, e.g., `myapp` -> `/myapp:agent-id`

### Phase 3: Scaffold
Create directory structure:
```bash
mkdir -p ~/squads/{name}/{agents,tasks,workflows,checklists,templates,tools,scripts,data}
```

### Phase 4: Generate squad.yaml
Use template: `templates/squad.yaml.tmpl`
Fill in all elicited values. Ensure `components` lists match actual files.

### Phase 5: Generate agents
For each agent role, use template: `templates/agent.yaml.tmpl`
Required fields: agent (name, id, title, icon, whenToUse), persona (role, style, identity, focus, core_principles), commands

### Phase 6: Generate tasks
For each task, use template: `templates/task.md.tmpl`
Required fields: task (name, responsavel), steps

### Phase 7: Generate workflows (if applicable)
Use template: `templates/workflow.yaml.tmpl`
At minimum, create one workflow connecting the agents.

### Phase 8: Post-creation validation
Run `*squad validate {name}` to verify:
- squad.yaml is valid against schema
- All referenced files exist
- Agent IDs match file names
- Task responsavel matches an agent
- No orphaned files

### Phase 9: Sync check
Count files on disk in each directory. Compare with `components` arrays in squad.yaml. They MUST match.

## Task-First Principle
When creating squads, define TASKS first, then create agents to execute them. The squad.yaml `components` section lists tasks before agents to emphasize this.

## Common Errors
- Mismatched agent ID in squad.yaml vs filename
- Task `responsavel` referencing non-existent agent
- Missing required fields in agent/task definitions
- Workflow referencing agents not in the squad
