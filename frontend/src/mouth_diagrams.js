// High-Definition Self-Contained SVG Vocal Tract Articulation Models for Chinese Pinyin Consonants

export function getMouthDiagramSVG(char) {
  const c = char ? char.toLowerCase() : '';

  // Base Silhouette of Human Head Side Profile & Anatomical Vocal Tract
  const baseProfile = `
    <defs>
      <linearGradient id="tongueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
      <linearGradient id="airGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#ef4444"/>
      </linearGradient>
      <filter id="glowEffect">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Đường nét khuôn mặt người nghiêng (Trán, Mũi, Môi, Cằm) -->
    <!-- Mũi -->
    <path d="M 20 20 C 32 25 42 35 42 50 C 42 56 36 60 44 62" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
    <!-- Môi trên -->
    <path d="M 44 62 C 52 64 60 65 64 68" fill="none" stroke="#fb7185" stroke-width="4" stroke-linecap="round"/>
    <!-- Môi dưới -->
    <path d="M 64 88 C 52 90 44 92 40 98" fill="none" stroke="#fb7185" stroke-width="4" stroke-linecap="round"/>
    <!-- Cằm & Cổ -->
    <path d="M 40 98 C 36 112 45 130 62 138 C 80 148 120 150 150 150" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>

    <!-- Khoang mũi & Vòm họng -->
    <path d="M 42 48 C 65 44 100 40 135 40 C 160 40 175 50 180 70" fill="none" stroke="#475569" stroke-width="2" stroke-dasharray="4,3"/>
    <!-- Ngạc cứng (Hard Palate) & Ngạc mềm (Soft Palate) -->
    <path d="M 72 64 C 95 54 130 54 152 70 C 160 82 162 100 162 120" fill="none" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
    <text x="105" y="48" fill="#64748b" font-size="9" font-weight="700">Ngạc cứng</text>
    <text x="145" y="60" fill="#64748b" font-size="9" font-weight="700">Ngạc mềm</text>

    <!-- Răng cửa trên & Răng cửa dưới (Trắng) -->
    <rect x="65" y="64" width="7" height="11" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="65" y="81" width="7" height="11" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  `;

  // 1. Âm hai môi (b, p, m) - Bilabial
  if (['b', 'p', 'm'].includes(c)) {
    const isP = (c === 'p');
    const isM = (c === 'm');
    return `
      <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.8); border-radius: 14px; padding: 2px;">
        ${baseProfile}
        <!-- Môi khép dính chặt -->
        <path d="M 44 62 C 58 66 67 74 68 78 C 67 84 58 88 40 98" fill="none" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/>
        <circle cx="68" cy="78" r="5" fill="#f59e0b" filter="url(#glowEffect)"/>

        <!-- Lưỡi nằm tự nhiên -->
        <path d="M 74 95 C 95 95 120 100 145 110 C 150 125 135 138 110 138 C 85 138 74 110 74 95 Z" fill="url(#tongueGradient)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>

        ${isP ? `
          <!-- Mũi tên bật hơi mạnh -->
          <path d="M 68 78 L 25 78" stroke="url(#airGradient)" stroke-width="4" stroke-linecap="round"/>
          <path d="M 32 72 L 22 78 L 32 84" stroke="#ef4444" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <text x="5" y="70" fill="#ef4444" font-size="11" font-weight="900">Bật hơi 💨</text>
        ` : ''}
        ${isM ? `
          <!-- Hơi lên khoang mũi -->
          <path d="M 90 60 C 80 45 60 38 40 38" fill="none" stroke="#34d399" stroke-width="3.5" stroke-dasharray="4,2"/>
          <text x="45" y="32" fill="#34d399" font-size="10" font-weight="900">Hơi qua mũi 👃</text>
        ` : ''}
        <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm hai môi (b, p, m): Môi khép chặt</text>
      </svg>
    `;
  }

  // 2. Âm răng môi (f) - Labiodental
  if (c === 'f') {
    return `
      <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.8); border-radius: 14px; padding: 2px;">
        ${baseProfile}
        <!-- Môi dưới cuộn vào chạm nhẹ răng cửa trên -->
        <path d="M 58 88 C 62 82 68 76 68 73" fill="none" stroke="#fb7185" stroke-width="5" stroke-linecap="round"/>
        <circle cx="68" cy="73" r="5" fill="#f59e0b" filter="url(#glowEffect)"/>

        <!-- Lưỡi nằm tự nhiên -->
        <path d="M 76 95 C 95 95 120 100 145 110 C 150 125 135 138 110 138 C 85 138 76 110 76 95 Z" fill="url(#tongueGradient)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>

        <!-- Luồng hơi ma sát lách qua răng môi -->
        <path d="M 65 74 L 30 74" stroke="url(#airGradient)" stroke-width="3.5" stroke-dasharray="4,2"/>
        <text x="5" y="70" fill="#f59e0b" font-size="10.5" font-weight="900">Hơi ma sát 💨</text>
        <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm răng môi (f): Răng trên chạm môi dưới</text>
      </svg>
    `;
  }

  // 3. Âm đầu lưỡi giữa (d, t, n, l) - Alveolar
  if (['d', 't', 'n', 'l'].includes(c)) {
    const isT = (c === 't');
    const isN = (c === 'n');
    return `
      <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.8); border-radius: 14px; padding: 2px;">
        ${baseProfile}
        <!-- Đầu lưỡi nhô cao chạm dính chặt vào chân răng trên (lợi) -->
        <path d="M 71 67 C 73 64 78 78 98 90 C 120 100 145 108 148 115 C 150 128 135 138 110 138 C 85 138 71 90 71 67 Z" fill="url(#tongueGradient)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
        <circle cx="71" cy="66" r="5" fill="#f59e0b" filter="url(#glowEffect)"/>

        ${isT ? `
          <path d="M 64 76 L 30 76" stroke="url(#airGradient)" stroke-width="4" stroke-linecap="round"/>
          <text x="5" y="70" fill="#ef4444" font-size="11" font-weight="900">Bật hơi 💨</text>
        ` : ''}
        ${isN ? `
          <path d="M 90 60 C 80 45 60 38 40 38" fill="none" stroke="#34d399" stroke-width="3.5" stroke-dasharray="4,2"/>
          <text x="45" y="32" fill="#34d399" font-size="10" font-weight="900">Hơi qua mũi 👃</text>
        ` : ''}
        <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm đầu lưỡi giữa (d, t, n, l): Chạm chân răng trên</text>
      </svg>
    `;
  }

  // 4. Âm cuống lưỡi (g, k, h) - Velar
  if (['g', 'k', 'h'].includes(c)) {
    const isK = (c === 'k');
    return `
      <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.8); border-radius: 14px; padding: 2px;">
        ${baseProfile}
        <!-- Gốc / Cuống lưỡi đằng sau nhô cao chạm sát vòm ngạc mềm -->
        <path d="M 72 92 C 90 92 118 80 138 66 C 146 62 152 78 146 102 C 140 125 115 138 90 138 C 72 110 72 92 72 92 Z" fill="url(#tongueGradient)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
        <circle cx="138" cy="66" r="5.5" fill="#f59e0b" filter="url(#glowEffect)"/>

        ${isK ? `
          <path d="M 64 76 L 30 76" stroke="url(#airGradient)" stroke-width="4" stroke-linecap="round"/>
          <text x="5" y="70" fill="#ef4444" font-size="11" font-weight="900">Bật hơi mạnh 💨</text>
        ` : ''}
        <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm cuống lưỡi (g, k, h): Gốc lưỡi nâng chạm vòm mềm</text>
      </svg>
    `;
  }

  // 5. Âm mặt lưỡi (j, q, x) - Palatal
  if (['j', 'q', 'x'].includes(c)) {
    const isQ = (c === 'q');
    return `
      <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.8); border-radius: 14px; padding: 2px;">
        ${baseProfile}
        <!-- Thân / Mặt lưỡi áp phẳng lên vòm ngạc cứng, đầu lưỡi hạ thấp sau răng cửa dưới -->
        <path d="M 70 88 C 70 88 92 58 115 56 C 135 58 148 85 145 108 C 140 130 115 138 90 138 C 70 110 70 88 70 88 Z" fill="url(#tongueGradient)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
        <circle cx="106" cy="56" r="5.5" fill="#f59e0b" filter="url(#glowEffect)"/>

        ${isQ ? `
          <path d="M 64 76 L 30 76" stroke="url(#airGradient)" stroke-width="4" stroke-linecap="round"/>
          <text x="5" y="70" fill="#ef4444" font-size="11" font-weight="900">Bật hơi mạnh 💨</text>
        ` : ''}
        <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm mặt lưỡi (j, q, x): Mặt lưỡi áp phẳng ngạc cứng</text>
      </svg>
    `;
  }

  // 6. Âm đầu lưỡi trước / Phẳng lưỡi (z, c, s) - Dental Flat
  if (['z', 'c', 's'].includes(c)) {
    const isC = (c === 'c');
    return `
      <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.8); border-radius: 14px; padding: 2px;">
        ${baseProfile}
        <!-- Lưỡi nằm duỗi thẳng nằm ngang, đầu lưỡi sát lưng răng cửa trên -->
        <path d="M 71 70 L 140 73 C 148 85 145 105 140 120 C 115 138 90 138 72 98 Z" fill="url(#tongueGradient)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
        <circle cx="71" cy="70" r="5" fill="#f59e0b" filter="url(#glowEffect)"/>

        ${isC ? `
          <path d="M 64 76 L 30 76" stroke="url(#airGradient)" stroke-width="4" stroke-linecap="round"/>
          <text x="5" y="70" fill="#ef4444" font-size="11" font-weight="900">Bật hơi 💨</text>
        ` : ''}
        <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm đầu lưỡi trước (z, c, s): Lưỡi thẳng áp sau răng trên</text>
      </svg>
    `;
  }

  // 7. Âm cong lưỡi (zh, ch, sh, r) - Retroflex
  if (['zh', 'ch', 'sh', 'r'].includes(c)) {
    const isCh = (c === 'ch');
    return `
      <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.8); border-radius: 14px; padding: 2px;">
        ${baseProfile}
        <!-- Đầu lưỡi uốn cong vút lên chỉ vào vòm ngạc cứng -->
        <path d="M 92 54 C 78 68 95 85 132 90 C 146 102 142 120 128 132 C 105 138 75 115 92 54 Z" fill="url(#tongueGradient)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
        <!-- Mũi tên uốn cong lưỡi -->
        <path d="M 100 72 C 92 64 88 58 92 54" fill="none" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="92" cy="54" r="5" fill="#f59e0b" filter="url(#glowEffect)"/>

        ${isCh ? `
          <path d="M 64 76 L 30 76" stroke="url(#airGradient)" stroke-width="4" stroke-linecap="round"/>
          <text x="2" y="70" fill="#ef4444" font-size="10.5" font-weight="900">Cong lưỡi + Bật hơi 💨</text>
        ` : ''}
        <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm cong lưỡi (zh, ch, sh, r): Đầu lưỡi uốn cong vút</text>
      </svg>
    `;
  }

  // Generic Default Fallback SVG
  return `
    <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.8); border-radius: 14px; padding: 2px;">
      ${baseProfile}
      <path d="M 72 85 C 95 85 125 90 145 110 C 140 130 115 138 90 138 Z" fill="url(#tongueGradient)" opacity="0.85" stroke="#38bdf8" stroke-width="2"/>
      <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Vị trí lưỡi & luồng hơi chuẩn</text>
    </svg>
  `;
}
