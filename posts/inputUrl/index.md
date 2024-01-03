---
title: 从输入URL到页面展示
tags: ["前端"]
date: "08 Nov 2020"
---

最近在准备着前端的面试，这个问题基本是必考题，稍微去网上查阅了一些资料，并且自己整理了下。
总的过程如下：

- 输入URL
- DNS解析
- 建立TCP链接
- 发送HTTP请求
- 服务器永久重定向
- 服务器处理请求并返回一个HTTP响应
- 浏览器显示HTML
- 链接结束

## 输入URL

URL的中文名叫统一资源定位符，用于得到资源的位置和访问方法。
其组成为：**协议：//主机名:端口号/路径/;参数?查询##信息片段**

## DNS解析

DNS（域名系统），因特网上作为域名和IP地址相互映射的一个分布式数据库，得到主机名对应的IP地址的过程就叫做域名解析。
DNS解析的过程其实就是为了寻找哪台机器上有需要的资源，实际上充当了一个翻译的身份，将输入的网址转换成IP地址。
以下是DNS的一个查找顺序：

- 浏览器缓存：向浏览器缓存中读取访问记录
- 操作系统缓存：查找在系统运行内存中的缓存
- host文件：查找本地硬盘的host文件
- 路由器缓存：部分路由器会缓存访问过的域名
- ISP（互联网服务提供商）DNS缓存：在本地查找不到的情况下，ISP会在当前服务器的缓存中查找
- 根DNS服务器：根域名收到请求，判断是哪台服务器管理，并返回顶级DNS服务器的IP给请求者。

在查找完以后本地DNS服务器向域名的解析服务器发起请求，本地服务器将IP地址返回给电脑，并将对应关系保存在缓存中。

**拓展：**
**DNS的查询方式：**

- **递归**：局部DNS服务器负责向其他DNS服务器查询（一般先向该域名的根域服务器查询，接着一级一级向下查询），结果返回给局部DNS服务器后再由其返回个客户端。
- **迭代**：局部DNS服务器把能解析该域名的其他DNS服务器的IP地址给客户端DNS程序，再由该程序向这些DNS服务器查询（用于局部DNS服务器不能回答客户机DNS查询时）。

**DNS优化方法：**

- DNS缓存
- DNS负载均衡
  - 为啥需要：当每次请求的资源都在同一台机器上时，机器可能承受不过来而崩掉。
  - 原理：为一个主机名配置多个IP地址，在应答查询饿时候对每个查询以DNS文件中记录的IP地址按顺序返回不同的结果，将访问引导到不同的机器上去。

## 建立TCP链接

拿到IP地址后就是通过三次握手来建立TCP链接了。

- 第一次握手：客户端发送**SYN（同步序列编号）包**到服务器，并且进入**SYN_SENT**状态，等待服务器确认。
- 第二次握手：服务器收到SYN包后确认，同时自己也发送一个SYN包，即**SYN+ACK包**，服务器进入**SYN_RECE**状态
- 第三次握手：客户端收到服务器的SYN+ACK包，向服务器发送一个确认包ACK，发送完毕后客户端和服务器进入**ESTABLISHED**状态。

**拓展：**
为啥三次握手：为了防止已经失效的链接请求报文突然传送到了服务端因而产生错误。

## 发送HTTP请求

建立TCP连接后客户端发起HTTP请求，HTTP报文包含三个部分：

- 请求行：请求方法+URL+协议/版本
- 请求报头：传递请求的附加信息和客户端自身的信息
- 请求正文：需要传递的数据

## 服务器永久重定向

服务器给浏览器响应一个301永久重定向响应，例如访问**http://google.com/** 会自动跳转到 **http://www.google.com/**

**目的**：

- 这样就会把访问带www的和不带www的地址归到同一个网站排名下，网站在搜索链接的排名下就不会降低。
- 用不同的地址会导致缓存的良好性变差，一个页面有多个名字的时候可能会在缓存中出现多次。

## 服务器处理请求并且返回HTTP报文

后端从固定的端口接收到TCP报文后，会对TCP进行处理，对HTTP协议进行解析，按照报文格式进一步封装成HTTP Request对象，供上层使用。
HTTP响应由4个部分组成：

- 状态行：协议版本、状态代码、状态描述
- 响应头：由键值对组成，每行一对，用“:”分割
- 空行： 分割请求数据
- 响应正文

**拓展：**
在大一点的网站中会将请求到反向代理中，将同一应用部署到多台服务器上，将大量用户请求分配给多台机器处理。
即客户端先请求到Nginx，Nginx再请求应用服务器，最后将结果返回客户端。

## 浏览器显示HTML

浏览器显示HTMl是一个边解析边渲染的过程，大致的过程为：

- 解析HTML文件构建DOM树
- 解析CSS文件构建渲染树
- 浏览器开始布局渲染树并将其绘制到屏幕上

**拓展：**
**关于reflow(回流)和repaint(重绘)**：

- DOM节点中的各个元素都是以盒模型的形式存在，浏览器计算其位置、大小等属性的这个过程称之为reflow。
- 当这些属性都确定下来后，浏览器开始绘制内容，这个绘制的过程称之为repaint。

reflow和repaint在页面首次加载的时候是肯定要经历的，但是这两个过程都是十分消耗性能，应该尽可能减少。
**js解析以及执行机制：**
当解析过程中遇到JS文件时，HTML文档会挂起渲染的线程，然后等待js文件加载并且解析完毕（由于js有可能会修改DOM，例如document.write），故平时js代码也是放在html的末尾。
js解析是由浏览器中的js解析引擎完成，js是单线程运行，但是像IO读写等任务比较耗时，所以需要一种机制可以先执行排在后面的任务，即同步任务和异步任务。
**js的执行机制可以看做成一个主线程+一个任务队列。**
**同步任务是放在主线程上的任务，在主线程上形成一个栈；**
**异步任务是放在任务队列中的任务，有了运行结果就会在任务队列中放置一个事件；**
**脚本先运行栈，然后从任务队列中提取事件，运行里面的任务。**
这个过程不断循环，也被称为**事件循环**。

## 链接结束

现在页面为了优化请求耗时，一般都会持续着TCP的链接，而TCP链接断开的时机是当前页面关闭的时候。
接下来就是四次挥手断开TCP链接：

- 主机发送一个FIN，主机进入**FIN_WAIT_1**状态。
- 服务端收到FIN后，发送一个ACK给主机，确认序号为收到序号+1，服务端进入**CLOSE_WAIT**状态。
- 服务端发送一个FIN报文，用来关闭数据传送，并且进入**LAST_ACK**状态。
- 主机收到FIN后，进入TIME_WAIT状态，接着发送一个ACK给服务端，确保服务端收到自己的ACK报文后进入**CLOSED**状态