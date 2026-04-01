# Harness Protocol — v3 Runtime Engineering

The harness is what makes v3 different: it protects the runtime itself from failure modes that v2 couldn't handle.

## Harness Block Schema

```yaml
harness:
  doom_loop:
    enabled: true                    # Enable doom loop detection
    max_identical_outputs: 3         # N identical outputs before triggering (default: 3)
    similarity_threshold: 0.95       # Fuzzy match threshold 0.0-1.0 (default: 0.95)
    max_step_retries: 5             # Absolute max retries per step (default: 5)
    on_detect: abort                 # abort | escalate | change-strategy (default: abort)
    cooldown_seconds: 0              # Wait between retries (default: 0)

  ralph_loop:
    enabled: true                    # Enable Ralph loop (fresh context retry)
    max_iterations: 5                # Max fresh-context retries (default: 5)
    persist_state: true              # Save state between iterations (default: true)

  context_compaction:
    enabled: true                    # Enable context compaction on handoffs
    strategy: key-fields             # truncate | key-fields | summarize (default: key-fields)
    max_handoff_tokens: 4000         # Max tokens per handoff (default: 4000)
    preserve_schema_fields: true     # Keep schema-required fields in key-fields mode (default: true)

  filesystem_collaboration:
    enabled: true                    # Enable filesystem artifact sharing
    artifact_dir: artifacts          # Dir name under .squad-state/{run-id}/ (default: artifacts)
    cleanup: on_complete             # on_complete | manual | never (default: on_complete)

  traces:
    enabled: true                    # Enable execution traces
    level: standard                  # minimal | standard | verbose (default: standard)
    include_outputs: false           # Include raw agent outputs in trace (default: false)

  self_verify:
    default_enabled: true            # Enable self-verify for all steps by default

  diminishing_returns:
    enabled: true                    # Enable diminishing returns detection
    min_new_info_ratio: 0.10         # Stop if new info ratio falls below this (default: 0.10)
    consecutive_waves: 2             # Trigger after N consecutive waves below threshold (default: 2)
    coverage_threshold: 85           # Auto-stop if coverage score exceeds this (default: 85)
    on_detect: stop                  # stop | warn | continue (default: stop)

  artifact_lifecycle:
    enabled: true                    # Enable artifact state tracking
    states:                          # Ordered lifecycle states
      - draft
      - pending_validation
      - validated
      - approved
      - rejected
      - consumed
      - superseded
      - archived
    persistence: ".squad-state/{run-id}/artifact-lifecycle.json"
    require_validation: true         # Artifacts must pass validation before 'approved'

  quality_framework:
    enabled: true                    # Enable quality dimension scoring
    threshold: 7.0                   # Minimum overall quality score (0-10)
    dimensions:                      # 10 quality dimensions with weights
      accuracy: { weight: 1.0, threshold: 7.0, veto: true }
      coherence: { weight: 0.9, threshold: 6.0, veto: false }
      strategic_alignment: { weight: 0.9, threshold: 6.0, veto: false }
      operational_excellence: { weight: 0.8, threshold: 6.0, veto: false }
      innovation_capacity: { weight: 0.7, threshold: 5.0, veto: false }
      risk_management: { weight: 0.8, threshold: 6.0, veto: false }
      resource_optimization: { weight: 0.8, threshold: 6.0, veto: false }
      stakeholder_value: { weight: 0.7, threshold: 5.0, veto: false }
      adaptability: { weight: 0.6, threshold: 5.0, veto: false }
      sustainability: { weight: 0.5, threshold: 4.0, veto: false }

  middleware: []                     # Reserved — future middleware extensions
```

## Doom Loop Detection

### What is a doom loop?

An agent producing the same (or nearly identical) output repeatedly despite being asked to fix issues. This wastes tokens and time without progress.

### Detection Algorithm

```
After each agent dispatch:
  1. Hash the output (normalized: whitespace-trimmed, lowercased)
  2. Compare to previous outputs for this step (stored in step state)
  3. If hash matches OR string similarity > threshold:
     - Increment identical_count
  4. If identical_count >= max_identical_outputs:
     - DOOM LOOP DETECTED
     - Execute on_detect action
```

