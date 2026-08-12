import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { pinyin } from 'pinyin-pro';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, '../..');

const HSK2_LESSON_TITLES = {
  1: '她请我们去了北京烤鸭',
  2: '还是打车去北大吧',
  3: '我想去西安旅游',
  4: '你穿红色的很好看',
  5: '第一次去中国朋友家',
  6: '小雪，生日快乐！',
  7: '他篮球打得很好',
  8: '虽然你忘了，但是我记得',
  9: '我去买杯奶茶',
  10: '就要考试了',
  11: '我最喜欢吃中国菜',
  12: '这里比北京冷多了',
  13: '我们爱上中文课',
  14: '一个人过年多没意思啊',
  15: '我想再去一次中国'
};

function generatePinyin(zhText) {
  if (!zhText) return '';
  const clean = zhText.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
  if (!clean) return '';
  return pinyin(zhText, { toneType: 'symbol' });
}

function parseExampleItem(rawStr) {
  let str = rawStr.trim().replace(/^[•\-\*\d\.\)]\s*/, '');
  if (!str) return null;

  // Case 1: 我去过两次。 (Tôi đã đi qua hai lần.)
  // Case 2: 桌子上放着一本书。(Zhuōzi shàng fàng zhe yì běn shū - Trên bàn đang đặt một quyển sách)
  // Case 3: 我做完作业了。(Tôi làm xong bài tập rồi.)
  let zh = '';
  let pin = '';
  let vi = '';

  // Check if has parentheses
  const pMatch = str.match(/^([^\(（]+)[\(（]([^\)）]+)[\)）](.*)$/);
  if (pMatch) {
    zh = pMatch[1].trim();
    const inside = pMatch[2].trim();
    const after = (pMatch[3] || '').trim();

    // Check if inside has both pinyin and vi: e.g. "Zhuōzi shàng... - Trên bàn..."
    if (inside.includes(' - ') || inside.includes(' – ')) {
      const parts = inside.split(/\s*[-–]\s*/);
      pin = parts[0].trim();
      vi = parts.slice(1).join(' - ').trim();
    } else if (/[a-zA-Zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i.test(inside) && !/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/i.test(inside) && /\b(Tôi|Anh|Em|Bạn|Chúng|Họ|Trời|Người|Sách|Vé|Nhà|Học|Ăn|Xem|Đi)\b/i.test(inside)) {
      // It's Vietnamese translation
      vi = inside;
      pin = generatePinyin(zh);
    } else if (/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(inside)) {
      // Inside is pinyin
      pin = inside;
      if (after.startsWith(':') || after.startsWith('：') || after.startsWith('-')) {
        vi = after.replace(/^[:：\-]\s*/, '').trim();
      } else {
        vi = after;
      }
    } else {
      vi = inside;
      pin = generatePinyin(zh);
    }
  } else {
    // No parentheses, e.g. "他篮球打得很好：Anh ấy chơi bóng rổ rất tốt"
    if (str.includes(':') || str.includes('：')) {
      const parts = str.split(/[:：]/);
      zh = parts[0].trim();
      vi = parts.slice(1).join(':').trim();
      pin = generatePinyin(zh);
    } else {
      zh = str;
      pin = generatePinyin(zh);
      vi = '';
    }
  }

  // Clean zh and vi
  zh = zh.replace(/^[•\-\*\s]+/, '').trim();
  vi = vi.replace(/^[•\-\*\s]+/, '').trim();
  if (vi.endsWith('.')) vi = vi.slice(0, -1);
  if (vi.startsWith('(') && vi.endsWith(')')) vi = vi.slice(1, -1).trim();

  // If pinyin is still empty, generate it
  if (!pin && zh) {
    pin = generatePinyin(zh);
  }

  return {
    rawZh: str,
    zh: zh || str,
    pinyin: pin || '',
    vi: vi || ''
  };
}

function parseExamplesFromText(text) {
  if (!text) return [];
  // Split by newline, or by Chinese sentence terminators followed by translation
  // Or match items like "...(...)"
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const results = [];

  lines.forEach(l => {
    // If line has multiple examples packed, like "1. xxx(yyy) 2. xxx(yyy)" or "xxx(yyy)。aaa(bbb)"
    const matchMultiple = l.match(/([^\(（\n]+?[\(（][^\)）]+?[\)）][\s。]*)/g);
    if (matchMultiple && matchMultiple.length > 1) {
      matchMultiple.forEach(m => {
        const ex = parseExampleItem(m);
        if (ex && ex.zh) results.push(ex);
      });
    } else {
      const ex = parseExampleItem(l);
      if (ex && ex.zh) results.push(ex);
    }
  });

  return results;
}

