---
prev:
    text: 初识 diff,
    link: /vue/chapter-9/firstMeetDiff.md
next:
    text: 快速 diff
    link: /vue/chapter-11/quickDiff.md
---

朋友们，上节我们学习了简单的 diff 算法，知晓了 key 和如何移动 DOM，这节我们来进一步学习 diff 的优化——双端比较 diff。

上一节中我们发现，要想实现新节点的 DOM 可以更简单，就是直接移动 ```key=3``` 对应的真实节点 DOM 直接到头部就好了，但是目前的算法不支持，所以，双端比较的概念就出来了。

何为双端比较：就是将新旧节点按照一组特定的逻辑进行比较，不同的逻辑内做不同的处理。如下：

1. 旧节点的头部和新节点的头部比较，判断 key 值是否相同
2. 旧节点的尾部和新节点的尾部比较，判断 key 值是否相同
3. 旧节点的头部和新节点的尾部比较，判断 key 值是否相同
4. 旧节点的尾部和新节点的头部比较，判断 key 值是否相同

::: tip 注意
这里为了表达方便，简化并统一使用了 key 值是否相同作为可复用的判断条件。
:::

我们以下面的新旧节点举例，判断逻辑如下：

```js
const oVnode = {
    type: 'div',
    children: [
        { type: 'p', key: 1, children: 'No.1' },
        { type: 'p', key: 2, children: 'No.2' },
        { type: 'p', key: 3, children: 'No.3' },
        { type: 'p', key: 4, children: 'No.4' }
    ]
}

const nVnode = {
    type: 'div',
    children: [
        { type: 'p', key: 4, children: 'No.4' },
        { type: 'p', key: 2, children: 'No.2' },
        { type: 'p', key: 1, children: 'No.1' },
        { type: 'p', key: 3, children: 'No.3' }
    ]
}
```

1. 旧节点中头部节点 ```p-No.1``` 和新节点中头部节点 ```p-No.4``` 比较，key 值不同，不可复用
2. 旧节点中尾部节点 ```p-No.4``` 和新节点中尾部节点 ```p-No.3``` 比较，key 值不同，不可复用
3. 旧节点中头部节点 ```p-No.1``` 和新节点中尾部节点 ```p-No.3``` 比较，key 值不同，不可复用
4. 旧节点中尾部节点 ```p-No.4``` 和新节点中头部节点 ```p-No.4``` 比较，key 值相同，可复用

::: tip 注意
头部节点表示一组节点的最顶部节点；尾部节点表示一组节点的最底部节点。
:::

代码如下：

```js
function patchChild(n1, n2, container) {
    if (typeof n2.children === 'string') {
        // 省略
    } else if (Array.isArray(n2.children)) {
        if (Array.isArray(n1.children)) {
            doubleEndDiff(n1, n2, container)
        }
        // 省略
    }
    // 省略
}

// 双端比较 diff
function doubleEndDiff(n1, n2, container) {
    const oChild = n1.children
    const nChild = n2.children

    const oStartIndex = 0
    const oEndIndex = oChild.length - 1
    const nStartIndex = 0
    const nEndIndex = nChild.length - 1

    const oStartV = oChild[oStartIndex]
    const oEndV = oChild[oEndIndex]
    const nStartV = nChild[nStartIndex]
    const nEndV = nChild[nEndIndex]

    while (oStartIndex <= oEndIndex && nStartIndex <= nEndIndex) {
        if (oStartV.key === nStartV.key) {
            // ...
        } else if (oEndV.key === nEndV.key) {
            // ...
        } else if (oStartV.key === nEndV.key) {
            // ...
        } else if (oEndV.key === nStartV.key) {
            // 比较更新
            patch(oEndV, nStartV, container)
            // 将尾部节点插入到头部元素前
            insert(oEndV._el, container, oStartV._el)
            // 将尾部角标--，同时将尾部元素向上挪动至最新（依据角标向上挪动一位）
            oEndV = oChild[--oEndIndex]
            // 将头部角标++，同时将头部元素乡下挪动至最新（依据角标向下挪动一位）
            nStartV = nChild[++nStartIndex]
        }
    }
}
```

注意这里发生的步骤：

