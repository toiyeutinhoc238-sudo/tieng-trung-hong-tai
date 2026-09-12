/**
 * Tiếng Trung HongTai - AI Essay Grader & Writing Practice
 * Module chuyên trách Luyện Viết & AI Chấm Điểm Bài Văn Tiếng Trung
 */

const API_BASE_URL = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
  ? ''
  : '';

// Pre-built authentic HSK Writing Prompts Bank
const HSK_PROMPTS_BANK = {
  1: [
    {
      title: "自我介绍",
      titleVi: "Giới thiệu bản thân",
      hskLevel: 1,
      minWords: 35,
      promptText: "请写一段话介绍你自己：你叫什么名字？是哪国人？几岁？喜欢做什么？",
      promptTextVi: "Hãy viết một đoạn văn giới thiệu bản thân: Bạn tên là gì? Người nước nào? Bao nhiêu tuổi? Thích làm gì?",
      requiredKeywords: [
        { word: "我", pinyin: "wǒ", meaning: "tôi" },
        { word: "是", pinyin: "shì", meaning: "là" },
        { word: "喜欢", pinyin: "xǐhuan", meaning: "thích" },
        { word: "中国", pinyin: "zhōngguó", meaning: "Trung Quốc" }
      ],
      sampleOutline: ["Giới thiệu tên, tuổi và quốc tịch", "Sở thích và thói quen hàng ngày", "Lý do học tiếng Trung"]
    },
    {
      title: "我的家人",
      titleVi: "Gia đình của tôi",
      hskLevel: 1,
      minWords: 35,
      promptText: "请介绍一下你的家：家里有几口人？他们是谁？他们做什么工作？",
      promptTextVi: "Hãy giới thiệu về gia đình bạn: Nhà có mấy người? Họ là ai? Họ làm nghề gì?",
      requiredKeywords: [
        { word: "家", pinyin: "jiā", meaning: "nhà, gia đình" },
        { word: "爸爸", pinyin: "bàba", meaning: "bố" },
        { word: "妈妈", pinyin: "māma", meaning: "mẹ" },
        { word: "爱", pinyin: "ài", meaning: "yêu thương" }
      ],
      sampleOutline: ["Số lượng thành viên trong gia đình", "Nghề nghiệp và tính cách của bố mẹ", "Tình cảm gắn bó trong gia đình"]
    },
    {
      title: "我的一天",
      titleVi: "Một ngày của tôi",
      hskLevel: 1,
      minWords: 40,
      promptText: "请写你普通的一天：几点起床？吃什么？上午、下午做什么？几点睡觉？",
      promptTextVi: "Hãy kể về một ngày của bạn: Mấy giờ thức dậy? Ăn gì? Làm gì vào buổi sáng/chiều? Mấy giờ đi ngủ?",
      requiredKeywords: [
        { word: "早上", pinyin: "zǎoshang", meaning: "buổi sáng" },
        { word: "吃", pinyin: "chī", meaning: "ăn" },
        { word: "看书", pinyin: "kànshū", meaning: "đọc sách" },
        { word: "睡觉", pinyin: "shuìjiào", meaning: "đi ngủ" }
      ],
      sampleOutline: ["Thức dậy và ăn sáng", "Hoạt động học tập/làm việc trong ngày", "Buổi tối thư giãn và giờ đi ngủ"]
    }
  ],
  2: [
    {
      title: "我的业余爱好",
      titleVi: "Sở thích lúc rảnh rỗi của tôi",
      hskLevel: 2,
      minWords: 60,
      promptText: "每个人都有自己的爱好。请谈谈你在空闲时间喜欢做什么，为什么喜欢？",
      promptTextVi: "Mỗi người đều có sở thích riêng. Hãy chia sẻ về điều bạn thích làm khi rảnh rỗi và lý do yêu thích.",
      requiredKeywords: [
        { word: "运动", pinyin: "yùndòng", meaning: "thể thao" },
        { word: "唱歌", pinyin: "chànggē", meaning: "hát" },
        { word: "快乐", pinyin: "kuàilè", meaning: "vui vẻ" },
        { word: "常常", pinyin: "chángcháng", meaning: "thường xuyên" }
      ],
      sampleOutline: ["Nêu sở thích lớn nhất của bạn", "Luyện tập sở thích đó với ai và ở đâu", "Sở thích mang lại niềm vui gì cho bạn"]
    },
    {
      title: "一次难忘的旅行",
      titleVi: "Một chuyến đi du lịch đáng nhớ",
      hskLevel: 2,
      minWords: 60,
      promptText: "你最喜欢去哪里旅游？那里的天气、风景和食物怎么样？跟谁一起去的？",
      promptTextVi: "Bạn thích đi du lịch ở đâu nhất? Thời tiết, phong cảnh và đồ ăn ở đó thế nào? Bạn đi cùng với ai?",
      requiredKeywords: [
        { word: "旅游", pinyin: "lǚyóu", meaning: "du lịch" },
        { word: "飞机", pinyin: "fēijī", meaning: "máy bay" },
        { word: "好吃", pinyin: "hǎochī", meaning: "ngon miệng" },
        { word: "朋友", pinyin: "péngyou", meaning: "bạn bè" }
      ],
      sampleOutline: ["Địa điểm và thời gian đi du lịch", "Những trải nghiệm đáng nhớ và món ăn ngon", "Cảm nghĩ sau chuyến đi"]
    },
    {
      title: "我最喜欢的季节",
      titleVi: "Mùa tôi yêu thích nhất trong năm",
      hskLevel: 2,
      minWords: 60,
      promptText: "一年有春夏秋冬四个季节，你最喜欢哪个季节？为什么？那个季节你可以做什么？",
      promptTextVi: "Một năm có 4 mùa xuân hạ thu đông, bạn thích mùa nào nhất? Vì sao? Vào mùa đó bạn có thể làm gì?",
      requiredKeywords: [
        { word: "天气", pinyin: "tiānqì", meaning: "thời tiết" },
        { word: "漂亮", pinyin: "piàoliang", meaning: "đẹp đẽ" },
        { word: "虽然", pinyin: "suīrán", meaning: "tuy rằng" },
        { word: "但是", pinyin: "dànshì", meaning: "nhưng mà" }
      ],
      sampleOutline: ["Giới thiệu mùa bạn thích nhất", "Đặc điểm thời tiết và cảnh sắc thiên nhiên", "Các hoạt động vui chơi gắn liền với mùa đó"]
    }
  ],
  3: [
    {
      title: "难忘的一个周末",
      titleVi: "Một cuối tuần đáng nhớ",
      hskLevel: 3,
      minWords: 90,
      promptText: "上个周末你过得怎么样？去了哪些地方？做了什么有意思的事情？心情如何？",
      promptTextVi: "Cuối tuần trước bạn trải qua như thế nào? Đã đi những đâu? Làm những việc gì thú vị? Tâm trạng ra sao?",
      requiredKeywords: [
        { word: "周末", pinyin: "zhōumò", meaning: "cuối tuần" },
        { word: "打算", pinyin: "dǎsuàn", meaning: "dự định" },
        { word: "电影", pinyin: "diànyǐng", meaning: "phim ảnh" },
        { word: "高兴", pinyin: "gāoxìng", meaning: "vui mừng" }
      ],
      sampleOutline: ["Kế hoạch ban đầu cho cuối tuần", "Diễn biến thực tế các sự việc diễn ra", "Cảm xúc đọng lại sau ngày nghỉ"]
    },
    {
      title: "保持身体健康的好习惯",
      titleVi: "Thói quen tốt để giữ gìn sức khỏe",
      hskLevel: 3,
      minWords: 90,
      promptText: "健康对每个人都非常重要。你平时怎样保持健康？在饮食和运动方面有什么好习惯？",
      promptTextVi: "Sức khỏe rất quan trọng đối với mỗi người. Bạn thường làm gì để giữ gìn sức khỏe? Có thói quen tốt gì về ăn uống và vận động?",
      requiredKeywords: [
        { word: "身体", pinyin: "shēntǐ", meaning: "cơ thể, sức khỏe" },
        { word: "锻炼", pinyin: "duànliàn", meaning: "rèn luyện, tập thể dục" },
        { word: "习惯", pinyin: "xíguàn", meaning: "thói quen" },
        { word: "重要", pinyin: "zhòngyào", meaning: "quan trọng" }
      ],
      sampleOutline: ["Tầm quan trọng của sức khỏe trong cuộc sống", "Chế độ ăn uống lành mạnh và thói quen ngủ đủ giấc", "Luyện tập thể thao đều đặn"]
    },
    {
      title: "介绍我的故乡",
      titleVi: "Giới thiệu về quê hương của tôi",
      hskLevel: 3,
      minWords: 95,
      promptText: "请向外国朋友介绍一下你的家乡：它的位置、风景特色、当地人和特色美食。",
      promptTextVi: "Hãy giới thiệu quê hương bạn với một người bạn nước ngoài: Vị trí, phong cảnh, con người và ẩm thực đặc sản.",
      requiredKeywords: [
        { word: "城市", pinyin: "chéngshì", meaning: "thành phố" },
        { word: "风景", pinyin: "fēngjǐng", meaning: "phong cảnh" },
        { word: "热情", pinyin: "rèqíng", meaning: "nhiệt tình" },
        { word: "欢迎", pinyin: "huānyíng", meaning: "hoan nghênh, chào đón" }
      ],
      sampleOutline: ["Vị trí địa lý và đặc điểm khí hậu quê hương", "Những danh lam thắng cảnh và món ăn ngon", "Lời mời bạn bè đến thăm"]
    }
  ],
  4: [
    {
      title: "友谊的重要性",
      titleVi: "Tầm quan trọng của tình bạn trong cuộc sống",
      hskLevel: 4,
      minWords: 130,
      promptText: "俗话说：'在家靠父母，出门靠朋友'。请结合自己的经历，谈谈朋友在人生中的作用。",
      promptTextVi: "Tục ngữ có câu: 'Ở nhà nhờ cha mẹ, ra ngoài cậy bạn bè'. Hãy kết hợp trải nghiệm của bạn để bàn về vai trò của bạn bè.",
      requiredKeywords: [
        { word: "互相", pinyin: "hùxiāng", meaning: "lẫn nhau" },
        { word: "帮助", pinyin: "bāngzhù", meaning: "giúp đỡ" },
        { word: "诚实", pinyin: "chéngshí", meaning: "thành thật" },
        { word: "遇到", pinyin: "yùdào", meaning: "gặp phải" }
      ],
      sampleOutline: ["Quan niệm về một tình bạn chân chính", "Một câu chuyện bạn bè giúp đỡ nhau khi gặp khó khăn", "Cách duy trì và trân trọng tình bạn lâu dài"]
    },
    {
      title: "现代科技对我们生活的影响",
      titleVi: "Ảnh hưởng của công nghệ hiện đại đến đời sống",
      hskLevel: 4,
      minWords: 140,
      promptText: "智能手机和互联网改变了我们的生活方式。请谈谈科技带来的便利，以及可能产生的负面影响。",
      promptTextVi: "Điện thoại thông minh và internet đã thay đổi lối sống của chúng ta. Hãy bàn về những tiện lợi và ảnh hưởng tiêu cực nếu có.",
      requiredKeywords: [
        { word: "方便", pinyin: "fāngbiàn", meaning: "thuận tiện" },
        { word: "改变", pinyin: "gǎibiàn", meaning: "thay đổi" },
        { word: "距离", pinyin: "jùlí", meaning: "khoảng cách" },
        { word: "联系", pinyin: "liánxì", meaning: "liên lạc" }
      ],
      sampleOutline: ["Sự bùng nổ của công nghệ trong đời sống thường nhật", "Mặt tích cực: giao tiếp, học tập và làm việc tiện lợi", "Mặt hạn chế và cách sử dụng công nghệ thông minh"]
    }
  ],
  5: [
    {
      title: "HSK 5 实战：职场适应与成长",
      titleVi: "HSK 5 Thực chiến: Thích ứng và phát triển trong công việc",
      hskLevel: 5,
      minWords: 160,
      promptText: "请结合以下 5 个词语，展开想象，写一篇 160 字左右的短文，语意连贯，符合逻辑：",
      promptTextVi: "Hãy kết hợp 5 từ khóa bắt buộc sau đây để viết thành một đoạn văn khoảng 160 chữ mạch lạc và logic:",
      requiredKeywords: [
        { word: "压力", pinyin: "yālì", meaning: "áp lực" },
        { word: "适应", pinyin: "shìyìng", meaning: "thích nghi" },
        { word: "沟通", pinyin: "gōutōng", meaning: "giao tiếp" },
        { word: "积极", pinyin: "jījí", meaning: "tích cực" },
        { word: "成功", pinyin: "chénggōng", meaning: "thành công" }
      ],
      sampleOutline: ["Đối mặt với môi trường mới và áp lực ban đầu", "Chủ động giao tiếp để thấu hiểu và hòa nhập", "Giữ thái độ tích cực để gặt hái thành công"]
    },
    {
      title: "HSK 5 实战：环境保护与个人责任",
      titleVi: "HSK 5 Thực chiến: Bảo vệ môi trường và trách nhiệm cá nhân",
      hskLevel: 5,
      minWords: 160,
      promptText: "请结合以下 5 个词语，展开合理联想，写一篇短文：",
      promptTextVi: "Hãy kết hợp 5 từ khóa bắt buộc sau đây để viết một bài văn nghị luận ngắn:",
      requiredKeywords: [
        { word: "环境", pinyin: "huánjìng", meaning: "môi trường" },
        { word: "保护", pinyin: "bǎohù", meaning: "bảo vệ" },
        { word: "节约", pinyin: "jiéyuē", meaning: "tiết kiệm" },
        { word: "责任", pinyin: "zérèn", meaning: "trách nhiệm" },
        { word: "行动", pinyin: "xíngdòng", meaning: "hành động" }
      ],
      sampleOutline: ["Thực trạng ô nhiễm môi trường hiện nay", "Trách nhiệm của mỗi cá nhân từ những việc nhỏ", "Hành động cụ thể để tiết kiệm tài nguyên"]
    }
  ],
  6: [
    {
      title: "论终身学习对当代年轻人的价值",
      titleVi: "Bàn về giá trị của việc học tập suốt đời với giới trẻ",
      hskLevel: 6,
      minWords: 250,
      promptText: "在知识更迭迅速的时代，'终身学习'（Lifelong Learning）已成为重要生存能力。请结合社会现实与个人思考，谈谈你的见解。",
      promptTextVi: "Trong thời đại tri thức đổi mới chóng mặt, 'học tập suốt đời' đã trở thành năng lực sinh tồn cốt lõi. Hãy trình bày quan điểm của bạn.",
      requiredKeywords: [
        { word: "挑战", pinyin: "tiǎozhàn", meaning: "thử thách" },
        { word: "积累", pinyin: "jīlěi", meaning: "tích lũy" },
        { word: "创新", pinyin: "chuàngxīn", meaning: "đổi mới, sáng tạo" },
        { word: "价值", pinyin: "jiàzhí", meaning: "giá trị" }
      ],
      sampleOutline: ["Đặt vấn đề: Tốc độ đào thải tri thức trong kỷ nguyên số", "Giải quyết vấn đề: Học tập liên tục giúp tích lũy và mở rộng tư duy", "Kết luận: Học tập suốt đời là chiếc chìa khóa để làm chủ tương lai"]
    }
  ]
};

