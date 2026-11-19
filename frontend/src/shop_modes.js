/**
 * Phần RIÊNG của từng tiệm (dùng với shop_engine.js):
 *   zones / products / vocab   → khu hàng, món hàng, từ vựng
 *   makeOrder(ctx)             → sinh đơn khách gọi (câu tiếng Trung + đáp án đúng + tiền)
 *   emptySel / renderPrep      → màn hình "chuẩn bị đơn" (người chơi chọn hàng)
 *   canConfirm / diff          → kiểm tra đúng/sai khi xác nhận (diff trả về tên các mục còn sai)
 *   billLines / unitCount      → hóa đơn và độ khó (để tính điểm tốc độ)
 */
import { esc, fmt, randInt, pickOne, shuffle, say } from './shop_engine.js';
import { intToZh } from './shop_dialogue.js';
import { renderCavienSide } from './shop_fry.js';

const num = (n) => (n === 2 ? '两' : intToZh(n));
const iconBy = (text, rules, fallback) => { for (const [k, v] of rules) if (text.includes(k)) return v; return fallback; };
const lc = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

function mkProducts(items, zoneOf, iconOf, costStep, tierOf) {
  return items.map((it, i) => {
    const tier = tierOf ? tierOf(it, i) : it.tier || 0;
    return { id: it.id, zone: zoneOf(it), chn: it.chn, pin: it.pin, vi: it.vi, price: it.price, icon: iconOf(it), tier, unlockCost: tier * costStep, raw: it };
  });
}

// Thẻ hàng dùng chung
const productCard = (p, extra = '', cls = '') => `<div class="sh-pcard ${cls}" data-pid="${p.id}"><span class="sh-ico">${p.icon}</span><b>${esc(p.vi)}</b><span class="zh">${esc(p.chn)}</span><small>${esc(p.pin)}</small><em>${p.price > 0 ? fmt(p.price) + ' ¥' : 'tặng kèm'}</em>${p.stockNow !== undefined ? `<span class="sh-stockb ${p.stockNow <= 2 ? 'low' : ''}" title="Tồn kho">${p.stockNow}</span>` : ''}${extra}</div>`;
const tabsHtml = (zones, cur) => `<div class="sh-ptabs">${zones.map((z) => `<button type="button" class="sh-ptab ${z.id === cur ? 'active' : ''}" data-tab="${z.id}">${z.icon} ${esc(z.short || z.vi)}</button>`).join('')}</div>`;
const openZones = (game, zones) => zones.filter((z) => game.zonesOpen.has(z.id) && z.prep !== false);

// ===================================================================================================================
// 1. QUẦN ÁO (Quần áo.xlsx): chọn đúng sản phẩm + size + màu
// ===================================================================================================================
const COLOR_HEX = { 'Trắng': '#ffffff', 'Đen': '#222222', 'Đỏ': '#e53935', 'Xanh dương': '#1e88e5', 'Xanh lá': '#43a047', 'Vàng': '#fdd835', 'Hồng': '#f48fb1', 'Tím': '#8e24aa', 'Xám': '#9e9e9e', 'Nâu': '#795548', 'Be': '#e8d8b8', 'Xanh denim': '#3f6fa8', 'Nude': '#e6bfa6', 'Bạc': '#c0c0c0', 'Xanh đậm': '#1a3a6b', 'Xanh rêu': '#5a6b3a', 'Nền trắng': '#f3f3f3', 'Nền đen': '#2a2a2a', 'Nền xanh': '#90caf9', 'Nền hồng': '#f8bbd0' };
const CLOTH_ICON = [['T恤', '👕'], ['衬衫', '👔'], ['Polo', '👕'], ['外套', '🧥'], ['卫衣', '🧥'], ['毛衣', '🧶'], ['吊带', '👚'], ['上衣', '👚'], ['短裤', '🩳'], ['裤', '👖'], ['裙', '👗'], ['礼服', '👗'], ['高跟', '👠'], ['平底', '🥿'], ['乐福', '🥿'], ['凉鞋', '👡'], ['拖鞋', '🩴'], ['靴', '👢'], ['鞋', '👟']];

