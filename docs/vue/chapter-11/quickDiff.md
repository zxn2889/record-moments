---
prev:
    text: 双端比较 diff
    link: /vue/chapter-10/doubleEndDiff.md
---

朋友们，上节我们学习了双端 diff 算法，知晓了比较 4 步。这节我们将学习快速 diff 算法，实现在性能上的更进一步。

快速 diff 算法高效之处在于：

1. 借鉴了文本预处理方法
2. 借鉴了最长递增子序列两种思路

在正式开始之前，我们了解下这两个概念的含义，以便更好的代入理解。那什么是文本预处理？我们看下面的两段文本：

```js
text1: 我写完了
text2: 我也写完了
```

通过对比发现，```text1、text2``` 两者的文本节点内容只差了一个‘也’字，那么，也就是说，只要 ```text2``` 的文本节点内容更新这个字，就能实现更新的最小消耗。那么，这种设计思路在两组新旧节点的比较中则表现为：

1. 从新旧节点的头部节点开始比较，直到发现不可复用的节点
2. 从新旧节点的尾部节点开始比较，直到发现不可复用的节点

::: tip 注意
新旧节点从头部节点开始比较值的起始角标都是 0，而尾部节点的因为各自的长度可能不同，起始角标也有可能不同。
:::

那什么是最长递增子序列？它的定义为：在不改变节点先后顺序的情况下，找到一组节点树中最长的连续递增的一组节点。如：

```js
array: [0, 3, 7, 5, 12]
```

这其中，最长的一组递增序列是 ```[0, 3, 7, 12]```，当然，子序列可能有多个，但只取其中最长的一个。

好，明白了这些概念，我们开始模拟，准备新旧节点如下：

```js
const oVnode = {
    type: 'div',
    children: [
        { type: 'p', key: 1, children: 'No.1' },
        { type: 'p', key: 2, children: 'No.2' },
        { type: 'p', key: 3, children: 'No.3' }
    ]
}

const nVnode = {
    type: 'div',
    children: [
        { type: 'p', key: 1, children: '1' },
        { type: 'p', key: 4, children: '4' },
        { type: 'p', key: 2, children: '2' },
        { type: 'p', key: 3, children: '3' },
    ]
}
```

发现，新旧节点树中，前置节点从起始节点至 ```key = 1``` 处，都相同；后置节点从 ```key = 3``` 处到 ```key = 2``` 处都相同，不同的仅为 ```key = 4 ``` 的节点。而我们需要记录的就是，前置节点和后置节点的角标是在哪个位置开始不同的。

::: tip 注意
前置节点指的是从起始角标对应的节点至找到不可复用的节点之间的范围；后置节点指的是从尾部开始的起始角标对应的节点到找到不可复用的节点之间的范围。
:::

对应逻辑如下：

```js
function quickDiff(n1, n2, container) {
    const oChild = n1.children
    const nChild = n2.children
    const startIndex = 0
    
    for (let i = 0; i < nChild.length; i++) {
        if (nChild[i].key === oChild[i].key) {
            patch(oChild[i], nChild[i], container)
            startIndex++
        } else {
            break
        }
    }

    const oLen = oChild.length
    const nLen = nChild.length
    const mLen = Math.max(oLen, nLen)
    const oLastIndex = oLen - 1
    const nLastIndex = nLen - 1

    for (let i = mLen; i >= 0; i--) {
        if (nChild[nLastIndex].key === oChild[oLastIndex].key) {
            patch(oChild[oLastIndex], nChild[nLastIndex], container)
            oLastIndex--
            nLastIndex--
        } else {
            break
        }
    }
}
```

在这段逻辑中，我们发现 ```startIndex = 1```、```oLastIndex = 0```、```nLastIndex = 1```，这符合 ```key = 4```的节点为不可复用的逻辑。但是，发现逻辑执行完毕后 ```key = 4``` 的节点还没有执行。但是，要如何知道其是挂载还是新增呢？修改如下：

```js
function quickDiff(n1, n2, container) {
    // 省略

    // 如果旧节点循环结束，且新节点还存在未执行情况，则未执行节点为新节点，需循环挂载
    if (oLastIndex < startIndex && nLastIndex >= startIndex) {
        for (let i = startIndex; i <= nLastIndex; i++) {
            const prevNode = nChild[startIndex - 1]
            let anchor
            if (prevNode) {
                anchor = prevNode._el.nextSibling
            } else {
                anchor = container._el
            }
            patch(null, nChild[startIndex], container, anchor)
        }
    }
}
```

但是，如果旧节点没有执行完，而新节点执行完了呢。修改如下：

```js
function quickDiff(n1, n2, container) {
    // 省略

    // 如果循环结束，且旧节点还存在有节点未执行情况，则未执行节点循环卸载
    if (nLastIndex < startIndex && oLastIndex >= startIndex) {
        for (let i = startIndex; i <= oLastIndex; i++) {
            unmount(oChild[i])
        }
    }
}
```

但是，如果循环结束后，新旧节点都还存在未执行完毕的情况，这种情况下上述的解决方案就不满足了。如以下的新旧节点：

```js
const oVnode = {
    type: 'div',
    children: [
        { type: 'p', key: 1, children: 'No.1' },
        { type: 'p', key: 2, children: 'No.2' },
        { type: 'p', key: 3, children: 'No.3' },
        { type: 'p', key: 4, children: 'No.4' },
        { type: 'p', key: 6, children: 'No.6' },
        { type: 'p', key: 5, children: 'No.5' }
    ]
}

const nVnode = {
    type: 'div',
    children: [
        { type: 'p', key: 1, children: '1' },
        { type: 'p', key: 3, children: '3' },
        { type: 'p', key: 4, children: '4' },
        { type: 'p', key: 2, children: '2' },
        { type: 'p', key: 7, children: '7' },
        { type: 'p', key: 5, children: '5' },
    ]
}
```

