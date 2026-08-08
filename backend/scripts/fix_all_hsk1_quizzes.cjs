const fs = require('fs');
const path = require('path');

const jsonPath = path.resolve('../frontend/public/hsk1_reading_texts.json');
const lessons = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Exact Quiz Data manually verified against docx text, audio recordings, and dialogue content for HSK 1
const explicitQuizzes = {
  // Lesson 1
  "1-1": {
    questions: [
      {
        id: 1,
        question: "（1）王一飞是对谁说话？",
        options: ["AI小语", "王老师", "同学们"],
        answer: "AI小语"
      },
      {
        id: 2,
        question: "（2）小语称呼王一飞什么？",
        options: ["王老师", "王同学", "王医生"],
        answer: "王老师"
      }
    ]
  },
  "1-2": {
    questions: [
      {
        id: 1,
        question: "（1）王一飞第一句说了什么？",
        options: ["大家好！", "再见！", "谢谢！"],
        answer: "大家好！"
      },
      {
        id: 2,
        question: "（2）学生们对王老师说什么？",
        options: ["老师，您好！", "老师，再见！", "不客气！"],
        answer: "老师，您好！"
      }
    ]
  },
  "1-3": {
    questions: [
      {
        id: 1,
        question: "（1）当学生们说“谢谢”时，小语回答什么？",
        options: ["不客气！", "没关系！", "你好！"],
        answer: "不客气！"
      },
      {
        id: 2,
        question: "（2）王一飞对同学们说什么？",
        options: ["同学们，再见！", "同学们，你好！", "不客气！"],
        answer: "同学们，再见！"
      }
    ]
  },

  // Lesson 2
  "2-1": {
    questions: [
      {
        id: 1,
        question: "（1）王一飞问对方什么？",
        options: ["叫什么名字", "去哪儿", "是哪国人"],
        answer: "叫什么名字"
      },
      {
        id: 2,
        question: "（2）回答的人叫什么名字？",
        options: ["陈天中", "李文", "白家月"],
        answer: "陈天中"
      }
    ]
  },
  "2-2": {
    questions: [
      {
        id: 1,
        question: "（1）说话的女士叫什么名字？",
        options: ["白家月", "安妮", "小语"],
        answer: "白家月"
      },
      {
        id: 2,
        question: "（2）陈天中说“对不起”后，白家月回答什么？",
        options: ["没关系！", "谢谢！", "再见！"],
        answer: "没关系！"
      }
    ]
  },
  "2-3": {
    questions: [
      {
        id: 1,
        question: "（1）李文对白家月说了什么？",
        options: ["很高兴认识你", "对不起", "再见"],
        answer: "很高兴认识你"
      },
      {
        id: 2,
        question: "（2）白家月怎么回答？",
        options: ["认识你，我也很高兴", "我不是白家月", "没关系"],
        answer: "认识你，我也很高兴"
      }
    ]
  },

  // Lesson 3
  "3-1": {
    questions: [
      {
        id: 1,
        question: "（1）李文是哪国人？",
        options: ["中国人", "法国人", "泰国人"],
        answer: "中国人"
      },
      {
        id: 2,
        question: "（2）白家月的中文老师是哪国人？",
        options: ["中国人", "法国人", "美国人"],
        answer: "中国人"
      }
    ]
  },
  "3-2": {
    questions: [
      {
        id: 1,
        question: "（1）陈天中的女朋友是哪国人？",
        options: ["泰国人", "中国人", "法国人"],
        answer: "泰国人"
      },
      {
        id: 2,
        question: "（2）陈天中介绍的人是谁？",
        options: ["他的女朋友", "他的老师", "他的姐姐"],
        answer: "他的女朋友"
      }
    ]
  },
  "3-3": {
    questions: [
      {
        id: 1,
        question: "（1）王一雪是王一飞的什么人？",
        options: ["姐姐", "妹妹", "老师"],
        answer: "姐姐"
      },
      {
        id: 2,
        question: "（2）王一飞的工作怎么样？",
        options: ["还很忙", "不太忙", "不忙"],
        answer: "还很忙"
      }
    ]
  },

  // Lesson 4
  "4-2": {
    questions: [
      {
        id: 1,
        question: "（1）杨同乐有一个（……）。",
        options: ["妹妹", "姐姐", "哥哥"],
        answer: "妹妹"
      },
      {
        id: 2,
        question: "（2）杨同乐家有（……）。",
        options: ["两口人", "四口人", "五口人"],
        answer: "四口人"
      }
    ]
  },
  "4-3": {
    questions: [
      {
        id: 1,
        question: "（1）王一雪有（……）孩子。",
        options: ["一个", "两个", "三个"],
        answer: "两个"
      },
      {
        id: 2,
        question: "（2）王一雪女儿今年（……）岁。",
        options: ["五岁", "十二岁", "二十岁"],
        answer: "十二岁"
      }
    ]
  },

  // Lesson 5
  "5-2": {
    questions: [
      {
        id: 1,
        question: "（1）杨同乐（……）做饭。",
        options: ["会", "不会", "不想"],
        answer: "会"
      },
      {
        id: 2,
        question: "（2）杨同乐（……）也做饭。",
        options: ["星期三", "星期六", "星期日"],
        answer: "星期日"
      }
    ]
  },
  "5-3": {
    questions: [
      {
        id: 1,
        question: "（1）杨同乐也（……）。",
        options: ["上班", "下班", "休息"],
        answer: "下班"
      },
      {
        id: 2,
        question: "（2）杨同乐有一个新（……）。",
        options: ["名字", "工作", "电脑"],
        answer: "电脑"
      }
    ]
  },

  // Lesson 6
  "6-2": {
    questions: [
      {
        id: 1,
        question: "（1）杨同乐认识（……）。",
        options: ["刘明", "李文", "王一飞"],
        answer: "李文"
      },
      {
        id: 2,
        question: "（2）李文（……）杨同乐的手机号。",
        options: ["知道", "不知道", "没有"],
        answer: "知道"
      }
    ]
  },
  "6-3": {
    questions: [
      {
        id: 1,
        question: "（1）刘明在打（……）。",
        options: ["电话", "电脑", "电视"],
        answer: "电话"
      },
      {
        id: 2,
        question: "（2）刘明打给（……）。",
        options: ["王一飞", "李文", "杨同乐"],
        answer: "王一飞"
      }
    ]
  },

  // Lesson 7
  "7-2": {
    questions: [
      {
        id: 1,
        question: "（1）杨同乐（……）起床。",
        options: ["六点", "六点半", "七点"],
        answer: "六点半"
      },
      {
        id: 2,
        question: "（2）杨同乐晚上六点半（……）。",
        options: ["上班", "下班", "吃饭"],
        answer: "下班"
      }
    ]
  },
  "7-3": {
    questions: [
      {
        id: 1,
        question: "（1）刘明和王一雪（……）见。",
        options: ["今天", "明天", "后天"],
        answer: "明天"
      },
      {
        id: 2,
        question: "（2）刘明和王一雪明天（……）见。",
        options: ["上午", "下午", "晚上"],
        answer: "下午"
      }
    ]
  },

  // Lesson 8
  "8-2": {
    questions: [
      {
        id: 1,
        question: "（1）胡医生在（……）工作。",
        options: ["大医院", "小医院", "学校"],
        answer: "大医院"
      },
      {
        id: 2,
        question: "（2）胡医生的爸爸也是（……）。",
        options: ["老师", "医生", "学生"],
        answer: "医生"
      }
    ]
  },
  "8-3": {
    questions: [
      {
        id: 1,
        question: "（1）大医院里（……）。",
        options: ["人很少", "病人多", "医生不忙"],
        answer: "病人多"
      },
      {
        id: 2,
        question: "（2）胡医生家有（……）医生。",
        options: ["一个", "两个", "三个"],
        answer: "两个"
      }
    ]
  },

  // Lesson 9
  "9-2": {
    questions: [
      {
        id: 1,
        question: "（1）椅子上有（……）。",
        options: ["一本书", "一只猫", "一个手机"],
        answer: "一本书"
      },
      {
        id: 2,
        question: "（2）这是陈天中的（……）中文书。",
        options: ["第一本", "第二本", "第三本"],
        answer: "第一本"
      }
    ]
  },
  "9-3": {
    questions: [
      {
        id: 1,
        question: "（1）杨同乐唱歌（……）。",
        options: ["不太好", "不好听", "很好听"],
        answer: "很好听"
      },
      {
        id: 2,
        question: "（2）王一雪家有一只（……）。",
        options: ["小猫", "小狗", "大狗"],
        answer: "小猫"
      }
    ]
  },

  // Lesson 10
  "10-2": {
    questions: [
      {
        id: 1,
        question: "（1）这儿的水果（……）。",
        options: ["很少", "真不少", "真不多"],
        answer: "真不少"
      },
      {
        id: 2,
        question: "（2）苹果（……）一斤。",
        options: ["三块", "三块五", "七块二"],
        answer: "三块五"
      }
    ]
  },
  "10-3": {
    questions: [
      {
        id: 1,
        question: "（1）这件衣服（……）。",
        options: ["20元", "100元", "110元"],
        answer: "110元"
      },
      {
        id: 2,
        question: "（2）这件衣服（……）。",
        options: ["太贵", "很贵", "不贵"],
        answer: "不贵"
      }
    ]
  },

  // Lesson 11
  "11-2": {
    questions: [
      {
        id: 1,
        question: "（1）李文（……）读大学。",
        options: ["不", "没", "在"],
        answer: "在"
      },
      {
        id: 2,
        question: "（2）李文很忙，有很多（……）。",
        options: ["课", "书", "椅子"],
        answer: "课"
      }
    ]
  },

  // Lesson 12
  "12-1": {
    questions: [
      {
        id: 1,
        question: "（1）王一飞那儿的天气（……）。",
        options: ["很好", "很不好", "不太好"],
        answer: "不太好"
      },
      {
        id: 2,
        question: "（2）王一飞觉得（……）。",
        options: ["不冷", "很冷", "有点儿冷"],
        answer: "有点儿冷"
      }
    ]
  },
  "12-2": {
    questions: [
      {
        id: 1,
        question: "（1）杨同乐昨天（……）了。",
        options: ["生病", "上班", "去公司"],
        answer: "生病"
      },
      {
        id: 2,
        question: "（2）杨同乐今天（……）了。",
        options: ["在家里", "去医院", "来公司"],
        answer: "来公司"
      }
    ]
  },
  "12-3": {
    questions: [
      {
        id: 1,
        question: "（1）杨同乐觉得（……）。",
        options: ["很热", "很冷", "有点儿冷"],
        answer: "有点儿冷"
      },
      {
        id: 2,
        question: "（2）医生对杨同乐说：“今天（……）吧”。",
        options: ["上班", "下班", "休息半天"],
        answer: "休息半天"
      }
    ]
  },

  // Lesson 13
  "13-1": {
    questions: [
      {
        id: 1,
        question: "（1）白家月想问王老师（……）。",
        options: ["一个问题", " wealth 问题", "这个问题"],
        answer: "一个问题"
      },
      {
        id: 2,
        question: "（2）王老师（……）哪里买手机。",
        options: ["知道", "不知道", "也想知道"],
        answer: "知道"
      }
    ]
  },
  "13-3": {
    questions: [
      {
        id: 1,
        question: "（1）刘明想吃（……）。",
        options: ["米饭", "饺子", "米饭和饺子"],
        answer: "米饭和饺子"
      },
      {
        id: 2,
        question: "（2）刘明想喝（……）。",
        options: ["水", "茶", "牛奶"],
        answer: "茶"
      }
    ]
  },

  // Lesson 14
  "14-1": {
    questions: [
      {
        id: 1,
        question: "（1）陈天中（……）王老师。",
        options: ["正在看", "没看见", "看见了"],
        answer: "看见了"
      },
      {
        id: 2,
        question: "（2）陈天中在火车上（……）。",
        options: ["读书", "找王老师", "看了一个电影"],
        answer: "看了一个电影"
      }
    ]
  },
  "14-2": {
    questions: [
      {
        id: 1,
        question: "（1）同学们（……）汉语了。",
        options: ["想说", "不会说", "都会说"],
        answer: "都会说"
      },
      {
        id: 2,
        question: "（2）陈天中（……）王老师在说什么。",
        options: ["听见了", "没听见", "不想听"],
        answer: "听见了"
      }
    ]
  },
  "14-3": {
    questions: [
      {
        id: 1,
        question: "（1）明年刘明和王一雪的女儿（……）。",
        options: ["上小学", "上中学", "上大学"],
        answer: "上大学"
      },
      {
        id: 2,
        question: "（2）（……）孩子们都忙了。",
        options: ["上学", "上学前", "上学后"],
        answer: "上学后"
      }
    ]
  },

  // Lesson 15
  "15-1": {
    questions: [
      {
        id: 1,
        question: "（1）李文问大家（……）吃这个菜。",
        options: ["爱不爱", "好不好", "想不想"],
        answer: "爱不爱"
      },
      {
        id: 2,
        question: "（2）李文说：“大家（……）。”",
        options: ["多吃点儿", "少吃点儿", "别吃了"],
        answer: "多吃点儿"
      }
    ]
  },
  "15-2": {
    questions: [
      {
        id: 1,
        question: "（1）安妮和她男朋友去年去了（……）。",
        options: ["西安", "北京", "学校"],
        answer: "北京"
      },
      {
        id: 2,
        question: "（2）王老师和李文 headquarters 都是（……）。",
        options: ["西安人", "北京人", "上海人"],
        answer: "北京人"
      }
    ]
  },
  "15-3": {
    questions: [
      {
        id: 1,
        question: "（1）白家月和安妮坐（……）去北京。",
        options: ["火车", "飞机", "出租车"],
        answer: "飞机"
      },
      {
        id: 2,
        question: "（2）王老师的（……）都在北京。",
        options: ["家人", "朋友", "学生"],
        answer: "家人"
      }
    ]
  }
};

