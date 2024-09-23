---
prev:
    text: 认识其他的 vnode 类型
    link: /vue/chapter-8/vnodeTypes.md
next:
    text: 双端比较 diff
    link: /vue/chapter-10/doubleEndDiff.md
---

朋友们，上节我们学习了几种 vnode 节点的新类型，并了解了如何去挂载和更新它们。这节我们学习简单的 diff 算法，让子节点的更新更有效率。

前面我们提到过，如果新旧子节点的 children 类型都是 array 的话，我们是先删除旧的节点，然后添加新的节点。但是，这就会导致性能的浪费，比如我新旧节点除了文本内容，其他都一样，如下：

```js
// 旧 vnode
const oVnode = {
    type: 'div',
    children: [
        { type: 'p', children: 'No.1' },
        { type: 'p', children: 'No.2' },
        { type: 'p', children: 'No.3' }
    ]
}

// 新 vnode
const nVnode = {
    type: 'div',
    children: [
        { type: 'p', children: 'No.3' },
        { type: 'p', children: 'No.1' },
        { type: 'p', children: 'No.2' }
    ]
}
```

这种情况下，如果还是按照之前的方案，那么会先删除 3 次，然后再添加 3 次，对于 DOM 操作来说，这是比单纯的更新文本内容的开销要大得多。所以，优化如下：

```js
function patchChild(n1, n2, container) {
    if (typeof n2.children === 'string') {
        // 省略
    } else if (Array.isArray(n2.children)) {
        if (Array.isArray(n1.children)) {
            diff(n1, n2, container)
        } else {
            // 省略
        }
    } else {
        // 省略
    }
}

function diff(n1, n2, container) {
    const oChild = n1.children
    const nChild = n2.children
    for (let i = 0; i < oChild.length; i++) {
        patch(oChild[i], nChild[i], container)
    }
}

function patchEl(_o_vnode, vnode) {
    // 这里做出了改变，将旧 vnode 的真实 DOM 先指向新 vnode，这样就避免了新 vnode 的 _el 可能为空的问题
    const el = vnode._el = _o_vnode._el
}
```

经过这样修改之后，我们的开销就仅变为更新文本内容了，且还是 3 次，省了一半。但是，这种方式也是有缺陷的，就是它只能比较新旧节点的数量一致的情况，不一致的情况就不满足条件了。

不一致的情况有两种：

1. 新 vnode 的节点数量比旧 vnode 的多
2. 新 vnode 的节点数量比旧 vnode 的少

对于前者，我们需要新增，即挂载；对于后者，我们需要删除，即卸载。所以优化如下：

```js
function diff(n1, n2, container) {
    const oChild = n1.children
    const nChild = n2.children
    const oLen = oChild.length
    const nLen = nChild.length

    // 比较新旧节点的长度，并找到最小的那个值
    const mLen = Math.min(oLen, nLen)

    // 以最小的基数遍历
    for (let i = 0; i < mLen; i++) {
        patch(oChild[i], nChild[i], container)
    }

    // 新节点中超出的挂载
    if (nLen > mLen) {
        for (let i = mLen; i < nLen; i++) {
            patch(null, nChild[i], container)
        }
    }

    // 旧节点中超出的卸载
    if (oLen > mLen) {
        for (let i = mLen; i < oLen; i++) {
            unmount(oChild[i])
        }
    }
}

// 删除 vnode 对应的真实 DOM
function unmount(vnode) {
    // 优化，取 _el.parentNode 字段
    const parent = vnode._el.parentNode
}
```

::: details 详细代码如下
<<< ../source/v.0.0.13/01.index.js
:::

但是，这样的处理也是毛糙的，比如所有的内容都一样，只有 type 对应的元素不一样，如：

```js
const oVnode = {
    type: 'div',
    children: [
        { type: 'p', children: 'No.1' },
        { type: 'span', children: 'No.2' },
        { type: 'div', children: 'No.3' }
    ]
}

const nVnode = {
    type: 'div',
    children: [
        { type: 'div', children: 'No.3' },
        { type: 'p', children: 'No.1' },
        { type: 'span', children: 'No.2' }
    ]
}
```

