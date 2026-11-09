import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const yct1OfficialLessonTitles = {
  1: 'Bài 1: 你好！ Xin chào!',
  2: 'Bài 2: 你叫什么？ Bạn tên gì?',
  3: 'Bài 3: 他是谁？ Ông ấy là ai?',
  4: 'Bài 4: 我家有四口人。 Nhà mình có bốn người.',
  5: 'Bài 5: 我6岁。 Mình sáu tuổi.',
  6: 'Bài 6: 你的个子真高！ Bạn cao thật đấy!',
  7: 'Bài 7: 这是谁的狗？ Đây là con chó của ai?',
  8: 'Bài 8: 我去商店。 Tôi đi cửa hàng.',
  9: 'Bài 9: 今天星期几？ Hôm nay là thứ mấy?',
  10: 'Bài 10: 现在几点？ Bây giờ là mấy giờ?',
  11: 'Bài 11: 你吃什么？ Bạn ăn gì?',
  12: 'Bài 12: 复习 Ôn tập tổng hợp'
};

const yct1WordsRaw = [
  // Bài 1: 你好！ Xin chào! (Trang 1, 14 từ)
  { word: '一', pinyin: 'yī', meaning: 'số 1', page: 1, lessonId: 1, category: 'Số từ', ex_zh: '我有一个苹果。', ex_vi: 'Tôi có một quả táo.' },
  { word: '二', pinyin: 'èr', meaning: 'số 2', page: 1, lessonId: 1, category: 'Số từ', ex_zh: '这是二。', ex_vi: 'Đây là số hai.' },
  { word: '三', pinyin: 'sān', meaning: 'số 3', page: 1, lessonId: 1, category: 'Số từ', ex_zh: '三只小鸟。', ex_vi: 'Ba con chim nhỏ.' },
  { word: '四', pinyin: 'sì', meaning: 'số 4', page: 1, lessonId: 1, category: 'Số từ', ex_zh: '我家有四口人。', ex_vi: 'Nhà tôi có bốn người.' },
  { word: '五', pinyin: 'wǔ', meaning: 'số 5', page: 1, lessonId: 1, category: 'Số từ', ex_zh: '五个苹果。', ex_vi: 'Năm quả táo.' },
  { word: '六', pinyin: 'liù', meaning: 'số 6', page: 1, lessonId: 1, category: 'Số từ', ex_zh: '我六岁。', ex_vi: 'Tôi sáu tuổi.' },
  { word: '七', pinyin: 'qī', meaning: 'số 7', page: 1, lessonId: 1, category: 'Số từ', ex_zh: '一个星期有七天。', ex_vi: 'Một tuần có bảy ngày.' },
  { word: '八', pinyin: 'bā', meaning: 'số 8', page: 1, lessonId: 1, category: 'Số từ', ex_zh: '八点 (tám giờ)', ex_vi: 'Bây giờ là tám giờ.' },
  { word: '九', pinyin: 'jiǔ', meaning: 'số 9', page: 1, lessonId: 1, category: 'Số từ', ex_zh: '九月 (tháng chín)', ex_vi: 'Tháng chín' },
  { word: '十', pinyin: 'shí', meaning: 'số 10', page: 1, lessonId: 1, category: 'Số từ', ex_zh: '十个苹果。', ex_vi: 'Mười quả táo.' },
  { word: '你', pinyin: 'nǐ', meaning: 'bạn, em, cháu', page: 1, lessonId: 1, category: 'Đại từ', ex_zh: '你好！', ex_vi: 'Xin chào bạn!' },
  { word: '好', pinyin: 'hǎo', meaning: 'tốt, đẹp, khỏe', page: 1, lessonId: 1, category: 'Tính từ', ex_zh: '很好！', ex_vi: 'Rất tốt!' },
  { word: '老师', pinyin: 'lǎoshī', meaning: 'cô giáo, thầy giáo', page: 1, lessonId: 1, category: 'Danh từ', ex_zh: '老师好！', ex_vi: 'Em chào thầy/cô!' },
  { word: '再见', pinyin: 'zàijiàn', meaning: 'tạm biệt', page: 1, lessonId: 1, category: 'Động từ', ex_zh: '老师，再见！', ex_vi: 'Tạm biệt cô giáo!' },

  // Bài 2: 你叫什么？ Bạn tên gì? (Trang 5, 9 từ)
  { word: '不', pinyin: 'bù', meaning: 'không, chẳng', page: 5, lessonId: 2, category: 'Phó từ', ex_zh: '我不是老师。', ex_vi: 'Tôi không phải là giáo viên.' },
  { word: '高兴', pinyin: 'gāoxìng', meaning: 'vui vẻ', page: 5, lessonId: 2, category: 'Tính từ', ex_zh: '认识你很高兴。', ex_vi: 'Rất vui được quen biết bạn.' },
  { word: '很', pinyin: 'hěn', meaning: 'rất', page: 5, lessonId: 2, category: 'Phó từ', ex_zh: '我很好。', ex_vi: 'Tôi rất khỏe.' },
  { word: '叫', pinyin: 'jiào', meaning: 'gọi, tên là', page: 5, lessonId: 2, category: 'Động từ', ex_zh: '你叫什么名字？', ex_vi: 'Bạn tên là gì?' },
  { word: '吗', pinyin: 'ma', meaning: 'phải không, à, ư', page: 5, lessonId: 2, category: 'Trợ từ', ex_zh: '你好吗？', ex_vi: 'Bạn khỏe không?' },
  { word: '认识', pinyin: 'rènshi', meaning: 'quen biết, nhận biết', page: 5, lessonId: 2, category: 'Động từ', ex_zh: '认识你真高兴！', ex_vi: 'Quen biết bạn thật là vui!' },
  { word: '什么', pinyin: 'shénme', meaning: 'cái gì, gì', page: 5, lessonId: 2, category: 'Đại từ', ex_zh: '这是什么？', ex_vi: 'Đây là cái gì?' },
  { word: '她', pinyin: 'tā', meaning: 'cô ấy, bạn ấy (nữ)', page: 5, lessonId: 2, category: 'Đại từ', ex_zh: '她叫小红。', ex_vi: 'Cô ấy tên là Tiểu Hồng.' },
  { word: '我', pinyin: 'wǒ', meaning: 'tôi, mình, em', page: 5, lessonId: 2, category: 'Đại từ', ex_zh: '我叫大龙。', ex_vi: 'Mình tên là Đại Long.' },

  // Bài 3: 他是谁？ Ông ấy là ai? (Trang 9, 7 từ)
  { word: '国', pinyin: 'guó', meaning: 'đất nước, quốc gia', page: 9, lessonId: 3, category: 'Danh từ', ex_zh: '你是哪国人？', ex_vi: 'Bạn là người nước nào?' },
  { word: '哪', pinyin: 'nǎ', meaning: 'nào, cái nào', page: 9, lessonId: 3, category: 'Đại từ', ex_zh: '哪个人？', ex_vi: 'Người nào?' },
  { word: '人', pinyin: 'rén', meaning: 'người', page: 9, lessonId: 3, category: 'Danh từ', ex_zh: '中国人 (người Trung Quốc)', ex_vi: 'Người Trung Quốc' },
  { word: '谁', pinyin: 'shéi', meaning: 'ai', page: 9, lessonId: 3, category: 'Đại từ', ex_zh: '他是谁？', ex_vi: 'Ông ấy là ai?' },
  { word: '是', pinyin: 'shì', meaning: 'là, phải', page: 9, lessonId: 3, category: 'Động từ', ex_zh: '他是我的老师。', ex_vi: 'Thầy ấy là giáo viên của tôi.' },
  { word: '他', pinyin: 'tā', meaning: 'anh ấy, ông ấy, cậu ấy', page: 9, lessonId: 3, category: 'Đại từ', ex_zh: '他是我爸爸。', ex_vi: 'Ông ấy là bố của tôi.' },
  { word: '中国人', pinyin: 'zhōngguórén', meaning: 'người Trung Quốc', page: 9, lessonId: 3, category: 'Danh từ', ex_zh: '我是中国人。', ex_vi: 'Tôi là người Trung Quốc.' },

  // Bài 4: 我家有四口人。 Nhà mình có bốn người. (Trang 14, 12 từ)
  { word: '爸爸', pinyin: 'bàba', meaning: 'bố, ba', page: 14, lessonId: 4, category: 'Danh từ', ex_zh: '我爸爸是个老师。', ex_vi: 'Bố tôi là giáo viên.' },
  { word: '哥哥', pinyin: 'gēge', meaning: 'anh trai', page: 14, lessonId: 4, category: 'Danh từ', ex_zh: '我哥哥十岁。', ex_vi: 'Anh trai tôi mười tuổi.' },
  { word: '个', pinyin: 'gè', meaning: 'cái, con (lượng từ)', page: 14, lessonId: 4, category: 'Lượng từ', ex_zh: '一个苹果 (một quả táo)', ex_vi: 'Một quả táo' },
  { word: '和', pinyin: 'hé', meaning: 'và, cùng với', page: 14, lessonId: 4, category: 'Liên từ', ex_zh: '爸爸和我', ex_vi: 'Bố và tôi' },
  { word: '几', pinyin: 'jǐ', meaning: 'mấy', page: 14, lessonId: 4, category: 'Đại từ', ex_zh: '你家有几口人？', ex_vi: 'Nhà bạn có mấy người?' },
  { word: '家', pinyin: 'jiā', meaning: 'nhà, gia đình', page: 14, lessonId: 4, category: 'Danh từ', ex_zh: '我家在北京。', ex_vi: 'Nhà tôi ở Bắc Kinh.' },
  { word: '姐姐', pinyin: 'jiějie', meaning: 'chị gái', page: 14, lessonId: 4, category: 'Danh từ', ex_zh: '这是我的姐姐。', ex_vi: 'Đây là chị gái của tôi.' },
  { word: '口', pinyin: 'kǒu', meaning: 'lượng từ cho người/miệng', page: 14, lessonId: 4, category: 'Lượng từ', ex_zh: '我家有三口人。', ex_vi: 'Nhà tôi có ba người.' },
  { word: '妈妈', pinyin: 'māma', meaning: 'mẹ', page: 14, lessonId: 4, category: 'Danh từ', ex_zh: '妈妈，我爱你！', ex_vi: 'Mẹ ơi, con yêu mẹ!' },
  { word: '没有', pinyin: 'méiyǒu', meaning: 'không có', page: 14, lessonId: 4, category: 'Động từ', ex_zh: '我没有哥哥。', ex_vi: 'Tôi không có anh trai.' },
  { word: '妹妹', pinyin: 'mèimei', meaning: 'em gái', page: 14, lessonId: 4, category: 'Danh từ', ex_zh: '妹妹真可爱。', ex_vi: 'Em gái thật đáng yêu.' },
  { word: '有', pinyin: 'yǒu', meaning: 'có', page: 14, lessonId: 4, category: 'Động từ', ex_zh: '我有一个哥哥。', ex_vi: 'Tôi có một anh trai.' },

  // Bài 5: 我6岁。 Mình sáu tuổi. (Trang 19, 3 từ)
  { word: '多大', pinyin: 'duō dà', meaning: 'bao nhiêu tuổi', page: 19, lessonId: 5, category: 'Đại từ', ex_zh: '你今年多大？', ex_vi: 'Năm nay bạn bao nhiêu tuổi?' },
  { word: '岁', pinyin: 'suì', meaning: 'tuổi', page: 19, lessonId: 5, category: 'Lượng từ', ex_zh: '我今年六岁。', ex_vi: 'Năm nay mình sáu tuổi.' },
  { word: '也', pinyin: 'yě', meaning: 'cũng', page: 19, lessonId: 5, category: 'Phó từ', ex_zh: '我也是六岁。', ex_vi: 'Tôi cũng sáu tuổi.' },

  // Bài 6: 你的个子真高！ Bạn cao thật đấy! (Trang 24, 12 từ)
  { word: '鼻子', pinyin: 'bízi', meaning: 'mũi', page: 24, lessonId: 6, category: 'Danh từ', ex_zh: '他的鼻子小小的。', ex_vi: 'Mũi cậu ấy nho nhỏ.' },
  { word: '长', pinyin: 'cháng', meaning: 'dài', page: 24, lessonId: 6, category: 'Tính từ', ex_zh: '她的头发很长。', ex_vi: 'Tóc của bạn ấy rất dài.' },
  { word: '大', pinyin: 'dà', meaning: 'to, lớn', page: 24, lessonId: 6, category: 'Tính từ', ex_zh: '大眼睛 (mắt to)', ex_vi: 'Đôi mắt to' },
  { word: '的', pinyin: 'de', meaning: 'của', page: 24, lessonId: 6, category: 'Trợ từ', ex_zh: '我的手 (tay của tôi)', ex_vi: 'Tay của tôi' },
  { word: '耳朵', pinyin: 'ěrduo', meaning: 'tai', page: 24, lessonId: 6, category: 'Danh từ', ex_zh: '兔子的耳朵长长的。', ex_vi: 'Tai thỏ dài dài.' },
  { word: '高', pinyin: 'gāo', meaning: 'cao', page: 24, lessonId: 6, category: 'Tính từ', ex_zh: '爸爸很高。', ex_vi: 'Bố rất cao.' },
  { word: '个子', pinyin: 'gèzi', meaning: 'dáng vẻ, chiều cao', page: 24, lessonId: 6, category: 'Danh từ', ex_zh: '你的个子真高！', ex_vi: 'Dáng người của bạn cao thật!' },
  { word: '手', pinyin: 'shǒu', meaning: 'tay, bàn tay', page: 24, lessonId: 6, category: 'Danh từ', ex_zh: '小手 (bàn tay nhỏ)', ex_vi: 'Bàn tay nhỏ' },
  { word: '头发', pinyin: 'tóufa', meaning: 'tóc', page: 24, lessonId: 6, category: 'Danh từ', ex_zh: '他的头发短短的。', ex_vi: 'Tóc cậu ấy ngắn ngắn.' },
  { word: '小', pinyin: 'xiǎo', meaning: 'nhỏ, bé', page: 24, lessonId: 6, category: 'Tính từ', ex_zh: '这只小狗很小。', ex_vi: 'Chú cún này rất nhỏ.' },
  { word: '眼睛', pinyin: 'yǎnjing', meaning: 'mắt', page: 24, lessonId: 6, category: 'Danh từ', ex_zh: '大大的眼睛', ex_vi: 'Đôi mắt to tròn' },
  { word: '真', pinyin: 'zhēn', meaning: 'thật, thật là', page: 24, lessonId: 6, category: 'Phó từ', ex_zh: '真漂亮！', ex_vi: 'Đẹp thật đấy!' },

  // Bài 7: 这是谁的狗？ Đây là con chó của ai? (Trang 29, 10 từ)
  { word: '多', pinyin: 'duō', meaning: 'nhiều', page: 29, lessonId: 7, category: 'Tính từ', ex_zh: '这里的小鸟真多！', ex_vi: 'Chim nhỏ ở đây thật là nhiều!' },
  { word: '狗', pinyin: 'gǒu', meaning: 'con chó', page: 29, lessonId: 7, category: 'Danh từ', ex_zh: '这是谁的狗？', ex_vi: 'Đây là con chó của ai?' },
  { word: '看', pinyin: 'kàn', meaning: 'nhìn, xem', page: 29, lessonId: 7, category: 'Động từ', ex_zh: '你看那只猫。', ex_vi: 'Bạn xem con mèo kìa.' },
  { word: '猫', pinyin: 'māo', meaning: 'con mèo', page: 29, lessonId: 7, category: 'Danh từ', ex_zh: '我家有一只小猫。', ex_vi: 'Nhà tôi có một chú mèo con.' },
  { word: '那', pinyin: 'nà', meaning: 'đó, kia', page: 29, lessonId: 7, category: 'Đại từ', ex_zh: '那是一只鸟。', ex_vi: 'Kia là một con chim.' },
  { word: '那儿', pinyin: 'nàr', meaning: 'ở kia, đằng kia', page: 29, lessonId: 7, category: 'Đại từ', ex_zh: '小猫在那儿。', ex_vi: 'Mèo con ở đằng kia.' },
  { word: '鸟', pinyin: 'niǎo', meaning: 'con chim', page: 29, lessonId: 7, category: 'Danh từ', ex_zh: '树上有一只小鸟。', ex_vi: 'Trên cây có một chú chim nhỏ.' },
  { word: '鱼', pinyin: 'yú', meaning: 'cá, con cá', page: 29, lessonId: 7, category: 'Danh từ', ex_zh: '水里有小鱼。', ex_vi: 'Dưới nước có cá nhỏ.' },
  { word: '这', pinyin: 'zhè', meaning: 'đây, này', page: 29, lessonId: 7, category: 'Đại từ', ex_zh: '这是我的小狗。', ex_vi: 'Đây là chú cún của tôi.' },
  { word: '这儿', pinyin: 'zhèr', meaning: 'ở đây, chỗ này', page: 29, lessonId: 7, category: 'Đại từ', ex_zh: '我在这儿！', ex_vi: 'Tôi ở đây này!' },

  // Bài 8: 我去商店。 Tôi đi cửa hàng. (Trang 34, 8 từ)
  { word: '哪儿', pinyin: 'nǎr', meaning: 'đâu, ở đâu', page: 34, lessonId: 8, category: 'Đại từ', ex_zh: '你去哪儿？', ex_vi: 'Bạn đi đâu đấy?' },
  { word: '你们', pinyin: 'nǐmen', meaning: 'các bạn, các em', page: 34, lessonId: 8, category: 'Đại từ', ex_zh: '你们好！', ex_vi: 'Chào các bạn!' },
  { word: '去', pinyin: 'qù', meaning: 'đi, đến', page: 34, lessonId: 8, category: 'Động từ', ex_zh: '我去学校。', ex_vi: 'Tôi đi đến trường.' },
  { word: '商店', pinyin: 'shāngdiàn', meaning: 'cửa hàng', page: 34, lessonId: 8, category: 'Danh từ', ex_zh: '妈妈去商店。', ex_vi: 'Mẹ đi đến cửa hàng.' },
  { word: '我们', pinyin: 'wǒmen', meaning: 'chúng tôi, chúng mình', page: 34, lessonId: 8, category: 'Đại từ', ex_zh: '我们去学校吧。', ex_vi: 'Chúng mình đi đến trường nào.' },
  { word: '谢谢', pinyin: 'xièxie', meaning: 'cảm ơn', page: 34, lessonId: 8, category: 'Động từ', ex_zh: '谢谢老师！', ex_vi: 'Cảm ơn cô giáo!' },
  { word: '学校', pinyin: 'xuéxiào', meaning: 'trường học', page: 34, lessonId: 8, category: 'Danh từ', ex_zh: '我爱我的学校。', ex_vi: 'Tôi yêu trường học của mình.' },
  { word: '在', pinyin: 'zài', meaning: 'ở, tại', page: 34, lessonId: 8, category: 'Giới từ', ex_zh: '我在学校。', ex_vi: 'Tôi đang ở trường.' },

  // Bài 9: 今天星期几？ Hôm nay là thứ mấy? (Trang 39, 14 từ)
  { word: '号', pinyin: 'hào', meaning: 'ngày, số', page: 39, lessonId: 9, category: 'Danh từ', ex_zh: '今天八号。', ex_vi: 'Hôm nay ngày tám.' },
  { word: '今天', pinyin: 'jīntiān', meaning: 'hôm nay', page: 39, lessonId: 9, category: 'Danh từ', ex_zh: '今天星期几？', ex_vi: 'Hôm nay là thứ mấy?' },
  { word: '明天', pinyin: 'míngtiān', meaning: 'ngày mai', page: 39, lessonId: 9, category: 'Danh từ', ex_zh: '明天见！', ex_vi: 'Ngày mai gặp lại!' },
  { word: '生日', pinyin: 'shēngrì', meaning: 'sinh nhật', page: 39, lessonId: 9, category: 'Danh từ', ex_zh: '祝你生日快乐！', ex_vi: 'Chúc bạn sinh nhật vui vẻ!' },
  { word: '喜欢', pinyin: 'xǐhuan', meaning: 'thích', page: 39, lessonId: 9, category: 'Động từ', ex_zh: '我喜欢小狗。', ex_vi: 'Tôi thích chú cún nhỏ.' },
  { word: '星期', pinyin: 'xīngqī', meaning: 'tuần, thứ', page: 39, lessonId: 9, category: 'Danh từ', ex_zh: '一个星期有七天。', ex_vi: 'Một tuần có bảy ngày.' },
  { word: '星期一', pinyin: 'xīngqīyī', meaning: 'Thứ hai', page: 39, lessonId: 9, category: 'Danh từ', ex_zh: '今天是星期一。', ex_vi: 'Hôm nay là thứ hai.' },
  { word: '星期二', pinyin: 'xīngqī\'èr', meaning: 'Thứ ba', page: 39, lessonId: 9, category: 'Danh từ', ex_zh: '明天是星期二。', ex_vi: 'Ngày mai là thứ ba.' },
  { word: '星期三', pinyin: 'xīngqīsān', meaning: 'Thứ tư', page: 39, lessonId: 9, category: 'Danh từ', ex_zh: '星期三我去学校。', ex_vi: 'Thứ tư tôi đến trường.' },
  { word: '星期四', pinyin: 'xīngqīsì', meaning: 'Thứ năm', page: 39, lessonId: 9, category: 'Danh từ', ex_zh: '星期四见。', ex_vi: 'Thứ năm gặp lại.' },
  { word: '星期五', pinyin: 'xīngqīwǔ', meaning: 'Thứ sáu', page: 39, lessonId: 9, category: 'Danh từ', ex_zh: '星期五有中文课。', ex_vi: 'Thứ sáu có tiết tiếng Trung.' },
  { word: '星期六', pinyin: 'xīngqīliù', meaning: 'Thứ bảy', page: 39, lessonId: 9, category: 'Danh từ', ex_zh: '星期六我不去学校。', ex_vi: 'Thứ bảy tôi không đến trường.' },
  { word: '星期天', pinyin: 'xīngqītiān', meaning: 'Chủ nhật', page: 39, lessonId: 9, category: 'Danh từ', ex_zh: '星期天我和妈妈去商店。', ex_vi: 'Chủ nhật tôi và mẹ đi cửa hàng.' },
  { word: '月', pinyin: 'yuè', meaning: 'tháng, mặt trăng', page: 39, lessonId: 9, category: 'Danh từ', ex_zh: '八月八号', ex_vi: 'Ngày 8 tháng 8' },

  // Bài 10: 现在几点？ Bây giờ là mấy giờ? (Trang 44, 6 từ)
  { word: '点', pinyin: 'diǎn', meaning: 'giờ', page: 44, lessonId: 10, category: 'Lượng từ', ex_zh: '现在九点。', ex_vi: 'Bây giờ là 9 giờ.' },
  { word: '分', pinyin: 'fēn', meaning: 'phút', page: 44, lessonId: 10, category: 'Lượng từ', ex_zh: '九点十分', ex_vi: 'Chín giờ mười phút' },
  { word: '见', pinyin: 'jiàn', meaning: 'gặp, thấy', page: 44, lessonId: 10, category: 'Động từ', ex_zh: '早上见！', ex_vi: 'Sáng mai gặp lại!' },
  { word: '太早了', pinyin: 'tài zǎo le', meaning: 'quá sớm rồi', page: 44, lessonId: 10, category: 'Cụm từ', ex_zh: '现在七点，太早了！', ex_vi: 'Bây giờ mới 7 giờ, quá sớm rồi!' },
  { word: '现在', pinyin: 'xiànzài', meaning: 'bây giờ', page: 44, lessonId: 10, category: 'Danh từ', ex_zh: '现在几点？', ex_vi: 'Bây giờ mấy giờ rồi?' },
  { word: '早上', pinyin: 'zǎoshang', meaning: 'buổi sáng', page: 44, lessonId: 10, category: 'Danh từ', ex_zh: '早上好，老师！', ex_vi: 'Chào buổi sáng cô giáo!' },

  // Bài 11: 你吃什么？ Bạn ăn gì? (Trang 49, 9 từ)
  { word: '爱', pinyin: 'ài', meaning: 'yêu, thích', page: 49, lessonId: 11, category: 'Động từ', ex_zh: '我爱吃苹果。', ex_vi: 'Tôi thích ăn táo.' },
  { word: '吃', pinyin: 'chī', meaning: 'ăn', page: 49, lessonId: 11, category: 'Động từ', ex_zh: '你想吃什么？', ex_vi: 'Bạn muốn ăn gì?' },
  { word: '蛋糕', pinyin: 'dàngāo', meaning: 'bánh kem, bánh ga-tô', page: 49, lessonId: 11, category: 'Danh từ', ex_zh: '我喜欢吃蛋糕。', ex_vi: 'Tôi thích ăn bánh kem.' },
  { word: '喝', pinyin: 'hē', meaning: 'uống', page: 49, lessonId: 11, category: 'Động từ', ex_zh: '我想喝牛奶。', ex_vi: 'Tôi muốn uống sữa bò.' },
  { word: '米饭', pinyin: 'mǐfàn', meaning: 'cơm', page: 49, lessonId: 11, category: 'Danh từ', ex_zh: '我吃米饭。', ex_vi: 'Tôi ăn cơm.' },
  { word: '面条', pinyin: 'miàntiáo', meaning: 'mì, mì sợi', page: 49, lessonId: 11, category: 'Danh từ', ex_zh: '面条很好吃。', ex_vi: 'Mì sợi rất ngon.' },
  { word: '牛奶', pinyin: 'niúnǎi', meaning: 'sữa bò', page: 49, lessonId: 11, category: 'Danh từ', ex_zh: '喝牛奶 (uống sữa bò)', ex_vi: 'Uống sữa bò' },
  { word: '苹果', pinyin: 'píngguǒ', meaning: 'quả táo', page: 49, lessonId: 11, category: 'Danh từ', ex_zh: '一个大苹果', ex_vi: 'Một quả táo to' },
  { word: '水', pinyin: 'shuǐ', meaning: 'nước', page: 49, lessonId: 11, category: 'Danh từ', ex_zh: '请喝水。', ex_vi: 'Mời uống nước.' }
];

