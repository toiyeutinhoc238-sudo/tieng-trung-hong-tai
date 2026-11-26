/**
 * Thú cưng chó 🐕 & mèo 🐈 (宠物): mỗi con là một thực thể riêng, tự đi lại / chạy nhẹ / đứng nghỉ / ngồi / nằm trong khu vực của mình.
 *  - Chó sống ở sân nông trại (khu cỏ bên trái vườn rau), mèo sống trong nhà.
 *  - Chỉ đi trên ô trống (không xuyên tường/vật cản), tránh các ô sát vật tương tác (cửa, giường, bếp, chuồng, NPC…).
 *  - Các con giữ khoảng cách với nhau để không chồng lên nhau.
 *  - Dữ liệu lưu chỉ là SỐ LƯỢNG mỗi loại (dog, cat); vị trí sinh lại khi tải game → không thể nhân bản.
 */
export const PET_KINDS = {
  dog: { icon: '🐕', home: 'farm', walk: 1.5, run: 3.6, chn: '狗' },
  cat: { icon: '🐈', home: 'house', walk: 1.2, run: 3.0, chn: '猫' }
};
export const MAX_PET_EACH = 3;

// khu sân cho chó (nông trại): bên trái vườn rau, dưới giếng
const YARD = { x0: 1, x1: 5, y0: 8, y1: 15 };

// Các ô thú cưng được phép đứng / đi vào trong một khung cảnh
export function petTiles(sc, kind) {
  const home = PET_KINDS[kind].home;
  if (sc.id !== home) return [];
  const near = (x, y, d) => sc.objs.some(o => {
    if (o.kind === 'poop') return false;
    const pts = [[o.x, o.y, o.w, o.h]];
    if (o.stand) o.stand.forEach(([sx, sy]) => pts.push([sx, sy, 1, 1]));
    return pts.some(([ox, oy, ow, oh]) => x >= ox - d && x < ox + ow + d && y >= oy - d && y < oy + oh + d);
  });
  const make = (d) => {
    const out = [];
    for (let y = 0; y < sc.rows; y++) for (let x = 0; x < sc.cols; x++) {
      if (sc.block[y][x]) continue;
      if (sc.id === 'farm' && !(x >= YARD.x0 && x <= YARD.x1 && y >= YARD.y0 && y <= YARD.y1)) continue;
      if (sc.id === 'house' && (y < 1 || y > sc.rows - 3 || x < 1 || x > sc.cols - 2)) continue;
      if (d > 0 && near(x, y, d)) continue;
      out.push([x, y]);
    }
    return out;
  };
  let t = make(1);
  if (t.length < 4) t = make(0);
  return t;
}

const rnd = (a, b) => a + Math.random() * (b - a);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// chọn ô đích: ngẫu nhiên, cách các thú cưng khác ≥ 1.2 ô (cả vị trí lẫn đích của chúng)
function pickTarget(pet, tiles, others) {
  const cand = tiles.filter(([x, y]) => others.every(o => Math.hypot(o.x - x, o.y - y) >= 1.2 && Math.hypot((o.tx ?? o.x) - x, (o.ty ?? o.y) - y) >= 1.2));
  const pool = cand.length ? cand : tiles;
  if (!pool.length) return null;
  const near = pool.filter(([x, y]) => Math.hypot(x - pet.x, y - pet.y) <= 5);
  const src = near.length ? near : pool;
  return src[Math.floor(Math.random() * src.length)];
}

export function spawnPet(kind, tiles, others, id) {
  const free = tiles.filter(([x, y]) => others.every(o => Math.hypot(o.x - x, o.y - y) >= 1.2));
  const pool = free.length ? free : tiles;
  const [x, y] = pool.length ? pool[Math.floor(Math.random() * pool.length)] : [3, 3];
  return { id, kind, x, y, tx: null, ty: null, state: 'idle', t: rnd(0.5, 2.5), face: Math.random() < 0.5 ? 1 : -1, seed: Math.random() * 100 };
}

