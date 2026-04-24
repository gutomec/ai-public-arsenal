# Squad Activation

## When to load
Intent: ACTIVATE (keywords: activate, register, install, deps, enable)

## Protocol Reference
SQUAD_PROTOCOL_V4.md §5 (Squad Structure), §16 (Security), §18 (Runtime Compatibility)

## Activation Flow (`*squad activate {name}`)

### Step 1: Resolve squad path
```
if exists ./squads/{name}/squad.yaml → use ./squads/{name}
elif exists ~/squads/{name}/squad.yaml → use ~/squads/{name}
else → ERROR "Squad '{name}' not found in ./squads/ or ~/squads/"
```

### Step 2: Validate squad
Run full validation (see `03-validation.md`). If any Core blocking check fails → STOP.

### Step 3: Resolve target runtime

Inspect `runtime_requirements`:
- Harness detects active runtime.
- Verify it appears in `minimum` or `compatible`.
- If runtime matches `incompatible` → STOP with error.
- Load the corresponding adapter (`adapters/{runtime_id}.yaml`).

### Step 4: Check feature compatibility

For each feature in `features_required`:
- Verify adapter lists it in `features_supported`.
- If missing → STOP with error (fail-closed per P5).

For each feature in `features_optional`:
- If adapter does not support it → log degradation, continue.

### Step 5: Check dependencies

#### Package dependencies (if declared)

Squad may declare language-ecosystem dependencies via adapter-specific namespaces or a generic `dependencies:` block. Package installation is runtime-neutral:

```bash
# Node-based
node -e "try { require('{pkg}') } catch(e) { process.exit(1) }"
# Python-based
python3 -c "import {pkg}" 2>/dev/null
```

Install missing packages via the appropriate package manager if the adapter supports automated dependency resolution.

#### Environment variables

Read `env_required` from `squad.yaml`. Verify each variable is set. Missing variables → fail or warn per squad policy.

#### Secrets

Resolve secret references via the adapter's secret resolution mechanism. Never inline secrets.

### Step 6: Register with runtime

Registration is adapter-specific. The harness delegates to the adapter's invocation documentation (§11 in each adapter doc). Common patterns:

- Copy agent definitions to a runtime command directory.
- Generate slash-command stubs.
- Register subagent types with the runtime.

### Step 7: Report

```
Squad '{name}' v{version} activated for runtime '{runtime_id}'.

Runtime Compatibility:
  protocol: 4.0 ✓
  runtime_requirements.minimum: satisfied ✓
  features_required: all supported ✓
  features_optional: N/M supported, K degraded

Dependencies:
  {package manager}: installed ✓
  env_required: all set ✓

Registration:
  {adapter-specific registrations}

Ready to use.
```

## Deactivation Flow (`*squad deactivate {name}`)

1. Remove runtime registrations (adapter-specific).
2. Do NOT remove squad source files.
3. Do NOT uninstall dependencies (other squads may use them).
4. Report: "Squad '{name}' deactivated. Source files preserved."

## Common Errors

- Permission denied → check directory permissions.
- Package install fails → check network, suggest package manager alternative.
- Runtime not found in `runtime_requirements` → squad incompatible with current runtime.
- Feature missing → consult adapter's Feature Support Matrix.

---

## Runtime-Specific Details

Adapter invocation and registration specifics live in each adapter's §11:

| Runtime | See |
|---------|-----|
| Claude Code | [adapters/claude-code.md §11](../adapters/claude-code.md#11-invocation-examples) |
| Gemini CLI | [adapters/gemini-cli.md §11](../adapters/gemini-cli.md#11-invocation-examples) |
| Codex | [adapters/codex.md §11](../adapters/codex.md#11-invocation-examples) |
| Cursor | [adapters/cursor.md §11](../adapters/cursor.md#11-invocation-examples) |
| Antigravity | [adapters/antigravity.md §11](../adapters/antigravity.md#11-invocation-examples) |
