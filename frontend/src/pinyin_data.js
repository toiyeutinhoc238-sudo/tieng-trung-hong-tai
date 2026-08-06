// Data chuẩn hóa từ 3 file docx: Thanh Mẫu (21), Vận Mẫu (36), và Thanh Điệu

export const THANH_MAU_DATA = {
  title: "Thanh Mẫu (21 Phụ Âm Đầu)",
  description: "Hệ thống 21 phụ âm đầu trong Tiếng Trung được chia làm 6 nhóm theo vị trí và phương thức phát âm.",
  groups: [
    {
      id: "group1",
      name: "Nhóm 1: Âm hai môi & Môi răng",
      items: [
        { char: "b", type: "Âm hai môi", detail: "Mép môi khép lại, luồng hơi ngắt nhẹ rồi bật ra. Không bật hơi.", note: "Phát âm gần giống 'b' hoặc 'p' nhẹ trong tiếng Việt.", examples: [{ pinyin: "bā", meaning: "Số 8" }, { pinyin: "bǐ", meaning: "Cây bút" }, { pinyin: "bèi", meaning: "Bố" }, { pinyin: "báibǐ", meaning: "Bút trắng" }] },
        { char: "p", type: "Âm hai môi (Bật hơi)", detail: "Vị trí môi giống âm 'b', nhưng luồng hơi đẩy mạnh dứt khoát ra ngoài.", note: "Bật hơi rất mạnh (thử bằng tờ giấy trước miệng).", examples: [{ pinyin: "pā", meaning: "Nằm sấp" }, { pinyin: "pó", meaning: "Bà nội" }, { pinyin: "píngguǒ", meaning: "Quả táo" }, { pinyin: "pápō", meaning: "Leo dốc" }] },
        { char: "m", type: "Âm hai môi (Âm mũi)", detail: "Hai môi khép lại, luồng hơi thoát ra qua đường mũi, dây thanh rung.", note: "Giống hoàn toàn âm 'm' trong tiếng Việt.", examples: [{ pinyin: "mā", meaning: "Mẹ" }, { pinyin: "mǐ", meaning: "Gạo" }, { pinyin: "máobǐ", meaning: "Bút lông" }, { pinyin: "mìmì", meaning: "Bí mật" }] },
        { char: "f", type: "Âm môi răng", detail: "Răng cửa trên chạm nhẹ vào môi dưới, luồng hơi ma sát thoát ra.", note: "Giống âm 'ph' / 'f' trong tiếng Việt.", examples: [{ pinyin: "fā", meaning: "Phát" }, { pinyin: "fù", meaning: "Cha" }, { pinyin: "fúwù", meaning: "Phục vụ" }, { pinyin: "fēnxi", meaning: "Phân tích" }] }
      ]
    },
    {
      id: "group2",
      name: "Nhóm 2: Âm đầu lưỡi giữa",
      items: [
        { char: "d", type: "Âm đầu lưỡi giữa", detail: "Đầu lưỡi chạm chân răng trên, luồng hơi ngắt nhẹ rồi bật ra. Không bật hơi.", note: "Đọc giống âm 't' trong tiếng Việt.", examples: [{ pinyin: "dā", meaning: "Dựng" }, { pinyin: "dǐ", meaning: "Đáy" }, { pinyin: "dǎdiàn", meaning: "Gợi ý" }, { pinyin: "dàtáng", meaning: "Đại sảnh" }] },
        { char: "t", type: "Âm đầu lưỡi giữa (Bật hơi)", detail: "Vị trí lưỡi giống 'd', nhưng đẩy luồng hơi mạnh ra ngoài.", note: "Bật hơi mạnh, đọc gần giống 'th' tiếng Việt.", examples: [{ pinyin: "tā", meaning: "Anh ấy" }, { pinyin: "tǐ", meaning: "Thể thao" }, { pinyin: "táitóu", meaning: "Ngẩng đầu" }, { pinyin: "tútú", meaning: "Đồ họa" }] },
        { char: "n", type: "Âm đầu lưỡi giữa (Âm mũi)", detail: "Đầu lưỡi chạm chân răng trên, luồng hơi thoát qua đường mũi.", note: "Giống âm 'n' tiếng Việt.", examples: [{ pinyin: "nǐ", meaning: "Bạn" }, { pinyin: "nù", meaning: "Tức giận" }, { pinyin: "nǔlì", meaning: "Nỗ lực" }, { pinyin: "nǐhǎo", meaning: "Xin chào" }] },
        { char: "l", type: "Âm đầu lưỡi giữa (Âm bên)", detail: "Đầu lưỡi chạm chân răng trên, luồng hơi thoát ra hai bên cạnh lưỡi.", note: "Giống âm 'l' tiếng Việt.", examples: [{ pinyin: "lā", meaning: "Kéo" }, { pinyin: "lè", meaning: "Vui vẻ" }, { pinyin: "lǎoshī", meaning: "Thầy cô" }, { pinyin: "lúnchuán", meaning: "Tàu thủy" }] }
      ]
    },
    {
      id: "group3",
      name: "Nhóm 3: Âm cuống lưỡi (Gốc lưỡi)",
      items: [
        { char: "g", type: "Âm cuống lưỡi", detail: "Cuống lưỡi nâng lên chạm vòm mềm, ngắt hơi rồi buông nhẹ. Không bật hơi.", note: "Phát âm giống âm 'c' hoặc 'k' trong tiếng Việt.", examples: [{ pinyin: "gē", meaning: "Anh trai" }, { pinyin: "gǔ", meaning: "Cái trống" }, { pinyin: "gāngbǐ", meaning: "Bút máy" }, { pinyin: "guójiā", meaning: "Quốc gia" }] },
        { char: "k", type: "Âm cuống lưỡi (Bật hơi)", detail: "Vị trí giống 'g', nhưng bật luồng hơi mạnh từ cuống họng ra.", note: "Âm bật hơi mạnh, nghe giống 'kh' tiếng Việt.", examples: [{ pinyin: "kě", meaning: "Khát" }, { pinyin: "kù", meaning: "Quần" }, { pinyin: "kāfèi", meaning: "Cà phê" }, { pinyin: "kělè", meaning: "Kha-khát / Cola" }] },
        { char: "h", type: "Âm cuống lưỡi (Âm xát)", detail: "Cuống lưỡi nâng gần vòm mềm tạo khe hở cho luồng hơi ma sát đi ra.", note: "Giữa 'h' và 'kh' tiếng Việt (nhẹ hơn 'kh').", examples: [{ pinyin: "hē", meaning: "Uống" }, { pinyin: "hǔ", meaning: "Con hổ" }, { pinyin: "hénèi", meaning: "Hà Nội" }, { pinyin: "huǒguō", meaning: "Lẩu" }] }
      ]
    },
    {
      id: "group4",
      name: "Nhóm 4: Âm mặt lưỡi",
      items: [
        { char: "j", type: "Âm mặt lưỡi", detail: "Mặt lưỡi áp sát ngạc cứng, đầu lưỡi đặt sau răng dưới. Không bật hơi.", note: "Gần giống âm 'ch' tiếng Việt nhưng mặt lưỡi phẳng.", examples: [{ pinyin: "jī", meaning: "Con gà" }, { pinyin: "jiā", meaning: "Gia đình" }, { pinyin: "jīchǎng", meaning: "Sân bay" }, { pinyin: "jiéguǒ", meaning: "Kết quả" }] },
        { char: "q", type: "Âm mặt lưỡi (Bật hơi)", detail: "Vị trí giống 'j', nhưng bật luồng hơi rất mạnh thoát ra qua kẽ răng.", note: "Bật hơi mạnh (kiểm tra bằng giấy).", examples: [{ pinyin: "qī", meaning: "Số 7" }, { pinyin: "qù", meaning: "Đi" }, { pinyin: "qīn'ài", meaning: "Thân yêu" }, { pinyin: "qíngkuàng", meaning: "Tình huống" }] },
        { char: "x", type: "Âm mặt lưỡi (Âm xát)", detail: "Mặt lưỡi nâng gần ngạc cứng tạo kẽ hở cho luồng hơi ma sát.", note: "Phát âm nhẹ nhàng giống 'x' tiếng Việt.", examples: [{ pinyin: "xī", meaning: "Phía Tây" }, { pinyin: "xiā", meaning: "Con tôm" }, { pinyin: "xīguā", meaning: "Dưa hấu" }, { pinyin: "xuéxí", meaning: "Học tập" }] }
      ]
    },
    {
      id: "group5",
      name: "Nhóm 5: Âm đầu lưỡi trước",
      note_special: "Lưu ý đặc biệt: Khi các âm z, c, s đi kèm với nguyên âm 'i', âm 'i' sẽ được đọc thành 'ư'.",
      items: [
        { char: "z", type: "Âm đầu lưỡi trước", detail: "Đầu lưỡi thẳng chạm mặt sau răng cửa trên, ngắt hơi rồi buông nhẹ.", note: "Không bật hơi. Gần giống âm 'ch' tiếng Việt nhưng lưỡi thẳng phẳng.", examples: [{ pinyin: "zā", meaning: "Buộc" }, { pinyin: "zǎo", meaning: "Sáng" }, { pinyin: "zúqiú", meaning: "Bóng đá" }, { pinyin: "zìjǐ", meaning: "Tự bản thân" }] },
        { char: "c", type: "Âm đầu lưỡi trước (Bật hơi)", detail: "Vị trí giống 'z', nhưng bật luồng hơi dứt khoát cực mạnh ra ngoài.", note: "Bật hơi mạnh (dùng tờ giấy thử luồng hơi).", examples: [{ pinyin: "cā", meaning: "Lau" }, { pinyin: "cù", meaning: "Giấm" }, { pinyin: "cánjiā", meaning: "Tham gia" }, { pinyin: "cóngqián", meaning: "Ngày trước" }] },
        { char: "s", type: "Âm đầu lưỡi trước (Âm xát)", detail: "Đầu lưỡi gần mặt sau răng cửa trên, tạo khe hở cho hơi ma sát đi ra.", note: "Âm xát nhẹ, giống 's' tiếng Việt.", examples: [{ pinyin: "sā", meaning: "Buông" }, { pinyin: "sè", meaning: "Màu" }, { pinyin: "sānshí", meaning: "Ba mươi" }, { pinyin: "sūsǐ", meaning: "Tỉnh lại" }] }
      ]
    },
    {
      id: "group6",
      name: "Nhóm 6: Âm đầu lưỡi sau (Âm cong lưỡi)",
      note_special: "Lưu ý quan trọng: Khi phát âm nhóm này, đầu lưỡi phải cong lên chạm hoặc gần chạm vòm miệng cứng.",
      items: [
        { char: "zh", type: "Âm cong lưỡi", detail: "Cong đầu lưỡi chạm vòm cứng, chặn hơi rồi buông nhẹ. Không bật hơi.", note: "Cong lưỡi phát âm gần giống 'tr' tiếng Việt (không bật hơi).", examples: [{ pinyin: "zhā", meaning: "Đâm" }, { pinyin: "zhè", meaning: "Đây" }, { pinyin: "zhòngguó", meaning: "Trung Quốc" }, { pinyin: "zhǔrén", meaning: "Chủ nhân" }] },
        { char: "ch", type: "Âm cong lưỡi (Bật hơi)", detail: "Vị trí lưỡi cong giống 'zh', nhưng bật hơi cực mạnh ra ngoài.", note: "Cong lưỡi + bật hơi mạnh, gần giống 'tr' bật hơi mạnh.", examples: [{ pinyin: "chā", meaning: "Cắm" }, { pinyin: "chù", meaning: "Chỗ" }, { pinyin: "chūnjié", meaning: "Tết Nguyên Đán" }, { pinyin: "chēzhàn", meaning: "Bến xe" }] },
        { char: "sh", type: "Âm cong lưỡi (Âm xát)", detail: "Đầu lưỡi cong lên gần vòm cứng, tạo khe hở cho hơi ma sát đi ra.", note: "Cong lưỡi, phát âm giống âm 's' nặng tiếng Việt.", examples: [{ pinyin: "shā", meaning: "Giết" }, { pinyin: "shù", meaning: "Cây" }, { pinyin: "shǒubǐ", meaning: "Cây bút" }, { pinyin: "shuǐguǒ", meaning: "Hoa quả" }] },
        { char: "r", type: "Âm cong lưỡi (Dây thanh rung)", detail: "Vị trí lưỡi cong giống 'sh', dây thanh rung, luồng hơi ma sát nhẹ.", note: "Gần giống âm 'r' tiếng Việt nhưng êm hơn và cong lưỡi.", examples: [{ pinyin: "rè", meaning: "Nóng" }, { pinyin: "rù", meaning: "Nhập" }, { pinyin: "rénmín", meaning: "Nhân dân" }, { pinyin: "rìběn", meaning: "Nhật Bản" }] }
      ]
    }
  ],
  comparison_table: {
    title: "Bảng So Sánh Nhóm 4 (j, q, x) và Nhóm 5 (z, c, s)",
    rows: [
      { feature: "Cách đặt lưỡi", group4: "Mặt lưỡi nâng áp sát ngạc cứng, đầu lưỡi đặt sau răng dưới", group5: "Đầu lưỡi đặt sau răng cửa trên, lưỡi phẳng" },
      { feature: "Kết hợp với i", group4: "Đọc bình thường là \"i\"", group5: "Đọc thành âm \"ư\"" },
      { feature: "Kết hợp với u, ü và các vận mẫu ghép của u, ü", group4: "Chỉ kết hợp với ü và các vận mẫu ghép của ü (viết là u), không kết hợp với u", group5: "Chỉ kết hợp với u và các vận mẫu ghép của u, không kết hợp với ü" }
    ]
  }
};

