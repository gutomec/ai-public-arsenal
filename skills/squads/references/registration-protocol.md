# Registration Protocol — Squad Activation

Resolve squad source paths by checking `./squads/{squad-name}` first, then `~/squads/{squad-name}`. If both exist, use the workspace-local squad.

Registration makes squad agents accessible via slash commands (`/SQUADS:{name}:{agent-id}`).

## Register a Squad

### Step 1: Create Squad Registration Directory

```bash
mkdir -p .claude/squads/{squad-name}/agents/
```

### Step 2: Copy Agent Files

Copy each agent `.md` file from the squad source to the registration directory:

```bash
cp {resolved-squad-root}/{squad-name}/agents/{prefix}-{role}.md .claude/squads/{squad-name}/agents/
```

Repeat for every agent listed in `squad.yaml` → `components.agents`.

### Step 3: Create Command Files

```bash
mkdir -p .claude/commands/SQUADS/{squad-name}/
```

Copy or symlink each agent file:

```bash
cp {resolved-squad-root}/{squad-name}/agents/{prefix}-{role}.md .claude/commands/SQUADS/{squad-name}/
```

This enables `/SQUADS:{squad-name}:{agent-id}` slash command activation.

### Step 4: Verify Registration

Check that all agents are registered:

```
Glob: .claude/squads/{squad-name}/agents/*.md
Glob: .claude/commands/SQUADS/{squad-name}/*.md
```

Both directories should contain the same number of agent files as listed in `squad.yaml` → `components.agents`.

## Unregister a Squad

### Step 1: Remove Command Files

```bash
rm -r .claude/commands/SQUADS/{squad-name}/
```

### Step 2: Remove Squad Registration

```bash
rm -r .claude/squads/{squad-name}/
```

### Step 3: Verify Removal

```
Glob: .claude/squads/{squad-name}/  → should not exist
Glob: .claude/commands/SQUADS/{squad-name}/  → should not exist
```

## Verification Checklist

After registration, verify:

| Check | How |
|-------|-----|
| Squad dir exists | `Glob .claude/squads/{name}/agents/*.md` |
| Commands dir exists | `Glob .claude/commands/SQUADS/{name}/*.md` |
| Agent count matches | Count files vs `squad.yaml` components.agents length |
| Slash commands work | Try `/SQUADS:{name}:{agent-id}` |
| No duplicate prefixes | Check other squads don't share the same `slashPrefix` |

## Notes

- Registration does NOT modify the squad source files under `./squads/` or `~/squads/`
- Registration only creates copies/links in `.claude/` directories
- Unregistration only removes `.claude/` entries, leaving squad source directories intact
- A squad must pass validation before registration (see `validation-checklist.md`)
