---
title: 3-浅响应和深响应
---

朋友们，学习了上一节之后，我们来学习点轻松的，如何实现浅响应和深响应。

我们知道，深响应就是让对象内嵌套的对象实现响应式，而浅响应是只实现对象内最外层的属性。这就触及到了几个场景，一个是对象内的对象，一个是最外层。对于前者，我们只需要递归的思想便能实现，对于后者，我们只要在循环前加一个判断——判断它是否要循环。

所以，代码如下：

```js
// proxy.js
const handler = {
    get(target, prop, receiver) {
        if (prop === 'raw') {
            return target
        }
        track(target, prop)
        if (typeof target[prop] === 'object') {
            track(target[prop], prop)
        }
        return Reflect.get(target, prop, receiver)
    }
}

// index.js
import { nProxy, effect } from './proxy.js'

// 响应式的基本实现
const data = { foo: 1, bar: { cat: '小黑' } }

const p = nProxy(data)

effect(() => {
    console.log(p.bar.cat);
    console.log('-----------');
})

p.bar.cat = '小黑战纪'

// 其他代码省略
```

![图片](/img/30.png)

发现想要的结果并没有出现，所以，嵌套的那层并没有实现监听，即，它当前并不是响应式对象。所以，我们嵌套的逻辑写错了，循环的应该是 new Proxy 对象。修改如下：

```js
// proxy.js
const handler = {
    get(target, prop, receiver) {
        if (prop === 'raw') {
            return target
        }
        track(target, prop)
        if (typeof target[prop] === 'object') {
            nProxy(target[prop])
        }
        return Reflect.get(target, prop, receiver)
    }
}

// 其他代码省略
```

![图片](/img/30.png)

发现还是不行，这里思考一下，嵌套的那层是 ```target[prop]```，它并不是响应式的，所以在嵌套时根本就关联不起来，所以要 Reflect 后，且还要 return 出去，修改如下：

```js
const handler = {
    get(target, prop, receiver) {
        if (prop === 'raw') {
            return target
        }
        track(target, prop)
        const res = Reflect.get(target, prop, receiver)
        if (typeof res === 'object' && res !== null) {
            return nProxy(res)
        }
        return res
    },
    set(target, prop, nVal, receiver) {
        const oVal = target[prop]
        // 判断当前属性是新增/修改
        const type = Object.prototype.hasOwnProperty.call(target, prop) ? 'SET' : 'ADD'
        const res = Reflect.set(target, prop, nVal, receiver)
        if (target === receiver.raw) {
            // 在新/旧值不相同的前提下，判断新/旧值只要有一方不是 NaN 就触发
            if (oVal !== nVal && (oVal === oVal || nVal === nVal)) {
                trigger(target, prop, type)
            }
        }
        return res
    }
}
```
::: tip
这里注意点还蛮多的，一：用递归的思想实现深响应、二：递归的对象是响应式对象、三：递归的对象要有值、四：递归的值要 return 出去、五：递归的对象类型要是对象。
:::

到了这里，深响应已经实现了。要实现浅响应，只需要把开关放在递归逻辑前就好，设计如下：

```js
const handler = (isShallow = true) => ({ // true 为代表深响应
    get(target, prop, receiver) {
        if (prop === 'raw') {
            return target
        }
        track(target, prop)
        const res = Reflect.get(target, prop, receiver)
        if (typeof res === 'object' && res !== null && isShallow) {
            return nProxy(res)
        }
        return res
    }
}

function nProxy(data) {
    return new Proxy(data, handler()) // 添加小括号，为了调用
}
```

::: tip
这里 handler 改为函数表达式是为了方便接收参数，isShallow 默认为 true，是默认其为深响应。
:::

![图片](/img/31.png)

到了这里，我们深响应、浅响应都已经实现了，但还不够优雅，也不符合单一功能模式，所以优化后最终代码如下：

::: code-group
<<< ../source/v.0.0.2/index.js [index.js]
<<< ../source/v.0.0.2/proxy.js [proxy.js]
<<< ../source/v.0.0.2/effect.js [effect.js]
:::