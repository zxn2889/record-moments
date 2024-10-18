---
title: 实现 computed
---

&emsp;&emsp;朋友们，到这里响应式的学习就进入另一个阶段了。前面我们学习了如何实现一个简单的响应式，拆分出了 track 跟踪函数和 trigger 触发副作用函数、及特定情况下的追踪调度等，对响应式有了一个简单的系统的了解。现在，将在此基础上实现 computed 的逻辑，一同进步吧。

&emsp;&emsp;我们知晓 computed 实现的目标是需要时进行缓存计算，即用到它时再进行计算+缓存。计算是有结果和过程的，结果怎么拿呢——通过计算完成后返回，即 return；而过程呢——会触发 track，甚至 trigger 函数。而且还要缓存下来，避免每次读取时都要计算，所以，针对这些情况做处理就是：
1. 需要时才计算的判断条件，
2. 结果要 return，
3. 要把计算过程都执行完再 return，
4. return 的结果要缓存，
5. 需要一个 computed 函数。

&emsp;&emsp;针对第一条我们发现，当前的 effect 函数不能满足当前场景，因为我们的 effect 包裹的副作用函数是立即执行的，要进行改造，如下：
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
    if (!options.lazy) { // lazy 不为真时立即执行
        effectFn()
    }
}

const useOptions = {
    lazy: false
}
```

&emsp;&emsp;发现，lazy 为 false 时，是能满足我们之前实现的逻辑的，但是为 true 呢。结合 lazy 要实现的目标——控制副作用函数的立即执行，即，对代码改动如下：

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
    if (!options.lazy) { // lazy 不为真时立即执行
        effectFn()
    } else {
        return effectFn // 新增
    }
}
```

&emsp;&emsp;这样处理的话就一定程度上满足了为 true 时不立即触发副作用函数，而是改为抛出去这个执行的逻辑，交给其他场景下适时调用。但还可以再优化下：

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
    if (!options.lazy) { // lazy 不为真时立即执行
        effectFn()
    }
    return effectFn
}
```

&emsp;&emsp; 这样就避免了等号两边都要计算的情况，如：
```js
// 例子，没有具体意义
const eff = effect()
```

&emsp;&emsp; 这样的话，第一条就满足了，代码如下：
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
    if (!options.lazy) { // lazy 不为真时立即执行
        effectFn()
    }
    return effectFn
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
    lazy: false
}
effect(useFn, useOptions)

p.foo++

console.log('结束了');
```
:::

&emsp;&emsp;在此基础上，我们尝试下获取下 lazy 为 true 时结果，发现拿不到，如下：

```js
function useFn() {
    return p.foo
}

const useOptions = {
    lazy: true
}

const effectResult = effect(useFn, useOptions)

console.log('effectResult', effectResult());
```

![图片](/img/10.png)

修改如下：

```js
function effect(fn, options) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn // 将要执行的副作用函数指向 effectFn
        effectStack.push(activeEffect) // 压栈
        const fnRes = fn() // 当前的副作用函数里保留了要执行的入参指向并执行
        effectStack.pop() // 弹栈
        activeEffect = effectStack.at(-1)
        return fnRes
    }
    effectFn.options = options
    effectFn.deps = [] // 存储依赖集合
    if (!options.lazy) { // lazy 不为真时立即执行
        effectFn()
    }
    return effectFn
}

// ...

function useFn() {
    return p.foo
}

const useOptions = {
    lazy: true
}

const effectResult = effect(useFn, useOptions)

console.log('effectResult', effectResult());
```

&emsp;&emsp;第二条也已经实现，为什么要给 effectFn 加一个返回值，因为 fn 才是真正的要执行的副作用函数，effectFn 只是我们包裹后的一个副作用，真正要计算的不是它，所以 fn 才要加，不然拿不到。

&emsp;&emsp;好，代码再优化以下，加一个 computed 函数：

```js
function useFn() {
    return p.foo
}

function computed(fn) {
    
    const useOptions = {
        lazy: true
    }

    const effectResult = effect(fn, useOptions)

    return effectResult()
}

const res = computed(useFn)

console.log('res', res);
```

![图片](/img/11.png)

&emsp;&emsp;这样的话就有了一个计算器的雏形，当然还很简陋。实际工作中我们需要 res.value 才能拿到具体的值，明显这样是不行的，改造如下：

```js
function computed(fn) {
    
    const useOptions = {
        lazy: true
    }

    const obj = {
        get value() {
            return effect(fn, useOptions)
        }
    }

    return obj
}

const res = computed(useFn)
```

::: tip
发现，我们调用的明明是 res.value，但却返回了具体的值了；而在 computed 内部函数返回的对象里，value 是一个函数啊——这涉及到了一个知识点——getter 和 setter。对象中特定的访问属性，用于可能会有一些动态逻辑，但又不想显示操作的场景。使用 get 后，就有了一个“伪属性”——函数的名，但对象中不能同时存在相同的属性名哦。
:::

&emsp;&emsp;发现第 5 条也已经实现，但是要的计算属性缓存还没有加上，导致每次调用都会重新计算，所以继续优化，如下：

```js
function computed(fn) {
    
    const useOptions = {
        lazy: true
    }

    let dity = false // false 表示未计算过
    let res

    const obj = {
        get value() {
            if (!dity) {
                console.log('01');
                res = effect(fn, useOptions)
                dity = true
            }
            return res()
        }
    }

    return obj
}

const res = computed(useFn)

console.log('res', res.value);
console.log('res', res.value);
console.log('res', res.value);
```

![图片](/img/12.png)

&emsp;&emsp;实验发现，这种方式能实现计算属性的缓存效果。但代码还可以继续优化，优化如下：

