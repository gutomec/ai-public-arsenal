# Ultimate Landing Page Squad

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![AIOS](https://img.shields.io/badge/AIOS-2.1.0%2B-purple)
![License](https://img.shields.io/badge/license-MIT-green)

> Squad especializado na criação de landing pages de alta conversão com IA.
> 9 agentes orquestrados, 32 tasks e 6 workflows para produzir landing pages profissionais end-to-end.

---

## Visão Geral

O **Ultimate Landing Page Squad** é um conjunto de agentes de IA especializados que trabalham em pipeline para transformar uma ideia de produto ou serviço em uma landing page completa, otimizada para conversão, SEO e acessibilidade.

O squad cobre todo o ciclo de desenvolvimento:

- **Discovery** — Entendimento profundo do produto e público-alvo
- **Pesquisa** — Análise de mercado, concorrentes e referências visuais
- **Copy** — Textos persuasivos baseados em frameworks de experts mundiais
- **Design** — Design system atômico com tokens, componentes e seções
- **Imagens** — Geração de imagens por IA coerentes com o design system
- **Desenvolvimento** — Frontend Next.js 15 + Backend FastAPI (condicional)
- **Integrações** — WhatsApp, email e conexão frontend-backend (condicionais)
- **QA** — Revisão multi-dimensional (copy, design, SEO, a11y, segurança)

### Diferenciais

- Acessibilidade **WCAG AAA** mandatória (contraste 7:1)
- **SEO** com dados estruturados JSON-LD, Open Graph e meta tags completas
- **Light/Dark mode** obrigatório em ambos os modos
- Design system baseado em **Atomic Design** (tokens a pages)
- Copy baseado em frameworks de **experts mundiais** em conversão
- Componentes condicionais — backend e integrações são opcionais

---

## Agentes

| # | Ícone | Nome | Título | Arquétipo |
|---|-------|------|--------|-----------|
| 1 | 🧭 | **lp-strategist** (Strategos) | Estrategista de Produto | Flow_Master |
| 2 | 🔬 | **lp-researcher** (Scout) | Pesquisador de Mercado | Builder |
| 3 | ✍️ | **lp-copywriter** (Quill) | Copywriter Expert | Builder |
| 4 | 🎨 | **lp-design-architect** (Prism) | Arquiteto de Design | Builder |
| 5 | 📸 | **lp-image-creator** (Lens) | Criador de Imagens IA | Builder |
| 6 | 💻 | **lp-frontend-dev** (Pixel) | Desenvolvedor Frontend | Builder |
| 7 | 🔧 | **lp-backend-dev** (Forge) | Desenvolvedor Backend | Builder |
| 8 | 🔗 | **lp-integrator** (Bridge) | Integrador de Sistemas | Builder |
| 9 | 🛡️ | **lp-reviewer** (Shield) | Revisor de Qualidade | Guardian |

> **Agentes condicionais:** Forge (backend) e Bridge (integrações) são ativados apenas quando as flags correspondentes estão habilitadas no escopo.

---

## Pipeline — Fluxo de 7 Fases

```
 FASE 1          FASE 2          FASE 3              FASE 4
 Discovery       Research        Content + Design     Images
 ┌──────────┐   ┌──────────┐   ┌──────────────────┐  ┌──────────┐
 │ Strategos│──>│  Scout   │──>│ Quill    Prism   │─>│   Lens   │
 │          │   │          │   │ (copy)   (design)│  │          │
 │ *elicit  │   │ *research│   │ *write   *design │  │ *generate│
 │ *discover│   │ *analyze │   │  (paralelo)      │  │ *iterate │
 │ *scope   │   │ *synth.  │   │                  │  │          │
 └──────────┘   └──────────┘   └──────────────────┘  └──────────┘
                                                          │
 ┌────────────────────────────────────────────────────────┘
 │
 v
 FASE 5                    FASE 6              FASE 7
 Build                     Integrations        QA
 ┌──────────────────┐     ┌──────────┐        ┌──────────┐
 │ Pixel    Forge   │────>│  Bridge  │──────> │  Shield  │
 │ (front)  (back)  │     │          │        │          │
 │ *setup   *setup  │     │ *whatsapp│        │ *review  │
 │ *build   *api    │     │ *email   │        │ *report  │
 │ *assemble*admin  │     │ *connect │        │ *verdict │
 │  (paralelo)      │     │(condic.) │        │          │
 └──────────────────┘     └──────────┘        └──────────┘
```

### Fases Detalhadas

| Fase | Agente(s) | Entrada | Saída |
|------|-----------|---------|-------|
| 1. Discovery | Strategos | Ideia do usuário | Product brief + escopo + flags condicionais |
| 2. Research | Scout | Product brief | Análise de mercado + concorrentes + referências visuais |
| 3. Content + Design | Quill + Prism (paralelo) | Pesquisa + brief | Copy por seção + design system + specs de backend |
| 4. Images | Lens | Copy + design system | Imagens geradas para hero e seções |
| 5. Build | Pixel + Forge (paralelo) | Copy + design + imagens + specs | Frontend montado + backend funcional |
| 6. Integrations | Bridge (condicional) | Frontend + backend | WhatsApp, email e API conectados |
| 7. QA | Shield | Projeto completo | Relatório multi-dimensional + veredicto |

---

## Comandos Rápidos

| Comando | Descrição | Agente |
|---------|-----------|--------|
| `*run-full-pipeline` | Executar pipeline completo end-to-end | Todos |
| `*create-landing-page` | Alias para pipeline completo | Todos |
| `*start-discovery` | Iniciar fase de discovery | Strategos |
| `*discover-product` | Absorver ideia e executar questionário | Strategos |
| `*start-research` | Iniciar pesquisa de mercado | Scout |
| `*start-content-design` | Iniciar copy e design em paralelo | Quill + Prism |
| `*generate-images` | Gerar imagens para as seções | Lens |
| `*start-build` | Iniciar build frontend + backend | Pixel + Forge |
| `*start-integrations` | Conectar integrações externas | Bridge |
| `*run-qa` | Executar revisão de qualidade | Shield |
| `*export-project` | Exportar projeto final | — |

---

## Pré-requisitos

| Requisito | Versão | Obrigatório |
|-----------|--------|-------------|
| **Node.js** | 18+ | Sim |
| **npm / pnpm** | latest | Sim |
| **AIOS CLI** | 2.1.0+ | Sim |
| **Python** | 3.12+ | Condicional (se backend ativo) |
| **Docker** | latest | Condicional (se backend ativo) |
| **GitHub CLI** | latest | Recomendado |

### APIs e Chaves (conforme uso)

- **Gemini API Key** — para geração de imagens via nano-banana-pro
- **OpenAI API Key** — para geração de imagens via DALL-E 3
- **Replicate API Token** — para Flux e outros modelos
- **fal.ai API Key** — para Imagen4, Ideogram, Recraft e outros
- **evolution-api** — para integração com WhatsApp (condicional)

---

## Instalação

### 1. Clonar o repositório

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Instalar dependências do AIOS

```bash
npm install
```

### 3. Verificar a instalação

```bash
aios doctor
```

### 4. Ativar o squad

```bash
@lp-strategist *start-discovery
```

Ou executar o pipeline completo:

```bash
*run-full-pipeline
```

---

## Estrutura do Squad

```
squads/ultimate-landingpage/
├── README.md                   # Este arquivo
├── IDEATION.md                 # Documento de raciocínio da composição
│
├── agents/                     # Definições de persona dos 9 agentes
│   ├── lp-strategist.md       # Strategos — Flow_Master
│   ├── lp-researcher.md       # Scout — Builder
│   ├── lp-copywriter.md       # Quill — Builder
│   ├── lp-design-architect.md # Prism — Builder
│   ├── lp-image-creator.md    # Lens — Builder
│   ├── lp-frontend-dev.md     # Pixel — Builder
│   ├── lp-backend-dev.md      # Forge — Builder (Condicional)
│   ├── lp-integrator.md       # Bridge — Builder (Condicional)
│   └── lp-reviewer.md         # Shield — Guardian
│
├── tasks/                      # 32 tasks executáveis
│   ├── lp-strategist-*.md     # Tasks de discovery (3)
│   ├── lp-researcher-*.md     # Tasks de pesquisa (4)
│   ├── lp-copywriter-*.md     # Tasks de copy (2)
│   ├── lp-design-architect-*.md # Tasks de design (5)
│   ├── lp-image-creator-*.md  # Tasks de imagem (2)
│   ├── lp-frontend-dev-*.md   # Tasks de frontend (4)
│   ├── lp-backend-dev-*.md    # Tasks de backend (3)
│   ├── lp-integrator-*.md     # Tasks de integração (3)
│   └── lp-reviewer-*.md       # Tasks de QA (6)
│
├── workflows/                  # 6 workflows
│   ├── lp-full-pipeline.yaml  # Pipeline completo end-to-end
│   ├── lp-discovery-flow.yaml # Sub-workflow de discovery
│   ├── lp-design-copy-parallel.yaml # Copy + Design em paralelo
│   ├── lp-build-parallel.yaml # Frontend + Backend em paralelo
│   ├── lp-section-pipeline.yaml # Pipeline por seção
│   └── lp-qa-gate.yaml       # Gate de qualidade
│
├── config/                     # Configurações do squad
│   ├── coding-standards.md    # Padrões de código
│   ├── tech-stack.md          # Stack tecnológica
│   └── source-tree.md         # Estrutura de diretórios
│
├── checklists/                 # Checklists de validação
├── templates/                  # Templates de documentos e código
├── scripts/                    # Scripts de automação
├── tools/                      # Ferramentas customizadas
└── data/                       # Dados e configurações runtime
```

---

## Componentes Condicionais

O squad utiliza um sistema de **flags condicionais** definidas na fase de discovery para ativar ou desativar componentes do pipeline:

| Flag | Componente | Quando Ativar |
|------|-----------|---------------|
| `backend: true` | Forge (lp-backend-dev) | Captura de leads, painel admin, exportação CSV |
| `whatsapp: true` | Bridge (lp-integrator) | Botão de WhatsApp com evolution-api |
| `email: true` | Bridge (lp-integrator) | Envio de emails transacionais via SMTP/MCP |

### Cenários de Uso

**Landing page simples (frontend only):**
```yaml
backend: false
whatsapp: false
email: false
```
- Apenas 6 agentes ativos: Strategos, Scout, Quill, Prism, Lens, Pixel, Shield
- Deploy via Vercel sem backend

**Landing page com captura de leads:**
```yaml
backend: true
whatsapp: false
email: true
```
- 8 agentes ativos (inclui Forge e Bridge para email)
- Frontend + Backend + banco de dados

**Landing page completa:**
```yaml
backend: true
whatsapp: true
email: true
```
- Todos os 9 agentes ativos
- Stack completa com todas as integrações

---

## Licença

MIT

---

## Autor

**gutomec**

---

*Synkra AIOS — Ultimate Landing Page Squad v1.0.0*
