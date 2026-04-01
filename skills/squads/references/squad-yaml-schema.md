# Squad YAML Schema — v3 Complete Reference

## Required Fields

```yaml
name: "{squad-name}"             # kebab-case, unique (REQUIRED)
version: "3.0.0"                 # Semantic versioning (REQUIRED)
description: "{description}"     # Purpose of the squad (REQUIRED)
author: "{author}"               # Creator name (REQUIRED)
license: MIT                     # MIT, Apache-2.0, ISC, UNLICENSED (REQUIRED)
slashPrefix: "{prefix}"          # Short activation prefix, 2-4 chars (REQUIRED)
```

## Components

```yaml
components:
  agents:
    - "{prefix}-{role}.md"
  tasks:
    - "{prefix}-{role}-{verb}-{noun}.md"
  workflows:
    - "{workflow-name}.yaml"
  schemas:                       # JSON Schema files (v2+)
    - "{artifact}.json"
  checklists:
    - "{checklist-name}.md"
  templates:
    - "{template-name}.md"
  tools: []
  scripts:
    - "{script}.js"
```

## Config

```yaml
config:
  extends: none                  # none | extend | override
  coding-standards: config/coding-standards.md
  tech-stack: config/tech-stack.md
  source-tree: config/source-tree.md
```

## State Management (v2+)

```yaml
state:
  enabled: true
  storage: file                  # file (default) — future: sqlite, supabase
  checkpoint_dir: ".squad-state"
  resume: true
  retention: 10                  # Keep last N runs (0 = keep all)
```

## Model Strategy (v2+)

```yaml
model_strategy:
  orchestrator: "claude-sonnet-4"    # Planning/reasoning model
  workers: "gemini-flash"            # Execution/worker model
  reviewers: "claude-sonnet-4"       # Review/verification model
  override: true                     # Allow per-agent override
```

## Harness (v3 — NEW)

```yaml
harness:
  doom_loop:
    enabled: true
    max_identical_outputs: 3
    similarity_threshold: 0.95
    max_step_retries: 5
    on_detect: abort               # abort | escalate | change-strategy
    cooldown_seconds: 0

  ralph_loop:
    enabled: true
    max_iterations: 5
    persist_state: true

  context_compaction:
    enabled: true
    strategy: key-fields           # truncate | key-fields | summarize
    max_handoff_tokens: 4000
    preserve_schema_fields: true

  filesystem_collaboration:
    enabled: true
    artifact_dir: artifacts
    cleanup: on_complete           # on_complete | manual | never

  traces:
    enabled: true
    level: standard                # minimal | standard | verbose
    include_outputs: false

  self_verify:
    default_enabled: true

  diminishing_returns:
    enabled: true
    min_new_info_ratio: 0.10
    consecutive_waves: 2
    coverage_threshold: 85
    on_detect: stop

  artifact_lifecycle:
    enabled: true
    states: [draft, pending_validation, validated, approved, rejected, consumed, superseded, archived]
    require_validation: true

  quality_framework:
    enabled: true
    threshold: 7.0
    dimensions:
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

  middleware: []
```

See `harness-protocol.md` for detailed documentation of each harness feature.

## Dependencies

```yaml
dependencies:
  node:
    - "ajv@^8.0.0"              # Required for v3 validation
    - "ajv-formats@^3.0.0"
  python: []
  squads: []
```

## Triggers (Optional)

```yaml
triggers:
  enabled: true
  display: inline                # inline | log | both
  events:
    squad: true
    agent: true
    task: true
    validation: true             # v2+
    checkpoint: true             # v2+
    human_gate: true             # v2+
    doom_loop: true              # v3 NEW
    ralph_loop: true             # v3 NEW
    artifact: true               # v3 NEW
    trace: true                  # v3 NEW
  logPath: ".aios/squad-triggers/"
  flow:
    enabled: true
    live: true
    preview: true
    summary: true
```

## Tags

```yaml
tags:
  - "{domain}"
  - "{capability}"
  - "v3"                         # Tag to indicate v3 features
  - "harness"                    # Indicates harness engineering
```

## Complete v3 Example

```yaml
name: "security-audit-squad"
version: "3.0.0"
description: "Multi-agent security audit with harness-engineered validation, doom loop protection, and execution traces"
author: "Your Name"
license: MIT
slashPrefix: "sas"

components:
  agents:
    - "sas-scanner.md"
    - "sas-analyzer.md"
    - "sas-reporter.md"
  tasks:
    - "sas-scanner-scan-code.md"
    - "sas-analyzer-analyze-findings.md"
    - "sas-reporter-write-report.md"
  workflows:
    - "full-audit.yaml"
  schemas:
    - "scan-results.json"
    - "analysis.json"
    - "report.json"
  checklists: []
  templates:
    - "security-report.md"
  tools: []
  scripts: []

config:
  extends: none

state:
  enabled: true
  storage: file
  resume: true
  retention: 10

model_strategy:
  orchestrator: "claude-sonnet-4"
  workers: "gemini-flash"
  reviewers: "claude-sonnet-4"
  override: true

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
  self_verify:
    default_enabled: true

dependencies:
  node:
    - "ajv@^8.0.0"
    - "ajv-formats@^3.0.0"
  python: []
  squads: []

tags:
  - "security"
  - "audit"
  - "v3"
  - "harness"
```

## Version Compatibility

| Feature | v1 | v2 | v3 |
|---|---|---|---|
| `name`, `version`, `description`, `slashPrefix` | ✅ | ✅ | ✅ |
| `components.agents/tasks/workflows` | ✅ | ✅ | ✅ |
| `components.schemas` | ❌ | ✅ | ✅ |
| `state` | ❌ | ✅ | ✅ |
| `model_strategy` | ❌ | ✅ | ✅ |
| `harness` | ❌ | ❌ | ✅ |
| `triggers.events.doom_loop` | ❌ | ❌ | ✅ |
| `triggers.events.ralph_loop` | ❌ | ❌ | ✅ |
| `triggers.events.artifact` | ❌ | ❌ | ✅ |
| `triggers.events.trace` | ❌ | ❌ | ✅ |
| `harness.diminishing_returns` | ❌ | ❌ | ✅ |
| `harness.artifact_lifecycle` | ❌ | ❌ | ✅ |
| `harness.quality_framework` | ❌ | ❌ | ✅ |

## Naming Rules

| Element | Pattern | Example |
|---|---|---|
| Squad name | `kebab-case` | `security-audit-squad` |
| Slash prefix | 2-4 lowercase chars | `sas` |
| Agent ID | `{prefix}-{role}` | `sas-scanner` |
| Task ID | `{prefix}-{agent-role}-{verb}-{noun}.md` | `sas-scanner-scan-code.md` |
| Workflow | `{descriptive-name}.yaml` | `full-audit.yaml` |
| Schema | `{artifact-name}.json` | `scan-results.json` |
| Template | `{output-name}.md` or `.json` | `security-report.md` |
