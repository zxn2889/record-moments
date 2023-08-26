import { nProxy, effect } from './proxy.js'

// 响应式的基本实现
const data = { 
    foo: 1,
    get bar() {
        return this.foo
    }
}

const p = nProxy(data)

effect(() => {
    for(const k in p) {
        console.log('k:', k, ', value: ', p[k])
    }
    console.log('-------');
})

p.nav = 2
p.foo = 3
delete p.foo