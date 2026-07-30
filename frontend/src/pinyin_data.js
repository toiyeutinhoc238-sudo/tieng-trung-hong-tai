// Data chuẩn hóa từ 3 file docx: Thanh Mẫu (21), Vận Mẫu (36), và Thanh Điệu

export const THANH_MAU_DATA = {
  title: "Thanh Mẫu (21 Phụ Âm Đầu)",
  description: "Hệ thống 21 phụ âm đầu trong Tiếng Trung được chia làm 6 nhóm theo vị trí và phương thức phát âm.",
  groups: [
    {
      id: "group1",
      name: "Nhóm 1: Âm hai môi & Môi răng",
      items: [
        { char: "b", type: "Âm hai môi", detail: "Mép môi khép lại, luồng hơi ngắt nhẹ rồi bật ra. Không bật hơi.", note: "Phát âm gần giống 'b' hoặc 'p' nhẹ trong tiếng Việt.", examples: [{ pinyin: "bā", meaning: "Tám (Số 8)" }, { pinyin: "bò", meaning: "Bạc hà" }, { pinyin: "bǐ", meaning: "Cây bút" }, { pinyin: "bù", meaning: "Không" }] },
        { char: "p", type: "Âm hai môi (Bật hơi)", detail: "Vị trí môi giống âm 'b', nhưng luồng hơi đẩy mạnh dứt khoát ra ngoài.", note: "Bật hơi rất mạnh (thử bằng tờ giấy trước miệng).", examples: [{ pinyin: "pā", meaning: "Nằm sấp" }, { pinyin: "pó", meaning: "Bà nội / Bà lão" }, { pinyin: "pí", meaning: "Da / Da thuộc" }, { pinyin: "pù", meaning: "Quán / Tiệm" }] },
        { char: "m", type: "Âm hai môi (Âm mũi)", detail: "Hai môi khép lại, luồng hơi thoát ra qua đường mũi, dây thanh rung.", note: "Giống hoàn toàn âm 'm' trong tiếng Việt.", examples: [{ pinyin: "mā", meaning: "Mẹ" }, { pinyin: "mò", meaning: "Mực in" }, { pinyin: "mǐ", meaning: "Gạo / Mét" }, { pinyin: "mù", meaning: "Gỗ" }] },
        { char: "f", type: "Âm môi răng", detail: "Răng cửa trên chạm nhẹ vào môi dưới, luồng hơi ma sát thoát ra.", note: "Giống âm 'ph' / 'f' trong tiếng Việt.", examples: [{ pinyin: "fā", meaning: "Phát / Gửi" }, { pinyin: "fó", meaning: "Phật" }, { pinyin: "fǔ", meaning: "Búa / Phủ" }, { pinyin: "fù", meaning: "Cha / Trả tiền" }] }
      ]
    },
    {
      id: "group2",
      name: "Nhóm 2: Âm đầu lưỡi giữa",
      items: [
        { char: "d", type: "Âm đầu lưỡi giữa", detail: "Đầu lưỡi chạm chân răng trên, luồng hơi ngắt nhẹ rồi bật ra. Không bật hơi.", note: "Đọc giống âm 't' trong tiếng Việt.", examples: [{ pinyin: "dā", meaning: "Dựng / Bắt cầu" }, { pinyin: "dé", meaning: "Được / Đạo đức" }, { pinyin: "dǐ", meaning: "Đáy / Cuối" }, { pinyin: "dù", meaning: "Độ / Qua sông" }] },
        { char: "t", type: "Âm đầu lưỡi giữa (Bật hơi)", detail: "Vị trí lưỡi giống 'd', nhưng đẩy luồng hơi mạnh ra ngoài.", note: "Bật hơi mạnh, đọc gần giống 'th' tiếng Việt.", examples: [{ pinyin: "tā", meaning: "Anh ấy / Cô ấy" }, { pinyin: "tè", meaning: "Đặc biệt" }, { pinyin: "tǐ", meaning: "Thể / Thể thao" }, { pinyin: "tù", meaning: "Thỏ / Nôn" }] },
        { char: "n", type: "Âm đầu lưỡi giữa (Âm mũi)", detail: "Đầu lưỡi chạm chân răng trên, luồng hơi thoát qua đường mũi.", note: "Giống âm 'n' tiếng Việt.", examples: [{ pinyin: "nā", meaning: "Nam mô" }, { pinyin: "nè", meaning: "Nói lắp" }, { pinyin: "nǐ", meaning: "Bạn / Anh" }, { pinyin: "nù", meaning: "Tức giận" }] },
        { char: "l", type: "Âm đầu lưỡi giữa (Âm bên)", detail: "Đầu lưỡi chạm chân răng trên, luồng hơi thoát ra hai bên cạnh lưỡi.", note: "Giống âm 'l' tiếng Việt.", examples: [{ pinyin: "lā", meaning: "Kéo / Nắm" }, { pinyin: "lè", meaning: "Vui vẻ" }, { pinyin: "lǐ", meaning: "Trong / Lý lẽ" }, { pinyin: "lù", meaning: "Con đường" }] }
      ]
    },
    {
      id: "group3",
      name: "Nhóm 3: Âm cuống lưỡi (Gốc lưỡi)",
      items: [
        { char: "g", type: "Âm cuống lưỡi", detail: "Cuống lưỡi nâng lên chạm vòm mềm, ngắt hơi rồi buông nhẹ. Không bật hơi.", note: "Phát âm giống âm 'c' hoặc 'k' trong tiếng Việt.", examples: [{ pinyin: "gā", meaning: "Cà rê" }, { pinyin: "gē", meaning: "Anh trai" }, { pinyin: "gǔ", meaning: "Cổ / Cái trống" }, { pinyin: "gù", meaning: "Cố hương" }] },
        { char: "k", type: "Âm cuống lưỡi (Bật hơi)", detail: "Vị trí giống 'g', nhưng bật luồng hơi mạnh từ cuống họng ra.", note: "Âm bật hơi mạnh, nghe giống 'kh' tiếng Việt.", examples: [{ pinyin: "kā", meaning: "Cà phê" }, { pinyin: "kě", meaning: "Khát / Có thể" }, { pinyin: "kǔ", meaning: "Đắng / Khổ" }, { pinyin: "kù", meaning: "Quần / Kho" }] },
        { char: "h", type: "Âm cuống lưỡi (Âm xát)", detail: "Cuống lưỡi nâng gần vòm mềm tạo khe hở cho luồng hơi ma sát đi ra.", note: "Giữa 'h' và 'kh' tiếng Việt (nhẹ hơn 'kh').", examples: [{ pinyin: "hā", meaning: "Há miệng / Cười" }, { pinyin: "hē", meaning: "Uống" }, { pinyin: "hǔ", meaning: "Con hổ" }, { pinyin: "hù", meaning: "Hộ gia đình" }] }
      ]
    },
    {
      id: "group4",
      name: "Nhóm 4: Âm mặt lưỡi",
      items: [
        { char: "j", type: "Âm mặt lưỡi", detail: "Mặt lưỡi áp sát ngạc cứng, đầu lưỡi đặt sau răng dưới. Không bật hơi.", note: "Gần giống âm 'ch' tiếng Việt nhưng mặt lưỡi phẳng.", examples: [{ pinyin: "jī", meaning: "Con gà" }, { pinyin: "jū", meaning: "Cư trú / Ở" }, { pinyin: "jiā", meaning: "Gia đình / Nhà" }, { pinyin: "jù", meaning: "Câu văn / Kịch" }] },
        { char: "q", type: "Âm mặt lưỡi (Bật hơi)", detail: "Vị trí giống 'j', nhưng bật luồng hơi rất mạnh thoát ra qua kẽ răng.", note: "Bật hơi mạnh (kiểm tra bằng giấy).", examples: [{ pinyin: "qī", meaning: "Số 7 / Bảy" }, { pinyin: "qū", meaning: "Khu vực" }, { pinyin: "qiā", meaning: "Bấm / Bắt lấy" }, { pinyin: "qù", meaning: "Đi" }] },
        { char: "x", type: "Âm mặt lưỡi (Âm xát)", detail: "Mặt lưỡi nâng gần ngạc cứng tạo kẽ hở cho luồng hơi ma sát.", note: "Phát âm nhẹ nhàng giống 'x' tiếng Việt.", examples: [{ pinyin: "xī", meaning: "Phía Tây / Hít" }, { pinyin: "xū", meaning: "Cần thiết / Nhẹ" }, { pinyin: "xiā", meaning: "Con tôm / Mù" }, { pinyin: "xù", meaning: "Lời nói đầu" }] }
      ]
    },
    {
      id: "group5",
      name: "Nhóm 5: Âm đầu lưỡi trước",
      note_special: "Lưu ý đặc biệt: Khi các âm z, c, s đi kèm với nguyên âm 'i', âm 'i' sẽ được đọc thành 'ư' (vd: zi = tư, ci = tư, si = tư).",
      items: [
        { char: "z", type: "Âm đầu lưỡi trước", detail: "Đầu lưỡi thẳng chạm mặt sau răng cửa trên, ngắt hơi rồi buông nhẹ.", note: "Không bật hơi. Gần giống âm 'ch' tiếng Việt nhưng lưỡi thẳng phẳng.", examples: [{ pinyin: "zā", meaning: "Buộc / Cột" }, { pinyin: "zǎo", meaning: "Buổi sáng / Quả táo" }, { pinyin: "zè", meaning: "Trắc" }, { pinyin: "zù", meaning: "Tổ / Thuê" }] },
        { char: "c", type: "Âm đầu lưỡi trước (Bật hơi)", detail: "Vị trí giống 'z', nhưng bật luồng hơi dứt khoát cực mạnh ra ngoài.", note: "Bật hơi mạnh (dùng tờ giấy thử luồng hơi).", examples: [{ pinyin: "cā", meaning: "Lau / Chùi" }, { pinyin: "cǎo", meaning: "Cỏ" }, { pinyin: "cè", meaning: "Trang / Cuốn sách" }, { pinyin: "cù", meaning: "Giấm" }] },
        { char: "s", type: "Âm đầu lưỡi trước (Âm xát)", detail: "Đầu lưỡi gần mặt sau răng cửa trên, tạo khe hở cho hơi ma sát đi ra.", note: "Âm xát nhẹ, giống 's' tiếng Việt.", examples: [{ pinyin: "sā", meaning: "Buông thả" }, { pinyin: "sǎo", meaning: "Quét nhà" }, { pinyin: "sè", meaning: "Màu sắc" }, { pinyin: "sù", meaning: "Tố cáo / Chất" }] }
      ]
    },
    {
      id: "group6",
      name: "Nhóm 6: Âm đầu lưỡi sau (Âm cong lưỡi)",
      note_special: "Lưu ý quan trọng: Khi phát âm nhóm này, đầu lưỡi phải cong lên chạm hoặc gần chạm vòm miệng cứng. Khi đi với 'i', 'i' được đọc thành 'ư' (zh-ch-sh-r + i -> chư, trư, sư, rư).",
      items: [
        { char: "zh", type: "Âm cong lưỡi", detail: "Cong đầu lưỡi chạm vòm cứng, chặn hơi rồi buông nhẹ. Không bật hơi.", note: "Cong lưỡi phát âm gần giống 'tr' tiếng Việt (không bật hơi).", examples: [{ pinyin: "zhā", meaning: "Đâm / Cắm" }, { pinyin: "zhǎo", meaning: "Tìm kiếm" }, { pinyin: "zhè", meaning: "Đây / Này" }, { pinyin: "zhù", meaning: "Sinh sống / Chúc" }] },
        { char: "ch", type: "Âm cong lưỡi (Bật hơi)", detail: "Vị trí lưỡi cong giống 'zh', nhưng bật hơi cực mạnh ra ngoài.", note: "Cong lưỡi + bật hơi mạnh, gần giống 'tr' bật hơi mạnh.", examples: [{ pinyin: "chā", meaning: "Cắm / Cài" }, { pinyin: "chǎo", meaning: "Cãi nhau / Răng" }, { pinyin: "chè", meaning: "Triệt / Rõ ràng" }, { pinyin: "chù", meaning: "Nơi / Chỗ" }] },
        { char: "sh", type: "Âm cong lưỡi (Âm xát)", detail: "Đầu lưỡi cong lên gần vòm cứng, tạo khe hở cho hơi ma sát đi ra.", note: "Cong lưỡi, phát âm giống âm 's' nặng tiếng Việt.", examples: [{ pinyin: "shā", meaning: "Giết / Cát" }, { pinyin: "shǎo", meaning: "Ít" }, { pinyin: "shè", meaning: "Bắn / Bắn súng" }, { pinyin: "shù", meaning: "Cây / Số" }] },
        { char: "r", type: "Âm cong lưỡi (Dây thanh rung)", detail: "Vị trí lưỡi cong giống 'sh', dây thanh rung, luồng hơi ma sát nhẹ.", note: "Gần giống âm 'r' tiếng Việt nhưng êm hơn và cong lưỡi.", examples: [{ pinyin: "rā", meaning: "Nói nhảm" }, { pinyin: "rǎo", meaning: "Làm phiền" }, { pinyin: "rè", meaning: "Nóng / Nhiệt" }, { pinyin: "rù", meaning: "Vào / Nhập" }] }
      ]
    }
  ],
  comparison_table: {
    title: "Bảng So Sánh Nhóm 4 (j, q, x) và Nhóm 5 (z, c, s)",
    rows: [
      { feature: "Cách đặt lưỡi", group4: "Mặt lưỡi nâng áp sát ngạc cứng, đầu lưỡi đặt sau răng dưới", group5: "Đầu lưỡi đặt sau răng cửa trên, lưỡi phẳng thẳng" },
      { feature: "Kết hợp với nguyên âm 'i'", group4: "Đọc bình thường là 'i' (ji, qi, xi)", group5: "Đọc thành âm 'ư' (zi, ci, si)" },
      { feature: "Kết hợp với 'u', 'ü'", group4: "Chỉ kết hợp với 'ü' (viết bỏ 2 chấm thành ju, qu, xu)", group5: "Chỉ kết hợp với 'u' (zu, cu, su), không kết hợp với 'ü'" }
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
        { char: "e", detail: "Miệng nửa mở, lưỡi lùi về sau, nâng lên mức trung bình.", note: "Đọc là 'ưa'. Đọc là 'ơ' khi không có thanh điệu hoặc đi với d, n, l, m, zh.", examples: [{ pinyin: "gē", meaning: "Anh trai" }, { pinyin: "le", meaning: "Rồi (trợ từ)" }, { pinyin: "mè", meaning: "Em gái" }] },
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
      pronunciation_tip: "Giữ âm 'i' ngắn lướt nhanh, chuyển trọng tâm sang âm phía sau.",
      standalone_table: [
        { orig: "i", solo: "yi" }, { orig: "ia", solo: "ya" }, { orig: "ie", solo: "ye" },
        { orig: "iao", solo: "yao" }, { orig: "iou", solo: "you" }, { orig: "ian", solo: "yan" },
        { orig: "in", solo: "yin" }, { orig: "iang", solo: "yang" }, { orig: "ing", solo: "ying" }, { orig: "iong", solo: "yong" }
      ],
      items: [
        { char: "ia", detail: "Phát âm i rồi trượt nhanh sang a.", note: "Nghe như i+a.", examples: [{ pinyin: "jiā", meaning: "Nhà" }, { pinyin: "xiā", meaning: "Con tôm" }, { pinyin: "qiā", meaning: "Bấm" }, { pinyin: "xià", meaning: "Dưới" }] },
        { char: "ie", detail: "Phát âm i rồi trượt sang ê.", note: "Đọc giống i + ê.", examples: [{ pinyin: "jiě", meaning: "Chị gái" }, { pinyin: "xiè", meaning: "Cảm ơn" }, { pinyin: "qié", meaning: "Cà tím" }, { pinyin: "niē", meaning: "Nắn" }] },
        { char: "in", detail: "Phát âm i kết thúc bằng n.", note: "Đọc giống in.", examples: [{ pinyin: "jīn", meaning: "Vàng / Cân" }, { pinyin: "xīn", meaning: "Tim / Mới" }, { pinyin: "qín", meaning: "Cần cù" }, { pinyin: "lín", meaning: "Rừng" }] },
        { char: "iao", detail: "Phát âm i rồi trượt sang ao.", note: "Đọc gần như ieo.", examples: [{ pinyin: "jiǎo", meaning: "Chân / Góc" }, { pinyin: "xiāo", meaning: "Tiêu tan" }, { pinyin: "qiáo", meaning: "Cây cầu" }, { pinyin: "liào", meaning: "Nguyên liệu" }] },
        { char: "iu (iou)", detail: "Phát âm i lướt sang ou. Khi có phụ âm viết tắt là -iu.", note: "Đọc giống i + âu.", examples: [{ pinyin: "jiù", meaning: "Cũ / Cứu" }, { pinyin: "xiū", meaning: "Sửa chữa" }, { pinyin: "qiú", meaning: "Quả bóng" }, { pinyin: "liú", meaning: "Chảy / Ở lại" }] },
        { char: "ian", detail: "Phát âm i lướt sang an.", note: "Đọc giống i + en (iên).", examples: [{ pinyin: "jiān", meaning: "Vai / Giữa" }, { pinyin: "xiān", meaning: "Tươi / Tiên" }, { pinyin: "qián", meaning: "Tiền" }, { pinyin: "nián", meaning: "Năm" }] },
        { char: "ing", detail: "Phát âm i kết thúc bằng ng.", note: "Đọc giống ing.", examples: [{ pinyin: "jīng", meaning: "Kinh đô" }, { pinyin: "xīng", meaning: "Ngôi sao" }, { pinyin: "qíng", meaning: "Tình cảm" }, { pinyin: "líng", meaning: "Số 0" }] },
        { char: "iang", detail: "Phát âm i lướt sang ang.", note: "Đọc nghe hơi giống ieng.", examples: [{ pinyin: "jiāng", meaning: "Sông" }, { pinyin: "xiāng", meaning: "Thơm / Hòm" }, { pinyin: "qiáng", meaning: "Bức tường" }, { pinyin: "liáng", meaning: "Mát mẻ" }] },
        { char: "iong", detail: "Phát âm i lướt sang ong.", note: "Đọc giống i + ung.", examples: [{ pinyin: "jiōng", meaning: "Lúng túng" }, { pinyin: "xiōng", meaning: "Anh trai / Ngực" }, { pinyin: "qióng", meaning: "Nghèo" }, { pinyin: "liōng", meaning: "Lén lút" }] }
      ]
    },
    {
      id: "v_group4",
      name: "Nhóm 4: Vận Mẫu Ghép của ü (3 âm)",
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
      standalone_table: [
        { orig: "u", solo: "wu" }, { orig: "ua", solo: "wa" }, { orig: "uo", solo: "wo" },
        { orig: "uai", solo: "wai" }, { orig: "uei", solo: "wei" }, { orig: "uan", solo: "wan" },
        { orig: "uen", solo: "wen" }, { orig: "uang", solo: "wang" }, { orig: "ueng", solo: "weng" }
      ],
      items: [
        { char: "ua", detail: "Phát âm u rồi lướt sang a.", note: "Giống qua / oa.", examples: [{ pinyin: "huā", meaning: "Hoa" }, { pinyin: "kuā", meaning: "Khen ngợi" }, { pinyin: "shuā", meaning: "Bàn chải / Chải" }] },
        { char: "uo", detail: "Phát âm u rồi lướt sang o.", note: "Đọc giống u + ô (ua).", examples: [{ pinyin: "duó", meaning: "Cướp" }, { pinyin: "shuō", meaning: "Nói" }, { pinyin: "guó", meaning: "Quốc gia" }, { pinyin: "luó", meaning: "Cái chiêng" }] },
        { char: "uai", detail: "Phát âm u rồi lướt sang ai.", note: "Đọc giống oai.", examples: [{ pinyin: "kuài", meaning: "Nhanh / Đồng" }, { pinyin: "shuāi", meaning: "Ngã" }, { pinyin: "huài", meaning: "Hỏng / Xấu" }] },
        { char: "ui (uei)", detail: "Phát âm u lướt sang ei. Đi với thanh mẫu viết tắt là -ui.", note: "Đọc giống u + ây (uôi).", examples: [{ pinyin: "duì", meaning: "Đúng / Đội" }, { pinyin: "huí", meaning: "Về" }, { pinyin: "kuí", meaning: "Khôi ngô" }, { pinyin: "shuǐ", meaning: "Nước" }] },
        { char: "uan", detail: "Phát âm u rồi lướt sang an.", note: "Đọc giống oan.", examples: [{ pinyin: "suān", meaning: "Chua" }, { pinyin: "huān", meaning: "Hoan hỉ" }, { pinyin: "kuān", meaning: "Rộng" }, { pinyin: "duǎn", meaning: "Ngắn" }] },
        { char: "un (uen)", detail: "Phát âm u lướt sang en. Đi với thanh mẫu viết tắt là -un.", note: "Đọc giống u + ân (uân).", examples: [{ pinyin: "lùn", meaning: "Bàn luận" }, { pinyin: "shùn", meaning: "Thuận lợi" }, { pinyin: "kùn", meaning: "Mệt buồn ngủ" }, { pinyin: "cún", meaning: "Gửi tiết kiệm" }] },
        { char: "uang", detail: "Phát âm u rồi lướt sang ang.", note: "Đọc giống oang.", examples: [{ pinyin: "huāng", meaning: "Hoảng hốt" }, { pinyin: "kuāng", meaning: "Cái khung" }, { pinyin: "shuāng", meaning: "Đôi / Sương" }] },
        { char: "ueng", detail: "Phát âm u rồi lướt sang eng.", note: "Đọc giống u + âng (ít gặp).", examples: [{ pinyin: "wēng", meaning: "Ông lão" }] }
      ]
    }
  ],
  n_ng_tip: {
    title: "Mẹo Phân Biệt & Sửa Ngọng âm 'n' và 'ng'",
    points: [
      { topic: "Vị trí lưỡi", detail: "'n' là âm đầu lưỡi (đầu lưỡi chạm chân răng trên). 'ng' là âm cuống lưỡi (đầu lưỡi thả lỏng, cuống lưỡi nâng cao chạm ngạc mềm)." },
      { topic: "Luồng hơi", detail: "'n' luồng hơi qua mũi và chặn ở đầu lưỡi. 'ng' luồng hơi qua mũi và chặn sâu trong cuống lưỡi." },
      { topic: "Bài tập thực hành", detail: "Tập luyện đọc luân phiên: 'an - ang', 'en - eng', 'in - ing'." }
    ]
  }
};

