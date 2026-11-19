// Sinh 4 trang HTML của các game tiệm mới (mỗi trang chỉ là khung rỗng + nạp module game).
const fs = require('fs');
const path = require('path');
const PAGES = [
  ['clothes-game.html', 'Tiệm Quần Áo Của Tôi (我的服装店)', 'shop_clothes.js'],
  ['banhmi-game.html', 'Tiệm Bánh Mì Của Tôi (我的面包店)', 'shop_banhmi.js'],
  ['cavien-game.html', 'Quầy Cá Viên Chiên Của Tôi (我的鱼丸店)', 'shop_cavien.js'],
  ['mypham-game.html', 'Tiệm Mỹ Phẩm Của Tôi (我的化妆品店)', 'shop_mypham.js']
];
const page = (title, script) => `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${title} | Tiếng Trung HongTai</title>
  <link rel="icon" type="image/png" href="/assets/logo.png">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossorigin="anonymous">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-lite-webfont@1.1.0/style.css">
</head>
<body class="shop-body on-title">
  <div id="shop-root"></div>
  <script type="module" src="/src/${script}"></script>
</body>
</html>
`;
PAGES.forEach(([f, t, s]) => fs.writeFileSync(path.join(__dirname, '..', 'frontend', f), page(t, s)));
console.log('ok', PAGES.length);
