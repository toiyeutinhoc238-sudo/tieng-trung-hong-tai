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
let currentSpeed = 0.85;
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
    "levelText": "HSK 1",
    "category": "Âm Nhạc",
    "thumbnail": "https://img.youtube.com/vi/kpDING7mMcQ/hqdefault.jpg",
    "description": "Bài hát bất hủ của Đặng Lệ Quân với giai điệu chậm rãi, ca từ tha thiết cực kỳ phù hợp cho người học tiếng Trung luyện nghe chép chính tả.",
    "sentences": [
      {
        "id": 1,
        "startTime": 9,
        "endTime": 18,
        "hanzi": "你问我爱你有多深",
        "pinyin": "nǐ wèn wǒ ài nǐ yǒu duō shēn",
        "meaning": "Bạn hỏi tôi yêu bạn sâu đậm biết bao",
        "keywords": [
          "你问",
          "多深"
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
        "hanzi": "我爱你有几分",
        "pinyin": "wǒ ài nǐ yǒu jǐ fēn",
        "meaning": "Tôi yêu bạn được bao nhiêu phần",
        "keywords": [
          "我爱",
          "几分"
        ],
        "blankIndices": [
          0,
          4
        ]
      },
      {
        "id": 3,
        "startTime": 27,
        "endTime": 36.68,
        "hanzi": "我的情也真，我的爱也真，月亮代表我的心",
        "pinyin": "wǒ de qíng yě zhēn ， wǒ de ài yě zhēn ， yuè liàng dài biǎo wǒ de xīn",
        "meaning": "Tình tôi cũng thật, lòng tôi cũng chân thành, ánh trăng đại diện cho trái tim tôi",
        "keywords": [
          "真",
          "月亮",
          "代表"
        ],
        "blankIndices": [
          3,
          9,
          14
        ]
      },
      {
        "id": 4,
        "startTime": 36.68,
        "endTime": 48.56,
        "hanzi": "你问我爱你有多深，我爱你有几分",
        "pinyin": "nǐ wèn wǒ ài nǐ yǒu duō shēn ， wǒ ài nǐ yǒu jǐ fēn",
        "meaning": "Em hỏi anh yêu em sâu đậm thế nào, anh yêu em bao nhiêu phần",
        "keywords": [
          "你问",
          "几分"
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
        "hanzi": "我的情不移，我的爱不变，月亮代表我的心",
        "pinyin": "wǒ de qíng bù yí ， wǒ de ài bú biàn ， yuè liàng dài biǎo wǒ de xīn",
        "meaning": "Tình tôi không dời, lòng tôi không đổi, ánh trăng đại diện cho trái tim tôi",
        "keywords": [
          "不移",
          "不变",
          "代表"
        ],
        "blankIndices": [
          3,
          9,
          14
        ]
      },
      {
        "id": 6,
        "startTime": 60.76,
        "endTime": 72.76,
        "hanzi": "轻轻的一个吻，已经打动我的心",
        "pinyin": "qīng qīng de yí gè wěn ， yǐ jīng dǎ dòng wǒ de xīn",
        "meaning": "Một nụ hôn nhẹ nhàng đã làm rung động trái tim tôi",
        "keywords": [
          "轻轻",
          "打动"
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
        "hanzi": "深深的一段情，叫我思念到如今",
        "pinyin": "shēn shēn de yí duàn qíng ， jiào wǒ sī niàn dào rú jīn",
        "meaning": "Một mối tình sâu đậm khiến tôi vương vấn nhớ thương đến tận hôm nay",
        "keywords": [
          "深深",
          "思念",
          "如今"
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
        "hanzi": "你问我爱你有多深，我爱你有几分",
        "pinyin": "nǐ wèn wǒ ài nǐ yǒu duō shēn ， wǒ ài nǐ yǒu jǐ fēn",
        "meaning": "Em hỏi anh yêu em sâu đậm thế nào, anh yêu em bao nhiêu phần",
        "keywords": [
          "你问",
          "几分"
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
        "hanzi": "你去想一想，你去看一看，月亮代表我的心",
        "pinyin": "nǐ qù xiǎng yi xiǎng ， nǐ qù kàn yi kàn ， yuè liàng dài biǎo wǒ de xīn",
        "meaning": "Bạn hãy nghĩ lại xem, bạn hãy nhìn xem, ánh trăng đại diện cho trái tim tôi",
        "keywords": [
          "想一想",
          "看一看"
        ],
        "blankIndices": [
          2,
          8,
          14
        ]
      },
      {
        "id": 10,
        "startTime": 127.81,
        "endTime": 139.51,
        "hanzi": "轻轻的一个吻，已经打动我的心",
        "pinyin": "qīng qīng de yí gè wěn ， yǐ jīng dǎ dòng wǒ de xīn",
        "meaning": "Một nụ hôn nhẹ nhàng đã làm rung động trái tim tôi",
        "keywords": [
          "轻轻",
          "打动"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 11,
        "startTime": 139.51,
        "endTime": 151.75,
        "hanzi": "深深的一段情，叫我思念到如今",
        "pinyin": "shēn shēn de yí duàn qíng ， jiào wǒ sī niàn dào rú jīn",
        "meaning": "Một mối tình sâu đậm khiến tôi vương vấn nhớ thương đến tận hôm nay",
        "keywords": [
          "深深",
          "思念"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 12,
        "startTime": 151.75,
        "endTime": 164.83,
        "hanzi": "你问我爱你有多深，我爱你有几分",
        "pinyin": "nǐ wèn wǒ ài nǐ yǒu duō shēn ， wǒ ài nǐ yǒu jǐ fēn",
        "meaning": "Em hỏi anh yêu em sâu đậm thế nào, anh yêu em bao nhiêu phần",
        "keywords": [
          "你问",
          "几分"
        ],
        "blankIndices": [
          0,
          7,
          13
        ]
      },
      {
        "id": 13,
        "startTime": 164.83,
        "endTime": 173.91,
        "hanzi": "你去想一想，你去看一看",
        "pinyin": "nǐ qù xiǎng yi xiǎng ， nǐ qù kàn yi kàn",
        "meaning": "Bạn hãy nghĩ lại xem, bạn hãy nhìn xem",
        "keywords": [
          "想一想",
          "看一看"
        ],
        "blankIndices": [
          2,
          8
        ]
      },
      {
        "id": 14,
        "startTime": 173.91,
        "endTime": 186.17,
        "hanzi": "月亮代表我的心，你去想一想",
        "pinyin": "yuè liàng dài biǎo wǒ de xīn ， nǐ qù xiǎng yi xiǎng",
        "meaning": "Ánh trăng đại diện cho trái tim tôi, bạn hãy nghĩ lại xem",
        "keywords": [
          "月亮",
          "想一想"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 15,
        "startTime": 186.17,
        "endTime": 194.13,
        "hanzi": "你去看一看，月亮代表我的心",
        "pinyin": "nǐ qù kàn yi kàn ， yuè liàng dài biǎo wǒ de xīn",
        "meaning": "Bạn hãy nhìn xem, ánh trăng đại diện cho trái tim tôi",
        "keywords": [
          "看一看",
          "代表"
        ],
        "blankIndices": [
          2,
          8,
          12
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
    "levelText": "HSK 1",
    "category": "Giao Tiếp",
    "thumbnail": "https://img.youtube.com/vi/8oS6uXOZ_TA/hqdefault.jpg",
    "description": "Các câu chào hỏi, hỏi tên, quốc tịch và giới thiệu bản thân thông dụng nhất trong tiếng Trung.",
    "sentences": [
      {
        "id": 1,
        "startTime": 0,
        "endTime": 2,
        "hanzi": "你好！",
        "pinyin": "nǐ hǎo ！",
        "meaning": "Xin chào!",
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
        "hanzi": "你好！",
        "pinyin": "nǐ hǎo ！",
        "meaning": "Xin chào!",
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
        "hanzi": "你叫什么名字？",
        "pinyin": "nǐ jiào shén me míng zì ？",
        "meaning": "Bạn tên là gì?",
        "keywords": [
          "名字",
          "什么"
        ],
        "blankIndices": [
          0,
          2,
          4
        ]
      },
      {
        "id": 4,
        "startTime": 7,
        "endTime": 10,
        "hanzi": "我叫王明，你呢？",
        "pinyin": "wǒ jiào wáng míng ， nǐ ne ？",
        "meaning": "Tôi tên là Vương Minh, còn bạn thì sao?",
        "keywords": [
          "我叫",
          "你呢"
        ],
        "blankIndices": [
          0,
          2,
          5
        ]
      },
      {
        "id": 5,
        "startTime": 10,
        "endTime": 13,
        "hanzi": "我叫李红。",
        "pinyin": "wǒ jiào lǐ hóng 。",
        "meaning": "Tôi tên là Lý Hồng.",
        "keywords": [
          "我叫",
          "李红"
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
        "meaning": "Rất vui được làm quen với bạn.",
        "keywords": [
          "高兴",
          "认识"
        ],
        "blankIndices": [
          1,
          4
        ]
      },
      {
        "id": 7,
        "startTime": 16,
        "endTime": 19,
        "hanzi": "我也很高兴认识你。",
        "pinyin": "wǒ yě hěn gāo xìng rèn shi nǐ 。",
        "meaning": "Tôi cũng rất vui được làm quen với bạn.",
        "keywords": [
          "我也",
          "认识"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 8,
        "startTime": 19,
        "endTime": 22,
        "hanzi": "你是中国人吗？",
        "pinyin": "nǐ shì zhōng guó rén ma ？",
        "meaning": "Bạn có phải là người Trung Quốc không?",
        "keywords": [
          "中国人"
        ],
        "blankIndices": [
          0,
          2,
          5
        ]
      },
      {
        "id": 9,
        "startTime": 22,
        "endTime": 26,
        "hanzi": "不是，我是越南人。",
        "pinyin": "bú shì ， wǒ shì yuè nán rén 。",
        "meaning": "Không phải, tôi là người Việt Nam.",
        "keywords": [
          "越南人"
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
        "hanzi": "你会说汉语吗？",
        "pinyin": "nǐ huì shuō hàn yǔ ma ？",
        "meaning": "Bạn có biết nói tiếng Trung không?",
        "keywords": [
          "汉语",
          "会说"
        ],
        "blankIndices": [
          1,
          3
        ]
      },
      {
        "id": 11,
        "startTime": 29,
        "endTime": 32,
        "hanzi": "会一点儿。",
        "pinyin": "huì yì diǎnr 。",
        "meaning": "Biết một chút.",
        "keywords": [
          "一点儿"
        ],
        "blankIndices": [
          0,
          2
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
          "汉语",
          "很好"
        ],
        "blankIndices": [
          2,
          5
        ]
      },
      {
        "id": 13,
        "startTime": 35,
        "endTime": 37,
        "hanzi": "谢谢！",
        "pinyin": "xiè xiè ！",
        "meaning": "Cảm ơn!",
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
        "meaning": "Không có chi / Đừng khách sáo.",
        "keywords": [
          "不客气"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 15,
        "startTime": 39,
        "endTime": 42,
        "hanzi": "你今年多大？",
        "pinyin": "nǐ jīn nián duō dà ？",
        "meaning": "Năm nay bạn bao nhiêu tuổi?",
        "keywords": [
          "今年",
          "多大"
        ],
        "blankIndices": [
          1,
          4
        ]
      },
      {
        "id": 16,
        "startTime": 42,
        "endTime": 45,
        "hanzi": "我二十岁。",
        "pinyin": "wǒ èr shí suì 。",
        "meaning": "Tôi hai mươi tuổi.",
        "keywords": [
          "二十岁"
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
        "hanzi": "你呢？",
        "pinyin": "nǐ ne ？",
        "meaning": "Còn bạn thì sao?",
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
        "hanzi": "我二十二岁。",
        "pinyin": "wǒ èr shí èr suì 。",
        "meaning": "Tôi hai mươi hai tuổi.",
        "keywords": [
          "二十二岁"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 19,
        "startTime": 50,
        "endTime": 53,
        "hanzi": "你好吗？",
        "pinyin": "nǐ hǎo ma ？",
        "meaning": "Bạn có khỏe không?",
        "keywords": [
          "好吗"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 20,
        "startTime": 53,
        "endTime": 56,
        "hanzi": "我很好，你呢？",
        "pinyin": "wǒ hěn hǎo ， nǐ ne ？",
        "meaning": "Tôi rất khỏe, còn bạn?",
        "keywords": [
          "很好",
          "你呢"
        ],
        "blankIndices": [
          1,
          4
        ]
      },
      {
        "id": 21,
        "startTime": 56,
        "endTime": 58,
        "hanzi": "我也很好。",
        "pinyin": "wǒ yě hěn hǎo 。",
        "meaning": "Tôi cũng rất khỏe.",
        "keywords": [
          "我也",
          "很好"
        ],
        "blankIndices": [
          1,
          3
        ]
      },
      {
        "id": 22,
        "startTime": 59,
        "endTime": 62,
        "hanzi": "你在哪儿工作？",
        "pinyin": "nǐ zài nǎr gōng zuò ？",
        "meaning": "Bạn làm việc ở đâu?",
        "keywords": [
          "在哪儿",
          "工作"
        ],
        "blankIndices": [
          1,
          4
        ]
      }
    ]
  },
  {
    "id": "dict_lesson_3",
    "title": "Hoạt Hình Heo Peppa Tiếng Trung (小猪佩奇 - 跳泥坑)",
    "youtubeId": "RT1yYLfqNhU",
    "duration": "01:00",
    "level": "1",
    "levelText": "HSK 1",
    "category": "Hoạt Hình",
    "thumbnail": "https://img.youtube.com/vi/RT1yYLfqNhU/hqdefault.jpg",
    "description": "Luyện nghe tiếng Trung siêu dễ thương qua bộ phim hoạt hình Peppa Pig với phát âm chuẩn Bắc Kinh rõ ràng.",
    "sentences": [
      {
        "id": 1,
        "startTime": 0,
        "endTime": 8.84,
        "hanzi": "我是佩奇，这是我的弟弟乔治",
        "pinyin": "wǒ shì pèi qí ， zhè shì wǒ de dì di qiáo zhì",
        "meaning": "Tôi là Peppa, đây là em trai tôi George",
        "keywords": [
          "佩奇",
          "弟弟"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 2,
        "startTime": 8.84,
        "endTime": 21.1,
        "hanzi": "这是我的妈妈，这是我的爸爸",
        "pinyin": "zhè shì wǒ de mā ma ， zhè shì wǒ de bà ba",
        "meaning": "Đây là mẹ tôi, đây là bố tôi",
        "keywords": [
          "妈妈",
          "爸爸"
        ],
        "blankIndices": [
          2,
          8
        ]
      },
      {
        "id": 3,
        "startTime": 21.1,
        "endTime": 30.78,
        "hanzi": "今天下雨了，所以佩奇和乔治不能在外面玩",
        "pinyin": "jīn tiān xià yǔ le ， suǒ yǐ pèi qí hé qiáo zhì bù néng zài wài miàn wán",
        "meaning": "Hôm nay trời mưa, vậy nên Peppa và George không thể chơi ngoài trời",
        "keywords": [
          "下雨",
          "外面"
        ],
        "blankIndices": [
          2,
          9,
          16
        ]
      },
      {
        "id": 4,
        "startTime": 30.78,
        "endTime": 40.9,
        "hanzi": "爸爸，现在雨停了，我们能出去玩吗？好的，你们两个去玩吧",
        "pinyin": "bà ba ， xiàn zài yǔ tíng le ， wǒ men néng chū qù wán ma ？ hǎo de ， nǐ men liǎng gè qù wán ba",
        "meaning": "Bố ơi, giờ trời tạnh mưa rồi, chúng con ra ngoài chơi được không? Được rồi, hai đứa đi chơi đi",
        "keywords": [
          "雨停",
          "出去"
        ],
        "blankIndices": [
          4,
          11,
          20
        ]
      },
      {
        "id": 5,
        "startTime": 51.16,
        "endTime": 60.98,
        "hanzi": "佩奇最喜欢在泥坑里玩，我最喜欢在泥坑里玩了",
        "pinyin": "pèi qí zuì xǐ huan zài ní kēng lǐ wán ， wǒ zuì xǐ huan zài ní kēng lǐ wán le",
        "meaning": "Peppa thích chơi trong vũng bùn nhất, con thích nhất là chơi nhảy vũng bùn",
        "keywords": [
          "泥坑",
          "喜欢"
        ],
        "blankIndices": [
          2,
          6,
          16
        ]
      },
      {
        "id": 6,
        "startTime": 60.98,
        "endTime": 82.61,
        "hanzi": "如果你要在泥坑里跳，你必须得穿上靴子才行",
        "pinyin": "rú guǒ nǐ yào zài ní kēng lǐ tiào ， nǐ bì xū dé chuān shàng xuē zǐ cái xíng",
        "meaning": "Nếu con muốn nhảy vào vũng bùn, con phải đi ủng vào mới được",
        "keywords": [
          "泥坑",
          "靴子"
        ],
        "blankIndices": [
          5,
          12,
          17
        ]
      },
      {
        "id": 7,
        "startTime": 82.61,
        "endTime": 92.61,
        "hanzi": "对不起妈妈，乔治也喜欢在泥坑里跳",
        "pinyin": "duì bu qǐ mā ma ， qiáo zhì yě xǐ huan zài ní kēng lǐ tiào",
        "meaning": "Con xin lỗi mẹ, George cũng thích nhảy vào vũng bùn",
        "keywords": [
          "乔治",
          "泥坑"
        ],
        "blankIndices": [
          2,
          6,
          12
        ]
      },
      {
        "id": 8,
        "startTime": 92.61,
        "endTime": 101.95,
        "hanzi": "佩奇喜欢照顾她的弟弟乔治，好了乔治",
        "pinyin": "pèi qí xǐ huan zhào gù tā de dì di qiáo zhì ， hǎo le qiáo zhì",
        "meaning": "Peppa rất thích chăm sóc em trai George của mình, được rồi George",
        "keywords": [
          "照顾",
          "弟弟"
        ],
        "blankIndices": [
          3,
          8,
          14
        ]
      },
      {
        "id": 9,
        "startTime": 101.95,
        "endTime": 113.05,
        "hanzi": "我们再去找几个泥坑跳吧，佩奇和乔治玩得很开心",
        "pinyin": "wǒ men zài qù zhǎo jǐ gè ní kēng tiào ba ， pèi qí hé qiáo zhì wán dé hěn kāi xīn",
        "meaning": "Chúng ta đi tìm thêm vài vũng bùn nữa nhảy đi, Peppa và George chơi rất vui vẻ",
        "keywords": [
          "泥坑",
          "开心"
        ],
        "blankIndices": [
          6,
          13,
          19
        ]
      },
      {
        "id": 10,
        "startTime": 113.05,
        "endTime": 119.11,
        "hanzi": "佩奇找到了一个小泥坑，乔治找到了一个大泥坑",
        "pinyin": "pèi qí zhǎo dào le yí gè xiǎo ní kēng ， qiáo zhì zhǎo dào le yí gè dà ní kēng",
        "meaning": "Peppa tìm thấy một vũng bùn nhỏ, George tìm thấy một vũng bùn to",
        "keywords": [
          "小泥坑",
          "大泥坑"
        ],
        "blankIndices": [
          7,
          16
        ]
      },
      {
        "id": 11,
        "startTime": 122.61,
        "endTime": 133.33,
        "hanzi": "你看乔治，那里有个很大的泥坑",
        "pinyin": "nǐ kàn qiáo zhì ， nà lǐ yǒu gè hěn dà de ní kēng",
        "meaning": "Em nhìn kìa George, ở đằng kia có một vũng bùn rất lớn",
        "keywords": [
          "很大",
          "泥坑"
        ],
        "blankIndices": [
          2,
          9,
          13
        ]
      },
      {
        "id": 12,
        "startTime": 133.33,
        "endTime": 142.29,
        "hanzi": "乔治想第一个跳到泥坑里去玩，等一下乔治",
        "pinyin": "qiáo zhì xiǎng dì yī gè tiào dào ní kēng lǐ qù wán ， děng yí xià qiáo zhì",
        "meaning": "George muốn là người đầu tiên nhảy vào vũng bùn chơi, đợi một chút đã George",
        "keywords": [
          "第一个",
          "泥坑"
        ],
        "blankIndices": [
          3,
          8,
          14
        ]
      },
      {
        "id": 13,
        "startTime": 142.29,
        "endTime": 158.06,
        "hanzi": "我得先检查一下这里安不安全，很好你可以放心地玩了",
        "pinyin": "wǒ dé xiān jiǎn chá yí xià zhè lǐ ān bu ān quán ， hěn hǎo nǐ kě yǐ fàng xīn dì wán le",
        "meaning": "Chị phải kiểm tra xem ở đây có an toàn không đã, rất tốt em có thể yên tâm chơi rồi",
        "keywords": [
          "检查",
          "安全",
          "放心"
        ],
        "blankIndices": [
          3,
          9,
          18
        ]
      },
      {
        "id": 14,
        "startTime": 158.06,
        "endTime": 171.78,
        "hanzi": "佩奇和乔治喜欢在泥坑里跳来跳去",
        "pinyin": "pèi qí hé qiáo zhì xǐ huan zài ní kēng lǐ tiào lái tiào qù",
        "meaning": "Peppa và George thích nhảy qua nhảy lại trong vũng bùn",
        "keywords": [
          "泥坑",
          "跳来跳去"
        ],
        "blankIndices": [
          5,
          10,
          13
        ]
      },
      {
        "id": 15,
        "startTime": 177.46,
        "endTime": 189.26,
        "hanzi": "来吧乔治，我们快点去给爸爸看看吧",
        "pinyin": "lái ba qiáo zhì ， wǒ men kuài diǎn qù gěi bà ba kàn kàn ba",
        "meaning": "Đi nào George, chúng ta mau chạy lại cho bố xem nào",
        "keywords": [
          "快点",
          "看看"
        ],
        "blankIndices": [
          4,
          11
        ]
      },
      {
        "id": 16,
        "startTime": 189.26,
        "endTime": 198.72,
        "hanzi": "爸爸爸爸，你猜猜我们刚才干了什么？",
        "pinyin": "bà ba bà ba ， nǐ cāi cāi wǒ men gāng cái gàn le shén me ？",
        "meaning": "Bố ơi bố ơi, bố đoán xem vừa nãy chúng con làm gì nào?",
        "keywords": [
          "猜猜",
          "刚才"
        ],
        "blankIndices": [
          4,
          8,
          12
        ]
      },
      {
        "id": 17,
        "startTime": 198.72,
        "endTime": 207.32,
        "hanzi": "让我猜一猜，你们刚才看电视了？不对，你猜错了",
        "pinyin": "ràng wǒ cāi yi cāi ， nǐ men gāng cái kàn diàn shì le ？ bú duì ， nǐ cāi cuò le",
        "meaning": "Để bố đoán xem nào, vừa nãy các con xem TV à? Không đúng, bố đoán sai rồi",
        "keywords": [
          "看电视",
          "猜错"
        ],
        "blankIndices": [
          3,
          10,
          17
        ]
      },
      {
        "id": 18,
        "startTime": 207.32,
        "endTime": 217.58,
        "hanzi": "你们刚才在泥坑里跳来跳去？没错没错爸爸！",
        "pinyin": "nǐ men gāng cái zài ní kēng lǐ tiào lái tiào qù ？ méi cuò méi cuò bà ba ！",
        "meaning": "Vừa rồi các con nhảy nhót trong vũng bùn phải không? Đúng rồi đúng rồi bố ơi!",
        "keywords": [
          "泥坑",
          "没错"
        ],
        "blankIndices": [
          5,
          10,
          15
        ]
      },
      {
        "id": 19,
        "startTime": 217.58,
        "endTime": 236.19,
        "hanzi": "快清理干净，别让妈妈看到你们这么脏",
        "pinyin": "kuài qīng lǐ gān jìng ， bié ràng mā ma kàn dào nǐ men zhè me zāng",
        "meaning": "Mau rửa sạch đi, đừng để mẹ thấy các con lấm lem bẩn thế này",
        "keywords": [
          "清理",
          "干净",
          "脏"
        ],
        "blankIndices": [
          1,
          4,
          14
        ]
      },
      {
        "id": 20,
        "startTime": 236.19,
        "endTime": 245.69,
        "hanzi": "佩奇和乔治穿着他们的靴子",
        "pinyin": "pèi qí hé qiáo zhì chuān zhe tā men de xuē zǐ",
        "meaning": "Peppa và George đi đôi ủng của mình",
        "keywords": [
          "穿着",
          "靴子"
        ],
        "blankIndices": [
          4,
          9
        ]
      },
      {
        "id": 21,
        "startTime": 245.69,
        "endTime": 256.67,
        "hanzi": "猪妈妈和猪爸爸也穿着靴子，大家都喜欢跳泥坑",
        "pinyin": "zhū mā ma hé zhū bà ba yě chuān zhe xuē zǐ ， dà jiā dōu xǐ huan tiào ní kēng",
        "meaning": "Mẹ Heo và Bố Heo cũng đi ủng, tất cả mọi người đều thích nhảy vũng bùn",
        "keywords": [
          "大家",
          "泥坑"
        ],
        "blankIndices": [
          6,
          12,
          18
        ]
      },
      {
        "id": 22,
        "startTime": 256.67,
        "endTime": 266.67,
        "hanzi": "看那，大家都玩得非常开心！",
        "pinyin": "kàn nà ， dà jiā dōu wán dé fēi cháng kāi xīn ！",
        "meaning": "Nhìn kìa, mọi người đều chơi vô cùng vui vẻ!",
        "keywords": [
          "开心",
          "非常"
        ],
        "blankIndices": [
          3,
          9
        ]
      }
    ]
  },
  {
    "id": "dict_lesson_4",
    "title": "Hội Thoại Mua Sắm & Trả Giá HSK 2 (买衣服与讨价还价)",
    "youtubeId": "Asqr_Sz9wVM",
    "duration": "08:46",
    "level": "1",
    "levelText": "HSK 1",
    "category": "Đời Sống",
    "thumbnail": "https://img.youtube.com/vi/Asqr_Sz9wVM/hqdefault.jpg",
    "description": "Các mẫu câu tiếng Trung đi chợ, mua sắm quần áo, hỏi giá tiền và mặc cả chiết khấu thực tế.",
    "sentences": [
      {
        "id": 1,
        "startTime": 0.2,
        "endTime": 15.32,
        "hanzi": "大家好，今天我们一起来听一段有趣的对话，主题是在商店购物",
        "pinyin": "dà jiā hǎo ， jīn tiān wǒ men yì qǐ lái tīng yí duàn yǒu qù de duì huà ， zhǔ tí shì zài shāng diàn gòu wù",
        "meaning": "Xin chào mọi người, hôm nay chúng ta cùng nghe một đoạn hội thoại thú vị về mua sắm tại cửa hàng",
        "keywords": [
          "商店",
          "购物"
        ],
        "blankIndices": [
          5,
          14,
          23
        ]
      },
      {
        "id": 2,
        "startTime": 15.32,
        "endTime": 27.58,
        "hanzi": "在这段对话里，你们会学到很多和衣服、鞋子、配饰相关的词汇",
        "pinyin": "zài zhè duàn duì huà lǐ ， nǐ men huì xué dào hěn duō hé yī fu 、 xié zǐ 、 pèi shì xiāng guān de cí huì",
        "meaning": "Trong đoạn hội thoại này, bạn sẽ học được nhiều từ vựng liên quan đến quần áo, giày dép và phụ kiện",
        "keywords": [
          "衣服",
          "鞋子",
          "词汇"
        ],
        "blankIndices": [
          8,
          17,
          26
        ]
      },
      {
        "id": 3,
        "startTime": 27.58,
        "endTime": 38.44,
        "hanzi": "以及用中文询问价格、试穿和结账的方法",
        "pinyin": "yǐ jí yòng zhōng wén xún wèn jià gé 、 shì chuān hé jié zhàng de fāng fǎ",
        "meaning": "Cũng như cách dùng tiếng Trung để hỏi giá cả, thử đồ và thanh toán",
        "keywords": [
          "价格",
          "试穿",
          "结账"
        ],
        "blankIndices": [
          6,
          11,
          15
        ]
      },
      {
        "id": 4,
        "startTime": 38.44,
        "endTime": 40.94,
        "hanzi": "不知道现在还有很多商品吗？",
        "pinyin": "bù zhī dào xiàn zài hái yǒu hěn duō shāng pǐn ma ？",
        "meaning": "Không biết bây giờ còn nhiều hàng hóa không?",
        "keywords": [
          "商品",
          "现在"
        ],
        "blankIndices": [
          4,
          9
        ]
      },
      {
        "id": 5,
        "startTime": 41.94,
        "endTime": 51.82,
        "hanzi": "是的，我们商店正在进行大促销，从衣服、鞋子到家用电器都有优惠",
        "pinyin": "shì de ， wǒ men shāng diàn zhèng zài jìn xíng dà cù xiāo ， cóng yī fu 、 xié zǐ dào jiā yòng diàn qì dōu yǒu yōu huì",
        "meaning": "Vâng, cửa hàng chúng tôi đang có đợt đại giảm giá, từ quần áo, giày dép đến đồ gia dụng đều có ưu đãi",
        "keywords": [
          "促销",
          "优惠"
        ],
        "blankIndices": [
          8,
          17,
          27
        ]
      },
      {
        "id": 6,
        "startTime": 52.38,
        "endTime": 62.1,
        "hanzi": "我最关心的是男士上班穿的衬衫，要颜色大方、料子透气",
        "pinyin": "wǒ zuì guān xīn de shì nán shì shàng bān chuān de chèn shān ， yào yán sè dà fāng 、 liào zi tòu qì",
        "meaning": "Tôi quan tâm nhất là áo sơ mi nam mặc đi làm, cần màu sắc trang nhã, chất vải thoáng khí",
        "keywords": [
          "衬衫",
          "透气"
        ],
        "blankIndices": [
          7,
          14,
          21
        ]
      },
      {
        "id": 7,
        "startTime": 62.1,
        "endTime": 70.74,
        "hanzi": "这周刚到一批高档纯棉衬衫，款式时尚，现在正在打七折",
        "pinyin": "zhè zhōu gāng dào yì pī gāo dàng chún mián chèn shān ， kuǎn shì shí shàng ， xiàn zài zhèng zài dǎ qī zhé",
        "meaning": "Tuần này vừa về một lô áo sơ mi cotton cao cấp, kiểu dáng thời trang, hiện đang giảm giá 30%",
        "keywords": [
          "高档",
          "打七折"
        ],
        "blankIndices": [
          6,
          14,
          22
        ]
      },
      {
        "id": 8,
        "startTime": 70.74,
        "endTime": 81.42,
        "hanzi": "听起来不错，不过试穿之前我想问一下这些衬衫的原价大概是多少？",
        "pinyin": "tīng qǐ lái bú cuò ， bú guò shì chuān zhī qián wǒ xiǎng wèn yí xià zhè xiē chèn shān de yuán jià dà gài shì duō shǎo ？",
        "meaning": "Nghe hay đấy, nhưng trước khi thử tôi muốn hỏi giá gốc của những chiếc áo này khoảng bao nhiêu?",
        "keywords": [
          "原价",
          "多少"
        ],
        "blankIndices": [
          8,
          18,
          26
        ]
      },
      {
        "id": 9,
        "startTime": 81.42,
        "endTime": 90,
        "hanzi": "每件原价大概八百块钱，但这次活动只要五百多，而且保证是正品",
        "pinyin": "měi jiàn yuán jià dà gài bā bǎi kuài qián ， dàn zhè cì huó dòng zhǐ yào wǔ bǎi duō ， ér qiě bǎo zhèng shì zhèng pǐn",
        "meaning": "Mỗi chiếc giá gốc khoảng 800 tệ, nhưng đợt này chỉ hơn 500 tệ, hơn nữa đảm bảo là hàng chính hãng",
        "keywords": [
          "八百块",
          "正品"
        ],
        "blankIndices": [
          6,
          16,
          25
        ]
      },
      {
        "id": 10,
        "startTime": 90,
        "endTime": 100.58,
        "hanzi": "那我想试一件浅蓝色的，因为我平时上班想选个比较正式的颜色",
        "pinyin": "nà wǒ xiǎng shì yí jiàn qiǎn lán sè de ， yīn wèi wǒ píng shí shàng bān xiǎng xuǎn gè bǐ jiào zhèng shì de yán sè",
        "meaning": "Vậy tôi muốn thử một chiếc màu xanh nhạt, vì đi làm tôi muốn chọn màu tương đối trang trọng",
        "keywords": [
          "浅蓝色",
          "正式"
        ],
        "blankIndices": [
          6,
          15,
          23
        ]
      },
      {
        "id": 11,
        "startTime": 100.58,
        "endTime": 109.4,
        "hanzi": "好的请稍等一下，你可以马上到试衣间试穿",
        "pinyin": "hǎo de qǐng shāo děng yí xià ， nǐ kě yǐ mǎ shàng dào shì yī jiān shì chuān",
        "meaning": "Vâng xin quý khách đợi một lát, bạn có thể vào phòng thử đồ để thử ngay",
        "keywords": [
          "稍等",
          "试衣间"
        ],
        "blankIndices": [
          4,
          12,
          17
        ]
      },
      {
        "id": 12,
        "startTime": 109.4,
        "endTime": 122.6,
        "hanzi": "在等待的时候我还想看看皮鞋，适合上班穿的，不要太复杂但一定要舒服",
        "pinyin": "zài děng dài de shí hòu wǒ hái xiǎng kàn kàn pí xié ， shì hé shàng bān chuān de ， bú yào tài fù zá dàn yí dìng yào shū fú",
        "meaning": "Trong lúc chờ tôi cũng muốn xem giày da đi làm, không cần quá cầu kỳ nhưng nhất định phải êm chân",
        "keywords": [
          "皮鞋",
          "舒服"
        ],
        "blankIndices": [
          9,
          18,
          27
        ]
      },
      {
        "id": 13,
        "startTime": 122.6,
        "endTime": 137.48,
        "hanzi": "我们这里有很多新款皮鞋，大部分是真皮的，设计简洁大方",
        "pinyin": "wǒ men zhè lǐ yǒu hěn duō xīn kuǎn pí xié ， dà bù fen shì zhēn pí de ， shè jì jiǎn jié dà fāng",
        "meaning": "Ở đây chúng tôi có nhiều mẫu giày da mới, đa phần là da thật, thiết kế đơn giản thanh lịch",
        "keywords": [
          "真皮",
          "设计"
        ],
        "blankIndices": [
          8,
          15,
          22
        ]
      },
      {
        "id": 14,
        "startTime": 137.48,
        "endTime": 146.62,
        "hanzi": "深棕色的皮鞋卖得非常火，鞋垫柔软，穿一整天也不会脚痛",
        "pinyin": "shēn zōng sè de pí xié mài dé fēi cháng huǒ ， xié diàn róu ruǎn ， chuān yì zhěng tiān yě bú huì jiǎo tòng",
        "meaning": "Giày da màu nâu sẫm bán rất chạy, lót giày êm ái, mang cả ngày cũng không bị đau chân",
        "keywords": [
          "深棕色",
          "柔软"
        ],
        "blankIndices": [
          3,
          11,
          19
        ]
      },
      {
        "id": 15,
        "startTime": 146.62,
        "endTime": 156,
        "hanzi": "听起来挺不错，我平时穿42码，不知道有没有我的尺码？",
        "pinyin": "tīng qǐ lái tǐng bú cuò ， wǒ píng shí chuān 4 2 mǎ ， bù zhī dào yǒu méi yǒu wǒ de chǐ mǎ ？",
        "meaning": "Nghe hay đấy, tôi thường đi size 42, không biết có kích cỡ của tôi không?",
        "keywords": [
          "42码",
          "尺码"
        ],
        "blankIndices": [
          5,
          14,
          21
        ]
      },
      {
        "id": 16,
        "startTime": 156,
        "endTime": 165.48,
        "hanzi": "有的，42码还有货，而且这款现在有85折优惠",
        "pinyin": "yǒu de ， 4 2 mǎ hái yǒu huò ， ér qiě zhè kuǎn xiàn zài yǒu 8 5 zhé yōu huì",
        "meaning": "Có ạ, size 42 vẫn còn hàng, hơn nữa mẫu này đang được giảm giá 15%",
        "keywords": [
          "有货",
          "优惠"
        ],
        "blankIndices": [
          4,
          11,
          17
        ]
      },
      {
        "id": 17,
        "startTime": 165.48,
        "endTime": 175.22,
        "hanzi": "如果满意的话就和衬衫一起买，在这里你可以对着大镜子试穿",
        "pinyin": "rú guǒ mǎn yì de huà jiù hé chèn shān yì qǐ mǎi ， zài zhè lǐ nǐ kě yǐ duì zhe dà jìng zi shì chuān",
        "meaning": "Nếu ưng ý thì mua cùng áo sơ mi luôn, ở đây quý khách có thể soi gương lớn thử đồ",
        "keywords": [
          "满意",
          "试穿"
        ],
        "blankIndices": [
          3,
          10,
          20
        ]
      },
      {
        "id": 18,
        "startTime": 175.22,
        "endTime": 185.42,
        "hanzi": "顺便问一下，商店有没有卖和皮鞋配套的男士皮带？",
        "pinyin": "shùn biàn wèn yí xià ， shāng diàn yǒu méi yǒu mài hé pí xié pèi tào de nán shì pí dài ？",
        "meaning": "Nhân tiện cho tôi hỏi, cửa hàng có bán thắt lưng nam đi kèm với giày da không?",
        "keywords": [
          "配套",
          "皮带"
        ],
        "blankIndices": [
          6,
          14,
          20
        ]
      },
      {
        "id": 19,
        "startTime": 185.42,
        "endTime": 197.38,
        "hanzi": "当然有，我们还经常整套进货，包括皮鞋、皮带和皮夹",
        "pinyin": "dāng rán yǒu ， wǒ men hái jīng cháng zhěng tào jìn huò ， bāo kuò pí xié 、 pí dài hé pí jiā",
        "meaning": "Tất nhiên là có ạ, chúng tôi nhập theo set đồng bộ gồm giày da, thắt lưng và ví da",
        "keywords": [
          "整套",
          "皮带",
          "皮夹"
        ],
        "blankIndices": [
          7,
          14,
          20
        ]
      },
      {
        "id": 20,
        "startTime": 197.38,
        "endTime": 204.74,
        "hanzi": "如果买整套的话，价格会有更多优惠吗？",
        "pinyin": "rú guǒ mǎi zhěng tào de huà ， jià gé huì yǒu gèng duō yōu huì ma ？",
        "meaning": "Nếu mua cả bộ thì giá có ưu đãi nhiều hơn không?",
        "keywords": [
          "整套",
          "优惠"
        ],
        "blankIndices": [
          4,
          10,
          16
        ]
      },
      {
        "id": 21,
        "startTime": 205.78,
        "endTime": 214.92,
        "hanzi": "如果你买一整套，可以在总价的基础上再打九折",
        "pinyin": "rú guǒ nǐ mǎi yì zhěng tào ， kě yǐ zài zǒng jià de jī chǔ shàng zài dǎ jiǔ zhé",
        "meaning": "Nếu quý khách mua trọn bộ, sẽ được giảm thêm 10% trên tổng hóa đơn",
        "keywords": [
          "总价",
          "打九折"
        ],
        "blankIndices": [
          5,
          12,
          18
        ]
      },
      {
        "id": 22,
        "startTime": 214.92,
        "endTime": 224.44,
        "hanzi": "听起来很吸引人，如果尺码不合适退换政策是怎样的？",
        "pinyin": "tīng qǐ lái hěn xī yǐn rén ， rú guǒ chǐ mǎ bù hé shì tuì huàn zhèng cè shì zěn yàng de ？",
        "meaning": "Nghe rất hấp dẫn, nếu kích cỡ không vừa thì chính sách đổi trả như thế nào?",
        "keywords": [
          "吸引人",
          "退换政策"
        ],
        "blankIndices": [
          4,
          12,
          18
        ]
      }
    ]
  },
  {
    "id": "dict_lesson_5",
    "title": "Bài Hát Ngọt Ngào (甜蜜蜜 - Tian Mi Mi)",
    "youtubeId": "5eF8oOWtsk4",
    "duration": "03:35",
    "level": "1",
    "levelText": "HSK 1",
    "category": "Âm Nhạc",
    "thumbnail": "https://img.youtube.com/vi/5eF8oOWtsk4/hqdefault.jpg",
    "description": "Tuyệt phẩm âm nhạc Hoa ngữ kinh điển của Đặng Lệ Quân với lời ca trong trẻo, từ vựng lãng mạn dễ nghe dễ nhớ.",
    "sentences": [
      {
        "id": 1,
        "startTime": 30,
        "endTime": 40.88,
        "hanzi": "在哪里 在哪里见过你",
        "pinyin": "zài nǎ lǐ   zài nǎ lǐ jiàn guò nǐ",
        "meaning": "Ở nơi đâu, ở nơi đâu ta từng gặp nhau",
        "keywords": [
          "在哪里",
          "见过"
        ],
        "blankIndices": [
          1,
          5,
          8
        ]
      },
      {
        "id": 2,
        "startTime": 40.88,
        "endTime": 49.7,
        "hanzi": "你的笑容这样熟悉，我一时想不起",
        "pinyin": "nǐ de xiào róng zhè yàng shú xī ， wǒ yì shí xiǎng bù qǐ",
        "meaning": "Nụ cười của em thân quen đến thế, phút chốc anh chưa thể nhớ ra",
        "keywords": [
          "笑容",
          "熟悉",
          "想不起"
        ],
        "blankIndices": [
          2,
          6,
          12
        ]
      },
      {
        "id": 3,
        "startTime": 49.7,
        "endTime": 57.24,
        "hanzi": "啊，在梦里",
        "pinyin": "a ， zài mèng lǐ",
        "meaning": "À, là ở trong giấc mơ",
        "keywords": [
          "梦里"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 4,
        "startTime": 60,
        "endTime": 74.2,
        "hanzi": "梦里 梦里见过你，甜蜜 笑得多甜蜜",
        "pinyin": "mèng lǐ   mèng lǐ jiàn guò nǐ ， tián mì   xiào dé duō tián mì",
        "meaning": "Trong mơ, trong mơ anh từng thấy em, ngọt ngào, nụ cười ngọt ngào biết bao",
        "keywords": [
          "梦里",
          "甜蜜"
        ],
        "blankIndices": [
          1,
          5,
          12
        ]
      },
      {
        "id": 5,
        "startTime": 74.2,
        "endTime": 89.86,
        "hanzi": "是你 是你 梦见的就是你，在哪里 在哪里见过你",
        "pinyin": "shì nǐ   shì nǐ   mèng jiàn de jiù shì nǐ ， zài nǎ lǐ   zài nǎ lǐ jiàn guò nǐ",
        "meaning": "Chính là em, chính là em người anh mơ thấy, ở nơi đâu, ở nơi đâu ta từng gặp nhau",
        "keywords": [
          "梦见",
          "在哪里"
        ],
        "blankIndices": [
          2,
          6,
          14
        ]
      },
      {
        "id": 6,
        "startTime": 89.86,
        "endTime": 98.54,
        "hanzi": "你的笑容这样熟悉，我一时想不起",
        "pinyin": "nǐ de xiào róng zhè yàng shú xī ， wǒ yì shí xiǎng bù qǐ",
        "meaning": "Nụ cười của em thân quen đến thế, phút chốc anh chưa thể nhớ ra",
        "keywords": [
          "笑容",
          "想不起"
        ],
        "blankIndices": [
          2,
          6,
          12
        ]
      },
      {
        "id": 7,
        "startTime": 98.54,
        "endTime": 106.55,
        "hanzi": "啊，在梦里",
        "pinyin": "a ， zài mèng lǐ",
        "meaning": "À, là ở trong giấc mơ",
        "keywords": [
          "梦里"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 8,
        "startTime": 126.55,
        "endTime": 140.03,
        "hanzi": "在哪里 在哪里见过你，你的笑容这样熟悉",
        "pinyin": "zài nǎ lǐ   zài nǎ lǐ jiàn guò nǐ ， nǐ de xiào róng zhè yàng shú xī",
        "meaning": "Ở nơi đâu, ở nơi đâu ta từng gặp nhau, nụ cười của em thân quen đến thế",
        "keywords": [
          "在哪里",
          "熟悉"
        ],
        "blankIndices": [
          2,
          7,
          15
        ]
      },
      {
        "id": 9,
        "startTime": 140.03,
        "endTime": 151.67,
        "hanzi": "我一时想不起，啊，在梦里",
        "pinyin": "wǒ yì shí xiǎng bù qǐ ， a ， zài mèng lǐ",
        "meaning": "Phút chốc anh chưa thể nhớ ra, à, là ở trong giấc mơ",
        "keywords": [
          "想不起",
          "梦里"
        ],
        "blankIndices": [
          3,
          8,
          11
        ]
      },
      {
        "id": 10,
        "startTime": 151.67,
        "endTime": 167.05,
        "hanzi": "梦里 梦里见过你，甜蜜 笑得多甜蜜",
        "pinyin": "mèng lǐ   mèng lǐ jiàn guò nǐ ， tián mì   xiào dé duō tián mì",
        "meaning": "Trong mơ, trong mơ anh từng thấy em, ngọt ngào, nụ cười ngọt ngào biết bao",
        "keywords": [
          "梦里",
          "甜蜜"
        ],
        "blankIndices": [
          1,
          5,
          12
        ]
      },
      {
        "id": 11,
        "startTime": 167.05,
        "endTime": 176.07,
        "hanzi": "是你 是你 梦见的就是你",
        "pinyin": "shì nǐ   shì nǐ   mèng jiàn de jiù shì nǐ",
        "meaning": "Chính là em, chính là em người anh mơ thấy",
        "keywords": [
          "梦见",
          "就是你"
        ],
        "blankIndices": [
          1,
          4,
          8
        ]
      },
      {
        "id": 12,
        "startTime": 176.07,
        "endTime": 188.73,
        "hanzi": "在哪里 在哪里见过你，你的笑容这样熟悉",
        "pinyin": "zài nǎ lǐ   zài nǎ lǐ jiàn guò nǐ ， nǐ de xiào róng zhè yàng shú xī",
        "meaning": "Ở nơi đâu, ở nơi đâu ta từng gặp nhau, nụ cười của em thân quen đến thế",
        "keywords": [
          "在哪里",
          "笑容"
        ],
        "blankIndices": [
          2,
          7,
          15
        ]
      },
      {
        "id": 13,
        "startTime": 188.73,
        "endTime": 200.47,
        "hanzi": "我一时想不起，啊，在梦里",
        "pinyin": "wǒ yì shí xiǎng bù qǐ ， a ， zài mèng lǐ",
        "meaning": "Phút chốc anh chưa thể nhớ ra, à, là ở trong giấc mơ",
        "keywords": [
          "想不起",
          "梦里"
        ],
        "blankIndices": [
          3,
          8,
          11
        ]
      }
    ]
  },
  {
    "id": "dict_lesson_6",
    "title": "Hội Thoại Đặt Bàn & Gọi Món Nhà Hàng (在餐厅点菜)",
    "youtubeId": "0MZIImblEHc",
    "duration": "05:06",
    "level": "1",
    "levelText": "HSK 1",
    "category": "Ẩm Thực",
    "thumbnail": "https://img.youtube.com/vi/0MZIImblEHc/hqdefault.jpg",
    "description": "Luyện nghe chép chính tả chủ đề ăn uống, gọi món, chọn khẩu vị và thanh toán tại nhà hàng Trung Hoa.",
    "sentences": [
      {
        "id": 1,
        "startTime": 101.57,
        "endTime": 104.31,
        "hanzi": "你们这里有什么特色菜？",
        "pinyin": "nǐ men zhè lǐ yǒu shén me tè sè cài ？",
        "meaning": "Quán của các bạn có món đặc sản / đặc sắc gì?",
        "keywords": [
          "特色菜"
        ],
        "blankIndices": [
          2,
          6,
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
          "北京烤鸭",
          "名菜"
        ],
        "blankIndices": [
          2,
          7,
          9
        ]
      },
      {
        "id": 3,
        "startTime": 109.03,
        "endTime": 113.33,
        "hanzi": "那就来一只烤鸭。好的，还要什么吗？",
        "pinyin": "nà jiù lái yì zhī kǎo yā 。 hǎo de ， hái yào shén me ma ？",
        "meaning": "Vậy cho một con vịt quay. Vâng, quý khách còn dùng thêm gì nữa không?",
        "keywords": [
          "烤鸭",
          "还要"
        ],
        "blankIndices": [
          5,
          12
        ]
      },
      {
        "id": 4,
        "startTime": 114.55,
        "endTime": 119.33,
        "hanzi": "再来两碗小米粥。好，要什么饮料吗？",
        "pinyin": "zài lái liǎng wǎn xiǎo mǐ zhōu 。 hǎo ， yào shén me yǐn liào ma ？",
        "meaning": "Cho thêm hai bát cháo kê. Vâng, quý khách muốn dùng đồ uống gì không?",
        "keywords": [
          "小米粥",
          "饮料"
        ],
        "blankIndices": [
          4,
          13
        ]
      },
      {
        "id": 5,
        "startTime": 120.21,
        "endTime": 124.21,
        "hanzi": "我要一杯苹果汁。我来点儿啤酒吧。",
        "pinyin": "wǒ yào yì bēi píng guǒ zhī 。 wǒ lái diǎnr pí jiǔ bā 。",
        "meaning": "Tôi muốn một ly nước ép táo. Tôi uống chút bia nhé.",
        "keywords": [
          "苹果汁",
          "啤酒"
        ],
        "blankIndices": [
          4,
          12
        ]
      },
      {
        "id": 6,
        "startTime": 128.51,
        "endTime": 131.39,
        "hanzi": "你们的菜上来了，请慢用。",
        "pinyin": "nǐ men de cài shàng lái le ， qǐng màn yòng 。",
        "meaning": "Món ăn của quý khách đã lên rồi, chúc quý khách ngon miệng.",
        "keywords": [
          "上菜",
          "慢用"
        ],
        "blankIndices": [
          4,
          9
        ]
      },
      {
        "id": 7,
        "startTime": 131.57,
        "endTime": 141.97,
        "hanzi": "谢谢！你觉得这里的菜怎么样？",
        "pinyin": "xiè xiè ！ nǐ jué de zhè lǐ de cài zěn me yàng ？",
        "meaning": "Cảm ơn bạn! Bạn thấy món ăn ở đây thế nào?",
        "keywords": [
          "觉得",
          "怎么样"
        ],
        "blankIndices": [
          4,
          10
        ]
      },
      {
        "id": 8,
        "startTime": 141.97,
        "endTime": 147.97,
        "hanzi": "我觉得非常可口。嗯，我也觉得很好吃。",
        "pinyin": "wǒ jué de fēi cháng kě kǒu 。 ǹg ， wǒ yě jué de hěn hǎo chī 。",
        "meaning": "Tôi thấy rất hợp khẩu vị. Ừ, tôi cũng thấy rất ngon miệng.",
        "keywords": [
          "可口",
          "好吃"
        ],
        "blankIndices": [
          5,
          14
        ]
      },
      {
        "id": 9,
        "startTime": 160.23,
        "endTime": 164.39,
        "hanzi": "这是您的账单。好，我先看一下。",
        "pinyin": "zhè shì nín de zhàng dān 。 hǎo ， wǒ xiān kàn yí xià 。",
        "meaning": "Đây là hóa đơn của quý khách. Được rồi, để tôi xem qua một chút.",
        "keywords": [
          "账单",
          "看一下"
        ],
        "blankIndices": [
          4,
          11
        ]
      },
      {
        "id": 10,
        "startTime": 165.61,
        "endTime": 169.33,
        "hanzi": "没什么问题。您想怎么付款？",
        "pinyin": "méi shén me wèn tí 。 nín xiǎng zěn me fù kuǎn ？",
        "meaning": "Không có vấn đề gì. Quý khách muốn thanh toán bằng hình thức nào?",
        "keywords": [
          "没问题",
          "付款"
        ],
        "blankIndices": [
          3,
          9
        ]
      },
      {
        "id": 11,
        "startTime": 171.05,
        "endTime": 173.75,
        "hanzi": "微信支付可以吗？当然可以。",
        "pinyin": "wēi xìn zhī fù kě yǐ ma ？ dāng rán kě yǐ 。",
        "meaning": "Thanh toán qua WeChat được không? Tất nhiên là được ạ.",
        "keywords": [
          "微信支付",
          "当然"
        ],
        "blankIndices": [
          2,
          8
        ]
      },
      {
        "id": 12,
        "startTime": 174.39,
        "endTime": 176.87,
        "hanzi": "您可以扫描这上面的二维码。",
        "pinyin": "nín kě yǐ sǎo miáo zhè shàng miàn de èr wéi mǎ 。",
        "meaning": "Quý khách có thể quét mã QR ở trên này.",
        "keywords": [
          "扫描",
          "二维码"
        ],
        "blankIndices": [
          4,
          10
        ]
      },
      {
        "id": 13,
        "startTime": 178.15,
        "endTime": 192.05,
        "hanzi": "支付成功了。好的，谢谢！",
        "pinyin": "zhī fù chéng gōng le 。 hǎo de ， xiè xiè ！",
        "meaning": "Thanh toán thành công rồi. Vâng, cảm ơn quý khách!",
        "keywords": [
          "支付成功"
        ],
        "blankIndices": [
          2,
          7
        ]
      },
      {
        "id": 14,
        "startTime": 192.05,
        "endTime": 201.59,
        "hanzi": "当迈克打电话，他说我想预订星期六晚上的座位",
        "pinyin": "dāng mài kè dǎ diàn huà ， tā shuō wǒ xiǎng yù dìng xīng qī liù wǎn shàng de zuò wèi",
        "meaning": "Khi Mike gọi điện, anh ấy nói tôi muốn đặt bàn vào tối thứ Bảy",
        "keywords": [
          "预订",
          "座位"
        ],
        "blankIndices": [
          5,
          12,
          19
        ]
      },
      {
        "id": 15,
        "startTime": 201.59,
        "endTime": 212.43,
        "hanzi": "我想打电话预订座位，意思是预订餐桌",
        "pinyin": "wǒ xiǎng dǎ diàn huà yù dìng zuò wèi ， yì sī shì yù dìng cān zhuō",
        "meaning": "Tôi muốn gọi điện đặt chỗ, có nghĩa là đặt trước bàn ăn",
        "keywords": [
          "预订座位",
          "餐桌"
        ],
        "blankIndices": [
          5,
          12
        ]
      },
      {
        "id": 16,
        "startTime": 212.43,
        "endTime": 222.23,
        "hanzi": "我想预订两个人的位子",
        "pinyin": "wǒ xiǎng yù dìng liǎng gè rén de wèi zi",
        "meaning": "Tôi muốn đặt bàn cho hai người",
        "keywords": [
          "预订",
          "位子"
        ],
        "blankIndices": [
          3,
          8
        ]
      },
      {
        "id": 17,
        "startTime": 222.23,
        "endTime": 230.74,
        "hanzi": "迈克的家人不熟悉中文，服务员热情帮助",
        "pinyin": "mài kè de jiā rén bù shú xī zhōng wén ， fú wù yuán rè qíng bāng zhù",
        "meaning": "Gia đình Mike chưa quen tiếng Trung, nhân viên phục vụ nhiệt tình giúp đỡ",
        "keywords": [
          "熟悉",
          "热情帮助"
        ],
        "blankIndices": [
          5,
          12,
          16
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

  function updateFrame() {
    if (ytPlayer && ytPlayer.getCurrentTime && currentLesson) {
      try {
        const curTime = ytPlayer.getCurrentTime();
        const curSent = currentLesson.sentences[currentSentenceIdx];
        if (curSent) {
          // Update timing display in adjuster
          const posEl = document.getElementById('timing-adjuster-current-pos');
          if (posEl) {
            const curMin = Math.floor(curTime / 60);
            const curSec = (curTime % 60).toFixed(2);
            posEl.textContent = `Giây video: ${String(curMin).padStart(2, '0')}:${String(curSec).padStart(5, '0')} (${curTime.toFixed(2)}s)`;
          }

          // Update video progress meter and 60fps active dual subtitles
          updateSubtitleHighlight(curTime);
          updateInPlayerDualSubtitles(curTime);

          // Auto pause at end of sentence
          if (autoPauseEnabled && isSentencePlaying && curTime >= curSent.endTime) {
            ytPlayer.pauseVideo();
            isSentencePlaying = false;
            stopPlaybackWatcher();
            focusActiveInput();
            return;
          }
        }
      } catch (e) {}
    }

    if (ytPlayer && ytPlayer.getPlayerState) {
      const state = ytPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {
        playbackWatcher = requestAnimationFrame(updateFrame);
        return;
      }
    }
    playbackWatcher = null;
  }

  playbackWatcher = requestAnimationFrame(updateFrame);
}

function stopPlaybackWatcher() {
  if (playbackWatcher) {
    if (typeof playbackWatcher === 'number') {
      cancelAnimationFrame(playbackWatcher);
    } else {
      clearInterval(playbackWatcher);
    }
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
      const chars = (t.text || '').split('');
      chars.forEach(char => {
        const staticSpan = document.createElement('span');
        staticSpan.className = 'cloze-static-text';
        staticSpan.textContent = char;
        if (/[\u4e00-\u9fa5]/.test(char)) {
          staticSpan.title = `Bấm để xem thuận bút chữ '${char}'`;
          staticSpan.style.cursor = 'pointer';
          staticSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            openHanziModal(char);
          });
        }
        container.appendChild(staticSpan);
      });
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

function updateInPlayerDualSubtitles(curTime) {
  if (!currentLesson || !currentLesson.sentences) return;
  const overlayHanzi = document.getElementById('yt-overlay-hanzi');
  const overlayPinyin = document.getElementById('yt-overlay-pinyin');
  const overlayMeaning = document.getElementById('yt-overlay-meaning');
  if (!overlayHanzi) return;

  const activeSentence = currentLesson.sentences.find(s => curTime >= s.startTime && curTime <= s.endTime);
  if (activeSentence) {
    overlayHanzi.innerHTML = renderInteractiveWords(activeSentence.hanzi, activeSentence.words, curTime);
    if (overlayPinyin) overlayPinyin.textContent = activeSentence.pinyin || '';
    if (overlayMeaning) overlayMeaning.textContent = activeSentence.meaning || '';
  } else {
    // Only display subtitle when video playback time is within sentence active timing bounds
    overlayHanzi.innerHTML = '';
    if (overlayPinyin) overlayPinyin.textContent = '';
    if (overlayMeaning) overlayMeaning.textContent = '';
  }
}

let currentPopoverData = null;

function renderInteractiveWords(text, wordsArray = [], curTime = 0) {
  if (!text) return '';
  if (/[\u4e00-\u9fa5]/.test(text)) {
    return text.split('').map((char, idx) => {
      if (/[\u4e00-\u9fa5]/.test(char)) {
        let isActive = false;
        if (Array.isArray(wordsArray) && wordsArray.length > 0) {
          const matched = wordsArray.find(w => {
            const wClean = (w.word || '').trim();
            return wClean.includes(char) && curTime >= (w.start - 0.05) && curTime <= (w.end + 0.1);
          });
          if (matched) isActive = true;
        }
        const activeClass = isActive ? ' karaoke-word-active' : '';
        return `<span class="yt-sub-hanzi-word${activeClass}" onclick="window.lookupWord(this, '${char}')" title="Bấm để tra từ 1-click">${char}</span>`;
      }
      return char;
    }).join('');
  } else {
    return text.split(/(\s+|[^\w\s'])/).map(part => {
      if (/^[a-zA-Z0-9']+$/.test(part)) {
        const escaped = part.replace(/'/g, "\\'");
        let isActive = false;
        if (Array.isArray(wordsArray) && wordsArray.length > 0) {
          const matched = wordsArray.find(w => {
            const wClean = (w.word || '').trim().toLowerCase();
            return wClean.includes(part.toLowerCase()) && curTime >= (w.start - 0.05) && curTime <= (w.end + 0.1);
          });
          if (matched) isActive = true;
        }
        const activeClass = isActive ? ' karaoke-word-active' : '';
        return `<span class="yt-sub-hanzi-word${activeClass}" onclick="window.lookupWord(this, '${escaped}')" title="Bấm để tra từ 1-click">${part}</span>`;
      }
      return part;
    }).join('');
  }
}

window.lookupWord = async function(element, word) {
  if (!word || !word.trim()) return;
  const cleanWord = word.trim();
  currentPopoverData = { word: cleanWord, pinyin: '', meaning: '' };

  const popover = document.getElementById('dict-word-popover');
  const wordText = document.getElementById('popover-word-text');
  const pinyinText = document.getElementById('popover-pinyin-text');
  const meaningText = document.getElementById('popover-meaning-text');
  const hskBadge = document.getElementById('popover-hsk-badge');

  if (!popover) return;

  if (wordText) wordText.textContent = cleanWord;
  if (pinyinText) pinyinText.textContent = '...';
  if (meaningText) meaningText.textContent = 'Đang tra từ điển...';
  if (hskBadge) hskBadge.textContent = 'HSK';

  // Position popover near element
  const rect = element.getBoundingClientRect();
  popover.style.display = 'block';
  popover.style.top = `${Math.min(window.innerHeight - 190, rect.bottom + 8)}px`;
  popover.style.left = `${Math.max(10, Math.min(window.innerWidth - 310, rect.left - 40))}px`;

  // Fetch dictionary
  try {
    const res = await fetch('/api/dict/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: cleanWord })
    });
    if (res.ok) {
      const data = await res.json();
      currentPopoverData = data;
      if (wordText) wordText.textContent = data.word || cleanWord;
      if (pinyinText) pinyinText.textContent = data.pinyin || '';
      if (meaningText) meaningText.textContent = data.meaning || 'Không tìm thấy định nghĩa';
      if (hskBadge) hskBadge.textContent = data.hskLevel || 'Từ Vựng';
    }
  } catch (err) {
    if (meaningText) meaningText.textContent = 'Lỗi tra từ.';
  }
};

window.speakPopoverWord = function() {
  if (currentPopoverData && currentPopoverData.word) {
    speakChinese(currentPopoverData.word);
  }
};

window.savePopoverWordToFlashcard = function() {
  if (!currentPopoverData || !currentPopoverData.word) return;
  try {
    const email = getCurrentUserEmail();
    const storageKey = `my_saved_flashcards_${email}`;
    let saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!saved.some(item => item.word === currentPopoverData.word)) {
      saved.push({
        word: currentPopoverData.word,
        pinyin: currentPopoverData.pinyin,
        meaning: currentPopoverData.meaning,
        hskLevel: currentPopoverData.hskLevel,
        addedAt: new Date().toISOString()
      });
      localStorage.setItem(storageKey, JSON.stringify(saved));
      showToast(`⭐ Đã lưu "${currentPopoverData.word}" vào Flashcard cá nhân!`);
    } else {
      showToast(`Từ "${currentPopoverData.word}" đã có trong Flashcard!`);
    }
  } catch (e) {
    showToast(`Đã lưu "${currentPopoverData.word}" vào sổ từ vựng!`);
  }
};

function renderClickableHanziSpans(text) {
  return renderInteractiveWords(text);
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
  const modal = document.getElementById('dict-hanzi-writer-modal');
  const targetCharEl = document.getElementById('hanzi-modal-char-title');
  const tabsDiv = document.getElementById('hanzi-modal-char-tabs');
  const targetDiv = document.getElementById('hanzi-writer-target');

  if (!modal || !targetDiv) return;

  // Extract all Chinese characters from string
  const hanziChars = (character.match(/[\u4e00-\u9fa5]/g) || [character.charAt(0)]);
  let selectedChar = hanziChars[0] || '你';

  function renderSingleChar(char) {
    selectedChar = char;
    targetDiv.innerHTML = '';
    if (targetCharEl) targetCharEl.textContent = `Tập Viết Chữ: ${char}`;

    if (window.HanziWriter) {
      try {
        const isDark = document.documentElement.classList.contains('dark');
        activeHanziWriter = HanziWriter.create('hanzi-writer-target', char, {
          width: 180,
          height: 180,
          padding: 10,
          showOutline: true,
          strokeColor: '#2563eb',
          radicalColor: '#ef4444',
          outlineColor: isDark ? '#475569' : '#94a3b8',
          strokeAnimationSpeed: 1.2
        });
        activeHanziWriter.animateCharacter();
      } catch (e) {
        targetDiv.innerHTML = `<span style="font-size: 5rem; font-weight: 900; color: #ef4444;">${char}</span>`;
      }
    } else {
      targetDiv.innerHTML = `<span style="font-size: 5rem; font-weight: 900; color: #ef4444;">${char}</span>`;
    }

    // Highlight active tab button
    if (tabsDiv) {
      tabsDiv.querySelectorAll('.hanzi-tab-btn').forEach(btn => {
        const isActive = btn.dataset.char === char;
        btn.classList.toggle('btn-primary', isActive);
        btn.classList.toggle('btn-outline', !isActive);
      });
    }
  }

  // Render character tabs if multiple Hanzi characters
  if (tabsDiv) {
    tabsDiv.innerHTML = '';
    if (hanziChars.length > 1) {
      hanziChars.forEach((c) => {
        const btn = document.createElement('button');
        btn.className = `btn btn-xs ${c === selectedChar ? 'btn-primary' : 'btn-outline'} hanzi-tab-btn`;
        btn.dataset.char = c;
        btn.textContent = c;
        btn.style.fontSize = '1rem';
        btn.style.padding = '4px 10px';
        btn.onclick = () => renderSingleChar(c);
        tabsDiv.appendChild(btn);
      });
      tabsDiv.style.display = 'flex';
    } else {
      tabsDiv.style.display = 'none';
    }
  }

  modal.style.display = 'flex';
  renderSingleChar(selectedChar);
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
  const myOpt = document.getElementById('my-videos-opt');
  if (myOpt) myOpt.textContent = `⭐ Video Của Tôi (${count})`;
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
// Master All-in-One AI Generator: Auto Subtitles, Auto Voice Transcription, Auto HSK & Category Classification, 100% Proofreading
window.autoGenerateAllWithAI = async function() {
  const urlInput = document.getElementById('custom-video-url')?.value.trim();
  const ytId = extractYouTubeId(urlInput);

  if (!ytId) {
    showToast("Vui lòng dán link YouTube hợp lệ vào ô ở trên trước!", true);
    document.getElementById('custom-video-url')?.focus();
    return;
  }

  const btn = document.getElementById('btn-auto-generate-all');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AI đang xử lý toàn diện...';
  }

  const steps = [
    { delay: 0,    msg: '🔍 Đang phân tích video & kết nối AI...' },
    { delay: 3000, msg: '⚡ AI đang phân loại HSK, xác định chủ đề & bóc tách câu thoại...' },
    { delay: 7000, msg: '✍️ Đang chuẩn hóa chính tả 100% & sinh phiên âm Pinyin...' }
  ];
  const toastTimers = steps.map(s => setTimeout(() => showToast(s.msg), s.delay));

  try {
    const res = await fetch('/api/dictation/fetch-subtitles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ youtubeId: ytId, extractRawOnly: true })
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
        const sSec = (s.startTime % 60).toFixed(3);
        const eMin = Math.floor(s.endTime / 60);
        const eSec = (s.endTime % 60).toFixed(3);
        const sFormatted = `${String(sMin).padStart(2, '0')}:${String(sSec).padStart(6, '0')}`;
        const eFormatted = `${String(eMin).padStart(2, '0')}:${String(eSec).padStart(6, '0')}`;
        return `[${sFormatted} - ${eFormatted}] ${s.hanzi}`; // Note: hanzi holds raw text for extractRawOnly
      });

      const textarea = document.getElementById('custom-video-subtitles');
      if (textarea) textarea.value = lines.join('\n');

      const tierEmoji = '⚡';
      showToast(`${tierEmoji} Trích xuất âm thanh thành công! Hãy bấm '2. Dịch Tiếng Trung (LLM)' để hoàn thiện. 🎉`);

    } else {
      showToast(data.message || 'Không thể tạo tự động bài học. Vui lòng thử lại!', true);
    }

  } catch (err) {
    toastTimers.forEach(t => clearTimeout(t));
    console.error('Auto generate all error:', err);
    showToast('Lỗi kết nối máy chủ AI — Vui lòng kiểm tra lại mạng!', true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> AI Tạo Tự Động Toàn Diện';
    }
  }
};

window.fetchYouTubeSubtitles = window.autoGenerateAllWithAI;
window.transcribeAudioWithAI = window.autoGenerateAllWithAI;

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

function getSelectedCategoryAndLevel() {
  const select = document.getElementById('dict-category-filter');
  if (select && select.value) {
    const val = select.value;
    if (val.startsWith('level:')) {
      return { cat: 'all', lvl: val.replace('level:', '') };
    }
    if (val.startsWith('cat:')) {
      return { cat: val.replace('cat:', ''), lvl: 'all' };
    }
    return { cat: 'all', lvl: 'all' };
  }
  const activeCatBtn = document.querySelector('.cat-pill-btn.active');
  return {
    cat: activeCatBtn?.dataset.cat || 'all',
    lvl: activeCatBtn?.dataset.level || 'all'
  };
}

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
  const { cat, lvl } = getSelectedCategoryAndLevel();
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
  const { cat } = getSelectedCategoryAndLevel();
  const isMyVideosTab = cat === 'my_videos';

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
        startTime: parseFloat(startTime.toFixed(3)),
        endTime: parseFloat(endTime.toFixed(3)),
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
  // Category Dropdown Filter
  const filterSelect = document.getElementById('dict-category-filter');
  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      const { cat, lvl } = getSelectedCategoryAndLevel();
      const searchVal = document.getElementById('dict-search-input')?.value.trim() || '';
      filterLessons(cat, lvl, searchVal);
    });
  }

  // Level Tabs Filter (Pills fallback)
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
      const { cat, lvl } = getSelectedCategoryAndLevel();
      filterLessons(cat, lvl, e.target.value.trim());
    });
  }

  // Dismiss Popover when clicking outside
  document.addEventListener('click', (e) => {
    const popover = document.getElementById('dict-word-popover');
    if (popover && popover.style.display === 'block') {
      if (!popover.contains(e.target) && !e.target.classList.contains('yt-sub-hanzi-word') && !e.target.classList.contains('hanzi-interactive-char')) {
        popover.style.display = 'none';
      }
    }
  });

  // Global Hotkeys for Shadowing & Dictation (Space = Replay, ArrowLeft/Right = Prev/Next, P = AutoPause, S = Speed)
  document.addEventListener('keydown', (e) => {
    // If not in workspace, return
    const ws = document.getElementById('dict-workspace-view');
    if (!ws || ws.style.display === 'none') return;

    const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);

    if (e.code === 'Space' && (!isTyping || e.ctrlKey)) {
      e.preventDefault();
      replaySnippet();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      checkCurrentAnswer();
    } else if ((e.key === 'h' || e.key === 'H') && e.ctrlKey) {
      e.preventDefault();
      showHint();
    } else if (e.key === 'ArrowRight' && (e.ctrlKey || !isTyping)) {
      e.preventDefault();
      nextSentence();
    } else if (e.key === 'ArrowLeft' && (e.ctrlKey || !isTyping)) {
      e.preventDefault();
      prevSentence();
    } else if ((e.key === 'p' || e.key === 'P') && !isTyping) {
      toggleAutoPause();
    } else if ((e.key === 's' || e.key === 'S') && !isTyping) {
      const speeds = [0.5, 0.75, 1.0];
      const nextIdx = (speeds.indexOf(currentSpeed) + 1) % speeds.length;
      setPlaybackSpeed(speeds[nextIdx]);
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