export function clothesMode(D) {
  const GZ = { ao: 0, quan: 160, vay: 320, giay: 480 };
  const zones = D.groups.map((g) => ({ ...g, short: g.vi, unlock: GZ[g.id] }));
  const gById = Object.fromEntries(D.groups.map((g) => [g.id, g]));
  const products = mkProducts(D.items, (it) => it.group, (it) => iconBy(it.chn, CLOTH_ICON, '👚'), 70);
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const sizeLabel = (grp, s) => (grp === 'giay' ? `${s} · ${D.sizes[s].zh}` : `${s} · ${D.sizes[s].zh}`);
  const vocab = [
    ...products.map((p) => ({ zh: p.chn, pin: p.pin, vi: p.vi })),
    ...Object.entries(D.colors).map(([vi, c]) => ({ zh: c.zh, pin: c.pin, vi: `Màu ${lc(vi)}` })),
    ...Object.entries(D.sizes).map(([k, c]) => ({ zh: c.zh, pin: c.pin, vi: `Size ${k}` })),
    ...D.groups.map((g) => ({ zh: g.chn, pin: g.pin, vi: g.vi }))
  ];

  function lineSay(l, first) {
    const p = byId[l.id]; const g = gById[p.zone];
    const col = D.colors[l.color].zh; const n = num(l.qty);
    const sizeSaid = p.zone === 'giay' ? D.sizes[l.size].zh : (Math.random() < 0.5 ? `${l.size}码` : D.sizes[l.size].zh);
    const zh = first ? `我想买${n}${g.measure}${col}的${p.chn}，${sizeSaid}` : `还要${n}${g.measure}${col}的${p.chn}，${sizeSaid}`;
    const vi = `${first ? 'Tôi muốn mua' : 'Và thêm'} ${l.qty} ${g.measureVi} ${lc(p.vi)} màu ${lc(l.color)}, size ${l.size}`;
    return { zh, vi };
  }

  return {
    zones, products, vocab,
    hint: '💡 Chọn đúng <b>sản phẩm</b>, rồi chọn đúng <b>size</b> và <b>màu</b> khách nói, bấm “Thêm vào túi”.',
    makeOrder(ctx) {
      const pool = ctx.products;
      if (!pool.length) return null;
      const nLines = ctx.day >= 3 && Math.random() < Math.min(0.6, 0.35 + ctx.day * 0.03) ? 2 : 1;
      const chosen = shuffle(pool).slice(0, nLines);
      const lines = chosen.map((p) => ({ id: p.id, size: pickOne(p.raw.sizes), color: pickOne(p.raw.colors), qty: Math.min(ctx.stock(p.id), ctx.day >= 5 && Math.random() < 0.2 ? 2 : 1) }));
      const parts = lines.map((l, i) => lineSay(l, i === 0));
      const zh = `${parts.map((x) => x.zh).join('。')}。`;
      const vi = `${parts.map((x) => x.vi).join('. ')}.`;
      return { lines, say: say(zh, vi), due: lines.reduce((s, l) => s + byId[l.id].price * l.qty, 0), words: [...lines.flatMap((l) => [byId[l.id].chn, D.colors[l.color].zh, D.sizes[l.size].zh])] };
    },
    emptySel() { return { lines: [], tab: null, pick: null, size: null, color: null }; },
    canConfirm(order, sel) { return sel.lines.length > 0; },
    unitCount(order) { return order.lines.reduce((s, l) => s + l.qty, 0); },
    stockUse(order) { return order.lines.map((l) => ({ id: l.id, qty: l.qty })); },
    billLines(order) { return order.lines.map((l) => ({ zh: `${D.colors[l.color].zh}${byId[l.id].chn} ${l.size}`, vi: `${byId[l.id].vi} · ${l.color}`, qty: l.qty, amount: byId[l.id].price * l.qty })); },
    diff(order, sel) {
      const bad = new Set();
      order.lines.forEach((l) => {
        const same = sel.lines.filter((x) => x.id === l.id);
        if (!same.length) { bad.add('Sản phẩm'); return; }
        const s2 = same.filter((x) => x.size === l.size);
        if (!s2.length) { bad.add('Size'); return; }
        const s3 = s2.filter((x) => x.color === l.color);
        if (!s3.length) { bad.add('Màu sắc'); return; }
        if (s3[0].qty !== l.qty) bad.add('Số lượng');
      });
      sel.lines.forEach((x) => { if (!order.lines.some((l) => l.id === x.id)) bad.add('Thừa sản phẩm'); });
      return [...bad];
    },
    renderPrep(el, game) {
      const sel = game.sel;
      const zs = openZones(game, zones);
      if (!sel.tab || !zs.some((z) => z.id === sel.tab)) sel.tab = zs[0].id;
      const draw = () => {
        const prods = game.unlockedProducts().filter((p) => p.zone === sel.tab);
        const pk = sel.pick ? byId[sel.pick] : null;
        const sizes = pk ? pk.raw.sizes : [];
        const colors = pk ? pk.raw.colors : [];
        el.innerHTML = `
          <div class="sh-catalog">${tabsHtml(zs, sel.tab)}<div class="sh-pgrid">${prods.map((p) => productCard(p, '', p.id === sel.pick ? 'sel' : '')).join('')}</div></div>
          <aside class="sh-side">
            <div class="sh-panel"><h4>${pk ? `${pk.icon} ${esc(pk.vi)} <span class="zh">${esc(pk.chn)}</span>` : '👈 Chọn một sản phẩm'}</h4>
              ${pk ? `<div class="sh-lbl">📏 Size <span class="zh">尺码</span></div><div class="sh-chips">${sizes.map((s) => `<button type="button" class="sh-chip ${sel.size === s ? 'on' : ''}" data-size="${esc(s)}">${esc(sizeLabel(pk.zone, s))}</button>`).join('')}</div>
              <div class="sh-lbl">🎨 Màu <span class="zh">颜色</span></div><div class="sh-chips">${colors.map((c) => `<button type="button" class="sh-chip sw ${sel.color === c ? 'on' : ''}" data-color="${esc(c)}"><i style="background:${COLOR_HEX[c] || '#ccc'}"></i>${esc(c)} <span class="zh">${esc(D.colors[c].zh)}</span></button>`).join('')}</div>
              <button type="button" class="sh-btn small" id="btn-addbag" ${sel.size && sel.color ? '' : 'disabled'}>🛍️ Thêm vào túi</button>` : ''}
            </div>
            <div class="sh-panel bag"><h4>🛍️ <span class="zh">购物袋</span> Túi hàng</h4>
              ${sel.lines.length ? sel.lines.map((l, i) => `<div class="sh-bagrow"><span>${byId[l.id].icon} ${esc(byId[l.id].vi)} · ${esc(l.size)} · ${esc(l.color)}${l.qty > 1 ? ' ×' + l.qty : ''}</span><button type="button" class="sh-x" data-rm="${i}">✕</button></div>`).join('') : '<small>Túi đang trống</small>'}
            </div>
          </aside>`;
        el.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { sel.tab = b.dataset.tab; draw(); }));
        el.querySelectorAll('[data-pid]').forEach((b) => b.addEventListener('click', () => { sel.pick = b.dataset.pid; sel.size = null; sel.color = null; game.audio.pick(); game.learn(byId[sel.pick].chn); game.audio.speak(byId[sel.pick].chn); draw(); }));
        el.querySelectorAll('[data-size]').forEach((b) => b.addEventListener('click', () => { sel.size = b.dataset.size; game.audio.pop(); game.audio.speak(D.sizes[sel.size].zh); draw(); }));
        el.querySelectorAll('[data-color]').forEach((b) => b.addEventListener('click', () => { sel.color = b.dataset.color; game.audio.pop(); game.audio.speak(D.colors[sel.color].zh); draw(); }));
        const add = el.querySelector('#btn-addbag');
        if (add) add.addEventListener('click', () => {
          const ex = sel.lines.find((l) => l.id === sel.pick && l.size === sel.size && l.color === sel.color);
          if (ex) ex.qty += 1; else sel.lines.push({ id: sel.pick, size: sel.size, color: sel.color, qty: 1 });
          sel.pick = null; sel.size = null; sel.color = null; game.audio.pick(); draw(); game.selChanged();
        });
        el.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => { sel.lines.splice(+b.dataset.rm, 1); draw(); game.selChanged(); }));
      };
      draw();
    }
  };
}