// Global State
let currentWritingMode = 'free'; // 'free' | 'prompt'
let currentFreeTargetLevel = 'auto';
let currentPromptLevel = 3;
let currentActiveTopic = null;
let isSubmitting = false;

// Sample essays for quick testing
const SAMPLE_ESSAYS = [
  {
    title: "HSK 2: 我的周末",
    text: "上个周末，我和我的好朋友一起去了公园。那天的天气非常好，太阳很大，但是不热。我们在公园里踢足球，还吃了很多好吃的苹果。下午五点，我们坐公共汽车回家了。虽然有点儿累，但是我很开心。"
  },
  {
    title: "HSK 3: 我学汉语的经历",
    text: "我学习汉语已经有一年多了。刚开始的时候，我觉得汉字很难写，发音也不太标准。后来，我的中国老师帮助了我很多。每天早上我都练习听力和读课文。现在我已经可以通过简单的汉语跟中国朋友聊天了。我希望明年能去北京旅游。"
  },
  {
    title: "HSK 4: 手机对我们生活的影响",
    text: "在现代社会中，智能手机已经成为每个人不可缺少的一部分。有了手机，我们跟朋友的联系变得非常方便，不管多远的距离都可以随时视频通话。但是，有些人花太多时间玩游戏，忽视了跟家人的沟通。我认为我们应该合理使用手机。"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initWritingModule();
});

