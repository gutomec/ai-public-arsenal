# Schema Reference

## When to load
Intent: CREATE, VALIDATE, MODIFY

## Protocol Reference
SQUAD_PROTOCOL.md Sections 4.1, 5.1, 6.1, Appendix A

## Schema Files Location
All JSON Schemas are at: `~/.claude/skills/squads/schemas/`

| Schema | File | Validates |
|--------|------|-----------|
| Squad Manifest | `squad-schema.json` | `squad.yaml` |
| Agent Definition | `agent-schema.json` | `agents/{id}.yaml` |
| Task Definition | `task-schema.json` | Task frontmatter in `tasks/{name}.md` |

## Quick Reference: Required Fields

### Squad Manifest (squad.yaml)
- `name` (string, kebab-case, 2-50 chars)
- `version` (string, semver format)

### Agent Definition (agents/{id}.yaml)
- `agent.name` (string)
- `agent.id` (string, kebab-case)
- `agent.title` (string)
- `agent.icon` (string, emoji)
- `agent.whenToUse` (string)
- `persona.role` (string)
- `persona.style` (string)
- `persona.identity` (string)
- `persona.focus` (string)
- `persona.core_principles` (array of strings)
- `commands` (array of objects with name, description)

### Task Definition (tasks/{name}.md frontmatter)
- `task.name` (string)
- `task.responsavel` (string, must match an agent ID)

## Validation Commands

### Validate squad.yaml against schema
```bash
node -e "
const Ajv = require('ajv');
const schema = require('$HOME/.claude/skills/squads/schemas/squad-schema.json');
const yaml = require('yaml');
const fs = require('fs');
const data = yaml.parse(fs.readFileSync('{path}/squad.yaml', 'utf8'));
const ajv = new Ajv({allErrors: true});
const valid = ajv.validate(schema, data);
if (!valid) { console.error(JSON.stringify(ajv.errors, null, 2)); process.exit(1); }
console.log('VALID');
"
```

### Validate agent against schema
```bash
node -e "
const Ajv = require('ajv');
const schema = require('$HOME/.claude/skills/squads/schemas/agent-schema.json');
const yaml = require('yaml');
const fs = require('fs');
const data = yaml.parse(fs.readFileSync('{path}/agents/{id}.yaml', 'utf8'));
const ajv = new Ajv({allErrors: true});
const valid = ajv.validate(schema, data);
if (!valid) { console.error(JSON.stringify(ajv.errors, null, 2)); process.exit(1); }
console.log('VALID');
"
```

## Enforcement Tags
- `[SCHEMA]` — Validated by JSON Schema at load time (deterministic)
- `[HARNESS]` — Enforced by runtime code
- `[PROMPT]` — LLM instruction-based (best effort)
- `[HYBRID]` — Combination

For full schema definitions, read SQUAD_PROTOCOL.md Appendix A.
