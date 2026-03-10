# Workflow Patterns — Collaboration Templates

Five standard collaboration patterns for squad agents.

## 1. Pipeline Pattern

Agents work sequentially, each receiving output from the previous.

```
Agent A → Agent B → Agent C → Agent D
```

**Best for:** Linear processes where each step transforms input (content creation, data processing, build pipelines).

### squad.yaml workflow section

```yaml
components:
  workflows:
    - "main-pipeline.yaml"
```

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

## 2. Hub-and-Spoke Pattern

One orchestrator agent coordinates multiple specialist workers.

```
        ┌─ Worker A
Leader ─┤─ Worker B
        └─ Worker C
```

**Best for:** Complex tasks requiring multiple specializations coordinated by a central authority (project management, multi-domain analysis).

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

## 3. Review Pattern

Work agent + reviewer with feedback loop until quality gate passes.

```
Worker → Reviewer → [PASS] → Done
            │
            └─ [FAIL] → Worker (fix) → Reviewer (re-review)
```

**Best for:** Quality-critical outputs (code review, content editing, compliance checking).

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

## 4. Parallel Pattern

Multiple agents work simultaneously on independent tasks, then results are merged.

```
        ┌─ Worker A ─┐
Start ──┤─ Worker B ─┤── Merge → Done
        └─ Worker C ─┘
```

**Best for:** Independent subtasks that can be done concurrently (multi-format generation, parallel analysis, concurrent builds).

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
        - agent: "{prefix}-worker-c"
          action: "Process partition C"
          creates: "result-c"

    - group: "merge"
      requires: ["concurrent-work"]
      agents:
        - agent: "{prefix}-integrator"
          action: "Merge all results"
          requires: ["result-a", "result-b", "result-c"]
          creates: "merged-output"
```

## 5. Teams Pattern (Claude Code Agent Teams)

Persistent multi-agent team with shared task list, async messaging, and dependency-based coordination. Uses Claude Code's native TeamCreate/SendMessage/Task* tools for real-time collaboration between long-lived agents.

```
                    ┌─ Agent A (idle ↔ active)
Team Lead ──tasks──┤─ Agent B (idle ↔ active)
     ↑     msgs    └─ Agent C (idle ↔ active)
     └──────────────────────┘
```

**Best for:** Complex multi-step projects requiring real-time coordination, task dependencies, async communication, and persistent agent state (full-stack features, large refactors, multi-domain analysis).

**Requires:** Claude Code environment with TeamCreate, SendMessage, Task* tools available.

### How It Works

1. **Team Lead** creates the team and defines tasks with dependencies
2. **Teammates** are spawned as persistent Agent instances joined to the team
3. Teammates claim tasks, work autonomously, and mark tasks complete
4. **SendMessage** enables async communication (DMs, broadcasts, shutdown)
5. Teammates go **idle** between turns — this is normal; messages wake them
6. Team Lead coordinates by watching task progress and unblocking work

### teams-workflow.yaml

```yaml
workflow_name: "teams-workflow"
description: "Claude Code Agent Teams with shared task list and async messaging"

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
      responsibility: "Create tasks, coordinate work, resolve blockers"

    - role: "teammate"
      agent: "{prefix}-specialist-a"
      agent_type: "executor"
      responsibility: "Claim and execute assigned tasks"

    - role: "teammate"
      agent: "{prefix}-specialist-b"
      agent_type: "executor"
      responsibility: "Claim and execute assigned tasks"

  tasks:
    - id: "task-1"
      subject: "Research and analyze requirements"
      owner: "{prefix}-specialist-a"
      activeForm: "Researching requirements"

    - id: "task-2"
      subject: "Implement solution based on research"
      owner: "{prefix}-specialist-b"
      activeForm: "Implementing solution"
      blockedBy: ["task-1"]

    - id: "task-3"
      subject: "Review and validate output"
      owner: "{prefix}-orchestrator"
      activeForm: "Reviewing output"
      blockedBy: ["task-2"]

  communication:
    pattern: "directed"          # directed | broadcast
    idle_behavior: "wait"        # teammates idle between turns, wake on message
    shutdown: "graceful"         # shutdown_request → shutdown_response

  lifecycle:
    - phase: "setup"
      actions:
        - "TeamCreate(team_name, description)"
        - "TaskCreate(subject, description, activeForm) for each task"
        - "TaskUpdate(taskId, addBlockedBy) for dependencies"

    - phase: "spawn"
      actions:
        - "Agent(name, subagent_type, team_name, prompt) for each teammate"
        - "Spawn all teammates in ONE message for true parallelism"

    - phase: "execute"
      actions:
        - "Teammates: TaskList → claim unblocked task → TaskUpdate(in_progress)"
        - "Teammates: work autonomously → TaskUpdate(completed)"
        - "Team Lead: SendMessage to unblock or coordinate"

    - phase: "shutdown"
      actions:
        - "SendMessage(type: shutdown_request) to each teammate"
        - "Teammate: SendMessage(type: shutdown_response, approve: true)"
        - "TeamDelete() to clean up"
```

### Implementation Protocol

When executing a Teams workflow in Claude Code:

```
Step 1: Create team
  TeamCreate({ team_name: "{squad}-team", description: "..." })

Step 2: Create tasks with dependencies
  TaskCreate({ subject: "...", description: "...", activeForm: "..." })
  TaskUpdate({ taskId: "2", addBlockedBy: ["1"] })

Step 3: Spawn teammates (ALL in one message for parallelism)
  Agent({ name: "worker-a", subagent_type: "executor",
          team_name: "{squad}-team",
          prompt: "You are {role}. Read task list, claim unblocked tasks..." })
  Agent({ name: "worker-b", subagent_type: "executor",
          team_name: "{squad}-team",
          prompt: "You are {role}. Read task list, claim unblocked tasks..." })

Step 4: Coordinate (as tasks complete, unblock next)
  SendMessage({ type: "message", recipient: "worker-b",
                content: "Task 1 done. Task 2 unblocked.", summary: "Task 2 ready" })

Step 5: Shutdown
  SendMessage({ type: "shutdown_request", recipient: "worker-a", content: "Done" })
  SendMessage({ type: "shutdown_request", recipient: "worker-b", content: "Done" })
  TeamDelete()
```

### Anti-Patterns

- Never poll teammates with sleep loops — messages auto-deliver
- Never spawn teammates in separate messages — use ONE message for parallelism
- Never give vague prompts — each teammate gets isolated context, include full requirements
- Never use broadcast for one-to-one communication — use directed messages
- Never skip shutdown — always send shutdown_request before TeamDelete

### When to Use Teams vs Other Patterns

| Criteria | Use Teams | Use Other Pattern |
|----------|-----------|-------------------|
| Agents need to communicate in real-time | Yes | No |
| Tasks have complex dependency chains | Yes | Pipeline is simpler |
| Work spans multiple turns/sessions | Yes | No |
| Simple sequential handoff | No | Pipeline |
| Single coordinator with workers | Either | Hub-and-Spoke is lighter |

## Choosing a Pattern

| Scenario | Pattern |
|----------|---------|
| Steps depend on previous output | Pipeline |
| Central coordinator + specialists | Hub-and-Spoke |
| Quality gate with feedback loop | Review |
| Independent tasks that merge | Parallel |
| Real-time coordination with task dependencies | Teams |
| Complex multi-phase project | Combine patterns |
