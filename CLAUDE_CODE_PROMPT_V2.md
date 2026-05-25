# MyBuddy Editor — Iteração 2: Stories + Fontes Customizáveis

## Contexto

Esse prompt assume que a **iteração 1** já foi implementada (sistema de layouts plugáveis com galeria, sidebar dinâmica, persistência, export PNG/ZIP). Se você ainda não fez aquela iteração, **pare e implemente ela primeiro** — esse documento estende aquela arquitetura.

Stack: **Vite + vanilla TypeScript strict**, sem framework, CSS escrito à mão, fonte via Google Fonts.

**Identidade visual (não muda):** sage `#DADAB8`, laranja `#E67E22`, oliva `#556B2F`, vermelho `#C84A2E`, ink `#1A1815`. Fonte padrão: **DynaPuff**.

---

## Feature 1: Layouts pra Stories (Instagram Stories)

### Comportamento

Stories são formato diferente de carrossel. Implicações:

- Dimensões: **1080×1920 (9:16)** — vertical alto
- Story pode ser **único frame** ou **sequência de 2-5 frames** (ex.: contagem regressiva, mini-tutorial em passos)
- Tem **safe zones**: o Instagram sobrepõe UI no topo (~250px do total de 1920) com perfil/timestamp e na base (~400px) com sticker/swipe/reactions. Conteúdo importante precisa ficar **na faixa central de aproximadamente y=250 até y=1520**.

### Mudanças na UI

**Galeria** — adiciona **abas no topo**:

```
[ 📱 Carrossel ]  [ 📲 Stories ]
```

Cada aba filtra a galeria por tipo. Layouts agora têm um campo `format: "carousel" | "story"` que decide em qual aba aparecem.

**Editor de Story:**
- Frames renderizados em 1080×1920 (escalados pra preview, ex.: 270×480 em tela)
- Toggle no canto do preview: **"mostrar safe zones"** (default: ligado). Quando ligado, overlay semi-transparente vermelho/escuro nas áreas que o Instagram cobre, com label "área de UI do Instagram". Quando desligado, vê o frame inteiro limpo.
- Suporte a múltiplos frames (2-5) — mesmo padrão de navegação dos slides de carrossel.

### Layouts iniciais de Story (entrega no MVP)

Cria **pelo menos 4 layouts** de Story, seguindo a identidade MyBuddy:

1. **"Story rápido"** (1 frame) — capa simples: logo, headline curta, CTA. Versão Story de um post anunciando algo.
2. **"Pet pra adoção"** (1 frame) — foto do pet em fullscreen, nome do pet, idade, ONG, swipe up pra adotar. Layout que ONGs parceiras vão amar.
3. **"Você sabia?"** (2 frames) — frame 1 com pergunta provocativa, frame 2 com resposta/dado. Engajamento puro.
4. **"Bastidores"** (3 frames) — capa "bastidores MyBuddy" + 2 frames de conteúdo (texto + foto). Pra mostrar o time trabalhando, código rodando, etc.

Se você (Claude Code) achar bom, adicione mais. Estilo visual: usa a mesma paleta da marca, mas sente livre pra explorar layouts mais ousados que carrossel — Story aceita mais experimentação.

### Tipos atualizados

Estende o tipo `Layout` de `core/types.ts`:

```typescript
export type LayoutFormat = "carousel" | "story";

export type Layout = {
  id: string;
  name: string;
  description: string;
  format: LayoutFormat;        // NOVO
  thumbnail?: string;
  category?: string;
  slides: Slide[];             // pra Story, chama "frames" no contexto, mas estrutura é igual
};
```

Sugestão: na renderização, detectar `layout.format === "story"` e:
- Renderizar containers 1080×1920 (escalados na tela)
- Aplicar safe zones overlay condicionalmente
- Ajustar preview pra usar layout vertical mais estreito (mostra menos frames lado a lado, pode usar carousel scroll horizontal)

### Export de Story

- PNG individual em **1080×1920** por frame
- ZIP com todos os frames se for sequência
- Nome do arquivo: `mybuddy-story-${layoutId}-frame-${N}.png`

---

## Feature 2: Customização de fontes (Nível 2 — Título + Corpo)

### Comportamento

Cada layout define dois "papéis tipográficos":
- **Heading** — usado em headlines, números grandes, nomes em destaque
- **Body** — usado em textos de apoio, labels, captions

O usuário pode trocar a fonte de cada papel independentemente, e o **peso** (Regular/Medium/SemiBold/Bold) pra cada um.

### UI na Sidebar

Nova seção **"🔤 Tipografia"** acima da seção de cores:

```
🔤 Tipografia

Heading
[ DynaPuff             ▼ ]   [ Bold      ▼ ]

Body
[ Inter                ▼ ]   [ Regular   ▼ ]

[ + adicionar fonte custom ]
[ ↺ resetar pro padrão do layout ]
```

### Lista curada (Google Fonts via CSS API)

12 fontes curadas, divididas por estilo. Cada fonte vem com 4 pesos disponíveis (400/500/600/700):

