// Liga cada input da sidebar ao estado e ao DOM dos slides simultaneamente.
import { store } from '../state';
// Mapeamento: [inputId, campo no estado, render fn]
// Em vez de repetir id → state → render em cada módulo, centralizamos aqui.
export function initTextBindings() {
    const textMap = [
        {
            inputId: 'handle',
            setFn: v => store.set({ handle: v }),
            renderIds: [], // handle usa classe, tratado em applyToDOM
        },
        { inputId: 'f1-eyebrow', setFn: v => store.set({ f1: { eyebrow: v } }), renderIds: ['render-f1-eyebrow'] },
        { inputId: 'f1-headline-text', setFn: v => store.set({ f1: { headlineText: v } }), renderIds: ['render-f1-headline-text'] },
        { inputId: 'f1-headline-accent', setFn: v => store.set({ f1: { headlineAccent: v } }), renderIds: ['render-f1-headline-accent'] },
        { inputId: 'f1-headline-end', setFn: v => store.set({ f1: { headlineEnd: v } }), renderIds: ['render-f1-headline-end'] },
        { inputId: 'f1-subline', setFn: v => store.set({ f1: { subline: v } }), renderIds: ['render-f1-subline'] },
        { inputId: 'f2-title', setFn: v => store.set({ f2: { title: v } }), renderIds: ['render-f2-title'] },
        { inputId: 'f2-subtitle', setFn: v => store.set({ f2: { subtitle: v } }), renderIds: ['render-f2-subtitle'] },
        { inputId: 'f2-source', setFn: v => store.set({ f2: { source: v } }), renderIds: ['render-f2-source'] },
        { inputId: 'f2-num1', setFn: v => store.set({ f2: { stats: [{ num: v }, store.get().f2.stats[1], store.get().f2.stats[2]] } }), renderIds: ['render-f2-num1'] },
        { inputId: 'f2-label1', setFn: v => store.set({ f2: { stats: [{ label: v }, store.get().f2.stats[1], store.get().f2.stats[2]] } }), renderIds: ['render-f2-label1'] },
        { inputId: 'f2-detail1', setFn: v => store.set({ f2: { stats: [{ detail: v }, store.get().f2.stats[1], store.get().f2.stats[2]] } }), renderIds: ['render-f2-detail1'] },
        { inputId: 'f2-num2', setFn: v => store.set({ f2: { stats: [store.get().f2.stats[0], { num: v }, store.get().f2.stats[2]] } }), renderIds: ['render-f2-num2'] },
        { inputId: 'f2-label2', setFn: v => store.set({ f2: { stats: [store.get().f2.stats[0], { label: v }, store.get().f2.stats[2]] } }), renderIds: ['render-f2-label2'] },
        { inputId: 'f2-detail2', setFn: v => store.set({ f2: { stats: [store.get().f2.stats[0], { detail: v }, store.get().f2.stats[2]] } }), renderIds: ['render-f2-detail2'] },
        { inputId: 'f2-num3', setFn: v => store.set({ f2: { stats: [store.get().f2.stats[0], store.get().f2.stats[1], { num: v }] } }), renderIds: ['render-f2-num3'] },
        { inputId: 'f2-label3', setFn: v => store.set({ f2: { stats: [store.get().f2.stats[0], store.get().f2.stats[1], { label: v }] } }), renderIds: ['render-f2-label3'] },
        { inputId: 'f2-detail3', setFn: v => store.set({ f2: { stats: [store.get().f2.stats[0], store.get().f2.stats[1], { detail: v }] } }), renderIds: ['render-f2-detail3'] },
        { inputId: 'f3-tag', setFn: v => store.set({ f3: { tag: v } }), renderIds: ['render-f3-tag'] },
        { inputId: 'f3-headline-text', setFn: v => store.set({ f3: { headlineText: v } }), renderIds: ['render-f3-headline-text'] },
        { inputId: 'f3-headline-accent', setFn: v => store.set({ f3: { headlineAccent: v } }), renderIds: ['render-f3-headline-accent'] },
        { inputId: 'f3-headline-end', setFn: v => store.set({ f3: { headlineEnd: v } }), renderIds: ['render-f3-headline-end'] },
        { inputId: 'f3-feat1', setFn: v => store.set({ f3: { feats: [v, store.get().f3.feats[1], store.get().f3.feats[2]] } }), renderIds: ['render-f3-feat1'] },
        { inputId: 'f3-feat2', setFn: v => store.set({ f3: { feats: [store.get().f3.feats[0], v, store.get().f3.feats[2]] } }), renderIds: ['render-f3-feat2'] },
        { inputId: 'f3-feat3', setFn: v => store.set({ f3: { feats: [store.get().f3.feats[0], store.get().f3.feats[1], v] } }), renderIds: ['render-f3-feat3'] },
        { inputId: 'f3-cta', setFn: v => store.set({ f3: { cta: v } }), renderIds: [] }, // render especial
    ];
    textMap.forEach(({ inputId, setFn, renderIds }) => {
        const input = document.getElementById(inputId);
        if (!input)
            return;
        input.addEventListener('input', () => {
            setFn(input.value);
            renderIds.forEach(id => {
                const el = document.getElementById(id);
                if (el)
                    el.textContent = input.value;
            });
            // casos especiais
            if (inputId === 'handle')
                applyHandle(input.value);
            if (inputId === 'f3-cta')
                applyCTA(input.value);
        });
    });
}
export function applyHandle(value) {
    document.querySelectorAll('.render-handle').forEach(el => { el.textContent = value; });
}
export function applyCTA(value) {
    const el = document.getElementById('render-f3-cta');
    if (!el)
        return;
    // "siga e <strong>X</strong>" — se o usuário digitar só "X" ou a frase completa
    const clean = value.replace(/^siga e /i, '');
    el.innerHTML = `siga e <strong>${clean}</strong>`;
}
// Preenche todos os inputs da sidebar com os valores do estado (chamado na inicialização e no reset)
export function syncInputsToState(state) {
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el)
            el.value = val;
    };
    set('handle', state.handle);
    set('f1-eyebrow', state.f1.eyebrow);
    set('f1-headline-text', state.f1.headlineText);
    set('f1-headline-accent', state.f1.headlineAccent);
    set('f1-headline-end', state.f1.headlineEnd);
    set('f1-subline', state.f1.subline);
    set('f2-title', state.f2.title);
    set('f2-subtitle', state.f2.subtitle);
    set('f2-source', state.f2.source);
    set('f2-num1', state.f2.stats[0].num);
    set('f2-label1', state.f2.stats[0].label);
    set('f2-detail1', state.f2.stats[0].detail);
    set('f2-num2', state.f2.stats[1].num);
    set('f2-label2', state.f2.stats[1].label);
    set('f2-detail2', state.f2.stats[1].detail);
    set('f2-num3', state.f2.stats[2].num);
    set('f2-label3', state.f2.stats[2].label);
    set('f2-detail3', state.f2.stats[2].detail);
    set('f3-tag', state.f3.tag);
    set('f3-headline-text', state.f3.headlineText);
    set('f3-headline-accent', state.f3.headlineAccent);
    set('f3-headline-end', state.f3.headlineEnd);
    set('f3-feat1', state.f3.feats[0]);
    set('f3-feat2', state.f3.feats[1]);
    set('f3-feat3', state.f3.feats[2]);
    set('f3-cta', state.f3.cta);
}
