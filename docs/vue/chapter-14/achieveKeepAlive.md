---
prev:
    text: 函数式组件
    link: /vue/chapter-13/achieveAssemblyFun.md
next:
    text: 实现 tokens
    link: /vue/chapter-15/achieveTokens.md
---

朋友们，上节我们学习了函数式组件的实现原理，这节我们学习 keep-alive。

我们知道，keep-alive 在 vue 的框架设计中，表示的是不需要频繁的去挂载和卸载的一种实现方式。主要用于满足一定条件就展示某个功能的场景。

在我们的目前实现的逻辑中，如果一段代码不用，则在对应的挂载和更新中会卸载相应的真实 DOM。这就和 keep-alive 要实现的功能相悖。所以，我们要实现一种，在 keep-alive 节点包裹下的组件或者一段代码不能被真正的卸载，在用到时再直接展示的逻辑。

这就涉及到一个问题，我们需要对渲染器内部的实现逻辑进行修改，但是修改谁呢？应该有一个怎样的判断条件？结合前文我们学习到的组件和插槽知识，发现，keep-alive 其实就是 vue 内部帮助用户设计好的一个包含着插槽的内部的组件，其包裹的所有内容都被认为是默认插槽上的具体内容。

::: tip 注意
keep-alive 是 vue 内部实现的组件，它包裹的内容就是默认插槽要实现的内容。
:::

有了上述描述，我们就知道渲染器实现这段代码的逻辑入口在哪里了，如下：

```js
function patch(n1, n2, container, anchor) {
    // 省略
    else if (typeof type === 'object' || typeof type === 'function') {
        if (!n1) {
            // 挂载组件
            mountComponent(n2, container, anchor)
        } else {
            // 更新组件
            patchComponent(n1, n2, container, anchor)
        }
    }
    // 省略
}
```

知道了上述入口，但是要如何实现 keep-alive 的假卸载与再挂载呢？那假卸载的逻辑是什么——不能真正的卸载，所以，卸载的逻辑 unmount 要做一定判断，即，如果判断当前要卸载 vnode 节点如果是 keep-alive 组件，不做真正的卸载。如下：

```js
function unmount(vnode) {
    // 省略
    // keep-alive 组件则假卸载
    else if (vnode.type === KeepAlive) {
        return
    }
    // 省略
}
```

那不卸载的情况下，下次如何去‘挂载’呢？首先我们分析得出：它不是真正的挂载，所以不需要再执行挂载前的一系列逻辑。这就要求我们要有一个容器，能够直接拿出首次挂载时存储好的节点等相关信息，然后直接去使用。所以，要如何才能创建一个这样的容器。

我们目前得到的有效信息是：

1. 我们需要创建一个容器，这个容器装填着‘伪卸载’和‘伪挂载’的节点信息
2. 容器和 keep-alive 是关联在一起的
3. keep-alive 是一个内部组件

结合有效信息发现，我们需要实现一个这样的内部组件，它就像一个基石，一切都绕不开它。但是作为内部的实现逻辑来讲，我们不可能写一个用户侧的 keep-alive 组件，我们要实现的是一个已经解析后的 keep-alive 内部组件结构。结合前面组件知识的相关学习，函数式组件不可取，所以采取有状态组件形式。有状态组件是个对象，如下：

```js
const KeepAlive = {
    _isKeepAlive: true,
    setup() {
    }
}
```

从上面的结构得出，这就符合了 keep-alive 是一个组件的定义，但是如何判断出它是有状态组件中的一种特定组件？所以还需要有个标识，即 ```_isKeepAlive: true```。通过这种方式，我们对应的 patch 和 unmount 对应逻辑也要进行修改，如下：

```js
function patch(n1, n2, container, anchor) {
    // 省略
    else if (typeof type === 'object') {
        if (!n1) {
            // 挂载组件
            mountComponent(n2, container, anchor)
        } else {
            // 更新组件
            patchComponent(n1, n2, container, anchor)
        }
    }
    else if (typeof type === 'function') {
        // ...
    }
    // 省略
}

function unmount(vnode) {
    // 省略
    // keep-alive 组件则假卸载
    else if (vnode.type._isKeepAlive) {
        return
    }
    // 省略
}
```

