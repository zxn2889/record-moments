---
prev:
    text: 实现 parser
    link: /vue/chapter-15/achieveParser.md
---

朋友们，上节我们学习了如何实现一个解析器，这节我们学习如何在此基础上对模板 AST 树进行优化。

优化的目的是什么：

1. 对生成的模板 AST 树进行语义检查
2. 进行一些特定的功能修改，如节点的替换、删除等

通过以上分析得知：

1. 我们需要再对生成的模板 AST 进行遍历
2. 在这个过程中进行一些操作

那如何进行遍历，如下：

```js
function optimizeParser(ast) {
    const child = ast.children
    if (child) {
        for (let i = 0; i < child.length; i++) {
            optimizeParser(child[i])
        }
    }
}
```

那如何在当中进行一些操作，如：如果是文本就替换为‘你已经很厉害了，但还要继续加油！’：

```js
function optimizeParser(ast) {
    if (ast.type === 'Text') {
        ast.content = '你已经很厉害了，但还要继续加油！'
    }

    const child = ast.children
    if (child) {
        for (let i = 0; i < child.length; i++) {
            optimizeParser(child[i])
        }
    }
}
```

这样我们就实现了文本替换，那如何查看更改后的 AST 呢，这里有个打印树的方法，如下：

```js
function dump(node, indent = 0) {
    const type = node.type
    const desc = type === 'Root'
        ? ''
        : type === 'Element'
            ? node.tag
            : node.content

    console.log(`${'-'.repeat(indent)}${type}:${desc}`)

    if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
            dump(node.children[i], indent + 2)
        }
    }
}
```

因为比较简单，没有做处理，以上是一段源码。那上述文本修改后打印的结果如下：

![图片](/img/50.png)

树形的结构很明显，知道谁是子级，谁是父级。同样，如果是 p 标签，替换为 div 标签，代码及打印结果分别如下：

```js
function optimizeParser(ast) {
    if (ast.type === 'Text') {
        ast.content = '你已经很厉害了，但还要继续加油！'
    }

    if (ast.type === 'Element' && ast.tag === 'p') {
        ast.tag = 'div'
    }

    const child = ast.children
    if (child) {
        for (let i = 0; i < child.length; i++) {
            optimizeParser(child[i])
        }
    }
}
```

![图片](/img/51.png)

如图，p 标签已经变为了 div 标签，且修改的文本内容也正常打印，这样就实现了效果。但是，类似的操作不能都添加在这里，会导致函数臃肿，所以需要抽离出去。如下：

```js
// 优化模板 AST
function optimizeParser(ast) {
    replaceASTText(ast)
    replaceASTElement(ast)

    const child = ast.children
    if (child) {
        for (let i = 0; i < child.length; i++) {
            optimizeParser(child[i])
        }
    }
}

// 替换模板 AST 中文本节点内容
function replaceASTText(node) {
    if (node.type === 'Text') {
        node.content = '你已经很厉害了，但还要继续加油！'
    }
}

// 替换模板 AST 中节点元素类型
function replaceASTElement(node) {
    if (node.type === 'Element' && node.tag === 'p') {
        node.tag = 'div'
    }
}
```

这样也能实现效果，但是这就导致一个效果，它太呆板了，如果我想让用户自定义修改 AST 怎么办呢？

所以以上在内部写固定钩子的方法不合适，但又不知道用户会定义怎样的函数名，所以，还需要定义一个容器，代码内部执行这个容器，进而执行用户自定义的内容，如下：

```js
function optimizeParser(ast, funcs = []) {
    if (funcs.length) {
        for (let i = 0; i < funcs.length; i++) {
            funcs[i](ast, funcs)
        }
    }

    const child = ast.children
    if (child) {
        for (let i = 0; i < child.length; i++) {
            optimizeParser(child[i])
        }
    }
}

// 替换模板 AST 中文本节点内容
function replaceASTText() {
    if (node.type === 'Text') {
        node.content = '你已经很厉害了，但还要继续加油哦！'
    }
}

// 替换模板 AST 中节点元素类型
function replaceASTElement() {
    if (node.type === 'Element' && node.tag === 'p') {
        node.tag = 'div'
    }
}

optimizeParser(ast, [replaceASTText, replaceASTElement])
```

但是这些都是节点内容的平替，但如果我想删除一段节点呢？上面的内容就不合适了，难道设 node = null 吗？正常来讲是要把当前节点给删除掉对不对？那要怎么操作呢？

还记得我们实现渲染器逻辑中的上下文吗？如 renderContext、setup 的 context，这种上下文的方式就提供了一种能力——能让我们在不同的场景下访问当前实例的状态集的能力。

我们现在也需要这样一种上下文，通过将 AST 树的节点等信息存储到状态集里，进而实现如删除这种更改原 AST 树的能力。实现如下：

```js
function optimizeParser(ast, funcs = []) {
    
    const context = {
        currentNode: ast,
        childIndex: null, // 当前节点在父节点中的子节点
        parentNode: null,
        funcs
    }
    
    traverseNode(context)
}

function traverseNode(context) {
    const node = context.currentNode
    const funcs = context.funcs

    if (funcs.length) {
        for (let i = 0; i < funcs.length; i++) {
            funcs[i](node, context)
        }
    }
    
    const child = node.children
    if (child) {
        for (let i = 0; i < child.length; i++) {
            context.childIndex = i
            context.parentNode = node
            context.currentNode = child[i] 
            traverseNode(context)
        }
    }
}
```

如上述代码所示，通过将深度遍历与执行自定义的逻辑移出，然后增加 context 上下文对象的方式，进而让这种操作实现了可能，那如何实现当前节点访问上级节点进而去修改的逻辑呢？

```js
function delASTElement(node, context) {
    if (node.type === 'Text' && context.parentNode) {
        context.parentNode.children.splice(context.childIndex, 1)
        context.currentNode = null
    }
}

function traverseNode(ast, context) {
    // 省略

    if (funcs.length) {
        for (let i = 0; i < funcs.length; i++) {
            // 省略
            if (!context.currentNode) return
        }
    }

    // 省略
}
```

如上所示，满足一定条件后，通过访问父节点找到要删除的节点，然后把自己再置为空，最后在运行函数结束后再 return 出去，就实现了这段逻辑。代码优化后如下：

:::: code-group
::: code-group-item index.html
@[code](../source/v.0.0.21/index.html)
:::
::: code-group-item index.js
@[code](../source/v.0.0.21/index.js)
:::
::: code-group-item parser.js
@[code](../source/v.0.0.21/parser.js)
:::
::: code-group-item optimizeParser.js
@[code](../source/optimizeParser.js)
:::
::: code-group-item dump.js
@[code](../source/v.0.0.21/dump.js)
:::
::::

代码中可以看到，删除 AST 节点的方法我抽离了出来，作为了上下文中的内部方法，然后通过暴露上下文的方式，可以让用户自定义的写法能借助访问内部方法的形式，进而方便的改变 AST 树结构。同时，新增了平替 AST 树节点的内部方法，采取了同样的方式。

至这里，我们已经学习了如何去优化一个 AST 树结构，当然，我们还有很多边界的问题没有去处理，但是，已经了解了它的内部实现原理。下节，我们将在此基础上学习更深入的内容。