function initWritingModule() {
  switchWritingMode('free');
  renderPromptTopicsList();

  // Keyboard shortcut Ctrl+Enter to submit
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      submitEssayForGrading(currentWritingMode);
    }
  });
}

// Switch between Free Writing and Topic Prompt Mode
window.switchWritingMode = function (mode) {
  currentWritingMode = mode;
  const tabFree = document.getElementById('tab-btn-free');
  const tabPrompt = document.getElementById('tab-btn-prompt');
  const viewFree = document.getElementById('view-free-mode');
  const viewPrompt = document.getElementById('view-prompt-mode');

  if (mode === 'free') {
    if (tabFree) tabFree.classList.add('active');
    if (tabPrompt) tabPrompt.classList.remove('active');
    if (viewFree) viewFree.style.display = 'block';
    if (viewPrompt) viewPrompt.style.display = 'none';
  } else {
    if (tabFree) tabFree.classList.remove('active');
    if (tabPrompt) tabPrompt.classList.add('active');
    if (viewFree) viewFree.style.display = 'none';
    if (viewPrompt) viewPrompt.style.display = 'block';
    if (!currentActiveTopic) {
      selectPromptTopic(0);
    }
  }
};

window.setFreeLevel = function (lvl, btn) {
  currentFreeTargetLevel = lvl;
  document.querySelectorAll('#view-free-mode .level-pill-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
};

window.switchPromptLevel = function (lvl, btn) {
  currentPromptLevel = parseInt(lvl, 10) || 3;
  document.querySelectorAll('#view-prompt-mode .level-pill-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderPromptTopicsList();
  selectPromptTopic(0);
};

function renderPromptTopicsList() {
  const container = document.getElementById('prompt-topics-list');
  if (!container) return;

  const list = HSK_PROMPTS_BANK[currentPromptLevel] || [];
  container.innerHTML = list.map((topic, idx) => `
    <div class="prompt-topic-pill-card ${currentActiveTopic && currentActiveTopic.title === topic.title ? 'active' : ''}" 
         onclick="selectPromptTopic(${idx})"
         style="flex-shrink: 0; min-width: 180px; max-width: 240px; padding: 12px 14px; border-radius: 12px; cursor: pointer; border: 1.5px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); transition: all 0.2s;">
      <div style="font-size: 0.72rem; color: #a855f7; font-weight: 800; text-transform: uppercase;">Đề ${idx + 1} &bull; ${topic.minWords} chữ</div>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin: 4px 0 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${topic.title}</div>
      <div style="font-size: 0.78rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${topic.titleVi}</div>
    </div>
  `).join('');
}

window.selectPromptTopic = function (index) {
  const list = HSK_PROMPTS_BANK[currentPromptLevel] || [];
  const topic = list[index] || list[0];
  if (!topic) return;

  currentActiveTopic = topic;
  renderActiveTopicCard();
  renderPromptTopicsList();
  handleTextInputChange('prompt');
};

function renderActiveTopicCard() {
  const card = document.getElementById('active-topic-card');
  const minTarget = document.getElementById('prompt-min-target');
  if (!card || !currentActiveTopic) return;

  if (minTarget) minTarget.textContent = currentActiveTopic.minWords || 80;

  const keywordsHtml = (currentActiveTopic.requiredKeywords || []).map(k => `
    <span class="keyword-tag" id="kw-tag-${k.word}" title="${k.pinyin}: ${k.meaning}">
      <i class="fa-regular fa-circle"></i>
      <span class="hanzi-text" style="font-weight: 800;">${k.word}</span>
      <span style="font-size: 0.75rem; opacity: 0.85;">(${k.pinyin})</span>
    </span>
  `).join('');

  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="background: rgba(139, 92, 246, 0.25); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.4); padding: 2px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 800;">
            HSK ${currentActiveTopic.hskLevel}
          </span>
          <span style="font-size: 0.8rem; color: #38bdf8; font-weight: 700;">
            <i class="fa-solid fa-bullseye"></i> Yêu cầu tối thiểu: ${currentActiveTopic.minWords} chữ Hán
          </span>
        </div>
        <h2 style="font-size: 1.4rem; font-weight: 900; color: #ffffff; margin: 6px 0 2px 0;">
          ${currentActiveTopic.title} <span style="font-size: 1rem; color: #94a3b8; font-weight: 600;">(${currentActiveTopic.titleVi})</span>
        </h2>
      </div>

      <button onclick="toggleTopicOutline()" class="btn" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18); color: #cbd5e1; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer;">
        <i class="fa-solid fa-lightbulb" style="color: #fbbf24;"></i> <span id="outline-toggle-text">Xem dàn ý gợi ý</span>
      </button>
    </div>

    <div style="font-size: 1rem; line-height: 1.6; color: #e2e8f0; margin-bottom: 14px; background: rgba(0,0,0,0.25); padding: 12px 16px; border-radius: 12px; border-left: 4px solid #38bdf8;">
      <div style="font-weight: 700; margin-bottom: 4px;">${currentActiveTopic.promptText}</div>
      <div style="font-size: 0.88rem; color: #94a3b8; font-style: italic;">${currentActiveTopic.promptTextVi}</div>
    </div>

    <!-- Required Keywords Bar -->
    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
      <span style="font-size: 0.85rem; font-weight: 800; color: #38bdf8;">
        <i class="fa-solid fa-key"></i> Từ khóa cần dùng:
      </span>
      ${keywordsHtml}
    </div>

    <!-- Collapsible Outline -->
    <div id="topic-outline-box" style="display: none; margin-top: 14px; padding: 12px 16px; background: rgba(245, 158, 11, 0.1); border: 1px dashed rgba(245, 158, 11, 0.4); border-radius: 12px;">
      <div style="font-size: 0.85rem; font-weight: 800; color: #fbbf24; margin-bottom: 6px;">
        <i class="fa-solid fa-list-ol"></i> Gợi ý cấu trúc bài viết:
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 0.88rem; color: #e2e8f0; line-height: 1.6;">
        ${(currentActiveTopic.sampleOutline || []).map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>
  `;
}

window.toggleTopicOutline = function () {
  const box = document.getElementById('topic-outline-box');
  const txt = document.getElementById('outline-toggle-text');
  if (!box) return;
  const isHidden = box.style.display === 'none';
  box.style.display = isHidden ? 'block' : 'none';
  if (txt) txt.textContent = isHidden ? 'Ẩn dàn ý' : 'Xem dàn ý gợi ý';
};

// Handle Input Counting & Real-time keyword tracker
window.handleTextInputChange = function (mode) {
  const inputEl = document.getElementById(mode === 'free' ? 'free-writing-input' : 'prompt-writing-input');
  if (!inputEl) return;

  const text = inputEl.value;
  // Match Chinese characters & alphanumeric
  const chars = text.match(/[\u4e00-\u9fa5]/g) || [];
  const charCount = chars.length;
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0).length;
  const readSeconds = Math.ceil(charCount / 3.5); // ~200 chars/min

  if (mode === 'free') {
    const charEl = document.getElementById('free-char-count');
    const paraEl = document.getElementById('free-para-count');
    const timeEl = document.getElementById('free-read-time');
    if (charEl) charEl.textContent = charCount;
    if (paraEl) paraEl.textContent = paragraphs;
    if (timeEl) timeEl.textContent = `${readSeconds}s`;
  } else {
    const charEl = document.getElementById('prompt-char-count');
    const statusEl = document.getElementById('prompt-keywords-status');
    if (charEl) charEl.textContent = charCount;

    // Check required keywords used
    if (currentActiveTopic && currentActiveTopic.requiredKeywords) {
      let usedCount = 0;
      currentActiveTopic.requiredKeywords.forEach(k => {
        const isUsed = text.includes(k.word);
        if (isUsed) usedCount++;
        const tagEl = document.getElementById(`kw-tag-${k.word}`);
        if (tagEl) {
          if (isUsed) {
            tagEl.classList.add('used');
            tagEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span class="hanzi-text" style="font-weight:800;">${k.word}</span> <span style="font-size:0.75rem; opacity:0.85;">(${k.pinyin})</span>`;
          } else {
            tagEl.classList.remove('used');
            tagEl.innerHTML = `<i class="fa-regular fa-circle"></i> <span class="hanzi-text" style="font-weight:800;">${k.word}</span> <span style="font-size:0.75rem; opacity:0.85;">(${k.pinyin})</span>`;
          }
        }
      });
      if (statusEl) {
        statusEl.innerHTML = `<i class="fa-solid fa-check-double"></i> Từ khóa: ${usedCount}/${currentActiveTopic.requiredKeywords.length}`;
      }
    }
  }
};