### Actions on Detection

| Action | Behavior |
|---|---|
| `abort` | Fail the step immediately. Workflow fails. State saved for resume. |
| `escalate` | Switch to a more powerful model (workers → orchestrator → reviewers) and retry once. |
| `change-strategy` | Append "IMPORTANT: Your previous N attempts produced identical output. You MUST take a fundamentally different approach." to the prompt and retry. |

### Per-Step Override

Individual workflow steps can override doom loop settings:

```yaml
- agent: "creative-writer"
  action: "Write marketing copy"
  loop_detection:
    enabled: true
    max_identical_outputs: 5    # More lenient for creative tasks
    on_detect: change-strategy  # Try different approach instead of aborting
```

## Ralph Loop (Fresh Context Retry)

### What is the Ralph Loop?

Named after the pattern of "starting over with a fresh perspective." When a step fails validation and normal retries aren't working, Ralph loop:

1. Saves all current state to disk
2. Builds a minimal, clean context with:
   - The original task
   - The specific validation errors
   - Essential input artifacts only (no accumulated noise)
3. Dispatches the agent in this clean context
4. Repeats up to `max_iterations` times

### When Ralph Loop Activates

- After normal `max_retries` are exhausted (from `validation.max_retries`)
- Only if `ralph_loop.enabled: true`
- Only if the step's `on_fail` is `retry` (not `abort` or `skip`)

### Execution Flow

```
Step fails validation → normal retry (1..max_retries)
  ↓ still failing
Ralph Loop iteration 1:
  - Save state to checkpoint
  - Build fresh context (original task + error summary only)
  - Dispatch agent
  - Validate output
  ↓ still failing
Ralph Loop iteration 2:
  - Same but with accumulated error feedback
  ↓ ...
Ralph Loop iteration N (max_iterations):
  - Final attempt
  ↓ still failing
Step FAILS. Workflow status: failed.
```

## Context Compaction

### When it Activates

Before passing output to the next agent's `requires`, if:
- `context_compaction.enabled: true`
- Output size > `max_handoff_tokens * 4` characters (rough token estimate)

### Strategies

| Strategy | Algorithm | Best for |
|---|---|---|
| `truncate` | Hard cut at max chars | Quick, when end of output is less important |
| `key-fields` | Parse JSON, keep only schema-required fields | Structured data with known schema |
| `summarize` | Keep first 2000 chars + metadata | Large text where overview suffices |

### key-fields Algorithm

```
1. Parse output as JSON (using extractJson 4-strategy parser)
2. Read the schema referenced by creates.schema
3. Extract `required` fields from schema (or all `properties` keys)
4. Build new JSON with only those fields
5. Serialize as compact JSON
```

Fallback: if JSON parsing or schema reading fails, falls back to `truncate`.

## Filesystem Collaboration

### Purpose

Large data (>10KB) should not bloat agent context windows. Instead:
1. Agent output is saved as a file in `.squad-state/{run-id}/artifacts/`
2. Next agent receives a file path reference instead of inline data
3. Next agent uses `read` tool to access the file on demand

### Artifact Lifecycle

| Phase | What happens |
|---|---|
| Step completes | Output saved to `artifacts/{artifact-name}` |
| Next step starts | Gets `[Artifact saved to: {path}]` in context |
| Workflow completes | If `cleanup: on_complete`, artifacts dir is removed |
| Workflow fails | Artifacts preserved for debugging |

### Cleanup Modes

| Mode | Behavior |
|---|---|
| `on_complete` | Remove artifacts/ after successful workflow completion |
| `manual` | Never auto-remove. User must clean up. |
| `never` | Never remove, even if user asks (safety mode for audit trails) |

## Execution Traces

### Trace Levels

| Level | Records |
|---|---|
| `minimal` | Step index, agent, status, duration |
| `standard` | + model used, validation result, retry count, harness events |
| `verbose` | + full input context, raw output (WARNING: large) |

