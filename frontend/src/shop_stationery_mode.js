/**
 * Cửa hàng văn phòng phẩm (我的文具店) — logic riêng: sinh đơn (nhiều món + màu + số lượng), kiểm tra giỏ hàng, hóa đơn, quét mã & đóng gói.
 * Dữ liệu sản phẩm: shop_data/stationery.js (sinh bởi scripts/gen_stationery_data.cjs).
 */
import { randInt, pickOne, shuffle, say } from './shop_engine.js';
import { intToZh } from './shop_dialogue.js';
import { renderStationery } from './shop_stationery_ui.js';
import { runScanPack } from './shop_scan.js';

const num = (n) => (n === 2 ? '两' : intToZh(n));
const lc = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

export function stationeryMode(D) {
  const zones = D.groups.map((g) => ({ id: g.id, chn: g.chn, pin: g.pin, vi: g.vi, short: g.vi, icon: g.icon, unlock: g.unlock }));
  const products = D.items.map((it) => ({ id: it.id, zone: it.group, chn: it.chn, pin: it.pin, vi: it.vi, price: it.price, icon: it.icon, tier: it.tier, unlockCost: it.tier * 50, cost: it.cost, maxStock: it.price >= 30 ? 6 : 20, raw: it }));
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const vocab = [
    ...products.map((p) => ({ zh: p.chn, pin: p.pin, vi: p.vi })),
    ...Object.values(D.colors).map((c) => ({ zh: c.zh, pin: c.pin, vi: 'Màu ' + c.vi.toLowerCase() })),
    ...D.groups.map((g) => ({ zh: g.chn, pin: g.pin, vi: g.vi })),
    { zh: '扫码', pin: 'sǎomǎ', vi: 'quét mã' }, { zh: '打包', pin: 'dǎbāo', vi: 'đóng gói' }, { zh: '购物车', pin: 'gòuwùchē', vi: 'giỏ hàng' }
  ];
  const nameOf = (l) => (l.color ? D.colors[l.color].zh + '的' : '') + byId[l.id].chn;
  const keyOf = (l) => l.id + '|' + (l.color || '');

  return {
    zones, products, vocab,
    stall: true, payTable: true,
    hint: '',
    makeOrder(ctx) {
      const pool = ctx.products;
      if (!pool.length) return null;
      for (let attempt = 0; attempt < 12; attempt++) {
        const maxLines = Math.min(4, 1 + Math.ceil(ctx.day / 2));
        const nLines = Math.min(pool.length, randInt(1, maxLines));
        const maxQty = Math.min(5, 1 + Math.ceil(ctx.day / 2));
        const lines = shuffle(pool).slice(0, nLines).map((p) => ({ id: p.id, color: p.raw.colors ? pickOne(p.raw.colors) : null, qty: Math.max(1, Math.min(ctx.stock(p.id), randInt(1, maxQty))) }));
        const due = lines.reduce((s, l) => s + byId[l.id].price * l.qty, 0);
        if (due >= 990) continue;
        const partsZh = lines.map((l) => num(l.qty) + byId[l.id].raw.measure + (l.color ? D.colors[l.color].zh + '的' : '') + byId[l.id].chn);
        const partsVi = lines.map((l) => l.qty + ' ' + byId[l.id].raw.measureVi + ' ' + lc(byId[l.id].vi) + (l.color ? ' màu ' + D.colors[l.color].vi.toLowerCase() : ''));
        const joinZh = partsZh.length === 1 ? partsZh[0] : partsZh.slice(0, -1).join('、') + '和' + partsZh[partsZh.length - 1];
        const joinVi = partsVi.length === 1 ? partsVi[0] : partsVi.slice(0, -1).join(', ') + ' và ' + partsVi[partsVi.length - 1];
        const open = pickOne(['我要', '我想买', '请给我', '麻烦给我拿']);
        const openVi = { '我要': 'Tôi muốn', '我想买': 'Tôi muốn mua', '请给我': 'Làm ơn đưa tôi', '麻烦给我拿': 'Phiền bạn lấy cho tôi' }[open];
        return { lines, say: say(open + joinZh + '。', openVi + ' ' + joinVi + '.'), due, words: [...lines.map((l) => byId[l.id].chn), ...lines.filter((l) => l.color).map((l) => D.colors[l.color].zh)] };
      }
      return null;
    },
    emptySel() { return { lines: [], tab: null, pick: null, color: null }; },
    canConfirm(order, sel) { return sel.lines.length > 0; },
    unitCount(order) { return Math.ceil(order.lines.reduce((s, l) => s + l.qty, 0) / 2); },
    stockUse(order) { return order.lines.map((l) => ({ id: l.id, qty: l.qty })); },
    billLines(order) { return order.lines.map((l) => ({ zh: nameOf(l), vi: byId[l.id].vi, qty: l.qty, amount: byId[l.id].price * l.qty, unit: byId[l.id].price, icon: byId[l.id].icon, name: byId[l.id].vi, nameZh: nameOf(l), color: l.color ? D.colors[l.color].vi : '' })); },
    diff(order, sel) {
      const bad = new Set();
      const want = new Map(); order.lines.forEach((l) => want.set(keyOf(l), (want.get(keyOf(l)) || 0) + l.qty));
      const have = new Map(); sel.lines.forEach((l) => have.set(keyOf(l), (have.get(keyOf(l)) || 0) + l.qty));
      want.forEach((q, k) => {
        const [id] = k.split('|');
        if (!have.has(k)) { const sameId = [...have.keys()].some((x) => x.split('|')[0] === id); bad.add(sameId ? 'Màu sắc' : 'Thiếu sản phẩm'); }
        else if (have.get(k) !== q) bad.add('Số lượng');
      });
      have.forEach((q, k) => {
        if (want.has(k)) return;
        const id = k.split('|')[0];
        if (![...want.keys()].some((x) => x.split('|')[0] === id)) bad.add('Thừa sản phẩm');
      });
      return [...bad];
    },
    beforePay(game, c) { return runScanPack(game, c, { byId, D, shuffle }); },
    renderPrep(el, game) { renderStationery(el, game, { byId, D, zones }); }
  };
}
