// 创建当前副作用指向
let activeEffect

// 创建副作用收集器
let effectStack = []

// 创建固定副作用调用钩子
function effect(fn, options = {}) {

    // 创建真实副作用辅助钩子——收集对应属性、对应依赖收集器等
    const effectFn = () => {
        cleanup(effectFn)

        // 当前副作用函数指向 effectFn
        activeEffect = effectFn

        // 当前副作用存入副作用收集器中——压栈
        effectStack.push(activeEffect)

        // 执行真实副作用并存入结果
        const fnRes = fn()

        // 当前副作用执行完毕后弹出副作用收集器——弹栈
        effectStack.pop()

        // 当前副作用指向栈顶副作用——存储器中最后一值
        activeEffect = effectStack.at(-1)

        // 返回真实副作用结果
        return fnRes
    }

    // 收集属性
    effectFn.options = options

    // 建立依赖收集器存储桶——存储依赖集合
    effectFn.deps = []

    // 非懒运行时直接执行
    if (!options.lazy) {
        effectFn()
    }

    // 其他情况返回辅助钩子
    return effectFn
}

// 清除当前辅助钩子上所有依赖收集器
const cleanup = (effectFn) => {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i];
        deps.delete(effectFn)
    }
    effectFn.deps.length = 0
}

export {
    activeEffect,
    effect
}