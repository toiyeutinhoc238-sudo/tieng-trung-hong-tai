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
    "youtubeId": "kpDING7mMcQ",
    "title": "Ánh Trăng Nói Hộ Lòng Tôi (月亮代表我的心)",
    "category": "Âm Nhạc",
    "level": "1",
    "levelText": "HSK 1",
    "description": "Bài hát bất hủ của Đặng Lệ Quân với giai điệu tha thiết, phát âm rõ ràng chuẩn giọng Bắc Kinh.",
    "duration": "03:13",
    "thumbnail": "https://img.youtube.com/vi/kpDING7mMcQ/hqdefault.jpg",
    "sentences": [
      {
        "id": 1,
        "startTime": 12.22,
        "endTime": 18.82,
        "hanzi": "你问我爱爱有度死我",
        "pinyin": "nǐ wèn wǒ ài ài yǒu dù sǐ wǒ",
        "meaning": "Bạn hỏi tôi yêu bạn có sâu bao nhiêu",
        "keywords": [
          "你问",
          "我爱"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 2,
        "startTime": 18.82,
        "endTime": 22.54,
        "hanzi": "爱你有为一分分",
        "pinyin": "ài nǐ yǒu wèi yì fēn fēn",
        "meaning": "Yêu bạn có mấy phần",
        "keywords": [
          "爱你",
          "有为"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 3,
        "startTime": 23.66,
        "endTime": 30.9,
        "hanzi": "我的性当么为为为月東",
        "pinyin": "wǒ de xìng dāng me wèi wèi wèi yuè dōng",
        "meaning": "Cảm xúc của tôi thật chân thành, tình yêu của tôi thật chân thành, trăng",
        "keywords": [
          "我的",
          "性当"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 4,
        "startTime": 30.9,
        "endTime": 34.58,
        "hanzi": "为为我的家",
        "pinyin": "wèi wèi wǒ de jiā",
        "meaning": "đại diện cho trái tim của tôi",
        "keywords": [
          "为为",
          "我的"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 5,
        "startTime": 36.76,
        "endTime": 43.5,
        "hanzi": "你问我爱爱有度死我",
        "pinyin": "nǐ wèn wǒ ài ài yǒu dù sǐ wǒ",
        "meaning": "Bạn hỏi tôi yêu bạn có sâu bao nhiêu",
        "keywords": [
          "你问",
          "我爱"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 6,
        "startTime": 43.5,
        "endTime": 47.04,
        "hanzi": "爱你有为丁分分",
        "pinyin": "ài nǐ yǒu wèi dīng fēn fēn",
        "meaning": "Yêu bạn có mấy phần",
        "keywords": [
          "爱你",
          "有为"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 7,
        "startTime": 48.7,
        "endTime": 55.56,
        "hanzi": "我的性当么为为为月東",
        "pinyin": "wǒ de xìng dāng me wèi wèi wèi yuè dōng",
        "meaning": "Cảm xúc của tôi thật chân thành, tình yêu của tôi thật chân thành, trăng",
        "keywords": [
          "我的",
          "性当"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 8,
        "startTime": 55.56,
        "endTime": 59.24,
        "hanzi": "为为我的家",
        "pinyin": "wèi wèi wǒ de jiā",
        "meaning": "đại diện cho trái tim của tôi",
        "keywords": [
          "为为",
          "我的"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 9,
        "startTime": 60.96,
        "endTime": 65.26,
        "hanzi": "李李一个一主",
        "pinyin": "lǐ lǐ yí gè yì zhǔ",
        "meaning": "Một cái hôn nhẹ",
        "keywords": [
          "李李",
          "一个"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 10,
        "startTime": 67.18,
        "endTime": 71.92,
        "hanzi": "已发发我的家",
        "pinyin": "yǐ fā fā wǒ de jiā",
        "meaning": "Đã chạm đến trái tim của tôi",
        "keywords": [
          "已发",
          "发我"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 11,
        "startTime": 73.3,
        "endTime": 77.52,
        "hanzi": "死死的组度",
        "pinyin": "sǐ sǐ de zǔ dù",
        "meaning": "Cảm xúc sâu sắc",
        "keywords": [
          "死死",
          "的组"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 12,
        "startTime": 79.16,
        "endTime": 83.8,
        "hanzi": "暀己执行己一个月東",
        "pinyin": "wǎng jǐ zhí xíng jǐ yí gè yuè dōng",
        "meaning": "Gọi tôi nhớ đến như ngày nay",
        "keywords": [
          "暀己",
          "执行"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 13,
        "startTime": 86,
        "endTime": 91.36,
        "hanzi": "你问我爱爱有度死我",
        "pinyin": "nǐ wèn wǒ ài ài yǒu dù sǐ wǒ",
        "meaning": "Bạn hỏi tôi yêu bạn có sâu bao nhiêu",
        "keywords": [
          "你问",
          "我爱"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 14,
        "startTime": 92.06,
        "endTime": 96.18,
        "hanzi": "爱你有为丁分分",
        "pinyin": "ài nǐ yǒu wèi dīng fēn fēn",
        "meaning": "Yêu bạn có mấy phần",
        "keywords": [
          "爱你",
          "有为"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 15,
        "startTime": 97.78,
        "endTime": 104.666,
        "hanzi": "你已执行一个一主你已课一个月東",
        "pinyin": "nǐ yǐ zhí xíng yí gè yì zhǔ nǐ yǐ kè yí gè yuè dōng",
        "meaning": "Bạn hãy nghĩ một chút, bạn hãy nhìn một chút trăng",
        "keywords": [
          "你已",
          "执行"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 16,
        "startTime": 104.666,
        "endTime": 108.426,
        "hanzi": "为为我的家",
        "pinyin": "wèi wèi wǒ de jiā",
        "meaning": "đại diện cho trái tim của tôi",
        "keywords": [
          "为为",
          "我的"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 17,
        "startTime": 134.546,
        "endTime": 138.826,
        "hanzi": "李李一个一主",
        "pinyin": "lǐ lǐ yí gè yì zhǔ",
        "meaning": "Một cái hôn nhẹ",
        "keywords": [
          "李李",
          "一个"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 18,
        "startTime": 140.586,
        "endTime": 144.846,
        "hanzi": "已发发我的家",
        "pinyin": "yǐ fā fā wǒ de jiā",
        "meaning": "Đã chạm đến trái tim của tôi",
        "keywords": [
          "已发",
          "发我"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 19,
        "startTime": 146.686,
        "endTime": 150.986,
        "hanzi": "死死的性当",
        "pinyin": "sǐ sǐ de xìng dāng",
        "meaning": "Cảm xúc sâu sắc",
        "keywords": [
          "死死",
          "的性"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 20,
        "startTime": 152.806,
        "endTime": 157.066,
        "hanzi": "暀己执行己一个月東",
        "pinyin": "wǎng jǐ zhí xíng jǐ yí gè yuè dōng",
        "meaning": "Gọi tôi nhớ đến như ngày nay",
        "keywords": [
          "暀己",
          "执行"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 21,
        "startTime": 159.286,
        "endTime": 165.806,
        "hanzi": "你问我爱爱有度死我",
        "pinyin": "nǐ wèn wǒ ài ài yǒu dù sǐ wǒ",
        "meaning": "Bạn hỏi tôi yêu bạn có sâu bao nhiêu",
        "keywords": [
          "你问",
          "我爱"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 22,
        "startTime": 165.806,
        "endTime": 169.466,
        "hanzi": "爱你有为丁分分",
        "pinyin": "ài nǐ yǒu wèi dīng fēn fēn",
        "meaning": "Yêu bạn có mấy phần",
        "keywords": [
          "爱你",
          "有为"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 23,
        "startTime": 171.046,
        "endTime": 176.886,
        "hanzi": "你已执行一个一主你已课一个",
        "pinyin": "nǐ yǐ zhí xíng yí gè yì zhǔ nǐ yǐ kè yí gè",
        "meaning": "Bạn hãy nghĩ một chút, bạn hãy nhìn một chút",
        "keywords": [
          "你已",
          "执行"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 24,
        "startTime": 177.406,
        "endTime": 181.406,
        "hanzi": "月東为为我的家",
        "pinyin": "yuè dōng wèi wèi wǒ de jiā",
        "meaning": "trăng đại diện cho trái tim của tôi",
        "keywords": [
          "月東",
          "为为"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 25,
        "startTime": 183.226,
        "endTime": 190.226,
        "hanzi": "你已执行一个一主你已课一个月東",
        "pinyin": "nǐ yǐ zhí xíng yí gè yì zhǔ nǐ yǐ kè yí gè yuè dōng",
        "meaning": "Bạn hãy nghĩ một chút, bạn hãy nhìn một chút trăng",
        "keywords": [
          "你已",
          "执行"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 26,
        "startTime": 190.226,
        "endTime": 193.626,
        "hanzi": "为为我的家",
        "pinyin": "wèi wèi wǒ de jiā",
        "meaning": "đại diện cho trái tim của tôi",
        "keywords": [
          "为为",
          "我的"
        ],
        "blankIndices": [
          0,
          2
        ]
      }
    ]
  },
  {
    "id": "dict_lesson_2",
    "youtubeId": "8oS6uXOZ_TA",
    "title": "HSK 1 Hội Thoại Tiếng Trung Cơ Bản | Chào Hỏi & Làm Quen",
    "category": "Giao Tiếp",
    "level": "1",
    "levelText": "HSK 1",
    "description": "Đoạn hội thoại chuẩn mực từ vựng HSK 1 giúp người mới bắt đầu làm quen với phát âm và ngữ điệu tự nhiên.",
    "duration": "01:38",
    "thumbnail": "https://img.youtube.com/vi/8oS6uXOZ_TA/hqdefault.jpg",
    "sentences": [
      {
        "id": 1,
        "startTime": 0.28,
        "endTime": 1.56,
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
        "startTime": 2.28,
        "endTime": 3.84,
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
        "startTime": 4.28,
        "endTime": 6.62,
        "hanzi": "你显为与名名。",
        "pinyin": "nǐ xiǎn wèi yǔ míng míng 。",
        "meaning": "Bạn tên là gì?",
        "keywords": [
          "你显",
          "为与"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 4,
        "startTime": 7.24,
        "endTime": 9.28,
        "hanzi": "我显为王明，你。",
        "pinyin": "wǒ xiǎn wèi wáng míng ， nǐ 。",
        "meaning": "Tôi tên là Vương Minh, bạn?",
        "keywords": [
          "我显",
          "为王"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 5,
        "startTime": 10.24,
        "endTime": 12.86,
        "hanzi": "我显为二影。",
        "pinyin": "wǒ xiǎn wèi èr yǐng 。",
        "meaning": "Tôi tên là Lý Hồng.",
        "keywords": [
          "我显",
          "为二"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 6,
        "startTime": 13.3,
        "endTime": 15.58,
        "hanzi": "五體了明为你。",
        "pinyin": "wǔ tǐ le míng wèi nǐ 。",
        "meaning": "Rất hân hạnh được biết đến bạn.",
        "keywords": [
          "五體",
          "了明"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 7,
        "startTime": 16.24,
        "endTime": 18.72,
        "hanzi": "我了體了明为你。",
        "pinyin": "wǒ le tǐ le míng wèi nǐ 。",
        "meaning": "Tôi cũng rất hân hạnh được biết đến bạn.",
        "keywords": [
          "我了",
          "體了"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 8,
        "startTime": 19.2,
        "endTime": 21.18,
        "hanzi": "你是中国人吗？",
        "pinyin": "nǐ shì zhōng guó rén ma ？",
        "meaning": "Bạn là người Trung Quốc không?",
        "keywords": [
          "你是",
          "中国"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 9,
        "startTime": 22.2,
        "endTime": 25.18,
        "hanzi": "不是，我是亞国人。",
        "pinyin": "bú shì ， wǒ shì yā guó rén 。",
        "meaning": "Không, tôi là người Việt Nam.",
        "keywords": [
          "不是",
          "我是"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 10,
        "startTime": 26.22,
        "endTime": 28.7,
        "hanzi": "你可课为中国语。",
        "pinyin": "nǐ kě kè wèi zhōng guó yǔ 。",
        "meaning": "Bạn có nói tiếng Trung không?",
        "keywords": [
          "你可",
          "课为"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 11,
        "startTime": 29.28,
        "endTime": 31.68,
        "hanzi": "可一个。",
        "pinyin": "kě yí gè 。",
        "meaning": "Có một chút.",
        "keywords": [
          "可一"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 12,
        "startTime": 32.28,
        "endTime": 34.56,
        "hanzi": "你的中国语为很。",
        "pinyin": "nǐ de zhōng guó yǔ wèi hěn 。",
        "meaning": "Tiếng Trung của bạn rất tốt.",
        "keywords": [
          "你的",
          "中国"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 13,
        "startTime": 35.28,
        "endTime": 36.6,
        "hanzi": "姐可。",
        "pinyin": "jiě kě 。",
        "meaning": "Cảm ơn.",
        "keywords": [
          "姐可"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 14,
        "startTime": 37.24,
        "endTime": 38.82,
        "hanzi": "不帯常。",
        "pinyin": "bú dài cháng 。",
        "meaning": "Không có vấn đề.",
        "keywords": [
          "不帯"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 15,
        "startTime": 39.22,
        "endTime": 41.34,
        "hanzi": "你年月为为一个。",
        "pinyin": "nǐ nián yuè wèi wèi yí gè 。",
        "meaning": "Bạn bao nhiêu tuổi?",
        "keywords": [
          "你年",
          "月为"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 16,
        "startTime": 42.24,
        "endTime": 44.28,
        "hanzi": "我为20年。",
        "pinyin": "wǒ wèi 2 0 nián 。",
        "meaning": "Tôi 20 tuổi.",
        "keywords": [
          "我为"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 17,
        "startTime": 45.24,
        "endTime": 46.3,
        "hanzi": "你。",
        "pinyin": "nǐ 。",
        "meaning": "Bạn?",
        "keywords": [
          "你"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 18,
        "startTime": 46.5,
        "endTime": 49.24,
        "hanzi": "我为22年。",
        "pinyin": "wǒ wèi 2 2 nián 。",
        "meaning": "Tôi 22 tuổi.",
        "keywords": [
          "我为"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 19,
        "startTime": 50.24,
        "endTime": 52.04,
        "hanzi": "你好。",
        "pinyin": "nǐ hǎo 。",
        "meaning": "Bạn okay không?",
        "keywords": [
          "你好"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 20,
        "startTime": 53.22,
        "endTime": 55.5,
        "hanzi": "我为很。你。",
        "pinyin": "wǒ wèi hěn 。 nǐ 。",
        "meaning": "Tôi rất tốt, bạn?",
        "keywords": [
          "我为",
          "很你"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 21,
        "startTime": 56.22,
        "endTime": 58.48,
        "hanzi": "我了很。",
        "pinyin": "wǒ le hěn 。",
        "meaning": "Tôi cũng rất tốt.",
        "keywords": [
          "我了"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 22,
        "startTime": 59.28,
        "endTime": 61.18,
        "hanzi": "你在一下工为为。",
        "pinyin": "nǐ zài yí xià gōng wèi wèi 。",
        "meaning": "Bạn làm việc ở đâu?",
        "keywords": [
          "你在",
          "一下"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 23,
        "startTime": 62.28,
        "endTime": 64.74,
        "hanzi": "我在学校为为。",
        "pinyin": "wǒ zài xué xiào wèi wèi 。",
        "meaning": "Tôi làm việc ở trường.",
        "keywords": [
          "我在",
          "学校"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 24,
        "startTime": 65.24,
        "endTime": 67.52,
        "hanzi": "你在一下工为为中国语。",
        "pinyin": "nǐ zài yí xià gōng wèi wèi zhōng guó yǔ 。",
        "meaning": "Bạn học tiếng Trung ở đâu?",
        "keywords": [
          "你在",
          "一下"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 25,
        "startTime": 68.24,
        "endTime": 71.34,
        "hanzi": "我在网络为中国语。",
        "pinyin": "wǒ zài wǎng luò wèi zhōng guó yǔ 。",
        "meaning": "Tôi học tiếng Trung trên mạng.",
        "keywords": [
          "我在",
          "网络"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 26,
        "startTime": 72.24,
        "endTime": 74.68,
        "hanzi": "你的教学是中国人吗？",
        "pinyin": "nǐ de jiào xué shì zhōng guó rén ma ？",
        "meaning": "Giáo viên của bạn là người Trung Quốc không?",
        "keywords": [
          "你的",
          "教学"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 27,
        "startTime": 75.26,
        "endTime": 77.74,
        "hanzi": "是，你是中国人。",
        "pinyin": "shì ， nǐ shì zhōng guó rén 。",
        "meaning": "Có, giáo viên của tôi là người Trung Quốc.",
        "keywords": [
          "是你",
          "是中"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 28,
        "startTime": 78.22,
        "endTime": 81.22,
        "hanzi": "了日为你，我为很。",
        "pinyin": "liǎo rì wèi nǐ ， wǒ wèi hěn 。",
        "meaning": "Hôm nay gặp bạn, tôi rất hân hạnh.",
        "keywords": [
          "了日",
          "为你"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 29,
        "startTime": 82.24,
        "endTime": 84.6,
        "hanzi": "我了很。",
        "pinyin": "wǒ le hěn 。",
        "meaning": "Tôi cũng rất hân hạnh.",
        "keywords": [
          "我了"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 30,
        "startTime": 85.24,
        "endTime": 88.38,
        "hanzi": "了日为很。",
        "pinyin": "liǎo rì wèi hěn 。",
        "meaning": "Hy vọng chúng ta sẽ liên lạc nhiều hơn.",
        "keywords": [
          "了日",
          "为很"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 31,
        "startTime": 89.32,
        "endTime": 91.28,
        "hanzi": "为。姐可你。",
        "pinyin": "wèi 。 jiě kě nǐ 。",
        "meaning": "Được, cảm ơn bạn.",
        "keywords": [
          "为姐",
          "可你"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 32,
        "startTime": 92.3,
        "endTime": 92.8,
        "hanzi": "不帯常。",
        "pinyin": "bú dài cháng 。",
        "meaning": "Không có vấn đề.",
        "keywords": [
          "不帯"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 33,
        "startTime": 94.32,
        "endTime": 94.68,
        "hanzi": "及了。",
        "pinyin": "jí le 。",
        "meaning": "Tạm biệt.",
        "keywords": [
          "及了"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 34,
        "startTime": 97.32,
        "endTime": 98.18,
        "hanzi": "及了。",
        "pinyin": "jí le 。",
        "meaning": "Tạm biệt.",
        "keywords": [
          "及了"
        ],
        "blankIndices": [
          0
        ]
      }
    ]
  },
  {
    "id": "dict_lesson_3",
    "youtubeId": "RT1yYLfqNhU",
    "title": "Luyện Nghe Tiếng Trung Giao Tiếp Hằng Ngày | HSK 2",
    "category": "Giao Tiếp",
    "level": "2",
    "levelText": "HSK 2",
    "description": "Các mẫu câu giao tiếp thông dụng hàng ngày trong đời sống, mua sắm và hỏi đường.",
    "duration": "04:44",
    "thumbnail": "https://img.youtube.com/vi/RT1yYLfqNhU/hqdefault.jpg",
    "sentences": [
      {
        "id": 1,
        "startTime": 0,
        "endTime": 3.46,
        "hanzi": "我是保宝",
        "pinyin": "wǒ shì bǎo jìn",
        "meaning": "Tôi là người giữ gìn",
        "keywords": [
          "我是",
          "保宝"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 2,
        "startTime": 4.88,
        "endTime": 6.22,
        "hanzi": "是一个我的园事五不宝",
        "pinyin": "shì yí gè wǒ de jiā lè wǔ bú jìn",
        "meaning": "Là một người trong gia đình tôi, không có gì hết",
        "keywords": [
          "是一",
          "个我"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 3,
        "startTime": 7.54,
        "endTime": 8.6,
        "hanzi": "是一个我的中子",
        "pinyin": "shì yí gè wǒ de zhōng zǐ",
        "meaning": "Là một người trong gia đình tôi, con trai",
        "keywords": [
          "是一",
          "个我"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 4,
        "startTime": 9.8,
        "endTime": 10.86,
        "hanzi": "是一个我的父父",
        "pinyin": "shì yí gè wǒ de fù fù",
        "meaning": "Là một người trong gia đình tôi, cha cha",
        "keywords": [
          "是一",
          "个我"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 5,
        "startTime": 11.86,
        "endTime": 14.24,
        "hanzi": "小王保宝",
        "pinyin": "xiǎo wáng bǎo jìn",
        "meaning": "Người nhỏ giữ gìn",
        "keywords": [
          "小王",
          "保宝"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 6,
        "startTime": 20.42,
        "endTime": 27.86,
        "hanzi": "不宝今天一天了了",
        "pinyin": "bú jìn jīn tiān yi tiān le",
        "meaning": "Không có gì hết ngày hôm nay",
        "keywords": [
          "不宝",
          "今天"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 7,
        "startTime": 27.86,
        "endTime": 30.7,
        "hanzi": "雨了如常例和例为不宝上天上不宝",
        "pinyin": "yǔ le suǒ yǐ pèi hé qiáo zhì bù néng zài wài miàn wán",
        "meaning": "Mưa rồi nên Phê và Giô-rê phải ở trong nhà",
        "keywords": [
          "雨了",
          "如常"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 8,
        "startTime": 33.76,
        "endTime": 40.88,
        "hanzi": "父父了了雨了不宝了上天上不宝",
        "pinyin": "bà ba xiàn zài yǔ tíng le wǒ men néng chū qù wán ma hǎo de nǐ men liǎng qù wán ba",
        "meaning": "Bố bây giờ mưa đã ngừng, chúng ta có thể ra ngoài chơi được không? Tốt, các bạn hai người đi chơi nhé",
        "keywords": [
          "父父",
          "了了"
        ],
        "blankIndices": [
          0,
          7,
          13
        ]
      },
      {
        "id": 9,
        "startTime": 51.38,
        "endTime": 56.34,
        "hanzi": "例为不宝了不宝了不宝了不宝",
        "pinyin": "pèi qí zuì xǐ huan zài ní kēng lǐ wán wǒ zuì xǐ huan zài ní kēng lǐ wán le",
        "meaning": "Phê-chi thích chơi ở chỗ đất sét, tôi thích chơi ở chỗ đất sét",
        "keywords": [
          "例为",
          "不宝"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 10,
        "startTime": 56.66,
        "endTime": 64.04,
        "hanzi": "例为不宝了不宝了不宝了不宝",
        "pinyin": "pèi qí rú guǒ nǐ yào zài ní kēng lǐ tiào nǐ bì dé",
        "meaning": "Phê-chi nếu bạn muốn chơi ở chỗ đất sét, bạn phải",
        "keywords": [
          "例为",
          "不宝"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 11,
        "startTime": 64.04,
        "endTime": 66.84,
        "hanzi": "不宝了不宝了不宝了不宝",
        "pinyin": "chuān shàng xuē zǐ cái xíng duì bù qǐ mā ma",
        "meaning": "Đeo giày mới rồi, xin lỗi mẹ",
        "keywords": [
          "不宝",
          "了不"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 12,
        "startTime": 77.14,
        "endTime": 79.191,
        "hanzi": "事为不宝了不宝了不宝了不宝",
        "pinyin": "qiáo zhì yě xǐ huan zài ní kēng lǐ tiào",
        "meaning": "Giô-rê cũng thích chơi ở chỗ đất sét",
        "keywords": [
          "事为",
          "不宝"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 13,
        "startTime": 81.771,
        "endTime": 86.871,
        "hanzi": "我不宝了事为不宝了不宝了不宝",
        "pinyin": "wǒ shuō qiáo zhì rú guǒ nǐ yào zài ní kēng lǐ tiào nǐ bì xū dé chuān shàng xuē zǐ cái xíng",
        "meaning": "Tôi nói Giô-rê, nếu bạn muốn chơi ở chỗ đất sét, bạn phải đeo giày mới rồi",
        "keywords": [
          "我不",
          "宝了"
        ],
        "blankIndices": [
          0,
          7,
          13
        ]
      },
      {
        "id": 14,
        "startTime": 90.271,
        "endTime": 92.531,
        "hanzi": "例为不宝了不宝了不宝了不宝",
        "pinyin": "pèi qí xǐ huan zhào gù tā de dì di qiáo zhì",
        "meaning": "Phê-chi thích chăm sóc anh trai Giô-rê",
        "keywords": [
          "例为",
          "不宝"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 15,
        "startTime": 95.751,
        "endTime": 103.151,
        "hanzi": "了不宝了不宝了不宝了不宝",
        "pinyin": "hǎo le qiáo zhì wǒ men zài qù zhǎo jǐ",
        "meaning": "Được rồi Giô-rê, chúng ta lại đi tìm một vài",
        "keywords": [
          "了不",
          "宝了"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 16,
        "startTime": 103.151,
        "endTime": 104.131,
        "hanzi": "了不宝了不宝了不宝了不宝",
        "pinyin": "gè ní tiào ba",
        "meaning": "Nước sét để chơi",
        "keywords": [
          "了不",
          "宝了"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 17,
        "startTime": 111.171,
        "endTime": 112.991,
        "hanzi": "例为不宝了不宝了不宝了不宝",
        "pinyin": "pèi qí hé qiáo zhì wán dé hěn kāi xīn",
        "meaning": "Phê-chi và Giô-rê chơi rất vui vẻ",
        "keywords": [
          "例为",
          "不宝"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 18,
        "startTime": 114.291,
        "endTime": 115.951,
        "hanzi": "例为不宝了不宝了不宝了不宝",
        "pinyin": "pèi qí zhǎo dào le yí gè xiǎo ní kēng",
        "meaning": "Phê-chi tìm thấy một cái hố đất sét nhỏ",
        "keywords": [
          "例为",
          "不宝"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 19,
        "startTime": 117.211,
        "endTime": 119.091,
        "hanzi": "事为不宝了不宝了不宝了不宝",
        "pinyin": "qiáo zhì zhǎo dào le yí gè dà ní kēng",
        "meaning": "Giô-rê tìm thấy một cái hố đất sét lớn",
        "keywords": [
          "事为",
          "不宝"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 20,
        "startTime": 123.951,
        "endTime": 130.911,
        "hanzi": "不宝了不宝了不宝了不宝",
        "pinyin": "nǐ kàn qiáo zhì",
        "meaning": "Hãy nhìn xem Giô-rê",
        "keywords": [
          "不宝",
          "了不"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 21,
        "startTime": 131.791,
        "endTime": 133.271,
        "hanzi": "那里有个很大的泥坑",
        "pinyin": "nà lǐ yǒu gè hěn dà de ní kēng",
        "meaning": "Có một vũng bùn lớn ở đó",
        "keywords": [
          "那里",
          "有个"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 22,
        "startTime": 137.751,
        "endTime": 140.051,
        "hanzi": "乔治想第一个跳到泥坑里去玩",
        "pinyin": "qiáo zhì xiǎng dì yī gè tiào dào ní kēng lǐ qù wán",
        "meaning": "George muốn là người đầu tiên nhảy xuống vũng bùn và chơi đùa",
        "keywords": [
          "乔治",
          "想第"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 23,
        "startTime": 141.271,
        "endTime": 148.671,
        "hanzi": "等一下乔治我得先检查一下这里安不安全很好",
        "pinyin": "děng yí xià qiáo zhì wǒ dé xiān jiǎn chá yí xià zhè lǐ ān bu ān quán hěn hǎo",
        "meaning": "Đợi một chút, George. Tôi phải kiểm tra xem nó có an toàn không.",
        "keywords": [
          "等一",
          "下乔"
        ],
        "blankIndices": [
          0,
          10,
          19
        ]
      },
      {
        "id": 24,
        "startTime": 148.191,
        "endTime": 155.491,
        "hanzi": "你可以放心地玩了对",
        "pinyin": "nǐ kě yǐ fàng xīn dì wán le duì",
        "meaning": "Bạn có thể chơi với sự tự tin, phải không?",
        "keywords": [
          "你可",
          "以放"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 25,
        "startTime": 155.502,
        "endTime": 157.762,
        "hanzi": "不起乔治,只是掀泥而已",
        "pinyin": "bù qǐ qiáo zhì , zhǐ shì xiān ní ér yǐ",
        "meaning": "Không đủ tiền mua George, cứ khuấy bùn lên",
        "keywords": [
          "不起",
          "乔治"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 26,
        "startTime": 168.562,
        "endTime": 171.762,
        "hanzi": "佩奇和乔治喜欢在泥坑里跳来跳去",
        "pinyin": "pèi qí hé qiáo zhì xǐ huan zài ní kēng lǐ tiào lái tiào qù",
        "meaning": "Peppa và George thích nhảy trong vũng nước",
        "keywords": [
          "佩奇",
          "和乔"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 27,
        "startTime": 177.662,
        "endTime": 180.722,
        "hanzi": "来吧乔治我们快点去给爸爸看看吧",
        "pinyin": "lái ba qiáo zhì wǒ men kuài diǎn qù gěi bà ba kàn kàn ba",
        "meaning": "Nào George, chúng ta hãy nhanh chóng đi gặp bố nào.",
        "keywords": [
          "来吧",
          "乔治"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 28,
        "startTime": 187.722,
        "endTime": 192.282,
        "hanzi": "我的老天哪爸爸爸爸你猜猜我们刚才干了什么",
        "pinyin": "wǒ de lǎo tiān nǎ bà ba bà ba nǐ cāi cāi wǒ men gāng cái gàn le shén me",
        "meaning": "Ôi Chúa ơi, bố, bố đoán xem chúng ta vừa làm gì",
        "keywords": [
          "我的",
          "老天"
        ],
        "blankIndices": [
          0,
          10,
          19
        ]
      },
      {
        "id": 29,
        "startTime": 193.082,
        "endTime": 196.462,
        "hanzi": "让我猜一猜你们刚才看电视了",
        "pinyin": "ràng wǒ cāi yi cāi nǐ men gāng cái kàn diàn shì le",
        "meaning": "Để tôi đoán xem vừa rồi bạn đang xem gì trên TV",
        "keywords": [
          "让我",
          "猜一"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 30,
        "startTime": 197.002,
        "endTime": 198.622,
        "hanzi": "不对你猜错了",
        "pinyin": "bú duì nǐ cāi cuò le",
        "meaning": "Không, bạn đoán sai rồi",
        "keywords": [
          "不对",
          "你猜"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 31,
        "startTime": 199.582,
        "endTime": 206.402,
        "hanzi": "你们刚才洗澡了不对不对我知道",
        "pinyin": "nǐ men gāng cái xǐ zǎo le bú duì bu duì wǒ zhī dào",
        "meaning": "Tôi biết bạn vừa tắm xong phải không?",
        "keywords": [
          "你们",
          "刚才"
        ],
        "blankIndices": [
          0,
          7,
          13
        ]
      },
      {
        "id": 32,
        "startTime": 206.402,
        "endTime": 209.782,
        "hanzi": "了你们刚才在泥坑里跳来跳去",
        "pinyin": "liǎo nǐ men gāng cái zài ní kēng lǐ tiào lái tiào qù",
        "meaning": "Ồ, bạn vừa nhảy lên nhảy xuống bùn.",
        "keywords": [
          "了你",
          "们刚"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 33,
        "startTime": 210.502,
        "endTime": 214.142,
        "hanzi": "没错没错爸爸我们在泥坑里跳来跳去",
        "pinyin": "méi cuò méi cuò bà ba wǒ men zài ní kēng lǐ tiào lái tiào qù",
        "meaning": "Vâng, vâng bố ơi, chúng con đang nhảy nhót trong vũng bùn.",
        "keywords": [
          "没错",
          "没错"
        ],
        "blankIndices": [
          0,
          8,
          15
        ]
      },
      {
        "id": 34,
        "startTime": 214.962,
        "endTime": 217.622,
        "hanzi": "看看你们弄得多脏啊",
        "pinyin": "kàn kàn nǐ men nòng dé duō zāng a",
        "meaning": "Nhìn xem bạn đã làm nó bẩn thế nào",
        "keywords": [
          "看看",
          "你们"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 35,
        "startTime": 218.682,
        "endTime": 219.282,
        "hanzi": "糟糕",
        "pinyin": "zāo gāo",
        "meaning": "Ối",
        "keywords": [
          "糟糕"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 36,
        "startTime": 220.202,
        "endTime": 222.222,
        "hanzi": "没事只是些泥而已",
        "pinyin": "méi shì zhǐ shì xiē ní ér yǐ",
        "meaning": "Không sao đâu, chỉ là bùn thôi",
        "keywords": [
          "没事",
          "只是"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 37,
        "startTime": 223.342,
        "endTime": 230.833,
        "hanzi": "快清理干净别让妈妈看到你们这么脏爸爸我们清清理乾淨之後",
        "pinyin": "kuài qīng lǐ gān jìng bié ràng mā ma kàn dào nǐ men zhè me zāng bà ba wǒ men qīng qīng lǐ qián jìng zhī hòu",
        "meaning": "Làm sạch nó nhanh chóng. Đừng để mẹ thấy con bẩn thỉu thế nào. Bố, chúng ta sẽ dọn dẹp sau đó.",
        "keywords": [
          "快清",
          "理干"
        ],
        "blankIndices": [
          0,
          13,
          26
        ]
      },
      {
        "id": 38,
        "startTime": 231.293,
        "endTime": 233.313,
        "hanzi": "你和媽媽也會一起來玩嗎",
        "pinyin": "nǐ hé mā mā yě huì yì qǐ lái wán má",
        "meaning": "Bạn và mẹ bạn có đến chơi cùng nhau không?",
        "keywords": [
          "你和",
          "媽媽"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 39,
        "startTime": 233.793,
        "endTime": 236.133,
        "hanzi": "是的我們都可以在花園玩",
        "pinyin": "shì de wǒ mén dōu kě yǐ zài huā yuán wán",
        "meaning": "Vâng tất cả chúng ta có thể chơi trong vườn",
        "keywords": [
          "是的",
          "我們"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 40,
        "startTime": 243.233,
        "endTime": 245.613,
        "hanzi": "佩琪和喬治穿著他們的子",
        "pinyin": "pèi qí hé qiáo zhì chuān zhù tā mén de zǐ",
        "meaning": "Peppa Pig và George mặc quần",
        "keywords": [
          "佩琪",
          "和喬"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 41,
        "startTime": 246.353,
        "endTime": 249.073,
        "hanzi": "豬媽媽和豬爸爸也穿著他們的靴子",
        "pinyin": "zhū mā mā hé zhū bà ba yě chuān zhù tā mén de xuē zǐ",
        "meaning": "Heo Mẹ và Heo Bố cũng đi bốt",
        "keywords": [
          "豬媽",
          "媽和"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 42,
        "startTime": 249.913,
        "endTime": 252.353,
        "hanzi": "佩琪喜歡在泥坑裡跳來跳去",
        "pinyin": "pèi qí xǐ huān zài ní kēng lǐ tiào lái tiào qù",
        "meaning": "Peppa Pig thích nhảy vào vũng bùn",
        "keywords": [
          "佩琪",
          "喜歡"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 43,
        "startTime": 253.893,
        "endTime": 256.393,
        "hanzi": "大家都喜欢在泥坑里跳来跳去",
        "pinyin": "dà jiā dōu xǐ huan zài ní kēng lǐ tiào lái tiào qù",
        "meaning": "Mọi người đều thích nhảy vào vũng bùn",
        "keywords": [
          "大家",
          "都喜"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 44,
        "startTime": 265.253,
        "endTime": 270.853,
        "hanzi": "看那猪爸爸瞧瞧你身上多脏啊只是些泥而已",
        "pinyin": "kàn nà zhū bà ba qiáo qiáo nǐ shēn shàng duō zāng a zhǐ shì xiē ní ér yǐ",
        "meaning": "Nhìn con lợn bố đó kìa, nhìn bẩn thỉu làm sao. Đó chỉ là bùn thôi.",
        "keywords": [
          "看那",
          "猪爸"
        ],
        "blankIndices": [
          0,
          9,
          18
        ]
      },
      {
        "id": 45,
        "startTime": 283.693,
        "endTime": 284.533,
        "hanzi": "哈哈哈哈",
        "pinyin": "hā hā hā hā",
        "meaning": "Ha ha ha ha",
        "keywords": [
          "哈哈",
          "哈哈"
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
    "youtubeId": "Asqr_Sz9wVM",
    "title": "Khẩu Ngữ Tiếng Trung Phổ Biến Thực Tế | HSK 3",
    "category": "Đời Sống",
    "level": "3",
    "levelText": "HSK 3",
    "description": "Rèn luyện phản xạ nghe hiểu với tốc độ nói tự nhiên của người bản xứ và từ vựng phong phú.",
    "duration": "08:38",
    "thumbnail": "https://img.youtube.com/vi/Asqr_Sz9wVM/hqdefault.jpg",
    "sentences": [
      {
        "id": 1,
        "startTime": 0.02,
        "endTime": 5.08,
        "hanzi": "好好，今天我们一个井一个合事是一个很很的表示",
        "pinyin": "dà jiā hǎo , jīn tiān wǒ men yì qǐ lái tīng yí duàn jì cháng yòu yǒu qù de duì huà",
        "meaning": "Xin chào, hôm nay chúng ta cùng nhau nghe một đoạn hội thoại vừa dài vừa thú vị",
        "keywords": [
          "好好",
          "今天"
        ],
        "blankIndices": [
          0,
          10,
          20
        ]
      },
      {
        "id": 2,
        "startTime": 6.06,
        "endTime": 7.68,
        "hanzi": "为一个回学起起为为回学为一个回学的题。",
        "pinyin": "zhǔ tí shì zài shāng diàn gòu wù",
        "meaning": "Chủ đề là mua sắm tại cửa hàng",
        "keywords": [
          "为一",
          "个回"
        ],
        "blankIndices": [
          0,
          9,
          17
        ]
      },
      {
        "id": 3,
        "startTime": 8.54,
        "endTime": 12.92,
        "hanzi": "在一个表示中，你你不一个定一个为定的认为。",
        "pinyin": "zài zhè duàn duì huà lǐ , nǐ men huì xué dào hěn duō hé yī fu 、",
        "meaning": "Trong đoạn hội thoại này, các bạn sẽ học được nhiều từ vựng liên quan đến quần áo, giày dép và phụ kiện",
        "keywords": [
          "在一",
          "个表"
        ],
        "blankIndices": [
          0,
          9,
          18
        ]
      },
      {
        "id": 4,
        "startTime": 12.92,
        "endTime": 15.28,
        "hanzi": "为一个定一个为定的认为。",
        "pinyin": "xié zǐ 、 pèi shì xiāng guān de cí huì",
        "meaning": "và cách hỏi giá, mặc và thanh toán",
        "keywords": [
          "为一",
          "个定"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 5,
        "startTime": 16.02,
        "endTime": 18.46,
        "hanzi": "为一个定一个为定的认为，",
        "pinyin": "yǐ jí yòng zhōng wén xún wèn jià gé 、",
        "meaning": "và cách hỏi giá, mặc và thanh toán",
        "keywords": [
          "为一",
          "个定"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 6,
        "startTime": 18.48,
        "endTime": 19.78,
        "hanzi": "为一个定一个为定的认为。",
        "pinyin": "chuān hé jié zhàng de fāng fǎ",
        "meaning": "và cách hỏi giá, mặc và thanh toán",
        "keywords": [
          "为一",
          "个定"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 7,
        "startTime": 20.38,
        "endTime": 23.38,
        "hanzi": "为一个定一个为定的题。",
        "pinyin": "zhè shì rì cháng shēng huó zhōng fēi cháng cháng jiàn de chǎng jǐng",
        "meaning": "Đây là một tình huống rất thường gặp trong cuộc sống hàng ngày",
        "keywords": [
          "为一",
          "个定"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 8,
        "startTime": 23.88,
        "endTime": 27.54,
        "hanzi": "为一个定一个为定的题。",
        "pinyin": "yí dìng néng bāng zhù dà jiā kuài sù tí gāo zhōng wén jiāo liú néng lì",
        "meaning": "Đó sẽ giúp các bạn cải thiện khả năng giao tiếp tiếng Trung một cách nhanh chóng",
        "keywords": [
          "为一",
          "个定"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 9,
        "startTime": 28.26,
        "endTime": 32.3,
        "hanzi": "为一个定一个为定的题。",
        "pinyin": "hǎo le , xiàn zài jiù ràng wǒ men kāi shǐ xīn shǎng zhè duàn duì huà ba",
        "meaning": "Vậy, hãy cùng nhau bắt đầu thưởng thức đoạn hội thoại này nhé!",
        "keywords": [
          "为一",
          "个定"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 10,
        "startTime": 33.7,
        "endTime": 39.66,
        "hanzi": "你好，我今天一个井一个回学是一个定一个回学的题。",
        "pinyin": "nín hǎo , wǒ jīn tiān lái shāng diàn shì yīn wèi tīng shuō yǒu tè bié cù xiāo huó dòng bù zhī dào xiàn zài",
        "meaning": "Xin chào, hôm nay tôi đến cửa hàng vì nghe nói có một chương trình khuyến mãi đặc biệt",
        "keywords": [
          "你好",
          "我今"
        ],
        "blankIndices": [
          0,
          11,
          21
        ]
      },
      {
        "id": 11,
        "startTime": 39.66,
        "endTime": 40.92,
        "hanzi": "为一个定一个为定的题。",
        "pinyin": "hái yǒu hěn duō shāng pǐn ma ?",
        "meaning": "Còn có nhiều sản phẩm khác không?",
        "keywords": [
          "为一",
          "个定"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 12,
        "startTime": 41.96,
        "endTime": 46.82,
        "hanzi": "是的，我的回学为为回学为一个定一个回学的题。",
        "pinyin": "shì de , wǒ men shāng diàn zhèng zài jìn xíng dà cù xiāo cóng yī fu 、",
        "meaning": "Có, cửa hàng chúng tôi đang tổ chức một chương trình khuyến mãi lớn, từ quần áo, giày dép đến các sản phẩm gia dụng",
        "keywords": [
          "是的",
          "我的"
        ],
        "blankIndices": [
          0,
          10,
          19
        ]
      },
      {
        "id": 13,
        "startTime": 46.82,
        "endTime": 52.24,
        "hanzi": "是的，我的回学为为回学为一个定一个回学的题。",
        "pinyin": "xié zǐ dào jiā yòng diàn qì dōu yǒu yōu huì nín yào bu yào kàn yí xià xiáng xì mù lù ?",
        "meaning": "Cửa hàng chúng tôi đang tổ chức một chương trình khuyến mãi lớn, từ quần áo, giày dép đến các sản phẩm gia dụng",
        "keywords": [
          "是的",
          "我的"
        ],
        "blankIndices": [
          0,
          10,
          19
        ]
      },
      {
        "id": 14,
        "startTime": 52.78,
        "endTime": 58.88,
        "hanzi": "我的为一个定一个为定的题。",
        "pinyin": "wǒ zuì guān xīn de shì nán shì shàng bān chuān de chèn shān yào yán sè dà fāng bú liào tòu qì bù zhī dào",
        "meaning": "Tôi quan tâm nhất là áo sơ mi cho nam giới mặc khi đi làm",
        "keywords": [
          "我的",
          "为一"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 15,
        "startTime": 58.88,
        "endTime": 60.66,
        "hanzi": "为一个定一个为定的题。",
        "pinyin": "xiàn zài yǒu méi yǒu xīn kuǎn dào huò",
        "meaning": "Có sản phẩm mới được nhập về không?",
        "keywords": [
          "为一",
          "个定"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 16,
        "startTime": 61.68,
        "endTime": 65.54,
        "hanzi": "是的，我的回学为为回学为一个定一个回学的题。",
        "pinyin": "yǒu de zhè zhōu gāng dào yì pī gāo dàng chún mián chèn shān",
        "meaning": "Có, cửa hàng chúng tôi vừa nhập về một lô áo sơ mi cao cấp làm từ cotton",
        "keywords": [
          "是的",
          "我的"
        ],
        "blankIndices": [
          0,
          10,
          19
        ]
      },
      {
        "id": 17,
        "startTime": 66.06,
        "endTime": 70.6,
        "hanzi": "是的，我的回学为为回学为一个定一个回学的题。",
        "pinyin": "kuǎn shì shí shàng xiàn zài zhèng zài dǎ qī zhé nǐ yào bu yào shì shì kàn",
        "meaning": "Sản phẩm này có kiểu dáng thời trang và đang được giảm giá 7%!",
        "keywords": [
          "是的",
          "我的"
        ],
        "blankIndices": [
          0,
          10,
          19
        ]
      },
      {
        "id": 18,
        "startTime": 71.52,
        "endTime": 72.42,
        "hanzi": "是的，我的回学为为回学为一个定一个回学的题。",
        "pinyin": "tīng qǐ lái bú cuò",
        "meaning": "Đó nghe có vẻ hấp dẫn!",
        "keywords": [
          "是的",
          "我的"
        ],
        "blankIndices": [
          0,
          10,
          19
        ]
      },
      {
        "id": 19,
        "startTime": 72.94,
        "endTime": 75.14,
        "hanzi": "为一个定一个为定的题。",
        "pinyin": "bú guò zài shì zhī qián wǒ xiǎng wèn yí xià",
        "meaning": "Nhưng trước khi mua, tôi muốn hỏi thêm một chút",
        "keywords": [
          "为一",
          "个定"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 20,
        "startTime": 75.66,
        "endTime": 77.8,
        "hanzi": "这些衬衫的原价大概是多少",
        "pinyin": "zhè xiē chèn shān de yuán jià dà gài shì duō shǎo",
        "meaning": "Giá ban đầu gần đúng của những chiếc áo sơ mi này là bao nhiêu?",
        "keywords": [
          "这些",
          "衬衫"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 21,
        "startTime": 79,
        "endTime": 85.86,
        "hanzi": "每件原价大概八百块钱但这次活动只要五百多而且保证是正",
        "pinyin": "měi jiàn yuán jià dà gài bā bǎi kuài qián dàn zhè cì huó dòng zhǐ yào wǔ bǎi duō ér qiě bǎo zhèng shì zhèng",
        "meaning": "Giá gốc của mỗi chiếc là khoảng 800 tệ, nhưng lần này giá chỉ hơn 500 tệ và đảm bảo là hàng thật.",
        "keywords": [
          "每件",
          "原价"
        ],
        "blankIndices": [
          0,
          13,
          25
        ]
      },
      {
        "id": 22,
        "startTime": 85.86,
        "endTime": 86.04,
        "hanzi": "品",
        "pinyin": "pǐn",
        "meaning": "Nếm",
        "keywords": [
          "品"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 23,
        "startTime": 87,
        "endTime": 93.12,
        "hanzi": "那我想试一件浅蓝色的Elma因为我平时上班穿想选个比",
        "pinyin": "nà wǒ xiǎng shì yí jiàn qiǎn lán sè de E l m a yīn wèi wǒ píng shí shàng bān chuān xiǎng xuǎn gè bǐ",
        "meaning": "Sau đó tôi muốn thử một chiếc Elma màu xanh nhạt vì tôi thường mặc nó đi làm và muốn chọn thứ gì đó tốt hơn.",
        "keywords": [
          "那我",
          "想试"
        ],
        "blankIndices": [
          0,
          11,
          21
        ]
      },
      {
        "id": 24,
        "startTime": 93.12,
        "endTime": 94.2,
        "hanzi": "较正式的颜色",
        "pinyin": "jiào zhèng shì de yán sè",
        "meaning": "màu sắc trang trọng hơn",
        "keywords": [
          "较正",
          "式的"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 25,
        "startTime": 95.24,
        "endTime": 101.46,
        "hanzi": "好的请稍等一下我给你拿一件浅蓝色Elma的衬衫你可以",
        "pinyin": "hǎo de qǐng shāo děng yí xià wǒ gěi nǐ ná yí jiàn qiǎn lán sè E l m a de chèn shān nǐ kě yǐ",
        "meaning": "Được rồi, xin vui lòng đợi một lát. Tôi sẽ lấy cho bạn một chiếc áo sơ mi Elma màu xanh nhạt. bạn có thể",
        "keywords": [
          "好的",
          "请稍"
        ],
        "blankIndices": [
          0,
          11,
          21
        ]
      },
      {
        "id": 26,
        "startTime": 101.46,
        "endTime": 103.36,
        "hanzi": "马上到十一间试穿",
        "pinyin": "mǎ shàng dào shí yī jiān shì chuān",
        "meaning": "Đến phòng 11 để thử ngay",
        "keywords": [
          "马上",
          "到十"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 27,
        "startTime": 104.54,
        "endTime": 110.4,
        "hanzi": "谢谢你在等待的时候我还想看看皮鞋适合上班穿的不要太复",
        "pinyin": "xiè xiè nǐ zài děng dài de shí hòu wǒ hái xiǎng kàn kàn pí xié shì hé shàng bān chuān de bú yào tài fù",
        "meaning": "Cảm ơn. Trong lúc chờ đợi, tôi cũng muốn xem đôi giày da đó có phù hợp để đi làm và không quá phức tạp hay không.",
        "keywords": [
          "谢谢",
          "你在"
        ],
        "blankIndices": [
          0,
          13,
          25
        ]
      },
      {
        "id": 28,
        "startTime": 110.92,
        "endTime": 112.1,
        "hanzi": "但一定要舒服",
        "pinyin": "dàn yí dìng yào shū fú",
        "meaning": "Nhưng phải thoải mái",
        "keywords": [
          "但一",
          "定要"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 29,
        "startTime": 113.32,
        "endTime": 116.24,
        "hanzi": "我们这里有很多新款皮鞋,",
        "pinyin": "wǒ men zhè lǐ yǒu hěn duō xīn kuǎn pí xié ,",
        "meaning": "Chúng tôi có nhiều giày da mới ở đây,",
        "keywords": [
          "我们",
          "这里"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 30,
        "startTime": 116.24,
        "endTime": 119.94,
        "hanzi": "大部分是真皮的,设计简洁大方,",
        "pinyin": "dà bù fen shì zhēn pí de , shè jì jiǎn jié dà fāng ,",
        "meaning": "Hầu hết đều được làm bằng da thật, có kiểu dáng đơn giản và trang nhã.",
        "keywords": [
          "大部",
          "分是"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 31,
        "startTime": 119.94,
        "endTime": 122.52,
        "hanzi": "适合上班或者参加宴会穿",
        "pinyin": "shì hé shàng bān huò zhě cān jiā yàn huì chuān",
        "meaning": "Thích hợp đi làm hoặc đi dự tiệc",
        "keywords": [
          "适合",
          "上班"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 32,
        "startTime": 123.66,
        "endTime": 128.36,
        "hanzi": "那你能不能给我推荐一款最近一个月卖得最好的鞋子,",
        "pinyin": "nà nǐ néng bu néng gěi wǒ tuī jiàn yì kuǎn zuì jìn yí gè yuè mài dé zuì hǎo de xié zǐ ,",
        "meaning": "Vậy bạn có thể giới thiệu cho tôi một đôi giày bán chạy nhất trong tháng qua được không?",
        "keywords": [
          "那你",
          "能不"
        ],
        "blankIndices": [
          0,
          11,
          22
        ]
      },
      {
        "id": 33,
        "startTime": 128.36,
        "endTime": 129.78,
        "hanzi": "让我参考一下?",
        "pinyin": "ràng wǒ cān kǎo yí xià ?",
        "meaning": "Để tôi tham khảo nhé?",
        "keywords": [
          "让我",
          "参考"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 34,
        "startTime": 130.76,
        "endTime": 138.076,
        "hanzi": "好的,深棕色的皮鞋卖得非常火因为很容易搭配鞋型标准鞋",
        "pinyin": "hǎo de , shēn zōng sè de pí xié mài dé fēi cháng huǒ yīn wèi hěn róng yì dā pèi xié xíng biāo zhǔn xié",
        "meaning": "Được rồi, giày da màu nâu sẫm đang rất được ưa chuộng vì rất dễ kết hợp với những đôi giày chuẩn.",
        "keywords": [
          "好的",
          "深棕"
        ],
        "blankIndices": [
          0,
          12,
          24
        ]
      },
      {
        "id": 35,
        "startTime": 138.076,
        "endTime": 140.936,
        "hanzi": "垫柔软穿一整天也不会脚痛",
        "pinyin": "diàn róu ruǎn chuān yì zhěng tiān yě bú huì jiǎo tòng",
        "meaning": "Miếng lót êm ái, có thể mang cả ngày mà không gây đau chân.",
        "keywords": [
          "垫柔",
          "软穿"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 36,
        "startTime": 142.336,
        "endTime": 148.216,
        "hanzi": "听起来挺不错我平时穿42码不知道这款有没有我的尺码还有",
        "pinyin": "tīng qǐ lái tǐng bú cuò wǒ píng shí chuān 4 2 mǎ bù zhī dào zhè kuǎn yǒu méi yǒu wǒ de chǐ mǎ hái yǒu",
        "meaning": "Nghe có vẻ hay đấy. Tôi thường mặc cỡ 42. Tôi không biết cái này có vừa với cỡ của tôi không.",
        "keywords": [
          "听起",
          "来挺"
        ],
        "blankIndices": [
          0,
          12,
          24
        ]
      },
      {
        "id": 37,
        "startTime": 148.216,
        "endTime": 149.156,
        "hanzi": "没有活动优惠",
        "pinyin": "méi yǒu huó dòng yōu huì",
        "meaning": "Không có khuyến mãi",
        "keywords": [
          "没有",
          "活动"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 38,
        "startTime": 150.396,
        "endTime": 155.956,
        "hanzi": "有的42码还有货而且这款现在有85折优惠",
        "pinyin": "yǒu de 4 2 mǎ hái yǒu huò ér qiě zhè kuǎn xiàn zài yǒu 8 5 zhé yōu huì",
        "meaning": "Một số cỡ 42 vẫn còn trong kho và chiếc này hiện đang được giảm giá 15%.",
        "keywords": [
          "有的",
          "码还"
        ],
        "blankIndices": [
          0,
          8,
          15
        ]
      },
      {
        "id": 39,
        "startTime": 156.556,
        "endTime": 160.356,
        "hanzi": "如果你和衬衫一起买还可以再送优惠券",
        "pinyin": "rú guǒ nǐ hé chèn shān yì qǐ mǎi hái kě yǐ zài sòng yōu huì quàn",
        "meaning": "Nếu bạn mua nó cùng với áo sơ mi, bạn có thể nhận được phiếu giảm giá",
        "keywords": [
          "如果",
          "你和"
        ],
        "blankIndices": [
          0,
          8,
          16
        ]
      },
      {
        "id": 40,
        "startTime": 161.556,
        "endTime": 167.396,
        "hanzi": "那太好了我想直接看看42码的深棕色皮鞋如果满意的话就",
        "pinyin": "nà tài hǎo le wǒ xiǎng zhí jiē kàn kàn 4 2 mǎ de shēn zōng sè pí xié rú guǒ mǎn yì de huà jiù",
        "meaning": "Điều đó thật tuyệt. Tôi muốn xem qua đôi giày da màu nâu sẫm cỡ 42. Nếu bạn hài lòng, tôi sẽ",
        "keywords": [
          "那太",
          "好了"
        ],
        "blankIndices": [
          0,
          12,
          23
        ]
      },
      {
        "id": 41,
        "startTime": 167.396,
        "endTime": 168.516,
        "hanzi": "和小小小五上主",
        "pinyin": "hé chèn shān yì qǐ mǎi",
        "meaning": "Mua cùng áo sơ mi",
        "keywords": [
          "和小",
          "小小"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 42,
        "startTime": 169.696,
        "endTime": 176.476,
        "hanzi": "在这里你可以在试衣间里试穿我们有大镜子和椅子方便顾客",
        "pinyin": "zài zhè lǐ nǐ kě yǐ zài shì yī jiān lǐ shì chuān wǒ men yǒu dà jìng zi hé yǐ zi fāng biàn gù kè",
        "meaning": "Tại đây bạn có thể thử quần áo trong phòng thử đồ. Chúng tôi có gương và ghế lớn để thuận tiện cho khách hàng.",
        "keywords": [
          "在这",
          "里你"
        ],
        "blankIndices": [
          0,
          13,
          25
        ]
      },
      {
        "id": 43,
        "startTime": 176.476,
        "endTime": 176.976,
        "hanzi": "试鞋",
        "pinyin": "shì xié",
        "meaning": "Thử giày",
        "keywords": [
          "试鞋"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 44,
        "startTime": 178.476,
        "endTime": 181.896,
        "hanzi": "谢谢你我现在就去试不过顺便问一下",
        "pinyin": "xiè xiè nǐ wǒ xiàn zài jiù qù shì bú guò shùn biàn wèn yí xià",
        "meaning": "Cảm ơn bạn, tôi sẽ thử ngay bây giờ, nhưng nhân tiện",
        "keywords": [
          "谢谢",
          "你我"
        ],
        "blankIndices": [
          0,
          8,
          15
        ]
      },
      {
        "id": 45,
        "startTime": 182.416,
        "endTime": 185.376,
        "hanzi": "商店有没有卖和皮鞋配套的男士皮带",
        "pinyin": "shāng diàn yǒu méi yǒu mài hé pí xié pèi tào de nán shì pí dài",
        "meaning": "Cửa hàng có bán thắt lưng nam hợp với giày da không?",
        "keywords": [
          "商店",
          "有没"
        ],
        "blankIndices": [
          0,
          8,
          15
        ]
      },
      {
        "id": 46,
        "startTime": 186.736,
        "endTime": 190.476,
        "hanzi": "当然有,我们还经常整套进货,",
        "pinyin": "dāng rán yǒu , wǒ men hái jīng cháng zhěng tào jìn huò ,",
        "meaning": "Tất nhiên, chúng tôi thường mua bộ hoàn chỉnh.",
        "keywords": [
          "当然",
          "有我"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 47,
        "startTime": 190.476,
        "endTime": 193.456,
        "hanzi": "包括皮鞋、皮带和皮夹,",
        "pinyin": "bāo kuò pí xié 、 pí dài hé pí jiā ,",
        "meaning": "Bao gồm giày da, thắt lưng và ví,",
        "keywords": [
          "包括",
          "皮鞋"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 48,
        "startTime": 193.456,
        "endTime": 195.936,
        "hanzi": "很多顾客喜欢成套买,",
        "pinyin": "hěn duō gù kè xǐ huan chéng tào mǎi ,",
        "meaning": "Nhiều khách hàng thích mua theo bộ,",
        "keywords": [
          "很多",
          "顾客"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 49,
        "startTime": 195.936,
        "endTime": 197.336,
        "hanzi": "既方便又省钱",
        "pinyin": "jì fāng biàn yòu shěng qián",
        "meaning": "Tiện lợi và tiết kiệm tiền",
        "keywords": [
          "既方",
          "便又"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 50,
        "startTime": 198.496,
        "endTime": 201.576,
        "hanzi": "那太合适了,如果买整套的话,",
        "pinyin": "nà tài hé shì le , rú guǒ mǎi zhěng tào de huà ,",
        "meaning": "Điều đó thật hoàn hảo. Nếu mua cả bộ thì",
        "keywords": [
          "那太",
          "合适"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 51,
        "startTime": 201.576,
        "endTime": 203.636,
        "hanzi": "价格会有更多优惠吗?",
        "pinyin": "jià gé huì yǒu gèng duō yōu huì ma ?",
        "meaning": "Sẽ có nhiều giảm giá về giá?",
        "keywords": [
          "价格",
          "会有"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 52,
        "startTime": 203.636,
        "endTime": 205.216,
        "hanzi": "还是和单买一样?",
        "pinyin": "hái shì hé dān mǎi yí yàng ?",
        "meaning": "Hay nó giống như mua riêng lẻ?",
        "keywords": [
          "还是",
          "和单"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 53,
        "startTime": 206.056,
        "endTime": 209.836,
        "hanzi": "如果你买鞋、皮带和皮夹一整套,",
        "pinyin": "rú guǒ nǐ mǎi xié 、 pí dài hé pí jiā yì zhěng tào ,",
        "meaning": "Nếu bạn mua một bộ giày, thắt lưng và ví hoàn chỉnh,",
        "keywords": [
          "如果",
          "你买"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 54,
        "startTime": 209.836,
        "endTime": 213.036,
        "hanzi": "可以在总价的基础上再打九折,",
        "pinyin": "kě yǐ zài zǒng jià de jī chǔ shàng zài dǎ jiǔ zhé ,",
        "meaning": "Bạn có thể được giảm thêm 10% trên tổng giá.",
        "keywords": [
          "可以",
          "在总"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 55,
        "startTime": 213.036,
        "endTime": 214.876,
        "hanzi": "算是对老顾客的回馈",
        "pinyin": "suàn shì duì lǎo gù kè de huí kuì",
        "meaning": "Đó là một phản hồi cho khách hàng cũ.",
        "keywords": [
          "算是",
          "对老"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 56,
        "startTime": 216.016,
        "endTime": 219.956,
        "hanzi": "听起来很吸引人,我要考虑一下不过请问,",
        "pinyin": "tīng qǐ lái hěn xī yǐn rén , wǒ yào kǎo lǜ yí xià bú guò qǐng wèn ,",
        "meaning": "Nghe có vẻ hấp dẫn lắm, tôi sẽ suy nghĩ nhưng làm ơn,",
        "keywords": [
          "听起",
          "来很"
        ],
        "blankIndices": [
          0,
          8,
          16
        ]
      },
      {
        "id": 57,
        "startTime": 219.956,
        "endTime": 224.416,
        "hanzi": "如果尺码不合适或者商品有问题退换政策是怎样的?",
        "pinyin": "rú guǒ chǐ mǎ bù hé shì huò zhě shāng pǐn yǒu wèn tí tuì huàn zhèng cè shì zěn yàng de ?",
        "meaning": "Chính sách đổi trả như thế nào nếu không vừa size hoặc sản phẩm có vấn đề?",
        "keywords": [
          "如果",
          "尺码"
        ],
        "blankIndices": [
          0,
          11,
          21
        ]
      },
      {
        "id": 58,
        "startTime": 225.676,
        "endTime": 228.036,
        "hanzi": "我们的退换政策是七天之内",
        "pinyin": "wǒ men de tuì huàn zhèng cè shì qī tiān zhī nèi",
        "meaning": "Chính sách hoàn trả của chúng tôi là trong vòng bảy ngày",
        "keywords": [
          "我们",
          "的退"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 59,
        "startTime": 228.536,
        "endTime": 234.496,
        "hanzi": "只要没使用过,标签完整就可以免费换尺码或者换款式",
        "pinyin": "zhǐ yào méi shǐ yòng guò , biāo qiān wán zhěng jiù kě yǐ miǎn fèi huàn chǐ mǎ huò zhě huàn kuǎn shì",
        "meaning": "Miễn là nó chưa được sử dụng và nhãn còn nguyên vẹn, bạn có thể thay đổi kích thước hoặc kiểu dáng miễn phí.",
        "keywords": [
          "只要",
          "没使"
        ],
        "blankIndices": [
          0,
          11,
          22
        ]
      },
      {
        "id": 60,
        "startTime": 235.656,
        "endTime": 238.536,
        "hanzi": "有这样的政策我就放心了对了,",
        "pinyin": "yǒu zhè yàng de zhèng cè wǒ jiù fàng xīn le duì le ,",
        "meaning": "Với chính sách như vậy thì tôi thấy nhẹ nhõm hơn phải không?",
        "keywords": [
          "有这",
          "样的"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 61,
        "startTime": 238.536,
        "endTime": 243.636,
        "hanzi": "我很济了Elma的苹果苹果，喜欢尝一个一个XEl",
        "pinyin": "wǒ gāng shì le E l m a de chèn shān , jué de yǒu diǎn jǐn nǐ néng gěi wǒ yí jiàn X E l",
        "meaning": "Tôi vừa thử Elma's áo sơ mi, cảm thấy hơi chặt, bạn có thể cho tôi một chiếc XEl?",
        "keywords": [
          "我很",
          "济了"
        ],
        "blankIndices": [
          0,
          8,
          15
        ]
      },
      {
        "id": 62,
        "startTime": 243.636,
        "endTime": 244.636,
        "hanzi": "二的吗?",
        "pinyin": "m a de ma ?",
        "meaning": "Mà của nó?",
        "keywords": [
          "二的"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 63,
        "startTime": 245.576,
        "endTime": 250.616,
        "hanzi": "好的,我马上拿一件浅蓝色XL码的衬衫给你,",
        "pinyin": "hǎo de , wǒ mǎ shàng ná yí jiàn qiǎn lán sè X L mǎ de chèn shān gěi nǐ ,",
        "meaning": "Được rồi, tôi sẽ lấy cho bạn chiếc áo XL màu xanh nhạt ngay.",
        "keywords": [
          "好的",
          "我马"
        ],
        "blankIndices": [
          0,
          8,
          16
        ]
      },
      {
        "id": 64,
        "startTime": 250.616,
        "endTime": 254.496,
        "hanzi": "很多顾客也会选大一点的穿着更舒服。",
        "pinyin": "hěn duō gù kè yě huì xuǎn dà yì diǎn de chuān zhe gèng shū fú 。",
        "meaning": "Nhiều khách hàng cũng sẽ chọn những chiếc lớn hơn để thoải mái hơn.",
        "keywords": [
          "很多",
          "顾客"
        ],
        "blankIndices": [
          0,
          8,
          15
        ]
      },
      {
        "id": 65,
        "startTime": 255.336,
        "endTime": 258.936,
        "hanzi": "对的,因为上班一整天需要舒适,",
        "pinyin": "duì de , yīn wèi shàng bān yì zhěng tiān xū yào shū shì ,",
        "meaning": "Có, vì bạn cần được thoải mái sau khi làm việc cả ngày,",
        "keywords": [
          "对的",
          "因为"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 66,
        "startTime": 258.936,
        "endTime": 261.156,
        "hanzi": "如果太紧就会不舒服,",
        "pinyin": "rú guǒ tài jǐn jiù huì bù shū fú ,",
        "meaning": "Nếu chật quá sẽ gây khó chịu.",
        "keywords": [
          "如果",
          "太紧"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 67,
        "startTime": 261.156,
        "endTime": 262.772,
        "hanzi": "尤其是天气热的时候。",
        "pinyin": "yóu qí shì tiān qì rè de shí hòu 。",
        "meaning": "Đặc biệt là khi thời tiết nóng bức.",
        "keywords": [
          "尤其",
          "是天"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 68,
        "startTime": 264.592,
        "endTime": 268.432,
        "hanzi": "好的,你试试看这件XL码的,",
        "pinyin": "hǎo de , nǐ shì shì kàn zhè jiàn X L mǎ de ,",
        "meaning": "Được rồi, bạn có thể thử cỡ XL này.",
        "keywords": [
          "好的",
          "你试"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 69,
        "startTime": 268.432,
        "endTime": 271.172,
        "hanzi": "这种棉质面料有一点弹性,",
        "pinyin": "zhè zhǒng mián zhì miàn liào yǒu yì diǎn tán xìng ,",
        "meaning": "Chất vải cotton này co giãn nhẹ",
        "keywords": [
          "这种",
          "棉质"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 70,
        "startTime": 271.172,
        "endTime": 273.892,
        "hanzi": "穿起来很轻松,不会觉得舒服。",
        "pinyin": "chuān qǐ lái hěn qīng sōng , bú huì jué de shū fú 。",
        "meaning": "Thật dễ dàng để mặc mà không cảm thấy khó chịu.",
        "keywords": [
          "穿起",
          "来很"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 71,
        "startTime": 275.292,
        "endTime": 278.392,
        "hanzi": "哦,这个码数确实更合适,",
        "pinyin": "ò , zhè ge mǎ shù què shí gèng hé shì ,",
        "meaning": "Ồ, mã số này quả thực phù hợp hơn,",
        "keywords": [
          "哦这",
          "个码"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 72,
        "startTime": 278.392,
        "endTime": 282.972,
        "hanzi": "我觉得就选这个,现在我再试试那双深棕色的皮鞋。",
        "pinyin": "wǒ jué de jiù xuǎn zhè ge , xiàn zài wǒ zài shì shì nà shuāng shēn zōng sè de pí xié 。",
        "meaning": "Tôi nghĩ tôi sẽ chọn cái này. Bây giờ tôi sẽ thử đôi giày da màu nâu sẫm.",
        "keywords": [
          "我觉",
          "得就"
        ],
        "blankIndices": [
          0,
          10,
          20
        ]
      },
      {
        "id": 73,
        "startTime": 284.472,
        "endTime": 285.712,
        "hanzi": "你可以试穿一下",
        "pinyin": "nǐ kě yǐ shì chuān yí xià",
        "meaning": "bạn có thể thử nó",
        "keywords": [
          "你可",
          "以试"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 74,
        "startTime": 286.252,
        "endTime": 293.092,
        "hanzi": "这双鞋的鞋底是高级橡胶做的防滑耐磨很适合经常走动的人",
        "pinyin": "zhè shuāng xié de xié dǐ shì gāo jí xiàng jiāo zuò de fáng huá nài mó hěn shì hé jīng cháng zǒu dòng de rén",
        "meaning": "Đế của đôi giày này được làm bằng cao su cao cấp, có khả năng chống trơn trượt và chống mài mòn nên phù hợp với những người phải di chuyển nhiều.",
        "keywords": [
          "这双",
          "鞋的"
        ],
        "blankIndices": [
          0,
          13,
          25
        ]
      },
      {
        "id": 75,
        "startTime": 294.252,
        "endTime": 301.092,
        "hanzi": "我试过了穿起来真的很舒服和你说的一样不硬很合脚我挺满",
        "pinyin": "wǒ shì guò le chuān qǐ lái zhēn de hěn shū fú hé nǐ shuō de yí yàng bú yìng hěn hé jiǎo wǒ tǐng mǎn",
        "meaning": "Tôi đã thử nó và nó thực sự thoải mái. Nó giống như những gì bạn đã nói. Nó không khó và vừa vặn. Tôi khá hài lòng.",
        "keywords": [
          "我试",
          "过了"
        ],
        "blankIndices": [
          0,
          13,
          25
        ]
      },
      {
        "id": 76,
        "startTime": 301.092,
        "endTime": 301.872,
        "hanzi": "意这双鞋",
        "pinyin": "yì zhè shuāng xié",
        "meaning": "Yêu những đôi giày này",
        "keywords": [
          "意这",
          "双鞋"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 77,
        "startTime": 303.272,
        "endTime": 309.652,
        "hanzi": "太好了这样衬衫和鞋子你都满意了要不要我再给你配一条棕",
        "pinyin": "tài hǎo le zhè yàng chèn shān hé xié zǐ nǐ dōu mǎn yì le yào bu yào wǒ zài gěi nǐ pèi yì tiáo zōng",
        "meaning": "Tuyệt vời. Bây giờ bạn đã hài lòng với áo sơ mi và giày rồi, bạn có muốn tôi kết hợp cho bạn một đôi màu nâu không?",
        "keywords": [
          "太好",
          "了这"
        ],
        "blankIndices": [
          0,
          13,
          25
        ]
      },
      {
        "id": 78,
        "startTime": 309.652,
        "endTime": 310.472,
        "hanzi": "色的皮带",
        "pinyin": "sè de pí dài",
        "meaning": "thắt lưng màu",
        "keywords": [
          "色的",
          "皮带"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 79,
        "startTime": 311.052,
        "endTime": 312.572,
        "hanzi": "让整体更协调",
        "pinyin": "ràng zhěng tǐ gèng xié tiáo",
        "meaning": "Làm cho tổng thể thống nhất hơn",
        "keywords": [
          "让整",
          "体更"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 80,
        "startTime": 313.992,
        "endTime": 319.092,
        "hanzi": "我觉得应该买一条,因为和鞋子一个颜色的皮带更方便,",
        "pinyin": "wǒ jué de yīng gāi mǎi yì tiáo , yīn wèi hé xié zǐ yí gè yán sè de pí dài gèng fāng biàn ,",
        "meaning": "Mình nghĩ nên mua một cái, vì sẽ tiện hơn khi đeo thắt lưng cùng màu với giày.",
        "keywords": [
          "我觉",
          "得应"
        ],
        "blankIndices": [
          0,
          11,
          22
        ]
      },
      {
        "id": 81,
        "startTime": 319.092,
        "endTime": 320.552,
        "hanzi": "在前不用内很后日间搜索",
        "pinyin": "yǐ hòu bú yòng zài huā shí jiān zhǎo",
        "meaning": "Sau này không cần phải tìm kiếm nữa",
        "keywords": [
          "在前",
          "不用"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 82,
        "startTime": 321.912,
        "endTime": 326.452,
        "hanzi": "好的,我去给你拿一条棕色真皮皮带,",
        "pinyin": "hǎo de , wǒ qù gěi nǐ ná yì tiáo zōng sè zhēn pí pí dài ,",
        "meaning": "Được rồi, tôi sẽ lấy cho bạn một chiếc thắt lưng da màu nâu,",
        "keywords": [
          "好的",
          "我去"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 83,
        "startTime": 326.452,
        "endTime": 329.812,
        "hanzi": "款式简洁,金属扣防生锈,",
        "pinyin": "kuǎn shì jiǎn jié , jīn shǔ kòu fáng shēng xiù ,",
        "meaning": "Kiểu dáng đơn giản, khóa kim loại chống gỉ,",
        "keywords": [
          "款式",
          "简洁"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 84,
        "startTime": 329.812,
        "endTime": 330.512,
        "hanzi": "很坚实",
        "pinyin": "hěn jiān shí",
        "meaning": "Rất chắc chắn",
        "keywords": [
          "很坚"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 85,
        "startTime": 331.872,
        "endTime": 336.832,
        "hanzi": "不错,我就要这套,那请问最后算上所有优惠之后,",
        "pinyin": "bú cuò , wǒ jiù yào zhè tào , nà qǐng wèn zuì hòu suàn shàng suǒ yǒu yōu huì zhī hòu ,",
        "meaning": "Vâng, tôi muốn bộ này. Sau khi đếm tất cả các khoản giảm giá, tôi nên làm gì?",
        "keywords": [
          "不错",
          "我就"
        ],
        "blankIndices": [
          0,
          10,
          19
        ]
      },
      {
        "id": 86,
        "startTime": 336.852,
        "endTime": 337.792,
        "hanzi": "共是多少钱?",
        "pinyin": "gòng shì duō shǎo qián ?",
        "meaning": "Tổng cộng là bao nhiêu?",
        "keywords": [
          "共是",
          "多少"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 87,
        "startTime": 339.132,
        "endTime": 342.252,
        "hanzi": "我给你算一下,衬衫五百多,",
        "pinyin": "wǒ gěi nǐ suàn yí xià , chèn shān wǔ bǎi duō ,",
        "meaning": "Để tôi tính toán cho bạn nhé, có hơn năm trăm chiếc áo sơ mi.",
        "keywords": [
          "我给",
          "你算"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 88,
        "startTime": 342.252,
        "endTime": 345.012,
        "hanzi": "皮鞋打折后一千二左右,",
        "pinyin": "pí xié dǎ zhé hòu yì qiān èr zuǒ yòu ,",
        "meaning": "Giày da có giá khoảng 1.200 nhân dân tệ sau khi giảm giá.",
        "keywords": [
          "皮鞋",
          "打折"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 89,
        "startTime": 345.012,
        "endTime": 348.652,
        "hanzi": "皮带打折后五百,总共两千二百多",
        "pinyin": "pí dài dǎ zhé hòu wǔ bǎi , zǒng gòng liǎng qiān èr bǎi duō",
        "meaning": "Sau khi giảm giá đai còn 500, tổng cộng hơn 2.200.",
        "keywords": [
          "皮带",
          "打折"
        ],
        "blankIndices": [
          0,
          7,
          13
        ]
      },
      {
        "id": 90,
        "startTime": 349.892,
        "endTime": 353.532,
        "hanzi": "这个价格对一整套上班服来说很合理,",
        "pinyin": "zhè ge jià gé duì yì zhěng tào shàng bān fú lái shuō hěn hé lǐ ,",
        "meaning": "Giá cả rất hợp lý cho một bộ quần áo đi làm hoàn chỉnh.",
        "keywords": [
          "这个",
          "价格"
        ],
        "blankIndices": [
          0,
          8,
          15
        ]
      },
      {
        "id": 91,
        "startTime": 353.532,
        "endTime": 355.792,
        "hanzi": "我就直接付款,省得再犹豫",
        "pinyin": "wǒ jiù zhí jiē fù kuǎn , shěng de zài yóu yù",
        "meaning": "Tôi sẽ thanh toán trực tiếp để tránh bất kỳ sự do dự nào nữa.",
        "keywords": [
          "我就",
          "直接"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 92,
        "startTime": 357.072,
        "endTime": 360.732,
        "hanzi": "谢谢你信任我们,今天购物满两千,",
        "pinyin": "xiè xiè nǐ xìn rèn wǒ men , jīn tiān gòu wù mǎn liǎng qiān ,",
        "meaning": "Cảm ơn bạn đã tin tưởng chúng tôi và mua sắm trên 2.000 RMB ngay hôm nay,",
        "keywords": [
          "谢谢",
          "你信"
        ],
        "blankIndices": [
          0,
          7,
          13
        ]
      },
      {
        "id": 93,
        "startTime": 360.732,
        "endTime": 363.392,
        "hanzi": "还会赠送一双高级袜子,",
        "pinyin": "hái huì zèng sòng yì shuāng gāo jí wà zi ,",
        "meaning": "Ngoài ra còn được tặng một đôi tất cao cấp.",
        "keywords": [
          "还会",
          "赠送"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 94,
        "startTime": 363.392,
        "endTime": 364.372,
        "hanzi": "算是小礼物",
        "pinyin": "suàn shì xiǎo lǐ wù",
        "meaning": "Đó là một món quà nhỏ",
        "keywords": [
          "算是",
          "小礼"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 95,
        "startTime": 365.792,
        "endTime": 368.912,
        "hanzi": "哦,还有礼物,那更好了,",
        "pinyin": "ò , hái yǒu lǐ wù , nà gèng hǎo le ,",
        "meaning": "Ồ, lại còn có quà nữa, càng tuyệt vời hơn,",
        "keywords": [
          "哦还",
          "有礼"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 96,
        "startTime": 368.912,
        "endTime": 371.972,
        "hanzi": "袜子配皮鞋正合适,谢谢你们的贴心",
        "pinyin": "wà zi pèi pí xié zhèng hé shì , xiè xiè nǐ men de tiē xīn",
        "meaning": "Tất rất hợp với giày da, cảm ơn sự chu đáo của bạn",
        "keywords": [
          "袜子",
          "配皮"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 97,
        "startTime": 373.272,
        "endTime": 378.372,
        "hanzi": "不客气,我们一直希望顾客有愉快的购物体验,",
        "pinyin": "bú kè qì , wǒ men yì zhí xī wàng gù kè yǒu yú kuài de gòu wù tǐ yàn ,",
        "meaning": "Không có gì, chúng tôi luôn hy vọng khách hàng có trải nghiệm mua sắm thú vị,",
        "keywords": [
          "不客",
          "气我"
        ],
        "blankIndices": [
          0,
          9,
          18
        ]
      },
      {
        "id": 98,
        "startTime": 378.372,
        "endTime": 380.972,
        "hanzi": "你还想看看其他商品吗?",
        "pinyin": "nǐ hái xiǎng kàn kàn qí tā shāng pǐn ma ?",
        "meaning": "Bạn có muốn xem các sản phẩm khác?",
        "keywords": [
          "你还",
          "想看"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 99,
        "startTime": 381.932,
        "endTime": 386.212,
        "hanzi": "我觉得今天买这些就够了,买太多也不好带回去,",
        "pinyin": "wǒ jué de jīn tiān mǎi zhè xiē jiù gòu le , mǎi tài duō yě bù hǎo dài huí qù ,",
        "meaning": "Tôi nghĩ những điều này là đủ cho ngày hôm nay. Nếu bạn mua quá nhiều, bạn sẽ không thể lấy lại được.",
        "keywords": [
          "我觉",
          "得今"
        ],
        "blankIndices": [
          0,
          10,
          19
        ]
      },
      {
        "id": 100,
        "startTime": 386.212,
        "endTime": 387.432,
        "hanzi": "下次我再过来看看",
        "pinyin": "xià cì wǒ zài guò lái kàn kàn",
        "meaning": "Lần sau tôi sẽ qua xem",
        "keywords": [
          "下次",
          "我再"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 101,
        "startTime": 388.892,
        "endTime": 395.788,
        "hanzi": "好的,那我去开收据并把商品仔细包装好你要用现金还是银",
        "pinyin": "hǎo de , nà wǒ qù kāi shōu jù bìng bǎ shāng pǐn zǐ xì bāo zhuāng hǎo nǐ yào yòng xiàn jīn hái shì yín",
        "meaning": "Được rồi tôi sẽ xuất biên lai và đóng gói hàng hóa cẩn thận. Bạn muốn thanh toán bằng tiền mặt hay bạc?",
        "keywords": [
          "好的",
          "那我"
        ],
        "blankIndices": [
          0,
          12,
          24
        ]
      },
      {
        "id": 102,
        "startTime": 395.788,
        "endTime": 396.548,
        "hanzi": "行卡支付?",
        "pinyin": "xíng kǎ zhī fù ?",
        "meaning": "Thanh toán bằng thẻ?",
        "keywords": [
          "行卡",
          "支付"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 103,
        "startTime": 397.928,
        "endTime": 401.088,
        "hanzi": "我用信用卡支付,因为比较方便,",
        "pinyin": "wǒ yòng xìn yòng kǎ zhī fù , yīn wèi bǐ jiào fāng biàn ,",
        "meaning": "Tôi thanh toán bằng thẻ tín dụng vì nó thuận tiện hơn.",
        "keywords": [
          "我用",
          "信用"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 104,
        "startTime": 401.088,
        "endTime": 404.488,
        "hanzi": "还可以累积积分,银行也有优惠活动。",
        "pinyin": "hái kě yǐ lěi jī jī fēn , yín háng yě yǒu yōu huì huó dòng 。",
        "meaning": "Bạn cũng có thể tích lũy điểm và ngân hàng cũng có chương trình giảm giá.",
        "keywords": [
          "还可",
          "以累"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 105,
        "startTime": 405.328,
        "endTime": 408.228,
        "hanzi": "好的,请到收银台刷卡,",
        "pinyin": "hǎo de , qǐng dào shōu yín tái shuā kǎ ,",
        "meaning": "Được rồi, vui lòng đến quầy thu ngân và quẹt thẻ.",
        "keywords": [
          "好的",
          "请到"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 106,
        "startTime": 408.228,
        "endTime": 411.508,
        "hanzi": "我们也支持三期分期付款,",
        "pinyin": "wǒ men yě zhī chí sān qī fēn qī fù kuǎn ,",
        "meaning": "Chúng tôi cũng hỗ trợ thanh toán trả góp ba lần,",
        "keywords": [
          "我们",
          "也支"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 107,
        "startTime": 411.508,
        "endTime": 412.608,
        "hanzi": "如果你需要的话。",
        "pinyin": "rú guǒ nǐ xū yào de huà 。",
        "meaning": "nếu bạn cần.",
        "keywords": [
          "如果",
          "你需"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 108,
        "startTime": 414.068,
        "endTime": 417.768,
        "hanzi": "分期就不用了,这个金额我已经准备好了,",
        "pinyin": "fēn qī jiù bú yòng le , zhè ge jīn é wǒ yǐ jīng zhǔn bèi hǎo le ,",
        "meaning": "Không cần phải trả góp, số tiền này tôi đã chuẩn bị sẵn rồi.",
        "keywords": [
          "分期",
          "就不"
        ],
        "blankIndices": [
          0,
          8,
          16
        ]
      },
      {
        "id": 109,
        "startTime": 417.768,
        "endTime": 419.708,
        "hanzi": "一次性付清比较省事。",
        "pinyin": "yí cì xìng fù qīng bǐ jiào shěng shì 。",
        "meaning": "Việc thanh toán một lần sẽ dễ dàng hơn.",
        "keywords": [
          "一次",
          "性付"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 110,
        "startTime": 420.988,
        "endTime": 423.428,
        "hanzi": "好的,这是你的账单,",
        "pinyin": "hǎo de , zhè shì nǐ de zhàng dān ,",
        "meaning": "Được rồi, đây là hóa đơn của bạn,",
        "keywords": [
          "好的",
          "这是"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 111,
        "startTime": 423.428,
        "endTime": 426.568,
        "hanzi": "请你先确认一下信息和金额,",
        "pinyin": "qǐng nǐ xiān què rèn yí xià xìn xī hé jīn é ,",
        "meaning": "Vui lòng xác nhận thông tin và số tiền trước.",
        "keywords": [
          "请你",
          "先确"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 112,
        "startTime": 426.568,
        "endTime": 427.868,
        "hanzi": "然后签字确认",
        "pinyin": "rán hòu qiān zì què rèn",
        "meaning": "Sau đó ký tên để xác nhận",
        "keywords": [
          "然后",
          "签字"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 113,
        "startTime": 428.968,
        "endTime": 432.268,
        "hanzi": "我已经核对过了,所有信息都没问题,",
        "pinyin": "wǒ yǐ jīng hé duì guò le , suǒ yǒu xìn xī dōu méi wèn tí ,",
        "meaning": "Tôi đã kiểm tra và tất cả thông tin đều chính xác.",
        "keywords": [
          "我已",
          "经核"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 114,
        "startTime": 432.268,
        "endTime": 433.148,
        "hanzi": "我现在签字",
        "pinyin": "wǒ xiàn zài qiān zì",
        "meaning": "Tôi ký ngay bây giờ",
        "keywords": [
          "我现",
          "在签"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 115,
        "startTime": 434.648,
        "endTime": 437.988,
        "hanzi": "谢谢你,这是你打包好的商品,",
        "pinyin": "xiè xiè nǐ , zhè shì nǐ dǎ bāo hǎo de shāng pǐn ,",
        "meaning": "Cảm ơn bạn, đây là sản phẩm đóng gói của bạn,",
        "keywords": [
          "谢谢",
          "你这"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 116,
        "startTime": 437.988,
        "endTime": 440.388,
        "hanzi": "里面还有皮的保修卡,",
        "pinyin": "lǐ miàn hái yǒu pí de bǎo xiū kǎ ,",
        "meaning": "Bên trong còn có phiếu bảo hành da.",
        "keywords": [
          "里面",
          "还有"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 117,
        "startTime": 440.388,
        "endTime": 441.648,
        "hanzi": "请妥保管",
        "pinyin": "qǐng tuǒ bǎo guǎn",
        "meaning": "Xin hãy giữ nó an toàn",
        "keywords": [
          "请妥",
          "保管"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 118,
        "startTime": 443.008,
        "endTime": 446.068,
        "hanzi": "谢谢你,我觉得你们的服很专业,",
        "pinyin": "xiè xiè nǐ , wǒ jué de nǐ men de fú hěn zhuān yè ,",
        "meaning": "Cảm ơn. Tôi nghĩ dịch vụ của bạn rất chuyên nghiệp.",
        "keywords": [
          "谢谢",
          "你我"
        ],
        "blankIndices": [
          0,
          6,
          12
        ]
      },
      {
        "id": 119,
        "startTime": 446.068,
        "endTime": 447.768,
        "hanzi": "下次我一定还会再来买",
        "pinyin": "xià cì wǒ yí dìng hái huì zài lái mǎi",
        "meaning": "Chắc chắn lần sau tôi sẽ mua lại",
        "keywords": [
          "下次",
          "我一"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 120,
        "startTime": 448.988,
        "endTime": 455.348,
        "hanzi": "我们很荣幸为你服务希望今天选的商品能让你每天工作更轻",
        "pinyin": "wǒ men hěn róng xìng wèi nǐ fú wù xī wàng jīn tiān xuǎn de shāng pǐn néng ràng nǐ měi tiān gōng zuò gèng qīng",
        "meaning": "Chúng tôi rất vinh dự được phục vụ bạn. Chúng tôi hy vọng những mục bạn chọn hôm nay sẽ giúp công việc của bạn mỗi ngày dễ dàng hơn.",
        "keywords": [
          "我们",
          "很荣"
        ],
        "blankIndices": [
          0,
          13,
          25
        ]
      },
      {
        "id": 121,
        "startTime": 455.348,
        "endTime": 455.488,
        "hanzi": "明",
        "pinyin": "sōng",
        "meaning": "Sịnh",
        "keywords": [
          "明"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 122,
        "startTime": 456.908,
        "endTime": 462.808,
        "hanzi": "我相信一定会的款式和材质都很满意再次感谢你们的热心帮",
        "pinyin": "wǒ xiāng xìn yí dìng huì de kuǎn shì hé cái zhì dōu hěn mǎn yì zài cì gǎn xiè nǐ men de rè xīn bāng",
        "meaning": "Tôi tin mình sẽ rất hài lòng về kiểu dáng cũng như chất liệu. Một lần nữa xin cảm ơn sự giúp đỡ nhiệt tình của bạn.",
        "keywords": [
          "我相",
          "信一"
        ],
        "blankIndices": [
          0,
          13,
          25
        ]
      },
      {
        "id": 123,
        "startTime": 462.808,
        "endTime": 462.968,
        "hanzi": "助",
        "pinyin": "zhù",
        "meaning": "giúp đỡ",
        "keywords": [
          "助"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 124,
        "startTime": 464.048,
        "endTime": 470.168,
        "hanzi": "不客气祝你今天过得愉快如果有需要可以拨打账单上的客服",
        "pinyin": "bú kè qì zhù nǐ jīn tiān guò dé yú kuài rú guǒ yǒu xū yào kě yǐ bō dǎ zhàng dān shàng de kè fú",
        "meaning": "Không có gì. Tôi hy vọng bạn có một ngày tốt đẹp. Nếu bạn cần bất cứ điều gì, bạn có thể gọi dịch vụ khách hàng trên hóa đơn.",
        "keywords": [
          "不客",
          "气祝"
        ],
        "blankIndices": [
          0,
          13,
          25
        ]
      },
      {
        "id": 125,
        "startTime": 470.168,
        "endTime": 470.628,
        "hanzi": "电话",
        "pinyin": "diàn huà",
        "meaning": "Điện thoại",
        "keywords": [
          "电话"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 126,
        "startTime": 471.728,
        "endTime": 477.948,
        "hanzi": "好的我会保存的再见下次见希望还有更多更漂亮的新款",
        "pinyin": "hǎo de wǒ huì bǎo cún de zài jiàn xià cì jiàn xī wàng hái yǒu gèng duō gēng piào liang de xīn kuǎn",
        "meaning": "Được rồi, tôi sẽ lưu nó. Hẹn gặp lại lần sau. Hi vọng sẽ có thêm nhiều mẫu mới đẹp.",
        "keywords": [
          "好的",
          "我会"
        ],
        "blankIndices": [
          0,
          12,
          23
        ]
      },
      {
        "id": 127,
        "startTime": 479.928,
        "endTime": 486.488,
        "hanzi": "再见祝你一路顺风带着今天挑选的商品有个愉快的心情",
        "pinyin": "zài jiàn zhù nǐ yí lù shùn fēng dài zhe jīn tiān tiāo xuǎn de shāng pǐn yǒu gè yú kuài de xīn qíng",
        "meaning": "Tạm biệt, chúc bạn một chuyến đi an toàn và tâm trạng vui vẻ với những sản phẩm bạn đã chọn ngày hôm nay.",
        "keywords": [
          "再见",
          "祝你"
        ],
        "blankIndices": [
          0,
          12,
          23
        ]
      },
      {
        "id": 128,
        "startTime": 506.748,
        "endTime": 511.568,
        "hanzi": "请",
        "pinyin": "qǐng",
        "meaning": "Xin vui lòng",
        "keywords": [
          "请"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 129,
        "startTime": 511.568,
        "endTime": 516.888,
        "hanzi": "不赞",
        "pinyin": "bú zàn",
        "meaning": "Không thích",
        "keywords": [
          "不赞"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 130,
        "startTime": 517.648,
        "endTime": 518.048,
        "hanzi": "阅",
        "pinyin": "yuè",
        "meaning": "đọc",
        "keywords": [
          "阅"
        ],
        "blankIndices": [
          0
        ]
      }
    ]
  },
  {
    "id": "dict_lesson_5",
    "youtubeId": "5eF8oOWtsk4",
    "title": "Điềm Mật Mật (甜蜜蜜 - Tian Mi Mi) | Đặng Lệ Quân",
    "category": "Âm Nhạc",
    "level": "2",
    "levelText": "HSK 2",
    "description": "Giai điệu ngọt ngào kinh điển giúp rèn luyện khả năng bắt chữ và nắm bắt thanh điệu tiếng Trung.",
    "duration": "03:19",
    "thumbnail": "https://img.youtube.com/vi/5eF8oOWtsk4/hqdefault.jpg",
    "sentences": [
      {
        "id": 1,
        "startTime": 30,
        "endTime": 30.8,
        "hanzi": "在三中",
        "pinyin": "zài sān zhōng",
        "meaning": "Trong đó",
        "keywords": [
          "在三"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 2,
        "startTime": 33.98,
        "endTime": 36.4,
        "hanzi": "在一中为不得",
        "pinyin": "zài yì zhōng wèi bù dé",
        "meaning": "Ở đâu",
        "keywords": [
          "在一",
          "中为"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 3,
        "startTime": 37.44,
        "endTime": 40.32,
        "hanzi": "在一中为不得确会你",
        "pinyin": "zài yì zhōng wèi bù dé què huì nǐ",
        "meaning": "Ở đâu từng thấy bạn",
        "keywords": [
          "在一",
          "中为"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 4,
        "startTime": 41.68,
        "endTime": 45.74,
        "hanzi": "你的喜歡增为得组",
        "pinyin": "nǐ de xǐ huān zēng wèi dé zǔ",
        "meaning": "Mỉm cười của bạn như quen thuộc",
        "keywords": [
          "你的",
          "喜歡"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 5,
        "startTime": 46.86,
        "endTime": 49.42,
        "hanzi": "我一间压不得一",
        "pinyin": "wǒ yì jiān yā bù dé yī",
        "meaning": "Tôi một lúc không nhớ",
        "keywords": [
          "我一",
          "间压"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 6,
        "startTime": 52.92,
        "endTime": 56.96,
        "hanzi": "好在得三中",
        "pinyin": "hǎo zài dé sān zhōng",
        "meaning": "À trong mơ",
        "keywords": [
          "好在",
          "得三"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 7,
        "startTime": 60.44,
        "endTime": 65.3,
        "hanzi": "得三中得三中确会你",
        "pinyin": "dé sān zhōng dé sān zhōng què huì nǐ",
        "meaning": "Trong mơ trong mơ từng thấy bạn",
        "keywords": [
          "得三",
          "中得"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 8,
        "startTime": 67.9,
        "endTime": 72.4,
        "hanzi": "美得喜歡得组得组",
        "pinyin": "měi dé xǐ huān dé zǔ dé zǔ",
        "meaning": "Mỉm cười ngọt ngào",
        "keywords": [
          "美得",
          "喜歡"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 9,
        "startTime": 75.06,
        "endTime": 77.92,
        "hanzi": "是你是你",
        "pinyin": "shì nǐ shì nǐ",
        "meaning": "Là bạn là bạn",
        "keywords": [
          "是你",
          "是你"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 10,
        "startTime": 78.84,
        "endTime": 81.8,
        "hanzi": "得确会的是你",
        "pinyin": "dé què huì de shì nǐ",
        "meaning": "Trong mơ thấy bạn",
        "keywords": [
          "得确",
          "会的"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 11,
        "startTime": 83.16,
        "endTime": 89.24,
        "hanzi": "在一中为一中确会你",
        "pinyin": "zài yì zhōng wèi yì zhōng què huì nǐ",
        "meaning": "Ở đâu ở đâu từng thấy bạn",
        "keywords": [
          "在一",
          "中为"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 12,
        "startTime": 89.88,
        "endTime": 94.74,
        "hanzi": "你的喜歡增为得组",
        "pinyin": "nǐ de xǐ huān zēng wèi dé zǔ",
        "meaning": "Mỉm cười của bạn như quen thuộc",
        "keywords": [
          "你的",
          "喜歡"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 13,
        "startTime": 95.8,
        "endTime": 98.44,
        "hanzi": "我一间压不得一",
        "pinyin": "wǒ yì jiān yā bù dé yī",
        "meaning": "Tôi một lúc không nhớ",
        "keywords": [
          "我一",
          "间压"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 14,
        "startTime": 101.98,
        "endTime": 106.075,
        "hanzi": "好在得三中",
        "pinyin": "hǎo zài dé sān zhōng",
        "meaning": "À trong mơ",
        "keywords": [
          "好在",
          "得三"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 15,
        "startTime": 127.855,
        "endTime": 130.475,
        "hanzi": "在一中为不得",
        "pinyin": "zài yì zhōng wèi bù dé",
        "meaning": "Ở đâu",
        "keywords": [
          "在一",
          "中为"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 16,
        "startTime": 131.415,
        "endTime": 134.495,
        "hanzi": "在一中为不得确会你",
        "pinyin": "zài yì zhōng wèi bù dé què huì nǐ",
        "meaning": "Ở đâu từng thấy bạn",
        "keywords": [
          "在一",
          "中为"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 17,
        "startTime": 135.735,
        "endTime": 139.755,
        "hanzi": "你的喜歡增为得组",
        "pinyin": "nǐ de xǐ huān zēng wèi dé zǔ",
        "meaning": "Mỉm cười của bạn như quen thuộc",
        "keywords": [
          "你的",
          "喜歡"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 18,
        "startTime": 140.835,
        "endTime": 143.395,
        "hanzi": "我一间压不得一",
        "pinyin": "wǒ yì jiān yā bù dé yī",
        "meaning": "Tôi một lúc không nhớ",
        "keywords": [
          "我一",
          "间压"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 19,
        "startTime": 146.935,
        "endTime": 151.035,
        "hanzi": "好在得三中",
        "pinyin": "hǎo zài dé sān zhōng",
        "meaning": "À trong mơ",
        "keywords": [
          "好在",
          "得三"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 20,
        "startTime": 154.275,
        "endTime": 158.775,
        "hanzi": "得三中得三中确会你",
        "pinyin": "dé sān zhōng dé sān zhōng què huì nǐ",
        "meaning": "Trong mơ trong mơ từng thấy bạn",
        "keywords": [
          "得三",
          "中得"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 21,
        "startTime": 161.895,
        "endTime": 166.335,
        "hanzi": "美得喜歡得组得组",
        "pinyin": "měi dé xǐ huān dé zǔ dé zǔ",
        "meaning": "Mỉm cười ngọt ngào",
        "keywords": [
          "美得",
          "喜歡"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 22,
        "startTime": 168.815,
        "endTime": 171.715,
        "hanzi": "是你是你",
        "pinyin": "shì nǐ shì nǐ",
        "meaning": "Là bạn là bạn",
        "keywords": [
          "是你",
          "是你"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 23,
        "startTime": 172.695,
        "endTime": 175.995,
        "hanzi": "得确会的是你",
        "pinyin": "dé què huì de shì nǐ",
        "meaning": "Trong mơ thấy bạn",
        "keywords": [
          "得确",
          "会的"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 24,
        "startTime": 176.895,
        "endTime": 183.095,
        "hanzi": "在一中为一中确会你",
        "pinyin": "zài yì zhōng wèi yì zhōng què huì nǐ",
        "meaning": "Ở đâu ở đâu từng thấy bạn",
        "keywords": [
          "在一",
          "中为"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 25,
        "startTime": 184.515,
        "endTime": 188.475,
        "hanzi": "你的喜歡增为得组",
        "pinyin": "nǐ de xǐ huān zēng wèi dé zǔ",
        "meaning": "Mỉm cười của bạn như quen thuộc",
        "keywords": [
          "你的",
          "喜歡"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 26,
        "startTime": 189.475,
        "endTime": 192.195,
        "hanzi": "我一间压不得一",
        "pinyin": "wǒ yì jiān yā bù dé yī",
        "meaning": "Tôi một lúc không nhớ",
        "keywords": [
          "我一",
          "间压"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 27,
        "startTime": 195.695,
        "endTime": 199.815,
        "hanzi": "得三中",
        "pinyin": "dé sān zhōng",
        "meaning": "À trong mơ",
        "keywords": [
          "得三"
        ],
        "blankIndices": [
          0
        ]
      }
    ]
  },
  {
    "id": "dict_lesson_6",
    "youtubeId": "0MZIImblEHc",
    "title": "Luyện Nghe Phim Ảnh & Hội Thoại Đời Sống | HSK 4",
    "category": "Phim Ảnh",
    "level": "4",
    "levelText": "HSK 4",
    "description": "Đoạn hội thoại tình huống thực tế giúp nâng cao khả năng nghe ngấm và vốn từ ngữ biểu cảm.",
    "duration": "05:05",
    "thumbnail": "https://img.youtube.com/vi/0MZIImblEHc/hqdefault.jpg",
    "sentences": [
      {
        "id": 1,
        "startTime": 0,
        "endTime": 0.48,
        "hanzi": "在",
        "pinyin": "wèi",
        "meaning": "về",
        "keywords": [
          "在"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 2,
        "startTime": 0.48,
        "endTime": 7.8,
        "hanzi": "李",
        "pinyin": "lì",
        "meaning": "lề",
        "keywords": [
          "李"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 3,
        "startTime": 7.8,
        "endTime": 13.54,
        "hanzi": "cácbạnđãđếnvớikênhChineseSkate.",
        "pinyin": "c á c b ạ n đ ã đ ế n v ớ i k ê n h C h i n e s e S k a t e .",
        "meaning": "các bạn đã đếnvớikênh ChineseSkate.",
        "keywords": [
          "c"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 4,
        "startTime": 14.12,
        "endTime": 15.6,
        "hanzi": "hômnaychúngtasẽcùngnhauđihọc",
        "pinyin": "h ô m n a y c h ú n g t a s ẽ c ù n g n h a u đ i h ọ c",
        "meaning": "hôm nay chúngta sẽ cùngnhauđi học",
        "keywords": [
          "h"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 5,
        "startTime": 15.6,
        "endTime": 17.38,
        "hanzi": "vềmộtchủđềvôcùngquenthuộctrong",
        "pinyin": "v ề m ộ t c h ủ đ ề v ô c ù n g q u e n t h u ộ c t r o n g",
        "meaning": "vềmộtchủđềvôcùngquenthuộctong",
        "keywords": [
          "v"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 6,
        "startTime": 17.38,
        "endTime": 19.6,
        "hanzi": "cuộcsống.làchủđềđiănnhàhàng.",
        "pinyin": "c u ộ c s ố n g . l à c h ủ đ ề đ i ă n n h à h à n g .",
        "meaning": "cuộcsống.là chủđềđiănnhàhàng.",
        "keywords": [
          "c"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 7,
        "startTime": 20.26,
        "endTime": 21.44,
        "hanzi": "Trướctiênchúngtahãycùngnhau",
        "pinyin": "T r ư ớ c t i ê n c h ú n g t a h ã y c ù n g n h a u",
        "meaning": "Trước chúng ta hãy cùngnhau",
        "keywords": [
          "T"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 8,
        "startTime": 21.44,
        "endTime": 22.72,
        "hanzi": "xemđoạnvideodướiđâynhé.",
        "pinyin": "x e m đ o ạ n v i d e o d ư ớ i đ â y n h é .",
        "meaning": "xemđoạnvideo dưới đâynhé.",
        "keywords": [
          "x"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 9,
        "startTime": 30,
        "endTime": 39.4,
        "hanzi": "Hãy",
        "pinyin": "H ã y",
        "meaning": "Please",
        "keywords": [
          "H"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 10,
        "startTime": 39.42,
        "endTime": 44.36,
        "hanzi": "kýđểkênhcủa",
        "pinyin": "k ý đ ể k ê n h c ủ a",
        "meaning": "ký tự của",
        "keywords": [
          "k"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 11,
        "startTime": 44.38,
        "endTime": 53.36,
        "hanzi": "nhé!",
        "pinyin": "n h é !",
        "meaning": "nhé!",
        "keywords": [
          "n"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 12,
        "startTime": 60,
        "endTime": 66.66,
        "hanzi": "Đượcrồi,",
        "pinyin": "Đ ư ợ c r ồ i ,",
        "meaning": "Đượcrồi,",
        "keywords": [
          "Đ"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 13,
        "startTime": 66.72,
        "endTime": 69.72,
        "hanzi": "tôiđãđểcácmộtcáibàn.Cảmơncác",
        "pinyin": "t ô i đ ã đ ể c á c m ộ t c á i b à n . C ả m ơ n c á c",
        "meaning": "tôi đã để một cáicáibàn.Cảmơncáccác",
        "keywords": [
          "t"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 14,
        "startTime": 69.74,
        "endTime": 70.16,
        "hanzi": "đãđigọi.",
        "pinyin": "đ ã đ i g ọ i .",
        "meaning": "đã đi thoại.",
        "keywords": [
          "đ"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 15,
        "startTime": 79.32,
        "endTime": 81.28,
        "hanzi": "Chúngtôiđãđịnhmộtvịtrí,tên",
        "pinyin": "C h ú n g t ô i đ ã đ ị n h m ộ t v ị t r í , t ê n",
        "meaning": "Chúng tôi đã xác định một vị trí,tên",
        "keywords": [
          "C"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 16,
        "startTime": 81.28,
        "endTime": 85.854,
        "hanzi": "là请不",
        "pinyin": "l à qǐng bù",
        "meaning": "là Làm ơn không",
        "keywords": [
          "请不"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 17,
        "startTime": 86.014,
        "endTime": 89.014,
        "hanzi": "发",
        "pinyin": "fā",
        "meaning": "tóc",
        "keywords": [
          "发"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 18,
        "startTime": 90.674,
        "endTime": 101.034,
        "hanzi": "支持",
        "pinyin": "zhī chí",
        "meaning": "ủng hộ",
        "keywords": [
          "支持"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 19,
        "startTime": 101.054,
        "endTime": 101.514,
        "hanzi": "镜目",
        "pinyin": "jìng mù",
        "meaning": "gương",
        "keywords": [
          "镜目"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 20,
        "startTime": 102.094,
        "endTime": 104.794,
        "hanzi": "你们这里有什么特色菜?",
        "pinyin": "nǐ men zhè lǐ yǒu shén me tè sè cài ?",
        "meaning": "Ở đây có món gì đặc biệt?",
        "keywords": [
          "你们",
          "这里"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 21,
        "startTime": 105.534,
        "endTime": 107.754,
        "hanzi": "北京美鬴是前园的名角。",
        "pinyin": "běi jīng kǎo yā shì zhè lǐ de míng cài 。",
        "meaning": "Bánh Ướp Bắc Kinh là món ăn nổi tiếng ở đây.",
        "keywords": [
          "北京",
          "美鬴"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 22,
        "startTime": 109.054,
        "endTime": 110.494,
        "hanzi": "吃一三美鬴是。",
        "pinyin": "nà jiù lái yì zhī kǎo yā 。",
        "meaning": "Vậy thì hãy cho tôi một con Ướp Bắc Kinh.",
        "keywords": [
          "吃一",
          "三美"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 23,
        "startTime": 111.574,
        "endTime": 113.294,
        "hanzi": "好。很上一不一事。",
        "pinyin": "hǎo de , hái yào shén me ma ?",
        "meaning": "Tốt, còn muốn gì nữa?",
        "keywords": [
          "好很",
          "上一"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 24,
        "startTime": 114.634,
        "endTime": 115.894,
        "hanzi": "重一七事尼小美尼。",
        "pinyin": "zài lái liǎng wǎn xiǎo mǐ zhōu 。",
        "meaning": "Vậy thì cho tôi thêm hai bát cháo gạo lứt.",
        "keywords": [
          "重一",
          "七事"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 25,
        "startTime": 117.574,
        "endTime": 119.294,
        "hanzi": "好。想上一事吃吃。",
        "pinyin": "hǎo , yào shén me yǐn liào ma ?",
        "meaning": "Tốt, muốn uống gì?",
        "keywords": [
          "好想",
          "上一"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 26,
        "startTime": 120.294,
        "endTime": 121.534,
        "hanzi": "我想一中苹果水。",
        "pinyin": "wǒ yào yì bēi píng guǒ zhī 。",
        "meaning": "Tôi muốn một cốc nước ép táo.",
        "keywords": [
          "我想",
          "一中"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 27,
        "startTime": 122.914,
        "endTime": 124.174,
        "hanzi": "我一中事尼。",
        "pinyin": "wǒ lái diǎn pí jiǔ bā 。",
        "meaning": "Tôi muốn một lon bia.",
        "keywords": [
          "我一",
          "中事"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 28,
        "startTime": 128.834,
        "endTime": 131.334,
        "hanzi": "你事的邮尼上一事。不要此用。",
        "pinyin": "nǐ men de cài shàng lái le , qǐng màn yòng 。",
        "meaning": "Món ăn của bạn đã đến, xin hãy thưởng thức.",
        "keywords": [
          "你事",
          "的邮"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 29,
        "startTime": 132.294,
        "endTime": 132.614,
        "hanzi": "想好。",
        "pinyin": "xiè xiè",
        "meaning": "Cảm ơn.",
        "keywords": [
          "想好"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 30,
        "startTime": 132.294,
        "endTime": 140.274,
        "hanzi": "你",
        "pinyin": "nǐ",
        "meaning": "Bạn",
        "keywords": [
          "你"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 31,
        "startTime": 140.274,
        "endTime": 141.914,
        "hanzi": "想不一事吃吃。",
        "pinyin": "jué de zhè lǐ de cài zěn me yàng",
        "meaning": "Bạn nghĩ món ăn ở đây như thế nào?",
        "keywords": [
          "想不",
          "一事"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 32,
        "startTime": 143.114,
        "endTime": 144.434,
        "hanzi": "我想一中事尼一中事吃吃。",
        "pinyin": "wǒ jué de fēi cháng kě kǒu",
        "meaning": "Tôi nghĩ rất ngon.",
        "keywords": [
          "我想",
          "一中"
        ],
        "blankIndices": [
          0,
          5,
          10
        ]
      },
      {
        "id": 33,
        "startTime": 145.894,
        "endTime": 149.434,
        "hanzi": "一中事尼一中事吃吃。一中事我想一事。",
        "pinyin": "ǹg wǒ yě jué de hěn hǎo chī jīn tiān wǒ qǐng kè",
        "meaning": "Tốt, tôi cũng nghĩ rất ngon. Hôm nay tôi mời.",
        "keywords": [
          "一中",
          "事尼"
        ],
        "blankIndices": [
          0,
          8,
          15
        ]
      },
      {
        "id": 34,
        "startTime": 151.014,
        "endTime": 153.527,
        "hanzi": "一中事尼一中事吃吃。一中事一中事一中事。",
        "pinyin": "nà xià cì wǒ qǐng nǐ chī sì chuān huǒ guō ,",
        "meaning": "Vậy thì lần sau tôi mời bạn ăn món lẩu Tứ Xuyên.",
        "keywords": [
          "一中",
          "事尼"
        ],
        "blankIndices": [
          0,
          9,
          17
        ]
      },
      {
        "id": 35,
        "startTime": 153.527,
        "endTime": 153.687,
        "hanzi": "一中事尼。",
        "pinyin": "zěn me yàng ?",
        "meaning": "Thế nào?",
        "keywords": [
          "一中",
          "事尼"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 36,
        "startTime": 155.427,
        "endTime": 155.707,
        "hanzi": "好。",
        "pinyin": "hǎo de 。",
        "meaning": "Tốt.",
        "keywords": [
          "好"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 37,
        "startTime": 157.247,
        "endTime": 158.667,
        "hanzi": "你事的帮尼上一事。",
        "pinyin": "fú wù yuán , mǎi dān 。",
        "meaning": "Thợ ăn, thanh toán.",
        "keywords": [
          "你事",
          "的帮"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 38,
        "startTime": 160.247,
        "endTime": 161.387,
        "hanzi": "一中事尼一中事的起尼。",
        "pinyin": "zhè shì nín de zhàng dān 。",
        "meaning": "Đây là hóa đơn của bạn.",
        "keywords": [
          "一中",
          "事尼"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 39,
        "startTime": 163.107,
        "endTime": 164.867,
        "hanzi": "好。我上一中事吃吃。",
        "pinyin": "hǎo , wǒ xiān kàn yí xià 。",
        "meaning": "Tốt, tôi sẽ xem lại.",
        "keywords": [
          "好我",
          "上一"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 40,
        "startTime": 165.947,
        "endTime": 167.167,
        "hanzi": "一中事尼。",
        "pinyin": "méi shén me wèn tí 。",
        "meaning": "Không có vấn đề.",
        "keywords": [
          "一中",
          "事尼"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 41,
        "startTime": 167.987,
        "endTime": 169.227,
        "hanzi": "您想怎么付款?",
        "pinyin": "nín xiǎng zěn me fù kuǎn ?",
        "meaning": "Bạn muốn thanh toán như thế nào?",
        "keywords": [
          "您想",
          "怎么"
        ],
        "blankIndices": [
          0,
          3
        ]
      },
      {
        "id": 42,
        "startTime": 171.067,
        "endTime": 172.247,
        "hanzi": "微信支付可以吗?",
        "pinyin": "wēi xìn zhī fù kě yǐ ma ?",
        "meaning": "Thanh toán WeChat có sẵn không?",
        "keywords": [
          "微信",
          "支付"
        ],
        "blankIndices": [
          0,
          3,
          6
        ]
      },
      {
        "id": 43,
        "startTime": 172.827,
        "endTime": 173.667,
        "hanzi": "当然可以。",
        "pinyin": "dāng rán kě yǐ 。",
        "meaning": "Chắc chắn.",
        "keywords": [
          "当然",
          "可以"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 44,
        "startTime": 174.447,
        "endTime": 177.347,
        "hanzi": "您可以扫描这上面的二维码。",
        "pinyin": "nín kě yǐ sǎo miáo zhè shàng miàn de èr wéi mǎ 。",
        "meaning": "Bạn có thể quét mã QR ở trên.",
        "keywords": [
          "您可",
          "以扫"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 45,
        "startTime": 179.527,
        "endTime": 180.467,
        "hanzi": "支付成功了",
        "pinyin": "zhī fù chéng gōng le",
        "meaning": "Thanh toán thành công",
        "keywords": [
          "支付",
          "成功"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 46,
        "startTime": 181.487,
        "endTime": 182.447,
        "hanzi": "好的,谢谢",
        "pinyin": "hǎo de , xiè xiè",
        "meaning": "Được rồi, cảm ơn",
        "keywords": [
          "好的",
          "谢谢"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 47,
        "startTime": 181.987,
        "endTime": 190.147,
        "hanzi": "现在",
        "pinyin": "xiàn zài",
        "meaning": "Hiện nay",
        "keywords": [
          "现在"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 48,
        "startTime": 190.147,
        "endTime": 191.947,
        "hanzi": "我们一起学几句重要",
        "pinyin": "wǒ men yì qǐ xué jǐ jù zhòng yào",
        "meaning": "Cùng nhau học một vài câu quan trọng nhé",
        "keywords": [
          "我们",
          "一起"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 49,
        "startTime": 192.987,
        "endTime": 194.047,
        "hanzi": "当迈克电打",
        "pinyin": "dāng mài kè diàn dǎ",
        "meaning": "Khi Mike gọi",
        "keywords": [
          "当迈",
          "克电"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 50,
        "startTime": 194.827,
        "endTime": 195.487,
        "hanzi": "他说了什么",
        "pinyin": "tā shuō le shén me",
        "meaning": "anh ấy đã nói gì",
        "keywords": [
          "他说",
          "了什"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 51,
        "startTime": 196.607,
        "endTime": 201.507,
        "hanzi": "他说了我想预定星期六晚上的座位",
        "pinyin": "tā shuō le wǒ xiǎng yù dìng xīng qī liù wǎn shàng de zuò wèi",
        "meaning": "Anh ấy nói tôi muốn đặt chỗ vào tối thứ Bảy",
        "keywords": [
          "他说",
          "了我"
        ],
        "blankIndices": [
          0,
          7,
          14
        ]
      },
      {
        "id": 52,
        "startTime": 202.687,
        "endTime": 206.047,
        "hanzi": "我想打电给我们有一个构图",
        "pinyin": "wǒ xiǎng dǎ diàn gěi wǒ men yǒu yí gè gòu tú",
        "meaning": "Tôi muốn gọi cho chúng tôi và soạn thảo",
        "keywords": [
          "我想",
          "打电"
        ],
        "blankIndices": [
          0,
          6,
          11
        ]
      },
      {
        "id": 53,
        "startTime": 206.627,
        "endTime": 209.327,
        "hanzi": "预定座位意思是摆盘",
        "pinyin": "yù dìng zuò wèi yì sī shì bǎi pán",
        "meaning": "Đặt chỗ có nghĩa là đặt đĩa",
        "keywords": [
          "预定",
          "座位"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 54,
        "startTime": 210.907,
        "endTime": 217.327,
        "hanzi": "你也可以使用这个绘我想遇见两个人在桌上",
        "pinyin": "nǐ yě kě yǐ shǐ yòng zhè ge huì wǒ xiǎng yù jiàn liǎng gè rén zài zhuō shàng",
        "meaning": "Bạn cũng có thể sử dụng bản vẽ này Tôi muốn gặp hai người ở bàn",
        "keywords": [
          "你也",
          "可以"
        ],
        "blankIndices": [
          0,
          9,
          18
        ]
      },
      {
        "id": 55,
        "startTime": 219.087,
        "endTime": 222.167,
        "hanzi": "我想遇见两个人在桌上",
        "pinyin": "wǒ xiǎng yù jiàn liǎng gè rén zài zhuō shàng",
        "meaning": "Tôi muốn gặp hai người ở bàn",
        "keywords": [
          "我想",
          "遇见"
        ],
        "blankIndices": [
          0,
          5,
          9
        ]
      },
      {
        "id": 56,
        "startTime": 223.647,
        "endTime": 224.947,
        "hanzi": "我希望两个",
        "pinyin": "wǒ xī wàng liǎng gè",
        "meaning": "tôi hy vọng hai",
        "keywords": [
          "我希",
          "望两"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 57,
        "startTime": 226.767,
        "endTime": 228.587,
        "hanzi": "去店里迈克尔要叫",
        "pinyin": "qù diàn lǐ mài kè ěr yào jiào",
        "meaning": "Đến cửa hàng và nhờ Michael đặt hàng",
        "keywords": [
          "去店",
          "里迈"
        ],
        "blankIndices": [
          0,
          4,
          7
        ]
      },
      {
        "id": 58,
        "startTime": 229.667,
        "endTime": 230.627,
        "hanzi": "他问服务",
        "pinyin": "tā wèn fú wù",
        "meaning": "anh ấy hỏi về dịch vụ",
        "keywords": [
          "他问",
          "服务"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 59,
        "startTime": 231.767,
        "endTime": 228.001,
        "hanzi": "你们这里有什么特菜Đếnnhàhàng,MaiCưa",
        "pinyin": "nǐ men zhè lǐ yǒu shén me tè cài Đ ế n n h à h à n g , M a i C ư a",
        "meaning": "Ở đây có món gì đặc biệt? Đến hàng, Mai Cưa",
        "keywords": [
          "你们",
          "这里"
        ],
        "blankIndices": [
          0,
          4,
          8
        ]
      },
      {
        "id": 60,
        "startTime": 228.001,
        "endTime": 230.281,
        "hanzi": "khôngbiếtgọimóngì.Anhấyđãhỏi",
        "pinyin": "k h ô n g b i ế t g ọ i m ó n g ì . A n h ấ y đ ã h ỏ i",
        "meaning": "khôngbiết kêumóngì.Anhấy đã hỏi",
        "keywords": [
          "k"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 61,
        "startTime": 230.281,
        "endTime": 231.221,
        "hanzi": "年子主主",
        "pinyin": "p h ụ c v ụ .",
        "meaning": "phụ cvụ",
        "keywords": [
          "年子",
          "主主"
        ],
        "blankIndices": [
          0,
          2
        ]
      },
      {
        "id": 62,
        "startTime": 236.021,
        "endTime": 238.201,
        "hanzi": "Thưaxưachaicónghĩalàmónđặc",
        "pinyin": "T h ư a x ư a c h a i c ó n g h ĩ a l à m ó n đ ặ c",
        "meaning": "Thưaxưachaicó nghĩa làm việc đặc biệt",
        "keywords": [
          "T"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 63,
        "startTime": 238.201,
        "endTime": 238.441,
        "hanzi": "sản.",
        "pinyin": "s ả n .",
        "meaning": "sản phẩm.",
        "keywords": [
          "s"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 64,
        "startTime": 239.301,
        "endTime": 240.721,
        "hanzi": "Ngoàicáchnóinàyra,cácbạncũng",
        "pinyin": "N g o à i c á c h n ó i n à y r a , c á c b ạ n c ũ n g",
        "meaning": "Ngoài cách nói chuyện này, các bạn cũng vậy",
        "keywords": [
          "N"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 65,
        "startTime": 240.721,
        "endTime": 241.281,
        "hanzi": "cóthểnói",
        "pinyin": "c ó t h ể n ó i",
        "meaning": "can't say",
        "keywords": [
          "c"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 66,
        "startTime": 249.961,
        "endTime": 252.201,
        "hanzi": "Khigọimón,bạncóthểnói",
        "pinyin": "K h i g ọ i m ó n , b ạ n c ó t h ể n ó i",
        "meaning": "Khiọimón, bạn có thể nói",
        "keywords": [
          "K"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 67,
        "startTime": 252.941,
        "endTime": 254.841,
        "hanzi": "Ủaláicộngvớimónănđó",
        "pinyin": "Ủ a l á i c ộ n g v ớ i m ó n ă n đ ó",
        "meaning": "Ủi cộng đồngcómón đó",
        "keywords": [
          "Ủ"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 68,
        "startTime": 255.601,
        "endTime": 255.961,
        "hanzi": "Vídụ",
        "pinyin": "V í d ụ",
        "meaning": "Ví dụ",
        "keywords": [
          "V"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 69,
        "startTime": 256.981,
        "endTime": 258.481,
        "hanzi": "Ủaláitiềnphítiểubạn",
        "pinyin": "Ủ a l á i t i ề n p h í t i ể u b ạ n",
        "meaning": "Ủi tiền tố loại bạn",
        "keywords": [
          "Ủ"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 70,
        "startTime": 259.761,
        "endTime": 262.341,
        "hanzi": "ChotôimộtcốcbiaHoặc",
        "pinyin": "C h o t ô i m ộ t c ố c b i a H o ặ c",
        "meaning": "Cho tôi mộtcốcbiaHoặc",
        "keywords": [
          "C"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 71,
        "startTime": 263.041,
        "endTime": 266.381,
        "hanzi": "ỦaláiebaycủachữChotôimộtcốc",
        "pinyin": "Ủ a l á i e b a y c ủ a c h ữ C h o t ô i m ộ t c ố c",
        "meaning": "ỦaláiebaychữCho tôi mộtcốc",
        "keywords": [
          "Ủ"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 72,
        "startTime": 266.381,
        "endTime": 266.781,
        "hanzi": "nướcép",
        "pinyin": "n ư ớ c é p",
        "meaning": "nước ép",
        "keywords": [
          "n"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 73,
        "startTime": 267.881,
        "endTime": 269.961,
        "hanzi": "ĂnnonèrồiBâyđếnphầntínhtiền",
        "pinyin": "Ă n n o n è r ồ i B â y đ ế n p h ầ n t í n h t i ề n",
        "meaning": "Ănnonèrồi Hiện đã đến phần tính tiền",
        "keywords": [
          "Ă"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 74,
        "startTime": 269.741,
        "endTime": 273.041,
        "hanzi": "NếubạnmuốnmờiBạncóthểnói",
        "pinyin": "N ế u b ạ n m u ố n m ờ i B ạ n c ó t h ể n ó i",
        "meaning": "Nếu bạnmuốnmờiBạn có thể nói",
        "keywords": [
          "N"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 75,
        "startTime": 273.761,
        "endTime": 275.341,
        "hanzi": "Chínhthiênuốngchỉnhkhợ",
        "pinyin": "C h í n h t h i ê n u ố n g c h ỉ n h k h ợ",
        "meaning": "Chính thiên giảm chỉnhkhợ",
        "keywords": [
          "C"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 76,
        "startTime": 277.161,
        "endTime": 278.941,
        "hanzi": "Chínhthiênuốngchỉnhkhợ",
        "pinyin": "C h í n h t h i ê n u ố n g c h ỉ n h k h ợ",
        "meaning": "Chính thiên giảm chỉnhkhợ",
        "keywords": [
          "C"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 77,
        "startTime": 280.341,
        "endTime": 282.201,
        "hanzi": "Cònnếunhưbạnmuốnchiađềuthì",
        "pinyin": "C ò n n ế u n h ư b ạ n m u ố n c h i a đ ề u t h ì",
        "meaning": "Còn if youmuốnchiađềuthì",
        "keywords": [
          "C"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 78,
        "startTime": 282.201,
        "endTime": 283.041,
        "hanzi": "chúngtacóthểnói",
        "pinyin": "c h ú n g t a c ó t h ể n ó i",
        "meaning": "wetacó thể nói",
        "keywords": [
          "c"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 79,
        "startTime": 283.781,
        "endTime": 291.941,
        "hanzi": "Học",
        "pinyin": "H ọ c",
        "meaning": "Học",
        "keywords": [
          "H"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 80,
        "startTime": 291.961,
        "endTime": 295.861,
        "hanzi": "videovềchủđềđiănnhàhàngcủa",
        "pinyin": "v i d e o v ề c h ủ đ ề đ i ă n n h à h à n g c ủ a",
        "meaning": "video giới thiệu chủ đềđi nhà hàng của",
        "keywords": [
          "v"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 81,
        "startTime": 295.861,
        "endTime": 297.021,
        "hanzi": "chúngtađếnđâylàhếtrồi.",
        "pinyin": "c h ú n g t a đ ế n đ â y l à h ế t r ồ i .",
        "meaning": "chúng tôi đến đâylàhếtrồi.",
        "keywords": [
          "c"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 82,
        "startTime": 297.701,
        "endTime": 299.021,
        "hanzi": "cácbạnthíchvideothìđừngquên",
        "pinyin": "c á c b ạ n t h í c h v i d e o t h ì đ ừ n g q u ê n",
        "meaning": "các bạn thíchvideothìđừngquên",
        "keywords": [
          "c"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 83,
        "startTime": 299.021,
        "endTime": 302.001,
        "hanzi": "ấnnútlikevàđểchúngtacóthểnhận",
        "pinyin": "ấ n n ú t l i k e v à đ ể c h ú n g t a c ó t h ể n h ậ n",
        "meaning": "ấn nútlikevàđể họ có thể nhận được",
        "keywords": [
          "ấ"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 84,
        "startTime": 302.001,
        "endTime": 303.481,
        "hanzi": "thôngtinvềnhữngvideotiếptheo",
        "pinyin": "t h ô n g t i n v ề n h ữ n g v i d e o t i ế p t h e o",
        "meaning": "thông tin về những video tiếp theo",
        "keywords": [
          "t"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 85,
        "startTime": 303.481,
        "endTime": 303.681,
        "hanzi": "nhé.",
        "pinyin": "n h é .",
        "meaning": "nhé.",
        "keywords": [
          "n"
        ],
        "blankIndices": [
          0
        ]
      },
      {
        "id": 86,
        "startTime": 304.481,
        "endTime": 305.441,
        "hanzi": "Thùngsứmừng,chào",
        "pinyin": "T h ù n g s ứ m ừ n g , c h à o",
        "meaning": "Thùngsứmừng,chao",
        "keywords": [
          "T"
        ],
        "blankIndices": [
          0
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

      showToast("⚡ Đã trích xuất phụ đề theo ngôn ngữ gốc của video! Hãy bấm nút 'Dịch Tiếng Trung' để chuyển sang Chữ Hán, Pinyin & Tiếng Việt. 🎉");

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

  showToast("🌐 Đang chuyển đổi toàn bộ phụ đề sang Chữ Hán Giản Thể, Pinyin & Tiếng Việt...");

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
        showToast("✨ Đã chuyển đổi toàn bộ phụ đề sang Chữ Hán, Pinyin & Tiếng Việt chuẩn xác 100%! 🎉");
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

  // Deduplicate existing entry for this user and youtubeId
  allLessons = allLessons.filter(l => !(l.youtubeId === ytId && l.userEmail === email));
  let localList = getLocalCustomVideos();
  localList = localList.filter(l => !(l.youtubeId === ytId && l.userEmail === email));

  // 1. Add to allLessons
  allLessons.unshift(newLesson);

  // 2. Save to local storage
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
  const map = new Map(); // Key: ID
  const ytEmailMap = new Set(); // Key: youtubeId_userEmail

  serverLessons.forEach(l => {
    map.set(l.id, l);
    if (l.youtubeId && l.userEmail) ytEmailMap.add(`${l.youtubeId}_${l.userEmail}`);
  });

  localCustom.forEach(l => {
    const compositeKey = `${l.youtubeId}_${l.userEmail}`;
    if (!map.has(l.id) && !ytEmailMap.has(compositeKey)) {
      map.set(l.id, l);
      if (l.youtubeId && l.userEmail) ytEmailMap.add(compositeKey);
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
