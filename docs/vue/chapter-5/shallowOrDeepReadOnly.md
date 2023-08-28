---
prev:
    text: 浅响应与深响应
    link: /vue/chapter-5/shallowOrDeepResponse.md
next:
    text: 数组的代理
    link: /vue/chapter-5/achieveArrayProxy.md
---

朋友们，上节我们学习了如何实现深响应和浅响应，这节我们学习如何实现只读和浅只读。

在此之前，先优化了代码，如下：

:::: code-group
::: code-group-item proxy.js
@[code](../source/v.0.0.3/proxy.js)
:::

::: code-group-item effect.js
@[code](../source/v.0.0.3/effect.js)
:::
::::

首先，我们分析一下需求——只读。那只读的目的是什么？只读不改。好，那所有的增删改查动作都要进行判断，并且不需要再进行更新和追踪依赖操作。但是，我们要让用户有感知，知道目前的操作是不合规的，所以要进行提示。代码如下：

:::: code-group
::: code-group-item index.js
@[code](../source/v.0.0.4/index.js)
:::

::: code-group-item proxy.js
@[code](../source/v.0.0.4/proxy.js)
:::
::::

![图片](/img/32.png)

从结果上得知，想要的效果也都实现了。

::: tip
注意这里将 isShallow 的默认值改为了 false，所以逻辑上有对应的变更。另外，也可以通过控制 return 返回的布尔值类型控制飘红提示。
:::