这种情况下，因为内部会比较 type 的值是否相同，不同的情况会先卸载，然后再去挂载，这样的操作要 6 次。而仔细看的话，内容是没有变化的，变化的只是先后顺序。所以之前的代码就不适合了，现在需要做的就是找到变化的顺序，然后挪动对应的节点。

那比较的基准或者原则是什么：以旧的节点比较出新节点变化的顺序，然后以新节点的顺序为基，挪动旧的节点对应的真实 DOM，变化成新节点对应的真实 DOM。

所以，操作步骤是：

1. 找到新旧节点对应的顺序差异
2. 挪动旧节点对应的真实 DOM

那如何找出顺序的差异，不能说我去比较 type 和 children 吧，这样太复杂了，所以，我们定义一个单独的 key 值，这样通过 key 值与角标的对比，就能知道谁先谁后了。

::: tip 注意
这里的所说的基准或原则，需要满足的条件是当前节点是可复用，只有可复用的情况下才需要挪动。那可复用的前提是一定有 type 的值相等的原则，否则我们内部就会进行卸载。但是，这还不保险，因为，如果新旧节点下的所有 type 类型指的都是同一种标签元素呢。所以才引入了另一个判断条件——key，只有这两者都相同的情况下，我们才认定是可复用的。具体 key 是怎么来的？嗯，这是一个好问题。
:::

那如何去比较顺序，逻辑如下：

```js
function diff(n1, n2, container) {
    const oChild = n1.children
    const nChild = n2.children

    // 定义旧节点要比较的基准值，并设置初始值为 0——和新节点循环的初始角标一致
    let lastestIndex = 0
    for (let i = 0; i < nChild.length; i++) {
        const nv = nChild[i]
        for (let j = 0; j < oChild.length; j++) {
            const ov = oChild[j]

            // 满足可复用的条件
            if (nv.type === ov.type && nv.key === ov.key) {
                if (j < lastestIndex) {
                    // ...
                }
                // 在满足可复用的条件下，如果当前旧节点的角标不小于要比较的基准值，则更新基准值为当前旧节点的角标值
                else {
                    lastestIndex = j
                }
            }
        }
    }
}

const oVnode = {
    type: 'div',
    children: [
        { type: 'p', key: 1, children: 'No.1' },
        { type: 'span', key: 2, children: 'No.2' },
        { type: 'div', key: 3, children: 'No.3' }
    ]
}

const nVnode = {
    type: 'div',
    children: [
        { type: 'div', key: 3, children: 'No.3' },
        { type: 'p', key: 1, children: 'No.1' },
        { type: 'span', key: 2, children: 'No.2' }
    ]
}
```

注意这里为什么这么设计，因为要比较新旧节点的可复用性，就要比较对应的 type 和 key，所以，要用到嵌套循环。又因为要知道谁前谁后的顺序改变，所以我们需要一个判断的基准值。而这个基准值是一定要满足在可复用的条件下才能去定义，否则就没有意义。

那将它更新为谁，如上面新旧节点所示，新节点 ```{ type: 'div', key: 3, children: 'No.3' }``` 对应的角标是 0，旧节点在满足可复用情况下的角标为 2，```0 < 2```，这代表旧节点中对应的该 vnode 提前了，则同时也表示，其他的节点靠后了。所以，旧节点中其他的节点要向后移动，那判断标准就是当前的 2。所以，此刻更新基准条件 ```lastestIndex``` 的值为 2。只要下一次在满足可复用条件后，判断当下旧节点的值是否小于基准条件，小于就往后移动，不小于就继续更新基准值，这样就实现了需要的逻辑。

::: tip 注意
挪动的节点是旧节点对应的真实 DOM。
:::

那要如何挪呢，代码如下：

