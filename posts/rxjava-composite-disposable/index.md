---
title: Rxjava的CompositeDisposable
tags: ["Android"]
date: "29 Mar 2020"
---

之前在学习Rxjava的时候发现仍有部分知识点自己遗漏了，不够严谨，在这里补充多一个知识点。那就是CompositeDisposable类。

<!-- more -->

在用Rxjava配合Retorfit的时候，发送请求，拿到数据后我们要让数据显示在视图中的时候往往会刷新页面，但假如，我们发送请求出去的时候网络比较差，返回数据比较慢，然后我们又手快的关闭了当前这个Activity，那RxJava当拿到返回的数据的时候去刷新界面就会报空指针异常了。就是说，请求过程中，我们的UI层Destroy的时候，不及时取消订阅，就会造成内存泄漏。这里就要用到我们的**CompositeDisposable**。

## 使用

使用的方法大致就是三步：

- ui层创建的时候，实例化我们的CompositeDisposable类。
- 把订阅返回的disposable对象加入到我们的管理器中。
- ui层销毁的时候清空订阅对象。

### 创建ui的时候实例化

```java
@Override
   public void onStart() {
       if (mSubscriptions == null) {
           mSubscriptions = new CompositeDisposable();
       }
   }
```

### 添加disposable对象

```java
netWork.getInstance().getDataService()
                .translateYouDao(q,from,to,appID,salt,sign,signType,curtime)
                .subscribeOn(Schedulers.newThread())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(new Observer<TranslationBean>() {
                    @Override
                    public void onSubscribe(Disposable d) {
                        mSubscriptions.add(d);   //这里添加到容器中
                    }

                    @Override
                    public void onNext(TranslationBean translationBean) {
                        List<TranslationBean> list_word = new ArrayList<>();
                        list_word.add(translationBean);
                        mView.showResult(list_word);
                    }

                    @Override
                    public void onError(Throwable e) {
                        mView.showConnection();
                    }

                    @Override
                    public void onComplete() {

                    }
                });
```

### ui层销毁时候解除订阅

```java
@Override
    public void onDestroy() {
        if (mSubscriptions != null) {
            mSubscriptions.dispose();
            mSubscriptions.clear();
            mSubscriptions = null;
        }
    }
```

## 总结

一些细节上的地方自己没能发现，还是得多看看别人代码，遇到不知道用来干嘛的类说不定就是自己忽略掉的地方。
