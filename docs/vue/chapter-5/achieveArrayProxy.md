---
prev:
    text: 只读与浅只读
    link: /vue/chapter-5/shallowOrDeepReadOnly.md
next:
    text: 原始值的响应方案
    link: /vue/chapter-6/achieveOriganValueProxy.md
---

朋友们，上节我们学习了只读和浅只读之后，这节我们来学习如何实现关于数组的代理。

我们知道，数组也是对象的一种。它只是相对常规对象多了更多的操作方法，但是已实现的大多数功能是相通的。需要处理的是，数组长度的改变，角标的变化等。

::: tip
对象是分为常规对象和异质对象两种，两者的主要区别是不满足前者的都是异质对象。而常规对象必须满足 ES 规范的三点，具体如下：
- 对于表 5-1 列出的内部方法，必须使用 ECMA 规范 10.1.x 节给出
的定义实现；
- 对于内部方法 [[Call]]，必须使用 ECMA 规范 10.2.1 节给出的
定义实现；
- 对于内部方法 [[Construct]]，必须使用 ECMA 规范 10.2.2 节
给出的定义实现。
其中表 5-1 是对象都具有的方法，截图如下：
:::

![图片](/img/33.png)

![图片](/img/34.png)

由提示可知，为什么说数组的逻辑实现中，目前大多数功能是可用的。因为本质上来讲，他们是具有相同的底层方法的。好，那我们开始实验。

#### 实验一：数组的索引和 length 的关系

```js
// 响应式的基本实现
const data = ['foo']

const p = reactive(data)

effect(() => {
    console.log(p.length);
    console.log('-----------');
})

p[1] = 'heihei'
```

由上述代码得知，当我们修改 p 的长度的时候，是不是应该执行 p.length，但是没有，这是因为目前的逻辑中没有触发 length 属性相关的副作用。所以，当数组以角标的形式新增元素，改变自身长度的时候，要重新执行相关依赖。相关代码如下：

```js
const trigger = (target, prop, type) => {
    if (Array.isArray(target)) {
        const lenDeps = depsMap.get('length')
        addEffectFn(lenDeps)
    }
}

// 其他代码省略
```

![图片](/img/35.png)

::: tip 误区
我本以为这里会触发代理的 ownKeys 方法，但是并没有。然后查阅了相关文档，又回忆了解题思路。发现 ownKeys 主要是拦截 Reflect.ownKeys，set 主要是对操作属性变化的感知。那简单理解，拦截属性变化的操作找 set，拦截对象循环的变化找 ownKeys。
:::

从结果上得知，通过更新角标值改变 length 长度进而触发更新的场景已经实现。但还不够优雅，因为，我们只有让它长度新增时才触发更新，修改如下：

```js
set(target, prop, nVal, receiver) {
    // 判断当前操作类型
    const type = Array.isArray(target) 
        ? Number(prop) > (target[ARRAY_LENGTH] - 1) ? RECORD.ADD : RECORD.SET 
        : Object.prototype.hasOwnProperty.call(target, prop) ? RECORD.SET : RECORD.ADD

    // 其他代码省略
}

const ARRAY_LENGTH = 'length'

const trigger = (target, prop, type) => {

    // 当目标对象为数组且为新增时，收集特殊依赖（length相关）并存入桶中
    if (type === RECORD.ADD && Array.isArray(target)) {
        const lenDeps = depsMap.get(ARRAY_LENGTH)
        addEffectFn(lenDeps)
    }

    // 其他代码省略
}
```

#### 实验二：遍历数组

先看如下代码：

```js
const data = ['foo']

const p = reactive(data)

effect(() => {
    for (const k in p) {
        console.log('k:', k);
        console.log('-----------');
    }
})

p[1] = 'heihei'
```

结果也是运行正确的，貌似没有什么问题，但是我们循环的是数组，不是普通对象了。所以这里我们收集依赖的时候应该存入 length 属性的依赖集里。所以，代码修改如下：

```js
ownKeys(target) {
    // 追踪目标对象本身循环情况，根据其类型不同，关联不同的依赖桶
    const prop = Array.isArray(target) ? ARRAY_LENGTH : ITERATE_KEY
    track(target, prop)
    return Reflect.ownKeys(target)
}

// 其他代码省略
```

