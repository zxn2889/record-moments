import { reactive, shallowReactive, readOnly, shallowReadOnly, effect } from './proxy.js'

// 响应式的基本实现
const data = { foo: 1, bar: { cat: '小黑' } }

const p = shallowReadOnly(data)

effect(() => {
    console.log(p.bar.cat);
    console.log('-----------');
})

// p.bar.cat = '小黑战纪'
// p.foo++
delete p.foo
// p.banana = '香蕉'