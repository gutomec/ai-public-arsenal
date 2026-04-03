# Squad Activation

## When to load
Intent: ACTIVATE (keywords: activate, register, install, deps, enable)

## Protocol Reference
SQUAD_PROTOCOL.md Section 4.1 (Manifest), Section 14 (Security)

## Activation Flow (`*squad activate {name}`)

### Step 1: Resolve squad path
```
if exists ./squads/{name}/squad.yaml -> use ./squads/{name}
elif exists ~/squads/{name}/squad.yaml -> use ~/squads/{name}
else -> ERROR "Squad '{name}' not found in ./squads/ or ~/squads/"
```

### Step 2: Validate squad
Run full validation (see 03-validation.md). If any blocking error -> STOP.

### Step 3: Check dependencies

#### Node dependencies
```bash
# Read squad.yaml -> dependencies.node
# For each package:
node -e "try { require('{pkg}') } catch(e) { process.exit(1) }"
# If missing: npm install {pkg}
```

#### Python dependencies
```bash
# Read squad.yaml -> dependencies.python
# For each package:
python3 -c "import {pkg}" 2>/dev/null
# If missing: pip3 install {pkg}
```

#### MCP dependencies
```bash
# Read squad.yaml -> mcps
# For each MCP server, verify it's configured in .claude/settings.json
# WARN if missing (don't auto-add — MCP config is user-managed)
```

#### Squad dependencies
```bash
# Read squad.yaml -> dependencies.squads
# For each required squad, verify it exists
# If missing: WARN "Required squad '{dep}' not found"
```

### Step 4: Register for slash commands
```bash
# Create command directory
mkdir -p .claude/commands/SQUADS/{name}/

# For each agent file in the squad:
# Copy (not symlink) agent file to .claude/commands/SQUADS/{name}/{agent-id}.md
# This enables /SQUADS:{name}:{agent-id} slash commands
cp {squad}/agents/{agent-id}.yaml .claude/commands/SQUADS/{name}/{agent-id}.md
```

### Step 5: Report
```
Squad '{name}' v{version} activated.

Dependencies:
  Node: 3/3 installed
  Python: 0 required
  MCP: 2 configured, 1 warning (missing: context7)

Registration:
  /SQUADS:{name}:{agent-1} ok
  /SQUADS:{name}:{agent-2} ok
  /SQUADS:{name}:{agent-3} ok

Ready to use.
```

## Deactivation Flow (`*squad deactivate {name}`)

1. Remove `.claude/commands/SQUADS/{name}/` directory
2. Do NOT remove squad source files
3. Do NOT uninstall dependencies (other squads may use them)
4. Report: "Squad '{name}' deactivated. Source files preserved."

## Common Errors
- Permission denied creating .claude/commands/ -> check directory permissions
- Node package install fails -> suggest `npx` as fallback
- MCP server not configured -> warn but don't block activation
