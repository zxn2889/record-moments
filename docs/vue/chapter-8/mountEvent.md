---
prev:
    text: 卸载节点的几种情况
    link: /vue/chapter-8/unmountVnode.md
next:
    text: 更新子节点
    link: /vue/chapter-8/updateChildVnode.md
---

朋友们，上节我们学习了如何卸载的基本逻辑，这节我们学习如何去挂载事件，及对应的几种情况。

事件也是属性的一种，所以，事件的逻辑是放在 props 内的，如下：

```js
const vnode = {
    type: 'h1',
    props: {
        id: 'foo',
        onClick: () => {
            console.log('clicked first level');
        }
    },
    // 省略
}
```

对应的实现逻辑，如下：

```js
function patchProps(key, el, propVal) {
    // 在目标元素上添加事件
    // 注意：事件全部以 on 开头
    if (/^on/.test(key)) {
        const type = key.slice(2).toLowerCase()
        el.addEventListener(type, propVal)
    }

    // 省略
}
```

这里我们发现，只要 vnode 中的 props 属性里含有以 on 开头就会视为事件。但是前文也提到过，vnode 是会更新的。那如果 vnode 更新了，且更改的就是事件，这种情况下如果是删除之前的事件，然后再添加新的事件会多出删除、再添加的操作，这里换种方式，如下：

```js
function patchProps(key, el, propVal) {
    if (/^on/.test(key)) {
        let invoker = el._evi
        if (propVal) {
            if (!invoker) {
                invoker = el._evi = (e) => invoker.value(e)
                invoker.value = propVal
                const type = key.slice(2).toLowerCase()
                el.addEventListener(type, invoker)
            } else {
                invoker.value = propVal
            }
        } else {
            if (invoker) {
                el.removeEventListener(type, invoker)
            }
        }
    }

    // 省略
}
```

这里我们创建了一个虚拟的 invoker，并将其和 DOM 元素的 ```_evi``` 属性关联，并将真正的函数赋值给 ```invoker.value``` 属性，然后将其作为真正函数的代指作为事件参数传入。这样，有更新时只需要将更新的属性重新赋值给 ```invoker.value``` 属性，避免了先删除、再添加的资源浪费。

但是，元素上是可以绑定多个事件类型的，且同一个类型的还能绑定多个事件。对于前者，我们采用对象的 ```key-value``` 结构存取；对于后者，我们用循环的方式依次调用。如下：

```js
function patchProps(key, el, propVal) {
    if (/^on/.test(key)) {
        let invokers = el._evi || (el._evi = {})
        let invoker = invokers[key]
        if (propVal) {
            if (!invoker) {
                invoker = el._evi[key] = (e) => {
                    if (Array.isArray(invoker.value)) {
                        invoker.value.forEach(fn => fn(e))
                    } else {
                        invoker.value(e)
                    }
                }
                invoker.value = propVal
                const type = key.slice(2).toLowerCase()
                el.addEventListener(type, invoker)
            } else {
                invoker.value = propVal
            }
        }

        // 省略
    }

    // 省略
}
```

::: tip
采用 ```key-value``` 的结构能让我们知晓，当前绑定的是哪种事件类型；而 ```invoker.value``` 的判断，能让我们知晓当前事件类型上绑定的是哪种结构。当然，数组的结构只是举例，有可能还存在 ```string``` 等。
:::

但是，如果事件的触发有先后顺序呢，比如：

```js
const hk = ref(false)

const vnode = {
    type: 'h1',
    props: {
        id: 'foo',
        onClick: hk.value ? () => {
            console.log('clicked first level');
        } : {}
    },
    children: [
        {
            type: 'p',
            props: {
                class: 'baz',
                onClick: () => {
                    hk.value = !hk.value
                }
            },
            children: 'Hello World!'
        }
    ]
}
```

这种情况下，父节点的事件是受到子节点的影响的，正常情况下是父节点初始时没有绑定对应的事件，点击子节点时不会父节点对应的函数，但是，事实上触发了。这是因为内部机制的问题，事件向上冒泡的过程中，因为追踪到了 ```hk.value``` 的变化，导致父节点触发。优化的思路：‘子节点触发的时间在前，父节点更新触发的时间在后，通过时间做判断’，如下：

```js
function patchProps(key, el, propVal) {
    if (/^on/.test(key)) {
        let invokers = el._evi || (el._evi = {})
        let invoker = invokers[key]
        if (propVal) {
            if (!invoker) {
                invoker = el._evi[key] = (e) => {
                    if (e.timeStamp < invoker.attachTime) return false
                    if (Array.isArray(invoker.value)) {
                        invoker.value.forEach(fn => fn(e))
                    } else {
                        invoker.value(e)
                    }
                }
                invoker.value = propVal
                invoker.attachTime = performance.now()
                const type = key.slice(2).toLowerCase()
                el.addEventListener(type, invoker)
            } else {
                invoker.value = propVal
            }
        }

        // 省略
    }

    // 省略
}
```

完整代码如下：

::: code-group
<<< ../source//v.0.0.10/index.html [index.html]
<<< ../source//v.0.0.10/index.js [index.js]
:::

::: tip 注意
这里我是使用的前面模拟响应式实现的自己封装的插件，虽然没有模拟出向上冒泡过程中父节点触发函数的执行，但是不影响正常使用。如果想要实现文章中提到的效果，请使用 ```vue``` 官方插件。
:::

至这里，我们学习了如何在 props 属性中绑定事件，知道了事件有不同的类型、元素可以同时绑定多个事件类型、每个类型可以绑定数量不一的事件、事件的书写方法，及事件向上冒泡过程中先后顺序的执行问题处理等。也发现了在实现的过程中多处都使用了连等赋值的相互关联的写法，揭开了事件的神秘一角。