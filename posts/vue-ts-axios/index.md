---
title: Vue Typescript下axios的封装和使用
tags: ["前端", "Vue", "Typescript"]
date: 12 Aug 2020
---

8月到了，一个莫名其妙的机遇也砸到了脸上，提着行李一个人跑到了广州跟一个毕业的师兄搞创业的项目，怀着点点的不安以及兴奋，迈出离开学校的第一步。

由于就住在办公室的一间房里，出门即工作，开始了朝五晚九的工作生活，晚上的时候就折腾自己的项目，有点梦回星空时候夏训营的感觉，很累也充实。每天也在掉头发以及烦恼吃什么

自己写的华广地图给自家eo发了一份玩，结果给征收了，上线成了星空的产品，并且要求再进行完善 😟
想了下干脆给每个地点的marker添加一个点击事件，点击后可以看到该地点的详细介绍，不过每个地方都要图片，放在本地太大了，可能会造成卡顿，遂决定放在服务器上，于是重新看了一遍axios同时自己学着网上的一些教程做了一个封装，并解决了跨域的问题。

<!--more-->

## 封装axios

```js
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

const showStatus = (status: number) => {
  let message = ''
  switch (status) {
    case 400:
      message = '请求错误(400)'
      break
    case 401:
      message = '未授权，请重新登录(401)'
      break
    case 403:
      message = '拒绝访问(403)'
      break
    case 404:
      message = '请求出错(404)'
      break
    case 408:
      message = '请求超时(408)'
      break
    case 500:
      message = '服务器错误(500)'
      break
    case 501:
      message = '服务未实现(501)'
      break
    case 502:
      message = '网络错误(502)'
      break
    case 503:
      message = '服务不可用(503)'
      break
    case 504:
      message = '网络超时(504)'
      break
    case 505:
      message = 'HTTP版本不受支持(505)'
      break
    default:
      message = `连接出错(${status})!`
  }
  return `${message}`
}

const service = axios.create({
  // 联调
  baseURL: 'https://www.wanandroid.com',
  headers: {
    get: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    post: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  },
  // 是否跨站点访问控制请求
  withCredentials: true,
  timeout: 30000, //超时时间
  transformRequest: [(data) => {
    data = JSON.stringify(data)
    return data
  }],
  validateStatus () {
    // 使用async-await，处理reject情况较为繁琐，所以全部返回resolve，在业务代码中处理异常
    return true
  },
  transformResponse: [(data) => {
    if (typeof data === 'string' && data.startsWith('{')) {
      data = JSON.parse(data)
    }
    return data
  }]
})

// 请求拦截器
service.interceptors.request.use((config: AxiosRequestConfig) => {
    return config
}, (error) => {
    // 错误抛到业务代码
    error.data = {}
    error.data.msg = '服务器异常'
    return Promise.resolve(error)
})

// 响应拦截器
service.interceptors.response.use((response: AxiosResponse) => {
    const status = response.status
    let msg = ''
    if (status < 200 || status >= 300) {
        // 处理http错误，抛到业务代码
        msg = showStatus(status)
        if (typeof response.data === 'string') {
            response.data = {msg}
        } else {
            response.data.msg = msg
        }
    }
    return response
}, (error) => {
    // 错误抛到业务代码
    error.data = {}
    error.data.msg = '请求超时或服务器异常'
    return Promise.resolve(error)
})

export default service
```

## 使用

```js
@Component
export default class Home extends Vue{
  a = []
  getSomeThings(){
    return request({
        url: "/wxarticle/list/408/1/json",
        method:'get'
    }).then((response)=>{
      this.a = response.data.data.datas
      console.log(this.a)
    }).catch((error)=>{
      console.log(error)
    })
  }

 mounted(){
   this.getSomeThings()
 }
```

## 解决跨域问题

关于什么是跨域之前在ajax上已经了解过了，是由浏览器的同源策略造成的，是浏览器对js施加的安全措施。

### axios解决跨域的思路

> 我们可以配置一个代理的服务器可以请求另一个服务器中的数据，然后把请求出来的数据返回到我们的代理服务器中，代理服务器再返回数据给我们的客户端，这样我们就可以实现跨域访问数据。

#### 配置proxy

在我们的vue.config.js下配置以下内容

```js
module.exports = {
	devServer: {
		proxy: {
			"/api": {
				target: "https://www.wanandroid.com", // 你要请求的后端接口ip+port
				changeOrigin: true, // 允许跨域，在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题
				ws: true, // 开启webSocket
				pathRewrite: {
					"^/api": "", // 替换成target中的地址
				},
			},
		},
	},
};
```

#### 配置baseURL

在我们封装的axios文件里将baseURL更改为:’/api’

```js
const service = axios.create({
  baseURL: '/api',

  …………

})
```

所以上面两步操作是啥意思呢，其实就是：

> 我们请求/wxarticle/list/408/1/json，就相当于请求了：localhost:8080/api/wxarticle/list/408/1/json，
> 然后配置的proxy拦截了/api，并把/api以及前面的所有替换成了target的内容，
> 因此实际请求的url是https://www.wanandroid.com/wxarticle/list/408/1/json
> 即请求到了我们需要的接口了

## 最后

既然搞明白的差不多了，就上手吧，

> **_学校的图片呢？_**

> **_啊？没有啊_**

> **_摄影那一边呢？_** 😧

> **_他们……也只有一部分……_** 😧

> **_啊……这……_** 😩

**综上所述，项目目前搁浅中** 💢