```js
function diff(n1, n2, container) {
    const oChild = n1.children
    const nChild = n2.children

    // 定义旧节点要比较的基准值，并设置初始值为 0——和新节点循环的初始角标一致
    let lastestIndex = 0
    for (let i = 0; i < nChild.length; i++) {
        const nv = nChild[i]
        for (let j = 0; j < oChild.length; j++) {
            const ov = oChild[j]

            // 满足可复用的条件
            if (nv.type === ov.type && nv.key === ov.key) {
                if (j < lastestIndex) {
                    // 找到当前节点的前一个兄弟节点
                    const prevNode = ov._el.previousSibling

                    // 找到当前节点的父节点
                    const parentNode = ov._el.parentNode

                    // 将当前节点插入到父节点下的指定位置
                    insert(ov._el, parentNode, prevNode)
                }
                // 在满足可复用的条件下，如果当前旧节点的角标不小于要比较的基准值，则更新基准值为当前旧节点的角标值
                else {
                    lastestIndex = j
                }
            }
        }
    }
}
```

这里我们看到，我们使用了抽离的 API ```insert``` 方法，并通过可选参数指定了要插入的位置，实现了顺序的改变。但是这会造成一个问题，就是移动的是旧节点对应的真实 DOM，但是这个 DOM 是不是我们新节点的内容呢？我们不确定。所以，需要在改变之前，先把对应的内容即 children 进行比较更新，如下：

```js
function diff(n1, n2, container) {
    // 省略
    for (let i = 0; i < nChild.length; i++) {
        const nv = nChild[i]
        for (let j = 0; j < oChild.length; j++) {
            const ov = oChild[j]

            // 满足可复用的条件
            if (nv.type === ov.type && nv.key === ov.key) {

                // 在可复用的情况下将内容比较更新
                patch(ov, nv, container)

                // 省略
            }
        }
    }
}
```

但是，代码还可以继续优化，详情代码如下：

::: details 详细代码
<<< ../source/v.0.0.13/02.index.js
:::

注意这里采用 ```break``` 跳出，是指满足条件后跳出当前循环，不再执行后续逻辑；而 parent 节点可以通过 container 带入，避免了更多资源的浪费。

但是，如果新旧节点的数量不一样怎么办。所以这里还要实现挂载和新增。怎么去判断，通过 key。判断如下：

1. 新的节点中存在旧节点中不存在的 key 时，新增
2. 旧的节点中存在新节点中不存在的 key 时，删除

新增逻辑如下：

```js
function diff(n1, n2, container) {

    // 定义旧节点要比较的基准值，并设置初始值为 0——和新节点循环的初始角标一致
    let lastestIndex = 0
    for (let i = 0; i < nChild.length; i++) {
        const nv = nChild[i]

        const hasEl = oChild.find(v => v.key === nv.key)
        if (!hasEl) {
            mountEl(nv, container)
        }

        // 省略
    }
}
```

删除逻辑如下：

```js
function diff(n1, n2, container) {
    // 省略

    // 卸载不存在的旧节点
    for (let i = 0; i < oChild.length; i++) {
        const ov = oChild[i]
        const hasEl = nChild.find(v => v.key === ov.key)
        if (!hasEl) {
            unmount(ov)
        }
    }
}
```

::: tip 注意
实现移动节点顺序和挂载新增节点的时候，代码和源码并不一样，但是实现的效果是一模一样的，且更简洁。文章的结尾会分别附上对应源码。
:::

至这里，你会发现，在实现关于 children 都是一组节点的情况下的挂载与更新，我们已经迭代了几个版本，分别是：

1. 遍历卸载所有的旧节点，然后遍历挂载所有的新节点
2. 比较新旧节点的最小长度，最小长度内的都 patch 比较更新，以外的分别与新旧节点长度做比较，如果新者长，则以此为起始角标，循环挂载；如是后者，则以此为起始角标，循环卸载
3. 以可复用条件为基础，调整旧节点对应真实 DOM 顺序，以 key 值在新旧节点中是否存在，做对应挂载与卸载的方式

::: details 源码如下：
::: code-group
<<< ../source/v.0.0.13/03.index.js [模拟板]
<<< ../source/v.0.0.13/04.index.js [源码版]
:::

::: tip 结尾彩蛋
diff 算法比较的是新旧节点的一组节点。
:::