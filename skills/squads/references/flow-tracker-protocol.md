# Flow Tracker Protocol — Rastreamento de Delegação entre Agents

## Visão Geral

O Flow Tracker rastreia o fluxo de delegação entre agents de um squad — quem delegou para quem, com qual artefato, e em que ordem. É **opt-in** via `triggers.flow` no `squad.yaml`.

Opera em três momentos:
1. **Preview** (antes) — mapa do fluxo planejado
2. **Live** (durante) — transições em tempo real
3. **Summary** (depois) — diagrama completo com métricas

O mecanismo primário são **stream markers** — HTML comments estruturados emitidos no output de texto do Claude, que qualquer frontend pode parsear.

```
Claude Code (Squad Manager skill)
       │
       ├── Emite: <!-- squad:event {"type":"flow-transition",...} -->
       │
       ├── Frontend que entende: parseia → renderiza UI rica (grafo, timeline)
       │
       └── Frontend que não entende: ignora (é um HTML comment)
```

## Configuração

```yaml
triggers:
  enabled: true
  flow:
    enabled: true        # Habilita flow tracking
    live: true           # Emite transições em tempo real
    preview: true        # Gera preview antes de executar
    summary: true        # Gera summary ao final
```

## Eventos de Flow (Stream Markers)

### flow-preview — Mapa planejado

Emitido ANTES da execução. Descreve todos os nodes e edges do workflow:

```
<!-- squad:event {"type":"flow-preview","squad":"brandcraft","prefix":"bc","workflow":"main-pipeline","nodes":[{"agent":"bc-extractor","icon":"🔍","order":1},{"agent":"bc-inspector","icon":"🔎","order":2},{"agent":"bc-templater","icon":"📐","order":3}],"edges":[{"from":"bc-extractor","to":"bc-inspector"},{"from":"bc-inspector","to":"bc-templater"}],"pattern":"pipeline"} -->
```

**Campos:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nodes[]` | array | Lista de agents no workflow |
| `nodes[].agent` | string | ID do agent |
| `nodes[].icon` | string | Emoji do agent |
| `nodes[].order` | number | Posição no fluxo |
| `nodes[].parallel` | boolean | Se é paralelo (opcional) |
| `nodes[].loop` | boolean | Se participa de review loop (opcional) |
| `edges[]` | array | Conexões entre agents |
| `edges[].from` | string | Agent de origem |
| `edges[].to` | string | Agent de destino |
| `edges[].type` | string | `sequential` \| `parallel` \| `loop` (opcional) |
| `pattern` | string | Tipo: `pipeline`, `parallel`, `hub-spoke`, `review` |

### flow-transition — Handoff agent→agent

Emitido a cada transição durante execução:

```
<!-- squad:event {"type":"flow-transition","squad":"brandcraft","prefix":"bc","from":"bc-extractor","to":"bc-inspector","handoff":"brand-assets.json","progress":"2/6"} -->
```

### flow-complete — Fim do workflow

```
<!-- squad:event {"type":"flow-complete","squad":"brandcraft","prefix":"bc","workflow":"main-pipeline","totalDuration":"13m 45s","agentsExecuted":6,"tasksExecuted":8,"path":["bc-extractor","bc-inspector","bc-templater","bc-renderer","bc-illustrator","bc-refiner"]} -->
```

### flow-error — Erro durante execução

```
<!-- squad:event {"type":"flow-error","squad":"brandcraft","prefix":"bc","error":"Review failed after 3 iterations","failedAgent":"bc-reviewer","recoverable":false} -->
```

### flow-loop — Review loop detectado

```
<!-- squad:event {"type":"flow-loop","squad":"brandcraft","prefix":"bc","iteration":2,"maxIterations":3,"reviewer":"bc-refiner","decision":"needs-revision"} -->
```

## Terminal Renderer (ASCII)

Para uso no terminal, o Squad Manager TAMBÉM gera representações ASCII legíveis:

### Preview (ANTES)

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

### Live (DURANTE)

```
🔄 [FLOW:bc] bc-extractor ──→ bc-inspector
   Handoff: brand-assets.json (3 artifacts)
   Progresso: ██░░░░ 2/6 agents (33%)
```

### Summary (DEPOIS)

```
📊 Flow Summary: brandcraft / main-pipeline

  bc-extractor (2m 15s) ──→ bc-inspector (1m 30s) ──→ bc-templater (3m 45s)

  Total: 13m 45s | Agents: 6/6 | Tasks: 8
```

## Detecção por Frontends (Dual Mode)

Frontends inteligentes (como squad-chat) podem detectar flows de **duas formas**:

### Modo 1: Stream Markers (explícito)

O Squad Manager emite `<!-- squad:event {...} -->` no texto. O frontend parseia com regex:

```javascript
const MARKER_RE = /<!-- squad:event (\{.*\}) -->/;
const match = text.match(MARKER_RE);
if (match) {
  const event = JSON.parse(match[1]);
  // event.type === "flow-transition" etc.
}
```

### Modo 2: Tool Call Pattern Detection (inferência)

Mesmo sem markers, o frontend vê tool calls do Claude no stream-json:

| Tool Call | Inferência |
|---|---|
| `Read {resolved-squad-root}/X/squad.yaml` | Squad X ativado — extrair nome/versão do resultado |
| `Read {resolved-squad-root}/X/agents/A.md` | Agent A iniciado |
| `Read {resolved-squad-root}/X/agents/B.md` (após A) | Transição A → B |
| `Read {resolved-squad-root}/X/workflows/W.yaml` | Workflow W ativo — extrair nodes/edges |
| `subagent` com agent=A | Delegação explícita para A |
| `Bash`/`Write`/`Edit` | Task execution no agente atual |

**Recomendação:** Usar Modo 1 quando disponível (dados mais ricos), Modo 2 como fallback/complemento.

## Construção do Grafo a partir do Workflow YAML

O Squad Manager constrói o grafo lendo:

1. `workflow.sequence[]` → agents na ordem → edges lineares
2. `workflow.parallel_groups[]` → agents paralelos → edges paralelos
3. `workflow.sequence[].branches[]` → loops condicionais → edges de loop
4. `agents/*.md` → `Receives From` / `Hands Off To` → validação cruzada

### Validação Cruzada

O Flow Tracker valida que:
- Todo edge no workflow tem correspondência em `Receives From` / `Hands Off To`
- Inconsistências geram warnings no preview (não bloqueiam execução)

## Comandos

| Comando | Ação |
|---------|------|
| `*flow-preview {squad} {workflow}` | Mostra mapa planejado (ASCII + markers) |
| `*flow-summary {squad}` | Mostra diagrama do último fluxo executado |
| `*flow-live {squad}` | Habilita/desabilita tracking em tempo real |
Resolve squad source paths by checking `./squads/{name}` first, then `~/squads/{name}`. If both exist, use the workspace-local squad.
