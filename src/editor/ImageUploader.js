import { store } from '../state';
const targets = {
    1: () => document.getElementById('f1-pet'),
    2: () => document.getElementById('f2-deco'),
    3: () => document.getElementById('f3-deco'),
};
function applyImage(slot, dataUrl) {
    const el = targets[slot]();
    if (!el)
        return;
    el.style.backgroundImage = dataUrl ? `url(${dataUrl})` : '';
    if (slot === 1)
        el.classList.toggle('has-image', dataUrl !== null);
}
function warnIfSmall(file) {
    // cria um img temporário pra checar dimensões
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
        if (img.width < 800 || img.height < 800) {
            alert(`⚠️ Imagem pequena detectada (${img.width}×${img.height}px). Na exportação em 1080×1350 pode ficar borrada. Prefira imagens acima de 800×800px.`);
        }
        URL.revokeObjectURL(url);
    };
    img.src = url;
}
function readFile(file, slot) {
    warnIfSmall(file);
    const reader = new FileReader();
    reader.onload = ev => {
        const dataUrl = ev.target?.result;
        store.set({ images: { [slot]: dataUrl } });
        applyImage(slot, dataUrl);
    };
    reader.readAsDataURL(file);
}
export function initImageUploaders() {
    const slots = [1, 2, 3];
    slots.forEach(slot => {
        const fileInput = document.getElementById(`img-${slot}`);
        const dropZone = document.getElementById(`drop-${slot}`);
        const removeBtn = document.getElementById(`remove-img-${slot}`);
        fileInput?.addEventListener('change', e => {
            const file = e.target.files?.[0];
            if (file)
                readFile(file, slot);
        });
        // drag & drop
        if (dropZone) {
            dropZone.addEventListener('dragover', e => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
            dropZone.addEventListener('drop', e => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                const file = e.dataTransfer?.files[0];
                if (file && file.type.startsWith('image/'))
                    readFile(file, slot);
            });
        }
        removeBtn?.addEventListener('click', () => {
            store.set({ images: { [slot]: null } });
            applyImage(slot, null);
            if (fileInput)
                fileInput.value = '';
        });
    });
}
export function restoreImages(images) {
    [1, 2, 3].forEach(slot => {
        if (images[slot])
            applyImage(slot, images[slot]);
    });
}
