/**
 * Tiệm Quần Áo: thỉnh thoảng khách xin THỬ ĐỒ sau khi người chơi chọn xong.
 *   khách xin thử → bạn mời thử (chọn câu đúng) → khách hỏi phòng thử đồ → bạn chỉ phòng (chọn câu đúng)
 *   → khách vào phòng thử… → khách nói kết quả: vừa người (lấy luôn) · size nhỏ/lớn (đổi size) · đổi màu · mua thêm món khác
 *   Nếu khách đổi ý, ĐƠN được cập nhật (có dòng "Sau khi thử đồ" ở phiếu) và người chơi phải sửa túi hàng cho đúng rồi mới tính tiền.
 */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function chatHtml(log, game) {
  return log.map((m) => '<div class="pay-bub ' + (m.who === 'me' ? 'me' : 'cust') + '"><b class="zh">' + esc(m.zh) + '</b>' + (game.showPin ? '<small class="pin">' + esc(m.pin) + '</small>' : '') + (game.showVi ? '<small class="vi">' + esc(m.vi) + '</small>' : '') + '</div>').join('');
}
function optsHtml(turn, game) {
  if (!turn) return '';
  return '<div class="pay-topic">💬 ' + esc(turn.topic) + ' — chọn câu đúng:</div>' + turn.options.map((o, i) => '<button type="button" class="pay-opt ' + (o.tried ? 'wrong' : '') + '" data-fit-opt="' + i + '" ' + (o.tried ? 'disabled' : '') + '><b class="zh">' + String.fromCharCode(65 + i) + '. ' + esc(o.zh) + '</b>' + (game.showPin ? '<small class="pin">' + esc(o.pin) + '</small>' : '') + (game.showVi ? '<small class="vi">' + esc(o.vi) + '</small>' : '') + '</button>').join('');
}

/** Hiện hộp thoại phòng thử đồ. spec = { turns, verdict, onDone({wrong}) } */
export function runFitting(game, spec) {
  const st = { i: 0, log: (spec.preLog || []).map((x) => ({ ...x })), wrong: 0, phase: 'talk' };
  const chat = game.$('fit-chat'); const opts = game.$('fit-opts'); const anim = game.$('fit-anim'); const done = game.$('btn-fit-done');
  done.style.display = 'none'; anim.innerHTML = '';
  const render = () => {
    chat.innerHTML = chatHtml(st.log, game);
    const turn = spec.turns[st.i];
    opts.innerHTML = st.phase === 'talk' && turn && turn.who === 'me' ? optsHtml(turn, game) : '';
    chat.scrollTop = chat.scrollHeight;
  };
  const pump = () => {
    while (st.i < spec.turns.length && spec.turns[st.i].who === 'cust') {
      const t = spec.turns[st.i]; st.log.push(t); game.audio.speak(t.zh); st.i += 1;
    }
    render();
    if (st.i >= spec.turns.length && st.phase === 'talk') {
      st.phase = 'anim';
      anim.innerHTML = '<div class="sh-fit-anim"><span class="sh-curtain">🪞</span><b>Khách đang thử đồ…</b></div>';
      render();
      setTimeout(() => {
        anim.innerHTML = '';
        st.phase = 'verdict';
        spec.verdict.forEach((v) => st.log.push({ ...v }));
        game.audio.speak(spec.verdict.filter((v) => v.who !== 'me').map((v) => v.zh).join('，'));
        render();
        done.style.display = '';
      }, 2200);
    }
  };
  opts.onclick = (e) => {
    const b = e.target.closest('[data-fit-opt]'); if (!b || st.phase !== 'talk') return;
    const turn = spec.turns[st.i]; const o = turn.options[+b.dataset.fitOpt]; if (!o || o.tried) return;
    if (!o.ok) { o.tried = true; st.wrong += 1; game.audio.error(); game.toast('❌', o.why || 'Chưa đúng, chọn lại nhé!', 'warn'); render(); return; }
    game.audio.pick(); st.log.push({ who: 'me', zh: o.zh, pin: o.pin, vi: o.vi }); st.i += 1; pump();
  };
  done.onclick = () => { game.closeModal('m-fit'); spec.onDone({ wrong: st.wrong }); };
  game.openModal('m-fit');
  pump();
}