### Trace Format

Traces are saved as JSONL in `.squad-state/{run-id}/traces/`:

```jsonl
{"event":"step-start","step":0,"agent":"analyzer","model":"claude-sonnet-4","timestamp":"2026-03-25T10:00:00Z"}
{"event":"step-complete","step":0,"agent":"analyzer","duration_ms":15230,"validation":{"schema":"PASS","assertions":["PASS","PASS"]},"timestamp":"2026-03-25T10:00:15Z"}
{"event":"doom-loop-detected","step":1,"agent":"worker","identical_count":3,"action":"abort","timestamp":"2026-03-25T10:01:30Z"}
```

### Viewing Traces

```
*show-traces {squad} {run-id}
```

Displays a formatted timeline of all trace events for the run.

## Self-Verify per Step

### Configuration

```yaml
- agent: "implementer"
  action: "Build the feature"
  self_verify:
    enabled: true
    checklist:
      - "Code compiles without errors"
      - "All existing tests still pass"
      - "New feature has test coverage"
    run_tests: "npm test"           # Command to run after step
    max_self_fix_attempts: 2        # How many times agent can fix its own output
```

### Execution

1. Agent produces output
2. If `run_tests` defined: execute the command
3. If command fails: feed error back to agent, let it fix (up to `max_self_fix_attempts`)
4. If `checklist` defined: agent self-evaluates against each item
5. Proceed to normal validation gate (if defined)

Self-verify happens BEFORE the validation gate. It's the agent's chance to fix obvious issues before formal validation.

## Reasoning Sandwich

### Phase-Based Model Routing

```yaml
model_strategy:
  orchestrator: "claude-sonnet-4"    # Planning/reasoning
  workers: "gemini-flash"            # Implementation/execution
  reviewers: "claude-sonnet-4"       # Verification/review
```

Steps declare their phase:

| Phase | Model Role | Purpose |
|---|---|---|
| `planning` | orchestrator | Strategic thinking, architecture, analysis |
| `implementation` | workers | Code generation, content creation, data processing |
| `verification` | reviewers | Quality review, validation, security audit |

### Resolution Priority

1. Agent-level `model` (from .md frontmatter)
2. Step-level `model` (from workflow step)
3. Phase-based routing (v3: planning→orchestrator, implementation→workers, verification→reviewers)
4. Workflow-level `model_strategy`
5. Squad-level `model_strategy`
6. Platform default

## DAG Workflows

### Pipeline vs DAG

| Pipeline | DAG |
|---|---|
| Steps run in strict sequence | Steps run when all dependencies are met |
| Each step depends on the previous | Explicit `depends_on` declarations |
| Simple, predictable | Supports parallelism within the workflow |

### DAG Execution

```yaml
workflow:
  type: dag
  sequence:
    - agent: "analyzer"
      id: "step-1"
      creates: { artifact: "analysis.json" }

    - agent: "frontend"
      id: "step-2a"
      depends_on: ["step-1"]
      requires: [{ artifact: "analysis.json" }]

    - agent: "backend"
      id: "step-2b"
      depends_on: ["step-1"]
      requires: [{ artifact: "analysis.json" }]

    - agent: "integrator"
      id: "step-3"
      depends_on: ["step-2a", "step-2b"]
```

Execution order: step-1 → (step-2a ∥ step-2b) → step-3

**Note:** Parallel execution in DAG mode is advisory. The Squad Manager dispatches steps sequentially but in dependency order — steps with no dependency relationship can be dispatched in any order. True parallel execution requires platform support.

## Adding Harness to Existing Squad

### `*add-harness {squad}`

1. Read `squad.yaml`
2. Detect current version (v1 or v2)
3. If v1: also add `state:` and `model_strategy:` (upgrade to v2 first)
4. Add `harness:` block with sensible defaults
5. Write updated `squad.yaml`
6. Validate with `*validate-harness {squad}`

### Default Harness (what `*add-harness` generates)

