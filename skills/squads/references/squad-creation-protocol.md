# Squad Creation Protocol — v2 Step by Step

## Phase 1: Elicitation

Before creating any files, gather these requirements:

### Required questions (v1)

| Question | Required | Example |
|---|---|---|
| Squad name? | YES | `contract-review-squad` |
| Purpose/domain? | YES | "Legal contract review pipeline" |
| What agents are needed? | YES | clause-extractor, risk-flagger, summary-writer |
| Collaboration pattern? | YES | pipeline, hub-spoke, review, parallel |
| Slash prefix (2-4 chars)? | YES | `crs` |
| Author? | YES | "Your Name" |
| Dependencies (npm/python)? | NO | `ajv@^8.0.0` |
| MCP tools needed? | NO | `browser`, `filesystem` |

### v2 questions (ask after base questions)

| Question | Required | Default | Example |
|---|---|---|---|
| Enable validation gates? | NO | `false` | "Yes, validate clause extraction output" |
| Enable state persistence? | NO | `false` | "Yes, checkpoint each step" |
| Need human input during workflow? | NO | `false` | "Yes, ask which party we represent" |
| Different models for different agents? | NO | `false` | "Flash for workers, Sonnet for review" |
| Need output templates? | NO | `false` | "Yes, executive summary has fixed format" |

**Progressive disclosure:** If the user says "just create a basic squad", skip v2 questions and create a v1-compatible squad. Only ask v2 questions when the user mentions validation, state, human review, models, or templates.

**Triggers are ON by default.** Do NOT add a `triggers` section unless the user explicitly asks to customize.

## Phase 2: Naming

Apply conventions strictly:

- **Squad name**: `kebab-case` (e.g., `contract-review-squad`)
- **Prefix**: 2-4 lowercase characters (e.g., `crs`)
- **Agent IDs**: `{prefix}-{role}` (e.g., `crs-clause-extractor`)
- **Task IDs**: `{prefix}-{role}-{verb}-{noun}.md`
- **Schema files**: `{artifact-name}.json` (e.g., `clauses.json`)
- **Template files**: `{output-name}.md` (e.g., `executive-summary.md`)
- **Workflow files**: `{descriptive-name}.yaml`

## Phase 3: Scaffold Directory

```bash
mkdir -p ./squads/{name}/agents
mkdir -p ./squads/{name}/tasks
mkdir -p ./squads/{name}/workflows
mkdir -p ./squads/{name}/config
mkdir -p ./squads/{name}/checklists
mkdir -p ./squads/{name}/templates
mkdir -p ./squads/{name}/tools
mkdir -p ./squads/{name}/scripts
mkdir -p ./squads/{name}/data
mkdir -p ./squads/{name}/references
```

**v2 additions:**
```bash
mkdir -p ./squads/{name}/schemas     # JSON Schema files for validation
```

**v2 gitignore:**
```bash
# Add to squad's .gitignore or project .gitignore
echo ".squad-state/" >> ./squads/{name}/.gitignore
```

## Phase 4: Generate squad.yaml

Use `squad-yaml-schema.md`. Include v2 sections only if user opted in:

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
  tasks:
    - "{prefix}-{role1}-{verb}-{noun}.md"
  workflows:
    - "{workflow-name}.yaml"
  schemas:                       # v2: only if validation gates enabled
    - "{artifact}.json"
  checklists: []
  templates:                     # v2: only if output templates enabled
    - "{output}.md"
  tools: []
  scripts: []

config:
  extends: none
  coding-standards: config/coding-standards.md
  tech-stack: config/tech-stack.md

# v2: only if state persistence enabled
state:
  enabled: true
  storage: file
  resume: true

# v2: only if model routing enabled
model_strategy:
  orchestrator: "claude-sonnet-4.6"
  workers: "gemini-3-flash"
  override: true

dependencies:
  node:
    - "ajv@^8.0.0"              # v2: if validation gates enabled
    - "ajv-formats@^3.0.0"
  python: []
  squads: []