/** Dựng kịch bản thử đồ cho khách c (đơn đã chọn đúng). Trả về true nếu đã mở hộp thoại. */
export function startClothesFitting(game, c, X) {   // khách đã xin thử đồ (order.tryOn): người chơi bấm "Đưa đi thử đồ"
  const { D, byId, gById, say, shuffle, pickOne, randInt, num } = X;
  const o = c.order;
  const li = randInt(0, o.lines.length - 1); const l = o.lines[li]; const p = byId[l.id]; const shoes = p.zone === 'giay';
  const sizes = p.raw.sizes; const si = sizes.indexOf(l.size);
  let kind = game.cfg.fitKind || pickOne(['fit', 'fit', 'small', 'large', 'color', 'more']);   // fitKind: chỉ dùng khi kiểm thử
  if (kind === 'small' && si >= sizes.length - 1) kind = si > 0 ? 'large' : 'fit';
  if (kind === 'large' && si <= 0) kind = si < sizes.length - 1 ? 'small' : 'fit';
  const alt = p.raw.colors.filter((x) => x !== l.color);
  if (kind === 'color' && !alt.length) kind = 'fit';
  let extra = null;
  if (kind === 'more') {
    const cand = game.unlockedProducts().filter((q) => (game.stock[q.id] || 0) > 0 && !o.lines.some((x) => x.id === q.id));
    if (cand.length) { const q = pickOne(cand); extra = { id: q.id, size: pickOne(q.raw.sizes), color: pickOne(q.raw.colors), qty: 1 }; } else kind = 'fit';
  }
  const opt = (zh, vi, ok, why = '') => ({ ...say(zh, vi), ok, why, tried: false });
  const turns = [{ who: 'cust', ...say(shoes ? '我可以试一下吗？' : '我可以试穿吗？', shoes ? 'Tôi có thể thử một chút không?' : 'Tôi có thể mặc thử không?') }];
  turns.push({ who: 'me', topic: 'Mời khách thử đồ', options: shuffle([
    opt('当然可以，请试试。', 'Tất nhiên được, mời quý khách thử.', true),
    opt('不好意思，这是最低价了。', 'Xin lỗi, đây là giá thấp nhất rồi.', false, 'Khách xin thử đồ chứ không hỏi giá.'),
    opt('您怎么付款？', 'Quý khách thanh toán bằng cách nào?', false, 'Chưa tới lúc thanh toán — khách đang xin thử đồ.')]) });
  if (!shoes) {
    turns.push({ who: 'cust', ...say('试衣间在哪里？', 'Phòng thử đồ ở đâu?') });
    turns.push({ who: 'me', topic: 'Chỉ phòng thử đồ', options: shuffle([
      opt('试衣间在那边。', 'Phòng thử đồ ở bên kia.', true),
      opt('这是您的小票。', 'Đây là hóa đơn của quý khách.', false, 'Khách chưa thanh toán nên chưa có hóa đơn.'),
      opt('欢迎下次光临！', 'Mong quý khách lần sau lại ghé!', false, 'Khách chưa mua xong, chưa phải lúc chào tạm biệt.')]) });
  }
  const preLog = c.order.tryOn ? [turns.shift()] : [];   // khách đã hỏi xin thử ngay trong lời gọi hàng
  const sizeZh = (s) => (shoes ? D.sizes[s].zh : s + '码');
  const verdict = []; let mutate = null; let say2 = null;
  const cust = (zh, vi) => verdict.push({ who: 'cust', ...say(zh, vi) });
  if (kind === 'fit') { cust('这件很合身。', 'Chiếc này rất vừa người.'); cust('好，我就买这个。', 'Được, tôi lấy món này.'); }
  else if (kind === 'small' || kind === 'large') {
    const ns = sizes[kind === 'small' ? si + 1 : si - 1];
    cust(kind === 'small' ? '这个尺码太小了。' : '这个尺码太大了。', kind === 'small' ? 'Size này nhỏ quá.' : 'Size này lớn quá.');
    cust(kind === 'small' ? '有大一点儿的吗？' : '有小一点儿的吗？', kind === 'small' ? 'Có size lớn hơn một chút không?' : 'Có size nhỏ hơn một chút không?');
    verdict.push({ who: 'me', ...say('有的，请稍等。', 'Có ạ, xin chờ một chút.') });
    say2 = say('我要' + sizeZh(ns) + '的。', 'Tôi lấy size ' + ns + '.');
    verdict.push({ who: 'cust', ...say2 });
    mutate = () => { l.size = ns; };
  } else if (kind === 'color') {
    const pickAlt = shuffle(alt);
    const nc = pickAlt[0]; const shown = pickAlt.slice(0, 2);
    cust('我想换个颜色。', 'Tôi muốn đổi màu khác.'); cust('还有别的颜色吗？', 'Còn màu khác không?');
    verdict.push({ who: 'me', ...say('还有' + shown.map((x) => D.colors[x].zh).join('和') + '。', 'Còn màu ' + shown.map((x) => x.toLowerCase()).join(' và ') + '.') });
    say2 = say('我想要' + D.colors[nc].zh + '的。', 'Tôi muốn màu ' + nc.toLowerCase() + '.');
    verdict.push({ who: 'cust', ...say2 });
    mutate = () => { l.color = nc; };
  } else if (kind === 'more') {
    const q = byId[extra.id]; const g = gById[q.zone]; const n = num(1);
    const zh = '我还想买' + n + g.measure + D.colors[extra.color].zh + '的' + q.chn + '，' + (q.zone === 'giay' ? D.sizes[extra.size].zh : extra.size + '码') + '。';
    const vi = 'Tôi còn muốn mua 1 ' + g.measureVi + ' ' + q.vi.toLowerCase() + ' màu ' + extra.color.toLowerCase() + ', size ' + extra.size + '.';
    cust('好，我就买这个。', 'Được, tôi lấy món này.');
    say2 = say(zh, vi); verdict.push({ who: 'cust', ...say2 });
    mutate = () => { o.lines.push(extra); o.due += q.price * extra.qty; o.words = [...(o.words || []), q.chn, D.colors[extra.color].zh, D.sizes[extra.size].zh]; };
  }
  runFitting(game, {
    turns, verdict, preLog,
    onDone: ({ wrong }) => {
      if (mutate) { mutate(); o.say2 = say2; game.learn(o.words || []); }
      game.finishFitting(c, { wrong, mutated: !!mutate });
    }
  });
  return true;
}
