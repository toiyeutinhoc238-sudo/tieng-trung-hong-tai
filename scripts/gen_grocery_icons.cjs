// Vẽ hình (SVG) cho từng món Tiệm Tạp Hóa — mỗi món trong "Tạp hóa.xlsx" đúng 1 hình, đúng món đó.
// Món đóng gói (chai, gói, hộp, lon…) có in tên tiếng Trung trên nhãn để không nhầm món.
// Cách dùng (ở thư mục gốc dự án):  node scripts/gen_grocery_icons.cjs
// → ghi frontend/public/assets/grocery/<mã>.svg (+ bản sao frontend/assets/grocery cho chế độ mở file trực tiếp)
// Thêm món mới vào Excel thì thêm 1 dòng vào ICONS bên dưới (mã món viết thường), script sẽ báo nếu thiếu.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = [path.join(ROOT, 'frontend/public/assets/grocery'), path.join(ROOT, 'frontend/assets/grocery')];

const INK = '#5a3418';
const SW = 2.2;
const FONT = "'PingFang SC','Microsoft YaHei','Noto Sans CJK SC','Hiragino Sans GB',sans-serif";
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${body}</svg>`;
const st = (fill) => `fill="${fill}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"`;
// nhãn chữ Hán: tự co cỡ chữ theo số chữ & bề rộng nhãn
const txt = (x, y, w, s, color = '#fff', max = 11) => {
  const size = Math.min(max, (w * 0.92) / Math.max(1, s.length));
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size.toFixed(1)}" font-weight="700" fill="${color}" text-anchor="middle" dominant-baseline="central">${s}</text>`;
};
const shine = (x, y, h) => `<path d="M${x} ${y} v${h}" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/>`;

