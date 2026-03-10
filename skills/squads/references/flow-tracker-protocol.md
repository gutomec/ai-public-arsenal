# Flow Tracker Protocol — Rastreamento de Delegação + Visualização A2UI

## Visão Geral

O Flow Tracker rastreia o fluxo de delegação entre agents de um squad — quem delegou para quem, com qual artefato, e em que ordem. É **opt-in** via `triggers.flow` no `squad.yaml`.

Opera em três momentos:
1. **Preview** (antes) — mapa do fluxo planejado
2. **Live** (durante) — transições em tempo real
3. **Summary** (depois) — diagrama completo com métricas

Emite eventos em formato **NDJSON estruturado** que alimenta dois renderers:

```
Squad Manager (skill)
       │
       ├── Terminal: ASCII art inline no chat
       │
       └── A2UI Stream: SSE/WebSocket → Browser
              │
              ├── createSurface → canvas do flow graph
              ├── updateComponents → nodes (agents) + edges (delegações)
              └── updateDataModel → status, métricas, timestamps
```

---

## Seção 1: Evento de Flow (NDJSON Schema)

### Campos Padrão

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `type` | string | Tipo do evento (ver tabela abaixo) |
| `squad` | string | Nome do squad |
| `prefix` | string | slashPrefix do squad |
| `workflow` | string | Nome do workflow ativo |
| `from` | object | Agent de origem (`agent`, `icon`, `status`, `duration`) |
| `to` | object | Agent de destino (`agent`, `icon`, `status`) |
| `handoff` | object | Artefato transferido (`artifact`, `items`) |
| `progress` | object | Progresso global (`current`, `total`, `percent`) |
| `timestamp` | string | ISO 8601 timestamp |

### Tipos de Evento

| Tipo | Quando | Campos Extras |
|------|--------|---------------|
| `flow-preview` | Antes da execução — mapa planejado | `nodes[]`, `edges[]`, `pattern` |
| `flow-transition` | Agent→Agent durante execução | `from`, `to`, `handoff`, `progress` |
| `flow-complete` | Ao final do workflow | `totalDuration`, `agentsExecuted`, `tasksExecuted`, `bottleneck` |
| `flow-error` | Erro durante execução | `error`, `failedAgent`, `recoverable` |
| `flow-loop` | Review loop detectado | `iteration`, `maxIterations`, `reviewer`, `decision` |

### Exemplo: flow-transition

```json
{
  "type": "flow-transition",
  "squad": "brandcraft",
  "prefix": "bc",
  "workflow": "main-pipeline",
  "from": {"agent": "bc-extractor", "icon": "🔍", "status": "completed", "duration": "2m 15s"},
  "to": {"agent": "bc-inspector", "icon": "🔎", "status": "active"},
  "handoff": {"artifact": "brand-assets.json", "items": 3},
  "progress": {"current": 2, "total": 6, "percent": 33},
  "timestamp": "2026-03-08T10:02:20Z"
}
```

### Exemplo: flow-preview

```json
{
  "type": "flow-preview",
  "squad": "brandcraft",
  "prefix": "bc",
  "workflow": "main-pipeline",
  "nodes": [
    {"agent": "bc-extractor", "icon": "🔍", "order": 1},
    {"agent": "bc-inspector", "icon": "🔎", "order": 2},
    {"agent": "bc-templater", "icon": "📐", "order": 3},
    {"agent": "bc-renderer", "icon": "🎨", "order": 4},
    {"agent": "bc-illustrator", "icon": "✏️", "order": 3, "parallel": true},
    {"agent": "bc-refiner", "icon": "🔧", "order": 5, "loop": true}
  ],
  "edges": [
    {"from": "bc-extractor", "to": "bc-inspector"},
    {"from": "bc-inspector", "to": "bc-templater"},
    {"from": "bc-inspector", "to": "bc-illustrator", "type": "parallel"},
    {"from": "bc-templater", "to": "bc-renderer"},
    {"from": "bc-illustrator", "to": "bc-renderer"},
    {"from": "bc-renderer", "to": "bc-refiner"},
    {"from": "bc-refiner", "to": "bc-presenter", "type": "loop", "maxIterations": 3}
  ],
  "pattern": "pipeline + parallel + review",
  "timestamp": "2026-03-08T10:00:00Z"
}
```

### Exemplo: flow-complete

```json
{
  "type": "flow-complete",
  "squad": "brandcraft",
  "prefix": "bc",
  "workflow": "main-pipeline",
  "totalDuration": "13m 45s",
  "agentsExecuted": 6,
  "tasksExecuted": 8,
  "contextDelta": "+23%",
  "bottleneck": {"agent": "bc-templater", "duration": "3m 45s", "percent": 27},
  "timestamp": "2026-03-08T10:13:45Z"
}
```

