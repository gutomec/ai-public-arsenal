---
task: setupFrontendProject()
responsavel: "Pixel"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: dsSelection
    tipo: file
    obrigatorio: true
    descricao: "Design system selecionado com componentes e configuração base (source: selectDesignSystem())"
  - nome: scopeDefinition
    tipo: file
    obrigatorio: true
    descricao: "Definição de escopo do projeto com features habilitadas (source: defineScope())"

Saida:
  - nome: frontendProject
    tipo: file
    obrigatorio: true
    descricao: "Projeto Next.js inicializado com toda a infraestrutura configurada (destination: implementDesignSystem())"
  - nome: projectConfig
    tipo: object
    obrigatorio: true
    descricao: "Configurações do projeto — paths, ports, scripts disponíveis (destination: lp-integrator)"

Checklist:
  pre-conditions:
    - "[ ] dsSelection existe com design system escolhido (shadcn/ui)"
    - "[ ] scopeDefinition existe com features habilitadas definidas"
  post-conditions:
    - "[ ] Next.js 15 App Router inicializado"
    - "[ ] Tailwind CSS 4 configurado e funcional"
    - "[ ] shadcn/ui instalado com componentes base"
    - "[ ] TypeScript strict mode habilitado"
    - "[ ] next-themes configurado para dark mode"
    - "[ ] Estrutura de diretórios criada (src/components, src/sections, src/lib, src/styles)"
    - "[ ] Projeto roda com npm run dev sem erros"

Performance:
  duration_expected: "10 minutes"
  cacheable: true
  parallelizable: false

Error_Handling:
  - erro: "create-next-app falha (npm/network error)"
    estrategia: "retry (max 2) com limpeza de cache npm"
    fallback: "Criar projeto manualmente com package.json e dependências mínimas"
  - erro: "shadcn/ui init falha por incompatibilidade de versão"
    estrategia: "retry (max 2) com versão anterior estável"
    fallback: "Instalar componentes manualmente e configurar Tailwind sem CLI"
  - erro: "npm run dev falha após setup"
    estrategia: "Analisar logs de erro, corrigir dependência e retry"
    fallback: "Reverter últimas alterações e refazer setup incremental"
  - erro: "Conflito de dependências (peer dependencies)"
    estrategia: "Resolver com --legacy-peer-deps ou ajustar versões"
    fallback: "Documentar conflito e instalar versões compatíveis"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# setupFrontendProject()

## Pipeline Diagram

```
┌──────────────────┐
│ dsSelection      │───┐
│ (file)           │   │     ┌──────────────────────┐     ┌─────────────────────┐
│                  │   ├────>│                      │────>│ frontendProject     │
└──────────────────┘   │     │  setupFrontendProject│     │ (file)              │
                       │     │  @Pixel              │     ├─────────────────────┤
┌──────────────────┐   │     │                      │────>│ projectConfig       │
│ scopeDefinition  │───┘     └──────────────────────┘     │ (object)            │
│ (file)           │                                      └─────────────────────┘
└──────────────────┘                                             │
                                                                 ▼
                                                    ┌────────────────────────┐
                                                    │ implementDesignSystem()│
                                                    │ lp-integrator          │
                                                    └────────────────────────┘
```

## Descrição

A task `setupFrontendProject()` estabelece a fundação técnica do frontend da landing page. O agente **Pixel** inicializa um projeto Next.js 15 com App Router, configura Tailwind CSS 4, instala o shadcn/ui como design system, habilita TypeScript strict mode e prepara a infraestrutura de dark mode com next-themes.

Esta é uma task de configuração (Config) que precisa rodar uma única vez e produz o scaffold sobre o qual todo o design system e as seções serão construídos. O projectConfig exportado permite que o integrador saiba onde encontrar arquivos, portas e scripts disponíveis.

## Passos

1. **Validar inputs** — Confirmar que dsSelection contém a escolha de design system e que scopeDefinition define as features habilitadas.
2. **Inicializar Next.js 15** — Executar `npx create-next-app@latest` com App Router, TypeScript, Tailwind CSS e ESLint habilitados.
3. **Configurar TypeScript strict** — Atualizar `tsconfig.json` com `strict: true`, `noUncheckedIndexedAccess: true` e paths aliases (`@/`).
4. **Configurar Tailwind CSS 4** — Verificar a configuração do Tailwind CSS 4 com `@import "tailwindcss"` e CSS-first config.
5. **Instalar shadcn/ui** — Executar `npx shadcn@latest init` com as opções adequadas e instalar componentes base (button, card, input, dialog).
6. **Configurar next-themes** — Instalar next-themes, criar ThemeProvider, configurar layout root com `suppressHydrationWarning` e adicionar toggle de dark mode.
7. **Criar estrutura de diretórios** — Criar `src/components/` (atoms, molecules, organisms), `src/sections/`, `src/lib/`, `src/styles/`.
8. **Configurar scripts** — Garantir que `package.json` tenha scripts para `dev`, `build`, `lint`, `typecheck`.
9. **Testar setup** — Executar `npm run dev` e verificar que o projeto inicia sem erros e o hot reload funciona.
10. **Exportar projectConfig** — Documentar paths, porta de dev, scripts disponíveis e versões instaladas.
