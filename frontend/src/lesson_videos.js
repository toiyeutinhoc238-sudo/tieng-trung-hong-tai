// Data for accompanying lesson videos (YouTube) for HSK Curriculum
// "Có những bài có, có những bài không có, đó là điều bình thường"

export const HSK_LESSON_EXTRA_VIDEOS = {
  "3.0": {
    "1": {
      1: {
        youtubeId: "g-0HdaYr-f4",
        url: "https://youtu.be/g-0HdaYr-f4",
        title: "Bài 1: AI小语，你好！ (AI Tiểu Ngữ, xin chào!)",
        desc: "Video bài giảng chi tiết Bài 1 giáo trình HSK 1 chuẩn 3.0: Hướng dẫn phát âm, chào hỏi cơ bản, từ vựng và khẩu hình chuẩn."
      },
      2: {
        youtubeId: "oYcVrAhwE7Q",
        url: "https://youtu.be/oYcVrAhwE7Q",
        title: "Bài 2: 我叫李文 (Tôi tên là Lý Văn)",
        desc: "Video bài giảng chi tiết Bài 2 giáo trình HSK 1 chuẩn 3.0: Giới thiệu họ tên, quốc tịch và làm quen bạn bè."
      },
      4: {
        youtubeId: "4TnHieg2A5s",
        url: "https://youtu.be/4TnHieg2A5s",
        title: "Bài 4: 我有两个孩子 (Tôi có hai đứa con)",
        desc: "Video bài giảng chi tiết Bài 4 giáo trình HSK 1 chuẩn 3.0: Cấu trúc câu chữ 有, số lượng, cách diễn đạt số đếm và thành viên gia đình."
      },
      5: {
        youtubeId: "EMQ5TAM5J6M",
        url: "https://youtu.be/EMQ5TAM5J6M",
        title: "Bài 5: 今天我休息 (Hôm nay tôi nghỉ ngơi)",
        desc: "Video bài giảng chi tiết Bài 5 giáo trình HSK 1 chuẩn 3.0: Thời gian ngày tháng, thứ trong tuần, kỹ năng làm bếp và sinh hoạt hàng ngày."
      },
      7: {
        youtubeId: "FdA_DivfzBY",
        url: "https://youtu.be/FdA_DivfzBY",
        title: "Bài 7: 我晚上六点半下班 (Tối 6 rưỡi tôi tan làm)",
        desc: "Video bài giảng chi tiết Bài 7 giáo trình HSK 1 chuẩn 3.0: Cách nói giờ giấc, lịch trình sinh hoạt và công việc trong ngày."
      },
      13: {
        youtubeId: "ldUATGMt2nc",
        url: "https://youtu.be/ldUATGMt2nc",
        title: "Bài 13: 请给我一杯茶 (Làm ơn cho tôi một cốc trà)",
        desc: "Video bài giảng chi tiết Bài 13 giáo trình HSK 1 chuẩn 3.0: Cấu trúc câu cầu khiến lịch sự 请, câu hai tân ngữ và gọi đồ uống."
      },
      15: {
        youtubeId: "S9kSsDBM8Mw",
        url: "https://youtu.be/S9kSsDBM8Mw",
        title: "Bài 15: 大兴机场见 (Hẹn gặp ở sân bay Đại Hưng)",
        desc: "Video bài giảng chi tiết Bài 15 giáo trình HSK 1 chuẩn 3.0: Địa điểm, phương hướng, cách hẹn gặp và tổng kết khóa HSK 1."
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
