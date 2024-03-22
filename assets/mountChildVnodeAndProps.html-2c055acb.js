import{_ as c,r as a,o as l,c as i,e as t,w as e,d as u,a as n,b as s}from"./app-13115eff.js";const k={},r=u(`<p>朋友们，上节我们学习了如何设计一个渲染器，与了解了它的基础架构，这一节我们来进一步的学习如何实现对 vnode 的挂载与更新的第一部分——含有子节点的 vnode 与 props 的挂载。</p><p>对于含有子节点的修改如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// 将虚拟节点转为真实 DOM，并挂载到指定元素上</span>
<span class="token keyword">function</span> <span class="token function">mountEl</span><span class="token punctuation">(</span><span class="token parameter">vnode<span class="token punctuation">,</span> el</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> vEl <span class="token operator">=</span> <span class="token function">createElement</span><span class="token punctuation">(</span>vnode<span class="token punctuation">.</span>type<span class="token punctuation">)</span>
    <span class="token keyword">const</span> vCon <span class="token operator">=</span> vnode<span class="token punctuation">.</span>children
    <span class="token comment">// 文本节点则直接填充</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> vCon <span class="token operator">===</span> <span class="token string">&#39;string&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">setTextContent</span><span class="token punctuation">(</span>vEl<span class="token punctuation">,</span> vCon<span class="token punctuation">)</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>Array<span class="token punctuation">.</span><span class="token function">isArray</span><span class="token punctuation">(</span>vCon<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 存在子节点则循环进行比较更新</span>
        <span class="token comment">// 当前无旧 vnode，所以传入的旧 vnode 为 null</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> vCon<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">patch</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> vCon<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">,</span> vEl<span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token function">insert</span><span class="token punctuation">(</span>vEl<span class="token punctuation">,</span> el<span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们现在把文本节点及含有子节点的情况都实现了，但是节点上的属性还没有模拟，我们先来看看属性怎么实现，我们用 props 表示 vnode 的属性，如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">mountEl</span><span class="token punctuation">(</span><span class="token parameter">vnode<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 其他代码省略</span>

    <span class="token comment">// 如果有属性存在则在元素上添加属性</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>vnode<span class="token punctuation">.</span>props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">const</span> key <span class="token keyword">in</span> vnode<span class="token punctuation">.</span>props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">const</span> propVal <span class="token operator">=</span> vnode<span class="token punctuation">.</span>props<span class="token punctuation">[</span>key<span class="token punctuation">]</span>
            el<span class="token punctuation">.</span><span class="token function">setAttribute</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> propVal<span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 其他代码省略</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里我们通过 <code>setAttribute</code> 方法实现，但是我们需要清楚一种情况，就是浏览器的 HTML attribute 和 DOM properties 有时候并不是完全一样的，且 HTML attribute 拿到的只是初始值。我们需要做以区分，如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">mountEl</span><span class="token punctuation">(</span><span class="token parameter">vnode<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 如果有属性存在则在元素上添加属性</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>vnode<span class="token punctuation">.</span>props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">const</span> key <span class="token keyword">in</span> vnode<span class="token punctuation">.</span>props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">const</span> propVal <span class="token operator">=</span> vnode<span class="token punctuation">.</span>props<span class="token punctuation">[</span>key<span class="token punctuation">]</span>

            <span class="token comment">// 判断当前属性在 DOM properties 上是否存在</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>key <span class="token keyword">in</span> el<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                el<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> propVal
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                el<span class="token punctuation">.</span><span class="token function">setAttribute</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> propVal<span class="token punctuation">)</span> 
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 省略其他代码</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">TIP</p><p>HTML Attribute 是我们写在 HTML 标签上的属性，DOM Properties 是通过 <code>el = document.getElementById()</code> 这样解析之后的属性。</p></div><p>但显然不止这些情况，如 vue 中对 class 的特殊处理、 input 标签的 form 属性为只读、标签上的属性仅有一个 key，且没有设置值时<code>(eg: &lt;input disabled /&gt;)</code>，修改如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">mountEl</span><span class="token punctuation">(</span><span class="token parameter">vnode<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>vnode<span class="token punctuation">.</span>props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">const</span> key <span class="token keyword">in</span> vnode<span class="token punctuation">.</span>props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">const</span> propVal <span class="token operator">=</span> vnode<span class="token punctuation">.</span>props<span class="token punctuation">[</span>key<span class="token punctuation">]</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>key <span class="token operator">===</span> <span class="token string">&#39;class&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                el<span class="token punctuation">.</span>className <span class="token operator">=</span> propVal
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span><span class="token punctuation">(</span>vnode<span class="token punctuation">.</span>type <span class="token operator">===</span> <span class="token string">&#39;input&#39;</span> <span class="token operator">&amp;&amp;</span> key <span class="token operator">===</span> <span class="token string">&#39;form&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                el<span class="token punctuation">.</span><span class="token function">setAttribute</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> propVal<span class="token punctuation">)</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>key <span class="token keyword">in</span> el<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token keyword">typeof</span> propVal <span class="token operator">===</span> <span class="token string">&#39;boolean&#39;</span> <span class="token operator">&amp;&amp;</span> propVal <span class="token operator">===</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    el<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token boolean">true</span>
                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                    el<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> propVal
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                el<span class="token punctuation">.</span><span class="token function">setAttribute</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> propVal<span class="token punctuation">)</span> 
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 其他代码省略</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里我们将代码优化以下，如下:</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">mountEl</span><span class="token punctuation">(</span><span class="token parameter">vnode<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>vnode<span class="token punctuation">.</span>props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">const</span> key <span class="token keyword">in</span> vnode<span class="token punctuation">.</span>props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">const</span> propVal <span class="token operator">=</span> vnode<span class="token punctuation">.</span>props<span class="token punctuation">[</span>key<span class="token punctuation">]</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>key <span class="token operator">===</span> <span class="token string">&#39;class&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                el<span class="token punctuation">.</span>className <span class="token operator">=</span> propVal
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token function">shouldSetAttr</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> el<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token comment">// 判断是否只设置 key，没有设置 value</span>
                <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token keyword">typeof</span> propVal <span class="token operator">===</span> <span class="token string">&#39;boolean&#39;</span> <span class="token operator">&amp;&amp;</span> propVal <span class="token operator">===</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    el<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token boolean">true</span>
                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                    el<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> propVal
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                el<span class="token punctuation">.</span><span class="token function">setAttribute</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> propVal<span class="token punctuation">)</span> 
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 其他代码省略</span>
<span class="token punctuation">}</span>

<span class="token comment">// 判断属性是否只能通过 setAttribute 设置</span>
<span class="token keyword">function</span> <span class="token function">shouldSetAttr</span><span class="token punctuation">(</span><span class="token parameter">key<span class="token punctuation">,</span> el</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span><span class="token punctuation">(</span>el<span class="token punctuation">.</span>tagName <span class="token operator">===</span> <span class="token string">&#39;INPUT&#39;</span> <span class="token operator">&amp;&amp;</span> key <span class="token operator">===</span> <span class="token string">&#39;form&#39;</span><span class="token punctuation">)</span> <span class="token keyword">return</span> <span class="token boolean">false</span>
    <span class="token keyword">return</span> key <span class="token keyword">in</span> el
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">TIP</p><p>这里说一下为什么要给 class 单独的做判断，因为在 vue 中写代码的时候，class 的定义方式是各种各样的，但是最后只要全部转化为空格间隔的样式，且对 setAttribute、className、classList 做了性能对比后，className 性能最好。</p></div><p>同样，我们把对应代码抽离后，完整代码如下：</p>`,14),d=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token comment"},"// 创建一个元素"),s(`
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