// ===================================================================================================================
// 2. BÁNH MÌ (Bánh mì.xlsx): chọn món + chỉnh topping theo yêu cầu + nước uống
// ===================================================================================================================
export function banhmiMode(D) {
  const GZ = { banhmi: 0, drink: 0, sandwich: 120, hamburger: 200 };
  const zones = D.groups.map((g) => ({ ...g, short: g.vi, unlock: GZ[g.id] }));
  const ING = Object.fromEntries(D.ingredients.map((i) => [i.id, i]));
  const dishes = D.items; const drinks = D.drinks;
  const products = [
    ...mkProducts(dishes, (it) => it.group, (it) => (it.group === 'banhmi' ? '🥖' : it.group === 'hamburger' ? '🍔' : '🥪'), 45),
    ...mkProducts(drinks, () => 'drink', () => '🥤', 25)
  ];
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const isBase = (id) => ING[id].kind === 'base';
  const toppings = (it) => it.ingredients.filter((i) => !isBase(i));
  // các nguyên liệu có thể chọn cho từng loại bánh (công thức + nguyên liệu có thể thêm)
  const poolOf = (group) => {
    const set = new Set(D.addable[group] || []);
    dishes.filter((d) => d.group === group).forEach((d) => toppings(d).forEach((i) => set.add(i)));
    return [...set].filter((i) => ING[i] && !isBase(i));
  };
  const POOL = { banhmi: poolOf('banhmi'), hamburger: poolOf('hamburger'), sandwich: poolOf('sandwich') };
  const drinkMeasure = (d) => (/可乐|矿泉水/.test(d.chn) ? '瓶' : '杯');
  const drinkMeasureVi = (d) => (/可乐|矿泉水/.test(d.chn) ? 'chai' : 'ly');
  const vocab = [
    ...products.map((p) => ({ zh: p.chn, pin: p.pin, vi: p.vi })),
    ...D.ingredients.filter((i) => i.kind !== 'base').map((i) => ({ zh: i.zh, pin: i.pin, vi: i.vi })),
    { zh: '不要', pin: 'bú yào', vi: 'Không lấy / đừng cho' }, { zh: '多加', pin: 'duō jiā', vi: 'Thêm nhiều' }
  ];
  const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

  return {
    zones, products, vocab,
    hint: '💡 Chọn đúng <b>loại bánh</b>, chỉnh <b>topping</b> theo lời khách (bỏ / thêm) và chọn <b>nước uống</b> nếu khách gọi.',
    makeOrder(ctx) {
      const mains = ctx.products.filter((p) => p.zone !== 'drink');
      if (!mains.length) return null;
      const main = pickOne(mains); const it = main.raw;
      let target = toppings(it);
      const pool = POOL[it.group];
      const mods = [];
      const nMods = ctx.day >= 2 && Math.random() < 0.55 ? 2 : 1;
      for (let i = 0; i < nMods; i++) {
        const canRemove = target.filter((x) => !mods.some((m) => m.id === x));
        const canAdd = pool.filter((x) => !target.includes(x) && !mods.some((m) => m.id === x));
        const wantAdd = canRemove.length < 3 || (canAdd.length && Math.random() < 0.5);
        if (wantAdd && canAdd.length) { const id = pickOne(canAdd); mods.push({ id, type: 'add' }); target = [...target, id]; }
        else if (canRemove.length > 2) { const id = pickOne(canRemove); mods.push({ id, type: 'remove' }); target = target.filter((x) => x !== id); }
      }
      const openDrinks = ctx.products.filter((p) => p.zone === 'drink');
      const drink = openDrinks.length && Math.random() < 0.5 ? pickOne(openDrinks) : null;
      const open = pickOne(['我要', '给我', '来']);
      let zh = `${open}一个${it.chn}`;
      let vi = `Cho tôi 1 ${lc(it.vi)}`;
      mods.forEach((m) => { zh += m.type === 'add' ? `，多加${ING[m.id].zh}` : `，不要${ING[m.id].zh}`; vi += m.type === 'add' ? `, thêm ${lc(ING[m.id].vi)}` : `, không lấy ${lc(ING[m.id].vi)}`; });
      if (drink) { zh += `，再来一${drinkMeasure(drink.raw)}${drink.chn}`; vi += `, và 1 ${drinkMeasureVi(drink.raw)} ${lc(drink.vi)}`; }
      zh += '。'; vi += '.';
      const words = [it.chn, ...mods.map((m) => ING[m.id].zh), drink ? drink.chn : null].filter(Boolean);
      return { main: it.id, target, mods, drink: drink ? drink.id : null, say: say(zh, vi), due: main.price + (drink ? drink.price : 0), words };
    },
    emptySel() { return { main: null, ings: [], drink: null, tab: null }; },
    canConfirm(order, sel) { return !!sel.main; },
    unitCount(order) { return 1 + order.mods.length * 0.5 + (order.drink ? 1 : 0); },
    stockUse(order) { return [{ id: order.main, qty: 1 }, ...(order.drink ? [{ id: order.drink, qty: 1 }] : [])]; },
    billLines(order) {
      const m = byId[order.main]; const rows = [{ zh: m.chn, vi: m.vi, qty: 1, amount: m.price }];
      if (order.drink) { const d = byId[order.drink]; rows.push({ zh: d.chn, vi: d.vi, qty: 1, amount: d.price }); }
      return rows;
    },
    diff(order, sel) {
      const bad = [];
      if (sel.main !== order.main) bad.push('Loại bánh');
      else if (!sameSet(sel.ings, order.target)) bad.push('Topping (bỏ / thêm)');
      if ((sel.drink || null) !== (order.drink || null)) bad.push('Nước uống');
      return bad;
    },
    renderPrep(el, game) {
      const sel = game.sel;
      const zs = openZones(game, zones);
      if (!sel.tab || !zs.some((z) => z.id === sel.tab)) sel.tab = zs[0].id;
      const draw = () => {
        const prods = game.unlockedProducts().filter((p) => p.zone === sel.tab);
        const main = sel.main ? byId[sel.main] : null;
        const pool = main ? POOL[main.raw.group] : [];
        const stack = main ? sel.ings.map((i) => ING[i].icon).join('') : '';
        el.innerHTML = `
          <div class="sh-catalog">${tabsHtml(zs, sel.tab)}<div class="sh-pgrid">${prods.map((p) => productCard(p, '', (p.id === sel.main || p.id === sel.drink) ? 'sel' : '')).join('')}</div></div>
          <aside class="sh-side">
            <div class="sh-panel"><h4>${main ? `${main.icon} ${esc(main.vi)} <span class="zh">${esc(main.chn)}</span>` : '👈 Chọn loại bánh'}</h4>
              ${main ? `<div class="sh-sandwich"><span>🥖</span><span class="stack">${stack || '…'}</span><span>🥖</span></div>
              <div class="sh-lbl">🧂 Topping <span class="zh">配料</span> <small>(bấm để bỏ / thêm)</small></div>
              <div class="sh-chips">${pool.map((i) => `<button type="button" class="sh-chip ${sel.ings.includes(i) ? 'on' : ''}" data-ing="${i}">${ING[i].icon} ${esc(ING[i].vi)} <span class="zh">${esc(ING[i].zh)}</span></button>`).join('')}</div>` : ''}
            </div>
            <div class="sh-panel bag"><h4>🥤 <span class="zh">饮料</span> Nước uống</h4>${sel.drink ? `<div class="sh-bagrow"><span>${byId[sel.drink].icon} ${esc(byId[sel.drink].vi)} <span class="zh">${esc(byId[sel.drink].chn)}</span></span><button type="button" class="sh-x" data-rmdrink>✕</button></div>` : '<small>Chưa chọn (chọn ở tab “Nước uống”)</small>'}</div>
          </aside>`;
        el.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { sel.tab = b.dataset.tab; draw(); }));
        el.querySelectorAll('[data-pid]').forEach((b) => b.addEventListener('click', () => {
          const p = byId[b.dataset.pid]; game.audio.pick(); game.learn(p.chn); game.audio.speak(p.chn);
          if (p.zone === 'drink') sel.drink = sel.drink === p.id ? null : p.id;
          else { sel.main = p.id; sel.ings = toppings(p.raw); }
          draw(); game.selChanged();
        }));
        el.querySelectorAll('[data-ing]').forEach((b) => b.addEventListener('click', () => {
          const id = b.dataset.ing;
          sel.ings = sel.ings.includes(id) ? sel.ings.filter((x) => x !== id) : [...sel.ings, id];
          game.audio.pop(); game.audio.speak(ING[id].zh); draw(); game.selChanged();
        }));
        const rm = el.querySelector('[data-rmdrink]'); if (rm) rm.addEventListener('click', () => { sel.drink = null; draw(); game.selChanged(); });
      };
      draw();
    }
  };
}

