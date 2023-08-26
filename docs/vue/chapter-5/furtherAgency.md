---
prev:
    text: 过期的副作用
    link: /vue/chapter-4/expiredSideEffects.md
---

朋友们，完成之前的阅读或者是练习之后，相信基本上对响应式的实现有了一些基本的理解。那么，我们将更进一步的探讨响应式的实现，如：Reflect 与响应的关联、in 关键字的读取等。学习是枯燥的，但也会培养我们思考与阅读的能力，见识到他人看不到的美。与诸君共勉。

首先，我们知晓 vue 响应式的实现是借助了 Reflect 的，但我们的 Proxy 代理里是没有的，所以，我们需要替换一下。那不替换有什么问题呢，如下：

```js
const data = { 
    foo: 1,
    get bar() {
        return this.foo
    }
}

// ... 省略其他代码

effect(() => {
    console.log('bar:', p.bar);
})

p.foo++
```

![图片](/img/20.png)

从代码逻辑中我们可以看到，副作用中读取了属性 bar，而 bar 作为一个访问器属性，内部调用了 ```this.foo```，所以打印的是 1，结果是没问题的。但是紧接着执行了 ```p.foo++```，这个时候应该自增然后再打印一个 2，但是没有。说明 foo 属性并没有被追踪。我们看 Proxy 的内部逻辑：

```js
// ... 省略其他代码
const handler = {
    get(target, prop) {
        track(target, prop)
        return target[prop]
    }
}
```

它返回的是 ```target[prop]```，target 是我们代理的目标对象，是 data，prop 是读取的属性 bar，那合起来就是 ```data.bar```，那 bar 作为一个 getter 函数，内部的指向就是 data，那 ```data.foo``` 自然就不会被收集了。这就是要使用 Reflect 的意义，因为它不仅都具有对象的所有功能，还具有第三个参数的能力——receiver。修改后如下：

```js
// ... 省略其他代码
const handler = {
    get(target, prop, receiver) {
        track(target, prop)
        return Reflect.get(target, prop, receiver)
    }
}
```

![图片](/img/21.png)

从结果中能发现，一切就又都正常了。那 receiver 的意义就在于能把指向拉回来，指向要代理的对象——p。好，那同样的 set 函数也要进行改变，即：

```js
// ... 省略其他代码
const handler = {
    set(target, prop, nVal, receiver) {
        const res = Reflect.set(target, prop, nVal, receiver)
        trigger(target, prop)
        return res
    }
}
```

这里为什么返回了一个 res，因为 Proxy.set 方法有规定，最好返回一个布尔值，而 Reflect.set 正好返回一个布尔值——代表是否更改成功。

好，那 get、set 都有了，但是读取属性的方式不止一种，比如：in 关键字。如果用 in 来判断，这种情况下是拿不到的。所以要添加一段代码，即：

```js
// ... 省略其他代码
const handler = {
    has(target, prop) {
        track(target, prop)
        return Reflect.has(target, prop)
    }
}
```

这时，in 关键字就能读取到了，且把它对应的读取加到了对应的依赖收集器里。好，那常用的增删改查目前就剩下删除了，删除对应的属性是 delete，但 Proxy/Reflect 里是 deleteProperty，如下：

```js
// ... 省略其他代码
const handler = {
    deleteProperty(target, prop) {
        // 判断是否是自身的属性，而不是继承来的属性
        const privateProp = Object.prototype.hasOwnProperty.call(target, prop)
        const res = Reflect.deleteProperty(target, prop)
        if (privateProp && res) {
            trigger(target, prop)
        }
        return res
    }
}
```

好，那目前增删改查都涉及到了，但如果是循环怎么办？如：

```js
effect(() => {
    for(const k in p) {
        console.log('k: ', k)
    }
})

p.nav = 2
```

看着挺正常，但是 nav 没打印。所以，set 函数内还需加逻辑。

***
头脑风暴：
- A：嗯？不对。
- B：怎么不对？
- A：set 钩子内怎么判断它是新增的还是原来就有的属性啊？
- B：有道理，那怎么办？
- A：我想想，一定有办法的。

