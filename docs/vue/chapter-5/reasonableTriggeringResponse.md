---
prev:
    text: 更近一步的 Proxy
    link: /vue/chapter-5/furtherAgency.md
next:
    text: 浅响应与深响应
    link: /vue/chapter-5/shallowOrDeepResponse.md
---

朋友们，上一节我们学习了 Proxy 与 Reflect 的关系，以及增删改查的情况。我提出了一个问题——没有必要再增加各类标识，但综合接下来的学习看，还是有必要的，所以做了必要的补充与更新。然后，我们就在这些基础上，学习如何合理的触发响应。

当然，在此之前先做些准备，因为之前的代码看起来有些凌乱和臃肿了，修改后如下：

:::: code-group
::: code-group-item index.html
@[code](../source/index.html)
:::

::: code-group-item index.js
@[code](../source/v.0.0.0/index.js)
:::

::: code-group-item proxy.js
@[code](../source/v.0.0.0/proxy.js)
:::

::: code-group-item effect.js
@[code](../source/v.0.0.0/effect.js)
:::
::::

好，准备工作都已完毕，让我们接着学习。抛出问题：
1. 新值与旧值相同时怎么办？
2. 新值与旧值都为 NaN 怎么办？
3. 当前对象上没有该属性，但是原型上有怎么办？

#### 实验一：新值与旧值相同时怎么办？

![图片](/img/27.png)

从实现结果来看——新值与旧值相同时也触发了，这是不符合需求的。因为此场景下没必要更新，且还会造成资源的浪费，所以，代码修改如下：

```js
const handler = {
    set(target, prop, nVal, receiver) {
        const oVal = target[prop]
        // 判断当前属性是新增/修改
        const type = Object.prototype.hasOwnProperty.call(target, prop) ? 'SET' : 'ADD'
        const res = Reflect.set(target, prop, nVal, receiver)
        if (oVal !== nVal) {
            trigger(target, prop, type)
        }
        return res
    }
}

// 其他代码省略
```

从代码中得知，在触发更新前，只需要判断一下新值与旧值是否完全不等就行，这样，就能满足当前场景。

#### 实验二：新值与旧值都为 NaN 怎么办？

js 里对于 NaN 有定义，NaN 是唯一与自己不相同的值。所以，``` NaN !== NaN ``` 是判断成立的。那这就不满足我们的场景的，所以修改如下：

```js
const handler = {
    set(target, prop, nVal, receiver) {
        const oVal = target[prop]
        // 判断当前属性是新增/修改
        const type = Object.prototype.hasOwnProperty.call(target, prop) ? 'SET' : 'ADD'
        const res = Reflect.set(target, prop, nVal, receiver)
        if (oVal !== nVal && !(isNaN(oVal) && isNaN(nVal))) {
            trigger(target, prop, type)
        }
        return res
    }
}

// 其他代码省略
```

这里添加了判断——如果两者都不是 NaN 的情况下，才会触发更新的判断。这样就进一步补齐了新值与旧值不相同的情况下更新的判断。

#### 实验三：当前对象上没有改属性，但是原型上有怎么办？

我们模拟一个场景，假设 B 是 A 的子类，两者也都进行了代理，现在对 B 进行了属性赋值，然而这个属性 B 上没有，结果触发了两次更新。实现如下：

```js
import { nProxy, effect } from './proxy.js'

// 响应式的基本实现
const fruit = { banana: 1 }
const southFruit = {}

const A = nProxy(fruit)
const B = nProxy(southFruit)
Object.setPrototypeOf(B, A)

effect(() => {
    for(const k in B) {
        console.log('k:', k, ', value: ', B[k])
    }
    console.log('-------');
})

B.apple = 2
```

![图片](/img/28.png)

从结果中可以得知，修改了 B.apple 属性后，确实触发了两次。那我们同样也得知，这个过程中执行了两次的 set 和 get。而我们的目标是——只执行 B 的，也就是子类的，而不是 A（父类）的；所以，后面的那次更新要想办法阻断，所以，熟系的开关就又来了。但是，我们需要知道内部发生了什么，怎么就到 A 了呢。

根据 ES 规范，当当前对象上没有这个属性时，就会查找它的父级，如果父级有值就返，没有就返 undefined；同样，如果赋值时这个属性没有，也会向上查找它的父级，并调用 [[set]] 方法。这样就解释了为什么内部会触发了两次更新的原因。

::: tip
对象内是有属于自身的默认方法的，“[[]]” 就是表达内部方法的表现形式，且每一种内部方法都有它对外抛出的拦截方法，如我们代理的 set、get 等。
:::

明白了原理，那就找开关。打印的 set 过程中 target 和 receiver 如下：

![图片](/img/29.png)

我们可以看到，两次打印过程中 target 目标对象是符合向原型链上查找的预期的，但是 receiver 却始终指向了 B。所以，判断阻断的开关好像就找到了——只需要让 set 更新前，每次都判断一下当前的目标对象和 receiver 是否相同就好了。这里解释下为什么 receiver 一直是 B——因为我们更改的代理对象一直是它。

头脑风暴：
- A: 看起来分析是对的，但怎么感觉怪怪的？
- B: 怎么怪了？
- A: 两个对象该怎么比较啊？它们的每个地址空间都不一样。
- B: 咦！是啊。那怎么办？难不成都给它们每个循环一遍，判断属性是否相同？
- A: 这样很麻烦，而且也不一定对啊。我再想想。

通过这个思路分析，我们知道循环的方式是走不通的，所以只能回到了判断两个目标对象的指向是否相同的方向。但是 receiver 是代理后的对象，指向肯定是跟 target 不同的。但我们似乎已经做过类似的场景——effect，记得 effect 方法里我们定义了一个 effectFn 钩子，并且把它赋值给了 activeEffect，且给它添加了属性 deps、options。所以，这个思路也可以用在这里。即，只需要给 receiver 添加一个属性，并把这个属性指向 target 就好。代码如下：

```js
const handler = {
    get(target, prop, receiver) {
        if (prop === 'raw') {
            return target
        }
        track(target, prop)
        return Reflect.get(target, prop, receiver)
    },
    set(target, prop, nVal, receiver) {
        const oVal = target[prop]
        // 判断当前属性是新增/修改
        const type = Object.prototype.hasOwnProperty.call(target, prop) ? 'SET' : 'ADD'
        const res = Reflect.set(target, prop, nVal, receiver)
        if (target === receiver.raw) {
            if (oVal !== nVal && !(isNaN(oVal) && isNaN(nVal))) {
                trigger(target, prop, type)
            }
        }
        return res
    }
}

// 其他代码省略
```

::: tip
这里的 receiver 是指向代理对象的，所以访问 ```receiver[prop]```，其实就是调用 ``` p[prop] ```，即，是会触发 get 的。
:::

最后，完整代码如下：

:::: code-group
::: code-group-item index.html
@[code](../source/index.html)
:::

::: code-group-item index.js
@[code](../source/v.0.0.1/index.js)
:::

::: code-group-item proxy.js
@[code](../source/v.0.0.1/proxy.js)
:::

::: code-group-item effect.js
@[code](../source/v.0.0.1/effect.js)
:::
::::