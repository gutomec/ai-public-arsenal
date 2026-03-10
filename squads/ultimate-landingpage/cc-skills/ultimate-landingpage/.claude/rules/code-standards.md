# Padrões de Código -- Ultimate Landing Page

## Frontend (Next.js 15 + React 19)
- TypeScript strict mode obrigatório -- sem `any`
- Next.js 15 com App Router (não usar Pages Router)
- React 19 com Server Components por padrão
- Tailwind CSS 4 como engine de estilização principal
- shadcn/ui como biblioteca de componentes base
- CSS custom properties com prefixo `--` para design tokens (`--color-primary`)
- Nunca usar `!important` -- reestruturar especificidade
- Nunca usar CSS inline exceto valores dinâmicos de runtime

## Nomenclatura Frontend
- Componentes React: PascalCase (`HeroSection.tsx`)
- Arquivos de componente: kebab-case (`hero-section.tsx`)
- CSS custom properties: `--` prefix + kebab-case (`--color-primary`)
- Hooks: camelCase com prefixo `use` (`useScrollPosition`)
- Constantes: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- Tipos/Interfaces: PascalCase com sufixo (`HeroSectionProps`)

## Atomic Design
- `components/atoms/` -- Elementos indivisíveis (Button, Input, Badge)
- `components/molecules/` -- Composições de atoms (SearchBar, NavLink)
- `components/organisms/` -- Composições complexas (Header, Footer, PricingCard)
- Cada componente em arquivo próprio, exportar via `index.ts` barrel files
- Props tipadas com interface dedicada: `ComponentNameProps`

## Backend (Python 3.12+ / FastAPI)
- FastAPI como framework HTTP, SQLAlchemy 2.0 async, Pydantic v2
- Módulos e pacotes: snake_case (`lead_service.py`)
- Classes: PascalCase (`LeadSchema`)
- Funções: snake_case (`get_leads_by_date()`)
- Type hints obrigatórios em todas as funções
- Business logic nos services, NUNCA nos routers
- Docstrings em português para módulos e funções públicas

## Acessibilidade -- WCAG AAA
- Contraste mínimo 7:1 para texto normal (AAA)
- Contraste mínimo 4.5:1 para texto grande (AAA)
- HTML semântico obrigatório (`<main>`, `<nav>`, `<section>`)
- ARIA labels em elementos interativos
- Navegação por teclado funcional
- Focus indicators visíveis
- Alt text descritivo em todas as imagens
- Hierarquia de headings correta (h1 > h2 > h3)

## SEO
- `<title>` único (50-60 chars), `<meta description>` (150-160 chars)
- Open Graph e Twitter Card tags completas
- JSON-LD como formato de dados estruturados
- `next/image` para otimização (WebP/AVIF, lazy loading)
- `next/font` para fontes sem layout shift

## Light/Dark Mode
- Ambos os modos são obrigatórios
- next-themes para gerenciamento
- Design tokens via CSS custom properties com oklch()
- Testar contraste AAA em ambos os modos
- Respeitar `prefers-color-scheme` como padrão inicial

## Qualidade
- Sem `console.log` em produção
- Funções com no máximo 30 linhas
- Componentes React com no máximo 150 linhas
- Loading states e empty states obrigatórios
- Responsividade mobile-first obrigatória
- Named exports (não default)

## Git
- Conventional commits: `feat:`, `fix:`, `style:`, `a11y:`, `seo:`
- Commits atômicos, mensagens em inglês
- Referenciar seção: `feat(hero): implement hero section`
- Nunca commitar `.env` ou credenciais

## Idioma e Encoding
- Conteúdo textual: PT-BR com acentuação correta
- Variáveis e código: inglês (padrão internacional)
- Encoding: UTF-8 em todos os arquivos
