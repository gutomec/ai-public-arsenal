# Workflow Schema — v3 Definition Reference

Workflow files live in `{resolved-squad-root}/{squad}/workflows/{name}.yaml` and define multi-agent collaboration sequences with validation gates, state persistence, human gates, structured handoffs, and v3 harness features (phases, self-verify, loop detection overrides, DAG). Resolve by checking `./squads/{squad}` first, then `~/squads/{squad}`.

## YAML Schema

```yaml
workflow_name: "{descriptive-name}"
description: "{what this workflow accomplishes}"

agent_sequence:                  # v1 compat — list of agent IDs
  - "{prefix}-{role1}"
  - "{prefix}-{role2}"

success_indicators:
  - "{measurable outcome 1}"

workflow:
  id: "{workflow-id}"
  name: "{Display Name}"
  type: pipeline                 # pipeline | parallel | conditional | dag (v3)

  state:                         # Override squad.yaml state
    enabled: true
    resume: true

  model_strategy:                # Override squad.yaml model_strategy
    orchestrator: "claude-sonnet-4"
    workers: "gemini-flash"

  harness:                       # v3: Override squad.yaml harness at workflow level
    doom_loop:
      enabled: true
      max_identical_outputs: 3
    traces:
      enabled: true
      level: verbose

  sequence:
    # Agent step (v2+)
    - agent: "{prefix}-{role}"
      action: "{task description}"
      model: "gemini-flash"              # Per-step model override
      phase: implementation              # v3: reasoning sandwich phase

      creates:
        artifact: "{output-file}"
        format: json
        schema: "schemas/{name}.json"

      requires:
        - artifact: "{input-file}"
          inject_as: structured

      validation:
        schema: "schemas/{name}.json"
        assertions:
          - "output.items.length > 0"
        on_fail: retry
        max_retries: 3

      context:                           # Context budget
        budget: 8000
        strategy: summarize

      # v3: Self-verify per step
      self_verify:
        enabled: true
        checklist:
          - "Output is valid JSON"
          - "All required fields present"
        run_tests: "npm test"
        max_self_fix_attempts: 2

      # v3: Loop detection override per step
      loop_detection:
        enabled: true
        max_identical_outputs: 5
        on_detect: change-strategy

    # Human gate step (v2+)
    - type: human-gate
      id: "{gate-id}"
      prompt: "{instruction to human}"
      questions:
        - id: "{question-id}"
          question: "{question text}"
          options: ["Option A", "Option B"]
      creates: "human-context.json"

    # DAG step (v3)
    - agent: "{prefix}-{role}"
      id: "step-unique-id"              # Required for DAG
      depends_on: ["step-1", "step-2"]  # DAG dependencies
      action: "{task description}"
```

## v3 Step Fields (New)

| Field | Type | Description |
|---|---|---|
| `phase` | string | Reasoning sandwich phase: `planning`, `implementation`, `verification` |
| `self_verify` | object | Self-verification config (see below) |
| `self_verify.enabled` | boolean | Enable self-verify for this step |
| `self_verify.checklist` | string[] | Items the agent must self-check |
| `self_verify.run_tests` | string | Bash command to run after step |
| `self_verify.max_self_fix_attempts` | number | Max self-fix attempts (default: 2) |
| `loop_detection` | object | Per-step doom loop override |
| `loop_detection.enabled` | boolean | Enable/disable doom loop for this step |
| `loop_detection.max_identical_outputs` | number | Override max identical outputs |
| `loop_detection.on_detect` | string | Override action: abort, escalate, change-strategy |
| `id` | string | Step ID for DAG dependencies |
| `depends_on` | string[] | Step IDs this step depends on (DAG mode) |

## DAG Workflow Type (v3)

```yaml
workflow:
  type: dag
  sequence:
    - agent: "analyzer"
      id: "analyze"
      action: "Analyze requirements"
      creates: { artifact: "analysis.json", format: json }

    - agent: "frontend-dev"
      id: "build-frontend"
      depends_on: ["analyze"]
      action: "Build frontend components"
      requires: [{ artifact: "analysis.json", inject_as: structured }]
      creates: { artifact: "frontend.json", format: json }

    - agent: "backend-dev"
      id: "build-backend"
      depends_on: ["analyze"]
      action: "Build API endpoints"
      requires: [{ artifact: "analysis.json", inject_as: structured }]
      creates: { artifact: "backend.json", format: json }

    - agent: "integrator"
      id: "integrate"
      depends_on: ["build-frontend", "build-backend"]
      action: "Integrate frontend and backend"
      requires:
        - { artifact: "frontend.json", inject_as: structured }
        - { artifact: "backend.json", inject_as: structured }
      creates: { artifact: "integration-report.json", format: json }
```

**Execution order:** analyze → (build-frontend ∥ build-backend) → integrate

DAG rules:
- Every step MUST have a unique `id`
- `depends_on` references step `id` values
- Steps with no `depends_on` run first (roots)
- Steps with all dependencies met run next (topological order)
- Cycles are invalid — detected at validation time

## Reasoning Sandwich Pattern (v3)

```yaml
workflow:
  sequence:
    - agent: "planner"
      phase: planning              # → orchestrator model
      action: "Analyze requirements and create plan"
      creates: { artifact: "plan.json", format: json }

    - agent: "implementer"
      phase: implementation        # → workers model (cheaper, faster)
      action: "Implement the plan"
      requires: [{ artifact: "plan.json", inject_as: structured }]
      creates: { artifact: "implementation.json", format: json }

    - agent: "reviewer"
      phase: verification          # → reviewers model (quality)
      action: "Review implementation quality"
      requires: [{ artifact: "implementation.json", inject_as: structured }]
      creates: { artifact: "review.json", format: json }
      validation:
        assertions:
          - "output.quality_score >= 7"
        on_fail: retry
```

## v1 Compatibility

v1 workflows use `agent_sequence` + `transitions`:

```yaml
workflow_name: my_pipeline
agent_sequence:
  - agent-a
  - agent-b
transitions:
  step_done:
    trigger: "analysis completed"
    next_steps:
      - command: "*run-agent-b"
```

Detection:
- `agent_sequence` present → v1 mode
- `workflow.sequence` present → v2/v3 mode

Both formats are valid. v1 workflows never need migration.
