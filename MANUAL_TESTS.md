# Testes manuais

Checklist pra rodar ao mexer no editor. Não há suíte automatizada — esse é o
contrato funcional do MVP.

## Setup

```bash
npm install
npm run dev   # http://localhost:5173
```

## Galeria

- [ ] Ao abrir `http://localhost:5173/` a galeria renderiza com **4 cards** (Problema→Solução, Apresentação, TEAM BUDDY, Dado em destaque).
- [ ] Cada card mostra um **thumbnail** com o 1º slide em mini-escala, o nome, contagem de slides e descrição.
- [ ] Click num card abre o editor daquele layout (URL passa a `#/editor/problema-solucao` etc.).
- [ ] Refresh na rota `#/editor/<id>` mantém a tela de edição.
- [ ] Acessar `#/editor/inexistente` mostra a tela "ops..." com botão de voltar.

## Editor — comum a todos os layouts

- [ ] Sidebar mostra: link "← galeria", nome do layout, sessão (export/import/reset), paleta da marca, handle, e uma seção por slide.
- [ ] Cada seção de slide tem 1 input por field declarado, no formato correto (text → input, textarea → multiline, richtext → textarea + dica, image → drop-zone, etc.).
- [ ] Click em "← galeria" volta pra galeria sem perder os dados (recarregar o layout depois deve restaurar os valores).
- [ ] Editar qualquer texto atualiza o preview ao vivo (sem refresh).
- [ ] Editar `richtext` com `{{palavra}}` renderiza `palavra` em laranja no preview.
- [ ] Mudar cor da paleta atualiza TODOS os slides ao mesmo tempo.
- [ ] Mudar handle atualiza o pill em todos os slides do layout.
- [ ] Click em "resetar layout" volta os fields ao default e mantém paleta/handle.
- [ ] Click em "restaurar paleta padrão" volta as 6 cores ao default da marca.

## Persistência

- [ ] Editar um campo, dar F5 — valor persiste.
- [ ] Editar layout A, voltar pra galeria, abrir layout B, voltar pro A — valores do A persistem (estado por-layout).
- [ ] Editar paleta no layout A, abrir layout B — paleta continua editada (compartilhada).

## Imagens

- [ ] Click na drop-zone abre o file picker; selecionar imagem aplica no preview.
- [ ] Arrastar imagem pra drop-zone tem o mesmo efeito.
- [ ] Imagem < 800×800 dispara alerta de qualidade.
- [ ] Botão "remover imagem" aparece após upload e funciona.

## Export

- [ ] Click em "baixar todos" baixa N PNGs (N = nº de slides do layout) em 1080×1350.
- [ ] Click em "baixar ZIP" baixa um único `.zip` com todos os PNGs nomeados como `mybuddy-${layoutId}-slide-N-${slideId}.png`.
- [ ] Click num botão de slide específico baixa só aquele PNG.
- [ ] Atalho `Ctrl+E` faz o mesmo que "baixar todos".
- [ ] Abrir o PNG exportado: o conteúdo deve estar nítido (sem borrão), sem sombras de preview, com 1080×1350px.

## Layouts específicos

### Problema → Solução (3 slides)
- [ ] Slide 1 tem campo de imagem circular (opcional).
- [ ] Slide 2 mostra 3 estatísticas; a 3ª (positiva) aparece em verde olive.
- [ ] Slide 3 tem fundo verde olive, CTA com `siga e <strong>X</strong>`.

### Apresentação institucional (3 slides)
- [ ] Slide 1 tem marca em DynaPuff gigante laranja.
- [ ] Slide 2 lista 3 públicos com emoji + label.
- [ ] Slide 3 tem manifesto com {{palavra}} destacada em laranja sobre fundo olive.

### Conheça a TEAM BUDDY (5 slides)
- [ ] 1ª capa, 4 slides de membro (Eder, Davi, Daniel, Julia).
- [ ] Cada membro tem foto circular com borda laranja, nome, função, fato pessoal.
- [ ] Sem foto: placeholder de câmera 📷 aparece.

### Dado em destaque (1 slide)
- [ ] Número gigante (~360px) em vermelho dado.
- [ ] Só esse layout tem 1 slide — botão "baixar ZIP" mostra "1 slide".

## Adicionando um 5º layout (teste do contrato plugável)

1. Crie `src/layouts/teste.ts` (copie problema-solucao.ts como base, mude o id e nome).
2. Adicione `import { teste } from "./teste"` em `src/layouts/index.ts`.
3. Adicione `teste,` no array `layouts`.
4. Reload da página.
- [ ] Galeria mostra o 5º card.
- [ ] Click abre o editor com sidebar gerada automaticamente.
- [ ] Export funciona sem código adicional.

> ✅ critério de sucesso da arquitetura: nenhum outro arquivo precisou ser tocado.

## Responsivo

- [ ] Largura < 768px: sidebar vira drawer; botão hambúrguer abre/fecha; preview scroll horizontal.
- [ ] Largura < 480px: frames escalam ainda menor; tudo continua legível.