// ===================================================================================================================
// Lưới hàng có +/- số lượng (Cá viên · Mỹ phẩm)
// ===================================================================================================================
function qtyGrid(el, game, { zones, byId, extraTabs = '', extraPanel = '', bindExtra, maxQty = 9 }) {
  const sel = game.sel;
  const zs = openZones(game, zones);
  if (!sel.tab || (!zs.some((z) => z.id === sel.tab) && sel.tab !== '__extra')) sel.tab = zs[0].id;
  const draw = () => {
    const prods = game.unlockedProducts().filter((p) => p.zone === sel.tab);
    const total = Object.values(sel.qty).reduce((a, b) => a + b, 0);
    const picked = Object.keys(sel.qty).filter((k) => sel.qty[k] > 0);
    el.innerHTML = `
      <div class="sh-catalog">${tabsHtml(zs, sel.tab).replace('</div>', `${extraTabs.replace('%ACTIVE%', sel.tab === '__extra' ? 'active' : '')}</div>`)}
        <div class="sh-pgrid">${sel.tab === '__extra' ? '' : prods.map((p) => productCard(p, `<div class="sh-qty"><button type="button" data-dec="${p.id}">−</button><b>${sel.qty[p.id] || 0}</b><button type="button" data-inc="${p.id}">+</button></div>`, sel.qty[p.id] ? 'sel' : '')).join('')}</div>
        ${sel.tab === '__extra' ? '<div class="sh-extra-wrap" id="extra-main"></div>' : ''}</div>
      <aside class="sh-side">${extraPanel ? '<div id="extra-side"></div>' : ''}<div class="sh-panel bag"><h4>🧺 Giỏ hàng <small>(${total} món)</small></h4>
        ${picked.length ? picked.map((k) => `<div class="sh-bagrow"><span><span class="sh-pile">${byId[k].icon.repeat(Math.min(sel.qty[k], 6))}</span> ${esc(byId[k].vi)} ×${sel.qty[k]}</span><button type="button" class="sh-x" data-clr="${k}">✕</button></div>`).join('') : '<small>Giỏ đang trống</small>'}</div></aside>`;
    el.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { sel.tab = b.dataset.tab; draw(); }));
    el.querySelectorAll('[data-inc]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); const id = b.dataset.inc; if ((sel.qty[id] || 0) < Math.min(maxQty, game.stock[id] ?? maxQty)) { sel.qty[id] = (sel.qty[id] || 0) + 1; game.audio.pick(); game.learn(byId[id].chn); game.audio.speak(`${sel.qty[id]}`); } draw(); game.selChanged(); }));
    el.querySelectorAll('[data-dec]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); const id = b.dataset.dec; if ((sel.qty[id] || 0) > 0) { sel.qty[id] -= 1; game.audio.pop(); } draw(); game.selChanged(); }));
    el.querySelectorAll('[data-pid]').forEach((b) => b.addEventListener('click', (e) => { if (e.target.closest('.sh-qty')) return; game.audio.speak(byId[b.dataset.pid].chn); game.learn(byId[b.dataset.pid].chn); }));
    el.querySelectorAll('[data-clr]').forEach((b) => b.addEventListener('click', () => { sel.qty[b.dataset.clr] = 0; draw(); game.selChanged(); }));
    if (bindExtra) bindExtra(el, draw, sel);
  };
  draw();
}

