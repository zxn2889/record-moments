---
prev:
    text: 实现 tokens
    link: /vue/chapter-15/achieveTokens.md
next:
    text: parser 优化
    link: /vue/chapter-15/parserOptimize.md
---

朋友们，上节我们学习了词法解析，这节我们学习 parser——解析器。

根据上节我们学习到的内容，将源代码转为目标代码是经过编译前端和编译后端这两个过程的。编译前端就是对源代码进行分析，并转成模板 AST 结构，这个过程我们称为解析过程，那实现它的功能叫解析器。那对应的将模板 AST 转为 JS AST 的过程称为转换器，将 JS AST 转为目标代码的过程称为生成器。本节我们学习的内容就是解析器——parser。

那如何实现 parser 呢？我们知道 parser 就是将源代码转为模板 AST，现在是已经有了词法分析，也知道 AST 为抽象语法树。那么，我们要做的就是如何将一组词法分析的结果转为这样的树形结构。

那树形结构的意义是什么？意义就是让一组解析后的词法记号能再次回归到显示的嵌套目录中，即，让其再次有了上下层级结构，知道谁是谁的父节点，谁是谁的子节点。

如这段代码：

```js
<template>
    <div>
        <p>我是段落No.1</p>
        <p>我是段落No.2</p>
    </div>
</template>
```

它经过解析器转换后生成的结果就是如下结构：

```js
-- div  
    -- p  
    -- p  
```

通过这样的转换，我们就能看出源代码在 HTML 中的表现形式是什么了。那我们目前手中有的信息有什么：

1. 一组词法记号，词法记号中的节点有开始节点、结束节点、内容标记
2. AST 树中 children 为真正的节点信息

那可以分析出的结论有哪些：

1. AST 树中每一个分叉的节点都是其下子节点的根节点
2. 可以根据词法记号中的结束节点，得出当前的节点信息执行完毕
3. 可以得到当结束节点执行完毕后，当前有效的根节点是谁
4. tokens 中的第一个词法记号为真正的根节点

根据以上的推论信息，我们得出了这样一种设计模式：在循环遍历词法记号的时候，维护一个‘桶’，每当一个标记为 startTag 的词法记号出现时，我们就把它放进桶里，它就是当下节点的根节点信息；当出现了一个标记为 endTag 的词法记号出现时，我们将就近的 startTag 的标记移出桶；这样最新的栈顶就成了最新的根节点信息，直到所有的词法记号读取完毕，这个桶也将清空。

结合前面学习到的知识，这个‘桶’其实就是栈，每个新添加的元素就是栈顶，移出的操作就是将栈顶删除。结构如下：

```js
function parser() {
    const tokens = getTokens(source)
    const ast = {
        type: 'Root',
        children: []
    }
    const reallyNode = []
    const bucket = []
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const type = token.type
        if (type === 'startTag') {
            // ...
        } else if (type === 'endTag') {
            // ...
        } else if (type === 'text') {
            // ...
        }
    }
}
```

但是这其中也发现了问题，我们对于栈的操作好实现，但是如何将栈顶的元素和对应的树形结构中的哪个节点关联起来，实现还有难度。我的解决方案是给每个桶中的 startTag 打标记，然后将节点信息扁平化处理，快速找到对应的标记。或者说更进一步，直接数当前的栈顶距离底部有几个层级，进而快速找到扁平化的深度。但是这些都有问题，就是你能找个这个深度，但是具体是该深度上的哪个元素你是不知道的。

那有什么办法吗？索引，不再存储词法标记，而是存储词法标记生成的元素的索引，即，AST 树上的节点的索引。这样，每个栈顶存储的都是和添加到 AST 树上的一样的引用，就解决了访问栈顶如何关联就是访问当前根节点的问题。实现如下：

```js
function parser(code) {
    const tokens = getTokens(code)
    const ast = {
        type: 'Root',
        children: []
    }
    const reallyNode = []
    const bucket = []
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const type = token.type
        if (type === 'startTag') {
            const eleNode = {
                type: 'Element',
                tag: token.tag,
                children: []
            }
            const currentNode = bucket[bucket.length - 1]
            if (currentNode) {
                currentNode.children.push(eleNode)
            } else {
                reallyNode.push(eleNode)
            }
            bucket.push(eleNode)
        } else if (type === 'endTag') {
            bucket.pop()
        } else if (type === 'text') {
            const textNode = {
                type: 'Text',
                content: token.content
            }
            const currentNode = bucket[bucket.length - 1]
            if (currentNode) {
                currentNode.children.push(textNode)
            } else {
                reallyNode.push(eleNode)
            }
        }
    }

    return reallyNode
}
```

我们试着打印如下源码的转换结果:

```js
<template>
    <div>
        <p>我是段落No.1</p>
        <p>我是段落No.2</p>
    </div>
</template>
```

![图片](/img/49.png)

从结果可知，实现了 AST 树的真实节点信息。当然，代码还有很多完善空间，目前的源代码也是做了字符串的处理。但是，如何实现一个 AST 树的原理我们已经知道了，完整代码如下：

::: details 详细代码
<<< ../source/v.0.0.20/index.js
:::

至这里，我们已经学习了如何实现一个模板 AST 树，知道了很重要的概念——栈在当前环境中的作用，与栈的每个元素都和 AST 树的根节点息息相关，领略到了索引和栈结合的威力。