```yaml
harness:
  doom_loop:
    enabled: true
    max_identical_outputs: 3
    on_detect: abort
  ralph_loop:
    enabled: true
    max_iterations: 5
  context_compaction:
    enabled: true
    strategy: key-fields
    max_handoff_tokens: 4000
  filesystem_collaboration:
    enabled: true
    artifact_dir: artifacts
  traces:
    enabled: true
    level: standard
```

## Harness Validation (`*validate-harness`)

Checks:
1. `harness` is an object (not string/array)
2. Each sub-section has `enabled: boolean`
3. `doom_loop.max_identical_outputs` ≥ 2
4. `doom_loop.similarity_threshold` between 0.0 and 1.0
5. `doom_loop.on_detect` is one of: abort, escalate, change-strategy
6. `ralph_loop.max_iterations` ≥ 1
7. `context_compaction.strategy` is one of: truncate, key-fields, summarize
8. `context_compaction.max_handoff_tokens` > 0
9. `filesystem_collaboration.artifact_dir` is a valid directory name
10. `filesystem_collaboration.cleanup` is one of: on_complete, manual, never
11. `traces.level` is one of: minimal, standard, verbose
12. No unknown keys in harness block

## Diminishing Returns Detection (v3.1)

### What is Diminishing Returns?

Complementary to doom loop detection. Doom loop catches **identical** outputs. Diminishing returns catches **declining value** — when each iteration adds less new information than the last.

### Detection Algorithm

```
After each iteration/wave:
  1. Calculate new_info_ratio = new_unique_facts / total_facts
  2. Track ratio across consecutive waves
  3. If ratio < min_new_info_ratio for N consecutive waves:
     - DIMINISHING RETURNS DETECTED
  4. Also check coverage_threshold:
     - If coverage_score >= coverage_threshold AND high_credibility_sources >= 3:
       - SUFFICIENT COVERAGE — stop
```

### Stopping Rules (Deterministic)

| Rule | Type | Condition | Action |
|---|---|---|---|
| Max waves reached | HARD STOP | `wave >= max_waves` | Stop immediately |
| Sufficient coverage | HARD STOP | `coverage >= 85 AND high_sources >= 3` | Stop with success |
| Diminishing confirmed | HARD STOP | `new_info < 0.10 for 2 consecutive waves` | Stop with caveat |
| Acceptable coverage | SOFT STOP | `coverage >= 70 AND wave >= 2` | Stop with warning |
| Gaps not addressable | SOFT STOP | `all high_priority gaps failed search` | Stop with gap report |
| Insufficient first wave | MUST CONTINUE | `coverage < 50 AND wave == 1` | Continue searching |
| Critical gaps remain | MUST CONTINUE | `high_gaps > 0 AND wave < 3 AND new_info > 0.15` | Continue |

### Actions on Detection

| Action | Behavior |
|---|---|
| `stop` | End the iteration loop, proceed with current results |
| `warn` | Log warning, continue but flag in trace |
| `continue` | Ignore detection, keep iterating (use with caution) |

### Per-Step Override

```yaml
- agent: "researcher"
  action: "Deep research on topic"
  diminishing_returns:
    enabled: true
    min_new_info_ratio: 0.15     # More aggressive for research tasks
    coverage_threshold: 90        # Higher bar for research quality
```

## Context Compaction: Wave Compression Strategy (v3.1)

### The 4th Strategy: `wave-compress`

In addition to `truncate`, `key-fields`, and `summarize`, v3.1 adds `wave-compress`:

```yaml
context_compaction:
  strategy: wave-compress          # NEW: compress each iteration into summary file
  max_summary_tokens: 400          # Target tokens per wave summary
  persist_summaries: true          # Save wave-N-summary.md to artifacts/
```

### How It Works

1. After each iteration/wave completes, a lightweight model (workers tier) compresses results
2. Compressed summary saved as `wave-{N}-summary.md` (~400 tokens)
3. Raw results discarded from context
4. Next iteration reads only previous summaries (not raw data)
5. Final synthesis reads ALL wave summaries as consolidated input

