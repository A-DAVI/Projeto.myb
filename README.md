# MyBuddy — Editor de Carrossel & Stories

Ferramenta interna para gerar carrosséis e stories do Instagram do MyBuddy (TCC).
**Galeria de layouts** intercambiáveis: você escolhe o layout, edita textos/cores/imagens/tipografia
e exporta cada frame em PNG no tamanho correto.

## Comandos

```bash
npm install      # instala dependências
npm run dev      # sobe em http://localhost:5173 com hot reload
npm run build    # gera dist/ (abrível direto no browser)
npm run preview  # serve o dist/
```

## Estrutura

```
src/
  main.ts                      # bootstrap do router (galeria ↔ editor)
  core/
    types.ts                   # Layout, Slide, Field, RenderContext, LayoutFormat
    state.ts                   # LayoutStore (estado por-layout, localStorage)
    colors.ts                  # paleta global (CSS custom props)
    handle.ts                  # @handle do Instagram (global)
    router.ts                  # router hash-based
    storage.ts                 # wrapper de localStorage
    template.ts                # esc, html``, richText
    typography.ts              # TypographyStore, CURATED_FONTS, CustomFontRegistry
    fontLoader.ts              # lazy injection de Google Fonts <link>
  layouts/
    index.ts                   # registro (importe novos layouts aqui)
    _shared.ts                 # topBar, handlePill, frameLabel, bgImage
    problema-solucao.ts        # carousel 3 slides: dor → dados → proposta
    apresentacao.ts            # carousel 3 slides: o que é · pra quem · missão
    team-buddy.ts              # carousel 5 slides: capa + 4 membros do time
    dado-destaque.ts           # carousel 1 slide: estatística viral
    stories/
      story-rapido.ts          # story 1 frame: headline + CTA
      pet-adocao.ts            # story 1 frame: foto do pet + adoção
      voce-sabia.ts            # story 2 frames: pergunta + resposta/dado
      bastidores.ts            # story 3 frames: foto + contexto + convite
  editor/
    Editor.ts                  # orquestra Sidebar + Preview + toggles
    Sidebar.ts                 # sidebar gerada a partir do Layout
    Preview.ts                 # renderiza slides/frames com safe zone overlays
    fields/                    # text, textarea, richtext, image, color, select
  gallery/
    Gallery.ts                 # tela inicial com abas Carrossel / Stories
    LayoutCard.ts              # 1 card = thumb do 1º slide + meta
  export/
    PngExporter.ts             # html2canvas + JSZip (1080×1350 carousel, 1080×1920 story)
  styles/
    tokens.css                 # paleta da marca + tipografia (--font-heading, --font-body)
    base.css                   # frame intrínseco + scaler + variantes story
    gallery.css                # grid de layouts + abas
    editor.css                 # sidebar dinâmica + safe zone overlays
index.html                     # shell mínimo (#app + DynaPuff via Google Fonts)
```

## Formatos suportados

| formato    | dimensões  | aspect ratio | uso                     |
|------------|------------|--------------|-------------------------|
| `carousel` | 1080×1350  | 4:5          | feed do Instagram       |
| `story`    | 1080×1920  | 9:16         | Stories do Instagram    |

## Identidade visual

| token       | valor      | uso                                       |
|-------------|------------|-------------------------------------------|
| `--bg`      | `#DADAB8`  | fundo sage                                |
| `--orange`  | `#E67E22`  | cor primária MyBuddy                      |
| `--olive`   | `#556B2F`  | apoio (slide 3, fundos escuros)           |
| `--red`     | `#C84A2E`  | estatísticas negativas, ênfase            |
| `--ink`     | `#1A1815`  | texto sobre fundo claro                   |
| `--white`   | `#FFFFFF`  | branco puro                               |

Fonte padrão: **DynaPuff** (Google Fonts). Tipografia configurável por layout via sidebar.

## Como criar um novo layout de Carrossel

1. **Crie `src/layouts/seu-layout.ts`**:

```ts
import type { Layout } from "../core/types"
import { html, richText } from "../core/template"
import { topBar, handlePill, frameLabel } from "./_shared"

export const seuLayout: Layout = {
  id: "seu-layout",
  name: "Nome bonito do layout",
  description: "Descrição curta pro card da galeria.",
  format: "carousel",             // ← obrigatório
  category: "narrativo",          // opcional — aparece como tag no card
  defaultTypography: {
    heading: { family: "DynaPuff", weight: 700 },
    body:    { family: "Inter",    weight: 400 },
  },

  slides: [
    {
      id: "primeiro-slide",
      label: "abertura",
      fields: [
        { id: "titulo",   type: "text",     label: "título",   default: "olá!" },
        { id: "manchete", type: "richtext", label: "manchete", default: "use {{destaque}} aqui" },
        { id: "foto",     type: "image",    label: "foto",     optional: true, default: "" },
      ],
      render: (state, ctx) => html`
        ${html.raw(frameLabel(ctx, "abertura"))}
        <div class="frame frame-sl-1">
          ${html.raw(topBar(ctx))}
          <h2>${state.titulo}</h2>
          <p>${html.raw(richText(state.manchete))}</p>
          ${html.raw(handlePill(ctx))}
        </div>
      `,
    },
  ],

  // CSS em px reais (frame = 1080×1350). Use prefixo único (.sl-) pra não colidir.
  styles: `
    .frame-sl-1 {
      width: 1080px; height: 1350px;
      padding: 84px;
      background: var(--bg);
      font-family: var(--font-body);
    }
    .frame-sl-1 h2 { font-family: var(--font-heading); }
  `,
}
```

2. **Registre em `src/layouts/index.ts`**:

