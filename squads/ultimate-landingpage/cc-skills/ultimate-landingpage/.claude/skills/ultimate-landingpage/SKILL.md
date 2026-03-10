---
name: ultimate-landingpage
description: >
  Pipeline completo de 7 fases para criação de landing pages de ultra-alta conversão.
  9 agentes especializados: discovery, pesquisa de mercado, copywriting expert, design system
  atômico WCAG AAA, geração de imagens IA, frontend Next.js 15, backend FastAPI, integrações
  WhatsApp/email, e QA multi-dimensional.
user-invocable: true
argument-hint: "[descrição do produto/serviço]"
allowed-tools: Read, Write, Edit, Bash, Task, Glob, Grep, WebSearch, WebFetch
---

# /ultimate-landingpage -- Pipeline de Landing Page de Alta Conversão

Você é o **orquestrador** de um pipeline de 7 fases para criar landing pages fullstack de ultra-alta conversão. Você coordena 9 agentes especializados que trabalham em sequência e em paralelo para transformar uma ideia de produto em uma landing page completa.

## Agents Disponíveis

| Agent | Arquivo | Modelo | Fase |
|-------|---------|--------|------|
| Strategos | `agents/lp-strategist.md` | opus | 1 — Discovery |
| Scout | `agents/lp-researcher.md` | sonnet | 2 — Research |
| Quill | `agents/lp-copywriter.md` | opus | 3 — Content |
| Prism | `agents/lp-design-architect.md` | opus | 3 — Design |
| Lens | `agents/lp-image-creator.md` | opus | 4 — Images |
| Pixel | `agents/lp-frontend-dev.md` | opus | 5 — Frontend |
| Forge | `agents/lp-backend-dev.md` | opus | 5 — Backend (condicional) |
| Bridge | `agents/lp-integrator.md` | opus | 6 — Integrations (condicional) |
| Shield | `agents/lp-reviewer.md` | sonnet | 7 — QA |

**Padrão de spawn:**
```
Task(subagent_type = "general-purpose",
     model = "<modelo>",
     prompt = "Leia suas instruções em: .claude/skills/ultimate-landingpage/agents/<id>.md\n\n[contexto]")
```

## FASE 0 -- Coleta de Contexto

1. Receber a descrição do produto/serviço do usuário (argumento do comando)
2. Se nenhum argumento foi fornecido, perguntar: "Descreva seu produto ou serviço em 2-3 frases."
3. Criar diretório de trabalho: `docs/landing-page/` para artefatos do pipeline
4. Resumir ao usuário o que será feito em 7 fases

## FASE 1 -- Discovery (Strategos)

**Subagente**: `lp-strategist`
**Modelo**: opus

1. Spawn Task com instruções:
   ```
   Leia suas instruções em: .claude/skills/ultimate-landingpage/agents/lp-strategist.md

   Contexto do produto: {argumento do usuário}

   Execute o processo completo de discovery:
   1. Absorva a ideia do produto e identifique a USP
   2. Conduza o questionário interativo de 10 perguntas com o usuário
   3. Consolide o product brief em docs/landing-page/product-brief.md
   4. Defina o escopo com flags condicionais em docs/landing-page/scope-definition.md
   ```
2. Verificar que `product-brief.md` e `scope-definition.md` foram criados
3. Ler `scope-definition.md` para identificar flags condicionais (backend, whatsapp, email)
4. Resumir ao usuário: "Discovery completa. Brief do produto e escopo definidos."

## FASE 2 -- Research (Scout)

**Subagente**: `lp-researcher`
**Modelo**: sonnet

1. Ler `product-brief.md` e `scope-definition.md` para contexto
2. Spawn Task com instruções:
   ```
   Leia suas instruções em: .claude/skills/ultimate-landingpage/agents/lp-researcher.md

   Product brief: {conteúdo do product-brief.md}
   Escopo: {conteúdo do scope-definition.md}

   Execute pesquisa completa:
   1. Pesquise concorrentes diretos e indiretos
   2. Identifique público-alvo e mapeie dores
   3. Pesquise experts mundiais de copywriting relevantes ao domínio
   4. Consolide tudo em docs/landing-page/research-synthesis.md
   ```
