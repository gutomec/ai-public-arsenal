# Tech Stack — Ultimate Landing Page Squad

> Stack tecnológica completa para criação de landing pages de alta conversão.
> Componentes marcados como **(Condicional)** são ativados conforme o escopo definido na fase de discovery.

---

## 1. Frontend

| Tecnologia | Versão | Propósito |
|-----------|--------|-----------|
| **Next.js** | 15.x (App Router) | Framework React com SSR/SSG, rotas baseadas em arquivos e Server Components |
| **React** | 19.x | Biblioteca de UI com Server Components e Actions |
| **TypeScript** | 5.x (strict mode) | Tipagem estática para segurança e produtividade |
| **Tailwind CSS** | 4.x | Engine de estilização utility-first com design tokens nativos |
| **shadcn/ui** | latest | Componentes acessíveis e customizáveis (baseados em Radix UI) |
| **next-themes** | latest | Gerenciamento de tema light/dark com SSR-safe |
| **next-seo** | latest | Componentes de SEO para meta tags, Open Graph e JSON-LD |

### Ferramentas de Build Frontend

| Ferramenta | Propósito |
|-----------|-----------|
| **Turbopack** | Bundler nativo do Next.js 15 para desenvolvimento rápido |
| **PostCSS** | Processamento de CSS (integrado ao Tailwind 4) |
| **next/font** | Carregamento otimizado de fontes sem layout shift |
| **next/image** | Otimização automática de imagens (WebP/AVIF, lazy loading) |

---

## 2. Backend (Condicional)

> Ativado apenas quando `backend: true` no escopo da landing page.
> Usado para funcionalidades como captura de leads, painel admin e exportação CSV.

| Tecnologia | Versão | Propósito |
|-----------|--------|-----------|
| **Python** | 3.12+ | Linguagem backend com tipagem moderna e async nativo |
| **FastAPI** | latest | Framework HTTP async de alta performance com docs automática |
| **SQLAlchemy** | 2.0 (async) | ORM com suporte a async/await e type hints |
| **Alembic** | latest | Migrações de banco de dados versionadas e reversíveis |
| **Pydantic** | v2 | Validação de dados e serialização com performance nativa |
| **python-jose** | latest | Geração e validação de tokens JWT para autenticação |
| **passlib** | latest (bcrypt) | Hash seguro de senhas com bcrypt |
| **uvicorn** | latest | Servidor ASGI de alta performance para FastAPI |

### Banco de Dados

| Tecnologia | Propósito |
|-----------|-----------|
| **PostgreSQL** | Banco de dados relacional principal (produção) |
| **SQLite** | Banco de dados para desenvolvimento local |

---

## 3. Geração de Imagens

> Múltiplos providers disponíveis via MCP servers para geração e edição de imagens.

| Provider | Modelo | Uso Principal |
|---------|--------|--------------|
| **nano-banana-pro** | Gemini (Google) | Geração e edição de imagens com Gemini, suporte a referência visual |
| **DALL-E 3** | GPT Image (OpenAI) | Geração e edição com alta fidelidade ao prompt, suporte a fundo transparente |
| **Flux** | Flux Kontext Pro | Aderência superior ao prompt e tipografia |
| **fal-video — Imagen4** | Imagen 4 (Google) | Modelo mais recente do Google para geração de imagens |
| **fal-video — Ideogram V3** | Ideogram V3 | Tipografia avançada e outputs realistas |
| **fal-video — Recraft V3** | Recraft V3 | Design profissional e ilustrações |
| **fal-video — Stable Diffusion** | SD 3.5 Large | Geração open-source de alta qualidade |

### Capacidades de Edição

- Remoção de fundo (background transparente)
- Transferência de estilo entre imagens
- Composição de múltiplas imagens de referência
- Edição iterativa com refinamento por prompt

---

## 4. Integrações (Condicionais)

> Ativadas conforme flags do escopo: `whatsapp: true`, `email: true`.

| Integração | Tecnologia | Propósito |
|-----------|-----------|-----------|
| **WhatsApp** | evolution-api | Botão de WhatsApp com link direto ou chatbot via API |
| **Email** | SMTP / MCP | Envio de emails transacionais (confirmação de lead, notificações) |
| **API Frontend↔Backend** | REST / fetch | Comunicação entre Next.js e FastAPI |

---

## 5. Design System — Atomic Design

> Arquitetura de componentes em 6 níveis hierárquicos.

| Nível | Descrição | Exemplos |
|-------|-----------|----------|
| **Tokens** | Variáveis de design (cores, tipografia, espaçamento) | `--color-primary`, `--font-heading` |
| **Atoms** | Elementos indivisíveis da UI | `Button`, `Input`, `Badge`, `Icon` |
| **Molecules** | Composições de 2-3 atoms | `SearchBar`, `NavLink`, `TestimonialCard` |
| **Organisms** | Composições complexas reutilizáveis | `Header`, `Footer`, `PricingTable`, `FAQ` |
| **Templates** | Layouts de página sem dados reais | `LandingPageTemplate` |
| **Pages** | Templates com dados reais injetados | `HomePage` |

---

## 6. Testes

### Frontend

| Ferramenta | Propósito |
|-----------|-----------|
| **Jest** | Test runner e framework de assertions para unit tests |
| **React Testing Library** | Testes de componentes focados no comportamento do usuário |
| **Playwright** | Testes end-to-end com browser real (Chrome, Firefox, Safari) |
| **axe-core** | Testes automatizados de acessibilidade (WCAG AAA) |
| **Lighthouse CI** | Verificação automatizada de performance, SEO e a11y |

### Backend

| Ferramenta | Propósito |
|-----------|-----------|
| **pytest** | Framework de testes Python com fixtures e parametrize |
| **pytest-asyncio** | Suporte a testes assíncronos (FastAPI + SQLAlchemy async) |
| **httpx** | Cliente HTTP async para testes de integração com FastAPI |
| **factory-boy** | Factories para criação de dados de teste |

---

## 7. Deploy

| Plataforma | Componente | Propósito |
|-----------|-----------|-----------|
| **Vercel** | Frontend (Next.js) | Deploy automático com preview por branch, CDN global, edge functions |
| **Docker** | Backend (FastAPI) | Containerização para deploy em qualquer cloud provider |
| **Docker Compose** | Desenvolvimento local | Orquestração de backend + banco de dados local |

---

## 8. Ferramentas de Desenvolvimento

| Ferramenta | Propósito |
|-----------|-----------|
| **ESLint** | Linting de TypeScript/JavaScript |
| **Prettier** | Formatação automática de código frontend |
| **Ruff** | Linting e formatação de código Python (ultra-rápido) |
| **Husky** | Git hooks para validação no pre-commit |
| **lint-staged** | Executar linters apenas nos arquivos staged |
| **commitlint** | Validação de mensagens de commit (conventional commits) |

---

*Synkra AIOS — Ultimate Landing Page Squad — Tech Stack v1.0*
