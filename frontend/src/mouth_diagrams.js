// High-definition SVG Sagittal Articulation Diagrams for Chinese Pinyin Consonants (Thanh Mẫu)

export function getMouthDiagramSVG(char) {
  const c = char ? char.toLowerCase() : '';

  // 1. Âm hai môi (b, p, m) - Bilabial
  if (['b', 'p', 'm'].includes(c)) {
    const isP = (c === 'p');
    const isM = (c === 'm');
    return `
      <svg viewBox="0 0 160 140" width="100%" height="110" style="background: rgba(15,23,42,0.6); border-radius: 12px; padding: 4px;">
        <defs>
          <linearGradient id="gradLips" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="100%" stop-color="#818cf8"/>
          </linearGradient>
          <linearGradient id="gradAir" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#ef4444"/>
          </linearGradient>
        </defs>
        <!-- Vòm họng & Đầu -->
        <path d="M 30,20 C 60,10 110,15 130,40 C 145,60 140,100 130,120" fill="none" stroke="#334155" stroke-width="3" stroke-dasharray="3,3"/>
        <!-- Răng trên & dưới -->
        <path d="M 75,42 L 75,52 M 75,76 L 75,86" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
        <!-- Môi trên & môi dưới khép ép chặt -->
        <path d="M 50,42 C 62,42 74,48 76,58 C 74,68 62,74 50,74" fill="none" stroke="url(#gradLips)" stroke-width="5" stroke-linecap="round"/>
        <path d="M 50,90 C 62,90 74,84 76,74 C 74,64 62,58 50,58" fill="none" stroke="url(#gradLips)" stroke-width="5" stroke-linecap="round"/>
        <!-- Lưỡi nằm tự nhiên -->
        <path d="M 90,95 C 100,75 115,70 130,75" fill="none" stroke="#60a5fa" stroke-width="6" stroke-linecap="round"/>
        ${isP ? `
          <!-- Mũi tên bật hơi mạnh cho 'p' -->
          <path d="M 76,66 L 115,66" stroke="url(#gradAir)" stroke-width="4" stroke-linecap="round" marker-end="url(#arrow)"/>
          <circle cx="120" cy="66" r="4" fill="#ef4444"/>
          <text x="80" y="56" fill="#f59e0b" font-size="10" font-weight="bold">Bật hơi 💨</text>
        ` : ''}
        ${isM ? `
          <!-- Luồng hơi qua mũi cho 'm' -->
          <path d="M 85,45 C 95,30 110,25 125,25" fill="none" stroke="#34d399" stroke-width="3" stroke-dasharray="4,2"/>
          <text x="85" y="32" fill="#34d399" font-size="9" font-weight="bold">Hơi qua mũi 👃</text>
        ` : ''}
        <text x="80" y="130" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="700">Âm hai môi (Hai môi khép ép)</text>
      </svg>
    `;
  }

  // 2. Âm răng môi (f) - Labiodental
  if (c === 'f') {
    return `
      <svg viewBox="0 0 160 140" width="100%" height="110" style="background: rgba(15,23,42,0.6); border-radius: 12px; padding: 4px;">
        <!-- Vòm khẩu hình -->
        <path d="M 30,20 C 60,10 110,15 130,40" fill="none" stroke="#334155" stroke-width="3" stroke-dasharray="3,3"/>
        <!-- Răng cửa trên chạm nhẹ môi dưới -->
        <path d="M 72,42 L 72,58" stroke="#f8fafc" stroke-width="6" stroke-linecap="round"/>
        <!-- Môi dưới cuộn vào chạm răng trên -->
        <path d="M 52,90 C 65,90 70,72 72,60" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>
        <!-- Luồng hơi ma sát lách qua kẽ răng môi -->
        <path d="M 68,62 L 98,62" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3,2"/>
        <text x="75" y="48" fill="#f59e0b" font-size="9" font-weight="bold">Hơi ma sát 💨</text>
        <text x="80" y="130" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="700">Răng trên chạm môi dưới</text>
      </svg>
    `;
  }

  // 3. Âm đầu lưỡi giữa (d, t, n, l) - Alveolar
  if (['d', 't', 'n', 'l'].includes(c)) {
    const isT = (c === 't');
    const isN = (c === 'n');
    return `
      <svg viewBox="0 0 160 140" width="100%" height="110" style="background: rgba(15,23,42,0.6); border-radius: 12px; padding: 4px;">
        <!-- Răng & Lợi trên -->
        <path d="M 60,40 L 60,54" stroke="#e2e8f0" stroke-width="5" stroke-linecap="round"/>
        <path d="M 60,35 C 80,35 110,45 130,70" fill="none" stroke="#475569" stroke-width="4"/>
        <!-- Đầu lưỡi dính chặt lên chân răng trên (lợi) -->
        <path d="M 60,48 C 70,60 90,75 125,80" fill="none" stroke="#38bdf8" stroke-width="7" stroke-linecap="round"/>
        <circle cx="60" cy="48" r="4" fill="#f59e0b"/>
        ${isT ? `
          <path d="M 62,56 L 95,56" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
          <text x="70" y="70" fill="#ef4444" font-size="9" font-weight="bold">Bật hơi 💨</text>
        ` : ''}
        ${isN ? `
          <path d="M 75,32 C 85,22 105,20 120,22" fill="none" stroke="#34d399" stroke-width="3" stroke-dasharray="3,2"/>
          <text x="80" y="28" fill="#34d399" font-size="9" font-weight="bold">Hơi qua mũi 👃</text>
        ` : ''}
        <text x="80" y="130" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="700">Đầu lưỡi chạm chân răng trên</text>
      </svg>
    `;
  }

  // 4. Âm cuống lưỡi (g, k, h) - Velar
  if (['g', 'k', 'h'].includes(c)) {
    const isK = (c === 'k');
    return `
      <svg viewBox="0 0 160 140" width="100%" height="110" style="background: rgba(15,23,42,0.6); border-radius: 12px; padding: 4px;">
        <!-- Vòm mềm (Velum) -->
        <path d="M 40,35 C 70,35 100,45 110,60" fill="none" stroke="#475569" stroke-width="4"/>
        <!-- Cuống lưỡi nhô cao chạm vòm mềm -->
        <path d="M 50,85 C 75,85 100,50 110,58" fill="none" stroke="#38bdf8" stroke-width="7" stroke-linecap="round"/>
        <circle cx="104" cy="54" r="5" fill="#f59e0b"/>
        ${isK ? `
          <text x="50" y="45" fill="#ef4444" font-size="9" font-weight="bold">Bật hơi mạnh 💨</text>
        ` : ''}
        <text x="80" y="130" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="700">Cuống lưỡi nâng cao chạm vòm mềm</text>
      </svg>
    `;
  }

  // 5. Âm mặt lưỡi (j, q, x) - Palatal
  if (['j', 'q', 'x'].includes(c)) {
    const isQ = (c === 'q');
    return `
      <svg viewBox="0 0 160 140" width="100%" height="110" style="background: rgba(15,23,42,0.6); border-radius: 12px; padding: 4px;">
        <!-- Vòm cứng (Hard palate) -->
        <path d="M 50,35 C 80,35 110,48 125,70" fill="none" stroke="#475569" stroke-width="4"/>
        <!-- Răng dưới -->
        <path d="M 50,75 L 50,85" stroke="#cbd5e1" stroke-width="4"/>
        <!-- Mặt lưỡi áp phẳng sát vòm cứng, đầu lưỡi đặt dưới sau răng dưới -->
        <path d="M 50,80 C 65,55 90,45 120,65" fill="none" stroke="#38bdf8" stroke-width="7" stroke-linecap="round"/>
        <path d="M 60,48 L 95,48" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3,2"/>
        ${isQ ? `
          <text x="65" y="32" fill="#ef4444" font-size="9" font-weight="bold">Bật hơi mạnh 💨</text>
        ` : ''}
        <text x="80" y="130" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="700">Mặt lưỡi nâng sát vòm cứng</text>
      </svg>
    `;
  }

  // 6. Âm đầu lưỡi trước / Phẳng lưỡi (z, c, s) - Dental/Alveolar Flat
  if (['z', 'c', 's'].includes(c)) {
    const isC = (c === 'c');
    return `
      <svg viewBox="0 0 160 140" width="100%" height="110" style="background: rgba(15,23,42,0.6); border-radius: 12px; padding: 4px;">
        <!-- Răng cửa trên & dưới -->
        <path d="M 55,40 L 55,54 M 55,70 L 55,84" stroke="#f8fafc" stroke-width="5" stroke-linecap="round"/>
        <!-- Lưỡi duỗi thẳng nằm ngang, đầu lưỡi sát lưng răng cửa trên -->
        <path d="M 57,60 L 125,62" fill="none" stroke="#38bdf8" stroke-width="7" stroke-linecap="round"/>
        <circle cx="57" cy="60" r="4" fill="#f59e0b"/>
        ${isC ? `
          <path d="M 58,54 L 90,54" stroke="#ef4444" stroke-width="3"/>
          <text x="65" y="42" fill="#ef4444" font-size="9" font-weight="bold">Bật hơi 💨</text>
        ` : ''}
        <text x="80" y="130" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="700">Đầu lưỡi thẳng áp sau răng cửa trên</text>
      </svg>
    `;
  }

  // 7. Âm cong lưỡi (zh, ch, sh, r) - Retroflex
  if (['zh', 'ch', 'sh', 'r'].includes(c)) {
    const isCh = (c === 'ch');
    return `
      <svg viewBox="0 0 160 140" width="100%" height="110" style="background: rgba(15,23,42,0.6); border-radius: 12px; padding: 4px;">
        <!-- Vòm cứng (Hard palate) -->
        <path d="M 45,35 C 75,35 110,45 125,70" fill="none" stroke="#475569" stroke-width="4"/>
        <!-- Đầu lưỡi uốn cong vút lên hướng về ngạc cứng -->
        <path d="M 68,46 C 60,65 85,78 125,80" fill="none" stroke="#38bdf8" stroke-width="7" stroke-linecap="round"/>
        <!-- Mũi tên chỉ hướng uốn cong lưỡi -->
        <path d="M 75,60 C 70,52 65,48 68,44" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
        <circle cx="68" cy="44" r="4" fill="#f59e0b"/>
        ${isCh ? `
          <text x="75" y="32" fill="#ef4444" font-size="9" font-weight="bold">Cong lưỡi + Bật hơi 💨</text>
        ` : ''}
        <text x="80" y="130" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="700">Đầu lưỡi uốn cong lên vòm cứng</text>
      </svg>
    `;
  }

  // Generic Default Fallback SVG
  return `
    <svg viewBox="0 0 160 140" width="100%" height="110" style="background: rgba(15,23,42,0.6); border-radius: 12px; padding: 4px;">
      <path d="M 40,35 C 75,35 110,45 125,70" fill="none" stroke="#475569" stroke-width="4"/>
      <path d="M 60,65 C 80,65 100,70 125,80" fill="none" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
      <text x="80" y="130" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="700">Vị trí lưỡi & luồng hơi chuẩn</text>
    </svg>
  `;
}
