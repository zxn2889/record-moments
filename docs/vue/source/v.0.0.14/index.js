const Comment = Symbol()
const Text = Symbol()
const Fragment = Symbol()

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
    if (vnode.type === Fragment) {
        vnode.children.forEach(v => unmount(v))
        return
    }
    const parent = vnode._el.parentNode
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
    function patch(_o_vnode, vnode, container, anchor) {
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
                mountEl(vnode, container, anchor)
            } else {
                // 存在旧 vnode，则比较
                patchEl(_o_vnode, vnode)
            }
        }
        // 当为 Text 节点时
        else if (type === Text) {
            // 不存在旧节点的情况下，让元素本身直接指向创建的文本的节点
            if (!_o_vnode) {
                const el = vnode._el = document.createTextNode(vnode.children)
                insert(el, container)
            } else {
                const el = vnode._el = _o_vnode._el
                if (vnode.children !== _o_vnode.children) {
                    el.nodeValue = vnode.children
                }
            }
        }
        // 当为 Fragment 节点时
        else if (type === Fragment) {
            // 当旧节点不存在时直接遍历挂载新节点内容
            if (!_o_vnode) {
                vnode.children.forEach(v => patch(null, v, container))
            }
            // 否则就比较新旧节点的 children
            else {
                patchChild(_o_vnode, vnode, container)
            }
        }
        // 当节点为注释节点时
        else if (type === Comment) {
            // 挂载与更新
        }
        else if (typeof type === 'object') {
            // 挂载与更新
        } else {
            // 挂载与更新
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
        const el = vnode._el = _o_vnode._el
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
                doubleEndDiff(n1, n2, container)
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

    // 简单比较 diff
    function diff(n1, n2, container) {
        const oChild = n1.children
        const nChild = n2.children

        // 定义旧节点要比较的基准值，并设置初始值为 0——和新节点循环的初始角标一致
        let lastestIndex = 0
        for (let i = 0; i < nChild.length; i++) {
            const nv = nChild[i]

            // 挂载新增的节点
            const hasEl = oChild.find(v => v.key === nv.key)
            if (!hasEl) {
                mountEl(nv, container)
            }

            let find = false
            for (let j = 0; j < oChild.length; j++) {
                const ov = oChild[j]

                // 满足可复用的条件
                if (nv.key === ov.key) {
                    find = true

                    patch(ov, nv, container)

                    if (j < lastestIndex) {
                        // 找到新节点对应的上一个节点
                        // 注意，新旧节点的 DOM 指向都是一样的，都是指向的旧节点对应的真实节点
                        const prevNode = nChild[i-1]

                        // 如果不存在，说明是第一个，不需要移动
                        if (prevNode) {
                            // 找到上一个节点的对应的下一个兄弟节点
                            const anchor = prevNode._el.nextSibling

                            // 将当前兄弟节点作为锚点插入到父节点下的指定位置
                            insert(nv._el, container, anchor)
                        }

                    }
                    // 在满足可复用的条件下，如果当前旧节点的角标不小于要比较的基准值，则更新基准值为当前旧节点的角标值
                    else {
                        lastestIndex = j
                    }
                    break
                }
            }

            // 如果到这里仍然为 false，说明没有可复用节点，即为新增节点
            // 注意：上面判断是否为可复用节点时，并没有判断 type，所以这里不严谨
            if (!find) {
                const prevNode = nChild[i-1]
                let anchor
                if (prevNode) {
                    anchor = prevNode._el.nextSibling
                } else {
                    anchor = container.firstChild
                }
                patch(null, nv, container, anchor)
            }
        }

        // 卸载不存在的旧节点
        for (let i = 0; i < oChild.length; i++) {
            const ov = oChild[i]
            const hasEl = nChild.find(v => v.key === ov.key)
            if (!hasEl) {
                unmount(ov)
            }
        }
    }

    // 双端比较 diff
    function doubleEndDiff(n1, n2, container) {
        const oChild = n1.children
        const nChild = n2.children

        let oStartIndex = 0
        let oEndIndex = oChild.length - 1
        let nStartIndex = 0
        let nEndIndex = nChild.length - 1

        let oStartV = oChild[oStartIndex]
        let oEndV = oChild[oEndIndex]
        let nStartV = nChild[nStartIndex]
        let nEndV = nChild[nEndIndex]

        while (oStartIndex <= oEndIndex && nStartIndex <= nEndIndex) {
            if (!oStartV) {
                oStartV = oChild[++oStartIndex]
            } else if (!oEndV) {
                oEndV = oChild[--oEndIndex]
            } else if (oStartV.key === nStartV.key) {
                patch(oStartV, nStartV, container)
                oStartV = oChild[++oStartIndex]
                nStartV = nChild[++nStartIndex]
            } else if (oEndV.key === nEndV.key) {
                patch(oEndV, nEndV, container)
                oStartV = oChild[--oStartIndex]
                nStartV = nChild[--nStartIndex]
            } else if (oStartV.key === nEndV.key) {
                patch(oStartV, nEndV, container)
                insert(oStartV._el, container, oEndV._el.nextSibling)
                oStartV = oChild[++oStartIndex]
                nEndV = nChild[--nEndIndex]
            } else if (oEndV.key === nStartV.key) {
                // 比较更新
                patch(oEndV, nStartV, container)
                // 将尾部节点插入到头部元素前
                insert(oEndV._el, container, oStartV._el)
                // 将尾部角标--，同时将尾部元素向上挪动至最新（依据角标向上挪动一位）
                oEndV = oChild[--oEndIndex]
                // 将头部角标++，同时将头部元素乡下挪动至最新（依据角标向下挪动一位）
                nStartV = nChild[++nStartIndex]
            } else {
                const fIndex = oChild.findIndex(v => v.key === nStartV.key)
                // 因为双边都已经比较过，这个时候如果存在，则 > 0
                if (fIndex > 0) {
                    const moveV = oChild[fIndex]
                    patch(moveV, nStartV, container)
                    // 因为双边比较不存在，这个时候存在，说明不在元素头部，所以需要将该元素移动到头部位置
                    insert(moveV._el, container, oStartV._el)
                    // 因为这是双边比较不存在的特殊情况，虽然将对应的真实 DOM 移走了，
                    // 但是该虚拟节点还是在遍历的规则内，所以设置空 undifined ，方便后续判断
                    oChild[fIndex] = undefined
                    // 相当于旧节点内部已经特殊处理过，这个时候新节点的头部节点顺序改变
                    nStartV = nChild[++nStartIndex]
                } else {
                    patch(null, nStartV, container, oStartV._el)
                    nStartV = nChild[++nStartIndex]
                }
            }
        }

        // 卸载旧节点
        for (let i = oStartIndex; i < oChild.length; i++) {
            unmount(oChild[i])
        }
    }

    return {
        render,
        patch
    }
}

const renderer = createRenderer({ createElement, setTextContent, insert })

const oVnode = {
    type: 'div',
    children: [
        { type: 'p', key: 1, children: 'No.1' },
        { type: 'p', key: 2, children: 'No.2' },
        { type: 'p', key: 3, children: 'No.3' },
        { type: 'p', key: 4, children: 'No.4' }
    ]
}

const nVnode = {
    type: 'div',
    children: [
        { type: 'p', key: 2, children: 'No.2' },
        { type: 'p', key: 1, children: 'No.1' }
    ]
}

renderer.render(oVnode, document.getElementById('app'))

setTimeout(() => {
    renderer.render(nVnode, document.getElementById('app'))
}, 1000)