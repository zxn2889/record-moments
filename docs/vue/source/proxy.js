import { activeEffect, effect } from './effect.js'

let bucket = new WeakMap()
let ITERATE_KEY = Symbol()

const RECORD = {
    ADD: 'ADD',
    SET: 'SET',
    DEL: 'DEL'
}

const RECEIVER_TARGET = 'raw'

const handler = (isShallow = true) => ({
    get(target, prop, receiver) {
        // 将 receiver.raw 指向目标对象
        if (prop === RECEIVER_TARGET) {
            return target
        }

        // 跟踪依赖
        track(target, prop)

        const res = Reflect.get(target, prop, receiver)

        // 浅响应时阻断递归，直接返回当前响应对象
        if (isShallow) {
            return res
        }

        // 当前对象类型为 object，且不为空时递归建立深响应
        if (typeof res === 'object' && res !== null) {
            return createReactive(res)
        }

        // 其他情况直接 return res
        return res
    },
    set(target, prop, nVal, receiver) {
        const oVal = target[prop]

        // 判断当前操作类型
        const type = Object.prototype.hasOwnProperty.call(target, prop) ? RECORD.SET : RECORD.ADD

        const res = Reflect.set(target, prop, nVal, receiver)

        // 判断目标对象和 receiver.raw 代理对象是否相同
        if (target === receiver[RECEIVER_TARGET]) {

            // 判断新/旧值是否不等，且其中任一值不为 NaN 是触发更新
            if (oVal !== nVal && (oVal === oVal || nVal === nVal)) {
                trigger(target, prop, type)
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
        // 追踪自身新增属性，因无法读取 key 值，所以用唯一值 Symbol 替代，set 中针对此情况特殊处理
        track(target, ITERATE_KEY)
        return Reflect.ownKeys(target)
    }
})

const track = (target, prop) => {
    // 当前无副作用时，直接返回
    if (!activeEffect) return target[prop]

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

const trigger = (target, prop, type) => {
    // 获取目标对象 Map 集合
    const depsMap = bucket.get(target)
    if (!depsMap) return

    // 获取目标属性 Set 集合——依赖收集器
    const deps = depsMap.get(prop)
    const ITEARR = depsMap.get(ITERATE_KEY)

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

    // 稀有操作类型时，收集特殊依赖并存入桶中
    // 注意 DEL 会触发 ownKeys
    if (type === RECORD.ADD || type === RECORD.DEL) {
        addEffectFn(ITEARR)
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