### Wave Summary Format

```markdown
## Wave {N} Summary
**Coverage:** {score}/100 | **New Info:** {ratio} | **Sources:** {count} HIGH, {count} MEDIUM
**Decision:** {CONTINUE|STOP} - {reason}

### Key Findings (max 7, one line each)
1. {finding with specific data point} [source_url]

### Sources (URL + credibility only)
- {url} (HIGH|MEDIUM) - {one-line contribution}

### Gaps Remaining
- {gap description} (priority: HIGH|MEDIUM|LOW)
```

### Comparison of Strategies

| Strategy | Best for | Tokens saved | Preserves |
|---|---|---|---|
| `truncate` | Quick, end of output unimportant | ~60% | Beginning |
| `key-fields` | JSON with known schema | ~70-80% | Schema fields |
| `summarize` | Large text, overview sufficient | ~70% | First 2000 chars |
| `wave-compress` | Multi-iteration workflows | ~90% | Key findings only |

## Artifact Lifecycle Tracking (v3.1)

### Purpose

Track the state of every artifact through its lifecycle — from creation to consumption to archival. Prevents using unvalidated artifacts and enables audit trails.

### State Machine

```
draft → pending_validation → validated → approved → consumed → archived
                           ↘ rejected → draft (fix and retry)
                                         approved → superseded → archived
```

### Lifecycle File

Stored at `.squad-state/{run-id}/artifact-lifecycle.json`:

```json
{
  "artifacts": {
    "analysis.json": {
      "current_state": "validated",
      "history": [
        { "state": "draft", "timestamp": "...", "agent": "analyzer" },
        { "state": "pending_validation", "timestamp": "...", "trigger": "auto" },
        { "state": "validated", "timestamp": "...", "validator": "ajv", "result": "PASS" }
      ]
    }
  }
}
```

### Integration with Workflow

```yaml
- agent: "analyzer"
  creates:
    artifact: "analysis.json"
    lifecycle: true                # Enable lifecycle tracking for this artifact
    require_approval: false        # Auto-approve after validation passes
```

## Quality Framework (v3.1)

### Purpose

Provides a standardized scoring system for evaluating squad outputs across 10 dimensions. Quality scores are tracked in execution traces and can gate workflow progression.

### 10 Quality Dimensions

| # | Dimension | Weight | Threshold | Veto | Description |
|---|---|---|---|---|---|
| 1 | Accuracy | 1.0 | 7.0 | YES | Correctness verified by data/evidence |
| 2 | Coherence | 0.9 | 6.0 | NO | Internal consistency and alignment |
| 3 | Strategic Alignment | 0.9 | 6.0 | NO | Connection to goals and vision |
| 4 | Operational Excellence | 0.8 | 6.0 | NO | Process quality and efficiency |
| 5 | Innovation Capacity | 0.7 | 5.0 | NO | Ability to create novel solutions |
| 6 | Risk Management | 0.8 | 6.0 | NO | Identification and mitigation of risks |
| 7 | Resource Optimization | 0.8 | 6.0 | NO | Efficient use of time/tokens/money |
| 8 | Stakeholder Value | 0.7 | 5.0 | NO | Value delivered to end users |
| 9 | Adaptability | 0.6 | 5.0 | NO | Ability to evolve and extend |
| 10 | Sustainability | 0.5 | 4.0 | NO | Long-term maintainability |

### Scoring

Overall score = weighted average of all dimensions (0-10 scale).

- **>= 8.5**: Excellent — exceeds quality standards
- **7.0 - 8.4**: Good — meets quality standards
- **5.0 - 6.9**: Adequate — passes with warnings
- **< 5.0**: Fails — requires remediation

### Veto Dimensions

If a veto dimension (Accuracy) scores below its threshold, the entire output FAILS regardless of overall score.

### Integration with Self-Verify

```yaml
- agent: "validator"
  self_verify:
    enabled: true
    quality_framework:
      enabled: true
      threshold: 7.0
      veto_dimensions: ["accuracy"]
```
