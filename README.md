# MyBuddy — Editor de Carrossel

Ferramenta interna para gerar carrosséis de Instagram do projeto MyBuddy (TCC). Gera 3 slides 1080×1350px e exporta como PNG.

## Requisitos

- Node.js 18+
- npm 9+

## Comandos

```bash
npm install        # instala dependências
npm run dev        # sobe com hot reload em http://localhost:5173
npm run build      # gera dist/ (abrível direto no browser sem servidor)
npm run preview    # preview do build de produção
```

## Estrutura

```
src/
  main.ts                  # entrada — orquestra os módulos
  state.ts                 # store pub/sub (textos, cores, imagens) + localStorage
  editor/
    bindings.ts            # liga inputs da sidebar ao estado e ao DOM dos slides
    ColorPicker.ts         # pickers de cor com CSS custom properties
    ImageUploader.ts       # upload e drag & drop de imagens
  export/
    PngExporter.ts         # html2canvas + JSZip para exportar slides
  styles/
    tokens.css             # design tokens (cores, fontes)
    slides.css             # estilos dos 3 slides (preview + exportação)
    editor.css             # estilos da sidebar e controles
index.html                 # estrutura HTML dos slides e controles
```

## Funcionalidades

- **Preview ao vivo** — edite na sidebar, veja o resultado instantâneo
- **Persistência automática** — estado salvo no localStorage, restaurado ao reabrir
- **Export/import JSON** — compartilhe a config com o time (Eder, Daniel, Julia)
- **Reset para padrões** — volta os textos e cores originais (imagens mantidas)
- **Drag & drop de imagens** — arraste direto para as zonas de imagem
- **Validação de resolução** — alerta se a imagem for menor que 800px
- **Exportar PNG** (1080×1350) — individualmente ou todos de uma vez
- **Exportar ZIP** — os 3 slides em um arquivo só via JSZip
- **Atalho Ctrl+E** — exporta os 3 slides sem tirar a mão do teclado

## Contribuindo

1. Clone / baixe o repositório
2. `npm install && npm run dev`
3. Edite em `src/` — hot reload atualiza automaticamente
4. Antes de abrir PR: `npm run build` deve rodar sem erros de TypeScript
