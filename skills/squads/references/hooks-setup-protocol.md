# Hooks Setup Protocol — Automatic Trigger Emission

## Visão Geral

Claude Code Hooks permitem emissão **automática e confiável** de triggers JSONL. Sem hooks, a emissão depende de instruções no SKILL.md que o agente pode não executar consistentemente.

Quando o usuário habilita triggers (`*enable-triggers`) ou quando o Squad Manager detecta que um squad tem `triggers.enabled: true` mas os hooks não estão configurados, o Squad Manager DEVE configurar os hooks automaticamente.

## Verificação de Hooks

Antes de qualquer operação com triggers, verificar:

```bash
# 1. Hook file existe?
ls .claude/hooks/squad-trigger-emitter.cjs 2>/dev/null

# 2. Settings tem o hook registrado?
cat .claude/settings.local.json 2>/dev/null | grep "squad-trigger-emitter"
```

Se qualquer verificação falhar → executar o Setup Protocol abaixo.

## Setup Protocol

### Passo 1: Criar o Hook File

Criar `.claude/hooks/squad-trigger-emitter.cjs` com o conteúdo abaixo.

**IMPORTANTE:** Usar `Write` tool para criar o arquivo. O conteúdo DEVE ser copiado exatamente como está.

```javascript
#!/usr/bin/env node
'use strict';

/**
 * Squad Trigger Emitter — Claude Code Hook
 *
 * Emite JSONL trigger events automaticamente para squad flow tracking.
 * Registrado em PreToolUse (Skill) e PostToolUse (all tools).
 *
 * Events emitidos:
 *   squad-start     — quando squad skill é ativada (PreToolUse:Skill)
 *   squad-end       — quando squad skill completa (PostToolUse:Skill)
 *   agent-start     — quando agent .md é lido
 *   agent-end       — quando agent muda (fecha anterior)
 *   flow-transition — handoff agent→agent
 *   flow-complete   — fim do fluxo com resumo
 *
 * State: /tmp/squad-session-{session_id}.json
 * Output: {cwd}/.aios/squad-triggers/{squad}.jsonl
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SQUAD_PREFIXES = ['squads:', 'nsc:', 'brandcraft:', 'afs:', 'ultimate-lp:'];

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      processEvent(JSON.parse(input));
    } catch { /* silent — never block */ }
  });
}

function processEvent(data) {
  const { hook_event_name, tool_name, tool_input, session_id, cwd } = data;
  if (!cwd || !session_id) return;

  const stateFile = path.join(os.tmpdir(), `squad-session-${session_id}.json`);

  // ─── PreToolUse:Skill → squad-start ───
  if (hook_event_name === 'PreToolUse' && tool_name === 'Skill') {
    const skill = (tool_input?.skill || '').toLowerCase();
    const squadInfo = resolveSquadBySkill(skill, cwd);
    if (!squadInfo) return;

    const triggersDir = path.join(cwd, '.aios', 'squad-triggers');
    fs.mkdirSync(triggersDir, { recursive: true });

    const state = {
      squad: squadInfo.name,
      prefix: squadInfo.prefix,
      version: squadInfo.version,
      triggersDir,
      startTime: Date.now(),
      agents: [],
      currentAgent: null,
      agentStartTime: null,
      taskCount: 0,
      workflowNodes: null,
    };
    fs.writeFileSync(stateFile, JSON.stringify(state));

    appendEvent(triggersDir, squadInfo.name, {
      type: 'squad-start',
      squad: squadInfo.name,
      prefix: squadInfo.prefix,
      version: squadInfo.version,
    });
    return;
  }

  // ─── PostToolUse:Skill → squad-end ───
  if (hook_event_name === 'PostToolUse' && tool_name === 'Skill') {
    if (!fs.existsSync(stateFile)) return;
    const state = safeReadJSON(stateFile);
    if (!state) return;

    if (state.currentAgent) {
      appendEvent(state.triggersDir, state.squad, {
        type: 'agent-end',
        squad: state.squad,
        prefix: state.prefix,
        agent: state.currentAgent,
        duration: fmtDuration(state.agentStartTime),
      });
    }

    appendEvent(state.triggersDir, state.squad, {
      type: 'squad-end',
      squad: state.squad,
      prefix: state.prefix,
      totalDuration: fmtDuration(state.startTime),
      agentsExecuted: state.agents.length,
      tasksExecuted: state.taskCount,
    });

    if (state.agents.length > 0) {
      appendEvent(state.triggersDir, state.squad, {
        type: 'flow-complete',
        squad: state.squad,
        prefix: state.prefix,
        totalDuration: fmtDuration(state.startTime),
        agentsExecuted: state.agents.length,
        path: state.agents,
      });
    }

    try { fs.unlinkSync(stateFile); } catch {}
    return;
  }

  // ─── PostToolUse:* → agent/task tracking ───
  if (hook_event_name !== 'PostToolUse') return;
  if (!fs.existsSync(stateFile)) return;

  const state = safeReadJSON(stateFile);
  if (!state) return;
  let dirty = false;

  if (tool_name === 'Read' && tool_input?.file_path) {
    const fp = tool_input.file_path;

    // Agent detection
    const agentMatch = fp.match(/\/agents\/([^/]+)\.md$/);
    if (agentMatch) {
      const agentId = agentMatch[1];
      if (agentId !== state.currentAgent) {
        if (state.currentAgent) {
          appendEvent(state.triggersDir, state.squad, {
            type: 'agent-end',
            squad: state.squad,
            prefix: state.prefix,
            agent: state.currentAgent,
            duration: fmtDuration(state.agentStartTime),
          });
          appendEvent(state.triggersDir, state.squad, {
            type: 'flow-transition',
            squad: state.squad,
            prefix: state.prefix,
            from: state.currentAgent,
            to: agentId,
            progress: `${state.agents.length + 1}/${state.workflowNodes || '?'}`,
          });
        }

        state.currentAgent = agentId;
        state.agentStartTime = Date.now();
        if (!state.agents.includes(agentId)) state.agents.push(agentId);

        appendEvent(state.triggersDir, state.squad, {
          type: 'agent-start',
          squad: state.squad,
          prefix: state.prefix,
          agent: agentId,
          progress: `${state.agents.length}/${state.workflowNodes || '?'}`,
        });
        dirty = true;
      }
    }

    // Workflow node counting
    const wfMatch = fp.match(/\/workflows\/([^/]+)\.ya?ml$/);
    if (wfMatch && !state.workflowNodes) {
      try {
        const wfContent = fs.readFileSync(fp, 'utf8');
        const nodes = wfContent.match(/^\s*-\s+agent:/gm);
        if (nodes) { state.workflowNodes = nodes.length; dirty = true; }
      } catch {}
    }
  }

  if (['Bash', 'Write', 'Edit'].includes(tool_name) && state.currentAgent) {
    state.taskCount++;
    if (state.taskCount % 5 === 0) dirty = true;
  }

  if (dirty) fs.writeFileSync(stateFile, JSON.stringify(state));
}

// ─── Helpers ───

function resolveSquadBySkill(skill, cwd) {
  // Match known prefixes: "nsc:agents:squad-orchestrator" → prefix "nsc"
  for (const pfx of SQUAD_PREFIXES) {
    if (skill.startsWith(pfx)) {
      return findSquadByPrefix(pfx.replace(':', ''), cwd);
    }
  }
  // Match SQUADS: pattern: "squads:nsc:squad-orchestrator"
  if (skill.startsWith('squads:')) {
    const parts = skill.split(':');
    if (parts.length >= 2) return findSquadByPrefix(parts[1], cwd);
  }
  return null;
}

function findSquadByPrefix(prefix, cwd) {
  const squadsDir = path.join(cwd, 'squads');
  try {
    for (const d of fs.readdirSync(squadsDir, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      const yamlPath = path.join(squadsDir, d.name, 'squad.yaml');
      try {
        const content = fs.readFileSync(yamlPath, 'utf8');
        const pfxMatch = content.match(/^slashPrefix:\s*(.+)$/m);
        if (pfxMatch && pfxMatch[1].trim() === prefix) {
          const nameMatch = content.match(/^name:\s*(.+)$/m);
          const verMatch = content.match(/^version:\s*(.+)$/m);
          const trigMatch = content.match(/triggers:\s*\n\s+enabled:\s*(true|false)/m);
          if (!trigMatch || trigMatch[1] !== 'true') return null;
          return {
            name: nameMatch ? nameMatch[1].trim() : d.name,
            prefix,
            version: verMatch ? verMatch[1].trim().replace(/['"]/g, '') : '1.0.0',
          };
        }
      } catch {}
    }
  } catch {}
  return null;
}

function appendEvent(dir, squad, eventData) {
  const ts = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const event = { ...eventData, timestamp: ts };
  for (const k of Object.keys(event)) { if (event[k] == null) delete event[k]; }
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, `${squad}.jsonl`), JSON.stringify(event) + '\n');
  } catch {}
}

function fmtDuration(startTime) {
  if (!startTime) return '0s';
  const s = Math.floor((Date.now() - startTime) / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

function safeReadJSON(fp) {
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return null; }
}

main();
```

