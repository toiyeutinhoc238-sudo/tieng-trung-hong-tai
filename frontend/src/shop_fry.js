/**
 * Cá Viên: chảo chiên có THANG ĐO (xanh = bình thường · cam = giòn hơn · đỏ = cháy khét) và phần bên phải màn "Chiên & gói".
 * Người chơi bấm "Thả vào chảo", kim chạy từ trái sang phải, bấm "Vớt ra" đúng lúc theo yêu cầu của khách.
 */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const FRY_MS = 6500;                           // kim chạy hết thang trong 6,5 giây
// ranh giới các vùng trên thang (0 → 1)
export const FRY_ZONES = [
  { id: 'raw', to: 0.2, w: 20 },
  { id: 'normal', to: 0.5, w: 30 },
  { id: 'crisp', to: 0.78, w: 28 },
  { id: 'burnt', to: 1.01, w: 22 }
];
export const fryZoneAt = (p) => FRY_ZONES.find((z) => p < z.to).id;
export const FRY_LABEL = {
  raw: '⚪ Còn sống — chiên lại nhé!',
  normal: '🟢 Vàng đều, chín vừa (bình thường)',
  crisp: '🟠 Vàng giòn — giòn hơn',
  burnt: '🔴 Cháy khét rồi! Chiên lại nhé'
};

export function fryerHtml(sel, needed) {
  if (!needed) return '<div class="sh-panel sh-fryer off"><div class="sh-lbl">🔥 Chảo chiên <span class="zh">油炸</span></div><small>Đơn này không có món chiên — khỏi chiên nhé.</small></div>';
  const state = sel.frying ? '🔥 Đang chiên… bấm <b>Vớt ra</b> khi kim tới đúng vùng khách muốn!' : sel.fry ? '<b class="fz ' + sel.fry + '">' + FRY_LABEL[sel.fry] + '</b>' : 'Bấm <b>Thả vào chảo</b> rồi vớt đúng lúc theo lời khách.';
  const btn = sel.frying ? '<button type="button" class="sh-btn small stop" data-fry-stop>✋ Vớt ra!</button>'
    : sel.fry ? '<button type="button" class="sh-btn small ghost" data-fry-again>🔁 Chiên lại</button>'
      : '<button type="button" class="sh-btn small" data-fry-start>🍤 Thả vào chảo</button>';
  return '<div class="sh-panel sh-fryer"><div class="sh-lbl">🔥 Chảo chiên <span class="zh">油炸</span></div>'
    + '<div class="sh-gauge"><div class="sh-gzones">' + FRY_ZONES.map((z) => '<i class="z ' + z.id + '" style="flex:' + z.w + '"></i>').join('') + '</div><b class="sh-gmark" id="fry-mark" style="left:' + (sel.fryP != null ? Math.min(100, sel.fryP * 100) : 0) + '%"></b></div>'
    + '<div class="sh-glegend"><span>Sống</span><span class="g">Bình thường</span><span class="o">Giòn hơn</span><span class="r">Cháy khét</span></div>'
    + '<div class="sh-fry-state" id="fry-state">' + state + '</div>' + btn + '</div>';
}

// gắn nút + chạy kim; redraw() vẽ lại màn chuẩn bị
export function bindFryer(root, game, sel, redraw) {
  const stop = (p) => {
    sel.frying = false; sel.fryP = p; sel.fry = fryZoneAt(p);
    if (sel.fry === 'burnt') game.audio.error(); else game.audio.register();
    redraw(); game.selChanged();
  };
  const loop = () => {
    const mark = document.getElementById('fry-mark');
    if (!sel.frying || game.sel !== sel || !mark) return;
    const p = Math.min(1, (performance.now() - sel.fryStart) / FRY_MS);
    mark.style.left = (p * 100) + '%';
    if (p >= 1) { stop(1); return; }
    requestAnimationFrame(loop);
  };
  const start = root.querySelector('[data-fry-start]');
  if (start) start.addEventListener('click', () => { sel.frying = true; sel.fry = null; sel.fryP = null; sel.fryStart = performance.now(); game.audio.pop(); redraw(); game.selChanged(); requestAnimationFrame(loop); });
  const halt = root.querySelector('[data-fry-stop]');
  if (halt) halt.addEventListener('click', () => stop(Math.min(1, (performance.now() - sel.fryStart) / FRY_MS)));
  const again = root.querySelector('[data-fry-again]');
  if (again) again.addEventListener('click', () => { sel.fry = null; sel.fryP = null; sel.frying = false; game.audio.pop(); redraw(); game.selChanged(); });
  if (sel.frying) requestAnimationFrame(loop);   // vẽ lại giữa lúc đang chiên: kim chạy tiếp
}

// Bên phải màn "Chiên & gói": khay + cách dùng + chảo chiên có thang đo
export function renderCavienSide(side, { game, sel, draw, byId, sById, SERVE, SAUCE_ICON, order }) {
  const needFry = !!(order && order.fry !== 'none');
  side.innerHTML = fryerHtml(sel, needFry)
    + '<div class="sh-panel"><div class="sh-lbl">📦 Cách dùng <span class="zh">打包 / 堂食</span></div><div class="sh-chips"><button type="button" class="sh-chip ' + (sel.serve === 'take' ? 'on' : '') + '" data-serve="take">🛍️ Mang đi <span class="zh">打包</span></button><button type="button" class="sh-chip ' + (sel.serve === 'dine' ? 'on' : '') + '" data-serve="dine">🍽️ Ăn tại đây <span class="zh">在这里吃</span></button></div></div>';
  side.querySelectorAll('[data-serve]').forEach((b) => b.addEventListener('click', () => { sel.serve = b.dataset.serve; game.audio.pop(); game.audio.speak(SERVE[sel.serve][0].replace('我要', '').replace('我在', '')); draw(); game.selChanged(); }));
  bindFryer(side, game, sel, draw);
}
