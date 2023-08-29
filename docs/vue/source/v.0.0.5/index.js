import { reactive, shallowReactive, readOnly, shallowReadOnly, effect } from './proxy.js'

// 响应式的基本实现
const data = []

const p = reactive(data)

effect(() => {
    p.push(1)
})

effect(() => {
    p.push(1)
    console.log(p);
})