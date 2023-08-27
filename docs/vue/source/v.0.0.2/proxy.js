import { activeEffect, effect } from './effect.js'

let bucket = new WeakMap()
let ITERATE_KEY = Symbol()

const handler = (isShallow = true) => ({
    get(target, prop, receiver) {
        if (prop === 'raw') {
            return target
        }
        track(target, prop)
        const res = Reflect.get(target, prop, receiver)
        if (typeof res === 'object' && res !== null && isShallow) {
            return createReactive(res)
        }
        return res
    },
    set(target, prop, nVal, receiver) {
        const oVal = target[prop]
        // 判断当前属性是新增/修改
        const type = Object.prototype.hasOwnProperty.call(target, prop) ? 'SET' : 'ADD'
        const res = Reflect.set(target, prop, nVal, receiver)
        if (target === receiver.raw) {
            if (oVal !== nVal && (oVal === oVal || nVal === nVal)) {
                trigger(target, prop, type)
            }
        }
        return res
    },
    has(target, prop) {
        track(target, prop)
        return Reflect.has(target, prop)
    },
    deleteProperty(target, prop) {
        // 判断是否是自身的属性，而不是继承来的属性
        const privateProp = Object.prototype.hasOwnProperty.call(target, prop)
        const res = Reflect.deleteProperty(target, prop)
        if (privateProp && res) {
            // 判断是自身的属性，且删除成功后，才触发更新
            trigger(target, prop, 'DELETE')
        }
        return res
    },
    ownKeys(target) {
        track(target, ITERATE_KEY)
        return Reflect.ownKeys(target)
    }
})

const track = (target, prop) => {
    if (!activeEffect) return target[prop]
    let depsMap = bucket.get(target)
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()))
    }
    let deps = depsMap.get(prop)
    if (!deps) {
        depsMap.set(prop, (deps = new Set()))
    }
    deps.add(activeEffect)
    activeEffect.deps.push(deps)
}

const trigger = (target, prop, type) => {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(prop)
    const ITEARR = depsMap.get(ITERATE_KEY)
    const effectsToRun = new Set()
    const addEffectFn = (arr) => {
        arr && arr.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })
    }
    addEffectFn(deps)
    if (type === 'ADD' || type === 'DELETE') {
        addEffectFn(ITEARR)
    }
    effectsToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}

// 实现响应式逻辑
function createReactive(data, isShallow = true) {
    return new Proxy(data, handler(isShallow))
}

// 传递给外部的深响应式
function reactive(data) {
    return createReactive(data)
}

// 传递给外部的浅响应式
function shallowReactive(data) {
    return createReactive(data, false)
}

export {
    reactive,
    shallowReactive,
    effect
}