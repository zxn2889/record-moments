import { reactive, shallowReactive, readOnly, shallowReadOnly, effect } from './proxy.js'
import { ref, toRef, toRefs, proxyRef } from './origanProxy.js'

// 响应式的基本实现
const data = { foo: 1, bar: 2 }

let p = reactive(data)

const nObj = proxyRef({ ...toRefs(p) })

effect(() => {
    console.log('nObj', nObj.foo)
})

p.foo = 2
nObj.foo = 3