export const VAN_MAU_DATA = {
  title: "Vận Mẫu (36 Nguyên Âm)",
  description: "Bao gồm 6 vận mẫu đơn và 30 vận mẫu ghép được phân chia theo nguyên âm chính.",
  groups: [
    {
      id: "v_group1",
      name: "Nhóm 1: Vận Mẫu Đơn (6 âm)",
      standalone_rule: "Chú ý: Khi i, u, ü đứng độc lập tạo thành âm tiết độc lập: 'i' viết thành 'yi', 'u' viết thành 'wu', 'ü' viết thành 'yu' (bỏ dấu 2 chấm).",
      items: [
        { char: "a", detail: "Miệng mở to hết cỡ, lưỡi đặt tự nhiên thả lỏng ở dưới.", note: "Giống 'a' Việt nhưng mở miệng theo chiều dọc sâu hơn.", examples: [{ pinyin: "bā", meaning: "Tám" }, { pinyin: "mǎ", meaning: "Con ngựa" }, { pinyin: "tà", meaning: "Dẫm lên" }, { pinyin: "fā", meaning: "Phát" }] },
        { char: "o", detail: "Miệng hơi mở, tròn môi, lưỡi lùi về sau và nâng nhẹ.", note: "Giống 'ô' hoặc 'ua'. Phải tròn môi chặt.", examples: [{ pinyin: "bó", meaning: "Bác" }, { pinyin: "mò", meaning: "Mực" }, { pinyin: "pó", meaning: "Bà" }] },
        { char: "e", detail: "Miệng nửa mở, lưỡi lùi về sau, nâng lên mức trung bình.", note: "Có 2 cách đọc 'ưa' và 'ơ'. Đọc là 'ơ' khi không có thanh điệu và đi với d, n, l, n, zh, còn lại đọc là 'ưa'.", examples: [{ pinyin: "gē", meaning: "Anh trai" }, { pinyin: "le", meaning: "Rồi (trợ từ)" }, { pinyin: "mè", meaning: "Em gái" }] },
        { char: "i", detail: "Miệng dẹt (khoe răng), căng môi 2 bên. Lưỡi nâng cao.", note: "Giống âm 'i' tiếng Việt.", examples: [{ pinyin: "bǐ", meaning: "Bút" }, { pinyin: "nì", meaning: "Ngán / Chán" }, { pinyin: "qī", meaning: "Số 7" }, { pinyin: "jí", meaning: "Gấp / Nhanh" }] },
        { char: "u", detail: "Môi chu ra tròn và nhỏ, lưỡi nâng cao về phía vòm họng.", note: "Giống âm 'u' tiếng Việt.", examples: [{ pinyin: "bù", meaning: "Không" }, { pinyin: "tú", meaning: "Đồ / Vẽ" }, { pinyin: "shǔ", meaning: "Đếm / Chuột" }, { pinyin: "fú", meaning: "Phúc / Nổi" }] },
        { char: "ü", detail: "Giữ vị trí lưỡi như âm 'i', sau đó tròn môi lại.", note: "Đọc như 'uy'. Đi với j, q, x thì bỏ dấu 2 chấm (ju, qu, xu) nhưng giữ cách đọc.", examples: [{ pinyin: "lǚ", meaning: "Du lịch" }, { pinyin: "nǘ", meaning: "Nữ / Con gái" }, { pinyin: "qū", meaning: "Khu vực" }, { pinyin: "jù", meaning: "Câu" }] }
      ]
    },
    {
      id: "v_group2",
      name: "Nhóm 2: Vận Mẫu Ghép từ a, e, o (9 âm)",
      pronunciation_tip: "Nối âm nhanh từ nguyên âm đầu sang nguyên âm sau.",
      items: [
        { char: "ai", detail: "Bắt đầu bằng âm 'a', trượt nhanh sang 'i'.", note: "Giống âm 'ai' tiếng Việt.", examples: [{ pinyin: "bāi", meaning: "Bẻ" }, { pinyin: "lái", meaning: "Đến" }, { pinyin: "kāi", meaning: "Mở" }, { pinyin: "cāi", meaning: "Đoán" }] },
        { char: "ei", detail: "Phát âm nhẹ nhàng lướt từ e sang i.", note: "Giống âm 'ây' trong tiếng Việt.", examples: [{ pinyin: "bèi", meaning: "Lưng / Lội" }, { pinyin: "lèi", meaning: "Mệt" }, { pinyin: "gěi", meaning: "Cho" }, { pinyin: "měi", meaning: "Đẹp" }] },
        { char: "ao", detail: "Bắt đầu từ âm 'a', trượt sang 'o' (tròn môi).", note: "Giống âm 'ao' trong tiếng Việt.", examples: [{ pinyin: "bāo", meaning: "Cái túi / Bao" }, { pinyin: "gāo", meaning: "Cao" }, { pinyin: "māo", meaning: "Con mèo" }, { pinyin: "lǎo", meaning: "Già / Cũ" }] },
        { char: "ou", detail: "Phát âm lướt từ o sang u.", note: "Giống âm 'âu' trong tiếng Việt.", examples: [{ pinyin: "lòu", meaning: "Rò rỉ" }, { pinyin: "gǒu", meaning: "Con chó" }, { pinyin: "zǒu", meaning: "Đi bộ" }, { pinyin: "móu", meaning: "Mưu đồ" }] },
        { char: "an", detail: "Bắt đầu từ 'a', kết thúc bằng 'n'. Đầu lưỡi chạm chân răng.", note: "Giống vần 'an' tiếng Việt.", examples: [{ pinyin: "bān", meaning: "Lớp / Chuyển" }, { pinyin: "nán", meaning: "Nam / Khó" }, { pinyin: "lán", meaning: "Màu lam / Rổ" }, { pinyin: "kàn", meaning: "Xem / Nhìn" }] },
        { char: "en", detail: "Phát âm nhẹ nhàng kết thúc bằng n.", note: "Giống âm 'ân' trong tiếng Việt.", examples: [{ pinyin: "bēn", meaning: "Chạy" }, { pinyin: "rén", meaning: "Người" }, { pinyin: "gēn", meaning: "Cùng / Rễ" }, { pinyin: "lèn", meaning: "Mặt sầm" }] },
        { char: "ang", detail: "Bắt đầu từ 'a', kết thúc bằng 'ng'. Cuống lưỡi nâng.", note: "Giống vần 'ang' tiếng Việt.", examples: [{ pinyin: "bāng", meaning: "Giúp đỡ" }, { pinyin: "láng", meaning: "Con sói" }, { pinyin: "chāng", meaning: "Thịnh vượng" }, { pinyin: "dāng", meaning: "Làm / Khi" }] },
        { char: "eng", detail: "Phát âm nâng cuống lưỡi chạm vòm mềm.", note: "Giống âm 'âng' trong tiếng Việt.", examples: [{ pinyin: "běng", meaning: "Căng thẳng" }, { pinyin: "lěng", meaning: "Lạnh" }, { pinyin: "dèng", meaning: "Ghế đẩu" }, { pinyin: "chéng", meaning: "Thành phố" }] },
        { char: "ong", detail: "Tròn môi lướt sang ng.", note: "Giống âm 'ung' trong tiếng Việt.", examples: [{ pinyin: "dōng", meaning: "Phía Đông" }, { pinyin: "hóng", meaning: "Màu đỏ" }, { pinyin: "lóng", meaning: "Con rồng" }, { pinyin: "tóng", meaning: "Đồng / Cùng" }] },
        { char: "er", detail: "Phát âm 'ơ', đầu lưỡi cong lên chạm vòm họng.", note: "Âm cuốn lưỡi đặc trưng, độc lập không đi với phụ âm.", examples: [{ pinyin: "ér", meaning: "Nhi (Con)" }, { pinyin: "ěr", meaning: "Tai (Lỗ tai)" }, { pinyin: "èr", meaning: "Số 2" }] }
      ]
    },
    {
      id: "v_group3",
      name: "Nhóm 3: Vận Mẫu Ghép của i (9 âm)",
      pronunciation_tip: "i + [vận mẫu]: Luôn luôn giữ âm 'i' ngắn và lướt nhanh, sau đó chuyển trọng tâm sang vận mẫu phía sau.",
      standalone_rule: "Khi i và các vận mẫu ghép của i đứng 1 mình làm 1 âm tiết:",
      standalone_table: [
        { orig: "i", solo: "yi" }, { orig: "ia", solo: "ya" }, { orig: "ie", solo: "ye" },
        { orig: "iao", solo: "yao" }, { orig: "iou", solo: "you" }, { orig: "ian", solo: "yan" },
        { orig: "in", solo: "yin" }, { orig: "iang", solo: "yang" }, { orig: "ing", solo: "ying" }, { orig: "iong", solo: "yong" }
      ],
      items: [
        { char: "ia", detail: "Phát âm i rồi trượt sang a.", note: "(i+a)", examples: [{ pinyin: "jiā", meaning: "Nhà" }, { pinyin: "xiā", meaning: "Con tôm" }, { pinyin: "qiā", meaning: "Bấm" }, { pinyin: "xià", meaning: "Dưới" }] },
        { char: "ie", detail: "Phát âm i rồi trượt sang ê.", note: "(i+ê)", examples: [{ pinyin: "jiě", meaning: "Chị gái" }, { pinyin: "xiè", meaning: "Cảm ơn" }, { pinyin: "qié", meaning: "Cà tím" }, { pinyin: "niē", meaning: "Nắn" }] },
        { char: "in", detail: "Phát âm i rồi kết thúc bằng n.", note: "Đọc giống in.", examples: [{ pinyin: "jīn", meaning: "Vàng / Cân" }, { pinyin: "xīn", meaning: "Tim / Mới" }, { pinyin: "qín", meaning: "Cần cù" }, { pinyin: "lín", meaning: "Rừng" }] },
        { char: "iao", detail: "Phát âm i rồi trượt sang ao.", note: "( nghe như ieo, nhưng không hoàn toàn là e do trong tiếng trung âm a mở rộng theo chiều dọc)", examples: [{ pinyin: "jiǎo", meaning: "Chân / Góc" }, { pinyin: "xiāo", meaning: "Tiêu tan" }, { pinyin: "qiáo", meaning: "Cây cầu" }, { pinyin: "liào", meaning: "Nguyên liệu" }] },
        { char: "iou (-iu)", detail: "Phát âm i rồi trượt sang ou.", note: "( khi iou đi với thanh mẫu sẽ được viết tắt thành -iu. iou Đọc giống i+ âu)", examples: [{ pinyin: "jiù", meaning: "Cũ / Cứu" }, { pinyin: "xiū", meaning: "Sửa chữa" }, { pinyin: "qiú", meaning: "Quả bóng" }, { pinyin: "liú", meaning: "Chảy / Ở lại" }] },
        { char: "ian", detail: "Phát âm i rồi trượt sang an.", note: "( Đọc giống i+en)", examples: [{ pinyin: "jiān", meaning: "Vai / Giữa" }, { pinyin: "xiān", meaning: "Tươi / Tiên" }, { pinyin: "qián", meaning: "Tiền" }, { pinyin: "nián", meaning: "Năm" }] },
        { char: "ing", detail: "Phát âm i kết thúc bằng ng.", note: "Đọc giống ing.", examples: [{ pinyin: "jīng", meaning: "Kinh đô" }, { pinyin: "xīng", meaning: "Ngôi sao" }, { pinyin: "qíng", meaning: "Tình cảm" }, { pinyin: "líng", meaning: "Số 0" }] },
        { char: "iang", detail: "Phát âm i lướt sang ang.", note: "Đọc nghe hơi giống ieng.", examples: [{ pinyin: "jiāng", meaning: "Sông" }, { pinyin: "xiāng", meaning: "Thơm / Hòm" }, { pinyin: "qiáng", meaning: "Bức tường" }, { pinyin: "liáng", meaning: "Mát mẻ" }] },
        { char: "iong", detail: "Phát âm i lướt sang ong.", note: "Đọc giống i + ung.", examples: [{ pinyin: "jiōng", meaning: "Lúng túng" }, { pinyin: "xiōng", meaning: "Anh trai / Ngực" }, { pinyin: "qióng", meaning: "Nghèo" }, { pinyin: "liōng", meaning: "Lén lút" }] }
      ]
    },
    {
      id: "v_group4",
      name: "Nhóm 4: Vận Mẫu Ghép của ü (3 âm)",
      standalone_rule: "Quy tắc quan trọng của 'ü':\n1. Khi đứng độc lập: Thêm 'y' ở trước và bỏ 2 chấm -> yu, yue, yuan, yun.\n2. Khi ghép với j, q, x: Bỏ dấu 2 chấm trên đầu 'ü' (viết là ju, qu, xu, juan, xuan, jun...) nhưng cách đọc vẫn giữ nguyên là âm 'ü' (uy).\n3. Khi ghép với n, l: Giữ nguyên 2 chấm (nǚ, lǚ).",
      standalone_table: [
        { orig: "ü", solo: "yu" }, { orig: "üe", solo: "yue" },
        { orig: "üan", solo: "yuan" }, { orig: "ün", solo: "yun" }
      ],
      items: [
        { char: "üe", detail: "Phát âm ü rồi lướt sang e.", note: "Đọc giống uy + ê.", examples: [{ pinyin: "jué", meaning: "Cảm thấy" }, { pinyin: "xué", meaning: "Học" }, { pinyin: "yuè", meaning: "Mặt trăng / Tháng" }, { pinyin: "lüè", meaning: "Lược bỏ" }] },
        { char: "üan", detail: "Phát âm ü rồi lướt sang an.", note: "Đọc giống uy + en (uyển).", examples: [{ pinyin: "juān", meaning: "Quyên góp" }, { pinyin: "xuān", meaning: "Tuyên bố" }, { pinyin: "yuán", meaning: "Đồng tiền / Viên" }, { pinyin: "quān", meaning: "Vòng tròn" }] },
        { char: "ün", detail: "Phát âm ü kết thúc bằng n.", note: "Đọc giống uy + n (uyn).", examples: [{ pinyin: "jūn", meaning: "Quân đội" }, { pinyin: "xūn", meaning: "Hôn / Huân" }, { pinyin: "qūn", meaning: "Váy" }, { pinyin: "yūn", meaning: "Choáng váng" }] }
      ]
    },
    {
      id: "v_group5",
      name: "Nhóm 5: Vận Mẫu Ghép của u (8 âm)",
      standalone_rule: "Khi đứng độc lập (không có thanh mẫu đi kèm):\n• Với âm 'u' đơn: Thêm 'w' ở trước -> wu.\n• Với các vận mẫu còn lại: Đổi 'u' thành 'w' -> wa, wo, wai, wei, wan, wen, wang, weng.\n• Lưu ý quan trọng: uei và uen khi kết hợp với thanh mẫu thì được viết tắt là -ui và -un, nhưng cách đọc giữ nguyên.",
      standalone_table: [
        { orig: "u", solo: "wu" }, { orig: "ua", solo: "wa" }, { orig: "uo", solo: "wo" },
        { orig: "uai", solo: "wai" }, { orig: "uei", solo: "wei" }, { orig: "uan", solo: "wan" },
        { orig: "uen", solo: "wen" }, { orig: "uang", solo: "wang" }, { orig: "ueng", solo: "weng" }
      ],
      items: [
        { char: "ua", detail: "Phát âm u rồi lướt sang a.", note: "Giống qua / oa.", examples: [{ pinyin: "huā", meaning: "Hoa" }, { pinyin: "kuā", meaning: "Khen ngợi" }, { pinyin: "shuā", meaning: "Bàn chải / Chải" }] },
        { char: "uo", detail: "Phát âm u rồi lướt sang o.", note: "Đọc giống u + ô (ua).", examples: [{ pinyin: "duó", meaning: "Cướp" }, { pinyin: "shuō", meaning: "Nói" }, { pinyin: "guó", meaning: "Quốc gia" }, { pinyin: "luó", meaning: "Cái chiêng" }] },
        { char: "uai", detail: "Phát âm u rồi lướt sang ai.", note: "Đọc giống oai.", examples: [{ pinyin: "kuài", meaning: "Nhanh / Đồng" }, { pinyin: "shuāi", meaning: "Ngã" }, { pinyin: "huài", meaning: "Hỏng / Xấu" }] },
        { char: "uei (-ui)", detail: "Phát âm u lướt sang ei.", note: "Khi kết hợp với thanh mẫu thì được viết tắt là -ui nhưng cách đọc vẫn giữ nguyên (giống u + ây).", examples: [{ pinyin: "duì", meaning: "Đúng / Đội" }, { pinyin: "huí", meaning: "Về" }, { pinyin: "kuí", meaning: "Khôi ngô" }, { pinyin: "shuǐ", meaning: "Nước" }] },
        { char: "uan", detail: "Phát âm u rồi lướt sang an.", note: "Đọc giống oan.", examples: [{ pinyin: "suān", meaning: "Chua" }, { pinyin: "huān", meaning: "Hoan hỉ" }, { pinyin: "kuān", meaning: "Rộng" }, { pinyin: "duǎn", meaning: "Ngắn" }] },
        { char: "uen (-un)", detail: "Phát âm u lướt sang en.", note: "Khi kết hợp với thanh mẫu thì được viết tắt là -un nhưng cách đọc vẫn giữ nguyên (giống u + ân).", examples: [{ pinyin: "lùn", meaning: "Bàn luận" }, { pinyin: "shùn", meaning: "Thuận lợi" }, { pinyin: "kùn", meaning: "Mệt buồn ngủ" }, { pinyin: "cún", meaning: "Gửi tiết kiệm" }] },
        { char: "uang", detail: "Phát âm u rồi lướt sang ang.", note: "Đọc giống oang.", examples: [{ pinyin: "huāng", meaning: "Hoảng hốt" }, { pinyin: "kuāng", meaning: "Cái khung" }, { pinyin: "shuāng", meaning: "Đôi / Sương" }] },
        { char: "ueng", detail: "Phát âm u rồi lướt sang eng.", note: "Đọc giống u + âng (ít gặp).", examples: [{ pinyin: "wēng", meaning: "Ông lão" }] }
      ]
    }
  ],
  n_ng_tip: {
    title: "Mẹo Phân Biệt & Sửa Ngọng âm 'n' và 'ng'",
    sections: [
      {
        heading: "1. Phân biệt vị trí lưỡi:",
        bullets: [
          "\"n\" là âm đầu lưỡi: Đầu lưỡi đặt chạm chân răng trên (lợi).",
          "\"ng\" là âm cuống lưỡi: Đầu lưỡi thả lỏng, cuống lưỡi nâng cao chạm vòm họng mềm (ngạc mềm)."
        ]
      },
      {
        heading: "2. Khác biệt luồng hơi:",
        bullets: [
          "\"n\" là âm mũi (đầu lưỡi): Luồng hơi thoát qua mũi, chặn ở đầu lưỡi.",
          "\"ng\" là âm mũi (cuống lưỡi): Luồng hơi thoát qua mũi, chặn ở cuống lưỡi."
        ]
      },
      {
        heading: "3. Bài tập:",
        bullets: [
          "Tập đọc luân phiên: \"an - ang\", \"en - eng\", \"in - ing\".",
          "Kiểm tra: Khi đọc \"n\", cảm nhận độ rung ở đầu lưỡi và chân răng. Khi đọc \"ng\", cảm nhận độ rung ở sâu trong họng (cuống lưỡi)."
        ]
      }
    ]
  }
};

