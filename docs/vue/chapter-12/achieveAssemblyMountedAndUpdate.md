---
prev:
    text: 快速 diff
    link: /vue/chapter-11/quickDiff.md
---

朋友们，上节我们学习了快速 diff 算法，这节我们来学习组件的实现。之前我们提到过，组件是一个对象，那它为什么是一个对象，以及它的内部结构是怎样的，实现了什么功能，这就是本节要学习的内容。

我们知晓，在实现一个复杂功能的时候，往往会对功能进行拆分，拆分的功能模块我们就称为组件。而每个模块的功能都是完善的，比如它自身的数据、方法、生命周期等，而这样的结构就注定了它是一个对象。如下面这段代码：

```js
<template>
    <div>我是一段文本内容，我的文本长度为 { count }</div>
</template>
```

我们拆分完成后，它就是一个单独的组件，那如何用对象表示，如下：

```js
const MyComponent = {
    data() {
        return {
            count: 1
        }
    },
    render() {
        return {
            type: 'div',
            children: `我是小黑，我今年 ${this.count} 岁了`
        }
    }
}
```

分析当前组件的内容来看，```data``` 存储的就是我们组件本身定义的状态集，而 ```render``` 就是当前的模板，且通过 ```this``` 读取了当前的状态集里的数据。

::: tip 注意
```render``` 是一定要有的，且内容一定是 vnode 的结构，因为作为要呈现的内容来讲，我们就是通过渲染它来实现虚拟 DOM 转为真实 DOM 的。而渲染叫 ```render```，渲染内容是 vnode，这就是它结构的来由。
:::

那组件作为复杂功能的一部分，我们最终是要把它呈现到页面上，而前面我们讲了渲染器，讲了虚拟节点，讲了虚拟节点中组件的类型是个对象。那现在定义好了组件的对象，那如何去实现呢？如：

```js
<template>
    <MyComponent/>
</template>
```

它也是一个组件，只不过内容只有一个，就是我们刚封装的 ```MyComponent```，组件，那它的 vnode 如下：

```js
const vnode = {
    type: MyComponent
}
```

那么，作为一个虚拟节点，且类型为自定义的组件，那如何去实现挂载或更新？就如同我们之前定义的几种 vnode 类型一样，修改后如下：

```js
function patch(n1, n2, container, anchor) {
    if (typeof type === 'string') {
        // 省略
    } else if (type === Text) {
        // 省略
    } else if (type === Fragment) {
        // 省略
    } else if (typeof type === 'object') {
        if (!n1) {
            // 挂载组件
            mountComponent(n2, container, anchor)
        } else {
            // 更新组件
            patchComponent(n1, n2, container, anchor)
        }
    } else {
        // 挂载与更新
    }
}
```

和其他的逻辑一样，不存在旧节点时直接挂载，存在时更新。那如何挂载呢，如下：

```js
// 挂载组件
function mountComponent(n2, container, anchor) {
    const component = n2.type
    const { data, render } = component
    const subTree = render.call(data())
    patch(null, subTree, container, anchor)
}
```

从代码中我们发现，我们将组件定义的选项内容给解构了出来，然后让解构的 ```data``` 进行了调用执行，并将结果作为了参数传给了 ```render```，然后将结果作为新增的虚拟节点参数传给了 ```patch```，这样就实现了页面的呈现。

::: tip 注意
这里我们要注意到，新节点的内容不再是 n2 了，而是 n2 解析出来的组件对象的渲染函数的执行结果。
:::

那实现了这些就实现了组件的基本挂载，但是如果组件本身的状态发生了变更呢，这个时候就需要通过响应化处理，然后将其作为副作用传入进去，进而实现页面的更新。如下：

```js
function mountComponent(n2, container, anchor) {
    const component = n2.type
    const { data, render } = component
    const state = reactive(data())
    effect(() => {
        const subTree = render.call(state)
        patch(null, subTree, container, anchor)
    })
}
```

这样，当组件的状态发生变化后，组件本身就拥有了自身的自更新。但是这样也存在了问题，就是每次更新时旧节点都为空，所以每次都是挂载。解决如下：