// ---------- KHUÔN HÌNH ----------
// chai nhựa (nước, nước ngọt): body + nắp + nhãn
function bottle({ liquid, cap, label, text, textColor = '#fff', neck = 'M26 14h12v6l4 6v28a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4V26l4-6z', glass }) {
  return svg(`
    <rect x="27" y="7" width="10" height="7" rx="1.5" ${st(cap)}/>
    <path d="${neck}" ${st(liquid)}/>
    ${glass ? `<path d="M24 30h16" stroke="${INK}" stroke-width="1.2" opacity=".35"/>` : ''}
    <rect x="22" y="33" width="20" height="13" ${st(label)}/>
    ${txt(32, 39.5, 19, text, textColor)}
    ${shine(25, 27, 4)}`);
}
// chai gia vị cổ dài (nước mắm, xì dầu)
function sauceBottle({ liquid, cap, label, text, textColor = '#fff' }) {
  return svg(`
    <rect x="28.5" y="5" width="7" height="6" rx="1" ${st(cap)}/>
    <path d="M29 11h6v9l5 7v27a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4V27l5-7z" ${st(liquid)}/>
    <rect x="24" y="34" width="16" height="15" ${st(label)}/>
    ${txt(32, 41.5, 15, text, textColor)}
    ${shine(27, 28, 4)}`);
}
// can nhựa có quai (dầu ăn, nước giặt)
function jug({ liquid, cap, label, text, textColor = '#fff' }) {
  return svg(`
    <path d="M40 16h6a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5h-2" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
    <rect x="22" y="7" width="10" height="7" rx="1.5" ${st(cap)}/>
    <path d="M18 18q0-4 4-4h20q4 0 4 4v36q0 4-4 4H22q-4 0-4-4z" ${st(liquid)}/>
    <rect x="20" y="30" width="24" height="16" rx="1.5" ${st(label)}/>
    ${txt(32, 38, 22, text, textColor)}
    ${shine(22, 19, 7)}`);
}
// chai có vòi bơm (dầu gội, sữa tắm, nước rửa tay)
function pump({ body, label, text, textColor = '#fff', w = 22, h = 34 }) {
  const x = 32 - w / 2, y = 60 - h;
  return svg(`
    <path d="M30 ${y - 4}v-6h-6" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round"/>
    <rect x="28" y="${y - 10}" width="8" height="5" rx="1" ${st('#e8e8e8')}/>
    <rect x="${x + w / 2 - 6}" y="${y - 5}" width="12" height="6" rx="1.5" ${st('#f2f2f2')}/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" ${st(body)}/>
    <rect x="${x + 2}" y="${y + h * 0.35}" width="${w - 4}" height="${h * 0.38}" rx="1.5" ${st(label)}/>
    ${txt(32, y + h * 0.54, w - 5, text, textColor)}
    ${shine(x + 4, y + 5, 6)}`);
}
// chai bóp nắp bật (nước rửa chén)
function squeeze({ body, label, text, textColor = '#fff' }) {
  return svg(`
    <path d="M29 6h6l1 7h-8z" ${st('#ffffff')}/>
    <path d="M24 13h16l2 6v35a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4V19z" ${st(body)}/>
    <rect x="24" y="30" width="16" height="15" rx="1.5" ${st(label)}/>
    ${txt(32, 37.5, 15, text, textColor)}
    ${shine(26, 20, 6)}`);
}
// hộp giấy mái nhọn (sữa, nước cam)
function carton({ body, roof, label, text, textColor = '#fff', icon = '' }) {
  return svg(`
    <path d="M20 22l6-12h12l6 12z" ${st(roof)}/>
    <path d="M26 10h12" stroke="${INK}" stroke-width="${SW}"/>
    <rect x="20" y="22" width="24" height="36" rx="1.5" ${st(body)}/>
    <rect x="22" y="38" width="20" height="14" rx="1.5" ${st(label)}/>
    ${txt(32, 45, 18, text, textColor)}
    ${icon}`);
}
// gói/túi có mép răng cưa trên & dưới (mì gói, snack, kẹo, muối, đường…)
function pouch({ body, label, text, textColor = '#fff', w = 32, h = 42, icon = '', labelY }) {
  const x = 32 - w / 2, y = 34 - h / 2;
  const zig = (yy) => { let d = `M${x} ${yy}`; for (let i = 0; i < w; i += 4) d += ` l2 -2 l2 2`; return d; };
  const ly = labelY ?? (y + h * 0.5);
  return svg(`
    <path d="M${x} ${y + 4} Q${x - 2} ${y + h / 2} ${x} ${y + h - 4} L${x + w} ${y + h - 4} Q${x + w + 2} ${y + h / 2} ${x + w} ${y + 4} z" ${st(body)}/>
    <path d="${zig(y + 4)}" fill="none" stroke="${INK}" stroke-width="1.6"/>
    <path d="${zig(y + h - 4)}" fill="none" stroke="${INK}" stroke-width="1.6"/>
    ${icon}
    <rect x="${x + 3}" y="${ly - 6}" width="${w - 6}" height="12" rx="2" ${st(label)}/>
    ${txt(32, ly, w - 8, text, textColor)}`);
}
// bao lớn (gạo, bột giặt) có nút buộc / quai
function sack({ body, label, text, textColor = '#fff', icon = '' }) {
  return svg(`
    <path d="M18 14q14 -6 28 0l3 40q0 4 -4 4H19q-4 0 -4 -4z" ${st(body)}/>
    <path d="M18 14q14 5 28 0" fill="none" stroke="${INK}" stroke-width="1.6"/>
    <path d="M27 10q5 -6 10 0" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
    ${icon}
    <rect x="20" y="34" width="24" height="14" rx="2" ${st(label)}/>
    ${txt(32, 41, 22, text, textColor)}`);
}
// hộp chữ nhật nhìn nghiêng 3/4 (trà, bơ, khẩu trang…)
function box({ front, top, side, label, text, textColor = '#fff', icon = '', x = 14, y = 22, w = 30, h = 32, d = 8 }) {
  return svg(`
    <path d="M${x} ${y}l${d} -${d}h${w}l-${d} ${d}z" ${st(top)}/>
    <path d="M${x + w} ${y}l${d} -${d}v${h}l-${d} ${d}z" ${st(side)}/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" ${st(front)}/>
    ${icon}
    <rect x="${x + 3}" y="${y + h - 15}" width="${w - 6}" height="12" rx="1.5" ${st(label)}/>
    ${txt(x + w / 2, y + h - 9, w - 8, text, textColor)}`);
}