1. 可复用的条件下比较更新 children 是否变化，所以要先 patch
2. 因为旧节点中尾部节点和新节点中头部节点可复用，意味着旧节点中最后一位的节点提前到了新节点的首位，所以需要将旧节点的尾部元素对应的真实 DOM 移动到旧节点对应的真实 DOM 的头部元素之前
3. 旧节点的尾部角标--，更新尾部节点
4. 新节点的头部角标++，更新头部节点

这样后，旧节点的尾部元素就变成了 ```p-No.3```，新节点的头部元素就变成了 ```p-No.2```，然后重新执行这四步：

1. 旧节点中头部节点 ```p-No.1``` 和新节点中头部节点 ```p-No.2``` 比较，key 值不同，不可复用
2. 旧节点中尾部节点 ```p-No.3``` 和新节点中尾部节点 ```p-No.3``` 比较，key 值相同，可复用

对应逻辑如下：

```js
function doubleEndDiff(n1, n2, container) {
    // 省略
    while (oStartIndex <= oEndIndex && nStartIndex <= nEndIndex) {
        if (oStartV.key === nStartV.key) {
            // 省略
        } else if (oEndV.key === nEndV.key) {
            patch(oEndV, nEndV, container)
            oStartV = oChild[--oStartIndex]
            nStartV = nChild[--nStartIndex]
        }
        // 省略
    }
}
```

因为都是尾部节点，所以不需要移动 DOM 元素，只需要对比更新，和向上递减角标与修改尾部节点对应的指向即可。然后重新执行：

1. 旧节点中头部节点 ```p-No.1``` 和新节点中头部节点 ```p-No.2``` 比较，key 值不同，不可复用
2. 旧节点中尾部节点 ```p-No.2``` 和新节点中尾部节点 ```p-No.1``` 比较，key 值不同，不可复用
3. 旧节点中头部节点 ```p-No.1``` 和新节点中尾部节点 ```p-No.1``` 比较，key 值相同，可复用

对应逻辑如下：

```js
function doubleEndDiff(n1, n2, container) {
    // 省略
    while (oStartIndex <= oEndIndex && nStartIndex <= nEndIndex) {
        if (oStartV.key === nStartV.key) {
            // 省略
        } else if (oEndV.key === nEndV.key) {
            // 省略
        } else if (oStartV.key === nEndV.key) {
            patch(oStartV, nEndV, container)
            // 将旧节点中的头部元素插入到旧节点的尾部，即旧节点的尾部的下一个元素的之前
            insert(oStartV._el, container, oEndV._el.nextSibling)
            oStartV = oChild[++oStartIndex]
            nEndV = nChild[--nEndIndex]
        }
        // 省略
    }
}
```

注意这里有点不同的是，旧节点中的头部节点和新节点中尾部节点可复用了，表示旧节点中的头部节点对应的真实 DOM，在新节点对应的真实 DOM 的尾部，所以要把旧节点的头部节点对应的真实 DOM，移动到当前旧节点的尾部位置。因为循环还没结束，继续执行：

1. 旧节点中头部节点 ```p-No.1``` 和新节点中头部节点 ```p-No.1``` 比较，key 值相同，可复用

对应逻辑如下：

```js
function doubleEndDiff(n1, n2, container) {
    // 省略
    while (oStartIndex <= oEndIndex && nStartIndex <= nEndIndex) {
        if (oStartV.key === nStartV.key) {
            patch(oStartV, nStartV, container)
            oStartV = oChild[++oStartIndex]
            nStartV = nChild[++nStartIndex]
        }
        // 省略
    }
}
```

因为都是头部节点，所以无需移动元素位置。

::: tip 注意
这个时候旧节点和新节点都只剩下了一个节点，所以旧节点中的头部角标和尾部角标指向的是同一个旧节点；同理，新节点中也是一样。然后，因为是头部位置，所以新旧节点的头部角标都要```++```，然后不满足条件，执行完毕。
:::

回顾过程，旧节点执行结果顺序：

1. 尾部节点 ```p-No.4``` 提升至头部
2. 尾部节点 ```p-No.3``` 保持不变
3. 头部节点 ```p-No.1``` 移动到尾部
4. 头部节点 ```p-No.2``` 保持不变

