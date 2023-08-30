import { activeEffect, effect } from './effect.js'
import { rewriteArrReadRecord, blockTrack, rewriteArrWriteRecord } from './rewriteArray.js'

let bucket = new WeakMap()
let ITERATE_KEY = Symbol()

const RECORD = {
    ADD: 'ADD',
    SET: 'SET',
    DEL: 'DEL'
}

const RECEIVER_TARGET = 'raw'
const ARRAY_LENGTH = 'length'

const handler = (isShallow = false, isReadOnly = false) => ({
    get(target, prop, receiver) {
        console.log('get:', prop);
        // 将 receiver.raw 指向目标对象
        if (prop === RECEIVER_TARGET) {
            return target
        }

        // 判断如果目标对象是数组，且操作方式是拦截的读取属性，就触发拦截效果
        if (Array.isArray(target) && rewriteArrReadRecord.hasOwnProperty(prop)) {
           return Reflect.get(rewriteArrReadRecord, prop, receiver)
        }

        // 判断如果目标对象是数组，且操作方式是拦截的修改属性，就触发拦截效果
        if (Array.isArray(target) && rewriteArrWriteRecord.hasOwnProperty(prop)) {
            return Reflect.get(rewriteArrWriteRecord, prop, receiver)
        }

        // 非只读属性且 prop 值类型不为 symbol 时跟踪依赖
        // 注意其他手动触发 track 的区别，如 has、ownKeys，它们并不是走 get 收集的
        if (!isReadOnly && typeof prop !== 'symbol') {
            track(target, prop)
        }

        const res = Reflect.get(target, prop, receiver)

        // 浅响应时阻断递归，直接返回当前响应对象
        if (isShallow) {
            return res
        }

        // 当前对象类型为 object，且不为空时递归建立深响应
        if (typeof res === 'object' && res !== null) {
            return isReadOnly ? readOnly(res) : reactive(res)
        }

        // 其他情况直接 return res
        return res
    },
    set(target, prop, nVal, receiver) {
        console.log('set:', prop);
        if (isReadOnly) {
            console.warn('当前为只读对象，不可编辑！')
            return false
        }

        const oVal = target[prop]

        // 判断当前操作类型
        const type = Array.isArray(target) 
            ? Number(prop) > (target[ARRAY_LENGTH] - 1) ? RECORD.ADD : RECORD.SET 
            : Object.prototype.hasOwnProperty.call(target, prop) ? RECORD.SET : RECORD.ADD

        const res = Reflect.set(target, prop, nVal, receiver)

        // 判断目标对象和 receiver.raw 代理对象是否相同
        if (target === receiver[RECEIVER_TARGET]) {

            // 判断新/旧值是否不等，且其中任一值不为 NaN 是触发更新
            if (oVal !== nVal && (oVal === oVal || nVal === nVal)) {
                trigger(target, prop, type, nVal)
            }
        }

        // 其他情况直接 return res
        return res
    },
    has(target, prop) {
        // 拦截 in 操作符并实现依赖跟踪——in 也是读取的一种
        track(target, prop)
        return Reflect.has(target, prop)
    },
    deleteProperty(target, prop) {
        if (isReadOnly) {
            console.warn('当前为只读对象，不可删除！')
            return false
        }
        
        // 判断是否为自身的属性，而不是继承属性
        const privateProp = Object.prototype.hasOwnProperty.call(target, prop)
        
        const res = Reflect.deleteProperty(target, prop)
 
        // 是自身的属性，且删除成功，才触发更新
        if (privateProp && res) {
            trigger(target, prop, RECORD.DEL)
        }

        // 其他情况直接返回 res
        return res
    },
    ownKeys(target) {
        // 追踪目标对象本身循环情况，根据其类型不同，关联不同的依赖桶
        const prop = Array.isArray(target) ? ARRAY_LENGTH : ITERATE_KEY
        track(target, prop)
        return Reflect.ownKeys(target)
    }
})

const track = (target, prop) => {
    // 当前无副作用或设置不跟踪依赖时，直接返回
    if (!activeEffect || blockTrack) return target[prop]

    // 获取目标对象的 Map 集合
    let depsMap = bucket.get(target)
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()))
    }

    // 获取目标属性的 Set 集合——依赖收集器
    let deps = depsMap.get(prop)
    if (!deps) {
        depsMap.set(prop, (deps = new Set()))
    }

    // 在依赖集合中添加当前副作用
    deps.add(activeEffect)

    // 把当前依赖集合存入当前副作用的收集器中
    activeEffect.deps.push(deps)
}

const trigger = (target, prop, type, nVal) => {
    console.log('type', type);
    // 获取目标对象 Map 集合
    const depsMap = bucket.get(target)
    if (!depsMap) return

    // 获取目标属性 Set 集合——依赖收集器
    const deps = depsMap.get(prop)
    
    // 创建有效副作用更新器并存入桶中
    const effectsToRun = new Set()
    const addEffectFn = (arr) => {
        arr && arr.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })
    }
    addEffectFn(deps)
    
    // 稀有操作类型时，收集特殊依赖（Symbol相关）并存入桶中
    if (type === RECORD.ADD || type === RECORD.DEL) {
        const ITEARR = depsMap.get(ITERATE_KEY)
        addEffectFn(ITEARR)
    }

    // 当目标对象为数组且为新增时，收集特殊依赖（length相关）并存入桶中
    if (type === RECORD.ADD && Array.isArray(target)) {
        console.log('01');
        const lenDeps = depsMap.get(ARRAY_LENGTH)
        addEffectFn(lenDeps)
    }

    // 当目标对象是数组且修改了 length 长度后，循环 Map 结构，更新相关依赖
    if (Array.isArray(target) && prop === ARRAY_LENGTH) {
        console.log('02');
        depsMap.forEach((effects, i) => {
            if (i >= nVal) {
                addEffectFn(effects)
            }
        })
    }

    // 将有效的依赖收集器遍历执行
    effectsToRun.forEach(effectFn => {

        // 如果存在调度特性则执行回调，否则直接执行当前副作用
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}

// 实现响应式逻辑
// isShallow 是否为浅响应式 false-不是 true-是
// isReadOnly 是否为只读 false-不是 true-是
function createReactive(data, isShallow = false, isReadOnly = false) {
    return new Proxy(data, handler(isShallow, isReadOnly))
}

// 传递给外部的深响应式
// 收集目标对象的代理响应集合
let reactiveMap = new Map()
function reactive(data) {
    
    // 如果已经存在响应代理，则直接返回
    const expiredProxy = reactiveMap.get(data)
    if (expiredProxy) return expiredProxy

    // 如果不存在响应代理，则创建并添加进收集器内，并返回
    const proxy = createReactive(data)
    reactiveMap.set(data, proxy)
    return proxy
}

// 传递给外部的浅响应式
function shallowReactive(data) {
    return createReactive(data, true)
}

// 传递给外部的深只读
function readOnly(data) {
    return createReactive(data, false, true)
}

// 传递给外部的浅只读
function shallowReadOnly(data) {
    return createReactive(data, true, true)
}

export {
    reactive,
    shallowReactive,
    readOnly,
    shallowReadOnly,
    effect
}