```js
function computed(fn) {
    
    const useOptions = {
        lazy: true
    }

    let dity = false // false 表示未计算过
    const effectResult = effect(fn, useOptions)

    const obj = {
        get value() {
            if (!dity) {
                value = effectResult()
                dity = true
            }
            return value
        }
    }

    return obj
}
```

&emsp;&emsp;但到这里发现一个问题——如果读取过 value 值后，我改变了副作用函数中要监听的值呢？如：

```js
const res = computed(useFn)

console.log('res', res.value);

p.foo = 2

console.log('res update', res.value);
```

![图片](/img/13.png)

&emsp;&emsp;发现值并没有更新啊，这怎么办？

&emsp;&emsp;风暴：  
&emsp;&emsp;A：肯定是判断是否重新计算缓存的条件有问题对不对？  
&emsp;&emsp;B：对，有道理，嗯？不对。  
&emsp;&emsp;A：怎么不对了？  
&emsp;&emsp;B：不是还更改了 foo 的值么，它是我们监听的对象属性啊。  
&emsp;&emsp;A：咦！说的还蛮对的，要怎么改呢？  
&emsp;&emsp;B：是啊，要怎么改啊！？  

&emsp;&emsp;分析发现，是修改了属性值后，触发了要执行的副作用函数，所以要在这里搞事情——执行完后把 dity 的值给改回来。要怎么加呢，如下：

```js
function computed(fn) {
    
    let dity = false // false 表示未计算过

    const useOptions = {
        lazy: true,
        scheduler() {
            dity = false // 新增
        }
    }

    const effectResult = effect(fn, useOptions)

    const obj = {
        get value() {
            if (!dity) {
                value = effectResult()
                dity = true
            }
            return value
        }
    }

    return obj
}
```

&emsp;&emsp;分析一下，我们借用了 scheduler 属性在这里做了个回调处理，这里 dity 的引用指向并没有变，所以能实现重新计算的想法。具体展示一下：
1. 执行第一遍的时候，读取的 foo 不会触发中心执行逻辑，所以 computed 方法里的 scheduler 属性不会被触发；
2. 当执行到 p.foo = 2 时，监听到改变并执行 trigger 函数时，因为 lazy 设为了 true，所以包裹真正副作用函数的 effectFn 不会被执行，而是返回了手动引用项，就像是按住了暂停，但是 dity 属性值已经变为 false 了；
3. 当再次执行到 res.value 时，一切才开始继续执行，就像第一次一样。
这就是它的完整逻辑。

::: details 详情代码
```js
// 响应式的基本实现
const data = { foo: 1 }

let activeEffect
let effectStack = []
function effect(fn, options = {}) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn // 将要执行的副作用函数指向 effectFn
        effectStack.push(activeEffect) // 压栈
        const fnRes = fn() // 当前的副作用函数里保留了要执行的入参指向并执行
        effectStack.pop() // 弹栈
        activeEffect = effectStack.at(-1)
        return fnRes
    }
    effectFn.options = options
    effectFn.deps = [] // 存储依赖集合
    if (!options.lazy) { // lazy 不为真时立即执行
        effectFn()
    }
    return effectFn
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
        console.log('01', effectFn.options);
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}

const p = new Proxy(data, handler)

function useFn() {
    document.body.innerHTML = p.foo
    return p.foo
}

function computed(fn) {
    
    let dity = false // false 表示未计算过

    const useOptions = {
        lazy: true,
        scheduler() {
            dity = false // 新增
        }
    }

    const effectResult = effect(fn, useOptions)

    const obj = {
        get value() {
            if (!dity) {
                value = effectResult()
                dity = true
            }
            return value
        }
    }

    return obj
}

const res = computed(useFn)

console.log('res', res.value);

p.foo = 2

console.log('res update', res.value);
```
:::

&emsp;&emsp;貌似到这里就已经很完美了，但是还有一个问题，如果 computed 返回值在另外一个 effect 函数里引用了怎么办？

```js
const res = computed(useFn)

console.log('res', res.value);

effect(() => console.log('other', res.value))

p.foo++
```

&emsp;&emsp;发现引用没有关系，但是更改 foo 的值后，effect 没有更新。这就出现问题了，不是计算属性的调用的话，那我是不是要重新执行，对不对。所以，修改如下：

::: details 详情代码
```js
// 响应式的基本实现
const data = { foo: 1 }

let activeEffect
let effectStack = []
function effect(fn, options = {}) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn // 将要执行的副作用函数指向 effectFn
        effectStack.push(activeEffect) // 压栈
        const fnRes = fn() // 当前的副作用函数里保留了要执行的入参指向并执行
        effectStack.pop() // 弹栈
        activeEffect = effectStack.at(-1)
        return fnRes
    }
    effectFn.options = options
    effectFn.deps = [] // 存储依赖集合
    if (!options.lazy) { // lazy 不为真时立即执行
        effectFn()
    }
    return effectFn
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
    deps && deps.forEach(effectFn => {
        if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
        }
    })
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
    return p.foo
}

function computed(fn) {
    let value
    let dirty = true // 这里修改了下，为 true 时代表没有计算过

    const useOptions = {
        lazy: true,
        scheduler() {
            if (!dirty) {
                dirty = true // 新增
    
                trigger(obj, 'value')
            }
        }
    }

    const effectResult = effect(fn, useOptions)

    const obj = {
        get value() {
            if (dirty) {
                value = effectResult()
                dirty = false
            }
            track(obj, 'value')
            return value
        }
    }

    return obj
}

const res = computed(useFn)

effect(() => console.log('other', res.value))

p.foo++
```
:::

&emsp;&emsp;但是这样有个问题——单独打印日志的时候，报无限循环问题，不知道为什么？书上也没说，不知道要不上 Q 一下作者呢还是留作作业哩。

```js
console.log(res.value)
```