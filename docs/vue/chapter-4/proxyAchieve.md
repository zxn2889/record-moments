---
title: 响应式实现过程
editLink: true
footer: true
next:
    text: effect嵌套实现过程
    link: /vue/chapter-4/effectNest.md
---

#### 基础的、简单的响应式实现
背景：监听 data.text 属性，2s 后重新赋值并更新在页面上
```js
// 响应式的基本实现
const data = { text: 'hello world' }

function effect() {
    document.body.innerHTML = p.text
}

const handler = {
    get(target, prop) {
        return target[prop]
    },
    set(target, prop, nVal) {
        if (prop === 'text') {
            target[prop] = nVal
            effect()
        }
    }
}
const p = new Proxy(data, handler)

effect()

setTimeout(() => {
    p.text = 'hello vue3'
}, 2000)
```
::: tip
逻辑的关键点就是 Proxy，当延时函数 2s 后更改了代理的 p.text 属性后，set 方法拦截到了变化并执行了 effect 方法。
:::
缺点：不够灵活——set 时才触发，且还是固定函数。更好的方法是，get 时就读取对应的副作用函数，set 时重新触发。

#### 稍微灵活点的响应式实现
```js
// 响应式的基本实现
const data = { text: 'hello world' }

function effect() {
    document.body.innerHTML = p.text
}

const bucket = new Set()

const handler = {
    get(target, prop) {
        bucket.add(effect) // 为什么这里一定是已知的 effect？ 不能是其他的函数名么？
        return target[prop]
    },
    set(target, prop, nVal) {
        target[prop] = nVal
        bucket.forEach(fn => fn())
        return true
    }
}
const p = new Proxy(data, handler)

effect()

setTimeout(() => {
    p.text = 'hello vue3'
}, 2000)
```
::: tip
这里发现定义了一个 bucket 对象，目的是作为副作用函数的收发中转———“桶”。当读取到对应的属性时，将副作用函数添加到“桶”里，当设置属性时把桶里的副作用函数拿出执行。
:::
缺点：
发现我提了一个“为什么”，因为实际工作中并不知晓开发者会定义什么名称，这种方式会显得生硬，称为硬编码。

#### 一个不那么硬编码的响应式实现
```js
// 响应式的基本实现
const data = { text: 'hello world' }

let activeEffect
function effect(fn) {
    activeEffect = fn
    fn()
}

const bucket = new Set()

const handler = {
    get(target, prop) {
        if (activeEffect) {
            bucket.add(activeEffect)
        }
        return target[prop]
    },
    set(target, prop, nVal) {
        target[prop] = nVal
        bucket.forEach(fn => fn())
        return true
    }
}
const p = new Proxy(data, handler)

function useFn() {
    document.body.innerHTML = p.text
}
effect(useFn)

setTimeout(() => {
    p.text = 'hello vue3'
}, 2000)
```
::: tip
发现这里定义了一个全局的方法名——activeEffect，且把要实现的功能通过入参的形式传到了 effect 函数里，并赋值于 activeEffect，这样就解决了硬编码的问题。
:::
缺点：似乎到这里一个简单的响应式实现已经很完美了，但是却存在一个不那么明显的问题，万一改变的是一个不存在的属性怎么办呢。

