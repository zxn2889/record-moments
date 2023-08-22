---
prev:
    text: effect嵌套实现过程
    link: /vue/effectNest.md
next:
    text: 调度执行
    link: /vue/schedulingExecution.md
---

问题：如果出现了自增类操作怎么办？有什么影响？要怎么解决？

```js
// 响应式的基本实现
const data = { foo: 1 }

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
    p.foo++
}
effect(useFn)
```
![图片](/img/07.png)

结果：  
发现缓存溢出了。

分析：  
溢出——数字一直在增大，说明 foo 一直在家，跟 foo 自增有关的逻辑是 foo++，用 ES5 的方法分析，foo++ 等于 foo = foo + 1。所以，完整的效果是：
```js
p.foo = p.foo + 1
```
即：foo 属性这里，既进行了取值，又进行了赋值。所以会分别触发依赖收集（get）和调用副作用函数（set）逻辑。再继续分析，执行副作用时会重新执行当前副作用函数，即：
```js
function useFn() {
    p.foo++
}
```
所以，代码就会再次走一遍取值和赋值的操作，来回重复，就有了溢出的效果。

好，那么如何去解决。分析发现，赋值和取值是在同一个钩子函数内，当这个钩子函数作为当前副作用函数时，就会触发这样的效果，所以要加个判断条件。

```js
// 响应式的基本实现
const data = { foo: 1 }

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
    newDeps && newDeps.forEach(fn => {
        if (fn !== activeEffect) { // 新增
            fn()
        }
    })
}

const p = new Proxy(data, handler)

function useFn() {
    p.foo++
}
effect(useFn)
```

::: tip
当在执行副作用函数那里时，判断 Set 集合里要触发的副作用和当前副作用是否相等，相等则不执行。
:::