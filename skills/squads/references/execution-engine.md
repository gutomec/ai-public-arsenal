# Execution Engine — v3 Runtime Protocol

The v3 execution engine extends v2 with harness engineering: doom loop detection, Ralph loop retry, real in-process validation (ajv), context compaction, filesystem collaboration, execution traces, reasoning sandwich model routing, and self-verify steps.

## Core Principle

The Squad Manager IS the runtime. There is no separate process. The Squad Manager reads the workflow YAML, executes each step, validates outputs in-process via ajv, detects doom loops, manages state, and writes execution traces — all within its own context window.

## Run Lifecycle

```
*run-workflow {squad} {workflow}
       │
       ▼
  INIT ──→ STEP LOOP ──→ FINALIZE
  │          │                │
  │    ┌─────┴──────────┐    │
  │    │ For each step:  │    │
  │    │                 │    │
  │    │ resolve model   │    │
  │    │ dispatch        │    │
  │    │ doom loop check │    │
  │    │ self-verify     │    │
  │    │ validate        │    │
  │    │ ralph loop?     │    │
  │    │ compact context │    │
  │    │ checkpoint      │    │
  │    │ save artifact   │    │
  │    │ record trace    │    │
  │    │ handoff         │    │
  │    └─────────────────┘    │
  │                           │
  └─── state.json ────────────┘
```

## Phase 1: Initialization

```
1. Generate run-id (UUID)
2. Create .squad-state/{run-id}/
3. Create .squad-state/{run-id}/artifacts/ (if filesystem_collaboration enabled)
4. Write initial state.json:
   - status: running
   - harness_active: true/false
   - harness_config: {...} or null
5. Emit squad-start trigger
```

## Phase 2: Step Loop

For each step in `workflow.sequence`:

### 2a. Resume Check

If resuming, skip completed steps (same as v2).

### 2b. Human Gate

Same as v2 — use `ask_user_questions`, save responses.

### 2c. Model Resolution (v3: Reasoning Sandwich)

Resolution order:
1. Agent-level model (from .md frontmatter)
2. Step-level model (from workflow step)
3. **Phase-based routing** (v3): `planning`→orchestrator, `implementation`→workers, `verification`→reviewers
4. Workflow-level model_strategy
5. Squad-level model_strategy
6. Platform default

### 2d. Agent Dispatch

Same as v2 — `squad_dispatch` with built context. Model preference communicated in task prompt.

### 2e. Doom Loop Check (v3)

If `harness.doom_loop.enabled`:

1. Compare output to previous outputs for this step
2. If identical/near-identical count >= `max_identical_outputs`:
   - Emit `doom-loop-detected` trigger
   - Execute `on_detect` action:
     - `abort` → fail step
     - `escalate` → switch model, retry
     - `change-strategy` → modify prompt, retry

### 2f. Self-Verify (v3)

If step has `self_verify.enabled: true`:

1. If `run_tests` defined: execute command via Bash
2. If command fails: feed error to agent, let it fix (up to `max_self_fix_attempts`)
3. If `checklist` defined: agent self-evaluates

Self-verify happens BEFORE the validation gate.

### 2g. Validation Gate (v3: Real In-Process)

**v3 difference from v2:** Validation runs in-process via ajv library, not via bash/node shell commands. This is faster, more reliable, and produces structured error output.

If `validation` defined:

1. **Extract JSON** from agent output (4-strategy parser):
   - Try whole output as JSON
   - Try fenced code block extraction
   - Try first `{` to last `}`
   - Try first `[` to last `]`

2. **Schema validation** via ajv:
   - Load schema from `schemas/{name}.json`
   - Validate with `allErrors: true`
   - Collect structured error messages

3. **Assertion evaluation**:
   - Each assertion is `new Function("output", "return ({expr})")(json)`
   - Returns PASS/FAIL with error details

4. **On failure**: Apply `on_fail` strategy
   - `retry`: re-dispatch with structured error feedback
   - `abort`: fail workflow
   - `skip`: log warning, proceed

### 2h. Ralph Loop (v3)

If step fails validation after exhausting normal retries AND `ralph_loop.enabled`:

1. Save current state
2. Build minimal fresh context:
   - Original task description
   - Specific validation errors
   - Schema requirements (if any)
   - NO accumulated context noise
