// Data for accompanying lesson videos (YouTube) for HSK Curriculum
// "Có những bài có, có những bài không có, đó là điều bình thường"

export const HSK_LESSON_EXTRA_VIDEOS = {
  "3.0": {
    "1": {
      1: {
        youtubeId: "g-0HdaYr-f4",
        url: "https://youtu.be/g-0HdaYr-f4",
        title: "Bài 1: AI小语，你好！ (Chào hỏi trong tiếng Trung)",
        desc: "Video bài giảng chi tiết Bài 1 giáo trình HSK 1 chuẩn 3.0: Hướng dẫn phát âm, chào hỏi cơ bản, từ vựng và khẩu hình chuẩn."
      },
      2: {
        youtubeId: "oYcVrAhwE7Q",
        url: "https://youtu.be/oYcVrAhwE7Q",
        title: "Bài 2: 这是什么？ (Đây là cái gì?)",
        desc: "Video bài giảng chi tiết Bài 2 giáo trình HSK 1 chuẩn 3.0: Hỏi đồ vật, đại từ chỉ thị 这 / 那 và ngữ cảnh giao tiếp."
      },
      4: {
        youtubeId: "4TnHieg2A5s",
        url: "https://youtu.be/4TnHieg2A5s",
        title: "Bài 4: 你喝什么？ (Bạn uống gì?)",
        desc: "Video bài giảng chi tiết Bài 4 giáo trình HSK 1 chuẩn 3.0: Giao tiếp gọi đồ uống, hội thoại đời sống hàng ngày."
      },
      5: {
        youtubeId: "EMQ5TAM5J6M",
        url: "https://youtu.be/EMQ5TAM5J6M",
        title: "Bài 5: 我有三个苹果 (Tôi có 3 quả táo)",
        desc: "Video bài giảng chi tiết Bài 5 giáo trình HSK 1 chuẩn 3.0: Diễn đạt số lượng, số từ và lượng từ trong tiếng Trung."
      },
      7: {
        youtubeId: "FdA_DivfzBY",
        url: "https://youtu.be/FdA_DivfzBY",
        title: "Bài 7: 我会说汉语 (Tôi biết nói tiếng Trung)",
        desc: "Video bài giảng chi tiết Bài 7 giáo trình HSK 1 chuẩn 3.0: Động từ năng nguyện 会, diễn tả kỹ năng và năng lực."
      },
      13: {
        youtubeId: "ldUATGMt2nc",
        url: "https://youtu.be/ldUATGMt2nc",
        title: "Bài 13: 请给我一杯茶 (Làm ơn cho tôi một cốc trà)",
        desc: "Video bài giảng chi tiết Bài 13 giáo trình HSK 1 chuẩn 3.0: Cấu trúc câu hai tân ngữ và câu cầu khiến lịch sự."
      },
      15: {
        youtubeId: "S9kSsDBM8Mw",
        url: "https://youtu.be/S9kSsDBM8Mw",
        title: "Bài 15: 大兴机场见 (Hẹn gặp ở sân bay Đại Hưng)",
        desc: "Video bài giảng chi tiết Bài 15 giáo trình HSK 1 chuẩn 3.0: Hẹn gặp, địa điểm, phương hướng và tổng kết khóa HSK 1."
      }
    }
  }
};

/**
 * Returns the extra video object for a given level, lessonId, and version.
 * Returns null if the lesson doesn't have an accompanying video.
 */
export function getLessonExtraVideo(level, lessonId, version = '3.0') {
  const ver = String(version || '3.0');
  const lvl = String(level || '1');
  const numId = parseInt(String(lessonId).replace(/\D/g, ''), 10) || 1;

  const verObj = HSK_LESSON_EXTRA_VIDEOS[ver];
  if (!verObj) return null;
  const lvlObj = verObj[lvl];
  if (!lvlObj) return null;

  return lvlObj[numId] || null;
}

// Attach to window object for global accessibility across scripts
if (typeof window !== 'undefined') {
  window.HSK_LESSON_EXTRA_VIDEOS = HSK_LESSON_EXTRA_VIDEOS;
  window.getLessonExtraVideo = getLessonExtraVideo;
}