![图片](/img/36.png)

好，从实验结果看一切也都正常。但对于数组而言，推荐的遍历方法是 ```for of```，而 ```for of``` 的内部逻辑中会读取 ```Symbol.iterator```相关属性，但其实不需要对此相关属性进行追踪，所以要屏蔽掉。如下：

```js
get(target, prop, receiver) {

    // 非只读属性且 prop 值类型不为 symbol 时跟踪依赖
    // 注意其他手动触发 track 的区别，如 has、ownKeys，它们并不是走 get 收集的
    if (!isReadOnly && typeof prop !== 'symbol') {
        track(target, prop)
    }

    // 其他逻辑省略
}
```

实验三：length 长度小于当前读取的角标值时

```js
const data = ['foo']

const p = reactive(data)

effect(() => {
    console.log('k-value:', p[0]);
})

p.length = 0
```

![图片](/img/37.png)

发现结果并没有响应。我们思考一下，刚开始时是触发了副作用执行的，存储的是 ```0 => Set()``` 这样的 Map 结构；然后通过设置 length 属性让数组的长度为 0 了。即，数组变为了空数组。那么应该重新触发副作用并打印 undefined 才对。

我们分析一下当前能拿到什么条件，一：设置了 length 属性且为 0；二：0 的长度小于了当前副作用中读取的角标。所以我们得出了一个结论：当修改了 length 属性且让值小于了副作用中读取的角标时应该触发更新。大于的时候自然是不用变动的。

头脑风暴：
- A: 更新的逻辑是放在 trigger 内的，所以我们要动 trigger。
- B: 对。
- A: 结论太笼统了，数组的长度变了，有可能读取的角标还不止一个，所以，不能简单的就说更新，而是要在循环中判断更新。
- B: 对。
- A: 那循环判断的话，Set 依赖收集器就不行了，得拿它的父级 Map 层，正好 Map 层又有角标又有依赖收集器。
- B: 对。
- A: 但还缺一个，少了 length 的值去作为判断条件，所以 set 钩子内还要传入。
- B: 嗯，那要怎么实现呢？
- A: 已经有了，如下：

```js
set(target, prop, nVal, receiver) {

    // 判断目标对象和 receiver.raw 代理对象是否相同
    if (target === receiver[RECEIVER_TARGET]) {

        // 判断新/旧值是否不等，且其中任一值不为 NaN 是触发更新
        if (oVal !== nVal && (oVal === oVal || nVal === nVal)) {
            trigger(target, prop, type, nVal)
        }
    }

    // 其他代码省略
}

const trigger = (target, prop, type, nVal) => {

    // 当目标对象是数组且修改了 length 长度后，循环 Map 结构，更新相关依赖
    if (Array.isArray(target) && prop === ARRAY_LENGTH) {
        depsMap.forEach((effects, i) => {
            if (i >= nVal) {
                addEffectFn(effects)
            }
        })
    }

    // 其他代码省略
}
```

![图片](/img/38.png)

好，这样的话数组的遍历基本就完成了。但是数组还有其他的操作方法，如 includes、push 等。

#### 实验四：代理数组使用 includes 访问对象的情况

如如下情况：

```js
const obj = {}
const data = [obj]

const p = reactive(data)

effect(() => {
    console.log(p.includes(p[0]));
})
```

![图片](/img/39.png)

从图中结果得知是 false，这不符合预期情况。分析发现，执行 ```p[0]``` 时调用了递归，创建了新的响应代理，然后执行 ```p.includes``` 时又访问了角标和 p[0] 的返回代理对象做对比。又因为 p.includes 访问时又触发了递归，所以两个代理对象不同，所以一直比较不上。所以返回 false。

::: tip
includes 属性在执行时会把结果一一和角标上的值相匹配，即，它内部会执行循环方法，且会访问角标。这就是为什么 p[0] 返回一个响应代理，p.includes 又返回一个响应代理的原因。
:::

解决的思路就是不让响应代理重复返回，代码如下：

```js
// 传递给外部的深响应式
// 收集目标对象的代理响应集合
let reactiveMap = new Map()
function reactive(data) {
    
    // 如果已经存在响应代理，则直接返回
    const expiredProxy = reactiveMap.get(data)
    if (expiredProxy) return expiredProxy

    // 如果不存在响应代理，则创建并添加进收集器内，并返回
    const proxy = createReactive(data)
    reactiveMap.set(data, proxy)
    return proxy
}

// 其他代码省略
```

