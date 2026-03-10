# Coding Standards — Ultimate Landing Page Squad

> Padrões de código para o squad de landing pages fullstack.
> Todos os textos visíveis ao usuário devem estar em Português (PT-BR) com acentuação correta.
> Nomes de variáveis, funções e identificadores de código devem ser escritos em inglês.

---

## 1. Frontend — Next.js 15 + React 19

### Framework e Linguagem

- **Next.js 15** com App Router (não usar Pages Router)
- **React 19** com Server Components por padrão
- **TypeScript** em modo strict (`"strict": true` no `tsconfig.json`)
- Encoding UTF-8 em todos os arquivos

### Estilização

- **Tailwind CSS 4** como engine de estilização principal
- **shadcn/ui** como biblioteca de componentes base
- CSS custom properties com prefixo `--` para design tokens:
  ```css
  --color-primary: oklch(0.65 0.25 265);
  --font-heading: 'Inter', sans-serif;
  --spacing-section: 5rem;
  ```
- Nunca usar `!important` — reestruturar a especificidade se necessário
- Nunca usar CSS inline exceto para valores dinâmicos calculados em runtime

### Convenções de Nomenclatura

| Elemento | Padrão | Exemplo |
|----------|--------|---------|
| Componentes React | PascalCase | `HeroSection.tsx` |
| Arquivos de componente | kebab-case | `hero-section.tsx` |
| CSS custom properties | `--` prefix + kebab-case | `--color-primary` |
| Hooks customizados | camelCase com prefixo `use` | `useScrollPosition` |
| Utilitários | camelCase | `formatCurrency()` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Tipos/Interfaces | PascalCase com sufixo | `HeroSectionProps` |
| Enums | PascalCase | `ThemeMode` |

### Estrutura de Componentes (Atomic Design)

```
components/
├── atoms/          # Elementos indivisíveis (Button, Input, Badge)
├── molecules/      # Composições de atoms (SearchBar, NavLink)
└── organisms/      # Composições complexas (Header, Footer, PricingCard)
```

- Cada componente deve ter seu próprio arquivo
- Exportar via `index.ts` barrel files por nível atômico
- Props sempre tipadas com interface dedicada: `ComponentNameProps`

### Imports

- Usar path aliases configurados no `tsconfig.json`:
  ```typescript
  import { Button } from '@/components/atoms/button';
  import { cn } from '@/lib/utils';
  ```
- Ordem de imports:
  1. React / Next.js
  2. Bibliotecas externas
  3. Componentes internos
  4. Utilitários e tipos
  5. Estilos

---

## 2. Backend — Python 3.12+ / FastAPI

### Framework e Linguagem

- **Python 3.12+** como versão mínima
- **FastAPI** como framework HTTP
- **SQLAlchemy 2.0** com async engine (não usar padrão 1.x)
- **Pydantic v2** para validação de schemas
- **Alembic** para migrações de banco de dados
- Encoding UTF-8 em todos os arquivos (declarar `# -*- coding: utf-8 -*-` quando necessário)

### Convenções de Nomenclatura (Python)

| Elemento | Padrão | Exemplo |
|----------|--------|---------|
| Módulos e pacotes | snake_case | `lead_service.py` |
| Classes | PascalCase | `LeadSchema` |
| Funções e métodos | snake_case | `get_leads_by_date()` |
| Variáveis | snake_case | `total_count` |
| Constantes | UPPER_SNAKE_CASE | `DATABASE_URL` |
| Variáveis protegidas | `_` prefix | `_internal_cache` |
| Variáveis privadas | `__` prefix | `__secret_key` |

### Estrutura de Módulos

```
app/
├── api/            # Route handlers (routers FastAPI)
├── models/         # SQLAlchemy ORM models
├── schemas/        # Pydantic v2 schemas (request/response)
├── services/       # Business logic (nunca nos routers)
├── core/           # Configuração, segurança, dependências
└── utils/          # Funções utilitárias
```

### Regras de Código Python

- Type hints obrigatórios em todas as funções:
  ```python
  async def get_lead(lead_id: int) -> LeadResponse:
  ```
- Docstrings em português para módulos, classes e funções públicas
- Business logic isolada nos services, nunca nos routers
- Dependency injection via FastAPI `Depends()`
- Tratamento de erros com `HTTPException` e códigos HTTP corretos

