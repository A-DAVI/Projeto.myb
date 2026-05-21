// Layout original do editor: 3 slides Problema → Dados → Solução.
// Migrado do código antigo para o formato declarativo do sistema plugável.
//
// Mudanças vs. versão antiga:
//  - Headline com syntax {{palavra}} em vez de 3 campos (text/accent/end).
//  - Slide 2 fica num único formato (stats), os layouts "cards" e "quote"
//    podem virar layouts separados depois — simplifica a configuração.

import type { Layout } from "../core/types"
import { html, richText } from "../core/template"
import { topBar, handlePill, frameLabel, bgImage } from "./_shared"

export const problemaSolucao: Layout = {
  id: "problema-solucao",
  name: "Problema → Solução",
  description: "Arco clássico em 3 slides: dor, dados, proposta.",
  category: "narrativo",

  slides: [
    // ===== SLIDE 1: PROBLEMA =====
    {
      id: "problema",
      label: "problema",
      fields: [
        { id: "eyebrow", type: "text", label: "olho do título", default: "você sabia?" },
        {
          id: "headline",
          type: "richtext",
          label: "manchete (use {{palavra}} pra destaque laranja)",
          default: "milhões de pets {{esperam}} um lar no Brasil.",
        },
        {
          id: "subline",
          type: "textarea",
          label: "subtítulo",
          default:
            "ONGs sem visibilidade. Adotantes perdidos em redes sociais. Tutores sem guia confiável.",
        },
        {
          id: "image",
          type: "image",
          label: "foto do pet (círculo)",
          shape: "circle",
          optional: true,
          default: "",
        },
      ],
      render: (s, ctx) => html`
        ${html.raw(frameLabel(ctx, "problema"))}
        <div class="frame frame-ps-1">
          ${html.raw(topBar(ctx))}
          <div class="ps-pet ${s.image ? "has-image" : ""}" style="${html.raw(bgImage(s.image))}"></div>
          <div class="ps-middle">
            <p class="ps-eyebrow">${s.eyebrow}</p>
            <h2 class="ps-headline">${html.raw(richText(s.headline))}</h2>
            <p class="ps-subline">${s.subline}</p>
          </div>
          <div class="ps-bottom">
            ${html.raw(handlePill(ctx))}
            <span class="ps-swipe">arraste →</span>
          </div>
        </div>
      `,
    },

    // ===== SLIDE 2: DADOS =====
    {
      id: "dados",
      label: "dados",
      fields: [
        { id: "title", type: "text", label: "título", default: "o cenário hoje" },
        { id: "subtitle", type: "text", label: "subtítulo", default: "números que mostram a urgência" },
        { id: "stat1_num", type: "text", label: "dado 1 — número", default: "25%" },
        { id: "stat1_label", type: "text", label: "dado 1 — label", default: "abandono de cães" },
        { id: "stat1_detail", type: "text", label: "dado 1 — detalhe", default: "~20,2 milhões de cães abandonados" },
        { id: "stat2_num", type: "text", label: "dado 2 — número", default: "26%" },
        { id: "stat2_label", type: "text", label: "dado 2 — label", default: "abandono de gatos" },
        { id: "stat2_detail", type: "text", label: "dado 2 — detalhe", default: "~10 milhões de gatos abandonados" },
        { id: "stat3_num", type: "text", label: "dado 3 — número (positivo)", default: "73%" },
        { id: "stat3_label", type: "text", label: "dado 3 — label", default: "interesse por adoção" },
        { id: "stat3_detail", type: "text", label: "dado 3 — detalhe", default: "acima da média histórica no país" },
        { id: "source", type: "text", label: "fonte", default: "fonte: dados brasileiros de abandono pet" },
      ],
      render: (s, ctx) => html`
        ${html.raw(frameLabel(ctx, "dados"))}
        <div class="frame frame-ps-2">
          ${html.raw(topBar(ctx))}
          <h3 class="ps-title">${s.title}</h3>
          <p class="ps-subtitle">${s.subtitle}</p>
          <div class="ps-stats">
            <div class="ps-stat">
              <div class="num">${s.stat1_num}</div>
              <div class="info">
                <div class="label">${s.stat1_label}</div>
                <div class="detail">${s.stat1_detail}</div>
              </div>
            </div>
            <div class="ps-stat">
              <div class="num">${s.stat2_num}</div>
              <div class="info">
                <div class="label">${s.stat2_label}</div>
                <div class="detail">${s.stat2_detail}</div>
              </div>
            </div>
            <div class="ps-stat ps-stat--positive">
              <div class="num">${s.stat3_num}</div>
              <div class="info">
                <div class="label">${s.stat3_label}</div>
                <div class="detail">${s.stat3_detail}</div>
              </div>
            </div>
          </div>
          <p class="ps-source">${s.source}</p>
        </div>
      `,
    },

    // ===== SLIDE 3: SOLUÇÃO =====
    {
      id: "solucao",
      label: "solução",
      fields: [
        { id: "tag", type: "text", label: "tag", default: "a nossa proposta" },
        {
          id: "headline",
          type: "richtext",
          label: "manchete (use {{palavra}})",
          default: "o hub {{completo}} do ecossistema pet.",
        },
        { id: "feat1", type: "text", label: "feature 1", default: "adoção com busca inteligente" },
        { id: "feat2", type: "text", label: "feature 2", default: "visibilidade pra ONGs e protetores" },
        { id: "feat3", type: "text", label: "feature 3", default: "marketplace e serviços num só lugar" },
        { id: "cta", type: "text", label: "CTA (depois de 'siga e')", default: "faça parte" },
      ],
      render: (s, ctx) => html`
        ${html.raw(frameLabel(ctx, "solução"))}
        <div class="frame frame-ps-3">
          ${html.raw(topBar(ctx, { invertLogo: true }))}
          <div class="ps-middle ps-middle--dark">
            <span class="ps-tag">${s.tag}</span>
            <h2 class="ps-headline ps-headline--light">${html.raw(richText(s.headline))}</h2>
            <div class="ps-features">
              <div class="ps-feature"><span class="dot"></span><span>${s.feat1}</span></div>
              <div class="ps-feature"><span class="dot"></span><span>${s.feat2}</span></div>
              <div class="ps-feature"><span class="dot"></span><span>${s.feat3}</span></div>
            </div>
          </div>
          <div class="ps-bottom ps-bottom--dark">
            <span class="ps-cta">siga e <strong>${s.cta}</strong></span>
            ${html.raw(handlePill(ctx, { variant: "light" }))}
          </div>
        </div>
      `,
    },
  ],

  // CSS específico do layout (autorado em 1080×1350). Padrão de prefixo .ps- pra
  // não colidir com outros layouts.
  styles: `
    .frame-ps-1, .frame-ps-2, .frame-ps-3 {
      width: 1080px; height: 1350px;
      padding: 84px;
      display: flex; flex-direction: column;
      background: var(--bg);
      font-family: var(--font-body);
      position: relative;
      overflow: hidden;
    }
    .frame-ps-3 { background: var(--olive); color: var(--bg); }

    /* ===== SLIDE 1 ===== */
    .frame-ps-1 { justify-content: space-between; }
    .frame-ps-1 .top { display: flex; justify-content: space-between; align-items: center; }

    .ps-pet {
      position: absolute;
      right: -90px; bottom: 210px;
      width: 540px; height: 540px;
      border-radius: 50%;
      overflow: hidden;
      background-size: cover;
      background-position: center;
      z-index: 0;
    }
    .ps-pet:not(.has-image) {
      background: rgba(26,24,21,0.06);
    }

    .ps-middle { flex: 1; display: flex; flex-direction: column; justify-content: center; z-index: 1; padding: 60px 0; }
    .ps-eyebrow {
      font-family: var(--font-brand);
      font-weight: 500;
      font-size: 39px;
      color: var(--orange);
      margin-bottom: 36px;
    }
    .ps-headline {
      font-family: var(--font-brand);
      font-weight: 600;
      font-size: 90px;
      line-height: 1.1;
      color: var(--ink);
      letter-spacing: -0.01em;
      margin-bottom: 48px;
    }
    .ps-headline .accent { color: var(--orange); }
    .ps-subline {
      font-size: 39px;
      line-height: 1.5;
      color: var(--ink);
      opacity: 0.75;
      max-width: 840px;
    }
    .ps-bottom { display: flex; align-items: center; justify-content: space-between; z-index: 2; }
    .ps-swipe {
      font-family: var(--font-brand);
      font-size: 36px;
      color: var(--ink);
      opacity: 0.6;
      font-weight: 500;
    }

    /* ===== SLIDE 2 ===== */
    .frame-ps-2 { justify-content: flex-start; }
    .frame-ps-2 .top { display: flex; justify-content: space-between; align-items: center; }
    .ps-title {
      font-family: var(--font-brand);
      font-weight: 600;
      font-size: 66px;
      color: var(--ink);
      margin-top: 48px;
      margin-bottom: 12px;
    }
    .ps-subtitle {
      font-size: 33px;
      color: var(--ink);
      opacity: 0.6;
      margin-bottom: 54px;
    }
    .ps-stats { display: flex; flex-direction: column; gap: 36px; flex: 1; justify-content: center; }
    .ps-stat {
      display: flex; align-items: baseline; gap: 42px;
      padding-bottom: 30px;
      border-bottom: 3px solid rgba(26,24,21,0.12);
    }
    .ps-stat:last-of-type { border-bottom: none; }
    .ps-stat .num {
      font-family: var(--font-brand);
      font-weight: 700;
      font-size: 96px;
      line-height: 1;
      min-width: 210px;
      color: var(--red);
    }
    .ps-stat--positive .num { color: var(--olive); }
    .ps-stat .label {
      font-family: var(--font-brand);
      font-weight: 600;
      font-size: 42px;
      color: var(--ink);
      line-height: 1.1;
      margin-bottom: 6px;
    }
    .ps-stat .detail { font-size: 30px; color: var(--ink); opacity: 0.6; }
    .ps-source { font-size: 27px; color: var(--ink); opacity: 0.45; margin-top: 36px; font-style: italic; }

    /* ===== SLIDE 3 ===== */
    .frame-ps-3 { justify-content: space-between; }
    .frame-ps-3 .top { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2; }
    .frame-ps-3::before {
      content: '';
      position: absolute;
      top: -180px; right: -180px;
      width: 540px; height: 540px;
      background: var(--orange);
      border-radius: 50%;
    }
    .frame-ps-3::after {
      content: '';
      position: absolute;
      bottom: -150px; left: -150px;
      width: 420px; height: 420px;
      background: var(--bg);
      border-radius: 50%;
      opacity: 0.1;
    }
    .ps-middle--dark { z-index: 2; position: relative; }
    .ps-tag {
      display: inline-block; width: fit-content;
      padding: 15px 36px;
      background: var(--orange);
      color: var(--white);
      border-radius: 60px;
      font-family: var(--font-brand);
      font-weight: 500;
      font-size: 33px;
      margin-bottom: 42px;
    }
    .ps-headline--light { color: var(--bg); margin-bottom: 60px; font-size: 84px; }
    .ps-headline--light .accent { color: var(--orange); }
    .ps-features { display: flex; flex-direction: column; gap: 24px; }
    .ps-feature { display: flex; align-items: center; gap: 24px; font-size: 36px; color: var(--bg); }
    .ps-feature .dot { width: 18px; height: 18px; background: var(--orange); border-radius: 50%; flex-shrink: 0; }
    .ps-bottom--dark {
      z-index: 2;
      border-top: 3px solid rgba(218,218,184,0.2);
      padding-top: 42px;
    }
    .ps-cta { font-family: var(--font-brand); font-weight: 500; font-size: 36px; color: var(--bg); }
    .ps-cta strong { font-weight: 700; color: var(--orange); }
  `,
}
