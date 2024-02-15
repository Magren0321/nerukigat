interface FriendItem {
  name: string;
  link: string;
  avatar: string;
  desc: string;
}

const friendData: FriendItem[] = [
  {
    name: '7gugu’s Blog',
    link: 'https://www.7gugu.com/',
    avatar: 'https://7gugu.com/wp-content/uploads/2021/07/favicon.png',
    desc: '一只鸽子的Code Space'
  },{
    name: '蝉時雨',
    link: 'https://chanshiyu.com',
    avatar: 'https://www.chanshiyu.com/avatar.jpg',
    desc: '蝉鸣如雨，花宵道中'
  },{
    name : '静かな森',
    link: 'https://innei.in/',
    avatar: 'https://github.com/Innei/static/blob/master/avatar.png?raw=true',
    desc: '致虚极，守静笃。'
  },{
    name: '折影轻梦',
    link: 'https://nexmoe.com',
    avatar: 'https://cravatar.cn/avatar/c7fd185f8c967dec20c29c75a40b9e09?s=500',
    desc: '为热爱战斗着，努力学着变得勇敢'
  },{
    name: '百里飞洋の博客',
    link: 'https://blog.meta-code.top/',
    avatar: 'https://avatars.githubusercontent.com/u/81922999?v=4',
    desc: '星河滚烫，无问西东'
  },{
    name: 'Lakphy',
    link: 'https://lakphy.me/',
    avatar: 'https://lakphy.me/avatar.webp',
    desc: 'Lakphy的个人博客'
  },{
    name: '🌹Dominic·KK🌹',
    link: 'https://blog.dominickk.top/',
    avatar: 'http://dominickk.oss-cn-hangzhou.aliyuncs.com/typora/2023/11/dominic.jpg',
    desc: '写文档使我快乐🍺'
  }
];

export default friendData;
