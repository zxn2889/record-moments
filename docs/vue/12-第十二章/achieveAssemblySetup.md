---
title: 2-实现 setup
---

朋友们，上节我们学习了组件的挂载与更新情况，这节我们学习组件 setup 的实现。

我们知道，setup 是组合式 API 调用，接收两个参数，返回值有两种类型。那要如何去实现？先说返回值，如果其返回值为函数，则我们认为该函数就是要渲染的模板内容，则 render 函数不再起作用；如果是对象，则返回的是 data 数据，可以通过 this 访问。实现如下：

```js
function mountComponent(n2, container, anchor) {
    // 省略
    const { setup } = component
    
    let renderResult = render
    if (setup) {
        const setupResult = setup()
        if (typeof setupResult === 'function') {
            renderResult = setupResult
        }
    }

    // 省略
    
    effect(() => {
        const subTree = renderResult.call(renderContext)
        // 省略
    })
}
```

通过这种方式，在执行挂载组件前，先判断当前 setup 的函数是否存在，再判断其函数返回结果是否为函数，如果是则进行渲染函数的指向改变，这样就完成了有 setup 就以 setup 为准的渲染逻辑。this 的指向实现如下：

```js
function mountComponent(n2, container, anchor) {
    // 省略
    
    let renderResult = render
    let setupState
    if (setup) {
        const setupResult = setup()
        if (typeof setupResult === 'function') {
            renderResult = setupResult
        } else {
            setupState = setupResult
        }
    }

    const renderContext = new Proxy(instance, {
        get(t, k) {
            const { state, props, setup } = t
            if (state && k in state) {
                // 省略
            } else if (props && k in props) {
                // 省略
            } else if (setupState && k in setupState) {
                return setupState[k]
            } else {
                // 省略
            }
        },
        set(t, k, v) {
            const { state, props } = t
            if (state && k in state) {
                // 省略
            } else if (props && k in props) {
                // 省略
            } else if (setupState && k in setupState) {
                setupState[k] = v
            } else {
                // 省略
            }
        }
    })

    // 省略
}
```

这样通过将 setup 返回的状态数据添加到代理中，就可以通过 this 来具体的访问或者修改其状态数据了。那 setup 的参数要如何实现？我们知道，setup 接收两个参数，一个是传入的 props，一个是 setup 的上下文对象，即 attr、emit 这些。实现如下：

```js
function mountComponent(n2, container, anchor) {
    // 省略
    const [props, attr] = resolveProps(propsOption, n2.props)
    
    let renderResult = render
    let setupState
    if (setup) {
        const setupResult = setup(shallowReadOnly(instance.props), { attr })
        if (typeof setupResult === 'function') {
            renderResult = setupResult
        } else {
            setupState = setupResult
        }
    }

    // 省略
}
```

::: tip 注意
这里有几点需要注意：

1. 关于实例的代理 renderContext 也可以称为是上下文对象，因为其改变了 this 的指向，使其可以访问和修改具体的想要暴露出去的数据或方法等。
2. setup 的 props 参数为经过处理后的合法的 props 对象
3. 子组件是不能修改 props 的值的，只能通过父组件修改，所以这里是只读式代理
:::

完整代码如下：

::: details 详细代码
<<< ../source/v.0.0.16/02.index.js
:::

至这里，我们已经学习了 setup 的内部实现原理，知晓了其参数的由来，也了解了其返回值为函数或者对象时的不同处理方式，也明白了为什么可以通过 this 访问到组件内部的状态、方法等，也知晓了组件上下文的含义。揭开了 setup 的神秘面纱。