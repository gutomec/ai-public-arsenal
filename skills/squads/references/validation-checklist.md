# Validation Checklist — 36 Integrity Checks (v2)

Run these checks against a squad to verify integrity before registration or execution.

Resolve `{resolved-squad-root}` by checking `./squads/{name}` first, then `~/squads/{name}`. For cross-squad checks, inspect both `./squads/*` and `~/squads/*`, preferring the local squad on name collisions.

## Blocking Checks (MUST pass) — 9 original

| # | Check | How to Verify |
|---|---|---|
| 1 | `squad.yaml` exists and is valid YAML | `Read {resolved-squad-root}/{name}/squad.yaml` — must parse without errors |
| 2 | `name` is kebab-case | Verify matches `^[a-z][a-z0-9-]*$` |
| 3 | `version` follows semver | Verify matches `^\d+\.\d+\.\d+$` |
| 4 | `slashPrefix` is unique | `Grep "slashPrefix:" ./squads/*/squad.yaml ~/squads/*/squad.yaml` — prefer `./squads/{name}` on collisions, no duplicates after resolution |
| 5 | All `components.agents` files exist | `Glob {resolved-squad-root}/{name}/agents/{agent}.md` |
| 6 | All `components.tasks` files exist | `Glob {resolved-squad-root}/{name}/tasks/{task}.md` |
| 7 | All agent IDs start with prefix | `Grep "id:" {resolved-squad-root}/{name}/agents/*.md` — each must start with `{prefix}-` |
| 8 | Registration in `.claude/squads/` complete | Agent files match count |
| 9 | Registration in `.claude/commands/SQUADS/` complete | Command files match count |

## Blocking Checks (v2) — 5 new

**These checks only apply when the v2 feature is present.** If a squad has no `components.schemas`, no `validation.schema` in workflows, and no `human-gate` steps, checks 10-14 are **automatically PASS** (vacuously true). v1 squads pass all 14 blocking checks without changes.

| # | Check | How to Verify | When to run |
|---|---|---|---|
| 10 | All `components.schemas` files exist | `Glob {resolved-squad-root}/{name}/schemas/{schema}.json` for each | Only if `components.schemas` is declared in squad.yaml |
| 11 | Schema files are valid JSON | `Bash(node -e 'JSON.parse(require("fs").readFileSync("FILE"))')` for each | Only if schema files exist (check 10 triggered) |
| 12 | Workflow validation.schema refs exist | For each `validation.schema` in workflow: verify file exists | Only if workflow has `validation.schema` fields |
| 13 | Workflow creates.schema refs exist | For each `creates.schema` in workflow: verify file exists | Only if workflow has `creates.schema` fields |
| 14 | Human gate IDs are unique | No duplicate `id` across human-gate steps within a workflow | Only if workflow has `human-gate` type steps |

## Advisory Checks (SHOULD pass) — 17 original

| # | Check | How to Verify |
|---|---|---|
| 15 | `config/coding-standards.md` exists | `Glob {resolved-squad-root}/{name}/config/coding-standards.md` |
| 16 | `config/tech-stack.md` exists | `Glob {resolved-squad-root}/{name}/config/tech-stack.md` |
| 17 | Agent collaboration documented | `Grep "Receives From\|Hands Off To" {resolved-squad-root}/{name}/agents/*.md` |
| 18 | `README.md` exists | `Glob {resolved-squad-root}/{name}/README.md` |
| 19 | Task naming follows convention | Each task matches `{prefix}-{role}-{verb}-{noun}.md` |
| 20 | No naming conflicts | Unique prefix and agent IDs across squads |
| 21 | Node deps declared → `package.json` exists | If non-empty: check file exists |
| 22 | Node deps declared → `pnpm-lock.yaml` exists | If non-empty: check file exists |
| 23 | Python deps declared → `pyproject.toml` exists | If non-empty: check file exists |
| 24 | Python deps declared → `uv.lock` exists | If non-empty: check file exists |
| 25 | Squad deps declared → squads exist | For each in `dependencies.squads`: check squad exists |
| 26 | Triggers display is valid | `inline` | `log` | `both` |
| 27 | Triggers events has at least one true | At least one event type enabled |
| 28 | Triggers logPath is valid | Non-empty string if display is log/both |
| 29 | Flow tracking has workflow | If `flow.enabled`, squad has ≥1 workflow |
| 30 | Flow tracking booleans valid | `live`/`preview`/`summary` are booleans |
| 31 | Log display has logPath | If display is log/both, logPath is defined |

## Advisory Checks (v2) — 5 new

| # | Check | How to Verify |
|---|---|---|
| 32 | Validation assertions are valid JS | Parse each assertion as JavaScript expression (dry-run eval) |
| 33 | Template files exist | For each `creates.template` in workflow: file exists in `templates/` |
| 34 | Template placeholders match fields | Template `{{fields}}` match `Saida.fields` in task |
| 35 | Model strategy uses known models | Model names match known providers (advisory — new models appear often) |
| 36 | State config has valid storage type | `state.storage` is `file` (only supported value currently) |

## Execution Protocol

1. Read `squad.yaml` and parse all fields
2. Run blocking checks 1-14 in order — stop on first failure
3. Run advisory checks 15-36 — collect warnings
4. Report results:

```
## Validation Report: {squad-name} (v2)

### Blocking (14 checks)
- [x] squad.yaml exists and valid
- [x] name is kebab-case
- [x] All schemas exist and are valid JSON
- [x] Workflow schema references resolve
- ...

### Advisory (22 checks)
- [x] coding-standards.md exists
- [x] Validation assertions parse correctly
- [ ] ⚠ Template placeholders don't match task fields
- [ ] ⚠ Agent model "gpt-5-turbo" not in known models list
- ...

### v2 Feature Summary
- Validation Gates: {N} steps with validation
- State Persistence: {enabled/disabled}
- Human Gates: {N} human-gate steps
- Schemas: {N} schema files
- Templates: {N} template files
- Model Routing: {configured/default}
- Context Budget: {N} agents with budget

### Result: {PASS | FAIL}
{Blocking failures: N | Advisory warnings: N}
```

## Common v2 Failures

| Failure | Fix |
|---|---|
| Schema file missing | Create `schemas/{name}.json` with proper JSON Schema |
| Schema not valid JSON | Fix JSON syntax in schema file |
| Workflow refs non-existent schema | Create the schema or fix the path |
| Duplicate human-gate ID | Rename one of the duplicate IDs |
| Assertion is not valid JavaScript | Fix syntax — assertions must be eval-able expressions |
| Template file missing | Create `templates/{name}.md` with `{{field}}` placeholders |
| Unknown model name | Update to a valid model identifier or ignore (advisory) |

## Upgrade Validation

When running `*upgrade-squad` from v1 to v2, additionally check:

| Check | Action |
|---|---|
| `schemas/` directory exists | Create if missing |
| `.squad-state` in `.gitignore` | Add if missing |
| `state` section in squad.yaml | Add with defaults if user opts in |
| `ajv` in dependencies | Suggest adding if validation gates are used |
