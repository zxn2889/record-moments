---
prev:
    text: 子节点和 props 属性的挂载
    link: /vue/chapter-8/mountChildVnodeAndProps.md
next:
    text: 如何挂载事件
    link: /vue/chapter-8/mountEvent.md
---

朋友们，上节我们学习了子节点和 props 属性的挂载，这节我们学习下如何卸载，及卸载的几种情况。

卸载我们知道，是之前已经完成过挂载，然后 vnode 更新后重新渲染的情况。那 vnode 的更新有可能是 null，还有可能是变化的 vnode，我们一一来对比。

当 vnode 为 null 时，我们回顾代码：

```js
function render(vnode, container) {
    if (vnode) {
        // 触发比较
        patch(container._o_vnode, vnode, container)
    } else {
        // 清空挂载内容
        container.innerHTML = ''
    }

    container._o_vnode = vnode
}
```

这里是直接把挂载容器的内容清空，但这样不对，正确的应该是找到 vnode 对应的真实 DOM，然后操作 DOM 删除。

::: tip 为什么通过真实 DOM 删除
1. innerHTML 这种删除方式不能清空对应的事件信息
2. 卸载的对象可能包含组件，需要执行对应组件的卸载周期（```eg: beforeUnmount、unmounted```）
3. 卸载的元素可能包含自定义指令等，需要执行对应的钩子函数
:::

另外应该是有旧的 vnode 时才执行对应逻辑，优化如下：

```js
function render(vnode, container) {
    if (vnode) {
        // 省略
    } else {
        // 清空挂载内容
        if (container._o_vnode) {
            // 找到 vnode 对应的真实 DOM，并删除
            const el = container._o_vnode._el
            const parent = el.parentNode
            if (parent) parent.removeChild(el)
        }
    }
}

function mountEl(vnode, container) {
    // 将 vnode 生成的真实 DOM 信息挂载到 vnode 上，让 vnode 和 真实 DOM 产生关联
    const el = vnode._el = createElement(vnode.type)
    
    // 省略
}
```

可以看到，这里通过连等将 vnode 添加的属性 ```._el``` 与生成的真实 DOM 节点做了绑定，这样就方便通过 vnode 找到对应的节点信息了。

那如果更新的节点不为空，且有值呢，这就涉及到比较了，但是比较也分情况，修改后如下：

```js
function patch(_o_vnode, vnode, container) {
    if (!_o_vnode) {
        // 直接挂载
        mountEl(vnode, container)
    } else {
        // 比较更新部分
        if (_o_vnode.type !== vnode.type) {
            const el = _o_vnode._el
            const parent = el.parentNode
            if (parent) parent.removeChild(el)
            _o_vnode = null
            // 更新
        } else {
            // 更新
        }
    }
}
```

::: tip
如果更新的节点有值，不为空，且前后不一致，这种情况下不是单纯的卸载，而是打补丁——即前后对比，更新不同的部分。
:::

我们看到卸载的部分其实逻辑重复了，这部分可以提取优化，然后我们还可以思考，既然是存在旧的节点，且类型不同的情况下，需要删除再更新，那删除的部分是不是可以提前呢，这样还能复用直接挂载逻辑。修改如下：

```js
// 删除 vnode 对应的真实 DOM
function unmount(vnode) {
    const parent = vnode._el.parent
    if (parent) parent.removeChild(vnode._el)
}

function patch(_o_vnode, vnode, container) {
    if (_o_vnode && _o_vnode.type !== vnode.type) {
        unmount(_o_vnode)
        _o_vnode = null
    }
    if (!_o_vnode) {
        // 直接挂载
        mountEl(vnode, container)
    } else {
        // 比较更新部分
    }
}
```

前面我们也提到，更新的可能是组件等情况，所以在更新时还需要再判断，如下：

```js
function patch(_o_vnode, vnode, container) {
    // 先卸载
    if (_o_vnode && _o_vnode.type !== vnode.type) {
        unmount(_o_vnode)
        _o_vnode = null
    }

    // 再更新
    // string 表示普通标签元素，object 表示组件，...
    const type = vnode.type
    if (typeof type === 'string') {
        if (!_o_vnode) {
            // 当为普通标签元素时直接挂载逻辑
            mountEl(vnode, container)
        } else {
            patchEl(_o_vnode, vnode)
        }
    } else if (typeof vnode.type === 'object') {
        // 更新
    } else {
        // 更新
    }
}
```

这里我们看到，更新的部分我们再次做了优化，加入了 vnode 节点的类型判断，通过判断不同的类型，进入不同的挂载或更新逻辑，使关注的场景更加单一。

::: tip
挂载是打补丁的一种，是其旧 vnode 为空的一种情况。
:::

完整代码如下：

<<< ../source/v.0.0.9/index.js [index.js]

至这里，我们已经学习了卸载的几种情况，分别是当更新节点为空时的直接卸载，和更新节点与旧节点不一致情况的几种判断。了解了如何将 vnode 与 真实 DOM 如何关联、unmount 钩子的基本形态、如何根据不同的 vnode 节点类型做不同的判断等。明白了大致的内部逻辑，知晓了挂载是打补丁的特殊情况，掀开了卸载与更新的一角。接下来我们将继续学习挂载与更新内部的事件逻辑。