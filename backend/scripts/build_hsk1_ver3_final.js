import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceDir = path.resolve(__dirname, '../../');
const frontendDir = path.join(workspaceDir, 'frontend');
const backendDir = path.join(workspaceDir, 'backend');
const grammarJsonDir = path.join(backendDir, 'grammar_json');

// Full official HSK 1 3.0 VER3 Structured Grammar Dataset
const hsk1Lessons = [
  {
    lessonId: 1,
    lessonKey: 'Bài 1',
    lessonTitleZh: 'AI小语，你好！',
    lessonTitleFull: 'Bài 1: AI小语，你好！ (Chào hỏi trong tiếng Trung)',
    grammarPoints: [
      {
        id: 'hsk1_b1_g1',
        num: 1,
        title: 'Cách chào hỏi trong tiếng Trung',
        explanation: 'Trong tiếng Trung, câu chào hỏi cơ bản nhất được tạo thành bằng cách ghép đối tượng được chào với tính từ "好" (hǎo). Khi chào người lớn tuổi, cấp trên hoặc người cần bày tỏ sự tôn kính đặc biệt, ta dùng đại từ "您" (nín) thay cho "你" (nǐ).',
        formula: '[Đối tượng được chào] + 好 (hǎo)',
        note: 'Khi hai thanh 3 đi liền nhau (như 你 nǐ + 好 hǎo), thanh 3 thứ nhất sẽ biến điệu đọc thành thanh 2: /ní hǎo/.',
        examples: [
          {
            rawZh: '你好！ (Chào bạn!)',
            zh: '你好！',
            pinyin: 'Nǐ hǎo!',
            vi: 'Chào bạn! / Chào cậu!'
          },
          {
            rawZh: '您好！ (Chào ngài/ông/bà - kính trọng)',
            zh: '您好！',
            pinyin: 'Nín hǎo!',
            vi: 'Chào ngài / Chào ông / Chào bà (thể hiện sự tôn kính).'
          },
          {
            rawZh: '大家好！ (Chào mọi người!)',
            zh: '大家好！',
            pinyin: 'Dàjiā hǎo!',
            vi: 'Chào tất cả mọi người!'
          },
          {
            rawZh: '你们好！ (Chào các bạn!)',
            zh: '你们好！',
            pinyin: 'Nǐmen hǎo!',
            vi: 'Chào các bạn! / Chào mọi người!'
          },
          {
            rawZh: '老师好！ (Chào thầy/cô!)',
            zh: '老师好！',
            pinyin: 'Lǎoshī hǎo!',
            vi: 'Em chào thầy / Em chào cô giáo ạ!'
          }
        ],
        tables: [
          {
            title: 'Bảng tổng hợp các câu chào hỏi thông dụng (HSK 1)',
            headers: ['Chữ Hán', 'Phiên âm (Pinyin)', 'Ý nghĩa tiếng Việt', 'Đối tượng & Hoàn cảnh áp dụng'],
            rows: [
              ['你好', 'nǐ hǎo', 'Chào bạn / Chào cậu', 'Bạn bè, người ngang hàng hoặc nhỏ tuổi'],
              ['您好', 'nín hǎo', 'Chào ngài / ông / bà', 'Người lớn tuổi, thầy cô, đối tác, khách hàng'],
              ['大家好', 'dàjiā hǎo', 'Chào mọi người', 'Chào một nhóm đông người, hội trường'],
              ['你们好', 'nǐmen hǎo', 'Chào các bạn', 'Chào từ 2 người trở lên'],
              ['老师好', 'lǎoshī hǎo', 'Chào thầy / cô', 'Học sinh chào giáo viên']
            ]
          }
        ],
        exercises: [
          {
            type: 'Chọn đáp án đúng',
            prompt: 'Khi gặp thầy giáo vào buổi sáng, bạn nên nói câu nào lịch sự nhất?',
            options: ['A. 你好！', 'B. 老师好！ / 老师您好！', 'C. 大家好！'],
            answer: 'B. 老师好！ / 老师您好！'
          }
        ]
      }
    ]
  },
  {
    lessonId: 2,
    lessonKey: 'Bài 2',
    lessonTitleZh: '我叫李文',
    lessonTitleFull: 'Bài 2: 我叫李文 (Cấu trúc câu cơ bản & Trạng ngữ)',
    grammarPoints: [
      {
        id: 'hsk1_b2_g1',
        num: 1,
        title: 'Câu trần thuật cơ bản: Chủ ngữ + Động từ + Tân ngữ (S + V + O)',
        explanation: 'Đây là cấu trúc câu đơn giản và nền tảng nhất trong ngữ pháp tiếng Trung, hoàn toàn tương tự trật tự ngữ pháp trong tiếng Việt.',
        formula: 'Chủ ngữ (S) + Động từ (V) + Tân ngữ (O)',
        note: 'Động từ "叫" (jiào) vừa có nghĩa là "kêu, gọi", vừa có nghĩa là "tên là" khi theo sau là tên riêng.',
        examples: [
          {
            rawZh: '我爱你。(Wǒ ài nǐ.)',
            zh: '我爱你。',
            pinyin: 'Wǒ ài nǐ.',
            vi: 'Tôi yêu bạn / Anh yêu em.'
          },
          {
            rawZh: '他喝茶。(Tā hē chá.)',
            zh: '他喝茶。',
            pinyin: 'Tā hē chá.',
            vi: 'Anh ấy uống trà.'
          },
          {
            rawZh: '我叫李文。(Wǒ jiào Lǐ Wén.)',
            zh: '我叫李文。',
            pinyin: 'Wǒ jiào Lǐ Wén.',
            vi: 'Tôi tên là Lý Văn.'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b2_g2',
        num: 2,
        title: 'Trạng ngữ chỉ Thời gian và Địa điểm',
        explanation: 'Quy tắc vàng trong tiếng Trung: Trạng ngữ chỉ thời gian và trạng ngữ chỉ địa điểm LUÔN LUÔN đứng TRƯỚC động từ vị ngữ, KHÔNG BAO GIỜ được đặt ở cuối câu như tiếng Việt hay tiếng Anh.',
        formula: 'Thời gian + Chủ ngữ + (在 + Địa điểm) + Động từ + Tân ngữ\n(hoặc: Chủ ngữ + Thời gian + (在 + Địa điểm) + Động từ + Tân ngữ)',
        note: 'Thời gian có thể linh hoạt đứng trước hoặc ngay sau Chủ ngữ, nhưng phải luôn đứng trước Động từ.',
        examples: [
          {
            rawZh: '我昨天在学校学习。(Wǒ zuótiān zài xuéxiào xuéxí.)',
            zh: '我昨天在学校学习。',
            pinyin: 'Wǒ zuótiān zài xuéxiào xuéxí.',
            vi: 'Hôm qua tôi học ở trường.'
          },
          {
            rawZh: '老师今天在家里休息。(Lǎoshī jīntiān zài jiālǐ xiūxi.)',
            zh: '老师今天在家里休息。',
            pinyin: 'Lǎoshī jīntiān zài jiālǐ xiūxi.',
            vi: 'Hôm nay thầy giáo nghỉ ngơi ở nhà.'
          },
          {
            rawZh: '姐姐明天在北京工作。(Jiějie míngtiān zài Běijīng gōngzuò.)',
            zh: '姐姐明天在北京工作。',
            pinyin: 'Jiějie míngtiān zài Běijīng gōngzuò.',
            vi: 'Chị gái ngày mai làm việc ở Bắc Kinh.'
          }
        ],
        tables: null,
        exercises: [
          {
            type: 'Sắp xếp câu',
            prompt: 'Sắp xếp: 学习 / 在学校 / 我 / 今天',
            answer: '我今天在学校学习。 / 今天我在学校学习。'
          }
        ]
      },
      {
        id: 'hsk1_b2_g3',
        num: 3,
        title: 'Vị trí của phó từ trong câu (不, 很, 也...)',
        explanation: 'Các phó từ phủ định (不 bù), phó từ chỉ mức độ (很 hěn), hoặc phó từ liên kết (也 yě) luôn đứng TRƯỚC Động từ hoặc Tính từ mà chúng bổ nghĩa.',
        formula: 'Chủ ngữ + Phó từ (不 / 很 / 也) + Động từ / Tính từ',
        note: 'Khi có cả "也" và "不", "也" luôn đứng trước "不" (Ví dụ: 我也不去 - Tôi cũng không đi).',
        examples: [
          {
            rawZh: '他不喜⽵。(Tā bù xǐhuan.)',
            zh: '他不喜⽵。',
            pinyin: 'Tā bù xǐhuan.',
            vi: 'Anh ấy không thích.'
          },
          {
            rawZh: '苹果很好。(Píngguǒ hěn hǎo.)',
            zh: '苹果很好。',
            pinyin: 'Píngguǒ hěn hǎo.',
            vi: 'Táo rất ngon / rất tốt.'
          },
          {
            rawZh: '我也认识他。(Wǒ yě rènshi tā.)',
            zh: '我也认识他。',
            pinyin: 'Wǒ yě rènshi tā.',
            vi: 'Tôi cũng quen biết anh ấy.'
          }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 3,
    lessonKey: 'Bài 3',
    lessonTitleZh: '我是中国人',
    lessonTitleFull: 'Bài 3: 我是中国人 (Câu chữ 是, Trợ từ 的 & Câu hỏi 吗)',
    grammarPoints: [
      {
        id: 'hsk1_b3_g1',
        num: 1,
        title: 'Câu chữ “是” (Khẳng định & Phủ định “不是”)',
        explanation: 'Câu chữ "是" (shì) tương đương với từ "là" trong tiếng Việt, dùng để định danh người, sự vật, quốc tịch, nghề nghiệp. Hình thức phủ định là thêm "不" trước "是" tạo thành "不是" (bú shì).',
        formula: 'Khẳng định: Chủ ngữ + 是 + Tân ngữ\nPhủ định: Chủ ngữ + 不是 + Tân ngữ',
        note: 'Từ "不" (bù - thanh 4) khi đứng trước "是" (shì - thanh 4) sẽ biến điệu đọc thành thanh 2: /bú shì/.',
        examples: [
          {
            rawZh: '我是越南人。(Wǒ shì Yuènán rén.)',
            zh: '我是越南人。',
            pinyin: 'Wǒ shì Yuènán rén.',
            vi: 'Tôi là người Việt Nam.'
          },
          {
            rawZh: '我不是中国人。(Wǒ bú shì Zhōngguó rén.)',
            zh: '我不是中国人。',
            pinyin: 'Wǒ bú shì Zhōngguó rén.',
            vi: 'Tôi không phải là người Trung Quốc.'
          },
          {
            rawZh: '她是我的老师。(Tā shì wǒ de lǎoshī.)',
            zh: '她是我的老师。',
            pinyin: 'Tā shì wǒ de lǎoshī.',
            vi: 'Cô ấy là giáo viên của tôi.'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b3_g2',
        num: 2,
        title: 'Trợ từ kết cấu “的” (Biểu thị mối quan hệ sở hữu)',
        explanation: 'Trợ từ kết cấu "的" (de) đặt giữa Định ngữ (thành phần bổ nghĩa) và Trung tâm ngữ (đối tượng chính) để biểu thị quan hệ sở hữu (nghĩa là "của").',
        formula: 'Định ngữ (Chủ sở hữu) + 的 + Trung tâm ngữ (Vật/Người sở hữu)',
        note: 'Quy tắc lược bỏ "的": Khi định ngữ là đại từ nhân xưng (我, 你, 他...) và trung tâm ngữ là từ chỉ quan hệ thân thuộc (bố, mẹ, thầy cô, bạn bè), ta có thể lược bỏ "的" (Ví dụ: 我老师, 你同学, 我学生, 你妈妈).',
        examples: [
          {
            rawZh: '你的名字 (Nǐ de míngzi)',
            zh: '你的名字',
            pinyin: 'Nǐ de míngzi',
            vi: 'Tên của bạn'
          },
          {
            rawZh: '你的老师 (Nǐ de lǎoshī)',
            zh: '你的老师',
            pinyin: 'Nǐ de lǎoshī',
            vi: 'Giáo viên của bạn (có thể nói gọn: 你老师)'
          },
          {
            rawZh: '我的同学 (Wǒ de tóngxué)',
            zh: '我的同学',
            pinyin: 'Wǒ de tóngxué',
            vi: 'Bạn học của tôi (có thể nói gọn: 我同学)'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b3_g3',
        num: 3,
        title: 'Câu hỏi Có/Không sử dụng trợ từ ngữ khí “吗”',
        explanation: 'Trợ từ ngữ khí "吗" (ma) được đặt ở cuối một câu trần thuật để biến câu đó thành câu nghi vấn Yes/No (nghĩa là: "...phải không?", "...không?").',
        formula: 'Câu trần thuật (S + V + O) + 吗?',
        note: 'Khi trả lời, chỉ cần dùng trực tiếp động từ/tính từ (khẳng định) hoặc 不 + động từ/tính từ (phủ định).',
        examples: [
          {
            rawZh: '你是中国人吗？(Nǐ shì Zhōngguó rén ma?)',
            zh: '你是中国人吗？',
            pinyin: 'Nǐ shì Zhōngguó rén ma?',
            vi: 'Bạn là người Trung Quốc phải không?'
          },
          {
            rawZh: '你忙吗？(Nǐ máng ma?)',
            zh: '你忙吗？',
            pinyin: 'Nǐ máng ma?',
            vi: 'Bạn có bận không?'
          },
          {
            rawZh: '你想我吗？(Nǐ xiǎng wǒ ma?)',
            zh: '你想我吗？',
            pinyin: 'Nǐ xiǎng wǒ ma?',
            vi: 'Bạn có nhớ tôi không?'
          }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 4,
    lessonKey: 'Bài 4',
    lessonTitleZh: '我有两个孩子',
    lessonTitleFull: 'Bài 4: 我有两个孩子 (Câu chữ 有, Số đếm 0-10.000 & Danh lượng)',
    grammarPoints: [
      {
        id: 'hsk1_b4_g1',
        num: 1,
        title: 'Câu chữ “有” (Biểu thị sự sở hữu & Tồn tại)',
        explanation: 'Động từ "有" (yǒu) có nghĩa là "có", dùng để biểu thị sự sở hữu. Hình thức phủ định bắt buộc phải dùng "没有" (méiyǒu), tuyệt đối không được dùng "不有".',
        formula: 'Khẳng định: Chủ ngữ + 有 + Tân ngữ\nPhủ định: Chủ ngữ + 没有 + Tân ngữ\nNghi vấn: Chủ ngữ + 有 + Tân ngữ + 吗?',
        note: 'Trong khẩu ngữ, phủ định "没有" có thể nói tắt thành "没" (Ví dụ: 我没钱 - Tôi không có tiền).',
        examples: [
          {
            rawZh: '我有两个孩子。(Wǒ yǒu liǎng gè háizi.)',
            zh: '我有两个孩子。',
            pinyin: 'Wǒ yǒu liǎng gè háizi.',
            vi: 'Tôi có hai đứa con.'
          },
          {
            rawZh: '我没有姐姐。(Wǒ méiyǒu jiějie.)',
            zh: '我没有姐姐。',
            pinyin: 'Wǒ méiyǒu jiějie.',
            vi: 'Tôi không có chị gái.'
          },
          {
            rawZh: '你有手机吗？(Nǐ yǒu shǒujī ma?)',
            zh: '你有手机吗？',
            pinyin: 'Nǐ yǒu shǒujī ma?',
            vi: 'Bạn có điện thoại di động không?'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b4_g2',
        num: 2,
        title: 'Cách diễn đạt các con số (0 - 10.000) & Phân biệt 二 và 两',
        explanation: 'Trong tiếng Trung, các con số được diễn đạt theo hệ thập phân với các đơn vị: 十 (10), 百 (100), 千 (1.000), 万 (10.000).',
        formula: '[Hàng chục vạn] + 万 + [Hàng ngàn] + 千 + [Hàng trăm] + 百 + [Hàng chục] + 十 + [Đơn vị]',
        note: 'Quy tắc phân biệt 二 (èr) và 两 (liǎng):\n1. 二 (èr): Dùng cho số đếm (1, 2, 3), số thứ tự (第二), hàng chục (二十), phân số, số điện thoại, ngày tháng năm.\n2. 两 (liǎng): Dùng trước LƯỢNG TỪ (两个人, 两本书) và các hàng ngàn, vạn (两千, 两万).\n3. Hàng trăm: Cả 二百 và 两百 đều được chấp nhận.',
        examples: [
          {
            rawZh: '一百 (100)',
            zh: '一百',
            pinyin: 'yì bǎi',
            vi: '100 (Một trăm)'
          },
          {
            rawZh: '二百零五 (205)',
            zh: '二百零五',
            pinyin: 'èrbǎi líng wǔ',
            vi: '205 (Hai trăm lẻ năm)'
          },
          {
            rawZh: '四百一十 (410)',
            zh: '四百一十',
            pinyin: 'sìbǎi yīshí',
            vi: '410 (Bốn trăm mười)'
          },
          {
            rawZh: '三千零八 (3008)',
            zh: '三千零八',
            pinyin: 'sānqiān líng bā',
            vi: '3008 (Ba ngàn không trăm lẻ tám)'
          },
          {
            rawZh: '一万 (10000)',
            zh: '一万',
            pinyin: 'yí wàn',
            vi: '10.000 (Mười ngàn / Một vạn)'
          }
        ],
        tables: [
          {
            title: 'Bảng cách đọc và viết số từ 0 - 99',
            headers: ['Chữ Hán & Pinyin', 'Số', 'Chữ Hán & Pinyin', 'Số'],
            rows: [
              ['零 (líng)', '0', '十 (shí)', '10'],
              ['一 (yī)', '1', '十一 (shíyī)', '11'],
              ['二 (èr)', '2', '二十 (èrshí)', '20'],
              ['三 (sān)', '3', '二十一 (èrshíyī)', '21'],
              ['四 (sì)', '4', '三十 (sānshí)', '30'],
              ['五 (wǔ)', '5', '四十 (sìshí)', '40'],
              ['六 (liù)', '6', '五十 (wǔshí)', '50'],
              ['七 (qī)', '7', '六十 (liùshí)', '60'],
              ['八 (bā)', '8', '七十 (qīshí)', '70'],
              ['九 (jiǔ)', '9', '八十 (bāshí)', '80'],
              ['...', '...', '九十九 (jiǔshíjiǔ)', '99']
            ]
          },
          {
            title: 'Bảng phân cấp hàng đơn vị số lớn từ 100 - 10,000',
            headers: ['Hàng Chục Ngàn (万 wàn)', 'Hàng Ngàn (千 qiān)', 'Hàng Trăm (百 bǎi)', 'Hàng Chục (十 shí)', 'Đơn Vị'],
            rows: [
              ['10,000: 一万 (yí wàn)', '1,000: 一千 (yì qiān)', '100: 一百 (yì bǎi)', '10: 十 (shí)', '1: 一 (yī)'],
              ['20,000: 两万 (liǎng wàn)', '3,008: 三千零八', '205: 二百零五', '410: 四百一十', '222: 二百二十二']
            ]
          }
        ],
        exercises: null
      },
      {
        id: 'hsk1_b4_g3',
        num: 3,
        title: 'Trợ từ ngữ khí “呢” (1) - Dùng để hỏi ngược lại',
        explanation: 'Trợ từ "呢" (ne) đặt sau danh từ hoặc đại từ để hỏi ngược lại về một chủ đề/tình huống đã được nhắc đến ở câu trước (tương đương "Còn... thì sao?").',
        formula: '[Đối tượng / Sự vật] + 呢?',
        note: 'Cấu trúc này giúp tránh lặp lại toàn bộ câu hỏi dài phía trước.',
        examples: [
          {
            rawZh: '我是老师，你呢？(Wǒ shì lǎoshī, nǐ ne?)',
            zh: '我是老师，你呢？',
            pinyin: 'Wǒ shì lǎoshī, nǐ ne?',
            vi: 'Tôi là giáo viên, còn bạn thì sao?'
          },
          {
            rawZh: '我是越南人，你呢？(Wǒ shì Yuènán rén, nǐ ne?)',
            zh: '我是越南人，你呢？',
            pinyin: 'Wǒ shì Yuènán rén, nǐ ne?',
            vi: 'Tôi là người Việt Nam, còn bạn thì sao?'
          },
          {
            rawZh: '我很好，你呢？(Wǒ hěn hǎo, nǐ ne?)',
            zh: '我很好，你呢？',
            pinyin: 'Wǒ hěn hǎo, nǐ ne?',
            vi: 'Tôi rất khỏe, còn bạn thì sao?'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b4_g4',
        num: 4,
        title: 'Cấu trúc Danh Lượng: Số từ + Lượng từ + Danh từ',
        explanation: 'Nguyên tắc bắt buộc trong tiếng Trung: Khi chỉ số lượng của sự vật, giữa Số từ và Danh từ BẮT BUỘC phải có Lượng từ, không được bỏ qua lượng từ.',
        formula: 'Số từ + Lượng từ + Danh từ',
        note: 'Mỗi danh từ thường có một lượng từ chuyên dụng đi kèm. Khi chưa rõ lượng từ riêng của một vật, có thể dùng lượng từ thông dụng nhất là "个" (gè).',
        examples: [
          {
            rawZh: '三个人 (sān gè rén)',
            zh: '三个人',
            pinyin: 'sān gè rén',
            vi: 'Ba người (Lượng từ: 个)'
          },
          {
            rawZh: '一本书 (yì běn shū)',
            zh: '一本书',
            pinyin: 'yì běn shū',
            vi: 'Một quyển sách (Lượng từ: 本)'
          },
          {
            rawZh: '四个学生 (sì gè xuésheng)',
            zh: '四个学生',
            pinyin: 'sì gè xuésheng',
            vi: 'Bốn học sinh (Lượng từ: 个)'
          }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 5,
    lessonKey: 'Bài 5',
    lessonTitleZh: '今天我休息',
    lessonTitleFull: 'Bài 5: 今天我休息 (Thời gian Ngày Tháng Năm Thứ, Câu vị ngữ danh từ, Động từ năng nguyện 会)',
    grammarPoints: [
      {
        id: 'hsk1_b5_g1',
        num: 1,
        title: 'Cách diễn đạt Thời gian (1): Năm - Tháng - Ngày - Thứ',
        explanation: 'Tiếng Trung diễn đạt thời gian theo quy luật tư duy từ LỚN đến BÉ: Năm (年 nián) -> Tháng (月 yuè) -> Ngày (日 rì / 号 hào) -> Thứ (星期 xīngqī). Năm được đọc lần lượt từng chữ số một.',
        formula: '[Năm] 年 + [Tháng] 月 + [Ngày] 日/号 + [Thứ] 星期',
        note: 'Trong văn viết dùng "日" (rì), trong khẩu ngữ thường ngày hay dùng "号" (hào).',
        examples: [
          {
            rawZh: '2026年8月2日，星期日。(èr líng èr liù nián bā yuè èr rì, xīngqī rì)',
            zh: '2026年8月2日，星期日。',
            pinyin: 'èr líng èr liù nián bā yuè èr rì, xīngqī rì',
            vi: 'Chủ nhật, ngày 2 tháng 8 năm 2026.'
          },
          {
            rawZh: '5月15日，星期二。(wǔ yuè shíwǔ rì, xīngqī èr)',
            zh: '5月15日，星期二。',
            pinyin: 'wǔ yuè shíwǔ rì, xīngqī èr',
            vi: 'Thứ 3, ngày 15 tháng 5.'
          }
        ],
        tables: [
          {
            title: 'Bảng 12 Tháng trong năm (月 yuè)',
            headers: ['Tháng', 'Chữ Hán & Pinyin', 'Tháng', 'Chữ Hán & Pinyin'],
            rows: [
              ['Tháng 1', '一月 (yī yuè)', 'Tháng 7', '七月 (qī yuè)'],
              ['Tháng 2', '二月 (èr yuè)', 'Tháng 8', '八月 (bā yuè)'],
              ['Tháng 3', '三月 (sān yuè)', 'Tháng 9', '九月 (jiǔ yuè)'],
              ['Tháng 4', '四月 (sì yuè)', 'Tháng 10', '十月 (shí yuè)'],
              ['Tháng 5', '五月 (wǔ yuè)', 'Tháng 11', '十一月 (shí yī yuè)'],
              ['Tháng 6', '六月 (liù yuè)', 'Tháng 12', '十二月 (shí èr yuè)']
            ]
          },
          {
            title: 'Bảng các Thứ trong tuần (星期 xīngqī)',
            headers: ['Thứ', 'Chữ Hán & Pinyin', 'Thứ', 'Chữ Hán & Pinyin'],
            rows: [
              ['Thứ 2', '星期一 (xīngqī yī)', 'Thứ 6', '星期五 (xīngqī wǔ)'],
              ['Thứ 3', '星期二 (xīngqī èr)', 'Thứ 7', '星期六 (xīngqī liù)'],
              ['Thứ 4', '星期三 (xīngqī sān)', 'Chủ Nhật', '星期日 / 星期天 (xīngqī rì / tiān)'],
              ['Thứ 5', '星期四 (xīngqī sì)', '', '']
            ]
          }
        ],
        exercises: [
          {
            type: 'Sắp xếp câu',
            prompt: 'Sắp xếp: 是 / 2026年 / 8月 / 今天 / 星期日 / 2日',
            answer: '今天是2026年8月2日，星期日。'
          }
        ]
      },
      {
        id: 'hsk1_b5_g2',
        num: 2,
        title: 'Câu vị ngữ danh từ (Không dùng động từ “是”)',
        explanation: 'Là loại câu dùng trực tiếp danh từ hoặc cụm danh từ làm vị ngữ để miêu tả ngày tháng, thời gian, tuổi tác, quê quán, giá cả mà KHÔNG cần dùng động từ "是".',
        formula: 'Chủ ngữ + Danh từ / Cụm danh từ',
        note: 'Khi phủ định, bắt buộc phải dùng "不是" (Ví dụ: 今天不是星期日 - Hôm nay không phải là Chủ nhật).',
        examples: [
          {
            rawZh: '今天星期日。(Jīntiān xīngqī rì.)',
            zh: '今天星期日。',
            pinyin: 'Jīntiān xīngqī rì.',
            vi: 'Hôm nay là Chủ nhật.'
          },
          {
            rawZh: '今天八月三号。(Jīntiān bā yuè sān hào.)',
            zh: '今天八月三号。',
            pinyin: 'Jīntiān bā yuè sān hào.',
            vi: 'Hôm nay là ngày 3 tháng 8.'
          },
          {
            rawZh: '我二十岁。(Wǒ èrshí suì.)',
            zh: '我二十岁。',
            pinyin: 'Wǒ èrshí suì.',
            vi: 'Tôi 20 tuổi.'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b5_g3',
        num: 3,
        title: 'Động từ năng nguyện “会” (Kỹ năng do học tập/rèn luyện)',
        explanation: 'Động từ năng nguyện "会" (huì) dùng để biểu thị năng lực, kỹ năng làm được một việc gì đó thông qua quá trình học tập hoặc rèn luyện (biết làm gì).',
        formula: 'Khẳng định: S + 会 + V + O\nPhủ định: S + 不会 + V + O\nNghi vấn: S + 会 + V + O + 吗?',
        note: 'Phủ định của "会" là "不会" (bú huì).',
        examples: [
          {
            rawZh: '我会说中文。(Wǒ huì shuō Zhōngwén.)',
            zh: '我会说中文。',
            pinyin: 'Wǒ huì shuō Zhōngwén.',
            vi: 'Tôi biết nói tiếng Trung.'
          },
          {
            rawZh: '他不会开车。(Tā bú huì kāichē.)',
            zh: '他不会开车。',
            pinyin: 'Tā bú huì kāichē.',
            vi: 'Anh ấy không biết lái xe.'
          },
          {
            rawZh: '我会做饭。(Wǒ huì zuòfàn.)',
            zh: '我会做饭。',
            pinyin: 'Wǒ huì zuòfàn.',
            vi: 'Tôi biết nấu ăn.'
          }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 6,
    lessonKey: 'Bài 6',
    lessonTitleZh: '你的手机号是多少?',
    lessonTitleFull: 'Bài 6: 你的手机号是多少? (Động từ năng nguyện 想, Câu liên động & Đại từ 怎么)',
    grammarPoints: [
      {
        id: 'hsk1_b6_g1',
        num: 1,
        title: 'Động từ năng nguyện “想” (Biểu thị mong muốn, ý định)',
        explanation: 'Động từ năng nguyện "想" (xiǎng) đứng trước động từ chính để biểu thị mong muốn, dự định hoặc nguyện vọng làm một việc gì đó (nghĩa là "muốn", "dự định").',
        formula: 'Khẳng định: S + 想 + V + O\nPhủ định: S + 不想 + V + O\nNghi vấn: S + 想 + V + O + 吗? / S + 想 + V + 什么?',
        note: 'Ngoài nghĩa "muốn", "想" khi đi trực tiếp với danh từ còn có nghĩa là "nhớ" (Ví dụ: 我想你 - Tôi nhớ bạn) hoặc "nghĩ/suy nghĩ".',
        examples: [
          {
            rawZh: '我想去超市。(Wǒ xiǎng qù chāoshì.)',
            zh: '我想去超市。',
            pinyin: 'Wǒ xiǎng qù chāoshì.',
            vi: 'Tôi muốn đi siêu thị.'
          },
          {
            rawZh: '妈妈不想买电脑。(Māma bù xiǎng mǎi diànnǎo.)',
            zh: '妈妈不想买电脑。',
            pinyin: 'Māma bù xiǎng mǎi diànnǎo.',
            vi: 'Mẹ không muốn mua máy tính.'
          },
          {
            rawZh: '你想吃什么？(Nǐ xiǎng chī shénme?)',
            zh: '你想吃什么？',
            pinyin: 'Nǐ xiǎng chī shénme?',
            vi: 'Bạn muốn ăn cái gì?'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b6_g2',
        num: 2,
        title: 'Câu liên động (1): Chỉ Mục đích & Phương thức thực hiện',
        explanation: 'Câu liên động là câu có từ hai động từ trở lên cùng chung một chủ ngữ. Trong HSK 1 gồm hai dạng chính:\n1. Chỉ mục đích: Đi/đến đâu để làm gì (Hành động di chuyển trước, mục đích sau).\n2. Chỉ phương thức: Đi bằng phương tiện gì đến đâu (Phương tiện/cách thức trước, hành động sau).',
        formula: 'Chỉ mục đích: S + 去 / 来 + Địa điểm + V2 + O\nChỉ phương thức: S + [Phương tiện/Cách thức] + V2 + [Địa điểm]',
        note: 'Các hành động trong câu liên động luôn diễn ra theo trình tự trước - sau theo thời gian thực tế.',
        examples: [
          {
            rawZh: '我去超市买东西。(Wǒ qù chāoshì mǎi dōngxi.)',
            zh: '我去超市买东西。',
            pinyin: 'Wǒ qù chāoshì mǎi dōngxi.',
            vi: 'Tôi đi siêu thị mua đồ (Mục đích).'
          },
          {
            rawZh: '他来学校学习。(Tā lái xuéxiào xuéxí.)',
            zh: '他来学校学习。',
            pinyin: 'Tā lái xuéxiào xuéxí.',
            vi: 'Anh ấy đến trường học tập (Mục đích).'
          },
          {
            rawZh: '下午我去电影院看电影。(Xiàwǔ wǒ qù diànyǐngyuàn kàn diànyǐng.)',
            zh: '下午我去电影院看电影。',
            pinyin: 'Xiàwǔ wǒ qù diànyǐngyuàn kàn diànyǐng.',
            vi: 'Buổi chiều tôi đi rạp chiếu phim xem phim (Mục đích).'
          },
          {
            rawZh: '我坐出租车去医院。(Wǒ zuò chūzūchē qù yīyuàn.)',
            zh: '我坐出租车去医院。',
            pinyin: 'Wǒ zuò chūzūchē qù yīyuàn.',
            vi: 'Tôi ngồi taxi đi bệnh viện (Phương thức).'
          },
          {
            rawZh: '他开车去超市。(Tā kāichē qù chāoshì.)',
            zh: '他开车去超市。',
            pinyin: 'Tā kāichē qù chāoshì.',
            vi: 'Anh ấy lái xe đi siêu thị (Phương thức).'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b6_g3',
        num: 3,
        title: 'Đại từ nghi vấn “怎么” (Hỏi về cách thức thực hiện hành động)',
        explanation: 'Đại từ nghi vấn "怎么" (zěnme) đứng trước động từ để hỏi về phương thức, phương tiện hoặc cách thức thực hiện của hành động đó (nghĩa là "làm như thế nào?", "đi bằng gì?").',
        formula: 'Chủ ngữ + 怎么 + Động từ + (Tân ngữ)?',
        note: 'Khác với "怎么样" (hỏi tính chất/trạng thái), "怎么" đứng trước động từ để hỏi cách làm.',
        examples: [
          {
            rawZh: '你怎么去学校？(Nǐ zěnme qù xuéxiào?)',
            zh: '你怎么去学校？',
            pinyin: 'Nǐ zěnme qù xuéxiào?',
            vi: 'Bạn đi đến trường bằng cách nào?'
          },
          {
            rawZh: '你怎么去超市？(Nǐ zěnme qù chāoshì?)',
            zh: '你怎么去超市？',
            pinyin: 'Nǐ zěnme qù chāoshì?',
            vi: 'Bạn đi siêu thị bằng cách nào?'
          },
          {
            rawZh: '这个电脑怎么买？(Zhège diànnǎo zěnme mǎi?)',
            zh: '这个电脑怎么买？',
            pinyin: 'Zhège diànnǎo zěnme mǎi?',
            vi: 'Máy tính này mua như thế nào?'
          }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 7,
    lessonKey: 'Bài 7',
    lessonTitleZh: '我晚上六点半下班',
    lessonTitleFull: 'Bài 7: 我晚上六点半下班 (Thời gian Giờ Phút, Trợ từ 吧, Vị trí Trạng ngữ, Trợ từ 呢 (2))',
    grammarPoints: [
      {
        id: 'hsk1_b7_g1',
        num: 1,
        title: 'Cách diễn đạt Thời gian (2): Giờ, Phút & Các buổi trong ngày',
        explanation: 'a. Dùng 点 (diǎn - giờ) và 分 (fēn - phút): Khi nói giờ rưỡi dùng 半 (bàn); khi phút nhỏ hơn 10 (từ 1 đến 9) bắt buộc chèn chữ 零 (líng).\nb. Các buổi trong ngày: 上午 (sáng), 中午 (trưa), 下午 (chiều), 晚上 (tối). Từ chỉ buổi luôn đứng trước giờ cụ thể.',
        formula: '[Buổi trong ngày] + [Số giờ] 点 + [Số phút] 分 (hoặc 半 / 零 [Số phút] 分)',
        note: 'Ví dụ: 6:30 -> 六点半 (liù diǎn bàn); 8:05 -> 八点零五分 (bā diǎn líng wǔ fēn).',
        examples: [
          {
            rawZh: '六点半 (liù diǎn bàn)',
            zh: '六点半',
            pinyin: 'liù diǎn bàn',
            vi: '6 giờ 30 phút / 6 rưỡi'
          },
          {
            rawZh: '八点零五分 (bā diǎn líng wǔ fēn)',
            zh: '八点零五分',
            pinyin: 'bā diǎn líng wǔ fēn',
            vi: '8 giờ 5 phút'
          },
          {
            rawZh: '晚上八点我下班。(Wǎnshang bā diǎn wǒ xiàbān.)',
            zh: '晚上八点我下班。',
            pinyin: 'Wǎnshang bā diǎn wǒ xiàbān.',
            vi: '8 giờ tối tôi tan làm.'
          },
          {
            rawZh: '我下午去看电影。(Wǒ xiàwǔ qù kàn diànyǐng.)',
            zh: '我下午去看电影。',
            pinyin: 'Wǒ xiàwǔ qù kàn diànyǐng.',
            vi: 'Chiều nay tôi đi xem phim.'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b7_g2',
        num: 2,
        title: 'Trợ từ ngữ khí “吧” (1) - Đề nghị, gợi ý, rủ rê',
        explanation: 'Trợ từ ngữ khí "吧" (ba) đặt ở cuối câu để biểu thị lời đề nghị, rủ rê, khuyên nhủ hoặc yêu cầu người nghe cùng thực hiện hành động một cách nhẹ nhàng (dịch là: "...nhé", "...đi", "...thôi").',
        formula: 'Chủ ngữ + Động từ + Tân ngữ + 吧',
        note: 'Ngữ khí nhẹ nhàng hơn rất nhiều so với câu mệnh lệnh trực tiếp.',
        examples: [
          {
            rawZh: '我们去超市吧。(Wǒmen qù chāoshì ba.)',
            zh: '我们去超市吧。',
            pinyin: 'Wǒmen qù chāoshì ba.',
            vi: 'Chúng ta đi siêu thị nhé!'
          },
          {
            rawZh: '明天我们去书店吧。(Míngtiān wǒmen qù shūdiàn ba.)',
            zh: '明天我们去书店吧。',
            pinyin: 'Míngtiān wǒmen qù shūdiàn ba.',
            vi: 'Ngày mai chúng ta đi hiệu sách nhé!'
          },
          {
            rawZh: '我们吃饭吧。(Wǒmen chīfàn ba.)',
            zh: '我们吃饭吧。',
            pinyin: 'Wǒmen chīfàn ba.',
            vi: 'Chúng ta ăn cơm thôi/đi!'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b7_g3',
        num: 3,
        title: 'Vị trí của Phó từ & Từ ngữ chỉ thời gian khi làm trạng ngữ',
        explanation: '1. Phó từ (不, 很, 也...): Luôn đứng trước Động từ hoặc Tính từ mà nó bổ nghĩa.\n2. Trạng ngữ chỉ thời gian (昨天, 今天, 明天...): Đứng trước Động từ (trước hoặc sau Chủ ngữ). Tuyệt đối không đứng cuối câu.\n3. Khi có cả Thời gian và Địa điểm: Thời gian luôn đứng trước Địa điểm.',
        formula: 'Chủ ngữ + (Thời gian) + Phó từ + (在 + Địa điểm) + Động từ + Tân ngữ',
        note: 'Trật tự vàng: Thời gian -> Địa điểm -> Động từ.',
        examples: [
          {
            rawZh: '他不喜欢包子。(Tā bù xǐhuan bāozi.)',
            zh: '他不喜欢包子。',
            pinyin: 'Tā bù xǐhuan bāozi.',
            vi: 'Anh ấy không thích bánh bao.'
          },
          {
            rawZh: '我昨天在学校学习。(Wǒ zuótiān zài xuéxiào xuéxí.)',
            zh: '我昨天在学校学习。',
            pinyin: 'Wǒ zuótiān zài xuéxiào xuéxí.',
            vi: 'Hôm qua tôi học ở trường.'
          },
          {
            rawZh: '今天我去超市。(Jīntiān wǒ qù chāoshì.)',
            zh: '今天我去超市。',
            pinyin: 'Jīntiān wǒ qù chāoshì.',
            vi: 'Hôm nay tôi đi siêu thị.'
          },
          {
            rawZh: '明天我买手机。(Míngtiān wǒ mǎi shǒujī.)',
            zh: '明天我买手机。',
            pinyin: 'Míngtiān wǒ mǎi shǒujī.',
            vi: 'Ngày mai tôi mua điện thoại.'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b7_g4',
        num: 4,
        title: 'Trợ từ ngữ khí “呢” (2) - Khẳng định sự thực khách quan / Nhấn mạnh',
        explanation: 'Trợ từ "呢" (ne) đặt ở cuối câu trần thuật dùng để khẳng định một sự thực, thông tin khách quan mà người nói muốn nhấn mạnh với người nghe.',
        formula: 'Chủ ngữ + Vị ngữ + 呢',
        note: 'Giúp câu nói thêm phần sinh động, tự nhiên và mang tính tương tác cao trong khẩu ngữ.',
        examples: [
          {
            rawZh: '我明天下午两点还上课呢。(Wǒ míngtiān xiàwǔ liǎng diǎn hái shàngkè ne.)',
            zh: '我明天下午两点还上课呢。',
            pinyin: 'Wǒ míngtiān xiàwǔ liǎng diǎn hái shàngkè ne.',
            vi: 'Chiều mai 2 giờ tôi vẫn còn phải lên lớp đấy nhé.'
          },
          {
            rawZh: '妹妹会做两三个菜呢。(Mèimei huì zuò liǎng sān gè cài ne.)',
            zh: '妹妹会做两三个菜呢。',
            pinyin: 'Mèimei huì zuò liǎng sān gè cài ne.',
            vi: 'Em gái còn biết nấu hai ba món ăn cơ đấy.'
          }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 8,
    lessonKey: 'Bài 8',
    lessonTitleZh: '我爸爸也在医院工作',
    lessonTitleFull: 'Bài 8: 我爸爸也在医院工作 (Phương vị từ, Giới từ 在 & Động từ năng nguyện 能)',
    grammarPoints: [
      {
        id: 'hsk1_b8_g1',
        num: 1,
        title: 'Phương vị từ (Từ chỉ vị trí và phương hướng)',
        explanation: 'Phương vị từ trong tiếng Trung đứng sau danh từ để tạo thành cụm từ chỉ vị trí của sự vật. Có thể thêm hậu tố "边" (biān) hoặc "面" (miàn) vào sau để chỉ phương hướng rõ ràng hơn.',
        formula: '[Danh từ] + [Phương vị từ]',
        note: 'Các phương vị từ thường gặp: 上 (trên), 下 (dưới), 里 (trong), 外 (ngoài), 前 (trước), 后 (sau).',
        examples: [
          {
            rawZh: '桌子上 (Zhuōzi shàng)',
            zh: '桌子上',
            pinyin: 'Zhuōzi shàng',
            vi: 'Trên bàn'
          },
          {
            rawZh: '桌子下 (Zhuōzi xià)',
            zh: '桌子下',
            pinyin: 'Zhuōzi xià',
            vi: 'Dưới bàn'
          },
          {
            rawZh: '房间里 (Fángjiān lǐ)',
            zh: '房间里',
            pinyin: 'Fángjiān lǐ',
            vi: 'Trong phòng'
          },
          {
            rawZh: '房间外 (Fángjiān wài)',
            zh: '房间外',
            pinyin: 'Fángjiān wài',
            vi: 'Ngoài phòng'
          },
          {
            rawZh: '超市前 (Chāoshì qián)',
            zh: '超市前',
            pinyin: 'Chāoshì qián',
            vi: 'Trước siêu thị (hoặc: 超市前边 Chāoshì qiánbian)'
          },
          {
            rawZh: '家后 (Jiā hòu)',
            zh: '家后',
            pinyin: 'Jiā hòu',
            vi: 'Sau nhà (hoặc: 家后边 Jiā hòubian)'
          }
        ],
        tables: [
          {
            title: 'Bảng các Phương vị từ thường gặp (HSK 1)',
            headers: ['Phương vị từ', 'Nghĩa tiếng Việt', 'Ví dụ ghép cụm từ', 'Dịch nghĩa'],
            rows: [
              ['上 (shàng)', 'Trên', '桌子上 (Zhuōzi shàng)', 'Trên bàn'],
              ['下 (xià)', 'Dưới', '桌子下 (Zhuōzi xià)', 'Dưới bàn'],
              ['里 (lǐ)', 'Trong', '房间里 (Fángjiān lǐ)', 'Trong phòng'],
              ['外 (wài)', 'Ngoài', '房间外 (Fángjiān wài)', 'Ngoài phòng'],
              ['前 (qián)', 'Trước', '超市前 (Chāoshì qián)', 'Trước siêu thị'],
              ['后 (hòu)', 'Sau', '家后 (Jiā hòu)', 'Sau nhà']
            ]
          }
        ],
        exercises: null
      },
      {
        id: 'hsk1_b8_g2',
        num: 2,
        title: 'Giới từ “在” (Chỉ vị trí & Nơi chốn diễn ra hành động)',
        explanation: 'Giới từ "在" (zài) có hai cách dùng chính:\n1. Đóng vai trò làm Động từ chính: Biểu thị người/vật đang ở vị trí nào (ở đâu).\n2. Đóng vai trò làm Giới từ chỉ nơi chốn: Kết hợp với địa điểm đứng trước động từ để biểu thị hành động diễn ra ở đâu (làm gì ở đâu).',
        formula: '1. Chỉ vị trí: S + (不)在 + Địa điểm\n2. Nơi chốn hành động: S + 在 + Địa điểm + V + O',
        note: 'Khi phủ định câu nơi chốn hành động: S + 不在 + Địa điểm + V + O.',
        examples: [
          {
            rawZh: '他在学校。(Tā zài xuéxiào.)',
            zh: '他在学校。',
            pinyin: 'Tā zài xuéxiào.',
            vi: 'Anh ấy ở trường.'
          },
          {
            rawZh: '我不在家。(Wǒ bú zài jiā.)',
            zh: '我不在家。',
            pinyin: 'Wǒ bú zài jiā.',
            vi: 'Tôi không có ở nhà.'
          },
          {
            rawZh: '我在房间里看电影。(Wǒ zài fángjiān lǐ kàn diànyǐng.)',
            zh: '我在房间里看电影。',
            pinyin: 'Wǒ zài fángjiān lǐ kàn diànyǐng.',
            vi: 'Tôi xem phim ở trong phòng.'
          },
          {
            rawZh: '我昨天在学校学习。(Wǒ zuótiān zài xuéxiào xuéxí.)',
            zh: '我昨天在学校学习。',
            pinyin: 'Wǒ zuótiān zài xuéxiào xuéxí.',
            vi: 'Hôm qua tôi học ở trường.'
          },
          {
            rawZh: '他在医院工作。(Tā zài yīyuàn gōngzuò.)',
            zh: '他在医院工作。',
            pinyin: 'Tā zài yīyuàn gōngzuò.',
            vi: 'Anh ấy làm việc ở bệnh viện.'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b8_g3',
        num: 3,
        title: 'Động từ năng nguyện “能” (Biểu thị Khả năng & Sự cho phép)',
        explanation: 'Động từ năng nguyện "能" (néng) dùng để:\n1. Biểu thị điều kiện khách quan, năng lực có thể làm được việc gì.\n2. Biểu thị sự xin phép hoặc cấp phép (nghĩa là "có thể").',
        formula: 'Khẳng định: S + 能 + V + O\nPhủ định: S + 不能 + V + O\nNghi vấn: S + 能 + V + O + 吗?',
        note: 'Khi biểu thị sự cấm đoán, không được phép làm gì, dùng "不能" (bù néng).',
        examples: [
          {
            rawZh: '我明天能去超市。(Wǒ míngtiān néng qù chāoshì.)',
            zh: '我明天能去超市。',
            pinyin: 'Wǒ míngtiān néng qù chāoshì.',
            vi: 'Ngày mai tôi có thể đi siêu thị.'
          },
          {
            rawZh: '我能问你一个问题吗？(Wǒ néng wèn nǐ yí gè wèntí ma?)',
            zh: '我能问你一个问题吗？',
            pinyin: 'Wǒ néng wèn nǐ yí gè wèntí ma?',
            vi: 'Tôi có thể hỏi bạn một câu hỏi được không?'
          },
          {
            rawZh: '你不能在这里看电影。(Nǐ bù néng zài zhèlǐ kàn diànyǐng.)',
            zh: '你不能在这里看电影。',
            pinyin: 'Nǐ bù néng zài zhèlǐ kàn diànyǐng.',
            vi: 'Bạn không thể xem phim ở đây.'
          }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 9,
    lessonKey: 'Bài 9',
    lessonTitleZh: '我明天上午在学校学习',
    lessonTitleFull: 'Bài 9: 我明天上午在学校学习 (Câu tồn hiện 有/是, Trật tự Trạng ngữ & Số thứ tự 第)',
    grammarPoints: [
      {
        id: 'hsk1_b9_g1',
        num: 1,
        title: 'Câu tồn hiện (1): Với “有” (Biểu thị tồn tại) & Với “是” (Biểu thị xác định)',
        explanation: 'Câu tồn hiện dùng để thông báo về sự tồn tại hoặc xuất hiện của người/vật tại một địa điểm:\n1. Với "有": Tại địa điểm có người/vật nào đó (chưa xác định cụ thể).\n2. Với "是": Tại địa điểm chính là người/vật cụ thể đó.',
        formula: 'Với 有: [Địa điểm] + 有 + [Số lượng / Lượng từ] + [Danh từ]\nVới 是: [Địa điểm] + 是 + [Danh từ]',
        note: 'Sau "有" thường là tân ngữ không xác định (有一只猫); sau "是" thường là danh từ xác định (是学校, 是我家).',
        examples: [
          {
            rawZh: '房间里有一只小猫。(Fángjiān lǐ yǒu yì zhī xiǎo māo.)',
            zh: '房间里有一只小猫。',
            pinyin: 'Fángjiān lǐ yǒu yì zhī xiǎo māo.',
            vi: 'Trong phòng có một con mèo nhỏ.'
          },
          {
            rawZh: '超市前有一家电影院。(Chāoshì qián yǒu yì jiā diànyǐngyuàn.)',
            zh: '超市前有一家电影院。',
            pinyin: 'Chāoshì qián yǒu yì jiā diànyǐngyuàn.',
            vi: 'Trước siêu thị có một rạp chiếu phim.'
          },
          {
            rawZh: '医院里有很多病人。(Yīyuàn lǐ yǒu hěn duō bìngrén.)',
            zh: '医院里有很多病人。',
            pinyin: 'Yīyuàn lǐ yǒu hěn duō bìngrén.',
            vi: 'Trong bệnh viện có rất nhiều bệnh nhân.'
          },
          {
            rawZh: '桌子上有一本书。(Zhuōzi shàng yǒu yì běn shū.)',
            zh: '桌子上有一本书。',
            pinyin: 'Zhuōzi shàng yǒu yì běn shū.',
            vi: 'Trên bàn có một quyển sách.'
          },
          {
            rawZh: '前边是学校。(Qiánbian shì xuéxiào.)',
            zh: '前边是学校。',
            pinyin: 'Qiánbian shì xuéxiào.',
            vi: 'Phía trước chính là trường học.'
          },
          {
            rawZh: '超市前是我的家。(Chāoshì qián shì wǒ de jiā.)',
            zh: '超市前是我的家。',
            pinyin: 'Chāoshì qián shì wǒ de jiā.',
            vi: 'Trước siêu thị là nhà của tôi.'
          },
          {
            rawZh: '那儿是我的房间。(Nàr shì wǒ de fángjiān.)',
            zh: '那儿是我的房间。',
            pinyin: 'Nàr shì wǒ de fángjiān.',
            vi: 'Chỗ kia là phòng của tôi.'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b9_g2',
        num: 2,
        title: 'Trật tự ưu tiên của Trạng ngữ Thời gian và Nơi chốn',
        explanation: 'Khi trong một câu xuất hiện đồng thời cả trạng ngữ chỉ thời gian và trạng ngữ chỉ địa điểm, trật tự chuẩn mực luôn là: Thời gian đứng TRƯỚC Địa điểm.',
        formula: '(Chủ ngữ) + [Thời gian] + (Chủ ngữ) + [在 + Địa điểm] + [Động từ] + [Tân ngữ]',
        note: 'Mẹo ghi nhớ logic tư duy tiếng Trung: Khi nào? (Thời gian) -> Ở đâu? (Địa điểm) -> Làm gì? (Hành động).',
        examples: [
          {
            rawZh: '我昨天在学校学习。(Wǒ zuótiān zài xuéxiào xuéxí.)',
            zh: '我昨天在学校学习。',
            pinyin: 'Wǒ zuótiān zài xuéxiào xuéxí.',
            vi: 'Hôm qua tôi học ở trường.'
          },
          {
            rawZh: '明天我去超市。(Míngtiān wǒ qù chāoshì.)',
            zh: '明天我去超市。',
            pinyin: 'Míngtiān wǒ qù chāoshì.',
            vi: 'Ngày mai tôi đi siêu thị.'
          },
          {
            rawZh: '晚上八点我在医院下班。(Wǎnshang bā diǎn wǒ zài yīyuàn xiàbān.)',
            zh: '晚上八点我在医院下班。',
            pinyin: 'Wǎnshang bā diǎn wǒ zài yīyuàn xiàbān.',
            vi: '8 giờ tối tôi tan làm ở bệnh viện.'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b9_g3',
        num: 3,
        title: 'Tiền tố “第” (dì) dùng để biểu thị số thứ tự',
        explanation: 'Tiền tố "第" (dì) đặt trước số từ để tạo thành số thứ tự (ví dụ: thứ nhất, thứ hai, bài một...).',
        formula: '第 (dì) + Số từ + (Lượng từ) + Danh từ',
        note: 'Khi nói "bài 1" dùng 第一课 (không cần lượng từ); khi nói "người thứ nhất" dùng 第一个人 (cần lượng từ).',
        examples: [
          {
            rawZh: '第一课 (dì-yī kè)',
            zh: '第一课',
            pinyin: 'dì-yī kè',
            vi: 'Bài học số 1 / Bài thứ nhất'
          },
          {
            rawZh: '第二楼 (dì-èr lóu)',
            zh: '第二楼',
            pinyin: 'dì-èr lóu',
            vi: 'Tầng 2'
          },
          {
            rawZh: '第三个 (dì-sān gè)',
            zh: '第三个',
            pinyin: 'dì-sān gè',
            vi: 'Cái thứ 3'
          }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 10,
    lessonKey: 'Bài 10',
    lessonTitleZh: '这儿的苹果真便宜！',
    lessonTitleFull: 'Bài 10: 这儿的苹果真便宜！ (Diễn đạt tiền tệ, Câu vị ngữ tính từ & Đại từ 怎么样)',
    grammarPoints: [
      {
        id: 'hsk1_b10_g1',
        num: 1,
        title: 'Cách diễn đạt số tiền trong tiếng Trung',
        explanation: 'Tiền tệ Trung Quốc gồm hai hình thức: Khẩu ngữ và Văn viết.\n- Đơn vị chính: 块 (kuài - nói) / 元 (yuán - viết).\n- Đơn vị 1/10 (hào): 毛 (máo - nói) / 角 (jiǎo - viết).\n- Đơn vị 1/100 (xu): 分 (fēn).\nQuy tắc quy đổi: 1 块 = 10 毛, 1 毛 = 10 分.',
        formula: '[Số] 块 + ( [Số] 毛 ) + ( [Số] 分 )',
        note: 'Lưu ý:\n1. Khẩu ngữ hay lược bỏ từ 毛 nếu phía sau có số khác (Ví dụ: 1.5 tệ đọc là 1块5).\n2. Khi có số 0 ở hàng hào (như 1.05 tệ), phải thêm "零" (1块零5分).\n3. Số 2 đứng trước đơn vị tiền tệ thường đọc là "两" (2.5 tệ -> 两块五).',
        examples: [
          {
            rawZh: '3块 (Sān kuài) - 3 tệ',
            zh: '3块',
            pinyin: 'sān kuài',
            vi: '3 tệ (Khẩu ngữ)'
          },
          {
            rawZh: '1块5 (Yī kuài wǔ) - 1.5 tệ',
            zh: '1块5',
            pinyin: 'yí kuài wǔ',
            vi: '1 đồng 5 hào (1.5 tệ)'
          },
          {
            rawZh: '2块8 (Liǎng kuài bā) - 2.8 tệ',
            zh: '2块8',
            pinyin: 'liǎng kuài bā',
            vi: '2 đồng 8 hào (2.8 tệ)'
          },
          {
            rawZh: '1块5毛5 (Yī kuài wǔ máo wǔ fēn) - 1.55 tệ',
            zh: '1块5毛5',
            pinyin: 'yí kuài wǔ máo wǔ fēn',
            vi: '1 đồng 5 hào 5 xu (1.55 tệ)'
          },
          {
            rawZh: '1块零5分 (Yī kuài líng wǔ fēn) - 1.05 tệ',
            zh: '1块零5分',
            pinyin: 'yí kuài líng wǔ fēn',
            vi: '1 đồng 0 hào 5 xu (1.05 tệ)'
          }
        ],
        tables: [
          {
            title: 'Bảng phân cấp đơn vị tiền tệ Trung Quốc',
            headers: ['Đơn vị', 'Văn nói (Khẩu ngữ)', 'Văn viết (Trang trọng)', 'Giá trị quy đổi'],
            rows: [
              ['Đơn vị chính', '块 (kuài)', '元 (yuán)', '1 đơn vị tệ'],
              ['Đơn vị 1/10', '毛 (máo)', '角 (jiǎo)', '0.1 đơn vị (Hào)'],
              ['Đơn vị 1/100', '分 (fēn)', '分 (fēn)', '0.01 đơn vị (Xu)']
            ]
          }
        ],
        exercises: null
      },
      {
        id: 'hsk1_b10_g2',
        num: 2,
        title: 'Câu vị ngữ tính từ (Không dùng động từ “是”)',
        explanation: 'Trong tiếng Trung, tính từ có thể trực tiếp làm vị ngữ. Trước tính từ thường thêm các phó từ chỉ mức độ (很, 真, 非常, 太) hoặc phó từ phủ định (不). Giữa Chủ ngữ và Tính từ TUYỆT ĐỐI KHÔNG dùng "是".',
        formula: 'Khẳng định: Chủ ngữ + (Phó từ mức độ: 很 / 真 / 非常) + Tính từ\nPhủ định: Chủ ngữ + 不 + Tính từ',
        note: 'Nếu dùng câu trần thuật không có phó từ mức độ (như "那个苹果好吃"), câu sẽ mang sắc thái so sánh ngầm.',
        examples: [
          {
            rawZh: '那个苹果好吃。(Nàge píngguǒ hǎochī.)',
            zh: '那个苹果好吃。',
            pinyin: 'Nàge píngguǒ hǎochī.',
            vi: 'Quả táo kia ngon.'
          },
          {
            rawZh: '我不忙。(Wǒ bù máng.)',
            zh: '我不忙。',
            pinyin: 'Wǒ bù máng.',
            vi: 'Tôi không bận.'
          },
          {
            rawZh: '你忙吗？(Nǐ máng ma?)',
            zh: '你忙吗？',
            pinyin: 'Nǐ máng ma?',
            vi: 'Bạn có bận không?'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b10_g3',
        num: 3,
        title: 'Đại từ nghi vấn “怎么样” (Hỏi tình hình, tính chất hoặc xin ý kiến)',
        explanation: 'Đại từ nghi vấn "怎么样" (zěnmeyàng) thường đặt ở cuối câu dùng để:\n1. Hỏi về tính chất, trạng thái, tình hình sức khỏe, công việc ("...thế nào?").\n2. Đưa ra gợi ý, đề xuất và xin ý kiến người nghe ("...được không?", "...nhé?").',
        formula: '1. Hỏi tình hình: Chủ ngữ + 怎么样?\n2. Đề xuất ý kiến: [Mệnh đề câu] + ，怎么样?',
        note: 'Trong khẩu ngữ rất thường xuyên sử dụng.',
        examples: [
          {
            rawZh: '这个杯子怎么样？(Zhège bēizi zěnmeyàng?)',
            zh: '这个杯子怎么样？',
            pinyin: 'Zhège bēizi zěnmeyàng?',
            vi: 'Cái cốc này thế nào?'
          },
          {
            rawZh: '这件衣服怎么样？(Zhè jiàn yīfu zěnmeyàng?)',
            zh: '这件衣服怎么样？',
            pinyin: 'Zhè jiàn yīfu zěnmeyàng?',
            vi: 'Bộ quần áo này thế nào?'
          },
          {
            rawZh: '我们去看电影，怎么样？(Wǒmen qù kàn diànyǐng, zěnmeyàng?)',
            zh: '我们去看电影，怎么样？',
            pinyin: 'Wǒmen qù kàn diànyǐng, zěnmeyàng?',
            vi: 'Chúng ta đi xem phim nhé, được không?'
          }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 11,
    lessonKey: 'Bài 11',
    lessonTitleZh: '我读大学了',
    lessonTitleFull: 'Bài 11: 我读大学了 (Câu hỏi chính phản, Phó từ 在/正在 & Động từ năng nguyện 要)',
    grammarPoints: [
      {
        id: 'hsk1_b11_g1',
        num: 1,
        title: 'Câu hỏi chính phản (V/Adj + 不/没 + V/Adj)',
        explanation: 'Câu hỏi chính phản được tạo thành bằng cách ghép hình thức khẳng định và phủ định của động từ hoặc tính từ liền kề nhau để tạo câu hỏi lựa chọn Có/Không.',
        formula: 'Với động từ: Chủ ngữ + V + 不 / 没 + V + (Tân ngữ)?\nVới tính từ: Chủ ngữ + Adj + 不 + Adj?',
        note: 'LƯU Ý CỰC KỲ QUAN TRỌNG: Khi đã sử dụng câu hỏi chính phản thì TUYỆT ĐỐI KHÔNG dùng trợ từ "吗" ở cuối câu.',
        examples: [
          {
            rawZh: '你想不想去超市？(Nǐ xiǎng bu xiǎng qù chāoshì?)',
            zh: '你想不想去超市？',
            pinyin: 'Nǐ xiǎng bu xiǎng qù chāoshì?',
            vi: 'Bạn có muốn đi siêu thị không?'
          },
          {
            rawZh: '你去没去学校？(Nǐ qù méi qù xuéxiào?)',
            zh: '你去没去学校？',
            pinyin: 'Nǐ qù méi qù xuéxiào?',
            vi: 'Bạn đã đi đến trường chưa?'
          },
          {
            rawZh: '这件衣服好看不好看？(Zhè jiàn yīfu hǎokàn bu hǎokàn?)',
            zh: '这件衣服好看不好看？',
            pinyin: 'Zhè jiàn yīfu hǎokàn bu hǎokàn?',
            vi: 'Bộ quần áo này đẹp hay không đẹp?'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b11_g2',
        num: 2,
        title: 'Phó từ chỉ thời gian “在 / 正在” (Biểu thị hành động đang diễn ra)',
        explanation: 'Dùng để diễn tả hành động đang diễn ra tại thời điểm nói (tương đương nghĩa "đang" trong tiếng Việt).\n- 正在 (zhèngzài): Nhấn mạnh hành động đang diễn ra ngay lúc này.\n- 在 (zài): Mô tả hành động đang tiếp diễn.',
        formula: 'Khẳng định: Chủ ngữ + (正在 / 在) + Động từ + (Tân ngữ) + (呢)\nPhủ định: Chủ ngữ + 没 (有) + (在) + Động từ + (Tân ngữ)',
        note: 'Khi phủ định hành động đang diễn ra, BẮT BUỘC dùng "没 / 没有", TUYỆT ĐỐI không dùng "不".',
        examples: [
          {
            rawZh: '他正在看书呢。(Tā zhèngzài kàn shū ne.)',
            zh: '他正在看书呢。',
            pinyin: 'Tā zhèngzài kàn shū ne.',
            vi: 'Anh ấy đang đọc sách.'
          },
          {
            rawZh: '我在吃饭。(Wǒ zài chīfàn.)',
            zh: '我在吃饭。',
            pinyin: 'Wǒ zài chīfàn.',
            vi: 'Tôi đang ăn cơm.'
          },
          {
            rawZh: '我没有在睡觉。(Wǒ méiyǒu zài shuìjiào.)',
            zh: '我没有在睡觉。',
            pinyin: 'Wǒ méiyǒu zài shuìjiào.',
            vi: 'Tôi không có đang ngủ.'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b11_g3',
        num: 3,
        title: 'Động từ năng nguyện “要” (Biểu thị Mong muốn mạnh mẽ / Kế hoạch)',
        explanation: 'Động từ năng nguyện "要" (yào) đứng trước động từ để biểu thị ý định, mong muốn mạnh mẽ hoặc một kế hoạch chắc chắn sẽ thực hiện trong tương lai gần.',
        formula: 'Chủ ngữ + 要 + Động từ + Tân ngữ',
        note: 'Sắc thái của "要" mang tính quyết tâm và chủ động mạnh mẽ hơn so với "想".',
        examples: [
          {
            rawZh: '他今天要和小朋友玩。(Tā jīntiān yào hé xiǎopéngyou wán.)',
            zh: '他今天要和小朋友玩。',
            pinyin: 'Tā jīntiān yào hé xiǎopéngyou wán.',
            vi: 'Hôm nay cậu ấy sẽ/muốn chơi cùng các bạn nhỏ.'
          },
          {
            rawZh: '妈妈要去超市。(Māma yào qù chāoshì.)',
            zh: '妈妈要去超市。',
            pinyin: 'Māma yào qù chāoshì.',
            vi: 'Mẹ sẽ đi siêu thị.'
          }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 12,
    lessonKey: 'Bài 12',
    lessonTitleZh: '昨天下雪了',
    lessonTitleFull: 'Bài 12: 昨天下雪了 (Câu phi chủ vị, Trợ từ ngữ khí 了 (1) & Cấu trúc 太……了)',
    grammarPoints: [
      {
        id: 'hsk1_b12_g1',
        num: 1,
        title: 'Câu phi chủ vị (Câu không có thành phần chủ ngữ)',
        explanation: 'Câu phi chủ vị là loại câu không thể và không cần xác định thành phần Chủ ngữ - Vị ngữ, thường dùng để diễn tả các hiện tượng thời tiết tự nhiên, sự chuyển biến môi trường hoặc dùng làm câu cảm thán, lời chào, hiệu lệnh.',
        formula: '[Động từ / Cụm vị ngữ] + (Tân ngữ / Trợ từ)',
        note: 'Ví dụ phổ biến: 下雨了 (Mưa rồi), 下雪了 (Tuyết rơi rồi), 上课了 (Vào học rồi).',
        examples: [
          {
            rawZh: '下雨了。(Xiàyǔ le.)',
            zh: '下雨了。',
            pinyin: 'Xiàyǔ le.',
            vi: 'Trời mưa rồi.'
          },
          {
            rawZh: '下雪了。(Xiàxuě le.)',
            zh: '下雪了。',
            pinyin: 'Xiàxuě le.',
            vi: 'Tuyết rơi rồi.'
          },
          {
            rawZh: '上课了。(Shàngkè le.)',
            zh: '上课了。',
            pinyin: 'Shàngkè le.',
            vi: 'Đến giờ vào học rồi.'
          },
          {
            rawZh: '真漂亮！(Zhēn piàoliang!)',
            zh: '真漂亮！',
            pinyin: 'Zhēn piàoliang!',
            vi: 'Đẹp thật đấy!'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b12_g2',
        num: 2,
        title: 'Trợ từ ngữ khí “了” (1) - Biểu thị sự thay đổi trạng thái',
        explanation: 'Trợ từ ngữ khí "了" (1) đặt ở CUỐI CÂU dùng để diễn tả một tình huống mới phát sinh hoặc có sự thay đổi về trạng thái (tương đương "rồi" trong tiếng Việt).',
        formula: 'Khẳng định: Chủ ngữ + Vị ngữ + 了\nPhủ định: Chủ ngữ + 没 (有) + Vị ngữ (BẮT BUỘC BỎ "了")',
        note: 'Quy tắc phủ định: Khi chuyển sang câu phủ định, bắt buộc dùng "没(有)" và PHẢI BỎ trợ từ "了" ở cuối câu.',
        examples: [
          {
            rawZh: '下雨了。(Xiàyǔ le.) -> 没下雨。(Méi xiàyǔ.)',
            zh: '下雨了。',
            pinyin: 'Xiàyǔ le.',
            vi: 'Trời mưa rồi (trước đó không mưa) -> Phủ định: 没下雨 (Chưa mưa).'
          },
          {
            rawZh: '我生病了。(Wǒ shēngbìng le.)',
            zh: '我生病了。',
            pinyin: 'Wǒ shēngbìng le.',
            vi: 'Tôi bị ốm rồi (trước đó khỏe).'
          },
          {
            rawZh: '我吃饭了。(Wǒ chīfàn le.) -> 我没吃饭。(Wǒ méi chīfàn.)',
            zh: '我吃饭了。',
            pinyin: 'Wǒ chīfàn le.',
            vi: 'Tôi ăn cơm rồi -> Phủ định: 我没吃饭 (Tôi chưa ăn cơm).'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b12_g3',
        num: 3,
        title: 'Cấu trúc cảm thán “太……了” (Biểu thị mức độ cao)',
        explanation: 'Cấu trúc "太……了" (tài... le) dùng để biểu thị mức độ rất cao, thường dùng trong câu cảm thán để bày tỏ cảm xúc hài lòng, khen ngợi hoặc phàn nàn của người nói (nghĩa là: "...quá!", "...lắm!").',
        formula: 'Chủ ngữ + 太 + Tính từ + 了',
        note: 'Khi phủ định (không... lắm) dùng "不太 + Tính từ" và không có "了" ở cuối (Ví dụ: 不太好 - Không tốt lắm).',
        examples: [
          {
            rawZh: '太好了！(Tài hǎo le!)',
            zh: '太好了！',
            pinyin: 'Tài hǎo le!',
            vi: 'Tốt quá! / Tuyệt vời quá!'
          },
          {
            rawZh: '太漂亮了！(Tài piàoliang le!)',
            zh: '太漂亮了！',
            pinyin: 'Tài piàoliang le!',
            vi: 'Đẹp quá!'
          },
          {
            rawZh: '太贵了！(Tài guì le!)',
            zh: '太贵了！',
            pinyin: 'Tài guì le!',
            vi: 'Đắt quá!'
          },
          {
            rawZh: '太冷了！(Tài lěng le!)',
            zh: '太冷了！',
            pinyin: 'Tài lěng le!',
            vi: 'Lạnh quá!'
          }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 13,
    lessonKey: 'Bài 13',
    lessonTitleZh: '请给我一杯茶',
    lessonTitleFull: 'Bài 13: 请给我一杯茶 (Động từ năng nguyện 可以, Cấu trúc V+一下 & Câu hai tân ngữ)',
    grammarPoints: [
      {
        id: 'hsk1_b13_g1',
        num: 1,
        title: 'Động từ năng nguyện “可以” (Sự cho phép & Khả năng)',
        explanation: 'Động từ năng nguyện "可以" (kěyǐ) trong tiếng Trung có nghĩa là "có thể / được phép", dùng để biểu thị sự cho phép hoặc hỏi xin phép người khác một cách lịch sự.',
        formula: 'Khẳng định: S + 可以 + V + O\nPhủ định: S + 不可以 + V + O\nNghi vấn: S + 可以 + V + O + 吗?',
        note: 'Khi từ chối hoặc cấm đoán, dùng "不可以" (không được phép).',
        examples: [
          {
            rawZh: '我可以问你一个问题吗？(Wǒ kěyǐ wèn nǐ yí gè wèntí ma?)',
            zh: '我可以问你一个问题吗？',
            pinyin: 'Wǒ kěyǐ wèn nǐ yí gè wèntí ma?',
            vi: 'Tôi có thể hỏi bạn một câu hỏi được không?'
          },
          {
            rawZh: '我可以坐这儿吗？(Wǒ kěyǐ zuò zhèr ma?)',
            zh: '我可以坐这儿吗？',
            pinyin: 'Wǒ kěyǐ zuò zhèr ma?',
            vi: 'Tôi có thể ngồi ở đây không?'
          },
          {
            rawZh: '这儿不可以睡觉。(Zhèr bù kěyǐ shuìjiào.)',
            zh: '这儿不可以睡觉。',
            pinyin: 'Zhèr bù kěyǐ shuìjiào.',
            vi: 'Ở đây không được phép ngủ.'
          },
          {
            rawZh: '你可以给我打个电话。(Nǐ kěyǐ gěi wǒ dǎ gè diànhuà.)',
            zh: '你可以给我打个电话。',
            pinyin: 'Nǐ kěyǐ gěi wǒ dǎ gè diànhuà.',
            vi: 'Bạn có thể gọi điện thoại cho tôi.'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b13_g2',
        num: 2,
        title: 'Cấu trúc “Động từ + 一下” (Làm mềm ngữ khí, lịch sự)',
        explanation: 'Cấu trúc "Động từ + 一下" (yíxià) dùng để làm mềm ngữ khí, biểu thị hành động diễn ra trong thời gian ngắn hoặc mang tính thử làm, giúp câu cầu khiến hoặc yêu cầu trở nên nhẹ nhàng, lịch sự và tự nhiên hơn.',
        formula: 'Chủ ngữ + (可以 / 请) + Động từ + 一下',
        note: 'Tương đương với từ "một chút / một lát / thử... xem" trong tiếng Việt.',
        examples: [
          {
            rawZh: '你可以打电话问一下。(Nǐ kěyǐ dǎ diànhuà wèn yíxià.)',
            zh: '你可以打电话问一下。',
            pinyin: 'Nǐ kěyǐ dǎ diànhuà wèn yíxià.',
            vi: 'Bạn có thể gọi điện thoại hỏi thử một chút.'
          },
          {
            rawZh: '请休息一下。(Qǐng xiūxi yíxià.)',
            zh: '请休息一下。',
            pinyin: 'Qǐng xiūxi yíxià.',
            vi: 'Xin mời nghỉ ngơi một lát.'
          },
          {
            rawZh: '你看一下。(Nǐ kàn yíxià.)',
            zh: '你看一下。',
            pinyin: 'Nǐ kàn yíxià.',
            vi: 'Bạn xem qua một chút đi.'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b13_g3',
        num: 3,
        title: 'Câu có hai tân ngữ (1): Với “给” (cho/đưa) & “问” (hỏi)',
        explanation: 'Câu có hai tân ngữ là câu mà động từ kết hợp đồng thời với hai tân ngữ: Tân ngữ 1 chỉ người (tân ngữ gián tiếp, đứng trước) và Tân ngữ 2 chỉ sự vật / câu hỏi (tân ngữ trực tiếp, đứng sau).',
        formula: 'Chủ ngữ + Động từ (给 / 问 / 教) + Tân ngữ chỉ người + Tân ngữ chỉ vật',
        note: 'Trong HSK 1, hai động từ hai tân ngữ điển hình nhất là 给 (gěi - đưa/cho) và 问 (wèn - hỏi).',
        examples: [
          {
            rawZh: '请给我一杯茶。(Qǐng gěi wǒ yì bēi chá.)',
            zh: '请给我一杯茶。',
            pinyin: 'Qǐng gěi wǒ yì bēi chá.',
            vi: 'Xin cho tôi một ly trà (Người: 我, Vật: 一杯茶).'
          },
          {
            rawZh: '你可以给我打个电话。(Nǐ kěyǐ gěi wǒ dǎ gè diànhuà.)',
            zh: '你可以给我打个电话。',
            pinyin: 'Nǐ kěyǐ gěi wǒ dǎ gè diànhuà.',
            vi: 'Bạn có thể gọi cho tôi một cuộc điện thoại.'
          },
          {
            rawZh: '我可以问你一个问题吗？(Wǒ kěyǐ wèn nǐ yí gè wèntí ma?)',
            zh: '我可以问你一个问题吗？',
            pinyin: 'Wǒ kěyǐ wèn nǐ yí gè wèntí ma?',
            vi: 'Tôi có thể hỏi bạn một câu hỏi được không? (Người: 你, Vật: 一个问题).'
          }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 14,
    lessonKey: 'Bài 14',
    lessonTitleZh: '我看了一个电影',
    lessonTitleFull: 'Bài 14: 我看了一个电影 (Trợ từ động thái 了 (2), Từ ly hợp & Phó từ phạm vi 都)',
    grammarPoints: [
      {
        id: 'hsk1_b14_g1',
        num: 1,
        title: 'Trợ từ động thái “了” (2) - Biểu thị hành động đã hoàn thành',
        explanation: 'Trợ từ động thái "了" (2) được đặt NGAY SAU ĐỘNG TỪ để biểu thị hành động đó đã xảy ra hoặc đã hoàn thành. Nếu phía sau có tân ngữ, tân ngữ thường có định ngữ hoặc số lượng từ bổ nghĩa.',
        formula: 'Khẳng định: Chủ ngữ + Động từ + 了 + (Lượng từ/Định ngữ) + Tân ngữ\nPhủ định: Chủ ngữ + 没 (有) + Động từ + Tân ngữ (BẮT BUỘC BỎ "了")\nNghi vấn: Chủ ngữ + Động từ + 了 + Tân ngữ + 没有 / 吗?',
        note: 'Phân biệt "了" (1) và "了" (2):\n- 了 (1) đứng CUỐI CÂU (Bài 12): Chỉ sự thay đổi trạng thái (Ví dụ: 下雨了 - Trời mưa rồi).\n- 了 (2) đứng NGAY SAU ĐỘNG TỪ (Bài 14): Chỉ hành động đã hoàn thành (Ví dụ: 我看了一个电影 - Tôi đã xem một bộ phim).',
        examples: [
          {
            rawZh: '我看了一个电影。(Wǒ kàn le yí gè diànyǐng.)',
            zh: '我看了一个电影。',
            pinyin: 'Wǒ kàn le yí gè diànyǐng.',
            vi: 'Tôi đã xem một bộ phim.'
          },
          {
            rawZh: '我买了新电脑。(Wǒ mǎi le xīn diànnǎo.)',
            zh: '我买了新电脑。',
            pinyin: 'Wǒ mǎi le xīn diànnǎo.',
            vi: 'Tôi đã mua máy tính mới.'
          },
          {
            rawZh: '我没买新电脑。(Wǒ méi mǎi xīn diànnǎo.)',
            zh: '我没买新电脑。',
            pinyin: 'Wǒ méi mǎi xīn diànnǎo.',
            vi: 'Tôi chưa mua máy tính mới (Phủ định không dùng "了").'
          }
        ],
        tables: null,
        exercises: null
      },
      {
        id: 'hsk1_b14_g2',
        num: 2,
        title: 'Từ ly hợp (离合词) trong tiếng Trung (Cấu trúc V + O)',
        explanation: 'Từ ly hợp là những từ có cấu tạo gồm 2 phần: Động từ (V) + Tân ngữ (O).\nNguyên tắc quan trọng:\n1. Có thể tách rời: Khi thêm trợ từ động thái (le, guo), số lượng từ, thời lượng, PHẢI CHÈN VÀO GIỮA Động từ và Tân ngữ.\n2. Không mang tân ngữ phía sau: Không được thêm một tân ngữ khác trực tiếp sau từ ly hợp.',
        formula: 'Động từ + (Trợ từ 了 / Số lượng từ / Thời lượng) + Tân ngữ của từ ly hợp',
        note: 'Ví dụ: Không nói "睡觉八小时", phải nói "睡了八个小时觉" hoặc "睡觉睡了八个小时".',
        examples: [
          {
            rawZh: '睡觉 (shuìjiào - Đi ngủ) -> 睡了一觉 (Đã ngủ một giấc)',
            zh: '睡了一觉',
            pinyin: 'shuì le yí jiào',
            vi: 'Đã ngủ một giấc'
          },
          {
            rawZh: '吃饭 (chīfàn - Ăn cơm) -> 吃了一顿饭 (Đã ăn một bữa cơm)',
            zh: '吃了一顿饭',
            pinyin: 'chī le yí dùn fàn',
            vi: 'Đã ăn một bữa cơm'
          },
          {
            rawZh: '打电话 (dǎ diànhuà - Gọi điện) -> 打了个电话 (Đã gọi một cuộc điện thoại)',
            zh: '打了个电话',
            pinyin: 'dǎ le gè diànhuà',
            vi: 'Đã gọi một cuộc điện thoại'
          },
          {
            rawZh: '开车 (kāichē - Lái xe) -> 开了两小时车 (Đã lái xe 2 tiếng)',
            zh: '开了两小时车',
            pinyin: 'kāi le liǎng xiǎoshí chē',
            vi: 'Đã lái xe 2 tiếng'
          }
        ],
        tables: [
          {
            title: 'Bảng các Từ Ly Hợp thường gặp (HSK 1)',
            headers: ['Từ ly hợp', 'Phiên âm', 'Ý nghĩa', 'Ví dụ tách từ (Chèn trợ từ/số lượng)'],
            rows: [
              ['睡觉', 'shuìjiào', 'Đi ngủ', '睡了一觉 (Đã ngủ một giấc)'],
              ['吃饭', 'chīfàn', 'Ăn cơm', '吃了一顿饭 (Đã ăn một bữa cơm)'],
              ['打电话', 'dǎ diànhuà', 'Gọi điện', '打了个电话 (Đã gọi một cuộc điện thoại)'],
              ['开车', 'kāichē', 'Lái xe', '开了两小时车 (Đã lái xe 2 tiếng)'],
              ['上课', 'shàngkè', 'Lên lớp', '上了一节课 (Đã lên một tiết học)'],
              ['下班', 'xiàbān', 'Tan làm', '下了班 (Đã tan làm)'],
              ['做饭', 'zuòfàn', 'Nấu ăn', '做了很多饭 (Đã nấu rất nhiều cơm)']
            ]
          }
        ],
        exercises: null
      },
      {
        id: 'hsk1_b14_g3',
        num: 3,
        title: 'Phó từ chỉ phạm vi “都” (Biểu thị ý nghĩa "Đều")',
        explanation: 'Phó từ "都" (dōu) có nghĩa là "đều", dùng để tổng kết hoặc bao quát toàn bộ đối tượng được nhắc đến trong câu.',
        formula: 'Chủ ngữ (bắt buộc số nhiều) + 都 + (不) + Động từ / Tính từ',
        note: 'Lưu ý:\n1. Chủ ngữ đi kèm "都" bắt buộc phải là dạng SỐ NHIỀU (Chúng tôi 我们, Các bạn 你们, Họ 他们, hoặc A và B, 这些...).\n2. Phủ định hoàn toàn: 都不 + V/Adj (Đều không...).\n3. Phủ định một phần: 不都 + V/Adj (Không phải tất cả đều...).',
        examples: [
          {
            rawZh: '我们都是学生。(Wǒmen dōu shì xuésheng.)',
            zh: '我们都是学生。',
            pinyin: 'Wǒmen dōu shì xuésheng.',
            vi: 'Chúng tôi đều là học sinh.'
          },
          {
            rawZh: '他们都喜欢喝茶。(Tāmen dōu xǐhuan hē chá.)',
            zh: '他们都喜欢喝茶。',
            pinyin: 'Tāmen dōu xǐhuan hē chá.',
            vi: 'Họ đều thích uống trà.'
          },
          {
            rawZh: '这些苹果都很好。(Zhèxiē píngguǒ dōu hěn hǎo.)',
            zh: '这些苹果都很好。',
            pinyin: 'Zhèxiē píngguǒ dōu hěn hǎo.',
            vi: 'Những quả táo này đều rất ngon.'
          }
        ],
        tables: null,
        exercises: null
      }
    ]
  },
  {
    lessonId: 15,
    lessonKey: 'Bài 15',
    lessonTitleZh: '大兴机场见',
    lessonTitleFull: 'Bài 15: 大兴机场见 (Câu ghép đẳng lập ……，还/也……)',
    grammarPoints: [
      {
        id: 'hsk1_b15_g1',
        num: 1,
        title: 'Câu ghép đẳng lập “……，还 / 也……” (Biểu thị sự song hành hoặc bổ sung)',
        explanation: 'Dùng để kết nối hai vế câu có cùng chủ ngữ, diễn tả việc vừa có tính chất/hành động này, lại vừa có thêm tính chất/hành động khác.\n- 也 (yě - cũng): Liệt kê các trạng thái hoặc hành động song song, tương đồng nhau.\n- 还 (hái - còn/lại còn): Bổ sung thêm tính chất hoặc thông tin mới (thường mang tính nâng cao mức độ).',
        formula: 'Chủ ngữ + V/Adj 1 + ..., (Chủ ngữ) + 还 / 也 + V/Adj 2',
        note: 'Chủ ngữ ở vế thứ hai có thể lược bỏ nếu giống với vế thứ nhất.',
        examples: [
          {
            rawZh: '他会做饭，也会开车。(Tā huì zuòfàn, yě huì kāichē.)',
            zh: '他会做饭，也会开车。',
            pinyin: 'Tā huì zuòfàn, yě huì kāichē.',
            vi: 'Anh ấy biết nấu ăn, cũng biết lái xe.'
          },
          {
            rawZh: '这件衣服很好看，还很便宜。(Zhè jiàn yīfu hěn hǎokàn, hái hěn piányi.)',
            zh: '这件衣服很好看，还很便宜。',
            pinyin: 'Zhè jiàn yīfu hěn hǎokàn, hái hěn piányi.',
            vi: 'Bộ quần áo này rất đẹp, lại còn rất rẻ.'
          },
          {
            rawZh: '我学习汉语，也学习英文。(Wǒ xuéxí Hànyǔ, yě xuéxí Yīngwén.)',
            zh: '我学习汉语，也学习英文。',
            pinyin: 'Wǒ xuéxí Hànyǔ, yě xuéxí Yīngwén.',
            vi: 'Tôi học tiếng Hán, cũng học tiếng Anh.'
          }
        ],
        tables: null,
        exercises: null
      }
    ]
  }
];

// Helper to parse sections for other levels HSK 2..6
function parseLevelSections(rawText, levelKey) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const clean = lines.filter(l => !l.startsWith('----------------Page'));
  
  const sections = [];
  let curSection = null;
  let curPoint = null;

  clean.forEach(line => {
    const isMainSec = line.match(/^(\d+)\.\s+([^\d\n]+)$/) || line.match(/^([IVXLCDM]+)\.\s+(.+)$/);
    if (isMainSec && line.length < 80) {
      if (curSection) sections.push(curSection);
      curSection = {
        title: line,
        points: []
      };
      curPoint = null;
      return;
    }

    const isBullet = line.startsWith('●') || line.startsWith('-') || line.startsWith('★');
    if (isBullet && curSection) {
      curPoint = {
        title: line.replace(/^[●\-★]\s*/, ''),
        content: []
      };
      curSection.points.push(curPoint);
      return;
    }

    if (curPoint) {
      curPoint.content.push(line);
    } else if (curSection) {
      if (curSection.points.length === 0) {
        curSection.points.push({
          title: 'Chi tiết ngữ pháp',
          content: [line]
        });
      } else {
        curSection.points[curSection.points.length - 1].content.push(line);
      }
    }
  });

  if (curSection) sections.push(curSection);
  return sections;
}

// Calculate total points
const totalHsk1Points = hsk1Lessons.reduce((acc, l) => acc + l.grammarPoints.length, 0);

console.log(`Generated official HSK 1 3.0 VER3 with ${hsk1Lessons.length} lessons and ${totalHsk1Points} grammar points.`);

// Read HSK 2 structured data if available
let hsk2Lessons = [];
const hsk2StructuredPath = path.join(frontendDir, 'grammar_hsk2.js');
if (fs.existsSync(hsk2StructuredPath)) {
  try {
    const rawHsk2 = fs.readFileSync(hsk2StructuredPath, 'utf-8');
    const match = rawHsk2.match(/export const HSK2_STRUCTURED_GRAMMAR = (\[[\s\S]*?\]);\s*window/);
    if (match) {
      hsk2Lessons = JSON.parse(match[1]);
      console.log(`Loaded ${hsk2Lessons.length} lessons from grammar_hsk2.js.`);
    }
  } catch (err) {
    console.warn('Could not parse HSK 2 from grammar_hsk2.js:', err.message);
  }
}

// Full structured object
const fullStructured = {
  hsk1: {
    level: 'HSK 1',
    title: 'Tổng Hợp Ngữ Pháp HSK 1 Chuẩn 3.0 (15 Bài Học Chi Tiết Chuẩn VER 3)',
    totalPoints: totalHsk1Points,
    lessons: hsk1Lessons
  }
};

if (hsk2Lessons.length > 0) {
  fullStructured.hsk2 = {
    level: 'HSK 2',
    title: 'Tổng Hợp Ngữ Pháp HSK 2 Chuẩn 3.0 (15 Bài Học Chi Tiết)',
    totalPoints: hsk2Lessons.reduce((acc, l) => acc + l.grammarPoints.length, 0),
    lessons: hsk2Lessons
  };
}

// Also read other levels HSK 3..6 if files exist
['hsk3', 'hsk4', 'hsk5', 'hsk6'].forEach(lvl => {
  const contentFile = path.join(grammarJsonDir, `ngu phap ${lvl.replace('hsk', 'hsk ')}.content.txt`);
  if (fs.existsSync(contentFile)) {
    const raw = fs.readFileSync(contentFile, 'utf-8');
    const sections = parseLevelSections(raw, lvl);
    fullStructured[lvl] = {
      level: lvl.toUpperCase(),
      title: `Tổng Hợp Ngữ Pháp ${lvl.toUpperCase()} Chi Tiết`,
      sections: sections,
      rawContent: raw
    };
  }
});

// Save to frontend and backend files
fs.writeFileSync(path.join(frontendDir, 'grammar_hsk1.js'), `export const HSK1_STRUCTURED_GRAMMAR = ${JSON.stringify(hsk1Lessons, null, 2)};\nwindow.HSK1_STRUCTURED_GRAMMAR = HSK1_STRUCTURED_GRAMMAR;\n`, 'utf-8');
fs.writeFileSync(path.join(frontendDir, 'grammar_structured.js'), `export const FULL_STRUCTURED_GRAMMAR = ${JSON.stringify(fullStructured, null, 2)};\nwindow.FULL_STRUCTURED_GRAMMAR = FULL_STRUCTURED_GRAMMAR;\n`, 'utf-8');
fs.writeFileSync(path.join(backendDir, 'hsk_grammar_structured.json'), JSON.stringify(fullStructured, null, 2), 'utf-8');

console.log('✅ Successfully wrote official HSK 1 3.0 VER3 dataset to:');
console.log(' - frontend/grammar_hsk1.js');
console.log(' - frontend/grammar_structured.js');
console.log(' - backend/hsk_grammar_structured.json');
