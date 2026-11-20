/**
 * Cửa hàng văn phòng phẩm: bước 扫码与打包 (Quét mã & đóng gói) sau khi giỏ hàng đúng.
 *   - Băng chuyền: bấm từng món để đưa qua máy quét → hiện tên + giá, đánh dấu đã quét.
 *   - Thỉnh thoảng có 1 món THỪA trên băng chuyền (không có trong đơn): bấm vào để bỏ ra (bị trừ điểm).
 *   - Quét đủ → bấm 打包 để cho vào túi, rồi sang thanh toán.
 */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt2 = (v) => (Math.round(Number(v) * 100) / 100).toFixed(2);

export function runScanPack(game, c, X) {
  const { byId, D, shuffle } = X;
  const body = game.$('scan-body'); if (!body) return false;
  const units = [];
  game.sel.lines.forEach((l) => { for (let k = 0; k < l.qty; k++) units.push({ id: l.id, color: l.color || null, decoy: false, done: false }); });
  if (game.day >= 2 && Math.random() < 0.4) {
    const others = game.mode.products.filter((p) => !game.sel.lines.some((l) => l.id === p.id) && game.zonesOpen.has(p.zone) && game.itemsOpen.has(p.id));
    if (others.length) units.push({ id: others[Math.floor(Math.random() * others.length)].id, color: null, decoy: true, done: false });
  }
  const belt = shuffle(units);
  const st = { wrong: 0, total: 0, last: null, packed: false };
  const real = () => belt.filter((u) => !u.decoy);
  const render = () => {
    const left = belt.filter((u) => !u.done);
    const allScanned = real().every((u) => u.done) && !belt.some((u) => u.decoy && !u.done);
    const scanned = real().filter((u) => u.done);
    body.innerHTML = '<div class="sh-scan">'
      + '<div class="sh-scan-belt"><div class="sh-scan-title">📠 <span class="zh">扫码</span> Quét mã — bấm từng món để đưa qua máy quét</div><div class="sh-scan-track">'
      + (left.length ? left.map((u) => { const p = byId[u.id]; const i = belt.indexOf(u); return '<button type="button" class="sh-scan-item" data-unit="' + i + '"><span class="ic">' + p.icon + '</span><b class="zh">' + (u.color ? esc(D.colors[u.color].zh) + '的' : '') + esc(p.chn) + '</b></button>'; }).join('') : '<small>Băng chuyền trống</small>')
      + '</div><div class="sh-scan-lane"><div class="sh-laser"></div><span>MÁY QUÉT</span></div></div>'
      + '<div class="sh-scan-pos"><div class="sh-scan-screen">' + (st.last ? '<b class="zh">' + esc(st.last.name) + '</b><span>¥' + fmt2(st.last.price) + '</span>' : '<small>Chờ quét…</small>') + '</div>'
      + '<div class="sh-scan-count">' + scanned.length + ' / ' + real().length + ' món · <b>¥' + fmt2(st.total) + '</b></div>'
      + '<div class="sh-scan-receipt">' + scanned.map((u) => { const p = byId[u.id]; return '<div><span>' + p.icon + ' ' + (u.color ? esc(D.colors[u.color].zh) + '的' : '') + esc(p.chn) + '</span><em>¥' + fmt2(p.price) + '</em></div>'; }).join('') + '</div></div></div>'
      + (allScanned ? '<button type="button" class="sh-btn sh-pack" id="btn-pack">🛍️ <span class="zh">打包</span> Cho vào túi & đóng gói</button>' : '<small class="sh-scan-hint">' + (real().every((u) => u.done) ? '⚠️ Còn món thừa trên băng chuyền — bấm vào để bỏ ra.' : 'Quét đủ tất cả món rồi mới đóng gói được.') + '</small>');
    body.querySelectorAll('[data-unit]').forEach((b) => b.addEventListener('click', () => {
      const u = belt[+b.dataset.unit]; if (!u || u.done) return;
      const p = byId[u.id];
      if (u.decoy) { u.done = true; st.wrong += 1; game.audio.error(); game.toast('⚠️', (p.vi) + ' không có trong đơn của khách — đã bỏ ra khỏi băng chuyền!', 'warn'); render(); return; }
      u.done = true; st.total += p.price; st.last = { name: (u.color ? D.colors[u.color].zh + '的' : '') + p.chn, price: p.price };
      game.audio.tone(1760, 0.1, { vol: 0.25 }); game.learn(p.chn); render();
    }));
    const pack = body.querySelector('#btn-pack');
    if (pack) pack.addEventListener('click', () => {
      if (st.packed) return; st.packed = true; pack.disabled = true; pack.textContent = '🛍️ Đang đóng gói…';
      game.audio.register(); game.audio.speak('打包');
      body.querySelector('.sh-scan').classList.add('packing');
      setTimeout(() => { game.closeModal('m-scan'); game.finishScan(c, { wrong: st.wrong }); }, 900);
    });
  };
  game.openModal('m-scan');
  render();
  return true;
}
