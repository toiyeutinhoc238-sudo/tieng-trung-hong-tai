/**
 * Cá Viên: màn "Chiên & gói" dạng QUẦY HÀNG ĐÊM (mô phỏng bản thiết kế của chủ tiệm):
 *   trên: khách + bong bóng gọi món + thẻ "Khay hiện tại"
 *   giữa: các khay nguyên liệu (chạm để bỏ vào chảo) · chảo chiên + thang "油炸程度" · hũ nước chấm + cách dùng
 *   dưới: thanh nút gỗ — 图鉴 · 采购 · 开始油炸 / 停止 · 出餐 · 升级
 */
import { gaugePanelHtml, bindFryer } from './shop_fry.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (v) => { const n = Math.round(Number(v) * 100) / 100; return Number.isInteger(n) ? String(n) : n.toFixed(2); };

export function renderStall(el, game, X) {
  const { byId, sauces, sById, SERVE, SAUCE_ICON, zones } = X;
  const sel = game.sel; const c = game.current; const order = c && c.order;
  const needFry = !!(order && order.fry !== 'none');
  const tabs = zones.filter((z) => z.prep !== false && game.zonesOpen.has(z.id));
  if (!sel.tab || !tabs.some((z) => z.id === sel.tab)) sel.tab = tabs[0].id;

  const draw = () => {
    const prods = game.unlockedProducts().filter((p) => p.zone === sel.tab);
    const picked = Object.keys(sel.qty).filter((k) => sel.qty[k] > 0);
    const friedPicked = picked.some((k) => byId[k].raw.group === 'Món chiên');
    const fryCls = sel.frying ? 'frying' : sel.fry ? 'fried-' + sel.fry : '';
    const trays = prods.map((p) => {
      const have = p.stockNow ?? (game.stock[p.id] || 0);
      const n = sel.qty[p.id] || 0;
      return '<button type="button" class="sh-tray ' + (n ? 'has' : '') + (have <= 0 ? ' out' : '') + '" data-inc="' + p.id + '" data-pid="' + p.id + '" ' + (have <= 0 ? 'disabled' : '') + '>'
        + '<span class="sh-tray-pile">' + p.icon.repeat(5) + '</span>'
        + '<span class="sh-tray-label"><b>' + esc(p.vi) + '</b><span class="zh">' + esc(p.chn) + '</span></span>'
        + '<span class="sh-stockb ' + (have <= 2 ? 'low' : '') + '">' + have + '</span>'
        + (n ? '<span class="sh-tray-n">×' + n + '</span>' : '')
        + '<em class="sh-tray-price">' + fmt(p.price) + ' ¥</em></button>';
    }).join('');
    const panItems = picked.map((k) => '<button type="button" class="sh-panitem" data-dec="' + k + '" title="Bấm để lấy bớt 1">' + byId[k].icon.repeat(Math.min(sel.qty[k], 6)) + '<small>×' + sel.qty[k] + '</small></button>').join('');
    const jars = sauces.filter((s) => game.zonesOpen.has('sauce') && game.itemsOpen.has(s.id)).map((s) => {
      const have = game.stock[s.id] || 0; const on = sel.sauces.includes(s.id);
      return '<button type="button" class="sh-jarbtn ' + (on ? 'on' : '') + (have <= 0 ? ' out' : '') + '" data-sauce="' + s.id + '"><span class="ji">' + (SAUCE_ICON[s.id] || '🫙') + '</span><span class="jl">' + esc(s.vi.replace(/^sốt /i, '')) + '<span class="zh">' + esc(s.chn) + '</span></span><span class="sh-stockb ' + (have <= 2 ? 'low' : '') + '">' + have + '</span></button>';
    }).join('');
    const reqLines = [];
    if (sel.sauces.length) reqLines.push('🫙 ' + sel.sauces.map((s) => esc(sById[s].vi)).join(', '));
    if (sel.serve) reqLines.push(sel.serve === 'take' ? '🛍️ Mang đi 打包' : '🍽️ Ăn tại đây 在这里吃');
    if (sel.fry) reqLines.push('🔥 ' + { raw: 'Còn sống', normal: 'Chín vừa', crisp: 'Giòn', burnt: 'Cháy' }[sel.fry]);
    const total = Object.values(sel.qty).reduce((a, b) => a + b, 0);
    const centerBtn = !needFry
      ? '<button type="button" class="sh-act go" disabled><i>▶</i><b class="zh">开始油炸</b><small>Không cần chiên</small></button>'
      : sel.frying
        ? '<button type="button" class="sh-act stop" data-fry-stop><i>⏹</i><b class="zh">停止</b><small>Vớt ra!</small></button>'
        : sel.fry
          ? '<button type="button" class="sh-act again" data-fry-again><i>🔁</i><b class="zh">重炸</b><small>Chiên lại</small></button>'
          : '<button type="button" class="sh-act go" data-fry-start ' + (friedPicked ? '' : 'disabled') + '><i>▶</i><b class="zh">开始油炸</b><small>' + (friedPicked ? 'Bắt đầu chiên' : 'Chọn món chiên trước') + '</small></button>';

    el.innerHTML = '<div class="sh-stall">'
      + '<div class="sh-stall-top">'
      + '<div class="sh-stall-cust">' + (c ? '<img src="' + c.profile.img + '" alt=""><b class="zh">' + esc(c.profile.zh) + '</b>' : '') + '</div>'
      + '<div class="sh-stall-bubble">' + (order ? game.sayHtml(order.say, 'big') + '<button type="button" class="sh-say-btn" data-say="' + esc(order.say.zh) + '"><i class="fa-solid fa-volume-high"></i></button>' : '') + '</div>'
      + '<div class="sh-stall-order"><div class="sh-oc-head"><b class="zh">当前订单</b><span>' + total + ' món</span></div>'
      + (picked.length ? picked.map((k) => '<div class="sh-oc-row"><span>' + byId[k].icon + ' ' + esc(byId[k].vi) + '</span><b>×' + sel.qty[k] + '</b></div>').join('') : '<small>Khay còn trống — chạm vào khay nguyên liệu</small>')
      + (reqLines.length ? '<div class="sh-oc-req"><b class="zh">要求:</b> ' + reqLines.join(' · ') + '</div>' : '') + '</div>'
      + '</div>'
      + '<div class="sh-stall-counter">'
      + '<div class="sh-stall-left"><div class="sh-stall-tabs">' + tabs.map((z) => '<button type="button" class="sh-stab ' + (z.id === sel.tab ? 'active' : '') + '" data-tab="' + z.id + '">' + z.icon + ' ' + esc(z.short || z.vi) + '</button>').join('') + '</div><div class="sh-trays">' + (trays || '<small>Chưa có hàng — bấm 采购</small>') + '</div></div>'
      + '<div class="sh-stall-mid"><div class="sh-pan ' + fryCls + '"><div class="sh-pan-grid">' + (panItems || '<small class="sh-pan-empty">Chảo trống</small>') + '</div><span class="sh-steam s1">☁️</span><span class="sh-steam s2">☁️</span></div>' + gaugePanelHtml(sel, needFry) + '</div>'
      + '<div class="sh-stall-right"><div class="sh-jars-title"><b class="zh">酱料</b> Nước chấm</div><div class="sh-jars">' + (jars || '<small>Hết sốt</small>') + '</div>'
      + '<div class="sh-serve"><button type="button" class="sh-chip ' + (sel.serve === 'take' ? 'on' : '') + '" data-serve="take">🛍️ Mang đi <span class="zh">打包</span></button><button type="button" class="sh-chip ' + (sel.serve === 'dine' ? 'on' : '') + '" data-serve="dine">🍽️ Ăn tại đây <span class="zh">在这里吃</span></button></div></div>'
      + '</div>'
      + '<div class="sh-stall-bar">'
      + '<button type="button" class="sh-act side" data-stall="vocab"><i>📖</i><b class="zh">图鉴</b><small>Sổ từ</small></button>'
      + '<button type="button" class="sh-act side" data-stall="market"><i>🏪</i><b class="zh">采购</b><small>Nhập hàng</small></button>'
      + centerBtn
      + '<button type="button" class="sh-act serveit" id="btn-confirm" disabled><i>✅</i><b class="zh">出餐</b><small>Giao món</small></button>'
      + '<button type="button" class="sh-act side" data-stall="upgrade"><i>⬆️</i><b class="zh">升级</b><small>Nâng cấp</small></button>'
      + '</div></div>';

    el.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { sel.tab = b.dataset.tab; draw(); }));
    el.querySelectorAll('[data-inc]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.inc; const cap = game.stock[id] || 0;
      if ((sel.qty[id] || 0) < Math.min(9, cap)) { sel.qty[id] = (sel.qty[id] || 0) + 1; game.audio.pick(); game.learn(byId[id].chn); game.audio.speak(String(sel.qty[id])); }
      draw(); game.selChanged();
    }));
    el.querySelectorAll('[data-dec]').forEach((b) => b.addEventListener('click', () => { const id = b.dataset.dec; if ((sel.qty[id] || 0) > 0) { sel.qty[id] -= 1; game.audio.pop(); } draw(); game.selChanged(); }));
    el.querySelectorAll('[data-sauce]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.sauce;
      sel.sauces = sel.sauces.includes(id) ? sel.sauces.filter((x) => x !== id) : [...sel.sauces, id];
      game.audio.pop(); game.audio.speak(sById[id].chn); game.learn(sById[id].chn); draw(); game.selChanged();
    }));
    el.querySelectorAll('[data-serve]').forEach((b) => b.addEventListener('click', () => { sel.serve = b.dataset.serve; game.audio.pop(); game.audio.speak(SERVE[sel.serve][0].replace('我要', '').replace('我在', '')); draw(); game.selChanged(); }));
    el.querySelectorAll('[data-stall]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.stall;
      if (k === 'vocab') { game.renderVocab(); game.openModal('m-vocab'); }
      else { game.marketTab = k === 'upgrade' ? 'upgrade' : 'stock'; game.renderMarket(); game.openModal('m-market'); }
    }));
    const ok = el.querySelector('#btn-confirm'); if (ok) ok.addEventListener('click', () => game.confirmOrder());
    bindFryer(el, game, sel, draw);
    game.renderPrepFooter();
  };
  draw();
}
