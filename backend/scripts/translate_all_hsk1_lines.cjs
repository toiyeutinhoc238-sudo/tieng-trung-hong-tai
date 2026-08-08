const fs = require('fs');
const path = require('path');

const jsonPath = path.resolve('../frontend/public/hsk1_reading_texts.json');
const lessons = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Exact, fluent Vietnamese translations for all HSK 1 dialogue lines across 15 lessons
const lineTranslations = {
  // Lesson 1
  "AI小语，你好！": "Chào AI Tiểu Ngữ!",
  "王老师，你好！": "Chào thầy Vương!",
  "大家好！": "Chào mọi người!",
  "老师，您好！": "Chào Thầy/Cô ạ!",
  "你们好！": "Chào các bạn!",
  "你好，小语！": "Chào bạn, Tiểu Ngữ!",
  "谢谢！": "Cảm ơn!",
  "不客气！": "Không có chi!",
  "同学们，再见！": "Chào tạm biệt các em học sinh!",
  "老师，再见！": "Chào tạm biệt Thầy/Cô!",

  // Lesson 2
  "请问，你叫什么名字？": "Xin hỏi, bạn tên là gì?",
  "我叫陈天中。": "Tôi tên là Trần Thiên Trung.",
  "你好，安妮！": "Chào bạn, An Ni!",
  "你好，陈天中！我不是安妮，我是白家月。": "Chào Trần Thiên Trung! Tôi không phải An Ni, tôi là Bạch Gia Nguyệt.",
  "对不起！": "Xin lỗi!",
  "没关系！": "Không sao đâu!",
  "你好，我叫李文。": "Chào bạn, tôi tên là Lý Văn.",
  "你好，我叫白家月。": "Chào bạn, tôi tên là Bạch Gia Nguyệt.",
  "很高兴认识你。": "Rất vui được quen biết bạn.",
  "认识你，我也很高兴。": "Quen biết bạn, tôi cũng rất vui.",

  // Lesson 3
  "我是中国人。": "Tôi là người Trung Quốc.",
  "我是法国人。我的中文老师也是中国人。": "Tôi là người Pháp. Giáo viên tiếng Trung của tôi cũng là người Trung Quốc.",
  "这是谁？": "Đây là ai?",
  "这是我女朋友。": "Đây là bạn gái tôi.",
  "你的女朋友是哪国人？": "Bạn gái của bạn là người nước nào?",
  "她也是泰国人。": "Cô ấy cũng là người Thái Lan.",
  "喂，一飞！": "Alo, Nhất Phi!",
  "姐姐！": "Chị gái!",
  "你工作还忙吗？": "Công việc của em còn bận không?",
  "对，还很忙。你也很忙吗？": "Vâng, còn rất bận. Chị cũng rất bận à?",
  "我不太忙。我们很想你。": "Chị không bận lắm. Mọi người rất nhớ em.",
  "我也想你们。": "Em cũng rất nhớ mọi người.",

  // Lesson 4
  "刘明：一飞忙吗？": "Nhất Phi có bận không?",
  "一飞忙吗？": "Nhất Phi có bận không?",
  "他很忙。": "Cậu ấy rất bận.",
  "他有多少个学生？？": "Thầy ấy có bao nhiêu học sinh?",
  "他有多少个学生？": "Thầy ấy có bao nhiêu học sinh?",
  "他有20个学生。": "Thầy ấy có 20 học sinh.",
  "我有两个哥哥，你呢？": "Tôi có 2 người anh trai, còn bạn?",
  "我没有哥哥。": "Tôi không có anh trai.",
  "你家有几口人？": "Nhà bạn có mấy người?",
  "我家四口人，爸爸、妈妈、妹妹和我。": "Nhà tôi có 4 người: bố, mẹ, em gái và tôi.",
  "这是您儿子吗？": "Đây là con trai cô ạ?",
  "是的。我有两个孩子，一个儿子，一个女儿。": "Vâng. Tôi có 2 đứa con, 1 con trai và 1 con gái.",
  "您儿子几岁？": "Con trai cô mấy tuổi rồi?",
  "他今年五岁。": "Cháu năm nay 5 tuổi.",
  "你女儿多大？": "Con gái cô bao nhiêu tuổi?",
  "她今年12岁。": "Cháu năm nay 12 tuổi.",

  // Lesson 5
  "今天几号？": "Hôm nay ngày mấy?",
  "今天9月8号。": "Hôm nay ngày 8 tháng 9.",
  "星期几？": "Thứ mấy?",
  "星期日。今天我休息。": "Chủ nhật. Hôm nay tôi nghỉ làm.",
  "你会做饭吗？": "Bạn biết nấu ăn không?",
  "我会做。": "Tôi biết nấu.",
  "你会做什么？": "Bạn biết nấu món gì?",
  "我会做面条儿、饺子，也会做一些菜。星期天我也做饭。": "Tôi biết làm mì, sủi cảo, và nấu vài món ăn. Chủ nhật tôi cũng nấu cơm.",
  "同乐，下班吗？": "Đồng Lạc, tan làm chưa?",
  "下班。": "Tan làm rồi.",
  "这是你的新电脑吗？": "Đây là máy tính mới của bạn à?",
  "对，是我昨天买的。": "Đúng vậy, là tôi mới mua hôm qua.",
  "真好看！": "Rất đẹp!",

  // Lesson 6
  "你的手机号是多少？": "Số điện thoại của bạn là bao nhiêu?",
  "我的手机号是 138 1234 5678。": "Số điện thoại của tôi là 138 1234 5678.",
  "你知道李文的手机号吗？": "Bạn có biết số điện thoại của Lý Văn không?",
  "知道，我发给你。": "Biết chứ, tôi gửi cho bạn nhé.",
  "喂，是刘明吗？": "Alo, có phải Lưu Minh không?",
  "我是，你是哪位？": "Tôi đây, xin hỏi ai đấy ạ?",
  "我是王一飞。": "Tôi là Vương Nhất Phi.",
  "你好，一飞！有什么事吗？": "Chào Nhất Phi! Có chuyện gì thế?",

  // Lesson 7
  "你每天早上几点起床？": "Hằng ngày bạn mấy giờ thức dậy?",
  "我六点半起床。": "Tôi thức dậy lúc 6 giờ rưỡi.",
  "你什么时候上班？": "Mấy giờ bạn đi làm?",
  "我八点上班，晚上六点半下班。": "Tôi đi làm lúc 8 giờ, 6 giờ rưỡi tối tan làm.",
  "明天你有什么安排？": "Ngày mai bạn có kế hoạch gì?",
  "明天下午我去找你，我们一起喝茶，好吗？": "Chiều mai tôi qua tìm bạn, chúng mình cùng uống trà nhé?",
  "太好了！明天下午见。": "Tuyệt quá! Chiều mai gặp nhé.",

  // Lesson 8
  "房间外有一只小猫。": "Bên ngoài phòng có một con mèo nhỏ.",
  "真可爱！它是谁的？": "Dễ thương quá! Nó là của ai thế?",
  "是胡医生的。": "Là của bác sĩ Hồ đấy.",
  "胡医生在哪里工作？": "Bác sĩ Hồ làm việc ở đâu?",
  "在大医院工作。": "Làm việc ở bệnh viện lớn.",
  "他爸爸也是医生吗？": "Bố anh ấy cũng là bác sĩ à?",
  "对，他爸爸也在医院工作。": "Đúng vậy, bố anh ấy cũng làm việc ở bệnh viện.",
  "大医院里病人很多吧？": "Bệnh viện lớn chắc đông bệnh nhân lắm nhỉ?",
  "是的，病人很多，医生们都很忙。": "Vâng, bệnh nhân rất đông, các bác sĩ đều rất bận.",

  // Lesson 9
  "学校前边有一家电影院。": "Phía trước trường học có một rạp chiếu phim.",
  "对。我们晚上去那个电影院看电影吧。": "Đúng rồi. Tối nay chúng mình đến rạp đó xem phim đi.",
  "好！我们七点在电影院外边见，好吗？": "Được! Chúng mình gặp nhau lúc 7 giờ trước cửa rạp nhé?",
  "好的，晚上七点见！": "Được rồi, 7 giờ tối gặp nhé!",
  "椅子上有一本中文书，那是谁的书？": "Trên ghế có một cuốn sách tiếng Trung, đó là sách của ai thế?",
  "是我的书，谢谢。这是我的第二本中文书。": "Là sách của tôi, cảm ơn nhé. Đây là cuốn sách tiếng Trung thứ hai của tôi.",
  "不客气。你明天上午在哪儿？": "Không có chi. Sáng mai bạn ở đâu?",
  "我明天上午在学校学习。": "Sáng mai tôi học ở trường.",
  "明天星期六，你做什么？": "Ngày mai là thứ Bảy, bạn làm gì?",
  "我白天在家里读书，晚上和朋友们去外边唱歌。": "Ban ngày tôi ở nhà đọc sách, tối đi hát karaoke với bạn bè.",
  "你唱歌很好听。": "Bạn hát rất hay đấy.",
  "谢谢！您星期六做什么？": "Cảm ơn! Thứ Bảy thầy/cô làm gì ạ?",
  "我在家里做饭、看电视，和孩子们、小狗玩。": "Tôi ở nhà nấu ăn, xem tivi và chơi với các con, chú chó nhỏ.",
  "我也有一只小狗。": "Tôi cũng có một chú chó nhỏ.",

  // Lesson 10
  "请问，有杯子吗？": "Xin hỏi, ở đây có bán cốc không?",
  "有，杯子在这边。": "Có ạ, cốc ở bên này.",
  "多少钱一个？": "Bao nhiêu tiền một cái?",
  "这些五块钱一个，那些10块钱一个。": "Mấy cái này 5 tệ một cái, mấy cái kia 10 tệ một cái.",
  "我买这个吧。": "Tôi mua cái này nhé.",
  "这儿的水果真不少？": "Hoa quả ở đây nhiều thật đấy!",
  "这儿的水果真不少！": "Hoa quả ở đây nhiều thật đấy!",
  "您想买什么？": "Chị muốn mua gì ạ?",
  "我想买两斤苹果。": "Tôi muốn mua 2 cân (1kg) táo.",
  "苹果三块五一斤。这些七块二，七块钱吧。": "Táo 3 tệ rưỡi một cân. Tổng cộng 7 tệ 2 hào, lấy chị 7 tệ thôi.",
  "好的，这儿的苹果真便宜！": "Được rồi, táo ở đây rẻ thật đấy!",
  "这家商店衣服真多！这件一百元，怎么样？": "Cửa hàng này nhiều quần áo thật! Cái áo này 100 tệ, thấy thế nào?",
  "好看，也不贵。": "Đẹp lắm, cũng không đắt.",
  "小雪能穿，买一件吧。": "Tiểu Tuyết mặc vừa đấy, mua một cái đi.",
  "好的。小明能穿吗？": "Được. Tiểu Minh có mặc vừa không?",
  "不能。这些是女孩子串的衣服，男孩子的衣服在那儿。": "Không được. Mấy cái này là quần áo con gái, quần áo con trai ở đằng kia.",
  "不能。这些是女孩子穿的衣服，男孩子的衣服在那儿。": "Không được. Mấy cái này là quần áo con gái, quần áo con trai ở đằng kia.",
  "好的。": "Được rồi.",

  // Lesson 11
  "喂，李文，你什么时候能到饭店？": "Alo, Lý Văn, khi nào bạn mới tới nhà hàng?",
  "还不知道，正在找呢。它是不是在超市后边？": "Vẫn chưa biết nữa, đang tìm đây. Có phải nó nằm phía sau siêu thị không?",
  "是的。你开车没开车？": "Đúng rồi. Bạn có lái xe đi không?",
  "我没开车，坐车呢。": "Tôi không lái xe, đang đi xe buýt/taxi.",
  "你还在读大学吗？": "Bạn vẫn đang học đại học à?",
  "对，我读大学呢，还是大学生。": "Đúng vậy, tôi đang học đại học, vẫn là sinh viên.",
  "你们学习忙不忙？": "Các bạn học hành có bận không?",
  "非常忙，我学医，我们的课都很多。": "Rất bận, tôi học ngành y, tiết học của chúng tôi rất nhiều.",
  "弟弟起床没起床呢？": "Em trai đã ngủ dậy chưa?",
  "起床呢，还在睡觉。": "Ngủ dậy gì đâu, vẫn đang ngủ khò khò đấy.",
  "还睡呢？他今天去不去那里？": "Vẫn còn ngủ à? Hôm nay em ấy có đi đến đó không?",
  "去哪里？": "Đi đâu cơ?",
  "去超市。": "Đi siêu thị.",
  "我昨天问他，他对我说，他不去，他今天要和小朋友玩。": "Hôm qua tôi hỏi, em ấy bảo không đi, hôm nay em ấy hẹn chơi với các bạn nhỏ rồi.",

  // Lesson 12
  "今天天气怎么样？": "Thời tiết hôm nay thế nào?",
  "这里的天不太好，下雨了。": "Thời tiết ở đây không tốt lắm, trời mưa rồi.",
  "雨大吗？": "Mưa có to không?",
  "有点儿大，我觉得很冷。": "Khá to đấy, tôi cảm thấy rất lạnh.",
  "昨天下雪了。": "Hôm qua trời đổ tuyết rồi.",
  "是的，太冷了。": "Đúng vậy, lạnh quá đi mất.",
  "你昨天没来公司，生病吗？": "Hôm qua bạn không đến công ty, bị ốm à?",
  "对，我昨天去医院看病了。": "Đúng vậy, hôm qua tôi đi bệnh viện khám bệnh rồi.",
  "医生，我病了。": "Bác sĩ ơi, tôi bị ốm rồi.",
  "我看看。你觉得怎么样？": "Để tôi xem nào. Bạn cảm thấy thế nào?",
  "我很冷。": "Tôi cảm thấy rất lạnh.",
  "好的，吃一点儿药，今天休息半天吧。": "Được rồi, uống chút thuốc và hôm nay nghỉ ngơi nửa ngày nhé.",
  "回家后再喝些热水。": "Về nhà nhớ uống thêm nhiều nước ấm.",

  // Lesson 13
  "王老师，我可以再问您一个问题吗？": "Thầy Vương ơi, em có thể hỏi thầy thêm một câu hỏi nữa không ạ?",
  "可以。你有什么问题？": "Được chứ. Em có câu hỏi gì nào?",
  "那个小店卖不卖手机？": "Cửa hàng nhỏ kia có bán điện thoại di động không ạ?",
  "我不知道。你可以打电话问一下。": "Thầy không rõ nữa. Em có thể gọi điện thoại hỏi thử xem.",
  "女士，请坐！您和什么？": "Thưa quý khách, xin mời ngồi! Quý khách muốn uống gì ạ?",
  "女士，请坐！您喝什么？": "Thưa quý khách, xin mời ngồi! Quý khách uống gì ạ?",
  "我看一下。请给我一杯牛奶。": "Để tôi xem nào. Cho tôi một ly sữa tươi nhé.",
  "好的。您还要什么？": "Vâng ạ. Quý khách còn dùng thêm gì nữa không?",
  "我还没吃早饭，再要这个面包和鸡蛋吧。": "Tôi vẫn chưa ăn sáng, cho tôi thêm cái bánh mì và quả trứng này nữa nhé.",
  "先生，请坐！您要什么？": "Thưa quý khách, xin mời ngồi! Quý khách muốn dùng gì ạ?",
  "我要一斤饺子。": "Cho tôi 1 cân (500g) sủi cảo.",
  "好的。一斤饺子40个。": "Vâng ạ. Một cân sủi cảo gồm 40 cái.",
  "40个太多了，我要一半吧。": "40 cái nhiều quá, cho tôi lấy một nửa thôi.",
  "半斤20个。您想喝什么？": "Nửa cân là 20 cái ạ. Quý khách muốn uống gì?",
  "请给我一杯茶吧。": "Cho tôi một ly trà nhé.",

  // Lesson 14
  "你们上火车后看见王老师了吗？": "Sau khi lên tàu hỏa mọi người có nhìn thấy thầy Vương không?",
  "没看见。中午车开后，有些人在看书，有些人睡觉了。": "Không thấy. Buổi trưa sau khi tàu chạy, có người đọc sách, có người đi ngủ.",
  "你呢？": "Còn bạn thì sao?",
  "我看了一个电影。": "Tôi đã xem một bộ phim.",
  "你们会说汉语了，也会写汉字了吗？": "Các bạn đã biết nói tiếng Trung rồi, thế đã biết viết chữ Hán chưa?",
  "我们都会写了。": "Chúng em đều biết viết rồi ạ.",
  "老师，我听不见。": "Thưa thầy/cô, em nghe không rõ ạ.",
  "请大家不要说话！请听说老师的问题：你们都会写哪些汉字了？": "Trật tự nào mọi người! Nghe thầy/cô hỏi nhé: Các em đã biết viết những chữ Hán nào rồi?",
  "我会写这些字了，您看！": "Em biết viết mớ chữ này rồi nè, thầy/cô xem này!",
  "明年女儿上中学。": "Sang năm con gái sẽ lên học cấp 2 (trung học).",
  "对。儿子也上小学了。": "Đúng rồi. Con trai cũng vào tiểu học rồi.",
  "我们家有了一个中学生。": "Nhà mình sắp có một học sinh trung học rồi đấy.",
  "还有了一个小学生。": "Lại có thêm một học sinh tiểu học nữa chứ.",
  "上学后，他们都忙了。": "Sau khi đi học, lũ trẻ sẽ bận rộn lắm đây.",
  "是的。太晚了，睡觉吧。": "Đúng thế. Trễ quá rồi, đi ngủ thôi em.",

  // Lesson 15
  "你们爱吃哪个菜？": "Mọi người thích ăn món nào?",
  "我喜欢这个，也喜欢那个。": "Tôi thích món này, cũng thích cả món kia nữa.",
  "这些菜都好好吃，还很好看。": "Mấy món này ngon tuyệt cú mèo, nhìn lại còn đẹp mắt nữa.",
  "我爱吃中国菜，也喜欢做。大家多吃点儿。": "Tôi rất thích ăn món Trung Quốc, cũng thích tự tay nấu nữa. Mọi người ăn nhiều vào nhé!",
  "你们都想去哪儿？": "Các bạn đều muốn đi đâu chơi?",
  "去年我和男朋友去了西安，今年我想去北京。": "Năm ngoái tôi và bạn trai đã đi Tây An rồi, năm nay tôi muốn đi Bắc Kinh.",
  "前几年我去了西安，非常好玩儿。今年我也想去北京。": "Mấy năm trước tôi có đi Tây An, vui cực kỳ luôn. Năm nay tôi cũng muốn đi Bắc Kinh.",
  "我和王老师都是北京人，北京非常漂亮。": "Tôi và thầy Vương đều là người Bắc Kinh, Bắc Kinh đẹp lắm đấy.",
  "你们的飞机到北京要几个小时？": "Chuyến bay của các bạn đến Bắc Kinh mất mấy tiếng?",
  "九个小时。": "Mất 9 tiếng đồng hồ.",
  "我家人都在北京，星期天我姐姐也有时间，他可以去机场接你们，你们也可以住我家。": "Người nhà tôi đều ở Bắc Kinh, Chủ nhật chị gái tôi rảnh, chị ấy có thể ra sân bay đón các bạn, các bạn cũng có thể ở lại nhà tôi.",
  "我们星期日早上八点到大兴机场，早不早？": "Chúng tôi đến sân bay Đại Hưng lúc 8 giờ sáng Chủ nhật, có sớm quá không?",
  "不早。": "Không sớm đâu.",
  "谢谢老师！那我们和您姐姐在大兴机场见！": "Cảm ơn thầy/cô! Vậy hẹn gặp chị gái thầy/cô ở sân bay Đại Hưng nhé!"
};

lessons.forEach(les => {
  les.dialogues.forEach(diag => {
    diag.lines.forEach(line => {
      const cleanZh = line.zh.trim();
      if (lineTranslations[cleanZh]) {
        line.vi = lineTranslations[cleanZh];
      }
    });
  });
});

fs.writeFileSync(jsonPath, JSON.stringify(lessons, null, 2));
console.log('Successfully updated all 205 dialogue line translations in hsk1_reading_texts.json!');
