const url = "https://hwanghsin-api.cyclic.app";
const SUCCESS = "SUCCESS";
const FAILED = "FAILED";
const INTERNAL = "INTERNAL";
const BIBLE_VERSES = [
  // 舊約
  // 摩西五經
  { name: "創世記", code: "創", covenant: "old" },
  { name: "出埃及記", code: "出", covenant: "old" },
  { name: "利未記", code: "利", covenant: "old" },
  { name: "民數記", code: "民", covenant: "old" },
  { name: "申命記", code: "申", covenant: "old" },
  // 歷史書
  { name: "約書亞記", code: "書", covenant: "old" },
  { name: "士師記", code: "士", covenant: "old" },
  { name: "路得記", code: "得", covenant: "old" },
  { name: "撒母耳記上", code: "撒上", covenant: "old" },
  { name: "撒母耳記下", code: "撒下", covenant: "old" },
  { name: "列王記上", code: "王上", covenant: "old" },
  { name: "列王記下", code: "王下", covenant: "old" },
  { name: "歷代志上", code: "代上", covenant: "old" },
  { name: "歷代志下", code: "代下", covenant: "old" },
  { name: "以斯拉記", code: "拉", covenant: "old" },
  { name: "尼希米記", code: "尼", covenant: "old" },
  { name: "以斯帖記", code: "斯", covenant: "old" },
  { name: "約伯記", code: "伯", covenant: "old" },
  // 讚美
  { name: "詩篇", code: "詩", covenant: "old" },
  { name: "箴言", code: "箴", covenant: "old" },
  { name: "傳道書", code: "傳", covenant: "old" },
  { name: "雅歌", code: "歌", covenant: "old" },
  // 先知書
  { name: "以賽亞書", code: "賽", covenant: "old" },
  { name: "耶利米書", code: "耶", covenant: "old" },
  { name: "耶利米哀歌", code: "哀", covenant: "old" },
  { name: "以西結書", code: "結", covenant: "old" },
  { name: "但以理書", code: "但", covenant: "old" },
  { name: "何西阿書", code: "何", covenant: "old" },
  { name: "約珥書", code: "珥", covenant: "old" },
  { name: "阿摩司書", code: "摩", covenant: "old" },
  { name: "俄巴底亞書", code: "俄", covenant: "old" },
  { name: "約拿書", code: "拿", covenant: "old" },
  { name: "彌迦書", code: "彌", covenant: "old" },
  { name: "那鴻書", code: "鴻", covenant: "old" },
  { name: "哈巴谷書", code: "哈", covenant: "old" },
  { name: "西番雅書", code: "番", covenant: "old" },
  { name: "哈該書", code: "該", covenant: "old" },
  { name: "撒迦利亞書", code: "亞", covenant: "old" },
  { name: "瑪拉基書", code: "瑪", covenant: "old" },
  // 新約
  // 四福音
  { name: "馬太福音", code: "太", covenant: "new" },
  { name: "馬可福音", code: "可", covenant: "new" },
  { name: "路加福音", code: "路", covenant: "new" },
  { name: "約翰福音", code: "約", covenant: "new" },
  // 使徒行傳
  { name: "使徒行傳", code: "徒", covenant: "new" },
  // 保羅書信
  { name: "羅馬書", code: "創", covenant: "new" },
  { name: "哥林多前書", code: "林前", covenant: "new" },
  { name: "哥林多後書", code: "林後", covenant: "new" },
  { name: "加拉太書", code: "加", covenant: "new" },
  { name: "以弗所書", code: "弗", covenant: "new" },
  { name: "腓立比書", code: "腓", covenant: "new" },
  { name: "歌羅西書", code: "西", covenant: "new" },
  { name: "帖撒羅尼迦前書", code: "帖前", covenant: "new" },
  { name: "帖撒羅尼迦後書", code: "帖後", covenant: "new" },
  { name: "提摩太前書", code: "提前", covenant: "new" },
  { name: "提摩太後書", code: "提後", covenant: "new" },
  { name: "提多書", code: "多", covenant: "new" },
  { name: "腓利門書", code: "門", covenant: "new" },
  // 使徒書信
  { name: "希伯來書", code: "來", covenant: "new" },
  { name: "雅各書", code: "雅", covenant: "new" },
  { name: "彼得前書", code: "彼前", covenant: "new" },
  { name: "彼得後書", code: "彼後", covenant: "new" },
  { name: "約翰一書", code: "約壹", covenant: "new" },
  { name: "約翰二書", code: "約貳", covenant: "new" },
  { name: "約翰三書", code: "約叁", covenant: "new" },
  { name: "猶大書", code: "猶", covenant: "new" },
  // 啟示
  { name: "啟示錄", code: "啟", covenant: "new" },
];
