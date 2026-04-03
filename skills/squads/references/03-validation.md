# Squad Validation

## When to load
Intent: VALIDATE (keywords: validate, check, verify, fix, repair, lint, audit)

## Protocol Reference
SQUAD_PROTOCOL.md Section 4.3 (Validation)

## Validation Checklist

### Blocking Checks (MUST pass — any failure = FAIL)

| # | Check | How |
|---|-------|-----|
| B1 | squad.yaml exists | `test -f {squad}/squad.yaml` |
| B2 | squad.yaml is valid YAML | Parse with yaml library |
| B3 | Required fields present | name, version |
| B4 | Name format valid | Pattern `^[a-z0-9-]+$`, 2-50 chars |
| B5 | Version format valid | Pattern `^\d+\.\d+\.\d+$` |
| B6 | All referenced agent files exist | For each in components.agents: check file |
| B7 | All referenced task files exist | For each in components.tasks: check file |
| B8 | All referenced workflow files exist | For each in components.workflows: check file |
| B9 | Agent IDs are unique | No duplicate IDs across agent files |
| B10 | Task responsavel matches an agent | Each task.responsavel exists in agents |
| B11 | Workflow references valid agents | All agents in workflow exist in squad |
| B12 | Workflow references valid tasks | All tasks in workflow exist in squad |
| B13 | No circular workflow dependencies | DAG check if depends_on is used |
| B14 | Schema validation passes | Validate against schemas/squad-schema.json |

### Advisory Checks (SHOULD pass — reported but not blocking)

| # | Check | How |
|---|-------|-----|
| A1 | description field present | Check squad.yaml |
| A2 | author field present | Check squad.yaml |
| A3 | license field present | Check squad.yaml |
| A4 | tags field present | Check squad.yaml |
| A5 | slashPrefix field present | Check squad.yaml |
| A6 | Agent persona defined | Each agent has persona block |
| A7 | Agent commands defined | Each agent has commands array |
| A8 | Task has steps | Each task has steps array |
| A9 | Task has inputs/outputs | Each task defines I/O |
| A10 | Workflow has sequence | Each workflow has phases/sequence |
| A11 | README.md exists | `test -f {squad}/README.md` |
| A12 | No orphaned files | Files on disk match components lists |
| A13 | Harness block configured (v3) | Check for harness key in squad.yaml |
| A14 | Components count matches disk | Count files vs array lengths |

## Validation Procedure

1. Run all blocking checks first
2. If any blocking check fails: report and STOP (unless fix mode)
3. Run all advisory checks
4. Report results:
   ```
   Validation: {name} v{version}

   BLOCKING: {passed}/{total} passed
     [FAIL] B6: Agent file agents/missing-agent.yaml not found

   ADVISORY: {passed}/{total} passed
     [WARN] A11: README.md not found

   Verdict: FAIL (1 blocking error)
   ```

## Fix Mode (`*squad fix {name}`)

1. Run validation
2. For each blocking error (one at a time):
   - Show the error
   - Propose a fix
   - Apply fix (with user confirmation)
   - Re-validate
3. Loop until 0 blocking errors
4. Report advisory warnings for manual review

## Common Fixes
| Error | Auto-fix |
|-------|----------|
| Missing agent file | Create from template |
| Missing task file | Create from template |
| Mismatched component list | Update squad.yaml to match disk |
| Invalid name format | Suggest corrected name |
| Missing required field | Prompt user for value |
