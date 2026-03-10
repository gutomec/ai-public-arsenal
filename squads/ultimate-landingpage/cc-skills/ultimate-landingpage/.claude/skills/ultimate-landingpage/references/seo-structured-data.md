# SEO e Dados Estruturados para Landing Pages

## Meta Tags Obrigatórias

### Head Tags
```html
<title>Título Descritivo (50-60 caracteres)</title>
<meta name="description" content="Descrição clara e persuasiva (150-160 caracteres)" />
<link rel="canonical" href="https://example.com/" />
```

### Open Graph
```html
<meta property="og:title" content="Título" />
<meta property="og:description" content="Descrição" />
<meta property="og:image" content="https://example.com/og-image.jpg" />
<meta property="og:url" content="https://example.com/" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="pt_BR" />
```

### Twitter Card
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Título" />
<meta name="twitter:description" content="Descrição" />
<meta name="twitter:image" content="https://example.com/og-image.jpg" />
```

## JSON-LD -- Dados Estruturados

### Organization
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Nome da Empresa",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+55-11-1234-5678",
    "contactType": "customer service"
  }
}
```

### Product/Service (quando aplicável)
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Nome do Produto",
  "description": "Descrição do produto",
  "offers": {
    "@type": "Offer",
    "price": "99.00",
    "priceCurrency": "BRL"
  }
}
```

### FAQPage (para seção FAQ)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Pergunta?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Resposta."
      }
    }
  ]
}
```

## Next.js Metadata API

```typescript
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Título da LP',
  description: 'Descrição da LP',
  openGraph: {
    title: 'Título',
    description: 'Descrição',
    url: 'https://example.com',
    type: 'website',
    locale: 'pt_BR',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Título',
    description: 'Descrição',
  },
  alternates: {
    canonical: 'https://example.com',
  },
};
```

## Checklist SEO

- [ ] `<title>` único e descritivo (50-60 chars)
- [ ] `<meta description>` persuasiva (150-160 chars)
- [ ] Canonical URL
- [ ] Open Graph completo
- [ ] Twitter Card
- [ ] JSON-LD Organization
- [ ] JSON-LD Product/Service (se aplicável)
- [ ] JSON-LD FAQPage
- [ ] Heading hierarchy (h1 único, h2-h6 em ordem)
- [ ] Alt text em todas as imagens
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Semantic HTML5 landmarks
