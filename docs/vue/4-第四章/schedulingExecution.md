---
title: 调度执行
---

问题：如何在不更改代码位置的情况下，让执行顺序发生改变？

#### 实验
打印以下输出结果
```js
effect(() => console.log(p.foo))

p.foo++

console.log('结束了')
```
![图片](/img/08.png)
::: details 详情代码
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
    console.log(p.foo)
}
effect(useFn)

p.foo++

console.log('结束了');
```
:::
结果：打印是按照正常顺序执行的。   
目标：让 2 放在最后打印。  
分析：2 其实是执行的副作用函数打印的，更改 2 的打印顺序，其实就是控制在执行副作用函数时，让其异步执行。锁定范围及实现条件——trigger 函数内（set 监听区间）及 setTimeout、Promise 等异步钩子。  
实现如下：
```js
newDeps && newDeps.forEach(fn => {
    if (fn !== activeEffect) {
        setTimeout(() => fn(), 100) // 在此加异步
    }
})
```

![图片](/img/09.png)

结果：能正常实现，但是有个问题——不能这么做，要考虑其他不需要异步的场景。  
分析：  
1、一般这种情况下，可以加回调或者参数，满足某一条件下时执行对应逻辑，所以分析得知，trigger 在循环执行当前副作用时是一定会有 if...else... 这种条件的，满足的就执行具体逻辑，不满足的那就 fn 兜底。  
2、好，剩下的一部分就是如何满足执行特定的条件了。分析发现，回调或者入参等都是可以作为参数传入的，那当前响应式逻辑里满足这一条件的是只有当前正在执行的副作用函数——activeEffect 是能直接满足的。但 activeEffect 是一个函数对象，指向的是一个地址，单独加参数是加不了的，就只能挂载属性。所以，effectFn 就要再加一个属性，这个属性用于执行副作用函数时使用。  
3、那这个属性如何加呢？分析发现，包裹副作用函数的 effect 钩子是把要执行的具体逻辑作为入参接收的，在不能改变要执行的代码的前提下，就只能再开辟一个参数。所以，类似于可选配的参数场景就出现了。

简单实现如下：
```js
function effect(fn, options) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn // 将要执行的副作用函数指向 effectFn
        effectStack.push(activeEffect) // 压栈
        fn() // 当前的副作用函数里保留了要执行的入参指向并执行
        effectStack.pop() // 弹栈
        activeEffect = effectStack.at(-1)
    }
    effectFn.options = options
    effectFn.deps = [] // 存储依赖集合
    effectFn()
}

const trigger = (target, prop) => {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(prop)
    const newDeps = new Set(deps)
    newDeps && newDeps.forEach(effectFn => {
        if (effectFn !== activeEffect) { // 新增
            if (effectFn.options) {
                effectFn.options(effectFn)
            } else {
                effectFn()
            }
        }
    })
}

effect(useFn, (fn) => setTimeout(fn))
```
![图片](/img/09.png)

::: details 详情代码
```js
// 响应式的基本实现
const data = { foo: 1 }

let activeEffect
let effectStack = []
function effect(fn, options) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn // 将要执行的副作用函数指向 effectFn
        effectStack.push(activeEffect) // 压栈
        fn() // 当前的副作用函数里保留了要执行的入参指向并执行
        effectStack.pop() // 弹栈
        activeEffect = effectStack.at(-1)
    }
    effectFn.options = options
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
    newDeps && newDeps.forEach(effectFn => {
        if (effectFn !== activeEffect) { // 新增
            if (effectFn.options) {
                effectFn.options(effectFn)
            } else {
                effectFn()
            }
        }
    })
}

const p = new Proxy(data, handler)

function useFn() {
    console.log(p.foo)
}
effect(useFn, (fn) => setTimeout(fn))

p.foo++

console.log('结束了');
```
:::

结果：能正常执行，结果也能实现，但看起来不优雅，且 options 作为接收入参太单一了，修改如下：

```js
// 响应式的基本实现
const data = { foo: 1 }

let activeEffect
let effectStack = []
function effect(fn, options) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn // 将要执行的副作用函数指向 effectFn
        effectStack.push(activeEffect) // 压栈
        fn() // 当前的副作用函数里保留了要执行的入参指向并执行
        effectStack.pop() // 弹栈
        activeEffect = effectStack.at(-1)
    }
    effectFn.options = options
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
    const effectsToRun = new Set()
    deps && deps.forEach(effectFn => effectFn !== activeEffect && effectsToRun.add(effectFn))
    effectsToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}

const p = new Proxy(data, handler)

function useFn() {
    console.log(p.foo)
}

const useOptions = {
    // 异步回调标识
    scheduler(fn) {
        setTimeout(fn)
    }
}
effect(useFn, useOptions)

p.foo++

console.log('结束了');
```