export const THANH_DIEU_DATA = {
  title: "Thanh Điệu (Tones in Chinese)",
  description: "Tiếng Trung bao gồm 4 thanh điệu chính và 1 thanh nhẹ (khinh thanh) thể hiện sự thay đổi độ cao của giọng khi phát âm.",
  tones: [
    {
      name: "Thanh 1 (Thanh ngang)",
      symbol: "¯ (vd: ā)",
      pitch: "55 (Cao - Ngang)",
      guide: "Độ cao ở mức 55 (cao nhất). Khi phát âm, kéo dài giọng đi ngang, giữ nguyên cao độ, không lên cũng không xuống.",
      examples: [{ pinyin: "mā", meaning: "Mẹ" }, { pinyin: "fēi", meaning: "Bay" }, { pinyin: "shū", meaning: "Sách" }, { pinyin: "zhōng", meaning: "Trung / Trung Quốc" }]
    },
    {
      name: "Thanh 2 (Thanh sắc)",
      symbol: "´ (vd: á)",
      pitch: "35 (Thấp -> Cao)",
      guide: "Độ cao 35. Âm thanh bắt đầu từ mức trung bình rồi vút nhanh lên cao dứt khoát (giống dấu sắc tiếng Việt nhưng từ thấp đi lên).",
      examples: [{ pinyin: "má", meaning: "Cây đay / Tê" }, { pinyin: "pí", meaning: "Da" }, { pinyin: "wéi", meaning: "Vì / Làm" }, { pinyin: "chóng", meaning: "Côn trùng" }]
    },
    {
      name: "Thanh 3 (Thanh hỏi / nặng)",
      symbol: "ˇ (vd: ǎ)",
      pitch: "214 (Xuống thấp -> Vút lên)",
      guide: "Độ cao 214. Giọng bắt đầu từ mức trung bình thấp, hạ xuống thấp nhất rồi vút lên cao, tạo cảm giác trầm rung dứt khoát.",
      examples: [{ pinyin: "mǎ", meaning: "Con ngựa" }, { pinyin: "fěi", meaning: "Phỉ / Ngọc" }, { pinyin: "shǔ", meaning: "Đếm / Chuột" }, { pinyin: "zhǒng", meaning: "Hạt giống" }]
    },
    {
      name: "Thanh 4 (Thanh huyền nhấn)",
      symbol: "` (vd: à)",
      pitch: "51 (Cao nhất -> Thấp nhất)",
      guide: "Độ cao 51. Đổ dốc dứt khoát từ mức cao nhất xuống mức thấp nhất. Không đọc kéo dài như dấu huyền Việt mà phải đọc nhanh, nhấn mạnh.",
      examples: [{ pinyin: "mà", meaning: "Mắng" }, { pinyin: "fèi", meaning: "Phổi / Phí" }, { pinyin: "shù", meaning: "Cây / Số" }, { pinyin: "zhòng", meaning: "Nặng / Trồng" }]
    },
    {
      name: "Thanh Nhẹ (Khinh thanh / Neutral Tone)",
      symbol: "Không dấu (vd: a)",
      pitch: "Nhẹ - Ngắn",
      guide: "Không mang dấu thanh điệu. Phát âm nhẹ, ngắn, không nhấn giọng (thường xuất hiện ở âm tiết thứ 2 hoặc trợ từ).",
      examples: [{ pinyin: "bàba", meaning: "Bố" }, { pinyin: "māma", meaning: "Mẹ" }, { pinyin: "xièxie", meaning: "Cảm ơn" }, { pinyin: "hǎode", meaning: "Được rồi" }]
    }
  ],
  rules: {
    placement: {
      title: "Quy Tắc Đánh Dấu Thanh Điệu Chuẩn Mới Nhất",
      steps: [
        "Thanh điệu luôn được đánh trên nguyên âm chính (a, o, e, i, u, ü).",
        "Thứ tự ưu tiên nguyên âm: a > o > e > i > u > ü (Nếu có 'a' thì ưu tiên đánh lên 'a', không có 'a' thì xét 'o' hoặc 'e').",
        "Trường hợp 'iu' hoặc 'ui': Dấu thanh điệu luôn đặt trên nguyên âm đứng SAU (vd: iú, uǐ).",
        "Khi đánh dấu thanh điệu trên chữ 'i', phải bỏ dấu chấm trên đầu chữ 'i' (vd: ī, í, ǐ, ì)."
      ]
    },
    sandhi: {
      title: "Quy Tắc Biến Điệu Chuẩn Mới Nhất (3 + 3, 不, 一)",
      cases: [
        {
          case_title: "1. Biến điệu Hai thanh 3 đi liền nhau ( 3 + 3 ➔ 2 + 3 )",
          desc: "Khi 2 âm tiết thanh 3 đi cùng nhau, âm tiết thứ 1 đọc thành thanh 2 ( 2 + 3 ).",
          example: "Nǐ (3) + hǎo (3) ==> Đọc là: Ní hǎo (2 + 3)"
        },
        {
          case_title: "2. Biến điệu của phó từ \"不\" ( bù )",
          desc: "Khi đứng trước từ mang thanh 4, \"不\" đọc đổi thành thanh 2 ( bú ). Khi đứng trước thanh 1, 2, 3 thì giữ nguyên thanh 4 ( bù ).",
          example: "Bù + shì (4) ==> Đọc là: Bú shì | Bù + hǎo (3) ==> Đọc là: Bù hǎo"
        },
        {
          case_title: "3. Biến điệu của số từ \"一\" ( yī )",
          desc: "Đọc đơn lẻ là thanh 1 ( yī ). Khi đứng trước từ thanh 4 đọc thành thanh 2 ( yí ). Khi đứng trước từ thanh 1, 2, 3 đọc thành thanh 4 ( yì ).",
          example: "Yī + yàng (4) ==> Đọc là: Yí yàng | Yī + tiān (1) ==> Đọc là: Yì tiān"
        }
      ]
    }
  }
};