3. Dispatch agent with fresh context
4. Validate again
5. Repeat up to `max_iterations`

### 2i. Context Compaction (v3)

Before handoff to next agent, if `context_compaction.enabled` and output exceeds `max_handoff_tokens`:

| Strategy | Algorithm |
|---|---|
| `truncate` | Hard cut at max_handoff_tokens × 4 chars |
| `key-fields` | Parse JSON, keep only schema-required fields |
| `summarize` | Keep first 2000 chars + length metadata |

### 2j. Checkpoint + Artifact Save

1. Save step output as checkpoint (same as v2)
2. If `filesystem_collaboration.enabled` and step has `creates`:
   - Save artifact to `.squad-state/{run-id}/artifacts/{name}`
   - Emit `artifact-saved` trigger

### 2k. Record Trace (v3)

If `traces.enabled`:
- Append step trace to `.squad-state/{run-id}/traces/trace-{run-id}.jsonl`
- Include: step, agent, model, duration, validation result, retry count, harness events

### 2l. Handoff

Prepare output for next agent's `requires` using `inject_as` strategy.
Apply context compaction if configured.

## Phase 3: Finalization

1. Update state.json: status completed/failed, duration
2. If `filesystem_collaboration.cleanup: on_complete` and status completed: remove artifacts/
3. Emit flow-complete trigger
4. Return final output

## State File Schema (v3)

### state.json

```json
{
  "run_id": "...",
  "squad": "...",
  "workflow": "...",
  "version": "3.0.0",
  "status": "running",
  "started_at": "...",
  "finished_at": null,
  "duration": null,
  "current_step": 2,
  "last_completed": 1,
  "total_steps": 5,
  "steps": [
    {
      "step": 0,
      "type": "agent",
      "agent": "sas-scanner",
      "status": "completed",
      "started_at": "...",
      "finished_at": "...",
      "duration": "2m 14s",
      "checkpoint": "step-000-sas-scanner.json",
      "validation": {
        "schema": "PASS",
        "assertions": ["PASS", "PASS"],
        "retries": 0,
        "duration_ms": 42
      }
    }
  ],
  "error": null,
  "harness_active": true,
  "harness_config": { ... }
}
```

## Version-Specific Behavior

| Feature | v1 squad | v2 squad | v3 squad |
|---|---|---|---|
| Validation | Skip | Bash/node shell | **In-process ajv** |
| State | None | Checkpoints | Checkpoints + artifacts |
| Doom loop | None | None | **Active** |
| Ralph loop | None | None | **Active** |
| Context compaction | None | Budget only | **Strategy-based** |
| Traces | None | None | **Active** |
| Self-verify | None | None | **Per-step** |
| Model routing | Default | Per-agent/step | **Phase-based** |
| Diminishing returns | None | None | **Coverage-based stopping** |
| Artifact lifecycle | None | None | **State machine tracking** |
| Quality framework | None | None | **10-dimension scoring** |
| Wave compression | None | None | **Multi-iteration context mgmt** |

v1 and v2 squads run with their native behavior — v3 features only activate when `harness:` is present.

## Phase 2m: Diminishing Returns Check (v3.1)

If `harness.diminishing_returns.enabled` and step is part of an iterative loop:

1. Calculate `new_info_ratio` = unique new facts / total facts this iteration
2. Check against `min_new_info_ratio` threshold
3. Track consecutive waves below threshold
4. If `consecutive_waves` reached → trigger `on_detect` action
5. Also check `coverage_threshold` for early successful stop

This is complementary to doom loop (identical output) — diminishing returns catches **declining value**.

## Phase 2n: Quality Framework Scoring (v3.1)

If `harness.quality_framework.enabled` and step has quality scoring:

1. Score output across 10 dimensions (0-10 each)
2. Calculate weighted average
3. Check veto dimensions (Accuracy) — if below threshold, FAIL regardless of overall
4. Check overall score against `threshold`
5. Record scores in execution trace

## Phase 2o: Artifact Lifecycle Transition (v3.1)

If `harness.artifact_lifecycle.enabled` and step `creates` an artifact:

1. Create artifact in `draft` state
2. If validation passes → transition to `validated`
3. If `require_approval: false` → auto-transition to `approved`
4. If approval required → wait for human gate
5. Write state transitions to `artifact-lifecycle.json`
