// Story rápido: 1 frame com headline + subtítulo + CTA.
// Ideal pra divulgar qualquer mensagem curta no Stories do Instagram.

import type { Layout } from "../../core/types"
import { html, richText } from "../../core/template"
import { handlePill } from "../_shared"

export const storyRapido: Layout = {
  id: "story-rapido",
  name: "Story rápido",
  description: "1 frame: headline grande + subtítulo + CTA. Qualquer mensagem curta.",
  format: "story",
  category: "geral",
  defaultTypography: {
    heading: { family: "DynaPuff", weight: 700 },
    body: { family: "Inter", weight: 400 },
  },

  slides: [
    {
      id: "frame",
      label: "story",
      fields: [
        { id: "eyebrow", type: "text", label: "olho do título", default: "novidade 🐾" },
        {
          id: "headline",
          type: "richtext",
          label: "manchete (use {{palavra}})",
          default: "{{MyBuddy}} chegou pra mudar o jogo da adoção.",
        },
        {
          id: "body",
          type: "textarea",
          label: "corpo (opcional)",
          optional: true,
          default: "Conectamos ONGs, tutores e adotantes num só lugar.",
        },
        { id: "cta", type: "text", label: "CTA", default: "arraste pra cima e saiba mais ↑" },
      ],
      render: (s, ctx) => html`
        <div class="frame frame-sr">
          <div class="sr-safe-top" data-no-export></div>
          <div class="sr-content">
            <p class="sr-eyebrow">${s.eyebrow}</p>
            <h1 class="sr-headline">${html.raw(richText(s.headline))}</h1>
            ${html.raw(s.body ? html`<p class="sr-body">${s.body}</p>` : "")}
          </div>
          <div class="sr-bottom">
            <span class="sr-cta">${s.cta}</span>
            ${html.raw(handlePill(ctx))}
          </div>
          <div class="sr-safe-bottom" data-no-export></div>
        </div>
      `,
    },
  ],

  styles: `
    .frame-sr {
      width: 1080px; height: 1920px;
      padding: 0;
      display: flex; flex-direction: column;
      background: var(--bg);
      font-family: var(--font-body);
      position: relative;
      overflow: hidden;
    }
    .frame-sr::before {
      content: '';
      position: absolute;
      top: -300px; right: -200px;
      width: 700px; height: 700px;
      background: var(--orange);
      border-radius: 50%;
      opacity: 0.18;
    }
    .frame-sr::after {
      content: '';
      position: absolute;
      bottom: -300px; left: -200px;
      width: 600px; height: 600px;
      background: var(--olive);
      border-radius: 50%;
      opacity: 0.12;
    }

    /* safe zones: espaço reservado pra UI do Instagram */
    .sr-safe-top  { height: 250px; flex-shrink: 0; }
    .sr-safe-bottom { height: 400px; flex-shrink: 0; }

    .sr-content {
      flex: 1;
      display: flex; flex-direction: column;
      justify-content: center;
      padding: 84px;
      z-index: 1;
    }
    .sr-eyebrow {
      font-family: var(--font-heading);
      font-size: 48px;
      color: var(--orange);
      margin-bottom: 36px;
      font-weight: 500;
    }
    .sr-headline {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 108px;
      line-height: 1.1;
      color: var(--ink);
      letter-spacing: -0.02em;
      margin-bottom: 48px;
    }
    .sr-headline .accent { color: var(--orange); }
    .sr-body {
      font-size: 48px;
      line-height: 1.5;
      color: var(--ink);
      opacity: 0.75;
      max-width: 840px;
    }

    .sr-bottom {
      padding: 60px 84px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1;
      border-top: 3px solid rgba(26,24,21,0.1);
    }
    .sr-cta {
      font-family: var(--font-heading);
      font-size: 36px;
      color: var(--ink);
      opacity: 0.7;
    }
  `,
}