这样，内部的框架有了，然后就是怎样取实现对应的‘伪卸载’和‘伪挂载’逻辑了。这就涉及到 keep-alive 的本质——缓存节点信息。结合有效信息：要缓存、容器、不能真正的卸载、又不能让卸载的展示，这就需要我们的容器不能真正的挂载到浏览器上，且操作伪卸载的时要操作其对应的真实 DOM。

对于后者，目前我们能确定两件事：

1. 定义一个进行伪卸载和伪挂载的方法，本质是移动节点
2. 要在 unmount 钩子里能访问到

但是，如果 vnode 是组件的话，我们拿到的是可选内容对象，只能通过 ```vnode._component``` 拿到对应实例，进而操作 ```subTree``` 拿到对应真实 DOM。这样的话，我们就需要在实例上挂载这个方法，进而去进行移动操作。如下：

```js
function unmount(vnode) {
    // 省略
    // keep-alive 组件则假卸载
    else if (vnode.type._isKeepAlive) {
        // 移动操作
        vnode._component.move(vnode)
        return
    }
    // 省略
}
```

如上，我们定义了一个方法叫 ```move```，当卸载时就执行它，内部进行伪卸载工作。定义了这些，unmount 钩子内的工作就完成了，完整如下：

```js
function unmount(vnode) {
    // 根节点有多个则循环卸载
    if (vnode.type === Fragment) {
        vnode.children.forEach(v => unmount(v))
        return
    } else if (typeof vnode.type === 'object') {
        // keep-alive 组件则假卸载
        if (vnode.type._isKeepAlive) {
            vnode._component.move(vnode)
        } else {
            unmount(vnode._component.subTree)
        }
    }
    const parent = vnode._el.parentNode
    if (parent) parent.removeChild(vnode._el)
}
```

但是，现在虽然方法名有了，也知道该方法的目标就是移动节点，然而还欠缺存储隐藏节点的容器和要移动的内部逻辑。在 JS 中得知，我们是可以通过 API 去创建一个容器的，只要不去挂载就不会显示在页面上，但是还具备所有的功能，如我们常创建的 a 标签下载。按照这个逻辑，这个方法内部再次封装的有 ```createElement```，移动节点我们也有 ```insert```，所以，move 的实现逻辑就有了，如下：

```js
const KeepAlive = {
    _isKeepAlive: true,
    setup() {
        function move(vnode, container, anchor) {
            insert(vnode._el, container, anchor)
        }
    }
}
```

那要如何去访问这个方法进而去挂载呢？前文有提到过，在执行具体的 setup 之前，我们会把实例绑定到全局变量 ```currentInstance``` 上，所以，有了它我们就能随时访问实例。但因为我们将功能拆分到了不同的模块内，所以获取它的方法叫 ```getInstance```，如下：

```js
const KeepAlive = {
    _isKeepAlive: true,
    setup() {
        function move(vnode, container, anchor) {
            insert(vnode._el, container, anchor)
        }

        const instance = getInstance()
        instance.move = move
    }
}
```

这样就将其绑定到了当前 vnode 对应的实例上了。但是也要注意，move 的本质虽然是移动代码，但一个是移动到隐藏容器中，一个是移动到当前挂载的元素上，所以，container 的传入在不同时机是不同的。为了以示区分，分别再对应两个方法，如下：

```js
const KeepAlive = {
    _isKeepAlive: true,
    setup() {
        function move(vnode, container, anchor) {
            insert(vnode._el, container, anchor)
        }

        const instance = getInstance()
        const hideContainer = createElement('div')

        // 伪挂载隐藏容器中节点
        function activate(vnode, container, anchor) {
            move(vnode, container, anchor)
        }

        // 伪卸载 keep-alive 内容
        function deActivate(vnode) {
            move(vnode, hideContainer)
        }

        instance.keptAlive = {
            _activate: activate,
            _deActivate: deActivate
        }
    }
}
```

注意，这里为了方便找到 keep-alive 组件的所有暴露出来的方法，将其封装到了统一的 keptAlive 属性中。那么，unmount 方法也要对应改一下了，如下：