const qtyDiff = (order, sel, labels) => {
  const bad = new Set();
  order.items.forEach((l) => { if (!(sel.qty[l.id] > 0)) bad.add(labels.missing); else if (sel.qty[l.id] !== l.qty) bad.add(labels.qty); });
  Object.keys(sel.qty).forEach((k) => { if (sel.qty[k] > 0 && !order.items.some((l) => l.id === k)) bad.add(labels.extra); });
  return [...bad];
};

// ===================================================================================================================
// 3. CÁ VIÊN (Cá viên.xlsx): món + số lượng (lượng từ) + nước chấm + mang đi/ăn tại chỗ + độ chiên
// ===================================================================================================================
const FOOD_ICON = [['鱼丸', '🍢'], ['丸', '🍡'], ['蟹', '🦀'], ['鱼豆腐', '🍥'], ['鱼饼', '🍥'], ['香肠', '🌭'], ['热狗', '🌭'], ['烤肠', '🌭'], ['年糕', '🍘'], ['甜不辣', '🍥'], ['豆腐', '⬜'], ['豆皮', '🟨'], ['蛋', '🥚'], ['鸡翅', '🍗'], ['鸡腿', '🍗'], ['鸡', '🍗'], ['薯条', '🍟'], ['春卷', '🥟'], ['云吞', '🥟'], ['煎饺', '🥟'], ['玉米', '🌽'], ['蘑菇', '🍄'], ['金针菇', '🍄'], ['茄子', '🍆'], ['鱿鱼', '🦑'], ['香蕉', '🍌'], ['馒头', '🍞']];
const SAUCE_ICON = { S001: '🌶️', S002: '🍅', S003: '🥫', S004: '🌶️', S005: '🍖', S006: '🧀', S007: '🧄', S008: '🦐', S009: '🔥', S013: '🌿' };