---

## Seção 2: Terminal Renderer (ASCII)

### Preview (ANTES da execução)

Quando `triggers.flow.preview: true`, o Squad Manager gera um mapa ASCII do fluxo planejado:

```
📋 Flow Preview: brandcraft / main-pipeline

  bc-extractor ──→ bc-inspector ──→ bc-templater ──→ bc-renderer
       │                                                   │
       └──────────── bc-illustrator (parallel) ────────────┘
                                    │
                              bc-refiner ←──→ bc-presenter
                              (review loop, max 3x)

  Agents: 6 | Steps: 7 | Padrão: pipeline + parallel + review
```

**Como construir o preview:**
1. Ler `workflow.sequence[]` → agents na ordem
2. Identificar `workflow.parallel_groups[]` → agents paralelos
3. Identificar `workflow.sequence[].branches[]` → loops condicionais
4. Renderizar com `──→` para pipeline, `│` para parallel, `←──→` para loops

### Live (DURANTE a execução)

Quando `triggers.flow.live: true`, cada transição emite uma linha inline:

```
🔄 [FLOW:bc] bc-extractor ──→ bc-inspector
   Handoff: brand-assets.json (3 artifacts)
   Progresso: ██░░░░ 2/6 agents (33%)
```

**Barra de progresso:** `█` para completo, `░` para pendente. Largura fixa de 6 caracteres.

### Summary (DEPOIS da execução)

Quando `triggers.flow.summary: true`, ao final do workflow:

```
📊 Flow Summary: brandcraft / main-pipeline

  bc-extractor (2m 15s) ──→ bc-inspector (1m 30s) ──→ bc-templater (3m 45s)
       │                                                        │
       └── bc-illustrator (4m 10s, parallel) ───────────────────┘
                                    │
                              bc-refiner (1m 20s) ←→ bc-presenter (0m 45s)
                              (2 iterações, aprovado na 2ª)

  Total: 13m 45s | Agents: 6/6 | Tasks: 8 | Context: +23%
  Gargalo: bc-templater (3m 45s, 27% do tempo total)
```

---

## Seção 3: A2UI Renderer (Browser)

### Protocolo A2UI (v0.9)

O [protocolo A2UI do Google](https://a2ui.org/) é um protocolo declarativo onde agents enviam JSON descrevendo UIs — o client renderiza com componentes nativos. Características:

- **Seguro**: Não envia código executável, só JSON declarativo
- **Streaming**: Suporta `updateComponents` incremental — perfeito para live tracking
- **Custom catalogs**: Catálogos customizados com componentes específicos
- **Transport**: SSE com JSON RPC — o Squad Manager emite, o browser consome

### Custom Catalog: `squad-flow-catalog.json`

Define componentes customizados para o browser:

| Componente | Descrição | Props Principais |
|------------|-----------|------------------|
| `FlowGraph` | Container do grafo (layout: dagre/cose) | `layout`, `direction`, `animated` |
| `FlowNode` | Agent node | `icon`, `label`, `status`, `duration`, `highlight` |
| `FlowEdge` | Delegação entre agents | `from`, `to`, `artifact`, `animated`, `type` |
| `FlowProgress` | Barra de progresso global | `current`, `total`, `percent`, `label` |
| `FlowMetrics` | Painel de métricas | `duration`, `contextDelta`, `bottleneck` |
| `FlowTimeline` | Timeline vertical dos eventos | `events[]` |

### Status dos Nodes

| Status | Visual | Descrição |
|--------|--------|-----------|
| `pending` | Cinza, outline | Ainda não executou |
| `active` | Azul, pulsante | Executando agora |
| `completed` | Verde, sólido | Finalizado com sucesso |
| `error` | Vermelho, sólido | Falhou |
| `skipped` | Cinza, dashed | Pulado (condicional não atendida) |

### Mensagens A2UI Emitidas

#### 1. createSurface — Cria o canvas do flow

```json
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "squad-flow-bc",
    "catalogId": "squad-flow-catalog.json",
    "metadata": {
      "squad": "brandcraft",
      "workflow": "main-pipeline"
    }
  }
}
```

#### 2. updateComponents — Adiciona nodes e edges

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "squad-flow-bc",
    "components": [
      {"id": "node-bc-extractor", "component": "FlowNode", "icon": "🔍", "label": "bc-extractor", "status": "active"},
      {"id": "node-bc-inspector", "component": "FlowNode", "icon": "🔎", "label": "bc-inspector", "status": "pending"},
      {"id": "edge-1", "component": "FlowEdge", "from": "node-bc-extractor", "to": "node-bc-inspector", "animated": true}
    ]
  }
}
```

#### 3. updateDataModel — Atualiza status em tempo real

```json
{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "squad-flow-bc",
    "path": "/flow/progress",
    "value": {"current": 2, "total": 6, "percent": 33}
  }
}
```

#### 4. updateComponents — Transição de status

Quando um agent completa e o próximo inicia:

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "squad-flow-bc",
    "components": [
      {"id": "node-bc-extractor", "component": "FlowNode", "status": "completed", "duration": "2m 15s"},
      {"id": "node-bc-inspector", "component": "FlowNode", "status": "active"},
      {"id": "edge-1", "component": "FlowEdge", "animated": false, "style": "solid"}
    ]
  }
}
```

