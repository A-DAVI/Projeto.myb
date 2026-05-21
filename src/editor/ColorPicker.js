import { store } from '../state';
export function initColorPickers() {
    const map = [
        { inputId: 'color-bg', cssVar: '--bg', key: 'bg' },
        { inputId: 'color-orange', cssVar: '--orange', key: 'orange' },
        { inputId: 'color-olive', cssVar: '--olive', key: 'olive' },
        { inputId: 'color-ink', cssVar: '--ink', key: 'ink' },
        { inputId: 'color-red', cssVar: '--red', key: 'red' },
        { inputId: 'color-white', cssVar: '--white', key: 'white' },
    ];
    map.forEach(({ inputId, cssVar, key }) => {
        const input = document.getElementById(inputId);
        if (!input)
            return;
        input.addEventListener('input', () => {
            document.documentElement.style.setProperty(cssVar, input.value);
            store.set({ colors: { [key]: input.value } });
        });
    });
}
export function applyColors(colors) {
    const map = [
        ['--bg', 'bg'], ['--orange', 'orange'], ['--olive', 'olive'],
        ['--ink', 'ink'], ['--red', 'red'], ['--white', 'white'],
    ];
    map.forEach(([cssVar, key]) => {
        document.documentElement.style.setProperty(cssVar, colors[key]);
        const input = document.getElementById(`color-${key === 'bg' ? 'bg' : key}`);
        if (input)
            input.value = colors[key];
    });
    // ajuste de id especial
    const bgInput = document.getElementById('color-bg');
    if (bgInput)
        bgInput.value = colors.bg;
}
