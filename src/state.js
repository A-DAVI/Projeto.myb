// Store central de estado. Pub/sub simples: qualquer módulo pode ouvir mudanças.
export const DEFAULT_STATE = {
    colors: { bg: '#DADAB8', orange: '#E67E22', olive: '#556B2F', ink: '#1A1815', red: '#C84A2E', white: '#FFFFFF' },
    handle: '@mybuddy.pet',
    images: { 1: null, 2: null, 3: null },
    f1: {
        eyebrow: 'você sabia?',
        headlineText: 'milhões de pets ',
        headlineAccent: 'esperam',
        headlineEnd: ' um lar no Brasil.',
        subline: 'ONGs sem visibilidade. Adotantes perdidos em redes sociais. Tutores sem guia confiável.',
    },
    f2: {
        title: 'o cenário hoje',
        subtitle: 'números que mostram a urgência',
        source: 'fonte: dados brasileiros de abandono pet',
        stats: [
            { num: '25%', label: 'abandono de cães', detail: '~20,2 milhões de cães abandonados' },
            { num: '26%', label: 'abandono de gatos', detail: '~10 milhões de gatos abandonados' },
            { num: '73%', label: 'interesse por adoção', detail: 'acima da média histórica no país' },
        ],
    },
    f3: {
        tag: 'a nossa proposta',
        headlineText: 'o hub ',
        headlineAccent: 'completo',
        headlineEnd: ' do ecossistema pet.',
        feats: ['adoção com busca inteligente', 'visibilidade pra ONGs e protetores', 'marketplace e serviços num só lugar'],
        cta: 'faça parte',
    },
};
const STORAGE_KEY = 'mybuddy-editor-state';
class Store {
    constructor() {
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.state = this.load();
    }
    get() {
        // retorna cópia rasa para evitar mutação acidental
        return this.state;
    }
    // atualiza um pedaço do estado e notifica listeners
    set(patch) {
        this.state = deepMerge(this.state, patch);
        this.save();
        this.notify();
    }
    subscribe(fn) {
        this.listeners.push(fn);
        return () => { this.listeners = this.listeners.filter(l => l !== fn); };
    }
    reset() {
        // deep clone do default pra não ter referências compartilhadas
        this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        this.save();
        this.notify();
    }
    toJSON() {
        // não exporta imagens (podem ser multi-MB) — exporta só textos e cores
        const { images: _images, ...rest } = this.state;
        return JSON.stringify(rest, null, 2);
    }
    fromJSON(json) {
        const parsed = JSON.parse(json);
        // mantém imagens atuais, aplica o resto
        this.state = deepMerge(this.state, parsed);
        this.save();
        this.notify();
    }
    notify() {
        this.listeners.forEach(fn => fn(this.state));
    }
    save() {
        try {
            // imagens podem ser grandes, salva só se couber
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        }
        catch {
            // QuotaExceededError: ignora silenciosamente (imagens base64 são pesadas)
            const { images: _images, ...rest } = this.state;
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...rest, images: { 1: null, 2: null, 3: null } }));
        }
    }
    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw)
                return JSON.parse(JSON.stringify(DEFAULT_STATE));
            return deepMerge(JSON.parse(JSON.stringify(DEFAULT_STATE)), JSON.parse(raw));
        }
        catch {
            return JSON.parse(JSON.stringify(DEFAULT_STATE));
        }
    }
}
function deepMerge(base, patch) {
    if (typeof patch !== 'object' || patch === null || Array.isArray(patch))
        return patch ?? base;
    const result = { ...base };
    for (const key of Object.keys(patch)) {
        result[key] = deepMerge(result[key], patch[key]);
    }
    return result;
}
export const store = new Store();
