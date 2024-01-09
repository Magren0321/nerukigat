---
title: "博客迁移至Hugo"
date: 08 Jan 2021
draft: false
tags: ["日常"]
---

## 先说说为啥要迁移

在这之前用的是hexo + next主题，然后自己心血来潮加了网易云的外链还有live 2d，tag cloud这些东西，也有人说过挺好看的，但是自己看多了就觉得有点花里胡哨，而且当我在网上查阅东西进到别人博客的时候，看到的基本都是hexo + next……有点审美疲劳。

<!--more-->

但也很容易理解，hexo比较容易上手而且比较稳定，有着功能齐全并且成熟的主题（说的就是Next），这个时候我的眼光放到了hugo上。

Hugo 依靠Go语言进行开发，并且号称世界上最快的构建网站工具，究竟有多快我也不知道，但是我用hexo生成静态网页的时候还需要等，用hugo就没有等过，给我的感觉就是我敲完命令回车的那一刻他就好了……

另一方面就是hugo支持热加载，在文件修改的内容支持实时地显示在网页上，比起hexo需要点多下刷新来说，还是比较方便的。

hugo虽然有着上述说的优点，但是hugo在知名度上不及hexo，教程还有资料，以及优化配置这些方面在网上相比hexo来说都是比较少的，所以有些东西还得自己慢慢摸索。

## 搭建

### 环境

- [Git](https://git-scm.com/)
- 由于hugo依靠go语言，所以还得装[Go](https://golang.org/)
- 接着装[hugo](https://github.com/gohugoio/hugo/releases)

  hugo 解压完后只需要将其添加到环境变量中即可。

### 生成博客

hugo 安装完后可以用命令行运行 **hugo new site '博客名字'** ，这样hugo会生成一个用于存放博客的文件夹，里面一般有：

- archetypes/
- content/
- data/
- themes/
- layouts/
- static/
- config.toml

一般的配置信息写在 config.toml里面，文章以及一些页面在content里面，archetypes 里面一般放的是使用 hugo new 生成页面的时候头部配置信息格式。themes里面放的是你需要的主题。

### 主题安装

跟hexo不同，hugo没有自带的主题，所以这个时候运行hugo serve来浏览的时候是一片空白的，所以这个时候我们得去[hugo官网主题库](https://themes.gohugo.io/)里去找喜欢的主题。

同时按照主题给的文档在config.toml里面进行配置，一般下载下来的主题文件夹里有一个exampleSite的文件夹，那是作者的配置示例，如果不知道配置什么的话可以复制作者的示例，然后自行修改即可。

#### 生成博文

使用**hugo new posts/xxxx.md** 命令，可以使content/posts文件夹中生成你需要的 markdown 文件，用markdown语法编辑即可。

还有要注意的就是新生成的文件上方与hexo不同的是多了一条 draft属性，这是表示是否是草稿，假如是true的话该文件不会渲染成页面，更不会在博客中显示，删掉或者改成false便会渲染了。

添加tag和categories的方法跟hexo是一样的。

### 生成页面

特别的页面（archives页面等）可以使用 **hugo new page/xxx.md**生成，例如about页面就 **hugo new page/about.md**，生成后将draft删掉后添加一条layout属性，表明他是什么页面，about页面的话就**layout: about**。

### 浏览以及部署

浏览的话用**hugo serve**命令，然后地址为 http://localhost:1313/，与hexo略有不同。

执行**hugo**命令生成静态页面，然后博客的文件夹下会多了一个public文件夹，这个文件夹下就是最后生成的页面，将public文件夹中的文件push到仓库中就好了。

## 最后

从长远角度看的话，写的博文越多hugo的优势越明显。

但其实我只是想弄来玩玩而已。

Just for fun。
