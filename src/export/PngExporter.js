// Encapsula html2canvas e a lógica de escala para exportar slides em 1080×1350.
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
// Estilos de exportação injetados inline para evitar dependência de classe CSS global
const EXPORT_STYLE = `
  width: 1080px !important;
  height: 1350px !important;
  padding: 84px !important;
  position: absolute !important;
  top: -9999px;
  left: -9999px;
  box-shadow: none !important;
  border-radius: 0 !important;
`;
async function renderFrame(num) {
    const frame = document.getElementById(`frame-${num}`);
    if (!frame)
        throw new Error(`frame-${num} não encontrado`);
    frame.setAttribute('data-exporting', '1');
    // aguarda o browser repintar com as classes de exportação
    await new Promise(r => setTimeout(r, 200));
    try {
        return await html2canvas(frame, {
            width: 1080,
            height: 1350,
            scale: 1,
            backgroundColor: null,
            useCORS: true,
            logging: false,
            x: 0,
            y: 0,
            windowWidth: 1080,
            windowHeight: 1350,
        });
    }
    finally {
        frame.removeAttribute('data-exporting');
    }
}
// Não usado diretamente mas deixamos como referência para o CSS via attr
export { EXPORT_STYLE };
export async function exportFrame(num) {
    const canvas = await renderFrame(num);
    download(canvas.toDataURL('image/png'), `mybuddy-slide-${num}.png`);
}
export async function exportAll() {
    for (let i = 1; i <= 3; i++) {
        await exportFrame(i);
        await new Promise(r => setTimeout(r, 400));
    }
}
export async function exportZip() {
    const zip = new JSZip();
    for (let i = 1; i <= 3; i++) {
        const canvas = await renderFrame(i);
        // toDataURL retorna "data:image/png;base64,XXX" — pega só o base64
        const base64 = canvas.toDataURL('image/png').split(',')[1];
        zip.file(`mybuddy-slide-${i}.png`, base64, { base64: true });
        await new Promise(r => setTimeout(r, 300));
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    download(URL.createObjectURL(blob), 'mybuddy-carrossel.zip');
}
function download(href, filename) {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.click();
}
