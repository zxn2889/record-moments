---
prev:
    text: 如何挂载事件
    link: /vue/chapter-8/mountEvent.md
---

朋友们，上节我们学习了如何挂载事件，这节我们学习如何更新子节点。

更新子节点，说明之前存在旧的 vnode，且新旧 vnode 对象中 type 类型相同。那么，按照 vnode 结构，需要更新的就是 props 和 children 两个属性。

对于 props，大概分为：
1. 旧 vnode 中有 ```a``` 属性，新 vnode 中也有 ```a``` 属性，但是值不同，需要更新
2. 旧 vnode 中有 ```a``` 属性，新 vnode 中没有 ```a``` 属性，需要删除
3. 旧 vnode 中没有 ```a``` 属性，新 vnode 中有 ```a``` 属性，需要添加
4. 旧 vnode 中没有 ```a``` 属性，新 vnode 中也没有 ```a``` 属性，不做处理

回顾之前的代码，我们只需要在 ```patchEl``` 钩子里做更新就好，如下：

```js
function patchEl(_o_vnode, vnode) {
    const el = _o_vnode._el = vnode._el
    const oProps = _o_vnode.props
    const nProps = vnode.props

    for (const key in nProps) {
        if (Object.hasOwnProperty.call(nProps, key)) {
            // 此判断模拟情形
            // 1. 新旧节点都存在 key，但是值不同，更新新值
            // 2. 新节点存在 key，但旧节点不存在 key，更新新值
            // 3. 新节点不存在 key，但旧节点存在 key，更新新值
            if (nProps[key] !== oProps[key]) {
                patchProps(key, el, nProps[key])
            }
        }
    }
}
```

::: tip 提示
这里删除和添加都是新的一种，直接做更新处理了。
:::

接下来我们看 children 的比较变更。分析得知，children 是分别具有：```null、string、array``` 几种类型的，而更新后则相当于每种之前的情况就都可能对应三种新的情况，所以总共 9 种情况分析。分析如下：

1. 旧节点为 null：  
    | - 新节点为 null，不做处理  
    | - 新节点为字符串，添加文本  
    | - 新节点为数组，遍历数组并调用 patch（都是新增的节点）
2. 旧节点为 string：  
    | - 新节点为 null，更新为 null  
    | - 新节点为 string，更新为 string（都是文本内容，直接覆盖）  
    | - 新节点为 array，删除原有的文本内容，遍历 array 并 patch
3. 旧节点为 array：  
    | - 新节点为 null，删除原有的 array 节点  
    | - 新节点为 string，删除原有的 array 节点，添加 string  
    | - 新节点为 array，删除原有的 array 节点，遍历新节点的 array 并 patch

对应逻辑如下：

```js
function patchEl(_o_vnode, vnode) {
    // 省略
    patchChild(_o_vnode, vnode, el)
}

function patchChild(n1, n2, container) {
    if (typeof n2.children === 'string') {
        if (Array.isArray(n1.children)) {
            n1.children.forEach(v => unmount(v))
        }
        setTextContent(container, n2.children)
    } else if (Array.isArray(n2.children)) {
        if (Array.isArray(n1.children)) {
            n1.children.forEach(v => unmount(v))
            n2.children.forEach(v => patch(null, v, container))
        } else {
            setTextContent(el, '')
            n2.children.forEach(v => patch(null, v, container))
        }
    } else {
        if (Array.isArray(n1.children)) {
            n1.children.forEach(v => unmount(v))
        } else {
            setTextContent(container, null)
        }
    }
}
```

完整代码如下：

:::: code-group
::: code-group-item index.js
@[code](../source/v.0.0.11/index.js)
:::
::::

至这里，我们已经学习了子节点比较的基本逻辑，分别是比较前后子节点的 props 和 children 属性的不同，它们分别分为了几种情况。其中，对于 children 的处理，要辨别更新前后的类型是否是数组，如果是则先卸载，然后再挂载；其他则是直接设置文本内容就好。