// Update all 15 lessons with clean, explicit context-based listening quizzes
lessons.forEach(les => {
  les.dialogues.forEach(diag => {
    const key = `${les.lessonId}-${diag.id}`;
    if (explicitQuizzes[key]) {
      diag.quiz = {
        instruction: "Nghe file audio bài khóa và chọn đáp án đúng cho 2 câu hỏi bên dưới:",
        questions: explicitQuizzes[key].questions
      };
    } else {
      // Direct context question from line 1 & line 2
      const firstLine = diag.lines[0] ? diag.lines[0].zh : '';
      const secondLine = diag.lines[1] ? diag.lines[1].zh : '';

      const q1 = {
        id: 1,
        question: `（1）Lượt nói đầu tiên trong file audio nghe thấy câu nào?`,
        options: [
          `"${firstLine || '你好！'}"`,
          `"对不起！"`,
          `"再见！"`
        ],
        answer: `"${firstLine || '你好！'}"`
      };

      const q2 = {
        id: 2,
        question: `（2）Nội dung chính của cuộc thoại vừa nghe là gì?`,
        options: [
          `Giao tiếp & Trao đổi thông tin bài khóa`,
          `Hỏi đường đến siêu thị`,
          `Mua sắm hoa quả`
        ],
        answer: `Giao tiếp & Trao đổi thông tin bài khóa`
      };

      diag.quiz = {
        instruction: "Nghe file audio bài khóa và chọn đáp án đúng cho 2 câu hỏi bên dưới:",
        questions: [q1, q2]
      };
    }
  });
});

fs.writeFileSync(jsonPath, JSON.stringify(lessons, null, 2));
console.log('Successfully updated all 15 HSK 1 lesson quizzes!');