所以旧节点也就变成了新节点对应的真实 DOM 的样子。但是除了每 4 步都有可复用的场景外，还有其他场景，设计新旧节点如下：

```js
const oVnode = {
    type: 'div',
    children: [
        { type: 'p', key: 1, children: 'No.1' },
        { type: 'p', key: 2, children: 'No.2' },
        { type: 'p', key: 3, children: 'No.3' },
        { type: 'p', key: 4, children: 'No.4' }
    ]
}

const nVnode = {
    type: 'div',
    children: [
        { type: 'p', key: 2, children: 'No.2' },
        { type: 'p', key: 4, children: 'No.4' },
        { type: 'p', key: 1, children: 'No.1' },
        { type: 'p', key: 3, children: 'No.3' }
    ]
}
```

这种情况下，首次循环的 4 步中找不到可复用的情况，但是这并不代表着新节点中对应的节点在旧节点不存在了，修改代码如下：

```js
function doubleEndDiff(n1, n2, container) {
    // 省略
    while (oStartIndex <= oEndIndex && nStartIndex <= nEndIndex) {
        if (!oStartV) {
                oStartV = oChild[++oStartIndex]
        } else if (!oEndV) {
            oEndV = oChild[--oEndIndex]
        }
        // ... 省略
        else {
            const fIndex = oChild.findIndex(v => v.key === nStartV.key)
            // 因为双边都已经比较过，这个时候如果存在，则 > 0
            if (fIndex) {
                const moveV = oChild[fIndex]
                patch(moveV, nStartV, container)
                // 因为双边比较不存在，这个时候存在，说明不在元素头部，所以需要将该元素移动到头部位置
                insert(moveV._el, container, oStartV._el)
                // 因为这是双边比较不存在的特殊情况，虽然将对应的真实 DOM 移走了，
                // 但是该虚拟节点还是在遍历的规则内，所以设置空 undifined ，方便后续判断
                oChild[fIndex] = undefined
                // 相当于旧节点内部已经特殊处理过，这个时候新节点的头部节点顺序改变
                nStartV = nChild[++nStartIndex]
            }
        }
    }
}
```

这样多加了一层判断后，就兜底了双边比较后可能不存在可复用节点的情况，如果对比过程中发现内部存在可复用节点，则将其提升到旧节点的头部位置——因为双边比较不存在可复用的场景下，新节点的角标是处在头部位置的。当旧节点内部处理完后，新节点按顺序向下执行，所以 ```++```，而匹配的旧节点内部的节点则还是要占位的，只不过设置为 ```undefined```，表示该节点已经处理过了。

而新增的节点同样是符合这个兜底的情况的，修改如下：

```js
function doubleEndDiff(n1, n2, container) {
    // 省略
    while (oStartIndex <= oEndIndex && nStartIndex <= nEndIndex) {
        // ... 省略
        else {
            const fIndex = oChild.findIndex(v => v.key === nStartV.key)
            // 这里做了优化
            if (fIndex > 0) {
                // 省略
            }
            // fIndex 
            else {
                patch(null, nStartV, container, oStartV._el)
                nStartV = nChild[++nStartIndex]
            }
        }
    }
}
```

注意，如果说新增的节点，在双边比较后找不到，旧节点的内部也找不到，那么它也一定是在头部位置的。那在旧节点中的操作就是将其插入到当前头部节点之前，然后新节点这边继续往下走。

对于卸载的情况则是，新节点都已经执行完了，这个时候 ```nStartIndex > nEndIndex```，循环结束，但是旧节点中还存在未执行的节点，所以 ```oStartIndex < oEndIndex```，修改如下：

```js
function doubleEndDiff(n1, n2, container) {
    // 省略

    while (oStartIndex <= oEndIndex && nStartIndex <= nEndIndex) {
        // 省略
    }

    // 卸载旧节点
    for (let i = oStartIndex; i < oChild.length; i++) {
        unmount(oChild[i])
    }
}
```

至这里，我们已经了解了如何实现一个双边算法，知晓了如何进行 4 步判断，知晓了如果可复用场景都不存在时的如何挂载，也知晓了如何在循环结束后卸载还未执行的旧节点。更进一步的揭开了 diff 算法的神秘面纱。完整代码如下：

::: details 代码详情
@[code](../source/v.0.0.14/index.js)
:::