**Display / Rounded (combinam com a vibe MyBuddy):**
- DynaPuff (padrão do MyBuddy)
- Fredoka
- Baloo 2
- Quicksand

**Sans-serif modernas:**
- Inter
- Plus Jakarta Sans
- Manrope
- Outfit

**Serif editoriais (pra layouts mais sérios):**
- Fraunces
- Playfair Display

**Mono (pra layouts de "código/dev"):**
- JetBrains Mono
- Space Mono

### "Adicionar fonte custom"

Botão abre um modal/popup:

```
Adicionar fonte do Google Fonts

Nome da família:
[ ex: Poppins                              ]

Pesos disponíveis (separados por vírgula):
[ 400, 500, 600, 700                       ]

[ Cancelar ]              [ Adicionar ]
```

Ao confirmar:
1. Valida o nome (faz fetch em `https://fonts.googleapis.com/css2?family=${nome}` — se retornar 200, fonte existe)
2. Injeta o `<link>` no `<head>`
3. Adiciona a fonte à lista persistente (salva no localStorage em `mybuddy-editor:custom-fonts`)
4. Aparece imediatamente nos dropdowns

Se a validação falhar, mostra mensagem clara: "Fonte não encontrada no Google Fonts. Confira o nome e tente de novo."

### Tipos

```typescript
// core/types.ts (acréscimo)

export type FontWeight = 400 | 500 | 600 | 700;

export type FontRole = {
  family: string;       // ex: "DynaPuff"
  weight: FontWeight;
};

export type LayoutTypography = {
  heading: FontRole;
  body: FontRole;
};

// Cada Layout passa a ter um typography default:
export type Layout = {
  // ... campos anteriores
  defaultTypography: LayoutTypography;
};
```

### Como os layouts usam

Os templates de slide/frame referenciam CSS custom properties:

```css
/* tokens.css */
:root {
  --font-heading: 'DynaPuff', sans-serif;
  --font-heading-weight: 600;
  --font-body: 'Inter', sans-serif;
  --font-body-weight: 400;
}

.headline {
  font-family: var(--font-heading);
  font-weight: var(--font-heading-weight);
}

.subline {
  font-family: var(--font-body);
  font-weight: var(--font-body-weight);
}
```

Quando o usuário muda a fonte, o JS atualiza as custom properties no `:root`. Tudo se atualiza automaticamente.

### Persistência

- **Por layout**: cada layout salva sua tipografia customizada em `mybuddy-editor:${layoutId}:typography`
- **Custom fonts adicionadas**: lista global em `mybuddy-editor:custom-fonts`
- Botão "resetar pro padrão" volta pra `layout.defaultTypography`

### Carregamento de fontes

Não carregue as 12 fontes curadas todas de uma vez (pesa muito). Estratégia:

1. **No boot**: carrega só a fonte padrão do layout ativo
2. **Quando o usuário abre o dropdown**: faz preload das 12 fontes da lista (assim o preview no hover funciona)
3. **Custom fonts**: carrega imediatamente ao adicionar

Use a CSS API do Google Fonts:
```
https://fonts.googleapis.com/css2?family=DynaPuff:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap
```

---

## Critérios de aceite

1. Galeria mostra abas "Carrossel" / "Stories" no topo
2. Layouts de Story renderizam em 1080×1920, com toggle de safe zones funcional
3. Stories suportam sequências de 1-5 frames, com export PNG ou ZIP
4. 4 layouts de Story implementados e visualmente bonitos
5. Seção "Tipografia" na sidebar com seleção de família + peso pra heading e body
6. Lista curada de 12 fontes funciona, com loading lazy
7. "Adicionar fonte custom" valida o nome e injeta no Google Fonts CSS
8. Custom fonts persistem entre sessões
9. Tipografia salva por layout (mudar fonte num layout não afeta outro)
10. Botão "resetar pro padrão" volta cada layout pra sua tipografia inicial
11. README atualizado explicando: (a) como criar layout de Story, (b) como adicionar nova fonte curada no código

---

## Filosofia (mantida da iteração 1)

- **Experimental, sem overhead** — ferramenta interna, time pequeno
- **TypeScript strict**, types explícitos
- **Comenta o não-óbvio**, prefere clareza sobre cleverness
- **Discorda de mim se algo no prompt tá errado** — argumenta antes de implementar

---

## Não fazer

- ❌ Não adiciona browser completo de 1400+ fontes do Google (UX horrível, decisão tomada)
- ❌ Não adiciona ajuste de tamanho de fonte por slide (vai quebrar layouts, decisão tomada)
- ❌ Não adiciona React/Vue/Svelte
- ❌ Não usa Tailwind ou CSS framework
- ❌ Não tenta integrar com Instagram API
- ❌ Não cria pipeline de testes (testes manuais em `MANUAL_TESTS.md` bastam)

---

## Contexto

- **Time MyBuddy:** Eder Henrique (gerente/back), Davi Cassoli (back/infra — eu), Daniel Godinho (front/UX), Julia Cardoso (back)
- **Insta:** @mybuddy.pet (Business)
- **Editor é ferramenta interna**, não faz parte do produto principal (Spring Boot + Angular + Flutter)

Manda ver. 🐾
