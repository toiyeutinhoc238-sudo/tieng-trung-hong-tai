/**
 * Cá Viên: thang đo độ chiên (xanh = bình thường · cam = giòn hơn · đỏ = cháy khét).
 * Người chơi bấm "开始油炸", kim chạy từ trái sang phải, bấm "停止" đúng lúc theo yêu cầu của khách.
 */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const FRY_MS = 6500;                           // kim chạy hết thang trong 6,5 giây
// ranh giới các vùng trên thang (0 → 1)
export const FRY_ZONES = [
  { id: 'raw', to: 0.2, w: 20, c: 10 },
  { id: 'normal', to: 0.5, w: 30, c: 35 },
  { id: 'crisp', to: 0.78, w: 28, c: 64 },
  { id: 'burnt', to: 1.01, w: 22, c: 89 }
];
export const fryZoneAt = (p) => FRY_ZONES.find((z) => p < z.to).id;
export const FRY_LABEL = {
  raw: '⚪ Còn sống — chiên lại nhé!',
  normal: '🟢 Vàng đều, chín vừa (bình thường)',
  crisp: '🟠 Vàng giòn — giòn hơn',
  burnt: '🔴 Cháy khét rồi! Chiên lại nhé'
};
const STAGES = { raw: ['⚪', '生的', 'Sống'], normal: ['🟡', '刚刚好', 'Vừa chín'], crisp: ['🟠', '酥脆', 'Giòn'], burnt: ['⚫', '烧焦', 'Cháy'] };

/** Bảng "油炸程度": thanh đo chuyển màu xanh → vàng → cam → đỏ, kim chạy, 4 mốc bên dưới */
export function gaugePanelHtml(sel, needed) {
  if (!needed) return '<div class="sh-gpanel off"><div class="sh-gtitle">🔥 <span class="zh">油炸程度</span> Độ chiên</div><small>Đơn này không có món chiên — khỏi chiên nhé.</small></div>';
  const state = sel.frying ? '🔥 Đang chiên… bấm <b>停止</b> khi kim tới đúng vùng khách muốn!' : sel.fry ? '<b class="fz ' + sel.fry + '">' + FRY_LABEL[sel.fry] + '</b>' : 'Bấm <b>开始油炸</b> rồi dừng đúng lúc theo lời khách.';
  const pos = sel.fryP != null ? Math.min(100, sel.fryP * 100) : 0;
  return '<div class="sh-gpanel"><div class="sh-gtitle">🔥 <span class="zh">油炸程度</span> Độ chiên</div>'
    + '<div class="sh-gbar"><div class="sh-gneedle" id="fry-mark" style="left:' + pos + '%"></div>'
    + '<i class="sh-gtick" style="left:20%"></i><i class="sh-gtick" style="left:50%"></i><i class="sh-gtick" style="left:78%"></i></div>'
    + '<div class="sh-gstages">' + FRY_ZONES.map((z) => '<span class="' + z.id + (sel.fry === z.id ? ' on' : '') + '" style="left:' + z.c + '%"><i>' + STAGES[z.id][0] + '</i><b class="zh">' + STAGES[z.id][1] + '</b><small>' + STAGES[z.id][2] + '</small></span>').join('') + '</div>'
    + '<div class="sh-fry-state" id="fry-state">' + state + '</div></div>';
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

export { esc };
