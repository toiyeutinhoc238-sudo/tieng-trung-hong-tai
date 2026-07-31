// High-Definition Synchronized Medical Head-Profile Vocal Tract & Pitch Diagrams for Thanh Mẫu, Vận Mẫu & Thanh Điệu

export function getMouthDiagramSVG(char, sectionType) {
  const c = char ? char.toLowerCase() : '';
  const s = sectionType ? sectionType.toLowerCase() : '';

  // Base Medical Human Head Side Profile & Anatomical Vocal Tract Template
  const baseProfile = `
    <defs>
      <linearGradient id="tongueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
      <linearGradient id="airGrad" x1="0%" y1="0%" x2="100%" y2="0%">
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

    <!-- Đường nét khuôn mặt người nghiêng (Mũi, Môi trên, Môi dưới, Cằm, Cổ) -->
    <path d="M 20 20 C 32 25 42 35 42 50 C 42 56 36 60 44 62" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
    <path d="M 44 62 C 52 64 60 65 64 68" fill="none" stroke="#fb7185" stroke-width="4" stroke-linecap="round"/>
    <path d="M 64 88 C 52 90 44 92 40 98" fill="none" stroke="#fb7185" stroke-width="4" stroke-linecap="round"/>
    <path d="M 40 98 C 36 112 45 130 62 138 C 80 148 120 150 150 150" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>

    <!-- Khoang mũi & Vòm họng -->
    <path d="M 42 48 C 65 44 100 40 135 40 C 160 40 175 50 180 70" fill="none" stroke="#475569" stroke-width="2" stroke-dasharray="4,3"/>
    <!-- Ngạc cứng & Ngạc mềm -->
    <path d="M 72 64 C 95 54 130 54 152 70 C 160 82 162 100 162 120" fill="none" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
    <text x="105" y="48" fill="#64748b" font-size="9" font-weight="700">Ngạc cứng</text>
    <text x="145" y="60" fill="#64748b" font-size="9" font-weight="700">Ngạc mềm</text>

    <!-- Răng cửa trên & Răng cửa dưới (Trắng) -->
    <rect x="65" y="64" width="7" height="11" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="65" y="81" width="7" height="11" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  `;

  // ==========================================
  // SECTION 1: THANH MẪU (CONSONANTS)
  // ==========================================
  if (s === 'thanhmau' || ['b','p','m','f','d','t','n','l','g','k','h','j','q','x','z','c','s','zh','ch','sh','r'].includes(c)) {
    if (['b', 'p', 'm'].includes(c)) {
      const isP = (c === 'p');
      const isM = (c === 'm');
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <!-- Môi khép dính chặt -->
          <path d="M 44 62 C 58 66 67 74 68 78 C 67 84 58 88 40 98" fill="none" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/>
          <circle cx="68" cy="78" r="5" fill="#f59e0b" filter="url(#glowEffect)"/>
          <path d="M 74 95 C 95 95 120 100 145 110 C 150 125 135 138 110 138 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
          ${isP ? `
            <path d="M 68 78 L 25 78" stroke="url(#airGrad)" stroke-width="4" stroke-linecap="round"/>
            <text x="5" y="70" fill="#ef4444" font-size="11" font-weight="900">Bật hơi 💨</text>
          ` : ''}
          ${isM ? `
            <path d="M 90 60 C 80 45 60 38 40 38" fill="none" stroke="#34d399" stroke-width="3.5" stroke-dasharray="4,2"/>
            <text x="45" y="32" fill="#34d399" font-size="10" font-weight="900">Hơi qua mũi 👃</text>
          ` : ''}
          <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm hai môi (${c}): Môi khép dính dẹp</text>
        </svg>
      `;
    }
    if (c === 'f') {
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <path d="M 58 88 C 62 82 68 76 68 73" fill="none" stroke="#fb7185" stroke-width="5" stroke-linecap="round"/>
          <circle cx="68" cy="73" r="5" fill="#f59e0b" filter="url(#glowEffect)"/>
          <path d="M 76 95 C 95 95 120 100 145 110 C 150 125 135 138 110 138 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
          <path d="M 65 74 L 30 74" stroke="url(#airGrad)" stroke-width="3.5" stroke-dasharray="4,2"/>
          <text x="5" y="70" fill="#f59e0b" font-size="10.5" font-weight="900">Hơi ma sát 💨</text>
          <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm răng môi (f): Răng trên chạm môi dưới</text>
        </svg>
      `;
    }
    if (['d', 't', 'n', 'l'].includes(c)) {
      const isT = (c === 't');
      const isN = (c === 'n');
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <path d="M 71 67 C 73 64 78 78 98 90 C 120 100 145 108 148 115 C 150 128 135 138 110 138 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
          <circle cx="71" cy="66" r="5" fill="#f59e0b" filter="url(#glowEffect)"/>
          ${isT ? `
            <path d="M 64 76 L 30 76" stroke="url(#airGrad)" stroke-width="4" stroke-linecap="round"/>
            <text x="5" y="70" fill="#ef4444" font-size="11" font-weight="900">Bật hơi 💨</text>
          ` : ''}
          ${isN ? `
            <path d="M 90 60 C 80 45 60 38 40 38" fill="none" stroke="#34d399" stroke-width="3.5" stroke-dasharray="4,2"/>
            <text x="45" y="32" fill="#34d399" font-size="10" font-weight="900">Hơi qua mũi 👃</text>
          ` : ''}
          <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm đầu lưỡi giữa (${c}): Chạm chân răng trên</text>
        </svg>
      `;
    }
    if (['g', 'k', 'h'].includes(c)) {
      const isK = (c === 'k');
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <path d="M 72 92 C 90 92 118 80 138 66 C 146 62 152 78 146 102 C 140 125 115 138 90 138 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
          <circle cx="138" cy="66" r="5.5" fill="#f59e0b" filter="url(#glowEffect)"/>
          ${isK ? `
            <path d="M 64 76 L 30 76" stroke="url(#airGrad)" stroke-width="4" stroke-linecap="round"/>
            <text x="5" y="70" fill="#ef4444" font-size="11" font-weight="900">Bật hơi mạnh 💨</text>
          ` : ''}
          <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm cuống lưỡi (${c}): Cuống lưỡi chạm vòm mềm</text>
        </svg>
      `;
    }
    if (['j', 'q', 'x'].includes(c)) {
      const isQ = (c === 'q');
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <path d="M 70 88 C 70 88 92 58 115 56 C 135 58 148 85 145 108 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
          <circle cx="106" cy="56" r="5.5" fill="#f59e0b" filter="url(#glowEffect)"/>
          ${isQ ? `
            <path d="M 64 76 L 30 76" stroke="url(#airGrad)" stroke-width="4" stroke-linecap="round"/>
            <text x="5" y="70" fill="#ef4444" font-size="11" font-weight="900">Bật hơi mạnh 💨</text>
          ` : ''}
          <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm mặt lưỡi (${c}): Mặt lưỡi áp ngạc cứng</text>
        </svg>
      `;
    }
    if (['z', 'c', 's'].includes(c)) {
      const isC = (c === 'c');
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <path d="M 71 70 L 140 73 C 148 85 145 105 140 120 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
          <circle cx="71" cy="70" r="5" fill="#f59e0b" filter="url(#glowEffect)"/>
          ${isC ? `
            <path d="M 64 76 L 30 76" stroke="url(#airGrad)" stroke-width="4" stroke-linecap="round"/>
            <text x="5" y="70" fill="#ef4444" font-size="11" font-weight="900">Bật hơi 💨</text>
          ` : ''}
          <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm đầu lưỡi trước (${c}): Lưỡi thẳng sát răng trên</text>
        </svg>
      `;
    }
    if (['zh', 'ch', 'sh', 'r'].includes(c)) {
      const isCh = (c === 'ch');
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <path d="M 92 54 C 78 68 95 85 132 90 C 146 102 142 120 128 132 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
          <circle cx="92" cy="54" r="5" fill="#f59e0b" filter="url(#glowEffect)"/>
          ${isCh ? `
            <path d="M 64 76 L 30 76" stroke="url(#airGrad)" stroke-width="4" stroke-linecap="round"/>
            <text x="2" y="70" fill="#ef4444" font-size="10.5" font-weight="900">Cong lưỡi + Bật hơi 💨</text>
          ` : ''}
          <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm cong lưỡi (${c}): Đầu lưỡi uốn cong vút</text>
        </svg>
      `;
    }
  }

  // ==========================================
  // SECTION 2: VẬN MẪU (FINALS / VOWELS)
  // ==========================================
  if (s === 'vanmau' || ['a','o','e','i','u','ü','ai','ei','ao','ou','an','en','ang','eng','ong'].some(v => c.includes(v))) {
    // Vận mẫu đơn: a, o, e, i, u, ü
    if (c === 'a') {
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <!-- Miệng mở to rộng tối đa, lưỡi nằm thấp phẳng ở đáy -->
          <path d="M 44 60 C 50 56 60 55 64 56" stroke="#fb7185" stroke-width="4"/>
          <path d="M 64 92 C 50 96 44 98 40 102" stroke="#fb7185" stroke-width="4"/>
          <path d="M 75 110 C 100 110 130 112 150 118 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
          <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm "a": Miệng mở to rộng, lưỡi hạ thấp phẳng</text>
        </svg>
      `;
    }
    if (c === 'o') {
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <!-- Môi tròn nhô ra trước, cuống lưỡi hơi nhô -->
          <circle cx="62" cy="76" r="8" fill="none" stroke="#fb7185" stroke-width="4"/>
          <path d="M 75 100 C 100 95 125 80 145 75 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
          <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm "o": Môi tròn nhô ra, cuống lưỡi hơi nhô</text>
        </svg>
      `;
    }
    if (c === 'e') {
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <!-- Miệng mở vừa, lưỡi hơi lùi đằng sau -->
          <path d="M 75 100 C 95 95 120 78 145 72 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
          <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm "e": Môi giẹp dẹt nhẹ, cuống lưỡi nhô</text>
        </svg>
      `;
    }
    if (c === 'i') {
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <!-- Môi giẹp dẹt phẳng rộng, mặt lưỡi nâng sát ngạc cứng -->
          <path d="M 70 85 C 70 85 95 58 118 56 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
          <circle cx="106" cy="56" r="4.5" fill="#f59e0b" filter="url(#glowEffect)"/>
          <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm "i": Môi dẹp rộng, mặt lưỡi sát ngạc cứng</text>
        </svg>
      `;
    }
    if (c === 'u') {
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <!-- Môi chúm tròn nhỏ nhô ra trước, cuống lưỡi nâng cao -->
          <circle cx="58" cy="76" r="5" fill="none" stroke="#fb7185" stroke-width="4"/>
          <path d="M 74 95 C 95 90 120 72 145 64 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
          <circle cx="138" cy="66" r="4.5" fill="#f59e0b" filter="url(#glowEffect)"/>
          <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm "u": Môi chúm tròn nhô ra, cuống lưỡi cao</text>
        </svg>
      `;
    }
    if (c.includes('ü')) {
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <!-- Môi chúm tròn bé như thổi sáo, lưỡi vị trí cao đằng trước như 'i' -->
          <circle cx="56" cy="76" r="4" fill="none" stroke="#fb7185" stroke-width="4"/>
          <path d="M 70 85 C 70 85 95 58 118 56 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
          <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Âm "${c}": Chúm tròn môi thổi sáo + Vị trí lưỡi âm "i"</text>
        </svg>
      `;
    }

    // Vận mẫu kép chung & Các nhóm 3, 4, 5
    return `
      <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
        ${baseProfile}
        <path d="M 72 90 C 90 75 115 65 140 70 Z" fill="url(#tongueGrad)" opacity="0.9" stroke="#38bdf8" stroke-width="2.5"/>
        <path d="M 80 85 C 100 70 120 70 135 80" stroke="url(#airGrad)" stroke-width="3" stroke-dasharray="4,2"/>
        <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Vận mẫu kép "${c}": Khẩu hình trượt chuyển tiếp mượt</text>
      </svg>
    `;
  }

  // ==========================================
  // SECTION 3: THANH ĐIỆU (TONES 1, 2, 3, 4 & NEUTRAL)
  // ==========================================
  if (s === 'thanhdieu' || ['1','2','3','4','thanh 1','thanh 2','thanh 3','thanh 4','thanh nhẹ','nhẹ'].some(t => c.includes(t))) {
    if (c.includes('1') || c.includes('yinping')) {
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <!-- Thanh 1 (55): Cao - Bằng -->
          <path d="M 125 90 L 125 115" stroke="#ef4444" stroke-width="4" filter="url(#glowEffect)"/>
          <path d="M 60 45 L 150 45" stroke="#ef4444" stroke-width="5" stroke-linecap="round" filter="url(#glowEffect)"/>
          <text x="160" y="48" fill="#ef4444" font-size="12" font-weight="900">55 ➔</text>
          <text x="100" y="152" text-anchor="middle" fill="#ef4444" font-size="10" font-weight="800">Thanh 1 (55): Âm vực cao, kéo dài bằng phẳng</text>
        </svg>
      `;
    }
    if (c.includes('2') || c.includes('yangping')) {
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <!-- Thanh 2 (35): Rút lên -->
          <path d="M 60 75 L 150 45" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" filter="url(#glowEffect)"/>
          <text x="160" y="48" fill="#38bdf8" font-size="12" font-weight="900">35 ↗</text>
          <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Thanh 2 (35): Giọng vút lên cao từ trung bình</text>
        </svg>
      `;
    }
    if (c.includes('3') || c.includes('shangsheng')) {
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <!-- Thanh 3 (214): Xuống thấp rồi vút lên -->
          <path d="M 60 70 Q 95 110 150 50" fill="none" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" filter="url(#glowEffect)"/>
          <text x="160" y="52" fill="#f59e0b" font-size="12" font-weight="900">214 ⤴</text>
          <text x="100" y="152" text-anchor="middle" fill="#f59e0b" font-size="10" font-weight="800">Thanh 3 (214): Giảm sâu xuống thấp rồi vút lên</text>
        </svg>
      `;
    }
    if (c.includes('4') || c.includes('qusheng')) {
      return `
        <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
          ${baseProfile}
          <!-- Thanh 4 (51): Đi xuống dứt khoát -->
          <path d="M 60 45 L 150 105" stroke="#a855f7" stroke-width="5" stroke-linecap="round" filter="url(#glowEffect)"/>
          <text x="160" y="108" fill="#a855f7" font-size="12" font-weight="900">51 ↘</text>
          <text x="100" y="152" text-anchor="middle" fill="#a855f7" font-size="10" font-weight="800">Thanh 4 (51): Rơi xuống nhanh & dứt khoát</text>
        </svg>
      `;
    }
    // Thanh nhẹ / Neutral tone
    return `
      <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
        ${baseProfile}
        <circle cx="100" cy="75" r="6" fill="#34d399" filter="url(#glowEffect)"/>
        <text x="100" y="152" text-anchor="middle" fill="#34d399" font-size="10" font-weight="800">Thanh nhẹ: Đọc nhẹ, ngắn & tự nhiên</text>
      </svg>
    `;
  }

  // Generic Default Fallback SVG (Always Medical Head Profile)
  return `
    <svg viewBox="0 0 200 160" width="100%" height="125" style="background: rgba(15,23,42,0.85); border-radius: 14px; padding: 2px;">
      ${baseProfile}
      <path d="M 72 85 C 95 85 125 90 145 110 Z" fill="url(#tongueGrad)" opacity="0.85" stroke="#38bdf8" stroke-width="2"/>
      <text x="100" y="152" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">Vị trí khẩu hình phát âm chuẩn</text>
    </svg>
  `;
}
