import type { CollectionRecord } from '@/components/collection/types';

// 在这里维护游戏记录：
// title 为名称，category 为系列或已有分组，meta 为平台；
// status 支持：
// done 已通关
// active 正在玩
// casual 偶尔玩；
// paused 暂时搁置
// retired 已退坑
// planned 未开始；
// rating 为 1～5 的喜爱程度；
// 没有系列时省略 category；除 title 外，其余字段都可以省略。
// 页面严格按照本文件中的先后顺序展示。

export const gameRecords = [
  {
    title: '星露谷物语',
    meta: 'PC Steam',
    status: 'active',
    rating: 5
  },

  // 生化危机
  {
    title: '生化危机 2：重制版',
    category: '生化危机',
    meta: 'PC Steam',
    status: 'done',
    rating: 5
  },
  {
    title: '生化危机 3',
    category: '生化危机',
    meta: 'PC Steam',
    status: 'done',
    rating: 4
  },
  {
    title: '生化危机 4：重制版',
    category: '生化危机',
    meta: 'PC Steam',
    status: 'done',
    rating: 5
  },
  {
    title: '生化危机 7',
    category: '生化危机',
    meta: 'PC Steam',
    status: 'done',
    rating: 4
  },
  {
    title: '生化危机：安魂曲',
    category: '生化危机',
    meta: 'PC Steam',
    status: 'done',
    rating: 5
  },
  {
    title: '生化危机 8：村庄',
    category: '生化危机',
    meta: 'PC Steam',
    status: 'done',
    rating: 5
  },

  // 女神异闻录
  {
    title: '女神异闻录 3 Reload',
    category: '女神异闻录',
    meta: 'PC Steam',
    status: 'active',

  },
  {
    title: '女神异闻录 5 皇家版',
    category: '女神异闻录',
    meta: 'PC Steam',
    status: 'done',
    rating: 5
  },
  {
    title: '女神异闻录 5 乱战：魅影攻手',
    category: '女神异闻录',
    meta: 'PC Steam',
    status: 'active',
  },

  // 怪物猎人
  {
    title: '怪物猎人：荒野',
    category: '怪物猎人',
    meta: 'PC Steam',
    status: 'active',
    rating: 5
  },
  {
    title: '怪物猎人：崛起',
    category: '怪物猎人',
    meta: 'PC Steam',
    status: 'done',
    rating: 4
  },
  {
    title: '怪物猎人：世界',
    category: '怪物猎人',
    meta: 'PC Steam',
    status: 'done',
    rating: 4
  },

  // 空洞骑士
  {
    title: '空洞骑士',
    category: '空洞骑士',
    meta: 'PC Steam',
    status: 'done',
    rating: 5
  },
  {
    title: '空洞骑士：丝之歌',
    category: '空洞骑士',
    meta: 'PC Steam',
    status: 'done',
    rating: 5
  },

  // 优先记录
  {
    title: 'PRAGMATA',
    category: 'RPG',
    meta: 'PC Steam',
    status: 'done',
    rating: 4
  },
  {
    title: '只狼：影逝二度',
    category: 'RPG',
    meta: 'PC Steam',
    status: 'done',
    rating: 5
  },
  {
    title: '荒野大镖客：救赎 2',
    category: 'RPG',
    meta: 'PC Steam',
    status: 'active',
    rating: 5
  },

  // RPG
  {
    title: '艾尔登法环',
    category: 'RPG',
    meta: 'PC Steam',
    status: 'done',
    rating: 5
  },
  {
    title: '古剑奇谭三',
    category: 'RPG',
    meta: 'PC Steam',
    status: 'paused',
    rating: 3
  },
  {
    title: '黑神话：悟空',
    category: 'RPG',
    meta: 'PC Steam',
    status: 'done',
    rating: 4
  },
  {
    title: '霍格沃茨之遗',
    category: 'RPG',
    meta: 'PC Steam',
    status: 'paused',
    rating: 3
  },
  {
    title: '赛博朋克 2077',
    category: 'RPG',
    meta: 'PC Steam',
    status: 'planned',
  },
  {
    title: '巫师 3：狂猎',
    category: 'RPG',
    meta: 'PC Steam',
    status: 'planned',
  },
  {
    title: '漫威蜘蛛侠：重制版',
    category: 'RPG',
    meta: 'PC Steam',
    status: 'done',
    rating: 4
  },
  {
    title: '博德之门 3',
    meta: 'PC Steam',
    status: 'paused',
  },

  // 死亡搁浅
  {
    title: '死亡搁浅 2：冥滩之上',
    category: '死亡搁浅',
    meta: 'PC Steam',
    status: 'planned',
  },
  {
    title: '死亡搁浅：导演剪辑版',
    category: '死亡搁浅',
    meta: 'PC Steam',
    status: 'planned',
  },

  // 饥荒
  {
    title: '饥荒',
    category: '饥荒',
    meta: 'PC Steam',
    status: 'paused',
  },
  {
    title: '饥荒联机版',
    category: '饥荒',
    meta: 'PC Steam',
    status: 'paused',
  },

  // 古墓丽影
  {
    title: '古墓丽影：崛起',
    category: '古墓丽影',
    meta: 'PC Steam',
    status: 'done',
    rating: 4
  },
  {
    title: '古墓丽影',
    category: '古墓丽影',
    meta: 'PC Steam',
    status: 'done',
    rating: 4
  },

  // 未分组
  {
    title: '米塔 MiSide',
    meta: 'PC Steam',
    status: 'planned',
  },
  {
    title: '魔法使之夜',
    meta: 'PC Steam',
    status: 'done',
    rating: 4
  },
  {
    title: '情感反诈模拟器',
    meta: 'PC Steam',
    status: 'done',
    rating: 3
  },
  {
    title: '双人成行',
    meta: 'PC Steam',
    status: 'planned',
  },
  {
    title: '糖豆人',
    meta: 'PC Steam',
    status: 'done',
    rating: 3
  },
  {
    title: '永劫无间',
    meta: 'PC Steam',
    status: 'retired',
    rating: 4
  },

  // 小小梦魇
  {
    title: '小小梦魇 2',
    category: '小小梦魇',
    meta: 'PC Steam',
    status: 'done',
    rating: 4
  },
  {
    title: '小小梦魇',
    category: '小小梦魇',
    meta: 'PC Steam',
    status: 'done',
    rating: 4
  },

  // 未分组
  {
    title: '茶杯头',
    meta: 'PC Steam',
    status: 'paused',
  },
  {
    title: '奥日与萤火意志',
    meta: 'PC Steam',
    status: 'paused',
  },
  {
    title: 'Poly Bridge',
    meta: 'PC Steam',
    status: 'paused',
  },

  // 刺客信条
  {
    title: '刺客信条 2',
    category: '刺客信条',
    meta: 'PC Steam',
    status: 'done',
    rating: 4
  },
  {
    title: '刺客信条：兄弟会',
    category: '刺客信条',
    meta: 'PC Steam',
    status: 'done',
    rating: 4
  },
  {
    title: '刺客信条：启示录',
    category: '刺客信条',
    meta: 'PC Steam',
    status: 'done',
    rating: 5
  },
  {
    title: '刺客信条 3',
    category: '刺客信条',
    meta: 'PC Steam',
    status: 'done',
    rating: 3
  },
  {
    title: '刺客信条 4：黑旗',
    category: '刺客信条',
    meta: 'PC Steam',
    status: 'done',
    rating: 4
  },
  {
    title: '刺客信条：奥德赛',
    category: '刺客信条',
    meta: 'PC Steam',
    status: 'done',
    rating: 3
  },

  // 第一人称射击
  {
    title: '彩虹六号：围攻',
    category: 'FPS',
    meta: 'PC Steam',
    status: 'retired',
    rating: 3
  },
  {
    title: '反恐精英 2',
    category: 'FPS',
    meta: 'PC Steam',
    status: 'retired',
    rating: 4
  },
  {
    title: '星际战甲',
    category: 'FPS',
    meta: 'PC Steam',
    status: 'retired',
    rating: 4
  },
  {
    title: '瓦罗兰特',
    category: 'FPS',
    meta: 'PC',
    status: 'casual',
    rating: 4
  },

  // Nintendo Switch
  {
    title: '宝可梦 剑',
    category: '宝可梦',
    meta: 'Nintendo Switch',
    status: 'done',
    rating: 4
  },
  {
    title: '宝可梦 紫',
    category: '宝可梦',
    meta: 'Nintendo Switch',
    status: 'done',
    rating: 4
  },
  {
    title: '宝可梦传说 阿尔宙斯',
    category: '宝可梦',
    meta: 'Nintendo Switch',
    status: 'done',
    rating: 5
  },
  {
    title: '塞尔达传说：旷野之息',
    category: '塞尔达传说',
    meta: 'Nintendo Switch',
    status: 'done',
    rating: 5
  },
  {
    title: '塞尔达传说：王国之泪',
    category: '塞尔达传说',
    meta: 'Nintendo Switch',
    status: 'done',
    rating: 5
  },
  {
    title: '喷射战士 3',
    category: '喷射战士',
    meta: 'Nintendo Switch',
    status: 'casual',
    rating: 4
  },
  {
    title: '任天堂全明星大乱斗 特别版',
    category: '任天堂明星大乱斗',
    meta: 'Nintendo Switch',
    status: 'casual',
    rating: 5
  },
  {
    title: '集合啦！动物森友会',
    category: '动物森友会',
    meta: 'Nintendo Switch',
    status: 'casual',
    rating: 5
  },
  {
    title: '女神异闻录 5 皇家版',
    category: '女神异闻录',
    meta: 'Nintendo Switch',
    status: 'done',
    rating: 5
  },
  {
    title: '超级马力欧创作家 2',
    category: '超级马力欧',
    meta: 'Nintendo Switch',
    status: 'done',
    rating: 4
  },
  {
    title: '怪物猎人：崛起',
    category: '怪物猎人',
    meta: 'Nintendo Switch',
    status: 'done',
    rating: 4
  },
  {
    title: '蔚蓝',
    meta: 'Nintendo Switch',
    status: 'done',
    rating: 5
  },
  {
    title: '马里奥赛车8 豪华版',
    category: '马里奥赛车',
    meta: 'Nintendo Switch',
    status: 'casual',
    rating: 4
  },
  {
    title: 'NBA 2K20',
    category: 'NBA 2K',
    meta: 'Nintendo Switch',
    status: 'done',
    rating: 3
  },
  {
    title: '胡闹厨房2',
    category: '胡闹厨房',
    meta: 'Nintendo Switch',
    status: 'done',
    rating: 3
  },
  {
    title: '舞力全开 2022',
    category: '舞力全开',
    meta: 'Nintendo Switch',
    status: 'done',
    rating: 3
  },
  {
    title: '人类：一败涂地',
    meta: 'Nintendo Switch',
    status: 'done',
    rating: 2
  },
  {
    title: '逃生2',
    category: '逃生',
    meta: 'Nintendo Switch',
    status: 'done',
    rating: 4
  },
  {
    title: '八方旅人',
    category: '八方旅人',
    meta: 'Nintendo Switch',
    status: 'done',
    rating: 4
  },
  {
    title: '星之卡比 Wii 豪华版',
    category: '星之卡比',
    meta: 'Nintendo Switch',
    status: 'done',
    rating: 3
  },
] satisfies CollectionRecord[];
