/**
 * Tiệm Bánh Mì: màn "Làm bánh" dạng QUẦY BÁN BÁNH MÌ (mô phỏng bản thiết kế của chủ tiệm):
 *   trên: khách + bong bóng · thẻ "Đơn hàng" (món + Yêu cầu có dấu ✔) · thẻ "<món> gồm:" (công thức chuẩn)
 *   giữa: các khay nhân (chạm để thêm / bỏ) · chai sốt · thớt có ổ bánh của bạn · bảng Menu chọn món
 *   dưới: thanh nút gỗ — Từ vựng · Nhập hàng · Giao bánh (nút xanh) · Nâng cấp
 */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (v) => { const n = Math.round(Number(v) * 100) / 100; return Number.isInteger(n) ? String(n) : n.toFixed(2); };

export function renderBakery(el, game, X) {
  const { byId, ING, POOL, toppings, zones } = X;
  const sel = game.sel; const c = game.current; const order = c && c.order;
  const tabs = zones.filter((z) => game.zonesOpen.has(z.id));
  if (!sel.tab || !tabs.some((z) => z.id === sel.tab)) sel.tab = tabs[0].id;

  const draw = () => {
    const main = sel.main ? byId[sel.main] : null;
    const pool = POOL[main ? main.raw.group : 'banhmi'] || [];
    const trayIds = pool.filter((i) => ING[i].kind !== 'sauce');
    const bottleIds = pool.filter((i) => ING[i].kind === 'sauce');
    const menu = game.unlockedProducts().filter((p) => p.zone === sel.tab);

    // thẻ "Đơn hàng" + Yêu cầu (dấu ✔ hiện khi bạn đã làm đúng)
    let orderCard = '<small>Chưa có đơn</small>';
    if (order) {
      const m = byId[order.main];
      const reqs = order.mods.map((mod) => {
        const ing = ING[mod.id]; const on = sel.main === order.main && (mod.type === 'add' ? sel.ings.includes(mod.id) : !sel.ings.includes(mod.id));
        const zh = (mod.type === 'add' ? '多加' : '不要') + ing.zh; const vi = (mod.type === 'add' ? 'Thêm ' : 'Không ') + ing.vi.toLowerCase();
        return '<div class="sh-bk-req ' + (on ? 'ok' : '') + '"><i>' + (on ? '✔' : '○') + '</i><span><b>' + (game.showVi ? esc(vi) : '<span class="zh">' + esc(zh) + '</span>') + '</b>' + (game.showVi ? ' <span class="zh">（' + esc(zh) + '）</span>' : '') + '</span></div>';
      }).join('');
      const drink = order.drink ? byId[order.drink] : null;
      orderCard = '<div class="sh-bk-dish"><span class="ic">' + m.icon + '</span><b>' + (game.showVi ? esc(m.vi) : '<span class="zh">' + esc(m.chn) + '</span>') + '</b><em>×1</em></div>'
        + (reqs ? '<div class="sh-bk-reqt">Yêu cầu:</div>' + reqs : '')
        + (drink ? '<div class="sh-bk-dish drink"><span class="ic">' + drink.icon + '</span><b>' + (game.showVi ? esc(drink.vi) : '<span class="zh">' + esc(drink.chn) + '</span>') + '</b><em>×1</em></div>' : '');
    }
    // thẻ "<món> gồm:" = công thức chuẩn (thông tin để bạn tự bấm)
    const recipe = main
      ? '<div class="sh-bk-recipe-head">' + main.icon + ' ' + esc(main.vi) + ' gồm:</div><div class="sh-bk-recipe-body"><div class="sh-bk-bread">🥖</div><ul>' + toppings(main.raw).map((i) => '<li>' + ING[i].icon + ' ' + esc(ING[i].vi) + ' <span class="zh">' + esc(ING[i].zh) + '</span></li>').join('') + '</ul></div>'
      : '<div class="sh-bk-recipe-head">📋 Công thức chuẩn</div><small>Chọn món ở bảng Menu để xem công thức. Khách có thể bảo bỏ (不要) hoặc thêm (多加).</small>';

    const trays = trayIds.map((i) => {
      const on = sel.ings.includes(i);
      return '<button type="button" class="sh-tray bk ' + (on ? 'has' : '') + '" data-ing="' + i + '"><span class="sh-tray-pile">' + ING[i].icon.repeat(4) + '</span><span class="sh-tray-label"><b>' + esc(ING[i].vi) + '</b><span class="zh">' + esc(ING[i].zh) + '</span></span>' + (on ? '<span class="sh-tray-n">✔</span>' : '') + '</button>';
    }).join('');
    const bottles = bottleIds.map((i) => {
      const on = sel.ings.includes(i);
      return '<button type="button" class="sh-bottle ' + (on ? 'on' : '') + '" data-ing="' + i + '"><span class="bi">' + ING[i].icon + '</span><span class="bl">' + esc(ING[i].vi) + '<span class="zh">' + esc(ING[i].zh) + '</span></span>' + (on ? '<i>✔</i>' : '') + '</button>';
    }).join('');
    const breadStack = main ? sel.ings.map((i) => ING[i].icon).join('') : '';
    const menuRows = menu.map((p) => {
      const have = p.stockNow ?? (game.stock[p.id] || 0); const picked = p.id === sel.main || p.id === sel.drink;
      return '<button type="button" class="sh-menurow ' + (picked ? 'sel' : '') + (have <= 0 ? ' out' : '') + '" data-pid="' + p.id + '" ' + (have <= 0 ? 'disabled' : '') + '><span class="ic">' + p.icon + '</span><span class="nm"><b>' + esc(p.vi) + '</b><span class="zh">' + esc(p.chn) + '</span></span><em>' + fmt(p.price) + '¥</em><span class="sh-stockb ' + (have <= 2 ? 'low' : '') + '">' + have + '</span></button>';
    }).join('');

    el.innerHTML = '<div class="sh-stall sh-bakery">'
      + '<div class="sh-stall-top bk">'
      + '<div class="sh-stall-cust">' + (c ? '<img src="' + c.profile.img + '" alt=""><b class="zh">' + esc(c.profile.zh) + '</b>' : '') + '</div>'
      + '<div class="sh-stall-bubble">' + (order ? game.sayHtml(order.say, 'big') + '<button type="button" class="sh-say-btn" data-say="' + esc(order.say.zh) + '"><i class="fa-solid fa-volume-high"></i></button>' : '') + '</div>'
      + '<div class="sh-bk-order"><div class="sh-bk-tag">Đơn hàng</div>' + orderCard + '</div>'
      + '<div class="sh-bk-recipe">' + recipe + '</div>'
      + '</div>'
      + '<div class="sh-stall-counter bk">'
      + '<div class="sh-bk-left"><div class="sh-bk-trays">' + (trays || '<small>Chưa có nguyên liệu</small>') + '</div></div>'
      + '<div class="sh-bk-mid"><div class="sh-bottles">' + (bottles || '') + '</div><div class="sh-cutboard"><div class="sh-cb-bread"><span class="top">🥖</span><span class="fill">' + (breadStack || (main ? '<small>chưa có nhân</small>' : '<small>Chọn món ở Menu</small>')) + '</span></div><small class="sh-cb-label">🔪 Bánh của bạn' + (sel.drink ? ' · ' + byId[sel.drink].icon : '') + '</small></div></div>'
      + '<div class="sh-bk-menu"><div class="sh-menu-head"><span class="mi">🥖</span> Menu</div><div class="sh-menu-tabs">' + tabs.map((z) => '<button type="button" class="sh-stab ' + (z.id === sel.tab ? 'active' : '') + '" data-tab="' + z.id + '">' + z.icon + ' ' + esc(z.short || z.vi) + '</button>').join('') + '</div><div class="sh-menurows">' + (menuRows || '<small>Hết hàng — bấm Nhập hàng</small>') + '</div></div>'
      + '</div>'
      + '<div class="sh-stall-bar">'
      + '<button type="button" class="sh-act side" data-stall="vocab"><i>📖</i><b>Từ vựng</b><small class="zh">图鉴</small></button>'
      + '<button type="button" class="sh-act side" data-stall="market"><i>🏪</i><b>Nhập hàng</b><small class="zh">进货</small></button>'
      + '<button type="button" class="sh-act go serveit2" id="btn-confirm" disabled><i>▶</i><b>Giao bánh</b><small class="zh">出餐 · sang thanh toán</small></button>'
      + '<button type="button" class="sh-act side" data-stall="upgrade"><i>⬆️</i><b>Nâng cấp</b><small class="zh">升级</small></button>'
      + '</div></div>';

    el.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { sel.tab = b.dataset.tab; draw(); }));
    el.querySelectorAll('[data-pid]').forEach((b) => b.addEventListener('click', () => {
      const p = byId[b.dataset.pid]; game.audio.pick(); game.learn(p.chn); game.audio.speak(p.chn);
      if (p.zone === 'drink') sel.drink = sel.drink === p.id ? null : p.id;
      else { if (sel.main !== p.id) sel.ings = []; sel.main = p.id; }
      draw(); game.selChanged();
    }));
    el.querySelectorAll('[data-ing]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.ing;
      sel.ings = sel.ings.includes(id) ? sel.ings.filter((x) => x !== id) : [...sel.ings, id];
      game.audio.pop(); game.audio.speak(ING[id].zh); draw(); game.selChanged();
    }));
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
