import {gearBonus,EFFECTS} from './relic-pool.js';
import {estateBonus} from './estate.js';
export const RARITIES = {
  R: { name: '灵品', color: '#7b9c88', rate: .60, factor: 1 },
  SR: { name: '仙品', color: '#9b85b8', rate: .30, factor: 1.10 },
  SSR: { name: '神品', color: '#d2ac62', rate: .08, factor: 1.22 },
  UR: {name:'道品', color:'#d17353', rate:.02, factor:1.34}
};
export const ROLES = { guard: '御守', blade: '剑修', mage: '术法', healer: '医仙', assassin: '影袭' };
export const FACTIONS = { cloud: '云阙', moon: '月华', wild: '山海' };
export const HEROES = [
  {
    "id": "qing",
    "name": "吕洞宾",
    "title": "纯阳剑仙",
    "rarity": "R",
    "role": "blade",
    "faction": "cloud",
    "source": "八仙传说",
    "lore": "八仙之一，以剑术与度化故事流传。",
    "mark": "吕",
    "skill": "破阵剑诀",
    "art": 0
  },
  {
    "id": "shi",
    "name": "巨灵神",
    "title": "天庭先锋",
    "rarity": "R",
    "role": "guard",
    "faction": "wild",
    "source": "《西游记》第四回",
    "lore": "奉命讨伐花果山的天将，力大善使宣花斧。",
    "mark": "巨",
    "skill": "镇岳护阵",
    "art": 1
  },
  {
    "id": "ling",
    "name": "何仙姑",
    "title": "荷香济世",
    "rarity": "R",
    "role": "healer",
    "faction": "moon",
    "source": "八仙传说",
    "lore": "八仙之一，民间常以荷花为其法器。",
    "mark": "何",
    "skill": "灵泽回春",
    "art": 2
  },
  {
    "id": "yan",
    "name": "罗宣",
    "title": "南方火德",
    "rarity": "R",
    "role": "mage",
    "faction": "cloud",
    "source": "《封神演义》",
    "lore": "火龙岛焰中仙，封神后列火部正神。",
    "mark": "罗",
    "skill": "万象法印",
    "art": 3
  },
  {
    "id": "ye",
    "name": "夜游神",
    "title": "巡夜阴帅",
    "rarity": "R",
    "role": "assassin",
    "faction": "moon",
    "source": "民间日夜游神信仰",
    "lore": "巡察夜间善恶的神灵，与日游神并称。",
    "mark": "夜",
    "skill": "追影破邪",
    "art": 4
  },
  {
    "id": "zhu",
    "name": "韩湘子",
    "title": "洞箫引仙",
    "rarity": "R",
    "role": "blade",
    "faction": "wild",
    "source": "八仙传说",
    "lore": "八仙之一，常持洞箫，传说善于度化。",
    "mark": "韩",
    "skill": "破阵剑诀",
    "art": 5
  },
  {
    "id": "xue",
    "name": "龙吉公主",
    "title": "瑶池仙姬",
    "rarity": "SR",
    "role": "blade",
    "faction": "moon",
    "source": "《封神演义》",
    "lore": "瑶池仙女，下凡助周，持四海瓶等法宝。",
    "mark": "龙",
    "skill": "破阵剑诀",
    "art": 6
  },
  {
    "id": "yuan",
    "name": "李靖",
    "title": "托塔天王",
    "rarity": "SR",
    "role": "guard",
    "faction": "cloud",
    "source": "《西游记》《封神演义》",
    "lore": "哪吒之父，天庭统兵之将，形象以宝塔为记。",
    "mark": "李",
    "skill": "镇岳护阵",
    "art": 7
  },
  {
    "id": "tao",
    "name": "麻姑",
    "title": "沧海桑田",
    "rarity": "SR",
    "role": "healer",
    "faction": "wild",
    "source": "《神仙传·麻姑》",
    "lore": "与王方平相会的仙人，曾见东海三为桑田。",
    "mark": "麻",
    "skill": "灵泽回春",
    "art": 8
  },
  {
    "id": "xing",
    "name": "太阴星君",
    "title": "月府星主",
    "rarity": "SR",
    "role": "mage",
    "faction": "moon",
    "source": "《西游记》第九十五回",
    "lore": "月宫之主，收回下界玉兔。",
    "mark": "太",
    "skill": "万象法印",
    "art": 9
  },
  {
    "id": "he",
    "name": "韦护",
    "title": "降魔护法",
    "rarity": "SR",
    "role": "assassin",
    "faction": "cloud",
    "source": "《封神演义》",
    "lore": "道行天尊门人，以降魔杵助周伐纣。",
    "mark": "韦",
    "skill": "追影破邪",
    "art": 10
  },
  {
    "id": "lei",
    "name": "雷震子",
    "title": "风雷双翼",
    "rarity": "SR",
    "role": "mage",
    "faction": "wild",
    "source": "《封神演义》",
    "lore": "文王义子、云中子弟子，背生风雷双翅。",
    "mark": "雷",
    "skill": "万象法印",
    "art": 11
  },
  {
    "id": "chen",
    "name": "黄帝",
    "title": "轩辕帝君",
    "rarity": "SSR",
    "role": "blade",
    "faction": "cloud",
    "source": "《史记·五帝本纪》《列仙传》",
    "lore": "上古帝王；后世仙传中亦有乘龙升天的叙事。",
    "mark": "黄",
    "skill": "破阵剑诀",
    "art": 12
  },
  {
    "id": "long",
    "name": "应龙",
    "title": "翼振九州",
    "rarity": "SSR",
    "role": "guard",
    "faction": "wild",
    "source": "《山海经·大荒北经》",
    "lore": "有翼神龙，神话中助黄帝作战。",
    "mark": "应",
    "skill": "镇岳护阵",
    "art": 13
  },
  {
    "id": "yue",
    "name": "嫦娥",
    "title": "广寒仙子",
    "rarity": "SSR",
    "role": "healer",
    "faction": "moon",
    "source": "《淮南子·览冥训》",
    "lore": "奔月神话中的仙子，后世故事常与玉兔相伴。",
    "mark": "嫦",
    "skill": "灵泽回春",
    "art": 14
  },
  {
    "id": "huang",
    "name": "朱雀",
    "title": "南明离火",
    "rarity": "SSR",
    "role": "mage",
    "faction": "wild",
    "source": "《礼记·曲礼上》四象传统",
    "lore": "南方神鸟，是四象之一，不与凤凰视作同一神兽。",
    "mark": "朱",
    "skill": "万象法印",
    "art": 15
  },
  {
    "id": "ming",
    "name": "钟馗",
    "title": "赐福镇邪",
    "rarity": "SSR",
    "role": "assassin",
    "faction": "moon",
    "source": "唐宋以来钟馗传说",
    "lore": "民间驱邪纳福的神祇，常作虬髯持剑形象。",
    "mark": "钟",
    "skill": "追影破邪",
    "art": 16
  },
  {
    "id": "tai",
    "name": "太上老君",
    "title": "兜率道祖",
    "rarity": "SSR",
    "role": "mage",
    "faction": "cloud",
    "source": "《西游记》道教神仙传统",
    "lore": "居兜率宫炼丹的尊神，本作采用文学形象。",
    "mark": "太",
    "skill": "万象法印",
    "art": 17
  },
  {
    "id": "heling",
    "name": "张果老",
    "title": "倒骑青驴",
    "rarity": "R",
    "role": "blade",
    "faction": "cloud",
    "source": "八仙传说",
    "lore": "八仙之一，以倒骑驴和渔鼓形象广为人知。",
    "mark": "张",
    "skill": "破阵剑诀",
    "art": 18
  },
  {
    "id": "guichuan",
    "name": "河伯",
    "title": "黄河水神",
    "rarity": "R",
    "role": "guard",
    "faction": "wild",
    "source": "《楚辞·九歌·河伯》",
    "lore": "黄河神灵，诗中有乘水车、驾两龙的描写。",
    "mark": "河",
    "skill": "镇岳护阵",
    "art": 19
  },
  {
    "id": "xinglin",
    "name": "玉兔",
    "title": "月宫捣药",
    "rarity": "R",
    "role": "healer",
    "faction": "moon",
    "source": "月宫玉兔传说、《西游记》",
    "lore": "月中捣药的玉兔；本作采用捣药灵兽形象。",
    "mark": "玉",
    "skill": "灵泽回春",
    "art": 20
  },
  {
    "id": "deng",
    "name": "赤脚大仙",
    "title": "云游散仙",
    "rarity": "R",
    "role": "mage",
    "faction": "cloud",
    "source": "《西游记》第五回",
    "lore": "赴蟠桃会的天界仙人，赤足形象鲜明。",
    "mark": "赤",
    "skill": "万象法印",
    "art": 21
  },
  {
    "id": "qiaoying",
    "name": "白无常",
    "title": "勾魂引路",
    "rarity": "R",
    "role": "assassin",
    "faction": "moon",
    "source": "民间黑白无常信仰",
    "lore": "与黑无常成对出现的冥司使者。",
    "mark": "白",
    "skill": "追影破邪",
    "art": 22
  },
  {
    "id": "yufeng",
    "name": "铁扇公主",
    "title": "芭蕉息焰",
    "rarity": "R",
    "role": "mage",
    "faction": "wild",
    "source": "《西游记》第五十九至六十一回",
    "lore": "罗刹女，持芭蕉扇，居翠云山芭蕉洞。",
    "mark": "铁",
    "skill": "万象法印",
    "art": 23
  },
  {
    "id": "baihu",
    "name": "白虎",
    "title": "西方监兵",
    "rarity": "SR",
    "role": "blade",
    "faction": "wild",
    "source": "《礼记·曲礼上》四象传统",
    "lore": "主西方的四象神兽，本作保留白虎兽形。",
    "mark": "白",
    "skill": "破阵剑诀",
    "art": 24
  },
  {
    "id": "yunlu",
    "name": "增长天王",
    "title": "南天宝剑",
    "rarity": "SR",
    "role": "guard",
    "faction": "cloud",
    "source": "四大天王传统、《西游记》",
    "lore": "四大天王之一，民间常以宝剑为其持物。",
    "mark": "增",
    "skill": "镇岳护阵",
    "art": 25
  },
  {
    "id": "luyin",
    "name": "寿星",
    "title": "南极老人",
    "rarity": "SR",
    "role": "healer",
    "faction": "wild",
    "source": "南极老人星信仰、《西游记》",
    "lore": "象征长寿的神祇，常持杖与寿桃。",
    "mark": "寿",
    "skill": "灵泽回春",
    "art": 26
  },
  {
    "id": "moqiu",
    "name": "文昌帝君",
    "title": "文运司命",
    "rarity": "SR",
    "role": "mage",
    "faction": "cloud",
    "source": "文昌帝君信仰",
    "lore": "主管文运的神祇，常见于文昌庙祀奉。",
    "mark": "文",
    "skill": "万象法印",
    "art": 27
  },
  {
    "id": "hanzhao",
    "name": "黑无常",
    "title": "冥途巡使",
    "rarity": "SR",
    "role": "assassin",
    "faction": "moon",
    "source": "民间黑白无常信仰",
    "lore": "与白无常协同的冥司使者。",
    "mark": "黑",
    "skill": "追影破邪",
    "art": 28
  },
  {
    "id": "xueyu",
    "name": "孟婆",
    "title": "忘川引渡",
    "rarity": "SR",
    "role": "healer",
    "faction": "moon",
    "source": "民间孟婆汤传说",
    "lore": "冥途传说中掌忘却前尘之汤的老妇。",
    "mark": "孟",
    "skill": "灵泽回春",
    "art": 29
  },
  {
    "id": "nezha",
    "name": "哪吒",
    "title": "三坛海会",
    "rarity": "SSR",
    "role": "blade",
    "faction": "wild",
    "source": "《封神演义》《西游记》",
    "lore": "莲花化身、脚踏风火轮的少年神将。",
    "mark": "哪",
    "skill": "破阵剑诀",
    "art": 30
  },
  {
    "id": "yangjian",
    "name": "杨戬",
    "title": "清源妙道",
    "rarity": "SSR",
    "role": "guard",
    "faction": "cloud",
    "source": "《封神演义》二郎神传统",
    "lore": "善变化、持三尖两刃刀的神将。",
    "mark": "杨",
    "skill": "镇岳护阵",
    "art": 31
  },
  {
    "id": "aoli",
    "name": "龙女",
    "title": "南海侍者",
    "rarity": "SSR",
    "role": "healer",
    "faction": "moon",
    "source": "观音龙女民间传说",
    "lore": "观音身旁的龙女形象；不再使用虚构姓名敖璃。",
    "mark": "龙",
    "skill": "灵泽回春",
    "art": 32
  },
  {
    "id": "yaochi",
    "name": "西王母",
    "title": "瑶池金母",
    "rarity": "SSR",
    "role": "healer",
    "faction": "cloud",
    "source": "《山海经·西山经》《穆天子传》",
    "lore": "古老女神，后世神仙故事中与昆仑、瑶池相联系。",
    "mark": "西",
    "skill": "灵泽回春",
    "art": 33
  },
  {
    "id": "doumu",
    "name": "斗姆元君",
    "title": "北斗众星之母",
    "rarity": "SSR",
    "role": "mage",
    "faction": "moon",
    "source": "道教斗姆信仰",
    "lore": "与北斗星辰信仰相联系的女神。",
    "mark": "斗",
    "skill": "万象法印",
    "art": 34
  },
  {
    "id": "wukong",
    "name": "孙悟空",
    "title": "齐天大圣",
    "rarity": "SSR",
    "role": "assassin",
    "faction": "wild",
    "source": "《西游记》",
    "lore": "石猴修成神通，持如意金箍棒护送唐僧取经。",
    "mark": "孙",
    "skill": "追影破邪",
    "art": 35
  },
  {
    "id": "han_zhongli",
    "name": "汉钟离",
    "title": "芭蕉度世",
    "rarity": "R",
    "role": "guard",
    "faction": "cloud",
    "source": "八仙传说",
    "lore": "八仙之一，常袒腹持芭蕉扇。",
    "mark": "汉",
    "skill": "镇岳护阵",
    "art": 36
  },
  {
    "id": "cao_guojiu",
    "name": "曹国舅",
    "title": "玉板清音",
    "rarity": "R",
    "role": "healer",
    "faction": "cloud",
    "source": "八仙传说",
    "lore": "八仙之一，以玉板或笏板为常见持物。",
    "mark": "曹",
    "skill": "灵泽回春",
    "art": 37
  },
  {
    "id": "li_tieguai",
    "name": "铁拐李",
    "title": "悬壶济世",
    "rarity": "SR",
    "role": "healer",
    "faction": "cloud",
    "source": "八仙传说",
    "lore": "八仙之一，持铁拐与葫芦，常有济世故事。",
    "mark": "铁",
    "skill": "灵泽回春",
    "art": 38
  },
  {
    "id": "lan_caihe",
    "name": "蓝采和",
    "title": "踏歌行仙",
    "rarity": "SR",
    "role": "assassin",
    "faction": "cloud",
    "source": "八仙传说",
    "lore": "八仙之一，常携花篮、踏歌行走。",
    "mark": "蓝",
    "skill": "追影破邪",
    "art": 39
  },
  {
    "id": "chi_guo",
    "name": "持国天王",
    "title": "东方琵琶",
    "rarity": "SR",
    "role": "mage",
    "faction": "cloud",
    "source": "四大天王传统",
    "lore": "四大天王之一，民间常持琵琶。",
    "mark": "持",
    "skill": "万象法印",
    "art": 40
  },
  {
    "id": "duo_wen",
    "name": "多闻天王",
    "title": "北方宝伞",
    "rarity": "SR",
    "role": "guard",
    "faction": "cloud",
    "source": "四大天王传统",
    "lore": "四大天王之一，常见宝伞与宝塔形象。",
    "mark": "多",
    "skill": "镇岳护阵",
    "art": 41
  },
  {
    "id": "jiang_ziya",
    "name": "姜子牙",
    "title": "封神执榜",
    "rarity": "SSR",
    "role": "mage",
    "faction": "cloud",
    "source": "《封神演义》",
    "lore": "受命下山助周、执掌封神榜的道者。",
    "mark": "姜",
    "skill": "万象法印",
    "art": 42
  },
  {
    "id": "guangle",
    "name": "广成子",
    "title": "崆峒金仙",
    "rarity": "SSR",
    "role": "blade",
    "faction": "cloud",
    "source": "《庄子·在宥》《封神演义》",
    "lore": "黄帝问道故事中的仙人，封神小说中持番天印。",
    "mark": "广",
    "skill": "破阵剑诀",
    "art": 43
  },
  {
    "id": "yuding",
    "name": "玉鼎真人",
    "title": "金霞传道",
    "rarity": "SSR",
    "role": "assassin",
    "faction": "cloud",
    "source": "《封神演义》",
    "lore": "玉泉山金霞洞仙人，杨戬之师。",
    "mark": "玉",
    "skill": "追影破邪",
    "art": 44
  },
  {
    "id": "yunzhongzi",
    "name": "云中子",
    "title": "终南炼器",
    "rarity": "SSR",
    "role": "healer",
    "faction": "cloud",
    "source": "《封神演义》",
    "lore": "终南山玉柱洞仙人，雷震子之师。",
    "mark": "云",
    "skill": "灵泽回春",
    "art": 45
  },
  {
    "id": "yuanshi",
    "name": "元始天尊",
    "title": "玉清道尊",
    "rarity": "UR",
    "role": "mage",
    "faction": "cloud",
    "source": "道教三清传统、《封神演义》",
    "lore": "三清尊神之一；本作借用文学与传统神仙形象。",
    "mark": "元",
    "skill": "万象法印",
    "art": 46
  },
  {
    "id": "lingbao",
    "name": "灵宝天尊",
    "title": "上清道尊",
    "rarity": "UR",
    "role": "guard",
    "faction": "cloud",
    "source": "道教三清传统",
    "lore": "三清尊神之一，不与小说通天教主直接等同。",
    "mark": "灵",
    "skill": "镇岳护阵",
    "art": 47
  },
  {
    "id": "wu_gang",
    "name": "吴刚",
    "title": "月桂行者",
    "rarity": "R",
    "role": "blade",
    "faction": "moon",
    "source": "《酉阳杂俎·天咫》",
    "lore": "月中伐桂而树创随合的传说人物。",
    "mark": "吴",
    "skill": "破阵剑诀",
    "art": 48
  },
  {
    "id": "ri_you",
    "name": "日游神",
    "title": "巡昼阴帅",
    "rarity": "R",
    "role": "guard",
    "faction": "moon",
    "source": "民间日夜游神信仰",
    "lore": "与夜游神相对，巡视白昼善恶。",
    "mark": "日",
    "skill": "镇岳护阵",
    "art": 49
  },
  {
    "id": "ma_mian",
    "name": "马面",
    "title": "冥关守将",
    "rarity": "SR",
    "role": "guard",
    "faction": "moon",
    "source": "民间牛头马面传说",
    "lore": "马首冥司守卫，与牛头成对出现。",
    "mark": "马",
    "skill": "镇岳护阵",
    "art": 50
  },
  {
    "id": "niu_tou",
    "name": "牛头",
    "title": "幽都力士",
    "rarity": "SR",
    "role": "blade",
    "faction": "moon",
    "source": "民间牛头马面传说",
    "lore": "牛首冥司守卫，常与马面同列。",
    "mark": "牛",
    "skill": "破阵剑诀",
    "art": 51
  },
  {
    "id": "meng_zhang",
    "name": "月老",
    "title": "红线牵缘",
    "rarity": "SR",
    "role": "healer",
    "faction": "moon",
    "source": "《续玄怪录·定婚店》",
    "lore": "月下老人，以红绳系足的婚姻故事流传。",
    "mark": "月",
    "skill": "灵泽回春",
    "art": 52
  },
  {
    "id": "leigong",
    "name": "雷公",
    "title": "雷鼓诛邪",
    "rarity": "SR",
    "role": "assassin",
    "faction": "moon",
    "source": "中国雷神民间信仰",
    "lore": "雷部神灵，常作持锤凿、背生双翼形象。",
    "mark": "雷",
    "skill": "追影破邪",
    "art": 53
  },
  {
    "id": "dianmu",
    "name": "电母",
    "title": "金镜流光",
    "rarity": "SSR",
    "role": "mage",
    "faction": "moon",
    "source": "民间雷公电母信仰",
    "lore": "掌闪电的女神，常持两镜引出电光。",
    "mark": "电",
    "skill": "万象法印",
    "art": 54
  },
  {
    "id": "ziwei",
    "name": "紫微大帝",
    "title": "中天星主",
    "rarity": "SSR",
    "role": "guard",
    "faction": "moon",
    "source": "道教四御传统",
    "lore": "与紫微、北极星辰信仰相联系的尊神。",
    "mark": "紫",
    "skill": "镇岳护阵",
    "art": 55
  },
  {
    "id": "taiyi",
    "name": "太乙救苦天尊",
    "title": "青玄救苦",
    "rarity": "SSR",
    "role": "healer",
    "faction": "moon",
    "source": "道教救苦天尊信仰",
    "lore": "济度救苦的尊神，常与九头狮子形象相伴。",
    "mark": "太",
    "skill": "灵泽回春",
    "art": 56
  },
  {
    "id": "fengdu",
    "name": "酆都大帝",
    "title": "北阴冥主",
    "rarity": "SSR",
    "role": "assassin",
    "faction": "moon",
    "source": "道教酆都信仰",
    "lore": "与酆都冥司传统相联系的神祇。",
    "mark": "酆",
    "skill": "追影破邪",
    "art": 57
  },
  {
    "id": "houtu",
    "name": "后土",
    "title": "承天效法",
    "rarity": "UR",
    "role": "guard",
    "faction": "moon",
    "source": "《礼记·祭法》及后土信仰",
    "lore": "大地神祇；后世形成后土皇地祇的尊神形象。",
    "mark": "后",
    "skill": "镇岳护阵",
    "art": 58
  },
  {
    "id": "yuhuang",
    "name": "玉皇大帝",
    "title": "昊天金阙",
    "rarity": "UR",
    "role": "mage",
    "faction": "moon",
    "source": "道教玉皇信仰、《西游记》",
    "lore": "天界统御者的著名形象，本作归于星月阵营。",
    "mark": "玉",
    "skill": "万象法印",
    "art": 59
  },
  {
    "id": "tu_di",
    "name": "土地公",
    "title": "一方福德",
    "rarity": "R",
    "role": "guard",
    "faction": "wild",
    "source": "中国土地神民间信仰",
    "lore": "守护一方土地的地方神，常作慈祥老者形象。",
    "mark": "土",
    "skill": "镇岳护阵",
    "art": 60
  },
  {
    "id": "zao_shen",
    "name": "灶神",
    "title": "司命护家",
    "rarity": "R",
    "role": "healer",
    "faction": "wild",
    "source": "《礼记·月令》及灶神信仰",
    "lore": "与家庭灶火、岁末祭灶习俗相联系的神祇。",
    "mark": "灶",
    "skill": "灵泽回春",
    "art": 61
  },
  {
    "id": "ao_guang",
    "name": "敖广",
    "title": "东海龙王",
    "rarity": "SR",
    "role": "guard",
    "faction": "wild",
    "source": "《西游记》《封神演义》",
    "lore": "东海龙宫之主，四海龙王之一。",
    "mark": "敖",
    "skill": "镇岳护阵",
    "art": 62
  },
  {
    "id": "xuanwu",
    "name": "玄武",
    "title": "北方执明",
    "rarity": "SR",
    "role": "blade",
    "faction": "wild",
    "source": "四象传统",
    "lore": "龟蛇合体的北方神兽，本作保留龟蛇形态。",
    "mark": "玄",
    "skill": "破阵剑诀",
    "art": 63
  },
  {
    "id": "fengbo",
    "name": "风伯",
    "title": "箕风御气",
    "rarity": "SR",
    "role": "mage",
    "faction": "wild",
    "source": "《楚辞·远游》及风神信仰",
    "lore": "掌风之神，后世常见持风囊的形象。",
    "mark": "风",
    "skill": "万象法印",
    "art": 64
  },
  {
    "id": "yushi",
    "name": "雨师",
    "title": "甘霖润野",
    "rarity": "SR",
    "role": "healer",
    "faction": "wild",
    "source": "《楚辞·远游》及雨神信仰",
    "lore": "掌雨之神，祈雨传统中常与风伯并列。",
    "mark": "雨",
    "skill": "灵泽回春",
    "art": 65
  },
  {
    "id": "houyi",
    "name": "后羿",
    "title": "神弓逐日",
    "rarity": "SSR",
    "role": "assassin",
    "faction": "wild",
    "source": "《淮南子·本经训》羿射日神话",
    "lore": "射日神话中的羿，后世常称后羿；与夏代后羿叙事有别。",
    "mark": "后",
    "skill": "追影破邪",
    "art": 66
  },
  {
    "id": "jingwei",
    "name": "精卫",
    "title": "衔木填海",
    "rarity": "SSR",
    "role": "assassin",
    "faction": "wild",
    "source": "《山海经·北山经》",
    "lore": "炎帝少女女娃溺亡后化鸟，衔木石填海。",
    "mark": "精",
    "skill": "追影破邪",
    "art": 67
  },
  {
    "id": "qinglong",
    "name": "青龙",
    "title": "东方孟章",
    "rarity": "SSR",
    "role": "mage",
    "faction": "wild",
    "source": "四象传统",
    "lore": "主东方的神龙，与白虎、朱雀、玄武并列。",
    "mark": "青",
    "skill": "万象法印",
    "art": 68
  },
  {
    "id": "shennong",
    "name": "神农",
    "title": "百草先师",
    "rarity": "SSR",
    "role": "healer",
    "faction": "wild",
    "source": "《淮南子·修务训》",
    "lore": "尝百草、教稼穑的上古神圣。",
    "mark": "神",
    "skill": "灵泽回春",
    "art": 69
  },
  {
    "id": "nuwa",
    "name": "女娲",
    "title": "炼石补天",
    "rarity": "UR",
    "role": "healer",
    "faction": "wild",
    "source": "《淮南子·览冥训》",
    "lore": "炼五色石补天的古老女神。",
    "mark": "女",
    "skill": "灵泽回春",
    "art": 70
  },
  {
    "id": "fuxi",
    "name": "伏羲",
    "title": "八卦肇始",
    "rarity": "UR",
    "role": "blade",
    "faction": "wild",
    "source": "《周易·系辞下》包牺氏传统",
    "lore": "画八卦、作网罟的上古神圣，亦称包牺。",
    "mark": "伏",
    "skill": "破阵剑诀",
    "art": 71
  }
];
const SIGNATURES={qing:'纯阳剑歌',shi:'巨灵开山',ling:'荷露回春',yan:'万鸦焚天',ye:'夜巡摄魂',zhu:'洞箫引凤',xue:'四海瓶澜',yuan:'玲珑镇妖',tao:'麻姑献寿',xing:'太阴流辉',he:'降魔飞杵',lei:'风雷双翼',chen:'轩辕定鼎',long:'应龙破岳',yue:'广寒清辉',huang:'朱雀焚羽',ming:'钟馗伏魔',tai:'紫气东来',heling:'渔鼓惊仙',guichuan:'河伯翻潮',xinglin:'玉杵灵药',deng:'赤足踏云',qiaoying:'无常引魂',yufeng:'芭蕉借风',baihu:'白虎破军',yunlu:'增长慧剑',luyin:'南极长生',moqiu:'文昌点斗',hanzhao:'锁魂勾魄',xueyu:'忘川回梦',nezha:'三昧莲焰',yangjian:'天眼破妄',aoli:'龙宫甘露',yaochi:'瑶池涤尘',doumu:'斗极流光',wukong:'金身归元',han_zhongli:'宝扇还真',cao_guojiu:'玉板清音',li_tieguai:'葫芦济世',lan_caihe:'花篮摄霞',chi_guo:'琵琶镇邪',duo_wen:'宝伞护道',jiang_ziya:'封神点将',guangle:'番天印诀',yuding:'玉鼎斩仙',yunzhongzi:'松木除妖',yuanshi:'三清启灵',lingbao:'灵宝护元',wu_gang:'月桂斩影',ri_you:'日巡正气',ma_mian:'冥关守御',niu_tou:'幽关裂阵',meng_zhang:'红线牵缘',leigong:'五雷轰顶',dianmu:'金镜掣电',ziwei:'紫极镇星',taiyi:'九色莲华',fengdu:'酆都敕令',houtu:'大地承天',yuhuang:'天庭玉敕',tu_di:'厚土安神',zao_shen:'灶火护家',ao_guang:'东海涌潮',xuanwu:'龟蛇盘镇',fengbo:'飞廉御风',yushi:'甘霖普降',houyi:'落日神箭',jingwei:'衔石破浪',qinglong:'苍龙啸天',shennong:'百草回生',nuwa:'补天涤尘',fuxi:'八卦启灵'};
for(const h of HEROES)h.skill=SIGNATURES[h.id]||h.skill;
export const HERO_BY_ID = Object.fromEntries(HEROES.map(h => [h.id, h]));
const BASE = {
  guard:{hp:650,atk:48,def:38,speed:65}, blade:{hp:420,atk:85,def:20,speed:92},
  mage:{hp:350,atk:93,def:14,speed:78}, healer:{hp:390,atk:68,def:19,speed:83}, assassin:{hp:320,atk:97,def:13,speed:112}
};
export function heroStats(id, level=1, star=0) {
  const h=HERO_BY_ID[id]; if(!h) throw new Error('未知英雄');
  const scale=(1+(level-1)*.075)*(1+star*.08)*RARITIES[h.rarity].factor;
  const st=Object.fromEntries(Object.entries(BASE[h.role]).map(([k,v])=>[k,k==='speed'?v:Math.round(v*scale)]));
  return {...st,power:Math.round(st.atk*5+st.def*4+st.hp/3)};
}
export function validateTeam(team) {
  if(!Array.isArray(team)||team.length!==5||new Set(team).size!==5||team.some(id=>typeof id!=='string'||!Object.hasOwn(HERO_BY_ID,id))) throw new Error('队伍必须由五名不同的英雄组成');
  return [...team];
}
export const FACTION_TRAITS={cloud:{name:'云阙金身',stat:'def',small:.08,full:.15,detail:'防御'},moon:{name:'月华回生',stat:'healing',small:.08,full:.15,detail:'治疗效果'},wild:{name:'山海战意',stat:'crit',small:.04,full:.08,detail:'暴击率'}};
export const NAMED_BONDS=[
 {name:'八仙同游',ids:['qing','ling','zhu','heling','han_zhongli','cao_guojiu','li_tieguai','lan_caihe'],need:3,stat:'hp',bonus:.06},
 {name:'封神战友',ids:['nezha','yangjian','lei'],need:3,stat:'atk',bonus:.06},
 {name:'广寒相伴',ids:['yue','xinglin','wu_gang','xing'],need:2,stat:'healing',bonus:.06},
 {name:'幽冥巡司',ids:['qiaoying','hanzhao','niu_tou','ma_mian','ye','ri_you'],need:3,stat:'def',bonus:.06},
 {name:'四象镇世',ids:['qinglong','baihu','huang','xuanwu'],need:3,stat:'hp',bonus:.06},
 {name:'补天画卦',ids:['nuwa','fuxi'],need:2,stat:'atk',bonus:.06}
];
export const RECOMMENDED={cloud:['yuan','qing','yan','li_tieguai','he'],moon:['ri_you','wu_gang','xing','yue','ye'],wild:['long','baihu','huang','shennong','wukong']};
export function synergy(team){
 const counts={};for(const id of team){const f=HERO_BY_ID[id].faction;counts[f]=(counts[f]||0)+1;}
 const [faction,size]=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0],bonus=size>=5?.14:size>=3?.08:0;
 const stats={atk:bonus,hp:bonus,def:0,healing:0,crit:0},trait=FACTION_TRAITS[faction];
 if(size>=3)stats[trait.stat]+=size>=5?trait.full:trait.small;
 const complete=new Set(team.map(id=>HERO_BY_ID[id].role)).size===5;if(complete)stats.hp+=.05;
 const bonds=NAMED_BONDS.map(b=>({...b,count:b.ids.filter(id=>team.includes(id)).length}));
 for(const b of bonds)if(b.count>=b.need)stats[b.stat]+=b.bonus;
 return{faction,size,bonus,stats,complete,bonds,trait};
}
export function teamPower(team,roster,normalized=false,estate=null,armory=null){
 validateTeam(team);const bond=synergy(team),bonus=estateBonus(estate);
 return Math.round(team.reduce((sum,id)=>{const st=heroStats(id,normalized?50:roster[id].level,normalized?0:roster[id].star);const gear=gearBonus(armory,id);return sum+st.atk*(1+bond.stats.atk+bonus.atk+gear.atk)*5+st.def*(1+bond.stats.def+bonus.def+gear.def)*4+st.hp*(1+bond.stats.hp+bonus.hp+gear.hp)/3;},0));
}
export const SKILL_RULES = {
  guard:'绝技：全队获得自身攻击 90% 的护盾，自己嘲讽敌方 2 次行动。',
  blade:'绝技：对前排单体造成 225% 攻击伤害，优先斩杀残血目标。',
  mage:'绝技：对敌方全体造成 90% 攻击伤害。',
  healer:'绝技：治疗全队，恢复自身攻击 110% 的气血；普攻改为治疗最低血量队友。',
  assassin:'绝技：优先攻击后排最低血量目标，造成 210% 攻击伤害并无视一半防御。'
};
export function heroEffect(id){const unique={nuwa:'cleanse',taiyi:'cleanse',yaochi:'cleanse',fuxi:'rally',jiang_ziya:'rally',yuanshi:'rally',wukong:'leech',li_tieguai:'leech',long:'shatter',yangjian:'shatter',baihu:'shatter',lei:'chain',leigong:'chain',dianmu:'chain',ming:'execute',fengdu:'execute',houyi:'execute'};if(unique[id])return unique[id];const h=HERO_BY_ID[id];if(['yan','nezha','huang','zao_shen'].includes(id))return 'burn';if(['houyi','yangjian','ming','fengdu'].includes(id))return 'mark';return ({guard:'ward',healer:'spring',assassin:'echo',blade:'mark',mage:'focus'})[h.role];}
export function skillDetail(id){return EFFECTS[heroEffect(id)].text;}
export function seededRandom(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
// Shared deterministic simulator: the same engine is usable in the browser and on a PK server.
export function teamBattle(left,right,{seed=1,normalized=false,maxRounds=30}={}) {
  validateTeam(left.team);validateTeam(right.team);
  const random=seededRandom(seed),events=[];
  function create(side,source){const bond=synergy(source.team);return source.team.map((id,slot)=>{
    const st=heroStats(id,normalized?50:source.roster[id].level,normalized?0:source.roster[id].star);
    const extra=estateBonus(source.estate),gear=gearBonus(source.armory,id);for(const k of ['hp','atk','def'])st[k]=Math.round(st[k]*(1+bond.stats[k]+extra[k]+gear[k]));st.healing=bond.stats.healing;st.crit=bond.stats.crit;
    return {id,side,slot,...st,maxHp:st.hp,shield:0,energy:0,taunt:0,burn:0,mark:0,effects:[...new Set([heroEffect(id),...gear.effects])],star:source.roster[id].star,role:HERO_BY_ID[id].role};
  });}
  const a=create('left',left),b=create('right',right),all=[...a,...b];
  const living=xs=>xs.filter(x=>x.hp>0);
  const snapshot=()=>all.map(x=>({id:x.id,side:x.side,hp:x.hp,maxHp:x.maxHp,shield:x.shield,energy:x.energy,burn:x.burn,mark:x.mark}));
  const initial=snapshot();
  let rounds=0;
  for(let round=1;round<=maxRounds && living(a).length && living(b).length;round++){
    rounds=round;
    // Random tie-break avoids a permanent first-player advantage at equal speed.
    const order=all.map(x=>({x,tie:random()})).sort((u,v)=>v.x.speed-u.x.speed||u.tie-v.tie).map(o=>o.x);
    for(const actor of order){
      if(actor.hp<=0||!living(a).length||!living(b).length)continue;
      const allies=living(actor.side==='left'?a:b),foes=living(actor.side==='left'?b:a);
      const special=actor.energy>=2;actor.energy=special?0:actor.energy+1;
      const actions=[];
      function damage(target,multi,pierce=false){
        if(target.hp<=0)return;multi*=1+(actor.effects.includes('execute')&&target.hp<target.maxHp*.5?.3:0)+(target.burn>0?.2:0)+(target.mark>0?.15:0)+(special?actor.star*.03:0);
        const crit=random()<.15+actor.crit;
        let amount=Math.max(Math.round(actor.atk*.25),Math.round(actor.atk*multi-target.def*(pierce?.5:1)))*(crit?1.5:1);
        amount=Math.round(amount);const absorbed=Math.min(target.shield,amount);target.shield-=absorbed;
        const actual=Math.min(target.hp,amount-absorbed);target.hp-=actual;
        actions.push({target:target.id,side:target.side,type:'damage',amount:actual,absorbed,crit});
      }
      function heal(target,multi){const amount=Math.min(target.maxHp-target.hp,Math.round(actor.atk*multi*(1+actor.healing)));target.hp+=amount;if(special)target.burn=0;actions.push({target:target.id,side:target.side,type:'heal',amount});}
      const taunter=foes.find(x=>x.taunt>0);
      const front=foes.filter(x=>x.slot<2), back=foes.filter(x=>x.slot>=2);
      const weakest=xs=>[...xs].sort((u,v)=>u.hp/u.maxHp-v.hp/v.maxHp||u.slot-v.slot)[0];
      if(actor.role==='healer'){
        if(special)for(const target of allies)heal(target,1.1);else heal(weakest(allies),1.05);
      }else if(special&&actor.role==='guard'){
        for(const target of allies){const amount=Math.round(actor.atk*.9);target.shield=Math.min(Math.round(target.maxHp*.6),target.shield+amount);actions.push({target:target.id,side:target.side,type:'shield',amount});}
        actor.taunt=2;
      }else if(special&&actor.role==='mage'){
        for(const target of foes)damage(target,.9);
      }else{
        const pool=actor.role==='assassin'?(back.length?back:foes):(front.length?front:foes);
        const target=taunter||weakest(pool);
        damage(target,special?(actor.role==='assassin'?2.1:2.25):1,special&&actor.role==='assassin');
        if(taunter)taunter.taunt--;
      }
      if(special){
        const hitIds=actions.filter(x=>x.type==='damage').map(x=>x.target);
        for(const effect of actor.effects){
          if(effect==='burn'||effect==='mark')for(const target of foes.filter(x=>x.hp>0&&hitIds.includes(x.id)))target[effect]=2;
          if(effect==='focus')actor.energy=1;
          if(effect==='cleanse')for(const target of allies){target.burn=0;target.mark=0;}
          if(effect==='rally')for(const target of allies)if(target!==actor)target.energy=Math.min(2,target.energy+1);
          if(effect==='leech')heal(actor,1);
          if(effect==='chain')for(const target of living(foes))damage(target,.25);
          if(effect==='shatter')for(const target of living(foes).filter(x=>hitIds.includes(x.id))){const amount=Math.min(target.shield,Math.round(actor.atk*.6));target.shield-=amount;actions.push({target:target.id,side:target.side,type:'break',amount});}
          if(effect==='echo'&&living(foes).length)damage(weakest(living(foes)),.45);
          if(effect==='spring')heal(weakest(allies),.7);
          if(effect==='ward'){const target=weakest(allies),amount=Math.min(Math.round(actor.atk*.8),Math.max(0,Math.round(target.maxHp*.6)-target.shield));target.shield+=amount;actions.push({target:target.id,side:target.side,type:'shield',amount});}
        }
      }
      if(actor.burn>0){const amount=Math.min(actor.hp,Math.round(actor.maxHp*.04));actor.hp-=amount;actor.burn--;actions.push({target:actor.id,side:actor.side,type:'burn',amount});}
      if(actor.mark>0)actor.mark--;
      events.push({round,actor:actor.id,side:actor.side,special,skill:special?HERO_BY_ID[actor.id].skill+' · '+actor.effects.map(e=>EFFECTS[e].name).join(' / '):actor.role==='healer'?'灵息回春':'普通攻击',actions,units:snapshot()});
    }
  }
  const leftAlive=living(a).length,rightAlive=living(b).length;
  // Survivors and then total remaining HP percentage decide a round-cap result.
  const leftHp=a.reduce((sum,x)=>sum+x.hp/x.maxHp,0),rightHp=b.reduce((sum,x)=>sum+x.hp/x.maxHp,0);
  const score=leftAlive-rightAlive||leftHp-rightHp;
  return {winner:Math.abs(score)<1e-8?'draw':score>0?'left':'right',rounds,initial,events,leftAlive,rightAlive};
}
