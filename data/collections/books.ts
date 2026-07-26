import type { CollectionRecord } from '@/components/collection/types';

// 在这里维护书籍记录：
// title 为名称，time 为四位年份或“待定”；
// status 支持 done、active、planned，meta 和 note 均可省略。
// 页面严格按照本文件中的先后顺序展示，不会按年份自动排序。

export const bookRecords = [
  {
    title: '控糖革命',
    time: '待定',
    status: 'planned',
  },
  {
    title: '第七天',
    time: '待定',
    status: 'planned',
  },
  {
    title: '阿特拉斯耸耸肩',
    time: '待定',
    status: 'planned',
  },
  {
    title: 'Make Something Wonderful',
    time: '待定',
    status: 'planned',
  },
  {
    title: '上帝掷骰子吗？量子物理史话',
    time: '待定',
    status: 'planned',
  },
  {
    title: '布鲁克林有棵树',
    time: '待定',
    status: 'planned',
  },
  {
    title: '高效能人士的七个习惯',
    time: '2026',
    status: 'active',
  },
  {
    title: '如何度过这一生',
    time: '2026',
    status: 'done',
  },
  {
    title: '素食者',
    time: '2025',
    status: 'done',
  },
  {
    title: '在自己的树下',
    time: '2025',
    status: 'done'
  },
  {
    title: '俞军产品方法论',
    time: '2025',
    status: 'done'
  },
  {
    title: '东京八平米',
    time: '2025',
    status: 'done'
  },
  {
    title: '绝叫',
    time: '2025',
    status: 'done'
  },
  {
    title: '小城与不确定性的墙',
    time: '2025',
    status: 'done'
  },
  {
    title: '献给阿尔吉侬的花束',
    time: '2024',
    status: 'done',
  },
  {
    title: '被讨厌的勇气',
    time: '2024',
    status: 'done'
  },
  {
    title: '夏天 烟火和我的尸体',
    time: '2024',
    status: 'done'
  },
  {
    title: '麦琪的礼物',
    time: '2024',
    status: 'done',
  },
  {
    title: '蛤蟆先生去看心理医生',
    time: '2024',
    status: 'done',
  },
  {
    title: '提问的艺术',
    time: '2024',
    status: 'done',
  },
  {
    title: '非暴力沟通',
    time: '2024',
    status: 'done',
  },
  {
    title: '把时间当朋友（第四版）',
    time: '2024',
    status: 'done',
  },
  {
    title: '了凡四训',
    time: '2024',
    status: 'done'
  },
  {
    title: '发条橙',
    time: '2024',
    status: 'done',
  },
  {
    title: '悉达多',
    time: '2023',
    status: 'done',
  },
  {
    title: '牧羊少年的奇幻之旅',
    time: '2023',
    status: 'done',
  },
  {
    title: '香水',
    time: '2023',
    status: 'done',
  },
  {
    title: '硅谷钢铁侠：埃隆·马斯克的冒险人生',
    time: '2023',
    status: 'done',
  },
  {
    title: '如何成为不完美主义者',
    time: '2023',
    status: 'done',
  },
  {
    title: '为什么伟大不能被计划',
    time: '2023',
    status: 'done',
  },
  {
    title: '莱博维茨的赞歌',
    time: '2023',
    status: 'done',
  },
  {
    title: '史蒂夫·乔布斯传',
    time: '2023',
    status: 'done',
  },
  {
    title: '底层逻辑',
    time: '2023',
    status: 'done',
  },
  {
    title: '苔丝',
    time: '2023',
    status: 'done',
  },
  {
    title: '不拘一格·网飞的自由与责任工作法',
    time: '2023',
    status: 'done',
  },
  {
    title: '蝇王',
    time: '2023',
    status: 'done',
  },
  {
    title: '我是猫',
    time: '2022',
    status: 'done',
  },
  {
    title: '钝感力',
    time: '2022',
    status: 'done',
  },
  {
    title: '窄门',
    time: '2022',
    status: 'done',
  },
  {
    title: '小米创业思考',
    time: '2022',
    status: 'done',
  },
  {
    title: 'JavaScript高级程序设计',
    time: '2021',
    status: 'done',
  },
  {
    title: '深入浅出node.js',
    time: '2021',
    status: 'done',
  },
  {
    title: '岩田先生',
    time: '2021',
    status: 'done',
  },
  {
    title: '代码整洁之道',
    time: '2021',
    status: 'done',
  },
  {
    title: '任天堂征服世界',
    time: '2021',
    status: 'done',
  },
] satisfies CollectionRecord[];
