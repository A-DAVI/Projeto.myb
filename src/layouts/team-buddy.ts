// Layout "Conheça a TEAM BUDDY": 5 slides — capa + 4 membros.
// Cada membro tem foto, nome, função e fato pessoal.

import type { Layout, Slide } from "../core/types"
import { html } from "../core/template"
import { topBar, handlePill, frameLabel, bgImage } from "./_shared"

function memberSlide(opts: {
  id: string
  label: string
  defaults: { name: string; role: string; fact: string }
}): Slide {
  return {
    id: opts.id,
    label: opts.label,
    fields: [
      { id: "photo", type: "image", label: "foto", shape: "circle", optional: true, default: "" },
      { id: "name", type: "text", label: "nome", default: opts.defaults.name },
      { id: "role", type: "text", label: "função", default: opts.defaults.role },
      { id: "fact", type: "textarea", label: "fato pessoal", default: opts.defaults.fact },
    ],
    render: (s, ctx) => html`
      ${html.raw(frameLabel(ctx, opts.label))}
      <div class="frame frame-team-member">
        ${html.raw(topBar(ctx))}
        <div class="tb-member">
          <div class="tb-photo ${s.photo ? "has-image" : ""}" style="${html.raw(bgImage(s.photo))}">
            ${s.photo ? "" : html.raw('<span class="tb-photo-fallback">📷</span>')}
          </div>
          <div class="tb-meta">
            <h2 class="tb-name">${s.name}</h2>
            <p class="tb-role">${s.role}</p>
          </div>
        </div>
        <p class="tb-fact">"${s.fact}"</p>
        <div class="tb-bottom">${html.raw(handlePill(ctx))}</div>
      </div>
    `,
  }
}

export const teamBuddy: Layout = {
  id: "team-buddy",
  name: "Conheça a TEAM BUDDY",
  description: "5 slides: capa + 4 membros do time MyBuddy.",
  category: "institucional",

  slides: [
    // capa
    {
      id: "capa",
      label: "capa",
      fields: [
        { id: "eyebrow", type: "text", label: "olho", default: "conheça a" },
        { id: "title", type: "text", label: "título", default: "TEAM BUDDY" },
        { id: "subtitle", type: "text", label: "subtítulo", default: "as pessoas por trás da plataforma" },
      ],
      render: (s, ctx) => html`
        ${html.raw(frameLabel(ctx, "capa"))}
        <div class="frame frame-team-cover">
          ${html.raw(topBar(ctx))}
          <div class="tb-cover">
            <p class="tb-cover-eyebrow">${s.eyebrow}</p>
            <h1 class="tb-cover-title">${s.title}</h1>
            <p class="tb-cover-subtitle">${s.subtitle}</p>
          </div>
          <div class="tb-bottom tb-bottom--cover">
            ${html.raw(handlePill(ctx))}
            <span class="tb-swipe">arraste →</span>
          </div>
        </div>
      `,
    },

    memberSlide({
      id: "eder",
      label: "eder",
      defaults: {
        name: "Eder Henrique",
        role: "gerente · back-end",
        fact: "lidera a engenharia e mantém o time alinhado.",
      },
    }),

    memberSlide({
      id: "davi",
      label: "davi",
      defaults: {
        name: "Davi Cassoli",
        role: "back-end · infra",
        fact: "automatiza tudo que pode ser automatizado.",
      },
    }),

    memberSlide({
      id: "daniel",
      label: "daniel",
      defaults: {
        name: "Daniel Godinho",
        role: "front-end · UX",
        fact: "transforma fluxos confusos em telas claras.",
      },
    }),

    memberSlide({
      id: "julia",
      label: "julia",
      defaults: {
        name: "Julia Cardoso",
        role: "back-end",
        fact: "construindo as APIs que sustentam a plataforma.",
      },
    }),
  ],

  styles: `
    .frame-team-cover, .frame-team-member {
      width: 1080px; height: 1350px;
      padding: 84px;
      display: flex; flex-direction: column;
      background: var(--bg);
      font-family: var(--font-body);
      position: relative;
      overflow: hidden;
    }
    .frame-team-cover .top, .frame-team-member .top { display: flex; justify-content: space-between; align-items: center; }

    /* capa */
    .frame-team-cover { justify-content: space-between; }
    .frame-team-cover::before {
      content: '';
      position: absolute;
      top: -180px; right: -180px;
      width: 540px; height: 540px;
      background: var(--orange);
      border-radius: 50%;
      opacity: 0.25;
    }
    .tb-cover { flex: 1; display: flex; flex-direction: column; justify-content: center; z-index: 1; }
    .tb-cover-eyebrow {
      font-family: var(--font-brand);
      font-size: 42px;
      color: var(--ink);
      opacity: 0.7;
      margin-bottom: 18px;
    }
    .tb-cover-title {
      font-family: var(--font-brand);
      font-weight: 700;
      font-size: 180px;
      color: var(--orange);
      letter-spacing: -0.02em;
      line-height: 1;
      margin-bottom: 36px;
    }
    .tb-cover-subtitle {
      font-family: var(--font-brand);
      font-size: 42px;
      color: var(--ink);
      opacity: 0.8;
    }
    .tb-bottom { z-index: 1; }
    .tb-bottom--cover { display: flex; justify-content: space-between; align-items: center; }
    .tb-swipe { font-family: var(--font-brand); font-size: 36px; color: var(--ink); opacity: 0.6; }

    /* membro */
    .frame-team-member { justify-content: space-between; }
    .tb-member { display: flex; flex-direction: column; align-items: center; margin-top: 36px; z-index: 1; }
    .tb-photo {
      width: 540px; height: 540px;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      background-color: rgba(26,24,21,0.08);
      display: flex; align-items: center; justify-content: center;
      border: 12px solid var(--orange);
      margin-bottom: 48px;
    }
    .tb-photo.has-image .tb-photo-fallback { display: none; }
    .tb-photo-fallback { font-size: 120px; opacity: 0.4; }
    .tb-meta { text-align: center; }
    .tb-name {
      font-family: var(--font-brand);
      font-weight: 700;
      font-size: 84px;
      color: var(--ink);
      line-height: 1.1;
      margin-bottom: 12px;
    }
    .tb-role {
      font-family: var(--font-brand);
      font-size: 36px;
      color: var(--orange);
    }
    .tb-fact {
      font-size: 36px;
      line-height: 1.4;
      color: var(--ink);
      opacity: 0.75;
      font-style: italic;
      text-align: center;
      max-width: 840px;
      align-self: center;
      margin: 36px 0;
    }
  `,
}
