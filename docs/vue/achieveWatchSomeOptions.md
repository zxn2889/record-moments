---
prev:
    text: 实现 watch
    link: /vue/achieveWatch.md
---

朋友们，上一节我们完成了 watch 的基本实现，现在我们学习如何让它立即执行与实现回调的调度执行。

我们知晓立即执行是代码执行到这里就立即执行的，不管其他。所以就不能等待要监听的值改变后被动触发。这就要有一个开关，能控制住这段逻辑——immediate。且这段逻辑是在 watch 钩子内实现的，且还要有新值与旧值，实现如下：

```js
// ...

function watch(source, cb, options = {}) {
    let getter

    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }

    let nVal, oVal

    const job = () => {
        nVal = effectFn()
        cb(nVal, oVal)
        oVal = nVal
    }

    const effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            job()
        }
    })

    if (options.immediate) {
        job()
    } else {
        oVal = effectFn()
    }
}

// ...

watch(() => p.foo, callBack, { immediate: true })
```

![图片](/img/17.png)

完美实现，且 oVal 为 undefined 符合预期——因为没有定义初始值。好，那如何让 DOM 执行完之后再执行回调呢。所以，还需要有一个开关，实现如下：

```js
// ...

function watch(source, cb, options = {}) {
    let getter

    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }

    let nVal, oVal

    const job = () => {
        nVal = effectFn()
        cb(nVal, oVal)
        oVal = nVal
    }

    const effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            if (options.flush) { // 新增
                const pro = Promise.resolve()
                pro.then(() => foo())
            } else {
                job()
            }
        }
    })

    if (options.immediate) {
        job()
    } else {
        oVal = effectFn()
    }
}

// ...

watch(() => p.foo, callBack, { immediate: true, flush: true }) // flush 为 true 代表 DOM 更新完后再执行回调
```

::: details 详情代码
```js
// 响应式的基本实现
const data = { foo: 1, bar: 3, cat: { age: 1 } }

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

function callBack(nVal, oVal) {
    console.log('执行了 callback');
    console.log('nVal', nVal);
    console.log('oVal', oVal);
}

function watch(source, cb, options = {}) {
    let getter

    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }

    let nVal, oVal

    const job = () => {
        nVal = effectFn()
        cb(nVal, oVal)
        oVal = nVal
    }

    const effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            if (options.flush) {
                const pro = Promise.resolve()
                pro.then(() => foo())
            } else {
                job()
            }
        }
    })

    if (options.immediate) {
        job()
    } else {
        oVal = effectFn()
    }
}

function traverse(value, seen = new Set()) {
    if (typeof value !== 'object' || value === null || seen.has(value)) return

    seen.add(value)

    for (const k in value) {
        traverse(value[k], seen) // 新增
    }

    return value // 新增
}

watch(() => p.foo, callBack, { immediate: true, flush: true })
```
:::