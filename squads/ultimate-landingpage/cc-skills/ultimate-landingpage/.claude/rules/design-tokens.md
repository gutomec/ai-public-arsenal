# Design Tokens

## Espaço de Cor
- Usar oklch() para todos os tokens de cor
- Formato: `oklch(lightness chroma hue)` ou `oklch(L C H / alpha)`
- oklch permite interpolação perceptualmente uniforme e contraste previsível

## Contraste WCAG AAA -- Obrigatório
- Texto normal (< 18px bold ou < 24px): ratio mínimo **7:1**
- Texto grande (>= 18px bold ou >= 24px): ratio mínimo **4.5:1**
- Verificar CADA par foreground/background
- Verificar em AMBOS os modos (light e dark)
- Documentar cada par com o ratio calculado

## Light/Dark Mode
- Light mode é o padrão (`:root`)
- Dark mode via `[data-theme="dark"]` ou `.dark`
- Respeitar `prefers-color-scheme` do sistema
- Transição suave entre modos (`transition: color, background-color`)
- NUNCA hard-code cores em componentes -- sempre usar tokens

## Estrutura de Tokens
```css
:root {
  /* Cores primitivas */
  --color-slate-50: oklch(0.98 0.01 240);
  /* Cores semânticas light */
  --color-background: var(--color-slate-50);
  --color-foreground: oklch(0.15 0.02 240);
  --color-primary: oklch(0.55 0.25 265);
  /* Tipografia */
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  /* Espaçamento (4px grid) */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
}
.dark {
  --color-background: oklch(0.12 0.02 240);
  --color-foreground: oklch(0.95 0.01 240);
}
```

## Regras
- Componentes referenciam tokens, NUNCA cores hard-coded
- Novos tokens devem seguir a nomenclatura existente
- Tokens de cor semântica (background, foreground, primary) sobre primitivos
- Documentar contraste ratio para cada par semântico
