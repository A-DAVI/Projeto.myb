// Story "Bastidores": 3 frames — foto do momento + contexto + CTA de engajamento.
// Perfeito pra conteúdo de "behind the scenes" do desenvolvimento do MyBuddy.

import type { Layout } from "../../core/types"
import { html, richText } from "../../core/template"
import { handlePill, bgImage } from "../_shared"

export const bastidores: Layout = {
  id: "bastidores",
  name: "Bastidores do dev",
  description: "3 frames: o momento, o contexto, o convite. Humaniza o projeto.",
  format: "story",
  category: "institucional",
  defaultTypography: {
    heading: { family: "DynaPuff", weight: 700 },
    body: { family: "Inter", weight: 400 },
  },

  slides: [
    {
      id: "foto",
      label: "foto do momento",
      fields: [
        {
          id: "photo",
          type: "image",
          label: "foto (preenche o frame)",
          shape: "rect",
          optional: true,
          default: "",
        },
        { id: "caption", type: "text", label: "legenda curta", default: "reunião de sprint 🐾" },
        { id: "date", type: "text", label: "data / contexto", default: "maio, 2025" },
      ],
      render: (s, ctx) => html`
        <div class="frame frame-bst frame-bst--photo">
          <div class="bst-safe-top" data-no-export></div>
          <div class="bst-photo-fill ${s.photo ? "has-image" : ""}" style="${html.raw(bgImage(s.photo))}">
            ${s.photo ? "" : html.raw('<span class="bst-photo-placeholder">📷</span>')}
          </div>
          <div class="bst-photo-overlay">
            <div class="bst-photo-meta">
              <span class="bst-caption">${s.caption}</span>
              <span class="bst-date">${s.date}</span>
            </div>
            ${html.raw(handlePill(ctx, { variant: "light" }))}
          </div>
          <div class="bst-safe-bottom" data-no-export></div>
        </div>
      `,
    },

    {
      id: "contexto",
      label: "contexto",
      fields: [
        { id: "eyebrow", type: "text", label: "olho", default: "o que tava rolando:" },
        {
          id: "story",
          type: "richtext",
          label: "história (use {{palavra}})",
          default: "a gente tava refinando o {{fluxo de adoção}} — cada detalhe importa.",
        },
        { id: "detail", type: "textarea", label: "detalhe técnico (opcional)", optional: true, default: "" },
      ],
      render: (s, ctx) => html`
        <div class="frame frame-bst frame-bst--context">
          <div class="bst-safe-top" data-no-export></div>
          <div class="bst-center">
            <p class="bst-eyebrow">${s.eyebrow}</p>
            <p class="bst-story">${html.raw(richText(s.story))}</p>
            ${html.raw(s.detail ? html`<p class="bst-detail">${s.detail}</p>` : "")}
          </div>
          <div class="bst-bottom">
            ${html.raw(handlePill(ctx))}
          </div>
          <div class="bst-safe-bottom" data-no-export></div>
        </div>
      `,
    },

    {
      id: "cta",
      label: "convite",
      fields: [
        {
          id: "headline",
          type: "richtext",
          label: "headline do convite (use {{palavra}})",
          default: "vem {{construir}} com a gente.",
        },
        { id: "body", type: "textarea", label: "corpo", default: "segue o projeto, compartilha com quem ama pets." },
        { id: "cta", type: "text", label: "CTA", default: "segue e acompanha ↑" },
      ],
      render: (s, ctx) => html`
        <div class="frame frame-bst frame-bst--cta">
          <div class="bst-safe-top" data-no-export></div>
          <div class="bst-center bst-center--cta">
            <h1 class="bst-cta-headline">${html.raw(richText(s.headline))}</h1>
            <p class="bst-cta-body">${s.body}</p>
          </div>
          <div class="bst-bottom bst-bottom--cta">
            <span class="bst-cta-label">${s.cta}</span>
            ${html.raw(handlePill(ctx, { variant: "light" }))}
          </div>
          <div class="bst-safe-bottom" data-no-export></div>
        </div>
      `,
    },
  ],

  styles: `
    .frame-bst {
      width: 1080px; height: 1920px;
      display: flex; flex-direction: column;
      font-family: var(--font-body);
      position: relative;
      overflow: hidden;
    }
    .frame-bst--photo   { background: #111; }
    .frame-bst--context { background: var(--bg); color: var(--ink); }
    .frame-bst--cta     { background: var(--olive); color: var(--bg); }

    .frame-bst--cta::before {
      content: '';
      position: absolute;
      top: -300px; right: -200px;
      width: 700px; height: 700px;
      background: var(--orange);
      border-radius: 50%;
      opacity: 0.2;
    }

    .bst-safe-top    { height: 250px; flex-shrink: 0; }
    .bst-safe-bottom { height: 400px; flex-shrink: 0; }

    /* frame foto */
    .bst-photo-fill {
      flex: 1;
      background-size: cover;
      background-position: center;
      background-color: rgba(26,24,21,0.15);
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .bst-photo-fill::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 400px;
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
    }
    .bst-photo-placeholder { font-size: 180px; opacity: 0.3; }
    .bst-photo-overlay {
      position: absolute;
      bottom: 400px; /* above safe-bottom */
      left: 0; right: 0;
      padding: 48px 84px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      z-index: 2;
    }
    .bst-photo-meta { display: flex; flex-direction: column; gap: 8px; }
    .bst-caption {
      font-family: var(--font-heading);
      font-weight: 600;
      font-size: 54px;
      color: var(--white);
    }
    .bst-date {
      font-size: 33px;
      color: var(--white);
      opacity: 0.7;
    }

    /* frame contexto */
    .bst-center {
      flex: 1;
      display: flex; flex-direction: column;
      justify-content: center;
      padding: 84px;
      z-index: 1;
    }
    .bst-eyebrow {
      font-family: var(--font-heading);
      font-size: 42px;
      color: var(--orange);
      font-weight: 500;
      margin-bottom: 36px;
    }
    .bst-story {
      font-family: var(--font-heading);
      font-weight: 600;
      font-size: 90px;
      line-height: 1.15;
      color: var(--ink);
      letter-spacing: -0.01em;
      margin-bottom: 36px;
    }
    .bst-story .accent { color: var(--orange); }
    .bst-detail {
      font-size: 39px;
      line-height: 1.5;
      color: var(--ink);
      opacity: 0.65;
      max-width: 840px;
    }
    .bst-bottom {
      padding: 48px 84px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      z-index: 1;
    }

    /* frame cta */
    .bst-center--cta { gap: 48px; }
    .bst-cta-headline {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 126px;
      line-height: 1.05;
      color: var(--bg);
      letter-spacing: -0.02em;
    }
    .bst-cta-headline .accent { color: var(--orange); }
    .bst-cta-body {
      font-size: 48px;
      line-height: 1.45;
      color: var(--bg);
      opacity: 0.8;
      max-width: 840px;
    }
    .bst-bottom--cta {
      justify-content: space-between;
      border-top: 3px solid rgba(218,218,184,0.2);
    }
    .bst-cta-label {
      font-family: var(--font-heading);
      font-size: 36px;
      color: var(--bg);
      opacity: 0.8;
    }
  `,
}
