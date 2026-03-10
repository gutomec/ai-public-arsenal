# IDEATION — Ultimate Landing Page Squad

> Documento de raciocínio da composição de agentes.
> Gerado por: Agent Creator (NSC Pipeline - Fase 2)
> Data: 2026-02-24

---

## Justificativa de Cada Agente

### 1. lp-strategist (Strategos) — Flow_Master

**Por que existe:** O pipeline precisa de um ponto de entrada que compreenda profundamente a ideia do usuário antes de qualquer ação. Sem discovery, os agentes trabalham com suposições.

**Capacidades cobertas:** C1 (Product Discovery), C10 (User Elicitation)

**Alternativas consideradas:**
- Unir strategist + researcher → Descartado: discovery é interativo (elicitation), research é assíncrono (web search). Perfis cognitivos diferentes.
- Sem strategist (usuário fornece briefing direto) → Descartado: usuários raramente fornecem briefings completos. O questionário interativo é essencial.

**Archetype rationale:** Flow_Master porque orquestra o fluxo de discovery e define o que será ativado/desativado no pipeline.

---

### 2. lp-researcher (Scout) — Builder

**Por que existe:** A qualidade do copy e do design depende diretamente da qualidade da pesquisa. Pesquisa superficial = landing page genérica.

**Capacidades cobertas:** C2 (Market Research)

**Alternativas consideradas:**
- Unir researcher + copywriter → Descartado: pesquisa requer web search extensivo e síntese; copy requer criatividade e adaptação de frameworks. Skills completamente diferentes.
- Múltiplos researchers (um para mercado, um para experts) → Descartado: aumenta complexidade sem benefício proporcional. Um researcher forte com sub-tasks é mais eficiente.

**Archetype rationale:** Builder porque produz artefatos de pesquisa consumidos por outros agentes.

---

### 3. lp-copywriter (Quill) — Builder

**Por que existe:** Copy é o elemento de maior impacto em conversão. Um agente especializado pode aplicar frameworks de experts com profundidade.

**Capacidades cobertas:** C3 (Expert Copywriting)

**Alternativas consideradas:**
- Unir copywriter + designer → Descartado: "copy vem antes do design" é princípio fundamental. Agentes separados reforçam esta sequência.
- Copywriter genérico (sem frameworks pesquisados) → Descartado: o diferencial deste squad é usar frameworks dos MELHORES experts mundiais, não templates genéricos.

**Archetype rationale:** Builder porque produz copy para cada seção.

---

### 4. lp-design-architect (Prism) — Builder

**Por que existe:** Um design system atômico requer especialização em color theory, tipografia, hierarquia visual e acessibilidade. Também produz as specs que o backend-dev consome.

**Capacidades cobertas:** C4 (Atomic Design System)

**Alternativas consideradas:**
- Designer + Architect separados → Descartado: na prática, design system e seção design são feitos pela mesma pessoa. Separar geraria overhead de coordenação.
- Sem backend specs (backend-dev infere do frontend) → Descartado: o usuário pediu explicitamente que as "instruções impecáveis vindo do agente idealizador da UI/UX" alimentem o backend. Prism produz specs acionáveis.

**Archetype rationale:** Builder porque produz design system, specs de seções e specs de backend.

---

### 5. lp-image-creator (Lens) — Builder

**Por que existe:** Geração de imagens por IA requer prompt engineering especializado e iteração. Imagens coerentes com o design system exigem um agente dedicado.

**Capacidades cobertas:** C9 (Image Generation)

**Alternativas consideradas:**
- Unir image-creator + designer → Descartado: geração de imagens é uma skill diferente de design system. Prompts de IA são um campo próprio.
- Sem agente de imagens (usar stock) → Descartado: o squad existente já usa imagens geradas. É um diferencial competitivo.

**Archetype rationale:** Builder porque produz assets visuais.

---

### 6. lp-frontend-dev (Pixel) — Builder

**Por que existe:** Frontend com SEO perfeito + WCAG AAA + light/dark requer especialização técnica profunda que não pode ser "agregada" a outro papel.

**Capacidades cobertas:** C5 (Frontend Development)

**Alternativas consideradas:**
- Unir frontend + backend → Descartado: stacks completamente diferentes (Next.js vs FastAPI). Também permite execução paralela.
- Sem especialização em SEO/a11y → Descartado: o usuário pediu explicitamente "o melhor SEO e a melhor acessibilidade do universo".

**Archetype rationale:** Builder porque produz código frontend.

---

### 7. lp-backend-dev (Forge) — Builder

**Por que existe:** O usuário pediu backend Python FastAPI com admin panel e CSV export. É um skill set completamente diferente do frontend.

**Capacidades cobertas:** C6 (Backend Development)

**Condicionalidade:** Ativado APENAS se `backend: true` no escopo.

