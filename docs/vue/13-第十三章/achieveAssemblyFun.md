---
title: 函数式组件

---

朋友们，上节我们学习了如何实现一个生命周期，这节我们学习如何实现函数式组件。

在学习之前，我们先学习什么是函数式组件？函数式组件，顾名思义，通过函数实现的组件，它本身没有状态，直接返回的 vnode 虚拟节点。如下：

```js
function MyFunComponent(props) {
    return { type: 'div', children: props.context }
}
```

如上所示，函数式组件虽然没有自己的状态，但是也可以访问具体的变量的——通过将具体的变量做参数传入的形式。但是，这就牵扯到一个问题，用到函数式组件的地方那么多，怎么就知道哪个变量要和哪个函数式组件绑定到一起呢？

这就涉及到函数本身也是一个对象的内容了，我们直接可以将它需要的变量通过链式调用，直接绑定到该组件上就好了，如下：

```js
function MyFunComponent(props) {
    return { type: 'div', children: props.context }
}
MyFunComponent.options = {
    context: '我是一段文本内容'
}
```

就跟有状态的组件一样，它本身是作为 ```vnode.type``` 的值去执行对应的逻辑的，所以，如果一个虚拟节点是组件的判断还需要优化，如下：

```js
function patch(n1, n2, container, anchor) {
    // 省略
    
    // 新增
    else if (typeof type === 'object' || typeof type === 'function') {
        // 省略
    }

    // 省略
}
```

::: tip 注意
这里要区分两个概念：

1. 有状态组件：组件本身是对象，组件内部维护的有自身的状态
2. 无状态组件：函数式组件，本身没有要维护的状态
:::

了解了上面的代码结构，及什么是无状态组件，那么在实现有状态组件的基础上优化一下即可实现无状态组件。即，不需要再进行状态响应化，不需要再有生命周期等，如下：

```js
function patch(n1, n2, container, anchor) {
    // 省略
    
    // 新增
    else if (typeof type === 'object') {
        // 省略
    }
    else if (typeof type === 'function') {
        if (!n1) {
            // 挂载组件
            mountFunComponent(n2, container, anchor)
        }
    }

    // 省略
}

// 挂载无状态组件
function mountFunComponent(n2, container, anchor) {
    const render = n2.type
    const props = n2.type.options
    const instance = {
        props: shallowReactive(props),
        subTree: null,
        isMounted: false
    }
    n2._component = instance
    effect(() => {
        const subTree = render.call(props)
        if (!instance.isMounted) {
            patch(null, subTree, container, anchor)
            instance.isMounted = true
        } else {
            patch(instance.subTree, subTree, container, anchor)
        }
        instance.subTree = subTree
    })
}
```

完整代码如下：

::: details 详细代码
<<< ../source/v.0.0.17/index.js
:::

至这里，我们已经学习了如何实现一个函数式组件，知晓了其内部的结构，以及如何访问具体的变量。揭开了一角神秘面纱。