### Passo 2: Registrar no Settings

Ler `.claude/settings.local.json` (ou criar se não existe). Adicionar as entradas de hooks para PreToolUse e PostToolUse.

**IMPORTANTE:** NÃO sobrescrever hooks existentes. Fazer merge com a configuração atual.

A configuração a adicionar:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Skill",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/squad-trigger-emitter.cjs\"",
            "timeout": 5
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/squad-trigger-emitter.cjs\"",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

**Algoritmo de merge:**

1. Ler settings existente: `Read .claude/settings.local.json`
2. Parse JSON
3. Se `hooks.PreToolUse` existe → adicionar entry ao array (verificar se já existe matcher "Skill" com "squad-trigger")
4. Se `hooks.PostToolUse` existe → adicionar entry ao array (verificar duplicatas)
5. Se não existem → criar as seções
6. Escrever de volta com `Edit` ou `Write`

### Passo 3: Verificação

Após setup, verificar:

```bash
# Hook file existe e é válido
node -c .claude/hooks/squad-trigger-emitter.cjs

# Settings está registrado
cat .claude/settings.local.json | grep squad-trigger
```

## Quando Executar o Setup

1. **`*enable-triggers {name}`** — SEMPRE verificar e configurar hooks
2. **Primeira vez que Squad Manager detecta `triggers.enabled: true`** em qualquer squad.yaml — verificar hooks
3. **`*validate-squad {name}`** — se triggers habilitados, verificar hooks como item de validação

## Desinstalação

No `*disable-triggers`, se nenhum outro squad usa triggers:

1. Remover hook file: `rm .claude/hooks/squad-trigger-emitter.cjs`
2. Remover entries do settings.local.json (fazer merge reverso)
3. Manter logs existentes em `.aios/squad-triggers/` (são histórico)

## Troubleshooting

| Sintoma | Causa | Solução |
|---------|-------|---------|
| JSONL vazio | Hook não registrado | Executar Setup Protocol |
| Eventos parciais | Hook timeout | Aumentar timeout para 10s |
| Sem agent-start | Squad sem agents/ | Verificar estrutura do squad |
| Permissão negada | Path protegido | Verificar `.claude/hooks/` é writable |
| Hook não dispara em fork | Claude Code limitation | Manter Trigger Emission Protocol no SKILL.md como fallback |

## Compatibilidade

- **Claude Code** ≥ 1.0: Hooks suportados nativamente
- **Codex CLI**: Sem hooks — usa Trigger Emission Protocol do SKILL.md como fallback
- **Gemini CLI**: Sem hooks — usa fallback
- **Cursor**: Sem hooks — usa fallback

O SKILL.md mantém o Trigger Emission Protocol como **fallback universal** para plataformas sem suporte a hooks.