// ---------- 54 MÓN (mã viết thường = mã trong Excel) ----------
const ICONS = {
  // 食品调料 · Đồ ăn & gia vị
  tp001: sack({ body: '#f3ead2', label: '#d64545', text: '大米', icon: `<g fill="#fff" stroke="${INK}" stroke-width="1"><ellipse cx="26" cy="25" rx="2" ry="3"/><ellipse cx="32" cy="23" rx="2" ry="3"/><ellipse cx="38" cy="25" rx="2" ry="3"/><ellipse cx="29" cy="29" rx="2" ry="3"/><ellipse cx="35" cy="29" rx="2" ry="3"/></g>` }),
  tp002: pouch({ body: '#f2c14e', label: '#d2342f', text: '方便面', w: 40, h: 34, labelY: 42, icon: `<path d="M20 26q3 -4 6 0t6 0t6 0t6 0" fill="none" stroke="${INK}" stroke-width="1.8"/><path d="M20 31q3 -4 6 0t6 0t6 0t6 0" fill="none" stroke="${INK}" stroke-width="1.8"/>` }),
  tp003: svg(`<path d="M12 34q0-16 20-16t20 16v14q0 6-6 6H18q-6 0-6-6z" ${st('#e0a35a')}/><path d="M12 34q0-16 20-16t20 16" fill="#f0c27e" stroke="${INK}" stroke-width="${SW}"/><path d="M22 26l3 6M31 24l2 7M40 26l-2 6" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`),
  tp004: svg(`<rect x="8" y="34" width="48" height="18" rx="3" ${st('#d9c4a3')}/>${[14, 26, 38, 50].map(cx => `<ellipse cx="${cx}" cy="30" rx="5.5" ry="7" ${st('#fff7ea')}/>`).join('')}<path d="M8 40h48" stroke="${INK}" stroke-width="1.4"/>${txt(32, 46, 30, '鸡蛋', INK)}`),
  tp005: svg(`<path d="M14 46c-4-4-2-10 4-12l24-14c6-3 12 0 12 5s-2 6-6 9L24 48c-4 2-8 1-10-2z" ${st('#c8553d')}/><path d="M22 40l4-2M30 35l4-2M38 30l4-2" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/><path d="M50 21l5-5M12 49l-4 4" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`),
  tp006: svg(`<rect x="10" y="14" width="44" height="38" rx="5" ${st('#f4dfe0')}/><ellipse cx="32" cy="30" rx="15" ry="10" ${st('#f08aa0')}/><ellipse cx="32" cy="30" rx="9" ry="5.5" fill="#f7b3c1"/><rect x="14" y="41" width="36" height="8" rx="2" ${st('#c2185b')}/>${txt(32, 45, 30, '火腿', '#fff', 8)}`),
  tp007: svg(`<ellipse cx="32" cy="22" rx="18" ry="6" ${st('#d9dde3')}/><path d="M14 22v24q0 6 18 6t18-6V22" ${st('#2f7fbf')}/><ellipse cx="32" cy="22" rx="13" ry="3.6" fill="none" stroke="${INK}" stroke-width="1.2"/><path d="M20 36q6-6 13 0q-7 6-13 0zM33 36l6-4v8z" fill="#fff" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>${txt(32, 46, 22, '罐头鱼', '#fff', 7)}`),
  tp008: pouch({ body: '#e7c58e', label: '#8b4a1f', text: '饼干', icon: [22, 32, 42].map(cx => `<circle cx="${cx}" cy="26" r="4.5" fill="#d9a35b" stroke="${INK}" stroke-width="1.3"/><circle cx="${cx - 1.5}" cy="25" r=".9" fill="${INK}"/><circle cx="${cx + 1.5}" cy="27" r=".9" fill="${INK}"/>`).join('') }),
  tp009: pouch({ body: '#f6d34c', label: '#2e7d32', text: '薯片', w: 34, h: 46, icon: `<path d="M22 24q5-6 10 0q-5 5-10 0zM33 22q5-6 10 0q-5 5-10 0z" fill="#ffe9a3" stroke="${INK}" stroke-width="1.3"/>` }),
  tp010: pouch({ body: '#f9c6d6', label: '#c2185b', text: '糖果', icon: `<g stroke="${INK}" stroke-width="1.2"><path d="M18 25l4-3v6zM30 25l-4-3v6z" fill="#ff6f91"/><circle cx="24" cy="25" r="3.5" fill="#ff8fab"/><path d="M34 25l4-3v6zM46 25l-4-3v6z" fill="#4fc3f7"/><circle cx="40" cy="25" r="3.5" fill="#81d4fa"/></g>` }),
  tp011: svg(`<path d="M14 18h30l6 6v26H14z" ${st('#c0c6ce')}/><rect x="14" y="26" width="36" height="28" rx="1" ${st('#6b3a1f')}/><path d="M26 26v28M38 26v28M14 40h36" stroke="#4a250f" stroke-width="1.6"/><rect x="18" y="30" width="24" height="7" rx="1.5" fill="#d9a35b" stroke="${INK}" stroke-width="1.2"/>${txt(30, 33.5, 22, '巧克力', INK, 6)}`),
  tp012: pouch({ body: '#f3e2c0', label: '#a0522d', text: '花生', icon: `<g fill="#e4b97a" stroke="${INK}" stroke-width="1.3"><path d="M20 25q0-5 4-5t4 3q0 2 2 2t2 3q0 4-4 4t-4-3q0-2-2-2t-2-2z"/><path d="M34 25q0-5 4-5t4 3q0 2 2 2t2 3q0 4-4 4t-4-3q0-2-2-2t-2-2z"/></g>` }),
  tp013: svg(`<rect x="22" y="22" width="20" height="34" rx="4" ${st('#ffffff')}/><path d="M22 30h20" stroke="${INK}" stroke-width="1.4"/><path d="M24 22q8-14 16 0" ${st('#90caf9')}/>${[27, 32, 37].map(x => `<circle cx="${x}" cy="16" r="1.2" fill="${INK}"/>`).join('')}<rect x="24" y="38" width="16" height="11" rx="1.5" ${st('#1e88e5')}/>${txt(32, 43.5, 14, '盐', '#fff')}`),
  tp014: pouch({ body: '#ffffff', label: '#f57c00', text: '糖', icon: `<g fill="#fff" stroke="${INK}" stroke-width="1.2"><rect x="21" y="20" width="7" height="7" rx="1"/><rect x="29" y="22" width="7" height="7" rx="1"/><rect x="37" y="20" width="7" height="7" rx="1"/></g>` }),
  tp015: sauceBottle({ liquid: '#c9822b', cap: '#d32f2f', label: '#fff3c4', text: '鱼露', textColor: '#b71c1c' }),
  tp016: sauceBottle({ liquid: '#3e2212', cap: '#d32f2f', label: '#fbe9a7', text: '酱油', textColor: '#b71c1c' }),
  tp017: jug({ liquid: '#f4c430', cap: '#e65100', label: '#2e7d32', text: '食用油' }),
  // 饮料 · Đồ uống
  du001: bottle({ liquid: '#bfe6ff', cap: '#1565c0', label: '#1e88e5', text: '矿泉水' }),
  du002: bottle({ liquid: '#e3f6ff', cap: '#26a69a', label: '#00897b', text: '纯净水' }),
  du003: bottle({ liquid: '#4a1f12', cap: '#d32f2f', label: '#e53935', text: '可乐' }),
  du004: svg(`<rect x="20" y="12" width="24" height="44" rx="5" ${st('#43a047')}/><ellipse cx="32" cy="12" rx="12" ry="3" ${st('#cfd8dc')}/><rect x="29" y="9.5" width="6" height="3" rx="1" fill="#90a4ae" stroke="${INK}" stroke-width="1"/><rect x="20" y="26" width="24" height="14" ${st('#c8e6c9')}/>${txt(32, 33, 22, '汽水', '#1b5e20')}<g fill="#fff" opacity=".85"><circle cx="25" cy="47" r="1.4"/><circle cx="30" cy="50" r="1"/><circle cx="37" cy="46" r="1.3"/></g>`),
  du005: carton({ body: '#ffb74d', roof: '#fb8c00', label: '#fff3e0', text: '橙汁', textColor: '#e65100', icon: `<circle cx="32" cy="30" r="5" fill="#ff9800" stroke="${INK}" stroke-width="1.3"/><path d="M32 25v-2" stroke="#2e7d32" stroke-width="2" stroke-linecap="round"/>` }),
  du006: carton({ body: '#ffffff', roof: '#64b5f6', label: '#1e88e5', text: '牛奶', icon: `<path d="M24 32q3-5 6 0t6 0t6 0" fill="none" stroke="#64b5f6" stroke-width="2"/>` }),
  du007: bottle({ liquid: '#f6efd9', cap: '#8d6e63', label: '#c8a165', text: '豆浆', neck: 'M26 14h12v4l4 4v32a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4V22l4-4z' }),
  du008: svg(`<path d="M18 8h28l-2 48H20z" ${st('#5d4037')}/><path d="M18 8l2 5h24l2-5" fill="none" stroke="${INK}" stroke-width="1.4"/><path d="M19.6 52h24.8" stroke="${INK}" stroke-width="1.4"/><ellipse cx="32" cy="24" rx="7" ry="4.5" fill="#a1683a" stroke="${INK}" stroke-width="1.3"/><path d="M32 20v8" stroke="${INK}" stroke-width="1.2"/><rect x="21" y="34" width="22" height="12" rx="1.5" ${st('#ffcc80')}/>${txt(32, 40, 20, '咖啡', '#4e342e')}`),
  du009: box({ front: '#558b2f', top: '#7cb342', side: '#33691e', label: '#f1f8e9', text: '茶', textColor: '#33691e', icon: `<path d="M22 30q7-10 14 0q-7 6-14 0z" fill="#aed581" stroke="${INK}" stroke-width="1.3"/><path d="M22 30h14" stroke="${INK}" stroke-width="1"/>` }),
  // 冷藏食品 · Sữa & thực phẩm lạnh
  sl001: svg(`<path d="M16 22h32l-4 34H20z" ${st('#ffffff')}/><ellipse cx="32" cy="22" rx="16" ry="4" ${st('#cfd8dc')}/><path d="M38 21q6-8 12-4" fill="none" stroke="${INK}" stroke-width="1.6"/><rect x="19" y="33" width="26" height="12" rx="1.5" ${st('#ec407a')}/>${txt(32, 39, 24, '酸奶', '#fff')}<circle cx="27" cy="51" r="2" fill="#f48fb1"/><circle cx="36" cy="51" r="2" fill="#f48fb1"/>`),
  sl002: svg(`<path d="M8 44L46 18l10 10v20H8z" ${st('#ffd54f')}/><path d="M8 44l38-26 10 10" fill="#ffe082" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M8 44h48" stroke="${INK}" stroke-width="${SW}"/><circle cx="22" cy="49" r="2.6" fill="#f9a825"/><circle cx="38" cy="45" r="2" fill="#f9a825"/><circle cx="48" cy="51" r="2.2" fill="#f9a825"/><circle cx="34" cy="31" r="2.2" fill="#f9a825"/>`),
  sl003: box({ front: '#fff59d', top: '#fff9c4', side: '#fdd835', label: '#1565c0', text: '黄油', icon: `<rect x="20" y="25" width="18" height="8" rx="2" fill="#ffee58" stroke="${INK}" stroke-width="1.3"/>` }),
  sl004: svg(`<path d="M22 30l10 28 10-28z" ${st('#e0a35a')}/><path d="M25 34l12 8M27 42l8-6M30 50l4-3" stroke="${INK}" stroke-width="1.2"/><circle cx="32" cy="22" r="11" ${st('#fbe9e7')}/><circle cx="25" cy="27" r="6" ${st('#f8bbd0')}/><circle cx="39" cy="27" r="6" ${st('#d7ccc8')}/><circle cx="32" cy="11" r="3" fill="#e53935" stroke="${INK}" stroke-width="1.2"/>`),
  // 日用清洁 · Đồ vệ sinh & gia dụng
  gd001: sack({ body: '#e3f2fd', label: '#1565c0', text: '洗衣粉', icon: `<g fill="#90caf9" stroke="${INK}" stroke-width="1"><circle cx="26" cy="25" r="3"/><circle cx="33" cy="22" r="4"/><circle cx="39" cy="27" r="3"/></g>` }),
  gd002: jug({ liquid: '#4fc3f7', cap: '#1565c0', label: '#ffffff', text: '洗衣液', textColor: '#1565c0' }),
  gd003: squeeze({ body: '#aed581', label: '#ffffff', text: '洗洁精', textColor: '#2e7d32' }),
  gd004: pouch({ body: '#e1f5fe', label: '#0288d1', text: '纸巾', w: 40, h: 30, labelY: 40, icon: `<path d="M28 21q4-6 8 0" fill="#fff" stroke="${INK}" stroke-width="1.5"/><path d="M24 22h16" stroke="${INK}" stroke-width="1.2"/>` }),
  gd005: svg(`${[[12, 30], [28, 30], [44, 30], [20, 14], [36, 14]].map(([x, y]) => `<rect x="${x}" y="${y}" width="15" height="18" rx="2" ${st('#ffffff')}/><ellipse cx="${x + 7.5}" cy="${y}" rx="7.5" ry="2.6" fill="#f5f5f5" stroke="${INK}" stroke-width="1.4"/><ellipse cx="${x + 7.5}" cy="${y}" rx="2.2" ry="1" fill="#bdbdbd"/>`).join('')}<rect x="10" y="46" width="44" height="10" rx="2" ${st('#7e57c2')}/>${txt(32, 51, 40, '卫生纸', '#fff', 7.5)}`),
  gd006: svg(`<rect x="12" y="20" width="30" height="26" rx="13" ${st('#37474f')}/><ellipse cx="27" cy="33" rx="5" ry="6" fill="#263238" stroke="${INK}" stroke-width="1.2"/><path d="M40 26h12a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2H40z" ${st('#455a64')}/><path d="M42 34h10M42 42h10" stroke="#90a4ae" stroke-width="1.2"/><rect x="10" y="48" width="30" height="9" rx="2" ${st('#ffffff')}/>${txt(25, 52.5, 28, '垃圾袋', '#263238', 7)}`),
  gd007: svg(`${[14, 34].map(x => `<rect x="${x}" y="14" width="16" height="40" rx="3" ${st('#212121')}/><rect x="${x}" y="14" width="16" height="12" rx="3" fill="#fbc02d" stroke="${INK}" stroke-width="${SW}"/><rect x="${x + 5}" y="9" width="6" height="5" rx="1" ${st('#bdbdbd')}/><path d="M${x + 8} 34v8M${x + 4} 38h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`).join('')}`),
  gd008: svg(`<rect x="22" y="22" width="20" height="34" rx="4" ${st('#e53935')}/><rect x="22" y="14" width="20" height="9" rx="1.5" ${st('#cfd8dc')}/><rect x="26" y="16" width="5" height="5" rx="1" fill="#90a4ae"/><path d="M35 14q-3-6 1-10q4 4 1 10z" fill="#ff9800" stroke="${INK}" stroke-width="1.2"/><path d="M35 13q-1-3 1-5q1 3 0 5z" fill="#ffeb3b"/>${shine(26, 30, 10)}`),
  // 个人护理 · Chăm sóc cá nhân
  cn001: svg(`<path d="M8 26h38l8 6-8 6H8q-3 0-3-6t3-6z" ${st('#ffffff')}/><rect x="52" y="29" width="6" height="6" rx="1" ${st('#e53935')}/><path d="M8 26q-3 0-3 6t3 6" fill="#e53935" stroke="${INK}" stroke-width="${SW}"/><rect x="14" y="27.5" width="26" height="9" rx="1.5" fill="#e53935" stroke="${INK}" stroke-width="1.2"/>${txt(27, 32, 24, '牙膏', '#fff', 7)}<path d="M18 44q14 6 28 0" fill="none" stroke="#90caf9" stroke-width="3" stroke-linecap="round" opacity=".0"/>`),
  cn002: svg(`<path d="M6 44l34-14" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M6 44l34-14" stroke="#4fc3f7" stroke-width="4.4" stroke-linecap="round"/><rect x="38" y="22" width="20" height="8" rx="2" transform="rotate(-22 48 26)" ${st('#ffffff')}/>${[0, 1, 2, 3, 4].map(i => `<path d="M${41 + i * 3.6} ${23.6 - i * 1.45}v-7" stroke="#26c6da" stroke-width="2" stroke-linecap="round" transform="rotate(-22 48 26)"/>`).join('')}`),
  cn003: pump({ body: '#7e57c2', label: '#ffffff', text: '洗发水', textColor: '#5e35b1' }),
  cn004: pump({ body: '#f48fb1', label: '#ffffff', text: '沐浴露', textColor: '#c2185b', w: 24, h: 36 }),
  cn005: svg(`<rect x="10" y="22" width="44" height="28" rx="12" ${st('#ffe0b2')}/><rect x="14" y="26" width="36" height="20" rx="9" fill="#ffcc80" stroke="${INK}" stroke-width="1.3"/>${txt(32, 36, 30, '香皂', '#e65100', 10)}<g fill="#fff" stroke="${INK}" stroke-width="1"><circle cx="46" cy="16" r="4"/><circle cx="53" cy="12" r="2.5"/><circle cx="40" cy="12" r="2"/></g>`),
  cn006: pump({ body: '#4db6ac', label: '#ffffff', text: '洗手液', textColor: '#00796b', w: 22, h: 30 }),
  cn007: svg(`<rect x="8" y="20" width="48" height="12" rx="4" ${st('#8d6e63')}/>${Array.from({ length: 13 }, (_, i) => `<path d="M${12 + i * 3.4} 32v${i < 6 ? 14 : 10}" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`).join('')}${shine(12, 24, 0)}`),
  cn008: svg(`<path d="M14 22q18-6 36 0v18q-18 12-36 0z" ${st('#e3f2fd')}/><path d="M16 28q16-4 32 0M16 34q16-4 32 0" fill="none" stroke="#90caf9" stroke-width="1.6"/><path d="M14 24q-10 2-8 10t8 4M50 24q10 2 8 10t-8 4" fill="none" stroke="${INK}" stroke-width="1.8"/><rect x="20" y="46" width="24" height="10" rx="2" ${st('#1e88e5')}/>${txt(32, 51, 22, '口罩', '#fff', 8)}`),
  // 文具 · Văn phòng phẩm & đồ dùng
  vp001: svg(`<path d="M14 52l4-10 28-28 6 6-28 28z" ${st('#1e88e5')}/><path d="M14 52l4-10 6 6z" ${st('#f5deb3')}/><path d="M14 52l1.8-4.5 2.7 2.7z" fill="${INK}"/><path d="M40 20l6 6" stroke="${INK}" stroke-width="1.4"/><path d="M44 10l10 10" stroke="#90a4ae" stroke-width="3" stroke-linecap="round"/>`),
  vp002: svg(`<path d="M12 52l4-11 30-30 7 7-30 30z" ${st('#fdd835')}/><path d="M12 52l4-11 7 7z" ${st('#f5deb3')}/><path d="M12 52l1.8-5 3.2 3.2z" fill="#424242"/><path d="M42 15l7 7" stroke="#bdbdbd" stroke-width="3"/><path d="M46 11l7 7" stroke="#f48fb1" stroke-width="4" stroke-linecap="round"/><path d="M20 39l26-26M23 42l26-26" stroke="#f9a825" stroke-width="1"/>`),
  vp003: svg(`<path d="M10 40l20-20 24 0-20 20z" ${st('#f8bbd0')}/><path d="M10 40v8h24v-8M34 48l20-20v-8" ${st('#f48fb1')}/><path d="M10 40h24l20-20" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M22 40v8M22 40l20-20" stroke="${INK}" stroke-width="1.2"/><rect x="24" y="41" width="10" height="7" fill="#64b5f6" opacity=".9"/>${txt(32, 30, 18, '橡皮', INK, 7)}`),
  vp004: svg(`<rect x="16" y="8" width="36" height="48" rx="3" ${st('#3949ab')}/>${[14, 22, 30, 38, 46].map(y => `<path d="M12 ${y}h8" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`).join('')}<rect x="24" y="16" width="22" height="12" rx="1.5" ${st('#ffffff')}/>${txt(35, 22, 20, '笔记本', '#3949ab', 6.5)}<path d="M46 8v14l3-3 3 3V8" fill="#e53935" stroke="${INK}" stroke-width="1.2"/>`),
  vp005: svg(`<rect x="12" y="10" width="40" height="46" rx="2" ${st('#81c784')}/><rect x="18" y="16" width="28" height="12" rx="1.5" ${st('#ffffff')}/>${txt(32, 22, 26, '作业本', '#2e7d32', 7.5)}<g stroke="#2e7d32" stroke-width="1" opacity=".75"><path d="M18 34h28M18 40h28M18 46h28M24 32v18M32 32v18M40 32v18"/></g>`),
  vp006: svg(`<circle cx="30" cy="32" r="20" ${st('#d7ccc8')}/><circle cx="30" cy="32" r="10" ${st('#ffffff')}/><path d="M48 40l10 4v10l-12-6z" ${st('#d7ccc8')}/><path d="M14 22q6-8 16-10" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>${txt(30, 32, 16, '胶带', '#6d4c41', 6.5)}`),
  vp007: svg(`<path d="M30 30L52 10M34 30L52 50" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M30 30L52 10M34 30L52 50" stroke="#cfd8dc" stroke-width="3.6" stroke-linecap="round"/><circle cx="18" cy="20" r="8" ${st('#e53935')}/><circle cx="18" cy="44" r="8" ${st('#e53935')}/><circle cx="18" cy="20" r="3.6" fill="#fff" stroke="${INK}" stroke-width="1.2"/><circle cx="18" cy="44" r="3.6" fill="#fff" stroke="${INK}" stroke-width="1.2"/><path d="M24 25l8 5M24 39l8-5" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="30" r="2" fill="${INK}"/>`),
  vp008: svg(`<path d="M14 22h36l-2 34H16z" ${st('#ffffff')}/><path d="M14 22l4-10h6l2 10M50 22l-4-10h-6l-2 10" fill="#ffffff" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M24 12v4a8 8 0 0 0 16 0v-4" fill="none" stroke="${INK}" stroke-width="1.4"/><path d="M20 30q12 4 24 0" fill="none" stroke="#e0e0e0" stroke-width="2"/>${txt(32, 42, 26, '塑料袋', '#e53935', 7.5)}`)
};

module.exports = { ICONS };
if (require.main === module) {
  OUT.forEach(d => fs.mkdirSync(d, { recursive: true }));
  for (const [id, s] of Object.entries(ICONS)) for (const d of OUT) fs.writeFileSync(path.join(d, `${id}.svg`), s);
  console.log(`OK: ${Object.keys(ICONS).length} hình → ${OUT.map(d => path.relative(ROOT, d)).join(', ')}`);
}
