# Workflow Patterns — v2 Collaboration Templates

Seven standard collaboration patterns for squad agents. v2 adds Validated Pipeline and Human-Gated patterns.

## 1. Pipeline Pattern

Agents work sequentially, each receiving output from the previous.

```
Agent A → Agent B → Agent C → Agent D
```

**Best for:** Linear processes where each step transforms input (content creation, data processing, build pipelines).

### main-pipeline.yaml

```yaml
workflow_name: "main-pipeline"
description: "Sequential processing pipeline"

workflow:
  id: "pipeline-v1"
  name: "Main Pipeline"
  type: pipeline

  sequence:
    - agent: "{prefix}-step1"
      action: "Process input"
      creates: "step1-output"
    - agent: "{prefix}-step2"
      action: "Transform step1 output"
      requires: "step1-output"
      creates: "step2-output"
    - agent: "{prefix}-step3"
      action: "Finalize output"
      requires: "step2-output"
      creates: "final-output"
```

## 2. Validated Pipeline Pattern (NEW v2)

Pipeline with validation gates between every step. Each agent's output is verified programmatically before passing to the next.

```
Agent A → [GATE ✓] → Agent B → [GATE ✓] → Agent C → [GATE ✓] → Done
              │                      │                      │
              └── retry ──┘          └── retry ──┘          └── abort
```

**Best for:** High-reliability workflows where output quality must be guaranteed (legal review, medical analysis, financial processing).

### validated-pipeline.yaml

```yaml
workflow_name: "validated-pipeline"
description: "Pipeline with validation gates between every step"

workflow:
  id: "validated-pipeline-v1"
  name: "Validated Pipeline"
  type: pipeline

  state:
    enabled: true
    resume: true

  sequence:
    - agent: "{prefix}-extractor"
      action: "Extract structured data from input"
      creates:
        artifact: "extracted-data.json"
        format: json
        schema: "schemas/extracted-data.json"
      validation:
        schema: "schemas/extracted-data.json"
        assertions:
          - "output.items.length > 0"
          - "output.items.every(i => i.id && i.text)"
        on_fail: retry
        max_retries: 3

    - agent: "{prefix}-analyzer"
      action: "Analyze extracted data"
      requires:
        - artifact: "extracted-data.json"
          inject_as: structured
      creates:
        artifact: "analysis.json"
        format: json
        schema: "schemas/analysis.json"
      validation:
        schema: "schemas/analysis.json"
        assertions:
          - "output.score >= 0 && output.score <= 10"
        on_fail: retry
        max_retries: 2

    - agent: "{prefix}-reporter"
      action: "Generate report from analysis"
      requires:
        - artifact: "analysis.json"
          inject_as: structured
      creates:
        artifact: "report.md"
        format: markdown
        template: "templates/report.md"
      validation:
        assertions:
          - "output.length > 100"
        on_fail: retry
```

## 3. Human-Gated Pipeline (NEW v2)

Pipeline with human decision points. Workflow pauses for human input before critical transitions.

```
Agent A → [HUMAN] → Agent B → [HUMAN] → Agent C → Done
              │                    │
        "Which party?"      "Approve risks?"
```

**Best for:** Workflows requiring human judgment at key decision points (client review, approval workflows, advisory processes).

### human-gated-pipeline.yaml

```yaml
workflow_name: "human-gated-pipeline"
description: "Pipeline with human decision points"

workflow:
  id: "human-gated-v1"
  name: "Human-Gated Pipeline"
  type: pipeline

  state:
    enabled: true
    resume: true

  sequence:
    - agent: "{prefix}-extractor"
      action: "Extract and structure data"
      creates:
        artifact: "extracted.json"
        format: json
      validation:
        assertions:
          - "output.items.length > 0"
        on_fail: retry

    - type: human-gate
      id: "review-extraction"
      prompt: "Review the extracted data. Is it accurate?"
      questions:
        - id: accuracy
          question: "Is the extraction accurate?"
          options: ["Yes, proceed", "No, needs re-extraction"]
        - id: priority
          question: "What is the priority level?"
          options: ["High", "Medium", "Low"]
        - id: notes
          question: "Any additional notes for the analysis?"
          type: freeform
      creates: "human-review.json"

    - agent: "{prefix}-analyzer"
      action: "Analyze based on human-reviewed data"
      requires:
        - artifact: "extracted.json"
          inject_as: structured
        - artifact: "human-review.json"
          inject_as: structured
      creates:
        artifact: "analysis.json"
        format: json

    - type: human-gate
      id: "approve-analysis"
      prompt: "Review the analysis and approve or reject"
      questions:
        - id: approval
          question: "Approve the analysis?"
          options: ["Approved", "Needs revision", "Rejected"]
      creates: "approval.json"

    - agent: "{prefix}-reporter"
      action: "Generate final report"
      requires:
        - artifact: "analysis.json"
          inject_as: structured
        - artifact: "approval.json"
          inject_as: structured
      creates:
        artifact: "report.md"
        format: markdown
```

## 4. Hub-and-Spoke Pattern

One orchestrator agent coordinates multiple specialist workers.

```
        ┌─ Worker A
Leader ─┤─ Worker B
        └─ Worker C
```

**Best for:** Complex tasks requiring multiple specializations (project management, multi-domain analysis).

### hub-spoke.yaml