### Transport: SSE Endpoint

O Squad Manager grava eventos NDJSON no `logPath`. Um script local serve esses eventos via SSE:

```
GET http://localhost:{port}/flow/{surfaceId}
Content-Type: text/event-stream

data: {"version":"v0.9","createSurface":{...}}

data: {"version":"v0.9","updateComponents":{...}}

data: {"version":"v0.9","updateDataModel":{...}}
```

Porta configurável via `triggers.flow.a2ui.port` (default: `3001`).

---

## Seção 4: Como o Squad Manager Executa o Flow

### Algoritmo de Construção do Grafo

1. **Ler workflow YAML** → extrair `sequence[]`, `parallel_groups[]`, `branches[]`
2. **Construir nodes** → cada agent no workflow vira um node com icon e ordem
3. **Construir edges** → `sequence` gera edges lineares, `parallel_groups` gera edges paralelos, `branches` gera edges condicionais/loop
4. **Validar direções** → cruzar com `Receives From` / `Hands Off To` nos agent `.md` files
5. **Detectar padrão** → classificar como pipeline, hub-spoke, parallel, review, ou combinação

### Fluxo de Execução

```
1. Ler squad.yaml → verificar triggers.flow.enabled === true
   │
2. Ler workflow YAML → construir grafo (nodes + edges)
   │
3. Cruzar com agents/*.md → validar Receives From / Hands Off To
   │
4. Se flow.preview: true
   │  ├── Terminal: emitir preview ASCII inline
   │  └── A2UI: createSurface + updateComponents (todos nodes/edges pending)
   │
5. Para cada transição agent → agent:
   │  ├── Terminal: emitir flow-transition ASCII inline
   │  └── A2UI: updateComponents (status change) + updateDataModel (progress)
   │
6. Se loop detectado (branches com next):
   │  ├── Terminal: emitir flow-loop com iteração
   │  └── A2UI: updateComponents (edge animated, loop counter)
   │
7. Ao final do workflow:
   │  ├── Terminal: emitir flow-complete summary ASCII
   │  └── A2UI: updateComponents (all completed) + updateDataModel (final metrics)
   │
8. Se display: log | both → gravar NDJSON no logPath
```

### Regras de Emissão

- Se `triggers.flow` ausente ou `enabled: false` → nenhum evento de flow
- Se `live: false` → não emitir transições em tempo real (apenas preview e summary)
- Se `preview: false` → não emitir preview
- Se `summary: false` → não emitir summary
- Se `format: ascii` → apenas terminal
- Se `format: a2ui` → apenas browser
- Se `format: all` → ambos terminal e browser

---

## Seção 5: Dados Disponíveis nos Squads

### Fontes de Dados para Construir o Grafo

| Fonte | Dados | Uso |
|-------|-------|-----|
| `workflow.sequence[].agent` | Ordem dos agents | Nodes + edges lineares |
| `workflow.sequence[].requires` | Dependências | Edges de dependência |
| `workflow.sequence[].creates` | Artefatos produzidos | Handoff info nos edges |
| `workflow.parallel_groups[].agents` | Agents paralelos | Edges paralelos |
| `workflow.sequence[].branches[].next` | Próximo agent condicional | Edges de loop/branch |
| `workflow.sequence[].branches[].maxIterations` | Limite de loops | Label no edge |
| `agents/*.md` → `Receives From` | De quem o agent recebe | Validação cruzada |
| `agents/*.md` → `Hands Off To` | Para quem o agent entrega | Validação cruzada |

### Validação Cruzada

O Flow Tracker valida que:
- Todo edge no workflow tem correspondência em `Receives From` / `Hands Off To`
- Se um agent declara `Hands Off To: X`, existe um edge para X no workflow
- Inconsistências geram warnings no preview (não bloqueiam execução)

---

## Comandos de Gerenciamento

| Comando | Ação |
|---------|------|
| `*flow-preview {squad} {workflow}` | Mostra mapa do fluxo planejado (terminal + A2UI se configurado) |
| `*flow-summary {squad}` | Mostra diagrama do último fluxo executado |
| `*flow-live {squad}` | Habilita/desabilita tracking em tempo real |
