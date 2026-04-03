# Squad Discovery

## When to load
Intent: DISCOVER (keywords: list, show, find, search, inspect, info, describe)

## Protocol Reference
SQUAD_PROTOCOL.md Section 4.2 (Directory Structure)

## Discovery Algorithm

### Step 1: Find all squads
```bash
find ~/squads ./squads -maxdepth 2 -name "squad.yaml" -type f 2>/dev/null | sort -u
```

### Step 2: Lazy loading
For each squad.yaml found, parse ONLY these fields for listing:
- `name` (required)
- `version` (required)
- `description` (first 100 chars)
- `components` (count agents, tasks, workflows)
- `tags` (if present)

### Step 3: Deduplication
If same squad name exists in both `./squads/` and `~/squads/`, prefer `./squads/`.

### Step 4: Display format

**List view** (`*squad list`):
```
Squad Protocol Engine v4.0.0
Found N squads (M local, K global)

  NAME                        VERSION   AGENTS  TASKS  WORKFLOWS  ROOT
  my-squad                    1.0.0     3       5      2          ~/squads
  another-squad               2.1.0     4       8      3          ./squads
```

**Inspect view** (`*squad inspect {name}`):
Read full squad.yaml and display all sections including:
- Manifest fields (name, version, description, author, license, tags)
- Components inventory (agents, tasks, workflows with file names)
- Config (extends, coding-standards, tech-stack)
- Dependencies (node, python, squads)
- Harness config (if present)
- MCP servers (if present)

### Debug mode
`*squad list --debug` shows:
- Search paths attempted
- Files found per path
- Parse errors (if any)
- Dedup decisions

## Common Errors
- `~/squads` doesn't exist -> create it: `mkdir -p ~/squads`
- Permission denied -> check directory permissions
- squad.yaml parse error -> check YAML syntax
