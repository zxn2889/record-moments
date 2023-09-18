---
prev:
    text: parser 优化
    link: /vue/chapter-15/parserOptimize.md
---

朋友们，上节我们学习了如何对生成的模板 AST 进行再优化，这节我们学习如何实现一个转换器。

之前我们了解到，将源码解析为目标代码的过程有三个，分别是：解析器、转换器、生成器。解析器为源码分析过程，为的是生成与 HTML 同构的模板 AST 树；转换器就是对之前分析的结果，进一步转换为一种在目标平台中实现目标代码生成前的前置代码。

我们知道，vue 中目标代码是 render 渲染函数，以上节中的源码示例，它的转换结果如下：

```js
function render() {
    return h('div', [
        h('p', '我是段落No.1'),
        h('p', '我是段落No.2')
    ])
}
```

那 JS AST 树就是对这段目标代码的描述。那如何创建这样的一段描述？我们仔细分析目标代码，它是一种函数结构，包含两层：一层是外围的 render 函数，它返回具体的要生成的节点；一层是 h 函数，它具体实现所有要生成的节点信息，可嵌套。

我们可以看到，如果要将同构的模板 AST 直接转为目标代码有点不大好操作，毕竟，一个是函数，一个是包含着 Element、Text 这样的节点信息。所以需要中间转换过程，过程运行的结果就是目标代码生成的准备逻辑，且它的描述一定是如何生成这样的函数的节点信息。

结合上述 render 函数，我们将其结构描述如下：

```js
const renderDesc = {
    type: 'FunctionDecl',
    id: {
        type: 'Identifier',
        name: 'render'
    },
    params: [], // 函数参数
    body: [ // 函数体，具体要执行的内容，可能有多条语句，所以也是数组
        {
            type: 'ReturnStatement',
            return: '返回的内容'
        }
    ]
}
```

::: tip 注意
定义这样一种表达函数的 AST 树结构的方式有很多，但是我们只关注其中几点：
1. 它是一种 Object 的形式，表示节点
2. 它有明确的标识表示哪种函数类型
3. 它有明确指定的接收参数
4. 它有执行具体函数逻辑的函数体，且每个函数体要有 return 返回值
5. 它有指定的函数名称的接收参数

只要指定了这几种方式，然后生成目标代码的时候根据标识走固定的逻辑就好了。
:::

了解了上述 render 的定义方式，我们再以第一层 h 函数为例定义，如下：

```js
const hDesc = {
    type: 'CallExpression',
    id: {
        type: 'Identifier',
        name: 'h'
    },
    params: []
}
```

注意，因为是两个执行不同的功能函数，所以 type 类型的值不一样，但都表示要生成的目标代码为函数。且 h 函数要接收参数，第一个参数为元素节点类型，第二个参数为数组。在实现过程中，参数在 JS AST 中也要加入描述的，为的是在生成函数时能插入正确的参数，所以，参数也是一个节点。

定义第一个参数如下：

```js
const tagNode = {
    type: 'TagNode',
    name: 'div'
}
```

定义第二个参数如下：

```js
const paramsNode = {
    type: 'ArrayParamsNode',
    params: []
}
```

定义完成之后，它们的 JS AST 树示例如下：

::: details
```js
const renderDesc = {
    type: 'FunctionDecl',
    id: {
        type: 'Identifier',
        name: 'render'
    },
    params: [], // 函数参数
    body: [ // 函数体，具体要执行的内容，可能有多条语句，所以也是数组
        {
            type: 'ReturnStatement',
            return: {
                type: 'CallExpression',
                id: {
                    type: 'Identifier',
                    name: 'h'
                },
                params: [
                    {
                        type: 'TagNode',
                        name: 'div'
                    },
                    {
                        type: 'ArrayParamsNode',
                        params: [
                            {
                                type: 'CallExpression',
                                id: {
                                    type: 'Identifier',
                                    name: 'h'
                                },
                                params: [
                                    {
                                        type: 'TagNode',
                                        name: 'p'
                                    },
                                    {
                                        type: 'ParamsNode',
                                        context: '我是段落No.1'
                                    }
                                ]
                            },
                            {
                                type: 'CallExpression',
                                id: {
                                    type: 'Identifier',
                                    name: 'h'
                                },
                                params: [
                                    {
                                        type: 'TagNode',
                                        name: 'p'
                                    },
                                    {
                                        type: 'ParamsNode',
                                        context: '我是段落No.2'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    ]
}
```
:::

