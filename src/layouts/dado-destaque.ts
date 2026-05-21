// Layout "Dado em destaque": 1 slide único, número gigante + texto curto.
// Pensado pra estatística viral, sem swipe.

import type { Layout } from "../core/types"
import { html } from "../core/template"
import { topBar, handlePill, frameLabel } from "./_shared"

export const dadoDestaque: Layout = {
  id: "dado-destaque",
  name: "Dado em destaque",
  description: "1 slide único — número gigante + texto curto. Pronto pra viralizar.",
  category: "estatística",

  slides: [
    {
      id: "dado",
      label: "estatística",
      fields: [
        { id: "eyebrow", type: "text", label: "olho do título", default: "no Brasil," },
        { id: "number", type: "text", label: "número gigante", default: "73%" },
        {
          id: "statement",
          type: "textarea",
          label: "frase principal",
          default: "dos brasileiros querem adotar um pet — mas faltam pontes entre tutores e ONGs.",
        },
        { id: "source", type: "text", label: "fonte", default: "fonte: pesquisa nacional pet, 2024" },
        { id: "cta", type: "text", label: "CTA", default: "siga e ajude a mudar isso" },
      ],
      render: (s, ctx) => html`
        ${html.raw(frameLabel(ctx, "destaque"))}
        <div class="frame frame-dd">
          ${html.raw(topBar(ctx))}
          <div class="dd-body">
            <p class="dd-eyebrow">${s.eyebrow}</p>
            <div class="dd-number">${s.number}</div>
            <div class="dd-divider"></div>
            <p class="dd-statement">${s.statement}</p>
            <p class="dd-source">${s.source}</p>
          </div>
          <div class="dd-bottom">
            <span class="dd-cta">${s.cta}</span>
            ${html.raw(handlePill(ctx))}
          </div>
        </div>
      `,
    },
  ],

  styles: `
    .frame-dd {
      width: 1080px; height: 1350px;
      padding: 84px;
      display: flex; flex-direction: column;
      background: var(--bg);
      font-family: var(--font-body);
      position: relative;
      overflow: hidden;
      justify-content: space-between;
    }
    .frame-dd::before {
      content: '';
      position: absolute;
      top: -240px; right: -180px;
      width: 600px; height: 600px;
      background: var(--orange);
      border-radius: 50%;
      opacity: 0.18;
    }
    .frame-dd::after {
      content: '';
      position: absolute;
      bottom: -240px; left: -180px;
      width: 540px; height: 540px;
      background: var(--olive);
      border-radius: 50%;
      opacity: 0.12;
    }
    .frame-dd .top { display: flex; justify-content: space-between; align-items: center; z-index: 1; }

    .dd-body { flex: 1; display: flex; flex-direction: column; justify-content: center; z-index: 1; }
    .dd-eyebrow {
      font-family: var(--font-brand);
      font-size: 48px;
      color: var(--ink);
      opacity: 0.7;
      margin-bottom: 24px;
    }
    .dd-number {
      font-family: var(--font-brand);
      font-weight: 700;
      font-size: 360px;
      line-height: 0.95;
      color: var(--red);
      letter-spacing: -0.04em;
      margin-bottom: 36px;
    }
    .dd-divider {
      width: 120px;
      height: 12px;
      background: var(--orange);
      border-radius: 6px;
      margin-bottom: 48px;
    }
    .dd-statement {
      font-family: var(--font-brand);
      font-weight: 500;
      font-size: 54px;
      line-height: 1.25;
      color: var(--ink);
      max-width: 840px;
      margin-bottom: 36px;
    }
    .dd-source {
      font-size: 30px;
      color: var(--ink);
      opacity: 0.55;
      font-style: italic;
    }
    .dd-bottom {
      z-index: 1;
      display: flex; justify-content: space-between; align-items: center;
      border-top: 3px solid rgba(26,24,21,0.12);
      padding-top: 42px;
    }
    .dd-cta { font-family: var(--font-brand); font-size: 36px; color: var(--ink); opacity: 0.7; }
  `,
}
