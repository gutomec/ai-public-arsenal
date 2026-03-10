# Squad YAML Schema — Complete Reference

## Required Fields

```yaml
name: "{squad-name}"             # kebab-case, unique (REQUIRED)
version: "1.0.0"                 # Semantic versioning (REQUIRED)
description: "{description}"     # Purpose of the squad (REQUIRED)
author: "{author}"               # Creator name (REQUIRED)
license: MIT                     # MIT, Apache-2.0, ISC, UNLICENSED (REQUIRED)
slashPrefix: "{prefix}"          # Short activation prefix, 2-4 chars (REQUIRED)
```

## Optional: AIOS Integration

```yaml
aios:                            # OPTIONAL — only if using AIOS framework
  minVersion: "2.1.0"
  type: squad
```

## Components

```yaml
components:
  agents:                        # Agent definition files
    - "{prefix}-{role}.md"
  tasks:                         # Task definition files
    - "{prefix}-{role}-{verb}-{noun}.md"
  workflows:                     # Workflow YAML files
    - "{workflow-name}.yaml"
  checklists:                    # Validation checklists
    - "{checklist-name}.md"
  templates:                     # Reusable templates
    - "{template-name}.md"
  tools: []                      # Custom tools
  scripts:                       # Utility scripts
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

## Dependencies

```yaml
dependencies:
  node:                          # pnpm — generates package.json + pnpm-lock.yaml
    - "puppeteer@^23.0.0"
  python:                        # uv — generates pyproject.toml + uv.lock
    - "requests>=2.31.0"
  system: []                     # OS-level (documentation only, no auto-install)
  squads: []                     # Other squads this depends on
  mcp-tools: []                  # MCP tools required by the squad
  go: []                         # Go modules (reserved — future)
  rust: []                       # Cargo packages (reserved — future)
```

**Generated files (committed to git):** `package.json`, `pnpm-lock.yaml`, `pyproject.toml`, `uv.lock`, `squad-lock.json`.
**Ignored (NOT committed):** `node_modules/`, `.venv/`, `vendor/`, `target/`.

See `dependency-management.md` for full install/check protocols.

## Triggers (Optional)

```yaml
# ─── TRIGGERS (OPTIONAL) ───
triggers:
  enabled: true                    # false ou ausente = desabilitado
  display: inline                  # inline | log | both
  metrics: context-delta           # context-delta | char-estimate | both
  events:
    squad: true                    # trigger no start/end do squad
    agent: true                    # trigger no start/end de cada agent
    task: true                     # trigger no start/end de cada task
  logPath: ".aios/squad-triggers/" # path para log file (se display=log|both)
```

**Se `triggers` ausente ou `triggers.enabled: false` → NENHUM trigger.** Squads existentes continuam inalterados.

See `triggers-protocol.md` for full trigger format, output templates, and execution protocol.

### Flow Tracking (Optional)

```yaml
triggers:
  # ... campos base acima ...
  flow:                              # Flow tracking (opcional)
    enabled: true                    # Habilita rastreamento de fluxo de delegação
    live: true                       # Emite transições em tempo real
    preview: true                    # Gera preview antes de executar
    summary: true                    # Gera summary ao final
    format: ascii                    # ascii | mermaid | a2ui | all
    a2ui:                            # Config A2UI (se format inclui a2ui ou all)
      transport: sse                 # sse | websocket
      port: 3001                     # Porta do SSE server
      catalogId: "squad-flow"        # ID do catálogo customizado
```

| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `flow.enabled` | boolean | `false` | Habilita flow tracking |
| `flow.live` | boolean | `true` | Emite transições em tempo real |
| `flow.preview` | boolean | `true` | Gera mapa ASCII/A2UI antes de executar |
| `flow.summary` | boolean | `true` | Gera diagrama completo ao final |
| `flow.format` | string | `ascii` | Formato de output: `ascii`, `mermaid`, `a2ui`, `all` |
| `flow.a2ui.transport` | string | `sse` | Protocolo: `sse` ou `websocket` |
| `flow.a2ui.port` | number | `3001` | Porta do SSE/WebSocket server |
| `flow.a2ui.catalogId` | string | `squad-flow` | ID do catálogo A2UI customizado |

**Se `triggers.flow` ausente ou `flow.enabled: false` → triggers normais sem flow tracking.**

See `flow-tracker-protocol.md` for full NDJSON schema, terminal renderer, A2UI renderer, and catalog spec.

## Optional Sections

```yaml
mcpTools:                        # MCP tool requirements
  required:
    - "{tool}": "{why required}"
  optional:
    - "{tool}": "{nice to have}"

documentFormats:                 # Custom document formats
  - name: "{format-name}"
    dimensions: "{WxH or standard}"
    technology: "{HTML|PPTX|etc}"

videoFormats:                    # Custom video formats
  - name: "{format-name}"
    dimensions: "{WxH}"
    fps: 30
    technology: "{Remotion|FFmpeg|etc}"

tags:                            # Metadata tags
  - "{domain}"
  - "{capability}"
```

## Complete Minimal Example

```yaml
name: "my-squad"
version: "1.0.0"
description: "A squad for doing X"
author: "Your Name"
license: MIT
slashPrefix: "ms"

components:
  agents:
    - "ms-leader.md"
    - "ms-worker.md"
  tasks:
    - "ms-leader-plan-work.md"
    - "ms-worker-execute-task.md"
  workflows:
    - "main-pipeline.yaml"
  checklists: []
  templates: []
  tools: []
  scripts: []

config:
  extends: none
  coding-standards: config/coding-standards.md
  tech-stack: config/tech-stack.md

dependencies:
  node: []
  python: []
  squads: []

tags:
  - "automation"
```

## Naming Rules

| Element | Pattern | Example |
|---------|---------|---------|
| Squad name | `kebab-case` | `brandcraft`, `my-squad` |
| Slash prefix | 2-4 lowercase chars | `bc`, `ms`, `nsc` |
| Agent ID | `{prefix}-{role}` | `bc-renderer`, `ms-leader` |
| Task ID | `{prefix}-{agent-role}-{verb}-{noun}.md` | `bc-renderer-create-html.md` |
| Workflow | `{descriptive-name}.yaml` | `main-pipeline.yaml` |
