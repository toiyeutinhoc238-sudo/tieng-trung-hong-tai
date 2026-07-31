// High-definition Anatomical Human Head & Vocal Tract Articulation Diagrams for Chinese Pinyin Consonants

export function getMouthDiagramSVG(char) {
  const c = char ? char.toLowerCase() : '';

  let imgName = 'bilabial.png';
  let title = 'Âm hai môi (b, p, m)';

  if (['b', 'p', 'm'].includes(c)) {
    imgName = 'bilabial.png';
    title = 'Âm hai môi (b, p, m): Hai môi khép dính';
  } else if (c === 'f') {
    imgName = 'labiodental.png';
    title = 'Âm răng môi (f): Răng trên chạm môi dưới';
  } else if (['d', 't', 'n', 'l'].includes(c)) {
    imgName = 'alveolar.png';
    title = 'Âm đầu lưỡi giữa (d, t, n, l): Chạm chân răng trên';
  } else if (['g', 'k', 'h'].includes(c)) {
    imgName = 'velar.png';
    title = 'Âm cuống lưỡi (g, k, h): Gốc lưỡi nâng chạm vòm mềm';
  } else if (['j', 'q', 'x'].includes(c)) {
    imgName = 'palatal.png';
    title = 'Âm mặt lưỡi (j, q, x): Mặt lưỡi áp phẳng vòm cứng';
  } else if (['z', 'c', 's'].includes(c)) {
    imgName = 'dental.png';
    title = 'Âm đầu lưỡi trước (z, c, s): Lưỡi thẳng áp sau răng trên';
  } else if (['zh', 'ch', 'sh', 'r'].includes(c)) {
    imgName = 'retroflex.png';
    title = 'Âm cong lưỡi (zh, ch, sh, r): Đầu lưỡi uốn cong vút';
  }

  return `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:4px;">
      <img src="assets/mouth_diagrams/${imgName}" alt="${title}" style="width:100%; max-height:125px; border-radius:12px; object-fit:cover; box-shadow:0 6px 16px rgba(0,0,0,0.5); border:1px solid rgba(56,189,248,0.3);" />
      <span style="font-size:0.75rem; color:#38bdf8; font-weight:800; margin-top:6px; text-align:center;">${title}</span>
    </div>
  `;
}
