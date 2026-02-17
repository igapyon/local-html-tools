(function () {
  window.KT_DATA = window.KT_DATA || {};
  const historicalEvents = [
        { name: "ルネサンス（盛期）", start: 1500, end: 1600, category: "culture" },
        { name: "宗教改革", start: 1517, end: 1648, category: "religion" },
        { name: "産業革命", start: 1760, end: 1840, category: "culture" },
        { name: "フランス革命", start: 1789, end: 1799, category: "revolution" },
        { name: "ナポレオン戦争", start: 1803, end: 1815, category: "war" },
        { name: "浅間山の天明大噴火", start: 1783, end: 1783, category: "disaster" },
        { name: "第一次アヘン戦争", start: 1839, end: 1842, category: "war" },
        { name: "第二次アヘン戦争", start: 1856, end: 1860, category: "war" },
        { name: "クリミア戦争", start: 1853, end: 1856, category: "war" },
        { name: "明治維新", start: 1868, end: 1869, category: "revolution" },
        { name: "第一次世界大戦", start: 1914, end: 1918, category: "war" },
        { name: "第二次世界大戦", start: 1939, end: 1945, category: "war" }
  ];
  
  const danceEvents = [
        { name: "パヴァーヌ流行", start: 1500, end: 1630, category: "court" },
        { name: "ガリアルド流行", start: 1550, end: 1650, category: "court" },
        { name: "メヌエット流行", start: 1660, end: 1790, category: "court" },
        { name: "ワルツ流行", start: 1780, end: 1910, category: "ballroom" },
        { name: "ポロネーズ流行", start: 1700, end: 1900, category: "national" },
        { name: "マズルカ流行", start: 1750, end: 1900, category: "national" }
  ];
  
  const instrumentEvents = [
        { name: "アマティ家工房（クレモナ）", start: 1538, end: 1740, category: "violin" },
        { name: "ストラディバリ工房", start: 1666, end: 1737, category: "violin" },
        { name: "ガルネリ（デル・ジェス）", start: 1698, end: 1744, category: "violin" },
        { name: "ガダニーニ工房", start: 1746, end: 1786, category: "violin" },
        { name: "ロッカ工房（トリノ）", start: 1830, end: 1865, category: "violin" },
        { name: "J.B. ヴィヨーム工房", start: 1828, end: 1875, category: "violin" },
        { name: "トゥルト弓（モダン弓の確立）", start: 1775, end: 1835, category: "bow" },
        { name: "ヴォワラン弓", start: 1855, end: 1885, category: "bow" },
        { name: "ヴィヨーム工房の弓製作", start: 1830, end: 1875, category: "bow" },
        { name: "E.A. サルトリー弓", start: 1885, end: 1946, category: "bow" },
        { name: "ヴィオラ・ダ・ガンバ隆盛", start: 1500, end: 1750, category: "strings" },
        { name: "ヴィオラ・ダ・ガンバ復興", start: 1900, end: 1980, category: "strings" },
        { name: "フォルテピアノ普及", start: 1700, end: 1820, category: "piano" },
        { name: "近代ピアノの確立", start: 1820, end: 1900, category: "piano" },
        { name: "6弦クラシックギター定着", start: 1770, end: 1860, category: "guitar" },
        { name: "エレキギター実用化", start: 1931, end: 1960, category: "guitar" },
        { name: "スタインウェイ量産時代", start: 1853, end: 1980, category: "piano" },
        { name: "金管のバルブ実用化", start: 1814, end: 1850, category: "brass" },
        { name: "ホルンのバルブ化", start: 1818, end: 1860, category: "brass" },
        { name: "トランペットのバルブ化", start: 1815, end: 1860, category: "brass" },
        { name: "クラリネットの登場", start: 1690, end: 1730, category: "woodwind" },
        { name: "ベーム式フルート普及", start: 1847, end: 1900, category: "woodwind" },
        { name: "クラリネットの多鍵化", start: 1812, end: 1900, category: "woodwind" },
        { name: "サクソフォン発明", start: 1840, end: 1846, category: "woodwind" }
  ];
  window.KT_DATA.historicalEvents = historicalEvents;
  window.KT_DATA.danceEvents = danceEvents;
  window.KT_DATA.instrumentEvents = instrumentEvents;
})();
