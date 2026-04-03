# Harness Configuration

## When to load
Intent: CONFIGURE (keywords: harness, doom loop, ralph loop, traces, configure, self-verify)

## Protocol Reference
SQUAD_PROTOCOL.md Sections 11, 12

## Complete Harness Block
Add to squad.yaml under `harness:` key:

```yaml
harness:
  # Doom Loop Detection
  doom_loop:
    enabled: true
    max_identical_outputs: 3
    similarity_threshold: 0.95
    on_detect: change-strategy  # abort | escalate | change-strategy

  # Ralph Loop (Fresh Context Retry)
  ralph_loop:
    enabled: true
    max_iterations: 5
    persist_state: true

  # Context Compaction
  context_compaction:
    enabled: true
    strategy: key-fields  # truncate | key-fields | summarize
    max_handoff_tokens: 4000
    preserve_schema_fields: true

  # Filesystem Collaboration
  filesystem_collaboration:
    enabled: true
    artifact_dir: .artifacts/{squad-name}
    cleanup: manual  # manual | on_complete | on_archive

  # Execution Traces
  traces:
    enabled: true
    level: standard  # minimal | standard | verbose
    include_outputs: false

  # Self-Verify (default for all workflow steps)
  self_verify:
    default_enabled: true

  # Quality Framework
  quality_framework:
    enabled: true
    threshold: 7.0
    dimensions:
      accuracy: { weight: 1.0, threshold: 7.0, veto: true }
      coherence: { weight: 0.9, threshold: 7.0, veto: false }
      research_depth: { weight: 1.0, threshold: 8.0, veto: true }
      decision_objectivity: { weight: 0.9, threshold: 7.0, veto: false }
```

## Feature Toggle Table
| Feature | Default | Key |
|---------|---------|-----|
| Doom loop detection | off | harness.doom_loop.enabled |
| Ralph loop | off | harness.ralph_loop.enabled |
| Context compaction | off | harness.context_compaction.enabled |
| Filesystem collaboration | off | harness.filesystem_collaboration.enabled |
| Execution traces | off | harness.traces.enabled |
| Self-verify | off | harness.self_verify.default_enabled |
| Quality framework | off | harness.quality_framework.enabled |

## Version Detection
A squad is v3 if it has the `harness` key in squad.yaml. Otherwise it's v1 (no state, no model_strategy) or v2 (has state or model_strategy but no harness).
