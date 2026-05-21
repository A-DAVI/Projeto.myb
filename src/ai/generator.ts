// Integração com a API da Anthropic (claude-haiku — rápido e barato pra geração de texto).
// A chave fica no localStorage do usuário — nunca vai pra nenhum servidor nosso.
// A API da Anthropic aceita chamadas diretas do browser com o header abaixo.

import { EditorState, Slide2Layout } from '../state'

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5-20251001'
const KEY_STORAGE = 'mybuddy-anthropic-key'

export function saveApiKey(key: string): void {
  localStorage.setItem(KEY_STORAGE, key)
}

export function loadApiKey(): string {
  return localStorage.getItem(KEY_STORAGE) ?? ''
}

export function clearApiKey(): void {
  localStorage.removeItem(KEY_STORAGE)
}

// ===== CHAMADA BASE =====

async function callClaude(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      // permite chamadas diretas do browser — implica que o dev conhece o risco
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`
    throw new Error(msg)
  }

  const data = await res.json() as { content: Array<{ text: string }> }
  return data.content[0].text
}

// ===== EXTRAÇÃO DE JSON =====
// Claude às vezes envolve o JSON em ```json ... ``` — limpa isso.

function extractJSON(raw: string): unknown {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  const clean = match ? match[1] : raw
  return JSON.parse(clean.trim())
}

// ===== PROMPTS =====

const SYSTEM_CONTEXT = `
Você é um copywriter especializado em redes sociais para o MyBuddy, plataforma brasileira de adoção de pets, marketplace e apoio a ONGs.
Escreva sempre em português brasileiro, tom amigável e urgente. Seja conciso — os textos vão em slides de Instagram.
Retorne SOMENTE JSON válido, sem explicação nem markdown extra.
`.trim()

// --- Gerar carrossel completo ---

export interface FullCarouselPayload {
  f1: { eyebrow: string; headlineText: string; headlineAccent: string; headlineEnd: string; subline: string }
  f2: {
    title: string; subtitle: string; source: string
    stats: [
      { num: string; label: string; detail: string },
      { num: string; label: string; detail: string },
      { num: string; label: string; detail: string },
    ]
    cards: [
      { emoji: string; num: string; label: string },
      { emoji: string; num: string; label: string },
      { emoji: string; num: string; label: string },
    ]
    quote: { highlight: string; text: string; author: string }
  }
  f3: { tag: string; headlineText: string; headlineAccent: string; headlineEnd: string; feats: [string, string, string]; cta: string }
}

export async function generateFullCarousel(apiKey: string, topic: string): Promise<FullCarouselPayload> {
  const prompt = `
${SYSTEM_CONTEXT}

Tema do carrossel: "${topic}"

Gere conteúdo para um carrossel de 3 slides (Problema → Dados → Solução) para o Instagram do MyBuddy.

Retorne este JSON exato (preencha todos os campos, sem campos extras):
{
  "f1": {
    "eyebrow": "gancho curto tipo 'você sabia?'",
    "headlineText": "início da headline principal ",
    "headlineAccent": "palavra de destaque em laranja",
    "headlineEnd": " final da headline",
    "subline": "subtítulo de 1-2 frases explicando o problema"
  },
  "f2": {
    "title": "título do slide de dados",
    "subtitle": "subtítulo curto",
    "source": "fonte: ...",
    "stats": [
      { "num": "XX%", "label": "rótulo curto", "detail": "detalhe explicativo" },
      { "num": "XX%", "label": "rótulo curto", "detail": "detalhe explicativo" },
      { "num": "XX%", "label": "rótulo positivo", "detail": "detalhe explicativo" }
    ],
    "cards": [
      { "emoji": "🐕", "num": "XX%", "label": "rótulo curto" },
      { "emoji": "🐈", "num": "XX%", "label": "rótulo curto" },
      { "emoji": "💚", "num": "XX%", "label": "rótulo positivo" }
    ],
    "quote": {
      "highlight": "número ou palavra de impacto grande (ex: 30M)",
      "text": "frase de impacto de 1 linha sobre o problema",
      "author": "— fonte, ano"
    }
  },
  "f3": {
    "tag": "tag curta tipo 'a nossa proposta'",
    "headlineText": "início da headline solução ",
    "headlineAccent": "palavra destaque",
    "headlineEnd": " final da headline",
    "feats": ["feature 1 curta", "feature 2 curta", "feature 3 curta"],
    "cta": "chamada pra ação (sem 'siga e')"
  }
}
`.trim()

  const raw = await callClaude(apiKey, prompt)
  return extractJSON(raw) as FullCarouselPayload
}

// --- Gerar apenas slide 1 ---

export async function generateSlide1(apiKey: string, topic: string, current: EditorState['f1']) {
  const prompt = `
${SYSTEM_CONTEXT}

Tema: "${topic}"
Contexto atual do slide: ${JSON.stringify(current)}

Gere novo conteúdo para o slide 1 (Problema) mantendo estrutura similar mas com texto fresco.

Retorne JSON:
{
  "eyebrow": "...",
  "headlineText": "início ",
  "headlineAccent": "destaque",
  "headlineEnd": " final",
  "subline": "subtítulo de 1-2 frases"
}
`.trim()

  const raw = await callClaude(apiKey, prompt)
  return extractJSON(raw) as EditorState['f1']
}

// --- Gerar apenas slide 2 ---

export async function generateSlide2(apiKey: string, topic: string, layout: Slide2Layout, current: EditorState['f2']) {
  const prompt = `
${SYSTEM_CONTEXT}

Tema: "${topic}"
Layout ativo: "${layout}"
Contexto atual: ${JSON.stringify({ title: current.title, subtitle: current.subtitle })}

Gere dados para o slide 2 (Dados/Estatísticas) no layout "${layout}".

Retorne JSON com TODOS estes campos (mesmo que o layout atual use só alguns):
{
  "title": "...",
  "subtitle": "...",
  "source": "fonte: ...",
  "stats": [
    { "num": "XX%", "label": "rótulo", "detail": "detalhe" },
    { "num": "XX%", "label": "rótulo", "detail": "detalhe" },
    { "num": "XX%", "label": "rótulo positivo", "detail": "detalhe" }
  ],
  "cards": [
    { "emoji": "🐾", "num": "XX%", "label": "rótulo" },
    { "emoji": "🐾", "num": "XX%", "label": "rótulo" },
    { "emoji": "💚", "num": "XX%", "label": "rótulo" }
  ],
  "quote": {
    "highlight": "número grande",
    "text": "frase de impacto",
    "author": "— fonte, ano"
  }
}
`.trim()

  const raw = await callClaude(apiKey, prompt)
  return extractJSON(raw) as Partial<EditorState['f2']>
}

// --- Gerar apenas slide 3 ---

export async function generateSlide3(apiKey: string, topic: string, current: EditorState['f3']) {
  const prompt = `
${SYSTEM_CONTEXT}

Tema: "${topic}"
Contexto atual: ${JSON.stringify(current)}

Gere novo conteúdo para o slide 3 (Solução/CTA).

Retorne JSON:
{
  "tag": "tag curta",
  "headlineText": "início ",
  "headlineAccent": "destaque",
  "headlineEnd": " final",
  "feats": ["feature 1", "feature 2", "feature 3"],
  "cta": "chamada pra ação (sem 'siga e')"
}
`.trim()

  const raw = await callClaude(apiKey, prompt)
  return extractJSON(raw) as EditorState['f3']
}
