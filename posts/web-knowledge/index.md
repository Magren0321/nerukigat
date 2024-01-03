---
title: 前端基础里一些杂七杂八的知识点
tags: ["前端"]
date: "02 May 2020"
---

其实在大一就有学习前端的想法，也就多多少少了解了一点html和css，但是那时候身在安卓方向，就还是以安卓为主，也没有坚持下去。
工程师嘛，无论是什么工程师，局限于一个领域上所学到的东西肯定是有限的，it界那么大，总得看看别的地方。
如果硬要说我想成为什么工程师，我希望我能成为一个全栈工程师吧（有能力的话

<!-- more -->

## 杂七杂八的要点

这里主要是记了一些我需要重要理解或者容易忘记的知识点。没有一个固定的逻辑顺序。

### 定位問題

最常用的两个：absolute 和 relative

1. absolut: 脱离原来的位置定位。对最近有定位的父级进行定位，假如没有则相对文档进行定位。
2. relative: 保留原来的位置进行定位。相对自己原来的位置定位。

z-index: 改变元素的层面，代表该元素的Z轴，默认是0。

当元素使用float属性定义元素往哪个方向浮动的时候，需要后面的元素不再继续浮动在后面的时候，可用：

```css
.nav::after {
	content: "";
	display: block;
	clear: both;
}
```

### 字体

1. 当字体超出长度，为了页面整洁美观，多余的字体用……表示：

```css
.product-buyer-name {
	overflow: hidden; /*隐藏超出单元格的部分。*/
	text-overflow: ellipsis; /*文字超出部分用省略号*/
	white-space: nowrap; /*保证无论单元格（TD）中文本内容有多少，都不会自动换行，此时多余的内容会在水平方向撑破单元格*/
}
```

1. 网页上的一些小图标
   我一直以为，在网页上的一些小图标是通过插入img来显示的，但是再深入一点了解到，类似淘宝网上的tab栏的小图标是通过一个自定义显示出来的。
   这里我规划到了字体类是因为当我们需要显示部分字体，但是电脑上没有该字体的时候是无法显示的，这里我们就要用一样的方法，将这个字体的资源加载进去，达到一个显示他人电脑字体不存在也依然可以看到该字体的效果。

   ![淘宝网tab栏](./tao_tab.png)

那么这种字体资源还有图标资源该怎么来呢，当然是，
**Google或者百度啦**
在阿里巴巴矢量图标库上有挺多资源，我们在里面挑选我们需要的资源并且加入购物车后下载源码

![阿里巴巴矢量图标库](./albb_icon.jpg)
![加入购物车](./albb_buy.jpg)

下载到的源码里有资源的文件以及他一个css的demo，在使用上我们先拷贝资源文件后。

1. 拷贝项目下面生成的font-face

```css
@font-face {
	font-family: "iconfont";
	src: url("iconfont.eot");
	src:
		url("iconfont.eot?##iefix") format("embedded-opentype"),
		url("iconfont.woff") format("woff"),
		url("iconfont.ttf") format("truetype"),
		url("iconfont.svg##iconfont") format("svg");
}
```

1. 定义使用的iconfont使用样式

```css
.iconfont {
	font-family: "iconfont" !important;
	font-size: 16px;
	font-style: normal;
	-webkit-font-smoothing: antialiased;
	-webkit-text-stroke-width: 0.2px;
	-moz-osx-font-smoothing: grayscale;
}
```

1. 挑选相应图标并获取字体编码，应用于页面

```html
<i class="iconfont">&##x33;</i>
```

### JavaScript 中 var,let,const的区别

const:声明一个只读的常量，一旦声明，常量的值就不能改变。
let:声明的变量只在 let 命令所在的代码块内有效。

#### 变量提升

概述：变量可在声明之前使用。

- var: 允许
- let：不允许
- const：不允许

```js
console.log(a); //正常运行，控制台输出 undefined
var a = 1;
console.log(b); //报错，Uncaught ReferenceError: b is not defined
let b = 1;

console.log(c); //报错，Uncaught ReferenceError: c is not defined
const c = 1;
```

主要是为了减少运行时错误，防止变量声明前就使用这个变量，从而导致意料之外的行为。

#### 暂时性死区

概述：如果在代码块中存在 let 或 const 命令，这个区块对这些命令声明的变量，从一开始就形成了封闭作用域。凡是在声明之前就使用这些变量，就会报错。

- var: 存在
- let：不存在
- const：不存在

例子：

```js
var num = 123;
if (true) {
	num = "abc"; //报错
	let num;
}
```

解释：存在全局变量 num，但是块级作用域内 let 又声明了一个 num变量，导致后者被绑定在这个块级作用域中，所以在 let 声明变量前，对 num 赋值就报错了。

#### 重复声明

概述：指在相同作用域内，重复声明同一个变量。

- var: 允许
- let：不允许
- const：不允许

var 允许重复定义所带来的后果：

```js
var i = 10;
for (var i = 0; i < 5; i++) {
	console.log(i);
}
console.log(i); // 输出 5
```

**var命令没有块级作用域**,for循环里的i会替代外层的i。

### 初始值

- var: 不需要
- let：不需要
- const：需要

### 作用域

- var: 除块级
- let：块级
- const：块级

块级作用域：

```js
function f1() {
	let n = 5;
	if (true) {
		let n = 10;
		console.log(n); // 10 内层的n
	}
	console.log(n); // 5 当前层的n
}
```

**这种的好处是，可以用于测试一些想法，不用担心变量重名，也不用担心外界干扰，var的作用域会有可能导致上面重复声明例子中的情况**
