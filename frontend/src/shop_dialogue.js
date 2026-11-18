/**
 * Hội thoại THANH TOÁN dùng chung cho Tiệm Tạp Hóa và Tiệm Trà Sữa (thay cho phần thối tiền).
 *
 * Luồng 1 đơn (người chơi đóng vai chủ tiệm, chọn câu tiếng Trung đúng):
 *   khách:  "老板，结账。"
 *   BẠN:    nói tổng hóa đơn + hỏi chuyển khoản hay tiền mặt   (chọn đúng SỐ TIỀN trên hóa đơn)
 *   khách:  "我付现金。" / "我转账吧。"
 *   BẠN:    đáp đúng theo cách khách trả (nhận tiền mặt / mời quét mã)
 *   khách:  "给你，正好。" / "好了，转账成功了！"
 *   BẠN:    chào cảm ơn
 *   khách:  "谢谢，再见！"
 * Chọn sai: bị trừ điểm (đếm vào dlg.wrong), câu sai chuyển xám, chọn lại.
 */
import { pinyin } from 'pinyin-pro';

const D = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

// 0..999 → chữ Hán (35 → 三十五, 105 → 一百零五, 110 → 一百一十)
export function intToZh(n) {
  n = Math.max(0, Math.floor(n));
  if (n < 10) return D[n];
  if (n < 20) return '十' + (n % 10 ? D[n % 10] : '');
  if (n < 100) return D[Math.floor(n / 10)] + '十' + (n % 10 ? D[n % 10] : '');
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const r = n % 100;
    if (r === 0) return D[h] + '百';
    if (r < 10) return D[h] + '百零' + D[r];
    if (r < 20) return D[h] + '百一十' + (r % 10 ? D[r % 10] : '');
    return D[h] + '百' + intToZh(r);
  }
  return String(n);
}

// 35.5 → 三十五块五 · 12 → 十二块 · 0.5 → 五毛
export function amountToZh(v) {
  const c = Math.round(v * 100);
  const yuan = Math.floor(c / 100);
  const jiao = Math.round((c % 100) / 10);
  if (yuan === 0) return `${D[jiao]}毛`;
  return `${intToZh(yuan)}块${jiao ? D[jiao] : ''}`;
}

const viNum = (v) => String(Math.round(v * 100) / 100).replace('.', ',');
const py = (zh) => { try { return pinyin(zh, { toneType: 'symbol' }); } catch (e) { return ''; } };
const line = (zh, vi) => ({ zh, pin: py(zh), vi });
const shuffle = (arr, rand) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (arr, rand) => arr[Math.floor(rand() * arr.length)];

const OPEN = [
  ['老板，结账。', 'Chủ quán ơi, tính tiền.'],
  ['老板，一共多少钱？', 'Chủ quán ơi, tổng cộng bao nhiêu tiền?'],
  ['麻烦结一下账。', 'Phiền bạn tính tiền giúp.'],
  ['好了，我要买单。', 'Xong rồi, tôi muốn thanh toán.']
];

// hai con số sai nhưng "nghe hợp lý" để người chơi phải đọc kỹ hóa đơn
function wrongAmounts(due, rand) {
  const out = [];
  const seen = new Set([amountToZh(due)]);
  const deltas = shuffle([-10, -5, -3, -2, -1, 1, 2, 3, 5, 10, 0.5, -0.5], rand);
  for (const d of deltas) {
    const v = Math.round((due + d) * 100) / 100;
    if (v <= 0) continue;
    const z = amountToZh(v);
    if (seen.has(z)) continue;
    seen.add(z);
    out.push(v);
    if (out.length === 2) break;
  }
  let extra = 1;
  while (out.length < 2) { const v = due + 11 + extra++; seen.add(amountToZh(v)); out.push(v); }
  return out;
}

/**
 * order: { due: số tiền hóa đơn, pay: 'cash' | 'qr' }
 * Trả về trạng thái hội thoại: log (đã nói), turns (các lượt), idx, wrong, finished.
 */