```js
function unmount(vnode) {
    // 根节点有多个则循环卸载
    if (vnode.type === Fragment) {
        vnode.children.forEach(v => unmount(v))
        return
    } else if (typeof vnode.type === 'object') {
        const subTree = vnode._component.subTree
        // keep-alive 组件则假卸载
        if (vnode.type._isKeepAlive) {
            vnode._component.keptAlive.__deActivate(subTree)
        } else {
            unmount(subTree)
        }
    }
    const parent = vnode._el.parentNode
    if (parent) parent.removeChild(vnode._el)
}
```

现在，有了伪卸载和伪挂载的方法，我们要知道何时调用它，以及如果已经存入了隐藏容器时，怎样不重复添加的问题。后者好解决，就是创建一个 Map 容器，每次添加前先确认在不在就好了。即，我们要在隐藏容器之外，还要创建一个缓存容器。如下：

```js
const KeepAlive = {
    _isKeepAlive: true,
    setup() {
        // 隐藏
        const defaultVnode = instance.slots.default()
        const cache = new Map()
        const cacheVnode = cache.get(defaultVnode.type)
        if (cacheVnode) {
            defaultVnode._component = cacheVnode._component
        } else {
            cache.set(defaultVnode.type, defaultVnode)
        }
    }
}
```

通过这种方式，我们就对要展示的插槽内容进行了缓存，但是，目前还有一个问题，就是如何要对缓存的节点进行伪挂载。首先我们分析一下伪挂载的背景条件：

1. 节点被移动到隐藏容器里了，并没有被真正删除，所以旧节点为空
2. 缓存的节点信息不需要再走挂载逻辑

根据上述得出一个结论，伪挂载的逻辑亦是放在旧节点不存在的逻辑里的。那现在缺一个判断条件，如何判断当前的实例就是一个缓存的 keep-alive 节点信息，是不是 keep-alive 我们能得到，是不是缓存的节点还需要加个标识。如下：

```js
const KeepAlive = {
    _isKeepAlive: true,
    setup() {
        // 隐藏
        const defaultVnode = instance.slots.default()
        const cache = new Map()
        const cacheVnode = cache.get(defaultVnode.type)
        if (cacheVnode) {
            defaultVnode._component = cacheVnode._component
            
            // 新增
            defaultVnode._isCacheKeepAlive = true
        } else {
            cache.set(defaultVnode.type, defaultVnode)
        }
    }
}

function patch(n1, n2, container, anchor) {
        // 省略
        // 有状态组件
        else if (typeof type === 'object') {
            if (!n1) {
                // 挂载组件
                const instance = getInstance()
                if (instance._isCacheKeepAlive) {
                    instance.keptAlive._activate(instance.subTree, container, anchor)
                } else {
                    mountComponent(n2, container, anchor)
                }
            } else {
                // 更新组件
                patchComponent(n1, n2, container, anchor)
            }
        }
        // 省略
    }
```

完整代码如下：

:::: code-group
::: code-group-item index.html
@[code](../source/v.0.0.18/index.html)
:::
::: code-group-item index.js
@[code](../source/v.0.0.18/index.js)
:::
::: code-group-item renderer.js
@[code](../source/v.0.0.18/renderer.js)
:::
::: code-group-item lifeCycle.js
@[code](../source/v.0.0.18/lifeCycle.js)
:::
::: code-group-item instance.js
@[code](../source/v.0.0.18/instance.js)
:::
::: code-group-item browser.js
@[code](../source/v.0.0.18/browser.js)
:::
::: code-group-item keepAlive.js
@[code](../source/v.0.0.18/keepAlive.js)
:::
::::

至这里，我们已经学习了如何去实现 keep-alive 的内部原理，知晓了其的设计结构、如何去伪挂载和伪卸载一个内部组件，也明白了当前实例是如何进行这种深度的关联的。至于 keep-alive 是如何变成这种结构的，我们就先不考虑。从整体上看，只要是组件，就和实例脱离不了关系，当然，代码还有优化的空间，只不过不在目前的考虑范围内，相信，会随着学习的更加深入，会逐渐的揭开更多的神秘之地。而我们渲染器的学习也将暂时告一段落，从下一节开始，我们将开始学习编译器的相关知识。诸君共勉。