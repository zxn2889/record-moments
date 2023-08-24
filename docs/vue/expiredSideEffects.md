---
prev:
    text: 实现 watch 函数的立即执行与回调的调度执行
    link: /vue/achieveWatchSomeOptions.md
---

朋友们，我们已经学习了 watch 的基本实现原理，及响应的 options 选项。现在我们在此基础上再学习一些多次修改后触发执行副作用有先有后的情况。例如：

```js
// ...

let finalData
async function callBack(nVal, oVal) {
    const res = await fetch('/path/to/request')
    finalData = res
}

// ...

watch(foo, callBack)

p.foo++
p.bar++
```

当然，这个结果是不通的，因为请求路径并不是真实有效的。但能分析得知，如果要改变多个要监听的属性，那 watch 触发的回调是不是要执行多次。那涉及到异步请求这些，就会因为网络延时等出现或快或慢的情况，所以我们要对此进行处理。

那我们需要的是什么？需要的是最后一次触发改变时获得的最新的值。所以又要有一个开关了。我们回想一下，在实现 computed 的过程中，我们有一个 dirty 属性，控制是否重新计算。那这里我们也加一个开关，控制结果的是否返回。如：

```js
let finalData
let expired = false // false 代表没有过期
let delayTime = 1000

const fetchReq = (path, dTime = delayTime) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('请求路径：', path);
            resolve({
                code: '200',
                msg: '',
                data: {
                    dTime,
                    rst: 'The more recorded, the better.'
                }
            })
        }, dTime)
    })
}
async function callBack(nVal, oVal) {
    const res = await fetchReq('/path/to/request')
    if (!expired) {
        finalData = res
    }
    console.log('finalData', finalData);
}

// ...

p.foo++
delayTime = 100
p.bar++
```

为了方便模拟结果，这里把 fetch 重新封装模拟了一下请求，并把延时时间作为结果返回，好判断执行副作用函数后，结果返回的先后顺序。

![图片](/img/18.png)

这里发现，bar 属性明明是后发的，但结果反而提前返回了，这是不对的。所以，这就是要解决的问题。

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

let finalData
let expired = false // false 代表没有过期
let delayTime = 1000

const fetchReq = (path, dTime = delayTime) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('请求路径：', path);
            resolve({
                code: '200',
                msg: '',
                data: {
                    dTime,
                    rst: 'The more recorded, the better.'
                }
            })
        }, dTime)
    })
}
async function callBack(nVal, oVal) {
    const res = await fetchReq('/path/to/request')
    if (!expired) {
        finalData = res
    }
    console.log('finalData', finalData);
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

watch(p, callBack)

p.foo++
delayTime = 100
p.bar++
```
:::

我们已经知晓通过 expired 属性做判断，但问题是这整段逻辑是在回调里的，所以我们需要在回调里执行这段逻辑，把它设置为 true，进而实现。但有一个场景要明白，回调里的参数是 watch 内部返回的，在 nVal、oVal 不变的情况下需要第三个参数，且必须要函数，这样才能在这个函数里把 expired 的值改变，实现效果。如：

```js
async function callBack(nVal, oVal, expiredFn) {
    let expired = false // false 代表没有过期
    expiredFn(() => expired = true)
    const res = await fetchReq('/path/to/request')
    if (!expired) {
        finalData = res
    }
    console.log('finalData', finalData);
}
```

这里为了方便实现作用域隔离，把 expired 放入了回调函数内。因为你多次调用的时候，不能后面的副作用执行时 expired 一直是 true。然后，watch 内部也要对 expiredFn 做处理，不能传入了你回调但不执行。所以，处理如下：

```js
function watch(source, cb, options = {}) {
    // ...

    let nVal, oVal
    let cleanup
    function expiredFn(fn) {
        cleanup = fn
    }

    const job = () => {
        nVal = effectFn()
        if (cleanup) {
            cleanup()
        }
        cb(nVal, oVal, expiredFn)
        oVal = nVal
    }

    // ...
}
```

这里为什么加了一个 cleanup 判断，因为你第一次触发的时候它肯定是没有值的，第二次触发后就有值了，且还是第一次触发时传入的，那这样第一次执行时的 expired 就为 true，然后就不会把过期的结果赋值了。

那为什么说第二次执行时第一次的还没执行完，非要等这个结果出现呢。这就相当于一个递归队列，执行到异步的时候把所有的计算都 push 到一个队列里，然后在执行的时候一个个 pop 出来。当然，这种情况只存在于前后两次改变时，代码逻辑的执行有交叉的情况。

最终结果如下，我们也发现打印的结果都是最新的值了。

![图片](/img/19.png)

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

let finalData
let delayTime = 1000

const fetchReq = (path, dTime = delayTime) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('请求路径：', path);
            resolve({
                code: '200',
                msg: '',
                data: {
                    dTime,
                    rst: 'The more recorded, the better.'
                }
            })
        }, dTime)
    })
}
async function callBack(nVal, oVal, expiredFn) {
    let expired = false // false 代表没有过期
    expiredFn(() => expired = true)
    const res = await fetchReq('/path/to/request')
    if (!expired) {
        finalData = res
    }
    console.log('finalData', finalData);
}

function watch(source, cb, options = {}) {
    let getter

    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }

    let nVal, oVal
    let cleanup
    function expiredFn(fn) {
        cleanup = fn
    }

    const job = () => {
        nVal = effectFn()
        if (cleanup) {
            cleanup()
        }
        cb(nVal, oVal, expiredFn)
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

watch(p, callBack)

p.foo++
delayTime = 100
p.bar++
```
:::