---
prev:
    text: 实现 computed
    link: /vue/achieveComputed.md
next:
    text: 实现 watch 函数的立即执行与回调的调度执行
    link: /vue/achieveWatchSomeOptions.md
---

朋友们，学习了怎么实现 computed 后，视线开阔了一些吧。我也是的。那我们接着学习怎么实现 watch 吧。天将降大任于斯人也，共勉。

首先我们分析一下 watch 的实现结构，分为三部分——监听的对象、回调、参数。如：

```js
// 示例
watch({}, () => {}, {})
```

我们从这个结构中发现，我们是要准备几件事情的：
1. 要有一个 watch 函数；
2. watch 函数要有几个参数；
3. watch 函数怎么跟副作用函数执行起来——effect。

我们带着这几个疑问往下走，最主要的就是怎么把要监听的对象跟 effect 关联。回忆下上节 computed 的实现，computed 是把 effect 包裹起来的。同样，watch 也适用。

好，既然 watch 是包裹 effect 的，那 effect 要执行的真正副作用要有吧，所以要监听的对象的存放位置就有了。那这些都有了，监听完之后要触发的回调怎么关联呢。

我们回忆下回调的触发逻辑，首先先定义好这段逻辑；然后作为参数传入；接着我们变更数据，触发 trigger，执行副作用。分析这三个过程，前两个都是准备阶段，只有最后一步才是执行阶段，所以回调逻辑就在 trigger 内。

且我们在实现调度控制的那节课，有一个 scheduler 属性，这个就是触发异步的。所以，回调怎么关联的位置就有了。大概如下：

```js
function watch(obj, cb) {
    effect(() => obj, {
        scheduler() {
            cb()
        }
    })
}
```

好，那逻辑有了，我们就先从简单的实现吧。

#### 实验一

```js
function callBack() {
    console.log('执行了 callback');
}

function watch(obj, cb) {
    effect(() => obj.foo, {
        scheduler() {
            cb()
        }
    })
}

watch(p, callBack)

p.foo++
```

![图片](/img/14.png)

从结果上我们发现，一切就如预期的一样。但我们只监听了 ```obj.foo```，这种硬编码的方式是不可取的，所以我们要把 obj 这个对象都给循环一遍。

::: details 详细代码
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

function callBack() {
    console.log('执行了 callback');
}

function watch(obj, cb) {
    effect(() => obj.foo, {
        scheduler() {
            cb()
        }
    })
}

watch(p, callBack)

p.foo++
```
:::

#### 实验二

头脑风暴：
- A：嗯？都循环一遍！？
- B：听着是对的，但总感觉挂怪的。
- A：是啊，难道 ```effect(() => for())``` ？
- B：难不成是循环 effect ？
- A：循环 effect 也不对，这不就成了资源浪费了。
- B：是呀，这咋解决啊！
- A：effect 第一个参数是什么？
- B：是我们要执行的副作用。
- A：它是什么表现形式
- B：函数。
- A：这个形式是固定的吗？
- B：目前看是。
- A：所以，重要的不是这个结构，而是这个函数体里要执行的具体逻辑。对不对？
- B：对。
- A：好，那我们要实现的目的是什么？
- B：监听对象的改变。
- A：对，它会触发什么？
- B：trigger。
- A：对，而触发 trigger 之前一定会有什么？
- B：依赖追踪。
- A：对，所以它一定会触发什么？
- B：get。
- A：对，所以最重要的是什么？
- B：我们要有读取的操作。
- A：so，我们的目的就实现了，for 循环里遍历读取它的属性值就好。
- B：是的，你真聪明。
- A：我就当你夸我了。

好，实现如下：

```js
const data = { foo: 1, bar: 3 }

// ...

function callBack() {
    console.log('执行了 callback');
}

function watch(obj, cb) {
    effect(() => traverse(obj), {
        scheduler() {
            cb()
        }
    })
}

function traverse(value) {
    if (typeof value !== 'object') return

    for (const k in value) {
        value[k]
    }
}

watch(p, callBack)

p.foo++
p.bar++
```

![图片](/img/15.png)

从结果上看，这样写是没有问题的，但是不够优雅，如果对象内嵌套对象，或者是其他的形式呢？而实际工作场景中，对象内嵌套对象是很常见的一个需求，所以我们需要再对这段代码就行优化。

```js
function traverse(value) {
    if (typeof value !== 'object') return

    for (const k in value) {
        traverse(value[k]) // 新增
    }

    return value // 新增
}
```

好吧，大概思路就是这样的——利用递归，同时加判断避免无线循环。具体的就不写了，看大大写的，摘录如下：

```js
function traverse(value, seen = new Set()) {
    if (typeof value !== 'object' || value === null || seen.has(value)) return

    seen.add(value)

    for (const k in value) {
        traverse(value[k], seen) // 新增
    }

    return value // 新增
}
```

好了，确实有点累，调皮一下。那如果 watch 监听传入的是个参数怎么办？实现如下：

```js
function watch(source, cb) {
    let getter

    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }

    effect(getter, {
        scheduler() {
            cb()
        }
    })
}

function traverse(value, seen = new Set()) {
    if (typeof value !== 'object' || value === null || seen.has(value)) return

    seen.add(value)

    for (const k in value) {
        traverse(value[k], seen) // 新增
    }

    return value // 新增
}
```

当然这种写法是比较固定的，是只分析了 object 和 function 这两种情况，且 object 内嵌套 object 也只提供了递归思路，并没有具体去实现。还请勿介意，因为编写好费劲，当然不是能力不行的问题。

好，回调还差一些东西对不对——新值与旧值。那如何去拿呢，先看代码：

```js
const data = { foo: 1, bar: 3, cat: { age: 1 } }

// ...

function callBack(nVal, oVal) {
    console.log('执行了 callback');
    console.log('nVal', nVal);
    console.log('oVal', oVal);
}

function watch(source, cb) {
    let getter

    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }

    let nVal, oVal

    const effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            nVal = effectFn()
            cb(nVal, oVal)
            oVal = nVal
        }
    })

    oVal = effectFn()
}

function traverse(value, seen = new Set()) {
    if (typeof value !== 'object' || value === null || seen.has(value)) return

    seen.add(value)

    for (const k in value) {
        traverse(value[k], seen) // 新增
    }

    return value // 新增
}

watch(() => p.foo, callBack) // 注意这里监听的是个函数，不是直接写的 'p.foo'，因为 watch 里还没处理这个逻辑

p.foo++
```

![图片](/img/16.png)

这里主要注意的就是 lazy 属性，因为有新/旧值，那就一定有先后运行顺序，而 lazy 是可以直接控制要执行的副作用是否立即执行的，设为 true 之后，就相当于关闭了立即执行，改为手动触发。所以我们发现这部分就变成了函数表达式```const effectFn = effect(getter, {})```。而值变更后，就触发了异步逻辑，即 scheduler，这个时候再运行就是新值，然后回调，回调后再把新值赋值给旧值，这样就完成了新值与旧值的交替。最后完整代码如下：

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

function watch(source, cb) {
    let getter

    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }

    let nVal, oVal

    const effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            nVal = effectFn()
            cb(nVal, oVal)
            oVal = nVal
        }
    })

    oVal = effectFn()
}

function traverse(value, seen = new Set()) {
    if (typeof value !== 'object' || value === null || seen.has(value)) return

    seen.add(value)

    for (const k in value) {
        traverse(value[k], seen) // 新增
    }

    return value // 新增
}

watch(() => p.foo, callBack)

p.foo++
```
:::