这种情况下内部未执行的节点数量很多，解决的方法有之前的简单 diff 算法，和双边 diff 算法；但是，前者需要嵌套循环，后者需要比较多步，不符合快速比较定义，所以排除。那如何更快的找到比较更新的、需要挂载的、和需要卸载的节点呢。思路：

1. 扁平化嵌套循环新旧节点方式
2. 采用 ```key-value``` 形式快速找到新旧节点中可复用节点关联
3. 借助最长递增子序列判断挂载、更新

代码如下：

```js
function quickDiff(n1, n2, container) {
    // 省略

    // 创建一个长度和新节点树中未执行节点数量一致的数组，并以 -1 填充
    // 目的：移动、挂载、更新旧节点
    // 存储值：当前角标下新节点对应可复用的旧节点的 key 值
    // 注意：该序列和新节点中未执行节点角标顺序一致
    const inCrementalArr = new Array(nLastIndex - startIndex + 1).fill(-1)

    // 创建新节点中未执行节点 key 与 角标 关联
    // 注意：是将新节点树中未执行的节点的 key 值与当前所在新节点树中的角标进行 key - value 格式绑定
    const nResetMapping = {}
    for (let i = startIndex; i <= nLastIndex; i++) {
        nResetMapping[nChild[i].key] = i
    }

    // 遍历旧节点中未执行节点，找到可复用节点，并执行相应操作
    for (let i = startIndex; i < oLastIndex; i++) {

        // 通过新节点未执行的节点树映射的 map 结构，找到旧节点中的 key 值是否在新节点中存在，
        // 如果存在，则新节点对应角标 > -1，如果不存在则卸载
        const k = nResetMapping[oChild[i].key]
        if (k > -1) {
            patch(oChild[i], nChild[k], container)

            // 关联填充数组中角标存储的旧节点中可复用的节点对应的角标
            inCrementalArr[k - startIndex] = i
        } else {
            unmount(oChild[i])
        }
    }
}
```

这里要注意到：

1. 创建的填充数组和新节点中未执行的节点数量是保持一致的
2. 采用了上下扁平化的循环方式，优化了嵌套循环结构
3. 通过 ```Object[key]``` 的访问属性的方式，快速找到新旧节点中可复用节点
4. 比较过程中如果存在可复用项则更新，没有则卸载；更新项为 patch 和关联当下旧节点可复用节点项的角标

这样，旧节点都更新完毕会后，卸载了不必要的节点，又更新了可复用节点的内容，但是新增节点和移动节点还没有处理，要如何知道这些呢？

1. 填充数组中得出的最长子序列长度小于当前数组的长度
2. 填充数组中存在 -1

前者告诉我们需要移动节点，后者则需要挂载，如下：

```js
function quickDiff(n1, n2, container) {
    // 省略

    // 取当前序列数组中的最长子序列
    const sonArr = lis(inCrementalArr)

    // 判断是否有新增节点
    const needAdd = inCrementalArr.includes(-1)

    // 如果有任一值为 true，则执行移动或挂载操作
    if (sonArr.length < inCrementalArr.length || needAdd) {

        // 取最长子序列尾部角标
        let s = sonArr.length - 1

        // 取填充数组的尾部角标
        // 注意：它和新节点中的未执行节点数组尾部角标保持一致
        let j = inCrementalArr.length - 1
        for (j; j >= 0; j--) {

            // 挂载新节点
            if (inCrementalArr[j] === -1) {

                // 当前节点角标
                const curIndex = j + startIndex

                // 当前节点
                const curV = nChild[curIndex]

                // 当前节点的下一节点
                const nextNode = nChild[curIndex + 1]

                // 如果当前节点的下一节点存在，则使用下一节点，否则 null——null会自动插入到尾部
                const anchor = nextNode ? nextNode._el : null

                patch(null, curV, container, anchor)
            } else if (j !== sonArr[s]) {

                // 当前节点角标
                const curIndex = j + startIndex

                // 当前节点
                const curV = nChild[curIndex]

                // 当前节点的下一节点
                const nextNode = nChild[curIndex + 1]

                const anchor = nextNode ? nextNode._el : null
                
                insert(curV._el, container, anchor)
            } else {
                s--
            }
        }
    }
}
```

::: tip 注意
关于获取最长子序列的算法有很多，大家可以自行尝试，完整代码中会附上一份源码。
:::

这样，需要挂载的新增节点和需要移动的节点就都处理完毕了。不够需要注意的是，移动的节点为当前虚拟节点对应的真实 DOM。因为在 patch 过程中，我们首先会 ```const el = _o_vnode._el = vnode._el```，所以，即使这里在更新的逻辑中使用的 ```nChild``` 对应的节点，但是该虚拟节点对应的真实节点还是是与之关联的旧节点对应的真实 DOM。但也发现，代码中重复的逻辑还是比较多的，所以优化后完整代码如下：

::: details 详细代码
@[code](../source/v.0.0.15/index.js)
:::

至这里，我们在 diff 节点的学习中，已经学习了简单的 diff 算法、双边 diff 算法、以及现在的快速 diff 算法，了解了不少比较新旧节点树的相关理念，也知晓了一些优化方法。比如相比较简单 diff 算法的双边 4 步、和相比较双边 4 步的前置/后置节点与最长子序列的概念、及优化嵌套循环的扁平化处理方式。至此，关于 diff 算法的学习就告一段落了，也代表着渲染器中最重要的 diff 揭开了它神秘的面纱。而我们也将转动目光，踏上新的学习征程。