console.log('Total YCT 1 words:', yct1WordsRaw.length);

const extractedPath = path.join(__dirname, '../yct_extracted.json');
const dbPath = path.join(__dirname, '../database.json');

// 1. Update yct_extracted.json
const yctExtracted = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));

// Format for yct_extracted.json
yctExtracted['1'] = yct1WordsRaw.map(item => ({
  word: item.word,
  pinyin: item.pinyin,
  meaning: item.meaning,
  lesson: item.lessonId,
  page: item.page,
  category: item.category
}));

fs.writeFileSync(extractedPath, JSON.stringify(yctExtracted, null, 2), 'utf8');
console.log('Successfully updated backend/yct_extracted.json level 1!');

// 2. Update database.json
const masterDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Filter out any previous YCT 1 words if any exist
const withoutYct1 = masterDb.filter(w => !((w.curriculum === 'yct' || w.hskVersion === 'yct') && String(w.level) === '1'));

// Generate full database objects for YCT 1
const startId = 9111;
const yct1DbWords = yct1WordsRaw.map((item, idx) => ({
  id: startId + idx,
  word: item.word,
  pinyin: item.pinyin,
  meaning: item.meaning,
  level: 1,
  curriculum: 'yct',
  hskVersion: 'yct',
  volume: null,
  lessonId: item.lessonId,
  lessonTitle: yct1OfficialLessonTitles[item.lessonId],
  lessonDesc: `YCT Thiếu Nhi Cấp 1 - Bài ${item.lessonId}`,
  category: item.category,
  example_zh: item.ex_zh,
  example_vi: item.ex_vi,
  isMemorized: false,
  isStarred: false,
  isWrong: false,
  isStudied: false,
  isCustom: false
}));

// Insert into master database before YCT 2 (which starts at id 9215)
const yct2Index = withoutYct1.findIndex(w => (w.curriculum === 'yct' || w.hskVersion === 'yct') && String(w.level) === '2');
if (yct2Index !== -1) {
  withoutYct1.splice(yct2Index, 0, ...yct1DbWords);
} else {
  withoutYct1.push(...yct1DbWords);
}

fs.writeFileSync(dbPath, JSON.stringify(withoutYct1, null, 2), 'utf8');
console.log(`Successfully inserted ${yct1DbWords.length} YCT 1 words (IDs ${startId}..${startId + yct1DbWords.length - 1}) into backend/database.json!`);