export function createCheckoutDialogue(order, rand = Math.random) {
  const due = order.due;
  const pay = order.pay === 'qr' ? 'qr' : 'cash';
  const A = amountToZh(due);
  const a = viNum(due);
  const [w1, w2] = wrongAmounts(due, rand);
  const opt = (zh, vi, ok, why = '') => ({ ...line(zh, vi), ok, why, tried: false });

  const turns = [];
  const o = pick(OPEN, rand);
  turns.push({ who: 'cust', ...line(o[0], o[1]) });

  turns.push({
    who: 'me',
    topic: 'Nói tổng hóa đơn và hỏi cách thanh toán',
    options: shuffle([
      opt(`您的账单一共${A}，您想转账还是付现金？`, `Hóa đơn của bạn tổng cộng ${a} tệ. Bạn muốn chuyển khoản hay trả tiền mặt?`, true),
      opt(`您的账单一共${amountToZh(w1)}，您想转账还是付现金？`, `Hóa đơn của bạn tổng cộng ${viNum(w1)} tệ. Bạn muốn chuyển khoản hay trả tiền mặt?`, false, `Hóa đơn là ${a} tệ, câu này đọc sai số tiền (${viNum(w1)} tệ).`),
      opt(`您的账单一共${amountToZh(w2)}，您想转账还是付现金？`, `Hóa đơn của bạn tổng cộng ${viNum(w2)} tệ. Bạn muốn chuyển khoản hay trả tiền mặt?`, false, `Hóa đơn là ${a} tệ, câu này đọc sai số tiền (${viNum(w2)} tệ).`)
    ], rand)
  });

  turns.push({ who: 'cust', ...(pay === 'cash' ? line('我付现金。', 'Tôi trả tiền mặt.') : line(pick(['我转账吧。', '我扫码付款。'], rand), 'Tôi chuyển khoản (quét mã) nhé.')), payMethod: pay });

  if (pay === 'cash') {
    turns.push({
      who: 'me',
      topic: 'Nhận tiền mặt',
      options: shuffle([
        opt(`好的，收您${A}，正好，谢谢！`, `Được, nhận của bạn ${a} tệ, vừa đủ, cảm ơn!`, true),
        opt(`好的，收您${amountToZh(w1)}，正好，谢谢！`, `Được, nhận của bạn ${viNum(w1)} tệ, vừa đủ, cảm ơn!`, false, `Khách trả tiền mặt đúng ${a} tệ, câu này nói sai số tiền.`),
        opt('好的，请扫这个二维码付款。', 'Được, mời quét mã QR để thanh toán.', false, 'Khách trả TIỀN MẶT, không cần quét mã QR.')
      ], rand)
    });
    turns.push({ who: 'cust', ...line('给你，正好。', 'Của bạn đây, vừa đủ.') });
  } else {
    turns.push({
      who: 'me',
      topic: 'Hướng dẫn chuyển khoản',
      options: shuffle([
        opt('好的，请扫这个二维码付款。', 'Được, mời quét mã QR để thanh toán.', true),
        opt(`好的，收您${A}，正好，谢谢！`, `Được, nhận của bạn ${a} tệ, vừa đủ, cảm ơn!`, false, 'Khách muốn CHUYỂN KHOẢN, bạn phải mời họ quét mã QR.'),
        opt('不好意思，我们现在不能转账。', 'Xin lỗi, bây giờ chúng tôi không nhận chuyển khoản.', false, 'Khách muốn chuyển khoản mà bạn từ chối — chọn câu mời quét mã.')
      ], rand)
    });
    turns.push({ who: 'cust', ...line('好了，转账成功了！', 'Xong rồi, chuyển khoản thành công!') });
  }

  turns.push({
    who: 'me',
    topic: 'Chào cảm ơn khách',
    options: shuffle([
      opt('谢谢惠顾，欢迎下次再来！', 'Cảm ơn quý khách, hoan nghênh lần sau lại đến!', true),
      opt('请问您要几个？', 'Xin hỏi bạn muốn mấy cái?', false, 'Khách đã thanh toán xong, không phải lúc hỏi số lượng.'),
      opt('不好意思，这个卖完了。', 'Xin lỗi, món này hết rồi.', false, 'Khách đã thanh toán xong — câu này không hợp.')
    ], rand)
  });
  turns.push({ who: 'cust', ...line('谢谢，再见！', 'Cảm ơn, tạm biệt!') });

  const dlg = { due, pay, turns, idx: 0, wrong: 0, log: [], finished: false, payMethod: null };
  advanceCustomer(dlg);
  return dlg;
}

// đẩy các lượt khách vào log cho tới khi đến lượt người chơi (hoặc hết hội thoại)
function advanceCustomer(dlg) {
  const spoken = [];
  while (dlg.idx < dlg.turns.length && dlg.turns[dlg.idx].who === 'cust') {
    const t = dlg.turns[dlg.idx];
    dlg.log.push({ who: 'cust', zh: t.zh, pin: t.pin, vi: t.vi });
    if (t.payMethod) dlg.payMethod = t.payMethod;
    spoken.push(t.zh);
    dlg.idx += 1;
  }
  if (dlg.idx >= dlg.turns.length) dlg.finished = true;
  return spoken;
}

export function currentTurn(dlg) {
  const t = dlg.turns[dlg.idx];
  return t && t.who === 'me' ? t : null;
}

// Người chơi chọn câu thứ i. Trả về { ok, why, spoken: [câu cần đọc], finished }
export function pickOption(dlg, i) {
  const t = currentTurn(dlg);
  if (!t || !t.options[i] || t.options[i].tried) return { ok: false, ignored: true };
  const o = t.options[i];
  if (!o.ok) {
    o.tried = true;
    dlg.wrong += 1;
    return { ok: false, why: o.why };
  }
  dlg.log.push({ who: 'me', zh: o.zh, pin: o.pin, vi: o.vi });
  dlg.idx += 1;
  const spoken = [o.zh, ...advanceCustomer(dlg)];
  return { ok: true, spoken, finished: dlg.finished };
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// HTML khung chat (các câu đã nói)
export function renderChatHtml(dlg, { showPinyin = true, showVi = true } = {}) {
  return dlg.log.map((m) => `<div class="pay-bub ${m.who === 'me' ? 'me' : 'cust'}"><b class="zh">${esc(m.zh)}</b>${showPinyin ? `<small class="pin">${esc(m.pin)}</small>` : ''}${showVi ? `<small class="vi">${esc(m.vi)}</small>` : ''}</div>`).join('');
}

// HTML các lựa chọn của lượt hiện tại
export function renderOptionsHtml(dlg, { showPinyin = true, showVi = true } = {}) {
  const t = currentTurn(dlg);
  if (!t) return dlg.finished ? '<div class="pay-done">✅ Xong! Đang giao hàng…</div>' : '';
  return `<div class="pay-topic">💬 ${esc(t.topic)} — chọn câu đúng:</div>` + t.options.map((o, i) => `<button type="button" class="pay-opt ${o.tried ? 'wrong' : ''}" data-pay-opt="${i}" ${o.tried ? 'disabled' : ''}><b class="zh">${String.fromCharCode(65 + i)}. ${esc(o.zh)}</b>${showPinyin ? `<small class="pin">${esc(o.pin)}</small>` : ''}${showVi ? `<small class="vi">${esc(o.vi)}</small>` : ''}</button>`).join('');
}
