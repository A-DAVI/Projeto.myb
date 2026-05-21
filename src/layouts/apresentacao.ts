// Layout institucional: 3 slides — o que é, pra quem, por que existe.
// Tipografia maior e mais espaçada, paleta sage/olive/laranja.

import type { Layout } from "../core/types"
import { html, richText } from "../core/template"
import { topBar, handlePill, frameLabel, bgImage } from "./_shared"

export const apresentacao: Layout = {
  id: "apresentacao",
  name: "Apresentação institucional",
  description: "3 slides curtos: o que é, pra quem, por que existe.",
  category: "institucional",

  slides: [
    {
      id: "o-que-e",
      label: "o que é",
      fields: [
        { id: "eyebrow", type: "text", label: "olho do título", default: "olá, somos o" },
        { id: "brand", type: "text", label: "nome em destaque", default: "MyBuddy" },
        {
          id: "tagline",
          type: "richtext",
          label: "tagline (use {{palavra}})",
          default: "o hub {{completo}} pra quem ama pet.",
        },
        {
          id: "image",
          type: "image",
          label: "imagem de capa (opcional)",
          shape: "decorative",
          optional: true,
          default: "",
        },
      ],
      render: (s, ctx) => html`
        ${html.raw(frameLabel(ctx, "abertura"))}
        <div class="frame frame-apr-1">
          ${html.raw(topBar(ctx))}
          <div class="apr-cover" style="${html.raw(bgImage(s.image))}"></div>
          <div class="apr-cover-content">
            <p class="apr-eyebrow">${s.eyebrow}</p>
            <h1 class="apr-brand">${s.brand}</h1>
            <p class="apr-tagline">${html.raw(richText(s.tagline))}</p>
          </div>
          <div class="apr-bottom">${html.raw(handlePill(ctx))}</div>
        </div>
      `,
    },

    {
      id: "pra-quem",
      label: "pra quem",
      fields: [
        { id: "title", type: "text", label: "título", default: "pra quem é o MyBuddy?" },
        { id: "p1_emoji", type: "text", label: "público 1 — emoji", default: "🐾" },
        { id: "p1_label", type: "text", label: "público 1 — label", default: "famílias que querem adotar" },
        { id: "p2_emoji", type: "text", label: "público 2 — emoji", default: "🏠" },
        { id: "p2_label", type: "text", label: "público 2 — label", default: "ONGs e protetores independentes" },
        { id: "p3_emoji", type: "text", label: "público 3 — emoji", default: "🛒" },
        { id: "p3_label", type: "text", label: "público 3 — label", default: "tutores buscando serviços confiáveis" },
      ],
      render: (s, ctx) => html`
        ${html.raw(frameLabel(ctx, "público"))}
        <div class="frame frame-apr-2">
          ${html.raw(topBar(ctx))}
          <h2 class="apr-title">${s.title}</h2>
          <div class="apr-audience">
            <div class="apr-aud-row">
              <span class="apr-aud-emoji">${s.p1_emoji}</span>
              <span class="apr-aud-label">${s.p1_label}</span>
            </div>
            <div class="apr-aud-row">
              <span class="apr-aud-emoji">${s.p2_emoji}</span>
              <span class="apr-aud-label">${s.p2_label}</span>
            </div>
            <div class="apr-aud-row">
              <span class="apr-aud-emoji">${s.p3_emoji}</span>
              <span class="apr-aud-label">${s.p3_label}</span>
            </div>
          </div>
        </div>
      `,
    },

    {
      id: "porque",
      label: "por que existe",
      fields: [
        { id: "tag", type: "text", label: "tag", default: "a missão" },
        {
          id: "manifesto",
          type: "richtext",
          label: "manifesto (use {{palavra}})",
          default: "todo pet merece {{visibilidade}}, todo tutor merece {{apoio}}.",
        },
        { id: "cta", type: "text", label: "CTA", default: "siga e vem com a gente" },
      ],
      render: (s, ctx) => html`
        ${html.raw(frameLabel(ctx, "missão"))}
        <div class="frame frame-apr-3">
          ${html.raw(topBar(ctx, { invertLogo: true }))}
          <div class="apr-mission">
            <span class="apr-tag">${s.tag}</span>
            <p class="apr-manifesto">${html.raw(richText(s.manifesto))}</p>
          </div>
          <div class="apr-bottom apr-bottom--dark">
            <span class="apr-cta">${s.cta}</span>
            ${html.raw(handlePill(ctx, { variant: "light" }))}
          </div>
        </div>
      `,
    },
  ],

  styles: `
    .frame-apr-1, .frame-apr-2, .frame-apr-3 {
      width: 1080px; height: 1350px;
      padding: 84px;
      display: flex; flex-direction: column;
      background: var(--bg);
      font-family: var(--font-body);
      position: relative;
      overflow: hidden;
    }
    .frame-apr-3 { background: var(--olive); }

    /* slide 1 */
    .frame-apr-1 { justify-content: space-between; }
    .frame-apr-1 .top { display: flex; justify-content: space-between; align-items: center; }
    .apr-cover {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      opacity: 0.15;
      z-index: 0;
    }
    .apr-cover-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      z-index: 1;
      position: relative;
    }
    .apr-eyebrow {
      font-family: var(--font-brand);
      font-size: 42px;
      color: var(--ink);
      opacity: 0.7;
      margin-bottom: 18px;
    }
    .apr-brand {
      font-family: var(--font-brand);
      font-size: 180px;
      font-weight: 700;
      color: var(--orange);
      line-height: 1;
      letter-spacing: -0.02em;
      margin-bottom: 36px;
    }
    .apr-tagline {
      font-family: var(--font-brand);
      font-size: 48px;
      line-height: 1.25;
      color: var(--ink);
      max-width: 840px;
    }
    .apr-tagline .accent { color: var(--orange); }
    .apr-bottom { z-index: 1; }

    /* slide 2 */
    .frame-apr-2 .top { display: flex; justify-content: space-between; align-items: center; }
    .apr-title {
      font-family: var(--font-brand);
      font-weight: 600;
      font-size: 72px;
      color: var(--ink);
      margin-top: 60px;
      margin-bottom: 60px;
      line-height: 1.1;
    }
    .apr-audience { flex: 1; display: flex; flex-direction: column; gap: 36px; justify-content: center; }
    .apr-aud-row {
      display: flex; align-items: center; gap: 36px;
      background: rgba(26,24,21,0.05);
      padding: 36px 42px;
      border-radius: 32px;
    }
    .apr-aud-emoji { font-size: 84px; line-height: 1; }
    .apr-aud-label { font-family: var(--font-brand); font-weight: 500; font-size: 42px; color: var(--ink); }

    /* slide 3 */
    .frame-apr-3 { justify-content: space-between; }
    .frame-apr-3 .top { display: flex; justify-content: space-between; align-items: center; }
    .frame-apr-3::before {
      content: '';
      position: absolute;
      top: -240px; left: -240px;
      width: 660px; height: 660px;
      background: var(--orange);
      border-radius: 50%;
      opacity: 0.18;
    }
    .apr-mission { flex: 1; display: flex; flex-direction: column; justify-content: center; z-index: 1; }
    .apr-tag {
      width: fit-content;
      padding: 15px 36px;
      background: var(--orange);
      color: var(--white);
      border-radius: 60px;
      font-family: var(--font-brand);
      font-size: 33px;
      margin-bottom: 48px;
    }
    .apr-manifesto {
      font-family: var(--font-brand);
      font-weight: 600;
      font-size: 96px;
      line-height: 1.15;
      color: var(--bg);
      letter-spacing: -0.01em;
    }
    .apr-manifesto .accent { color: var(--orange); }
    .apr-bottom--dark {
      z-index: 1;
      border-top: 3px solid rgba(218,218,184,0.2);
      padding-top: 42px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .apr-cta { font-family: var(--font-brand); font-weight: 500; font-size: 36px; color: var(--bg); }
  `,
}
