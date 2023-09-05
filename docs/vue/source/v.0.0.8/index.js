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
    if (key === 'class') {
        el.className = propVal
    } else if(shouldSetAttr(key, el)) {
        // 判断是否只设置 key，没有设置 value
        if(typeof propVal === 'boolean' && propVal === '') {
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
            container.innerHTML = ''
        }
    
        container._o_vnode = vnode
    }

    // 挂载与比较虚拟节点的函数——渲染的核心入口
    function patch(_o_vnode, vnode, container) {
        if (!_o_vnode) {
            // 直接挂载
            mountEl(vnode, container)
        } else {
            // 比较更新部分
        }
    }

    // 将虚拟节点转为真实 DOM，并挂载到指定元素上
    function mountEl(vnode, container) {
        const el = createElement(vnode.type)
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

    return {
        render,
        patch
    }
}

const renderer = createRenderer({ createElement, setTextContent, insert })

const vnode = {
    type: 'h1',
    props: {
        id: 'foo'
    },
    children: [
        {
            type: 'p',
            props: {
                class: 'baz'
            },
            children: 'Hello World!'
        }
    ]
}

renderer.render(vnode, document.getElementById('app'))