实际上，Proxy 代理中有一个 ownKeys 方法，用于获取自身的属性，且它的执行顺序要更靠前一点。你问我怎么知道的，当然是打印过后才知道的啊。

![图片](/img/23.png)
***

**补充：**  
朋友们，双横线之间的部分是之前的想法，部分是对的，但有些也是错误的，这里做些延伸：
1. 在 set 没有触发时，ownKeys 执行在前；
2. 在 set 触发时，ownKeys 执行在后；
3. ownKeys 执行在 get 前；
4. delete 在 ownKeys 前，且不会触发 get、set

重新打印的执行顺序说明，和 set 钩子内代码修改：

![图片](/img/26.png)

```js
const handler = {
    set(target, prop, nVal, receiver) {
        const type = Object.prototype.hasOwnProperty.call(target, prop)
        const res = Reflect.set(target, prop, nVal, receiver)
        trigger(target, prop, type)
        return res
    }
}
// 其他代码省略
```

::: tip
注意，这里 trigger 是要放在 Reflect.set 后的，这是因为要将 this 指向自身，否则就会带来一些问题，如代理的对象值改变但却打印的还是旧值；和在 trigger 内部判断 type 将会是一直为 true 的状态。
:::

但是 ownKeys 有一个问题，就是只能拿到目标对象，拿不到新增的属性，而新增的属性又要符合设计规范，这里只能使用 Symbol。但是要注意，唯一值 Symbol 是要追踪的，所以不能在 ownKeys 方法里定义，即：

```js
// ... 省略其他代码
let ITERATE_KEY = Symbol()

const handler = {
    ownKeys(target) {
        console.log('ownkeys');
        track(target, ITERATE_KEY)
        return Reflect.ownKeys(target)
    }
}
```

好，ownKyes 完成了，但是我们从上一张图的结果中也发现，新增的属性并没有被执行的副作用循环打印出来，所以 set 要更新。

头脑风暴：
- A：等等。
- B：又怎么了？
- A：感觉有点不对。
- B：有什么不对的？
- A：感觉少了点什么！
- B：少了什么？我觉得挺好的啊。
- A：set 作为监听变化执行的钩子，它只需要内部循环依赖集合里的副作用不就好了，所以...
- B：是啊，那这样 get 也得改。
- A：是的，所以得好好想想。

目前来看，ownKeys 已经添加了 track 跟踪，但实际的执行当中并没有触发，所以 get 内并没有收集进入依赖集合里，所以修改如下：

```js
const track = (target, prop) => {
    console.log('get prop:', prop);
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

    // 新增
    let ITEARR = depsMap.get(ITERATE_KEY)
    if (ITEARR) {
        ITEARR.add(activeEffect)
    }
    activeEffect.deps.push(deps, ITEARR)
}

const trigger = (target, prop) => {
    console.log('set prop:', prop);
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(prop)
    const effectsToRun = new Set()
    deps && deps.forEach(effectFn => {
        if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
        }
    })

    // 新增
    const ITEARR = depsMap.get(ITERATE_KEY)
    ITEARR && ITEARR.forEach(effectFn => {
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

// ... 其他代码省略
```

![图片](/img/24.png)

从结果上看呢，是完美实现了，但是还不够优雅，明显 trigger 内重复项较多，所以优化如下：

```js
const trigger = (target, prop) => {
    console.log('set prop:', prop);
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(prop)
    const ITEARR = depsMap.get(ITERATE_KEY)
    const effectsToRun = new Set()
    const addEffectFn = (arr) => {
        arr && arr.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })
    }
    [deps, ITEARR].forEach(arr => addEffectFn(arr))
    effectsToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}
```

![图片](/img/25.png)

当然，源码里还做了类型判断——是否是新增、修改、删除。我觉得至少从目前的阶段来看，已经不重要了，因为增删改查都已实现。当然，感兴趣的小伙伴还可以继续查阅。这里贴出个人的完整代码：