```js
function mountComponent(n2, container, anchor) {
    const component = n2.type
    const { data, render } = component
    const state = reactive(data())
    const instance = {
        state,
        subTree: null,
        isMounted: false
    }
    
    effect(() => {
        const subTree = render.call(state)
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

由代码可知，在组件的内部，我们定义了一个变量，用于存储当前组件的状态、是否挂载、和 vnode。通过在每次触发前判断是否已经更新，来判断是挂载还是更新。通过这种方式，我们就可以进一步的明白，在挂载和更新前后可以有什么操作，及它们分别对应什么生命周期。如：

```js
function mountComponent(n2, container, anchor) {
    const component = n2.type
    const { data, render, beforeCreate, created, beforeMounte, mounted, beforeUpdate, updated } = component

    // 调用 beforeCreate 生命周期
    beforeCreate && beforeCreate.call()
    
    const state = reactive(data())
    const instance = {
        state,
        subTree: null,
        isMounted: false
    }

    // 调用 created 生命周期
    created && created.call(state)
    
    effect(() => {
        const subTree = render.call(state)
        if (!instance.isMounted) {
            // 调用 beforeMount 生命周期
            beforeMounte && beforeMounte.call(state)
        
            patch(null, subTree, container, anchor)
            instance.isMounted = true

            // 调用 mounted 生命周期
            mounted && mounted.call(state)
        } else {
            // 调用 beforeUpdate 生命周期
            beforeUpdate && beforeUpdate.call(state)
            patch(instance.subTree, subTree, container, anchor)
            
            // 调用 update 生命周期
            updated && updated.call(state)
        }
        instance.subTree = subTree
    })
}
```

这样我们就知道组件的不同的生命周期分别是在哪个步骤执行的了，也知道为什么在不同的生命周期里我们通过 ```this``` 就可以访问到 ```data``` 里的变量了。

但是，作为组件，它跟它的父级是有一定交互的，这个交互是通过 props 实现的，那我们要如何处理。如下：

```js
function mountComponent(n2, container, anchor) {
    const component = n2.type
    const { data, props, render, beforeCreate, created, beforeMounte, mounted, beforeUpdate, updated } = component
    const { props: nProps } = n2
    const nPropKeys = Object.keys(nProps)

    // 省略

    nPropKeys.forEach(key => {
        // 将父组件中传入的，且子组件中有的 prop 属性进行赋值
        if (key in props) {
            props[key] = nProps[key]
        } else {
            console.warn('当前定义的属性在组件内没有定义')
        }
    })

    // 省略
}
```

::: tip 注意
我们要分清楚两个 props 的不同含义：

1. 组件自定义的 props
2. 父组件传递给子组件的属性

前者是定义在组件的内部，即——```n2.type``` 指向的组件；后者是父组件传递给它的内容，这个是放在父组件的虚拟节点的 props 上的，即——跟 ```type``` 并列的 ```props``` 属性。
:::

通过这种方式，我们就知道了哪些属性是组件内部定义好的，哪些是父组件传入的，那对应的它们的处理方式也就知道了。即，定义的要怎么处理，未定义的要怎么处理，修改如下：

```js
function mountComponent(n2, container, anchor) {
    const component = n2.type
    const { data, props: propsOption, render, beforeCreate, created, beforeMounte, mounted, beforeUpdate, updated } = component

    const [props] = resolveProps(propsOption, n2.props)

    // 省略
}

