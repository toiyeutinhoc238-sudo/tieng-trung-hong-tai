// High-definition SVG Articulation Diagrams with Recognizable Human Head Profile

export function getMouthDiagramSVG(char) {
  const c = char ? char.toLowerCase() : '';

  // Base Human Head / Face Silhouette & Palate Anatomy
  const baseAnatomy = `
    <defs>
      <linearGradient id="tongueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
      <linearGradient id="airGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#ef4444"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Đường nét khuôn mặt (Mũi, Môi, Cằm) -->
    <!-- Mũi -->
    <path d="M 12 25 C 20 28 28 36 28 46 C 28 50 24 53 30 55" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Môi trên -->
    <path d="M 30 55 C 36 56 42 57 44 60" fill="none" stroke="#f43f5e" stroke-width="3" stroke-linecap="round"/>
    <!-- Môi dưới -->
    <path d="M 44 76 C 36 78 30 80 28 85" fill="none" stroke="#f43f5e" stroke-width="3" stroke-linecap="round"/>
    <!-- Cằm & Cổ -->
    <path d="M 28 85 C 25 96 32 110 45 118 C 60 128 90 130 110 130" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round"/>

    <!-- Khoang mũi & Ngạc cứng / Ngạc mềm -->
    <path d="M 30 44 C 45 42 70 38 95 38 C 115 38 130 45 135 60" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="3,3"/>
    <!-- Vòm miệng (Hard & Soft Palate) -->
    <path d="M 52 56 C 70 48 95 48 112 62 C 118 72 120 85 120 100" fill="none" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round"/>
    <text x="78" y="44" fill="#64748b" font-size="8" font-weight="700">Ngạc cứng</text>
    <text x="110" y="54" fill="#64748b" font-size="8" font-weight="700">Ngạc mềm</text>

    <!-- Răng cửa trên & Răng cửa dưới -->
    <rect x="46" y="56" width="5" height="9" rx="1" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="46" y="70" width="5" height="9" rx="1" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  `;

  // 1. Âm hai môi (b, p, m) - Bilabial
  if (['b', 'p', 'm'].includes(c)) {
    const isP = (c === 'p');
    const isM = (c === 'm');
    return `
      <svg viewBox="0 0 160 140" width="100%" height="120" style="background: rgba(15,23,42,0.7); border-radius: 14px; padding: 2px;">
        ${baseAnatomy}
        <!-- Môi khép dính chặt -->
        <path d="M 30 55 C 40 58 46 64 47 67 C 46 72 40 76 28 85" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
        <circle cx="47" cy="67" r="4" fill="#f59e0b" filter="url(#glow)"/>

        <!-- Lưỡi thả lỏng ở dưới -->
        <path d="M 52 82 C 70 82 90 85 110 95 C 115 105 105 115 85 115 C 65 115 52 95 52 82 Z" fill="url(#tongueGrad)" opacity="0.85" stroke="#38bdf8" stroke-width="2"/>

        ${isP ? `
          <!-- Luồng hơi bật mạnh ra ngoài -->
          <path d="M 48 67 L 18 67" stroke="url(#airGrad)" stroke-width="4" stroke-linecap="round"/>
          <path d="M 22 62 L 15 67 L 22 72" stroke="#ef4444" stroke-width="3" fill="none" stroke-linecap="round"/>
          <text x="5" y="60" fill="#ef4444" font-size="10" font-weight="800">Bật hơi 💨</text>
        ` : ''}
        ${isM ? `
          <!-- Hơi lên khoang mũi -->
          <path d="M 65 50 C 60 38 45 32 30 32" fill="none" stroke="#34d399" stroke-width="3" stroke-dasharray="4,2"/>
          <text x="35" y="26" fill="#34d399" font-size="9" font-weight="800">Hơi qua mũi 👃</text>
        ` : ''}
        <text x="80" y="134" text-anchor="middle" fill="#38bdf8" font-size="9.5" font-weight="800">Âm hai môi (b, p, m)</text>
      </svg>
    `;
  }

  // 2. Âm răng môi (f) - Labiodental
  if (c === 'f') {
    return `
      <svg viewBox="0 0 160 140" width="100%" height="120" style="background: rgba(15,23,42,0.7); border-radius: 14px; padding: 2px;">
        ${baseAnatomy}
        <!-- Môi dưới cuộn vào chạm nhẹ răng cửa trên -->
        <path d="M 42 75 C 45 70 48 66 48 64" fill="none" stroke="#f43f5e" stroke-width="4" stroke-linecap="round"/>
        <circle cx="48" cy="64" r="4" fill="#f59e0b" filter="url(#glow)"/>

        <!-- Lưỡi nằm ở dưới -->
        <path d="M 54 82 C 70 82 90 85 110 95 C 115 105 105 115 85 115 C 65 115 54 95 54 82 Z" fill="url(#tongueGrad)" opacity="0.85" stroke="#38bdf8" stroke-width="2"/>

        <!-- Luồng hơi ma sát lách qua răng môi -->
        <path d="M 46 65 L 22 65" stroke="url(#airGrad)" stroke-width="3" stroke-dasharray="3,2"/>
        <text x="5" y="60" fill="#f59e0b" font-size="9.5" font-weight="800">Hơi ma sát 💨</text>
        <text x="80" y="134" text-anchor="middle" fill="#38bdf8" font-size="9.5" font-weight="800">Âm răng môi (f): Răng trên chạm môi dưới</text>
      </svg>
    `;
  }

  // 3. Âm đầu lưỡi giữa (d, t, n, l) - Alveolar
  if (['d', 't', 'n', 'l'].includes(c)) {
    const isT = (c === 't');
    const isN = (c === 'n');
    return `
      <svg viewBox="0 0 160 140" width="100%" height="120" style="background: rgba(15,23,42,0.7); border-radius: 14px; padding: 2px;">
        ${baseAnatomy}
        <!-- Đầu lưỡi nhô cao chạm dính chặt vào chân răng trên (lợi) -->
        <path d="M 50 58 C 52 56 56 68 70 78 C 85 85 105 92 110 95 C 115 105 105 115 85 115 C 65 115 50 75 50 58 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
        <circle cx="51" cy="57" r="4.5" fill="#f59e0b" filter="url(#glow)"/>

        ${isT ? `
          <path d="M 45 66 L 20 66" stroke="url(#airGrad)" stroke-width="3.5" stroke-linecap="round"/>
          <text x="5" y="60" fill="#ef4444" font-size="10" font-weight="800">Bật hơi 💨</text>
        ` : ''}
        ${isN ? `
          <path d="M 65 48 C 60 38 45 32 30 32" fill="none" stroke="#34d399" stroke-width="3" stroke-dasharray="4,2"/>
          <text x="35" y="26" fill="#34d399" font-size="9" font-weight="800">Hơi qua mũi 👃</text>
        ` : ''}
        <text x="80" y="134" text-anchor="middle" fill="#38bdf8" font-size="9.5" font-weight="800">Âm đầu lưỡi giữa (d, t, n, l): Chạm chân răng trên</text>
      </svg>
    `;
  }

  // 4. Âm cuống lưỡi (g, k, h) - Velar
  if (['g', 'k', 'h'].includes(c)) {
    const isK = (c === 'k');
    return `
      <svg viewBox="0 0 160 140" width="100%" height="120" style="background: rgba(15,23,42,0.7); border-radius: 14px; padding: 2px;">
        ${baseAnatomy}
        <!-- Gốc / Cuống lưỡi đằng sau nhô cao chạm sát vòm ngạc mềm -->
        <path d="M 52 80 C 65 80 85 70 102 58 C 108 55 115 70 110 92 C 105 110 85 115 65 115 C 52 95 52 80 52 80 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
        <circle cx="102" cy="58" r="5" fill="#f59e0b" filter="url(#glow)"/>

        ${isK ? `
          <path d="M 45 66 L 20 66" stroke="url(#airGrad)" stroke-width="4" stroke-linecap="round"/>
          <text x="5" y="60" fill="#ef4444" font-size="10" font-weight="800">Bật hơi mạnh 💨</text>
        ` : ''}
        <text x="80" y="134" text-anchor="middle" fill="#38bdf8" font-size="9.5" font-weight="800">Âm cuống lưỡi (g, k, h): Gốc lưỡi nâng chạm vòm mềm</text>
      </svg>
    `;
  }

  // 5. Âm mặt lưỡi (j, q, x) - Palatal
  if (['j', 'q', 'x'].includes(c)) {
    const isQ = (c === 'q');
    return `
      <svg viewBox="0 0 160 140" width="100%" height="120" style="background: rgba(15,23,42,0.7); border-radius: 14px; padding: 2px;">
        ${baseAnatomy}
        <!-- Thân / Mặt lưỡi áp phẳng lên vòm ngạc cứng, đầu lưỡi hạ thấp sau răng cửa dưới -->
        <path d="M 50 78 C 50 78 68 52 85 50 C 100 52 112 75 110 95 C 105 115 85 115 65 115 C 50 95 50 78 50 78 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
        <circle cx="78" cy="50" r="5" fill="#f59e0b" filter="url(#glow)"/>

        ${isQ ? `
          <path d="M 45 66 L 20 66" stroke="url(#airGrad)" stroke-width="4" stroke-linecap="round"/>
          <text x="5" y="60" fill="#ef4444" font-size="10" font-weight="800">Bật hơi mạnh 💨</text>
        ` : ''}
        <text x="80" y="134" text-anchor="middle" fill="#38bdf8" font-size="9.5" font-weight="800">Âm mặt lưỡi (j, q, x): Mặt lưỡi áp phẳng ngạc cứng</text>
      </svg>
    `;
  }

  // 6. Âm đầu lưỡi trước / Phẳng lưỡi (z, c, s) - Dental Flat
  if (['z', 'c', 's'].includes(c)) {
    const isC = (c === 'c');
    return `
      <svg viewBox="0 0 160 140" width="100%" height="120" style="background: rgba(15,23,42,0.7); border-radius: 14px; padding: 2px;">
        ${baseAnatomy}
        <!-- Lưỡi nằm duỗi thẳng nằm ngang, đầu lưỡi sát lưng răng cửa trên -->
        <path d="M 51 62 L 105 65 C 112 75 110 92 105 105 C 85 115 65 115 52 85 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
        <circle cx="51" cy="62" r="4.5" fill="#f59e0b" filter="url(#glow)"/>

        ${isC ? `
          <path d="M 45 66 L 20 66" stroke="url(#airGrad)" stroke-width="3.5" stroke-linecap="round"/>
          <text x="5" y="60" fill="#ef4444" font-size="10" font-weight="800">Bật hơi 💨</text>
        ` : ''}
        <text x="80" y="134" text-anchor="middle" fill="#38bdf8" font-size="9.5" font-weight="800">Âm đầu lưỡi trước (z, c, s): Lưỡi thẳng áp sau răng trên</text>
      </svg>
    `;
  }

  // 7. Âm cong lưỡi (zh, ch, sh, r) - Retroflex
  if (['zh', 'ch', 'sh', 'r'].includes(c)) {
    const isCh = (c === 'ch');
    return `
      <svg viewBox="0 0 160 140" width="100%" height="120" style="background: rgba(15,23,42,0.7); border-radius: 14px; padding: 2px;">
        ${baseAnatomy}
        <!-- Đầu lưỡi uốn cong vút lên chỉ vào vòm ngạc cứng -->
        <path d="M 66 48 C 55 60 70 75 100 80 C 112 90 108 105 95 115 C 75 115 54 95 66 48 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
        <!-- Mũi tên uốn cong lưỡi -->
        <path d="M 72 65 C 66 58 63 52 66 48" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
        <circle cx="66" cy="48" r="4.5" fill="#f59e0b" filter="url(#glow)"/>

        ${isCh ? `
          <path d="M 45 66 L 20 66" stroke="url(#airGrad)" stroke-width="4" stroke-linecap="round"/>
          <text x="2" y="60" fill="#ef4444" font-size="9.5" font-weight="800">Cong lưỡi + Bật hơi 💨</text>
        ` : ''}
        <text x="80" y="134" text-anchor="middle" fill="#38bdf8" font-size="9.5" font-weight="800">Âm cong lưỡi (zh, ch, sh, r): Đầu lưỡi uốn cong vút</text>
      </svg>
    `;
  }

  // Generic Default Fallback SVG
  return `
    <svg viewBox="0 0 160 140" width="100%" height="120" style="background: rgba(15,23,42,0.7); border-radius: 14px; padding: 2px;">
      ${baseAnatomy}
      <path d="M 52 75 C 70 75 95 80 110 95 C 105 115 85 115 65 115 Z" fill="url(#tongueGrad)" opacity="0.85" stroke="#38bdf8" stroke-width="2"/>
      <text x="80" y="134" text-anchor="middle" fill="#38bdf8" font-size="9.5" font-weight="800">Vị trí lưỡi & luồng hơi chuẩn</text>
    </svg>
  `;
}
