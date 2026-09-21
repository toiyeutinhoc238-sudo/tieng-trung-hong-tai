const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..', 'PDF SACH TIENG TRUNG NEW');

const bookMeta = {
  "China_s Cultural Heritage.pdf": {
    titleVi: "Di Sản Văn Hóa Trung Hoa",
    category: "Văn Hóa & Xã Hội",
    description: "Giới thiệu toàn diện về các di sản văn hóa phi vật thể, danh lam thắng cảnh và trầm tích lịch sử Trung Hoa."
  },
  "Chinese Stories for Language Learners.pdf": {
    titleVi: "Tuyển Tập Truyện Tiếng Trung Cho Người Học Ngoại Ngữ",
    category: "Truyện Đọc & Văn Học",
    description: "Các câu chuyện dân gian, ngụ ngôn kinh điển có đối chiếu từ vựng, hỗ trợ phát triển vốn từ và phản xạ đọc hiểu."
  },
  "General Information on Chinese Culture.pdf": {
    titleVi: "Tổng Quan Đất Nước & Văn Hóa Trung Quốc",
    category: "Văn Hóa & Xã Hội",
    description: "Cung cấp kiến thức nhập môn thiết yếu về địa lý, phong tục tập quán, lễ nghi truyền thống và đời sống người Trung."
  },
  "Stories from China Traditional Festivals.pdf": {
    titleVi: "Truyện Kể Các Ngày Lễ Truyền Thống Trung Hoa",
    category: "Truyện Đọc & Văn Học",
    description: "Nguồn gốc, truyền thuyết và ý nghĩa nhân văn của Tết Nguyên Đán, Tết Trung Thu, Tết Đoan Ngọ và các lễ hội dân tộc."
  },
  "The Routledge Handbook of Chinese Language Teaching.pdf": {
    titleVi: "Cẩm Nang Quốc Tế Về Phương Pháp Giảng Dạy Tiếng Trung (Routledge)",
    category: "Sách Cho Giáo Viên",
    description: "Tài liệu học thuật hàng đầu thế giới phân tích các lý thuyết, đường hướng và phương pháp sư phạm hiện đại."
  },
  "中国历史常识.pdf": {
    titleVi: "Kiến Thức Lịch Sử Trung Quốc Thường Thức",
    category: "Văn Hóa & Xã Hội",
    description: "Tập hợp các sự kiện lịch sử, nhân vật, biến cố và tiến trình phát triển văn minh Trung Hoa từ cổ đại đến hiện đại."
  },
  "中国文化要略.pdf": {
    titleVi: "Đại Cương Văn Hóa Trung Quốc (Trung Quốc Văn Hóa Yếu Lược)",
    category: "Văn Hóa & Xã Hội",
    description: "Giáo trình kinh điển của GS. Trình Dụ Trinh chuyên sâu phục vụ nghiên cứu và thi chứng chỉ giáo viên quốc tế."
  },
  "对外汉语教学实用语法.pdf": {
    titleVi: "Ngữ Pháp Ứng Dụng Giảng Dạy Tiếng Trung Thực Chiến",
    category: "Ngữ Pháp & Tra Cứu",
    description: "Phân tích cấu trúc ngữ pháp then chốt, cách giải thích dễ hiểu và sửa lỗi ngữ pháp thường gặp cho học viên nước ngoài."
  },
  "现代汉语八百词.pdf": {
    titleVi: "800 Từ Tiếng Hán Hiện Đại (Lữ Thúc Tương)",
    category: "Ngữ Pháp & Tra Cứu",
    description: "Tác phẩm gối đầu giường phân tích ngữ nghĩa, ngữ dụng và cấu trúc hư từ của các từ vựng phổ dụng nhất."
  },
  "Kỹ Năng Biên Phiên Dịch Trung - Việt, Việt - Trung Thực Chiến - Tập 1.pdf": {
    titleVi: "Kỹ Năng Biên Phiên Dịch Trung - Việt, Việt - Trung Thực Chiến (Tập 1)",
    category: "Biên Phiên Dịch",
    description: "Cẩm nang biên phiên dịch chuyên sâu, kỹ thuật xử lý câu dài, thành ngữ và văn bản thương mại/hợp đồng."
  },
  "Kỹ Năng Biên Phiên Dịch Trung - Việt, Việt - Trung Thực Chiến - Tập 2.pdf": {
    titleVi: "Kỹ Năng Biên Phiên Dịch Trung - Việt, Việt - Trung Thực Chiến (Tập 2)",
    category: "Biên Phiên Dịch",
    description: "Nâng cao kỹ năng phiên dịch hội nghị, cabin, đàm phán kinh tế và các chủ đề chuyên ngành thời sự."
  },
  "HSK 1 chuẩn.pdf": {
    titleVi: "Giáo Trình Chuẩn HSK 1",
    category: "Giáo Trình HSK",
    coverUrl: "/covers/hsk2/hsk1.jpg",
    description: "Giáo trình chuẩn HSK 1 bao gồm 15 bài học nhập môn kèm file dịch tiếng Việt chuẩn của TS. Nguyễn Thị Minh Hồng."
  },
  "HSK 2 chuẩn.pdf": {
    titleVi: "Giáo Trình Chuẩn HSK 2",
    category: "Giáo Trình HSK",
    coverUrl: "/covers/hsk2/hsk2.jpg",
    description: "Giáo trình chuẩn HSK 2 bao gồm 15 bài học sơ cấp nâng cao mở rộng vốn câu giao tiếp thực tế."
  },
  "HSK 3 chuẩn.pdf": {
    titleVi: "Giáo Trình Chuẩn HSK 3",
    category: "Giáo Trình HSK",
    coverUrl: "/covers/hsk2/hsk3.jpg",
    description: "Giáo trình chuẩn HSK 3 bao gồm 20 bài học củng cố ngữ pháp trung cấp và diễn đạt mở rộng."
  },
  "HSK 4 chuẩn上.pdf": {
    titleVi: "Giáo Trình Chuẩn HSK 4 (Quyển Thượng - 上)",
    category: "Giáo Trình HSK",
    coverUrl: "/covers/hsk2/hsk4.jpg",
    description: "Giáo trình chuẩn HSK 4 Quyển Thượng (上) gồm 10 bài học trung cấp đầu tiên, mở rộng từ vựng và kết cấu ngữ pháp chủ điểm."
  },
  "HSK 4 chuẩn下.pdf": {
    titleVi: "Giáo Trình Chuẩn HSK 4 (Quyển Hạ - 下)",
    category: "Giáo Trình HSK",
    coverUrl: "/covers/hsk2/hsk4.jpg",
    description: "Giáo trình chuẩn HSK 4 Quyển Hạ (下) gồm 10 bài học tiếp theo (bài 11 - 20) giúp hoàn thiện toàn bộ chuẩn kiến thức HSK cấp 4."
  },
  "HSK 5 chuẩn下.pdf": {
    titleVi: "Giáo Trình Chuẩn HSK 5 (Quyển Hạ - 下)",
    category: "Giáo Trình HSK",
    coverUrl: "/covers/hsk2/hsk5.jpg",
    description: "Giáo trình chuẩn HSK cấp độ 5 Quyển Hạ (下), rèn luyện đọc hiểu văn bản nâng cao, từ vựng học thuật và viết luận."
  },
  "新HSK教程1.pdf": {
    titleVi: "新 HSK 教程 1 (HSK 3.0)",
    category: "Giáo Trình HSK",
    coverUrl: "/covers/hsk3/hsk1.jpg",
    description: "Giáo trình HSK cấp độ 1 tiêu chuẩn 3.0 mới nhất do NXB Đại học Ngôn ngữ Bắc Kinh xuất bản."
  },
  "新HSK2 教材.pdf": {
    titleVi: "新 HSK 教程 2 (HSK 3.0)",
    category: "Giáo Trình HSK",
    coverUrl: "/covers/hsk3/hsk2.jpg",
    description: "Giáo trình HSK cấp độ 2 theo chuẩn cải cách mới, tích hợp hội thoại thực tế và cấu trúc câu thông dụng."
  },
  "新HSK3教程.pdf": {
    titleVi: "新 HSK 教程 3 (HSK 3.0)",
    category: "Giáo Trình HSK",
    coverUrl: "/covers/hsk3/hsk3.jpg",
    description: "Giáo trình chuẩn HSK cấp độ 3 mới mở rộng ngữ pháp trung cấp, hội thoại tình huống và vốn từ biểu đạt phong phú."
  },
  "新HSK教程4上.pdf": {
    titleVi: "新 HSK 教程 4 (Quyển Thượng - HSK 3.0)",
    category: "Giáo Trình HSK",
    coverUrl: "/covers/hsk3/hsk4.jpg",
    description: "Giáo trình chuẩn HSK 4 mới Quyển Thượng (上) theo chuẩn v3.0, phát triển năng lực giao tiếp mạch lạc, nghị luận xã hội và đọc hiểu đoạn văn dài."
  },
  "Bản sao của Giáo trình hán ngữ 2 (Trung-Việt).pdf": {
    titleVi: "Giáo Trình Hán Ngữ 2 (Bản Dịch Song Ngữ Trung - Việt)",
    category: "Giáo Trình Hán Ngữ",
    description: "Giáo trình Hán ngữ bộ 6 tập quyển 2, bản dịch chú giải tiếng Việt chuẩn xác cho học viên mới bắt đầu."
  },
  "Bản sao của Giáo trình hán ngữ 3 (Trung-Việt).pdf": {
    titleVi: "Giáo Trình Hán Ngữ 3 (Bản Dịch Song Ngữ Trung - Việt)",
    category: "Giáo Trình Hán Ngữ",
    description: "Giáo trình Hán ngữ quyển 3 (Tập 2 Thượng), bước ngoặt củng cố ngữ pháp trung cấp và diễn đạt mở rộng."
  },
  "Bản sao của Giáo trình hán ngữ 4 (Trung-Việt).pdf": {
    titleVi: "Giáo Trình Hán Ngữ 4 (Bản Dịch Song Ngữ Trung - Việt)",
    category: "Giáo Trình Hán Ngữ",
    description: "Giáo trình Hán ngữ quyển 4 (Tập 2 Hạ), nâng cao vốn từ vựng chuyên đề, câu phức và đối thoại chuyên sâu."
  },
  "Bản sao của Giáo trình hán ngữ 5 (Trung-Việt).pdf": {
    titleVi: "Giáo Trình Hán Ngữ 5 (Bản Dịch Song Ngữ Trung - Việt)",
    category: "Giáo Trình Hán Ngữ",
    description: "Giáo trình Hán ngữ quyển 5 (Tập 3 Thượng), tiếp cận các tác phẩm văn chương, văn hóa và bình luận xã hội."
  },
  "Bản sao của Giáo trình hán ngữ 6 (Trung-Việt).pdf": {
    titleVi: "Giáo Trình Hán Ngữ 6 (Bản Dịch Song Ngữ Trung - Việt)",
    category: "Giáo Trình Hán Ngữ",
    description: "Giáo trình Hán ngữ bộ 6 tập quyển 6 (Tập 3 Hạ), trình độ nâng cao giúp hoàn thiện vốn ngữ pháp sâu sắc và năng lực biểu đạt phong phú."
  },
  "hán ngữ 1 (Trung-Việt).pdf": {
    titleVi: "Giáo Trình Hán Ngữ 1 (Bản Dịch Song Ngữ Trung - Việt)",
    category: "Giáo Trình Hán Ngữ",
    description: "Giáo trình Hán ngữ cơ sở quyển 1 chuẩn quốc tế, rèn luyện phát âm Pinyin, nét bút và giao tiếp nhập môn."
  },
  "ngữ-pháp.pdf": {
    titleVi: "Cẩm Nang Toàn Diện Ngữ Pháp Tiếng Hán",
    category: "Ngữ Pháp & Tra Cứu",
    description: "Hệ thống hóa toàn bộ các bổ ngữ, liên từ, câu chữ 把, chữ 被, trạng ngữ và trật tự từ trong câu tiếng Trung."
  },
  "Analysis of Classic Cases for TCSOL.pdf": {
    titleVi: "Phân Tích Các Tình Huống Kinh Điển Trong Dạy Tiếng Trung (TCSOL)",
    category: "Sách Cho Giáo Viên",
    description: "Các tình huống sư phạm thực tế, xử lý tâm lý học viên và tình huống sư phạm đa văn hóa trên lớp."
  },
  "Certification Exam Syllabus for Teachers.pdf": {
    titleVi: "Đề Cương & Chuẩn Năng Lực Kỳ Thi Chứng Chỉ Giáo Viên Tiếng Trung",
    category: "Sách Cho Giáo Viên",
    description: "Đề cương chi tiết của kỳ thi Chứng chỉ Giáo viên Tiếng Trung Quốc tế (CTCSOL)."
  },
  "Cosmopolitan Life in Modern China.pdf": {
    titleVi: "Đời Sống Đô Thị Hiện Đại Tại Trung Quốc",
    category: "Văn Hóa & Xã Hội",
    description: "Góc nhìn văn hóa đương đại về lối sống, công nghệ, tiêu dùng và các xu hướng mới của giới trẻ Trung Quốc."
  },
  "Error Analysis of 900 Sample Sentences.pdf": {
    titleVi: "Phân Tích Lỗi Sai Ngữ Pháp Qua 900 Câu Mẫu Thực Tế",
    category: "Sách Cho Giáo Viên",
    description: "Tổng hợp các lỗi sai phổ biến nhất của người học nước ngoài về hư từ, ngữ pháp và cấu trúc câu."
  },
  "Explanations of Difficult Points in Chinese Learning for Foreigners.pdf": {
    titleVi: "Giải Thích Các Điểm Khó Dành Cho Người Học Tiếng Hán Nước Ngoài",
    category: "Sách Cho Giáo Viên",
    description: "Giải đáp cặn kẽ các cặp từ đồng nghĩa, kết cấu ngữ pháp phức tạp và mẹo ghi nhớ cho người học."
  },
  "Hanyu Liangci Dacidian.pdf": {
    titleVi: "Đại Từ Điển Lượng Từ Tiếng Hán (Hán Ngữ Lượng Từ Đại Từ Điển)",
    category: "Ngữ Pháp & Tra Cứu",
    description: "Bộ đại từ điển hoàn chỉnh và chi tiết nhất phân loại cách dùng, phối hợp danh từ và ví dụ cho mọi lượng từ."
  },
  "HSK词汇突破（甲级词）.pdf": {
    titleVi: "Đột Phá Từ Vựng HSK (Từ Vựng Cấp Độ Giáp)",
    category: "Giáo Trình HSK",
    description: "Chiến lược làm chủ các từ vựng cốt lõi then chốt nhất giúp vượt qua kỳ thi năng lực HSK điểm cao."
  },
  "International Chinese Teaching Cases and Discussions.pdf": {
    titleVi: "Tuyển Tập Tình Huống Giảng Dạy Tiếng Trung Quốc Tế & Thảo Luận Sư Phạm",
    category: "Sách Cho Giáo Viên",
    description: "Tập hợp các bài học mẫu, phương pháp thiết kế hoạt động và giải pháp tương tác lớp học sinh động."
  },
  "K-16 Non-native Chinese Teachers Training.pdf": {
    titleVi: "Đào Tạo & Bồi Dưỡng Nghiệp Vụ Giáo Viên Dạy Tiếng Trung K-16",
    category: "Sách Cho Giáo Viên",
    description: "Phương pháp luận chuyên sâu dành cho giáo viên dạy tiếng Trung từ mầm non đến đại học."
  },
  "Lesson Plans for Teaching Chinese Grammar.pdf": {
    titleVi: "Giáo Án Mẫu Giảng Dạy Ngữ Pháp Tiếng Trung Chuyên Sâu",
    category: "Sách Cho Giáo Viên",
    description: "Hơn 50 giáo án chi tiết từng bước, hoạt động thực hành và phiếu bài tập phục vụ giảng dạy ngữ pháp."
  },
  "National Standard 1 Grade descriptors syllables and Characters.pdf": {
    titleVi: "Tiêu Chuẩn Quốc Gia: Bảng Âm Tiết & Chữ Hán Cấp Độ 1 (HSK Mới)",
    category: "Sách Cho Giáo Viên",
    description: "Quy chuẩn học thuật chính thức của Bộ Giáo dục Trung Quốc về hệ thống âm tiết và chữ viết cấp độ 1."
  },
  "National Standard 3 Grammar.pdf": {
    titleVi: "Tiêu Chuẩn Quốc Gia: Khung Chuẩn Ngữ Pháp Tiếng Hán Cấp Độ 3",
    category: "Sách Cho Giáo Viên",
    description: "Định lượng và quy chuẩn danh mục điểm ngữ pháp bắt buộc theo khung năng lực HSK 3.0 mới."
  },
  "Official Examination Papers of CTCSOL.pdf": {
    titleVi: "Đề Thi Chính Thức Chứng Chỉ Giáo Viên Tiếng Trung Quốc Tế (CTCSOL)",
    category: "Sách Cho Giáo Viên",
    description: "Đề thi thật kèm đáp án và phân tích chi tiết cho kỳ thi sát hạch giáo viên giảng dạy tiếng Hán."
  },
  "The Graded Chinese National Standard.pdf": {
    titleVi: "Khung Tiêu Chuẩn Năng Lực Tiếng Hán Quốc Tế Phân Cấp Toàn Diện",
    category: "Sách Cho Giáo Viên",
    description: "Văn bản gốc quy định chuẩn năng lực 3 bậc 9 cấp (HSK 3.0) từ vựng, ngữ pháp và kỹ năng."
  },
  "Xiandai Hanyu Yufa Yanjiu Jiaocheng.pdf": {
    titleVi: "Giáo Trình Nghiên Cứu Ngữ Pháp Hán Ngữ Hiện Đại (GS. Lục Kiệm Minh)",
    category: "Sách Cho Giáo Viên",
    description: "Công trình kinh điển của GS. Lục Kiệm Minh đào sâu phương pháp luận nghiên cứu ngữ pháp tiếng Hán hiện đại."
  },
  "听说课优秀教案集.pdf": {
    titleVi: "Tuyển Tập Giáo Án Xuất Sắc Môn Nghe Nói Tiếng Trung",
    category: "Sách Cho Giáo Viên",
    description: "Bộ giáo án mẫu được giải thưởng quốc gia về kỹ năng dạy khẩu ngữ và nghe hiểu tương tác."
  },
  "国际汉语教学案例分析与点评.pdf": {
    titleVi: "Phân Tích & Bình Luận Các Án Lệ Giảng Dạy Tiếng Trung Quốc Tế",
    category: "Sách Cho Giáo Viên",
    description: "Tổng kết kinh nghiệm thực địa, nhận xét chuyên gia và bài học kinh nghiệm giảng dạy đa quốc gia."
  },
  "国际汉语教学活动50例.pdf": {
    titleVi: "50 Hoạt Động & Trò Chơi Tương Tác Lớp Học Tiếng Trung",
    category: "Sách Cho Giáo Viên",
    description: "Bộ trò chơi ngôn ngữ, thẻ bài và hoạt động nhóm kích hoạt hứng thú học tập và phản xạ nói cho học viên."
  },
  "国际汉语教师证书考试大纲解析.pdf": {
    titleVi: "Phân Tích Đề Cương Kỳ Thi Chứng Chỉ Giáo Viên Tiếng Trung Quốc Tế",
    category: "Sách Cho Giáo Viên",
    description: "Giải thích tường tận các câu hỏi tình huống sư phạm, lý thuyết giảng dạy và phần thi phỏng vấn."
  },
  "国际汉语语音与语音教学.pdf": {
    titleVi: "Ngữ Âm Học & Phương Pháp Giảng Dạy Ngữ Âm Tiếng Hán",
    category: "Sách Cho Giáo Viên",
    description: "Khoa học phát âm, cơ quan phát âm, kỹ thuật chỉnh âm thanh điệu và sửa tật phát âm cho học viên."
  },
  "国际汉语课堂管理.pdf": {
    titleVi: "Kỹ Năng Quản Lý Lớp Học Tiếng Trung Quốc Tế Hiệu Quả",
    category: "Sách Cho Giáo Viên",
    description: "Nghệ thuật tổ chức lớp học, làm chủ thời lượng giảng dạy, giữ kỷ luật tích cực và tạo động lực học tập."
  },
  "对外汉语教学心理学引论.pdf": {
    titleVi: "Tâm Lý Học Trong Giảng Dạy Tiếng Hán Cho Người Nước Ngoài",
    category: "Sách Cho Giáo Viên",
    description: "Tác động của yếu tố tâm lý lứa tuổi, lo âu ngôn ngữ, động cơ học tập và chiến lược thụ đắc ngôn ngữ."
  },
  "对外汉语教材通论.pdf": {
    titleVi: "Đại Cương Nghiên Cứu & Đánh Giá Giáo Trình Tiếng Hán",
    category: "Sách Cho Giáo Viên",
    description: "Tiêu chí lựa chọn, so sánh, biên soạn và khai thác tối đa hiệu quả từ các bộ giáo trình tiếng Trung hiện hành."
  },
  "对外汉语教育学引论.pdf": {
    titleVi: "Nhập Môn Giáo Dục Học Dạy Tiếng Hán (GS. Lưu Tuần)",
    category: "Sách Cho Giáo Viên",
    description: "Tác phẩm gối đầu giường của GS. Lưu Tuần - nền tảng lý thuyết bắt buộc cho mọi giáo viên tiếng Trung."
  },
  "教学课堂教案设计.pdf": {
    titleVi: "Nghệ Thuật Thiết Kế Giáo Án & Tiến Trình Bài Giảng Trên Lớp",
    category: "Sách Cho Giáo Viên",
    description: "Quy trình thiết kế bài giảng 5 bước: Khởi động, Giới thiệu từ mới, Ngữ pháp, Luyện tập và Ứng dụng thực tế."
  },
  "新教师必备81问.pdf": {
    titleVi: "81 Câu Hỏi Bắt Buộc Phải Biết Dành Cho Giáo Viên Mới",
    category: "Sách Cho Giáo Viên",
    description: "Cẩm nang hỏi đáp thực chiến tháo gỡ mọi bỡ ngỡ, khó khăn của giáo viên trong những năm đầu đứng lớp."
  },
  "汉语动量词及动量短语研究.pdf": {
    titleVi: "Nghiên Cứu Chuyên Sâu Về Động Lượng Từ & Cụm Động Lượng Tiếng Hán",
    category: "Ngữ Pháp & Tra Cứu",
    description: "Khảo sát ngữ pháp học thuật về tần suất, cấu trúc và quy luật kết hợp của các động lượng từ (次, 遍, 趟, 下...)."
  },
  "汉语词汇与词汇教学.pdf": {
    titleVi: "Từ Vựng Học & Phương Pháp Giảng Dạy Từ Vựng Tiếng Hán",
    category: "Sách Cho Giáo Viên",
    description: "Bản chất cấu tạo từ Hán, phương pháp phân tích hình vị, liên tưởng chữ Hán và trò chơi mở rộng vốn từ."
  },
  "现代汉语教学说明与自学参考.pdf": {
    titleVi: "Hướng Dẫn Giảng Dạy & Tài Liệu Tự Học Tiếng Hán Hiện Đại",
    category: "Sách Cho Giáo Viên",
    description: "Đáp án chi tiết bài tập, giải thích bổ trợ và tài liệu mở rộng cho chương trình tiếng Hán hiện đại."
  },
  "现代汉语通用字笔顺规范.pdf": {
    titleVi: "Quy Chuẩn Thứ Tự Nét Bút Chữ Hán Thông Dụng Hiện Đại",
    category: "Ngữ Pháp & Tra Cứu",
    description: "Quy chuẩn bút thuận chuẩn mực của Nhà nước Trung Quốc cho từng nét viết của các chữ Hán thường dùng."
  },
  "现代汉语量词研究与对外汉语教学.pdf": {
    titleVi: "Nghiên Cứu Lượng Từ Tiếng Hán & Ứng Dụng Trong Giảng Dạy",
    category: "Sách Cho Giáo Viên",
    description: "Hệ thống hóa lượng từ danh từ và lượng từ động từ, phân tích ngữ cảnh sử dụng và phương pháp truyền đạt."
  },
  "硬笔楷书字帖.pdf": {
    titleVi: "Vở Luyện Viết Chữ Hán Khải Thư Bút Sắt Chuẩn Đẹp",
    category: "Tập Viết & Chữ Hán",
    description: "Mẫu chữ Khải thư thanh thoát, quy chuẩn từng nét giúp người học rèn nét chữ Hán ngay ngắn, chuẩn mực."
  },
  "论语 2009.pdf": {
    titleVi: "Luận Ngữ (Khổng Tử) - Phiên Bản Chú Giải Hiện Đại",
    category: "Văn Hóa & Xã Hội",
    description: "Nguyên tác Luận Ngữ kinh điển kèm phiên âm, chú giải và dịch nghĩa tường minh triết lý Nho gia ngàn đời."
  },
  "课堂技巧 教学手册.pdf": {
    titleVi: "Sổ Tay Kỹ Năng & Nghệ Thuật Sư Phạm Trên Lớp",
    category: "Sách Cho Giáo Viên",
    description: "Hàng trăm kỹ năng điều phối lớp học, đặt câu hỏi gợi mở, sửa lỗi khéo léo và duy trì năng lượng tích cực."
  },
  "35. 谁的青春不迷茫.pdf": {
    titleVi: "Thanh Xuân Của Ai Không Mơ Hồ (Lưu Đồng)",
    category: "Truyện Đọc & Văn Học",
    description: "Cuốn sách thanh xuân chữa lành truyền cảm hứng mạnh mẽ của tác giả Lưu Đồng, ngôn từ gần gũi, giàu triết lý sống."
  },
  "Bản sao của Chinese Classical Stories 2.pdf": {
    titleVi: "Truyện Cổ Tích & Điển Tích Kinh Điển Trung Hoa (Tập 2)",
    category: "Truyện Đọc & Văn Học",
    description: "Các câu chuyện thành ngữ và truyền thuyết cổ đại giúp bồi đắp văn hóa và nâng cao vốn từ vựng song ngữ."
  },
  "Home Sweet Home.pdf": {
    titleVi: "Tổ Ấm Yêu Thương (Home Sweet Home)",
    category: "Truyện Đọc & Văn Học",
    description: "Những câu chuyện gia đình ấm áp, từ ngữ thân thuộc hàng ngày, thích hợp rèn luyện đọc hiểu nhẹ nhàng."
  },
  "Home with Kids 2.pdf": {
    titleVi: "Nhà Có Con Nhỏ (Tập 2) - Kịch Bản Đối Thoại Gia Đình Vui Nhộn",
    category: "Truyện Đọc & Văn Học",
    description: "Dựa trên sitcom đình đám, ngập tràn khẩu ngữ tự nhiên, hài hước và các tình huống giao tiếp đời thường."
  },
  "Home with Kids 3.pdf": {
    titleVi: "Nhà Có Con Nhỏ (Tập 3) - Hội Thoại Đời Thường & Tâm Lý Tuổi Trẻ",
    category: "Truyện Đọc & Văn Học",
    description: "Tiếp nối chuỗi câu chuyện gia đình dí dỏm, làm giàu khẩu ngữ sinh động và tiếng lóng hiện đại."
  },
  "坚持，一种可以养成的习惯.pdf": {
    titleVi: "Kiên Trì: Một Thói Quen Hoàn Toàn Có Thể Rèn Luyện (Furukawa Takeshi)",
    category: "Truyện Đọc & Văn Học",
    description: "Nghệ thuật xây dựng thói quen và duy trì tính kỷ luật sắt để đạt được mục tiêu học tập và cuộc sống."
  },
  "天堂旅行团.pdf": {
    titleVi: "Chuyến Xe Thiên Đường (Trương Gia Giai)",
    category: "Truyện Đọc & Văn Học",
    description: "Tiểu thuyết đầy xúc động của tác giả Trương Gia Giai về tình yêu, sự chữa lành và niềm tin giữa giông bão."
  },
  "岁月静好 现世安稳 .pdf": {
    titleVi: "Tháng Năm Bình Yên, Đời Người An Ổn (Bạch Lạc Mai)",
    category: "Truyện Đọc & Văn Học",
    description: "Tản văn trữ tình tuyệt đẹp của Bạch Lạc Mai, văn phong diễm lệ, chất chứa thiền vị và sự thanh tịnh tâm hồn."
  },
  "活着 (1).pdf": {
    titleVi: "Sống (Dư Hoa) - Kiệt Tác Văn Học Đương Đại",
    category: "Truyện Đọc & Văn Học",
    description: "Kiệt tác văn học kinh điển của nhà văn Dư Hoa về số phận con người, sức sống kiên cường và lòng trắc ẩn."
  },
  "社会常识全知道：不可不知的2000个社会常识.pdf": {
    titleVi: "2000 Kiến Thức Thường Thức Xã Hội Trung Quốc Hiện Đại",
    category: "Văn Hóa & Xã Hội",
    description: "Bách khoa toàn thư về quy tắc xã giao, văn hóa công sở, giao tiếp xã hội và đời sống thực tế Trung Quốc."
  },
  "被讨厌的勇气.pdf": {
    titleVi: "Dũng Khí Bị Ghét Bỏ (Tâm Lý Học Adler)",
    category: "Truyện Đọc & Văn Học",
    description: "Đối thoại triết học tâm lý sâu sắc giúp giải phóng bản thân khỏi định kiến và tìm lại tự do nội tâm."
  },
  "飞鸟集.pdf": {
    titleVi: "Tập Thơ Những Cánh Chim Bay (Phi Điểu Tập - Tagore dịch Hán)",
    category: "Truyện Đọc & Văn Học",
    description: "Thi phẩm kinh điển của Rabindranath Tagore qua ngòi bút dịch Hán ngữ điêu luyện của danh sĩ Trịnh Chấn Đạc."
  },
  "国际汉语教学案例与分析.pdf": {
    titleVi: "Tuyển Tập Tình Huống Sư Phạm & Phân Tích Giảng Dạy Tiếng Hán Quốc Tế",
    category: "Sách Cho Giáo Viên",
    description: "Phân tích các tình huống sư phạm thực tế trong giảng dạy tiếng Hán cho học viên nước ngoài, giải pháp xử lý và phương pháp đứng lớp."
  },
  "国际汉语词汇与词汇教学.pdf": {
    titleVi: "Từ Vựng & Phương Pháp Giảng Dạy Từ Vựng Tiếng Hán Quốc Tế",
    category: "Sách Cho Giáo Viên",
    description: "Chuyên khảo lý thuyết và kỹ thuật sư phạm giảng dạy hệ thống từ vựng tiếng Hán cho người nước ngoài một cách hiệu quả."
  },
  "外国人学汉语语法偏误研究.pdf": {
    titleVi: "Nghiên Cứu Lỗi Lệch Ngữ Pháp Của Người Nước Ngoài Khi Học Tiếng Hán",
    category: "Sách Cho Giáo Viên",
    description: "Phân tích chuyên sâu các lỗi ngữ pháp thường gặp nhất của người nước ngoài khi học tiếng Hán và phương pháp khắc phục hiệu quả."
  }
};

