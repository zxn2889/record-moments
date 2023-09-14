import { createRenderer } from './renderer.js'
import { createElement, setTextContent, insert } from './browser.js'


const renderer = createRenderer({ createElement, setTextContent, insert })

function MyComponent(props) {
    return {
        type: 'div',
        children: `我是小黑，我今年 ${props.count} 岁了`
    }
}
MyComponent.options = {
    count: 1
}

const vnode = {
    type: MyComponent
}

renderer.render(vnode, document.getElementById('app'))