export function cavienMode(D) {
  const zoneOfFood = (it) => (it.group === 'Món chiên' ? 'chien' : 'khac');
  const zones = [
    { id: 'chien', chn: '炸物', pin: 'zhá wù', vi: 'Món chiên', short: 'Món chiên', icon: '🍤', unlock: 0 },
    { id: 'khac', chn: '烤炒煎', pin: 'kǎo chǎo jiān', vi: 'Nướng · xào · áp chảo · ăn nhanh', short: 'Món khác', icon: '🌭', unlock: 120 },
    { id: 'drink', chn: '饮料', pin: 'yǐnliào', vi: 'Nước uống', short: 'Nước uống', icon: '🥤', unlock: 80 }
  ];
  const cnt = { chien: 0, khac: 0 };
  const foods = D.foods.map((f) => { const z = zoneOfFood(f); const i = cnt[z]++; return { ...f, tier: Math.min(4, Math.floor(i / 5)) }; });
  // chỉ giữ 5 loại nước chấm phổ biến; mỗi loại là một mặt hàng phải NHẬP KHO (khách chấm bao nhiêu thì hết bấy nhiêu)
  const SAUCE_KEEP = ['S001', 'S002', 'S003', 'S005', 'S006'];
  const sauces = D.sauces.filter((s) => SAUCE_KEEP.includes(s.id));
  zones.push({ id: 'sauce', chn: '酱料', pin: 'jiàngliào', vi: 'Nước chấm', short: 'Nước chấm', icon: '🫙', unlock: 0, prep: false });
  const products = [
    ...mkProducts(foods, zoneOfFood, (it) => iconBy(it.chn, FOOD_ICON, '🍢'), 30),
    ...mkProducts(D.drinks, () => 'drink', () => '🥤', 25),
    ...sauces.map((s) => ({ id: s.id, zone: 'sauce', chn: s.chn, pin: s.pin, vi: s.vi, price: 0, icon: SAUCE_ICON[s.id] || '🫙', tier: 0, unlockCost: 0, cost: 1, maxStock: 30, raw: s }))
  ];
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const sById = Object.fromEntries(sauces.map((s) => [s.id, s]));
  const measureVi = (p) => lc(p.raw.sampleVi || p.vi).replace(/^một\s+/, '');
  const itemSay = (p, n) => (p.zone === 'drink' ? `${num(n)}${/可乐|矿泉水/.test(p.chn) ? '瓶' : '杯'}${p.chn}` : `${num(n)}${p.raw.measure}${p.raw.nameSaid}`);
  const itemVi = (p, n) => (p.zone === 'drink' ? `${n} ${/可乐|矿泉水/.test(p.chn) ? 'chai' : 'ly'} ${lc(p.vi)}` : `${n} ${measureVi(p)}`);
  const FRY = { normal: ['可以帮我炸一下吗？', 'Có thể chiên giúp tôi không?'], crisp: ['帮我炸久一点，炸脆一点', 'Chiên lâu hơn, giòn hơn giúp tôi'], nocharr: ['不要炸得太焦', 'Đừng chiên cháy quá'] };
  const SERVE = { take: ['我要打包', 'Tôi muốn mang đi'], dine: ['我在这里吃', 'Tôi ăn tại đây'] };
  const vocab = [
    ...products.map((p) => ({ zh: p.chn, pin: p.pin, vi: p.vi })),
    ...sauces.map((s) => ({ zh: s.chn, pin: s.pin, vi: s.vi })),
    { zh: '打包', pin: 'dǎbāo', vi: 'Mang đi' }, { zh: '在这里吃', pin: 'zài zhèlǐ chī', vi: 'Ăn tại đây' }, { zh: '炸脆一点', pin: 'zhá cuì yìdiǎn', vi: 'Chiên giòn hơn' }, { zh: '不要炸得太焦', pin: 'bú yào zhá de tài jiāo', vi: 'Đừng chiên cháy' }
  ];
  return {
    zones, products, vocab,
    hint: '💡 Chọn đúng <b>món</b> và <b>số lượng</b>, thêm <b>nước chấm</b>, chọn <b>mang đi / ăn tại đây</b>, rồi <b>chiên</b> — vớt ra đúng vùng 🟢 vừa · 🟠 giòn · 🔴 cháy.',
    makeOrder(ctx) {
      const pool = ctx.products.filter((p) => p.zone !== 'drink' && p.zone !== 'sauce');
      if (!pool.length) return null;
      const nLines = Math.min(pool.length, ctx.day >= 3 ? randInt(2, 3) : randInt(1, 2));
      const items = shuffle(pool).slice(0, nLines).map((p) => ({ id: p.id, qty: Math.min(ctx.stock(p.id), randInt(1, ctx.day >= 4 ? 5 : 3)) }));
      const drinks = ctx.products.filter((p) => p.zone === 'drink');
      if (drinks.length && Math.random() < 0.3) items.push({ id: pickOne(drinks).id, qty: 1 });
      const nSauce = Math.random() < 0.25 ? 0 : (Math.random() < 0.3 ? 2 : 1);
      const ss = shuffle(ctx.products.filter((p) => p.zone === 'sauce')).slice(0, nSauce).map((s) => s.id);   // chỉ gọi nước chấm còn trong kho
      const serve = Math.random() < 0.5 ? 'take' : 'dine';
      const hasFry = items.some((x) => byId[x.id].raw.group === 'Món chiên');
      let fry = 'none';
      if (hasFry) { const r = Math.random(); fry = r < 0.5 ? 'normal' : r < 0.8 ? 'crisp' : 'nocharr'; }
      const open = pickOne(['给我', '我要', '来']);
      let zh = `${open}${items.map((x) => itemSay(byId[x.id], x.qty)).join('和')}。`;
      let vi = `Cho tôi ${items.map((x) => itemVi(byId[x.id], x.qty)).join(' và ')}.`;
      if (ss.length) {
        zh += `${pickOne(['多加一点', '要', '加一点'])}${ss.map((s) => sById[s].chn).join('和')}。`;
        vi += ` Thêm ${ss.map((s) => lc(sById[s].vi)).join(' và ')}.`;
      }
      zh += `${SERVE[serve][0]}。`; vi += ` ${SERVE[serve][1]}.`;
      if (fry !== 'none') { const fz = FRY[fry][0]; const fv = FRY[fry][1]; zh += '？！。'.includes(fz.slice(-1)) ? fz : fz + '。'; vi += ' ' + fv + (fv.endsWith('?') ? '' : '.'); }
      const words = [...items.map((x) => byId[x.id].chn), ...ss.map((s) => sById[s].chn), serve === 'take' ? '打包' : '在这里吃', ...(fry === 'crisp' ? ['炸脆一点'] : fry === 'nocharr' ? ['不要炸得太焦'] : [])];
      return { items, sauces: ss, serve, fry, say: say(zh, vi), due: items.reduce((s, x) => s + byId[x.id].price * x.qty, 0), words };
    },
    emptySel() { return { qty: {}, sauces: [], serve: null, fry: null, frying: false, fryP: null, tab: null }; },
    canConfirm(order, sel) { return Object.values(sel.qty).some((v) => v > 0) && !!sel.serve && (order.fry === 'none' || (!!sel.fry && !sel.frying)); },
    unitCount(order) { return Math.ceil(order.items.reduce((s, x) => s + x.qty, 0) / 2) + order.sauces.length; },
    stockUse(order) { return [...order.items.map((x) => ({ id: x.id, qty: x.qty })), ...order.sauces.map((s) => ({ id: s, qty: 1 }))]; },
    billLines(order) { return order.items.map((x) => ({ zh: byId[x.id].chn, vi: byId[x.id].vi, qty: x.qty, amount: byId[x.id].price * x.qty })); },
    diff(order, sel) {
      const bad = qtyDiff(order, sel, { missing: 'Món hàng', qty: 'Số lượng', extra: 'Thừa món' });
      if (sel.sauces.length !== order.sauces.length || !order.sauces.every((s) => sel.sauces.includes(s))) bad.push('Nước chấm');
      if (sel.serve !== order.serve) bad.push('Mang đi / ăn tại đây');
      if (order.fry === 'normal' && sel.fry !== 'normal') bad.push('Độ chiên (khách muốn chín vừa — vùng xanh)');
      else if (order.fry === 'crisp' && sel.fry !== 'crisp') bad.push('Độ chiên (khách muốn giòn hơn — vùng cam)');
      else if (order.fry === 'nocharr' && !['normal', 'crisp'].includes(sel.fry)) bad.push('Độ chiên (khách không muốn cháy — đừng để vào vùng đỏ)');
      return bad;
    },
    renderPrep(el, game) {
      qtyGrid(el, game, {
        zones, byId,
        extraTabs: '<button type="button" class="sh-ptab %ACTIVE%" data-tab="__extra">🫙 Nước chấm</button>',
        extraPanel: true,
        bindExtra(root, draw, sel) {
          const main = root.querySelector('#extra-main');
          if (main) {
            main.innerHTML = `<div class="sh-lbl">🫙 Nước chấm <span class="zh">酱料</span> <small>(chọn theo lời khách, có thể không chọn)</small></div>
              <div class="sh-chips big">${sauces.filter((s) => game.zonesOpen.has('sauce') && game.itemsOpen.has(s.id)).map((s) => `<button type="button" class="sh-chip ${sel.sauces.includes(s.id) ? 'on' : ''}${(game.stock[s.id] || 0) <= 0 ? ' out' : ''}" data-sauce="${s.id}">${SAUCE_ICON[s.id] || '🫙'} ${esc(s.vi)} <span class="zh">${esc(s.chn)}</span></button>`).join('')}</div>`;
            main.querySelectorAll('[data-sauce]').forEach((b) => b.addEventListener('click', () => {
              const id = b.dataset.sauce;
              sel.sauces = sel.sauces.includes(id) ? sel.sauces.filter((x) => x !== id) : [...sel.sauces, id];
              game.audio.pop(); game.audio.speak(sById[id].chn); game.learn(sById[id].chn); draw(); game.selChanged();
            }));
          }
          const side = root.querySelector('#extra-side');
          if (side) renderCavienSide(side, { game, sel, draw, byId, sById, SERVE, SAUCE_ICON, order: game.current && game.current.order });
        }
      });
    }
  };
}

