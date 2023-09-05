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

// 创建渲染器
function createRenderer(options) {
    const { createElement, setTextContent, insert } = options

    // 渲染虚拟节点的函数
    function render(vnode, el) {
        if (vnode) {
            // 触发比较
            patch(el._o_vnode, vnode, el)
        } else {
            // 清空挂载内容
            el.innerHTML = ''
        }
    
        el._o_vnode = vnode
    }

    // 挂载与比较虚拟节点的函数——渲染的核心入口
    function patch(_o_vnode, vnode, el) {
        if (!_o_vnode) {
            // 直接挂载
            mountEl(vnode, el)
        } else {
            // 比较更新部分
        }
    }

    // 将虚拟节点转为真实 DOM，并挂载到指定元素上
    function mountEl(vnode, el) {
        const vEl = createElement(vnode.type)
        const vCon = vnode.children
        // 文本节点则直接填充
        if (typeof vCon === 'string') {
            setTextContent(el, vCon)
        } else {
            // ...
        }
        insert(vEl, el)
    }

    return {
        render,
        patch
    }
}

const renderer = createRenderer({ createElement, setTextContent, insert })

const vnode = {
    type: 'h1',
    children: '一级标题'
}

renderer.render(vnode, document.getElementById('app'))