import { VocabMap } from './types';

export interface LibraryUnit {
  vocab: VocabMap;
  positions: Record<string, { x: number, y: number }>;
  imageUrl: string;
}

export const VOCAB_DATA: VocabMap = {
  "1": { "word": "agency", "ipa": "/'eɪdʒənsi/", "vn": "hãng/đại lý du lịch", "hint": "Starts with A" }
};

export const LIBRARY_DATA: Record<number, LibraryUnit> = {
  1: {
    imageUrl: "https://res.cloudinary.com/dbgrj3gf0/image/upload/v1770173308/unit_1_pwm3vb.jpg",
    vocab: {
      "1": { "word": "activity", "ipa": "/æk'tivəti/", "vn": "hoạt động", "hint": "Starts with A" },
      "2": { "word": "art", "ipa": "/ɑ:t/", "vn": "nghệ thuật", "hint": "Starts with A" },
      "3": { "word": "boarding school", "ipa": "/'bɔ:dɪŋ sku:l/", "vn": "trường nội trú", "hint": "Starts with B" },
      "4": { "word": "calculator", "ipa": "/'kælkjuleɪtə/", "vn": "máy tính", "hint": "Starts with C" },
      "5": { "word": "classmate", "ipa": "/'klɑ:smeɪt/", "vn": "bạn cùng lớp", "hint": "Starts with C" },
      "6": { "word": "compass", "ipa": "/'kʌmpəs/", "vn": "com-pa", "hint": "Starts with C" },
      "7": { "word": "favourite", "ipa": "/'feɪvərɪt/", "vn": "được yêu thích", "hint": "Starts with F" },
      "8": { "word": "help", "ipa": "/help/", "vn": "sự giúp đỡ", "hint": "Starts with H" },
      "9": { "word": "international", "ipa": "/ɪntə'næʃnəl/", "vn": "quốc tế", "hint": "Starts with I" },
      "10": { "word": "interview", "ipa": "/'ɪntəvju:/", "vn": "cuộc phỏng vấn", "hint": "Starts with I" },
      "11": { "word": "knock", "ipa": "/nɒk/", "vn": "gõ (cửa)", "hint": "Starts with K" },
      "12": { "word": "remember", "ipa": "/rɪ'membə/", "vn": "nhớ, ghi nhớ", "hint": "Starts with R" },
      "13": { "word": "share", "ipa": "/ʃeə/", "vn": "chia sẻ", "hint": "Starts with S" },
      "14": { "word": "smart", "ipa": "/smɑ:t/", "vn": "bảnh bao, gọn gàng", "hint": "Starts with S" },
      "15": { "word": "swimming pool", "ipa": "/'swɪmɪŋ pu:l/", "vn": "bể bơi", "hint": "Starts with S" }
    },
    positions: {
      "1": { "x": 58, "y": 36 }, "2": { "x": 41, "y": 88 }, "3": { "x": 47, "y": 14 },
      "4": { "x": 83, "y": 76 }, "5": { "x": 71, "y": 94 }, "6": { "x": 96, "y": 84 },
      "7": { "x": 73, "y": 46 }, "8": { "x": 36, "y": 91 }, "9": { "x": 53, "y": 3 },
      "10": { "x": 64, "y": 47 }, "11": { "x": 40, "y": 37 }, "12": { "x": 90, "y": 41 },
      "13": { "x": 64, "y": 57 }, "14": { "x": 11, "y": 83 }, "15": { "x": 65, "y": 30 }
    }
  },
  2: {
    imageUrl: "https://res.cloudinary.com/dbgrj3gf0/image/upload/v1770173308/unit__2_r4kemy.jpg",
    vocab: {
      "1": { "word": "between", "ipa": "/bɪ'twi:n/", "vn": "ở giữa", "hint": "Starts with B" },
      "2": { "word": "chest of drawers", "ipa": "/tʃest əv drɔ:z/", "vn": "tủ có ngăn kéo", "hint": "Starts with C" },
      "3": { "word": "cooker", "ipa": "/'kʊkə/", "vn": "bếp", "hint": "Starts with C" },
      "4": { "word": "country house", "ipa": "/'kʌntri haʊs/", "vn": "nhà ở vùng quê", "hint": "Starts with C" },
      "5": { "word": "crazy", "ipa": "/'kreɪzi/", "vn": "kì lạ", "hint": "Starts with C" },
      "6": { "word": "cupboard", "ipa": "/'kʌbəd/", "vn": "tủ đựng bát đĩa", "hint": "Starts with C" },
      "7": { "word": "department store", "ipa": "/dɪ'pɑ:tmənt stɔ:/", "vn": "cửa hàng bách hoá", "hint": "Starts with D" },
      "8": { "word": "dishwasher", "ipa": "/'dɪʃwɒʃə/", "vn": "máy rửa bát", "hint": "Starts with D" },
      "9": { "word": "flat", "ipa": "/flæt/", "vn": "căn hộ", "hint": "Starts with F" },
      "10": { "word": "furniture", "ipa": "/'fɜ:nɪtʃə/", "vn": "đồ đạc trong nhà", "hint": "Starts with F" },
      "11": { "word": "hall", "ipa": "/hɔ:l/", "vn": "sảnh", "hint": "Starts with H" },
      "12": { "word": "in front of", "ipa": "/ɪn frʌnt əv/", "vn": "ở đằng trước", "hint": "Starts with I" },
      "13": { "word": "next to", "ipa": "/'nekst tə/", "vn": "bên cạnh", "hint": "Starts with N" },
      "14": { "word": "shelf", "ipa": "/ʃelf/", "vn": "kệ, giá", "hint": "Starts with S" },
      "15": { "word": "sink", "ipa": "/sɪŋk/", "vn": "bồn rửa bát", "hint": "Starts with S" },
      "16": { "word": "strange", "ipa": "/streɪndʒ/", "vn": "kì lạ", "hint": "Starts with S" },
      "17": { "word": "town house", "ipa": "/'taʊn haʊs/", "vn": "nhà phố", "hint": "Starts with T" },
      "18": { "word": "wardrobe", "ipa": "/'wɔ:drəʊb/", "vn": "tủ đựng quần áo", "hint": "Starts with W" }
    },
    positions: {
      "1": { "x": 84, "y": 29 }, "2": { "x": 16, "y": 58 }, "3": { "x": 90, "y": 45 },
      "4": { "x": 7, "y": 40 }, "5": { "x": 5, "y": 57 }, "6": { "x": 71, "y": 24 },
      "7": { "x": 33, "y": 59 }, "8": { "x": 84, "y": 83 }, "9": { "x": 60, "y": 4 },
      "10": { "x": 42, "y": 93 }, "11": { "x": 58, "y": 54 }, "12": { "x": 26, "y": 42 },
      "13": { "x": 9, "y": 79 }, "14": { "x": 98, "y": 48 }, "15": { "x": 92, "y": 68 },
      "16": { "x": 44, "y": 10 }, "17": { "x": 11, "y": 11 }, "18": { "x": 17, "y": 34 }
    }
  },
  3: {
    imageUrl: "https://res.cloudinary.com/dbgrj3gf0/image/upload/v1770173308/unit_3_yszsgd.jpg",
    vocab: {
      "1": { "word": "active", "ipa": "/'æktɪv/", "vn": "hăng hái", "hint": "Starts with A" },
      "2": { "word": "appearance", "ipa": "/ə'pɪərəns/", "vn": "bề ngoài", "hint": "Starts with A" },
      "3": { "word": "careful", "ipa": "/'keəfl/", "vn": "cẩn thận", "hint": "Starts with C" },
      "4": { "word": "caring", "ipa": "/'keərɪŋ/", "vn": "chu đáo", "hint": "Starts with C" },
      "5": { "word": "cheek", "ipa": "/tʃi:k/", "vn": "má", "hint": "Starts with C" },
      "6": { "word": "clever", "ipa": "/'klevə/", "vn": "thông minh", "hint": "Starts with C" },
      "7": { "word": "confident", "ipa": "/'kɒnfɪdənt/", "vn": "tự tin", "hint": "Starts with C" },
      "8": { "word": "creative", "ipa": "/kri'eɪtɪv/", "vn": "sáng tạo", "hint": "Starts with C" },
      "9": { "word": "friendly", "ipa": "/'frendli/", "vn": "thân thiện", "hint": "Starts with F" },
      "10": { "word": "funny", "ipa": "/'fʌni/", "vn": "khôi hài", "hint": "Starts with F" },
      "11": { "word": "hard working", "ipa": "/hɑ:d 'wɜ:kɪŋ/", "vn": "chăm chỉ", "hint": "Starts with H" },
      "12": { "word": "kind", "ipa": "/kaɪnd/", "vn": "tốt bụng", "hint": "Starts with K" },
      "13": { "word": "loving", "ipa": "/'lʌvɪŋ/", "vn": "giàu tình yêu", "hint": "Starts with L" },
      "14": { "word": "personality", "ipa": "/p3:sə'næləti/", "vn": "tính cách", "hint": "Starts with P" },
      "15": { "word": "shoulder", "ipa": "/'ʃəʊldə/", "vn": "vai", "hint": "Starts with S" },
      "16": { "word": "shy", "ipa": "/ʃaɪ/", "vn": "xấu hổ", "hint": "Starts with S" },
      "17": { "word": "slim", "ipa": "/slɪm/", "vn": "mảnh khảnh", "hint": "Starts with S" }
    },
    positions: {
      "1": { "x": 45.2, "y": 43.1 }, "2": { "x": 68.3, "y": 61.2 }, "3": { "x": 9.4, "y": 58.5 },
      "4": { "x": 91.1, "y": 52.3 }, "5": { "x": 66.5, "y": 43.5 }, "6": { "x": 28.1, "y": 20.8 },
      "7": { "x": 53.5, "y": 34.2 }, "8": { "x": 5.3, "y": 35.6 }, "9": { "x": 37.5, "y": 65.8 },
      "10": { "x": 94.2, "y": 64.1 }, "11": { "x": 81.2, "y": 59.2 }, "12": { "x": 69.8, "y": 78.5 },
      "13": { "x": 57.1, "y": 52.8 }, "14": { "x": 55.4, "y": 85.5 }, "15": { "x": 17.6, "y": 46.2 },
      "16": { "x": 35.4, "y": 50.8 }, "17": { "x": 50.2, "y": 48.9 }
    }
  },
  4: {
    imageUrl: "https://res.cloudinary.com/dbgrj3gf0/image/upload/v1770173308/unit_4_efni1j.jpg",
    vocab: {
      "1": { "word": "art gallery", "ipa": "/ɑ:t 'gæləri/", "vn": "phòng trưng bày", "hint": "Starts with A" },
      "2": { "word": "busy", "ipa": "/'bɪzi/", "vn": "náo nhiệt", "hint": "Starts with B" },
      "3": { "word": "cathedral", "ipa": "/kə'θi:drəl/", "vn": "nhà thờ lớn", "hint": "Starts with C" },
      "4": { "word": "cross", "ipa": "/krɒs/", "vn": "đi ngang qua", "hint": "Starts with C" },
      "5": { "word": "dislike", "ipa": "/dɪs'laɪk/", "vn": "không thích", "hint": "Starts with D" },
      "6": { "word": "famous", "ipa": "/'feɪməs/", "vn": "nổi tiếng", "hint": "Starts with F" },
      "7": { "word": "faraway", "ipa": "/'fɑ:rəweɪ/", "vn": "xa xôi", "hint": "Starts with F" },
      "8": { "word": "finally", "ipa": "/'faɪnəli/", "vn": "cuối cùng", "hint": "Starts with F" },
      "9": { "word": "narrow", "ipa": "/'nærəʊ/", "vn": "hẹp", "hint": "Starts with N" },
      "10": { "word": "outdoor", "ipa": "/'aʊtdɔ:/", "vn": "ngoài trời", "hint": "Starts with O" },
      "11": { "word": "railway station", "ipa": "/'reɪlweɪ 'steɪʃn/", "vn": "ga tàu hoả", "hint": "Starts with R" },
      "12": { "word": "sandy", "ipa": "/'sændi/", "vn": "có cát", "hint": "Starts with S" },
      "13": { "word": "square", "ipa": "/skweə/", "vn": "quảng trường", "hint": "Starts with S" },
      "14": { "word": "suburb", "ipa": "/'sʌbɜ:b/", "vn": "ngoại ô", "hint": "Starts with S" },
      "15": { "word": "turning", "ipa": "/'t3:nɪŋ/", "vn": "chỗ ngoặt", "hint": "Starts with T" },
      "16": { "word": "workshop", "ipa": "/'wɜ:kʃɒp/", "vn": "phân xưởng", "hint": "Starts with W" }
    },
    positions: {
      "1": { "x": 6, "y": 13 }, "2": { "x": 26, "y": 48 }, "3": { "x": 32, "y": 22 },
      "4": { "x": 43, "y": 14 }, "5": { "x": 97, "y": 67 }, "6": { "x": 48, "y": 44 },
      "7": { "x": 78, "y": 44 }, "8": { "x": 44, "y": 93 }, "9": { "x": 18, "y": 79 },
      "10": { "x": 18, "y": 5 }, "11": { "x": 70, "y": 31 }, "12": { "x": 22, "y": 37 },
      "13": { "x": 55, "y": 20 }, "14": { "x": 74, "y": 15 }, "15": { "x": 82, "y": 73 },
      "16": { "x": 89, "y": 26 }
    }
  },
  5: {
    imageUrl: "https://res.cloudinary.com/dbgrj3gf0/image/upload/v1770173309/unit_5_sb6n0x.jpg",
    vocab: {
      "1": { "word": "amazing", "ipa": "/ə'meɪzɪŋ/", "vn": "tuyệt vời", "hint": "Starts with A" },
      "2": { "word": "backpack", "ipa": "/'bækpæk/", "vn": "ba-lô", "hint": "Starts with B" },
      "3": { "word": "boat", "ipa": "/bəʊt/", "vn": "con thuyền", "hint": "Starts with B" },
      "4": { "word": "compass", "ipa": "/'kʌmpəs/", "vn": "la bàn", "hint": "Starts with C" },
      "5": { "word": "desert", "ipa": "/'dezət/", "vn": "sa mạc", "hint": "Starts with D" },
      "6": { "word": "island", "ipa": "/'aɪlənd/", "vn": "đảo", "hint": "Starts with I" },
      "7": { "word": "join in", "ipa": "/dʒɔɪn ɪn/", "vn": "tham gia", "hint": "Starts with J" },
      "8": { "word": "landscape", "ipa": "/'lændskeɪp/", "vn": "phong cảnh", "hint": "Starts with L" },
      "9": { "word": "litter", "ipa": "/'lɪtə/", "vn": "vứt rác", "hint": "Starts with L" },
      "10": { "word": "man made", "ipa": "/mæn 'meɪd/", "vn": "nhân tạo", "hint": "Starts with M" },
      "11": { "word": "mount", "ipa": "/maʊnt/", "vn": "núi", "hint": "Starts with M" },
      "12": { "word": "mountain range", "ipa": "/'maʊntən reɪndʒ/", "vn": "dãy núi", "hint": "Starts with M" },
      "13": { "word": "natural wonder", "ipa": "/'nætʃrəl 'wʌndə/", "vn": "kì quan thiên nhiên", "hint": "Starts with N" },
      "14": { "word": "plaster", "ipa": "/'plɑ:stə/", "vn": "băng, gạc y tế", "hint": "Starts with P" },
      "15": { "word": "rock", "ipa": "/rɒk/", "vn": "phiến đá", "hint": "Starts with R" },
      "16": { "word": "show", "ipa": "/ʃəʊ/", "vn": "trình diễn", "hint": "Starts with S" },
      "17": { "word": "suncream", "ipa": "/'sʌnkri:m/", "vn": "kem chống nắng", "hint": "Starts with S" },
      "18": { "word": "waterfall", "ipa": "/'wɔ:təfɔ:l/", "vn": "thác nước", "hint": "Starts with W" }
    },
    positions: {
      "1": { "x": 51.2, "y": 58.5 }, "2": { "x": 96.5, "y": 56.5 }, "3": { "x": 5.5, "y": 31.5 },
      "4": { "x": 79.5, "y": 49.0 }, "5": { "x": 61.0, "y": 89.0 }, "6": { "x": 51.5, "y": 41.5 },
      "7": { "x": 45.5, "y": 53.0 }, "8": { "x": 5.0, "y": 74.0 }, "9": { "x": 43.5, "y": 86.5 },
      "10": { "x": 80.0, "y": 10.0 }, "11": { "x": 42.0, "y": 18.5 }, "12": { "x": 62.0, "y": 23.5 },
      "13": { "x": 35.0, "y": 79.0 }, "14": { "x": 5.0, "y": 68.0 }, "15": { "x": 48.0, "y": 32.5 },
      "16": { "x": 38.0, "y": 57.0 }, "17": { "x": 75.0, "y": 60.5 }, "18": { "x": 33.0, "y": 26.0 }
    }
  },
  6: {
    imageUrl: "https://res.cloudinary.com/dbgrj3gf0/image/upload/v1770173308/unit_6_vqjmqr.jpg",
    vocab: {
      "1": { "word": "behave", "ipa": "/bɪ'heɪv/", "vn": "đối xử", "hint": "Starts with B" },
      "2": { "word": "celebrate", "ipa": "/'selɪbreɪt/", "vn": "kỉ niệm", "hint": "Starts with C" },
      "3": { "word": "cheer", "ipa": "/tʃɪə/", "vn": "chúc mừng", "hint": "Starts with C" },
      "4": { "word": "decorate", "ipa": "/'dekəreɪt/", "vn": "trang hoàng", "hint": "Starts with D" },
      "5": { "word": "family gathering", "ipa": "/'fæməli 'gæðərɪŋ/", "vn": "sum họp", "hint": "Starts with F" },
      "6": { "word": "firework", "ipa": "/'faɪəwɜ:k/", "vn": "pháo hoa", "hint": "Starts with F" },
      "7": { "word": "fun", "ipa": "/fʌn/", "vn": "vui vẻ", "hint": "Starts with F" },
      "8": { "word": "luck", "ipa": "/lʌk/", "vn": "điều may mắn", "hint": "Starts with L" },
      "9": { "word": "lucky money", "ipa": "/'lʌki 'mʌni/", "vn": "tiền lì xì", "hint": "Starts with L" },
      "10": { "word": "mochi rice cake", "ipa": "/'məʊtʃi raɪs keɪk/", "vn": "bánh gạo", "hint": "Starts with M" },
      "11": { "word": "relative", "ipa": "/'relətɪv/", "vn": "bà con", "hint": "Starts with R" },
      "12": { "word": "strike", "ipa": "/straɪk/", "vn": "đánh chuông", "hint": "Starts with S" },
      "13": { "word": "temple", "ipa": "/'templ/", "vn": "ngôi đền", "hint": "Starts with T" },
      "14": { "word": "throw", "ipa": "/θrəʊ/", "vn": "ném", "hint": "Starts with T" },
      "15": { "word": "welcome", "ipa": "/'welkəm/", "vn": "chào đón", "hint": "Starts with W" },
      "16": { "word": "wish", "ipa": "/wɪʃ/", "vn": "điều ước", "hint": "Starts with W" }
    },
    positions: {
      "1": { "x": 33.5, "y": 68.5 }, "2": { "x": 70.0, "y": 38.5 }, "3": { "x": 27.5, "y": 56.5 },
      "4": { "x": 46.5, "y": 29.5 }, "5": { "x": 21.5, "y": 34.5 }, "6": { "x": 16.0, "y": 6.0 },
      "7": { "x": 11.0, "y": 51.0 }, "8": { "x": 81.5, "y": 73.0 }, "9": { "x": 41.2, "y": 77.5 },
      "10": { "x": 45.5, "y": 68.0 }, "11": { "x": 53.0, "y": 71.5 }, "12": { "x": 38.0, "y": 46.0 },
      "13": { "x": 53.5, "y": 40.0 }, "14": { "x": 74.0, "y": 57.0 }, "15": { "x": 42.0, "y": 10.5 },
      "16": { "x": 21.8, "y": 71.5 }
    }
  },
  7: {
    imageUrl: "https://res.cloudinary.com/dbgrj3gf0/image/upload/v1770173308/unit_7_rdnjrx.jpg",
    vocab: {
      "1": { "word": "animated", "ipa": "/'ænɪmeɪtɪd/", "vn": "hoạt hình", "hint": "Starts with A" },
      "2": { "word": "cartoon", "ipa": "/kɑ:'tu:n/", "vn": "phim hoạt hình", "hint": "Starts with C" },
      "3": { "word": "channel", "ipa": "/'tʃænl/", "vn": "kênh truyền hình", "hint": "Starts with C" },
      "4": { "word": "character", "ipa": "/'kærəktə/", "vn": "nhân vật", "hint": "Starts with C" },
      "5": { "word": "clever", "ipa": "/'klevə/", "vn": "thông minh", "hint": "Starts with C" },
      "6": { "word": "clip", "ipa": "/klɪp/", "vn": "đoạn phim ngắn", "hint": "Starts with C" },
      "7": { "word": "comedy", "ipa": "/'kɒmədi/", "vn": "phim hài", "hint": "Starts with C" },
      "8": { "word": "compete", "ipa": "/kəm'pi:t/", "vn": "thi đấu", "hint": "Starts with C" },
      "9": { "word": "cute", "ipa": "/kju:t/", "vn": "xinh xắn", "hint": "Starts with C" },
      "10": { "word": "dolphin", "ipa": "/'dɒlfɪn/", "vn": " cá heo", "hint": "Starts with D" },
      "11": { "word": "educate", "ipa": "/'edʒukeɪt/", "vn": "giáo dục", "hint": "Starts with E" },
      "12": { "word": "educational", "ipa": "/ˌedʒu'keɪʃənl/", "vn": "mang tính giáo dục", "hint": "Starts with E" },
      "13": { "word": "funny", "ipa": "/'fʌni/", "vn": "buồn cười", "hint": "Starts with F" },
      "14": { "word": "TV guide", "ipa": "/gaɪd/", "vn": "chương trình TV", "hint": "Starts with T" },
      "15": { "word": "live", "ipa": "/laɪv/", "vn": "trực tiếp", "hint": "Starts with L" },
      "16": { "word": "programme", "ipa": "/'prəʊɡræm/", "vn": "chương trình", "hint": "Starts with P" },
      "17": { "word": "talent show", "ipa": "/'tælənt ʃəʊ/", "vn": "cuộc thi tài năng", "hint": "Starts with T" },
      "18": { "word": "viewer", "ipa": "/'vju:ə/", "vn": "người xem", "hint": "Starts with V" }
    },
    positions: {
      "1": { "x": 57, "y": 87 }, "2": { "x": 28, "y": 10 }, "3": { "x": 94, "y": 9 },
      "4": { "x": 25, "y": 20 }, "5": { "x": 20, "y": 38 }, "6": { "x": 25, "y": 47 },
      "7": { "x": 89, "y": 29 }, "8": { "x": 49, "y": 38 }, "9": { "x": 70, "y": 24 },
      "10": { "x": 69, "y": 72 }, "11": { "x": 83, "y": 18 }, "12": { "x": 74, "y": 9 },
      "13": { "x": 94, "y": 84 }, "14": { "x": 15, "y": 49 }, "15": { "x": 4, "y": 11 },
      "16": { "x": 50, "y": 2 }, "17": { "x": 53, "y": 14 }, "18": { "x": 11, "y": 11 }
    }
  },
  8: {
    imageUrl: "https://res.cloudinary.com/dbgrj3gf0/image/upload/v1770173310/unit_8_ppipmv.jpg",
    vocab: {
      "1": { "word": "gym", "ipa": "/dʒɪm/", "vn": "trung tâm thể thao", "hint": "Starts with G" },
      "2": { "word": "karate", "ipa": "/kə'rɑ:ti/", "vn": "võ ka-ra-tê", "hint": "Starts with K" },
      "3": { "word": "last", "ipa": "/lɑ:st/", "vn": "kéo dài", "hint": "Starts with L" },
      "4": { "word": "marathon", "ipa": "/'mærəθən/", "vn": "chạy ma-ra-tông", "hint": "Starts with M" },
      "5": { "word": "racket", "ipa": "/'rækɪt/", "vn": "cái vợt", "hint": "Starts with R" },
      "6": { "word": "score", "ipa": "/skɔ:/", "vn": "ghi bàn", "hint": "Starts with S" },
      "7": { "word": "shoot", "ipa": "/ʃu:t/", "vn": "bắn súng", "hint": "Starts with S" },
      "8": { "word": "sporty", "ipa": "/'spɔ:ti/", "vn": "dáng thể thao", "hint": "Starts with S" },
      "9": { "word": "take place", "ipa": "/teɪk pleɪs/", "vn": "diễn ra", "hint": "Starts with T" },
      "10": { "word": "tournament", "ipa": "/'tʊənəmənt/", "vn": "giải đấu", "hint": "Starts with T" },
      "11": { "word": "aerobics", "ipa": "/eə'rəʊbɪks/", "vn": "thể dục nhịp điệu", "hint": "Starts with A" },
      "12": { "word": "career", "ipa": "/kə'rɪə/", "vn": "sự nghiệp", "hint": "Starts with C" },
      "13": { "word": "competition", "ipa": "/ˌkɒmpə'tɪʃn/", "vn": "cuộc đua", "hint": "Starts with C" },
      "14": { "word": "congratulation", "ipa": "/kənˌɡrætʃu'leɪʃn/", "vn": "lời chúc mừng", "hint": "Starts with C" },
      "15": { "word": "equipment", "ipa": "/ɪ'kwɪpmənt/", "vn": "thiết bị", "hint": "Starts with E" },
      "16": { "word": "fantastic", "ipa": "/fæn'tæstɪk/", "vn": "tuyệt vời", "hint": "Starts with F" },
      "17": { "word": "fit", "ipa": "/fɪt/", "vn": "mạnh khoẻ", "hint": "Starts with F" },
      "18": { "word": "goggles", "ipa": "/'ɡɒɡlz/", "vn": "kính bơi", "hint": "Starts with G" }
    },
    positions: {
      "1": { "x": 38, "y": 50 }, "2": { "x": 60, "y": 51 }, "3": { "x": 30, "y": 58 },
      "4": { "x": 64, "y": 74 }, "5": { "x": 20, "y": 37 }, "6": { "x": 50, "y": 10 },
      "7": { "x": 8, "y": 55 }, "8": { "x": 28, "y": 69 }, "9": { "x": 69, "y": 38 },
      "10": { "x": 81, "y": 13 }, "11": { "x": 35, "y": 90 }, "12": { "x": 20, "y": 10 },
      "13": { "x": 13, "y": 20 }, "14": { "x": 94, "y": 90 }, "15": { "x": 95, "y": 43 },
      "16": { "x": 75, "y": 58 }, "17": { "x": 72, "y": 19 }, "18": { "x": 87, "y": 17 }
    }
  },
  9: {
    imageUrl: "https://res.cloudinary.com/dbgrj3gf0/image/upload/v1770173309/unit_9_zmfxwj.jpg",
    vocab: {
      "1": { "word": "river bank", "ipa": "/bæŋk/", "vn": "bờ sông", "hint": "Starts with R" },
      "2": { "word": "crowded", "ipa": "/'kraʊdɪd/", "vn": "đông đúc", "hint": "Starts with C" },
      "3": { "word": "floating market", "ipa": "/'fləʊtɪŋ 'mɑ:kɪt/", "vn": "chợ nổi", "hint": "Starts with F" },
      "4": { "word": "helpful", "ipa": "/'helpfl/", "vn": "giúp đỡ", "hint": "Starts with H" },
      "5": { "word": "helmet", "ipa": "/'helmɪt/", "vn": "mũ bảo hiểm", "hint": "Starts with H" },
      "6": { "word": "landmark", "ipa": "/'lændmɑ:k/", "vn": "địa điểm du lịch", "hint": "Starts with L" },
      "7": { "word": "city map", "ipa": "/mæp/", "vn": "bản đồ thành phố", "hint": "Starts with C" },
      "8": { "word": "palace", "ipa": "/'pæləs/", "vn": "cung điện", "hint": "Starts with P" },
      "9": { "word": "possessive adjective", "ipa": "/pə'zesɪv/", "vn": "tính từ sở hữu", "hint": "Starts with P" },
      "10": { "word": "possessive pronoun", "ipa": "/pə'zesɪv/", "vn": "đại từ sở hữu", "hint": "Starts with P" },
      "11": { "word": "postcard", "ipa": "/'pəʊstkɑ:d/", "vn": "bưu thiếp", "hint": "Starts with P" },
      "12": { "word": "rent", "ipa": "/rent/", "vn": "thuê", "hint": "Starts with R" },
      "13": { "word": "Royal Palace", "ipa": "/'rɔɪəl 'pæləs/", "vn": "cung điện Hoàng gia", "hint": "Starts with R" },
      "14": { "word": "shell", "ipa": "/ʃel/", "vn": "vỏ sò", "hint": "Starts with S" },
      "15": { "word": "stall", "ipa": "/stɔ:l/", "vn": "gian hàng", "hint": "Starts with S" },
      "16": { "word": "street food", "ipa": "/'stri:t fu:d/", "vn": "đồ ăn đường phố", "hint": "Starts with S" }
    },
    positions: {
      "1": { "x": 38, "y": 50 }, "2": { "x": 60, "y": 51 }, "3": { "x": 30, "y": 58 },
      "4": { "x": 64, "y": 74 }, "5": { "x": 20, "y": 37 }, "6": { "x": 50, "y": 10 },
      "7": { "x": 8, "y": 55 }, "8": { "x": 28, "y": 69 }, "9": { "x": 69, "y": 38 },
      "10": { "x": 81, "y": 13 }, "11": { "x": 35, "y": 90 }, "12": { "x": 20, "y": 10 },
      "13": { "x": 13, "y": 20 }, "14": { "x": 94, "y": 90 }, "15": { "x": 95, "y": 43 },
      "16": { "x": 75, "y": 58 }
    }
  },
  10: {
    imageUrl: "https://res.cloudinary.com/dbgrj3gf0/image/upload/v1770173310/unit_10_qdb8wd.jpg",
    vocab: {
      "1": { "word": "appliance", "ipa": "/ə'plaɪəns/", "vn": "thiết bị", "hint": "Starts with A" },
      "2": { "word": "cottage", "ipa": "/'kɒtɪdʒ/", "vn": "nhà tranh", "hint": "Starts with C" },
      "3": { "word": "dishwasher", "ipa": "/'dɪʃwɒʃə/", "vn": "máy rửa bát", "hint": "Starts with D" },
      "4": { "word": "dry", "ipa": "/draɪ/", "vn": "làm khô", "hint": "Starts with D" },
      "5": { "word": "electric cooker", "ipa": "/ɪ'lektrɪk 'kʊkə/", "vn": "bếp điện", "hint": "Starts with E" },
      "6": { "word": "helicopter", "ipa": "/'helɪkɒptə/", "vn": "máy bay trực thăng", "hint": "Starts with H" },
      "7": { "word": "hi-tech", "ipa": "/haɪ 'tek/", "vn": "công nghệ cao", "hint": "Starts with H" },
      "8": { "word": "housework", "ipa": "/'haʊswɜ:k/", "vn": "công việc nhà", "hint": "Starts with H" },
      "9": { "word": "location", "ipa": "/ləʊ'keɪʃn/", "vn": "địa điểm", "hint": "Starts with L" },
      "10": { "word": "look after", "ipa": "/lʊk 'ɑ:ftə/", "vn": "trông nom", "hint": "Starts with L" },
      "11": { "word": "ocean", "ipa": "/'əʊʃn/", "vn": "đại dương", "hint": "Starts with O" },
      "12": { "word": "outside", "ipa": "/ˌaʊt'saɪd/", "vn": "ngoài trời", "hint": "Starts with O" },
      "13": { "word": "solar energy", "ipa": "/'səʊlə 'enədʒi/", "vn": "năng lượng mặt trời", "hint": "Starts with S" },
      "14": { "word": "space", "ipa": "/speɪs/", "vn": "không gian", "hint": "Starts with S" },
      "15": { "word": "super", "ipa": "/'su:pə/", "vn": "siêu đẳng", "hint": "Starts with S" },
      "16": { "word": "type", "ipa": "/taɪp/", "vn": "kiểu", "hint": "Starts with T" },
      "17": { "word": "UFO", "ipa": "/ˌju: ef 'əʊ/", "vn": "vật thể lạ", "hint": "Starts with U" },
      "18": { "word": "washing machine", "ipa": "/'wɒʃɪŋ məʃi:n/", "vn": "máy giặt", "hint": "Starts with W" },
      "19": { "word": "wireless", "ipa": "/'waɪələs/", "vn": "không dây", "hint": "Starts with W" }
    },
    positions: {
      "1": { "x": 72, "y": 19 }, "2": { "x": 87, "y": 17 }, "3": { "x": 39, "y": 68 },
      "4": { "x": 62, "y": 34 }, "5": { "x": 38, "y": 51 }, "6": { "x": 14, "y": 14 },
      "7": { "x": 87, "y": 51 }, "8": { "x": 93, "y": 66 }, "9": { "x": 8, "y": 86 },
      "10": { "x": 62, "y": 43 }, "11": { "x": 3, "y": 35 }, "12": { "x": 5, "y": 6 },
      "13": { "x": 95, "y": 25 }, "14": { "x": 11, "y": 94 }, "15": { "x": 65, "y": 4 },
      "16": { "x": 2, "y": 68 }, "17": { "x": 94, "y": 8 }, "18": { "x": 48, "y": 65 },
      "19": { "x": 70, "y": 29 }
    }
  },
  11: {
    imageUrl: "https://res.cloudinary.com/dbgrj3gf0/image/upload/v1770173310/unit_11_hz319d.jpg",
    vocab: {
      "1": { "word": "be in need", "ipa": "/bi: ɪn ni:d/", "vn": "cần", "hint": "Starts with B" },
      "2": { "word": "charity", "ipa": "/'tʃærəti/", "vn": "từ thiện", "hint": "Starts with C" },
      "3": { "word": "container", "ipa": "/kən'teɪnə/", "vn": "đồ đựng", "hint": "Starts with C" },
      "4": { "word": "do a survey", "ipa": "/du: ə 'sɜ:veɪ/", "vn": "khảo sát", "hint": "Starts with D" },
      "5": { "word": "environment", "ipa": "/ɪn'vaɪrənmənt/", "vn": "môi trường", "hint": "Starts with E" },
      "6": { "word": "exchange", "ipa": "/ɪks'tʃeɪndʒ/", "vn": "trao đổi", "hint": "Starts with E" },
      "7": { "word": "fair", "ipa": "/feə/", "vn": "hội chợ", "hint": "Starts with F" },
      "8": { "word": "go green", "ipa": "/ɡəʊ ɡri:n/", "vn": "sống xanh", "hint": "Starts with G" },
      "9": { "word": "instead of", "ipa": "/ɪn'sted əv/", "vn": "thay cho", "hint": "Starts with I" },
      "10": { "word": "pick up", "ipa": "/pɪk ʌp/", "vn": "nhặt (rác)", "hint": "Starts with P" },
      "11": { "word": "president", "ipa": "/'prezɪdənt/", "vn": "chủ tịch", "hint": "Starts with P" },
      "12": { "word": "recycle", "ipa": "/ˌri:'saɪkl/", "vn": "tái chế", "hint": "Starts with R" },
      "13": { "word": "recycling bin", "ipa": "/ˌri:'saɪklɪŋ bɪn/", "vn": "thùng tái chế", "hint": "Starts with R" },
      "14": { "word": "reduce", "ipa": "/rɪ'dju:s/", "vn": "giảm thiểu", "hint": "Starts with R" },
      "15": { "word": "reuse", "ipa": "/ˌri:'ju:z/", "vn": "tái sử dụng", "hint": "Starts with R" },
      "16": { "word": "reusable", "ipa": "/ˌri:'ju:zəbl/", "vn": "dùng lại được", "hint": "Starts with R" },
      "17": { "word": "rubbish", "ipa": "/'rʌbɪʃ/", "vn": "rác", "hint": "Starts with R" },
      "18": { "word": "tip", "ipa": "/tɪp/", "vn": "mẹo", "hint": "Starts with T" },
      "19": { "word": "wrap", "ipa": "/ræp/", "vn": "gói", "hint": "Starts with W" }
    },
    positions: {
      "1": { "x": 29, "y": 36 }, "2": { "x": 39, "y": 38 }, "3": { "x": 65, "y": 67 },
      "4": { "x": 70, "y": 8 }, "5": { "x": 9, "y": 14 }, "6": { "x": 70, "y": 84 },
      "7": { "x": 35, "y": 12 }, "8": { "x": 46, "y": 20 }, "9": { "x": 82, "y": 8 },
      "10": { "x": 20, "y": 69 }, "11": { "x": 61, "y": 33 }, "12": { "x": 27, "y": 59 },
      "13": { "x": 41, "y": 56 }, "14": { "x": 70, "y": 21 }, "15": { "x": 85, "y": 72 },
      "16": { "x": 32, "y": 46 }, "17": { "x": 33, "y": 90 }, "18": { "x": 93, "y": 28 },
      "19": { "x": 71, "y": 50 }
    }
  },
  12: {
    imageUrl: "https://res.cloudinary.com/dbgrj3gf0/image/upload/v1770173310/unit_12_t9r5hk.jpg",
    vocab: {
      "1": { "word": "age", "ipa": "/eɪdʒ/", "vn": "độ tuổi", "hint": "Starts with A" },
      "2": { "word": "broken", "ipa": "/'brəʊkən/", "vn": "bị hỏng", "hint": "Starts with B" },
      "3": { "word": "choice", "ipa": "/tʃɔɪs/", "vn": "sự lựa chọn", "hint": "Starts with C" },
      "4": { "word": "do the dishes", "ipa": "/du: ðə 'dɪʃɪz/", "vn": "rửa bát", "hint": "Starts with D" },
      "5": { "word": "do the washing", "ipa": "/du: ðə 'wɒʃɪŋ/", "vn": "giặt quần áo", "hint": "Starts with D" },
      "6": { "word": "feelings", "ipa": "/'fi:lɪŋz/", "vn": "cảm xúc", "hint": "Starts with F" },
      "7": { "word": "guard", "ipa": "/ɡɑ:d/", "vn": "bảo vệ", "hint": "Starts with G" },
      "8": { "word": "height", "ipa": "/haɪt/", "vn": "chiều cao", "hint": "Starts with H" },
      "9": { "word": "iron", "ipa": "/'aɪən/", "vn": "là quần áo", "hint": "Starts with I" },
      "10": { "word": "pick", "ipa": "/pɪk/", "vn": "hái", "hint": "Starts with P" },
      "11": { "word": "planet", "ipa": "/'plænɪt/", "vn": "hành tinh", "hint": "Starts with P" },
      "12": { "word": "price", "ipa": "/praɪs/", "vn": "giá tiền", "hint": "Starts with P" },
      "13": { "word": "put away", "ipa": "/pʊt ə'weɪ/", "vn": "cất dọn", "hint": "Starts with P" },
      "14": { "word": "repair", "ipa": "/rɪ'peə/", "vn": "sửa chữa", "hint": "Starts with R" },
      "15": { "word": "robot", "ipa": "/'rəʊbɒt/", "vn": "người máy", "hint": "Starts with R" },
      "16": { "word": "space station", "ipa": "/speɪs 'steɪʃn/", "vn": "trạm vũ trụ", "hint": "Starts with S" },
      "17": { "word": "useful", "ipa": "/'ju:sfl/", "vn": "hữu ích", "hint": "Starts with U" },
      "18": { "word": "water", "ipa": "/'wɔ:tə/", "vn": "tưới nước", "hint": "Starts with W" },
      "19": { "word": "weight", "ipa": "/weɪt/", "vn": "trọng lượng", "hint": "Starts with W" }
    },
    positions: {
      "1": { "x": 68, "y": 33 }, "2": { "x": 59, "y": 72 }, "3": { "x": 29, "y": 18 },
      "4": { "x": 15, "y": 78 }, "5": { "x": 8, "y": 66 }, "6": { "x": 7, "y": 5 },
      "7": { "x": 36, "y": 36 }, "8": { "x": 68, "y": 53 }, "9": { "x": 8, "y": 44 },
      "10": { "x": 91, "y": 42 }, "11": { "x": 64, "y": 8 }, "12": { "x": 68, "y": 46 },
      "13": { "x": 77, "y": 82 }, "14": { "x": 58, "y": 64 }, "15": { "x": 65, "y": 80 },
      "16": { "x": 47, "y": 16 }, "17": { "x": 35, "y": 86 }, "18": { "x": 84, "y": 49 },
      "19": { "x": 68, "y": 40 }
    }
  }
};