// ===================================================================================================================
// 4. TIỆM MỸ PHẨM (Tiệm mĩ phẩm.xlsx): chọn đúng sản phẩm + số lượng (lượng từ 瓶/支/罐/盒…)
// ===================================================================================================================
const BEAUTY_ICON = [['洗面奶', '🧴'], ['卸妆水', '💧'], ['爽肤水', '💦'], ['精华', '🧪'], ['面霜', '🫙'], ['乳液', '🧴'], ['眼霜', '👁️'], ['面膜', '🎭'], ['润唇', '💋'], ['护手', '🤲'], ['口红', '💄'], ['唇釉', '💋'], ['粉底', '🧴'], ['气垫', '🪞'], ['遮瑕', '🖍️'], ['散粉', '☁️'], ['腮红', '🌸'], ['眉笔', '✏️'], ['眼线', '🖊️'], ['睫毛膏', '👁️'], ['眼影', '🎨'], ['妆前', '🧴'], ['防晒', '🌞'], ['晒后', '🌿'], ['洗发', '🧴'], ['护发素', '🧴'], ['发膜', '🫙'], ['沐浴', '🛁'], ['身体乳', '🧴'], ['止汗', '💨'], ['精油', '🫗'], ['化妆刷', '🖌️'], ['美妆蛋', '🧽'], ['粉扑', '⚪'], ['化妆棉', '☁️'], ['棉签', '🪥'], ['睫毛夹', '✂️'], ['眉毛剪', '✂️'], ['化妆镜', '🪞'], ['发夹', '🎀'], ['梳子', '💇']];

