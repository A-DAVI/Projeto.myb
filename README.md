# MyBuddy — Editor de Carrossel

Ferramenta interna para gerar carrosséis do Instagram do MyBuddy (TCC).
**Galeria de layouts** intercambiáveis: você escolhe o layout, edita textos/cores/imagens
e exporta cada slide em PNG 1080×1350.

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
    types.ts                   # Layout, Slide, Field, RenderContext
    state.ts                   # LayoutStore (estado por-layout, localStorage)
    colors.ts                  # paleta global (CSS custom props)
    handle.ts                  # @handle do Instagram (global)
    router.ts                  # router hash-based
    storage.ts                 # wrapper de localStorage
    template.ts                # esc, html``, richText
  layouts/
    index.ts                   # registro (importe novos layouts aqui)
    _shared.ts                 # topBar, handlePill, frameLabel, bgImage
    problema-solucao.ts        # 3 slides: dor → dados → proposta
    apresentacao.ts            # 3 slides: o que é · pra quem · missão
    team-buddy.ts              # 5 slides: capa + 4 membros do time
    dado-destaque.ts           # 1 slide: estatística viral
  editor/
    Editor.ts                  # orquestra Sidebar + Preview
    Sidebar.ts                 # sidebar gerada a partir do Layout
    Preview.ts                 # renderiza slides via layout.render()
    fields/                    # text, textarea, richtext, image, color, select
  gallery/
    Gallery.ts                 # tela inicial (grid de cards)
    LayoutCard.ts              # 1 card = thumb do 1º slide + meta
  export/
    PngExporter.ts             # html2canvas + JSZip (1080×1350)
  styles/
    tokens.css                 # paleta da marca + tipografia
    base.css                   # frame intrínseco + scaler responsivo
    gallery.css                # grid de layouts
    editor.css                 # sidebar dinâmica + área central
    slides.css                 # vazio (cada layout traz seu CSS via Layout.styles)
index.html                     # shell mínimo (#app + DynaPuff via Google Fonts)
```

## Identidade visual

Frames intrínsecos em **1080×1350px** (o preview aplica `transform: scale()`).
Layouts são autorados em pixels reais — sem regime duplicado preview/export.

| token       | valor      | uso                                       |
|-------------|------------|-------------------------------------------|
| `--bg`      | `#DADAB8`  | fundo sage                                |
| `--orange`  | `#E67E22`  | cor primária MyBuddy                      |
| `--olive`   | `#556B2F`  | apoio (slide 3, fundos escuros)           |
| `--red`     | `#C84A2E`  | estatísticas negativas, ênfase            |
| `--ink`     | `#1A1815`  | texto sobre fundo claro                   |
| `--white`   | `#FFFFFF`  | branco puro                               |

Fonte: **DynaPuff** (Google Fonts) — define a personalidade arredondada da marca.

## Como criar um novo layout

1. **Crie `src/layouts/seu-layout.ts`**:

```ts
import type { Layout } from "../core/types"
import { html, richText } from "../core/template"
import { topBar, handlePill, frameLabel } from "./_shared"

export const seuLayout: Layout = {
  id: "seu-layout",
  name: "Nome bonito do layout",
  description: "Descrição curta pro card da galeria.",
  category: "narrativo",  // opcional

  slides: [
    {
      id: "primeiro-slide",
      label: "abertura",
      fields: [
        { id: "titulo",  type: "text",     label: "título",   default: "olá!" },
        { id: "manchete", type: "richtext", label: "manchete", default: "use {{destaque}} aqui" },
        { id: "foto",    type: "image",    label: "foto",     optional: true, default: "" },
      ],
      // state contém os valores dos fields acima; ctx tem handle, colors, slideIndex
      render: (state, ctx) => html`
        ${html.raw(frameLabel(ctx, "abertura"))}
        <div class="frame frame-seu-layout-1">
          ${html.raw(topBar(ctx))}
          <h2>${state.titulo}</h2>
          <p>${html.raw(richText(state.manchete))}</p>
          ${html.raw(handlePill(ctx))}
        </div>
      `,
    },
    // ... mais slides aqui
  ],

  // CSS específico do layout. Authore em px reais (frame = 1080×1350).
  // Use prefixo único (.seu-layout-) pra não colidir com outros layouts.
  styles: `
    .frame-seu-layout-1 {
      width: 1080px; height: 1350px;
      padding: 84px;
      background: var(--bg);
      /* ... */
    }
  `,
}
```

2. **Registre em `src/layouts/index.ts`**:

```ts
import { seuLayout } from "./seu-layout"

export const layouts: Layout[] = [
  problemaSolucao,
  apresentacao,
  teamBuddy,
  dadoDestaque,
  seuLayout,   // ← aqui
]
```

Pronto. Galeria, sidebar e exporter funcionam automaticamente. Sem mais nada.

## Field types disponíveis

- `text` — input de uma linha
- `textarea` — multiline
- `richtext` — textarea + parser de `{{palavra}}` → `<span class="accent">`
- `image` — drop-zone + upload (salvo como base64 no estado)
- `color` — picker hex
- `select` — combo (requer `options: { label, value }[]`)

## Persistência

- **Por layout**: `localStorage` key `mybuddy-editor:${layoutId}`. Trocar de layout
  não perde o estado do outro.
- **Paleta**: `localStorage` key `mybuddy-editor:colors` (compartilhada).
- **Handle**: `localStorage` key `mybuddy-editor:handle` (compartilhado).
- **Export/import JSON**: salva `{ layoutId, state }` — pode ser compartilhado com
  o time, mas só importa de volta no mesmo layout (com confirmação).

## Export

- PNG individual: 1080×1350px via `html2canvas`. Nome: `mybuddy-${layoutId}-slide-${N}-${slideId}.png`.
- ZIP: todos os slides do layout ativo. Nome: `mybuddy-${layoutId}.zip`.
- Atalho: **Ctrl+E** exporta todos os slides do layout atual.

## Limitações conhecidas

- Imagens menores que 800×800 disparam alerta — vão borrar no PNG 1080×1350.
- Layouts com muitas imagens em base64 podem estourar a quota do localStorage
  (~5MB). O store falha silenciosamente em escrita — você não perde a sessão atual,
  só não persiste ao reload.
- A integração com a Claude API (gerar conteúdo via prompt) foi **removida** neste
  refactor pra simplificar a nova arquitetura. O proxy `api/claude.ts` continua no
  repo; pra reintroduzir, adicione um campo opcional `ai?: (apiKey, topic) => Promise<LayoutState>`
  ao tipo `Layout` e renderize uma seção condicional na Sidebar.

## Time MyBuddy

- Eder Henrique — gerente · back-end
- Davi Cassoli — back-end · infra
- Daniel Godinho — front-end · UX
- Julia Cardoso — back-end

Esse editor NÃO faz parte do produto principal (Spring Boot + Angular + Flutter). É ferramenta interna pra divulgação no Instagram (@mybuddy.pet).