tags:
  - "{domain-tag}"
  - "v2"                         # v2: tag to indicate v2 features
```

## Phase 5: Generate Schemas (v2)

For each agent that produces structured output, create a JSON Schema:

```bash
# Example: schemas/clauses.json
Write ./squads/{name}/schemas/clauses.json
```

Follow the `schemas-protocol.md` to create proper JSON Schema files. Derive fields from the task's `Saida` definition.

## Phase 6: Generate Agent Files

For each agent, create `agents/{prefix}-{role}.md` following `agent-schema.md`.

**v2 additions per agent:**
- Add `agent.model` if model routing is enabled
- Add `agent.model_config` with appropriate temperature
- Add `agent.context` if context budget is needed
- Add "Output Format" section documenting expected JSON structure
- Reference the relevant schema in documentation

## Phase 7: Generate Task Files

For each agent command, create `tasks/{prefix}-{role}-{verb}-{noun}.md` following `task-schema.md`.

**v2 additions per task:**
- Add `Saida.schema` referencing the JSON Schema
- Add `Saida.template` if output template is defined
- Add `Saida.fields` listing expected structured fields
- Add `Checklist.verify` with programmatic assertions
- Add "Output Format" section with JSON example matching schema

## Phase 8: Generate Workflow

Create workflow YAML following `workflow-schema.md`.

**v2 additions:**
- Add `validation` to steps that need it
- Add `creates` as object with `artifact`, `format`, `schema`
- Add `requires` as array with `inject_as`
- Add `human-gate` steps where user opted in
- Add `state` override if different from squad.yaml

## Phase 9: Generate Templates (v2)

For each output that needs a fixed format:

```markdown
# {{title}}

**Generated:** {{generated_at}}
**Risk Score:** {{overall_risk_score}}/10

## Summary

{{executive_summary}}

## Top Risks

{{#each risks}}
### {{this.title}} ({{this.risk_level}})
{{this.description}}

**Recommendation:** {{this.recommendation}}
{{/each}}

## Conclusion

{{conclusion}}
```

Template syntax:
- `{{field}}` — simple substitution
- `{{#each array}}...{{/each}}` — iterate array
- `{{this.field}}` — access current item in each loop

## Phase 10: Generate Config, README

Same as v1 (see v1 protocol), plus:

**README v2 additions:**
- Schemas section documenting each schema
- Validation section explaining what's checked
- State management section (if enabled)
- Model routing section (if configured)

## Phase 11: Post-Creation

1. **Validate**: Run `*validate-squad {name}` — now 36 checks including v2
2. **Register**: Run `*register-squad {name}`
3. **Test validation**: If gates enabled, do a dry run to verify schemas validate correctly
4. **Test state**: If state enabled, run workflow and verify checkpoints are created

### Dry-run validation test

```bash
# Test schema against sample data
node -e '
const schema = require("./squads/{name}/schemas/clauses.json");
const sample = { clauses: [{ id: "C1", text: "test", type: "obligation" }] };
console.log("Schema loaded:", Object.keys(schema));
console.log("Sample valid:", typeof sample === "object");
'
```

## v1 → v2 Upgrade Path (`*upgrade-squad`)

For existing v1 squads:

1. Create `schemas/` directory
2. Add `.squad-state/` to `.gitignore`
3. Optionally add `state` section to `squad.yaml`
4. Optionally add `model_strategy` to `squad.yaml`
5. For each workflow step that should be validated:
   - Create JSON Schema in `schemas/`
   - Add `validation` section to workflow step
   - Add `creates` as object with schema reference
6. Bump version (e.g., `1.0.0` → `2.0.0`)
7. Add `v2` tag
8. Run `*validate-squad` with v2 checks
Create new squads under `./squads/{name}` by default. Use `~/squads/{name}` only when the workspace-local `./squads` directory is not the intended target.
