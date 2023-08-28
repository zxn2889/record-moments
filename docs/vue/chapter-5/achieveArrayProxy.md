---
prev:
    text: 只读与浅只读
    link: /vue/chapter-5/shallowOrDeepReadOnly.md
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

由提示可知，为什么说数组的逻辑实验中目前大多数功能是可用的，因为本质上来讲，他们是具有相同的底层方法的。好，那我们进行第一个实验。

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

由上述代码得知，当我们修改 p 的长度的时候，是不是应该执行 p.length，但是没有，这是因为目前的逻辑中没有收集 length 属性相关的副作用。所以，当数组以角标的形式新增元素，改变自身长度的时候，要重新执行相关依赖。相关代码如下：

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
我本以为这里会触发代理的 ownKeys 方法，但是并没有。然后我查了查相关文档，又回忆了解题思路。ownKeys 主要是拦截 Reflect.ownKeys，set 主要是对操作属性变化的感知。那简单理解，拦截属性变化的操作找 set，拦截对象循环的变化找 ownKeys。
:::

从结果上得知，通过更新角标值改变 length 长度进而触发更新的场景已经实现。但还不够优雅，因为，我们只有让它长度变化时才改，修改如下：

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

好，从实验结果看一切也都正常。那我们继续实验，如果让 length 归 0 呢。

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