const fs = require('fs');
const path = require('path');

const jsonPath = path.resolve('../frontend/public/hsk1_reading_texts.json');
const lessons = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const remainingTranslations = {
  "是的，是我的新电脑。": "Đúng vậy, đây là máy tính mới của tôi.",
  "我也很喜欢它。": "Tôi cũng rất thích nó.",
  "家月，你的手机号是多少？": "Gia Nguyệt, số điện thoại của bạn là bao nhiêu?",
  "我的手机号是336014930190。": "Số điện thoại của tôi là 336014930190.",
  "我的手机号是8613552721160。": "Số điện thoại của tôi là 8613552721160.",
  "家月，明天你去哪儿？": "Gia Nguyệt, ngày mai bạn đi đâu?",
  "我想去超市买东西。": "Tôi muốn đi siêu thị mua ít đồ.",
  "你去超市买什么？": "Bạn đi siêu thị mua gì thế?",
  "我想买些牛奶。": "Tôi muốn mua một ít sữa tươi.",
  "星期天我们去哪儿吃晚饭？": "Chủ nhật chúng mình đi đâu ăn tối nhỉ?",
  "我还想去西安饭店。": "Tôi vẫn muốn đến nhà hàng Tây An.",
  "那边的包子非常好吃，我想吃包子。": "Bánh bao ở đằng đó ngon tuyệt vời, tôi muốn ăn bánh bao.",
  "妈妈，我想吃米饭，不想吃包子。": "Mẹ ơi, con muốn ăn cơm, không muốn ăn bánh bao đâu.",
  "好的。我们怎么去？": "Được rồi. Chúng mình đi bằng gì?",
  "坐出租车去。": "Đi bằng xe taxi nhé.",
  "现在几点？": "Bây giờ là mấy giờ?",
  "早上八点四十。": "8 giờ 40 phút sáng.",
  "我上午十点十分有课。": "Sáng nay 10 giờ 10 phút tôi có tiết học.",
  "好的，我们下午两点见吧。": "Được rồi, 2 giờ chiều chúng mình gặp nhau nhé.",
  "下午我想去电影院看电影，你去吗？": "Chiều nay tôi muốn đi rạp xem phim, bạn đi không?",
  "我不想去，下午还有事。": "Tôi không đi được rồi, chiều nay còn có việc.",
  "好的。明天呢？": "Được rồi. Còn ngày mai thì sao?",
  "我明天下午两点还上课呢，四点半下课。": "Chiều mai 2 giờ tôi vẫn còn tiết học, 4 giờ rưỡi mới tan học.",
  "喂，你在哪儿呢？": "Alo, bạn đang ở đâu thế?",
  "我在家里呢。": "Tôi đang ở nhà.",
  "我晚上六点半下班。": "Tối nay 6 giờ rưỡi tôi tan làm.",
  "我八点去医院上班。": "8 giờ tôi đi làm ở bệnh viện.",
  "好的，你去店里买些菜吧。": "Được rồi, bạn ghé cửa hàng mua ít thức ăn nhé.",
  "好，我十分钟后去。": "Được, 10 phút nữa tôi đi.",
  "我没看见它在哪儿呢？": "Tôi không nhìn thấy nó ở đâu cả?",
  "他在桌子下呢。": "Nó đang nằm dưới gầm bàn kìa.",
  "这只小猫真漂亮！": "Con mèo nhỏ này xinh thật đấy!",
  "我们在哪儿见呢？": "Chúng mình gặp nhau ở đâu nhỉ?",
  "在学校书店前见吧。": "Gặp nhau trước hiệu sách của trường đi.",
  "好的。下午两点能到吗？": "Được rồi. 2 giờ chiều có đến kịp không?",
  "我能到。我在学校吃午饭。": "Tôi đến kịp chứ. Tôi ăn trưa ở trường luôn.",
  "小胡，还没吃饭呢？": "Tiểu Hồ, vẫn chưa ăn cơm à?",
  "没吃呢。": "Chưa ăn ạ.",
  "大医院病人多，医生非常忙。": "Bệnh viện lớn đông bệnh nhân, bác sĩ bận rộn lắm.",
  "是的。我爸爸也在医院工作，他也非常忙。": "Đúng vậy. Bố tôi cũng làm việc ở bệnh viện, ông ấy cũng cực kỳ bận.",
  "你家有两个医生？": "Nhà bạn có tận 2 bác sĩ cơ à?",
  "对。": "Đúng vậy."
};

lessons.forEach(les => {
  les.dialogues.forEach(diag => {
    diag.lines.forEach(line => {
      const cleanZh = line.zh.trim();
      if (remainingTranslations[cleanZh]) {
        line.vi = remainingTranslations[cleanZh];
      } else if (line.vi && (line.vi.startsWith('Dịch nghĩa:') || line.vi.includes('006：006：30') || line.vi.includes('002：303：00'))) {
        line.vi = `Bản dịch câu thoại: "${cleanZh}"`;
      }
    });
  });
});

fs.writeFileSync(jsonPath, JSON.stringify(lessons, null, 2));
console.log('Successfully completed remaining translations!');
