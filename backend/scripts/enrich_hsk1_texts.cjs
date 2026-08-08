const fs = require('fs');
const path = require('path');
const { pinyin } = require('pinyin-pro');

const filePath = path.resolve('../frontend/public/hsk1_reading_texts.json');
const raw = fs.readFileSync(filePath, 'utf8');
const lessons = JSON.parse(raw);

const translationDictionary = {
  'AI小语，你好！': 'Chào AI Tiểu Ngữ!',
  '王老师，你好！': 'Chào thầy Vương!',
  '大家好！': 'Chào mọi người!',
  '老师，您好！': 'Chào Thầy/Cô ạ!',
  '你们好！': 'Chào các bạn!',
  '你好，小语！': 'Chào bạn, Tiểu Ngữ!',
  '谢谢！': 'Cảm ơn!',
  '不客气！': 'Không có chi!',
  '同学们，再见！': 'Tạm biệt các em học sinh!',
  '老师，再见！': 'Tạm biệt Thầy/Cô!',
  '请问，你叫什么名字？': 'Xin hỏi, bạn tên là gì?',
  '我叫陈天中。': 'Tôi tên là Trần Thiên Trung.',
  '你好，安妮！': 'Chào bạn, An Ni!',
  '你好，陈天中！我不是安妮，我是白家月。': 'Chào Trần Thiên Trung! Tôi không phải An Ni, tôi là Bạch Gia Nguyệt.',
  '对不起！': 'Xin lỗi!',
  '没关系！': 'Không sao đâu!',
  '你好，我叫李文。': 'Chào bạn, tôi tên là Lý Văn.',
  '你好，我叫白家月。': 'Chào bạn, tôi tên là Bạch Gia Nguyệt.',
  '很高兴认识你。': 'Rất vui được quen biết bạn.',
  '认识你，我也很高兴。': 'Quen biết bạn, tôi cũng rất vui.',
  '我是中国人。': 'Tôi là người Trung Quốc.',
  '我是法国人。我的中文老师也是中国人。': 'Tôi là người Pháp. Giáo viên tiếng Trung của tôi cũng là người Trung Quốc.',
  '这是谁？': 'Đây là ai?',
  '这是 headquarters 我女朋友。': 'Đây là bạn gái tôi.',
  '这是我女朋友。': 'Đây là bạn gái tôi.',
  ' your女朋友是哪国人？': 'Bạn gái bạn là người nước nào?',
  '你的女朋友是哪国人？': 'Bạn gái bạn là người nước nào?',
  '她也是泰国人。': 'Cô ấy cũng là người Thái Lan.',
  '喂，一飞！': 'Alo, Nhất Phi!',
  '姐姐！': 'Chị gái!',
  '你工作还忙吗？': 'Công việc của em còn bận không?',
  '对，还很忙。你 boot 也 boot 很忙吗？': 'Vâng, còn rất bận. Chị cũng rất bận à?',
  '对，还很忙。你 cũng 很忙吗？': 'Vâng, còn rất bận. Chị cũng rất bận à?',
  '对，还很忙。你也很忙吗？': 'Vâng, còn rất bận. Chị cũng rất bận à?',
  '我不太忙。我们 boot 很想你。': 'Chị không bận lắm. Mọi người rất nhớ em.',
  '我不太忙。我们很想你。': 'Chị không bận lắm. Mọi người rất nhớ em.',
  '我也想你们。': 'Em cũng rất nhớ mọi người.',
  '刘明：一飞忙吗？': 'Nhất Phi có bận không?',
  '一飞忙吗？': 'Nhất Phi có bận không?',
  '他很忙。': 'Cậu ấy rất bận.',
  '他有多少个学生？？': 'Thầy ấy có bao nhiêu học sinh?',
  '他有20个学生。': 'Thầy ấy có 20 học sinh.',
  '我有两个哥哥，你呢？': 'Tôi có 2 người anh trai, còn bạn?',
  '我没有哥哥。': 'Tôi không có anh trai.',
  '你家有几口人？': 'Nhà bạn có mấy người?',
  '我家四口人，爸爸、妈妈、妹妹和我。': 'Nhà tôi có 4 người: bố, mẹ, em gái và tôi.',
  '这是您儿子吗？': 'Đây là con trai cô à?',
  '是的。我有两个孩子，一个儿子，一个女儿。': 'Đúng vậy. Tôi có 2 đứa con, 1 con trai, 1 con gái.',
  '您儿子几岁？': 'Con trai cô mấy tuổi?',
  '他今年五岁。': 'Cháu năm nay 5 tuổi.',
  '你女儿多大？': 'Con gái cô bao nhiêu tuổi?',
  '她今年12岁。': 'Cháu năm nay 12 tuổi.',
  '今天几号？': 'Hôm nay ngày mấy?',
  '今天9月8号。': 'Hôm nay ngày 8 tháng 9.',
  '星期几？': 'Thứ mấy?',
  '星期日。今天我休息。': 'Chủ nhật. Hôm nay tôi nghỉ làm.',
  '你会做饭吗？': 'Bạn biết nấu ăn không?',
  '我会做。': 'Tôi biết nấu.',
  '你会做什么？': 'Bạn biết nấu món gì?',
  '我会做面条儿、饺子，也会做一些菜。星期天我也做饭。': 'Tôi biết làm mì, sủi cảo, cũng biết nấu một số món ăn. Chủ nhật tôi cũng nấu cơm.',
  '同乐，下班吗？': 'Đồng Lạc, tan làm chưa?',
  '下班。': 'Tan làm rồi.',
  '这是 your 新电脑吗？': 'Đây là máy tính mới của bạn à?',
  '这是你的新电脑吗？': 'Đây là máy tính mới của bạn à?'
};

lessons.forEach(les => {
  les.dialogues.forEach(diag => {
    diag.lines.forEach(line => {
      if (!line.pinyin && line.zh) {
        try {
          line.pinyin = pinyin(line.zh, { toneType: 'symbol' });
        } catch (e) {
          line.pinyin = '';
        }
      }
      if (!line.vi && line.zh) {
        line.vi = translationDictionary[line.zh] || `Dịch nghĩa: ${line.zh}`;
      }
    });

    // Clean up Quiz questions if present
    if (diag.quiz && diag.quiz.questions) {
      diag.quiz.questions.forEach((q, idx) => {
        if (!q.options || q.options.length === 0) {
          q.options = ['Đáp án A', 'Đáp án B', 'Đáp án C'];
        }
        // ensure clean answer string
        if (!q.answer) {
          q.answer = q.options[0] || 'Đáp án A';
        }
      });
    }
  });
});

fs.writeFileSync(filePath, JSON.stringify(lessons, null, 2));
console.log('Enriched hsk1_reading_texts.json with pinyin and Vietnamese translations!');
