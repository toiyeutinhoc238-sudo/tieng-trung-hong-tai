/**
 * Trạm 1 "Đón khách" dạng CẢNH QUẦY HÀNG — mô phỏng cách trình bày của Tiệm Trà Sữa / Tiệm Tạp Hóa:
 *   mái hiên lớn có viền răng cưa, bảng phấn "今日推荐" + thẻ doanh thu bên trái, khách đứng trong khung cửa vòm,
 *   bong bóng gọi món, kệ trưng bày bên phải, quầy gỗ có máy tính tiền + hũ kẹo + biển hiệu, thanh gợi ý + nút Nhận đơn ở dưới.
 */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (v) => { const n = Math.round(Number(v) * 100) / 100; return Number.isInteger(n) ? String(n) : n.toFixed(2); };
const SLOGAN = { clothes: '时尚潮流 · 热情服务', banhmi: '香脆面包 · 现做现卖', cavien: '香脆炸串 · 热情服务', mypham: '美丽护肤 · 专业推荐', stationery: '可爱文具 · 热情服务' };

export function sceneHtml(game, say) {
  const c = game.current; const cfg = game.cfg;
  const open = game.mode.products.filter((p) => game.zonesOpen.has(p.zone) && game.itemsOpen.has(p.id) && p.zone !== 'sauce' && (game.stock[p.id] || 0) > 0);
  const counterItems = open.length
    ? open.slice(0, 10).map((p) => '<span class="sh-citem" title="' + esc(p.vi) + '">' + p.icon + '<small>' + (game.stock[p.id] || 0) + '</small></span>').join('')
    : '<small class="sh-cempty">Kho trống — bấm 进货 để nhập hàng</small>';
  const chalk = open.filter((p) => p.price > 0).slice(0, 4);
  const shelf = open.slice(0, 6).map((p) => '<span>' + p.icon + '</span>').join('');
  const chat = cfg.chat.length ? cfg.chat[game.chatIdx % cfg.chat.length] : null;
  const s = game.stats;

  let door; let bubble; let hint; let take = '';
  if (!c) {
    const status = game.dayInProgress() ? (game.closed ? 'Đã đóng cửa…' : 'Đang chờ khách…') : 'Bấm ▶ để mở cửa tiệm';
    door = '<div class="sh-door"><div class="sh-bell">🔔</div><div class="sh-door-glass empty"><b class="zh">欢迎光临</b><small>' + status + '</small></div></div>';
    bubble = chat && game.dayInProgress()
      ? '<div class="sh-bubble chat"><div class="sh-bubble-head"><span>🐈 <span class="zh">闲聊</span> Tám chuyện</span><button type="button" class="sh-say-btn" data-say="' + esc(chat.zh) + '"><i class="fa-solid fa-volume-high"></i></button></div>' + game.sayHtml(chat) + '</div>'
      : '';
    hint = '💡 Khi có khách bước vào, nghe họ gọi hàng rồi bấm <b>Nhận đơn</b>. Để khách chờ lâu sẽ bỏ về!';
  } else {
    door = '<div class="sh-door"><div class="sh-bell">🔔</div><div class="sh-door-glass"><img src="' + c.profile.img + '" alt=""></div>'
      + '<div class="sh-patience" id="sh-patience"><i></i><span id="sh-mood">😊</span></div></div>';
    if (!c.order) {
      bubble = '<div class="sh-bubble"><div class="sh-bubble-head"><span>🗣️ Khách nói</span></div>' + game.sayHtml(say('哎呀，什么都没有了……', 'Ôi, chẳng còn gì cả…'), 'big') + '<div class="sh-taken warn">📦 Kho hết sạch hàng! Bấm 进货 để nhập hàng cho khách sau.</div></div>';
      hint = '📦 Kho trống — nhập hàng để phục vụ khách tiếp theo.';
    } else {
      const o = c.order;
      take = c.takenAt ? '' : '<button type="button" class="sh-btn" id="btn-take"><span class="zh">接单</span> Nhận đơn</button>';
      bubble = '<div class="sh-bubble"><div class="sh-bubble-head"><span>🗣️ Khách nói</span><button type="button" class="sh-say-btn" data-say="' + esc(o.say.zh) + '" title="Nghe lại"><i class="fa-solid fa-volume-high"></i></button></div>'
        + game.sayHtml(o.say, 'big')
        + (c.takenAt ? '<div class="sh-taken">✅ Đã nhận đơn — sang bước 2 để chuẩn bị.</div>' : take)
        + '</div>';
      hint = c.takenAt ? '✅ Đã nhận đơn của ' + esc(c.profile.zh) + '. Sang bước 2 để chuẩn bị rồi tính tiền.' : '💡 Nghe khách gọi hàng rồi bấm <b>Nhận đơn</b>. Để khách chờ lâu sẽ bỏ về!';
    }
  }
  const nameTag = c ? '<div class="sh-nametag"><b class="zh">' + esc(c.profile.zh) + '</b><span>' + esc(c.profile.vi) + '</span></div>' : '';
  const board = '<div class="sh-revenue"><b class="zh">今日营收</b><strong>' + fmt(s.revenue) + ' ¥</strong><div><span>✅ Đã phục vụ</span><b>' + s.served + '</b></div><div><span>😠 Bỏ về</span><b>' + s.lost + '</b></div></div>';
  return '<div class="sh-scene">'
    + '<div class="sh-awning-big"><span class="sh-awning-sign zh">' + esc(cfg.chn) + '</span></div>'
    + '<div class="sh-scene-main">'
    + '<div class="sh-wall-left"><div class="sh-chalk"><b class="zh">今日推荐</b><ul>' + (chalk.length ? chalk.map((p) => '<li><span>' + p.icon + ' ' + esc(p.vi) + '</span><em>' + fmt(p.price) + '¥</em></li>').join('') : '<li><span>Chưa có hàng</span></li>') + '</ul></div>' + board + '</div>'
    + '<div class="sh-center"><div class="sh-doorbox">' + door + nameTag + '</div>' + bubble + '</div>'
    + '<div class="sh-wall-right"><div class="sh-shelf">' + shelf + '</div></div>'
    + '</div>'
    + '<div class="sh-counter"><div class="sh-counter-top"><div class="sh-counter-items">' + counterItems + '</div><div class="sh-counter-decor"><span class="sh-register"><i></i></span><span class="sh-jar j1"></span><span class="sh-jar j2"></span><span class="sh-jar j3"></span></div></div>'
    + '<div class="sh-counter-front"><div class="sh-signboard"><b class="zh">' + esc(cfg.chn) + '</b><small>' + (SLOGAN[cfg.key] || '') + '</small></div></div></div>'
    + '<div class="sh-counter-board">' + board + '</div>'
    + '</div>'
    + '<div class="sh-footer greet"><div class="sh-hint">' + hint + '</div>' + (take ? take.replace('id="btn-take"', 'id="btn-take2"') : '') + '</div>';
}
