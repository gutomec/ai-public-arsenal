# Squad Upgrade

## When to load
Intent: UPGRADE (keywords: upgrade, migrate, convert)

## Protocol Reference
SQUAD_PROTOCOL.md Section 15

## Version Detection

```
if squad.yaml has 'harness' key → v3
elif squad.yaml has 'state' or 'model_strategy' or 'components.schemas' → v2
else → v1
```

## Upgrade Paths

### v1 → v2
Add to squad.yaml:
```yaml
state:
  enabled: true
  storage: file
  checkpoint_dir: ".squad-state"
  resume: true

model_strategy:
  orchestrator: "claude-sonnet-4"
  workers: "claude-sonnet-4"
  reviewers: "claude-sonnet-4"
```

### v2 → v3
Add harness block (see 08-harness.md for complete block).
Start with minimal config:
```yaml
harness:
  doom_loop:
    enabled: true
    max_identical_outputs: 3
    similarity_threshold: 0.95
    on_detect: change-strategy
  ralph_loop:
    enabled: true
    max_iterations: 5
    persist_state: true
  context_compaction:
    enabled: true
    strategy: key-fields
    max_handoff_tokens: 4000
  traces:
    enabled: true
    level: standard
```

### v1 → v3 (direct)
Add both state and harness blocks.

## Backward Compatibility
- v1 squads run without changes on v3 runtime
- v2 squads run without changes on v3 runtime
- v3 features are opt-in via harness block
- No breaking changes between versions
- Upgrade is always additive (new keys only)

## Upgrade Procedure
1. Detect current version
2. Show what will be added
3. Ask user confirmation
4. Add blocks to squad.yaml
5. Run validation
6. Report: "Squad '{name}' upgraded from v{old} to v{new}"
