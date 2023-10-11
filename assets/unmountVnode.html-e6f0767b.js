import{_ as c,r as a,o as l,c as i,e as t,w as e,d as u,a as n,b as s}from"./app-13115eff.js";const k={},r=u(`<p>朋友们，上节我们学习了子节点和 props 属性的挂载，这节我们学习下如何卸载，及卸载的几种情况。</p><p>卸载我们知道，是之前已经完成过挂载，然后 vnode 更新后重新渲染的情况。那 vnode 的更新有可能是 null，还有可能是变化的 vnode，我们一一来对比。</p><p>当 vnode 为 null 时，我们回顾代码：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">render</span><span class="token punctuation">(</span><span class="token parameter">vnode<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>vnode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 触发比较</span>
        <span class="token function">patch</span><span class="token punctuation">(</span>container<span class="token punctuation">.</span>_o_vnode<span class="token punctuation">,</span> vnode<span class="token punctuation">,</span> container<span class="token punctuation">)</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token comment">// 清空挂载内容</span>
        container<span class="token punctuation">.</span>innerHTML <span class="token operator">=</span> <span class="token string">&#39;&#39;</span>
    <span class="token punctuation">}</span>

    container<span class="token punctuation">.</span>_o_vnode <span class="token operator">=</span> vnode
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里是直接把挂载容器的内容清空，但这样不对，正确的应该是找到 vnode 对应的真实 DOM，然后操作 DOM 删除。</p><div class="custom-container tip"><p class="custom-container-title">为什么通过真实 DOM 删除</p><ol><li>innerHTML 这种删除方式不能清空对应的事件信息</li><li>卸载的对象可能包含组件，需要执行对应组件的卸载周期（<code>eg: beforeUnmount、unmounted</code>）</li><li>卸载的元素可能包含自定义指令等，需要执行对应的钩子函数</li></ol></div><p>另外应该是有旧的 vnode 时才执行对应逻辑，优化如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">render</span><span class="token punctuation">(</span><span class="token parameter">vnode<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>vnode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 省略</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token comment">// 清空挂载内容</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>container<span class="token punctuation">.</span>_o_vnode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 找到 vnode 对应的真实 DOM，并删除</span>
            <span class="token keyword">const</span> el <span class="token operator">=</span> container<span class="token punctuation">.</span>_o_vnode<span class="token punctuation">.</span>_el
            <span class="token keyword">const</span> parent <span class="token operator">=</span> el<span class="token punctuation">.</span>parentNode
            <span class="token keyword">if</span> <span class="token punctuation">(</span>parent<span class="token punctuation">)</span> parent<span class="token punctuation">.</span><span class="token function">removeChild</span><span class="token punctuation">(</span>el<span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">mountEl</span><span class="token punctuation">(</span><span class="token parameter">vnode<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 将 vnode 生成的真实 DOM 信息挂载到 vnode 上，让 vnode 和 真实 DOM 产生关联</span>
    <span class="token keyword">const</span> el <span class="token operator">=</span> vnode<span class="token punctuation">.</span>_el <span class="token operator">=</span> <span class="token function">createElement</span><span class="token punctuation">(</span>vnode<span class="token punctuation">.</span>type<span class="token punctuation">)</span>
    
    <span class="token comment">// 省略</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到，这里通过连等将 vnode 添加的属性 <code>._el</code> 与生成的真实 DOM 节点做了绑定，这样就方便通过 vnode 找到对应的节点信息了。</p><p>那如果更新的节点不为空，且有值呢，这就涉及到比较了，但是比较也分情况，修改后如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">patch</span><span class="token punctuation">(</span><span class="token parameter">_o_vnode<span class="token punctuation">,</span> vnode<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>_o_vnode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 直接挂载</span>
        <span class="token function">mountEl</span><span class="token punctuation">(</span>vnode<span class="token punctuation">,</span> container<span class="token punctuation">)</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token comment">// 比较更新部分</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>_o_vnode<span class="token punctuation">.</span>type <span class="token operator">!==</span> vnode<span class="token punctuation">.</span>type<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">const</span> el <span class="token operator">=</span> _o_vnode<span class="token punctuation">.</span>_el
            <span class="token keyword">const</span> parent <span class="token operator">=</span> el<span class="token punctuation">.</span>parentNode
            <span class="token keyword">if</span> <span class="token punctuation">(</span>parent<span class="token punctuation">)</span> parent<span class="token punctuation">.</span><span class="token function">removeChild</span><span class="token punctuation">(</span>el<span class="token punctuation">)</span>
            _o_vnode <span class="token operator">=</span> <span class="token keyword">null</span>
            <span class="token comment">// 更新</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token comment">// 更新</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">TIP</p><p>如果更新的节点有值，不为空，且前后不一致，这种情况下不是单纯的卸载，而是打补丁——即前后对比，更新不同的部分。</p></div><p>我们看到卸载的部分其实逻辑重复了，这部分可以提取优化，然后我们还可以思考，既然是存在旧的节点，且类型不同的情况下，需要删除再更新，那删除的部分是不是可以提前呢，这样还能复用直接挂载逻辑。修改如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// 删除 vnode 对应的真实 DOM</span>
<span class="token keyword">function</span> <span class="token function">unmount</span><span class="token punctuation">(</span><span class="token parameter">vnode</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> parent <span class="token operator">=</span> vnode<span class="token punctuation">.</span>_el<span class="token punctuation">.</span>parent
    <span class="token keyword">if</span> <span class="token punctuation">(</span>parent<span class="token punctuation">)</span> parent<span class="token punctuation">.</span><span class="token function">removeChild</span><span class="token punctuation">(</span>vnode<span class="token punctuation">.</span>_el<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">patch</span><span class="token punctuation">(</span><span class="token parameter">_o_vnode<span class="token punctuation">,</span> vnode<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>_o_vnode <span class="token operator">&amp;&amp;</span> _o_vnode<span class="token punctuation">.</span>type <span class="token operator">!==</span> vnode<span class="token punctuation">.</span>type<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">unmount</span><span class="token punctuation">(</span>_o_vnode<span class="token punctuation">)</span>
        _o_vnode <span class="token operator">=</span> <span class="token keyword">null</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>_o_vnode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 直接挂载</span>
        <span class="token function">mountEl</span><span class="token punctuation">(</span>vnode<span class="token punctuation">,</span> container<span class="token punctuation">)</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token comment">// 比较更新部分</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>前面我们也提到，更新的可能是组件等情况，所以在更新时还需要再判断，如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">patch</span><span class="token punctuation">(</span><span class="token parameter">_o_vnode<span class="token punctuation">,</span> vnode<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 先卸载</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>_o_vnode <span class="token operator">&amp;&amp;</span> _o_vnode<span class="token punctuation">.</span>type <span class="token operator">!==</span> vnode<span class="token punctuation">.</span>type<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">unmount</span><span class="token punctuation">(</span>_o_vnode<span class="token punctuation">)</span>
        _o_vnode <span class="token operator">=</span> <span class="token keyword">null</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 再更新</span>
    <span class="token comment">// string 表示普通标签元素，object 表示组件，...</span>
    <span class="token keyword">const</span> type <span class="token operator">=</span> vnode<span class="token punctuation">.</span>type
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> type <span class="token operator">===</span> <span class="token string">&#39;string&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>_o_vnode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 当为普通标签元素时直接挂载逻辑</span>
            <span class="token function">mountEl</span><span class="token punctuation">(</span>vnode<span class="token punctuation">,</span> container<span class="token punctuation">)</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token function">patchEl</span><span class="token punctuation">(</span>_o_vnode<span class="token punctuation">,</span> vnode<span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> vnode<span class="token punctuation">.</span>type <span class="token operator">===</span> <span class="token string">&#39;object&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 更新</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token comment">// 更新</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里我们看到，更新的部分我们再次做了优化，加入了 vnode 节点的类型判断，通过判断不同的类型，进入不同的挂载或更新逻辑，使关注的场景更加单一。</p><div class="custom-container tip"><p class="custom-container-title">TIP</p><p>挂载是打补丁的一种，是其旧 vnode 为空的一种情况。</p></div><p>完整代码如下：</p>`,19),d=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token comment"},"// 创建一个元素"),s(`
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

