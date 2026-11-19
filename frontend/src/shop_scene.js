/**
 * Trạm 1 "Đón khách" dạng CẢNH QUẦY HÀNG (giống Trà sữa / Tạp hóa): mái hiên + biển hiệu, khách đứng ở cửa kính,
 * bong bóng gọi món, quầy gỗ bày hàng đang còn trong kho. Ảnh nền là ảnh minh họa của từng tiệm.
 */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function sceneHtml(game, say) {
  const c = game.current; const cfg = game.cfg;
  const items = game.mode.products
    .filter((p) => game.zonesOpen.has(p.zone) && game.itemsOpen.has(p.id) && p.zone !== 'sauce' && (game.stock[p.id] || 0) > 0)
    .slice(0, 12);
  const counterItems = items.length
    ? items.map((p) => '<span class="sh-citem" title="' + esc(p.vi) + '">' + p.icon + '<small>' + (game.stock[p.id] || 0) + '</small></span>').join('')
    : '<small class="sh-cempty">Kho trống — bấm 进货 để nhập hàng</small>';
  const chat = cfg.chat.length ? cfg.chat[game.chatIdx % cfg.chat.length] : null;

  let door; let bubble;
  if (!c) {
    const status = game.dayInProgress() ? (game.closed ? 'Đã đóng cửa…' : 'Đang chờ khách…') : 'Bấm ▶ để mở cửa tiệm';
    door = '<div class="sh-door"><div class="sh-door-glass empty"><b class="zh">欢迎光临</b><small>' + status + '</small></div></div>';
    bubble = chat && game.dayInProgress()
      ? '<div class="sh-bubble chat"><div class="sh-bubble-head"><span>🐈 <span class="zh">闲聊</span> Tám chuyện</span><button type="button" class="sh-say-btn" data-say="' + esc(chat.zh) + '"><i class="fa-solid fa-volume-high"></i></button></div>' + game.sayHtml(chat) + '</div>'
      : '';
  } else {
    door = '<div class="sh-door"><div class="sh-door-glass"><img src="' + c.profile.img + '" alt=""></div><div class="sh-nametag"><b class="zh">' + esc(c.profile.zh) + '</b><span>' + esc(c.profile.vi) + '</span></div>'
      + '<div class="sh-patience" id="sh-patience"><i></i><span id="sh-mood">😊</span></div></div>';
    if (!c.order) {
      bubble = '<div class="sh-bubble"><div class="sh-bubble-head"><span>🗣️ Khách nói</span></div>' + game.sayHtml(say('哎呀，什么都没有了……', 'Ôi, chẳng còn gì cả…'), 'big') + '<div class="sh-taken warn">📦 Kho hết sạch hàng! Bấm 进货 để nhập hàng cho khách sau.</div></div>';
    } else {
      const o = c.order;
      bubble = '<div class="sh-bubble"><div class="sh-bubble-head"><span>🗣️ Khách nói</span><button type="button" class="sh-say-btn" data-say="' + esc(o.say.zh) + '" title="Nghe lại"><i class="fa-solid fa-volume-high"></i></button></div>'
        + game.sayHtml(o.say, 'big')
        + (c.takenAt ? '<div class="sh-taken">✅ Đã nhận đơn — sang bước 2 để chuẩn bị.</div>' : '<button type="button" class="sh-btn" id="btn-take"><span class="zh">接单</span> Nhận đơn</button>')
        + '</div>';
    }
  }
  return '<div class="sh-scene"><div class="sh-scene-awning"></div><div class="sh-scene-sign zh">' + esc(cfg.chn) + '</div>'
    + '<div class="sh-scene-main">' + door + bubble + '</div>'
    + '<div class="sh-counter"><div class="sh-counter-top"><div class="sh-counter-items">' + counterItems + '</div>' + game.todayBoard() + '</div><div class="sh-counter-front zh">' + esc(cfg.chn) + '</div></div></div>';
}