`),n("span",{class:"token comment"},"// 对不同情况下的 prop 属性做处理"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"patchProps"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("key"),n("span",{class:"token punctuation"},","),s(" el"),n("span",{class:"token punctuation"},","),s(" propVal")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("key "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token string"},"'class'"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        el`),n("span",{class:"token punctuation"},"."),s("className "),n("span",{class:"token operator"},"="),s(` propVal
    `),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"else"),s(),n("span",{class:"token keyword"},"if"),n("span",{class:"token punctuation"},"("),n("span",{class:"token function"},"shouldSetAttr"),n("span",{class:"token punctuation"},"("),s("key"),n("span",{class:"token punctuation"},","),s(" el"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token comment"},"// 判断是否只设置 key，没有设置 value"),s(`
        `),n("span",{class:"token keyword"},"if"),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"typeof"),s(" propVal "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token string"},"'boolean'"),s(),n("span",{class:"token operator"},"&&"),s(" propVal "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token string"},"''"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            el`),n("span",{class:"token punctuation"},"["),s("key"),n("span",{class:"token punctuation"},"]"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token boolean"},"true"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"else"),s(),n("span",{class:"token punctuation"},"{"),s(`
            el`),n("span",{class:"token punctuation"},"["),s("key"),n("span",{class:"token punctuation"},"]"),s(),n("span",{class:"token operator"},"="),s(` propVal
        `),n("span",{class:"token punctuation"},"}"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"else"),s(),n("span",{class:"token punctuation"},"{"),s(`
        el`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"setAttribute"),n("span",{class:"token punctuation"},"("),s("key"),n("span",{class:"token punctuation"},","),s(" propVal"),n("span",{class:"token punctuation"},")"),s(` 
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 判断属性是否只能通过 setAttribute 设置"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"shouldSetAttr"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("key"),n("span",{class:"token punctuation"},","),s(" el")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token comment"},"// 对于表单情况的特殊处理"),s(`
    `),n("span",{class:"token keyword"},"if"),n("span",{class:"token punctuation"},"("),s("el"),n("span",{class:"token punctuation"},"."),s("tagName "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token string"},"'INPUT'"),s(),n("span",{class:"token operator"},"&&"),s(" key "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token string"},"'form'"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token boolean"},"false"),s(`

    `),n("span",{class:"token comment"},"// 判断当前属性在 DOM properties 上是否存在"),s(`
    `),n("span",{class:"token keyword"},"return"),s(" key "),n("span",{class:"token keyword"},"in"),s(` el
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 创建渲染器"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"createRenderer"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"options"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token punctuation"},"{"),s(" createElement"),n("span",{class:"token punctuation"},","),s(" setTextContent"),n("span",{class:"token punctuation"},","),s(" insert "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token operator"},"="),s(` options

    `),n("span",{class:"token comment"},"// 渲染虚拟节点的函数"),s(`
    `),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("vnode"),n("span",{class:"token punctuation"},","),s(" container")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("vnode"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token comment"},"// 触发比较"),s(`
            `),n("span",{class:"token function"},"patch"),n("span",{class:"token punctuation"},"("),s("container"),n("span",{class:"token punctuation"},"."),s("_o_vnode"),n("span",{class:"token punctuation"},","),s(" vnode"),n("span",{class:"token punctuation"},","),s(" container"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"else"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token comment"},"// 清空挂载内容"),s(`
            container`),n("span",{class:"token punctuation"},"."),s("innerHTML "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token string"},"''"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
    
        container`),n("span",{class:"token punctuation"},"."),s("_o_vnode "),n("span",{class:"token operator"},"="),s(` vnode
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token comment"},"// 挂载与比较虚拟节点的函数——渲染的核心入口"),s(`
    `),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"patch"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("_o_vnode"),n("span",{class:"token punctuation"},","),s(" vnode"),n("span",{class:"token punctuation"},","),s(" container")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"!"),s("_o_vnode"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token comment"},"// 直接挂载"),s(`
            `),n("span",{class:"token function"},"mountEl"),n("span",{class:"token punctuation"},"("),s("vnode"),n("span",{class:"token punctuation"},","),s(" container"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"else"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token comment"},"// 比较更新部分"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token comment"},"// 将虚拟节点转为真实 DOM，并挂载到指定元素上"),s(`
    `),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"mountEl"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("vnode"),n("span",{class:"token punctuation"},","),s(" container")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"const"),s(" el "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"createElement"),n("span",{class:"token punctuation"},"("),s("vnode"),n("span",{class:"token punctuation"},"."),s("type"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token keyword"},"const"),s(" vChild "),n("span",{class:"token operator"},"="),s(" vnode"),n("span",{class:"token punctuation"},"."),s(`children

        `),n("span",{class:"token comment"},"// 如果有属性存在则在元素上添加属性"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("vnode"),n("span",{class:"token punctuation"},"."),s("props"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"for"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"const"),s(" key "),n("span",{class:"token keyword"},"in"),s(" vnode"),n("span",{class:"token punctuation"},"."),s("props"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
                `),n("span",{class:"token function"},"patchProps"),n("span",{class:"token punctuation"},"("),s("key"),n("span",{class:"token punctuation"},","),s(" el"),n("span",{class:"token punctuation"},","),s(" vnode"),n("span",{class:"token punctuation"},"."),s("props"),n("span",{class:"token punctuation"},"["),s("key"),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},")"),s(`
            `),n("span",{class:"token punctuation"},"}"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token comment"},"// 文本节点则直接填充"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"typeof"),s(" vChild "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token string"},"'string'"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token function"},"setTextContent"),n("span",{class:"token punctuation"},"("),s("el"),n("span",{class:"token punctuation"},","),s(" vChild"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"else"),s(),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("Array"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"isArray"),n("span",{class:"token punctuation"},"("),s("vChild"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token comment"},"// 存在子节点则循环进行比较更新"),s(`
            `),n("span",{class:"token comment"},"// 当前无旧 vnode，所以传入的旧 vnode 为 null"),s(`
            `),n("span",{class:"token keyword"},"for"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"let"),s(" i "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token number"},"0"),n("span",{class:"token punctuation"},";"),s(" i "),n("span",{class:"token operator"},"<"),s(" vChild"),n("span",{class:"token punctuation"},"."),s("length"),n("span",{class:"token punctuation"},";"),s(" i"),n("span",{class:"token operator"},"++"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
                `),n("span",{class:"token function"},"patch"),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"null"),n("span",{class:"token punctuation"},","),s(" vChild"),n("span",{class:"token punctuation"},"["),s("i"),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},","),s(" el"),n("span",{class:"token punctuation"},")"),s(`
            `),n("span",{class:"token punctuation"},"}"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
        `),n("span",{class:"token function"},"insert"),n("span",{class:"token punctuation"},"("),s("el"),n("span",{class:"token punctuation"},","),s(" container"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token punctuation"},"{"),s(`
        render`),n("span",{class:"token punctuation"},","),s(`
        patch
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token keyword"},"const"),s(" renderer "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"createRenderer"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},"{"),s(" createElement"),n("span",{class:"token punctuation"},","),s(" setTextContent"),n("span",{class:"token punctuation"},","),s(" insert "),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`

`),n("span",{class:"token keyword"},"const"),s(" vnode "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token literal-property property"},"type"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'h1'"),n("span",{class:"token punctuation"},","),s(`
    `),n("span",{class:"token literal-property property"},"props"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token literal-property property"},"id"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'foo'"),s(`
    `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},","),s(`
    `),n("span",{class:"token literal-property property"},"children"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token punctuation"},"["),s(`
        `),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token literal-property property"},"type"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'p'"),n("span",{class:"token punctuation"},","),s(`
            `),n("span",{class:"token literal-property property"},"props"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token punctuation"},"{"),s(`
                `),n("span",{class:"token keyword"},"class"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'baz'"),s(`
            `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},","),s(`
            `),n("span",{class:"token literal-property property"},"children"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'Hello World!'"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
    `),n("span",{class:"token punctuation"},"]"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

renderer`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),s("vnode"),n("span",{class:"token punctuation"},","),s(" document"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"getElementById"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},"'app'"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1);function v(m,b){const p=a("CodeGroupItem"),o=a("CodeGroup");return l(),i("div",null,[r,t(o,null,{default:e(()=>[t(p,{title:"index.js"},{default:e(()=>[d]),_:1})]),_:1})])}const f=c(k,[["render",v],["__file","mountChildVnodeAndProps.html.vue"]]);export{f as default};
