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
    "duration": "03:30",
    "level": "1",
    "levelText": "HSK 1 - 2 (Dễ)",
    "category": "Âm Nhạc",
    "thumbnail": "https://img.youtube.com/vi/kpDING7mMcQ/hqdefault.jpg",
    "description": "Bài hát bất hủ của Đặng Lệ Quân với giai điệu chậm rãi, từ vựng cơ bản cực kỳ phù hợp cho người mới bắt đầu luyện nghe chép chính tả.",
    "sentences": [
      {
        "id": 1,
        "startTime": 17.0,
        "endTime": 23.0,
        "hanzi": "你问我爱你有多深",
        "pinyin": "Nǐ wèn wǒ ài nǐ yǒu duō shēn",
        "meaning": "Em hỏi anh yêu em sâu đậm nhường nào",
        "keywords": ["你问我", "爱你", "多深"],
        "blankIndices": [1, 2]
      },
      {
        "id": 2,
        "startTime": 23.0,
        "endTime": 29.0,
        "hanzi": "我爱你有几分",
        "pinyin": "Wǒ ài nǐ yǒu jǐ fēn",
        "meaning": "Tình yêu của anh dành cho em được mấy phần",
        "keywords": ["我爱你", "几分"],
        "blankIndices": [0]
      },
      {
        "id": 3,
        "startTime": 29.0,
        "endTime": 35.0,
        "hanzi": "我的情也真",
        "pinyin": "Wǒ de qíng yě zhēn",
        "meaning": "Tình cảm của anh là chân thật",
        "keywords": ["我的情", "真"],
        "blankIndices": [0, 1]
      },
      {
        "id": 4,
        "startTime": 35.0,
        "endTime": 41.0,
        "hanzi": "我的爱也真",
        "pinyin": "Wǒ de ài yě zhēn",
        "meaning": "Tình yêu của anh cũng chân thành",
        "keywords": ["我的爱", "也真"],
        "blankIndices": [0]
      },
      {
        "id": 5,
        "startTime": 41.0,
        "endTime": 48.5,
        "hanzi": "月亮代表我的心",
        "pinyin": "Yuèliang dàibiǎo wǒ de xīn",
        "meaning": "Vầng trăng kia sẽ thay cho trái tim anh",
        "keywords": ["月亮", "代表", "我的心"],
        "blankIndices": [0, 1, 2]
      },
      {
        "id": 6,
        "startTime": 49.0,
        "endTime": 55.0,
        "hanzi": "轻轻的一个吻",
        "pinyin": "Qīngqīng de yí gè wěn",
        "meaning": "Một nụ hôn nhẹ nhàng êm dịu",
        "keywords": ["轻轻", "一个吻"],
        "blankIndices": [0, 1]
      },
      {
        "id": 7,
        "startTime": 55.0,
        "endTime": 62.0,
        "hanzi": "已经打动我的心",
        "pinyin": "Yǐjīng dǎdòng wǒ de xīn",
        "meaning": "Đã làm rung động trái tim anh",
        "keywords": ["已经", "打动", "我的心"],
        "blankIndices": [0, 1]
      },
      {
        "id": 8,
        "startTime": 62.0,
        "endTime": 68.0,
        "hanzi": "深深的一段情",
        "pinyin": "Shēnshēn de yí duàn qíng",
        "meaning": "Một mối tình sâu đậm tha thiết",
        "keywords": ["深深", "一段情"],
        "blankIndices": [0, 1]
      },
      {
        "id": 9,
        "startTime": 68.0,
        "endTime": 77.0,
        "hanzi": "叫我思念到如今",
        "pinyin": "Jiào wǒ sīniàn dào rújīn",
        "meaning": "Khiến anh nhung nhớ mãi tới hôm nay",
        "keywords": ["思念", "如今"],
        "blankIndices": [0, 1]
      }
    ]
  },
  {
    "id": "dict_lesson_2",
    "title": "Hội Thoại Làm Quen & Chào Hỏi HSK 1 (初次见面)",
    "youtubeId": "8oS6uXOZ_TA",
    "duration": "02:15",
    "level": "1",
    "levelText": "HSK 1 (Sơ cấp)",
    "category": "Giao Tiếp",
    "thumbnail": "https://img.youtube.com/vi/8oS6uXOZ_TA/hqdefault.jpg",
    "description": "Các câu chào hỏi, hỏi tên, quốc tịch và giới thiệu bản thân thông dụng nhất trong tiếng Trung.",
    "sentences": [
      {
        "id": 1,
        "startTime": 5.0,
        "endTime": 11.0,
        "hanzi": "你好！很高兴认识你。",
        "pinyin": "Nǐ hǎo! Hěn gāoxìng rènshi nǐ.",
        "meaning": "Xin chào! Rất vui được làm quen với bạn.",
        "keywords": ["你好", "高兴", "认识"],
        "blankIndices": [1, 2]
      },
      {
        "id": 2,
        "startTime": 11.0,
        "endTime": 18.0,
        "hanzi": "请问你叫什么名字？",
        "pinyin": "Qǐngwèn nǐ jiào shénme míngzi?",
        "meaning": "Xin hỏi bạn tên là gì?",
        "keywords": ["请问", "什么", "名字"],
        "blankIndices": [0, 1, 2]
      },
      {
        "id": 3,
        "startTime": 18.0,
        "endTime": 25.0,
        "hanzi": "我叫李明，我是中国人。",
        "pinyin": "Wǒ jiào Lǐ Míng, wǒ shì Zhōngguórén.",
        "meaning": "Tôi tên là Lý Minh, tôi là người Trung Quốc.",
        "keywords": ["李明", "中国人"],
        "blankIndices": [0, 1]
      },
      {
        "id": 4,
        "startTime": 25.0,
        "endTime": 31.0,
        "hanzi": "你是哪国人？",
        "pinyin": "Nǐ shì nǎ guó rén?",
        "meaning": "Bạn là người nước nào?",
        "keywords": ["哪国人"],
        "blankIndices": [0]
      },
      {
        "id": 5,
        "startTime": 31.0,
        "endTime": 38.0,
        "hanzi": "我是越南人，我在学汉语。",
        "pinyin": "Wǒ shì Yuènánrén, wǒ zài xué Hànyǔ.",
        "meaning": "Tôi là người Việt Nam, tôi đang học tiếng Trung.",
        "keywords": ["越南人", "汉语"],
        "blankIndices": [0, 1]
      },
      {
        "id": 6,
        "startTime": 38.0,
        "endTime": 45.0,
        "hanzi": "你的汉语非常好！",
        "pinyin": "Nǐ de Hànyǔ fēicháng hǎo!",
        "meaning": "Tiếng Trung của bạn rất là giỏi!",
        "keywords": ["非常", "好"],
        "blankIndices": [0, 1]
      },
      {
        "id": 7,
        "startTime": 45.0,
        "endTime": 52.0,
        "hanzi": "哪里哪里，谢谢你的夸奖。",
        "pinyin": "Nǎlǐ nǎlǐ, xièxie nǐ de kuājiǎng.",
        "meaning": "Đâu có đâu có, cảm ơn lời khen của bạn nhé.",
        "keywords": ["哪里", "谢谢", "夸奖"],
        "blankIndices": [0, 1, 2]
      }
    ]
  },
  {
    "id": "dict_lesson_3",
    "title": "Hoạt Hình Heo Peppa Tiếng Trung (小猪佩奇 - 跳泥坑)",
    "youtubeId": "RT1yYLfqNhU",
    "duration": "04:30",
    "level": "2",
    "levelText": "HSK 2 - 3 (Thú Vị)",
    "category": "Hoạt Hình",
    "thumbnail": "https://img.youtube.com/vi/RT1yYLfqNhU/hqdefault.jpg",
    "description": "Luyện nghe tiếng Trung siêu dễ thương qua bộ phim hoạt hình Peppa Pig với phát âm chuẩn Bắc Kinh rõ ràng.",
    "sentences": [
      {
        "id": 1,
        "startTime": 6.0,
        "endTime": 12.0,
        "hanzi": "我是佩奇，这是我的弟弟乔治。",
        "pinyin": "Wǒ shì Pèiqí, zhè shì wǒ de dìdi Qiáozhì.",
        "meaning": "Tớ là Peppa, đây là em trai George của tớ.",
        "keywords": ["佩奇", "弟弟", "乔治"],
        "blankIndices": [0, 1, 2]
      },
      {
        "id": 2,
        "startTime": 12.0,
        "endTime": 18.0,
        "hanzi": "这是猪妈妈，这是猪爸爸。",
        "pinyin": "Zhè shì Zhū Māmā, zhè shì Zhū Bàba.",
        "meaning": "Đây là mẹ Heo, còn đây là bố Heo.",
        "keywords": ["妈妈", "爸爸"],
        "blankIndices": [0, 1]
      },
      {
        "id": 3,
        "startTime": 20.0,
        "endTime": 26.0,
        "hanzi": "今天下雨了，不能出去玩了。",
        "pinyin": "Jīntiān xiàyǔ le, bù néng chūqù wán le.",
        "meaning": "Hôm nay trời mưa rồi, không thể ra ngoài chơi được nữa.",
        "keywords": ["今天", "下雨", "出去玩"],
        "blankIndices": [0, 1, 2]
      },
      {
        "id": 4,
        "startTime": 28.0,
        "endTime": 35.0,
        "hanzi": "雨停了，太阳出来了！",
        "pinyin": "Yǔ tíng le, tàiyáng chūlái le!",
        "meaning": "Mưa tạnh rồi, mặt trời đã lên rồi kìa!",
        "keywords": ["雨停", "太阳", "出来"],
        "blankIndices": [0, 1, 2]
      },
      {
        "id": 5,
        "startTime": 36.0,
        "endTime": 44.0,
        "hanzi": "佩奇最喜欢在泥坑里跳来跳去。",
        "pinyin": "Pèiqí zuì xǐhuan zài níkēng lǐ tiào lái tiào qù.",
        "meaning": "Peppa thích nhất là nhảy nhót trong những vũng bùn.",
        "keywords": ["最喜欢", "泥坑", "跳来跳去"],
        "blankIndices": [0, 1, 2]
      },
      {
        "id": 6,
        "startTime": 45.0,
        "endTime": 54.0,
        "hanzi": "如果你要在泥坑里跳，必须穿上靴子。",
        "pinyin": "Rúguǒ nǐ yào zài níkēng lǐ tiào, bìxū chuān shàng xuēzi.",
        "meaning": "Nếu con muốn nhảy trong vũng bùn, con bắt buộc phải đi ủng vào.",
        "keywords": ["如果", "必须", "靴子"],
        "blankIndices": [0, 1, 2]
      }
    ]
  },
  {
    "id": "dict_lesson_4",
    "title": "Hội Thoại Mua Sắm & Trả Giá HSK 2 (买衣服与讨价还价)",
    "youtubeId": "Asqr_Sz9wVM",
    "duration": "03:10",
    "level": "2",
    "levelText": "HSK 2 - 3 (Thực Tế)",
    "category": "Đời Sống",
    "thumbnail": "https://img.youtube.com/vi/Asqr_Sz9wVM/hqdefault.jpg",
    "description": "Các mẫu câu tiếng Trung đi chợ, mua sắm quần áo, hỏi giá tiền và mặc cả chiết khấu thực tế.",
    "sentences": [
      {
        "id": 1,
        "startTime": 5.0,
        "endTime": 12.0,
        "hanzi": "请问这件衣服多少钱一件？",
        "pinyin": "Qǐngwèn zhè jiàn yīfu duōshao qián yí jiàn?",
        "meaning": "Xin hỏi chiếc áo này bao nhiêu tiền một chiếc?",
        "keywords": ["衣服", "多少钱"],
        "blankIndices": [0, 1]
      },
      {
        "id": 2,
        "startTime": 12.0,
        "endTime": 18.0,
        "hanzi": "这件衣服两百块钱。",
        "pinyin": "Zhè jiàn yīfu liǎng bǎi kuài qián.",
        "meaning": "Chiếc áo này hai trăm tệ.",
        "keywords": ["两百", "块钱"],
        "blankIndices": [0, 1]
      },
      {
        "id": 3,
        "startTime": 18.0,
        "endTime": 26.0,
        "hanzi": "太贵了，能不能便宜一点儿？",
        "pinyin": "Tài guì le, néng bu néng piányi yìdiǎnr?",
        "meaning": "Đắt quá, có thể rẻ hơn một chút được không?",
        "keywords": ["太贵了", "便宜", "一点儿"],
        "blankIndices": [0, 1, 2]
      },
      {
        "id": 4,
        "startTime": 26.0,
        "endTime": 33.0,
        "hanzi": "如果你买两件，给你打八折。",
        "pinyin": "Rúguǒ nǐ mǎi liǎng jiàn, gěi nǐ dǎ bā zhé.",
        "meaning": "Nếu bạn mua hai chiếc, tôi sẽ giảm giá 20% cho bạn.",
        "keywords": ["如果", "买两件", "打八折"],
        "blankIndices": [0, 1, 2]
      },
      {
        "id": 5,
        "startTime": 33.0,
        "endTime": 40.0,
        "hanzi": "我可以试穿一下这件衣服吗？",
        "pinyin": "Wǒ kěyǐ shìchuān yíxià zhè jiàn yīfu ma?",
        "meaning": "Tôi có thể mặc thử một chút chiếc áo này được không?",
        "keywords": ["可以", "试穿", "一下"],
        "blankIndices": [0, 1, 2]
      },
      {
        "id": 6,
        "startTime": 40.0,
        "endTime": 48.0,
        "hanzi": "当然可以，试衣间在那边。",
        "pinyin": "Dāngrán kěyǐ, shìyījiān zài nàbiān.",
        "meaning": "Đương nhiên là được, phòng thử đồ ở đằng kia.",
        "keywords": ["当然", "试衣间", "那边"],
        "blankIndices": [0, 1, 2]
      }
    ]
  },
  {
    "id": "dict_lesson_5",
    "title": "Bài Hát Ngọt Ngào (甜蜜蜜 - Tian Mi Mi)",
    "youtubeId": "5eF8oOWtsk4",
    "duration": "03:40",
    "level": "2",
    "levelText": "HSK 2 - 3 (Kinh Điển)",
    "category": "Âm Nhạc",
    "thumbnail": "https://img.youtube.com/vi/5eF8oOWtsk4/hqdefault.jpg",
    "description": "Tuyệt phẩm âm nhạc Hoa ngữ kinh điển của Đặng Lệ Quân với lời ca trong trẻo, từ vựng lãng mạn dễ nghe dễ nhớ.",
    "sentences": [
      {
        "id": 1,
        "startTime": 13.0,
        "endTime": 19.0,
        "hanzi": "甜蜜蜜你笑得甜蜜蜜",
        "pinyin": "Tiánmìmì nǐ xiào de tiánmìmì",
        "meaning": "Ngọt ngào làm sao, nụ cười của em thật ngọt ngào",
        "keywords": ["甜蜜蜜", "笑得"],
        "blankIndices": [0, 1]
      },
      {
        "id": 2,
        "startTime": 19.0,
        "endTime": 26.0,
        "hanzi": "好像花儿开在春风里",
        "pinyin": "Hǎoxiàng huār kāi zài chūnfēng lǐ",
        "meaning": "Tựa như bông hoa đang nở rộ trong làn gió xuân",
        "keywords": ["好像", "花儿", "春风"],
        "blankIndices": [0, 1, 2]
      },
      {
        "id": 3,
        "startTime": 26.0,
        "endTime": 32.0,
        "hanzi": "在哪里在哪里见过你",
        "pinyin": "Zài nǎlǐ zài nǎlǐ jiàn guò nǐ",
        "meaning": "Ở nơi nào, đã từng gặp em ở nơi nao",
        "keywords": ["在哪里", "见过你"],
        "blankIndices": [0, 1]
      },
      {
        "id": 4,
        "startTime": 32.0,
        "endTime": 39.0,
        "hanzi": "你的笑容这样熟悉",
        "pinyin": "Nǐ de xiàoróng zhèyàng shúxī",
        "meaning": "Nụ cười của em sao thân quen đến thế",
        "keywords": ["笑容", "熟悉"],
        "blankIndices": [0, 1]
      },
      {
        "id": 5,
        "startTime": 39.0,
        "endTime": 46.0,
        "hanzi": "我一时想不起",
        "pinyin": "Wǒ yìshí xiǎng bù qǐ",
        "meaning": "Nhất thời anh chưa thể nhớ ra",
        "keywords": ["一时", "想不起"],
        "blankIndices": [0, 1]
      },
      {
        "id": 6,
        "startTime": 46.0,
        "endTime": 54.0,
        "hanzi": "啊在梦里！",
        "pinyin": "A zài mèng lǐ!",
        "meaning": "A, chính là trong giấc mơ!",
        "keywords": ["梦里"],
        "blankIndices": [0]
      }
    ]
  },
  {
    "id": "dict_lesson_6",
    "title": "Hội Thoại Đặt Bàn & Gọi Món Nhà Hàng (在餐厅点菜)",
    "youtubeId": "0MZIImblEHc",
    "duration": "03:15",
    "level": "3",
    "levelText": "HSK 3 (Ẩm Thực)",
    "category": "Đời Sống",
    "thumbnail": "https://img.youtube.com/vi/0MZIImblEHc/hqdefault.jpg",
    "description": "Luyện nghe chép chính tả chủ đề ăn uống, gọi món, chọn khẩu vị và thanh toán tại nhà hàng Trung Hoa.",
    "sentences": [
      {
        "id": 1,
        "startTime": 5.0,
        "endTime": 12.0,
        "hanzi": "服务员，请给我们一份菜单。",
        "pinyin": "Fúwùyuán, qǐng gěi wǒmen yí fèn càidān.",
        "meaning": "Phục vụ ơi, vui lòng cho chúng tôi xin quyển thực đơn.",
        "keywords": ["服务员", "菜单"],
        "blankIndices": [0, 1]
      },
      {
        "id": 2,
        "startTime": 12.0,
        "endTime": 19.0,
        "hanzi": "请问你们店有什么特色菜？",
        "pinyin": "Qǐngwèn nǐmen diàn yǒu shénme tèsè cài?",
        "meaning": "Xin hỏi quán của bạn có món ăn đặc sản nào ngon?",
        "keywords": ["请问", "特色菜"],
        "blankIndices": [0, 1]
      },
      {
        "id": 3,
        "startTime": 19.0,
        "endTime": 27.0,
        "hanzi": "我们店的北京烤鸭和宫保鸡丁非常有名。",
        "pinyin": "Wǒmen diàn de Běijīng kǎoyā hé gōngbǎo jīdīng fēicháng yǒumíng.",
        "meaning": "Món Vịt quay Bắc Kinh và Gà Cung Bảo của quán chúng tôi rất nổi tiếng.",
        "keywords": ["北京烤鸭", "宫保鸡丁", "有名"],
        "blankIndices": [0, 1, 2]
      },
      {
        "id": 4,
        "startTime": 27.0,
        "endTime": 34.0,
        "hanzi": "请少放点辣椒，我们不太能吃辣。",
        "pinyin": "Qǐng shǎo fàng diǎn làjiāo, wǒmen bú tài néng chī là.",
        "meaning": "Xin hãy cho ít ớt thôi nhé, chúng tôi không ăn được cay lắm.",
        "keywords": ["辣椒", "不太能", "吃辣"],
        "blankIndices": [0, 1, 2]
      },
      {
        "id": 5,
        "startTime": 34.0,
        "endTime": 41.0,
        "hanzi": "好的，请问还要喝点什么饮料吗？",
        "pinyin": "Hǎo de, qǐngwèn hái yào hē diǎn shénme yǐnliào ma?",
        "meaning": "Dạ vâng, xin hỏi quý khách có muốn dùng thêm đồ uống gì không?",
        "keywords": ["请问", "饮料"],
        "blankIndices": [0, 1]
      },
      {
        "id": 6,
        "startTime": 41.0,
        "endTime": 49.0,
        "hanzi": "买单，请问支持微信支付吗？",
        "pinyin": "Mǎidān, qǐngwèn zhīchí Wēixìn zhīfù ma?",
        "meaning": "Thanh toán, xin hỏi ở đây có hỗ trợ thanh toán WeChat Pay không?",
        "keywords": ["买单", "微信支付"],
        "blankIndices": [0, 1]
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

  showToast("🔍 Đang kết nối và trích xuất mốc câu giọng nói từ YouTube...");

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
        if (titleInput && (!titleInput.value || titleInput.value.startsWith('Bài Luyện Nghe YouTube'))) {
          titleInput.value = data.videoTitle || titleInput.value;
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

        const langBadge = data.detectedLang ? ` [${data.detectedLang}]` : '';
        showToast(`✨ Đã nạp ${data.sentences.length} câu thoại${langBadge} & dịch sang Tiếng Trung chuẩn xác 100%! 🎉`);
      } else {
        showToast(data.message || "Video không có phụ đề sẵn, vui lòng dán lời thoại rồi bấm 'Dịch Tiếng Trung'!", true);
      }
    } else {
      showToast("Không thể kết nối lấy phụ đề YouTube tự động.", true);
    }
  } catch (err) {
    console.error("Fetch subtitles error:", err);
    showToast("Lỗi kết nối khi trích xuất phụ đề YouTube.", true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-brands fa-youtube"></i> Lấy Mốc Giọng Nói YouTube';
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