实际在操作实现这样的一段代码中，逻辑中是有一定重复性的，所以我们把对应的生成节点信息的代码提取出来，如下：

```js
// h 函数的第一个参数
function setTagNode(tag) {
    return {
        type: 'TagNode',
        name: tag
    }
}

// h 函数的第二个参数
function setArrayParamsNode(params) {
    return {
        type: 'ArrayParamsNode',
        params
    }
}

// 设置函数的节点名
function setFunctionNameNode(name) {
    return {
        type: 'Identifier',
        name
    }
}

// 设置文本节点
function setTextNode(value) {
    return {
        type: 'Text',
        context: value
    }
}

// 设置 h 函数的节点
function setHNode(params) {
    return {
        type: 'CallExpression',
        id: setFunctionNameNode('h'),
        nodes: params
    }
}
```

定义好了这些，我们就要着手实现 JS AST 了，那如何去实现呢？vue 内部做了一个很巧妙的方案，就是在遍历源码生成模板 AST 树的时候就给它定义好，这样呢，就直接节省了我们再次循环模板 AST 树的结构，然后再想办法如何给它拼接成 JS AST 的逻辑了。

而且有个更绝妙的主意是，它是通过回调收集再遍历的方式实现的，很完美的解决了在处理好子节点后要怎么着手更改其父节点的问题，而且这个影响是祖父、祖祖父...这样的级别的，意思是只要在嵌套的组件结构内，它都能给你实现向上的修改。我们看下它的实现思路：

![图片](/img/52.png)

我们看下它的实现代码：

```js
function traverseNode(ast, context) {
    // 省略
    
    const callBackFunc = []
    if (funcs.length) {
        for (let i = 0; i < funcs.length; i++) {
            const fun = funcs[i](node, context)
            if (fun) {
                callBackFunc.push(fun)
            }
            if (!node) return
        }
    }
    
    // 省略

    if (callBackFunc.length) {
        for (let i = 0; i < callBackFunc.length; i++) {
            callBackFunc[i]();
        }
    }
}
```

当然，这对我们之前的代码设计就有点问题了，因为目前我们的 funcs 是依赖外部传入的，这里需要做改进，这种转换器的操作不需要用户来实现。回调的逻辑中执行的就是实现 JS AST 的方法，通过自底向上一个回调一个回调的拼接，就形成了 JS AST 树。

以当前源码为例，在回调过程中我们需要注意的就是：逻辑根节点 Root、文本节点 Text、元素节点 Element。分别实现如下：

```js
// 转换文本节点
function transformTextJsNode(node, context) {
    return () => {
        if (node.type !== 'Text') return

        node.jsNode = setTextNode(node.content)
    }
}

// 转换元素节点
function transformElementJsNode(node, context) {
    return () => {
        if (node.type !== 'Element') return

        const tag = setTagNode(node.tag)
        const hNode = setHNode([tag])
        if (node.children.length === 1) {
            hNode.nodes.push(node.children[0].jsNode)
        } else {
            hNode.nodes.push(setArrayParamsNode(node.children.map(c => c.jsNode)))
        }

        node.jsNode = hNode
    }
}

// 转换至逻辑根节点
function transformRootJsNode(node, context) {
    return () => {
        if (node.type !== 'Root') return

        const realNode = node.children[0].jsNode

        node.jsNode = {
            type: 'FunctionDecl',
            id: {
                type: 'Identifier',
                name: 'render'
            },
            params: [],
            body: [
                {
                    type: 'ReturnStatement',
                    return: realNode
                }
            ]
        }
    }
}
```

至此，我们就实现了 JS AST 树的动态拼装，其结果如下：

![图片](/img/53.png)

修整后相关代码如下：

:::: code-group
::: code-group-item index.js
@[code](../source/v.0.0.22/index.js)
:::
::: code-group-item optimizeParser.js
@[code](../source/v.0.0.22/optimizeParser.js)
:::
::: code-group-item transformer.js
@[code](../source/v.0.0.22/transformer.js)
::::

至这里，我们已经学习了如何实现一个 JS AST 树，知道了其中最重要的两个步骤就是：如何设计表达函数的节点结构、及如何通过回调收集的方式拼接 JS AST 树。这其中，也明白了一个道理：就是在实现的过程中，不需要完全拘泥于源码，只要能实现前后的统一及功能的实现，就表明了我们的设计是成功的。而这，也能显著的提高我们的自信心与驱动我们下一次更加卓越的表现。