function generateId(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return 'book_' + Math.abs(hash).toString(36);
}

function scan(dir, relative = '') {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    const relPath = path.join(relative, item.name);
    if (item.isDirectory()) {
      results = results.concat(scan(fullPath, relPath));
    } else if (item.isFile() && item.name.toLowerCase().endsWith('.pdf')) {
      const meta = bookMeta[item.name] || {};
      const id = generateId(relPath);
      const cleanOriginal = item.name.replace(/\.pdf$/i, '').replace(/^Bản sao của\s*/i, '').trim();
      const bookObj = {
        id: id,
        name: item.name,
        titleVi: meta.titleVi || cleanOriginal,
        titleOriginal: cleanOriginal,
        category: meta.category || 'Tài Liệu Chung',
        description: meta.description || 'Tài liệu học tập tiếng Trung hữu ích.',
        sizeMB: parseFloat((fs.statSync(fullPath).size / (1024 * 1024)).toFixed(2)),
        relPath: relPath.replace(/\\/g, '/')
      };
      const thumbDiskPath = path.resolve(__dirname, '..', '..', 'frontend', 'public', 'covers', 'thumbnails', `${id}.jpg`);
      if (fs.existsSync(thumbDiskPath)) {
        bookObj.coverUrl = `/covers/thumbnails/${id}.jpg`;
      } else if (meta.coverUrl) {
        bookObj.coverUrl = meta.coverUrl;
      }
      results.push(bookObj);
    }
  }
  return results;
}

const catalog = scan(rootDir);
catalog.sort((a, b) => a.category.localeCompare(b.category) || a.titleVi.localeCompare(b.titleVi));

const targetPath = path.resolve(__dirname, '..', 'books_catalog.json');
fs.writeFileSync(targetPath, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`Successfully generated backend/books_catalog.json with ${catalog.length} books.`);
