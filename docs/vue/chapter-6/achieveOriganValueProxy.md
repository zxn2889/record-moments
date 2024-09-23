---
prev:
    text: 数组的代理
    link: /vue/chapter-5/achieveArrayProxy.md
next:
    text: 渲染器的设计
    link: /vue/chapter-7/designRenderer.md
---

朋友们，上一节学习了数组的代理方案后，非原始值的响应设计就暂时告一段落了。这一节我们将学习如何实现原始值的响应设计。原始值指的就是：```Boolean、Number、String、Symbol、undefined、null、BigInt```这类型的值。

我们知晓，目前的响应设计中，我们代理的都是对象，包括基本对象和数组对象等，其中在实现 watch 监听的响应设计中也曾提过，如果是单个属性的话还需要再进行一次包装，如 data 中 return 的 a，或单独的 ```p.a``` 字符串。而原始值的响应也是借鉴了这种思想——既然单独的原始值无法实现监听，那就再包裹一层变成对象， 这样就可以借助 Proxy 实现原始值的响应了。如下：

```js
// origanProxy.js

import { reactive } from "./proxy.js";

const ref = (val) => {
    const wrapper = {
        value: val
    }

    return reactive(wrapper)
}

export {
    ref
}


// index.js
import { ref } from './origanProxy.js'

const data = 1

let p = ref(data)

effect(() => {
    console.log('ref', p)
    console.log('ref value', p.value)
})

p.value = 2
```

![图片](/img/43.png)

从结果得知，我们将原始值 ```data = 1``` 变为了代理响应对象，并成功实现了 get 和 set。但是也能从打印的代理对象中看到，从日志中并不能区分该代理对象是 ref 对象，还是非原始值的代理对象。所以，ref 对象中我们还要加一个标识，表明它是 ref 对象。如下：

```js
const ref = (val) => {
    const wrapper = {
        value: val
    }

    // 添加 ref 对象标识符
    Object.defineProperty(wrapper, '__v_isRef', {
        value: true
    })

    return reactive(wrapper)
}
```

::: tip
```Object.defineProperty()```默认是不可更改的，且不会被触发```[[set]]```方法，这样就避免了不必要的消耗。
:::

好，那我们继续探讨 ref 对象能解决哪些问题。如以下场景：

```js
setup() {
    const p = reactive({ foo: 1, bar: 2 })

    return {
        ...p
    }
}
```

我们知晓，当将代理对象展开之后，我们得到就是一个返回的普通对象，这种情况并不具备响应追踪的能力，我们用目前的代码验证实现一下效果：

```js
const data = { foo: 1, bar: 2 }

let p = reactive(data)

const nObj = { ...p }

effect(() => {
    console.log('nObj', nObj.foo)
})

p.foo++
```

![图片](/img/44.png)

从结果中发现，修改 p.foo 的值后，副作用并没有触发，所以，nObj 是一个普通对象。但是，我们也发现，只要把普通对象中的属性关联到了响应对象的属性身上，相应变化也能实现，如下：

```js
const data = { foo: 1, bar: 2 }

let p = reactive(data)

const nObj = {
    a: {
        get value() {
            return p.foo
        }
    },
    b: {
        get value() {
            return p.bar
        }
    }
}

effect(() => {
    console.log('nObj', nObj.a.value)
})

p.foo = 2
```

![图片](/img/45.png)

::: tip
注意，这里普通对象具备响应式的能力一定是要通过访问器属性实现，单纯的 ```a: p.for``` 这种并不行。这是因为访问器属性具备了运算的能力，当执行 ```nObj.a.value``` 的时候，也执行了 ```p.foo```，这样就将其关联起来。但如果是 ```a: p.foo``` 这样的话，```nObj.a``` 仅仅只是一个指向的 ```p.foo``` 的结果的问题，并没有进行关联。
:::

从实验结果来看，普通对象也就有了响应式的能力。且 a、b 两个属性具备共性，优化后如下：

```js
const toRef = (obj, prop) => {
    const wrapper = {
        get value() {
            return obj[prop]
        }
    }

    return wrapper
}

const nObj = {
    a: toRef(p, 'foo'),
    b: toRef(p, 'bar')
}

// 其他代码省略
```

然后，我们发现 nObj 还是具备共性的，且 nObj 的属性完全可以和代理对象的属性完全一样，优化如下：

```js
const toRefs = (proxyObj) => {
    let nObj = {}
    const props = Object.keys(proxyObj)
    props.forEach(prop => {
        nObj[prop] = toRef(proxyObj, prop)
    })

    return nObj
}

const nObj = toRefs(p)

effect(() => {
    console.log('nObj', nObj.foo.value)
})
```

![图片](/img/45.png)

好，我们执行后发现，所有的结果都是相同的，但是我们忽略了一种情况，就是我修改普通属性后，能不能触发更新。目前发现不能，因为它会提示我们不能在仅有 getter 属性的对象上操作。优化如下：

```js
const toRef = (obj, prop) => {
    const wrapper = {
        get value() {
            return obj[prop]
        },
        set value(val) {
            obj[prop] = val
        }
    }

    return wrapper
}

nObj.foo.value = 3

// 其他代码省略
```

![图片](/img/46.png)

好，从结果中发现，设置后也都能正常更新。且也发现，ref 和 toRef 本身封包的结构是很相似的，只不过后者是添加了访问器属性实现，那我们也把它认为是 ref 对象。代码如下：

```js
const toRef = (obj, prop) => {
    const wrapper = {
        get value() {
            return obj[prop]
        },
        set value(val) {
            obj[prop] = val
        }
    }

    // 添加 ref 对象标识符
    Object.defineProperty(wrapper, '__v_isRef', {
        value: true
    })

    return wrapper
}
```

但是我们也发现一些问题，就是无论是取值还是赋值都要带上 value，感觉上就没有非代理对象那么好用。修改如下：

```js
const proxyRef = (data) => {
    return new Proxy(data, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver)
            return value.__v_isRef ? value.value : value
        },
        set(target, prop, nVal, receiver) {
            const value = target[prop]
            if (value.__v_isRef) {
                value.value = nVal
                return true
            }
            return Reflect.set(target, prop, nVal, receiver)
        }
    })
}
```

完整代码如下：

::: code-group
<<< ../source/v.0.0.6/index.js [index.js]
<<< ../source/v.0.0.6/proxy.js [proxy.js]
<<< ../source/v.0.0.6/origanProxy.js [origanProxy.js]
<<< ../source/v.0.0.6/effect.js [effect.js]
<<< ../source/v.0.0.6/rewriteArray.js [rewriteArray.js]
:::

最后，我们发现，ref 响应对象的出现填补了非响应式对象的空白，实现了原始值的代理响应，解决了代理对象使用展开运算符后的失去响应式问题，且实现了普通对象关联代理对象进而实现响应式的问题。最后，又通过 proxyRef 解决了取值赋值都要使用 .value 的问题。

至这里，我们已经实现了小型的 proxy 响应式系统，为了方便使用，减少 copy 成本，将这部分代码实现了插件化，可持续享用。

安装方式：

```js
npm i -D @zxn2889/achieve-proxy
```

or (推荐)

```js
pnpm add -D @zxn2889/achieve-proxy
```