```ts
import { seuLayout } from "./seu-layout"

export const layouts: Layout[] = [
  /* ... existentes ... */
  seuLayout,
]
```

Pronto. Galeria, sidebar e exporter funcionam automaticamente.

> **Regra sobre defaults e HTML:** defaults de fields contêm apenas texto puro (nunca tags HTML).
> Para destaque visual, use a sintaxe `{{palavra}}` em fields `richtext`. Para estrutura HTML
> (parágrafos, containers), defina no template do slide — não no `default`.
>
> Se precisar de HTML condicional dentro de um template `html\`...\``, envolva em `html.raw()`:
> ```ts
> ${html.raw(s.campo ? html`<p>${s.campo}</p>` : "")}
> ```
> Sem o `html.raw()`, o resultado do `html` interno é uma string que o template pai re-escapa,
> gerando `<p>` literal visível no preview.

## Como criar um layout de Story

Mesma estrutura, mas com `format: "story"` e frames em 1080×1920.
**Safe zones**: o Instagram cobre o topo (~250px) e a base (~400px) com UI.
Reserve espaço pra isso na estrutura do frame:

```ts
export const seuStory: Layout = {
  id: "seu-story",
  format: "story",              // ← diferente aqui
  defaultTypography: { ... },
  slides: [
    {
      id: "frame-1",
      render: (s, ctx) => html`
        <div class="frame frame-ss">
          <div class="ss-safe-top" data-no-export></div>   <!-- 250px reservados -->
          <div class="ss-content">
            <!-- seu conteúdo aqui — fica na faixa y=250 até y=1520 -->
          </div>
          <div class="ss-safe-bottom" data-no-export></div> <!-- 400px reservados -->
        </div>
      `,
    },
  ],
  styles: `
    .frame-ss { width: 1080px; height: 1920px; display: flex; flex-direction: column; }
    .ss-safe-top    { height: 250px; flex-shrink: 0; }
    .ss-safe-bottom { height: 400px; flex-shrink: 0; }
    .ss-content     { flex: 1; padding: 84px; }
  `,
}
```

O editor mostra um overlay listrado nas safe zones (toggle "🛡 safe zone", ligado por padrão).
O exporter capta apenas o `.frame`, ignorando elementos com `data-no-export`.
Export em **1080×1920** automaticamente.

## Field types disponíveis

| type        | UI             | notas                                          |
|-------------|----------------|------------------------------------------------|
| `text`      | input          | —                                              |
| `textarea`  | textarea       | multiline                                      |
| `richtext`  | textarea       | `{{palavra}}` → `<span class="accent">`        |
| `image`     | drop-zone      | salvo como base64; alerta se < 800px           |
| `color`     | color picker   | —                                              |
| `select`    | dropdown       | requer `options: [{ label, value }]`            |

## Tipografia

A sidebar tem uma seção **🔤 Tipografia** com dois papéis: **Heading** (títulos) e **Body** (textos de apoio).
Cada papel tem seletor de família + peso. Muda aplicam `--font-heading` e `--font-body` no `:root` em runtime.

**12 fontes curadas** (carregadas lazily ao abrir o dropdown):

| categoria         | fontes                                              |
|-------------------|-----------------------------------------------------|
| Display/Rounded   | DynaPuff · Fredoka · Baloo 2 · Quicksand            |
| Sans modernas     | Inter · Plus Jakarta Sans · Manrope · Outfit        |
| Serif editoriais  | Fraunces · Playfair Display                         |
| Mono              | JetBrains Mono · Space Mono                         |

**Adicionar nova fonte curada** (no código): edite `CURATED_FONTS` em `src/core/typography.ts`:

```ts
export const CURATED_FONTS = [
  // ...existentes...
  { family: "Pacifico", weights: [400] },  // ← adicione aqui
]
```

**Adicionar fonte custom pelo editor**: botão "+ fonte custom" na sidebar. Valida via FontFace API.

Persistência: `localStorage` key `mybuddy-typography:${layoutId}`. Fontes custom: `mybuddy-custom-fonts`.

## Persistência completa

| dado              | localStorage key                        | escopo     |
|-------------------|-----------------------------------------|------------|
| estado dos fields | `mybuddy-editor:${layoutId}`            | por layout |
| tipografia        | `mybuddy-typography:${layoutId}`        | por layout |
| paleta de cores   | `mybuddy-editor:colors`                 | global     |
| handle Instagram  | `mybuddy-editor:handle`                 | global     |
| fontes custom     | `mybuddy-custom-fonts`                  | global     |

## Export

- PNG carousel: 1080×1350. Nome: `mybuddy-${layoutId}-carousel-${N}-${slideId}.png`
- PNG story: 1080×1920. Nome: `mybuddy-${layoutId}-story-${N}-${frameId}.png`
- ZIP: todos os frames do layout ativo.
- Atalho: **Ctrl+E** exporta todos.

## Limitações conhecidas

- Imagens < 800×800px disparam alerta — podem borrar no export.
- Base64 grandes podem estourar a quota do localStorage (~5MB). O store falha silenciosamente em escrita.
- O peso tipográfico configurável (`--font-heading-weight`) afeta apenas elementos que usam `var(--font-heading-weight)` no CSS do layout. Elementos com `font-weight` hardcoded não mudam.

## Time MyBuddy

- Eder Henrique — gerente · back-end
- Davi Cassoli — back-end · infra
- Daniel Godinho — front-end · UX
- Julia Cardoso — back-end

Esse editor **não faz parte do produto principal** (Spring Boot + Angular + Flutter). É ferramenta interna pra divulgação no Instagram (@mybuddy.pet).
