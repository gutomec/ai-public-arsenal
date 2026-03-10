# Nirvana Squad Creator

[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![AIOS](https://img.shields.io/badge/AIOS-%3E%3D%202.1.0-orange)]()

> Gera squads AIOS otimizados a partir de linguagem natural — pipeline de 9 fases com análise, geração, otimização, validação, README multi-idioma, deploy e publicação no squads.sh.

## Instalação

```bash
npx squads add gutomec/squads-sh-aios/nirvana-squad-creator
```

## O que Faz

O Nirvana Squad Creator é uma **meta-ferramenta**: um squad AIOS que gera outros squads AIOS. A partir de um objetivo em linguagem natural, ele produz um squad completo e otimizado com:

- **Agentes** com personalidade, archetype e commands (AGENT-PERSONALIZATION-STANDARD-V1)
- **Tasks** com contratos explícitos de Entrada/Saída (TASK-FORMAT-SPECIFICATION-V1)
- **Workflows** com seleção automática de pattern e transitions
- **Config** adaptado ao domínio (coding-standards, tech-stack, source-tree)
- **READMEs** em 6 idiomas (PT-BR, en, zh, hi, es, ar)
- **Publicação** no marketplace squads.sh

Zero agentes redundantes. Validação em 6 categorias. Deploy automático com habilitação de slash commands.

## Pipeline — 9 Fases

| Fase | Agente | Papel | Modelo |
|------|--------|-------|--------|
| 0 | Orquestrador | Coleta input, inicializa sessão | — |
| 1 | 🔍 Analyzer | Analisa requisitos, gera component-registry | Sonnet |
| 2 | 🏗️ AgentCreator | Gera definições de agents AIOS | Opus |
| 3 | 📋 TaskCreator | Gera tasks com contratos Entrada/Saída | Opus |
| 4 | 🔄 WorkflowCreator | Gera workflows, squad.yaml, config | Opus |
| 5 | ⚡ Optimizer | AgentDropout, cross-references, naming | Opus |
| 6 | ✅ Validator | Validação 6 categorias AIOS | Sonnet |
| 7 | 🌐 ReadmeCreator | READMEs em 6 idiomas | Opus |
| 8 | — Deploy | Deploya em projeto AIOS, habilita commands | Orquestrador |
| 9 | 🚀 Publisher | Publica no squads.sh (opcional) | Orquestrador |

## Agentes

| Icon | Nome | Archetype | Responsabilidade |
|------|------|-----------|------------------|
| 🎯 | Orchestrator | Flow_Master | Coleta input do usuário, gerencia estado e coordena o pipeline |
| 🔍 | Analyzer | Guardian | Decompõe objetivo em domínio, capacidades e roles |
| 🏗️ | AgentCreator | Builder | Gera definições de agentes com persona_profile |
| 📋 | TaskCreator | Builder | Gera tasks com contratos Entrada/Saída encadeados |
| 🔄 | WorkflowCreator | Flow_Master | Gera workflows, squad.yaml, config e README |
| ⚡ | Optimizer | Balancer | Elimina redundâncias, corrige cross-references |
| ✅ | Validator | Guardian | Valida contra 6 categorias de especificação AIOS |
| 🌐 | ReadmeCreator | Builder | Gera READMEs em PT-BR + 5 traduções |
| 🚀 | Publisher | Flow_Master | Guia publicação no squads.sh marketplace |

## Tasks

| Task | Responsável | Atomic Layer |
|------|-------------|-------------|
| `analyzeRequirements()` | Analyzer | Organism |
| `createAgents()` | AgentCreator | Organism |
| `createTasks()` | TaskCreator | Organism |
| `createWorkflows()` | WorkflowCreator | Organism |
| `optimizeSquad()` | Optimizer | Organism |
| `validateSquad()` | Validator | Organism |
| `createMultilingualReadme()` | ReadmeCreator | Organism |
| `deploySquad()` | Orquestrador | Organism |
| `publishSquad()` | Publisher | Molecule |
| `manageState()` | Orquestrador | Molecule |

## Workflows

### squad_generation_pipeline
Pipeline principal de 9 fases — da análise de requisitos à publicação.
```
[Analyzer] → [AgentCreator] → [TaskCreator] → [WorkflowCreator] → [Optimizer] → [Validator] → [ReadmeCreator] → Deploy → [Publisher]
```

### squad_publish_flow
Fluxo standalone para publicar um squad existente no squads.sh.
```
[Validator] → [Publisher]
```

## Configuração

- `config/coding-standards.md` — Naming conventions, regras de formato, linguagem
- `config/tech-stack.md` — Node.js, AIOS Core, Claude Code, YAML/Markdown
- `config/source-tree.md` — Estrutura de diretórios do squad

## Estrutura

```
squads/nirvana-squad-creator/
├── README.md
├── squad.yaml
├── agents/                        # 9 agentes
│   ├── squad-analyzer.md
│   ├── squad-agent-creator.md
│   ├── squad-task-creator.md
│   ├── squad-workflow-creator.md
│   ├── squad-optimizer.md
│   ├── squad-validator.md
│   ├── squad-readme-creator.md
│   ├── squad-publisher.md
│   └── squad-orchestrator.md
├── tasks/                         # 10 tasks
│   ├── analyze-requirements.md
│   ├── create-agents.md
│   ├── create-tasks.md
│   ├── create-workflows.md
│   ├── optimize-squad.md
│   ├── validate-squad.md
│   ├── create-multilingual-readme.md
│   ├── deploy-squad.md
│   ├── publish-squad.md
│   └── manage-state.md
├── workflows/                     # 2 workflows
│   ├── squad-generation-pipeline.yaml
│   └── squad-publish-flow.yaml
├── checklists/                    # 2 checklists
│   ├── squad-generation-quality-gate.md
│   └── pre-publish-checklist.md
├── templates/                     # 4 templates
│   ├── agent.template.md
│   ├── task.template.md
│   ├── workflow.template.md
│   └── squad-yaml.template.md
├── scripts/
│   └── squad-tools.cjs
└── config/
    ├── coding-standards.md
    ├── tech-stack.md
    └── source-tree.md
```

## Uso

### Pipeline completo
```bash
/SQUADS:nsc:squad-analyzer
```

### Agentes individuais
```
/SQUADS:nsc:squad-analyzer          — Análise de requisitos
/SQUADS:nsc:squad-agent-creator     — Geração de agentes
/SQUADS:nsc:squad-task-creator      — Geração de tasks
/SQUADS:nsc:squad-workflow-creator  — Workflows e squad.yaml
/SQUADS:nsc:squad-optimizer         — Otimização
/SQUADS:nsc:squad-validator         — Validação
/SQUADS:nsc:squad-readme-creator    — READMEs multi-idioma
/SQUADS:nsc:squad-publisher         — Publicação
```

## Autor

**Luiz Gustavo Vieira Rodrigues** ([@gutomec](https://github.com/gutomec))

## Licença

MIT