// 筛选父子组件之间定义的合法属性
function resolveProps(propsOption, nProps) {
    const props = {}
    const attr = {}
    const nPropKeys = Object.keys(nProps)
    nPropKeys.forEach(key => {
        if (key in propsOption) {
            props[key] = nProps[key]
        } else {
            console.warn('当前定义的属性在组件内没有定义，存放至 attr')
            // Vue3 中未定义的属性统一存放至 attr 内
            attr[key] = nProps[key]
        }
    })

    return [props, attr]
}
```

这样，我们就知晓了 attr 是怎么来的，以及什么是有效的 props 属性。明白了这些，还要明白两个组件之间的状态的区别，即父组件的状态和子组件的状态，它们本身是不在一个状态集里的，但是，父组件的状态的更新可能会响应子组件的更新。即，父组件的虚拟节点更新的时候，内部还包含着子组件，那子组件要不要更新。这就涉及到新旧节点的比较了，不再是子组件内部的更新，所以要走```patchComponent```，也间接表明了为什么在挂载组件的时候还要写个 effect——这个 effect 是监听组件自身的状态变化的更新的。修改如下：

```js
function mountComponent(n2, container, anchor) {
    // 省略
    
    const state = reactive(data())
    const instance = {
        state,
        props: shallowReactive(props),
        subTree: null,
        isMounted: false
    }
    n2._component = instance

    // 省略
}
```

之前我们为了记录组件是否已经挂载而定义了 ```instance``` 对象，这个对象就相当于是组件的实例，存储了它的必要信息，现在我们通过将实例挂载到虚拟节点的 ```_component``` 属性上。这样，在比较时，就可以通过旧节点的 ```_component``` 属性，取到之前的组件实例了。

::: tip 注意
这里要明白几个概念：
1. 实例就是一组状态集，或者快照，存储着当前对象上的所有需要记录的信息。
2. props 本身是取的父组件的状态，所以这里不做深响应式，但因为还需要新旧组件的对比更新，所以做浅响应式处理
3. 父组件引起的子组件的更新叫被动更新
4. 被动更新是不需要考虑组件本身的状态集的，只需要更新传入的 prop、slot 等
:::

修改代码如下：

```js
// 更新组件
function patchComponent(n1, n2, container, anchor) {
    const instance = n2._component = n1._component
    const { props } = instance
    if (hasUpdateProps(n1.props, n2.props)) {
        // 这里要先比较得出最新的合法的 props
        const [nextProps] = resolveProps(n2.type.props, n2.type)

        // 通过新旧合法的 props 比较，更新旧节点组件对应的 props
        Object.keys(props).forEach(key => {
            if (key in nextProps) {
                props[key] = nextProps[key]
            } else {
                delete props[key]
            }
        })
    }
}

// 比较新旧父组件的 props 是否有更新
function hasUpdateProps(oProps, nProps) {
    const oPropsLen = Object.keys(oProps)
    const nPropsLen = Object.keys(nProps)
    if (oPropsLen !== nPropsLen) {
        return true
    }
    for (let i = 0; i < oPropsLen; i++) {
        const oPropVal = oProps[i];
        const nPropVal = nProps[i]
        if (oPropVal !== nPropVal) {
            return true
        }
    }
    return false
}
```

要注意的是，比较前一定要先比较父组件传入的 props 有没有变化，如果有变化，再比较和子组件之间的合法的 props 有无变更，进而去更新旧组件对应的 props，进而实现 props 的更新。

但同时也要注意一个问题，那就是目前我们对 props、state 的数据都是访问而没有设置的，而设置是用户的操作与数据的一个交互，且 props 的数据的访问应该要先从 state 开始，没有再取 props。且目前所有的操作都没有判断是否合法，所以，我们还要一个代理，对读取和设置统一进行拦截操作。如下：

```js
function mountComponent(n2, container, anchor) {
    // 省略

    const renderContext = new Proxy(instance, {
        get(t, k) {
            const { state, props } = t
            if (state && k in state) {
                return state[k]
            } else if (props && k in props) {
                return props[k]
            } else {
                console.warn('当前组件不存在该属性');
                return null
            }
        },
        set(t, k, v) {
            const { state, props } = t
            if (state && k in state) {
                state[k] = v
            } else if (props && k in props) {
                props[k] = v
            } else {
                console.warn('当前组件不存在该属性');
                return false
            }
        }
    })

    // 调用 created 生命周期
    created && created.call(renderContext)
    
    // 省略
}
```

这样我们就可以通过 ```this```，既可以访问 ```state```，又可以访问 ```props```，这就是代理拦截的一个优势，当然，类似的方法、计算属性、事件等也可以这样处理。完整代码如下：

::: details 详细代码
@[code](../source/v.0.0.16/index.js)
:::

至这里，我们已经了解了组件的结构、组件的实例、组件的挂载与更新的判断、及组件的生命周期执行时机和统一的拦截操作、与组件的被动更新的判断等。了解了当虚拟节点的类型是组件的处理，以及被动更新时先判断新旧节点中父组件的 props 是否变化、再解析最新的合法 props 对象、再进行更新的过程，也知晓了为什么在挂载时要定义插件组件的实例，并将其与当前的虚拟节点进行绑定，以及为什么要对合法的 props 做浅响应处理。揭开了组件的一角神秘面纱。