::: details 详情代码
```js
// 响应式的基本实现
const data = { 
    foo: 1,
    get bar() {
        return this.foo
    }
}

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
let ITERATE_KEY = Symbol()

const handler = {
    get(target, prop, receiver) {
        track(target, prop)
        return Reflect.get(target, prop, receiver)
    },
    set(target, prop, nVal, receiver) {
        const res = Reflect.set(target, prop, nVal, receiver)
        trigger(target, prop)
        return res
    },
    has(target, prop) {
        track(target, prop)
        return Reflect.has(target, prop)
    },
    deleteProperty(target, prop) {
        // 判断是否是自身的属性，而不是继承来的属性
        const privateProp = Object.prototype.hasOwnProperty.call(target, prop)
        const res = Reflect.deleteProperty(target, prop)
        if (privateProp && res) {
            trigger(target, prop)
        }
        return res
    },
    ownKeys(target) {
        track(target, ITERATE_KEY)
        return Reflect.ownKeys(target)
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
    let ITEARR = depsMap.get(ITERATE_KEY)
    if (ITEARR) {
        ITEARR.add(activeEffect)
    }
    activeEffect.deps.push(deps, ITEARR)
}

const trigger = (target, prop) => {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(prop)
    const ITEARR = depsMap.get(ITERATE_KEY)
    const effectsToRun = new Set()
    const addEffectFn = (arr) => {
        arr && arr.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })
    }
    [deps, ITEARR].forEach(arr => addEffectFn(arr))
    effectsToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}

const p = new Proxy(data, handler)

effect(() => {
    for(const k in p) {
        console.log('k:', k, ', value: ', p[k])
    }
    console.log('-------');
})

p.nav = 2
p.foo = 3
```
:::

**补充：**

最终代码如下：

::: details 详情代码
```js
// 响应式的基本实现
const data = { 
    foo: 1,
    get bar() {
        return this.foo
    }
}

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
let ITERATE_KEY = Symbol()

const handler = {
    get(target, prop, receiver) {
        track(target, prop)
        return Reflect.get(target, prop, receiver)
    },
    set(target, prop, nVal, receiver) {
        // 判断当前属性是新增/修改
        const type = Object.prototype.hasOwnProperty.call(target, prop) ? 'SET' : 'ADD'
        const res = Reflect.set(target, prop, nVal, receiver)
        trigger(target, prop, type)
        return res
    },
    has(target, prop) {
        track(target, prop)
        return Reflect.has(target, prop)
    },
    deleteProperty(target, prop) {
        // 判断是否是自身的属性，而不是继承来的属性
        const privateProp = Object.prototype.hasOwnProperty.call(target, prop)
        const res = Reflect.deleteProperty(target, prop)
        if (privateProp && res) {
            // 判断是自身的属性，且删除成功后，才触发更新
            trigger(target, prop, 'DELETE')
        }
        return res
    },
    ownKeys(target) {
        track(target, ITERATE_KEY)
        return Reflect.ownKeys(target)
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

const trigger = (target, prop, type) => {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(prop)
    const ITEARR = depsMap.get(ITERATE_KEY)
    const effectsToRun = new Set()
    const addEffectFn = (arr) => {
        arr && arr.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })
    }
    addEffectFn(deps)
    if (type === 'ADD' || type === 'DELETE') {
        addEffectFn(ITEARR)
    }
    effectsToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}

const p = new Proxy(data, handler)

effect(() => {
    for(const k in p) {
        console.log('k:', k, ', value: ', p[k])
    }
    console.log('-------');
})

p.nav = 2
p.foo = 3
delete p.foo
```
:::

::: tip 我想说的话
这篇文章在一阵艰难中终于告一段落了。写它很不容易，记录了我个人的所有的在模拟过程当中的感悟，且还有一些我个人很反感的一些数字背景。但是有问题就改，至于我为什么是补充而不是直接推翻之前的记录，就是想让更多的小伙伴能够感受当中的一些纠结，进而能加深领悟。如果不想的话——嗯，您也都看到最后了，看最后的详情代码也是好的。

最后，祝大家一切顺利！
:::