// đảm bảo thú cưng không đứng trong ô bị chặn (ví dụ sau khi đặt thêm nội thất)
export function fixPetPosition(pet, tiles, others) {
  if (!tiles.length) return;
  const ok = tiles.some(([x, y]) => x === Math.round(pet.x) && y === Math.round(pet.y));
  if (ok) return;
  const [x, y] = pickTarget({ x: pet.x, y: pet.y }, tiles, others.filter(o => o !== pet)) || tiles[0];
  pet.x = x; pet.y = y; pet.tx = null; pet.ty = null; pet.state = 'idle'; pet.t = 1;
}

export function updatePet(pet, dt, tiles, others) {
  if (!tiles.length) return;
  const K = PET_KINDS[pet.kind];
  pet.t -= dt;
  if (pet.state === 'walk' || pet.state === 'run') {
    const dx = pet.tx - pet.x;
    const dy = pet.ty - pet.y;
    const d = Math.hypot(dx, dy);
    const sp = pet.state === 'run' ? K.run : K.walk;
    // tránh va vào con khác: nếu sắp chạm thì dừng nghỉ
    const blocked = others.some(o => o !== pet && dist({ x: pet.x + (dx / (d || 1)) * 0.5, y: pet.y + (dy / (d || 1)) * 0.5 }, o) < 0.75);
    if (blocked) { pet.state = 'idle'; pet.t = rnd(0.6, 1.6); pet.tx = null; return; }
    if (d < 0.06) { pet.x = pet.tx; pet.y = pet.ty; pet.tx = null; pet.ty = null; pet.state = 'idle'; pet.t = rnd(0.8, 2.2); return; }
    const k = Math.min(1, (dt * sp) / d);
    // đi theo trục (ô vuông) để không cắt qua vật cản: di chuyển trên trục dài trước
    let nx = pet.x;
    let ny = pet.y;
    if (Math.abs(dx) >= Math.abs(dy) * 0.5 && Math.abs(dx) > 0.06) nx += dx * k; else ny += dy * k;
    const okTile = (x, y) => tiles.some(([tx, ty]) => tx === Math.round(x) && ty === Math.round(y));
    if (okTile(nx, ny)) { if (Math.abs(nx - pet.x) > 0.001) pet.face = nx > pet.x ? 1 : -1; pet.x = nx; pet.y = ny; }
    else { pet.state = 'idle'; pet.t = rnd(0.5, 1.2); pet.tx = null; }
    return;
  }
  if (pet.t > 0) return;
  // chọn hành động kế tiếp
  const r = Math.random();
  if (r < 0.5) {
    const tg = pickTarget(pet, tiles, others);
    if (!tg) { pet.t = 1.5; return; }
    pet.tx = tg[0]; pet.ty = tg[1];
    pet.state = Math.random() < 0.3 ? 'run' : 'walk';
    pet.t = 99;
  } else if (r < 0.75) { pet.state = 'sit'; pet.t = rnd(2.5, 6); }
  else if (r < 0.9) { pet.state = 'lie'; pet.t = rnd(4, 9); }
  else { pet.state = 'idle'; pet.t = rnd(1, 3); }
}

// vẽ bằng emoji + biến đổi: lật theo hướng đi, nảy khi đi/chạy, thu nhỏ khi ngồi, bẹt khi nằm (kèm "z")
export function drawPet(ctx, drawIcon, pet, px, py, T, t) {
  const K = PET_KINDS[pet.kind];
  const moving = pet.state === 'walk' || pet.state === 'run';
  const bob = moving ? Math.abs(Math.sin(t / (pet.state === 'run' ? 90 : 150) + pet.seed)) * (pet.state === 'run' ? 5 : 3) : 0;
  ctx.save();
  ctx.translate(px, py - bob);
  ctx.scale(-pet.face, 1);
  if (pet.state === 'lie') { ctx.translate(0, T * 0.1); ctx.scale(1.12, 0.72); }
  else if (pet.state === 'sit') { ctx.translate(0, T * 0.04); ctx.scale(0.92, 0.9); }
  else if (pet.state === 'run') ctx.scale(1.1, 0.95);
  drawIcon(ctx, K.icon, 0, 0, T * 0.62);
  ctx.restore();
  if (pet.state === 'lie') {
    ctx.save();
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t / 500 + pet.seed);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.round(T * 0.26)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('z', px + T * 0.3, py - T * 0.3 - ((t / 40) % 8));
    ctx.restore();
  }
}
