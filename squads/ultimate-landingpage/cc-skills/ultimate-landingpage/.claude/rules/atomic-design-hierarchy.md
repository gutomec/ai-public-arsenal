# Hierarquia Atomic Design

## Níveis (do menor ao maior)
1. **Tokens** -- Variáveis de design (cores, tipografia, espaçamento, sombras)
2. **Átomos** -- Elementos indivisíveis (Button, Input, Badge, Icon, Avatar)
3. **Moléculas** -- Composições de 2-3 átomos (FormField, SearchBar, NavLink, CTAButton)
4. **Organismos** -- Composições complexas reutilizáveis (Header, Footer, PricingCard, FAQ)
5. **Templates** -- Layouts de página sem dados reais (LandingPageTemplate)
6. **Pages** -- Templates com dados reais injetados (HomePage)

## Diretórios
- `components/atoms/` -- cada átomo em arquivo próprio
- `components/molecules/` -- composições de átomos
- `components/organisms/` -- composições complexas
- `sections/` -- seções da landing page (organismos especializados)
- Barrel exports via `index.ts` em cada nível

## Regras de Composição
- Um átomo NUNCA importa de moléculas ou organismos
- Uma molécula NUNCA importa de organismos
- Organismos podem importar de moléculas e átomos
- Seções são organismos especializados para a landing page

## Design Tokens como CSS Custom Properties
- Cores: `--color-{semantic}` com valores oklch()
- Tipografia: `--font-{role}`, `--font-size-{scale}`
- Espaçamento: `--spacing-{scale}` (grid de 4px)
- Sombras: `--shadow-{elevation}`
- Border radius: `--radius-{scale}`
- Breakpoints: `--breakpoint-{name}`

## Seções da Landing Page
- navigation, hero, social-proof-bar, problem-agitation
- solution-demo, testimonials, benefits, features
- pricing, faq, final-cta, footer
