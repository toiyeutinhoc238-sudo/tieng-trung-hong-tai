/**
 * Tiệm Quần Áo: màn "Chọn đồ" dạng CỬA HÀNG THỜI TRANG (mô phỏng bản thiết kế của chủ tiệm):
 *   trên: khách + bong bóng · thẻ "Yêu cầu của khách" (món + màu + Size) · "Phòng thử đồ"
 *   giữa: tab Áo / Quần / Váy / Giày dép + băng chuyền thẻ hàng (màu + size ngay trên thẻ) · "Giỏ hàng" + nút Thanh toán
 *   dưới: Từ vựng · Nhập hàng · "Đưa đi thử đồ (去试穿)" · Nâng cấp
 */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (v) => { const n = Math.round(Number(v) * 100) / 100; return Number.isInteger(n) ? String(n) : n.toFixed(2); };
const lc = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

export function renderBoutique(el, game, X) {
  const { byId, D, zones, COLOR_HEX } = X;
  const sel = game.sel; const c = game.current; const order = c && c.order;
  const tabs = zones.filter((z) => game.zonesOpen.has(z.id));
  if (!sel.tab || !tabs.some((z) => z.id === sel.tab)) sel.tab = tabs[0].id;

  const draw = () => {
    const prods = game.unlockedProducts().filter((p) => p.zone === sel.tab);
    const cartTotal = sel.lines.reduce((s, l) => s + byId[l.id].price * l.qty, 0);
    const request = order
      ? order.lines.map((l) => { const p = byId[l.id]; return '<div class="sh-bq-req"><span class="ic">' + p.icon + '</span><b>' + (game.showVi ? esc(p.vi) : '<span class="zh">' + esc(p.chn) + '</span>') + '</b><small>(' + (game.showVi ? esc(l.color.toLowerCase()) + ' ' : '') + '<span class="zh">' + esc(D.colors[l.color].zh) + '</span>)</small><span class="sz">Size: ' + esc(l.size) + (l.qty > 1 ? ' ×' + l.qty : '') + '</span></div>'; }).join('')
        + (order.tryOn ? '<div class="sh-bq-try ' + (c.fitDone ? 'done' : '') + '">' + (c.fitDone ? '✅ Khách đã thử đồ' : '🪞 Khách xin thử đồ (我可以试穿吗？)') + '</div>' : '')
      : '<small>Chưa có đơn</small>';
    const cards = prods.map((p) => {
      const active = sel.pick === p.id; const have = p.stockNow ?? (game.stock[p.id] || 0);
      const dots = p.raw.colors.map((col) => active
        ? '<button type="button" class="sh-dot ' + (sel.color === col ? 'on' : '') + '" data-color="' + esc(col) + '" title="' + esc(col) + '" style="background:' + (COLOR_HEX[col] || '#ccc') + '"></button>'
        : '<span class="sh-dot" style="background:' + (COLOR_HEX[col] || '#ccc') + '"></span>').join('');
      const szs = p.raw.sizes.map((s) => active
        ? '<button type="button" class="sh-sz ' + (sel.size === s ? 'on' : '') + '" data-size="' + esc(s) + '">' + esc(s) + '</button>'
        : '<span class="sh-sz">' + esc(s) + '</span>').join('');
      return '<div class="sh-bq-card ' + (active ? 'active' : '') + (have <= 0 ? ' out' : '') + '" data-pid="' + p.id + '"><span class="sh-stockb ' + (have <= 2 ? 'low' : '') + '">' + have + '</span>' + (active ? '<span class="sh-bq-check">✔</span>' : '')
        + '<div class="sh-bq-img">' + p.icon + '</div><b class="nm">' + esc(p.vi) + '</b><span class="zh nz">' + esc(p.chn) + '</span><em>¥' + fmt(p.price) + '</em>'
        + '<div class="sh-dots">' + dots + '</div><div class="sh-szs">' + szs + '</div>'
        + (active ? '<button type="button" class="sh-cardadd" id="btn-addbag" ' + (sel.size && sel.color ? '' : 'disabled') + '>＋ Thêm vào giỏ</button>' : '') + '</div>';
    }).join('');
    const cart = sel.lines.length
      ? sel.lines.map((l, i) => { const p = byId[l.id]; return '<div class="sh-cart-row"><span class="ic">' + p.icon + '</span><span class="nm"><b>' + esc(p.vi) + ' ' + esc(lc(l.color)) + '</b><small>Size: ' + esc(l.size) + (l.qty > 1 ? ' ×' + l.qty : '') + '</small></span><em>¥' + fmt(p.price * l.qty) + '</em><button type="button" class="sh-x" data-rm="' + i + '">✕</button></div>'; }).join('')
      : '<small class="sh-cart-empty">Giỏ đang trống — chọn màu và size trên thẻ hàng</small>';
    const fitState = c && order && order.tryOn ? (c.fitDone ? '✅ Đã thử xong' : '👗 Khách đang chờ thử') : 'Phòng trống';
    const canTry = !!(order && order.tryOn && !c.fitDone && sel.lines.length);

    el.innerHTML = '<div class="sh-stall sh-boutique">'
      + '<div class="sh-stall-top bq">'
      + '<div class="sh-stall-cust">' + (c ? '<img src="' + c.profile.img + '" alt=""><b class="zh">' + esc(c.profile.zh) + '</b>' : '') + '</div>'
      + '<div class="sh-stall-bubble">' + (order ? game.sayHtml(order.say, 'big') + '<button type="button" class="sh-say-btn" data-say="' + esc(order.say.zh) + '"><i class="fa-solid fa-volume-high"></i></button>' : '') + '</div>'
      + '<div class="sh-bk-order sh-bq-reqcard"><div class="sh-bk-tag">🎯 Yêu cầu của khách</div>' + request + '</div>'
      + '<div class="sh-bq-fit"><div class="sh-bq-fit-tag">🧥 Phòng thử đồ</div><div class="sh-bq-curtain"><span>' + (c && c.fitDone ? '👗' : '🪞') + '</span></div><small>' + fitState + '</small></div>'
      + '</div>'
      + '<div class="sh-bq-mid">'
      + '<div class="sh-bq-shelf"><div class="sh-bq-tabs">' + tabs.map((z) => '<button type="button" class="sh-bq-tab ' + (z.id === sel.tab ? 'active' : '') + '" data-tab="' + z.id + '">' + z.icon + ' ' + esc(z.vi) + ' <span class="zh">(' + esc(z.chn) + ')</span></button>').join('') + '</div>'
      + '<div class="sh-carousel"><button type="button" class="sh-car-arrow" data-car="-1">‹</button><div class="sh-car-track" id="car-track">' + (cards || '<small>Chưa có hàng — bấm Nhập hàng</small>') + '</div><button type="button" class="sh-car-arrow" data-car="1">›</button></div></div>'
      + '<div class="sh-cart"><div class="sh-cart-head">🛒 Giỏ hàng</div><div class="sh-cart-rows">' + cart + '</div><div class="sh-cart-total"><span>Tổng cộng:</span><strong>¥' + fmt(cartTotal) + '</strong></div>'
      + '<button type="button" class="sh-act go cartpay" id="btn-confirm" disabled><i>🧾</i><b>Thanh toán</b><small class="zh">结账</small></button></div>'
      + '</div>'
      + '<div class="sh-stall-bar">'
      + '<button type="button" class="sh-act side" data-stall="vocab"><i>📖</i><b>Từ vựng</b><small class="zh">图鉴</small></button>'
      + '<button type="button" class="sh-act side" data-stall="market"><i>🏪</i><b>Nhập hàng</b><small class="zh">进货</small></button>'
      + '<button type="button" class="sh-act try" data-try ' + (canTry ? '' : 'disabled') + '><i>👗</i><b>Đưa đi thử đồ</b><small class="zh">去试穿</small></button>'
      + '<button type="button" class="sh-act side" data-stall="upgrade"><i>⬆️</i><b>Nâng cấp</b><small class="zh">升级</small></button>'
      + '</div></div>';

    const track = el.querySelector('#car-track'); if (track) { track.scrollLeft = sel.carLeft || 0; track.addEventListener('scroll', () => { sel.carLeft = track.scrollLeft; }); }
    el.querySelectorAll('[data-car]').forEach((b) => b.addEventListener('click', () => { if (track) track.scrollBy({ left: +b.dataset.car * 330, behavior: 'smooth' }); }));
    el.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { sel.tab = b.dataset.tab; sel.carLeft = 0; draw(); }));
    el.querySelectorAll('.sh-bq-card').forEach((card) => card.addEventListener('click', (e) => {
      if (e.target.closest('[data-color],[data-size],#btn-addbag')) return;
      const id = card.dataset.pid; if (sel.pick === id) return;
      sel.pick = id; sel.size = null; sel.color = null; game.audio.pick(); game.learn(byId[id].chn); game.audio.speak(byId[id].chn); draw();
    }));
    el.querySelectorAll('[data-size]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); sel.size = b.dataset.size; game.audio.pop(); game.audio.speak(D.sizes[sel.size].zh); draw(); }));
    el.querySelectorAll('[data-color]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); sel.color = b.dataset.color; game.audio.pop(); game.audio.speak(D.colors[sel.color].zh); draw(); }));
    const add = el.querySelector('#btn-addbag');
    if (add) add.addEventListener('click', (e) => {
      e.stopPropagation();
      const ex = sel.lines.find((l) => l.id === sel.pick && l.size === sel.size && l.color === sel.color);
      if (ex) ex.qty += 1; else sel.lines.push({ id: sel.pick, size: sel.size, color: sel.color, qty: 1 });
      sel.pick = null; sel.size = null; sel.color = null; game.audio.pick(); draw(); game.selChanged();
    });
    el.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => { sel.lines.splice(+b.dataset.rm, 1); draw(); game.selChanged(); }));
    el.querySelectorAll('[data-stall]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.stall;
      if (k === 'vocab') { game.renderVocab(); game.openModal('m-vocab'); }
      else { game.marketTab = k === 'upgrade' ? 'upgrade' : 'stock'; game.renderMarket(); game.openModal('m-market'); }
    }));
    const tryBtn = el.querySelector('[data-try]'); if (tryBtn) tryBtn.addEventListener('click', () => game.tryOnClicked());
    const ok = el.querySelector('#btn-confirm'); if (ok) ok.addEventListener('click', () => game.confirmOrder());
    game.renderPrepFooter();
  };
  draw();
}
