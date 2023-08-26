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