```yaml
workflow_name: "hub-spoke"
description: "Orchestrator delegates to specialists"

workflow:
  id: "hub-spoke-v1"
  name: "Hub and Spoke"
  type: parallel

  parallel_groups:
    - group: "delegation"
      agents:
        - agent: "{prefix}-orchestrator"
          action: "Break down work and delegate"
          creates: "task-assignments"

    - group: "execution"
      requires: ["delegation"]
      agents:
        - agent: "{prefix}-specialist-a"
          action: "Execute assigned work"
          creates: "output-a"
        - agent: "{prefix}-specialist-b"
          action: "Execute assigned work"
          creates: "output-b"

    - group: "integration"
      requires: ["execution"]
      agents:
        - agent: "{prefix}-orchestrator"
          action: "Integrate all outputs"
          requires: ["output-a", "output-b"]
          creates: "integrated-output"
```

## 5. Review Pattern

Work agent + reviewer with feedback loop until quality gate passes.

```
Worker → Reviewer → [PASS] → Done
            │
            └─ [FAIL] → Worker (fix) → Reviewer (re-review)
```

**Best for:** Quality-critical outputs (code review, content editing, compliance).

### review-loop.yaml

```yaml
workflow_name: "review-loop"
description: "Work with quality review feedback loop"

workflow:
  id: "review-loop-v1"
  name: "Review Loop"
  type: conditional

  sequence:
    - agent: "{prefix}-creator"
      action: "Produce initial output"
      creates: "draft"

    - agent: "{prefix}-reviewer"
      action: "Review output quality"
      requires: "draft"
      creates: "review-result"
      branches:
        - condition: "review-result == PASS"
          next: "done"
        - condition: "review-result == FAIL"
          next: "{prefix}-creator"
          action: "Apply review feedback"
          max_iterations: 5
```

**v2 enhancement:** Combine with validation gates for programmatic review:

```yaml
    - agent: "{prefix}-creator"
      creates:
        artifact: "draft.json"
        format: json
        schema: "schemas/draft.json"
      validation:
        schema: "schemas/draft.json"
        on_fail: retry
        max_retries: 2
```

## 6. Parallel Pattern

Multiple agents work simultaneously, results merged.

```
        ┌─ Worker A ─┐
Start ──┤─ Worker B ─┤── Merge → Done
        └─ Worker C ─┘
```

**Best for:** Independent subtasks done concurrently (multi-format generation, parallel analysis).

### parallel-execution.yaml

```yaml
workflow_name: "parallel-execution"
description: "Concurrent execution with merge"

workflow:
  id: "parallel-v1"
  name: "Parallel Execution"
  type: parallel

  parallel_groups:
    - group: "concurrent-work"
      agents:
        - agent: "{prefix}-worker-a"
          action: "Process partition A"
          creates: "result-a"
        - agent: "{prefix}-worker-b"
          action: "Process partition B"
          creates: "result-b"

    - group: "merge"
      requires: ["concurrent-work"]
      agents:
        - agent: "{prefix}-integrator"
          action: "Merge all results"
          requires: ["result-a", "result-b"]
          creates: "merged-output"
```

## 7. Teams Pattern (Claude Code Agent Teams)

Persistent multi-agent team with shared task list, async messaging, and dependency-based coordination.

```
                    ┌─ Agent A (idle ↔ active)
Team Lead ──tasks──┤─ Agent B (idle ↔ active)
     ↑     msgs    └─ Agent C (idle ↔ active)
     └──────────────────────┘
```

**Best for:** Complex multi-step projects requiring real-time coordination. **Requires Claude Code.**

### teams-workflow.yaml

```yaml
workflow_name: "teams-workflow"
description: "Claude Code Agent Teams with shared task list"

workflow:
  id: "teams-v1"
  name: "Agent Teams"
  type: teams
  runtime: claude-code

  team:
    name: "{squad-name}-team"
    description: "Team for {squad purpose}"

  roles:
    - role: "team-lead"
      agent: "{prefix}-orchestrator"
    - role: "teammate"
      agent: "{prefix}-specialist-a"
    - role: "teammate"
      agent: "{prefix}-specialist-b"

  tasks:
    - id: "task-1"
      subject: "Research requirements"
      owner: "{prefix}-specialist-a"
    - id: "task-2"
      subject: "Implement solution"
      owner: "{prefix}-specialist-b"
      blockedBy: ["task-1"]

  communication:
    pattern: "directed"
    shutdown: "graceful"
```

## Choosing a Pattern

| Scenario | Pattern |
|---|---|
| Steps depend on previous output | Pipeline |
| Steps need validated output quality | **Validated Pipeline** |
| Human decisions between steps | **Human-Gated Pipeline** |
| Central coordinator + specialists | Hub-and-Spoke |
| Quality gate with feedback loop | Review |
| Independent tasks that merge | Parallel |
| Real-time coordination | Teams |
| High-reliability + human oversight | **Validated + Human-Gated (combine)** |

## Combining Patterns

Patterns can be combined. A common v2 combination:

```yaml
# Validated pipeline with human gate and review loop
sequence:
  - agent: extractor       # validated pipeline
    validation: {...}
  - type: human-gate        # human-gated
    questions: [...]
  - agent: analyzer         # validated pipeline
    validation: {...}
  - agent: reviewer         # review pattern
    branches:
      - condition: PASS → done
      - condition: FAIL → analyzer (max 3x)
  - agent: reporter         # validated pipeline
    validation: {...}
```
