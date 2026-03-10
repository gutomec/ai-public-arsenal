# Validation Checklist — 26 Integrity Checks

Run these checks against a squad to verify integrity before registration.

## Blocking Checks (MUST pass)

| # | Check | How to Verify |
|---|-------|---------------|
| 1 | `squad.yaml` exists and is valid YAML | `Read squads/{name}/squad.yaml` — must parse without errors |
| 2 | `name` is kebab-case | `Grep "^name:" squads/{name}/squad.yaml` — verify matches `^[a-z][a-z0-9-]*$` |
| 3 | `version` follows semver | `Grep "^version:" squads/{name}/squad.yaml` — verify matches `^\d+\.\d+\.\d+$` |
| 4 | `slashPrefix` is unique | `Grep "slashPrefix:" squads/*/squad.yaml` — no duplicates |
| 5 | All `components.agents` files exist | For each agent in list: `Glob squads/{name}/agents/{agent}.md` |
| 6 | All `components.tasks` files exist | For each task in list: `Glob squads/{name}/tasks/{task}.md` |
| 7 | All agent IDs start with prefix | `Grep "id:" squads/{name}/agents/*.md` — each must start with `{prefix}-` |
| 8 | Registration in `.claude/squads/` complete | `Glob .claude/squads/{name}/agents/*.md` — count matches agents list |
| 9 | Registration in `.claude/commands/SQUADS/` complete | `Glob .claude/commands/SQUADS/{name}/*.md` — count matches agents list |

## Advisory Checks (SHOULD pass)

| # | Check | How to Verify |
|---|-------|---------------|
| 10 | `config/coding-standards.md` exists | `Glob squads/{name}/config/coding-standards.md` |
| 11 | `config/tech-stack.md` exists | `Glob squads/{name}/config/tech-stack.md` |
| 12 | Agent collaboration documented | `Grep "Receives From\|Hands Off To" squads/{name}/agents/*.md` — each agent has both |
| 13 | `README.md` exists | `Glob squads/{name}/README.md` |
| 14 | Task naming follows convention | Each task file matches `{prefix}-{role}-{verb}-{noun}.md` pattern |
| 15 | No naming conflicts with existing squads | `Grep "slashPrefix:" squads/*/squad.yaml` — verify unique prefix and agent IDs |
| 16 | Node deps declared → `package.json` exists | If `dependencies.node` non-empty: `Glob squads/{name}/package.json` |
| 17 | Node deps declared → `pnpm-lock.yaml` exists | If `dependencies.node` non-empty: `Glob squads/{name}/pnpm-lock.yaml` |
| 18 | Python deps declared → `pyproject.toml` exists | If `dependencies.python` non-empty: `Glob squads/{name}/pyproject.toml` |
| 19 | Python deps declared → `uv.lock` exists | If `dependencies.python` non-empty: `Glob squads/{name}/uv.lock` |
| 20 | Squad deps declared → squads exist | For each in `dependencies.squads`: `Glob squads/{dep}/squad.yaml` |
| 21 | Se `triggers.enabled`, `display` é válido (`inline`\|`log`\|`both`) | `Grep "display:" squads/{name}/squad.yaml` — verify matches valid value | Advisory |
| 22 | Se `triggers.enabled`, `events` tem pelo menos um tipo `true` | Check `events.squad`, `events.agent`, or `events.task` is true | Advisory |
| 23 | Se `triggers.logPath` definido, path é válido | Verify path string is non-empty and doesn't contain invalid chars | Advisory |
| 24 | Se `triggers.flow.enabled`, squad tem pelo menos 1 workflow | Check `components.workflows` is non-empty | Advisory |
| 25 | Se `triggers.flow.format` definido, é válido (`ascii`\|`mermaid`\|`a2ui`\|`all`) | Verify value matches valid options | Advisory |
| 26 | Se `triggers.flow.a2ui` definido, `transport` é válido (`sse`\|`websocket`) | Verify `a2ui.transport` matches valid options | Advisory |

## Execution Protocol

1. Read `squad.yaml` and parse all fields
2. Run blocking checks 1-9 in order — stop on first failure
3. Run advisory checks 10-26 — collect warnings
4. Report results:

```
## Validation Report: {squad-name}

### Blocking (9 checks)
- [x] squad.yaml exists and valid
- [x] name is kebab-case
- ...

### Advisory (17 checks)
- [x] coding-standards.md exists
- [ ] ⚠ Agent collaboration not documented in {agent}
- [ ] ⚠ Node deps declared but package.json missing
- ...

### Result: {PASS | FAIL}
{Blocking failures: N | Advisory warnings: N}
```

## Common Failures

| Failure | Fix |
|---------|-----|
| Agent file missing | Create `squads/{name}/agents/{prefix}-{role}.md` with proper schema |
| Task file missing | Create `squads/{name}/tasks/{prefix}-{role}-{verb}-{noun}.md` |
| Wrong agent ID prefix | Rename agent ID in frontmatter to start with `{prefix}-` |
| Duplicate slashPrefix | Change prefix in `squad.yaml` and rename all agent/task IDs |
| Registration incomplete | Run `*register-squad {name}` to copy files to `.claude/` |
| Node deps declared, no `package.json` | Run `*install-squad-deps {name}` to generate manifest and install |
| Python deps declared, no `pyproject.toml` | Run `*install-squad-deps {name}` to generate manifest and install |
| Lock file missing | Deps declared but never installed — run `*install-squad-deps {name}` |
| Squad dependency not found | Create or install the referenced squad first |
