# Workflow Orchestration

## When to load
Intent: EXECUTE (keywords: run, execute, start, launch, resume)

## Protocol Reference
SQUAD_PROTOCOL.md Sections 7.1-7.4

## Workflow Types

### Story Development Cycle (SDC)
Sequential 4-phase pipeline:
```
@sm create → @po validate → @dev implement → @qa gate → @devops push
```
| Phase | Agent | Task | Output |
|-------|-------|------|--------|
| 1 | @sm | create-next-story.md | story file |
| 2 | @po | validate-next-story.md | GO (>=7/10) or NO-GO |
| 3 | @dev | dev-develop-story.md | Working code |
| 4 | @qa | qa-gate.md | PASS / CONCERNS / FAIL / WAIVED |

### QA Loop (Ralph Loop)
Iterative review-fix cycle:
```
@qa review → verdict → @dev fixes → re-review (max 5 iterations)
```
Verdicts: APPROVE (done), REJECT (fix + re-review), BLOCKED (escalate immediately)
Escalation triggers: max_iterations_reached, verdict_blocked, fix_failure, manual_escalate

### Spec Pipeline
Sequential with skippable phases:
| Phase | Agent | Skip Condition |
|-------|-------|---------------|
| Gather | @pm | Never |
| Assess | @architect | source=simple |
| Research | @analyst | SIMPLE class |
| Write | @pm | Never |
| Critique | @qa | Never |
| Plan | @architect | If APPROVED |
Complexity Classes: SIMPLE (<=8), STANDARD (9-15), COMPLEX (>=16)

### DAG Workflows
Steps declare `depends_on` for parallel execution:
```yaml
sequence:
  - id: analyze
    agent: architect
    task: analyze-requirements
  - id: design-db
    agent: data-engineer
    task: design-schema
    depends_on: [analyze]
  - id: design-api
    agent: architect
    task: design-api
    depends_on: [analyze]
  - id: implement
    agent: dev
    task: implement
    depends_on: [design-db, design-api]
```

## Workflow Patterns
| Pattern | Description | Use case |
|---------|-------------|----------|
| Pipeline | A → B → C (linear) | Simple sequential work |
| Validated Pipeline | A → [GATE] → B → [GATE] → C | Quality-gated progression |
| Human-Gated | A → [HUMAN] → B → [HUMAN] → C | Requires approval |
| Hub-and-Spoke | Leader delegates to parallel workers | Coordinated parallel work |
| Review Loop | Worker → Reviewer → [PASS/FAIL] | QA iterations |
| Parallel | Split → Workers A/B/C → Merge | Independent parallel tasks |
| DAG | Topological order with depends_on | Complex dependencies |

## Execution Modes
| Mode | Prompts | Use case |
|------|---------|----------|
| yolo | 0-1 | Fast autonomous execution |
| interactive | 5-10 | Balanced, educational |
| preflight | comprehensive | Planning-heavy |

## Reasoning Sandwich (Model Routing)
```yaml
model_strategy:
  orchestrator: "claude-sonnet-4"   # planning phase
  workers: "gemini-flash-2.0"       # implementation phase
  reviewers: "claude-sonnet-4"      # verification phase
```

## Running a Workflow
1. Resolve squad path
2. Read squad.yaml and find the workflow file
3. Read the workflow YAML
4. Verify all referenced agents and tasks exist
5. Execute steps in sequence (or parallel for DAG)
6. Apply self-verify after each step (if configured)
7. Track state to `.squad-state/{run-id}.yaml`
8. Report results