**Alternativas consideradas:**
- Node.js backend (mesmo stack do frontend) → Descartado: o usuário pediu explicitamente Python FastAPI.
- Backend genérico (sem admin panel) → Descartado: o usuário pediu admin panel + CSV export explicitamente.

**Archetype rationale:** Builder porque produz código backend.

---

### 8. lp-integrator (Bridge) — Builder

**Por que existe:** WhatsApp (evolution-api) e email (MCP) são integrações externas que requerem conhecimento específico de APIs e fallback handling.

**Capacidades cobertas:** C7 (External Integrations)

**Condicionalidade:** Ativado APENAS se `whatsapp: true` ou `email: true` no escopo.

**Alternativas consideradas:**
- Integrações dentro do backend-dev → Descartado: integrações envolvem tanto backend quanto frontend. Um agente dedicado coordena melhor.
- Um agente por integração → Descartado: overhead excessivo para 2-3 integrações.

**Archetype rationale:** Builder porque produz código de integração.

---

### 9. lp-reviewer (Shield) — Guardian

**Por que existe:** QA multi-dimensional (copy, design, SEO, segurança, integrações) requer um agente que veja o TODO e não apenas uma parte.

**Capacidades cobertas:** C8 (Quality Assurance)

**Alternativas consideradas:**
- QA por dimensão (5 reviewers separados) → Descartado: um reviewer central com sub-tasks é mais eficiente e garante visão holística.
- Sem QA (confia nos agentes) → Descartado: QA é gate obrigatório em qualquer pipeline profissional.

**Archetype rationale:** Guardian porque valida, revisa e protege a qualidade do resultado.

---

## Mapeamento Agentes → Capacidades

| Capacidade | Agente Primário | Agente Secundário |
|-----------|----------------|-------------------|
| C1: Product Discovery | lp-strategist | — |
| C2: Market Research | lp-researcher | — |
| C3: Expert Copywriting | lp-copywriter | lp-reviewer (revisão) |
| C4: Atomic Design System | lp-design-architect | lp-reviewer (revisão) |
| C5: Frontend Development | lp-frontend-dev | lp-reviewer (revisão) |
| C6: Backend Development | lp-backend-dev | lp-reviewer (revisão) |
| C7: External Integrations | lp-integrator | lp-reviewer (revisão) |
| C8: Quality Assurance | lp-reviewer | — |
| C9: Image Generation | lp-image-creator | — |
| C10: User Elicitation | lp-strategist | — |

## Potenciais Redundâncias (para Optimizer)

1. **lp-copywriter review-tone vs lp-reviewer review-copy** — Sobreposição parcial. Quill foca em consistência de tom; Shield foca em qualidade geral. Manter ambos.
2. **lp-design-architect backend-spec vs lp-backend-dev** — Prism define specs, Forge implementa. Separação clara de responsabilidades (design vs code).
3. **lp-integrator connect vs lp-frontend-dev/lp-backend-dev** — Bridge configura conexão (CORS, env vars, API client); Pixel e Forge já criaram os endpoints/forms. Separação válida para evitar conflitos.

## Notas Arquiteturais

- **Condicionalidade:** 3 agentes são condicionais (Forge, Bridge parcial). O orquestrador deve respeitar as flags do escopo.
- **Paralelismo:** Copy (Quill) e Design (Prism) podem rodar em paralelo na Fase 3. Frontend (Pixel) e Backend (Forge) podem rodar em paralelo na Fase 5.
- **Handoff crítico:** Prism → Forge é o handoff mais importante. As specs de backend devem ser completas e acionáveis para evitar retrabalho.

---

## Optimization Phase (Phase 5)

> Gerado por: Optimizer (NSC Pipeline - Fase 5)
> Data: 2026-02-24

### AgentDropout
- Agentes antes: 9
- Agentes depois: 9
- Eliminados: 0
- Justificativa: Todos os 36 pares de agentes foram analisados. Nenhum par apresenta comandos que sejam subconjunto estrito de outro. Cada agente opera em domínio funcional distinto com comandos exclusivos. As sobreposições parciais identificadas (Quill review-tone vs Shield review-copy; Prism backend-spec vs Forge implementação) representam perspectivas diferentes (auto-revisão vs QA externo; spec vs code), não redundância eliminável.

### Cross-References
- Check 1 (Agent IDs vs filenames): PASS
- Check 2 (Task responsáveis vs agent names): PASS
- Check 3 (Workflow sequences vs agent IDs): PASS
- Check 4 (squad.yaml components vs files): PASS
- Check 5 (Config paths existem): PASS

### Naming Consistency
- Agent IDs (kebab-case): PASS
- Agent filenames (kebab-case.md): PASS
- Task filenames (kebab-case.md): PASS
- Workflow filenames (kebab-case.yaml): PASS
- Command names (*kebab-case): PASS

### Relatório Completo
Veja `optimization-report.md` para análise detalhada de todos os 36 pares de agentes, matriz de capacidades e observações adicionais.
