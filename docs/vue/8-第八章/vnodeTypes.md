---
title: 5-认识其他的 vnode 类型
---

朋友们，上节我们学习了如何实现子节点的更新，这节我们就来认识几种新的 vnode 类型吧。

之前也有提到过，vnode 的 type 是分多种情况的，如普通标签，组件等，那还有其他的，以下面这段 HTML 为例：

```html
<div>
    <!-- 这是一段注释 -->
    这是一段内容
</div>
```

我们可以从这段 HTML 代码中发现，它是包含了三段内容，分别是 div、注释、文本。它们分别都有自己的 vnode 类型。但是，注释和文本是没有自己的元素类型的，所以 type 值需要被填充占位，如下：

```js
// 注释节点
const Comment = Symbol()
const vnode = {
    type: Comment,
    children: '这是一段注释'
}

// 文本节点
const Text = Symbol()
const vnode = {
    type: Text,
    children: '这是一段内容'
}
```

::: tip
Comment 为注释节点标识，Text 为文本节点标识。
:::

对应的挂载与代码如下：

```js
function patch(_o_vnode, vnode, container) {
    // 省略

    // 当为普通标签元素时
    if (typeof type === 'string') {
        // 省略
    }
    // 当为 Text 节点时
    else if (type === Text) {
        // 不存在旧节点的情况下，让元素本身直接指向创建的文本的节点
        if (!_o_vnode) {
            const el = vnode._el = document.createTextNode(vnode.children)
            insert(el, container)
        } else {
            const el = vnode._el = _o_vnode._el
            if (vnode.children !== _o_vnode.children) {
                el.nodeValue = vnode.children
            }
        }
    }
    // 省略
}
```

::: tip
当节点本身不是元素节点（普通标签表示的节点），是文本节点时，要通过 ```createTextNode``` 来创建 DOM 对象，对应的赋值属性时 ```nodeValue```。
:::

另外，在组件中存在根节点的情况，也是通过创建 type 标识，在内部进行展现的，如：

```js
<template>
    <li>No.1</li>
    <li>No.2</li>
    <li>No.3</li>
</template>

// 对应

// Fragment 为多根节点标识
const Fragment = Symbol()
const vnode = {
    type: Fragment,
    children: [
        { type: 'li', children: 'No.1' },
        { type: 'li', children: 'No.2' },
        { type: 'li', children: 'No.3' }
    ]
}
```

对应的逻辑如下：

```js
function patch(_o_vnode, vnode, container) {
    // 省略

    // 当为普通标签元素时
    if (typeof type === 'string') {
        // 省略
    }
    // 当为 Fragment 节点时
    else if (type === Fragment) {
        // 当旧节点不存在时直接遍历挂载新节点内容
        if (!_o_vnode) {
            vnode.children.forEach(v => patch(null, v, container))
        }
        // 否则就比较新旧节点的 children
        else {
            patchChild(_o_vnode, vnode, container)
        }
    }
    // 省略
}
```

但是这里要注意一下，如果卸载的情况是涉及到了 Fragment 节点类型的，需要特殊处理一下：

```js
function unmount(vnode) {
    if (vnode.type === Fragment) {
        vnode.children.forEach(v => unmount(v))
        return
    }
    // 省略
}
```

至此，我们在认识了元素节点（普通标签节点）后，又认识了几种新的 vnode 类型。在其中，既了解了对应的挂载与更新方式，又知晓了内部是如何定义一些特殊的 vnode 类型和对其特殊的处理的，如 Fragment 节点类型的 unmount 钩子。重点是思路，原来，特殊的内容也是能够被设计为对应的 vnode 节点类型的。

完整代码如下：

<<< ../source/v.0.0.12/index.js [index.js]