---

## 3. Acessibilidade — WCAG AAA

### Requisitos Obrigatórios

- **Nível AAA** é mandatório, não opcional
- Contraste mínimo de **7:1** para texto normal (AAA)
- Contraste mínimo de **4.5:1** para texto grande (AAA)
- HTML semântico obrigatório (`<main>`, `<nav>`, `<section>`, `<article>`, `<aside>`)
- Atributos ARIA completos onde HTML semântico não for suficiente
- Navegação por teclado funcional em todos os elementos interativos
- Focus indicators visíveis e com contraste adequado
- Textos alternativos descritivos em todas as imagens (`alt`)
- Hierarquia de headings correta (`h1` > `h2` > `h3`, sem pular níveis)
- Links com texto descritivo (nunca "clique aqui")
- Formulários com `<label>` associado e mensagens de erro acessíveis

### Validação

- Testar com ferramentas automatizadas (axe-core, Lighthouse)
- Verificar navegação apenas com teclado
- Testar com leitor de tela (VoiceOver / NVDA)

---

## 4. SEO

### Meta Tags Obrigatórias

- `<title>` único por página (50-60 caracteres)
- `<meta name="description">` único por página (150-160 caracteres)
- `<link rel="canonical">` em todas as páginas
- Open Graph tags completas (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
- Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)

### Dados Estruturados

- **JSON-LD** como formato de dados estruturados (não Microdata)
- Schema.org types relevantes para o negócio:
  ```typescript
  // Exemplo: Organization + WebPage
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Nome da Empresa',
    url: 'https://example.com',
  };
  ```
- Validar com Google Rich Results Test

### Performance SEO

- Core Web Vitals dentro dos limites recomendados
- Imagens otimizadas com `next/image` (WebP/AVIF, lazy loading)
- Fonte carregada com `next/font` (sem layout shift)

---

## 5. Light/Dark Mode

### Implementação Obrigatória

- **Ambos os modos são obrigatórios** — nunca entregar apenas um
- Usar **next-themes** para gerenciamento de tema
- Design tokens via CSS custom properties:
  ```css
  :root {
    --color-background: oklch(0.98 0 0);
    --color-foreground: oklch(0.15 0 0);
  }

  .dark {
    --color-background: oklch(0.12 0 0);
    --color-foreground: oklch(0.95 0 0);
  }
  ```
- Componentes devem referenciar tokens, nunca cores hard-coded
- Testar contraste AAA em ambos os modos
- Transição suave entre modos (CSS `transition` nas propriedades de cor)
- Respeitar preferência do sistema (`prefers-color-scheme`) como padrão inicial

---

## 6. Git e Commits

### Conventional Commits

Formato: `<type>(<scope>): <description>`

| Type | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `style` | Mudanças visuais (CSS, layout) |
| `refactor` | Refatoração sem mudança de comportamento |
| `docs` | Documentação |
| `test` | Testes |
| `chore` | Manutenção, configs |
| `a11y` | Melhorias de acessibilidade |
| `seo` | Melhorias de SEO |
| `perf` | Performance |

### Regras de Commit

- **Commits atômicos**: um commit por seção ou funcionalidade
- Mensagens em inglês (padrão Git internacional)
- Referenciar a seção da landing page quando relevante:
  ```
  feat(hero): implement hero section with CTA and background video
  a11y(pricing): add ARIA labels to pricing toggle
  seo(global): add JSON-LD structured data for Organization
  ```
- Nunca commitar arquivos sensíveis (`.env`, chaves de API, credenciais)

---

## 7. Qualidade de Código

### Regras Gerais

- Sem `console.log` em produção (usar logger configurável)
- Sem `any` no TypeScript (usar tipos explícitos ou `unknown`)
- Sem variáveis não utilizadas
- Funções com no máximo 30 linhas (extrair sub-funções se necessário)
- Componentes React com no máximo 150 linhas
- Tratamento de erros em toda operação assíncrona
- Loading states e empty states em todo componente que busca dados
- Responsividade mobile-first obrigatória

### Linting e Formatação

- ESLint com configuração Next.js + regras customizadas
- Prettier para formatação automática
- Ruff para linting e formatação Python
- Husky + lint-staged para validação no pre-commit

---

*Synkra AIOS — Ultimate Landing Page Squad — Coding Standards v1.0*