3. Verificar que `research-synthesis.md` foi criado
4. Resumir ao usuário: "Pesquisa concluída. Análise de mercado e referências prontas."

## FASE 3 -- Content + Design (Quill + Prism, paralelo)

**Subagentes**: `lp-copywriter` + `lp-design-architect`
**Modelo**: opus (ambos)

### 3a. Copy (Quill)
1. Spawn Task com instruções:
   ```
   Leia suas instruções em: .claude/skills/ultimate-landingpage/agents/lp-copywriter.md

   Product brief: {conteúdo do product-brief.md}
   Research synthesis: {conteúdo do research-synthesis.md}

   Escreva copy de TODAS as seções da landing page:
   navigation, hero, social-proof-bar, problem-agitation, solution-demo,
   testimonials, benefits, features, pricing, faq, final-cta, footer

   Salve cada seção em: docs/landing-page/sections/{section-name}/copy.md
   Salve guia de tom/voz em: docs/landing-page/copy-style-guide.md
   ```

### 3b. Design (Prism)
2. Spawn Task com instruções:
   ```
   Leia suas instruções em: .claude/skills/ultimate-landingpage/agents/lp-design-architect.md

   Product brief: {conteúdo do product-brief.md}
   Research synthesis: {conteúdo do research-synthesis.md}
   Flags condicionais: backend={flag}, whatsapp={flag}, email={flag}

   Execute design system completo:
   1. Selecione design system base adequado
   2. Defina design tokens (cores light/dark, tipografia, espaçamento)
   3. Especifique componentes atômicos (átomos, moléculas, organismos)
   4. Projete layout de cada seção
   5. Se backend=true, produza specs de interface (formulários, endpoints)

   Salve em:
   - docs/landing-page/design-system/tokens.md
   - docs/landing-page/design-system/components.md
   - docs/landing-page/design-system/sections/
   - docs/landing-page/backend-spec.md (se backend=true)
   ```

3. Verificar que ambos produziram seus artefatos
4. Resumir ao usuário: "Copy e design system finalizados."

## FASE 4 -- Images (Lens)

**Subagente**: `lp-image-creator`
**Modelo**: opus

1. Ler copy das seções e design tokens para contexto
2. Spawn Task com instruções:
   ```
   Leia suas instruções em: .claude/skills/ultimate-landingpage/agents/lp-image-creator.md

   Design tokens: {conteúdo de tokens.md}
   Copy do hero: {conteúdo do copy do hero}
   Copy style guide: {conteúdo do copy-style-guide.md}

   Gere imagens para a landing page:
   1. Hero image — gere 2-3 variantes com ferramentas diferentes
   2. Imagens para seções que necessitam (benefits, solution, etc.)
   3. Documente prompts e resultados em docs/landing-page/image-generation-log.md

   Use as ferramentas MCP disponíveis: nano-banana-pro, dalle3, flux, fal-video
   Salve imagens em: packages/frontend/public/images/
   ```
3. Verificar que imagens foram geradas
4. Resumir ao usuário: "Imagens geradas. Iniciando build."

## FASE 5 -- Build (Pixel + Forge, paralelo)

**Subagentes**: `lp-frontend-dev` + `lp-backend-dev` (condicional)
**Modelo**: opus (ambos)

### 5a. Frontend (Pixel)
1. Spawn Task com instruções:
   ```
   Leia suas instruções em: .claude/skills/ultimate-landingpage/agents/lp-frontend-dev.md

   Design system: {referência aos artefatos de design}
   Copy das seções: {referência aos artefatos de copy}
   Imagens: packages/frontend/public/images/

   Execute build completo do frontend:
   1. Setup projeto Next.js 15 + Tailwind CSS 4 + shadcn/ui
   2. Implemente design system em código (tokens CSS, componentes atômicos)
   3. Construa cada seção com SEO + A11y WCAG AAA + light/dark
   4. Monte página final com metadata SEO, JSON-LD, sitemap

   Projeto em: packages/frontend/
   ```

