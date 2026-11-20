/**
 * Cửa hàng văn phòng phẩm (我的文具店): màn "Chọn hàng" (mô phỏng bản thiết kế của chủ tiệm):
 *   trên: khách + bong bóng · thẻ "订单要求 (Yêu cầu đơn hàng)" có dấu ✔ · bên phải: "购物车 (Giỏ hàng)"
 *   giữa: danh mục dọc (6 nhóm) · lưới thẻ sản phẩm (− / +) · bảng "选择颜色 (Chọn màu)"
 *   dưới: Từ vựng · Nhập hàng · Nâng cấp; trong giỏ: 清空 (Xóa giỏ) · 去结账 (Thanh toán)
 */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt2 = (v) => (Math.round(Number(v) * 100) / 100).toFixed(2);
const fmt = (v) => { const n = Math.round(Number(v) * 100) / 100; return Number.isInteger(n) ? String(n) : n.toFixed(2); };

export function renderStationery(el, game, X) {
  const { byId, D, zones } = X;
  const sel = game.sel; const c = game.current; const order = c && c.order;
  const tabs = zones.filter((z) => game.zonesOpen.has(z.id));
  if (!sel.tab || !tabs.some((z) => z.id === sel.tab)) sel.tab = tabs[0].id;

  const qtyOf = (id) => sel.lines.filter((l) => l.id === id).reduce((s, l) => s + l.qty, 0);
  const dot = (col) => '<i class="sh-cdot" style="background:' + (D.colors[col] ? D.colors[col].hex : '#ccc') + '"></i>';

  const draw = () => {
    const prods = game.unlockedProducts().filter((p) => p.zone === sel.tab);
    const pick = sel.pick ? byId[sel.pick] : null;
    const total = sel.lines.reduce((s, l) => s + byId[l.id].price * l.qty, 0);
    const units = sel.lines.reduce((s, l) => s + l.qty, 0);

    const request = order
      ? order.lines.map((l) => {
        const p = byId[l.id]; const got = sel.lines.filter((x) => x.id === l.id && (x.color || null) === (l.color || null)).reduce((s, x) => s + x.qty, 0);
        const ok = got === l.qty;
        return '<div class="sh-st-req ' + (ok ? 'ok' : '') + '"><span class="ic">' + p.icon + '</span><span class="nm"><b class="zh">' + (l.color ? esc(D.colors[l.color].zh) + '的' : '') + esc(p.chn) + '</b>' + (game.showVi ? '<small>(' + esc(p.vi) + (l.color ? ' · ' + esc(D.colors[l.color].vi.toLowerCase()) : '') + ')</small>' : '') + '</span><b class="q">×' + l.qty + '</b><i class="ck">' + (ok ? '✔' : '○') + '</i></div>';
      }).join('')
      : '<small>Chưa có đơn</small>';

    const cats = tabs.map((z) => '<button type="button" class="sh-st-cat ' + (z.id === sel.tab ? 'active' : '') + '" data-tab="' + z.id + '"><span class="ic">' + z.icon + '</span><span><b class="zh">' + esc(z.chn) + '</b><small>' + esc(z.vi) + '</small></span></button>').join('');

    const cards = prods.map((p) => {
      const have = p.stockNow ?? (game.stock[p.id] || 0); const n = qtyOf(p.id);
      return '<div class="sh-st-card ' + (pick && pick.id === p.id ? 'active' : '') + (have <= 0 ? ' out' : '') + '" data-pid="' + p.id + '"><span class="sh-stockb ' + (have <= 2 ? 'low' : '') + '">' + have + '</span>' + (pick && pick.id === p.id ? '<span class="sh-bq-check">✔</span>' : '')
        + '<div class="sh-bq-img">' + p.icon + '</div><b class="zh">' + esc(p.chn) + '</b><small>(' + esc(p.vi) + ')</small><em>¥' + fmt2(p.price) + '</em>'
        + '<div class="sh-st-step"><button type="button" data-dec="' + p.id + '">−</button><b>' + n + '</b><button type="button" data-inc="' + p.id + '">＋</button></div>'
        + (p.raw.colors ? '<div class="sh-st-cols">' + p.raw.colors.map((col) => dot(col)).join('') + '</div>' : '') + '</div>';
    }).join('');

    const colorPanel = Object.keys(D.colors).map((col) => {
      const can = !!(pick && pick.raw.colors && pick.raw.colors.includes(col));
      return '<button type="button" class="sh-st-color ' + (sel.color === col && can ? 'on' : '') + '" data-color="' + col + '" ' + (can ? '' : 'disabled') + '><span class="sw" style="background:' + D.colors[col].hex + '">' + (sel.color === col && can ? '✔' : '') + '</span><b class="zh">' + col + '</b></button>';
    }).join('');

    const cart = sel.lines.length
      ? sel.lines.map((l, i) => { const p = byId[l.id]; return '<div class="sh-st-crow"><span class="ic">' + p.icon + '</span><span class="nm"><b class="zh">' + (l.color ? esc(D.colors[l.color].zh) + '的' : '') + esc(p.chn) + '</b><small>¥' + fmt2(p.price) + (l.color ? ' · ' + esc(D.colors[l.color].vi) : '') + '</small></span><span class="mini"><button type="button" data-cdec="' + i + '">−</button><b>' + l.qty + '</b><button type="button" data-cinc="' + i + '">＋</button></span><em>¥' + fmt2(p.price * l.qty) + '</em><button type="button" class="sh-x" data-rm="' + i + '">✕</button></div>'; }).join('')
      : '<small class="sh-cart-empty">Giỏ đang trống — chạm vào sản phẩm và bấm ＋</small>';

    el.innerHTML = '<div class="sh-stall sh-statui">'
      + '<div class="sh-st-grid">'
      + '<div class="sh-st-left">'
      + '<div class="sh-st-top"><div class="sh-stall-cust">' + (c ? '<img src="' + c.profile.img + '" alt=""><b class="zh">' + esc(c.profile.zh) + '</b>' : '') + '</div>'
      + '<div class="sh-stall-bubble">' + (order ? game.sayHtml(order.say, 'big') + '<button type="button" class="sh-say-btn" data-say="' + esc(order.say.zh) + '"><i class="fa-solid fa-volume-high"></i></button>' : '') + '</div>'
      + '<div class="sh-st-reqcard"><div class="sh-bk-tag">📋 <span class="zh">订单要求</span> Yêu cầu đơn hàng</div>' + request + '</div></div>'
      + '<div class="sh-st-mid"><div class="sh-st-cats">' + cats + '</div>'
      + '<div class="sh-st-products"><div class="sh-st-cathead">' + (tabs.find((z) => z.id === sel.tab) ? '<b class="zh">' + esc(tabs.find((z) => z.id === sel.tab).chn) + '</b> (' + esc(tabs.find((z) => z.id === sel.tab).vi) + ')' : '') + '</div><div class="sh-st-cards">' + (cards || '<small>Chưa có hàng — bấm Nhập hàng</small>') + '</div></div>'
      + '<div class="sh-st-colors"><div class="sh-st-colhead"><span class="zh">选择颜色</span> Chọn màu</div><div class="sh-st-colgrid">' + colorPanel + '</div><small>' + (pick ? (pick.raw.colors ? 'Chọn màu cho ' + esc(pick.vi) : esc(pick.vi) + ' không có màu') : 'Chạm vào sản phẩm trước') + '</small></div></div>'
      + '</div>'
      + '<div class="sh-st-cart"><div class="sh-cart-head">🛒 <span class="zh">购物车</span> Giỏ hàng</div><div class="sh-st-crows">' + cart + '</div>'
      + '<div class="sh-st-ctotal"><span><span class="zh">总计</span> (Tổng tiền):</span><strong>¥' + fmt2(total) + '</strong></div><small class="sh-st-units">' + units + ' sản phẩm</small>'
      + '<div class="sh-st-cbtns"><button type="button" class="sh-act clear" data-clear ' + (sel.lines.length ? '' : 'disabled') + '><i>🗑️</i><b class="zh">清空</b><small>Xóa giỏ</small></button>'
      + '<button type="button" class="sh-act go cartpay" id="btn-confirm" disabled><i>✔</i><b class="zh">去结账</b><small>Quét mã & thanh toán</small></button></div></div>'
      + '</div>'
      + '<div class="sh-stall-bar">'
      + '<button type="button" class="sh-act side" data-stall="vocab"><i>📖</i><b>Từ vựng</b><small class="zh">词汇</small></button>'
      + '<button type="button" class="sh-act side" data-stall="market"><i>🏪</i><b>Nhập hàng</b><small class="zh">进货</small></button>'
      + '<button type="button" class="sh-act side" data-stall="upgrade"><i>⬆️</i><b>Nâng cấp</b><small class="zh">升级</small></button>'
      + '</div></div>';

    el.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { sel.tab = b.dataset.tab; draw(); }));
    el.querySelectorAll('.sh-st-card').forEach((card) => card.addEventListener('click', (e) => {
      if (e.target.closest('[data-inc],[data-dec]')) return;
      const id = card.dataset.pid; if (sel.pick === id) return;
      sel.pick = id; sel.color = null; game.audio.pick(); game.learn(byId[id].chn); game.audio.speak(byId[id].chn); draw();
    }));
    el.querySelectorAll('[data-color]').forEach((b) => b.addEventListener('click', () => { sel.color = b.dataset.color; game.audio.pop(); game.audio.speak(sel.color); draw(); }));
    el.querySelectorAll('[data-inc]').forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = b.dataset.inc; const p = byId[id];
      if (p.raw.colors && (sel.pick !== id || !sel.color || !p.raw.colors.includes(sel.color))) { sel.pick = id; if (!p.raw.colors.includes(sel.color)) sel.color = null; game.audio.error(); game.toast('🎨', 'Chọn màu cho ' + p.vi + ' ở bảng “Chọn màu” trước nhé!', 'warn'); draw(); return; }
      if (qtyOf(id) >= (game.stock[id] || 0)) { game.audio.error(); game.toast('📦', p.vi + ' đã hết hàng trong kho!', 'warn'); return; }
      const color = p.raw.colors ? sel.color : null;
      const ex = sel.lines.find((l) => l.id === id && (l.color || null) === color);
      if (ex) ex.qty += 1; else sel.lines.push({ id, color, qty: 1 });
      sel.pick = id; game.audio.pick(); game.learn(p.chn); draw(); game.selChanged();
    }));
    el.querySelectorAll('[data-dec]').forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = b.dataset.dec; const p = byId[id];
      let idx = p.raw.colors && sel.color ? sel.lines.findIndex((l) => l.id === id && l.color === sel.color) : -1;
      if (idx < 0) { for (let i = sel.lines.length - 1; i >= 0; i--) if (sel.lines[i].id === id) { idx = i; break; } }
      if (idx >= 0) { sel.lines[idx].qty -= 1; if (sel.lines[idx].qty <= 0) sel.lines.splice(idx, 1); game.audio.pop(); }
      draw(); game.selChanged();
    }));
    el.querySelectorAll('[data-cinc]').forEach((b) => b.addEventListener('click', () => { const l = sel.lines[+b.dataset.cinc]; if (l && qtyOf(l.id) < (game.stock[l.id] || 0)) l.qty += 1; draw(); game.selChanged(); }));
    el.querySelectorAll('[data-cdec]').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.cdec; const l = sel.lines[i]; if (l) { l.qty -= 1; if (l.qty <= 0) sel.lines.splice(i, 1); } draw(); game.selChanged(); }));
    el.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => { sel.lines.splice(+b.dataset.rm, 1); game.audio.pop(); draw(); game.selChanged(); }));
    const clr = el.querySelector('[data-clear]'); if (clr) clr.addEventListener('click', () => { sel.lines = []; sel.pick = null; sel.color = null; game.audio.pop(); draw(); game.selChanged(); });
    el.querySelectorAll('[data-stall]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.stall;
      if (k === 'vocab') { game.renderVocab(); game.openModal('m-vocab'); }
      else { game.marketTab = k === 'upgrade' ? 'upgrade' : 'stock'; game.renderMarket(); game.openModal('m-market'); }
    }));
    const ok = el.querySelector('#btn-confirm'); if (ok) ok.addEventListener('click', () => game.confirmOrder());
    game.renderPrepFooter();
  };
  draw();
}
