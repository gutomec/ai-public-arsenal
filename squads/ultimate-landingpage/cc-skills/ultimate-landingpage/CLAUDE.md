# Ultimate Landing Page Squad -- CC Skill

Squad especializado na criação de landing pages de ultra-alta conversão com IA. Pipeline de 7 fases com 9 agentes especializados que transformam uma ideia de produto em uma landing page fullstack completa, otimizada para conversão, SEO e acessibilidade.

## O que este projeto faz

- **Discovery** completo com questionário interativo e definição de escopo
- **Pesquisa** de mercado, concorrentes e experts mundiais de copywriting
- **Copy** persuasivo baseado em frameworks de experts (Hormozi, Schwartz, Cialdini, Miller)
- **Design System** atômico com contraste WCAG AAA e light/dark mode obrigatório
- **Geração de imagens** por IA coerentes com o design system (múltiplos providers)
- **Frontend** Next.js 15 com SEO perfeito e acessibilidade WCAG AAA
- **Backend** Python FastAPI com captura de leads e admin panel (condicional)
- **Integrações** WhatsApp (evolution-api) e email (condicional)
- **QA** multi-dimensional com score por dimensão e veredito

## Tech Stack

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| Next.js | 15.x (App Router) | Framework frontend com SSR/SSG |
| React | 19.x | Biblioteca de UI com Server Components |
| TypeScript | 5.x (strict) | Tipagem estática |
| Tailwind CSS | 4.x | Engine de estilização utility-first |
| shadcn/ui | latest | Componentes acessíveis base |
| next-themes | latest | Light/dark mode SSR-safe |
| Python | 3.12+ | Linguagem backend (condicional) |
| FastAPI | latest | Framework HTTP async (condicional) |
| SQLAlchemy | 2.0 (async) | ORM (condicional) |
| Pydantic | v2 | Validação de dados (condicional) |

## Pipeline -- 7 Fases

| Fase | Agente | Papel | Modelo |
|------|--------|-------|--------|
| 1. Discovery | Strategos | Absorver ideia, questionário, escopo | opus |
| 2. Research | Scout | Concorrentes, público-alvo, copy experts | sonnet |
| 3. Content | Quill | Copy de cada seção com frameworks | opus |
| 3. Design | Prism | Design system atômico WCAG AAA | opus |
| 4. Images | Lens | Hero e seções com IA | opus |
| 5. Frontend | Pixel | Next.js 15 com SEO + A11y | opus |
| 5. Backend | Forge | FastAPI com leads + admin (condicional) | opus |
| 6. Integrations | Bridge | WhatsApp, email, front-back (condicional) | opus |
| 7. QA | Shield | Revisão multi-dimensional + relatório | sonnet |

## Como Invocar

### Skill Orchestrator (pipeline completo)
```
/ultimate-landingpage [descrição do produto/serviço]
```

### Agents individuais (slash commands)
- `/ultimate-lp:agents:lp-strategist` -- Strategos (Discovery)
- `/ultimate-lp:agents:lp-researcher` -- Scout (Pesquisa)
- `/ultimate-lp:agents:lp-copywriter` -- Quill (Copywriting)
- `/ultimate-lp:agents:lp-design-architect` -- Prism (Design System)
- `/ultimate-lp:agents:lp-image-creator` -- Lens (Imagens IA)
- `/ultimate-lp:agents:lp-frontend-dev` -- Pixel (Frontend)
- `/ultimate-lp:agents:lp-backend-dev` -- Forge (Backend)
- `/ultimate-lp:agents:lp-integrator` -- Bridge (Integrações)
- `/ultimate-lp:agents:lp-reviewer` -- Shield (QA)

## Lista de Agents

| Agent | Persona | Arquétipo | Papel |
|-------|---------|-----------|-------|
| lp-strategist | Strategos | Flow_Master | Discovery e escopo |
| lp-researcher | Scout | Builder | Pesquisa de mercado |
| lp-copywriter | Quill | Builder | Copy de alta conversão |
| lp-design-architect | Prism | Builder | Design system atômico |
| lp-image-creator | Lens | Builder | Geração de imagens IA |
| lp-frontend-dev | Pixel | Builder | Frontend Next.js |
| lp-backend-dev | Forge | Builder | Backend FastAPI (condicional) |
| lp-integrator | Bridge | Builder | Integrações (condicional) |
| lp-reviewer | Shield | Guardian | QA multi-dimensional |

## Naming Conventions

| Contexto | Convenção | Exemplo |
|----------|-----------|---------|
| Componentes React | PascalCase | `HeroSection.tsx` |
| Arquivos componente | kebab-case | `hero-section.tsx` |
| CSS tokens | `--` prefix + kebab-case | `--color-primary` |
| Hooks | camelCase + `use` prefix | `useScrollPosition` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Módulos Python | snake_case | `lead_service.py` |
| Classes Python | PascalCase | `LeadSchema` |

## Quality Gates

- WCAG AAA obrigatório (contraste 7:1 texto normal) em light E dark
- SEO perfeito (meta tags, Open Graph, JSON-LD, sitemap)
- Mobile-first responsive (320px mínimo)
- Core Web Vitals verde (LCP < 2.5s, CLS < 0.1)
- Semantic HTML5 com heading hierarchy correta
- Copy baseado em frameworks de experts pesquisados
- QA score >= 8.0 para PASS (6.0-7.9 CONCERNS, < 6.0 NEEDS WORK)

## Idioma e Encoding

- Conteúdo textual: PT-BR com acentuação correta
- Variáveis e código: Inglês (padrão internacional)
- Encoding: UTF-8

## Componentes Condicionais

| Flag | Componente | Ativação |
|------|-----------|----------|
| `backend` | Forge (FastAPI) | Captura de leads, admin, CSV |
| `whatsapp` | Bridge (evolution-api) | Botão WhatsApp |
| `email` | Bridge (SMTP/MCP) | Emails transacionais |
| `admin_panel` | Forge (admin routes) | Painel de gerenciamento |

## Seções da Landing Page

navigation, hero, social-proof-bar, problem-agitation, solution-demo, testimonials, benefits, features, pricing, faq, final-cta, footer

## Estrutura do Projeto

```
packages/
  frontend/                  -- Next.js 15 App
    src/
      app/                   -- App Router (layout, page)
      components/
        atoms/               -- Button, Input, Badge
        molecules/           -- NavLink, CTAButton
        organisms/           -- Header, Footer, PricingCard
      sections/              -- HeroSection, BenefitsSection...
      lib/                   -- utils, seo, api-client
      styles/                -- tokens.css, animations.css
    public/images/            -- hero/, sections/, og/
  backend/                   -- FastAPI (condicional)
    app/
      api/v1/                -- leads, admin, auth
      models/                -- SQLAlchemy models
      schemas/               -- Pydantic schemas
      services/              -- Business logic
      core/                  -- database, security
  shared/                    -- Tipos compartilhados (condicional)
docs/landing-page/           -- Artefatos do pipeline
  product-brief.md
  scope-definition.md
  research-synthesis.md
  sections/*/copy.md
  design-system/
  qa/final-report.md
```