// Build complete HSK 2 lessons manually with maximum accuracy and fidelity
const HSK2_STRUCTURED_GRAMMAR = [
  {
    lessonId: 1,
    lessonKey: 'Bài 1',
    lessonTitleZh: '她请我们去了北京烤鸭',
    lessonTitleFull: 'Bài 1: 她请我们去了北京烤鸭',
    grammarPoints: [
      {
        id: 'hsk2_b1_g1',
        num: 1,
        title: 'Trợ từ ngữ khí “吧” (Biểu thị sự suy đoán / gợi ý)',
        explanation: 'Đặt ở cuối câu để biểu thị ý đề nghị, gợi ý nhẹ nhàng ("...đi", "...nhé") hoặc suy đoán có phần chắc chắn ("...chứ?", "...phải không?").',
        formula: 'S + V + (O) + 吧',
        note: 'Khác với "吗" (hỏi không biết thông tin), "吧" dùng khi người nói đã có suy đoán và chỉ cần xác nhận lại.',
        examples: [
          { rawZh: '我们去旅游吧。 (Chúng ta đi du lịch đi.)', zh: '我们去旅游吧。', pinyin: 'Wǒmen qù lǚyóu ba.', vi: 'Chúng ta đi du lịch đi.' },
          { rawZh: '我们去吃北京烤鸭吧。 (Chúng ta đi ăn vịt quay Bắc Kinh đi.)', zh: '我们去吃北京烤鸭吧。', pinyin: 'Wǒmen qù chī Běijīng kǎoyā ba.', vi: 'Chúng ta đi ăn vịt quay Bắc Kinh đi.' },
          { rawZh: '他已经懂了吧？ (Anh ấy đã hiểu rồi chứ?)', zh: '他已经懂了吧？', pinyin: 'Tā yǐjīng dǒng le ba?', vi: 'Anh ấy đã hiểu rồi chứ?' },
          { rawZh: '我们去买票吧。 (Chúng ta đi mua vé đi.)', zh: 'Chúng ta đi mua vé đi.', pinyin: 'Wǒmen qù mǎi piào ba.', vi: 'Chúng ta đi mua vé đi.' },
          { rawZh: '我介绍一下吧。 (Để tôi giới thiệu một chút nhé.)', zh: '我介绍一下吧。', pinyin: 'Wǒ jièshào yíxià ba.', vi: 'Để tôi giới thiệu một chút nhé.' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b1_g2',
        num: 2,
        title: 'Cấu trúc nhấn mạnh “是……的”',
        explanation: 'Trong tiếng Trung, khi kể lại một sự việc đã xảy ra trong quá khứ, nếu muốn nhấn mạnh vào thời gian, địa điểm hoặc cách thức/phương tiện thực hiện của hành động đó, ta sử dụng cấu trúc “是……的”.',
        formula: 'Khẳng định: S + (是) + [Thời gian / Địa điểm / Cách thức] + V + 的\nPhủ định: S + 不是 + [Thời gian / Địa điểm / Cách thức] + V + 的',
        note: '1. Chỉ dùng cho hành động ĐÃ HOÀN THÀNH trong quá khứ, không dùng cho tương lai hay thói quen.\n2. Ở thể khẳng định "是" có thể lược bỏ, nhưng "的" ở cuối câu là BẮT BUỘC.',
        examples: [
          { rawZh: '我是昨天去北京旅游的。 (Tôi là hôm qua mới đi du lịch Bắc Kinh - Nhấn mạnh thời gian.)', zh: '我是昨天去北京旅游的。', pinyin: 'Wǒ shì zuótiān qù Běijīng lǚyóu de.', vi: 'Tôi là hôm qua mới đi du lịch Bắc Kinh.' },
          { rawZh: '我是老师介绍来的。 (Tôi là do thầy giáo giới thiệu đến - Nhấn mạnh cách thức/nguồn gốc.)', zh: '我是老师介绍来的。', pinyin: 'Wǒ shì lǎoshī jièshào lái de.', vi: 'Tôi là do thầy giáo giới thiệu đến.' },
          { rawZh: '我是昨天去接你的。 (Tôi là hôm qua đi đón bạn.)', zh: '我是昨天去接你的。', pinyin: 'Wǒ shì zuótiān qù jiē nǐ de.', vi: 'Tôi là hôm qua đi đón bạn.' },
          { rawZh: '我是坐车去旅游的。 (Tôi là đi xe đi du lịch - Nhấn mạnh phương tiện.)', zh: '我是坐车去旅游的。', pinyin: 'Wǒ shì zuòchē qù lǚyóu de.', vi: 'Tôi là đi xe buýt/ngồi xe đi du lịch.' },
          { rawZh: '我是在学校认识他的。 (Tôi là quen biết anh ấy ở trường học - Nhấn mạnh địa điểm.)', zh: '我是在学校认识他的。', pinyin: 'Wǒ shì zài xuéxiào rènshi tā de.', vi: 'Tôi là quen biết anh ấy ở trường học.' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b1_g3',
        num: 3,
        title: 'Câu kiêm ngữ (请, 让, 叫)',
        explanation: 'Câu kiêm ngữ là loại câu gồm hai cụm động từ, trong đó tân ngữ của động từ thứ nhất (V1) đồng thời đóng vai trò là chủ ngữ của động từ thứ hai (V2). Thường dùng để nhờ vả, yêu cầu, mời mọc ai làm việc gì.',
        formula: 'S1 + V1 (请 / 让 / 叫) + S2 (Kiêm ngữ) + V2 + O2',
        note: 'Sự khác biệt giữa 3 động từ phổ biến:\n- 请 (qǐng): Dùng khi lịch sự, mời mọc, nhờ vả trang trọng.\n- 让 (ràng): Yêu cầu, bảo hoặc cho phép ai đó làm gì (trung tính).\n- 叫 (jiào): Dùng trong giao tiếp hàng ngày, khẩu ngữ thân mật khi bảo/gọi ai làm gì.',
        examples: [
          { rawZh: '老师让我去接你。 (Thầy giáo bảo tôi đi đón bạn.)', zh: '老师让我去接你。', pinyin: 'Lǎoshī ràng wǒ qù jiē nǐ.', vi: 'Thầy giáo bảo tôi đi đón bạn.' },
          { rawZh: '老师让我帮忙。 (Thầy giáo bảo tôi giúp đỡ.)', zh: '老师让我帮忙。', pinyin: 'Lǎoshī ràng wǒ bāngmáng.', vi: 'Thầy giáo bảo tôi giúp đỡ.' },
          { rawZh: '他让我介绍一下。 (Anh ấy bảo tôi giới thiệu một chút.)', zh: '他让我介绍一下。', pinyin: 'Tā ràng wǒ jièshào yíxià.', vi: 'Anh ấy bảo tôi giới thiệu một chút.' },
          { rawZh: '我让他帮我。 (Tôi bảo anh ấy giúp tôi.)', zh: '我让他帮我。', pinyin: 'Wǒ ràng tā bāng wǒ.', vi: 'Tôi bảo anh ấy giúp tôi.' },
          { rawZh: '他请我们吃北京烤鸭。 (Cô ấy mời chúng tôi ăn vịt quay Bắc Kinh.)', zh: '他请我们吃北京烤鸭。', pinyin: 'Tā qǐng wǒmen chī Běijīng kǎoyā.', vi: 'Cô ấy mời chúng tôi ăn vịt quay Bắc Kinh.' }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 2,
    lessonKey: 'Bài 2',
    lessonTitleZh: '还是打车去北大吧',
    lessonTitleFull: 'Bài 2: 还是打车去北大吧',
    grammarPoints: [
      {
        id: 'hsk2_b2_g1',
        num: 1,
        title: 'Cấu trúc “还是……吧” (Lựa chọn / Lời khuyên tốt nhất)',
        explanation: 'Dùng để đưa ra gợi ý, lựa chọn hoặc lời khuyên sau khi đã cân nhắc các phương án khác, mang nghĩa "Hay là... đi / Làm thế này sẽ tốt hơn".',
        formula: 'S + 还是 + V + (O) + 吧',
        note: 'Trong cấu trúc này, 还是 biểu thị phương án được ưu tiên lựa chọn hơn, thường kết hợp với 吧 ở cuối câu.',
        examples: [
          { rawZh: '还是打车去吧。 (Hay là gọi xe taxi đi đi.)', zh: '还是打车去吧。', pinyin: 'Háishì dǎchē qù ba.', vi: 'Hay là gọi xe taxi đi đi.' },
          { rawZh: '还是坐公交车去吧。 (Hay là đi xe buýt đi.)', zh: '还是坐公交车去吧。', pinyin: 'Háishì zuò gōngjiāochē qù ba.', vi: 'Hay là đi xe buýt đi.' },
          { rawZh: '太晚了，还是回家吧。 (Muộn quá rồi, hay là về nhà đi.)', zh: '太晚了，还是回家吧。', pinyin: 'Tài wǎn le, háishì huíjiā ba.', vi: 'Muộn quá rồi, hay là về nhà đi.' },
          { rawZh: '还是去北京大学吧。 (Hay là đi Đại học Bắc Kinh đi.)', zh: '还是去北京大学吧。', pinyin: 'Háishì qù Běijīng Dàxué ba.', vi: 'Hay là đi Đại học Bắc Kinh đi.' },
          { rawZh: '还是去商场看看吧。 (Hay là đi trung tâm thương mại xem thử đi.)', zh: '还是去商场看看吧。', pinyin: 'Háishì qù shāngchǎng kànkan ba.', vi: 'Hay là đi trung tâm thương mại xem thử đi.' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b2_g2',
        num: 2,
        title: 'Biểu thị số ước lượng với “多”',
        explanation: 'Từ “多” (duō) được dùng sau số từ và lượng từ để biểu thị số lượng xấp xỉ nhiều hơn con số đó (hơn, ngoài). Vị trí của “多” phụ thuộc vào việc con số đó là số tròn chục/trăm/nghìn hay số lẻ.',
        formula: '1. Với SỐ TRÒN (10, 20, 50, 100, 1000...):\nSố từ + 多 + Lượng từ + Danh từ\n\n2. Với SỐ LẺ / KHÔNG TRÒN (1, 3, 5, 8, 23, 35...):\nSố từ + Lượng từ + 多 + Danh từ',
        note: 'Quy tắc vàng:\n- Số tròn (10, 20, 100...): "多" đứng TRƯỚC lượng từ (chỉ phần lẻ thêm vào sau hàng chục/trăm).\n- Số lẻ (3, 5, 8...): "多" đứng SAU lượng từ (chỉ phần lẻ của đơn vị đo đếm đó).',
        examples: [
          { rawZh: '十多个人 (Shí duō gè rén): Hơn 10 người (10 là số tròn -> 多 trước 个)', zh: '十多个人', pinyin: 'shí duō gè rén', vi: 'Hơn 10 người' },
          { rawZh: '五十多本书 (Wǔshí duō běn shū): Hơn 50 quyển sách', zh: '五十多本书', pinyin: 'wǔshí duō běn shū', vi: 'Hơn 50 quyển sách' },
          { rawZh: '两百多块 (Liǎng bǎi duō kuài): Hơn 200 tệ', zh: '两百多块', pinyin: 'liǎng bǎi duō kuài', vi: 'Hơn 200 tệ' },
          { rawZh: '三个多月 (Sān gè duō yuè): Hơn 3 tháng (3 là số lẻ -> 多 sau 个)', zh: '三个多月', pinyin: 'sān gè duō yuè', vi: 'Hơn 3 tháng' },
          { rawZh: '五个人多 (Wǔ gè rén duō): Hơn 5 người', zh: '五个人多', pinyin: 'wǔ gè rén duō', vi: 'Hơn 5 người' },
          { rawZh: '八本书多 (Bā běn shū duō): Hơn 8 quyển sách', zh: '八本书多', pinyin: 'bā běn shū duō', vi: 'Hơn 8 quyển sách' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b2_g3',
        num: 3,
        title: 'Định ngữ là Động từ, Cụm động từ hoặc Cụm chủ - vị',
        explanation: 'Trong tiếng Trung, động từ, cụm động từ hoặc cụm chủ-vị có thể đứng trước trợ từ kết cấu “的” để làm định ngữ bổ nghĩa cho danh từ (trung tâm ngữ) đứng sau.',
        formula: '[Động từ / Cụm động từ / Cụm Chủ - Vị] + 的 + Danh từ (Trung tâm ngữ)',
        note: 'Khi dịch sang tiếng Việt, ta dịch danh từ trung tâm ngữ trước, sau đó dịch phần định ngữ bổ nghĩa phía sau.',
        examples: [
          { rawZh: '我买的衣服 (Quần áo tôi mua)', zh: '我买的衣服', pinyin: 'wǒ mǎi de yīfu', vi: 'Quần áo mà tôi đã mua' },
          { rawZh: '我看的电影 (Bộ phim tôi xem)', zh: '我看的电影', pinyin: 'wǒ kàn de diànyǐng', vi: 'Bộ phim tôi xem' },
          { rawZh: '老师介绍的朋友 (Người bạn mà thầy giáo giới thiệu)', zh: '老师介绍的朋友', pinyin: 'lǎoshī jièshào de péngyou', vi: 'Người bạn mà thầy giáo giới thiệu' },
          { rawZh: '我去旅游的地方 (Nơi tôi đi du lịch)', zh: '我去旅游的地方', pinyin: 'wǒ qù lǚyóu de dìfang', vi: 'Nơi tôi đi du lịch' },
          { rawZh: '我在网上看的票 (Vé mà tôi xem trên mạng)', zh: '我在网上看的票', pinyin: 'wǒ zài wǎngshang kàn de piào', vi: 'Vé mà tôi xem trên mạng' }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 3,
    lessonKey: 'Bài 3',
    lessonTitleZh: '我想去西安旅游',
    lessonTitleFull: 'Bài 3: 我想去西安旅游',
    grammarPoints: [
      {
        id: 'hsk2_b3_g1',
        num: 1,
        title: 'Bổ ngữ kết quả (完, 见, 懂, 好, 到)',
        explanation: 'Bổ ngữ kết quả là từ (thường là động từ hoặc tính từ) đứng ngay sau động từ chính để chỉ kết quả hoặc mục đích của hành động đó đã đạt được hay chưa.',
        formula: 'Khẳng định: S + V + [Bổ ngữ kết quả] + (O)\nPhủ định: S + 没(有) + V + [Bổ ngữ kết quả] + (O)\nCâu hỏi: S + V + [Bổ ngữ kết quả] + (O) + 没(有) / 吗?',
        note: 'LƯU Ý QUAN TRỌNG: Thể phủ định của bổ ngữ kết quả bắt buộc phải dùng "没有" (hoặc "没"), tuyệt đối KHÔNG dùng "不".',
        examples: [
          { rawZh: '我做完作业了。(Tôi làm xong bài tập rồi.)', zh: '我做完作业了。', pinyin: 'Wǒ zuò wán zuòyè le.', vi: 'Tôi làm xong bài tập rồi.' },
          { rawZh: '我看完了这本书。(Tôi đã đọc xong quyển sách này rồi.)', zh: '我看完了这本书。', pinyin: 'Wǒ kàn wán le zhè běn shū.', vi: 'Tôi đã đọc xong quyển sách này rồi.' },
          { rawZh: '老师说完了。(Thầy giáo nói xong rồi.)', zh: '老师说完了。', pinyin: 'Lǎoshī shuō wán le.', vi: 'Thầy giáo nói xong rồi.' },
          { rawZh: '我看见他了。(Tôi nhìn thấy anh ấy rồi.)', zh: '我看见他了。', pinyin: 'Wǒ kànjiàn tā le.', vi: 'Tôi nhìn thấy anh ấy rồi.' },
          { rawZh: '我听懂老师的话了。(Tôi nghe hiểu lời thầy giáo rồi.)', zh: '我听懂老师的话了。', pinyin: 'Wǒ tīng dǒng lǎoshī de huà le.', vi: 'Tôi nghe hiểu lời thầy giáo rồi.' },
          { rawZh: '我买到票了。(Tôi đã mua được vé rồi.)', zh: '我买到票了。', pinyin: 'Wǒ mǎi dào piào le.', vi: 'Tôi đã mua được vé rồi.' }
        ],
        tables: [
          {
            title: 'Bảng Các Bổ Ngữ Kết Quả Thông Dụng Nhất HSK 2',
            headers: ['Bổ ngữ', 'Ý nghĩa', 'Ví dụ ghép', 'Dịch nghĩa'],
            rows: [
              ['完 (wán)', 'Làm xong / Hết sạch', '做完 (zuò wán)', 'Làm xong bài tập, công việc'],
              ['见 (jiàn)', 'Nhìn thấy / Nghe thấy', '看见 (kànjiàn), 听见 (tīngjiàn)', 'Nhìn thấy người, nghe thấy tiếng'],
              ['懂 (dǒng)', 'Hiểu rõ qua hành động', '听懂 (tīng dǒng), 看懂 (kàn dǒng)', 'Nghe hiểu bài giảng, đọc hiểu sách'],
              ['好 (hǎo)', 'Xong xuôi & Đạt trạng thái tốt/sẵn sàng', '做好 (zuò hǎo), 买好 (mǎi hǎo)', 'Nấu xong cơm ngon, chuẩn bị xong'],
              ['到 (dào)', 'Đạt được mục đích / Đến nơi', '买到 (mǎi dào), 找到 (zhǎo dào)', 'Mua được vé, tìm thấy đồ vật']
            ]
          }
        ],
        exercises: null
      },
      {
        id: 'hsk2_b3_g2',
        num: 2,
        title: 'Hình thức lặp lại của Động từ (AA, A一A, AB-AB, AAB)',
        explanation: 'Lặp lại động từ trong tiếng Trung nhằm: làm nhẹ ngữ khí câu (lời khuyên/nhờ vả thân mật), diễn tả hành động làm thử, hoặc hành động diễn ra trong thời gian ngắn/nhanh chóng.',
        formula: '1. Đơn âm tiết: AA hoặc A一A (Khẳng định/hiện tại) | A了A (Quá khứ)\n2. Song âm tiết: AB-AB (Không chèn 一)\n3. Từ ly hợp (V+O): AAB hoặc A了A + B',
        note: 'Quy tắc lặp lại chuẩn:\n- Đơn âm tiết: 看看 (kànkan), 听一听 (tīng yi tīng), 试了试 (shì le shì).\n- Song âm tiết: 休息休息 (xiūxi xiūxi), 介绍介绍 (jièshào jièshào) - KHÔNG nói 休息一休息.\n- Từ ly hợp: 睡觉 -> 睡睡觉 (shuì shuì jiào), 散步 -> 散散步 (sàn sàn bù), 洗澡 -> 洗洗澡 (xǐ xǐ zǎo).',
        examples: [
          { rawZh: '你看看这件衣服。(Bạn xem thử bộ quần áo này đi.)', zh: '你看看这件衣服。', pinyin: 'Nǐ kànkan zhè jiàn yīfu.', vi: 'Bạn xem thử bộ quần áo này đi.' },
          { rawZh: '我听了一听这首歌。(Tôi đã nghe thử bài hát này.)', zh: '我听了一听这首歌。', pinyin: 'Wǒ tīng le yì tīng zhè shǒu gē.', vi: 'Tôi đã nghe thử bài hát này.' },
          { rawZh: '周末我们在家休息休息吧。(Cuối tuần chúng ta ở nhà nghỉ ngơi một chút nhé.)', zh: '周末我们在家休息休息吧。', pinyin: 'Zhōumò wǒmen zài jiā xiūxi xiūxi ba.', vi: 'Cuối tuần chúng ta ở nhà nghỉ ngơi một chút nhé.' },
          { rawZh: '吃完饭我们去散散步。(Ăn cơm xong chúng ta đi dạo một chút nhé.)', zh: '吃完饭我们去散散步。', pinyin: 'Chī wán fàn wǒmen qù sàn sàn bù.', vi: 'Ăn cơm xong chúng ta đi dạo một chút nhé.' },
          { rawZh: '我睡了睡午觉。(Tôi đã chợp mắt ngủ trưa một lúc.)', zh: '我睡了睡午觉。', pinyin: 'Wǒ shuì le shuì wǔjiào.', vi: 'Tôi đã chợp mắt ngủ trưa một lúc.' }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 4,
    lessonKey: 'Bài 4',
    lessonTitleZh: '你穿红色的很好看',
    lessonTitleFull: 'Bài 4: 你穿红色的很好看',
    grammarPoints: [
      {
        id: 'hsk2_b4_g1',
        num: 1,
        title: 'Trợ từ động thái “过” (Biểu thị trải nghiệm đã từng qua)',
        explanation: 'Trợ từ “过” (guo) đặt ngay sau động từ để diễn tả một hành động hoặc trải nghiệm đã từng xảy ra trong quá khứ và hiện tại không còn tiếp diễn nữa.',
        formula: 'Khẳng định: S + V + 过 + (O)\nPhủ định: S + 没(有) + V + 过 + (O)\nNghi vấn: S + V + 过 + (O) + 没有 / 吗?',
        note: 'Phủ định bắt buộc dùng "没(有)" + V + 过, tuyệt đối không dùng "不".',
        examples: [
          { rawZh: '我去过北京。(Tôi đã từng đi Bắc Kinh.)', zh: '我去过北京。', pinyin: 'Wǒ qù guo Běijīng.', vi: 'Tôi đã từng đi Bắc Kinh.' },
          { rawZh: '我没吃过北京烤鸭。(Tôi chưa từng ăn vịt quay Bắc Kinh.)', zh: '我没吃过北京烤鸭。', pinyin: 'Wǒ méi chī guo Běijīng kǎoyā.', vi: 'Tôi chưa từng ăn vịt quay Bắc Kinh.' },
          { rawZh: '你看过这个电影吗？(Bạn đã từng xem bộ phim này chưa?)', zh: '你看过这个电影吗？', pinyin: 'Nǐ kàn guo zhè gè diànyǐng ma?', vi: 'Bạn đã từng xem bộ phim này chưa?' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b4_g2',
        num: 2,
        title: 'Câu ghép quan hệ nhân quả “因为……，所以……”',
        explanation: 'Liên từ “因为” (yīnwèi - vì, bởi vì) biểu thị nguyên nhân, “所以” (suǒyǐ - cho nên, vì vậy) biểu thị kết quả sinh ra từ nguyên nhân đó.',
        formula: '因为 + [Nguyên nhân], 所以 + [Kết quả]',
        note: 'Trong khẩu ngữ có thể chỉ dùng một trong hai từ "因为" hoặc "所以" mà người nghe vẫn hiểu trọn vẹn ý.',
        examples: [
          { rawZh: '因为下雨，所以我没去。(Vì trời mưa, nên tôi không đi.)', zh: '因为下雨，所以我没去。', pinyin: 'Yīnwèi xià yǔ, suǒyǐ wǒ méi qù.', vi: 'Vì trời mưa, nên tôi không đi.' },
          { rawZh: '因为我很累，所以想休息。(Vì tôi rất mệt, nên muốn nghỉ ngơi.)', zh: '因为我很累，所以想休息。', pinyin: 'Yīnwèi wǒ hěn lèi, suǒyǐ xiǎng xiūxi.', vi: 'Vì tôi rất mệt, nên muốn nghỉ ngơi.' },
          { rawZh: '因为他是老师，所以他懂。(Vì ông ấy là giáo viên, nên ông ấy hiểu.)', zh: '因为他是老师，所以他懂。', pinyin: 'Yīnwèi tā shì lǎoshī, suǒyǐ tā dǒng.', vi: 'Vì ông ấy là giáo viên, nên ông ấy hiểu.' },
          { rawZh: '因为衣服很贵，所以我没买。(Vì quần áo rất đắt, nên tôi không mua.)', zh: '因为衣服很贵，所以我没买。', pinyin: 'Yīnwèi yīfu hěn guì, suǒyǐ wǒ méi mǎi.', vi: 'Vì quần áo rất đắt, nên tôi không mua.' },
          { rawZh: '因为天气很热，所以我不出门。(Vì thời tiết rất nóng, nên tôi không ra ngoài.)', zh: '因为天气很热，所以我不出门。', pinyin: 'Yīnwèi tiānqì hěn rè, suǒyǐ wǒ bù chūmén.', vi: 'Vì thời tiết rất nóng, nên tôi không ra ngoài.' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b4_g3',
        num: 3,
        title: 'Cụm từ chữ “的” (Lược bỏ trung tâm ngữ)',
        explanation: 'Khi ngữ cảnh đã rõ ràng (cả người nói và người nghe đều biết đang nhắc đến đối tượng/đồ vật nào), ta có thể lược bỏ danh từ trung tâm ngữ phía sau “的” để câu nói ngắn gọn và tự nhiên hơn.',
        formula: '[Định ngữ: Đại từ sở hữu / Tính từ màu sắc, kích thước, đặc điểm] + 的',
        note: '1. Chỉ sở hữu: 我的 (của tôi), 他的 (của anh ấy).\n2. Chỉ màu sắc/kích thước: 红色的 (cái màu đỏ), 大的 (cái to), 新的 (cái mới).',
        examples: [
          { rawZh: '这本书是我的。(Quyển sách này là của tôi - Rút gọn từ: 我的书)', zh: '这本书是我的。', pinyin: 'Zhè běn shū shì wǒ de.', vi: 'Quyển sách này là của tôi.' },
          { rawZh: '那部手机是我朋友的。(Chiếc điện thoại đó là của bạn tôi.)', zh: '那部手机是我朋友的。', pinyin: 'Nà bù shǒujī shì wǒ péngyou de.', vi: 'Chiếc điện thoại đó là của bạn tôi.' },
          { rawZh: '我想要红色的。(Tôi muốn cái màu đỏ - Rút gọn từ: 红色的衣服)', zh: '我想要红色的。', pinyin: 'Wǒ xiǎng yào hóngsè de.', vi: 'Tôi muốn cái màu đỏ.' },
          { rawZh: '我想买大的，不想买小的。(Tôi muốn mua cái to, không muốn mua cái nhỏ.)', zh: '我想买大的，不想买小的。', pinyin: 'Wǒ xiǎng mǎi dà de, bù xiǎng mǎi xiǎo de.', vi: 'Tôi muốn mua cái to, không muốn mua cái nhỏ.' },
          { rawZh: '这个手机是新的，那个是旧的。(Chiếc điện thoại này là cái mới, chiếc kia là cái cũ.)', zh: '这个手机是新的，那个是旧的。', pinyin: 'Zhè gè shǒujī shì xīn de, nà ge shì jiù de.', vi: 'Chiếc điện thoại này là cái mới, chiếc kia là cái cũ.' }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 5,
    lessonKey: 'Bài 5',
    lessonTitleZh: '第一次去中国朋友家',
    lessonTitleFull: 'Bài 5: 第一次去中国朋友家',
    grammarPoints: [
      {
        id: 'hsk2_b5_g1',
        num: 1,
        title: 'Bổ ngữ xu hướng đơn (来 / 去)',
        explanation: 'Bổ ngữ xu hướng đơn đứng sau động từ để miêu tả hướng di chuyển của hành động lấy vị trí của người nói làm mốc chuẩn: hướng về phía người nói (dùng 来) hoặc rời xa người nói (dùng 去).',
        formula: '1. Không có tân ngữ: Động từ + 来 / 去\n2. Tân ngữ là ĐỊA ĐIỂM: Động từ + Địa điểm + 来 / 去\n3. Tân ngữ là ĐỒ VẬT: Động từ + (来/去) + Tân ngữ (hoặc: Động từ + Tân ngữ + 来/去)',
        note: 'Quy tắc mốc chuẩn:\n- 来 (lái): Hành động tiến về phía người nói ("vào đây", "lên đây", "đến đây").\n- 去 (qù): Hành động đi ra xa người nói ("vào đó", "lên đó", "đi kia").',
        examples: [
          { rawZh: '请进来。(Mời vào đây - Người nói đang ở trong phòng).', zh: '请进来。', pinyin: 'Qǐng jìnlái.', vi: 'Mời vào đây.' },
          { rawZh: '他上楼来了。(Anh ấy lên lầu đây rồi - Người nói đang ở trên lầu).', zh: '他上楼来了。', pinyin: 'Tā shànglóu lái le.', vi: 'Anh ấy lên lầu đây rồi.' },
          { rawZh: '他回家去了。(Anh ấy về nhà rồi - Người nói không ở nhà anh ấy).', zh: '他回家去了。', pinyin: 'Tā huíjiā qù le.', vi: 'Anh ấy về nhà rồi.' },
          { rawZh: '他们进去了。(Họ vào trong đó rồi - Người nói đang ở ngoài).', zh: '他们进去了。', pinyin: 'Tāmen jìnqu le.', vi: 'Họ vào trong đó rồi.' },
          { rawZh: '你帮我拿来吧。(Bạn giúp tôi mang tới đây nhé).', zh: '你帮我拿来吧。', pinyin: 'Nǐ bāng wǒ ná lái ba.', vi: 'Bạn giúp tôi mang tới đây nhé.' }
        ],
        tables: [
          {
            title: 'Bảng Phối Hợp Động Từ Di Chuyển Với Bổ Ngữ Xu Hướng 来 / 去',
            headers: ['Động từ gốc', '+ 来 (Hướng về phía người nói)', '+ 去 (Ra xa phía người nói)'],
            rows: [
              ['进 (jìn - vào)', '进来 (jìnlái - Vào đây)', '进去 (jìnqu - Vào đó)'],
              ['出 (chū - ra)', '出来 (chūlái - Ra đây)', '出去 (chūqu - Ra đó)'],
              ['上 (shàng - lên)', '上来 (shànglái - Lên đây)', '上去 (shàngqu - Lên đó)'],
              ['下 (xià - xuống)', '下来 (xiàlái - Xuống đây)', '下去 (xiàqu - Xuống đó)'],
              ['回 (huí - về)', '回来 (huílái - Về đây)', '回去 (huíqu - Về đó)'],
              ['过 (guò - qua)', '过来 (guòlái - Qua đây)', '过去 (guòqu - Qua đó)']
            ]
          },
          {
            title: 'Bảng Động Từ Hành Động Kết Hợp Mang/Cầm Đi & Mang/Cầm Đến',
            headers: ['Động từ', 'Ý nghĩa', '+ 来 (Mang về phía tôi)', '+ 去 (Mang ra xa tôi)'],
            rows: [
              ['拿 (ná)', 'Cầm, lấy', '拿来 (ná lái - Mang tới đây)', '拿去 (ná qù - Mang đi chỗ khác)'],
              ['送 (sòng)', 'Tặng, đưa', '送来 (sòng lái - Mang đến/tặng đến)', '送去 (sòng qù - Đưa đi/gửi đi)'],
              ['买 (mǎi)', 'Mua', '买来 (mǎi lái - Mua mang về)', '买去 (mǎi qù - Mua mang đi)'],
              ['开 (kāi)', 'Lái (xe)', '开来 (kāi lái - Lái tới đây)', '开去 (kāi qù - Lái đi chỗ khác)'],
              ['跑 (pǎo)', 'Chạy', '跑来 (pǎo lái - Chạy tới đây)', '跑去 (pǎo qù - Chạy đi chỗ khác)']
            ]
          }
        ],
        exercises: null
      },
      {
        id: 'hsk2_b5_g2',
        num: 2,
        title: 'Cấu trúc cố định “都……了” (Nhấn mạnh mức độ / thời gian)',
        explanation: 'Cấu trúc “都……了” dùng để nhấn mạnh sự việc hoặc thời gian đã đạt đến một mức độ cao hoặc trạng thái muộn, thường mang sắc thái giục giã, nhắc nhở hoặc phàn nàn ("Đã... rồi mà...").',
        formula: '都 + [Thời gian / Số lượng / Động từ / Tính từ] + 了',
        note: 'Khác với "已经", "都" mang ngữ khí cảm thán và nhấn mạnh cảm xúc của người nói nhiều hơn.',
        examples: [
          { rawZh: '都八点了，你还不起床吗？ (Đã 8 giờ rồi, bạn vẫn chưa dậy à?)', zh: '都八点了，你还不起床吗？', pinyin: 'Dōu bā diǎn le, nǐ hái bù qǐchuáng ma?', vi: 'Đã 8 giờ rồi, bạn vẫn chưa dậy à?' },
          { rawZh: '我都去过北京了，不想再去了。 (Tôi đã từng đi Bắc Kinh rồi, không muốn đi nữa đâu.)', zh: '我都去过北京了，不想再去了。', pinyin: 'Wǒ dōu qù guo Běijīng le, bù xiǎng zài qù le.', vi: 'Tôi đã từng đi Bắc Kinh rồi, không muốn đi nữa đâu.' }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 6,
    lessonKey: 'Bài 6',
    lessonTitleZh: '小雪，生日快乐！',
    lessonTitleFull: 'Bài 6: 小雪，生日快乐！',
    grammarPoints: [
      {
        id: 'hsk2_b6_g1',
        num: 1,
        title: 'Hình thức lặp lại của Tính từ (AA, AABB)',
        explanation: 'Lặp lại tính từ dùng để tăng cường mức độ miêu tả, làm cho câu văn sinh động, tạo cảm giác thân mật, đáng yêu hoặc nhấn mạnh vẻ đẹp, hình dáng, màu sắc.',
        formula: '1. Đơn âm tiết: AA (thường thêm 的: AA的)\n2. Song âm tiết: AABB (AABB的)',
        note: '1. Thường thêm "的" phía sau khi làm vị ngữ hoặc định ngữ.\n2. Phía trước tính từ lặp lại KHÔNG dùng các phó từ chỉ mức độ như 很, 非常, 太.\n3. Không dùng trong câu phủ định.',
        examples: [
          { rawZh: '他的眼睛大大的，看起来非常漂亮。 (Đôi mắt của cô ấy to tròn, trông vô cùng xinh đẹp.)', zh: '他的眼睛大大的，看起来非常漂亮。', pinyin: 'Tā de yǎnjing dàdà de, kàn qǐlái fēicháng piàoliang.', vi: 'Đôi mắt của cô ấy to tròn, trông vô cùng xinh đẹp.' },
          { rawZh: '那家商场里的衣服都漂漂亮亮的。 (Quần áo trong trung tâm thương mại đó đều đẹp đẽ, xinh xắn.)', zh: '那家商场里的衣服都漂漂亮亮的。', pinyin: 'Nà jiā shāngchǎng lǐ de yīfu dōu piàopiaoliangliang de.', vi: 'Quần áo trong trung tâm thương mại đó đều đẹp đẽ, xinh xắn.' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b6_g2',
        num: 2,
        title: 'Cụm từ cố định “什么的” (Vân vân, v.v.)',
        explanation: 'Cụm từ “什么的” (shénme de) đứng ở cuối phần liệt kê để thay thế cho "vân vân", "v.v." hoặc "những thứ tương tự như thế" trong khẩu ngữ giao tiếp hàng ngày.',
        formula: '[Danh từ A], [Danh từ B] + 什么的',
        note: 'Chỉ dùng trong khẩu ngữ thân mật, giúp câu nói ngắn gọn mà không cần liệt kê hết toàn bộ các món đồ.',
        examples: [
          { rawZh: '我买衣服、裤子什么的。 (Tôi mua quần áo, quần dài vân vân.)', zh: '我买衣服、裤子什么的。', pinyin: 'Wǒ mǎi yīfu, kùzi shénme de.', vi: 'Tôi mua quần áo, quần dài vân vân.' },
          { rawZh: '我们要喝茶、奶茶什么的。 (Chúng tôi muốn uống trà, trà sữa vân vân.)', zh: '我们要喝茶、奶茶什么的。', pinyin: 'Wǒmen yào hē chá, nǎichá shénme de.', vi: 'Chúng tôi muốn uống trà, trà sữa vân vân.' },
          { rawZh: '周末我常常看电影、看书什么的。 (Cuối tuần tôi thường xem phim, đọc sách vân vân.)', zh: '周末我常常看电影、看书什么的。', pinyin: 'Zhōumò wǒ chángcháng kàn diànyǐng, kànshū shénme de.', vi: 'Cuối tuần tôi thường xem phim, đọc sách vân vân.' },
          { rawZh: '桌子上有电脑、杯子、书、笔什么的。 (Trên bàn có máy tính, cốc, sách, bút vân vân.)', zh: '桌子上有电脑、杯子、书、笔什么的。', pinyin: 'Zhuōzi shàng yǒu diànnǎo, bēizi, shū, bǐ shénme de.', vi: 'Trên bàn có máy tính, cốc, sách, bút vân vân.' },
          { rawZh: '你拿来一些水、面包和苹果什么的。 (Bạn mang đến một ít nước, bánh mì và táo vân vân.)', zh: '你拿来一些水、面包和苹果什么的。', pinyin: 'Nǐ ná lái yìxiē shuǐ, miànbāo hé píngguǒ shénme de.', vi: 'Bạn mang đến một ít nước, bánh mì và táo vân vân.' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b6_g3',
        num: 3,
        title: 'Trợ từ kết cấu “地” (Nối trạng ngữ với động từ)',
        explanation: 'Trợ từ “地” (de) dùng để nối thành phần trạng ngữ (thường là tính từ hoặc cụm tính từ miêu tả cách thức/tâm trạng) với động từ đứng sau, biểu thị hành động diễn ra như thế nào.',
        formula: '[Tính từ / Trạng từ / Cụm từ miêu tả cách thức] + 地 + Động từ',
        note: 'MẸO PHÂN BIỆT 3 CHỮ "DE" QUAN TRỌNG NHẤT TIẾNG TRUNG:\n- 的 (de): Đứng trước DANH TỪ (Định ngữ + 的 + Danh từ, ví dụ: 我的书).\n- 得 (de): Đứng sau ĐỘNG TỪ chỉ mức độ/kết quả (Động từ + 得 + Tính từ, ví dụ: 说得很好).\n- 地 (de): Đứng trước ĐỘNG TỪ chỉ cách thức hành động (Tính từ + 地 + Động từ, ví dụ: 高兴地学).',
        examples: [
          { rawZh: '高高兴兴地去玩。 (Vui vẻ đi chơi.)', zh: '高高兴兴地去玩。', pinyin: 'Gāogāoxìngxìng de qù wán.', vi: 'Vui vẻ đi chơi.' },
          { rawZh: '快快地走。 (Đi thật nhanh.)', zh: '快快地走。', pinyin: 'Kuàikuài de zǒu.', vi: 'Đi thật nhanh.' },
          { rawZh: '好好地学习。 (Học tập thật tốt.)', zh: '好好地学习。', pinyin: 'Hǎohāo de xuéxí.', vi: 'Học tập thật tốt.' },
          { rawZh: '慢慢地看书。 (Từ từ đọc sách.)', zh: '慢慢地看书。', pinyin: 'Mànmàn de kànshū.', vi: 'Từ từ đọc sách.' }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 7,
    lessonKey: 'Bài 7',
    lessonTitleZh: '他篮球打得很好',
    lessonTitleFull: 'Bài 7: 他篮球打得很好',
    grammarPoints: [
      {
        id: 'hsk2_b7_g1',
        num: 1,
        title: 'Câu ghép rút gọn “一……就……” (Vừa... liền...)',
        explanation: 'Dùng để diễn tả hai hành động xảy ra liên tiếp nhau (hành động 2 diễn ra ngay lập tức sau hành động 1), hoặc hành động 1 là điều kiện/nguyên nhân dẫn đến kết quả ở hành động 2 ("Vừa... liền...", "Ngay khi... thì...").',
        formula: 'Chủ ngữ + 一 + Hành động 1 + 就 + Hành động 2\n(Nếu 2 chủ ngữ khác nhau: S1 + 一 + V1, S2 + 就 + V2)',
        note: 'Khi có 2 chủ ngữ khác nhau, S1 đứng trước 一, S2 đứng trước 就.',
        examples: [
          { rawZh: '我一回家就吃饭。 (Tôi vừa về đến nhà là ăn cơm ngay.)', zh: '我一回家就吃饭。', pinyin: 'Wǒ yì huíjiā jiù chīfàn.', vi: 'Tôi vừa về đến nhà là ăn cơm ngay.' },
          { rawZh: '他一来就问我。 (Anh ấy vừa đến là hỏi tôi ngay.)', zh: '他一来就问我。', pinyin: 'Tā yì lái jiù wèn wǒ.', vi: 'Anh ấy vừa đến là hỏi tôi ngay.' },
          { rawZh: '天一下雨，我就不出门。 (Trời vừa mưa là tôi liền không ra ngoài.)', zh: '天一下雨，我就不出门。', pinyin: 'Tiān yí xià yǔ, wǒ jiù bù chūmén.', vi: 'Trời vừa mưa là tôi liền không ra ngoài.' },
          { rawZh: '你一看见老师，就告诉他。 (Bạn vừa nhìn thấy thầy giáo thì báo cho thầy ngay nhé.)', zh: '你一看见老师，就告诉他。', pinyin: 'Nǐ yí kànjiàn lǎoshī, jiù gàosu tā.', vi: 'Bạn vừa nhìn thấy thầy giáo thì báo cho thầy ngay nhé.' },
          { rawZh: '一到星期六，阴天中就跟同学去打篮球。 (Cứ đến thứ Bảy là Âm Thiên Trung lại cùng bạn học đi đánh bóng rổ.)', zh: '一到星期六，阴天中就跟同学去打篮球。', pinyin: 'Yí dào xīngqīliù, Yīn Tiānzhōng jiù gēn tóngxué qù dǎ lánqiú.', vi: 'Cứ đến thứ Bảy là Âm Thiên Trung lại cùng bạn học đi đánh bóng rổ.' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b7_g2',
        num: 2,
        title: 'Bổ ngữ trạng thái / Bổ ngữ mức độ với “得”',
        explanation: 'Bổ ngữ trạng thái đứng sau động từ (kết nối bởi “得”) để đánh giá, nhận xét hành động được thực hiện như thế nào (tốt/xấu, nhanh/chậm, cao/thấp).',
        formula: 'Khẳng định: V + 得 + Tính từ\nPhủ định: V + 得 + 不 + Tính từ\nNghi vấn: V + 得 + Tính từ + 吗? (hoặc: V + 得 + Adj + 不 + Adj? / V + 得 + 怎么样?)',
        note: 'QUY TẮC LẶP LẠI ĐỘNG TỪ KHI CÓ TÂN NGỮ (O):\nKhi câu có tân ngữ, bắt buộc phải lặp lại động từ trước "得":\nS + V + O + V + 得 + Tính từ (hoặc: S + O + V + 得 + Tính từ)\nVí dụ:\n- Sai: 他说汉语得很好。\n- Đúng: 他说汉语说得很好。 (Anh ấy nói tiếng Trung nói rất tốt).',
        examples: [
          { rawZh: '他跑得还可以。 (Anh ấy chạy cũng được.)', zh: '他跑得还可以。', pinyin: 'Tā pǎo de hái kěyǐ.', vi: 'Anh ấy chạy cũng được.' },
          { rawZh: '他们玩得很高兴。 (Họ chơi rất vui vẻ.)', zh: '他们玩得很高兴。', pinyin: 'Tāmen wán de hěn gāoxìng.', vi: 'Họ chơi rất vui vẻ.' },
          { rawZh: '我游泳游得不快。 (Tôi bơi không nhanh - Lặp lại động từ 游).', zh: '我游泳游得不快。', pinyin: 'Wǒ yóuyǒng yóu de bú kuài.', vi: 'Tôi bơi không nhanh.' },
          { rawZh: '你篮球打得怎么样？ (Bạn chơi bóng rổ như thế nào?)', zh: '你篮球打得怎么样？', pinyin: 'Nǐ lánqiú dǎ de zěnmeyàng?', vi: 'Bạn chơi bóng rổ như thế nào?' },
          { rawZh: '白天月写汉字写得很好看。 (Bạch Thiên Nguyệt viết chữ Hán viết rất đẹp.)', zh: '白天月写汉字写得很好看。', pinyin: 'Bái Tiānyuè xiě hànzì xiě de hěn hǎokàn.', vi: 'Bạch Thiên Nguyệt viết chữ Hán viết rất đẹp.' }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 8,
    lessonKey: 'Bài 8',
    lessonTitleZh: '虽然你忘了，但是我记得',
    lessonTitleFull: 'Bài 8: 虽然你忘了，但是我记得',
    grammarPoints: [
      {
        id: 'hsk2_b8_g1',
        num: 1,
        title: 'Câu so sánh cơ bản với “比” (1)',
        explanation: 'Dùng để so sánh tính chất, đặc điểm giữa hai người hoặc hai sự vật (A hơn B về mặt nào đó).',
        formula: 'A + 比 + B + Tính từ\n(Nhấn mạnh hơn: A + 比 + B + 还 / 更 + Tính từ)',
        note: 'LƯU Ý CỰC KỲ QUAN TRỌNG:\nTuyệt đối KHÔNG dùng các phó từ chỉ mức độ (như 很, 非常, 真, 太) trước tính từ trong câu chữ 比. (Sai: 他比我很高 -> Đúng: 他比我高).\nNếu muốn nhấn mạnh mức độ cao hơn, ta dùng "更" (càng) hoặc "还" (vẫn/còn).',
        examples: [
          { rawZh: '他比我高。 (Anh ấy cao hơn tôi.)', zh: '他比我高。', pinyin: 'Tā bǐ wǒ gāo.', vi: 'Anh ấy cao hơn tôi.' },
          { rawZh: '今天比昨天还热。 (Hôm nay còn nóng hơn cả hôm qua.)', zh: '今天比昨天还热。', pinyin: 'Jīntiān bǐ zuótiān hái rè.', vi: 'Hôm qua còn nóng hơn hôm nay.' },
          { rawZh: '这个手机比那个手机更便宜。 (Điện thoại này càng rẻ hơn điện thoại kia.)', zh: '这个手机比那个手机更便宜。', pinyin: 'Zhè gè shǒujī bǐ nà ge shǒujī gèng piányi.', vi: 'Điện thoại này rẻ hơn điện thoại kia.' },
          { rawZh: '这本书比那本书更好看。 (Quyển sách này hay hơn quyển sách kia.)', zh: '这本书比那本书更好看。', pinyin: 'Zhè běn shū bǐ nà běn shū gèng hǎokàn.', vi: 'Quyển sách này hay hơn quyển sách kia.' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b8_g2',
        num: 2,
        title: 'Câu ghép chuyển ý “虽然……，但是……” (Tuy... nhưng...)',
        explanation: 'Biểu thị quan hệ nhượng bộ và chuyển tiếp ý, diễn tả sự đối lập, tương phản giữa hai vế câu ("Mặc dù / Tuy rằng... nhưng mà...").',
        formula: '虽然 + [Vế 1 (Nhượng bộ)], (但是 / 可是) + [Vế 2 (Chuyển ý)]',
        note: 'Trong giao tiếp linh hoạt, có thể dùng cả cặp "虽然...但是..." hoặc lược bỏ một trong hai từ.',
        examples: [
          { rawZh: '虽然今天下雨，但是我们想去商场。 (Mặc dù hôm nay trời mưa, nhưng chúng tôi vẫn muốn đi trung tâm thương mại.)', zh: '虽然今天下雨，但是我们想去商场。', pinyin: 'Suīrán jīntiān xià yǔ, dànshì wǒmen xiǎng qù shāngchǎng.', vi: 'Mặc dù hôm nay trời mưa, nhưng chúng tôi vẫn muốn đi trung tâm thương mại.' },
          { rawZh: '虽然这件衣服很贵，可是很好看。 (Mặc dù chiếc áo này đắt, nhưng rất đẹp.)', zh: '虽然这件衣服很贵，可是很好看。', pinyin: 'Suīrán zhè jiàn yīfu hěn guì, kěshì hěn hǎokàn.', vi: 'Mặc dù chiếc áo này đắt, nhưng rất đẹp.' },
          { rawZh: '虽然他很累，但他还是想去学习。 (Mặc dù anh ấy rất mệt, nhưng anh ấy vẫn muốn đi học.)', zh: '虽然他很累，但他还是想去学习。', pinyin: 'Suīrán tā hěn lèi, dàn tā háishì xiǎng qù xuéxí.', vi: 'Mặc dù anh ấy rất mệt, nhưng anh ấy vẫn muốn đi học.' },
          { rawZh: '虽然学中文很难，但是很有意思。 (Mặc dù học tiếng Trung rất khó, nhưng rất thú vị.)', zh: '虽然学中文很难，但是很有意思。', pinyin: 'Suīrán xué Zhōngwén hěn nán, dànshì hěn yǒu yìsi.', vi: 'Mặc dù học tiếng Trung rất khó, nhưng rất thú vị.' },
          { rawZh: '虽然他没有车，但是他常常去旅游。 (Mặc dù anh ấy không có xe, nhưng anh ấy thường xuyên đi du lịch.)', zh: '虽然他没有车，但是他常常去旅游。', pinyin: 'Suīrán tā méiyǒu chē, dànshì tā chángcháng qù lǚyóu.', vi: 'Mặc dù anh ấy không có xe, nhưng anh ấy thường xuyên đi du lịch.' }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 9,
    lessonKey: 'Bài 9',
    lessonTitleZh: '我去买杯奶茶',
    lessonTitleFull: 'Bài 9: 我去买杯奶茶',
    grammarPoints: [
      {
        id: 'hsk2_b9_g1',
        num: 1,
        title: 'Câu so sánh không bằng với “没有” (2)',
        explanation: 'Dùng để so sánh sự vật A không đạt đến mức độ của sự vật B ("A không [tính từ] bằng B").',
        formula: 'Khẳng định: A + 没有 + B + (这么 / 那么) + Tính từ\nNghi vấn: A + 有没有 + B + (这么/那么) + Tính từ? (hoặc: A + 有 + B + 那么 + Tính từ + 吗?)',
        note: 'Có thể thêm "这么" (mức này) hoặc "那么" (mức kia) trước tính từ để nhấn mạnh mức độ so sánh.',
        examples: [
          { rawZh: '我没有你高。 (Tôi không cao bằng bạn.)', zh: '我没有你高。', pinyin: 'Wǒ méiyǒu nǐ gāo.', vi: 'Tôi không cao bằng bạn.' },
          { rawZh: '他的书没有我的书那么多。 (Sách của anh ấy không nhiều bằng sách của tôi.)', zh: '他的书没有我的书那么多。', pinyin: 'Tā de shū méiyǒu wǒ de shū nàme duō.', vi: 'Sách của anh ấy không nhiều bằng sách của tôi.' },
          { rawZh: '这儿的苹果没有那儿的那么便宜。 (Táo ở đây không rẻ bằng táo ở đằng kia.)', zh: '这儿的苹果没有那儿的那么便宜。', pinyin: 'Zhèr de píngguǒ méiyǒu nàr de nàme piányi.', vi: 'Táo ở đây không rẻ bằng táo ở đằng kia.' },
          { rawZh: '他没有我想的那么忙。 (Anh ấy không bận như tôi nghĩ.)', zh: '他没有我想的那么忙。', pinyin: 'Tā méiyǒu wǒ xiǎng de nàme máng.', vi: 'Anh ấy không bận như tôi nghĩ.' },
          { rawZh: '你有他那么高吗？ (Bạn có cao bằng anh ấy không?)', zh: '你有他那么高吗？', pinyin: 'Nǐ yǒu tā nàme gāo ma?', vi: 'Bạn có cao bằng anh ấy không?' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b9_g2',
        num: 2,
        title: 'Giới từ “离” (Khoảng cách không gian & Thời gian)',
        explanation: 'Giới từ “离” (lí - cách) dùng để diễn tả khoảng cách địa lý giữa hai địa điểm hoặc khoảng cách thời gian từ hiện tại tới một mốc sự kiện trong tương lai.',
        formula: '1. Khoảng cách địa điểm: A + 离 + B + (很) + [远 / 近 / Số đo km]\n2. Khoảng cách thời gian: 离 + [Mốc sự kiện] + 还有 + [Khoảng thời gian]',
        note: null,
        examples: [
          { rawZh: '我家离学校很远。 (Nhà tôi cách trường rất xa.)', zh: '我家离学校很远。', pinyin: 'Wǒ jiā lí xuéxiào hěn yuǎn.', vi: 'Nhà tôi cách trường rất xa.' },
          { rawZh: '这儿离火车站五公里。 (Chỗ này cách ga tàu 5 cây số.)', zh: '这儿离火车站五公里。', pinyin: 'Zhèr lí huǒchēzhàn wǔ gōnglǐ.', vi: 'Chỗ này cách ga tàu 5 cây số.' },
          { rawZh: '学校离车站不远。 (Trường học cách trạm xe không xa.)', zh: '学校离车站不远。', pinyin: 'Xuéxiào lí chēzhàn bù yuǎn.', vi: 'Trường học cách trạm xe không xa.' },
          { rawZh: '离春节还有三天。 (Còn 3 ngày nữa là đến Tết.)', zh: '离春节还有三天。', pinyin: 'Lí Chūnjié hái yǒu sān tiān.', vi: 'Còn 3 ngày nữa là đến Tết.' },
          { rawZh: '离考试还有两个小时。 (Còn 2 tiếng nữa là đến giờ thi.)', zh: '离考试还有两个小时。', pinyin: 'Lí kǎoshì hái yǒu liǎng gè xiǎoshí.', vi: 'Còn 2 tiếng nữa là đến giờ thi.' },
          { rawZh: '离下课还有十分钟。 (Còn 10 phút nữa là tan học.)', zh: '离下课还有十分钟。', pinyin: 'Lí xiàkè hái yǒu shí fēnzhōng.', vi: 'Còn 10 phút nữa là tan học.' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b9_g3',
        num: 3,
        title: 'Bổ ngữ thời lượng (1)',
        explanation: 'Bổ ngữ thời lượng đứng sau động từ để biểu thị khoảng thời gian kéo dài của một hành động (ví dụ: làm trong bao lâu, ngủ mấy tiếng, học mấy năm).',
        formula: '1. Không có tân ngữ: S + V + (了) + Khoảng thời gian\n2. Có tân ngữ: S + V + O + V + (了) + Khoảng thời gian\n3. Động từ ly hợp (V+O): S + V + (了) + Khoảng thời gian + O',
        note: '1. Với động từ có tân ngữ thường, bắt buộc phải lặp lại động từ: 我看书看了一个小时。\n2. Với từ ly hợp (睡觉, 打电话, 散步), chèn khoảng thời gian vào giữa: 睡了八个小时觉, 打了一个小时电话.',
        examples: [
          { rawZh: '他睡了八个小时。 (Anh ấy đã ngủ 8 tiếng đồng hồ.)', zh: '他睡了八个小时。', pinyin: 'Tā shuì le bā gè xiǎoshí.', vi: 'Anh ấy đã ngủ 8 tiếng đồng hồ.' },
          { rawZh: '我们等了三十分钟。 (Chúng tôi đã đợi 30 phút rồi.)', zh: '我们等了三十分钟。', pinyin: 'Wǒmen děng le sānshí fēnzhōng.', vi: 'Chúng tôi đã đợi 30 phút rồi.' },
          { rawZh: '我看书看了两个小时。 (Tôi đọc sách được 2 tiếng - Lặp lại động từ 看).', zh: '我看书看了两个小时。', pinyin: 'Wǒ kànshū kàn le liǎng gè xiǎoshí.', vi: 'Tôi đọc sách được 2 tiếng.' },
          { rawZh: '他学汉语学了三年。 (Anh ấy học tiếng Hán được 3 năm.)', zh: '他学汉语学了三年。', pinyin: 'Tā xué Hànyǔ xué le sān nián.', vi: 'Anh ấy học tiếng Hán được 3 năm.' },
          { rawZh: '他打了一个小时电话。 (Anh ấy gọi điện thoại được 1 tiếng - Từ ly hợp 打电话).', zh: '他打了一个小时电话。', pinyin: 'Tā dǎ le yí gè xiǎoshí diànhuà.', vi: 'Anh ấy gọi điện thoại được 1 tiếng.' },
          { rawZh: '我们散了半个小时步。 (Chúng tôi đi dạo được nửa tiếng.)', zh: '我们散了半个小时步。', pinyin: 'Wǒmen sàn le bàn gè xiǎoshí bù.', vi: 'Chúng tôi đi dạo được nửa tiếng.' }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 10,
    lessonKey: 'Bài 10',
    lessonTitleZh: '就要考试了',
    lessonTitleFull: 'Bài 10: 就要考试了',
    grammarPoints: [
      {
        id: 'hsk2_b10_g1',
        num: 1,
        title: 'Câu có cụm Chủ - Vị làm vị ngữ',
        explanation: 'Là câu mà vị ngữ chính là một cụm chủ - vị (bao gồm một chủ ngữ nhỏ S2 và một vị ngữ nhỏ V/Adj2). Cấu trúc này thường dùng để miêu tả đặc điểm, trạng thái hoặc sức khỏe của chủ ngữ lớn S1.',
        formula: 'S1 (Chủ ngữ lớn) + [S2 (Chủ ngữ nhỏ) + V/Adj (Vị ngữ nhỏ)]',
        note: null,
        examples: [
          { rawZh: '他身体很好。 (Anh ấy sức khỏe rất tốt - S1: 他, S2: 身体, Vị ngữ: 很好).', zh: '他身体很好。', pinyin: 'Tā shēntǐ hěn hǎo.', vi: 'Anh ấy sức khỏe rất tốt.' },
          { rawZh: '今天天气很冷。 (Hôm nay thời tiết rất lạnh.)', zh: '今天天气很冷。', pinyin: 'Jīntiān tiānqì hěn lěng.', vi: 'Hôm nay thời tiết rất lạnh.' },
          { rawZh: '这个电影我很喜欢。 (Bộ phim này tôi rất thích.)', zh: '这个电影我很喜欢。', pinyin: 'Zhè gè diànyǐng wǒ hěn xǐhuan.', vi: 'Bộ phim này tôi rất thích.' },
          { rawZh: '这件事情我不清楚。 (Việc này tôi không rõ.)', zh: '这件事情我不清楚。', pinyin: 'Zhè jiàn shìqing wǒ bù qīngchu.', vi: 'Việc này tôi không rõ.' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b10_g2',
        num: 2,
        title: 'Câu hỏi lựa chọn với “还是”',
        explanation: 'Dùng để đưa ra hai (hoặc nhiều) phương án để người nghe lựa chọn một trong số đó ("... hay là...?").',
        formula: 'A + 还是 + B?',
        note: 'LƯU Ý QUAN TRỌNG: Vì bản thân từ "还是" đã mang nghĩa nghi vấn lựa chọn, nên tuyệt đối KHÔNG thêm trợ từ "吗" ở cuối câu.',
        examples: [
          { rawZh: '你喝茶还是喝咖啡？ (Bạn uống trà hay uống cà phê?)', zh: '你喝茶还是喝咖啡？', pinyin: 'Nǐ hē chá háishì hē kāfēi?', vi: 'Bạn uống trà hay uống cà phê?' },
          { rawZh: '你想坐公交车还是打车？ (Bạn muốn đi xe buýt hay gọi taxi?)', zh: '你想坐公交车还是打车？', pinyin: 'Nǐ xiǎng zuò gōngjiāochē háishì dǎchē?', vi: 'Bạn muốn đi xe buýt hay gọi taxi?' },
          { rawZh: '他是老师还是学生？ (Anh ấy là giáo viên hay học sinh?)', zh: '他是老师还是学生？', pinyin: 'Tā shì lǎoshī háishì xuésheng?', vi: 'Anh ấy là giáo viên hay học sinh?' },
          { rawZh: '你今天去还是明天去？ (Bạn đi hôm nay hay đi ngày mai?)', zh: '你今天去还是明天去？', pinyin: 'Nǐ jīntiān qù háishì míngtiān qù?', vi: 'Bạn đi hôm nay hay đi ngày mai?' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b10_g3',
        num: 3,
        title: 'Cấu trúc sắp sửa xảy ra “要 / 快 / 快要 / 就要……了”',
        explanation: 'Dùng để diễn tả một hành động hoặc trạng thái sắp sửa xảy ra trong tương lai gần ("Sắp... rồi").',
        formula: 'S + [要 / 快 / 快要 / 就要] + [Động từ / Tính từ] + 了',
        note: 'MẸO PHÂN BIỆT RẤT QUAN TRỌNG TRONG ĐỀ THI HSK:\n1. Có trạng ngữ thời gian cụ thể (như 明天, 下周, 8点, 5分钟以后): BẮT BUỘC dùng 就要……了 (KHÔNG dùng 快 / 快要).\n2. Không có thời gian cụ thể (chỉ nhìn hiện tượng đoán sắp xảy ra): Dùng 快 / 快要 / 要……了.',
        examples: [
          { rawZh: '电影要开始了。 (Phim sắp bắt đầu rồi.)', zh: '电影要开始了。', pinyin: 'Diànyǐng yào kāishǐ le.', vi: 'Phim sắp bắt đầu rồi.' },
          { rawZh: '我妹妹要上大学了。 (Em gái tôi sắp vào đại học rồi.)', zh: '我妹妹要上大学了。', pinyin: 'Wǒ mèimei yào shàng dàxué le.', vi: 'Em gái tôi sắp vào đại học rồi.' },
          { rawZh: '快下雨了。 (Sắp mưa rồi.)', zh: '快下雨了。', pinyin: 'Kuài xià yǔ le.', vi: 'Sắp mưa rồi.' },
          { rawZh: '快要考试了。 (Sắp thi rồi.)', zh: '快要考试了。', pinyin: 'Kuàiyào kǎoshì le.', vi: 'Sắp thi rồi.' },
          { rawZh: '下周就要考试了。 (Tuần sau là đến kỳ thi rồi - Có mốc thời gian 下周 -> Dùng 就要).', zh: '下周就要考试了。', pinyin: 'Xià zhōu jiù yào kǎoshì le.', vi: 'Tuần sau là đến kỳ thi rồi.' },
          { rawZh: '五分钟以后就要出发了。 (5 phút nữa là xuất phát rồi - Có mốc 5 phút -> Dùng 就要).', zh: '五分钟以后就要出发了。', pinyin: 'Wǔ fēnzhōng yǐhòu jiù yào chūfā le.', vi: '5 phút nữa là xuất phát rồi.' },
          { rawZh: '八点就要上课了，快点儿！ (8 giờ là vào lớp rồi, nhanh lên!)', zh: '八点就要上课了，快点儿！', pinyin: 'Bā diǎn jiù yào shàngkè le, kuài diǎnr!', vi: '8 giờ là vào lớp rồi, nhanh lên!' }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 11,
    lessonKey: 'Bài 11',
    lessonTitleZh: '我最喜欢吃中国菜',
    lessonTitleFull: 'Bài 11: 我最喜欢吃中国菜',
    grammarPoints: [
      {
        id: 'hsk2_b11_g1',
        num: 1,
        title: 'Trợ từ động thái “着” (Biểu thị sự duy trì của trạng thái)',
        explanation: 'Trợ từ “着” (zhe) đặt ngay sau động từ để biểu thị trạng thái đang tiếp diễn hoặc sự duy trì của tư thế, trạng thái đồ vật/con người.',
        formula: 'Khẳng định: S + V + 着 + (O)\nPhủ định: S + 没(有) + V + 着 + (O)\nNghi vấn: S + V + 着 + (O) + 没有 / 吗?',
        note: 'PHÂN BIỆT "在" VÀ "着":\n- 在 + V: Diễn tả HÀNH ĐỘNG đang diễn ra (đang làm gì, ví dụ: 他在穿衣服 - Anh ấy đang mặc áo vào người).\n- V + 着: Diễn tả TRẠNG THÁI đang duy trì (đang mang/mặc trên người, ví dụ: 他穿着红色的衣服 - Anh ấy đang mặc chiếc áo màu đỏ).',
        examples: [
          { rawZh: '桌子上放着一本书。 (Trên bàn đang đặt một quyển sách.)', zh: '桌子上放着一本书。', pinyin: 'Zhuōzi shàng fàng zhe yì běn shū.', vi: 'Trên bàn đang đặt một quyển sách.' },
          { rawZh: '他穿着红色的衣服。 (Anh ấy đang mặc chiếc áo màu đỏ.)', zh: '他穿着红色的衣服。', pinyin: 'Tā chuān zhe hóngsè de yīfu.', vi: 'Anh ấy đang mặc chiếc áo màu đỏ.' },
          { rawZh: '你穿着鞋吗？ (Bạn đang đi giày à?)', zh: '你穿着鞋吗？', pinyin: 'Nǐ chuān zhe xié ma?', vi: 'Bạn đang đi giày à?' },
          { rawZh: '桌子上没放着书。 (Trên bàn không đặt sách.)', zh: '桌子上没放着书。', pinyin: 'Zhuōzi shàng méi fàng zhe shū.', vi: 'Trên bàn không đặt sách.' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b11_g2',
        num: 2,
        title: 'Phó từ chỉ mức độ cao nhất “最” (So sánh bậc nhất)',
        explanation: 'Phó từ “最” (zuì) dùng để biểu thị mức độ cao nhất (so sánh bậc nhất), dịch là "nhất". Thường đứng trước tính từ hoặc các động từ chỉ cảm xúc, tâm lý.',
        formula: 'S + 最 + [Tính từ / Động từ tâm lý: 喜欢, 想, 爱, 希望...]',
        note: 'Vì "最" đã là mức độ cao nhất rồi, nên phía trước không dùng thêm 很, 非常, 真.',
        examples: [
          { rawZh: '我最喜欢吃北京烤鸭。 (Tôi thích ăn vịt quay Bắc Kinh nhất.)', zh: '我最喜欢吃北京烤鸭。', pinyin: 'Wǒ zuì xǐhuan chī Běijīng kǎoyā.', vi: 'Tôi thích ăn vịt quay Bắc Kinh nhất.' },
          { rawZh: '她是班里最漂亮的学⽣。 (Cô ấy là học sinh xinh nhất lớp.)', zh: '她是班里最漂亮的学⽣。', pinyin: 'Tā shì bān lǐ zuì piàoliang de xuésheng.', vi: 'Cô ấy là học sinh xinh nhất lớp.' },
          { rawZh: '这件衣服最便宜。 (Chiếc áo này là rẻ nhất.)', zh: '这件衣服最便宜。', pinyin: 'Zhè jiàn yīfu zuì piányi.', vi: 'Chiếc áo này là rẻ nhất.' },
          { rawZh: '我最想去西安旅游。 (Tôi muốn đi Tây An du lịch nhất.)', zh: '我最想去西安旅游。', pinyin: 'Wǒ zuì xiǎng qù Xī\'ān lǚyóu.', vi: 'Tôi muốn đi Tây An du lịch nhất.' },
          { rawZh: '今天天气最好。 (Thời tiết hôm nay là đẹp nhất.)', zh: '今天天气最好。', pinyin: 'Jīntiān tiānqì zuì hǎo.', vi: 'Thời tiết hôm nay là đẹp nhất.' }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 12,
    lessonKey: 'Bài 12',
    lessonTitleZh: '这里比北京冷多了',
    lessonTitleFull: 'Bài 12: 这里比北京冷多了',
    grammarPoints: [
      {
        id: 'hsk2_b12_g1',
        num: 1,
        title: 'Câu so sánh chênh lệch lớn với “多了 / 得多” (3)',
        explanation: 'Trong câu so sánh dùng “比”, đặt “多了” (duō le) hoặc “得多” (de duō) ở sau tính từ để nhấn mạnh sự chênh lệch, khác biệt rất lớn về mức độ giữa hai đối tượng A và B ("... hơn nhiều", "... hơn hẳn").',
        formula: 'A + 比 + B + Tính từ + 多了 / 得多',
        note: 'Tuyệt đối KHÔNG dùng các phó từ 很, 非常 trước tính từ khi đã có 多了 hoặc 得多.',
        examples: [
          { rawZh: '今天比昨天热多了。 (Hôm nay nóng hơn hôm qua nhiều.)', zh: '今天比昨天热多了。', pinyin: 'Jīntiān bǐ zuótiān rè duō le.', vi: 'Hôm nay nóng hơn hôm qua nhiều.' },
          { rawZh: '他比我高得多。 (Anh ấy cao hơn tôi rất nhiều.)', zh: '他比我高得多。', pinyin: 'Tā bǐ wǒ gāo de duō.', vi: 'Anh ấy cao hơn tôi rất nhiều.' },
          { rawZh: '这件衣服比那件便宜多了。 (Chiếc áo này rẻ hơn chiếc kia nhiều.)', zh: '这件衣服比那件便宜多了。', pinyin: 'Zhè jiàn yīfu bǐ nà jiàn piányi duō le.', vi: 'Chiếc áo này rẻ hơn chiếc kia nhiều.' },
          { rawZh: '你的汉语比我好得多。 (Tiếng Trung của bạn tốt hơn của tôi rất nhiều.)', zh: '你的汉语比我好得多。', pinyin: 'Nǐ de Hànyǔ bǐ wǒ hǎo de duō.', vi: 'Tiếng Trung của bạn tốt hơn của tôi rất nhiều.' },
          { rawZh: '这儿的风景比那儿漂亮多了。 (Phong cảnh ở đây đẹp hơn ở đó nhiều.)', zh: '这儿的风景比那儿漂亮多了。', pinyin: 'Zhèr de fēngjǐng bǐ nàr piàoliang duō le.', vi: 'Phong cảnh ở đây đẹp hơn ở đó nhiều.' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b12_g2',
        num: 2,
        title: 'Câu so sánh kết hợp Bổ ngữ trạng thái (4)',
        explanation: 'Dùng để so sánh mức độ thực hiện hành động giữa hai đối tượng A và B (ai làm việc gì nhanh hơn, tốt hơn, đẹp hơn).',
        formula: 'Cách 1: S1 + 比 + S2 + V + 得 + Tính từ\nCách 2: S1 + V + 得 + 比 + S2 + Tính từ\nKhi có tân ngữ: S1 + (V) + O + V + 得 + 比 + S2 + Tính từ',
        note: 'Cả hai cách diễn đạt "S1 比 S2 V得 Adj" và "S1 V得比 S2 Adj" đều hoàn toàn chính xác trong tiếng Trung.',
        examples: [
          { rawZh: '他比我跑得快。 (Anh ấy chạy nhanh hơn tôi.)', zh: '他比我跑得快。', pinyin: 'Tā bǐ wǒ pǎo de kuài.', vi: 'Anh ấy chạy nhanh hơn tôi.' },
          { rawZh: '他跑得比我快。 (Anh ấy chạy nhanh hơn tôi.)', zh: '他跑得比我快。', pinyin: 'Tā pǎo de bǐ wǒ kuài.', vi: 'Anh ấy chạy nhanh hơn tôi.' },
          { rawZh: '他汉语说得比我好。 (Anh ấy nói tiếng Trung tốt hơn tôi.)', zh: '他汉语说得比我好。', pinyin: 'Tā Hànyǔ shuō de bǐ wǒ hǎo.', vi: 'Anh ấy nói tiếng Trung tốt hơn tôi.' },
          { rawZh: '他写汉字写得比我漂亮。 (Anh ấy viết chữ Hán đẹp hơn tôi.)', zh: '他写汉字写得比我漂亮。', pinyin: 'Tā xiě hànzì xiě de bǐ wǒ piàoliang.', vi: 'Anh ấy viết chữ Hán đẹp hơn tôi.' },
          { rawZh: '我说汉语说得比他流利。 (Tôi nói tiếng Trung lưu loát hơn anh ấy.)', zh: '我说汉语说得比他流利。', pinyin: 'Wǒ shuō Hànyǔ shuō de bǐ tā liúlì.', vi: 'Tôi nói tiếng Trung lưu loát hơn anh ấy.' },
          { rawZh: '他打篮球打得比我好。 (Anh ấy chơi bóng rổ giỏi hơn tôi.)', zh: '他打篮球打得比我好。', pinyin: 'Tā dǎ lánqiú dǎ de bǐ wǒ hǎo.', vi: 'Anh ấy chơi bóng rổ giỏi hơn tôi.' }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 13,
    lessonKey: 'Bài 13',
    lessonTitleZh: '我们爱上中文课',
    lessonTitleFull: 'Bài 13: 我们爱上中文课',
    grammarPoints: [
      {
        id: 'hsk2_b13_g1',
        num: 1,
        title: 'Câu mang hai tân ngữ (Động từ song tân ngữ)',
        explanation: 'Một số động từ có thể mang đồng thời hai tân ngữ: Tân ngữ gián tiếp chỉ người (đứng trước) và Tân ngữ trực tiếp chỉ vật/sự việc (đứng sau).',
        formula: 'S + V (给, 问, 教, 送, 告诉, 卖, 买, 拿) + O1 (Chỉ người) + O2 (Chỉ vật)',
        note: 'Các động từ mang 2 tân ngữ phổ biến nhất: 给 (cho), 问 (hỏi), 教 (dạy), 送 (tặng), 告诉 (bảo/nói cho biết), 卖 (bán cho).',
        examples: [
          { rawZh: '请给我一杯茶。 (Cho tôi một cốc trà.)', zh: '请给我一杯茶。', pinyin: 'Qǐng gěi wǒ yì bēi chá.', vi: 'Cho tôi một cốc trà.' },
          { rawZh: '他教我们汉语。 (Anh ấy dạy chúng tôi tiếng Hán.)', zh: '他教我们汉语。', pinyin: 'Tā jiāo wǒmen Hànyǔ.', vi: 'Anh ấy dạy chúng tôi tiếng Hán.' },
          { rawZh: '他卖给我一个手机。 (Anh ấy bán cho tôi một chiếc điện thoại.)', zh: '他卖给我一个手机。', pinyin: 'Tā mài gěi wǒ yí gè shǒujī.', vi: 'Anh ấy bán cho tôi một chiếc điện thoại.' },
          { rawZh: '妈妈买给我一件衣服。 (Mẹ mua cho tôi một chiếc áo.)', zh: '妈妈买给我一件衣服。', pinyin: 'Māma mǎi gěi wǒ yí jiàn yīfu.', vi: 'Mẹ mua cho tôi một chiếc áo.' },
          { rawZh: '你拿给我那个杯子。 (Bạn lấy cho tôi cái cốc đó.)', zh: '你拿给我那个杯子。', pinyin: 'Nǐ ná gěi wǒ nà ge bēizi.', vi: 'Bạn lấy cho tôi cái cốc đó.' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b13_g2',
        num: 2,
        title: 'Câu so sánh chỉ rõ lượng chênh lệch cụ thể (5)',
        explanation: 'Dùng để so sánh và chỉ rõ số lượng chênh lệch chính xác giữa hai đối tượng A và B (ví dụ: lớn hơn 3 tuổi, rẻ hơn 20 tệ, đắt hơn 100 tệ).',
        formula: 'A + 比 + B + Tính từ + [Cụm từ chỉ số lượng: Số từ + Lượng từ + Danh từ]',
        note: 'Khác với so sánh chung chung (多了), ở đây chúng ta đưa ra con số định lượng cụ thể.',
        examples: [
          { rawZh: '他比我大三岁。 (Anh ấy lớn hơn tôi 3 tuổi.)', zh: '他比我大三岁。', pinyin: 'Tā bǐ wǒ dà sān suì.', vi: 'Anh ấy lớn hơn tôi 3 tuổi.' },
          { rawZh: '这双鞋比那双便宜二十块。 (Đôi giày này rẻ hơn đôi kia 20 tệ.)', zh: '这双鞋比那双便宜二十块。', pinyin: 'Zhè shuāng xié bǐ nà shuāng piányi èrshí kuài.', vi: 'Đôi giày này rẻ hơn đôi kia 20 tệ.' },
          { rawZh: '这件衣服比那件贵一百块。 (Cái áo này đắt hơn cái kia 100 tệ.)', zh: '这件衣服比那件贵一百块。', pinyin: 'Zhè jiàn yīfu bǐ nà jiàn guì yìbǎi kuài.', vi: 'Cái áo này đắt hơn cái kia 100 tệ.' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b13_g3',
        num: 3,
        title: 'Câu so sánh mức độ chênh lệch nhỏ “一点儿 / 一些” (6)',
        explanation: 'Dùng để biểu thị mức độ chênh lệch rất nhỏ, không đáng kể giữa hai đối tượng A và B ("... hơn một chút / hơn một ít").',
        formula: 'A + 比 + B + Tính từ + 一点儿 / 一些',
        note: 'Cấu trúc này đối lập với "多了 / 得多" (chênh lệch lớn). Trong khẩu ngữ "一点儿" được dùng phổ biến nhất.',
        examples: [
          { rawZh: '这件衣服比那件便宜一点儿。 (Chiếc áo này rẻ hơn chiếc kia một chút.)', zh: '这件衣服比那件便宜一点儿。', pinyin: 'Zhè jiàn yīfu bǐ nà jiàn piányi yìdiǎnr.', vi: 'Chiếc áo này rẻ hơn chiếc kia một chút.' },
          { rawZh: '他比我高一些。 (Anh ấy cao hơn tôi một chút.)', zh: '他比我高一些。', pinyin: 'Tā bǐ wǒ gāo yìxiē.', vi: 'Anh ấy cao hơn tôi một chút.' },
          { rawZh: '这个苹果比那个大一点儿。 (Quả táo này to hơn quả kia một chút.)', zh: '这个苹果比那个大一点儿。', pinyin: 'Zhè gè píngguǒ bǐ nà ge dà yìdiǎnr.', vi: 'Quả táo này to hơn quả kia một chút.' },
          { rawZh: '今天的作业比昨天的多一些。 (Bài tập hôm nay nhiều hơn hôm qua một chút.)', zh: '今天的作业比昨天的多一些。', pinyin: 'Jīntiān de zuòyè bǐ zuótiān de duō yìxiē.', vi: 'Bài tập hôm nay nhiều hơn hôm qua một chút.' },
          { rawZh: '这个汉语词比那个难一点儿。 (Từ tiếng Trung này khó hơn từ kia một chút.)', zh: '这个汉语词比那个难一点儿。', pinyin: 'Zhè gè Hànyǔ cí bǐ nà ge nán yìdiǎnr.', vi: 'Từ tiếng Trung này khó hơn từ kia một chút.' }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 14,
    lessonKey: 'Bài 14',
    lessonTitleZh: '一个人过年多没意思啊',
    lessonTitleFull: 'Bài 14: 一个人过年多没意思啊',
    grammarPoints: [
      {
        id: 'hsk2_b14_g1',
        num: 1,
        title: 'Câu tồn hiện trạng thái với “着” (2)',
        explanation: 'Dùng để miêu tả sự tồn tại của người hoặc vật ở một địa điểm cụ thể, nhấn mạnh vào tư thế, trạng thái đang được duy trì liên tục (đang treo, đang đặt, đang ngồi, đang đứng...).',
        formula: '[Từ chỉ nơi chốn / Địa điểm] + V + 着 + [Cụm số lượng/Lượng từ] + Danh từ',
        note: 'PHÂN BIỆT CÂU TỒN HIỆN "有" VÀ "着":\n- Câu với 有: Chỉ đơn thuần thông báo sự tồn tại (Có vật gì ở đó, ví dụ: 房间里有一个人 - Trong phòng có một người).\n- Câu với 着: Miêu tả sinh động trạng thái/tư thế của vật/người đó (ví dụ: 房间里坐着一个人 - Trong phòng đang ngồi một người).',
        examples: [
          { rawZh: '墙上挂着一张画。 (Trên tường đang treo một bức tranh.)', zh: '墙上挂着一张画。', pinyin: 'Qiáng shàng guà zhe yì zhāng huà.', vi: 'Trên tường đang treo một bức tranh.' },
          { rawZh: '桌子上放着一个杯子。 (Trên bàn đang đặt một cái cốc.)', zh: '桌子上放着一个杯子。', pinyin: 'Zhuōzi shàng fàng zhe yí gè bēizi.', vi: 'Trên bàn đang đặt một cái cốc.' },
          { rawZh: '门口站着一个人。 (Ở cửa đang đứng một người.)', zh: '门口站着一个人。', pinyin: 'Ménkǒu zhàn zhe yí gè rén.', vi: 'Ở cửa đang đứng một người.' },
          { rawZh: '椅子上坐着一个孩子。 (Trên ghế đang ngồi một đứa bé.)', zh: '椅子上坐着一个孩子。', pinyin: 'Yǐzi shàng zuò zhe yí gè háizi.', vi: 'Trên ghế đang ngồi một đứa bé.' },
          { rawZh: '黑板上写着几个字。 (Trên bảng đang viết mấy chữ.)', zh: '黑板上写着几个字。', pinyin: 'Hēibǎn shàng xiě zhe jǐ gè zì.', vi: 'Trên bảng đang viết mấy chữ.' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b14_g2',
        num: 2,
        title: 'Phó từ chỉ mức độ “多” trong câu cảm thán',
        explanation: 'Dùng trong câu cảm thán để biểu thị sự ngạc nhiên, khen ngợi hoặc nhấn mạnh mức độ cao của tính chất ("Thật là...", "... biết bao!", "... quá đi thôi!").',
        formula: '多 + [Tính từ] + (啊 / 啦 / 呀) !',
        note: 'Cấu trúc này thường kết hợp với trợ từ ngữ khí ở cuối câu (啊, 啦, 呀) để tăng sắc thái biểu cảm.',
        examples: [
          { rawZh: '今天天气多好啊！ (Thời tiết hôm nay đẹp quá!)', zh: '今天天气多好啊！', pinyin: 'Jīntiān tiānqì duō hǎo a!', vi: 'Thời tiết hôm nay đẹp quá!' },
          { rawZh: '这儿的苹果多便宜啊！ (Táo ở đây rẻ thật đấy!)', zh: '这儿的苹果多便宜啊！', pinyin: 'Zhèr de píngguǒ duō piányi a!', vi: 'Táo ở đây rẻ thật đấy!' },
          { rawZh: '你的字写得多漂亮啊！ (Chữ của bạn viết đẹp quá!)', zh: '你的字写得多漂亮啊！', pinyin: 'Nǐ de zì xiě de duō piàoliang a!', vi: 'Chữ của bạn viết đẹp quá!' },
          { rawZh: '他多聪明啊！ (Anh ấy thật là thông minh!)', zh: '他多聪明啊！', pinyin: 'Tā duō cōngmíng a!', vi: 'Anh ấy thật là thông minh!' },
          { rawZh: '这个孩子多可爱呀！ (Đứa bé này đáng yêu quá!)', zh: '这个孩子多可爱呀！', pinyin: 'Zhè gè háizi duō kě\'ài ya!', vi: 'Đứa bé này đáng yêu quá!' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b14_g3',
        num: 3,
        title: 'Bổ ngữ xu hướng kép (V + 进/出/上/下/回/过/起 + 来/去)',
        explanation: 'Bổ ngữ xu hướng kép được tạo thành bởi: Động từ + [进/出/上/下/回/过/起] + [来/去]. Nó giúp xác định rõ hướng đi chi tiết của hành động di chuyển kết hợp với vị trí mốc của người nói.',
        formula: '1. Động từ + Xu hướng + 来 / 去\n2. Tân ngữ là ĐỊA ĐIỂM (Bắt buộc ở giữa): V + [进/出/上/下/回/过] + Địa điểm + 来/去\n3. Tân ngữ là ĐỒ VẬT: V + [进/出/上/下/回/过] + (Tân ngữ) + 来/去 + (Tân ngữ)',
        note: 'TẠI SAO BỔ NGỮ XU HƯỚNG KÉP LẠI BẮT BUỘC TRONG TIẾNG TRUNG?\n1. Định vị không gian: Người nghe luôn cần biết hành động đang hướng về phía mình (来) hay ra xa mình (去).\n2. Hoàn thiện nghĩa động từ: Cung cấp đủ bộ 3 thông tin: Cách thức (chạy) + Hướng đích (vào trong) + Phương vị (về phía tôi).\n3. Tránh mơ hồ ngữ nghĩa.',
        examples: [
          { rawZh: '他跑进教室来了。 (Anh ấy chạy vào lớp học rồi - Người nói đang ở trong lớp).', zh: '他跑进教室来了。', pinyin: 'Tā pǎo jìn jiàoshì lái le.', vi: 'Anh ấy chạy vào lớp học rồi.' },
          { rawZh: '快跑进教室去！ (Mau chạy vào lớp học đi! - Người nói đang ở ngoài hành lang).', zh: '快跑进教室去！', pinyin: 'Kuài pǎo jìn jiàoshì qù!', vi: 'Mau chạy vào lớp học đi!' },
          { rawZh: '他拿出了一支笔来。 (Anh ấy lấy ra một chiếc bút).', zh: '他拿出了一支笔来。', pinyin: 'Tā ná chū le yì zhī bǐ lái.', vi: 'Anh ấy lấy ra một chiếc bút.' },
          { rawZh: '他站起来了。 (Anh ấy đứng dậy rồi - Bắt đầu tư thế đứng).', zh: '他站起来了。', pinyin: 'Tā zhàn qǐlái le.', vi: 'Anh ấy đứng dậy rồi.' },
          { rawZh: '大家都笑起来了。 (Mọi người bắt đầu cười rộ lên - Nhấn mạnh sự bắt đầu của hành động).', zh: '大家都笑起来了。', pinyin: 'Dàjiā dōu xiào qǐlái le.', vi: 'Mọi người bắt đầu cười rộ lên.' }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 15,
    lessonKey: 'Bài 15',
    lessonTitleZh: '我想再去一次中国',
    lessonTitleFull: 'Bài 15: 我想再去一次中国',
    grammarPoints: [
      {
        id: 'hsk2_b15_g1',
        num: 1,
        title: 'Bổ ngữ động lượng “次” (Số lần thực hiện hành động)',
        explanation: 'Bổ ngữ động lượng dùng để biểu thị số lần thực hiện của một hành động. Từ thông dụng nhất là “次” (cì - lần, chuyến).',
        formula: '1. Không có tân ngữ: S + V + (过/了) + Số từ + 次\n2. Tân ngữ là ĐỒ VẬT: S + V + (过/了) + Số từ + 次 + O (Vật)\n3. Tân ngữ là ĐẠI TỪ CHỈ NGƯỜI (Bắt buộc sau tân ngữ): S + V + (过/了) + O (Người) + Số từ + 次\n4. Tân ngữ là ĐỊA ĐIỂM (Linh hoạt): Đặt trước hoặc sau "Số từ + 次" đều đúng',
        note: 'Quy tắc vị trí tân ngữ với bổ ngữ động lượng:\n- Tân ngữ chỉ người: Bắt buộc đặt TRƯỚC "次" (ví dụ: 我找过他一次).\n- Tân ngữ chỉ vật: Thường đặt SAU "次" (ví dụ: 我看过两次电影).\n- Tân ngữ chỉ nơi chốn: Đặt trước hay sau "次" đều chuẩn (我去过两次北京 / 我去过北京两次).',
        examples: [
          { rawZh: '我去过两次。 (Tôi đã đi qua hai lần.)', zh: '我去过两次。', pinyin: 'Wǒ qù guo liǎng cì.', vi: 'Tôi đã đi qua hai lần.' },
          { rawZh: '他看了一次。 (Anh ấy xem một lần.)', zh: '他看了一次。', pinyin: 'Tā kàn le yí cì.', vi: 'Anh ấy xem một lần.' },
          { rawZh: '我们听了三次。 (Chúng tôi nghe ba lần.)', zh: '我们听了三次。', pinyin: 'Wǒmen tīng le sān cì.', vi: 'Chúng tôi nghe ba lần.' },
          { rawZh: '我看过两次电影。 (Tôi đã xem phim hai lần - Tân ngữ là vật).', zh: '我看过两次电影。', pinyin: 'Wǒ kàn guo liǎng cì diànyǐng.', vi: 'Tôi đã xem phim hai lần.' },
          { rawZh: '他读了三次书。 (Anh ấy đọc sách ba lần.)', zh: '他读了三次书。', pinyin: 'Tā dú le sān cì shū.', vi: 'Anh ấy đọc sách ba lần.' },
          { rawZh: '我找过他一次。 (Tôi đã tìm anh ấy một lần - Tân ngữ chỉ người 他 đứng trước 一次).', zh: '我找过他一次。', pinyin: 'Wǒ zhǎo guo tā yí cì.', vi: 'Tôi đã tìm anh ấy một lần.' },
          { rawZh: '老师叫过你两次。 (Thầy giáo đã gọi bạn hai lần.)', zh: '老师叫过你两次。', pinyin: 'Lǎoshī jiào guo nǐ liǎng cì.', vi: 'Thầy giáo đã gọi bạn hai lần.' },
          { rawZh: '我去过北京两次。 / 我去过两次北京。 (Tôi đã đi Bắc Kinh hai lần - Tân ngữ địa điểm).', zh: '我去过北京两次。', pinyin: 'Wǒ qù guo Běijīng liǎng cì.', vi: 'Tôi đã đi Bắc Kinh hai lần.' },
          { rawZh: '他来过我家三次。 (Anh ấy đã đến nhà tôi ba lần.)', zh: '他来过我家三次。', pinyin: 'Tā lái guo wǒ jiā sān cì.', vi: 'Anh ấy đã đến nhà tôi ba lần.' }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk2_b15_g2',
        num: 2,
        title: 'Câu chữ “有” chỉ số lượng đạt đến mức độ (S + 有 + Số lượng + 了)',
        explanation: 'Câu chữ “有” kết hợp với cụm từ chỉ số lượng và trợ từ “了” ở cuối câu dùng để nhấn mạnh rằng một người hoặc sự vật đã đạt đến một mức độ, số lượng, độ tuổi hoặc trọng lượng cụ thể ("Đã được...", "Đã nặng đến...", "Đã có đến...").',
        formula: 'S + 有 + [Cụm từ chỉ số lượng / Lượng từ + Danh từ] + 了',
        note: 'Biểu thị sự phát triển hoặc số lượng đã chạm tới một ngưỡng mốc đáng kể.',
        examples: [
          { rawZh: '她妹妹有三岁了。 (Em gái cô ấy đã được 3 tuổi rồi - Đạt đến ngưỡng 3 tuổi).', zh: '她妹妹有三岁了。', pinyin: 'Tā mèimei yǒu sān suì le.', vi: 'Em gái cô ấy đã được 3 tuổi rồi.' },
          { rawZh: '我现在有五百块了。 (Bây giờ tôi đã có 500 tệ rồi).', zh: '我现在有五百块了。', pinyin: 'Wǒ xiànzài yǒu wǔbǎi kuài le.', vi: 'Bây giờ tôi đã có 500 tệ rồi.' },
          { rawZh: '他书包里有十本书了。 (Trong cặp sách của anh ấy đã có 10 quyển sách rồi).', zh: '他书包里有十本书了。', pinyin: 'Tā shūbāo lǐ yǒu shí běn shū le.', vi: 'Trong cặp sách của anh ấy đã có 10 quyển sách rồi.' },
          { rawZh: '这个西瓜有十斤了。 (Quả dưa hấu này đã nặng đến 10 cân rồi).', zh: '这个西瓜有十斤了。', pinyin: 'Zhè gè xīguā yǒu shí jīn le.', vi: 'Quả dưa hấu này đã nặng đến 10 cân rồi.' },
          { rawZh: '那棵树有两米高了。 (Cái cây kia đã cao đến 2 mét rồi).', zh: '那棵树有两米高了。', pinyin: 'Nà kē shù yǒu liǎng mǐ gāo le.', vi: 'Cái cây kia đã cao đến 2 mét rồi.' }
        ],
        tables: null,
        exercises: null
      }
    ]
  }
];

// Write frontend/grammar_hsk2.js
const hsk2Path = path.join(workspaceDir, 'frontend', 'grammar_hsk2.js');
const hsk2Content = `export const HSK2_STRUCTURED_GRAMMAR = ${JSON.stringify(HSK2_STRUCTURED_GRAMMAR, null, 2)};\n\nif (typeof window !== 'undefined') {\n  window.HSK2_STRUCTURED_GRAMMAR = HSK2_STRUCTURED_GRAMMAR;\n}\n`;
fs.writeFileSync(hsk2Path, hsk2Content, 'utf-8');
console.log('Successfully written:', hsk2Path);

// Update frontend/grammar_structured.js
const structPath = path.join(workspaceDir, 'frontend', 'grammar_structured.js');
import(pathToFileURL(structPath).href).then(m => {
  const fullGrammar = m.FULL_STRUCTURED_GRAMMAR;
  
  let hsk2TotalPoints = 0;
  HSK2_STRUCTURED_GRAMMAR.forEach(l => hsk2TotalPoints += l.grammarPoints.length);

  fullGrammar.hsk2 = {
    level: 'HSK 2',
    title: 'Tổng Hợp Ngữ Pháp HSK 2 Chuẩn 3.0 (15 Bài Học Chi Tiết)',
    totalPoints: hsk2TotalPoints,
    lessons: HSK2_STRUCTURED_GRAMMAR
  };

  const structContent = `export const FULL_STRUCTURED_GRAMMAR = ${JSON.stringify(fullGrammar, null, 2)};\n\nif (typeof window !== 'undefined') {\n  window.FULL_STRUCTURED_GRAMMAR = FULL_STRUCTURED_GRAMMAR;\n}\n`;
  fs.writeFileSync(structPath, structContent, 'utf-8');
  console.log('Successfully updated:', structPath);

  // Update backend/hsk_grammar_structured.json
  const backendJsonPath = path.join(workspaceDir, 'backend', 'hsk_grammar_structured.json');
  fs.writeFileSync(backendJsonPath, JSON.stringify(fullGrammar, null, 2), 'utf-8');
  console.log('Successfully updated backend json:', backendJsonPath);

  console.log('\n================ SUMMARY ================');
  console.log(`HSK 2 has ${HSK2_STRUCTURED_GRAMMAR.length} lessons with ${hsk2TotalPoints} total grammar points.`);
}).catch(err => {
  console.error('Error updating structured grammar:', err);
});
