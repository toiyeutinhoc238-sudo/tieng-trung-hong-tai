// Data for accompanying lesson videos (YouTube) for HSK Curriculum
// "Có những bài có, có những bài không có, đó là điều bình thường"

export const HSK_LESSON_EXTRA_VIDEOS = {
  "3.0": {
    "1": {
      1: {
        youtubeId: "g-0HdaYr-f4",
        url: "https://youtu.be/g-0HdaYr-f4",
        title: "Bài 1: Phiên âm tiếng Trung Quốc",
        desc: ""
      },
      2: {
        youtubeId: "oYcVrAhwE7Q",
        url: "https://youtu.be/oYcVrAhwE7Q",
        title: "Bài 2: Tên tiếng Trung các nước trên thế giới",
        desc: ""
      },
      4: {
        youtubeId: "4TnHieg2A5s",
        url: "https://youtu.be/4TnHieg2A5s",
        title: "Bài 4: Cách hỏi tuổi",
        desc: ""
      },
      5: {
        youtubeId: "EMQ5TAM5J6M",
        url: "https://youtu.be/EMQ5TAM5J6M",
        title: "Bài 5: Bánh sủi cảo",
        desc: ""
      },
      7: {
        youtubeId: "FdA_DivfzBY",
        url: "https://youtu.be/FdA_DivfzBY",
        title: "Bài 7: Học chữ Hán",
        desc: ""
      },
      13: {
        youtubeId: "ldUATGMt2nc",
        url: "https://youtu.be/ldUATGMt2nc",
        title: "Bài 13: Trà Trung Quốc",
        desc: ""
      },
      15: {
        youtubeId: "S9kSsDBM8Mw",
        url: "https://youtu.be/S9kSsDBM8Mw",
        title: "Bài 15: Bắc Kinh chào đón bạn",
        desc: ""
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
