/**
 * Tiếng Trung HongTai - Video Dictation Engine (Luyện Nghe Chép Chính Tả Video)
 * Architecture inspired by eJOY / DailyDictation / LingoClip
 */

// Global State
let allLessons = [];
let filteredLessons = [];
let currentLesson = null;
let currentSentenceIdx = 0;
let currentMode = 'cloze'; // 'cloze' | 'full' | 'subtitles'
let currentSpeed = 1.0;
let autoPauseEnabled = true;
let isVideoBlurred = false;
let userAnswers = {}; // { sentenceId: { isCorrect, score, userAnswer, blanks: [] } }
let totalScore = 0;
let currentStreak = 0;

// YouTube Player Instance & Polling
let ytPlayer = null;
let isPlayerReady = false;
let playbackWatcher = null;
let isSentencePlaying = false;
let activeHanziWriter = null;

// Built-in Fallback Lessons Data
const DEFAULT_LESSONS = [
  {
    "id": "dict_lesson_1",
    "title": "Ánh Trăng Nói Hộ Lòng Tôi (月亮代表我的心)",
    "youtubeId": "kpDING7mMcQ",
    "duration": "03:26",
    "level": "1",
    "levelText": "HSK 1 - 2 (Dễ)",
    "category": "Âm Nhạc",
    "thumbnail": "https://img.youtube.com/vi/kpDING7mMcQ/hqdefault.jpg",
    "description": "Bài hát bất hủ của Đặng Lệ Quân với giai điệu chậm rãi, từ vựng cơ bản cực kỳ phù hợp cho người mới bắt đầu luyện nghe chép chính tả.",
    "sentences": [
      {
        "id": 1,
        "startTime": 9,
        "endTime": 18,
        "hanzi": "你问我爱你有多深",
        "pinyin": "nǐ wèn wǒ ài nǐ yǒu duō shēn",
        "meaning": "Bạn hỏi tôi yêu bạn sâu sắc đến mức nào",
        "keywords": [
          "你问"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 2,
        "startTime": 18,
        "endTime": 27,
        "hanzi": "我爱你有几分我的情也真",
        "pinyin": "wǒ ài nǐ yǒu jǐ fēn wǒ de qíng yě zhēn",
        "meaning": "Anh yêu em, tình yêu của anh chân thật biết bao",
        "keywords": [
          "我爱"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 3,
        "startTime": 27,
        "endTime": 36.68,
        "hanzi": "我的爱也真月亮代表我的心",
        "pinyin": "wǒ de ài yě zhēn yuè liàng dài biǎo wǒ de xīn",
        "meaning": "Tình yêu của tôi cũng là sự thật. Mặt trăng tượng trưng cho trái tim tôi",
        "keywords": [
          "我的"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 4,
        "startTime": 36.68,
        "endTime": 48.56,
        "hanzi": "你问我爱你有多深我爱你有几分",
        "pinyin": "nǐ wèn wǒ ài nǐ yǒu duō shēn wǒ ài nǐ yǒu jǐ fēn",
        "meaning": "Em hỏi anh yêu em sâu sắc đến thế nào, anh yêu em đến nhường nào",
        "keywords": [
          "你问"
        ],
        "blankIndices": [
          0,
          7,
          13
        ]
      },
      {
        "id": 5,
        "startTime": 48.56,
        "endTime": 60.76,
        "hanzi": "我的情不易我的爱不別月亮代表我的心",
        "pinyin": "wǒ de qíng bú yì wǒ de ài bù bié yuè liàng dài biǎo wǒ de xīn",
        "meaning": "Tình cảm của tôi không dễ dàng, tình yêu của tôi là vĩnh cửu, mặt trăng tượng trưng cho trái tim tôi",
        "keywords": [
          "我的"
        ],
        "blankIndices": [
          0,
          8,
          16
        ]
      },
      {
        "id": 6,
        "startTime": 60.76,
        "endTime": 72.76,
        "hanzi": "轻轻的一个吻已经打动我的心",
        "pinyin": "qīng qīng de yí gè wěn yǐ jīng dǎ dòng wǒ de xīn",
        "meaning": "Một nụ hôn nhẹ nhàng đã chạm đến trái tim tôi",
        "keywords": [
          "轻轻"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 7,
        "startTime": 72.76,
        "endTime": 84.76,
        "hanzi": "深深的端倾叫我思念到如今",
        "pinyin": "shēn shēn de duān qīng jiào wǒ sī niàn dào rú jīn",
        "meaning": "Mối tình sâu đậm khiến anh nhớ em đến tận bây giờ",
        "keywords": [
          "深深"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 8,
        "startTime": 84.76,
        "endTime": 96.76,
        "hanzi": "你问我爱你有多深我爱你有几分",
        "pinyin": "nǐ wèn wǒ ài nǐ yǒu duō shēn wǒ ài nǐ yǒu jǐ fēn",
        "meaning": "Em hỏi anh yêu em sâu sắc đến thế nào, anh yêu em đến nhường nào",
        "keywords": [
          "你问"
        ],
        "blankIndices": [
          0,
          7,
          13
        ]
      },
      {
        "id": 9,
        "startTime": 96.76,
        "endTime": 110.05,
        "hanzi": "你去想一想你去看一看月亮代表我的心",
        "pinyin": "nǐ qù xiǎng yi xiǎng nǐ qù kàn yi kàn yuè liàng dài biǎo wǒ de xīn",
        "meaning": "Hãy đi và suy nghĩ về nó. Đi và nhìn xem. Mặt trăng tượng trưng cho trái tim tôi.",
        "keywords": [
          "你去"
        ],
        "blankIndices": [
          0,
          8,
          16
        ]
      },
      {
        "id": 10,
        "startTime": 127.81,
        "endTime": 139.51,
        "hanzi": "轻轻的一个吻",
        "pinyin": "qīng qīng de yí gè wěn",
        "meaning": "một nụ hôn nhẹ nhàng",
        "keywords": [
          "轻轻"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 11,
        "startTime": 139.51,
        "endTime": 151.75,
        "hanzi": "已经打动我的心深深的一段情",
        "pinyin": "yǐ jīng dǎ dòng wǒ de xīn shēn shēn de yí duàn qíng",
        "meaning": "Một mối tình đã chạm đến trái tim tôi sâu sắc",
        "keywords": [
          "已经"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 12,
        "startTime": 151.75,
        "endTime": 164.83,
        "hanzi": "叫我思念到如今你问我爱你有多深",
        "pinyin": "jiào wǒ sī niàn dào rú jīn nǐ wèn wǒ ài nǐ yǒu duō shēn",
        "meaning": "Anh nhớ em nhiều đến nỗi em hỏi anh yêu em sâu sắc đến thế nào",
        "keywords": [
          "叫我"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 13,
        "startTime": 164.83,
        "endTime": 173.91,
        "hanzi": "我爱你有几分你去想一想",
        "pinyin": "wǒ ài nǐ yǒu jǐ fēn nǐ qù xiǎng yi xiǎng",
        "meaning": "Hãy nghĩ xem anh yêu em đến nhường nào",
        "keywords": [
          "我爱"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 14,
        "startTime": 173.91,
        "endTime": 186.17,
        "hanzi": "你去看一看月亮代表我的心你去想一想",
        "pinyin": "nǐ qù kàn yi kàn yuè liàng dài biǎo wǒ de xīn nǐ qù xiǎng yi xiǎng",
        "meaning": "Đi và nhìn xem. Mặt trăng tượng trưng cho trái tim tôi. Hãy nghĩ về nó.",
        "keywords": [
          "你去"
        ],
        "blankIndices": [
          0,
          8,
          16
        ]
      },
      {
        "id": 15,
        "startTime": 186.17,
        "endTime": 194.13,
        "hanzi": "你去看一看月亮代表我的心",
        "pinyin": "nǐ qù kàn yi kàn yuè liàng dài biǎo wǒ de xīn",
        "meaning": "Hãy nhìn xem và thấy rằng mặt trăng tượng trưng cho trái tim tôi",
        "keywords": [
          "你去"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      }
    ]
  },
  {
    "id": "dict_lesson_2",
    "title": "Hội Thoại Làm Quen & Chào Hỏi HSK 1 (初次见面)",
    "youtubeId": "8oS6uXOZ_TA",
    "duration": "01:40",
    "level": "1",
    "levelText": "HSK 1 (Sơ cấp)",
    "category": "Giao Tiếp",
    "thumbnail": "https://img.youtube.com/vi/8oS6uXOZ_TA/hqdefault.jpg",
    "description": "Các câu chào hỏi, hỏi tên, quốc tịch và giới thiệu bản thân thông dụng nhất trong tiếng Trung.",
    "sentences": [
      {
        "id": 1,
        "startTime": 0,
        "endTime": 2,
        "hanzi": "你好。",
        "pinyin": "nǐ hǎo 。",
        "meaning": "Xin chào.",
        "keywords": [
          "你好"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 2,
        "startTime": 2,
        "endTime": 4,
        "hanzi": "你好。",
        "pinyin": "nǐ hǎo 。",
        "meaning": "Xin chào.",
        "keywords": [
          "你好"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 3,
        "startTime": 4,
        "endTime": 7,
        "hanzi": "你叫什么名字?",
        "pinyin": "nǐ jiào shén me míng zì ?",
        "meaning": "Tôi có thể biết tên của bạn được không?",
        "keywords": [
          "你叫"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 4,
        "startTime": 7,
        "endTime": 10,
        "hanzi": "我叫王明,你呢?",
        "pinyin": "wǒ jiào wáng míng , nǐ ne ?",
        "meaning": "Tôi tên là Vương Minh, còn bạn thì sao?",
        "keywords": [
          "我叫"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 5,
        "startTime": 10,
        "endTime": 13,
        "hanzi": "我叫李洪。",
        "pinyin": "wǒ jiào lǐ hóng 。",
        "meaning": "Tôi tên là Lý Hồng.",
        "keywords": [
          "我叫"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 6,
        "startTime": 13,
        "endTime": 16,
        "hanzi": "很高兴认识你。",
        "pinyin": "hěn gāo xìng rèn shi nǐ 。",
        "meaning": "Rất vui được gặp bạn.",
        "keywords": [
          "很高"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 7,
        "startTime": 16,
        "endTime": 19,
        "hanzi": "我也很高兴认识你。",
        "pinyin": "wǒ yě hěn gāo xìng rèn shi nǐ 。",
        "meaning": "Rất vui được gặp bạn.",
        "keywords": [
          "我也"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 8,
        "startTime": 19,
        "endTime": 22,
        "hanzi": "你是中国人吗?",
        "pinyin": "nǐ shì zhōng guó rén ma ?",
        "meaning": "Bạn có phải là người Trung Quốc không?",
        "keywords": [
          "你是"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 9,
        "startTime": 22,
        "endTime": 26,
        "hanzi": "不是,我是越南人。",
        "pinyin": "bú shì , wǒ shì yuè nán rén 。",
        "meaning": "Không, tôi là người Việt Nam.",
        "keywords": [
          "不是"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 10,
        "startTime": 26,
        "endTime": 29,
        "hanzi": "你会说汉语吗?",
        "pinyin": "nǐ huì shuō hàn yǔ ma ?",
        "meaning": "Bạn có nói được tiếng Trung không?",
        "keywords": [
          "你会"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 11,
        "startTime": 29,
        "endTime": 32,
        "hanzi": "会一点。",
        "pinyin": "huì yì diǎn 。",
        "meaning": "Một chút.",
        "keywords": [
          "会一"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 12,
        "startTime": 32,
        "endTime": 35,
        "hanzi": "你的汉语很好。",
        "pinyin": "nǐ de hàn yǔ hěn hǎo 。",
        "meaning": "Tiếng Trung của bạn rất tốt.",
        "keywords": [
          "你的"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 13,
        "startTime": 35,
        "endTime": 37,
        "hanzi": "谢谢。",
        "pinyin": "xiè xiè 。",
        "meaning": "Cảm ơn.",
        "keywords": [
          "谢谢"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 14,
        "startTime": 37,
        "endTime": 39,
        "hanzi": "不客气。",
        "pinyin": "bú kè qì 。",
        "meaning": "Không có gì.",
        "keywords": [
          "不客"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 15,
        "startTime": 39,
        "endTime": 42,
        "hanzi": "你今年多大?",
        "pinyin": "nǐ jīn nián duō dà ?",
        "meaning": "Năm nay bạn bao nhiêu tuổi?",
        "keywords": [
          "你今"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 16,
        "startTime": 42,
        "endTime": 45,
        "hanzi": "我20岁。",
        "pinyin": "wǒ 2 0 suì 。",
        "meaning": "Tôi 20 tuổi.",
        "keywords": [
          "我2"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 17,
        "startTime": 45,
        "endTime": 47,
        "hanzi": "你呢?",
        "pinyin": "nǐ ne ?",
        "meaning": "Và bạn?",
        "keywords": [
          "你呢"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 18,
        "startTime": 47,
        "endTime": 50,
        "hanzi": "我22岁。",
        "pinyin": "wǒ 2 2 suì 。",
        "meaning": "Tôi 22 tuổi.",
        "keywords": [
          "我2"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 19,
        "startTime": 50,
        "endTime": 53,
        "hanzi": "你好吗?",
        "pinyin": "nǐ hǎo ma ?",
        "meaning": "Bạn ổn chứ?",
        "keywords": [
          "你好"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 20,
        "startTime": 53,
        "endTime": 56,
        "hanzi": "我很好,你呢?",
        "pinyin": "wǒ hěn hǎo , nǐ ne ?",
        "meaning": "Tôi ổn, còn bạn?",
        "keywords": [
          "我很"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 21,
        "startTime": 56,
        "endTime": 58,
        "hanzi": "我也很好。",
        "pinyin": "wǒ yě hěn hǎo 。",
        "meaning": "Tôi cũng ổn.",
        "keywords": [
          "我也"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 22,
        "startTime": 59,
        "endTime": 62,
        "hanzi": "你在哪工作?",
        "pinyin": "nǐ zài nǎ gōng zuò ?",
        "meaning": "Bạn làm việc ở đâu?",
        "keywords": [
          "你在"
        ],
        "blankIndices": [
          0,
          2
        ]
      }
    ]
  },
  {
    "id": "dict_lesson_3",
    "title": "Hoạt Hình Heo Peppa Tiếng Trung (小猪佩奇 - 跳泥坑)",
    "youtubeId": "RT1yYLfqNhU",
    "duration": "01:00",
    "level": "2",
    "levelText": "HSK 2 - 3 (Thú Vị)",
    "category": "Hoạt Hình",
    "thumbnail": "https://img.youtube.com/vi/RT1yYLfqNhU/hqdefault.jpg",
    "description": "Luyện nghe tiếng Trung siêu dễ thương qua bộ phim hoạt hình Peppa Pig với phát âm chuẩn Bắc Kinh rõ ràng.",
    "sentences": [
      {
        "id": 1,
        "startTime": 0,
        "endTime": 8.84,
        "hanzi": "我是佩奇这是我的弟弟乔治这是我的妈妈",
        "pinyin": "wǒ shì pèi qí zhè shì wǒ de dì di qiáo zhì zhè shì wǒ de mā ma",
        "meaning": "Tôi là Peppa Pig, đây là anh trai tôi, George, và đây là mẹ tôi.",
        "keywords": [
          "我是"
        ],
        "blankIndices": [
          0,
          9,
          17
        ]
      },
      {
        "id": 2,
        "startTime": 8.84,
        "endTime": 21.1,
        "hanzi": "这是我的爸爸小猪佩奇尼克",
        "pinyin": "zhè shì wǒ de bà ba xiǎo zhū pèi qí ní kè",
        "meaning": "Đây là bố tôi Peppa Pig",
        "keywords": [
          "这是"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 3,
        "startTime": 21.1,
        "endTime": 30.78,
        "hanzi": "今天下雨了所以佩奇和乔治不能在外面玩",
        "pinyin": "jīn tiān xià yǔ le suǒ yǐ pèi qí hé qiáo zhì bù néng zài wài miàn wán",
        "meaning": "Hôm nay trời mưa nên Peppa và George không thể ra ngoài chơi",
        "keywords": [
          "今天"
        ],
        "blankIndices": [
          0,
          9,
          17
        ]
      },
      {
        "id": 4,
        "startTime": 30.78,
        "endTime": 40.9,
        "hanzi": "爸爸 现在雨停了我们能出去玩吗好的 你们两个去玩吧",
        "pinyin": "bà bà   xiàn zài yǔ tíng le wǒ men néng chū qù wán ma hǎo de   nǐ men liǎng gè qù wán ba",
        "meaning": "Bố ơi, bây giờ trời đã tạnh mưa rồi chúng ta ra ngoài chơi được không? Được rồi, hai đứa đi chơi đi.",
        "keywords": [
          "爸爸"
        ],
        "blankIndices": [
          0,
          11,
          22
        ]
      },
      {
        "id": 5,
        "startTime": 51.16,
        "endTime": 60.98,
        "hanzi": "佩奇最喜欢在泥坑里玩我最喜欢在泥坑里玩了佩琪",
        "pinyin": "pèi qí zuì xǐ huan zài ní kēng lǐ wán wǒ zuì xǐ huan zài ní kēng lǐ wán le pèi qí",
        "meaning": "Peppa Pig thích chơi ở vũng bùn nhất. Peppa Pig thích chơi ở vũng bùn nhất.",
        "keywords": [
          "佩奇"
        ],
        "blankIndices": [
          0,
          11,
          21
        ]
      },
      {
        "id": 6,
        "startTime": 60.98,
        "endTime": 82.61,
        "hanzi": "如果你要在泥坑里跳你必须得穿上靴子才行对不起 妈妈乔治也喜欢在泥坑里跳我说乔治",
        "pinyin": "rú guǒ nǐ yào zài ní kēng lǐ tiào nǐ bì xū dé chuān shàng xuē zǐ cái xíng duì bù qǐ   mā ma qiáo zhì yě xǐ huan zài ní kēng lǐ tiào wǒ shuō qiáo zhì",
        "meaning": "Nếu bạn định nhảy vào vũng bùn, bạn phải mang ủng. Xin lỗi, mẹ George cũng thích nhảy vào vũng bùn. Tôi nói George.",
        "keywords": [
          "如果"
        ],
        "blankIndices": [
          0,
          19,
          37
        ]
      },
      {
        "id": 7,
        "startTime": 82.61,
        "endTime": 92.61,
        "hanzi": "如果你要在泥坑里跳你必须得穿上靴子才行佩奇喜欢照顾他的弟弟乔治",
        "pinyin": "rú guǒ nǐ yào zài ní kēng lǐ tiào nǐ bì xū dé chuān shàng xuē zǐ cái xíng pèi qí xǐ huan zhào gù tā de dì di qiáo zhì",
        "meaning": "Nếu bạn định nhảy vào vũng bùn, bạn phải mang ủng. Peppa Pig rất thích chăm sóc em trai George của mình.",
        "keywords": [
          "如果"
        ],
        "blankIndices": [
          0,
          15,
          30
        ]
      },
      {
        "id": 8,
        "startTime": 92.61,
        "endTime": 101.95,
        "hanzi": "好了乔治",
        "pinyin": "hǎo le qiáo zhì",
        "meaning": "được rồi George",
        "keywords": [
          "好了"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 9,
        "startTime": 101.95,
        "endTime": 113.05,
        "hanzi": "我们再去找几个泥坑跳吧佩奇和乔治玩得很开心",
        "pinyin": "wǒ men zài qù zhǎo jǐ gè ní kēng tiào ba pèi qí hé qiáo zhì wán dé hěn kāi xīn",
        "meaning": "Hãy tìm thêm hố bùn để nhảy vào nhé. Peppa và George đã có khoảng thời gian vui vẻ.",
        "keywords": [
          "我们"
        ],
        "blankIndices": [
          0,
          10,
          20
        ]
      },
      {
        "id": 10,
        "startTime": 113.05,
        "endTime": 119.11,
        "hanzi": "佩奇找到了一个小泥坑乔治找到了一个大泥坑",
        "pinyin": "pèi qí zhǎo dào le yí gè xiǎo ní kēng qiáo zhì zhǎo dào le yí gè dà ní kēng",
        "meaning": "Peppa Pig tìm thấy một vũng bùn nhỏ. George tìm thấy một vũng bùn lớn.",
        "keywords": [
          "佩奇"
        ],
        "blankIndices": [
          0,
          10,
          19
        ]
      },
      {
        "id": 11,
        "startTime": 122.61,
        "endTime": 133.33,
        "hanzi": "你看乔治那里有个很大的泥坑",
        "pinyin": "nǐ kàn qiáo zhì nà lǐ yǒu gè hěn dà de ní kēng",
        "meaning": "Bạn thấy có một vũng bùn lớn ở đó George",
        "keywords": [
          "你看"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 12,
        "startTime": 133.33,
        "endTime": 142.29,
        "hanzi": "乔治想第一个跳到泥坑里去玩等一下乔治",
        "pinyin": "qiáo zhì xiǎng dì yī gè tiào dào ní kēng lǐ qù wán děng yí xià qiáo zhì",
        "meaning": "George muốn là người đầu tiên nhảy xuống vũng bùn và chơi đùa. Đợi một chút, George.",
        "keywords": [
          "乔治"
        ],
        "blankIndices": [
          0,
          9,
          17
        ]
      },
      {
        "id": 13,
        "startTime": 142.29,
        "endTime": 158.06,
        "hanzi": "我得先检查一下这里安不安全很好你可以放心地玩了对不起乔治,只是掀泥而已",
        "pinyin": "wǒ dé xiān jiǎn chá yí xià zhè lǐ ān bu ān quán hěn hǎo nǐ kě yǐ fàng xīn dì wán le duì bù qǐ qiáo zhì , zhǐ shì xiān ní ér yǐ",
        "meaning": "Đầu tiên tôi phải kiểm tra xem ở đây có an toàn không. Bạn có thể chơi với sự tự tin. Xin lỗi George, đó chỉ là bùn thôi.",
        "keywords": [
          "我得"
        ],
        "blankIndices": [
          0,
          17,
          33
        ]
      },
      {
        "id": 14,
        "startTime": 158.06,
        "endTime": 171.78,
        "hanzi": "佩奇和乔治喜欢在泥坑里跳来跳去",
        "pinyin": "pèi qí hé qiáo zhì xǐ huan zài ní kēng lǐ tiào lái tiào qù",
        "meaning": "Peppa và George thích nhảy trong vũng nước",
        "keywords": [
          "佩奇"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 15,
        "startTime": 177.46,
        "endTime": 189.26,
        "hanzi": "来吧 乔治 我们快点去给爸爸看看吧我的老天哪",
        "pinyin": "lái ba   qiáo zhì   wǒ men kuài diǎn qù gěi bà ba kàn kàn ba wǒ de lǎo tiān nǎ",
        "meaning": "Thôi nào, George, hãy đi khoe với bố đi, ôi Chúa ơi.",
        "keywords": [
          "来吧"
        ],
        "blankIndices": [
          0,
          10,
          19
        ]
      },
      {
        "id": 16,
        "startTime": 189.26,
        "endTime": 198.72,
        "hanzi": "爸爸 爸爸 你猜猜我们刚才干了什么让我猜一猜 你们刚才看电视了不对 你猜错了",
        "pinyin": "bà ba   bà ba   nǐ cāi cāi wǒ men gāng cái gān le shén me ràng wǒ cāi yi cāi   nǐ men gāng cái kàn diàn shì le bú duì   nǐ cāi cuò le",
        "meaning": "Bố, bố đoán xem chúng ta vừa làm gì nào. Hãy để tôi đoán. Bạn vừa xem TV phải không? Bạn đoán sai rồi.",
        "keywords": [
          "爸爸"
        ],
        "blankIndices": [
          0,
          17,
          33
        ]
      },
      {
        "id": 17,
        "startTime": 198.72,
        "endTime": 207.32,
        "hanzi": "你们刚才洗澡了不对 不对我知道了",
        "pinyin": "nǐ men gāng cái xǐ zǎo le bú duì   bú duì wǒ zhī dào le",
        "meaning": "Bạn vừa tắm xong. Đúng không? Tôi biết điều đó là sai.",
        "keywords": [
          "你们"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 18,
        "startTime": 207.32,
        "endTime": 217.58,
        "hanzi": "你们刚才在泥坑里跳来跳去没错没错爸爸我们在泥坑里跳来跳去看看你们弄得多脏啊",
        "pinyin": "nǐ men gāng cái zài ní kēng lǐ tiào lái tiào qù méi cuò méi cuò bà ba wǒ men zài ní kēng lǐ tiào lái tiào qù kàn kàn nǐ men nòng dé duō zāng a",
        "meaning": "Vừa rồi bạn đang nhảy lên nhảy xuống vũng bùn. Đúng vậy. Bố ơi, hãy nhảy lên nhảy xuống vũng bùn xem bố bẩn đến mức nào nhé.",
        "keywords": [
          "你们"
        ],
        "blankIndices": [
          0,
          18,
          36
        ]
      },
      {
        "id": 19,
        "startTime": 217.58,
        "endTime": 236.19,
        "hanzi": "糟糕没事只是些泥而已快清理干净别让妈妈看到你们这么脏爸爸我们清理乾淨之後你和妈妈也会一起來玩嗎是的 我们都可以在花園玩",
        "pinyin": "zāo gāo méi shì zhǐ shì xiē ní ér yǐ kuài qīng lǐ gān jìng bié ràng mā ma kàn dào nǐ men zhè me zāng bà ba wǒ men qīng lǐ qián jìng zhī hòu nǐ hé mā ma yě huì yì qǐ lái wán má shì de   wǒ men dōu kě yǐ zài huā yuán wán",
        "meaning": "Rất tiếc, không sao đâu, chỉ là bùn thôi. Làm sạch nó nhanh chóng. Đừng để mẹ thấy con bẩn thỉu thế nào. Bố, sau khi dọn dẹp xong bố và mẹ có đến chơi cùng nhau không? Vâng, tất cả chúng ta đều có thể chơi trong vườn.",
        "keywords": [
          "糟糕"
        ],
        "blankIndices": [
          0,
          29,
          57
        ]
      },
      {
        "id": 20,
        "startTime": 236.19,
        "endTime": 245.69,
        "hanzi": "佩琪和喬治穿著他们的靴子",
        "pinyin": "pèi qí hé qiáo zhì chuān zhù tā men de xuē zǐ",
        "meaning": "Peppa Pig và George đi bốt",
        "keywords": [
          "佩琪"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 21,
        "startTime": 245.69,
        "endTime": 256.67,
        "hanzi": "猪妈妈和猪爸爸也穿著他们的靴子佩琪喜欢在泥坑裡跳來跳去大家都喜欢在泥坑里跳来跳去",
        "pinyin": "zhū mā ma hé zhū bà ba yě chuān zhù tā men de xuē zǐ pèi qí xǐ huan zài ní kēng lǐ tiào lái tiào qù dà jiā dōu xǐ huan zài ní kēng lǐ tiào lái tiào qù",
        "meaning": "Lợn Mẹ và Lợn Bố cũng đi bốt. Peppa Pig thích nhảy vào vũng bùn. Mọi người đều thích nhảy vào vũng bùn.",
        "keywords": [
          "猪妈"
        ],
        "blankIndices": [
          0,
          20,
          39
        ]
      },
      {
        "id": 22,
        "startTime": 256.67,
        "endTime": 266.67,
        "hanzi": "看那猪爸爸",
        "pinyin": "kàn nà zhū bà ba",
        "meaning": "Nhìn con heo bố kìa",
        "keywords": [
          "看那"
        ],
        "blankIndices": [
          0,
          2
        ]
      }
    ]
  },
  {
    "id": "dict_lesson_4",
    "title": "Hội Thoại Mua Sắm & Trả Giá HSK 2 (买衣服与讨价还价)",
    "youtubeId": "Asqr_Sz9wVM",
    "duration": "08:46",
    "level": "2",
    "levelText": "HSK 2 - 3 (Thực Tế)",
    "category": "Đời Sống",
    "thumbnail": "https://img.youtube.com/vi/Asqr_Sz9wVM/hqdefault.jpg",
    "description": "Các mẫu câu tiếng Trung đi chợ, mua sắm quần áo, hỏi giá tiền và mặc cả chiết khấu thực tế.",
    "sentences": [
      {
        "id": 1,
        "startTime": 0.2,
        "endTime": 15.32,
        "hanzi": "大家好,今天我们一起来听一段既长又有趣的对话主题是在商店购物在这段对话里,你们会学到很多和衣服、鞋子、配饰相关的词汇",
        "pinyin": "dà jiā hǎo , jīn tiān wǒ men yì qǐ lái tīng yí duàn jì cháng yòu yǒu qù de duì huà zhǔ tí shì zài shāng diàn gòu wù zài zhè duàn duì huà lǐ , nǐ men huì xué dào hěn duō hé yī fu 、 xié zǐ 、 pèi shì xiāng guān de cí huì",
        "meaning": "Xin chào mọi người, hôm nay chúng ta sẽ nghe một cuộc trò chuyện dài và thú vị về việc mua sắm trong cửa hàng. Trong cuộc trò chuyện này, bạn sẽ học được rất nhiều từ vựng liên quan đến quần áo, giày dép và phụ kiện.",
        "keywords": [
          "大家"
        ],
        "blankIndices": [
          0,
          28,
          55
        ]
      },
      {
        "id": 2,
        "startTime": 15.32,
        "endTime": 27.58,
        "hanzi": "以及用中文询问价格、试穿和结账的方法这是日常生活中非常常见的场景一定能帮助大家快速提高中文交流能力",
        "pinyin": "yǐ jí yòng zhōng wén xún wèn jià gé 、 shì chuān hé jié zhàng de fāng fǎ zhè shì rì cháng shēng huó zhōng fēi cháng cháng jiàn de chǎng jǐng yí dìng néng bāng zhù dà jiā kuài sù tí gāo zhōng wén jiāo liú néng lì",
        "meaning": "Và cách hỏi giá, thử quần áo và thanh toán bằng tiếng Trung. Đây là những cảnh rất thường gặp trong cuộc sống hàng ngày và chắc chắn sẽ giúp mọi người cải thiện khả năng giao tiếp tiếng Trung của mình một cách nhanh chóng.",
        "keywords": [
          "以及"
        ],
        "blankIndices": [
          0,
          24,
          48
        ]
      },
      {
        "id": 3,
        "startTime": 27.58,
        "endTime": 38.44,
        "hanzi": "好了,现在就让我们开始欣赏这段对话吧您好,我今天来商店是因为听说有特别促销活动",
        "pinyin": "hǎo le , xiàn zài jiù ràng wǒ men kāi shǐ xīn shǎng zhè duàn duì huà ba nín hǎo , wǒ jīn tiān lái shāng diàn shì yīn wèi tīng shuō yǒu tè bié cù xiāo huó dòng",
        "meaning": "Được rồi, bây giờ hãy bắt đầu tận hưởng cuộc trò chuyện này. Xin chào, hôm nay tôi đến cửa hàng vì nghe nói có khuyến mãi đặc biệt.",
        "keywords": [
          "好了"
        ],
        "blankIndices": [
          0,
          18,
          36
        ]
      },
      {
        "id": 4,
        "startTime": 38.44,
        "endTime": 40.94,
        "hanzi": "不知道现在还有很多商品吗?",
        "pinyin": "bù zhī dào xiàn zài hái yǒu hěn duō shāng pǐn ma ?",
        "meaning": "Bạn không biết hiện nay có rất nhiều sản phẩm phải không?",
        "keywords": [
          "不知"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 5,
        "startTime": 41.94,
        "endTime": 51.82,
        "hanzi": "是的,我们商店正在进行大促销从衣服、鞋子到家用电器都有优惠您要不要看一下详细目录?",
        "pinyin": "shì de , wǒ men shāng diàn zhèng zài jìn xíng dà cù xiāo cóng yī fú 、 xié zǐ dào jiā yòng diàn qì dōu yǒu yōu huì nín yào bu yào kàn yí xià xiáng xì mù lù ?",
        "meaning": "Vâng, cửa hàng của chúng tôi đang có đợt giảm giá lớn. Chúng tôi có giảm giá cho quần áo, giày dép và đồ gia dụng. Bạn có muốn xem qua danh mục chi tiết không?",
        "keywords": [
          "是的"
        ],
        "blankIndices": [
          0,
          19,
          38
        ]
      },
      {
        "id": 6,
        "startTime": 52.38,
        "endTime": 62.1,
        "hanzi": "我最关心的是男士上班穿的衬衫要颜色大方不料透气不知道现在有没有新款到货有的",
        "pinyin": "wǒ zuì guān xīn de shì nán shì shàng bān chuān de chèn shān yào yán sè dà fāng bú liào tòu qì bù zhī dào xiàn zài yǒu méi yǒu xīn kuǎn dào huò yǒu de",
        "meaning": "Điều tôi quan tâm nhất là áo sơ mi nam mặc đi làm phải có màu sắc đẹp, không chất liệu, thoáng mát. Cho em hỏi hiện nay có mẫu mới không ạ?",
        "keywords": [
          "我最"
        ],
        "blankIndices": [
          0,
          18,
          36
        ]
      },
      {
        "id": 7,
        "startTime": 62.1,
        "endTime": 70.74,
        "hanzi": "这周刚到一批高档纯棉衬衫款式时尚现在正在打七折你要不要试试看",
        "pinyin": "zhè zhōu gāng dào yì pī gāo dàng chún mián chèn shān kuǎn shì shí shàng xiàn zài zhèng zài dǎ qī zhé nǐ yào bu yào shì shì kàn",
        "meaning": "Lô áo sơ mi cotton nguyên chất cao cấp với kiểu dáng thời trang vừa cập bến tuần này và hiện đang được giảm giá 30%. Bạn có muốn thử chúng không?",
        "keywords": [
          "这周"
        ],
        "blankIndices": [
          0,
          15,
          29
        ]
      },
      {
        "id": 8,
        "startTime": 70.74,
        "endTime": 81.42,
        "hanzi": "听起来不错不过在事之前我想问一下这些衬衫的原价大概是多少每件原价大概八百块钱",
        "pinyin": "tīng qǐ lái bú cuò bú guò zài shì zhī qián wǒ xiǎng wèn yí xià zhè xiē chèn shān de yuán jià dà gài shì duō shǎo měi jiàn yuán jià dà gài bā bǎi kuài qián",
        "meaning": "Nghe hay đấy, nhưng trước khi làm bất cứ điều gì, tôi muốn hỏi về giá gốc của những chiếc áo này. Giá ban đầu là khoảng 800 nhân dân tệ mỗi chiếc.",
        "keywords": [
          "听起"
        ],
        "blankIndices": [
          0,
          19,
          37
        ]
      },
      {
        "id": 9,
        "startTime": 81.42,
        "endTime": 90,
        "hanzi": "但这次活动只要五百多而且保证是正品那我想试一件浅蓝色的Elma",
        "pinyin": "dàn zhè cì huó dòng zhī yào wǔ bǎi duō ér qiě bǎo zhèng shì zhèng pǐn nà wǒ xiǎng shì yí jiàn qiǎn lán sè de E l m a",
        "meaning": "Nhưng sự kiện này chỉ tốn hơn 500 và đảm bảo là hàng thật. Sau đó tôi muốn thử một chiếc Elma màu xanh nhạt.",
        "keywords": [
          "但这"
        ],
        "blankIndices": [
          0,
          15,
          30
        ]
      },
      {
        "id": 10,
        "startTime": 90,
        "endTime": 100.58,
        "hanzi": "因为我平时上班穿想选个比较正式的颜色好的请稍等一下我给你拿一件浅蓝色Elma的衬衫",
        "pinyin": "yīn wèi wǒ píng shí shàng bān chuān xiǎng xuǎn gè bǐ jiào zhèng shì de yán sè hǎo de qǐng shāo děng yí xià wǒ gěi nǐ ná yí jiàn qiǎn lán sè E l m a de chèn shān",
        "meaning": "Vì tôi thường mặc nó đi làm nên tôi muốn chọn màu trang trọng hơn. Hãy đợi một lát tôi sẽ mang cho bạn một chiếc áo sơ mi Elma màu xanh nhạt.",
        "keywords": [
          "因为"
        ],
        "blankIndices": [
          0,
          20,
          40
        ]
      },
      {
        "id": 11,
        "startTime": 100.58,
        "endTime": 109.4,
        "hanzi": "你可以马上到十一间试穿谢谢你在等待的时候我还想看看皮鞋适合上班穿的",
        "pinyin": "nǐ kě yǐ mǎ shàng dào shí yī jiān shì chuān xiè xiè nǐ zài děng dài de shí hòu wǒ hái xiǎng kàn kàn pí xié shì hé shàng bān chuān de",
        "meaning": "Bạn có thể đến phòng 11 để thử ngay. Cảm ơn. Trong khi chờ đợi, tôi cũng muốn xem giày da nào phù hợp để đi làm.",
        "keywords": [
          "你可"
        ],
        "blankIndices": [
          0,
          16,
          32
        ]
      },
      {
        "id": 12,
        "startTime": 109.4,
        "endTime": 122.6,
        "hanzi": "不要太复杂但一定要舒服我们这里有很多新款皮鞋,大部分是真皮的,设计简洁大方,适合上班或者参加宴会穿",
        "pinyin": "bú yào tài fù zá dàn yí dìng yào shū fú wǒ men zhè lǐ yǒu hěn duō xīn kuǎn pí xié , dà bù fen shì zhēn pí de , shè jì jiǎn jié dà fāng , shì hé shàng bān huò zhě cān jiā yàn huì chuān",
        "meaning": "Đừng quá phức tạp nhưng phải thoải mái. Ở đây chúng tôi có rất nhiều giày da mới, đa số là da thật, kiểu dáng đơn giản, sang trọng, thích hợp đi làm hoặc đi dự tiệc.",
        "keywords": [
          "不要"
        ],
        "blankIndices": [
          0,
          23,
          45
        ]
      },
      {
        "id": 13,
        "startTime": 122.6,
        "endTime": 137.48,
        "hanzi": "那你能不能给我推荐一款最近一个月卖得最好的鞋子,让我参考一下?好的,深棕色的皮鞋卖得非常火因为很容易搭配鞋型标准",
        "pinyin": "nà nǐ néng bu néng gěi wǒ tuī jiàn yì kuǎn zuì jìn yí gè yuè mài dé zuì hǎo de xié zǐ , ràng wǒ cān kǎo yí xià ? hǎo de , shēn zōng sè de pí xié mài dé fēi cháng huǒ yīn wèi hěn róng yì dā pèi xié xíng biāo zhǔn",
        "meaning": "Bạn có thể giới thiệu cho tôi một trong những đôi giày bán chạy nhất trong tháng qua để tôi tham khảo được không? Được rồi, giày da màu nâu sẫm đang rất được ưa chuộng vì rất dễ kết hợp với những kiểu giày tiêu chuẩn.",
        "keywords": [
          "那你"
        ],
        "blankIndices": [
          0,
          26,
          52
        ]
      },
      {
        "id": 14,
        "startTime": 137.48,
        "endTime": 146.62,
        "hanzi": "鞋垫柔软穿一整天也不会脚痛听起来挺不错我平时穿42码不知道这款",
        "pinyin": "xié diàn róu ruǎn chuān yì zhěng tiān yě bú huì jiǎo tòng tīng qǐ lái tǐng bú cuò wǒ píng shí chuān 4 2 mǎ bù zhī dào zhè kuǎn",
        "meaning": "Đế giày mềm mại, có thể mang cả ngày mà không bị đau chân. Nghe có vẻ hay đấy. Tôi thường mặc size 42 nhưng tôi không biết về cỡ này.",
        "keywords": [
          "鞋垫"
        ],
        "blankIndices": [
          0,
          15,
          30
        ]
      },
      {
        "id": 15,
        "startTime": 146.62,
        "endTime": 156,
        "hanzi": "有没有我的尺码还有没有活动优惠有的42码还有货而且这款现在有85折优惠",
        "pinyin": "yǒu méi yǒu wǒ de chǐ mǎ hái yǒu méi yǒu huó dòng yōu huì yǒu de 4 2 mǎ hái yǒu huò ér qiě zhè kuǎn xiàn zài yǒu 8 5 zhé yōu huì",
        "meaning": "Có bất kỳ giảm giá nào trong kích thước của tôi không? Một số cỡ 42 vẫn còn trong kho và chiếc này hiện đang được giảm giá 15%.",
        "keywords": [
          "有没"
        ],
        "blankIndices": [
          0,
          17,
          34
        ]
      },
      {
        "id": 16,
        "startTime": 156,
        "endTime": 165.48,
        "hanzi": "如果你和衬衫一起买还可以再送优惠券那太好了我想直接看看42码的深棕色皮鞋",
        "pinyin": "rú guǒ nǐ hé chèn shān yì qǐ mǎi hái kě yǐ zài sòng yōu huì quàn nà tài hǎo le wǒ xiǎng zhí jiē kàn kàn 4 2 mǎ de shēn zōng sè pí xié",
        "meaning": "Nếu mua kèm áo, bạn có thể nhận được phiếu giảm giá, thật tuyệt. Mình muốn nhìn thẳng vào đôi giày da màu nâu đậm size 42.",
        "keywords": [
          "如果"
        ],
        "blankIndices": [
          0,
          18,
          35
        ]
      },
      {
        "id": 17,
        "startTime": 165.48,
        "endTime": 175.22,
        "hanzi": "如果满意的话就和衬衫一起买在这里你可以在试衣间里试穿我们有大镜子和椅子",
        "pinyin": "rú guǒ mǎn yì de huà jiù hé chèn shān yì qǐ mǎi zài zhè lǐ nǐ kě yǐ zài shì yī jiān lǐ shì chuān wǒ men yǒu dà jìng zi hé yǐ zi",
        "meaning": "Nếu thích thì mua kèm áo ở đây nhé. Bạn có thể thử nó trong phòng thử đồ. Chúng tôi có một cái gương lớn và một cái ghế.",
        "keywords": [
          "如果"
        ],
        "blankIndices": [
          0,
          17,
          34
        ]
      },
      {
        "id": 18,
        "startTime": 175.22,
        "endTime": 185.42,
        "hanzi": "方便顾客试鞋谢谢你我现在就去试不过顺便问一下商店有没有卖和皮鞋配套的男士皮带",
        "pinyin": "fāng biàn gù kè shì xié xiè xiè nǐ wǒ xiàn zài jiù qù shì bú guò shùn biàn wèn yí xià shāng diàn yǒu méi yǒu mài hé pí xié pèi tào de nán shì pí dài",
        "meaning": "Thuận tiện cho khách hàng thử giày. Cảm ơn. Tôi sẽ thử nó ngay bây giờ. Nhưng nhân tiện cho mình hỏi cửa hàng có bán thắt lưng nam hợp với giày da không.",
        "keywords": [
          "方便"
        ],
        "blankIndices": [
          0,
          19,
          37
        ]
      },
      {
        "id": 19,
        "startTime": 185.42,
        "endTime": 197.38,
        "hanzi": "当然有,我们还经常整套进货,包括皮鞋、皮带和皮夹,很多顾客喜欢成套买,既方便又省钱",
        "pinyin": "dāng rán yǒu , wǒ men hái jīng cháng zhěng tào jìn huò , bāo kuò pí xié 、 pí dài hé pí jiā , hěn duō gù kè xǐ huan chéng tào mǎi , jì fāng biàn yòu shěng qián",
        "meaning": "Tất nhiên, chúng tôi thường mua những bộ hoàn chỉnh, bao gồm giày da, thắt lưng và ví. Nhiều khách hàng thích mua theo bộ, vừa tiện lợi vừa tiết kiệm chi phí.",
        "keywords": [
          "当然"
        ],
        "blankIndices": [
          0,
          18,
          36
        ]
      },
      {
        "id": 20,
        "startTime": 197.38,
        "endTime": 204.74,
        "hanzi": "那太合适了,如果买整套的话,价格会有更多优惠吗?还是和单买一样?",
        "pinyin": "nà tài hé shì le , rú guǒ mǎi zhěng tào de huà , jià gé huì yǒu gèng duō yōu huì ma ? hái shì hé dān mǎi yí yàng ?",
        "meaning": "Điều đó thật hoàn hảo. Nếu mua cả bộ thì giá có ưu đãi hơn không? Hay nó sẽ giống như mua riêng lẻ?",
        "keywords": [
          "那太"
        ],
        "blankIndices": [
          0,
          14,
          27
        ]
      },
      {
        "id": 21,
        "startTime": 205.78,
        "endTime": 214.92,
        "hanzi": "如果你买鞋、皮带和皮夹一整套,可以在总价的基础上再打九折,算是对老顾客的回馈",
        "pinyin": "rú guǒ nǐ mǎi xié 、 pí dài hé pí jiā yì zhěng tào , kě yǐ zài zǒng jià de jī chǔ shàng zài dǎ jiǔ zhé , suàn shì duì lǎo gù kè de huí kuì",
        "meaning": "Nếu bạn mua trọn bộ giày, thắt lưng và ví, bạn có thể được giảm thêm 10% trên tổng giá, đây được coi là phản hồi dành cho khách hàng cũ.",
        "keywords": [
          "如果"
        ],
        "blankIndices": [
          0,
          18,
          35
        ]
      },
      {
        "id": 22,
        "startTime": 214.92,
        "endTime": 224.44,
        "hanzi": "听起来很吸引人,我要考虑一下不过请问,如果尺码不合适或者商品有问题退换政策是怎样的?",
        "pinyin": "tīng qǐ lái hěn xī yǐn rén , wǒ yào kǎo lǜ yí xià bú guò qǐng wèn , rú guǒ chǐ mǎ bù hé shì huò zhě shāng pǐn yǒu wèn tí tuì huàn zhèng cè shì zěn yàng de ?",
        "meaning": "Nghe có vẻ hấp dẫn, tôi sẽ suy nghĩ kỹ nhưng chính sách hoàn trả nếu không vừa kích thước hoặc nếu hàng bị lỗi là gì?",
        "keywords": [
          "听起"
        ],
        "blankIndices": [
          0,
          19,
          38
        ]
      }
    ]
  },
  {
    "id": "dict_lesson_5",
    "title": "Bài Hát Ngọt Ngào (甜蜜蜜 - Tian Mi Mi)",
    "youtubeId": "5eF8oOWtsk4",
    "duration": "03:35",
    "level": "2",
    "levelText": "HSK 2 - 3 (Kinh Điển)",
    "category": "Âm Nhạc",
    "thumbnail": "https://img.youtube.com/vi/5eF8oOWtsk4/hqdefault.jpg",
    "description": "Tuyệt phẩm âm nhạc Hoa ngữ kinh điển của Đặng Lệ Quân với lời ca trong trẻo, từ vựng lãng mạn dễ nghe dễ nhớ.",
    "sentences": [
      {
        "id": 1,
        "startTime": 30,
        "endTime": 40.88,
        "hanzi": "在风里在哪里在哪里见过你",
        "pinyin": "zài fēng lǐ zài nǎ lǐ zài nǎ lǐ jiàn guò nǐ",
        "meaning": "Tôi đã nhìn thấy bạn ở đâu trong gió?",
        "keywords": [
          "在风"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 2,
        "startTime": 40.88,
        "endTime": 49.7,
        "hanzi": "你的笑容这样熟悉我一时想不起",
        "pinyin": "nǐ de xiào róng zhè yàng shú xī wǒ yì shí xiǎng bù qǐ",
        "meaning": "Nụ cười của em quen đến nỗi phút chốc anh không thể nhớ được",
        "keywords": [
          "你的"
        ],
        "blankIndices": [
          0,
          7,
          13
        ]
      },
      {
        "id": 3,
        "startTime": 49.7,
        "endTime": 57.24,
        "hanzi": "啊 在梦里",
        "pinyin": "a   zài mèng lǐ",
        "meaning": "À trong giấc mơ",
        "keywords": [
          "啊 "
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 4,
        "startTime": 60,
        "endTime": 74.2,
        "hanzi": "梦里梦里见过你甜蜜笑得多甜蜜",
        "pinyin": "mèng lǐ mèng lǐ jiàn guò nǐ tián mì xiào dé duō tián mì",
        "meaning": "Anh đã gặp em trong giấc mơ, nụ cười em thật ngọt ngào làm sao",
        "keywords": [
          "梦里"
        ],
        "blankIndices": [
          0,
          7,
          13
        ]
      },
      {
        "id": 5,
        "startTime": 74.2,
        "endTime": 89.86,
        "hanzi": "是你是你梦见的就是你在哪里在哪里见过你",
        "pinyin": "shì nǐ shì nǐ mèng jiàn de jiù shì nǐ zài nǎ lǐ zài nǎ lǐ jiàn guò nǐ",
        "meaning": "Chính em, chính em là người đã mơ về điều đó, chính em là nơi anh đã nhìn thấy em",
        "keywords": [
          "是你"
        ],
        "blankIndices": [
          0,
          9,
          18
        ]
      },
      {
        "id": 6,
        "startTime": 89.86,
        "endTime": 98.54,
        "hanzi": "你的笑容这样熟悉我一时想不起",
        "pinyin": "nǐ de xiào róng zhè yàng shú xī wǒ yì shí xiǎng bù qǐ",
        "meaning": "Nụ cười của em quen đến nỗi phút chốc anh không thể nhớ được",
        "keywords": [
          "你的"
        ],
        "blankIndices": [
          0,
          7,
          13
        ]
      },
      {
        "id": 7,
        "startTime": 98.54,
        "endTime": 106.55,
        "hanzi": "啊 在梦里",
        "pinyin": "a   zài mèng lǐ",
        "meaning": "À trong giấc mơ",
        "keywords": [
          "啊 "
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 8,
        "startTime": 126.55,
        "endTime": 140.03,
        "hanzi": "在哪里在哪里见过你你的笑容这样熟悉",
        "pinyin": "zài nǎ lǐ zài nǎ lǐ jiàn guò nǐ nǐ de xiào róng zhè yàng shú xī",
        "meaning": "Tôi đã gặp bạn ở đâu trước đây? Nụ cười của bạn quen quá.",
        "keywords": [
          "在哪"
        ],
        "blankIndices": [
          0,
          8,
          16
        ]
      },
      {
        "id": 9,
        "startTime": 140.03,
        "endTime": 151.67,
        "hanzi": "我一时想不起啊 在梦里",
        "pinyin": "wǒ yì shí xiǎng bù qǐ a   zài mèng lǐ",
        "meaning": "Tạm thời tôi không thể nhớ được. Trong giấc mơ của tôi",
        "keywords": [
          "我一"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 10,
        "startTime": 151.67,
        "endTime": 167.05,
        "hanzi": "梦里梦里见过你甜蜜笑得多甜蜜",
        "pinyin": "mèng lǐ mèng lǐ jiàn guò nǐ tián mì xiào dé duō tián mì",
        "meaning": "Anh đã gặp em trong giấc mơ, nụ cười em thật ngọt ngào làm sao",
        "keywords": [
          "梦里"
        ],
        "blankIndices": [
          0,
          7,
          13
        ]
      },
      {
        "id": 11,
        "startTime": 167.05,
        "endTime": 176.07,
        "hanzi": "是你 是你梦见的就是你",
        "pinyin": "shì nǐ   shì nǐ mèng jiàn de jiù shì nǐ",
        "meaning": "Chính là em, chính là em mà anh đã mơ ước",
        "keywords": [
          "是你"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 12,
        "startTime": 176.07,
        "endTime": 188.73,
        "hanzi": "在哪里 在哪里见过你你的笑容这样熟悉",
        "pinyin": "zài nǎ lǐ   zài nǎ lǐ jiàn guò nǐ nǐ de xiào róng zhè yàng shú xī",
        "meaning": "Tôi đã nhìn thấy bạn ở đâu? Nụ cười của bạn quen quá.",
        "keywords": [
          "在哪"
        ],
        "blankIndices": [
          0,
          8,
          16
        ]
      },
      {
        "id": 13,
        "startTime": 188.73,
        "endTime": 200.47,
        "hanzi": "我一时想不起安在梦里",
        "pinyin": "wǒ yì shí xiǎng bù qǐ ān zài mèng lǐ",
        "meaning": "Tôi không thể nhớ Ẩn trong giấc mơ dù chỉ một giây phút",
        "keywords": [
          "我一"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      }
    ]
  },
  {
    "id": "dict_lesson_6",
    "title": "Hội Thoại Đặt Bàn & Gọi Món Nhà Hàng (在餐厅点菜)",
    "youtubeId": "0MZIImblEHc",
    "duration": "05:06",
    "level": "3",
    "levelText": "HSK 3 (Ẩm Thực)",
    "category": "Ẩm Thực",
    "thumbnail": "https://img.youtube.com/vi/0MZIImblEHc/hqdefault.jpg",
    "description": "Luyện nghe chép chính tả chủ đề ăn uống, gọi món, chọn khẩu vị và thanh toán tại nhà hàng Trung Hoa.",
    "sentences": [
      {
        "id": 1,
        "startTime": 101.57,
        "endTime": 104.31,
        "hanzi": "你们这里有什么特色菜?",
        "pinyin": "nǐ men zhè lǐ yǒu shén me tè sè cài ?",
        "meaning": "Ở đây có món gì đặc biệt?",
        "keywords": [
          "你们"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 2,
        "startTime": 105.21,
        "endTime": 107.75,
        "hanzi": "北京烤鸭是这里的名菜。",
        "pinyin": "běi jīng kǎo yā shì zhè lǐ de míng cài 。",
        "meaning": "Vịt quay Bắc Kinh là món ăn nổi tiếng ở đây.",
        "keywords": [
          "北京"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 3,
        "startTime": 109.03,
        "endTime": 113.33,
        "hanzi": "那就来一只烤鸭。好的,还要什么吗?",
        "pinyin": "nà jiù lái yì zhī kǎo yā 。 hǎo de , hái yào shén me ma ?",
        "meaning": "Sau đó có một con vịt quay. Được rồi, còn gì nữa không?",
        "keywords": [
          "那就"
        ],
        "blankIndices": [
          0,
          7,
          13
        ]
      },
      {
        "id": 4,
        "startTime": 114.55,
        "endTime": 119.33,
        "hanzi": "再来两碗小米粥。好,要什么饮料吗?",
        "pinyin": "zài lái liǎng wǎn xiǎo mǐ zhōu 。 hǎo , yào shén me yǐn liào ma ?",
        "meaning": "Thêm hai bát cháo kê. Được rồi, bạn có muốn uống gì không?",
        "keywords": [
          "再来"
        ],
        "blankIndices": [
          0,
          7,
          13
        ]
      },
      {
        "id": 5,
        "startTime": 120.21,
        "endTime": 124.21,
        "hanzi": "我要一杯苹果汁。我来点啤酒吧。",
        "pinyin": "wǒ yào yì bēi píng guǒ zhī 。 wǒ lái diǎn pí jiǔ bā 。",
        "meaning": "Tôi muốn một ly nước táo. Cho tôi uống chút bia nhé.",
        "keywords": [
          "我要"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 6,
        "startTime": 128.51,
        "endTime": 131.39,
        "hanzi": "你们的菜上来了,请慢用。",
        "pinyin": "nǐ men de cài shàng lái le , qǐng màn yòng 。",
        "meaning": "Thức ăn của bạn ở đây, xin vui lòng dành thời gian.",
        "keywords": [
          "你们"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 7,
        "startTime": 131.57,
        "endTime": 141.97,
        "hanzi": "谢谢你觉得这里的菜怎么样",
        "pinyin": "xiè xiè nǐ jué de zhè lǐ de cài zěn me yàng",
        "meaning": "Cảm ơn bạn, bạn thấy đồ ăn ở đây thế nào?",
        "keywords": [
          "谢谢"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 8,
        "startTime": 141.97,
        "endTime": 147.97,
        "hanzi": "我觉得非常可口嗯 我也觉得很好吃",
        "pinyin": "wǒ jué de fēi cháng kě kǒu ǹg   wǒ yě jué de hěn hǎo chī",
        "meaning": "Tôi nghĩ nó rất ngon. Tôi nghĩ nó cũng ngon.",
        "keywords": [
          "我觉"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 9,
        "startTime": 160.23,
        "endTime": 164.39,
        "hanzi": "这是您的账单。好,我先看一下。",
        "pinyin": "zhè shì nín de zhàng dān 。 hǎo , wǒ xiān kàn yí xià 。",
        "meaning": "Đây là hóa đơn của bạn. Được rồi, hãy để tôi xem xét trước.",
        "keywords": [
          "这是"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 10,
        "startTime": 165.61,
        "endTime": 169.33,
        "hanzi": "没什么问题。您想怎么付款?",
        "pinyin": "méi shén me wèn tí 。 nín xiǎng zěn me fù kuǎn ?",
        "meaning": "Không có gì. Bạn muốn thanh toán như thế nào?",
        "keywords": [
          "没什"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 11,
        "startTime": 171.05,
        "endTime": 173.75,
        "hanzi": "微信支付可以吗?当然可以。",
        "pinyin": "wēi xìn zhī fù kě yǐ ma ? dāng rán kě yǐ 。",
        "meaning": "Có thể thanh toán qua WeChat không? Tất nhiên rồi.",
        "keywords": [
          "微信"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 12,
        "startTime": 174.39,
        "endTime": 176.87,
        "hanzi": "您可以扫描这上面的二维码。",
        "pinyin": "nín kě yǐ sǎo miáo zhè shàng miàn de èr wéi mǎ 。",
        "meaning": "Bạn có thể quét mã QR ở trên.",
        "keywords": [
          "您可"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 13,
        "startTime": 178.15,
        "endTime": 192.05,
        "hanzi": "支付成功了好的,谢谢现在我们一起学习几句重要的词",
        "pinyin": "zhī fù chéng gōng le hǎo de , xiè xiè xiàn zài wǒ men yì qǐ xué xí jǐ jù zhòng yào de cí",
        "meaning": "Thanh toán đã thành công. Được rồi, cảm ơn bạn. Bây giờ chúng ta cùng nhau học một vài từ quan trọng nhé.",
        "keywords": [
          "支付"
        ],
        "blankIndices": [
          0,
          11,
          22
        ]
      },
      {
        "id": 14,
        "startTime": 192.05,
        "endTime": 201.59,
        "hanzi": "当迈克电话打电话他说了什么他说了我想预定星期六晚上的座位",
        "pinyin": "dāng mài kè diàn huà dǎ diàn huà tā shuō le shén me tā shuō le wǒ xiǎng yù dìng xīng qī liù wǎn shàng de zuò wèi",
        "meaning": "Khi Mike gọi, anh ấy đã nói gì? Anh ấy nói, tôi muốn đặt chỗ cho tối thứ bảy.",
        "keywords": [
          "当迈"
        ],
        "blankIndices": [
          0,
          14,
          27
        ]
      },
      {
        "id": 15,
        "startTime": 201.59,
        "endTime": 212.43,
        "hanzi": "我想打电话给你我们有一个构图预定座位意思是设置桌子你们也可以用这个形式",
        "pinyin": "wǒ xiǎng dǎ diàn huà gěi nǐ wǒ men yǒu yí gè gòu tú yù dìng zuò wèi yì sī shì shè zhì zhuō zi nǐ men yě kě yǐ yòng zhè ge xíng shì",
        "meaning": "Tôi muốn gọi cho bạn. Chúng tôi có một thành phần. Đặt chỗ. Nó có nghĩa là đặt bàn. Bạn cũng có thể sử dụng hình thức này.",
        "keywords": [
          "我想"
        ],
        "blankIndices": [
          0,
          17,
          34
        ]
      },
      {
        "id": 16,
        "startTime": 212.43,
        "endTime": 222.23,
        "hanzi": "我想遇见两个人的卫我想遇见两个人的卫",
        "pinyin": "wǒ xiǎng yù jiàn liǎng gè rén de wèi wǒ xiǎng yù jiàn liǎng gè rén de wèi",
        "meaning": "Tôi muốn gặp Ngụy của hai người Tôi muốn gặp Ngụy của hai người",
        "keywords": [
          "我想"
        ],
        "blankIndices": [
          0,
          9,
          17
        ]
      },
      {
        "id": 17,
        "startTime": 222.23,
        "endTime": 230.74,
        "hanzi": "Mai C的家人不熟悉英语",
        "pinyin": "M a i   C de jiā rén bù shú xī yīng yǔ",
        "meaning": "nh h Mai C kh bi g m g Anh h ph v",
        "keywords": [
          "Ma"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      }
    ]
  },
  {
    "id": "dict_lesson_7",
    "title": "Hội Thoại Đặt Phòng Khách Sạn & Du Lịch (在酒店预订房间)",
    "youtubeId": "8oS6uXOZ_TA",
    "duration": "02:15",
    "level": "2",
    "levelText": "HSK 2 - 3 (Du Lịch)",
    "category": "Du Lịch",
    "thumbnail": "https://img.youtube.com/vi/8oS6uXOZ_TA/hqdefault.jpg",
    "description": "Mẫu câu tiếng Trung thông dụng khi đi du lịch: Đặt phòng khách sạn, hỏi dịch vụ tiện ích, làm thủ tục check-in nhận phòng.",
    "sentences": [
      {
        "id": 1,
        "startTime": 2,
        "endTime": 6.5,
        "hanzi": "你好，我想预订一间双人房。",
        "pinyin": "nǐ hǎo ， wǒ xiǎng yù dìng yì jiān shuāng rén fáng 。",
        "meaning": "Xin chào, tôi muốn đặt một phòng đôi.",
        "keywords": [
          "你好"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 2,
        "startTime": 7,
        "endTime": 10.5,
        "hanzi": "请问您计划入住几天？",
        "pinyin": "qǐng wèn nín jì huà rù zhù jǐ tiān ？",
        "meaning": "Xin hỏi bạn dự định ở lại mấy ngày?",
        "keywords": [
          "请问"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 3,
        "startTime": 11,
        "endTime": 16.5,
        "hanzi": "我们打算住三个晚上，从周五到周日。",
        "pinyin": "wǒ men dǎ suàn zhù sān gè wǎn shàng ， cóng zhōu wǔ dào zhōu rì 。",
        "meaning": "Chúng tôi định ở 3 đêm, từ thứ Sáu đến Chủ Nhật.",
        "keywords": [
          "我们"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 4,
        "startTime": 17,
        "endTime": 22,
        "hanzi": "房间里有免费无线网络和早餐吗？",
        "pinyin": "fáng jiān lǐ yǒu miǎn fèi wú xiàn wǎng luò hé zǎo cān ma ？",
        "meaning": "Trong phòng có Wi-Fi miễn phí và bữa sáng không?",
        "keywords": [
          "房间"
        ],
        "blankIndices": [
          0,
          7,
          13
        ]
      },
      {
        "id": 5,
        "startTime": 22.5,
        "endTime": 28,
        "hanzi": "有的，早餐每天早上七点到十点供应。",
        "pinyin": "yǒu de ， zǎo cān měi tiān zǎo shàng qī diǎn dào shí diǎn gōng yìng 。",
        "meaning": "Có ạ, bữa sáng phục vụ từ 7 giờ đến 10 giờ mỗi sáng.",
        "keywords": [
          "有的"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 6,
        "startTime": 28.5,
        "endTime": 34,
        "hanzi": "请出示一下您的护照并办理入住手续。",
        "pinyin": "qǐng chū shì yí xià nín de hù zhào bìng bàn lǐ rù zhù shǒu xù 。",
        "meaning": "Vui lòng xuất trình hộ chiếu và làm thủ tục nhận phòng.",
        "keywords": [
          "请出"
        ],
        "blankIndices": [
          0,
          8,
          15
        ]
      },
      {
        "id": 7,
        "startTime": 34.5,
        "endTime": 39.5,
        "hanzi": "这是您的房卡，房间在八楼808号。",
        "pinyin": "zhè shì nín de fáng kǎ ， fáng jiān zài bā lóu 8 0 8 hào 。",
        "meaning": "Đây là thẻ phòng của bạn, phòng ở tầng 8 số 808.",
        "keywords": [
          "这是"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 8,
        "startTime": 40,
        "endTime": 45,
        "hanzi": "电梯在右边，祝您住宿愉快！",
        "pinyin": "diàn tī zài yòu biān ， zhù nín zhù sù yú kuài ！",
        "meaning": "Thang máy ở bên phải, chúc bạn có kỳ nghỉ vui vẻ!",
        "keywords": [
          "电梯"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      }
    ]
  },
  {
    "id": "dict_lesson_8",
    "title": "Hội Thoại Phỏng Vấn Xin Việc & Giao Tiếp Công Sở (职场面试与商务中文)",
    "youtubeId": "Asqr_Sz9wVM",
    "duration": "03:40",
    "level": "4",
    "levelText": "HSK 4 (Công Sở)",
    "category": "Công Việc",
    "thumbnail": "https://img.youtube.com/vi/Asqr_Sz9wVM/hqdefault.jpg",
    "description": "Mẫu câu phỏng vấn xin việc và giao tiếp nơi công sở bằng tiếng Trung: Giới thiệu bản thân, trình bày kinh nghiệm, đàm phán công việc.",
    "sentences": [
      {
        "id": 1,
        "startTime": 3,
        "endTime": 8.5,
        "hanzi": "请先简单介绍一下您自己的工作经历。",
        "pinyin": "qǐng xiān jiǎn dān jiè shào yí xià nín zì jǐ de gōng zuò jīng lì 。",
        "meaning": "Xin vui lòng giới thiệu ngắn gọn về kinh nghiệm làm việc của bạn.",
        "keywords": [
          "请先"
        ],
        "blankIndices": [
          0,
          8,
          15
        ]
      },
      {
        "id": 2,
        "startTime": 9,
        "endTime": 15.5,
        "hanzi": "我毕业于外语大学，有三年的国际贸易经验。",
        "pinyin": "wǒ bì yè yú wài yǔ dà xué ， yǒu sān nián de guó jì mào yì jīng yàn 。",
        "meaning": "Tôi tốt nghiệp Đại học Ngoại ngữ và có 3 năm kinh nghiệm thương mại quốc tế.",
        "keywords": [
          "我毕"
        ],
        "blankIndices": [
          0,
          9,
          17
        ]
      },
      {
        "id": 3,
        "startTime": 16,
        "endTime": 21.5,
        "hanzi": "你在以前的公司主要负责哪些业务？",
        "pinyin": "nǐ zài yǐ qián de gōng sī zhǔ yào fù zé nǎ xiē yè wù ？",
        "meaning": "Ở công ty trước, bạn chủ yếu phụ trách những mảng nghiệp vụ nào?",
        "keywords": [
          "你在"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 4,
        "startTime": 22,
        "endTime": 28.5,
        "hanzi": "我主要负责海外客户联络和商务合同谈判。",
        "pinyin": "wǒ zhǔ yào fù zé hǎi wài kè hù lián luò hé shāng wù hé tong tán pàn 。",
        "meaning": "Tôi chủ yếu phụ trách liên hệ khách hàng nước ngoài và đàm phán hợp đồng thương mại.",
        "keywords": [
          "我主"
        ],
        "blankIndices": [
          0,
          9,
          17
        ]
      },
      {
        "id": 5,
        "startTime": 29,
        "endTime": 33,
        "hanzi": "你为什么想加入我们公司？",
        "pinyin": "nǐ wèi shén me xiǎng jiā rù wǒ men gōng sī ？",
        "meaning": "Tại sao bạn lại muốn gia nhập công ty chúng tôi?",
        "keywords": [
          "你为"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 6,
        "startTime": 33.5,
        "endTime": 40,
        "hanzi": "因为贵公司在行业内非常有前景，发展空间很大。",
        "pinyin": "yīn wèi guì gōng sī zài háng yè nèi fēi cháng yǒu qián jǐng ， fā zhǎn kōng jiān hěn dà 。",
        "meaning": "Vì quý công ty rất có triển vọng trong ngành và không gian phát triển rất lớn.",
        "keywords": [
          "因为"
        ],
        "blankIndices": [
          0,
          10,
          19
        ]
      },
      {
        "id": 7,
        "startTime": 40.5,
        "endTime": 45.5,
        "hanzi": "如果录用，你什么时候能够正式入职？",
        "pinyin": "rú guǒ lù yòng ， nǐ shén me shí hòu néng gòu zhèng shì rù zhí ？",
        "meaning": "Nếu được tuyển dụng, khi nào bạn có thể chính thức nhận việc?",
        "keywords": [
          "如果"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 8,
        "startTime": 46,
        "endTime": 51,
        "hanzi": "下周一我就可以准时来公司上班。",
        "pinyin": "xià zhōu yī wǒ jiù kě yǐ zhǔn shí lái gōng sī shàng bān 。",
        "meaning": "Thứ Hai tuần sau tôi có thể đến công ty làm việc đúng giờ.",
        "keywords": [
          "下周"
        ],
        "blankIndices": [
          0,
          7,
          13
        ]
      }
    ]
  },
  {
    "id": "dict_lesson_9",
    "title": "Phong Tục Tết Cổ Truyền Trung Hoa (中国春节与传统文化)",
    "youtubeId": "kpDING7mMcQ",
    "duration": "02:50",
    "level": "3",
    "levelText": "HSK 3 (Văn Hóa)",
    "category": "Văn Hóa",
    "thumbnail": "https://img.youtube.com/vi/kpDING7mMcQ/hqdefault.jpg",
    "description": "Khám phá nét đẹp văn hóa và phong tục đón Tết Nguyên Đán của người Hoa qua các từ vựng lễ hội, mâm cỗ đoàn viên và phong bao lì xì.",
    "sentences": [
      {
        "id": 1,
        "startTime": 2,
        "endTime": 9,
        "hanzi": "春节是中国人一年中最重要、最热闹的传统节日。",
        "pinyin": "chūn jié shì zhōng guó rén yì nián zhōng zuì zhòng yào 、 zuì rè nào de chuán tǒng jié rì 。",
        "meaning": "Tết Nguyên Đán là ngày lễ truyền thống quan trọng và náo nhiệt nhất trong năm của người Trung Quốc.",
        "keywords": [
          "春节"
        ],
        "blankIndices": [
          0,
          10,
          20
        ]
      },
      {
        "id": 2,
        "startTime": 9.5,
        "endTime": 16,
        "hanzi": "除夕夜全家人聚在一起吃团圆饭、包饺子。",
        "pinyin": "chú xī yè quán jiā rén jù zài yì qǐ chī tuán yuán fàn 、 bāo jiǎo zǐ 。",
        "meaning": "Đêm giao thừa cả gia đình quây quần bên nhau ăn bữa cơm đoàn viên và gói sủi cảo.",
        "keywords": [
          "除夕"
        ],
        "blankIndices": [
          0,
          9,
          17
        ]
      },
      {
        "id": 3,
        "startTime": 16.5,
        "endTime": 23,
        "hanzi": "长辈会给小孩子发红包，寓意平安和祝福。",
        "pinyin": "zhǎng bèi huì gěi xiǎo hái zi fā hóng bāo ， yù yì píng ān hé zhù fú 。",
        "meaning": "Người lớn tuổi sẽ phát lì xì cho trẻ nhỏ, mang ý nghĩa bình an và lời chúc phúc.",
        "keywords": [
          "长辈"
        ],
        "blankIndices": [
          0,
          8,
          16
        ]
      },
      {
        "id": 4,
        "startTime": 23.5,
        "endTime": 30,
        "hanzi": "大年初一人们穿上新衣服去亲戚朋友家拜年。",
        "pinyin": "dà nián chū yī rén men chuān shàng xīn yī fu qù qīn qi péng yǒu jiā bài nián 。",
        "meaning": "Mùng một Tết mọi người mặc quần áo mới đi chúc Tết nhà người thân và bạn bè.",
        "keywords": [
          "大年"
        ],
        "blankIndices": [
          0,
          9,
          18
        ]
      },
      {
        "id": 5,
        "startTime": 30.5,
        "endTime": 38,
        "hanzi": "街道上处处挂满红灯笼，到处都洋溢着喜庆的气氛。",
        "pinyin": "jiē dào shàng chù chù guà mǎn hóng dēng long ， dào chù dōu yáng yì zhe xǐ qìng de qì fēn 。",
        "meaning": "Trên đường phố khắp nơi treo đầy đèn lồng đỏ, tràn ngập không khí vui tươi phấn khởi.",
        "keywords": [
          "街道"
        ],
        "blankIndices": [
          0,
          10,
          20
        ]
      }
    ]
  }
];

// Helper: Normalize String for comparison
function cleanStr(s) {
  if (!s) return '';
  return s.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents if pinyin
    .replace(/[，。？！, .?!'’"“”]/g, "")
    .trim();
}

// Toast notification
function showToast(msg, isError = false) {
  let toast = document.getElementById('dict-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'dict-toast';
    toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; padding: 14px 22px; border-radius: 12px; font-weight: 700; font-size: 0.95rem; z-index: 999999; box-shadow: 0 10px 30px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 10px; transition: all 0.3s ease;';
    document.body.appendChild(toast);
  }
  toast.style.background = isError ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)';
  toast.style.color = '#ffffff';
  toast.innerHTML = `<i class="fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i> <span>${msg}</span>`;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  clearTimeout(window._dictToastTimer);
  window._dictToastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 2500);
}

// Audio Player: Baidu TTS with Google TTS & Web Speech fallback
function speakChinese(text) {
  if (!text) return;
  const clean = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s，。！？、…]/g, '').trim();
  if (!clean) return;

  function useWebSpeech() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'zh-CN';
    u.rate = 0.82;
    u.pitch = 1.05;
    // Prefer a Mandarin voice if available
    const voices = window.speechSynthesis.getVoices();
    const mandarinVoice = voices.find(v =>
      v.lang.toLowerCase().startsWith('zh') ||
      v.name.toLowerCase().includes('chinese') ||
      v.name.toLowerCase().includes('mandarin')
    );
    if (mandarinVoice) u.voice = mandarinVoice;
    window.speechSynthesis.speak(u);
  }

  // Try backend TTS first, fallback to Web Speech
  const audioUrl = `/api/tts?text=${encodeURIComponent(clean)}&voice=baidu-female`;
  const audio = new Audio(audioUrl);
  audio.playbackRate = 0.9;
  const playPromise = audio.play();
  if (playPromise) {
    playPromise.catch(() => useWebSpeech());
  }
}

// Convenience: speak the current lesson's sentence (used by inline onclick in HTML)
function speakCurrentSentence() {
  const hanzi = currentLesson?.sentences?.[currentSentenceIdx]?.hanzi;
  if (hanzi) speakChinese(hanzi);
  else showToast('Vui lòng chọn một bài học trước!', true);
}

// ==========================================
// YOUTUBE PLAYER API INITIALIZATION
// ==========================================

function initYouTubeAPI() {
  if (window.YT && window.YT.Player) {
    return;
  }
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

window.onYouTubeIframeAPIReady = function() {
  console.log("YouTube IFrame API Ready");
};

function setupPlayerForVideo(youtubeId) {
  if (ytPlayer && ytPlayer.destroy) {
    try { ytPlayer.destroy(); } catch (e) { console.warn(e); }
  }

  isPlayerReady = false;
  ytPlayer = new YT.Player('yt-video-embed', {
    videoId: youtubeId,
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      fs: 1,
      playsinline: 1,
      enablejsapi: 1,
      origin: window.location.origin
    },
    events: {
      onReady: (event) => {
        isPlayerReady = true;
        ytPlayer.setPlaybackRate(currentSpeed);
        console.log("YouTube Player is Ready.");
        // Play the first sentence on load
        playCurrentSentence();
      },
      onStateChange: (event) => {
        // YT.PlayerState.PLAYING = 1
        if (event.data === 1) {
          startPlaybackWatcher();
        } else {
          stopPlaybackWatcher();
        }
      }
    }
  });
}

function startPlaybackWatcher() {
  stopPlaybackWatcher();
  playbackWatcher = setInterval(() => {
    if (!ytPlayer || !ytPlayer.getCurrentTime || !currentLesson) return;
    try {
      const curTime = ytPlayer.getCurrentTime();
      const curSent = currentLesson.sentences[currentSentenceIdx];
      if (!curSent) return;

      // Update timing display in adjuster
      const posEl = document.getElementById('timing-adjuster-current-pos');
      if (posEl) {
        const curMin = Math.floor(curTime / 60);
        const curSec = (curTime % 60).toFixed(2);
        posEl.textContent = `Giây video: ${String(curMin).padStart(2, '0')}:${String(curSec).padStart(5, '0')} (${curTime.toFixed(2)}s)`;
      }

      // Update video progress meter or highlight
      updateSubtitleHighlight(curTime);

      // Auto pause at end of sentence
      if (autoPauseEnabled && curTime >= curSent.endTime) {
        ytPlayer.pauseVideo();
        stopPlaybackWatcher();
        isSentencePlaying = false;
        // Auto focus active input box for quick typing
        focusActiveInput();
      }
    } catch (e) {}
  }, 100);
}

function stopPlaybackWatcher() {
  if (playbackWatcher) {
    clearInterval(playbackWatcher);
    playbackWatcher = null;
  }
}

function playCurrentSentence() {
  if (!currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const sentence = currentLesson.sentences[currentSentenceIdx];
  if (ytPlayer && ytPlayer.seekTo) {
    ytPlayer.seekTo(sentence.startTime, true);
    ytPlayer.setPlaybackRate(currentSpeed);
    ytPlayer.playVideo();
    isSentencePlaying = true;
    startPlaybackWatcher();
  }
}

function replaySnippet() {
  playCurrentSentence();
  showToast("Đang phát lại câu hiện tại 🔁");
}

function setPlaybackSpeed(rate) {
  currentSpeed = parseFloat(rate) || 1.0;
  if (ytPlayer && ytPlayer.setPlaybackRate) {
    ytPlayer.setPlaybackRate(currentSpeed);
  }
  document.querySelectorAll('.speed-pill').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.speed) === currentSpeed);
  });
  showToast(`Tốc độ phát: ${currentSpeed}x`);
}

function toggleAutoPause() {
  autoPauseEnabled = !autoPauseEnabled;
  const btn = document.getElementById('toggle-autopause-btn');
  if (btn) {
    btn.classList.toggle('active', autoPauseEnabled);
    btn.innerHTML = autoPauseEnabled 
      ? '<i class="fa-solid fa-pause"></i> <span>Tự Dừng Câu: BẬT</span>' 
      : '<i class="fa-solid fa-play"></i> <span>Tự Dừng Câu: TẮT</span>';
  }
  showToast(autoPauseEnabled ? "Đã BẬT tự động dừng ở cuối mỗi câu" : "Đã TẮT tự động dừng (Video chạy liên tục)");
}

function toggleVideoBlur() {
  isVideoBlurred = !isVideoBlurred;
  const wrapper = document.getElementById('yt-video-embed');
  const btn = document.getElementById('toggle-blur-btn');
  if (wrapper) {
    wrapper.style.filter = isVideoBlurred ? 'blur(16px)' : 'none';
  }
  if (btn) {
    btn.classList.toggle('active', isVideoBlurred);
    btn.innerHTML = isVideoBlurred 
      ? '<i class="fa-solid fa-eye-slash"></i> <span>Làm Mờ Video: BẬT</span>' 
      : '<i class="fa-solid fa-eye"></i> <span>Làm Mờ Video: TẮT</span>';
  }
  showToast(isVideoBlurred ? "Đã làm mờ video để tập trung luyện nghe" : "Đã hiển thị lại video rõ nét");
}

// ==========================================
// WORKSPACE & DICTATION MODES LOGIC
// ==========================================

function switchMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  const clozeWrap = document.getElementById('workspace-cloze-mode');
  const fullWrap = document.getElementById('workspace-full-mode');
  const subsWrap = document.getElementById('workspace-subs-mode');

  if (clozeWrap) clozeWrap.style.display = (mode === 'cloze') ? 'block' : 'none';
  if (fullWrap) fullWrap.style.display = (mode === 'full') ? 'block' : 'none';
  if (subsWrap) subsWrap.style.display = (mode === 'subtitles') ? 'block' : 'none';

  renderCurrentSentence();
}

function renderCurrentSentence() {
  if (!currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const sent = currentLesson.sentences[currentSentenceIdx];
  const total = currentLesson.sentences.length;

  // Header & Progress Indicators
  const progressText = document.getElementById('dict-sentence-progress-text');
  const progressFill = document.getElementById('dict-sentence-progress-fill');
  if (progressText) progressText.textContent = `Câu ${currentSentenceIdx + 1} / ${total}`;
  if (progressFill) progressFill.style.width = `${((currentSentenceIdx + 1) / total) * 100}%`;

  const scoreText = document.getElementById('dict-score-counter');
  if (scoreText) scoreText.textContent = `${totalScore} điểm`;

  const streakText = document.getElementById('dict-streak-counter');
  if (streakText) streakText.textContent = `${currentStreak} 🔥`;

  // Meaning & Pinyin
  const meaningEl = document.getElementById('target-sentence-meaning');
  if (meaningEl) meaningEl.textContent = sent.meaning || 'Lắng nghe và chép lại câu thoại';

  const pinyinHintEl = document.getElementById('target-sentence-pinyin-hint');
  if (pinyinHintEl) {
    pinyinHintEl.textContent = sent.pinyin;
    pinyinHintEl.style.display = 'none'; // Hidden by default, toggled on hint
  }

  // Reset feedback
  const feedbackEl = document.getElementById('dict-action-feedback');
  if (feedbackEl) {
    feedbackEl.style.display = 'none';
    feedbackEl.className = 'dict-feedback-badge';
  }

  // Reset Hint / Reveal
  const solutionEl = document.getElementById('dict-solution-box');
  if (solutionEl) solutionEl.style.display = 'none';

  // Render Mode Specific Form
  if (currentMode === 'cloze') {
    renderClozeInputs(sent);
  } else if (currentMode === 'full') {
    renderFullInput(sent);
  }

  // Highlight Navigator List & Update Timing Editor
  renderSentenceNavigator();
  updateTimingDisplay();
  focusActiveInput();
}

function renderClozeInputs(sent) {
  const container = document.getElementById('cloze-interactive-container');
  if (!container) return;
  container.innerHTML = '';

  const hanzi = sent.hanzi;
  const keywords = sent.keywords || [];

  // Break sentence into tokens of keywords and regular text
  let remaining = hanzi;
  let tokens = [];

  // Smart segmentation with keywords
  if (keywords.length > 0) {
    // Replace keywords with placeholders
    let pattern = new RegExp(`(${keywords.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})`, 'g');
    let parts = hanzi.split(pattern);
    parts.forEach(part => {
      if (!part) return;
      const isKey = keywords.includes(part);
      tokens.push({ text: part, isBlank: isKey });
    });
  } else {
    // If no keywords, pick middle words as blank
    tokens.push({ text: hanzi, isBlank: true });
  }

  let blankCounter = 0;
  tokens.forEach((t, i) => {
    if (t.isBlank) {
      const idx = blankCounter++;
      const inputWrap = document.createElement('div');
      inputWrap.className = 'cloze-input-pill-wrap';
      inputWrap.innerHTML = `
        <input type="text" class="cloze-input-box" id="cloze-input-${idx}" 
               data-target="${t.text}" placeholder="[ ? ]" 
               autocomplete="off" autocapitalize="off" spellcheck="false">
        <span class="cloze-pinyin-sub" id="cloze-pinyin-${idx}" style="display: none;"></span>
      `;
      container.appendChild(inputWrap);

      const input = inputWrap.querySelector('input');
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          checkCurrentAnswer();
        }
      });
    } else {
      const staticSpan = document.createElement('span');
      staticSpan.className = 'cloze-static-text';
      staticSpan.textContent = t.text;
      staticSpan.title = "Bấm để xem cách viết chữ";
      staticSpan.addEventListener('click', () => openHanziModal(t.text));
      container.appendChild(staticSpan);
    }
  });
}

function renderFullInput(sent) {
  const inputEl = document.getElementById('full-dictation-input');
  if (inputEl) {
    inputEl.value = '';
    inputEl.placeholder = 'Nghe âm thanh và gõ toàn bộ câu bằng Chữ Hán hoặc Pinyin (Nhấn Enter để nộp)...';
    inputEl.focus();
  }
}

function focusActiveInput() {
  setTimeout(() => {
    if (currentMode === 'cloze') {
      const firstInput = document.querySelector('.cloze-input-box');
      if (firstInput) firstInput.focus();
    } else if (currentMode === 'full') {
      const fullInput = document.getElementById('full-dictation-input');
      if (fullInput) fullInput.focus();
    }
  }, 100);
}

// ==========================================
// CHECK ANSWER & GRADING LOGIC
// ==========================================

function checkCurrentAnswer() {
  if (!currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const sent = currentLesson.sentences[currentSentenceIdx];
  const feedbackEl = document.getElementById('dict-action-feedback');

  let isCorrect = true;
  let scoreDelta = 0;

  if (currentMode === 'cloze') {
    const inputs = document.querySelectorAll('.cloze-input-box');
    if (inputs.length === 0) return;

    inputs.forEach(inp => {
      const userVal = cleanStr(inp.value);
      const targetVal = cleanStr(inp.dataset.target);

      if (!userVal) {
        isCorrect = false;
        inp.classList.add('error-pulse');
      } else if (userVal === targetVal || targetVal.includes(userVal) || userVal.includes(targetVal)) {
        inp.classList.remove('error-pulse');
        inp.classList.add('input-correct');
        inp.disabled = true;
      } else {
        isCorrect = false;
        inp.classList.add('error-pulse');
      }
    });

  } else if (currentMode === 'full') {
    const inputEl = document.getElementById('full-dictation-input');
    const userVal = cleanStr(inputEl ? inputEl.value : '');
    const targetHanzi = cleanStr(sent.hanzi);
    const targetPinyin = cleanStr(sent.pinyin);

    if (!userVal) {
      showToast("Vui lòng gõ nội dung câu trước khi kiểm tra!", true);
      return;
    }

    if (userVal === targetHanzi || userVal === targetPinyin) {
      isCorrect = true;
    } else {
      // Fuzzy similarity calculation (>80% matched)
      const sim = calculateStringSimilarity(userVal, targetHanzi) || calculateStringSimilarity(userVal, targetPinyin);
      isCorrect = (sim >= 0.8);
    }
  }

  // Feedback & Progression
  if (isCorrect) {
    scoreDelta = 10;
    totalScore += scoreDelta;
    currentStreak++;
    userAnswers[sent.id] = { isCorrect: true, score: scoreDelta };

    if (feedbackEl) {
      feedbackEl.style.display = 'flex';
      feedbackEl.className = 'dict-feedback-badge success';
      feedbackEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Chính xác tuyệt vời! (+10 điểm) 🎉</span>`;
    }
    showToast("🎉 Hoàn toàn chính xác! (+10 điểm)");
    speakChinese(sent.hanzi);

    // Auto advance after 1.5s
    setTimeout(() => {
      nextSentence();
    }, 1500);

  } else {
    currentStreak = 0;
    userAnswers[sent.id] = { isCorrect: false, score: 0 };

    if (feedbackEl) {
      feedbackEl.style.display = 'flex';
      feedbackEl.className = 'dict-feedback-badge error';
      feedbackEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> <span>Chưa chính xác. Hãy nghe lại hoặc bấm Gợi Ý!</span>`;
    }
    showToast("Chưa chính xác! Thử nghe lại nhé ⚠️", true);
  }

  renderCurrentSentenceHeaderStats();
}

function renderCurrentSentenceHeaderStats() {
  const scoreText = document.getElementById('dict-score-counter');
  if (scoreText) scoreText.textContent = `${totalScore} điểm`;
  const streakText = document.getElementById('dict-streak-counter');
  if (streakText) streakText.textContent = `${currentStreak} 🔥`;
}

function showHint() {
  if (!currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const sent = currentLesson.sentences[currentSentenceIdx];

  // Show Pinyin
  const pinyinHintEl = document.getElementById('target-sentence-pinyin-hint');
  if (pinyinHintEl) {
    pinyinHintEl.style.display = 'block';
  }

  // Fill first character in blanks
  if (currentMode === 'cloze') {
    const inputs = document.querySelectorAll('.cloze-input-box');
    inputs.forEach(inp => {
      const target = inp.dataset.target || '';
      if (target.length > 0) {
        inp.placeholder = `Gợi ý: ${target.charAt(0)}...`;
      }
    });
  }

  showToast("💡 Đã mở gợi ý Pinyin và chữ cái đầu!");
}

function revealAnswer() {
  if (!currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const sent = currentLesson.sentences[currentSentenceIdx];

  const solutionEl = document.getElementById('dict-solution-box');
  const solutionHanzi = document.getElementById('solution-hanzi-text');
  const solutionPinyin = document.getElementById('solution-pinyin-text');
  const solutionMeaning = document.getElementById('solution-meaning-text');

  if (solutionEl && solutionHanzi) {
    solutionHanzi.innerHTML = renderClickableHanziSpans(sent.hanzi);
    if (solutionPinyin) solutionPinyin.textContent = sent.pinyin;
    if (solutionMeaning) solutionMeaning.textContent = sent.meaning;
    solutionEl.style.display = 'block';
  }

  // Fill in blanks
  if (currentMode === 'cloze') {
    const inputs = document.querySelectorAll('.cloze-input-box');
    inputs.forEach(inp => {
      inp.value = inp.dataset.target;
      inp.classList.add('input-correct');
    });
  }

  speakChinese(sent.hanzi);
  showToast("Đã hiển thị đáp án chuẩn!");
}

function nextSentence() {
  if (!currentLesson) return;
  if (currentSentenceIdx < currentLesson.sentences.length - 1) {
    currentSentenceIdx++;
    renderCurrentSentence();
    playCurrentSentence();
  } else {
    // Completed all sentences in the lesson
    showLessonCompletedModal();
  }
}

function prevSentence() {
  if (!currentLesson) return;
  if (currentSentenceIdx > 0) {
    currentSentenceIdx--;
    renderCurrentSentence();
    playCurrentSentence();
  } else {
    showToast("Đây là câu đầu tiên của bài!");
  }
}

// ==========================================
// SENTENCE NAVIGATOR & SUBTITLES LIST
// ==========================================

function renderSentenceNavigator() {
  const listEl = document.getElementById('dict-sentence-navigator-list');
  const fullSubsListEl = document.getElementById('subs-mode-full-list');
  if (!currentLesson) return;

  if (listEl) {
    listEl.innerHTML = '';
    currentLesson.sentences.forEach((s, idx) => {
      const isDone = userAnswers[s.id] && userAnswers[s.id].isCorrect;
      const isActive = idx === currentSentenceIdx;

      const item = document.createElement('div');
      item.className = `dict-nav-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`;
      item.innerHTML = `
        <span class="nav-idx-badge">${idx + 1}</span>
        <span class="nav-time-badge">${formatTime(s.startTime)}</span>
        <span class="nav-snippet-text">${s.hanzi}</span>
        <i class="fa-solid ${isDone ? 'fa-circle-check text-success' : 'fa-play play-icon'}"></i>
      `;
      item.addEventListener('click', () => {
        currentSentenceIdx = idx;
        renderCurrentSentence();
        playCurrentSentence();
      });
      listEl.appendChild(item);
    });
  }

  // Full Subtitles Mode View
  if (fullSubsListEl) {
    fullSubsListEl.innerHTML = '';
    currentLesson.sentences.forEach((s, idx) => {
      const row = document.createElement('div');
      row.className = `subs-full-row ${idx === currentSentenceIdx ? 'highlight-row' : ''}`;
      row.innerHTML = `
        <div class="subs-row-header">
          <span class="subs-row-num">#${idx + 1}</span>
          <span class="subs-row-time"><i class="fa-regular fa-clock"></i> ${formatTime(s.startTime)} - ${formatTime(s.endTime)}</span>
          <button class="btn btn-outline btn-xs" onclick="window.jumpToSentence(${idx})">
            <i class="fa-solid fa-play"></i> Nghe câu này
          </button>
        </div>
        <div class="subs-row-hanzi">${renderClickableHanziSpans(s.hanzi)}</div>
        <div class="subs-row-pinyin">${s.pinyin}</div>
        <div class="subs-row-meaning">${s.meaning}</div>
      `;
      fullSubsListEl.appendChild(row);
    });
  }
}

function updateSubtitleHighlight(curTime) {
  if (!currentLesson) return;
  const rows = document.querySelectorAll('.subs-full-row');
  currentLesson.sentences.forEach((s, idx) => {
    if (curTime >= s.startTime && curTime <= s.endTime) {
      rows[idx]?.classList.add('highlight-row');
    } else {
      rows[idx]?.classList.remove('highlight-row');
    }
  });
}

function renderClickableHanziSpans(text) {
  if (!text) return '';
  return text.split('').map(char => {
    if (/[\u4e00-\u9fa5]/.test(char)) {
      return `<span class="hanzi-interactive-char" onclick="window.openHanziModal('${char}')" title="Bấm xem nét viết chữ ${char}">${char}</span>`;
    }
    return char;
  }).join('');
}

function formatTime(secs) {
  if (isNaN(secs)) return '00:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

// Simple Levenshtein distance for fuzzy matching
function calculateStringSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  let longer = s1.length > s2.length ? s1 : s2;
  let shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  let costs = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }
  return (longer.length - costs[shorter.length]) / longer.length;
}

// ==========================================
// HANZI WRITER POPUP INTEGRATION
// ==========================================

function openHanziModal(character) {
  if (!character) return;
  const char = character.charAt(0);
  const modal = document.getElementById('dict-hanzi-writer-modal');
  const targetCharEl = document.getElementById('hanzi-modal-char-title');
  const targetDiv = document.getElementById('hanzi-writer-target');

  if (!modal || !targetDiv) return;

  targetDiv.innerHTML = '';
  if (targetCharEl) targetCharEl.textContent = `Tập Viết Chữ: ${char}`;
  modal.style.display = 'flex';

  if (window.HanziWriter) {
    try {
      activeHanziWriter = HanziWriter.create('hanzi-writer-target', char, {
        width: 180,
        height: 180,
        padding: 10,
        showOutline: true,
        strokeColor: '#ef4444',
        radicalColor: '#2563eb',
        outlineColor: '#cbd5e1',
        drawingWidth: 20
      });
      activeHanziWriter.animateCharacter();
    } catch (e) {
      targetDiv.innerHTML = `<span style="font-size: 5rem; font-weight: 900; color: #ef4444;">${char}</span>`;
    }
  } else {
    targetDiv.innerHTML = `<span style="font-size: 5rem; font-weight: 900; color: #ef4444;">${char}</span>`;
  }
}

function animateCurrentHanzi() {
  if (activeHanziWriter) {
    activeHanziWriter.animateCharacter();
  }
}

function closeHanziModal() {
  const modal = document.getElementById('dict-hanzi-writer-modal');
  if (modal) modal.style.display = 'none';
}

// ==========================================
// LESSON COMPLETED MODAL
// ==========================================

function showLessonCompletedModal() {
  const modal = document.getElementById('dict-lesson-completed-modal');
  const scoreVal = document.getElementById('modal-final-score-val');
  const correctCountVal = document.getElementById('modal-correct-count-val');

  const total = currentLesson.sentences.length;
  const correct = Object.values(userAnswers).filter(a => a.isCorrect).length;

  if (scoreVal) scoreVal.textContent = `${totalScore} Điểm`;
  if (correctCountVal) correctCountVal.textContent = `${correct} / ${total} câu`;

  if (modal) modal.style.display = 'flex';
  showToast("🎉 Chúc mừng bạn đã hoàn thành xuất sắc bài luyện chép video!");
}

// ==========================================
// USER AUTH & CUSTOM VIDEOS MANAGEMENT
// ==========================================

let currentUser = null;

function initCurrentUser() {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      currentUser = JSON.parse(userStr);
    }
  } catch (e) {
    currentUser = null;
  }
  updateUserHeaderDisplay();
}

function getCurrentUserEmail() {
  return currentUser?.email || 'guest';
}

function updateUserHeaderDisplay() {
  const nameEl = document.getElementById('dict-user-name-display');
  const badgeEl = document.getElementById('dict-user-profile-badge');
  if (currentUser && currentUser.email) {
    if (nameEl) nameEl.textContent = currentUser.name || currentUser.email.split('@')[0];
    if (badgeEl) {
      badgeEl.title = `Đang đăng nhập: ${currentUser.email}`;
      badgeEl.style.borderColor = 'rgba(56, 189, 248, 0.5)';
      badgeEl.style.background = 'rgba(56, 189, 248, 0.12)';
      badgeEl.style.color = '#38bdf8';
    }
  } else {
    if (nameEl) nameEl.textContent = 'Khách (Lưu trên máy này)';
  }
}

function getLocalCustomVideos() {
  const email = getCurrentUserEmail();
  try {
    const saved = localStorage.getItem(`custom_video_dictation_${email}`);
    if (saved) {
      const list = JSON.parse(saved);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {}
  return [];
}

function saveLocalCustomVideos(videos) {
  const email = getCurrentUserEmail();
  try {
    localStorage.setItem(`custom_video_dictation_${email}`, JSON.stringify(videos));
  } catch (e) {}
}

function updateMyVideosBadge() {
  const email = getCurrentUserEmail();
  const count = allLessons.filter(l => l.isCustom === true || (l.userEmail && (l.userEmail === email || l.userEmail === 'guest'))).length;
  const countEl = document.getElementById('my-videos-count');
  if (countEl) countEl.textContent = count;
}

function extractYouTubeId(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : '';
}

// Live YouTube input preview
window.handleYouTubeUrlInput = function(val) {
  const ytId = extractYouTubeId(val);
  const previewBox = document.getElementById('custom-video-preview-box');
  const previewImg = document.getElementById('custom-video-preview-img');
  const previewId = document.getElementById('custom-video-preview-id');
  const titleInput = document.getElementById('custom-video-title');

  if (ytId) {
    if (previewBox) previewBox.style.display = 'flex';
    if (previewImg) previewImg.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    if (previewId) previewId.textContent = `YouTube Video ID: ${ytId}`;
    if (titleInput && !titleInput.value) {
      titleInput.value = `Bài Luyện Nghe YouTube (${ytId})`;
    }
  } else {
    if (previewBox) previewBox.style.display = 'none';
  }
};

// Subtitle & YouTube Fetcher Tools
// Subtitle & YouTube Fetcher Tools
window.fetchYouTubeSubtitles = async function() {
  const urlInput = document.getElementById('custom-video-url')?.value.trim();
  const ytId = extractYouTubeId(urlInput);

  if (!ytId) {
    showToast("Vui lòng dán link YouTube hợp lệ vào ô ở trên trước!", true);
    document.getElementById('custom-video-url')?.focus();
    return;
  }

  const btn = document.getElementById('btn-fetch-yt-subs');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang trích xuất giọng nói YouTube...';
  }

  showToast("🔍 Đang kết nối và phân tích mốc câu giọng nói từ YouTube...");

  try {
    const res = await fetch('/api/dictation/fetch-subtitles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ youtubeId: ytId })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.sentences) && data.sentences.length > 0) {
        const titleInput = document.getElementById('custom-video-title');
        if (titleInput && (!titleInput.value || titleInput.value.startsWith('Bài Luyện Nghe'))) {
          titleInput.value = data.videoTitle || titleInput.value;
        }

        // Auto-select AI-detected HSK Level
        if (data.level) {
          const levelSelect = document.getElementById('custom-video-level');
          if (levelSelect) levelSelect.value = String(data.level);
        }

        // Auto-select AI-detected Category
        if (data.category) {
          const catSelect = document.getElementById('custom-video-cat');
          if (catSelect) catSelect.value = data.category;
        }

        const lines = data.sentences.map(s => {
          const sMin = Math.floor(s.startTime / 60);
          const sSec = (s.startTime % 60).toFixed(2);
          const eMin = Math.floor(s.endTime / 60);
          const eSec = (s.endTime % 60).toFixed(2);
          const sFormatted = `${String(sMin).padStart(2, '0')}:${String(sSec).padStart(5, '0')}`;
          const eFormatted = `${String(eMin).padStart(2, '0')}:${String(eSec).padStart(5, '0')}`;
          return `[${sFormatted} - ${eFormatted}] ${s.hanzi} | ${s.pinyin} | ${s.meaning || 'Câu hội thoại trong video'}`;
        });

        const textarea = document.getElementById('custom-video-subtitles');
        if (textarea) {
          textarea.value = lines.join('\n');
        }

        const tierEmoji = data.tierUsed?.includes('Groq') ? '⚡' : (data.tierUsed?.includes('YouTube') ? '📝' : '✨');
        showToast(`${tierEmoji} AI đã phân tích xong: Cấp độ HSK ${data.level || 2} • Thể loại: ${data.category || 'Giao Tiếp'} (${data.sentences.length} câu chuẩn 100%)! 🎉`);
      } else {
        showToast('Đang chuyển sang AI phân tích giọng nói sâu...', false);
        setTimeout(() => window.transcribeAudioWithAI(ytId), 500);
      }
    } else {
      showToast('Đang chuyển sang AI phân tích giọng nói sâu...', false);
      setTimeout(() => window.transcribeAudioWithAI(ytId), 500);
    }
  } catch (err) {
    console.error('Fetch subtitles error:', err);
    showToast('Lỗi kết nối khi trích xuất phụ đề YouTube.', true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-brands fa-youtube"></i> Lấy Mốc Giọng Nói YouTube';
    }
  }
};

// AI High-Performance Transcription: Groq Whisper Large v3 + yt-dlp + Smart LLM Fallback
window.transcribeAudioWithAI = async function(youtubeIdOverride) {
  const urlInput = document.getElementById('custom-video-url')?.value.trim();
  const ytId = youtubeIdOverride || extractYouTubeId(urlInput);

  if (!ytId) {
    showToast('Vui lòng dán link YouTube hợp lệ trước!', true);
    document.getElementById('custom-video-url')?.focus();
    return;
  }

  const aiBtn = document.getElementById('btn-ai-transcribe');
  if (aiBtn) {
    aiBtn.disabled = true;
    aiBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AI đang phân tích giọng...';
  }

  // Show step-by-step progress toasts
  const steps = [
    { delay: 0,    msg: '⚡ Groq Whisper Large v3 đang phân tích âm thanh video...' },
    { delay: 6000, msg: '🌐 Đang sinh Pinyin & phiên dịch câu thoại chuẩn xác...' }
  ];
  const toastTimers = steps.map(s => setTimeout(() => showToast(s.msg), s.delay));

  try {
    const res = await fetch('/api/dictation/transcribe-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ youtubeId: ytId })
    });

    toastTimers.forEach(t => clearTimeout(t));

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      showToast(`Lỗi máy chủ: ${errData.error || res.status}`, true);
      return;
    }

    const data = await res.json();

    if (data.success && Array.isArray(data.sentences) && data.sentences.length > 0) {
      const titleInput = document.getElementById('custom-video-title');
      if (titleInput && (!titleInput.value || titleInput.value.startsWith('Bài Luyện Nghe'))) {
        titleInput.value = data.videoTitle || titleInput.value;
      }

      // Auto-select AI-detected HSK Level
      if (data.level) {
        const levelSelect = document.getElementById('custom-video-level');
        if (levelSelect) levelSelect.value = String(data.level);
      }

      // Auto-select AI-detected Category
      if (data.category) {
        const catSelect = document.getElementById('custom-video-cat');
        if (catSelect) catSelect.value = data.category;
      }

      const lines = data.sentences.map(s => {
        const sMin = Math.floor(s.startTime / 60);
        const sSec = (s.startTime % 60).toFixed(2);
        const eMin = Math.floor(s.endTime / 60);
        const eSec = (s.endTime % 60).toFixed(2);
        const sf = `${String(sMin).padStart(2,'0')}:${String(sSec).padStart(5,'0')}`;
        const ef = `${String(eMin).padStart(2,'0')}:${String(eSec).padStart(5,'0')}`;
        return `[${sf} - ${ef}] ${s.hanzi} | ${s.pinyin} | ${s.meaning || 'Câu hội thoại'}`;
      });

      const textarea = document.getElementById('custom-video-subtitles');
      if (textarea) textarea.value = lines.join('\n');

      const tierEmoji = data.tierUsed?.includes('Groq') ? '⚡' :
                        data.tierUsed?.includes('YouTube') ? '📝' : '✨';
      showToast(`${tierEmoji} AI hoàn tất: Cấp độ HSK ${data.level || 2} • Thể loại: ${data.category || 'Giao Tiếp'} (${data.sentences.length} câu chuẩn 100%)! 🎉`);

    } else {
      showToast(data.message || 'Không thể nhận diện giọng nói trong video.', true);
    }

  } catch (err) {
    toastTimers.forEach(t => clearTimeout(t));
    console.error('AI Transcribe error:', err);
    showToast('Lỗi kết nối AI phân tích giọng — Kiểm tra kết nối Internet!', true);
  } finally {
    if (aiBtn) {
      aiBtn.disabled = false;
      aiBtn.innerHTML = '<i class="fa-solid fa-microphone-lines" style="color: #c4b5fd;"></i> AI Phân Tích Giọng';
    }
  }
};

window.autoTranslateSubtitles = async function() {
  const textarea = document.getElementById('custom-video-subtitles');
  if (!textarea || !textarea.value.trim()) {
    showToast("Vui lòng nhập lời câu thoại (Tiếng Việt hoặc Tiếng Trung) trước!", true);
    textarea?.focus();
    return;
  }

  const btn = document.getElementById('btn-auto-translate-subs');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang dịch...';
  }

  showToast("🌐 Đang dịch chuẩn ngữ nghĩa sang Tiếng Trung & sinh Pinyin...");

  try {
    const res = await fetch('/api/dictation/auto-translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textarea.value })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.processedText) {
        textarea.value = data.processedText;
        showToast("✨ Đã dịch sang Tiếng Trung & sinh Pinyin chuẩn xác 100%! 🎉");
      } else {
        showToast("Không thể dịch tự động, vui lòng thử lại.", true);
      }
    } else {
      showToast("Lỗi kết nối máy chủ dịch thuật.", true);
    }
  } catch (err) {
    console.error("Auto translate error:", err);
    showToast("Lỗi khi kết nối dịch thuật.", true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-language"></i> Dịch Tiếng Trung';
    }
  }
};

window.fillSampleSubtitles = function() {
  const textarea = document.getElementById('custom-video-subtitles');
  if (!textarea) return;
  textarea.value = `[00:10 - 00:17] 你好！很高兴认识你。 | Nǐ hǎo! Hěn gāoxìng rènshi nǐ. | Xin chào! Rất vui được làm quen với bạn.
[00:18 - 00:26] 你喜欢听中文歌吗？ | Nǐ xǐhuan tīng zhōngwén gē ma? | Bạn có thích nghe nhạc tiếng Trung không?
[00:27 - 00:35] 我非常喜欢，每天都在练习听力。 | Wǒ fēicháng xǐhuan, měitiān dōu zài liànxí tīnglì. | Mình rất thích, mỗi ngày đều luyện nghe.`;
  showToast("Đã chèn mẫu câu ví dụ! 📝");
};

window.clearSubtitlesInput = function() {
  const textarea = document.getElementById('custom-video-subtitles');
  if (textarea) {
    textarea.value = '';
    textarea.focus();
  }
};

window.autoGenerateSubtitlesPinyin = async function() {
  const textarea = document.getElementById('custom-video-subtitles');
  if (!textarea || !textarea.value.trim()) {
    showToast("Vui lòng nhập lời câu thoại chữ Hán trước!", true);
    return;
  }

  showToast("Đang tự động sinh Pinyin chuẩn...");
  const lines = textarea.value.split('\n');
  const processedLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      processedLines.push('');
      continue;
    }

    const parts = trimmed.split('|').map(p => p.trim());
    if (parts.length >= 2 && parts[1]) {
      processedLines.push(trimmed);
      continue;
    }

    let timePrefix = '';
    let hanziText = parts[0] || '';
    const timeMatch = hanziText.match(/^(\[[0-9:\s.-]+\]|[0-9:]+)\s*(.*)$/);
    if (timeMatch) {
      timePrefix = timeMatch[1] + ' ';
      hanziText = timeMatch[2];
    }

    try {
      const res = await fetch('/api/dictation/pinyin-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: hanziText })
      });
      if (res.ok) {
        const data = await res.json();
        const generatedPinyin = data.pinyin || '';
        const meaning = parts[2] || parts[1] || 'Câu luyện chép tiếng Trung';
        processedLines.push(`${timePrefix}${hanziText} | ${generatedPinyin} | ${meaning}`);
      } else {
        processedLines.push(trimmed);
      }
    } catch (e) {
      processedLines.push(trimmed);
    }
  }

  textarea.value = processedLines.join('\n');
  showToast("Đã sinh Pinyin tự động thành công! ✨");
};

// ==========================================
// INTERACTIVE SENTENCE TIMING ADJUSTMENT
// ==========================================

window.nudgeTiming = function(type, delta) {
  if (!currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const sent = currentLesson.sentences[currentSentenceIdx];

  if (type === 'start') {
    sent.startTime = Math.max(0, parseFloat((sent.startTime + delta).toFixed(2)));
    if (sent.startTime >= sent.endTime) sent.endTime = parseFloat((sent.startTime + 1.0).toFixed(2));
  } else if (type === 'end') {
    sent.endTime = Math.max(sent.startTime + 0.5, parseFloat((sent.endTime + delta).toFixed(2)));
  }

  updateTimingDisplay();
  showToast(`Mốc ${type === 'start' ? 'bắt đầu' : 'kết thúc'}: ${type === 'start' ? sent.startTime : sent.endTime}s`);
};

window.setTimingFromCurrent = function(type) {
  if (!ytPlayer || !ytPlayer.getCurrentTime || !currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const curTime = parseFloat(ytPlayer.getCurrentTime().toFixed(2));
  const sent = currentLesson.sentences[currentSentenceIdx];

  if (type === 'start') {
    sent.startTime = curTime;
    if (sent.startTime >= sent.endTime) sent.endTime = parseFloat((sent.startTime + 2.0).toFixed(2));
  } else if (type === 'end') {
    sent.endTime = Math.max(sent.startTime + 0.5, curTime);
  }

  updateTimingDisplay();
  showToast(`📍 Đã gán mốc ${type === 'start' ? 'Bắt Đầu' : 'Kết Thúc'} tại ${curTime}s`);
};

function updateTimingDisplay() {
  if (!currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const sent = currentLesson.sentences[currentSentenceIdx];

  const startEl = document.getElementById('timing-start-val');
  const endEl = document.getElementById('timing-end-val');
  if (startEl) startEl.textContent = `${sent.startTime.toFixed(2)}s`;
  if (endEl) endEl.textContent = `${sent.endTime.toFixed(2)}s`;
}

window.saveAdjustedTiming = function() {
  if (!currentLesson) return;
  const email = getCurrentUserEmail();

  // Save to local storage
  const localList = getLocalCustomVideos();
  const idx = localList.findIndex(l => l.id === currentLesson.id);
  if (idx >= 0) {
    localList[idx] = currentLesson;
    saveLocalCustomVideos(localList);
  }

  // Sync to server
  fetch('/api/dictation/save-lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(currentLesson)
  }).catch(err => console.warn("Save timing error:", err));

  renderSentenceNavigator();
  showToast("💾 Đã lưu mốc thời gian câu thoại thành công! 100% Khớp giọng nói");
};

// ==========================================
// HUMAN SPEECH RECOGNITION & SHADOWING
// ==========================================

function calculateSimilarity(str1, str2) {
  const s1 = cleanStr(str1);
  const s2 = cleanStr(str2);
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;

  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const distance = dp[m][n];
  const maxLen = Math.max(m, n);
  return Math.max(0, 1 - distance / maxLen);
}

let activeAudioCtx = null;
let activeAnalyser = null;
let vadTimer = null;

function stopVAD() {
  if (vadTimer) {
    clearInterval(vadTimer);
    vadTimer = null;
  }
  if (activeAudioCtx) {
    try { activeAudioCtx.close(); } catch (e) {}
    activeAudioCtx = null;
  }
  activeAnalyser = null;
}

// VAD: attaches to an existing MediaStream (from SpeechRecognition's mic grant)
// so we never open a second getUserMedia that would conflict with Web Speech API
async function initVADOnStream(stream) {
  stopVAD();
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx || !stream) return;
    activeAudioCtx = new AudioCtx();
    const source = activeAudioCtx.createMediaStreamSource(stream);
    activeAnalyser = activeAudioCtx.createAnalyser();
    activeAnalyser.fftSize = 512;
    activeAnalyser.smoothingTimeConstant = 0.8;
    source.connect(activeAnalyser);

    const dataArray = new Uint8Array(activeAnalyser.frequencyBinCount);
    const micBtn = document.getElementById('dict-mic-btn');

    vadTimer = setInterval(() => {
      if (!activeAnalyser || !micBtn) return;
      activeAnalyser.getByteFrequencyData(dataArray);

      // Human speech fundamental & formant band: ~130Hz-3800Hz (bins 3-45 @ 512 FFT / 44.1kHz)
      let vocalEnergy = 0;
      for (let i = 3; i < 45; i++) vocalEnergy += dataArray[i];
      const avgVocal = vocalEnergy / 42;
      const lowNoise = (dataArray[0] + dataArray[1] + dataArray[2]) / 3;

      if (avgVocal > 24 && avgVocal > lowNoise * 0.7) {
        micBtn.style.boxShadow = '0 0 18px rgba(244, 63, 94, 0.9)';
        micBtn.innerHTML = '<i class="fa-solid fa-microphone-lines fa-beat" style="color: #f43f5e;"></i> <span>Đang Nhận Giọng Nói...</span>';
      } else {
        micBtn.style.boxShadow = '0 0 6px rgba(236, 72, 153, 0.3)';
        micBtn.innerHTML = '<i class="fa-solid fa-microphone" style="color: #ec4899;"></i> <span>Đang Lọc Tạp Âm...</span>';
      }
    }, 100);
  } catch (err) {
    console.warn('VAD attach warning:', err);
  }
}

let activeRecognition = null;

window.startSpeechRecognition = function() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Trình duyệt chưa hỗ trợ nhận diện giọng nói — Vui lòng dùng Google Chrome hoặc Edge', true);
    return;
  }

  const micBtn = document.getElementById('dict-mic-btn');
  const sent = currentLesson?.sentences?.[currentSentenceIdx];
  if (!sent) {
    showToast('Vui lòng chọn một bài học trước khi luyện nói!', true);
    return;
  }

  // Toggle off if already active
  if (activeRecognition) {
    try { activeRecognition.stop(); } catch (e) {}
    activeRecognition = null;
    stopVAD();
    if (micBtn) {
      micBtn.style.background = '';
      micBtn.style.boxShadow = 'none';
      micBtn.innerHTML = '<i class="fa-solid fa-microphone" style="color: #ec4899;"></i> <span>Luyện Nói</span>';
    }
    showToast('Đã tắt micro');
    return;
  }

  try {
    const rec = new SpeechRecognition();
    rec.lang = 'zh-CN';
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 3;

    if (micBtn) {
      micBtn.style.background = 'rgba(236, 72, 153, 0.22)';
      micBtn.style.boxShadow = '0 0 10px rgba(236, 72, 153, 0.4)';
      micBtn.innerHTML = '<i class="fa-solid fa-microphone-lines fa-beat" style="color: #f43f5e;"></i> <span>Đang Lắng Nghe...</span>';
    }
    showToast('🎙️ Khử tạp âm đã bật — Hãy nói to câu tiếng Trung vào micro...');

    rec.onstart = () => {
      // Attach VAD to the mic stream via a separate non-blocking getUserMedia call
      // (uses constraints identical to SpeechRecognition so browser reuses same mic)
      if (navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        }).then(stream => {
          initVADOnStream(stream);
          // Stop this extra stream on recognition end (VAD stopVAD handles AudioCtx)
          stream.getTracks().forEach(t => t.addEventListener('ended', () => {}));
          // Store to clean up later
          rec._vadStream = stream;
        }).catch(() => { /* VAD optional - no error */ });
      }
    };

    rec.onresult = (event) => {
      let spokenText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        spokenText += event.results[i][0].transcript;
      }

      if (event.results[event.resultIndex]?.isFinal) {
        stopVAD();
        const similarity = calculateSimilarity(spokenText, sent.hanzi);
        const percent = Math.round(similarity * 100);

        const feedbackEl = document.getElementById('dict-action-feedback');
        if (feedbackEl) {
          feedbackEl.style.display = 'block';
          if (percent >= 70) {
            feedbackEl.className = 'dict-feedback-badge success';
            feedbackEl.innerHTML = `🎯 Bạn nói: <strong>"${spokenText}"</strong> — Chuẩn xác: <strong style="color: #34d399;">${percent}% (Xuất Sắc!)</strong> 🎉`;
            totalScore += 10;
            currentStreak += 1;
            userAnswers[sent.id] = { isCorrect: true, score: 10, userAnswer: spokenText };
            const sc = document.getElementById('dict-score-counter');
            const stk = document.getElementById('dict-streak-counter');
            if (sc) sc.textContent = `${totalScore} điểm`;
            if (stk) stk.textContent = `${currentStreak} 🔥`;
            showToast(`🎉 Phát âm chuẩn xác ${percent}%! +10 Điểm`);
          } else {
            feedbackEl.className = 'dict-feedback-badge warning';
            feedbackEl.innerHTML = `🎙️ Bạn nói: <strong>"${spokenText}"</strong> — Chuẩn xác: <strong style="color: #fbbf24;">${percent}%</strong> — Mục tiêu: "${sent.hanzi}"`;
            showToast(`Độ chuẩn ${percent}% — Thử nghe lại mẫu rồi nói lại nhé!`);
          }
        }
        renderCurrentSentenceHeaderStats();
      }
    };

    rec.onerror = (event) => {
      console.warn('Speech error:', event.error);
      stopVAD();
      if (rec._vadStream) { try { rec._vadStream.getTracks().forEach(t => t.stop()); } catch(e){} }
      if (micBtn) {
        micBtn.style.background = '';
        micBtn.style.boxShadow = 'none';
        micBtn.innerHTML = '<i class="fa-solid fa-microphone" style="color: #ec4899;"></i> <span>Luyện Nói</span>';
      }
      activeRecognition = null;
      const errorMessages = {
        'not-allowed': 'Vui lòng cấp quyền Micro trên trình duyệt để luyện nói!',
        'no-speech': 'Không nghe thấy giọng nói — Hãy nói to hơn và thử lại!',
        'network': 'Lỗi mạng khi nhận diện giọng nói — Kiểm tra kết nối Internet.',
        'audio-capture': 'Không tìm thấy Micro — Hãy kiểm tra thiết bị âm thanh.'
      };
      showToast(errorMessages[event.error] || `Lỗi nhận diện: ${event.error}`, true);
    };

    rec.onend = () => {
      stopVAD();
      if (rec._vadStream) { try { rec._vadStream.getTracks().forEach(t => t.stop()); } catch(e){} }
      if (micBtn) {
        micBtn.style.background = '';
        micBtn.style.boxShadow = 'none';
        micBtn.innerHTML = '<i class="fa-solid fa-microphone" style="color: #ec4899;"></i> <span>Luyện Nói</span>';
      }
      activeRecognition = null;
    };

    activeRecognition = rec;
    rec.start();
  } catch (err) {
    console.error('Speech start error:', err);
    stopVAD();
    if (micBtn) {
      micBtn.style.background = '';
      micBtn.style.boxShadow = 'none';
      micBtn.innerHTML = '<i class="fa-solid fa-microphone" style="color: #ec4899;"></i> <span>Luyện Nói</span>';
    }
    activeRecognition = null;
    showToast('Không thể khởi động micro — Hãy kiểm tra quyền truy cập Micro!', true);
  }
};

// Delete Custom Video
window.deleteCustomVideo = async function(lessonId) {
  const lesson = allLessons.find(l => l.id === lessonId);
  const title = lesson ? lesson.title : 'video này';
  if (!confirm(`Bạn có chắc chắn muốn xóa "${title}" khỏi danh sách video của bạn không?`)) {
    return;
  }

  const email = getCurrentUserEmail();

  // 1. Remove from allLessons
  allLessons = allLessons.filter(l => l.id !== lessonId);
  
  // 2. Remove from localStorage
  const localList = getLocalCustomVideos().filter(l => l.id !== lessonId);
  saveLocalCustomVideos(localList);

  // 3. Delete from backend
  try {
    await fetch(`/api/dictation/lessons/${lessonId}?userEmail=${encodeURIComponent(email)}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.warn("Delete server error:", e);
  }

  // 4. Update UI
  updateMyVideosBadge();
  const activeCatBtn = document.querySelector('.cat-pill-btn.active');
  const cat = activeCatBtn?.dataset.cat || 'all';
  const lvl = activeCatBtn?.dataset.level || 'all';
  const searchVal = document.getElementById('dict-search-input')?.value.trim() || '';
  filterLessons(cat, lvl, searchVal);

  showToast("Đã xóa video khỏi danh sách của bạn! 🗑️");
};

// ==========================================
// CATALOG & LESSON SELECTION
// ==========================================

function renderCatalogGrid() {
  const grid = document.getElementById('dict-lessons-catalog-grid');
  if (!grid) return;

  grid.innerHTML = '';
  const email = getCurrentUserEmail();
  const activeCatBtn = document.querySelector('.cat-pill-btn.active');
  const isMyVideosTab = activeCatBtn?.dataset.cat === 'my_videos';

  if (filteredLessons.length === 0) {
    if (isMyVideosTab) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted); background: rgba(255,255,255,0.03); border: 1.5px dashed rgba(245, 158, 11, 0.4); border-radius: 20px;">
          <i class="fa-brands fa-youtube" style="font-size: 3.5rem; color: #ef4444; margin-bottom: 16px; opacity: 0.85;"></i>
          <h3 style="color: var(--text-primary); font-size: 1.3rem; margin-bottom: 8px;">Bạn chưa có video cá nhân nào</h3>
          <p style="max-width: 500px; margin: 0 auto 20px; font-size: 0.92rem; color: var(--text-secondary);">
            Dán bất kỳ link video YouTube yêu thích nào (MV, phim hoạt hình, hội thoại...) để tạo bài luyện nghe chép chính tả cá nhân hóa!
          </p>
          <button class="btn btn-primary" onclick="window.openAddVideoModal()" style="background: linear-gradient(135deg, #ef4444, #f97316); border: none; font-weight: 800; padding: 12px 28px; border-radius: 50px; box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);">
            <i class="fa-solid fa-plus"></i> Thêm Video YouTube Ngay
          </button>
        </div>
      `;
    } else {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <i class="fa-solid fa-video-slash" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
          <h3>Không tìm thấy video nào phù hợp</h3>
          <p>Vui lòng thử chọn danh mục khác hoặc bấm nút [Thêm Video YouTube] ở trên để tạo bài mới!</p>
        </div>
      `;
    }
    return;
  }

  filteredLessons.forEach(lesson => {
    const isUserVideo = lesson.isCustom === true || (lesson.userEmail && (lesson.userEmail === email || lesson.userEmail === 'guest'));

    const card = document.createElement('div');
    card.className = 'dict-lesson-card glass-panel';
    card.innerHTML = `
      <div class="dict-card-thumb-wrap">
        <img src="${lesson.thumbnail || `https://img.youtube.com/vi/${lesson.youtubeId}/hqdefault.jpg`}" alt="${lesson.title}" loading="lazy">
        <span class="dict-card-dur-badge"><i class="fa-regular fa-clock"></i> ${lesson.duration || '03:00'}</span>
        <span class="dict-card-level-badge level-${lesson.level || '1'}">${lesson.levelText || `HSK ${lesson.level || 1}`}</span>
        <button class="dict-card-play-overlay-btn" title="Bắt đầu luyện chép">
          <i class="fa-solid fa-play"></i>
        </button>
      </div>
      <div class="dict-card-body">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          ${isUserVideo 
            ? `<span class="dict-card-cat-badge dict-my-badge"><i class="fa-solid fa-user-check"></i> Video Của Tôi</span>` 
            : `<span class="dict-card-cat-badge"><i class="fa-solid fa-tag"></i> ${lesson.category || 'Tổng Hợp'}</span>`
          }
          ${isUserVideo ? `
            <button class="btn-delete-custom-video" onclick="event.stopPropagation(); window.deleteCustomVideo('${lesson.id}')" title="Xóa video khỏi danh sách của bạn">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          ` : ''}
        </div>
        <h3 class="dict-card-title">${lesson.title}</h3>
        <p class="dict-card-desc">${lesson.description || 'Bài luyện nghe chép chính tả qua video YouTube.'}</p>
        <div class="dict-card-footer">
          <span class="dict-card-sentences-count"><i class="fa-solid fa-list-ol"></i> ${lesson.sentences?.length || 0} câu thoại</span>
          <button class="btn btn-primary btn-sm btn-start-study">
            <i class="fa-solid fa-pencil"></i> Luyện Chép
          </button>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      openLessonWorkspace(lesson);
    });

    grid.appendChild(card);
  });
}

function filterLessons(category = 'all', level = 'all', keyword = '') {
  const email = getCurrentUserEmail();
  filteredLessons = allLessons.filter(l => {
    let matchCat = false;
    if (category === 'all') {
      matchCat = true;
    } else if (category === 'my_videos') {
      matchCat = l.isCustom === true || (l.userEmail && (l.userEmail === email || l.userEmail === 'guest'));
    } else {
      matchCat = l.category === category;
    }

    const matchLvl = (level === 'all') || (String(l.level) === String(level));
    const matchKey = !keyword || l.title.toLowerCase().includes(keyword.toLowerCase()) || (l.description && l.description.toLowerCase().includes(keyword.toLowerCase()));
    return matchCat && matchLvl && matchKey;
  });
  renderCatalogGrid();
}

function openLessonWorkspace(lesson) {
  currentLesson = lesson;
  currentSentenceIdx = 0;
  totalScore = 0;
  currentStreak = 0;
  userAnswers = {};

  const catalogView = document.getElementById('dict-catalog-view');
  const workspaceView = document.getElementById('dict-workspace-view');

  if (catalogView) catalogView.style.display = 'none';
  if (workspaceView) workspaceView.style.display = 'block';

  // Set titles & breadcrumb
  const titleEl = document.getElementById('workspace-lesson-title');
  if (titleEl) titleEl.textContent = lesson.title;

  const levelBadge = document.getElementById('workspace-lesson-level-badge');
  if (levelBadge) {
    levelBadge.textContent = lesson.levelText || `HSK ${lesson.level || 1}`;
    levelBadge.className = `level-badge level-${lesson.level || '1'}`;
  }

  // Setup YouTube player
  setupPlayerForVideo(lesson.youtubeId);
  renderCurrentSentence();

  // Scroll to workspace top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function returnToCatalog() {
  if (ytPlayer && ytPlayer.pauseVideo) {
    try { ytPlayer.pauseVideo(); } catch (e) {}
  }
  stopPlaybackWatcher();

  const catalogView = document.getElementById('dict-catalog-view');
  const workspaceView = document.getElementById('dict-workspace-view');

  if (catalogView) catalogView.style.display = 'block';
  if (workspaceView) workspaceView.style.display = 'none';
}

// ==========================================
// ADD CUSTOM YOUTUBE VIDEO MODAL
// ==========================================

function openAddVideoModal() {
  const modal = document.getElementById('dict-add-video-modal');
  if (modal) modal.style.display = 'flex';
}

function closeAddVideoModal() {
  const modal = document.getElementById('dict-add-video-modal');
  if (modal) modal.style.display = 'none';
}

function parseTimeToSeconds(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.trim().split(':').map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return null;
}

async function handleSaveCustomVideo(e) {
  e.preventDefault();
  const urlInput = document.getElementById('custom-video-url').value.trim();
  const titleInput = document.getElementById('custom-video-title').value.trim();
  const levelInput = document.getElementById('custom-video-level').value;
  const catInput = document.getElementById('custom-video-cat').value;
  const rawSubtitles = document.getElementById('custom-video-subtitles').value.trim();

  // Extract YouTube ID
  const ytId = extractYouTubeId(urlInput);
  if (!ytId) {
    showToast("Link YouTube không hợp lệ! Vui lòng kiểm tra lại.", true);
    return;
  }

  let sentences = [];
  if (rawSubtitles) {
    const lines = rawSubtitles.split('\n').map(l => l.trim()).filter(Boolean);
    let curTime = 2.0;

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      let startTime = curTime;
      let endTime = curTime + 4.0;
      let textLine = line;

      // Check for timestamp bracket format: [00:12 - 00:18] or 0:15
      const bracketMatch = line.match(/^\[\s*([\d:.]+)\s*(?:-|–|to)\s*([\d:.]+)\s*\]\s*(.*)$/i);
      if (bracketMatch) {
        const sTime = parseTimeToSeconds(bracketMatch[1]);
        const eTime = parseTimeToSeconds(bracketMatch[2]);
        if (sTime !== null) startTime = sTime;
        if (eTime !== null && eTime > startTime) endTime = eTime;
        textLine = bracketMatch[3].trim();
      }

      const parts = textLine.split('|').map(p => p.trim());
      const hanzi = parts[0] || '';
      let pinyin = parts[1] || '';
      let meaning = parts[2] || (parts.length === 2 && !/[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(parts[1]) ? parts[1] : 'Câu luyện chép tiếng Trung');

      if (!pinyin && hanzi) {
        try {
          const res = await fetch('/api/dictation/pinyin-helper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: hanzi })
          });
          if (res.ok) {
            const d = await res.json();
            pinyin = d.pinyin || '';
          }
        } catch (err) {}
      }

      const duration = Math.max(3, Math.min(10, hanzi.length * 0.55));
      if (!bracketMatch) {
        endTime = parseFloat((startTime + duration).toFixed(1));
        curTime = endTime + 0.6;
      }

      const cleanHanzi = hanzi.replace(/[^\u4e00-\u9fa5]/g, '');
      const keywords = [];
      if (cleanHanzi.length >= 2) {
        keywords.push(cleanHanzi.slice(0, Math.min(2, cleanHanzi.length)));
        if (cleanHanzi.length >= 4) {
          keywords.push(cleanHanzi.slice(2, 4));
        }
      } else if (cleanHanzi.length === 1) {
        keywords.push(cleanHanzi);
      }

      sentences.push({
        id: idx + 1,
        startTime: parseFloat(startTime.toFixed(1)),
        endTime: parseFloat(endTime.toFixed(1)),
        hanzi: hanzi,
        pinyin: pinyin,
        meaning: meaning,
        keywords: keywords.length > 0 ? keywords : [hanzi.slice(0, 1)],
        blankIndices: [0]
      });
    }
  }

  if (sentences.length === 0) {
    sentences.push({
      id: 1,
      startTime: 0,
      endTime: 15.0,
      hanzi: "你好，欢迎学习中文！",
      pinyin: "Nǐ hǎo, huānyíng xuéxí zhōngwén!",
      meaning: "Xin chào, chào mừng bạn học tiếng Trung!",
      keywords: ["你好", "中文"],
      blankIndices: [0]
    });
  }

  const email = getCurrentUserEmail();
  const newLesson = {
    id: `dict_custom_${Date.now()}`,
    title: titleInput || `Video Luyện Chép (${ytId})`,
    youtubeId: ytId,
    duration: '03:30',
    level: levelInput,
    levelText: `HSK ${levelInput}`,
    category: catInput,
    thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    description: `Video cá nhân được thêm bởi ${currentUser?.name || email}.`,
    isCustom: true,
    userEmail: email,
    createdAt: new Date().toISOString(),
    sentences: sentences
  };

  // 1. Add to allLessons
  allLessons.unshift(newLesson);

  // 2. Save to local storage
  const localList = getLocalCustomVideos();
  localList.unshift(newLesson);
  saveLocalCustomVideos(localList);

  // 3. Sync to server
  fetch('/api/dictation/save-lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newLesson)
  }).catch(err => console.warn("Sync new lesson error:", err));

  // 4. Update UI
  updateMyVideosBadge();
  closeAddVideoModal();

  // Reset form
  document.getElementById('custom-video-form').reset();
  const previewBox = document.getElementById('custom-video-preview-box');
  if (previewBox) previewBox.style.display = 'none';

  // Automatically switch to "Video Của Tôi" tab
  document.querySelectorAll('.cat-pill-btn').forEach(b => b.classList.remove('active'));
  const myPill = document.getElementById('my-videos-pill');
  if (myPill) myPill.classList.add('active');

  filterLessons('my_videos', 'all');
  showToast("🎉 Đã thêm video vào danh sách của bạn thành công!");
}

// ==========================================
// INITIALIZATION ON DOM READY
// ==========================================

async function initVideoDictationPage() {
  initCurrentUser();
  initYouTubeAPI();

  // Fetch Lessons from Backend API
  let serverLessons = [];
  try {
    const res = await fetch('/api/dictation/lessons');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        serverLessons = data;
      } else {
        serverLessons = DEFAULT_LESSONS;
      }
    } else {
      serverLessons = DEFAULT_LESSONS;
    }
  } catch (e) {
    console.warn("Using default fallback lessons:", e);
    serverLessons = DEFAULT_LESSONS;
  }

  // Merge server lessons with local custom lessons
  const localCustom = getLocalCustomVideos();
  const map = new Map();
  serverLessons.forEach(l => map.set(l.id, l));
  localCustom.forEach(l => {
    if (!map.has(l.id)) {
      map.set(l.id, l);
    }
  });

  allLessons = Array.from(map.values());
  updateMyVideosBadge();

  filteredLessons = [...allLessons];
  renderCatalogGrid();

  // Setup Event Listeners
  setupEventListeners();

  // Check URL params (e.g. ?lesson=dict_lesson_1)
  const params = new URLSearchParams(window.location.search);
  const lessonId = params.get('lesson');
  if (lessonId) {
    const target = allLessons.find(l => l.id === lessonId);
    if (target) openLessonWorkspace(target);
  }
}

function setupEventListeners() {
  // Level Tabs Filter
  document.querySelectorAll('.cat-pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.cat-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat || 'all';
      const lvl = btn.dataset.level || 'all';
      const searchVal = document.getElementById('dict-search-input')?.value.trim() || '';
      filterLessons(cat, lvl, searchVal);
    });
  });

  // Search input
  const searchInput = document.getElementById('dict-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const activeCatBtn = document.querySelector('.cat-pill-btn.active');
      const cat = activeCatBtn?.dataset.cat || 'all';
      const lvl = activeCatBtn?.dataset.level || 'all';
      filterLessons(cat, lvl, e.target.value.trim());
    });
  }

  // Keyboard Shortcuts (Space to replay, Enter to submit, Ctrl+H to hint)
  document.addEventListener('keydown', (e) => {
    // If not in workspace, return
    const ws = document.getElementById('dict-workspace-view');
    if (!ws || ws.style.display === 'none') return;

    if (e.code === 'Space' && (e.ctrlKey || e.target.tagName !== 'INPUT')) {
      e.preventDefault();
      replaySnippet();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      checkCurrentAnswer();
    } else if ((e.key === 'h' || e.key === 'H') && e.ctrlKey) {
      e.preventDefault();
      showHint();
    } else if (e.key === 'ArrowRight' && e.ctrlKey) {
      e.preventDefault();
      nextSentence();
    } else if (e.key === 'ArrowLeft' && e.ctrlKey) {
      e.preventDefault();
      prevSentence();
    }
  });

  // Add Custom Video Form
  const customForm = document.getElementById('custom-video-form');
  if (customForm) {
    customForm.addEventListener('submit', handleSaveCustomVideo);
  }
}

// Export functions to window for onclick handlers
window.replaySnippet = replaySnippet;
window.setPlaybackSpeed = setPlaybackSpeed;
window.toggleAutoPause = toggleAutoPause;
window.toggleVideoBlur = toggleVideoBlur;
window.switchMode = switchMode;
window.checkCurrentAnswer = checkCurrentAnswer;
window.showHint = showHint;
window.revealAnswer = revealAnswer;
window.nextSentence = nextSentence;
window.prevSentence = prevSentence;
window.speakChinese = speakChinese;
window.speakCurrentSentence = speakCurrentSentence;
window.openHanziModal = openHanziModal;
window.animateCurrentHanzi = animateCurrentHanzi;
window.closeHanziModal = closeHanziModal;
// Dynamic getters so inline onclick HTML can access live state
Object.defineProperty(window, 'currentLesson', {
  get: () => currentLesson,
  configurable: true
});
Object.defineProperty(window, 'currentSentenceIdx', {
  get: () => currentSentenceIdx,
  configurable: true
});
window.openLessonWorkspace = openLessonWorkspace;
window.returnToCatalog = returnToCatalog;
window.openAddVideoModal = openAddVideoModal;
window.closeAddVideoModal = closeAddVideoModal;
window.updateTimingDisplay = updateTimingDisplay;
window.jumpToSentence = function(idx) {
  currentSentenceIdx = idx;
  renderCurrentSentence();
  playCurrentSentence();
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVideoDictationPage);
} else {
  initVideoDictationPage();
}
