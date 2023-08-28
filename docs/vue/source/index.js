import { reactive, shallowReactive, readOnly, shallowReadOnly, effect } from './proxy.js'

// 响应式的基本实现
const data = ['foo']

const p = reactive(data)

effect(() => {
    console.log('k-value:', p[0]);
})

p[0] = 'heihei'