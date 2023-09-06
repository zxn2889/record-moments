---
prev:
    text: 渲染器的设计
    link: /vue/chapter-7/designRenderer.md
next:
    text: 卸载节点的几种情况
    link: /vue/chapter-8/unmountVnode.md
---

朋友们，上节我们学习了如何设计一个渲染器，与了解了它的基础架构，这一节我们来进一步的学习如何实现对 vnode 的挂载与更新的第一部分——含有子节点的 vnode 与 props 的挂载。

对于含有子节点的修改如下：

```js
// 将虚拟节点转为真实 DOM，并挂载到指定元素上
function mountEl(vnode, el) {
    const vEl = createElement(vnode.type)
    const vCon = vnode.children
    // 文本节点则直接填充
    if (typeof vCon === 'string') {
        setTextContent(vEl, vCon)
    } else if (Array.isArray(vCon)) {
        // 存在子节点则循环进行比较更新
        // 当前无旧 vnode，所以传入的旧 vnode 为 null
        for (let i = 0; i < vCon.length; i++) {
            patch(null, vCon[i], vEl)
        }
    }
    insert(vEl, el)
}
```

我们现在把文本节点及含有子节点的情况都实现了，但是节点上的属性还没有模拟，我们先来看看属性怎么实现，我们用 props 表示 vnode 的属性，如下：

```js
function mountEl(vnode, container) {
    // 其他代码省略

    // 如果有属性存在则在元素上添加属性
    if (vnode.props) {
        for (const key in vnode.props) {
            const propVal = vnode.props[key]
            el.setAttribute(key, propVal)
        }
    }

    // 其他代码省略
}
```

这里我们通过 ```setAttribute``` 方法实现，但是我们需要清楚一种情况，就是浏览器的 HTML attribute 和 DOM properties 有时候并不是完全一样的，且 HTML attribute 拿到的只是初始值。我们需要做以区分，如下：

```js
function mountEl(vnode, container) {
    // 如果有属性存在则在元素上添加属性
    if (vnode.props) {
        for (const key in vnode.props) {
            const propVal = vnode.props[key]

            // 判断当前属性在 DOM properties 上是否存在
            if (key in el) {
                el[key] = propVal
            } else {
                el.setAttribute(key, propVal) 
            }
        }
    }

    // 省略其他代码
}
```

::: tip
HTML Attribute 是我们写在 HTML 标签上的属性，DOM Properties 是通过 ```el = document.getElementById()``` 这样解析之后的属性。
:::

但显然不止这些情况，如 vue 中对 class 的特殊处理、 input 标签的 form 属性为只读、标签上的属性仅有一个 key，且没有设置值时```(eg: <input disabled />)```，修改如下：

```js
function mountEl(vnode, container) {
    if (vnode.props) {
        for (const key in vnode.props) {
            const propVal = vnode.props[key]
            if (key === 'class') {
                el.className = propVal
            } else if(vnode.type === 'input' && key === 'form') {
                el.setAttribute(key, propVal)
            } else if (key in el) {
                if(typeof propVal === 'boolean' && propVal === '') {
                    el[key] = true
                } else {
                    el[key] = propVal
                }
            } else {
                el.setAttribute(key, propVal) 
            }
        }
    }

    // 其他代码省略
}
```

这里我们将代码优化以下，如下:

```js
function mountEl(vnode, container) {
    if (vnode.props) {
        for (const key in vnode.props) {
            const propVal = vnode.props[key]
            if (key === 'class') {
                el.className = propVal
            } else if(shouldSetAttr(key, el)) {
                // 判断是否只设置 key，没有设置 value
                if(typeof propVal === 'boolean' && propVal === '') {
                    el[key] = true
                } else {
                    el[key] = propVal
                }
            } else {
                el.setAttribute(key, propVal) 
            }
        }
    }

    // 其他代码省略
}

// 判断属性是否只能通过 setAttribute 设置
function shouldSetAttr(key, el) {
    if(el.tagName === 'INPUT' && key === 'form') return false
    return key in el
}
```

::: tip
这里说一下为什么要给 class 单独的做判断，因为在 vue 中写代码的时候，class 的定义方式是各种各样的，但是最后只要全部转化为空格间隔的样式，且对 setAttribute、className、classList 做了性能对比后，className 性能最好。
:::

同样，我们把对应代码抽离后，完整代码如下：

:::: code-group
::: code-group-item index.js
@[code](../source/v.0.0.8/index.js)
:::
::::