export const THANH_DIEU_DATA = {
  title: "Thanh Điệu (Tones in Chinese)",
  description: "Tiếng Trung có 4 thanh điệu chính thể hiện sự thay đổi độ cao của giọng khi phát âm.",
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
    }
  ],
  rules: {
    placement: {
      title: "Quy Tắc Đánh Dấu Thanh Điệu",
      steps: [
        "Thanh điệu luôn được đánh trên nguyên âm chính (a, o, e, i, u, ü).",
        "Thứ tự ưu tiên nguyên âm: a > o > e > i > u > ü (Nếu có 'a' thì ưu tiên đánh lên 'a', không có 'a' thì xét 'o' hoặc 'e').",
        "Trường hợp 'iu' hoặc 'ui': Dấu thanh điệu luôn đặt trên nguyên âm đứng SAU (vd: iú, uǐ).",
        "Khi đánh dấu thanh điệu trên chữ 'i', phải bỏ dấu chấm trên đầu chữ 'i' (vd: ī, í, ǐ, ì)."
      ]
    },
    sandhi: {
      title: "Quy Tắc Biến Điệu Thanh 3 (Nổi Tiếng)",
      cases: [
        {
          case_title: "Trường hợp 1: Hai thanh 3 đi liền nhau ( 3 + 3 )",
          desc: "Âm tiết thứ nhất đọc thành thanh 2 ( 2 + 3 ).",
          example: "Nǐ (thanh 3) + hǎo (thanh 3)  ==> Đọc là: Ní hǎo (thanh 2 + thanh 3)"
        },
        {
          case_title: "Trường hợp 2: Ba thanh 3 đi liền nhau có cấu trúc A + (B + C)",
          desc: "Âm tiết thứ 2 (B) biến đổi thành thanh 2.",
          example: "Wǒ (3) + hěn (3) hǎo (3) ==> Đọc là: Wǒ hén hǎo (3 + 2 + 3)"
        },
        {
          case_title: "Trường hợp 3: Ba thanh 3 đi liền nhau có cấu trúc (A + B) + C",
          desc: "Cả 2 âm tiết đầu (A và B) biến đổi thành thanh 2.",
          example: "Mǎ (3) zhǎng (3) + hǎo (3) ==> Đọc là: Má zháng hǎo (2 + 2 + 3)"
        }
      ]
    }
  }
};
