---
title: Vue下监听页面滚动以及移动端触摸事件
tags: ["前端", "Vue"]
date: 27 Aug 2020
---

无聊刷知乎的时候发现了一个前端设计的宝藏网站[awwwards](https://www.awwwards.com/)，对上面大佬实现的网站表示望洋兴叹，
但同时自己也跃跃欲试，我也想整一个，万一整出来了呢。

<!-- more -->

在上面看到了Rally大佬写的[GlobeKit](https://globekit.co/),感觉是通过监听滚动事件来进行一个样式的切换，便去了解了一下如何监听页面的滚动事件。

## pc端鼠标滚动监听

### 监听

根据不同的浏览器，在mounted中给页面添加一个滚动监听事件，其中的scrollFun是监听到滚动时候执行的方法

```js
// 浏览器兼容
 if ((navigator.userAgent.toLowerCase().indexOf("firefox") != -1)) {
     document.addEventListener("DOMMouseScroll", this.scrollFun, false)
   } else if (document.addEventListener) {
     document.addEventListener("mousewheel", this.scrollFun, false)
   }
 }
```

### 获取滚动事件的信息

通过传递的event对象获取滚动的属性

```js
 //滚动翻页
scrollFun(event: any) {
  // mousewheel事件中的 “event.wheelDelta” 属性值：返回的如果是正值说明滚轮是向上滚动
  // DOMMouseScroll事件中的 “event.detail” 属性值：返回的如果是负值说明滚轮是向上滚动
  const delta = event.detail || (-event.wheelDelta);
     if (delta > 0 ) {
       // 向下滚动
       console.log("向下滚动")
     }else if (delta < 0) {
         //向上滚动
         console.log("向上滚动")
     }
 }
```

## 移动端的touch事件

移动端的上下滚动并不能用上面的方法监听，是因为手机没鼠标吧。
为了实现我想要的效果，我都是直接把滚动条隐藏，然后监听touch事件来自行判断用户是否进行一个上滑下滑的操作。

- touchstart事件：当手指触摸屏幕时候触发，即使已经有一个手指放在屏幕上也会触发。
- touchmove事件：当手指在屏幕上滑动的时候连续地触发。在这个事件发生期间，调用preventDefault()事件可以阻止滚动。
- touchend事件：当手指从屏幕上离开的时候触发。

### 事件添加

双引号里是调用的方法

```js
<div id="main" @touchstart="touchstart($event)" @touchend="touchend($event)">
```

### 信息的获取

通过传递的$event对象获取触摸事件的信息
例：

```js
touchstart(e: any): void{
    this.startY = e.touches[0].pageY //获取触摸点的Y轴坐标
}
touchend(e: any): void{
    const moveEndY = e.changedTouches[0].pageY //获取松开手时Y轴的坐标
    ......
}
```

这样通过两个坐标的相减，我们通过正负即可判断用户的上下滑动。

传递过来的对象包括了三个用于跟踪触摸的属性：

- touches：表示当前跟踪的触摸操作的touch对象的数组。
- targetTouches：特定于事件目标的Touch对象的数组。
- changeTouches：表示自上次触摸以来发生了什么改变的Touch对象的数组。
