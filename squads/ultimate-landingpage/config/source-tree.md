# Source Tree — Ultimate Landing Page Squad

> Estrutura de diretórios esperada para projetos gerados pelo squad.
> Diretórios marcados com **(Condicional)** são criados apenas quando a funcionalidade correspondente está ativa no escopo.

---

## Estrutura Completa

```
packages/
├── frontend/                       # Next.js 15 App
│   ├── src/
│   │   ├── app/                    # App Router — páginas e layouts
│   │   │   ├── layout.tsx          # Root layout (ThemeProvider, fonts, metadata)
│   │   │   ├── page.tsx            # Landing page principal
│   │   │   ├── globals.css         # Estilos globais e design tokens
│   │   │   └── not-found.tsx       # Página 404 customizada
│   │   │
│   │   ├── components/             # Componentes Atomic Design
│   │   │   ├── atoms/              # Elementos indivisíveis
│   │   │   │   ├── button.tsx      # Botão com variantes (shadcn/ui)
│   │   │   │   ├── badge.tsx       # Badge informativo
│   │   │   │   ├── input.tsx       # Campo de input
│   │   │   │   └── index.ts        # Barrel export
│   │   │   │
│   │   │   ├── molecules/          # Composições de atoms
│   │   │   │   ├── nav-link.tsx    # Link de navegação com ícone
│   │   │   │   ├── cta-button.tsx  # Botão de call-to-action composto
│   │   │   │   └── index.ts        # Barrel export
│   │   │   │
│   │   │   └── organisms/          # Composições complexas
│   │   │       ├── header.tsx      # Cabeçalho com navegação
│   │   │       ├── footer.tsx      # Rodapé com links e info
│   │   │       ├── pricing-card.tsx # Card de preço
│   │   │       └── index.ts        # Barrel export
│   │   │
│   │   ├── sections/               # Seções da landing page
│   │   │   ├── hero-section.tsx    # Hero com CTA principal
│   │   │   ├── benefits-section.tsx # Benefícios/features
│   │   │   ├── social-proof-section.tsx # Depoimentos/logos
│   │   │   ├── pricing-section.tsx # Tabela de preços
│   │   │   ├── faq-section.tsx     # Perguntas frequentes
│   │   │   ├── cta-section.tsx     # CTA final
│   │   │   └── index.ts           # Barrel export
│   │   │
│   │   ├── lib/                    # Utilitários e configuração
│   │   │   ├── utils.ts           # Funções utilitárias (cn, formatters)
│   │   │   ├── api-client.ts      # Cliente HTTP para backend (Condicional)
│   │   │   ├── constants.ts       # Constantes da aplicação
│   │   │   └── seo.ts            # Configuração de SEO e JSON-LD
│   │   │
│   │   └── styles/                 # Estilos e design tokens
│   │       ├── tokens.css         # Design tokens (cores, tipografia, espaçamento)
│   │       └── animations.css     # Animações e transições
│   │
│   ├── public/                     # Arquivos estáticos
│   │   ├── images/                # Imagens geradas e otimizadas
│   │   │   ├── hero/              # Imagens da seção hero
│   │   │   ├── sections/          # Imagens das demais seções
│   │   │   └── og/                # Imagens Open Graph
│   │   ├── favicon.ico            # Favicon
│   │   └── robots.txt             # Configuração de crawlers
│   │
│   ├── next.config.ts             # Configuração do Next.js
│   ├── tailwind.config.ts         # Configuração do Tailwind CSS 4
│   ├── tsconfig.json              # Configuração do TypeScript
│   ├── postcss.config.js          # Configuração do PostCSS
│   ├── package.json               # Dependências frontend
│   └── .env.local                 # Variáveis de ambiente local
│
├── backend/                        # Python FastAPI (Condicional)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                # Entry point do FastAPI
│   │   ├── config.py              # Configurações e variáveis de ambiente
│   │   │
│   │   ├── api/                   # Route handlers
│   │   │   ├── __init__.py
│   │   │   ├── v1/               # Versionamento de API
│   │   │   │   ├── __init__.py
│   │   │   │   ├── leads.py      # Endpoints de leads/contatos
│   │   │   │   ├── admin.py      # Endpoints do painel admin
│   │   │   │   └── auth.py       # Endpoints de autenticação
│   │   │   └── deps.py           # Dependências compartilhadas
│   │   │
│   │   ├── models/                # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── base.py           # Base model declarativa
│   │   │   ├── lead.py           # Model de lead/contato
│   │   │   └── user.py           # Model de usuário admin
│   │   │
│   │   ├── schemas/               # Pydantic v2 schemas
│   │   │   ├── __init__.py
│   │   │   ├── lead.py           # Schemas de lead (request/response)
│   │   │   ├── user.py           # Schemas de usuário
│   │   │   └── common.py         # Schemas compartilhados (pagination, etc.)
│   │   │
│   │   ├── services/              # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── lead_service.py   # Lógica de negócio de leads
│   │   │   ├── auth_service.py   # Lógica de autenticação JWT
│   │   │   └── export_service.py # Exportação CSV
│   │   │
│   │   └── core/                  # Infraestrutura
│   │       ├── __init__.py
│   │       ├── database.py       # Configuração do SQLAlchemy async
│   │       ├── security.py       # JWT + bcrypt helpers
│   │       └── middleware.py     # CORS, rate limiting
│   │
│   ├── alembic/                   # Migrações de banco de dados
│   │   ├── versions/             # Arquivos de migração
│   │   ├── env.py                # Configuração do Alembic
│   │   └── alembic.ini           # Config do Alembic
│   │
│   ├── tests/                     # Testes backend
│   │   ├── conftest.py           # Fixtures compartilhadas
│   │   ├── test_leads.py         # Testes de leads
│   │   ├── test_auth.py          # Testes de autenticação
│   │   └── test_export.py        # Testes de exportação
│   │
│   ├── Dockerfile                 # Container de produção
│   ├── docker-compose.yml         # Ambiente de desenvolvimento
│   ├── requirements.txt           # Dependências Python
│   ├── pyproject.toml             # Configuração do projeto Python
│   └── .env                       # Variáveis de ambiente
│
└── shared/                         # Tipos e contratos compartilhados
    ├── types/                     # Definições de tipos
    │   ├── lead.ts               # Interface de Lead (frontend)
    │   └── api-responses.ts      # Contratos de resposta da API
    └── constants/                 # Constantes compartilhadas
        └── endpoints.ts          # URLs e paths da API
```

---

## Convenções de Nomeação de Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componentes React | kebab-case `.tsx` | `hero-section.tsx` |
| Páginas Next.js | convenção App Router | `page.tsx`, `layout.tsx` |
| Utilitários TypeScript | kebab-case `.ts` | `api-client.ts` |
| Módulos Python | snake_case `.py` | `lead_service.py` |
| Testes Python | `test_` prefix | `test_leads.py` |
| Testes Frontend | `.test.tsx` suffix | `hero-section.test.tsx` |
| CSS | kebab-case `.css` | `tokens.css` |
| Configuração | padrão do ecossistema | `next.config.ts`, `pyproject.toml` |

---

## Diretórios Condicionais

| Diretório | Condição de Ativação | Flag |
|-----------|---------------------|------|
| `packages/backend/` | Backend com captura de leads, admin, CSV | `backend: true` |
| `packages/shared/` | Quando backend está ativo | `backend: true` |
| `packages/frontend/src/lib/api-client.ts` | Quando backend está ativo | `backend: true` |

---

*Synkra AIOS — Ultimate Landing Page Squad — Source Tree v1.0*