思路：接着上述问题发现，当设置不存在的属性时，副作用函数继续执行了，而真实的场景是我们不希望它执行。这就导致一个问题，我们需要把监听到的属性与对应的副作用函数关联起来，这样就能防止类似的情况出现。即——属性与副作用函数是一一对应的关系。
#### 一个对象、属性、副作用函数一一对应的响应式实现
```js
// 版本一
// 响应式的基本实现
const data = { text: 'hello world' }

let activeEffect
function effect(fn) {
    activeEffect = fn
    fn()
}

const bucket = new WeakMap()

const handler = {
    get(target, prop) {
        console.log('11');
        if (!activeEffect) return target[prop]
        if (!bucket.has(target)) {
            bucket.set(target, new Map())
        }
        if (!bucket.get(target).has(prop)) {
            bucket.get(target).set(prop, new Set())
        }
        bucket.get(target).get(prop).add(activeEffect)
        return target[prop]
    },
    set(target, prop, nVal) {
        console.log('22');
        target[prop] = nVal
        if (bucket.has(target)) {
            if (bucket.get(target).has(prop)) {
                bucket.get(target).get(prop).forEach(fn => fn())
            }
        } else {
            return
        }
    }
}
const p = new Proxy(data, handler)

function useFn() {
    document.body.innerHTML = p.text
}
effect(useFn)

setTimeout(() => {
    p.text = 'hello vue3'
}, 2000)
```
```js
// 版本二
// 响应式的基本实现
const data = { text: 'hello world' }

let activeEffect
function effect(fn) {
    activeEffect = fn
    fn()
}

const bucket = new WeakMap()

const handler = {
    get(target, prop) {
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
        return target[prop]
    },
    set(target, prop, nVal) {
        target[prop] = nVal
        const depsMap = bucket.get(target)
        if (!depsMap) return
        const deps = depsMap.get(prop)
        if (deps) deps.forEach(fn => fn())
    }
}
const p = new Proxy(data, handler)

function useFn() {
    document.body.innerHTML = p.text
}
effect(useFn)

setTimeout(() => {
    p.text = 'hello vue3'
}, 2000)
```
```html
关系图：
一：不同对象下的不同属性对应的不同副作用
target1
    -prop1
        -effect1
target2
    -prop2
        -effect2
二：同一对象下的不同属性对应的不同副作用
target
    -prop
        -effect1
        -effect2
三：同一对象下不同属性对应的相同副作用
target
    -prop1
        -effect
    -prop2
        -effect
四：同一对象下不同属性对应的不同副作用
target
    -prop1
        -effect1
    -prop2
        -effect2
```
::: tip
从一一对应关系上可以看到，target、prop、effect 都可能是多个，且包裹层级固定，即 target 包裹 prop，prop 包裹 effect。根据这样的关系找到对应的存储容器即可。可以看到，target 是 WeakMap 对象，prop 是 Map 对象，effect 是 Set 对象。其中，WeakMap 为弱引用对象，框架级别考虑到缓存溢出，当对应属性不存在时，会自动被垃圾回收机制回收。
:::
```js
// 版本三
// 响应式的基本实现
const data = { text: 'hello world' }

let activeEffect
function effect(fn) {
    activeEffect = fn
    fn()
}

const bucket = new WeakMap()

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
}

const trigger = (target, prop) => {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(prop)
    if (deps) deps.forEach(fn => fn())
}

const p = new Proxy(data, handler)

function useFn() {
    document.body.innerHTML = p.text
}
effect(useFn)

setTimeout(() => {
    p.text = 'hello vue3'
}, 2000)
```

问题：如果更改了一个属性，并在页面上呈现了最终的结果。这时且更新了一个其他的属性，该属性的变化虽然没有在页面上呈现，但确实触发了副作用函数更新——“两个属性同时变化，但我们只需要在页面上的属性变化触发副作用函数，不在页面上的不触发”，应该怎么解决？  
例如：
在改动此两处代码后，触发的依赖变更。  
![图片](/img/02.png)  
![图片](/img/03.png)  
![图片](/img/04.png)  
![图片](/img/01.png)  

思路：由 WeakMap、Map、Set 三者的关系图得知，只需要让包裹副作用的依赖集合（Set集）在每次触发更新前都给清空掉，然后触发时再添加上对应 prop 的依赖集合就好。
如图：
![图片](/img/05.png)
```js
// 响应式的基本实现
const data = { ok: true, text: 'hello world' }

let activeEffect
function effect(fn) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn // 将要执行的副作用函数指向 effectFn
        fn() // 当前的副作用函数里保留了要执行的入参指向并执行
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
    document.body.innerHTML = p.ok ? p.text : 'not'
}
effect(useFn)

setTimeout(() => {
    p.ok = false
}, 2000)
```