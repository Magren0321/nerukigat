---
title: Android自定义view的定义
tags: ["Android"]
date: 14 Apr 2020
---

> 自定义 View 就是通过继承 View 或者 View 的子类，并在新的类里面实现相应的处理逻辑（重写相应的方法），以达到自己想要的效果。

<!--more-->

## 分类

- 自定义ViewGroup：自定义ViewGroup一般是利用现有的组件根据特定的布局方式来组成新的组件，大多继承自ViewGroup或各种Layout，包含有子View。
- 自定义view: 在没有现成的View，需要自己实现的时候，就使用自定义View，一般继承自View，SurfaceView或其他的View，不包含子View。

## 构造函数

无论是我们继承系统View还是直接继承View，都需要对构造函数进行重写，构造函数有多个，至少要重写其中一个才行。

```java
public class TestView extends View {
    /**
     * 在java代码里new的时候会用到
     * @param context
     */
    public TestView(Context context) {
        super(context);
    }

    /**
     * 在xml布局文件中使用时自动调用
     * @param context
     */
    public TestView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
    }

    /**
     * 不会自动调用，如果有默认style时，在第二个构造函数中调用
     * @param context
     * @param attrs
     * @param defStyleAttr
     */
    public TestView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }


    /**
     * 只有在API版本>21时才会用到
     * 不会自动调用，如果有默认style时，在第二个构造函数中调用
     * @param context
     * @param attrs
     * @param defStyleAttr
     * @param defStyleRes
     */
    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public TestView(Context context, @Nullable AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
    }
}
```

## 绘制过程

- 测量
- 布局
- 绘制
- 提供接口

### 测量阶段

- View的父View通过调用View的measure()方法将父View对View尺寸要求传进来。
- View的measure()方法进行一些前置和优化工作
- 调用onMeasure()方法，在方法中根据业务需求进行相应的逻辑处理。在自定义 ViewGroup 的 onMeasure() 方法中，ViewGroup 会递归调用子 View 的 measure() 方法，并通过 measure() 将 ViewGroup 对子 View 的尺寸要求 对自己的尺寸要求和自己的可用空间计算出自己对子 View 的尺寸要求）传入，对子 View 进行测量，并把测量结果临时保存，以便在布局阶段使用。ViewGroup 会根据子 View 的实际尺寸计算出自己的期望尺寸，并通过 setMeasuredDimension() 方法告知父 View（ViewGroup 的父 View） 自己的期望尺寸。
- 方法里调用**setMeasuredDimension()**方法告知父View自己的期望尺寸

onMeasure()计算View的期望尺寸的方法：

- 参考父 View 的对 View 的尺寸要求和实际业务需求计算出 View 的期望尺寸：
  - 解析 widthMeasureSpec；
  - 解析 heightMeasureSpec；
  - 将「根据实际业务需求计算出 View 的尺寸」根据「父 View 的对 View 的尺寸要求」进行相应的修正得出 View 的期望尺寸（通过调用 resolveSize() 方法)
- 通过 setMeasuredDimension() 保存 View 的期望尺寸（实际上是通过 setMeasuredDimension() 告知父 View 自己的期望尺寸

**onMeasure() ：**

```java
@Override
protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
    int widthsize  MeasureSpec.getSize(widthMeasureSpec);      //取出宽度的确切数值
    int widthmode  MeasureSpec.getMode(widthMeasureSpec);      //取出宽度的测量模式

    int heightsize  MeasureSpec.getSize(heightMeasureSpec);    //取出高度的确切数值
    int heightmode  MeasureSpec.getMode(heightMeasureSpec);    //取出高度的测量模式
}
```

widthMeasureSpec 和 heightMeasureSpec 这两个 int 类型的参数其实不是宽和高， 而是由宽、高和各自方向上对应的测量模式来合成的一个值

### 布局阶段

1. 父View通过调用View的Layout方法将View的实际尺寸传给View
2. View在Layout方法中调用setFramne()方法保存
3. setFrame()方法中又会调用onSizeChanged()方法告知开发者View的尺寸修改了
4. View的Layout()方法调用View的onLayout()方法，它是一个空实现。但是在ViewGroup中，这里会调用子View的Layout()方法，将子View的实际尺寸传给他们，让子View保存实际尺寸。**在自定义ViewGroup中需要重写该方法。**

### 绘制阶段

- draw() ，总调度方法，会调用绘制背景的方法，绘制主题的方法，绘制前景的方法和绘制子View的方法
- onDraw() ，绘制View主体内容的方法
- dispatchDraw()，绘制子View的方法，在自定义ViewGroup中会调用ViewGroup.drawChild()方法，这个方法会调用每个子View的View.draw()
- drawBackground()，绘制背景的方法，不可重写，只能通过xml布局文件或者setBackground()方法来设置背景。
- onDrawForegound()，绘制View前景的方法，绘制主体内容之上的东西的时候在该方法中实现。

### 提供接口

写一些控制View或者监听View某些状态。
