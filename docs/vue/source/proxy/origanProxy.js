import { reactive } from "./proxy.js";

// 将原始值转为 ref 式代理响应对象
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

// 将普通对象中的属性与代理对象的属性进行关联，进而实现响应式
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

    console.log('wrapper', wrapper);

    return wrapper
}

// 将代理对象中的所有属性映射到普通对象上，且进行关联，进而实现普通对象的响应式
// 注意这种遍历的写法，生成的属性两者是相同的
const toRefs = (proxyObj) => {
    let nObj = {}
    const props = Object.keys(proxyObj)
    props.forEach(prop => {
        nObj[prop] = toRef(proxyObj, prop)
    })

    return nObj
}

// ref 对象自动脱钩——脱离 .value 属性的访问和设置
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

export {
    ref,
    toRef,
    toRefs,
    proxyRef
}