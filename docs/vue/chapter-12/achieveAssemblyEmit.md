---
prev:
    text: 实现 setup
    link: /vue/chapter-12/achieveAssemblySetup.md
---

朋友们，上节我们学习了 setup 内部的实现方法，这节我们学习 emit 的实现原理。

我们知道，emit 的实现步骤有两个：

1. 子组件中 emit('eventName', [可选的参数...])
2. 父组件中 @eventName='xxx'

那在解析为 vnode 时候，父组件的这段逻辑就会解析为 props 中的属性，而子组件的 emit 则是在子组件的组件选项内容里等着被执行。但是前文提过，所有在子组件中未声明的属性都会被存放至 attr 里，vue 的设计中并没有说每个事件也都要声明一下，所以，如果组件中的属性有的是事件的话，则需要特殊处理——默认其为合法的 props。如下：

```js
function resolveProps(propsOption, nProps) {
    const props = {}
    const attr = {}
    const nPropKeys = Object.keys(nProps)
    nPropKeys.forEach(key => {
        // 新增
        if (key in propsOption || `/^on/`.text(key)) {
            props[key] = nProps[key]
        } else {
            console.warn('当前定义的属性在组件内没有定义，存放至 attr')
            attr[key] = nProps[key]
        }
    })

    return [props, attr]
}
```

那要如何实现子组件的 emit 呢？上面我们说 emit 的实现步骤中提到过。分析发现，emit 的结构是固定的，第一个为事件名，第二个为可选择的要传递的参数。所以 emit 的结构为函数。当执行到 emit 的时候，就执行 emit 里面的逻辑，即执行传入的函数，又因为其已经在合法的 props 里了，所以能够拿到，实现如下：

```js
function mountComponent(n2, container, anchor) {
    // 省略
    if (setup) {
        const setupContext = {
            attr,
            emit: (e, ...args) => emit(e, args, instance.props)
        }
        const setupResult = setup(shallowReadOnly(instance.props), setupContext)
        if (typeof setupResult === 'function') {
            renderResult = setupResult
        } else {
            setupState = setupResult
        }
    }

    // 省略
}

function emit(eventName, args, props) {
    if (eventName in props) {
        props[eventName](args)
    } else {
        console.warn(`当前事件未定义，请查看事件名称 ${eventName} 是否正确`);
    }
}
```

这样就实现了 emit 的逻辑，这里要注意 emit 是要放入 setup 的上下文环境的，所以将其放入到了 setupContext 中，但是还需优化，因为在触发 emit 的时候，是不需要添加 on 前缀的，所以还需特定处理。如下：

```js
function emit(eventName, args, props) {
    const fnName = `on${eventName[0].toUpperCase()}${eventName.slice(1)}`
    if (fnName in props) {
        props[fnName](args)
    } else {
        console.warn(`当前事件未定义，请查看事件名称 ${fnName} 是否正确`);
    }
}
```

完整代码如下：

::: details 代码详情
@[code](../source/v.0.0.16/03.index.js)
:::

至这里，我们实现了 emit 的逻辑，了解了其内部为什么在调用时能够触发的逻辑，也明白了在设计 vnode 结构的时候，props 属性与 type 指向的组件选项内容对象有多么强大的联系——它完全把组件间相互包裹的关系给联系起来了。这里的表现则是通过合法的 props 拿到了父组件定义在子组件上的事件属性，而子组件本身又有 emit 的抛出，这就给联系了起来。揭开了 emit 的神秘面纱。