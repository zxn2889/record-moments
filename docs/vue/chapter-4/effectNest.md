---
prev:
    text: 响应式实现过程
    link: /vue/chapter-4/proxyAchieve.md
next:
    text: 避免无限递归
    link: /vue/chapter-4/solvingInfiniteRecursion.md
---

我们知道组件是能嵌套的，那 effect 能不能嵌套？如果能嵌套要怎么办？

#### 实验
```js
function useFn() {
    effect(() => console.log('text', p.text))
    document.body.innerHTML = p.ok
}
effect(useFn)

setTimeout(() => {
    p.ok = false
}, 2000)
```
![图片](/img/06.png)
::: tip
实现结果发现，effect 可以嵌套，但如果嵌套的位置靠前，影响之前的副作用结果。且延时 2s 后修改 ok 属性值，因为当前副作用函数包裹嵌套的副作用，所以嵌套层又执行了一遍。
:::
这就导致几个问题出现：一、如果嵌套的副作用函数在顶部位置，则会影响之前的副作用函数实现；二、修改了包裹层的副作用函数关联的属性后，嵌套层的副作用函数会执行。

思路：副作用函数能嵌套，说明 activeEffect 指向会变；嵌套层执行完后，包裹层没有执行，说明 activeEffect 没有变回来。所以，只需要控制住在不同嵌套层时 activeEffect 的指向就好了。

```js
// 响应式的基本实现
const data = { ok: true, text: 'hello world' }

let activeEffect
let effectStack = []
function effect(fn) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn // 将要执行的副作用函数指向 effectFn
        effectStack.push(activeEffect) // 压栈
        fn() // 当前的副作用函数里保留了要执行的入参指向并执行
        effectStack.pop() // 弹栈
        activeEffect = effectStack.at(-1)
    }
    effectFn.deps = [] // 存储依赖集合
    effectFn()
}

const cleanup = (effectFn) => {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i];
        deps.delete(effectFn)
    }
    effectFn.deps.length = 0
}

let bucket = new WeakMap()

const handler = {
    get(target, prop) {
        track(target, prop)
        return target[prop]
    },
    set(target, prop, nVal) {
        target[prop] = nVal
        trigger(target, prop)
    }
}

const track = (target, prop) => {
    if (!activeEffect) return target[prop]
    let depsMap = bucket.get(target)
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()))
    }
    let deps = depsMap.get(prop)
    if (!deps) {
        depsMap.set(prop, (deps = new Set()))
    }
    deps.add(activeEffect)
    activeEffect.deps.push(deps)
}

const trigger = (target, prop) => {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(prop)
    const newDeps = new Set(deps)
    newDeps && newDeps.forEach(fn => fn())
}

const p = new Proxy(data, handler)

function useFn() {
    effect(() => console.log('text', p.text))
    document.body.innerHTML = p.ok
}
effect(useFn)

setTimeout(() => {
    p.ok = false
}, 2000)
```
::: tip
使用了压栈/弹栈思想，只要让 activeEffect 始终指向栈顶，则副作用的更新就不会有问题。
:::