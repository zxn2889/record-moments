import{_ as p,r as o,o as l,c as i,e as a,w as t,d as u,a as n,b as s}from"./app-13115eff.js";const k={},r=u(`<p>朋友们，前面我们学习了如何实现一个小型的响应式系统，了解了一些内部的实现原理，这节我们学习如何设计一个渲染器，以及了解渲染器和响应系统是如何关联的。</p><p>我们知道，渲染器的工作流程是：把一段内容编译为虚拟节点并挂载到目标元素上，内容如有改变就触发更新的过程。从这里知道，我们需要定义一个功能函数，函数接收内容和挂载节点两个参数，且还要有前后比较的过程。如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// 一个基础的渲染</span>
<span class="token keyword">function</span> <span class="token function">render</span><span class="token punctuation">(</span><span class="token parameter">vnode<span class="token punctuation">,</span> el</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> mountEl <span class="token operator">=</span> document<span class="token punctuation">.</span><span class="token function">getElementById</span><span class="token punctuation">(</span>el<span class="token punctuation">)</span>
    mountEl<span class="token punctuation">.</span>innerHTML <span class="token operator">=</span> vnode
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// 一个带有比较更新的渲染</span>
<span class="token keyword">function</span> <span class="token function">render</span><span class="token punctuation">(</span><span class="token parameter">vnode<span class="token punctuation">,</span> el</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> mountEl <span class="token operator">=</span> document<span class="token punctuation">.</span><span class="token function">getElementById</span><span class="token punctuation">(</span>el<span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>vnode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 触发比较</span>
        <span class="token function">patch</span><span class="token punctuation">(</span>el<span class="token punctuation">.</span>_o_vnode<span class="token punctuation">,</span> vnode<span class="token punctuation">,</span> el<span class="token punctuation">)</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token comment">// 清空挂载内容</span>
        mountEl<span class="token punctuation">.</span>innerHTML <span class="token operator">=</span> <span class="token string">&#39;&#39;</span>
    <span class="token punctuation">}</span>

    el<span class="token punctuation">.</span>_o_vnode <span class="token operator">=</span> vnode
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里我们发现，一个基础的渲染器框架就出来了，比想象中要简单很多。那要怎么和响应系统联系起来呢，也很简单，就是我们的 effect。如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">import</span> <span class="token punctuation">{</span> effect <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;./proxy&#39;</span>

<span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token function">render</span><span class="token punctuation">(</span>vnode<span class="token punctuation">,</span> el<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样，当内部监听到 vnode 改变的时候，就自然触发更新了。但是，一个渲染器的组成一定是复杂的，它要兼顾到各个平台的实现，所以，单独的 render 渲染函数是不够的，我们要创建一个更大的平台去兼顾这种考虑。如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">createRenderer</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">function</span> <span class="token function">render</span><span class="token punctuation">(</span><span class="token parameter">vnode<span class="token punctuation">,</span> el</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> mountEl <span class="token operator">=</span> document<span class="token punctuation">.</span><span class="token function">getElementById</span><span class="token punctuation">(</span>el<span class="token punctuation">)</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>vnode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 触发比较</span>
            <span class="token function">patch</span><span class="token punctuation">(</span>el<span class="token punctuation">.</span>_o_vnode<span class="token punctuation">,</span> vnode<span class="token punctuation">,</span> el<span class="token punctuation">)</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token comment">// 清空挂载内容</span>
            mountEl<span class="token punctuation">.</span>innerHTML <span class="token operator">=</span> <span class="token string">&#39;&#39;</span>
        <span class="token punctuation">}</span>
    
        el<span class="token punctuation">.</span>_o_vnode <span class="token operator">=</span> vnode
    <span class="token punctuation">}</span>

    <span class="token keyword">function</span> <span class="token function">patch</span><span class="token punctuation">(</span><span class="token parameter">_o_vnode<span class="token punctuation">,</span> vnode<span class="token punctuation">,</span> el</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// ...</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> <span class="token punctuation">{</span>
        render<span class="token punctuation">,</span>
        patch
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> renderer <span class="token operator">=</span> <span class="token function">createRenderer</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样，一个渲染器的框架就定义好了，其实就是一个更大的函数包裹。那渲染的逻辑也很容易调用，如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> vnode <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;h1&#39;</span><span class="token punctuation">,</span>
    <span class="token literal-property property">children</span><span class="token operator">:</span> <span class="token string">&#39;一级标题&#39;</span>
<span class="token punctuation">}</span>

renderer<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span>vnode<span class="token punctuation">,</span> <span class="token string">&#39;app&#39;</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>那这个时候，patch 就会起作用，内部逻辑如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">patch</span><span class="token punctuation">(</span><span class="token parameter">_o_vnode<span class="token punctuation">,</span> vnode<span class="token punctuation">,</span> el</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>_o_vnode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 直接挂载</span>
        <span class="token function">mountEl</span><span class="token punctuation">(</span>vnode<span class="token punctuation">,</span> el<span class="token punctuation">)</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token comment">// 比较更新部分</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">mountEl</span><span class="token punctuation">(</span><span class="token parameter">vnode<span class="token punctuation">,</span> el</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> vEl <span class="token operator">=</span> document<span class="token punctuation">.</span><span class="token function">createElement</span><span class="token punctuation">(</span>vnode<span class="token punctuation">.</span>type<span class="token punctuation">)</span>
    <span class="token keyword">const</span> vCon <span class="token operator">=</span> vnode<span class="token punctuation">.</span>children
    <span class="token comment">// 文本节点则直接填充</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> vCon <span class="token operator">===</span> <span class="token string">&#39;string&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        vEl<span class="token punctuation">.</span>textContent <span class="token operator">=</span> vCon
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token comment">// ...</span>
    <span class="token punctuation">}</span>
    document<span class="token punctuation">.</span><span class="token function">getElementById</span><span class="token punctuation">(</span>el<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">appendChild</span><span class="token punctuation">(</span>vEl<span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里也发现，当旧的 vnode 节点没有内容的时候，说明这是一个空白的节点树，还没有过任何挂载动作，那我们就直接把新节点挂载上去就好了；如果旧 vode 节点存在，则再去比较新、旧节点树的差异。且挂载的过程中，我们是通过比较 vnode 节点的 children 属性做判断，如：‘如果是 string 类型，则说明是文本节点，直接填充在内容节点里’。</p><p>这个过程也发现很多问题，它不够优雅，也没有那么适用性强。所以，一方面要做抽离，方便适用各个平台，一方面是要把逻辑进行优化，如下：</p>`,14),d=n("div",{class:"language-html line-numbers-mode","data-ext":"html"},[n("pre",{class:"language-html"},[n("code",null,[n("span",{class:"token doctype"},[n("span",{class:"token punctuation"},"<!"),n("span",{class:"token doctype-tag"},"DOCTYPE"),s(),n("span",{class:"token name"},"html"),n("span",{class:"token punctuation"},">")]),s(`
`),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("html")]),s(),n("span",{class:"token attr-name"},"lang"),n("span",{class:"token attr-value"},[n("span",{class:"token punctuation attr-equals"},"="),n("span",{class:"token punctuation"},'"'),s("en"),n("span",{class:"token punctuation"},'"')]),n("span",{class:"token punctuation"},">")]),s(`
`),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("head")]),n("span",{class:"token punctuation"},">")]),s(`
  `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("meta")]),s(),n("span",{class:"token attr-name"},"charset"),n("span",{class:"token attr-value"},[n("span",{class:"token punctuation attr-equals"},"="),n("span",{class:"token punctuation"},'"'),s("UTF-8"),n("span",{class:"token punctuation"},'"')]),n("span",{class:"token punctuation"},">")]),s(`
  `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("meta")]),s(),n("span",{class:"token attr-name"},"name"),n("span",{class:"token attr-value"},[n("span",{class:"token punctuation attr-equals"},"="),n("span",{class:"token punctuation"},'"'),s("viewport"),n("span",{class:"token punctuation"},'"')]),s(),n("span",{class:"token attr-name"},"content"),n("span",{class:"token attr-value"},[n("span",{class:"token punctuation attr-equals"},"="),n("span",{class:"token punctuation"},'"'),s("width=device-width, initial-scale=1.0"),n("span",{class:"token punctuation"},'"')]),n("span",{class:"token punctuation"},">")]),s(`
  `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("title")]),n("span",{class:"token punctuation"},">")]),s("Document"),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"</"),s("title")]),n("span",{class:"token punctuation"},">")]),s(`
`),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"</"),s("head")]),n("span",{class:"token punctuation"},">")]),s(`
`),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("body")]),n("span",{class:"token punctuation"},">")]),s(`
  `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("div")]),s(),n("span",{class:"token attr-name"},"id"),n("span",{class:"token attr-value"},[n("span",{class:"token punctuation attr-equals"},"="),n("span",{class:"token punctuation"},'"'),s("app"),n("span",{class:"token punctuation"},'"')]),n("span",{class:"token punctuation"},">")]),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"</"),s("div")]),n("span",{class:"token punctuation"},">")]),s(`
  `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("script")]),s(),n("span",{class:"token attr-name"},"src"),n("span",{class:"token attr-value"},[n("span",{class:"token punctuation attr-equals"},"="),n("span",{class:"token punctuation"},'"'),s("./index.js"),n("span",{class:"token punctuation"},'"')]),s(),n("span",{class:"token attr-name"},"type"),n("span",{class:"token attr-value"},[n("span",{class:"token punctuation attr-equals"},"="),n("span",{class:"token punctuation"},'"'),s("module"),n("span",{class:"token punctuation"},'"')]),n("span",{class:"token punctuation"},">")]),n("span",{class:"token script"}),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"</"),s("script")]),n("span",{class:"token punctuation"},">")]),s(`
`),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"</"),s("body")]),n("span",{class:"token punctuation"},">")]),s(`
`),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"</"),s("html")]),n("span",{class:"token punctuation"},">")]),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),v=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token comment"},"// 创建一个元素"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"createElement"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"tag"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(" document"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"createElement"),n("span",{class:"token punctuation"},"("),s("tag"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 添加元素的文本内容"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"setTextContent"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("el"),n("span",{class:"token punctuation"},","),s(" text")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    el`),n("span",{class:"token punctuation"},"."),s("textContent "),n("span",{class:"token operator"},"="),s(` text
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 在元素前添加内容，anchor 未指定则是在当前父元素的末尾添加"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"insert"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("el"),n("span",{class:"token punctuation"},","),s(" parent"),n("span",{class:"token punctuation"},","),s(" anchor "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token keyword"},"null")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    parent`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"insertBefore"),n("span",{class:"token punctuation"},"("),s("el"),n("span",{class:"token punctuation"},","),s(" anchor"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 创建渲染器"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"createRenderer"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"options"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token punctuation"},"{"),s(" createElement"),n("span",{class:"token punctuation"},","),s(" setTextContent"),n("span",{class:"token punctuation"},","),s(" insert "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token operator"},"="),s(` options

    `),n("span",{class:"token comment"},"// 渲染虚拟节点的函数"),s(`
    `),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("vnode"),n("span",{class:"token punctuation"},","),s(" el")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("vnode"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token comment"},"// 触发比较"),s(`
            `),n("span",{class:"token function"},"patch"),n("span",{class:"token punctuation"},"("),s("el"),n("span",{class:"token punctuation"},"."),s("_o_vnode"),n("span",{class:"token punctuation"},","),s(" vnode"),n("span",{class:"token punctuation"},","),s(" el"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"else"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token comment"},"// 清空挂载内容"),s(`
            el`),n("span",{class:"token punctuation"},"."),s("innerHTML "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token string"},"''"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
    
        el`),n("span",{class:"token punctuation"},"."),s("_o_vnode "),n("span",{class:"token operator"},"="),s(` vnode
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token comment"},"// 挂载与比较虚拟节点的函数——渲染的核心入口"),s(`
    `),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"patch"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("_o_vnode"),n("span",{class:"token punctuation"},","),s(" vnode"),n("span",{class:"token punctuation"},","),s(" el")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"!"),s("_o_vnode"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token comment"},"// 直接挂载"),s(`
            `),n("span",{class:"token function"},"mountEl"),n("span",{class:"token punctuation"},"("),s("vnode"),n("span",{class:"token punctuation"},","),s(" el"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"else"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token comment"},"// 比较更新部分"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token comment"},"// 将虚拟节点转为真实 DOM，并挂载到指定元素上"),s(`
    `),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"mountEl"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("vnode"),n("span",{class:"token punctuation"},","),s(" el")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"const"),s(" vEl "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"createElement"),n("span",{class:"token punctuation"},"("),s("vnode"),n("span",{class:"token punctuation"},"."),s("type"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token keyword"},"const"),s(" vCon "),n("span",{class:"token operator"},"="),s(" vnode"),n("span",{class:"token punctuation"},"."),s(`children
        `),n("span",{class:"token comment"},"// 文本节点则直接填充"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"typeof"),s(" vCon "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token string"},"'string'"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token function"},"setTextContent"),n("span",{class:"token punctuation"},"("),s("el"),n("span",{class:"token punctuation"},","),s(" vCon"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"else"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token comment"},"// ..."),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
        `),n("span",{class:"token function"},"insert"),n("span",{class:"token punctuation"},"("),s("vEl"),n("span",{class:"token punctuation"},","),s(" el"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token punctuation"},"{"),s(`
        render`),n("span",{class:"token punctuation"},","),s(`
        patch
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token keyword"},"const"),s(" renderer "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"createRenderer"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},"{"),s(" createElement"),n("span",{class:"token punctuation"},","),s(" setTextContent"),n("span",{class:"token punctuation"},","),s(" insert "),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`

`),n("span",{class:"token keyword"},"const"),s(" vnode "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token literal-property property"},"type"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'h1'"),n("span",{class:"token punctuation"},","),s(`
    `),n("span",{class:"token literal-property property"},"children"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'一级标题'"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

renderer`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),s("vnode"),n("span",{class:"token punctuation"},","),s(" document"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"getElementById"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},"'app'"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),m=n("p",null,"这里发现，我们把虚拟节点转化为真实 DOM 的操作给抽离出去了，目的就是通过判断不同的平台下，传入不同的实现逻辑。这样，渲染器的工作范围就不仅仅是我们目前在模拟的浏览器平台了。",-1),b=n("p",null,"这一节我们学习了如何创建一个浏览器，以及如何让响应式系统与渲染器关联的方法，且在这个过程中了解了核心入口 patch，以及 vnode 转为真实 DOM 的过程，和渲染器是如何考虑通过 options 兼顾各个平台的功能的。神秘的外衣已经揭开了一部分，我们将学习它更多的内容。",-1);function g(f,y){const e=o("CodeGroupItem"),c=o("CodeGroup");return l(),i("div",null,[r,a(c,null,{default:t(()=>[a(e,{title:"index.html"},{default:t(()=>[d]),_:1}),a(e,{title:"index.js"},{default:t(()=>[v]),_:1})]),_:1}),m,b])}const _=p(k,[["render",g],["__file","designRenderer.html.vue"]]);export{_ as default};
