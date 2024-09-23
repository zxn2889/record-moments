---
prev:
    text: 实现 slots
    link: /vue/chapter-12/achieveAssemblySlots.md
next:
    text: 函数式组件
    link: /vue/chapter-13/achieveAssemblyFun.md
---

朋友们，上节我们学习了如何实现插槽，这节我们学习如何实现生命周期。

我们以 setup 内实现 onMounted 为例。我们知道，在 setup 内可以调用 onMounted 多次，且不经过 this 访问。所以我们知道以下几件事：

1. onMounted 在执行时可以执行多次
2. renderContext 上下文中不需要进行操作拦截
3. 组件选项内部要有一个存储 onMounted 多次调用的地方

从分析得知，需要对当前的实例进行修改，如下：

```js
function mountComponent(n2, container, anchor) {
    // 省略
    const instance = {
        state,
        props: shallowReactive(props),
        subTree: null,
        isMounted: false,

        // 新增
        mounted: []
    }
    
    // 省略
    effect(() => {
        const subTree = renderResult.call(renderContext)
        if (!instance.isMounted) {
            // 省略

            // 调用 mounted 生命周期
            instance.mounted && instance.mounted.forEach(fn => fn(renderContext))
        }
    })

    // 省略
}
```

从代码上的分析结果得知，我们已经有了存储多个 onMounted 的容器，以及在合适的时机执行的逻辑。现在的问题是怎样将要执行的生命周期存储起来。

::: tip 注意
因为组件实例是存储组件内各种状态的地方，所以存储生命周期的容器也放在了这里。
:::

我们知道，onMounted 生命周期是在 setup 内部执行的。但是要明白一个道理，组件选项内的内容，如 setup，它只是在组件内部定义了要执行的逻辑，而真正的触发它执行的时机是在组件挂载时调用的，即 ```const setupResult = setup(shallowReadOnly(instance.props), setupContext)```，而只有它真正的被调用执行了，代码逻辑才会进入到 setup 内部，进而读取 setup 内部定义好的逻辑。即，这个时候才会读取到 onMounted 生命周期。

但是又存在一个问题，onMounted 钩子函数我们并不能通过上下文抛出去，这也不符合先存储，再集中遍历的逻辑。但是它又是我们定义好的特定的生命周期函数之一，读取到它的时候我们需要将它要执行的逻辑存储起来。所以，这就需要解决两个问题：

1. onMounted 需要导出出去
2. onMounted 内要有将执行的函数存储起来的能力

导出简单，但存储如何做呢？我们知道前面在实例内定义了一个存储容器，那现在的问题是如何将其关联起来。这就需要定义一个全局变量，将该全局变量在 setup 执行前指向当前组件的实例，在 setup 执行后指向 null，如下：

```js
let currentInstance = null

function setInstance(instance) {
    currentInstance = instance
}

function mountComponent(n2, container, anchor) {
    // 省略

    setInstance(instance)
    const setupResult = setup(shallowReadOnly(instance.props), setupContext)
    setInstance(null)

    // 省略
}

function onMounted(fn) {
    if (currentInstance) {
        currentInstance.mounted.push(fn)
    }
}
```

这样就实现了如何定义一个生命周期钩子，以及如何将其与当前实例进行关联，如何在合适的时机再执行它的逻辑了。最后，只需要我们将相关的生命周期函数 export 就好。

完整代码如下：

::: details 详细代码
<<< ../source/v.0.0.16/05.index.js
:::

至这里，我们已经学习了如何去实现一个 onMounted 生命周期，进而也了解如何去定义其他的生命周期，知晓了定义生命周期的关键逻辑就是如何与当前的实例做关联，以及在合适的时机执行的逻辑。揭开了生命周期的神秘的一角面纱。