---
title: Vue下的EventBus
tags: ["前端", "Vue"]
date: "12 Oct 2020"
---

EventBus是用于Vue中组件通信的一种方式，常见的父子组件沟通方式有emit和props。
但假如跨组件传参沟通，或者是兄弟姐妹组件之间的传参沟通，使用**EventBus**或者**Vuex**就可以避免很多重复的props和emit。
Vuex适合的场景是中大型的项目，管理全站共用的状态。EventBus比较适用于小型的项目，不是太复杂的事件。

<!-- more -->

## 使用

EventBus实际上只是一个Vue的实例，接着分别调用这个实例的事件触发和监听来实现通信和参数传递。主要是下面四种方法：

- **$on**：注册监听
- **$once**：监听一次
- **$off**：取消监听
- **$emit**：发送事件

一般页面created的時候就注册监听，当组件销毁时取消监听。

### 创建一个EventBus

其实就是创建一个Vue的实例

```js
import Vue from "vue";

// 使用 Event Bus
const bus = new Vue();

export default bus;
```

在我们需要发送事件以及接收事件的组件中引入。

```js
import bus from "../common/bus";
```

### 监听

在需要监听的组件中的created中使用bus监听

```js
created() {
    bus.$on('getSomething', target => {
        console.log(target);
    });
}
```

### 发送事件

```js
methods: {
    // 把事件 emit 出去
    doSomething(target) {
      bus.$emit("getSomething", target);
    }
}
```

#### 取消监听

EventBus的监听不会自动关闭，接着会导致的一个情况就是监听会触发多次，所以需要我们用$off取消下绑定。
通常绑定在钩子函数 **beforeDestroy()** 或者 **destroyed()** 中

```js
// 移除事件的监听
bus.$off("getSomething");

// 移除所有事件的监听
bus.$off();
```