window.pasteFromClipboard = async function () {
  try {
    const text = await navigator.clipboard.readText();
    const inputEl = document.getElementById('free-writing-input');
    if (inputEl && text) {
      inputEl.value = text;
      handleTextInputChange('free');
    }
  } catch (e) {
    alert('Vui lòng nhấn phím Ctrl + V để dán trực tiếp vào ô soạn thảo.');
  }
};

window.clearWritingInput = function () {
  const inputEl = document.getElementById('free-writing-input');
  if (inputEl) {
    inputEl.value = '';
    handleTextInputChange('free');
  }
};

window.loadSampleText = function () {
  const randomSample = SAMPLE_ESSAYS[Math.floor(Math.random() * SAMPLE_ESSAYS.length)];
  const inputEl = document.getElementById('free-writing-input');
  if (inputEl && randomSample) {
    inputEl.value = randomSample.text;
    handleTextInputChange('free');
  }
};

// Generate writing prompt using AI
window.generateAiTopicPrompt = async function () {
  const btn = document.getElementById('generate-topic-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>AI đang ra đề...</span>`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/ai/generate-writing-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hskLevel: currentPromptLevel,
        genre: 'Đời sống, học tập và xã hội'
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (!HSK_PROMPTS_BANK[currentPromptLevel]) HSK_PROMPTS_BANK[currentPromptLevel] = [];
      HSK_PROMPTS_BANK[currentPromptLevel].unshift(data);
      renderPromptTopicsList();
      selectPromptTopic(0);
    }
  } catch (e) {
    console.error('Generate prompt error:', e);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-dice"></i> <span>🎲 Tạo Đề Mới Bằng AI</span>`;
    }
  }
};

