import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const fixMap = {
  971: { pinyin: 'xībian', meaning: 'phía tây' },
  1046: { pinyin: 'dàolù', meaning: 'con đường' },
  1291: { pinyin: 'tóu (lǐtou)', meaning: 'đầu (bên trong)' },
  1324: { pinyin: 'xiàohuar', meaning: 'chuyện cười' },
  1456: { pinyin: 'biāozhǔn', meaning: 'tiêu chuẩn' },
  50001: { pinyin: 'bā', meaning: 'tám (8)' },
  50003: { pinyin: 'èr', meaning: 'hai (2)' },
  50005: { pinyin: 'liù', meaning: 'sáu (6)' },
  50008: { pinyin: 'sān', meaning: 'ba (3)' },
  50009: { pinyin: 'shí', meaning: 'mười (10)' },
  50010: { pinyin: 'yī', meaning: 'một (1)' },
  50014: { pinyin: 'bù', meaning: 'không' },
  50015: { pinyin: 'xiǎo', meaning: 'nhỏ, bé' },
  50018: { pinyin: 'jiàn', meaning: 'gặp, thấy' },
  50019: { pinyin: 'shān', meaning: 'núi' },
  50024: { pinyin: 'rén', meaning: 'người' },
  50028: { pinyin: 'xīn', meaning: 'tim, lòng' },
  50029: { pinyin: 'zhōng', meaning: 'trong, giữa, Trung Quốc' },
  50032: { pinyin: 'jǐ', meaning: 'mấy, vài' },
  50033: { pinyin: 'jiǔ', meaning: 'chín (9)' },
  50037: { pinyin: 'qī', meaning: 'bảy (7)' },
  50043: { pinyin: 'ér', meaning: 'con, nhi' },
  50044: { pinyin: 'dà', meaning: 'lớn, to' },
  50047: { pinyin: 'le', meaning: 'trợ từ đã, rồi' },
  50049: { pinyin: 'shuǐ', meaning: 'nước' },
  50059: { pinyin: 'wǒ', meaning: 'tôi, ta' },
  50066: { pinyin: 'dōng', meaning: 'đông (hướng đông)' },
  50067: { pinyin: 'xī', meaning: 'tây (hướng tây)' },
  50074: { pinyin: 'shū', meaning: 'sách' },
  50075: { pinyin: 'sì', meaning: 'bốn (4)' },
  50076: { pinyin: 'wǔ', meaning: 'năm (5)' },
  50081: { pinyin: 'shuǐ', meaning: 'bộ Thủy (nước)' },
  50082: { pinyin: 'yán', meaning: 'bộ Ngôn (lời nói)' },
  50087: { pinyin: 'gè', meaning: 'lượng từ cái, con, người' },
  50095: { pinyin: 'shǎo', meaning: 'ít' },
  50100: { pinyin: 'wǎng', meaning: 'bộ Võng (mạng, lưới)' },
  50110: { pinyin: 'zài', meaning: 'ở, tại, đang' },
  50113: { pinyin: 'zǐ', meaning: 'con, tử' },
  50114: { pinyin: 'gōng', meaning: 'công (công việc, thợ)' },
  50115: { pinyin: 'chuò', meaning: 'bộ Quai Sước (bước đi)' },
  50117: { pinyin: 'běn', meaning: 'cuốn, quyển, gốc' },
  50126: { pinyin: 'xià', meaning: 'dưới, xuống' },
  50132: { pinyin: 'shàng', meaning: 'trên, lên' },
  50133: { pinyin: 'mò', meaning: 'cuối, mạt' },
  50134: { pinyin: 'shì', meaning: 'bộ Thị (thần linh, tế lễ)' },
  50145: { pinyin: 'wǔ', meaning: 'ngọ (trưa)' },
  50146: { pinyin: 'diàn', meaning: 'điện' },
  50147: { pinyin: 'fù', meaning: 'bộ Phụ' },
  50148: { pinyin: 'rén', meaning: 'bộ Nhân đứng' },
  50162: { pinyin: 'yǔ', meaning: 'mưa' },
  50164: { pinyin: 'tiān', meaning: 'trời, ngày' },
  50165: { pinyin: 'qì', meaning: 'khí, không khí, thời tiết' },
  50166: { pinyin: 'sī', meaning: 'bộ Mịch (tơ lụa)' },
  50178: { pinyin: 'xí', meaning: 'tập, học tập' },
  50183: { pinyin: 'huí', meaning: 'về, quay về, lần' },
  50184: { pinyin: 'kāi', meaning: 'mở, lái (xe)' },
  50201: { pinyin: 'nián', meaning: 'năm (năm tháng)' },
  50206: { pinyin: 'chū', meaning: 'ra, ra ngoài' },
  50207: { pinyin: 'fēi', meaning: 'bay' },
  50208: { pinyin: 'cǎo', meaning: 'bộ Thảo (cỏ)' },
  50209: { pinyin: 'mián', meaning: 'bộ Miên (mái nhà)' },
  50223: { pinyin: 'yě', meaning: 'cũng' },
  50224: { pinyin: 'gān', meaning: 'làm, khô' },
  50240: { pinyin: 'chū', meaning: 'ra, ra ngoài' },
  50241: { pinyin: 'mén', meaning: 'cửa' },
  50258: { pinyin: 'jīn', meaning: 'cân (nửa kg)' },
  50259: { pinyin: 'liǎng', meaning: 'hai (lượng từ)' },
  50273: { pinyin: 'bái', meaning: 'trắng' },
  50274: { pinyin: 'cháng', meaning: 'dài' },
  50289: { pinyin: 'zhàng', meaning: 'trượng' },
  50290: { pinyin: 'fū', meaning: 'chồng, phu' },
  50304: { pinyin: 'lè', meaning: 'vui vẻ, âm nhạc' },
  50305: { pinyin: 'wèi', meaning: 'vì, cho' },
  50319: { pinyin: 'niú', meaning: 'bò, trâu' },
  50320: { pinyin: 'guā', meaning: 'dưa' },
  51488: { pinyin: 'cháyè', meaning: 'lá trà, chè' },
  51489: { pinyin: 'chéngkè', meaning: 'hành khách' },
  51490: { pinyin: 'chúshī', meaning: 'đầu bếp' },
  51491: { pinyin: 'dàhǎi', meaning: 'biển lớn, đại dương' },
  51492: { pinyin: 'hánlěng', meaning: 'lạnh giá, rét buốt' },
  51493: { pinyin: 'jiàngwēn', meaning: 'giảm nhiệt độ' },
  51494: { pinyin: 'jiāojǐng', meaning: 'cảnh sát giao thông' },
  51495: { pinyin: 'jīngxǐ', meaning: 'bất ngờ vui vẻ' },
  51496: { pinyin: 'jǔlì', meaning: 'lấy ví dụ' },
  51497: { pinyin: 'qīnqíng', meaning: 'tình thân, tình gia đình' },
  51498: { pinyin: 'shùyè', meaning: 'lá cây' },
  51499: { pinyin: 'sūnnǚ', meaning: 'cháu gái' },
  51500: { pinyin: 'tánlùn', meaning: 'thảo luận, bàn luận' },
  51501: { pinyin: 'tíngzhǐ', meaning: 'dừng lại, ngừng' },
  51502: { pinyin: 'wǎngzhǐ', meaning: 'địa chỉ trang web' },
  51503: { pinyin: 'xìxīn', meaning: 'cẩn thận, tỉ mỉ' },
  51504: { pinyin: 'xìnxiāng', meaning: 'hòm thư, hộp thư' },
  51505: { pinyin: 'yántǎo', meaning: 'nghiên cứu thảo luận' }
};

let updated = 0;
data.forEach(item => {
  if (fixMap[item.id]) {
    item.pinyin = fixMap[item.id].pinyin;
    item.meaning = fixMap[item.id].meaning;
    updated++;
  }
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Successfully updated ${updated} items in database.json!`);