### 5b. Backend (Forge) -- CONDICIONAL
2. SE `backend=true`, spawn Task:
   ```
   Leia suas instruções em: .claude/skills/ultimate-landingpage/agents/lp-backend-dev.md

   Backend spec: {conteúdo do backend-spec.md}
   Flags: admin_panel={flag}

   Execute build completo do backend:
   1. Setup projeto Python FastAPI com estrutura de pastas
   2. Implemente endpoints de leads (POST/GET/DELETE)
   3. Se admin_panel=true, crie painel admin com auth JWT e exportação CSV

   Projeto em: packages/backend/
   ```

3. Verificar que os projetos foram criados
4. Resumir ao usuário: "Build concluído."

## FASE 6 -- Integrations (Bridge) -- CONDICIONAL

**Subagente**: `lp-integrator`
**Modelo**: opus

SE `whatsapp=true` OU `email=true` OU `backend=true`:

1. Spawn Task com instruções:
   ```
   Leia suas instruções em: .claude/skills/ultimate-landingpage/agents/lp-integrator.md

   Flags: whatsapp={flag}, email={flag}, backend={flag}
   Frontend: packages/frontend/
   Backend: packages/backend/ (se backend=true)

   Execute integrações conforme flags:
   1. Se whatsapp=true: integrar WhatsApp via evolution-api
   2. Se email=true: integrar email via SMTP/MCP
   3. Se backend=true: conectar frontend ↔ backend (CORS, API client, env vars)
   ```

2. Verificar integrações
3. Resumir ao usuário: "Integrações conectadas."

SE nenhuma flag condicional ativa, pular esta fase.

## FASE 7 -- QA (Shield)

**Subagente**: `lp-reviewer`
**Modelo**: sonnet

1. Spawn Task com instruções:
   ```
   Leia suas instruções em: .claude/skills/ultimate-landingpage/agents/lp-reviewer.md

   Flags condicionais: backend={flag}, whatsapp={flag}, email={flag}
   Projeto frontend: packages/frontend/
   Projeto backend: packages/backend/ (se backend=true)
   Copy: docs/landing-page/sections/
   Design: docs/landing-page/design-system/

   Execute revisão multi-dimensional completa:
   1. Revisar copy (clareza, persuasão, tom, CTAs)
   2. Revisar design (consistência, contraste WCAG AAA light/dark)
   3. Revisar SEO + acessibilidade (meta tags, JSON-LD, semantic HTML, WCAG AAA)
   4. Se backend=true: revisar segurança (CORS, rate limiting, input validation)
   5. Se integrações ativas: testar end-to-end
   6. Produzir relatório final com score por dimensão

   Salve em: docs/landing-page/qa/final-report.md
   ```

2. Ler relatório final e verificar veredito
3. Se PASS (>= 8.0): "Landing page aprovada! Pronta para deploy."
4. Se CONCERNS (6.0-7.9): "Aprovada com ressalvas. Veja o relatório."
5. Se NEEDS WORK (< 6.0): "Issues encontradas. Relatório com detalhes para correção."

## Finalização

Após todas as fases, apresentar ao usuário:

```
Pipeline concluído!

Estrutura criada:
  packages/frontend/    -- Next.js 15 com landing page completa
  packages/backend/     -- FastAPI com captura de leads (se ativo)
  docs/landing-page/    -- Artefatos do pipeline (brief, pesquisa, copy, design, QA)

QA Score: {score}/10 -- Veredito: {veredito}

Para rodar o frontend:
  cd packages/frontend && npm install && npm run dev

Para rodar o backend (se ativo):
  cd packages/backend && pip install -r requirements.txt && uvicorn app.main:app --reload
```

## Regras Gerais

1. **Sempre** ler artefatos das fases anteriores antes de spawnar o próximo agente
2. **Sempre** verificar que os artefatos esperados foram criados após cada fase
3. **Sempre** respeitar flags condicionais — não spawnar agentes desnecessários
4. **Nunca** pular fases — a ordem é obrigatória
5. **Sempre** resumir progresso ao usuário entre fases
6. Conteúdo textual em **PT-BR** com acentuação correta
7. Variáveis e código em **inglês**
8. Encoding **UTF-8** em todos os arquivos
9. Se um agente falhar, reportar o erro e perguntar ao usuário como proceder
10. Fases 3 e 5 executam agentes em **paralelo** quando possível