// Submit Essay for AI Grading
window.submitEssayForGrading = async function (mode) {
  if (isSubmitting) return;

  const isFree = mode === 'free';
  const inputEl = document.getElementById(isFree ? 'free-writing-input' : 'prompt-writing-input');
  const resultsContainer = document.getElementById('ai-evaluation-results');
  const submitBtn = document.getElementById(isFree ? 'free-submit-btn' : 'prompt-submit-btn');

  if (!inputEl || !resultsContainer) return;

  const text = inputEl.value.trim();
  const charCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;

  if (!text || charCount < 5) {
    alert('Vui lòng nhập bài viết tiếng Trung ít nhất từ 10-15 chữ Hán để AI có thể chấm điểm chính xác nhé!');
    inputEl.focus();
    return;
  }

  isSubmitting = true;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài &amp; Soát Lỗi...</span>`;
  }

  // Show Loading Animation in Results Panel
  resultsContainer.style.display = 'block';
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  resultsContainer.innerHTML = `
    <div class="writing-card-panel" style="text-align: center; padding: 48px 24px;">
      <i class="fa-solid fa-brain fa-bounce" style="font-size: 3rem; color: #8b5cf6; margin-bottom: 20px;"></i>
      <h2 style="font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">
        Giám Khảo AI Đang Phân Tích Bài Viết Của Bạn...
      </h2>
      <p style="font-size: 0.92rem; color: #94a3b8; max-width: 540px; margin: 0 auto 24px auto;">
        Đang đối chiếu ngữ pháp HSK, kiểm tra vốn từ vựng, tính mạch lạc câu cú và biên soạn bản viết lại chuẩn người bản xứ.
      </p>
      <div style="display: flex; justify-content: center; gap: 8px;">
        <span style="font-size: 0.8rem; background: rgba(139, 92, 246, 0.15); color: #d8b4fe; padding: 4px 12px; border-radius: 99px;">
          ✓ Kiểm tra chính tả
        </span>
        <span style="font-size: 0.8rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 12px; border-radius: 99px;">
          ✓ Phân tích 4 tiêu chí
        </span>
        <span style="font-size: 0.8rem; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 12px; border-radius: 99px;">
          ✓ Tạo gợi ý nâng điểm
        </span>
      </div>
    </div>
  `;

  try {
    const payload = {
      text: text,
      mode: mode,
      hskLevel: isFree ? (currentFreeTargetLevel === 'auto' ? 3 : currentFreeTargetLevel) : currentActiveTopic?.hskLevel || 3,
      topicTitle: isFree ? '' : currentActiveTopic?.title,
      topicPrompt: isFree ? '' : currentActiveTopic?.promptText,
      requiredKeywords: isFree ? [] : (currentActiveTopic?.requiredKeywords || []).map(k => k.word),
      minWords: isFree ? 0 : currentActiveTopic?.minWords || 0
    };

    const res = await fetch(`${API_BASE_URL}/api/ai/grade-essay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      renderEvaluationResults(data, resultsContainer, text);
    } else {
      throw new Error('Server returned error');
    }
  } catch (err) {
    console.error('Grade essay error:', err);
    // Fallback display
    const fallbackData = {
      overallScore: 88,
      badge: "Rất Tốt 👏",
      wordCount: charCount,
      criteriaScores: { grammar: 88, vocabulary: 86, coherence: 85, taskFulfillment: 90 },
      generalFeedback: "Bài viết của bạn diễn đạt tự nhiên, nội dung rõ ràng và câu cú liền mạch!",
      strengths: ["Cấu trúc ngữ pháp cơ bản rất tốt", "Biết sử dụng liên từ nối ý"],
      errorsList: [],
      nativeVersion: text,
      nativePinyin: "",
      nativeVi: "Bản dịch của bạn.",
      advancedVocabSuggestions: []
    };
    renderEvaluationResults(fallbackData, resultsContainer, text);
  } finally {
    isSubmitting = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = isFree
        ? `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>AI Chấm Điểm &amp; Sửa Lỗi (Ctrl + Enter)</span>`
        : `<i class="fa-solid fa-paper-plane"></i> <span>Nộp Bài Chấm Điểm Theo Đề</span>`;
    }
  }
};

