---
prev:
    text: 原始值的响应方案
    link: /vue/chapter-6/achieveOriganValueProxy.md
---

朋友们，前面我们学习了如何实现一个小型的响应式系统，了解了一些内部的实现原理，这节我们学习如何设计一个渲染器，以及了解渲染器和响应系统是如何关联的。

我们知道，渲染器的工作流程是：把一段内容编译为虚拟节点并挂载到目标元素上，内容如有改变就触发更新的过程。从这里知道，我们需要定义一个功能函数，函数接收内容和挂载节点两个参数，且还要有前后比较的过程。如下：

```js
// 一个基础的渲染
function render(vnode, el) {
    const mountEl = document.getElementById(el)
    mountEl.innerHTML = vnode
}
```

```js
// 一个带有比较更新的渲染
function render(vnode, el) {
    const mountEl = document.getElementById(el)
    if (vnode) {
        // 触发比较
        patch(el._o_vnode, vnode, el)
    } else {
        // 清空挂载内容
        mountEl.innerHTML = ''
    }

    el._o_vnode = vnode
}
```

这里我们发现，一个基础的渲染器框架就出来了，比想象中要简单很多。那要怎么和响应系统联系起来呢，也很简单，就是我们的 effect。如下：

```js
import { effect } from './proxy'

effect(() => {
    render(vnode, el)
})
```

这样，当内部监听到 vnode 改变的时候，就自然触发更新了。但是，一个渲染器的组成一定是复杂的，它要兼顾到各个平台的实现，所以，单独的 render 渲染函数是不够的，我们要创建一个更大的平台去兼顾这种考虑。如下：

```js
function createRenderer() {
    function render(vnode, el) {
        const mountEl = document.getElementById(el)
        if (vnode) {
            // 触发比较
            patch(el._o_vnode, vnode, el)
        } else {
            // 清空挂载内容
            mountEl.innerHTML = ''
        }
    
        el._o_vnode = vnode
    }

    function patch(_o_vnode, vnode, el) {
        // ...
    }

    return {
        render,
        patch
    }
}

const renderer = createRenderer()
```

这样，一个渲染器的框架就定义好了，其实就是一个更大的函数包裹。那渲染的逻辑也很容易调用，如下：

```js
const vnode = {
    type: 'h1',
    children: '一级标题'
}

renderer.render(vnode, 'app')
```

那这个时候，patch 就会起作用，内部逻辑如下：

```js
function patch(_o_vnode, vnode, el) {
    if (!_o_vnode) {
        // 直接挂载
        mountEl(vnode, el)
    } else {
        // 比较更新部分
    }
}

function mountEl(vnode, el) {
    const vEl = document.createElement(vnode.type)
    const vCon = vnode.children
    // 文本节点则直接填充
    if (typeof vCon === 'string') {
        vEl.textContent = vCon
    } else {
        // ...
    }
    document.getElementById(el).appendChild(vEl)
}
```

这里也发现，当旧的 vnode 节点没有内容的时候，说明这是一个空白的节点树，还没有过任何挂载动作，那我们就直接把新节点挂载上去就好了；如果旧 vode 节点存在，则再去比较新、旧节点树的差异。且挂载的过程中，我们是通过比较 vnode 节点的 children 属性做判断，如：‘如果是 string 类型，则说明是文本节点，直接填充在内容节点里’。

这个过程也发现很多问题，它不够优雅，也没有那么适用性强。所以，一方面要做抽离，方便适用各个平台，一方面是要把逻辑进行优化，如下：

:::: code-group
::: code-group-item index.html
@[code](../source/v.0.0.7/index.html)
:::

::: code-group-item index.js
@[code](../source/v.0.0.7/index.js)
:::
::::

这里发现，我们把虚拟节点转化为真实 DOM 的操作给抽离出去了，目的就是通过判断不同的平台下，传入不同的实现逻辑。这样，渲染器的工作范围就不仅仅是我们目前在模拟的浏览器平台了。

这一节我们学习了如何创建一个浏览器，以及如何让响应式系统与渲染器关联的方法，且在这个过程中了解了核心入口 patch，以及 vnode 转为真实 DOM 的过程，和渲染器是如何考虑通过 options 兼顾各个平台的功能的。神秘的外衣已经揭开了一部分，我们将学习它更多的内容。