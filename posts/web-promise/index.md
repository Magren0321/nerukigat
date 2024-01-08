---
title: es6中的promise
tags: ["前端"]
date: 27 May 2020
---

**Promise**，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。

<!-- more -->

有了Promise对象，就可以将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。此外，Promise对象提供统一的接口，使得控制异步操作更加容易。

Promise也有一些缺点：

1. 首先，无法取消Promise，一旦新建它就会立即执行，无法中途取消。
2. 如果不设置回调函数，Promise内部抛出的错误，不会反应到外部。
3. 当处于pending状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

## promise的特点

1. **对象的状态不受外界影响**。Promise对象代表一个异步操作，有三种状态：pending（进行中）、fulfilled（已成功）和rejected（已失败）。
2. **一旦状态改变，就不会再变，任何时候都可以得到这个结果**。Promise的对象状态改变，要么是成功，要么就是失败，只要发生这两种情况，状态就会凝固，称为resolvd（已定型）。改变发生后，再添加回调函数，也是会得到这个结果。

## 用法

### 创造Promise实例

Promise对象是一个构造函数，用来生成Promise实例。

```js
const promise = new Promise(function(resolve, reject) {
  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
});
```

> resolve函数的作用是，将Promise对象的状态从“未完成”变为“成功”（即从 pending 变为 resolved），在异步操作成功时调用，并将异步操作的结果，作为参数传递出去；

> reject函数的作用是，将Promise对象的状态从“未完成”变为“失败”（即从 pending 变为 rejected），在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。

### then方法

接着用**then**方法指定resolved状态和rejected状态的回调函数：

```js
promise.then(
	function (value) {
		// success
	},
	function (error) {
		// failure
	},
);
```

第一个函数是状态对象变为rejected的调用，第二个是resolved的调用，第二个函数是可选的。

then方法返回的是一个**新的Promise实例**（注意，**_不是原来那个Promise实例_**）。因此可以采用链式写法，即then方法后面再调用另一个then方法。

```js
promise.then(function(value) {

}.then(function (comments) {
  console.log("resolved: ", comments);
}, function (err){
  console.log("rejected: ", err);
});
```

### catch方法

用于指定发生错误时的回调函数。

```js
promise
	.then(
		function (value) {
			// success
		},
		function (error) {
			// failure
		},
	)
	.catch(function (error) {
		// 处理发生的错误
		console.log("发生错误！", error);
	});
```

如果异步操作抛出错误，状态就会变为rejected，就会调用catch()方法指定的回调函数，处理这个错误。另外，then()方法指定的回调函数，如果运行中抛出错误，也会被catch()方法捕获。

> 跟传统的try/catch代码块不同的是，如果没有使用catch()方法指定错误处理的回调函数，Promise 对象抛出的错误不会传递到外层代码，即不会有任何反应。

### finally方法

用于指定不管 Promise 对象最后状态如何，都会执行的操作。

```js
promise
	.then(
		function (value) {
			// success
		},
		function (error) {
			// failure
		},
	)
	.catch(function (error) {
		// 处理发生的错误
		console.log("发生错误！", error);
	})
	.finally(function () {
		alert("finish");
	});
```

finally方法的回调函数**不接受任何参数**,意味着无法知道最终的状态是怎样的。

## Jquery、Ajax、Promise示例

之前学了Jquery和ajax，就顺手在网上随便找了个api测试下：

```js
const apiUrl = "https://suggest.taobao.com/sug?code=utf-8&q=电脑&callback=cb";
$("##bt").click(apiUrl, function (event) {
	const promise = new Promise(function (resolve, reject) {
		$.ajax({
			url: event.data,
			type: "get",
			dataType: "jsonp",
			headers: {
				Accept: "application/json; charset=utf-8",
			},
			success: function (data) {
				resolve(data);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				reject(XMLHttpRequest, textStatus, errorThrown);
			},
		});
	});

	promise
		.then(
			function (data) {
				console.log(data);
				let x = data.result;
				for (let i = 0; i < data.result.length; i++) {
					console.log(x[i][0]);
				}
			},
			function (XMLHttpRequest, textStatus, errorThrown) {
				alert(XMLHttpRequest);
				alert(textStatus);
				alert(errorThrown);
			},
		)
		.catch(function (error) {
			console.log(error);
		})
		.finally(function () {
			alert("finish");
		});
});
```

结果：
![](/postImg/web-promise/promise_test.png)

## 遇到的问题

其实在Promise基础的学习上没有什么太大的问题，但是在ajax请求的时候遇上了一个跨域的问题，就是：

> Access to XMLHttpRequest at ‘这里是api’ from origin ‘null’ has been blocked by CORS policy: No ‘Access-Control-Allow-Origin’ header is present on the requested resource.

这是什么啊……
简单的了解了下，先说说跨域的概念吧

> 每个网站只能读取同一来源的数据，这里的同一来源指的是主机名(域名)、协议(http/https)和端口号的组合。在没明确授权的情况下，不能读写对方的资源，它是浏览器最核心也最基本的安全功能；只要有一个不一样就跨域。

而Ajax的XMLHttpRequest受到了同源限制，只能访问同源下的数据，所以就报这个错。
所以怎么还没说怎么解决嗷？？？

在搜到的文章里面大部分都是后端配合设置一个请求权限，但是我这是野生的api。。。我还腆着脸去要求别人做这做那哦？
![](/postImg/web-promise/shuidajiao.jpg)

直到我找到个方法，**jsonp**

jsonp:

- 通过script标签引入某些数据，是同步模式的，用script标签做跨域的时候，不建议将数据提前加载，需要按需加载；
- 当需要数据的时候创建一个script标签，将需要的数据放在src中，通过onload去监听是否请求过来，请求完毕就调用传回来的数据（异步加载）；
- jsonp不能用post请求，只能是get请求；

所以为啥这个类型就可以跨域了？？？

> 带src属性script、img、iframe、link等标签是不需要遵守同源策略的，但是通过src加载的资源，浏览器限制了javascript的权限, **能读不能写**

综上所述：把dataType类型从json改成jsonp就可以了。
