# Mobile-First & Responsividade

## Abordagem
- CSS base é para mobile (320px mínimo)
- Usar `min-width` media queries para expandir (não `max-width`)
- Tailwind CSS 4: classes sem prefixo = mobile, `md:` = tablet, `lg:` = desktop

## Breakpoints
- **Mobile**: 320px - 767px (base, sem media query)
- **Tablet**: 768px+ (`md:`)
- **Desktop**: 1024px+ (`lg:`)
- **Wide**: 1280px+ (`xl:`)
- **Ultra**: 1536px+ (`2xl:`)

## Regras
- Todo componente e seção DEVE funcionar em 320px
- Testar em viewports: 320px, 375px, 768px, 1024px, 1440px
- Imagens responsivas via `next/image` com `sizes` adequado
- Tipografia com clamp() para escala fluida quando possível
- Touch targets mínimo 44x44px em mobile (WCAG 2.5.5)
- Navegação mobile: hamburger menu ou bottom nav
- Hero section: layout vertical em mobile, horizontal em desktop
- Grid de benefícios/features: 1 coluna mobile, 2 tablet, 3 desktop
- Pricing cards: empilhadas em mobile, lado a lado em desktop