`),n("span",{class:"token comment"},"// 删除 vnode 对应的真实 DOM"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"unmount"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"vnode"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"const"),s(" parent "),n("span",{class:"token operator"},"="),s(" vnode"),n("span",{class:"token punctuation"},"."),s("_el"),n("span",{class:"token punctuation"},"."),s(`parent
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("parent"),n("span",{class:"token punctuation"},")"),s(" parent"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"removeChild"),n("span",{class:"token punctuation"},"("),s("vnode"),n("span",{class:"token punctuation"},"."),s("_el"),n("span",{class:"token punctuation"},")"),s(`
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
            `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("container"),n("span",{class:"token punctuation"},"."),s("_o_vnode"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
                `),n("span",{class:"token comment"},"// 找到 vnode 对应的真实 DOM，并删除"),s(`
                `),n("span",{class:"token function"},"unmount"),n("span",{class:"token punctuation"},"("),s("container"),n("span",{class:"token punctuation"},"."),s("_o_vnode"),n("span",{class:"token punctuation"},")"),s(`
            `),n("span",{class:"token punctuation"},"}"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
    
        container`),n("span",{class:"token punctuation"},"."),s("_o_vnode "),n("span",{class:"token operator"},"="),s(` vnode
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token comment"},"// 挂载与比较虚拟节点的函数——渲染的核心入口"),s(`
    `),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"patch"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("_o_vnode"),n("span",{class:"token punctuation"},","),s(" vnode"),n("span",{class:"token punctuation"},","),s(" container")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token comment"},"// 先卸载"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("_o_vnode "),n("span",{class:"token operator"},"&&"),s(" _o_vnode"),n("span",{class:"token punctuation"},"."),s("type "),n("span",{class:"token operator"},"!=="),s(" vnode"),n("span",{class:"token punctuation"},"."),s("type"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token function"},"unmount"),n("span",{class:"token punctuation"},"("),s("_o_vnode"),n("span",{class:"token punctuation"},")"),s(`
            _o_vnode `),n("span",{class:"token operator"},"="),s(),n("span",{class:"token keyword"},"null"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token comment"},"// 再更新"),s(`
        `),n("span",{class:"token comment"},"// string 表示普通标签元素，object 表示组件，..."),s(`
        `),n("span",{class:"token keyword"},"const"),s(" type "),n("span",{class:"token operator"},"="),s(" vnode"),n("span",{class:"token punctuation"},"."),s(`type
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"typeof"),s(" type "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token string"},"'string'"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"!"),s("_o_vnode"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
                `),n("span",{class:"token comment"},"// 当为普通标签元素时直接挂载逻辑"),s(`
                `),n("span",{class:"token function"},"mountEl"),n("span",{class:"token punctuation"},"("),s("vnode"),n("span",{class:"token punctuation"},","),s(" container"),n("span",{class:"token punctuation"},")"),s(`
            `),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"else"),s(),n("span",{class:"token punctuation"},"{"),s(`
                `),n("span",{class:"token function"},"patchEl"),n("span",{class:"token punctuation"},"("),s("_o_vnode"),n("span",{class:"token punctuation"},","),s(" vnode"),n("span",{class:"token punctuation"},")"),s(`
            `),n("span",{class:"token punctuation"},"}"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"else"),s(),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"typeof"),s(" vnode"),n("span",{class:"token punctuation"},"."),s("type "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token string"},"'object'"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token comment"},"// 更新"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"else"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token comment"},"// 更新"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token comment"},"// 普通标签元素时的挂载逻辑"),s(`
    `),n("span",{class:"token comment"},"// 将虚拟节点转为真实 DOM，并挂载到指定元素上"),s(`
    `),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"mountEl"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("vnode"),n("span",{class:"token punctuation"},","),s(" container")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token comment"},"// 将 vnode 生成的真实 DOM 信息挂载到 vnode 上，让 vnode 和 真实 DOM 产生关联"),s(`
        `),n("span",{class:"token keyword"},"const"),s(" el "),n("span",{class:"token operator"},"="),s(" vnode"),n("span",{class:"token punctuation"},"."),s("_el "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"createElement"),n("span",{class:"token punctuation"},"("),s("vnode"),n("span",{class:"token punctuation"},"."),s("type"),n("span",{class:"token punctuation"},")"),s(`

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
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),v=n("p",null,"至这里，我们已经学习了卸载的几种情况，分别是当更新节点为空时的直接卸载，和更新节点与旧节点不一致情况的几种判断。了解了如何将 vnode 与 真实 DOM 如何关联、unmount 钩子的基本形态、如何根据不同的 vnode 节点类型做不同的判断等。明白了大致的内部逻辑，知晓了挂载是打补丁的特殊情况，掀开了卸载与更新的一角。接下来我们将继续学习挂载与更新内部的事件逻辑。",-1);function m(b,y){const o=a("CodeGroupItem"),p=a("CodeGroup");return l(),i("div",null,[r,t(p,null,{default:e(()=>[t(o,{title:"index.js"},{default:e(()=>[d]),_:1})]),_:1}),v])}const w=c(k,[["render",m],["__file","unmountVnode.html.vue"]]);export{w as default};
