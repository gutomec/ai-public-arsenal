# Workflow Schema — Definition Reference

Workflow files live in `squads/{squad}/workflows/{name}.yaml` and define multi-agent collaboration sequences.

## YAML Schema

```yaml
workflow_name: "{descriptive-name}"
description: "{what this workflow accomplishes}"

agent_sequence:
  - "{prefix}-{role1}"
  - "{prefix}-{role2}"
  - "{prefix}-{role3}"

success_indicators:
  - "{measurable outcome 1}"
  - "{measurable outcome 2}"

workflow:
  id: "{workflow-id}"
  name: "{Display Name}"
  type: pipeline                 # pipeline | parallel | conditional

  sequence:
    - agent: "{prefix}-{role1}"
      action: "{what this agent does}"
      creates: "{output artifact}"

    - agent: "{prefix}-{role2}"
      action: "{what this agent does}"
      requires: "{input from previous step}"
      creates: "{output artifact}"

    - agent: "{prefix}-{role3}"
      action: "{what this agent does}"
      requires: "{input from previous step}"
      creates: "{final output}"
```

## Workflow Types

### Pipeline (Sequential)

```yaml
workflow:
  type: pipeline
  sequence:
    - agent: "ms-analyst"
      action: "Analyze requirements"
      creates: "requirements-doc.md"
    - agent: "ms-builder"
      action: "Implement solution"
      requires: "requirements-doc.md"
      creates: "implementation/"
    - agent: "ms-reviewer"
      action: "Review and validate"
      requires: "implementation/"
      creates: "review-report.md"
```

### Parallel (Concurrent)

```yaml
workflow:
  type: parallel
  parallel_groups:
    - group: "analysis"
      agents:
        - agent: "ms-frontend"
          action: "Build UI components"
          creates: "components/"
        - agent: "ms-backend"
          action: "Build API endpoints"
          creates: "api/"
    - group: "integration"
      requires: ["analysis"]
      agents:
        - agent: "ms-integrator"
          action: "Wire frontend to backend"
          requires: ["components/", "api/"]
          creates: "integrated-app/"
```

### Conditional (Branching)

```yaml
workflow:
  type: conditional
  sequence:
    - agent: "ms-reviewer"
      action: "Review output"
      creates: "review-result"
      branches:
        - condition: "review-result == PASS"
          next: "ms-deployer"
        - condition: "review-result == FAIL"
          next: "ms-builder"
          action: "Fix issues and resubmit"
          max_iterations: 3
```

## Complete Example

```yaml
workflow_name: "content-pipeline"
description: "End-to-end content creation from brief to published output"

agent_sequence:
  - "cp-researcher"
  - "cp-writer"
  - "cp-editor"
  - "cp-publisher"

success_indicators:
  - "Content matches brief requirements"
  - "Editor approved final draft"
  - "Published to target platform"

workflow:
  id: "content-pipeline-v1"
  name: "Content Pipeline"
  type: pipeline

  sequence:
    - agent: "cp-researcher"
      action: "Research topic and gather sources"
      creates: "research-brief.md"

    - agent: "cp-writer"
      action: "Write first draft from research"
      requires: "research-brief.md"
      creates: "draft-v1.md"

    - agent: "cp-editor"
      action: "Review, edit, and approve"
      requires: "draft-v1.md"
      creates: "final-draft.md"

    - agent: "cp-publisher"
      action: "Format and publish"
      requires: "final-draft.md"
      creates: "published-content"
```
