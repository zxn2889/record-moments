import { effect, ref } from '@zxn2889/achieve-proxy'

// 创建一个元素
function createElement(tag) {
    return document.createElement(tag)
}

// 添加元素的文本内容
function setTextContent(el, text) {
    el.textContent = text
}

// 在元素前添加内容，anchor 未指定则是在当前父元素的末尾添加
function insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
}

// 对不同情况下的 prop 属性做处理
function patchProps(key, el, propVal) {

    // 匹配所有事件
    if (/^on/.test(key)) {
        // 设置事件存储器
        let invokers = el._evi || (el._evi = {})

        // 匹配具体事件类型的绑定值
        let invoker = invokers[key]

        // 如果传入值存在时
        if (propVal) {

            // 如果绑定的事件类型值不存在时添加事件
            if (!invoker) {

                // 通过高阶函数创建虚拟指向
                invoker = el._evi[key] = (e) => {
                    // e.timeStamp 为执行时事件触发的时间
                    // 事件触发的时间 < 事件委托的时间时，则不触发
                    if (e.timeStamp < invoker.attachTime) return false

                    // 一个类型上绑定多个事件时，循环触发
                    if (Array.isArray(invoker.value)) {
                        invoker.value.forEach(fn => fn)
                    } else if (Object.prototype.toString.call(invoker.value) === '[object Object]') {
                        // 绑定为非函数时警告
                        console.warn('事件值要为函数');
                    } else {
                        // 正常执行
                        invoker.value(e)
                    }
                }

                // 将传入的值赋值给高阶函数中具体执行逻辑
                invoker.value = propVal

                // 赋值事件触发时间
                // performance 为高精度时间
                invoker.attachTime = performance.now()

                // 给元素添加事件
                const type = key.slice(2).toLowerCase()
                el.addEventListener(type, invoker)
            } else {
                invoker.value = propVal
            }
        } else {
            if (invoker) {
                el.removeEventListener(type, invoker)
            }
        }
    }
    if (key === 'class') {
        el.className = propVal
    } else if(shouldSetAttr(key, el)) {
        // 判断是否只设置 key，没有设置 value
        if(typeof el[key] === 'boolean' && propVal === '') {
            el[key] = true
        } else {
            el[key] = propVal
        }
    } else {
        el.setAttribute(key, propVal) 
    }
}

// 判断属性是否只能通过 setAttribute 设置
function shouldSetAttr(key, el) {
    // 对于表单情况的特殊处理
    if(el.tagName === 'INPUT' && key === 'form') return false

    // 判断当前属性在 DOM properties 上是否存在
    return key in el
}

// 删除 vnode 对应的真实 DOM
function unmount(vnode) {
    const parent = vnode._el.parent
    if (parent) parent.removeChild(vnode._el)
}

// 创建渲染器
function createRenderer(options) {
    const { createElement, setTextContent, insert } = options

    // 渲染虚拟节点的函数
    function render(vnode, container) {
        if (vnode) {
            // 触发比较
            patch(container._o_vnode, vnode, container)
        } else {
            // 清空挂载内容
            if (container._o_vnode) {
                // 找到 vnode 对应的真实 DOM，并删除
                unmount(container._o_vnode)
            }
        }
    
        container._o_vnode = vnode
    }

    // 挂载与比较虚拟节点的函数——渲染的核心入口
    function patch(_o_vnode, vnode, container) {
        // 先卸载
        if (_o_vnode && _o_vnode.type !== vnode.type) {
            unmount(_o_vnode)
            _o_vnode = null
        }

        // 再更新
        // string 表示普通标签元素，object 表示组件，...
        const type = vnode.type

        // 当为普通标签元素时
        if (typeof type === 'string') {
            // 不存在旧 vnode 直接挂载逻辑
            if (!_o_vnode) {
                mountEl(vnode, container)
            } else {
                // 存在旧 vnode，则比较
                patchEl(_o_vnode, vnode)
            }
        } else if (typeof type === 'object') {
            // 更新
        } else {
            // 更新
        }
    }

    // 普通标签元素时的挂载逻辑
    // 将虚拟节点转为真实 DOM，并挂载到指定元素上
    function mountEl(vnode, container) {
        // 将 vnode 生成的真实 DOM 信息挂载到 vnode 上，让 vnode 和 真实 DOM 产生关联
        const el = vnode._el = createElement(vnode.type)

        const vChild = vnode.children

        // 如果有属性存在则在元素上添加属性
        if (vnode.props) {
            for (const key in vnode.props) {
                patchProps(key, el, vnode.props[key])
            }
        }

        // 文本节点则直接填充
        if (typeof vChild === 'string') {
            setTextContent(el, vChild)
        } else if (Array.isArray(vChild)) {
            // 存在子节点则循环进行比较更新
            // 当前无旧 vnode，所以传入的旧 vnode 为 null
            for (let i = 0; i < vChild.length; i++) {
                patch(null, vChild[i], el)
            }
        }
        insert(el, container)
    }

    // 比较两个 type 类型相同下的节点差异，并更新
    function patchEl(_o_vnode, vnode) {
        const el = _o_vnode._el = vnode._el
        const oProps = _o_vnode.props
        const nProps = vnode.props

        for (const key in nProps) {
            if (Object.hasOwnProperty.call(nProps, key)) {
                // 此判断模拟情形
                // 1. 新旧节点都存在 key，但是值不同，更新新值
                // 2. 新节点存在 key，但旧节点不存在 key，更新新值
                // 3. 新节点不存在 key，但旧节点存在 key，更新新值
                if (nProps[key] !== oProps[key]) {
                    patchProps(key, el, nProps[key])
                }
            }
        }

        patchChild(_o_vnode, vnode, el)
    }

    // 比较新旧节点的 children 部分，并更新
    function patchChild(n1, n2, container) {
        if (typeof n2.children === 'string') {
            if (Array.isArray(n1.children)) {
                n1.children.forEach(v => unmount(v))
            }
            setTextContent(container, n2.children)
        } else if (Array.isArray(n2.children)) {
            if (Array.isArray(n1.children)) {
                n1.children.forEach(v => unmount(v))
                n2.children.forEach(v => patch(null, v, container))
            } else {
                setTextContent(el, '')
                n2.children.forEach(v => patch(null, v, container))
            }
        } else {
            if (Array.isArray(n1.children)) {
                n1.children.forEach(v => unmount(v))
            } else {
                setTextContent(container, null)
            }
        }
    }

    return {
        render,
        patch
    }
}

const renderer = createRenderer({ createElement, setTextContent, insert })

const hk = ref(false)

const vnode = {
    type: 'h1',
    props: {
        id: 'foo',
        onClick: hk.value 
            ? () => console.log('三元前 hk.value = ', hk.value) 
            : {}
    },
    children: [
        {
            type: 'p',
            props: {
                class: 'baz',
                onClick: () => {
                    hk.value = true
                }
            },
            children: 'Hello World!'
        }
    ]
}

effect(() => {
    renderer.render(vnode, document.getElementById('app'))
})