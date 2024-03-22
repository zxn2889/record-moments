import{_ as c,r as p,o as l,c as i,e as a,w as t,d as u,a as n,b as s}from"./app-13115eff.js";const r="/record-moments/img/52.png",k="/record-moments/img/53.png",d={},v=u(`<p>朋友们，上节我们学习了如何对生成的模板 AST 进行再优化，这节我们学习如何实现一个转换器。</p><p>之前我们了解到，将源码解析为目标代码的过程有三个，分别是：解析器、转换器、生成器。解析器为源码分析过程，为的是生成与 HTML 同构的模板 AST 树；转换器就是对之前分析的结果，进一步转换为一种在目标平台中实现目标代码生成前的前置代码。</p><p>我们知道，vue 中目标代码是 render 渲染函数，以上节中的源码示例，它的转换结果如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token function">h</span><span class="token punctuation">(</span><span class="token string">&#39;div&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">[</span>
        <span class="token function">h</span><span class="token punctuation">(</span><span class="token string">&#39;p&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;我是段落No.1&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token function">h</span><span class="token punctuation">(</span><span class="token string">&#39;p&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;我是段落No.2&#39;</span><span class="token punctuation">)</span>
    <span class="token punctuation">]</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>那 JS AST 树就是对这段目标代码的描述。那如何创建这样的一段描述？我们仔细分析目标代码，它是一种函数结构，包含两层：一层是外围的 render 函数，它返回具体的要生成的节点；一层是 h 函数，它具体实现所有要生成的节点信息，可嵌套。</p><p>我们可以看到，如果要将同构的模板 AST 直接转为目标代码有点不大好操作，毕竟，一个是函数，一个是包含着 Element、Text 这样的节点信息。所以需要中间转换过程，过程运行的结果就是目标代码生成的准备逻辑，且它的描述一定是如何生成这样的函数的节点信息。</p><p>结合上述 render 函数，我们将其结构描述如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> renderDesc <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;FunctionDecl&#39;</span><span class="token punctuation">,</span>
    <span class="token literal-property property">id</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;Identifier&#39;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;render&#39;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token literal-property property">params</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token comment">// 函数参数</span>
    <span class="token literal-property property">body</span><span class="token operator">:</span> <span class="token punctuation">[</span> <span class="token comment">// 函数体，具体要执行的内容，可能有多条语句，所以也是数组</span>
        <span class="token punctuation">{</span>
            <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;ReturnStatement&#39;</span><span class="token punctuation">,</span>
            <span class="token keyword">return</span><span class="token operator">:</span> <span class="token string">&#39;返回的内容&#39;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">注意</p><p>定义这样一种表达函数的 AST 树结构的方式有很多，但是我们只关注其中几点：</p><ol><li>它是一种 Object 的形式，表示节点</li><li>它有明确的标识表示哪种函数类型</li><li>它有明确指定的接收参数</li><li>它有执行具体函数逻辑的函数体，且每个函数体要有 return 返回值</li><li>它有指定的函数名称的接收参数</li></ol><p>只要指定了这几种方式，然后生成目标代码的时候根据标识走固定的逻辑就好了。</p></div><p>了解了上述 render 的定义方式，我们再以第一层 h 函数为例定义，如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> hDesc <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;CallExpression&#39;</span><span class="token punctuation">,</span>
    <span class="token literal-property property">id</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;Identifier&#39;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;h&#39;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token literal-property property">params</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意，因为是两个执行不同的功能函数，所以 type 类型的值不一样，但都表示要生成的目标代码为函数。且 h 函数要接收参数，第一个参数为元素节点类型，第二个参数为数组。在实现过程中，参数在 JS AST 中也要加入描述的，为的是在生成函数时能插入正确的参数，所以，参数也是一个节点。</p><p>定义第一个参数如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> tagNode <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;TagNode&#39;</span><span class="token punctuation">,</span>
    <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;div&#39;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>定义第二个参数如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> paramsNode <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;ArrayParamsNode&#39;</span><span class="token punctuation">,</span>
    <span class="token literal-property property">params</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>定义完成之后，它们的 JS AST 树示例如下：</p><details class="custom-container details"><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> renderDesc <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;FunctionDecl&#39;</span><span class="token punctuation">,</span>
    <span class="token literal-property property">id</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;Identifier&#39;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;render&#39;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token literal-property property">params</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token comment">// 函数参数</span>
    <span class="token literal-property property">body</span><span class="token operator">:</span> <span class="token punctuation">[</span> <span class="token comment">// 函数体，具体要执行的内容，可能有多条语句，所以也是数组</span>
        <span class="token punctuation">{</span>
            <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;ReturnStatement&#39;</span><span class="token punctuation">,</span>
            <span class="token keyword">return</span><span class="token operator">:</span> <span class="token punctuation">{</span>
                <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;CallExpression&#39;</span><span class="token punctuation">,</span>
                <span class="token literal-property property">id</span><span class="token operator">:</span> <span class="token punctuation">{</span>
                    <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;Identifier&#39;</span><span class="token punctuation">,</span>
                    <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;h&#39;</span>
                <span class="token punctuation">}</span><span class="token punctuation">,</span>
                <span class="token literal-property property">params</span><span class="token operator">:</span> <span class="token punctuation">[</span>
                    <span class="token punctuation">{</span>
                        <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;TagNode&#39;</span><span class="token punctuation">,</span>
                        <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;div&#39;</span>
                    <span class="token punctuation">}</span><span class="token punctuation">,</span>
                    <span class="token punctuation">{</span>
                        <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;ArrayParamsNode&#39;</span><span class="token punctuation">,</span>
                        <span class="token literal-property property">params</span><span class="token operator">:</span> <span class="token punctuation">[</span>
                            <span class="token punctuation">{</span>
                                <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;CallExpression&#39;</span><span class="token punctuation">,</span>
                                <span class="token literal-property property">id</span><span class="token operator">:</span> <span class="token punctuation">{</span>
                                    <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;Identifier&#39;</span><span class="token punctuation">,</span>
                                    <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;h&#39;</span>
                                <span class="token punctuation">}</span><span class="token punctuation">,</span>
                                <span class="token literal-property property">params</span><span class="token operator">:</span> <span class="token punctuation">[</span>
                                    <span class="token punctuation">{</span>
                                        <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;TagNode&#39;</span><span class="token punctuation">,</span>
                                        <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;p&#39;</span>
                                    <span class="token punctuation">}</span><span class="token punctuation">,</span>
                                    <span class="token punctuation">{</span>
                                        <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;ParamsNode&#39;</span><span class="token punctuation">,</span>
                                        <span class="token literal-property property">context</span><span class="token operator">:</span> <span class="token string">&#39;我是段落No.1&#39;</span>
                                    <span class="token punctuation">}</span>
                                <span class="token punctuation">]</span>
                            <span class="token punctuation">}</span><span class="token punctuation">,</span>
                            <span class="token punctuation">{</span>
                                <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;CallExpression&#39;</span><span class="token punctuation">,</span>
                                <span class="token literal-property property">id</span><span class="token operator">:</span> <span class="token punctuation">{</span>
                                    <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;Identifier&#39;</span><span class="token punctuation">,</span>
                                    <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;h&#39;</span>
                                <span class="token punctuation">}</span><span class="token punctuation">,</span>
                                <span class="token literal-property property">params</span><span class="token operator">:</span> <span class="token punctuation">[</span>
                                    <span class="token punctuation">{</span>
                                        <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;TagNode&#39;</span><span class="token punctuation">,</span>
                                        <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;p&#39;</span>
                                    <span class="token punctuation">}</span><span class="token punctuation">,</span>
                                    <span class="token punctuation">{</span>
                                        <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;ParamsNode&#39;</span><span class="token punctuation">,</span>
                                        <span class="token literal-property property">context</span><span class="token operator">:</span> <span class="token string">&#39;我是段落No.2&#39;</span>
                                    <span class="token punctuation">}</span>
                                <span class="token punctuation">]</span>
                            <span class="token punctuation">}</span>
                        <span class="token punctuation">]</span>
                    <span class="token punctuation">}</span>
                <span class="token punctuation">]</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><p>实际在操作实现这样的一段代码中，逻辑中是有一定重复性的，所以我们把对应的生成节点信息的代码提取出来，如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// h 函数的第一个参数</span>
<span class="token keyword">function</span> <span class="token function">setTagNode</span><span class="token punctuation">(</span><span class="token parameter">tag</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;TagNode&#39;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">name</span><span class="token operator">:</span> tag
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// h 函数的第二个参数</span>
<span class="token keyword">function</span> <span class="token function">setArrayParamsNode</span><span class="token punctuation">(</span><span class="token parameter">params</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;ArrayParamsNode&#39;</span><span class="token punctuation">,</span>
        params
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 设置函数的节点名</span>
<span class="token keyword">function</span> <span class="token function">setFunctionNameNode</span><span class="token punctuation">(</span><span class="token parameter">name</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;Identifier&#39;</span><span class="token punctuation">,</span>
        name
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 设置文本节点</span>
<span class="token keyword">function</span> <span class="token function">setTextNode</span><span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;Text&#39;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">context</span><span class="token operator">:</span> value
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 设置 h 函数的节点</span>
<span class="token keyword">function</span> <span class="token function">setHNode</span><span class="token punctuation">(</span><span class="token parameter">params</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;CallExpression&#39;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">id</span><span class="token operator">:</span> <span class="token function">setFunctionNameNode</span><span class="token punctuation">(</span><span class="token string">&#39;h&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token literal-property property">nodes</span><span class="token operator">:</span> params
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>定义好了这些，我们就要着手实现 JS AST 了，那如何去实现呢？vue 内部做了一个很巧妙的方案，就是在遍历源码生成模板 AST 树的时候就给它定义好，这样呢，就直接节省了我们再次循环模板 AST 树的结构，然后再想办法如何给它拼接成 JS AST 的逻辑了。</p><p>而且有个更绝妙的主意是，它是通过回调收集再遍历的方式实现的，很完美的解决了在处理好子节点后要怎么着手更改其父节点的问题，而且这个影响是祖父、祖祖父...这样的级别的，意思是只要在嵌套的组件结构内，它都能给你实现向上的修改。我们看下它的实现思路：</p><p><img src="`+r+`" alt="图片"></p><p>我们看下它的实现代码：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">traverseNode</span><span class="token punctuation">(</span><span class="token parameter">ast<span class="token punctuation">,</span> context</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 省略</span>
    
    <span class="token keyword">const</span> callBackFunc <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>funcs<span class="token punctuation">.</span>length<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> funcs<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">const</span> fun <span class="token operator">=</span> funcs<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> context<span class="token punctuation">)</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>fun<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                callBackFunc<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>fun<span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token punctuation">)</span> <span class="token keyword">return</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    
    <span class="token comment">// 省略</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>callBackFunc<span class="token punctuation">.</span>length<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> callBackFunc<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">;</span> i <span class="token operator">&gt;=</span> <span class="token number">0</span><span class="token punctuation">;</span> i<span class="token operator">--</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            callBackFunc<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当然，这对我们之前的代码设计就有点问题了，因为目前我们的 funcs 是依赖外部传入的，这里需要做改进，这种转换器的操作不需要用户来实现。回调的逻辑中执行的就是实现 JS AST 的方法，通过自底向上一个回调一个回调的拼接，就形成了 JS AST 树。</p><p>以当前源码为例，在回调过程中我们需要注意的就是：逻辑根节点 Root、文本节点 Text、元素节点 Element。分别实现如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// 转换文本节点</span>
<span class="token keyword">function</span> <span class="token function">transformTextJsNode</span><span class="token punctuation">(</span><span class="token parameter">node<span class="token punctuation">,</span> context</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token punctuation">.</span>type <span class="token operator">!==</span> <span class="token string">&#39;Text&#39;</span><span class="token punctuation">)</span> <span class="token keyword">return</span>

        node<span class="token punctuation">.</span>jsNode <span class="token operator">=</span> <span class="token function">setTextNode</span><span class="token punctuation">(</span>node<span class="token punctuation">.</span>content<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 转换元素节点</span>
<span class="token keyword">function</span> <span class="token function">transformElementJsNode</span><span class="token punctuation">(</span><span class="token parameter">node<span class="token punctuation">,</span> context</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token punctuation">.</span>type <span class="token operator">!==</span> <span class="token string">&#39;Element&#39;</span><span class="token punctuation">)</span> <span class="token keyword">return</span>

        <span class="token keyword">const</span> tag <span class="token operator">=</span> <span class="token function">setTagNode</span><span class="token punctuation">(</span>node<span class="token punctuation">.</span>tag<span class="token punctuation">)</span>
        <span class="token keyword">const</span> hNode <span class="token operator">=</span> <span class="token function">setHNode</span><span class="token punctuation">(</span><span class="token punctuation">[</span>tag<span class="token punctuation">]</span><span class="token punctuation">)</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token punctuation">.</span>children<span class="token punctuation">.</span>length <span class="token operator">===</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            hNode<span class="token punctuation">.</span>nodes<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>node<span class="token punctuation">.</span>children<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>jsNode<span class="token punctuation">)</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            hNode<span class="token punctuation">.</span>nodes<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span><span class="token function">setArrayParamsNode</span><span class="token punctuation">(</span>node<span class="token punctuation">.</span>children<span class="token punctuation">.</span><span class="token function">map</span><span class="token punctuation">(</span><span class="token parameter">c</span> <span class="token operator">=&gt;</span> c<span class="token punctuation">.</span>jsNode<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>

        node<span class="token punctuation">.</span>jsNode <span class="token operator">=</span> hNode
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 转换至逻辑根节点</span>
<span class="token keyword">function</span> <span class="token function">transformRootJsNode</span><span class="token punctuation">(</span><span class="token parameter">node<span class="token punctuation">,</span> context</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token punctuation">.</span>type <span class="token operator">!==</span> <span class="token string">&#39;Root&#39;</span><span class="token punctuation">)</span> <span class="token keyword">return</span>

        <span class="token keyword">const</span> realNode <span class="token operator">=</span> node<span class="token punctuation">.</span>children<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>jsNode

        node<span class="token punctuation">.</span>jsNode <span class="token operator">=</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;FunctionDecl&#39;</span><span class="token punctuation">,</span>
            <span class="token literal-property property">id</span><span class="token operator">:</span> <span class="token punctuation">{</span>
                <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;Identifier&#39;</span><span class="token punctuation">,</span>
                <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;render&#39;</span>
            <span class="token punctuation">}</span><span class="token punctuation">,</span>
            <span class="token literal-property property">params</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
            <span class="token literal-property property">body</span><span class="token operator">:</span> <span class="token punctuation">[</span>
                <span class="token punctuation">{</span>
                    <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;ReturnStatement&#39;</span><span class="token punctuation">,</span>
                    <span class="token keyword">return</span><span class="token operator">:</span> realNode
                <span class="token punctuation">}</span>
            <span class="token punctuation">]</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>至此，我们就实现了 JS AST 树的动态拼装，其结果如下：</p><p><img src="`+k+'" alt="图片"></p><p>修整后相关代码如下：</p>',31),m=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" createParser "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},"'./parser.js'"),s(`
`),n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" createOptimizeParser"),n("span",{class:"token punctuation"},","),s(" getCurrentContext "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},"'./optimizeParser.js'"),s(`

`),n("span",{class:"token keyword"},"const"),s(" source "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token template-string"},[n("span",{class:"token template-punctuation string"},"`"),n("span",{class:"token string"},"<div><p>我是段落No.1</p><p>我是段落No.2</p></div>"),n("span",{class:"token template-punctuation string"},"`")]),s(`
`),n("span",{class:"token keyword"},"const"),s(" ast "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"createParser"),n("span",{class:"token punctuation"},"("),s("source"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token function"},"createOptimizeParser"),n("span",{class:"token punctuation"},"("),s("ast"),n("span",{class:"token punctuation"},")"),s(`

console`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"log"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},"'ast'"),n("span",{class:"token punctuation"},","),s(" ast"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token comment"},"// 替换模板 AST 中文本节点内容"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"replaceASTText"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"node"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("node"),n("span",{class:"token punctuation"},"."),s("type "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token string"},"'Text'"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token function"},"getCurrentContext"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"replaceASTNode"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token literal-property property"},"type"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'Text'"),n("span",{class:"token punctuation"},","),s(`
            `),n("span",{class:"token literal-property property"},"content"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'你已经很厉害了，但还要继续加油！'"),s(`
        `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 替换模板 AST 中节点元素类型"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"replaceASTElement"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"node"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("node"),n("span",{class:"token punctuation"},"."),s("type "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token string"},"'Element'"),s(),n("span",{class:"token operator"},"&&"),s(" node"),n("span",{class:"token punctuation"},"."),s("tag "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token string"},"'p'"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        node`),n("span",{class:"token punctuation"},"."),s("tag "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token string"},"'div'"),s(`
        `),n("span",{class:"token function"},"getCurrentContext"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"replaceASTNode"),n("span",{class:"token punctuation"},"("),s("node"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"delASTElement"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"node"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("node"),n("span",{class:"token punctuation"},"."),s("type "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token string"},"'Text'"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token function"},"getCurrentContext"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"removeASTNode"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),b=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" transformTextJsNode"),n("span",{class:"token punctuation"},","),s(" transformElementJsNode"),n("span",{class:"token punctuation"},","),s(" transformRootJsNode "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},"'./transformer.js'"),s(`
`),n("span",{class:"token keyword"},"let"),s(" currentContext "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token keyword"},"null"),s(`

`),n("span",{class:"token comment"},"// 优化模板 AST"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"optimizeParser"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("ast"),n("span",{class:"token punctuation"},","),s(" funcs "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"["),n("span",{class:"token punctuation"},"]")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    
    `),n("span",{class:"token comment"},"// 创建上下文"),s(`
    `),n("span",{class:"token keyword"},"const"),s(" context "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token literal-property property"},"currentNode"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token keyword"},"null"),n("span",{class:"token punctuation"},","),s(`
        `),n("span",{class:"token literal-property property"},"childIndex"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token keyword"},"null"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token comment"},"// 当前节点在父节点中的子节点"),s(`
        `),n("span",{class:"token literal-property property"},"parentNode"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token keyword"},"null"),n("span",{class:"token punctuation"},","),s(`
        `),n("span",{class:"token literal-property property"},"funcs"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token punctuation"},"["),s("transformTextJsNode"),n("span",{class:"token punctuation"},","),s(" transformElementJsNode"),n("span",{class:"token punctuation"},","),s(" transformRootJsNode"),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"concat"),n("span",{class:"token punctuation"},"("),s("funcs"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},","),s(`
        `),n("span",{class:"token function-variable function"},"removeASTNode"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token function"},"setRemoveASTNode"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"call"),n("span",{class:"token punctuation"},"("),s("context"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},","),s(`
        `),n("span",{class:"token function-variable function"},"replaceASTNode"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"node"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token function"},"setReplaceASTNode"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"call"),n("span",{class:"token punctuation"},"("),s("context"),n("span",{class:"token punctuation"},","),s(" node"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token comment"},"// 将上下文赋予全局变量"),s(`
    `),n("span",{class:"token function"},"setCurrentContext"),n("span",{class:"token punctuation"},"("),s("context"),n("span",{class:"token punctuation"},")"),s(`
    
    `),n("span",{class:"token function"},"traverseNode"),n("span",{class:"token punctuation"},"("),s("ast"),n("span",{class:"token punctuation"},","),s(" context"),n("span",{class:"token punctuation"},")"),s(`

    `),n("span",{class:"token comment"},"// 将全局变量置为空"),s(`
    `),n("span",{class:"token comment"},"// setCurrentContext(null)"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 遍历 AST 树，并执行相应优化"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"traverseNode"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("ast"),n("span",{class:"token punctuation"},","),s(" context")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    context`),n("span",{class:"token punctuation"},"."),s("currentNode "),n("span",{class:"token operator"},"="),s(` ast
    `),n("span",{class:"token keyword"},"const"),s(" node "),n("span",{class:"token operator"},"="),s(` ast
    `),n("span",{class:"token keyword"},"const"),s(" funcs "),n("span",{class:"token operator"},"="),s(" context"),n("span",{class:"token punctuation"},"."),s(`funcs
    
    `),n("span",{class:"token keyword"},"const"),s(" callBackFunc "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"["),n("span",{class:"token punctuation"},"]"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("funcs"),n("span",{class:"token punctuation"},"."),s("length"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"for"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"let"),s(" i "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token number"},"0"),n("span",{class:"token punctuation"},";"),s(" i "),n("span",{class:"token operator"},"<"),s(" funcs"),n("span",{class:"token punctuation"},"."),s("length"),n("span",{class:"token punctuation"},";"),s(" i"),n("span",{class:"token operator"},"++"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"const"),s(" fun "),n("span",{class:"token operator"},"="),s(" funcs"),n("span",{class:"token punctuation"},"["),s("i"),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},"("),s("node"),n("span",{class:"token punctuation"},","),s(" context"),n("span",{class:"token punctuation"},")"),s(`
            `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("fun"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
                callBackFunc`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"push"),n("span",{class:"token punctuation"},"("),s("fun"),n("span",{class:"token punctuation"},")"),s(`
            `),n("span",{class:"token punctuation"},"}"),s(`
            `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"!"),s("node"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token keyword"},"return"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`
    
    `),n("span",{class:"token keyword"},"const"),s(" child "),n("span",{class:"token operator"},"="),s(" node"),n("span",{class:"token punctuation"},"."),s(`children
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("child"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"for"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"let"),s(" i "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token number"},"0"),n("span",{class:"token punctuation"},";"),s(" i "),n("span",{class:"token operator"},"<"),s(" child"),n("span",{class:"token punctuation"},"."),s("length"),n("span",{class:"token punctuation"},";"),s(" i"),n("span",{class:"token operator"},"++"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            context`),n("span",{class:"token punctuation"},"."),s("childIndex "),n("span",{class:"token operator"},"="),s(` i
            context`),n("span",{class:"token punctuation"},"."),s("parentNode "),n("span",{class:"token operator"},"="),s(` node
            `),n("span",{class:"token function"},"traverseNode"),n("span",{class:"token punctuation"},"("),s("child"),n("span",{class:"token punctuation"},"["),s("i"),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},","),s(" context"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("callBackFunc"),n("span",{class:"token punctuation"},"."),s("length"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"for"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"let"),s(" i "),n("span",{class:"token operator"},"="),s(" callBackFunc"),n("span",{class:"token punctuation"},"."),s("length "),n("span",{class:"token operator"},"-"),s(),n("span",{class:"token number"},"1"),n("span",{class:"token punctuation"},";"),s(" i "),n("span",{class:"token operator"},">="),s(),n("span",{class:"token number"},"0"),n("span",{class:"token punctuation"},";"),s(" i"),n("span",{class:"token operator"},"--"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            callBackFunc`),n("span",{class:"token punctuation"},"["),s("i"),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 平替 AST 节点"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"setReplaceASTNode"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"node"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"this"),n("span",{class:"token punctuation"},"."),s("parentNode"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"this"),n("span",{class:"token punctuation"},"."),s("currentNode "),n("span",{class:"token operator"},"="),s(` node
        `),n("span",{class:"token keyword"},"this"),n("span",{class:"token punctuation"},"."),s("parentNode"),n("span",{class:"token punctuation"},"."),s("children"),n("span",{class:"token punctuation"},"["),n("span",{class:"token keyword"},"this"),n("span",{class:"token punctuation"},"."),s("childIndex"),n("span",{class:"token punctuation"},"]"),s(),n("span",{class:"token operator"},"="),s(` node
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 删除 AST 节点"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"setRemoveASTNode"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"this"),n("span",{class:"token punctuation"},"."),s("parentNode"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"this"),n("span",{class:"token punctuation"},"."),s("parentNode"),n("span",{class:"token punctuation"},"."),s("children"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"splice"),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"this"),n("span",{class:"token punctuation"},"."),s("childIndex"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token number"},"1"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token keyword"},"this"),n("span",{class:"token punctuation"},"."),s("currentNode "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token keyword"},"null"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 创建解析优化器"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"createOptimizeParser"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("ast"),n("span",{class:"token punctuation"},","),s(" funcs "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"["),n("span",{class:"token punctuation"},"]")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token function"},"optimizeParser"),n("span",{class:"token punctuation"},"("),s("ast"),n("span",{class:"token punctuation"},","),s(" funcs"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 设置上下文至当前上下文变量中"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"setCurrentContext"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"context"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    currentContext `),n("span",{class:"token operator"},"="),s(` context
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 获取当前上下文变量"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"getCurrentContext"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(` currentContext
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token keyword"},"export"),s(),n("span",{class:"token punctuation"},"{"),s(" createOptimizeParser"),n("span",{class:"token punctuation"},","),s(" getCurrentContext "),n("span",{class:"token punctuation"},"}"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),y=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token comment"},"// h 函数的第一个参数"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"setTagNode"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"tag"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token literal-property property"},"type"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'TagNode'"),n("span",{class:"token punctuation"},","),s(`
        `),n("span",{class:"token literal-property property"},"name"),n("span",{class:"token operator"},":"),s(` tag
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// h 函数的第二个参数"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"setArrayParamsNode"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"params"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token literal-property property"},"type"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'ArrayParamsNode'"),n("span",{class:"token punctuation"},","),s(`
        params
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 设置函数的节点名"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"setFunctionNameNode"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"name"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token literal-property property"},"type"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'Identifier'"),n("span",{class:"token punctuation"},","),s(`
        name
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 设置文本节点"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"setTextNode"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"value"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token literal-property property"},"type"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'Text'"),n("span",{class:"token punctuation"},","),s(`
        `),n("span",{class:"token literal-property property"},"context"),n("span",{class:"token operator"},":"),s(` value
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 设置 h 函数的节点"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"setHNode"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"params"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token literal-property property"},"type"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'CallExpression'"),n("span",{class:"token punctuation"},","),s(`
        `),n("span",{class:"token literal-property property"},"id"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token function"},"setFunctionNameNode"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},"'h'"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},","),s(`
        `),n("span",{class:"token literal-property property"},"nodes"),n("span",{class:"token operator"},":"),s(` params
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 转换文本节点"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"transformTextJsNode"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("node"),n("span",{class:"token punctuation"},","),s(" context")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("node"),n("span",{class:"token punctuation"},"."),s("type "),n("span",{class:"token operator"},"!=="),s(),n("span",{class:"token string"},"'Text'"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token keyword"},"return"),s(`
        
        node`),n("span",{class:"token punctuation"},"."),s("jsNode "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"setTextNode"),n("span",{class:"token punctuation"},"("),s("node"),n("span",{class:"token punctuation"},"."),s("content"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 转换元素节点"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"transformElementJsNode"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("node"),n("span",{class:"token punctuation"},","),s(" context")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("node"),n("span",{class:"token punctuation"},"."),s("type "),n("span",{class:"token operator"},"!=="),s(),n("span",{class:"token string"},"'Element'"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token keyword"},"return"),s(`

        `),n("span",{class:"token keyword"},"const"),s(" tag "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"setTagNode"),n("span",{class:"token punctuation"},"("),s("node"),n("span",{class:"token punctuation"},"."),s("tag"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token keyword"},"const"),s(" hNode "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"setHNode"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},"["),s("tag"),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("node"),n("span",{class:"token punctuation"},"."),s("children"),n("span",{class:"token punctuation"},"."),s("length "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token number"},"1"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            hNode`),n("span",{class:"token punctuation"},"."),s("nodes"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"push"),n("span",{class:"token punctuation"},"("),s("node"),n("span",{class:"token punctuation"},"."),s("children"),n("span",{class:"token punctuation"},"["),n("span",{class:"token number"},"0"),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},"."),s("jsNode"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"else"),s(),n("span",{class:"token punctuation"},"{"),s(`
            hNode`),n("span",{class:"token punctuation"},"."),s("nodes"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"push"),n("span",{class:"token punctuation"},"("),n("span",{class:"token function"},"setArrayParamsNode"),n("span",{class:"token punctuation"},"("),s("node"),n("span",{class:"token punctuation"},"."),s("children"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"map"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"c"),s(),n("span",{class:"token operator"},"=>"),s(" c"),n("span",{class:"token punctuation"},"."),s("jsNode"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`

        node`),n("span",{class:"token punctuation"},"."),s("jsNode "),n("span",{class:"token operator"},"="),s(` hNode
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 转换逻辑根节点"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"transformRootJsNode"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("node"),n("span",{class:"token punctuation"},","),s(" context")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("node"),n("span",{class:"token punctuation"},"."),s("type "),n("span",{class:"token operator"},"!=="),s(),n("span",{class:"token string"},"'Root'"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token keyword"},"return"),s(`

        `),n("span",{class:"token keyword"},"const"),s(" realNode "),n("span",{class:"token operator"},"="),s(" node"),n("span",{class:"token punctuation"},"."),s("children"),n("span",{class:"token punctuation"},"["),n("span",{class:"token number"},"0"),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},"."),s(`jsNode

        node`),n("span",{class:"token punctuation"},"."),s("jsNode "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token literal-property property"},"type"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'FunctionDecl'"),n("span",{class:"token punctuation"},","),s(`
            `),n("span",{class:"token literal-property property"},"id"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token punctuation"},"{"),s(`
                `),n("span",{class:"token literal-property property"},"type"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'Identifier'"),n("span",{class:"token punctuation"},","),s(`
                `),n("span",{class:"token literal-property property"},"name"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'render'"),s(`
            `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},","),s(`
            `),n("span",{class:"token literal-property property"},"params"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token punctuation"},"["),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},","),s(`
            `),n("span",{class:"token literal-property property"},"body"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token punctuation"},"["),s(`
                `),n("span",{class:"token punctuation"},"{"),s(`
                    `),n("span",{class:"token literal-property property"},"type"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'ReturnStatement'"),n("span",{class:"token punctuation"},","),s(`
                    `),n("span",{class:"token keyword"},"return"),n("span",{class:"token operator"},":"),s(` realNode
                `),n("span",{class:"token punctuation"},"}"),s(`
            `),n("span",{class:"token punctuation"},"]"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token keyword"},"export"),s(),n("span",{class:"token punctuation"},"{"),s(" transformTextJsNode"),n("span",{class:"token punctuation"},","),s(" transformElementJsNode"),n("span",{class:"token punctuation"},","),s(" transformRootJsNode "),n("span",{class:"token punctuation"},"}"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),f=n("p",null,"至这里，我们已经学习了如何实现一个 JS AST 树，知道了其中最重要的两个步骤就是：如何设计表达函数的节点结构、及如何通过回调收集的方式拼接 JS AST 树。这其中，也明白了一个道理：就是在实现的过程中，不需要完全拘泥于源码，只要能实现前后的统一及功能的实现，就表明了我们的设计是成功的。而这，也能显著的提高我们的自信心与驱动我们下一次更加卓越的表现。",-1);function g(w,N){const e=p("CodeGroupItem"),o=p("CodeGroup");return l(),i("div",null,[v,a(o,null,{default:t(()=>[a(e,{title:"index.js"},{default:t(()=>[m]),_:1}),a(e,{title:"optimizeParser.js"},{default:t(()=>[b]),_:1}),a(e,{title:"transformer.js"},{default:t(()=>[y]),_:1})]),_:1}),f])}const x=c(d,[["render",g],["__file","achieveTransformer.html.vue"]]);export{x as default};