![图片](/img/40.png)

从实验结果来看，当前问题就解决了。但如果是直接访问的 ```p.includes(obj)``` 呢，发现还是为 false。这还是因为 includes 执行中时时触发递归然后返回的是代理对象。但这里访问的原始对象，两者的目标地址不同，自然是 false。这里说下作者很牛皮，如果是我的话可能会想着把指定的值拿着做判断，但问题是怎么拿以及怎么做判断。作者是直接避免了这种情况，而是通过拦截 includes 属性，然后在原有的逻辑上包了一层逻辑，这个问题就解决了。如下：

```js
// 重写的数组操作方法
const resetArrRecord = {
    includes(...args) {
        const origanIncludes = Array.prototype.includes
        let res = origanIncludes.apply(this, args)
        if (!res) {
            res = origanIncludes.apply(this.raw, args)
        }

        return res
    }
}

get(target, prop, receiver) {

    // 判断如果目标对象是数组，且操作方式是拦截的属性，就触发拦截效果
    if (Array.isArray(target) && Object.keys(resetArrRecord).includes(prop)) {
        return Reflect.get(resetArrRecord, prop, receiver)
    }
}
```

优化后如下：

```js
// 重写的数组操作方法
const resetArrRecordMap = ['includes', 'indexOf', 'lastIndexOf']
const resetArrRecord = {}
resetArrRecordMap.forEach(method => {
    const origanMethod = Array.prototype[method]
    resetArrRecord[method] = function(...args) {
        let res = origanMethod.apply(this, args)
        if (!res) {
            res = origanMethod.apply(this.raw, args)
        }
        
        return res
    }
})

get(target, prop, receiver) {

    // 判断如果目标对象是数组，且操作方式是拦截的属性，就触发拦截效果
    if (Array.isArray(target) && resetArrRecord.hasOwnProperty(prop)) {
        return Reflect.get(resetArrRecord, prop, receiver)
    }
}
```

#### 实验五：当两个 push 时怎么办？

如：

```js
const data = []

const p = reactive(data)

effect(() => {
    p.push(1)
})

effect(() => {
    p.push(1)
})
```

![图片](/img/41.png)

如结果所示，会导致结果溢出。就如同之前的避免无限递归一样，两者的副作用相互触发了。那只要其中一个触发时，另一个不触发就好。但是要具体怎么做。

其实，push 方法其实内部会执行读取和设置 length 的操作，这就解释了当第二个 push 执行 set 操作时，就会触发之前的 length 相关副作用，然后就又开始读取和设置，就无限循环。

这种循环是要打破的，所以要拦截 push 属性并修改对应方法，而这个方法内部一定要有一个开关能控制依赖的收集，因为从语义上来讲，push 是修改操作，不需要收集依赖。所以，代码如下：

```js
// 重写数组的修改方法
let blockTrack = false
const resetArrWriteRecordMap = ['push', 'pop', 'shift', 'unshift', 'splice']
const resetArrWriteRecord = {}
resetArrWriteRecordMap.forEach(method => {
    const origanMethod = Array.prototype[method]
    resetArrWriteRecord[method] = function(...args) {
        blockTrack = true
        const res = origanMethod.apply(this, args)
        blockTrack = false
        return res
    }
})

get(target, prop, receiver) {

    // 判断如果目标对象是数组，且操作方式是拦截的修改属性，就触发拦截效果
    if (Array.isArray(target) && resetArrWriteRecord.hasOwnProperty(prop)) {
        return Reflect.get(resetArrWriteRecord, prop, receiver)
    }
}

const track = (target, prop) => {
    // 当前无副作用时，直接返回
    if (!activeEffect || blockTrack) return target[prop]
}

// 其他代码省略
```

![图片](/img/42.png)

最后完整代码如下：

::: code-group
<<< ../source/v.0.0.5/index.js [index.js]
<<< ../source/v.0.0.5/proxy.js [proxy.js]
<<< ../source/v.0.0.5/rewriteArray.js [rewriteArray.js]
:::