export function mayphamMode(D) {
  const GZ = { da: 0, dungcu: 100, chongnang: 150, trangdiem: 250, toc: 300 };
  const zones = D.groups.map((g) => ({ ...g, short: g.vi, unlock: GZ[g.id] }));
  const products = mkProducts(D.items, (it) => it.group, (it) => iconBy(it.chn, BEAUTY_ICON, '🧴'), 90);
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const itemSay = (p, n) => `${num(n)}${p.raw.measure}${p.raw.nameSaid}`;
  const itemVi = (p, n) => `${n} ${lc(p.raw.sampleVi).replace(/^một\s+/, '')}`;
  const vocab = [...products.map((p) => ({ zh: p.chn, pin: p.pin, vi: p.vi })), ...D.groups.map((g) => ({ zh: g.chn, pin: g.pin, vi: g.vi })), ...(D.slang || []).map((s) => ({ zh: s.zh, pin: s.pin, vi: s.vi.slice(0, 90) }))];
  return {
    zones, products, vocab,
    hint: '💡 Nghe kỹ <b>tên sản phẩm</b> và <b>lượng từ</b> (瓶 · 支 · 罐 · 盒 · 个…), rồi chọn đúng món và số lượng.',
    makeOrder(ctx) {
      const pool = ctx.products;
      if (!pool.length) return null;
      for (let attempt = 0; attempt < 12; attempt++) {
        const nLines = Math.min(pool.length, ctx.day >= 3 ? randInt(2, 3) : randInt(1, 2));
        const items = shuffle(pool).slice(0, nLines).map((p) => ({ id: p.id, qty: Math.min(ctx.stock(p.id), ctx.day >= 4 && Math.random() < 0.3 ? 2 : 1) }));
        const due = items.reduce((s, x) => s + byId[x.id].price * x.qty, 0);
        if (due >= 990) continue;
        const open = pickOne(['我想买', '请给我', '我要', '麻烦给我拿']);
        const zh = `${open}${items.map((x) => itemSay(byId[x.id], x.qty)).join('和')}。`;
        const vi = `${pickOne(['Tôi muốn mua', 'Làm ơn đưa tôi', 'Tôi cần', 'Phiền bạn lấy cho tôi'])} ${items.map((x) => itemVi(byId[x.id], x.qty)).join(' và ')}.`;
        return { items, say: say(zh, vi), due, words: items.map((x) => byId[x.id].chn) };
      }
      return null;
    },
    emptySel() { return { qty: {}, tab: null }; },
    canConfirm(order, sel) { return Object.values(sel.qty).some((v) => v > 0); },
    unitCount(order) { return order.items.reduce((s, x) => s + x.qty, 0); },
    stockUse(order) { return order.items.map((x) => ({ id: x.id, qty: x.qty })); },
    billLines(order) { return order.items.map((x) => ({ zh: byId[x.id].chn, vi: byId[x.id].vi, qty: x.qty, amount: byId[x.id].price * x.qty })); },
    diff(order, sel) { return qtyDiff(order, sel, { missing: 'Sản phẩm', qty: 'Số lượng', extra: 'Thừa sản phẩm' }); },
    renderPrep(el, game) { qtyGrid(el, game, { zones, byId, maxQty: 5 }); }
  };
}
