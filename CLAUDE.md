# MyBuddy Carousel Editor — Próxima Iteração

## Contexto

Esse é um editor visual standalone (1 arquivo HTML/CSS/JS) que gera carrosséis para o Instagram do projeto **MyBuddy** (TCC: plataforma de adoção de pets, marketplace e ONGs). Ele renderiza 3 slides 1080×1350 com preview em tempo real e exporta cada um como PNG via `html2canvas`.

**Identidade visual oficial:**
- Fundo: `#DADAB8` (sage)
- Laranja: `#E67E22` (cor primária da marca)
- Verde escuro: `#556B2F` (cor de apoio)
- Vermelho dados: `#C84A2E`
- Preto suave: `#1A1815`
- Fonte: **DynaPuff** (Google Fonts) — define a personalidade da marca, arredondada e amigável

**Stack atual:** HTML/CSS/JS vanilla, single-file, sem build step. Fonte via Google Fonts CDN, html2canvas via CDN.

**Arquivo de entrada:** `mybuddy-editor.html` (na raiz do projeto)

---

## Filosofia do refactor

> **Experimental, sem overhead.** Pode usar libs e padrões modernos que melhorem o resultado, mas nada de configuração elaborada (sem webpack pesado, sem CI/CD, sem 15 dependências). Se introduzir build, que seja Vite (zero config). O dev ainda deve conseguir abrir o `dist/index.html` direto no navegador depois do `build`.

Sou **desenvolvedor Python/RPA virando AI Engineer**, sei JS mas não sou dev frontend de carreira. Quero código limpo, comentado em pontos não-óbvios, e que eu consiga entender e estender.

---

## Objetivos da iteração

### 1. Arquitetura (prioritário)

O arquivo atual tem ~1200 linhas num HTML só. Refatora pra algo sustentável:

- **Migra pra Vite + vanilla TypeScript** (sem React, sem framework — não é necessário pra essa escala)
- Estrutura sugerida (ajuste se tiver melhor ideia):
  ```
  src/
    main.ts                 # entrada
    state.ts                # store de estado (texto, cores, imagens)
    slides/
      Slide1.ts             # render do slide 1
      Slide2.ts             # render do slide 2
      Slide3.ts             # render do slide 3
    editor/
      ColorPicker.ts
      TextField.ts
      ImageUploader.ts
    export/
      PngExporter.ts        # encapsula html2canvas
    styles/
      tokens.css            # design tokens (cores, fontes, espaçamentos)
      slides.css            # estilos dos slides
      editor.css            # estilos da sidebar
  index.html
  vite.config.ts
  package.json
  ```
- **Sem framework**, mas pode usar uma store simples (objeto observável com pub/sub, tipo 20 linhas de código). Quero entender a reatividade, não esconder ela.
- Mantém o conceito de **CSS Custom Properties** pra cores (já uso isso e gosto).

### 2. Funcionalidades novas (pegue 2-3, as que você achar mais úteis)

Escolhe o que faz mais sentido pra um TCC com ambição de produto real:

- **Persistência localStorage** — salva o estado da edição (textos, cores, imagens) e restaura ao reabrir. Botão "resetar pro padrão".
- **Importar/exportar config JSON** — exporta o estado atual como `.json` pra compartilhar com o time (Eder, Daniel, Julia) e reimportar depois.
- **Preset de templates** — dropdown com 3-4 variações pré-prontas além do "Problema → Dados → Solução" atual (ex.: "Apresentação institucional", "Campanha de adoção", "Bastidores do dev").
- **Drag & drop de imagem** — arrastar direto pro slide ao invés de só clicar no input.
- **Crop/posicionamento de imagem** — ajuste fino da posição da foto dentro do círculo do slide 1 (drag pra mover, scroll pra zoom).
- **Modo escuro/claro do editor** (não dos slides) — preferência salva no localStorage.
- **Geração de carrossel completo como ZIP** — JSZip pra empacotar os 3 PNGs num arquivo só.
- **Preview no formato real do Instagram** — toggle pra ver os 3 slides como apareceriam no feed (com header de username, like, etc.) ao invés de side-by-side.
- **Slides extras opcionais** — botão "adicionar slide" pra ir além dos 3 fixos (até no máximo 10, que é o limite do Instagram). Cada slide novo pode escolher um dos 3 layouts.

### 3. Polimento técnico

- **TypeScript strict mode** — types explícitos pro estado.
- **Animações sutis** — micro-interações no editor (não nos slides) ao mudar valores.
- **Acessibilidade básica** — labels semânticos, focus states, atalhos de teclado (ex.: `Ctrl+E` exporta todos).
- **Validação de export** — alerta amigável se a imagem do upload for muito pequena (< 800px), porque borra na exportação.
- **html2canvas fallback** — se falhar (acontece com algumas imagens base64 grandes), usa `html-to-image` como alternativa ou mostra erro claro.

### 4. Não fazer

- ❌ Não adiciona backend/Node server. É puramente client-side.
- ❌ Não usa Tailwind / Bootstrap / nenhum CSS framework. CSS escrito à mão é parte da identidade do projeto.
- ❌ Não adiciona auth, login, banco de dados.
- ❌ Não usa React/Vue/Svelte. Vanilla TS é proposital.
- ❌ Não cria pipeline de testes elaborado. Pode adicionar uns testes manuais (`/* @manual-test */` em comentários) descrevendo o que conferir.
- ❌ Não adiciona dependências de fonte custom (DynaPuff via Google Fonts já tá certo).

---

## Critérios de aceite

1. `npm install && npm run dev` sobe o editor com hot reload
2. `npm run build` gera `dist/` com HTML/CSS/JS minificados, abrível direto no browser sem servidor
3. Todas as funcionalidades do editor atual continuam funcionando (textos, cores, imagens, export PNG dos 3 slides em 1080×1350 sem sombras)
4. Pelo menos 2 das funcionalidades novas listadas em #2 implementadas
5. Código TypeScript com types explícitos pro estado e props dos componentes/módulos
6. README curto (~50 linhas) explicando estrutura e como contribuir

---

## Notas finais

- Pode quebrar a API atual livremente — não tem usuários ainda além do nosso time.
- Se achar que alguma decisão minha tá errada, **discorda e argumenta**. Prefere honestidade técnica a concordância.
- Se algo da identidade visual (cores, posições, tamanhos) puder ficar melhor, sugere. Mas mantém DynaPuff e a paleta sage/laranja/oliva.
- O contexto maior do projeto MyBuddy: Spring Boot 3 + Angular + Flutter + Keycloak 26 + Docker + PostgreSQL. Time: Eder Henrique (gerente), Davi Cassoli (back-end/infra, eu), Daniel Godinho (front-end/UX), Julia Cardoso (back-end).
- Esse editor é uma **ferramenta interna** pra gerar conteúdo de divulgação rápido pro Instagram do MyBuddy. Não faz parte do produto principal.

Boa, manda ver. 🐾