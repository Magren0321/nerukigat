---
title: "关于Yuan-bot🤖"
date: 24 Jul 2022
draft: false
tags: ["NodeJs", "前端"]
---

[oicq](https://github.com/takayama-lily/oicq)是基于Node.js实现QQ(安卓)协议，提供了QQ内常用的功能操作
[yuan-bot](https://github.com/Magren0321/yuan-bot)是基于[oicq](https://github.com/takayama-lily/oicq)并使用TS编写以及使用MongoDB作为数据库的QQ机器人。目前项目刚创建，只针对了Q群的精华消息，后续内容会慢慢丰富。

Github地址：[yuan-bot](https://github.com/Magren0321/yuan-bot)

这篇文章是该项目的非正经开发日志的历程记录。

<!--more-->

## 背景

我的QQ里面有着一个群，这是我高中以及大学时间玩剑三时候的游戏群。
里面的人个个会玩说话又好听。为了铭记每个小伙伴的一言一语，我们活用了QQ的精华消息功能，将每一句 ~~骚话~~ 经典名言裱在了这个精华消息列表上。
**此时精华消息的内容不再是精华， 我们心照不宣地称其为糟粕**
![](/postImg/about-yuan-bot/message.png)

因为自己一时的年少轻狂而给装裱在列表上的小伙伴都叫苦连天（当然也有人以此为乐，是谁我不说，大家懂得都懂），纷纷控诉管理员这里面有着管理员的黑幕！应群友得而诛之！

但道高一尺魔高一丈，卑鄙的群管理不仅无视群友控诉，甚至在前一阵群成立八周年之日推出糟粕周边（有幸本人也拿到了一个），同时为糟粕数量最多的群友颁发了奖杯，大力推行糟粕文化，加上群友民心涣散，群里反对的声音逐渐消失，人人都成乐子人。

**至此，糟粕文化达到了群成立以来的一个高潮。**
![](/postImg/about-yuan-bot/bag.jpg)
![](/postImg/about-yuan-bot/medal.jpg)

在糟粕文化逐渐流行的同时，糟粕的数量也不断拔高，群管理发现了一些**问题**

- 糟粕数量最多达到1000，必须删掉部分糟粕消息才可以继续添加，这样会损失一些群历史的糟粕
- 在这么庞大的数量下，QQ群的精华消息并没有统计或者以时间查看等功能，每次统计都由人工统计，耗费人力
- ……

Yuan-Bot 就是为了 ~~糟粕以及乐子~~ 解决上述的问题而生。

## 启动

```
git clone https://github.com/Magren0321/yuan-bot.git

pnpm install

pnpm run serve
```

## 过程

作为一个前端，所以技术的选用下意识地就选择了Node.js，找到了 [oicq](https://github.com/takayama-lily/oicq) 这个库，它是基于Node.js实现的Android QQ，同时是我感觉功能较为全面的库，具体的使用听我说不如参考其 [Api reference](https://github.com/takayama-lily/oicq##api-reference)

### 精华数据

oicq其本身封装的群对象里面并没有封装群精华数据（不如说好像还没有开源的库做到了这个，或许是受众太小了使用的频率也不高，所以都没有考虑），所以我得自己动手，丰衣足食。
用Fiddler抓包了PC端的QQ，抓到了精华数据的接口，然后通过 oicq 提供的登录接口获取到Cookie，将其丢进请求头来获取精华消息的数据。
顺便给 oicq 提了个PR（又水了一个PR

然后又又又碰上了一个问题就是，当群里有新增精华消息的时候我并无法通过 oicq 监听到群里的tips，发现这个已经有人在去年8月就提了issues，但是至今没有解决的样子。
原本的计划是打算监听到添加精华消息后，服务器的数据库实时存储新的精华消息，但是现在只能换一种方案，改成了间隔定时器，每隔一定时间对数据进行请求，记录好最新消息的时间戳，以此筛选掉旧的内容。
这个办法虽然我觉得很笨，但是现状我暂时没想到别的办法来实现这个功能。

### 命令

这个比较容易解决，只需要监听指定群的消息，封装一个类，以字符串作为类中的key，对应的方法作为value，在收到消息后将消息作为key传入，如果class中存在则执行对应的方法就好。
![](/postImg/about-yuan-bot/image.jpg)

**大概实现就是这样，可以说是平平无奇，毫无亮点🤡**

## 最后（或许也还不是最后？

yuan-bot的功能后续还会继续丰富还有迭代(不过现在上班了，估摸进度会推进的比较缓慢)
🙏感谢 [oicq](https://github.com/takayama-lily/oicq) 提供的接口以及文档
🛸Power by [Magren](https://github.com/Magren0321) and made with love

To Be Continued.