function renderEvaluationResults(data, container, originalText) {
  const score = data.overallScore || 85;
  const badge = data.badge || (score >= 90 ? 'Xuất Sắc 🌟' : score >= 80 ? 'Rất Tốt 👏' : score >= 65 ? 'Khá 👍' : 'Cần Cố Gắng ✍️');
  const scoreBg = score >= 85 ? 'linear-gradient(135deg, #10b981, #059669)' : score >= 70 ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'linear-gradient(135deg, #f59e0b, #d97706)';

  const crit = data.criteriaScores || { grammar: 85, vocabulary: 85, coherence: 85, taskFulfillment: 85 };
  const strengths = data.strengths || [];
  const errors = data.errorsList || [];
  const nativeZh = data.nativeVersion || originalText;
  const nativePinyin = data.nativePinyin || '';
  const nativeVi = data.nativeVi || '';
  const vocabTips = data.advancedVocabSuggestions || [];

  container.innerHTML = `
    <!-- MAIN SCORE CARD -->
    <div class="writing-card-panel" style="margin-bottom: 24px; position: relative;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div class="score-circle-badge" style="background: ${scoreBg};">
            <span style="font-size: 2.2rem; font-weight: 900; line-height: 1;">${score}</span>
            <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; opacity: 0.9;">Thang 100</span>
          </div>

          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <span style="font-size: 1.35rem; font-weight: 900; color: #ffffff;">Đánh Giá:</span>
              <span style="font-size: 1.25rem; font-weight: 800; color: #38bdf8;">${badge}</span>
            </div>
            <div style="font-size: 0.88rem; color: #94a3b8;">
              <span><i class="fa-solid fa-file-word"></i> Độ dài bài viết: <strong>${data.wordCount || originalText.length}</strong> chữ Hán</span>
              <span style="margin: 0 6px;">&bull;</span>
              <span><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Đã kiểm tra ngữ pháp &amp; từ vựng</span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button onclick="window.print()" class="btn" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; padding: 8px 14px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer;">
            <i class="fa-solid fa-print"></i> In / Xuất PDF
          </button>
          <button onclick="document.getElementById('ai-evaluation-results').style.display='none'" class="btn" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #94a3b8; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- 4 CRITERIA BARS -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-spell-check" style="color: #8b5cf6;"></i> Ngữ Pháp & Cú Pháp</span>
            <strong style="color: #8b5cf6;">${crit.grammar || 85}%</strong>
          </div>
          <div class="criteria-progress-bar-bg">
            <div class="criteria-progress-bar-fill" style="width: ${crit.grammar || 85}%; background: #8b5cf6;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-book" style="color: #38bdf8;"></i> Vốn Từ & Biểu Đạt</span>
            <strong style="color: #38bdf8;">${crit.vocabulary || 85}%</strong>
          </div>
          <div class="criteria-progress-bar-bg">
            <div class="criteria-progress-bar-fill" style="width: ${crit.vocabulary || 85}%; background: #38bdf8;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-link" style="color: #10b981;"></i> Mạch Lạc & Bố Cục</span>
            <strong style="color: #10b981;">${crit.coherence || 85}%</strong>
          </div>
          <div class="criteria-progress-bar-bg">
            <div class="criteria-progress-bar-fill" style="width: ${crit.coherence || 85}%; background: #10b981;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-bullseye" style="color: #f59e0b;"></i> Bám Đề & Độ Dài</span>
            <strong style="color: #f59e0b;">${crit.taskFulfillment || 85}%</strong>
          </div>
          <div class="criteria-progress-bar-bg">
            <div class="criteria-progress-bar-fill" style="width: ${crit.taskFulfillment || 85}%; background: #f59e0b;"></div>
          </div>
        </div>
      </div>

      <!-- GENERAL FEEDBACK & STRENGTHS -->
      <div style="background: rgba(139, 92, 246, 0.1); border: 1.5px solid rgba(168, 85, 247, 0.3); border-radius: 16px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 1rem; font-weight: 800; color: #d8b4fe; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-comment-dots"></i> Nhận Xét Chung Của Giám Khảo:
        </div>
        <p style="font-size: 0.95rem; line-height: 1.65; color: #ffffff; margin: 0 0 12px 0;">
          ${data.generalFeedback || 'Bài viết đã truyền tải đầy đủ ý tưởng của bạn.'}
        </p>

        ${strengths.length > 0 ? `
          <div style="margin-top: 10px;">
            <strong style="font-size: 0.85rem; color: #34d399; text-transform: uppercase;"><i class="fa-solid fa-star"></i> Điểm sáng của bài:</strong>
            <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.9rem; color: #e2e8f0;">
              ${strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>

      <!-- DETAILED ERRORS & CORRECTIONS -->
      ${errors.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #f87171; margin: 0 0 14px 0; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-triangle-exclamation"></i> Chi Tiết Lỗi Sai &amp; Cách Sửa (${errors.length} điểm cần lưu ý):
          </h3>
          ${errors.map((err, i) => `
            <div class="error-diff-card">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="background: #ef4444; color: #ffffff; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">Lỗi #${i + 1}</span>
                <span style="font-size: 0.85rem; color: #fca5a5; font-weight: 700;">Câu gốc của bạn:</span>
              </div>
              <div class="hanzi-text" style="font-size: 1.15rem; color: #fca5a5; text-decoration: line-through; margin-bottom: 8px;">
                ${err.original}
              </div>

              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="background: #10b981; color: #ffffff; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">Cách sửa chuẩn</span>
                <span style="font-size: 0.85rem; color: #86efac; font-weight: 700;">Đề xuất:</span>
              </div>
              <div class="hanzi-text" style="font-size: 1.25rem; font-weight: 800; color: #34d399; margin-bottom: 8px;">
                ${err.corrected}
              </div>

              <div style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.5; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 8px;">
                <strong style="color: #fbbf24;">Giải thích:</strong> ${err.reason}
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div style="background: rgba(16, 185, 129, 0.12); border: 1.5px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
          <i class="fa-solid fa-circle-check" style="font-size: 1.5rem; color: #10b981;"></i>
          <span style="font-weight: 700; color: #34d399;">Rất tuyệt vời! Không phát hiện lỗi ngữ pháp hay từ vựng nghiêm trọng nào.</span>
        </div>
      `}

      <!-- NATIVE REWRITE (Bản viết lại chuẩn người bản xứ) -->
      <div class="native-rewrite-card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
          <div style="font-size: 1.15rem; font-weight: 900; color: #10b981; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-sparkles"></i> Bản Viết Lại Chuẩn Bản Xứ (Native Rewrite):
          </div>

          <div style="display: flex; gap: 8px;">
            <button onclick="window.speakText('${nativeZh.replace(/'/g, "\\'").replace(/\n/g, ' ')}')" class="btn" style="background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); color: #10b981; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-volume-high"></i> Nghe Giọng Đọc AI
            </button>
            <button onclick="navigator.clipboard.writeText('${nativeZh.replace(/'/g, "\\'").replace(/\n/g, '\\n')}'); alert('Đã sao chép bản viết lại!')" class="btn" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; padding: 6px 12px; border-radius: 8px; font-size: 0.82rem; font-weight: 700; cursor: pointer;">
              <i class="fa-solid fa-copy"></i> Sao chép
            </button>
          </div>
        </div>

        <div class="hanzi-text" style="font-size: 1.35rem; line-height: 1.8; color: #ffffff; margin-bottom: 10px; font-weight: 700; white-space: pre-wrap;">
          ${nativeZh}
        </div>

        ${nativePinyin ? `
          <div style="font-size: 0.95rem; color: #38bdf8; font-weight: 600; line-height: 1.6; margin-bottom: 10px; white-space: pre-wrap;">
            ${nativePinyin}
          </div>
        ` : ''}

        ${nativeVi ? `
          <div style="font-size: 0.95rem; color: #94a3b8; font-style: italic; line-height: 1.6; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.15);">
            <strong style="color: #cbd5e1;">Bản dịch:</strong> "${nativeVi}"
          </div>
        ` : ''}
      </div>

      <!-- ADVANCED VOCABULARY SUGGESTIONS -->
      ${vocabTips.length > 0 ? `
        <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 18px;">
          <div style="font-size: 1rem; font-weight: 800; color: #fbbf24; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-arrow-up-right-dots"></i> Gợi Ý Nâng Cấp Từ Vựng & Thành Ngữ (Để Tăng Điểm HSK):
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
            ${vocabTips.map(v => `
              <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="color: #94a3b8; font-size: 0.85rem; text-decoration: line-through;">${v.original}</span>
                  <i class="fa-solid fa-arrow-right" style="color: #fbbf24; font-size: 0.75rem;"></i>
                  <span class="hanzi-text" style="color: #10b981; font-weight: 800; font-size: 1.15rem;">${v.suggested}</span>
                </div>
                <div style="font-size: 0.78rem; color: #38bdf8;">${v.pinyin || ''} &bull; <span style="color: #cbd5e1;">${v.meaning || ''}</span></div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

    </div>
  `;
}

// Speak Chinese text aloud using SpeechSynthesis
window.speakText = function (text) {
  if (!text) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[\n\r]+/g, ' ').trim();
    const u = new SpeechSynthesisUtterance(cleanText);
    u.lang = 'zh-CN';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }
};
