# Execution Runtime

## When to load
Intent: EXECUTE, OBSERVE

## Protocol Reference
SQUAD_PROTOCOL.md Sections 11, 12

## Doom Loop Detection `[HARNESS]`
Detects when an agent repeats identical or near-identical outputs.

Configuration in squad.yaml:
```yaml
harness:
  doom_loop:
    enabled: true
    max_identical_outputs: 3
    similarity_threshold: 0.95
    on_detect: change-strategy  # or: abort, escalate
```

Detection algorithm:
1. After each agent output, compare with previous N outputs
2. If similarity >= threshold for max_identical_outputs consecutive times → trigger
3. Actions: abort (stop immediately), escalate (notify human), change-strategy (try different approach)

## Ralph Loop `[PROMPT]`
Fresh context retry when normal retries fail.

Configuration:
```yaml
harness:
  ralph_loop:
    enabled: true
    max_iterations: 5
    persist_state: true
```

Process:
1. Normal execution fails after retries
2. Ralph loop creates FRESH context with: original task + specific error details only
3. No accumulated conversation history (avoids bias from previous failures)
4. State persisted to disk between iterations
5. Max 5 iterations, then escalate to human

## Context Compaction `[HARNESS]`
Reduces context size while preserving essential information.

Configuration:
```yaml
harness:
  context_compaction:
    enabled: true
    strategy: key-fields  # or: truncate, summarize
    max_handoff_tokens: 4000
    preserve_schema_fields: true
```

Strategies:
- `truncate`: Drop oldest messages, keep last N
- `key-fields`: Extract only essential fields from handoff data
- `summarize`: LLM summarizes conversation before handoff

Token budgets (from Claude Code):
| Parameter | Value |
|-----------|-------|
| Default context window | 200,000 tokens |
| 1M context (Sonnet 4, Opus 4.6) | 1,000,000 tokens |
| Max output tokens | 32,000 (default), 64,000 (upper) |
| Auto-compact trigger | contextWindow - maxOutput - 13K buffer |

## Filesystem Collaboration `[HARNESS]`
Agents write large artifacts to disk instead of passing inline.

Configuration:
```yaml
harness:
  filesystem_collaboration:
    enabled: true
    artifact_dir: .artifacts/{squad-name}
    cleanup: manual  # or: on_complete, on_archive
```

## Execution Traces
JSONL traces per step for observability.

Configuration:
```yaml
harness:
  traces:
    enabled: true
    level: standard  # or: minimal, verbose
    include_outputs: false
```

Trace fields: step_id, agent_id, task_name, started_at, completed_at, duration_ms, status, model_used, tokens_in, tokens_out, validation_result, harness_events

View traces: `*squad traces {squad} {run-id}`

## Self-Verify `[PROMPT]`
Per-step verification before formal validation gate.

Configuration per workflow step:
```yaml
self_verify:
  enabled: true
  checklist:
    - "Output contains required fields"
    - "No placeholder values remain"
  test_command: "node validate.js {output}"
```

## State Persistence
Run state saved to `.squad-state/{run-id}.yaml`:
```yaml
run_id: "run-20260402-143000"
squad: "my-squad"
workflow: "main-pipeline"
status: running  # pending, running, paused, completed, failed
current_step: 3
steps:
  - id: 1
    status: completed
    started_at: "2026-04-02T14:30:00Z"
    completed_at: "2026-04-02T14:31:00Z"
  - id: 2
    status: completed
  - id: 3
    status: running
```
