import{_ as n,o as s,c as a,d as p}from"./app-13115eff.js";const t={},e=p(`<p>朋友们，上节我们学习了 setup 内部的实现方法，这节我们学习 emit 的实现原理。</p><p>我们知道，emit 的实现步骤有两个：</p><ol><li>子组件中 emit(&#39;eventName&#39;, [可选的参数...])</li><li>父组件中 @eventName=&#39;xxx&#39;</li></ol><p>那在解析为 vnode 时候，父组件的这段逻辑就会解析为 props 中的属性，而子组件的 emit 则是在子组件的组件选项内容里等着被执行。但是前文提过，所有在子组件中未声明的属性都会被存放至 attr 里，vue 的设计中并没有说每个事件也都要声明一下，所以，如果组件中的属性有的是事件的话，则需要特殊处理——默认其为合法的 props。如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">resolveProps</span><span class="token punctuation">(</span><span class="token parameter">propsOption<span class="token punctuation">,</span> nProps</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> props <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
    <span class="token keyword">const</span> attr <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
    <span class="token keyword">const</span> nPropKeys <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">keys</span><span class="token punctuation">(</span>nProps<span class="token punctuation">)</span>
    nPropKeys<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">key</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token comment">// 新增</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>key <span class="token keyword">in</span> propsOption <span class="token operator">||</span> <span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">/^on/</span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">.</span><span class="token function">text</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            props<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> nProps<span class="token punctuation">[</span>key<span class="token punctuation">]</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            console<span class="token punctuation">.</span><span class="token function">warn</span><span class="token punctuation">(</span><span class="token string">&#39;当前定义的属性在组件内没有定义，存放至 attr&#39;</span><span class="token punctuation">)</span>
            attr<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> nProps<span class="token punctuation">[</span>key<span class="token punctuation">]</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>

    <span class="token keyword">return</span> <span class="token punctuation">[</span>props<span class="token punctuation">,</span> attr<span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>那要如何实现子组件的 emit 呢？上面我们说 emit 的实现步骤中提到过。分析发现，emit 的结构是固定的，第一个为事件名，第二个为可选择的要传递的参数。所以 emit 的结构为函数。当执行到 emit 的时候，就执行 emit 里面的逻辑，即执行传入的函数，又因为其已经在合法的 props 里了，所以能够拿到，实现如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">mountComponent</span><span class="token punctuation">(</span><span class="token parameter">n2<span class="token punctuation">,</span> container<span class="token punctuation">,</span> anchor</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 省略</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>setup<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> setupContext <span class="token operator">=</span> <span class="token punctuation">{</span>
            attr<span class="token punctuation">,</span>
            <span class="token function-variable function">emit</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token parameter">e<span class="token punctuation">,</span> <span class="token operator">...</span>args</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">emit</span><span class="token punctuation">(</span>e<span class="token punctuation">,</span> args<span class="token punctuation">,</span> instance<span class="token punctuation">.</span>props<span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">const</span> setupResult <span class="token operator">=</span> <span class="token function">setup</span><span class="token punctuation">(</span><span class="token function">shallowReadOnly</span><span class="token punctuation">(</span>instance<span class="token punctuation">.</span>props<span class="token punctuation">)</span><span class="token punctuation">,</span> setupContext<span class="token punctuation">)</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> setupResult <span class="token operator">===</span> <span class="token string">&#39;function&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            renderResult <span class="token operator">=</span> setupResult
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            setupState <span class="token operator">=</span> setupResult
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 省略</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">emit</span><span class="token punctuation">(</span><span class="token parameter">eventName<span class="token punctuation">,</span> args<span class="token punctuation">,</span> props</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>eventName <span class="token keyword">in</span> props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        props<span class="token punctuation">[</span>eventName<span class="token punctuation">]</span><span class="token punctuation">(</span>args<span class="token punctuation">)</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        console<span class="token punctuation">.</span><span class="token function">warn</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">当前事件未定义，请查看事件名称 </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>eventName<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> 是否正确</span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样就实现了 emit 的逻辑，这里要注意 emit 是要放入 setup 的上下文环境的，所以将其放入到了 setupContext 中，但是还需优化，因为在触发 emit 的时候，是不需要添加 on 前缀的，所以还需特定处理。如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">emit</span><span class="token punctuation">(</span><span class="token parameter">eventName<span class="token punctuation">,</span> args<span class="token punctuation">,</span> props</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> fnName <span class="token operator">=</span> <span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">on</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>eventName<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">toUpperCase</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>eventName<span class="token punctuation">.</span><span class="token function">slice</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">\`</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>fnName <span class="token keyword">in</span> props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        props<span class="token punctuation">[</span>fnName<span class="token punctuation">]</span><span class="token punctuation">(</span>args<span class="token punctuation">)</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        console<span class="token punctuation">.</span><span class="token function">warn</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">当前事件未定义，请查看事件名称 </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>fnName<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> 是否正确</span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>完整代码如下：</p><details class="custom-container details"><summary>代码详情</summary><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">import</span> <span class="token punctuation">{</span> reactive<span class="token punctuation">,</span> effect<span class="token punctuation">,</span> shallowReactive <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;@zxn2889/achieve-proxy&#39;</span>

<span class="token keyword">const</span> Comment <span class="token operator">=</span> <span class="token function">Symbol</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token keyword">const</span> Text <span class="token operator">=</span> <span class="token function">Symbol</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token keyword">const</span> Fragment <span class="token operator">=</span> <span class="token function">Symbol</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

<span class="token comment">// 创建一个元素</span>
<span class="token keyword">function</span> <span class="token function">createElement</span><span class="token punctuation">(</span><span class="token parameter">tag</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> document<span class="token punctuation">.</span><span class="token function">createElement</span><span class="token punctuation">(</span>tag<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token comment">// 添加元素的文本内容</span>
<span class="token keyword">function</span> <span class="token function">setTextContent</span><span class="token punctuation">(</span><span class="token parameter">el<span class="token punctuation">,</span> text</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    el<span class="token punctuation">.</span>textContent <span class="token operator">=</span> text
<span class="token punctuation">}</span>

<span class="token comment">// 在元素前添加内容，anchor 未指定则是在当前父元素的末尾添加</span>
<span class="token keyword">function</span> <span class="token function">insert</span><span class="token punctuation">(</span><span class="token parameter">el<span class="token punctuation">,</span> parent<span class="token punctuation">,</span> anchor <span class="token operator">=</span> <span class="token keyword">null</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    parent<span class="token punctuation">.</span><span class="token function">insertBefore</span><span class="token punctuation">(</span>el<span class="token punctuation">,</span> anchor<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token comment">// 对不同情况下的 prop 属性做处理</span>
<span class="token keyword">function</span> <span class="token function">patchProps</span><span class="token punctuation">(</span><span class="token parameter">key<span class="token punctuation">,</span> el<span class="token punctuation">,</span> propVal</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

    <span class="token comment">// 匹配所有事件</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token regex"><span class="token regex-delimiter">/</span><span class="token regex-source language-regex">^on</span><span class="token regex-delimiter">/</span></span><span class="token punctuation">.</span><span class="token function">test</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 设置事件存储器</span>
        <span class="token keyword">let</span> invokers <span class="token operator">=</span> el<span class="token punctuation">.</span>_evi <span class="token operator">||</span> <span class="token punctuation">(</span>el<span class="token punctuation">.</span>_evi <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">)</span>

        <span class="token comment">// 匹配具体事件类型的绑定值</span>
        <span class="token keyword">let</span> invoker <span class="token operator">=</span> invokers<span class="token punctuation">[</span>key<span class="token punctuation">]</span>

        <span class="token comment">// 如果传入值存在时</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>propVal<span class="token punctuation">)</span> <span class="token punctuation">{</span>

            <span class="token comment">// 如果绑定的事件类型值不存在时添加事件</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>invoker<span class="token punctuation">)</span> <span class="token punctuation">{</span>

                <span class="token comment">// 通过高阶函数创建虚拟指向</span>
                invoker <span class="token operator">=</span> el<span class="token punctuation">.</span>_evi<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">e</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
                    <span class="token comment">// e.timeStamp 为执行时事件触发的时间</span>
                    <span class="token comment">// 事件触发的时间 &lt; 事件委托的时间时，则不触发</span>
                    <span class="token keyword">if</span> <span class="token punctuation">(</span>e<span class="token punctuation">.</span>timeStamp <span class="token operator">&lt;</span> invoker<span class="token punctuation">.</span>attachTime<span class="token punctuation">)</span> <span class="token keyword">return</span> <span class="token boolean">false</span>

                    <span class="token comment">// 一个类型上绑定多个事件时，循环触发</span>
                    <span class="token keyword">if</span> <span class="token punctuation">(</span>Array<span class="token punctuation">.</span><span class="token function">isArray</span><span class="token punctuation">(</span>invoker<span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                        invoker<span class="token punctuation">.</span>value<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">fn</span> <span class="token operator">=&gt;</span> fn<span class="token punctuation">)</span>
                    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token class-name">Object</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span>invoker<span class="token punctuation">.</span>value<span class="token punctuation">)</span> <span class="token operator">===</span> <span class="token string">&#39;[object Object]&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                        <span class="token comment">// 绑定为非函数时警告</span>
                        console<span class="token punctuation">.</span><span class="token function">warn</span><span class="token punctuation">(</span><span class="token string">&#39;事件值要为函数&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                        <span class="token comment">// 正常执行</span>
                        invoker<span class="token punctuation">.</span><span class="token function">value</span><span class="token punctuation">(</span>e<span class="token punctuation">)</span>
                    <span class="token punctuation">}</span>
                <span class="token punctuation">}</span>

                <span class="token comment">// 将传入的值赋值给高阶函数中具体执行逻辑</span>
                invoker<span class="token punctuation">.</span>value <span class="token operator">=</span> propVal

                <span class="token comment">// 赋值事件触发时间</span>
                <span class="token comment">// performance 为高精度时间</span>
                invoker<span class="token punctuation">.</span>attachTime <span class="token operator">=</span> performance<span class="token punctuation">.</span><span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

                <span class="token comment">// 给元素添加事件</span>
                <span class="token keyword">const</span> type <span class="token operator">=</span> key<span class="token punctuation">.</span><span class="token function">slice</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toLowerCase</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                el<span class="token punctuation">.</span><span class="token function">addEventListener</span><span class="token punctuation">(</span>type<span class="token punctuation">,</span> invoker<span class="token punctuation">)</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                invoker<span class="token punctuation">.</span>value <span class="token operator">=</span> propVal
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>invoker<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                el<span class="token punctuation">.</span><span class="token function">removeEventListener</span><span class="token punctuation">(</span>type<span class="token punctuation">,</span> invoker<span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>key <span class="token operator">===</span> <span class="token string">&#39;class&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        el<span class="token punctuation">.</span>className <span class="token operator">=</span> propVal
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token function">shouldSetAttr</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> el<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 判断是否只设置 key，没有设置 value</span>
        <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token keyword">typeof</span> el<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">===</span> <span class="token string">&#39;boolean&#39;</span> <span class="token operator">&amp;&amp;</span> propVal <span class="token operator">===</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            el<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token boolean">true</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            el<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> propVal
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        el<span class="token punctuation">.</span><span class="token function">setAttribute</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> propVal<span class="token punctuation">)</span> 
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 判断属性是否只能通过 setAttribute 设置</span>
<span class="token keyword">function</span> <span class="token function">shouldSetAttr</span><span class="token punctuation">(</span><span class="token parameter">key<span class="token punctuation">,</span> el</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 对于表单情况的特殊处理</span>
    <span class="token keyword">if</span><span class="token punctuation">(</span>el<span class="token punctuation">.</span>tagName <span class="token operator">===</span> <span class="token string">&#39;INPUT&#39;</span> <span class="token operator">&amp;&amp;</span> key <span class="token operator">===</span> <span class="token string">&#39;form&#39;</span><span class="token punctuation">)</span> <span class="token keyword">return</span> <span class="token boolean">false</span>

    <span class="token comment">// 判断当前属性在 DOM properties 上是否存在</span>
    <span class="token keyword">return</span> key <span class="token keyword">in</span> el
<span class="token punctuation">}</span>

<span class="token comment">// 删除 vnode 对应的真实 DOM</span>
<span class="token keyword">function</span> <span class="token function">unmount</span><span class="token punctuation">(</span><span class="token parameter">vnode</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>vnode<span class="token punctuation">.</span>type <span class="token operator">===</span> Fragment<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        vnode<span class="token punctuation">.</span>children<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">v</span> <span class="token operator">=&gt;</span> <span class="token function">unmount</span><span class="token punctuation">(</span>v<span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">const</span> parent <span class="token operator">=</span> vnode<span class="token punctuation">.</span>_el<span class="token punctuation">.</span>parentNode
    <span class="token keyword">if</span> <span class="token punctuation">(</span>parent<span class="token punctuation">)</span> parent<span class="token punctuation">.</span><span class="token function">removeChild</span><span class="token punctuation">(</span>vnode<span class="token punctuation">.</span>_el<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token comment">// 创建渲染器</span>
<span class="token keyword">function</span> <span class="token function">createRenderer</span><span class="token punctuation">(</span><span class="token parameter">options</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> <span class="token punctuation">{</span> createElement<span class="token punctuation">,</span> setTextContent<span class="token punctuation">,</span> insert <span class="token punctuation">}</span> <span class="token operator">=</span> options

    <span class="token comment">// 渲染虚拟节点的函数</span>
    <span class="token keyword">function</span> <span class="token function">render</span><span class="token punctuation">(</span><span class="token parameter">vnode<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>vnode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 触发比较</span>
            <span class="token function">patch</span><span class="token punctuation">(</span>container<span class="token punctuation">.</span>_o_vnode<span class="token punctuation">,</span> vnode<span class="token punctuation">,</span> container<span class="token punctuation">)</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token comment">// 清空挂载内容</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>container<span class="token punctuation">.</span>_o_vnode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token comment">// 找到 vnode 对应的真实 DOM，并删除</span>
                <span class="token function">unmount</span><span class="token punctuation">(</span>container<span class="token punctuation">.</span>_o_vnode<span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    
        container<span class="token punctuation">.</span>_o_vnode <span class="token operator">=</span> vnode
    <span class="token punctuation">}</span>

    <span class="token comment">// 挂载与比较虚拟节点的函数——渲染的核心入口</span>
    <span class="token keyword">function</span> <span class="token function">patch</span><span class="token punctuation">(</span><span class="token parameter">n1<span class="token punctuation">,</span> n2<span class="token punctuation">,</span> container<span class="token punctuation">,</span> anchor</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 先卸载</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>n1 <span class="token operator">&amp;&amp;</span> n1<span class="token punctuation">.</span>type <span class="token operator">!==</span> n2<span class="token punctuation">.</span>type<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">unmount</span><span class="token punctuation">(</span>n1<span class="token punctuation">)</span>
            n1 <span class="token operator">=</span> <span class="token keyword">null</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// 再更新</span>
        <span class="token comment">// string 表示普通标签元素，object 表示组件，...</span>
        <span class="token keyword">const</span> type <span class="token operator">=</span> n2<span class="token punctuation">.</span>type

        <span class="token comment">// 当为普通标签元素时</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> type <span class="token operator">===</span> <span class="token string">&#39;string&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 不存在旧 vnode 直接挂载逻辑</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>n1<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">mountEl</span><span class="token punctuation">(</span>n2<span class="token punctuation">,</span> container<span class="token punctuation">,</span> anchor<span class="token punctuation">)</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token comment">// 存在旧 vnode，则比较</span>
                <span class="token function">patchEl</span><span class="token punctuation">(</span>n1<span class="token punctuation">,</span> n2<span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token comment">// 当为 Text 节点时</span>
        <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>type <span class="token operator">===</span> Text<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 不存在旧节点的情况下，让元素本身直接指向创建的文本的节点</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>n1<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">const</span> el <span class="token operator">=</span> n2<span class="token punctuation">.</span>_el <span class="token operator">=</span> document<span class="token punctuation">.</span><span class="token function">createTextNode</span><span class="token punctuation">(</span>n2<span class="token punctuation">.</span>children<span class="token punctuation">)</span>
                <span class="token function">insert</span><span class="token punctuation">(</span>el<span class="token punctuation">,</span> container<span class="token punctuation">)</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token keyword">const</span> el <span class="token operator">=</span> n2<span class="token punctuation">.</span>_el <span class="token operator">=</span> n1<span class="token punctuation">.</span>_el
                <span class="token keyword">if</span> <span class="token punctuation">(</span>n2<span class="token punctuation">.</span>children <span class="token operator">!==</span> n1<span class="token punctuation">.</span>children<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    el<span class="token punctuation">.</span>nodeValue <span class="token operator">=</span> n2<span class="token punctuation">.</span>children
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token comment">// 当为 Fragment 节点时</span>
        <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>type <span class="token operator">===</span> Fragment<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 当旧节点不存在时直接遍历挂载新节点内容</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>n1<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                n2<span class="token punctuation">.</span>children<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">v</span> <span class="token operator">=&gt;</span> <span class="token function">patch</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> v<span class="token punctuation">,</span> container<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
            <span class="token comment">// 否则就比较新旧节点的 children</span>
            <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token function">patchChild</span><span class="token punctuation">(</span>n1<span class="token punctuation">,</span> n2<span class="token punctuation">,</span> container<span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token comment">// 当节点为注释节点时</span>
        <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>type <span class="token operator">===</span> Comment<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 挂载与更新</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> type <span class="token operator">===</span> <span class="token string">&#39;object&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>n1<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token comment">// 挂载组件</span>
                <span class="token function">mountComponent</span><span class="token punctuation">(</span>n2<span class="token punctuation">,</span> container<span class="token punctuation">,</span> anchor<span class="token punctuation">)</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token comment">// 更新组件</span>
                <span class="token function">patchComponent</span><span class="token punctuation">(</span>n1<span class="token punctuation">,</span> n2<span class="token punctuation">,</span> container<span class="token punctuation">,</span> anchor<span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token comment">// 挂载与更新</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 挂载组件</span>
    <span class="token keyword">function</span> <span class="token function">mountComponent</span><span class="token punctuation">(</span><span class="token parameter">n2<span class="token punctuation">,</span> container<span class="token punctuation">,</span> anchor</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> component <span class="token operator">=</span> n2<span class="token punctuation">.</span>type
        <span class="token keyword">const</span> <span class="token punctuation">{</span> data<span class="token punctuation">,</span> <span class="token literal-property property">props</span><span class="token operator">:</span> propsOption<span class="token punctuation">,</span> render<span class="token punctuation">,</span> beforeCreate<span class="token punctuation">,</span> created<span class="token punctuation">,</span> 
            beforeMounte<span class="token punctuation">,</span> mounted<span class="token punctuation">,</span> beforeUpdate<span class="token punctuation">,</span> updated<span class="token punctuation">,</span>
            setup <span class="token punctuation">}</span> <span class="token operator">=</span> component

        <span class="token keyword">const</span> <span class="token punctuation">[</span>props<span class="token punctuation">,</span> attr<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">resolveProps</span><span class="token punctuation">(</span>propsOption<span class="token punctuation">,</span> n2<span class="token punctuation">.</span>props<span class="token punctuation">)</span>

        <span class="token comment">// 调用 beforeCreate 生命周期</span>
        beforeCreate <span class="token operator">&amp;&amp;</span> <span class="token function">beforeCreate</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        
        <span class="token keyword">const</span> state <span class="token operator">=</span> <span class="token function">reactive</span><span class="token punctuation">(</span><span class="token function">data</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token keyword">const</span> instance <span class="token operator">=</span> <span class="token punctuation">{</span>
            state<span class="token punctuation">,</span>
            <span class="token literal-property property">props</span><span class="token operator">:</span> <span class="token function">shallowReactive</span><span class="token punctuation">(</span>props<span class="token punctuation">)</span><span class="token punctuation">,</span>
            <span class="token literal-property property">subTree</span><span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
            <span class="token literal-property property">isMounted</span><span class="token operator">:</span> <span class="token boolean">false</span>
        <span class="token punctuation">}</span>
        n2<span class="token punctuation">.</span>_component <span class="token operator">=</span> instance

        <span class="token keyword">let</span> renderResult <span class="token operator">=</span> render
        <span class="token keyword">let</span> setupState
        <span class="token keyword">if</span> <span class="token punctuation">(</span>setup<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">const</span> setupContext <span class="token operator">=</span> <span class="token punctuation">{</span>
                attr<span class="token punctuation">,</span>
                <span class="token function-variable function">emit</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token parameter">e<span class="token punctuation">,</span> <span class="token operator">...</span>args</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">emit</span><span class="token punctuation">(</span>e<span class="token punctuation">,</span> args<span class="token punctuation">,</span> instance<span class="token punctuation">.</span>props<span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">const</span> setupResult <span class="token operator">=</span> <span class="token function">setup</span><span class="token punctuation">(</span><span class="token function">shallowReadOnly</span><span class="token punctuation">(</span>instance<span class="token punctuation">.</span>props<span class="token punctuation">)</span><span class="token punctuation">,</span> setupContext<span class="token punctuation">)</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> setupResult <span class="token operator">===</span> <span class="token string">&#39;function&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                renderResult <span class="token operator">=</span> setupResult
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                setupState <span class="token operator">=</span> setupResult
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>

        <span class="token keyword">const</span> renderContext <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Proxy</span><span class="token punctuation">(</span>instance<span class="token punctuation">,</span> <span class="token punctuation">{</span>
            <span class="token function">get</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> k<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">const</span> <span class="token punctuation">{</span> state<span class="token punctuation">,</span> props<span class="token punctuation">,</span> setup <span class="token punctuation">}</span> <span class="token operator">=</span> t
                <span class="token keyword">if</span> <span class="token punctuation">(</span>state <span class="token operator">&amp;&amp;</span> k <span class="token keyword">in</span> state<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token keyword">return</span> state<span class="token punctuation">[</span>k<span class="token punctuation">]</span>
                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>props <span class="token operator">&amp;&amp;</span> k <span class="token keyword">in</span> props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token keyword">return</span> props<span class="token punctuation">[</span>k<span class="token punctuation">]</span>
                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>setupState <span class="token operator">&amp;&amp;</span> k <span class="token keyword">in</span> setupState<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token keyword">return</span> setupState<span class="token punctuation">[</span>k<span class="token punctuation">]</span>
                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                    console<span class="token punctuation">.</span><span class="token function">warn</span><span class="token punctuation">(</span><span class="token string">&#39;当前组件不存在该属性&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token keyword">return</span> <span class="token keyword">null</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span><span class="token punctuation">,</span>
            <span class="token function">set</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> k<span class="token punctuation">,</span> v<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">const</span> <span class="token punctuation">{</span> state<span class="token punctuation">,</span> props <span class="token punctuation">}</span> <span class="token operator">=</span> t
                <span class="token keyword">if</span> <span class="token punctuation">(</span>state <span class="token operator">&amp;&amp;</span> k <span class="token keyword">in</span> state<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    state<span class="token punctuation">[</span>k<span class="token punctuation">]</span> <span class="token operator">=</span> v
                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>props <span class="token operator">&amp;&amp;</span> k <span class="token keyword">in</span> props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    props<span class="token punctuation">[</span>k<span class="token punctuation">]</span> <span class="token operator">=</span> v
                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>setupState <span class="token operator">&amp;&amp;</span> k <span class="token keyword">in</span> setupState<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    setupState<span class="token punctuation">[</span>k<span class="token punctuation">]</span> <span class="token operator">=</span> v
                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                    console<span class="token punctuation">.</span><span class="token function">warn</span><span class="token punctuation">(</span><span class="token string">&#39;当前组件不存在该属性&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token keyword">return</span> <span class="token boolean">false</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span><span class="token punctuation">)</span>

        <span class="token comment">// 调用 created 生命周期</span>
        created <span class="token operator">&amp;&amp;</span> <span class="token function">created</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span>renderContext<span class="token punctuation">)</span>
        
        <span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
            <span class="token keyword">const</span> subTree <span class="token operator">=</span> <span class="token function">renderResult</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span>renderContext<span class="token punctuation">)</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>instance<span class="token punctuation">.</span>isMounted<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token comment">// 调用 beforeMount 生命周期</span>
                beforeMounte <span class="token operator">&amp;&amp;</span> <span class="token function">beforeMounte</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span>renderContext<span class="token punctuation">)</span>
            
                <span class="token function">patch</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> subTree<span class="token punctuation">,</span> container<span class="token punctuation">,</span> anchor<span class="token punctuation">)</span>
                instance<span class="token punctuation">.</span>isMounted <span class="token operator">=</span> <span class="token boolean">true</span>

                <span class="token comment">// 调用 mounted 生命周期</span>
                mounted <span class="token operator">&amp;&amp;</span> <span class="token function">mounted</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span>renderContext<span class="token punctuation">)</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token comment">// 调用 beforeUpdate 生命周期</span>
                beforeUpdate <span class="token operator">&amp;&amp;</span> <span class="token function">beforeUpdate</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span>renderContext<span class="token punctuation">)</span>
                <span class="token function">patch</span><span class="token punctuation">(</span>instance<span class="token punctuation">.</span>subTree<span class="token punctuation">,</span> subTree<span class="token punctuation">,</span> container<span class="token punctuation">,</span> anchor<span class="token punctuation">)</span>
                
                <span class="token comment">// 调用 update 生命周期</span>
                updated <span class="token operator">&amp;&amp;</span> <span class="token function">updated</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span>renderContext<span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
            instance<span class="token punctuation">.</span>subTree <span class="token operator">=</span> subTree
        <span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 实现父子组件通讯</span>
    <span class="token keyword">function</span> <span class="token function">emit</span><span class="token punctuation">(</span><span class="token parameter">eventName<span class="token punctuation">,</span> args<span class="token punctuation">,</span> props</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> fnName <span class="token operator">=</span> <span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">on</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>eventName<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">toUpperCase</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>eventName<span class="token punctuation">.</span><span class="token function">slice</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">\`</span></span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>fnName <span class="token keyword">in</span> props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            props<span class="token punctuation">[</span>fnName<span class="token punctuation">]</span><span class="token punctuation">(</span>args<span class="token punctuation">)</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            console<span class="token punctuation">.</span><span class="token function">warn</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">当前事件未定义，请查看事件名称 </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>fnName<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> 是否正确</span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 更新组件</span>
    <span class="token keyword">function</span> <span class="token function">patchComponent</span><span class="token punctuation">(</span><span class="token parameter">n1<span class="token punctuation">,</span> n2<span class="token punctuation">,</span> container<span class="token punctuation">,</span> anchor</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> instance <span class="token operator">=</span> n2<span class="token punctuation">.</span>_component <span class="token operator">=</span> n1<span class="token punctuation">.</span>_component
        <span class="token keyword">const</span> <span class="token punctuation">{</span> props <span class="token punctuation">}</span> <span class="token operator">=</span> instance
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">hasUpdateProps</span><span class="token punctuation">(</span>n1<span class="token punctuation">.</span>props<span class="token punctuation">,</span> n2<span class="token punctuation">.</span>props<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 这里要先比较得出最新的合法的 props</span>
            <span class="token keyword">const</span> <span class="token punctuation">[</span>nextProps<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">resolveProps</span><span class="token punctuation">(</span>n2<span class="token punctuation">.</span>type<span class="token punctuation">.</span>props<span class="token punctuation">,</span> n2<span class="token punctuation">.</span>type<span class="token punctuation">)</span>

            <span class="token comment">// 通过新旧合法的 props 比较，更新旧节点组件对应的 props</span>
            Object<span class="token punctuation">.</span><span class="token function">keys</span><span class="token punctuation">(</span>props<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">key</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>key <span class="token keyword">in</span> nextProps<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    props<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> nextProps<span class="token punctuation">[</span>key<span class="token punctuation">]</span>
                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                    <span class="token keyword">delete</span> props<span class="token punctuation">[</span>key<span class="token punctuation">]</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 比较新旧父组件的 props 是否有更新</span>
    <span class="token keyword">function</span> <span class="token function">hasUpdateProps</span><span class="token punctuation">(</span><span class="token parameter">oProps<span class="token punctuation">,</span> nProps</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> oPropsLen <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">keys</span><span class="token punctuation">(</span>oProps<span class="token punctuation">)</span>
        <span class="token keyword">const</span> nPropsLen <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">keys</span><span class="token punctuation">(</span>nProps<span class="token punctuation">)</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>oPropsLen <span class="token operator">!==</span> nPropsLen<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token boolean">true</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> oPropsLen<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">const</span> oPropVal <span class="token operator">=</span> oProps<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">;</span>
            <span class="token keyword">const</span> nPropVal <span class="token operator">=</span> nProps<span class="token punctuation">[</span>i<span class="token punctuation">]</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>oPropVal <span class="token operator">!==</span> nPropVal<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">return</span> <span class="token boolean">true</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token boolean">false</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 筛选父子组件之间定义的合法属性</span>
    <span class="token keyword">function</span> <span class="token function">resolveProps</span><span class="token punctuation">(</span><span class="token parameter">propsOption<span class="token punctuation">,</span> nProps</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> props <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
        <span class="token keyword">const</span> attr <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
        <span class="token keyword">const</span> nPropKeys <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">keys</span><span class="token punctuation">(</span>nProps<span class="token punctuation">)</span>
        nPropKeys<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">key</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>key <span class="token keyword">in</span> propsOption <span class="token operator">||</span> <span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">/^on/</span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">.</span><span class="token function">text</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                props<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> nProps<span class="token punctuation">[</span>key<span class="token punctuation">]</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                console<span class="token punctuation">.</span><span class="token function">warn</span><span class="token punctuation">(</span><span class="token string">&#39;当前定义的属性在组件内没有定义，存放至 attr&#39;</span><span class="token punctuation">)</span>
                attr<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> nProps<span class="token punctuation">[</span>key<span class="token punctuation">]</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span><span class="token punctuation">)</span>

        <span class="token keyword">return</span> <span class="token punctuation">[</span>props<span class="token punctuation">,</span> attr<span class="token punctuation">]</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 普通标签元素时的挂载逻辑</span>
    <span class="token comment">// 将虚拟节点转为真实 DOM，并挂载到指定元素上</span>
    <span class="token keyword">function</span> <span class="token function">mountEl</span><span class="token punctuation">(</span><span class="token parameter">n2<span class="token punctuation">,</span> container<span class="token punctuation">,</span> anchor</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 将 vnode 生成的真实 DOM 信息挂载到 vnode 上，让 vnode 和 真实 DOM 产生关联</span>
        <span class="token keyword">const</span> el <span class="token operator">=</span> n2<span class="token punctuation">.</span>_el <span class="token operator">=</span> <span class="token function">createElement</span><span class="token punctuation">(</span>n2<span class="token punctuation">.</span>type<span class="token punctuation">)</span>

        <span class="token keyword">const</span> vChild <span class="token operator">=</span> n2<span class="token punctuation">.</span>children

        <span class="token comment">// 如果有属性存在则在元素上添加属性</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>n2<span class="token punctuation">.</span>props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">const</span> key <span class="token keyword">in</span> n2<span class="token punctuation">.</span>props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">patchProps</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> el<span class="token punctuation">,</span> n2<span class="token punctuation">.</span>props<span class="token punctuation">[</span>key<span class="token punctuation">]</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// 文本节点则直接填充</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> vChild <span class="token operator">===</span> <span class="token string">&#39;string&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">setTextContent</span><span class="token punctuation">(</span>el<span class="token punctuation">,</span> vChild<span class="token punctuation">)</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>Array<span class="token punctuation">.</span><span class="token function">isArray</span><span class="token punctuation">(</span>vChild<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 存在子节点则循环进行比较更新</span>
            <span class="token comment">// 当前无旧 vnode，所以传入的旧 vnode 为 null</span>
            <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> vChild<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">patch</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> vChild<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">,</span> el<span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token function">insert</span><span class="token punctuation">(</span>el<span class="token punctuation">,</span> container<span class="token punctuation">,</span> anchor<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 比较两个 type 类型相同下的节点差异，并更新</span>
    <span class="token keyword">function</span> <span class="token function">patchEl</span><span class="token punctuation">(</span><span class="token parameter">n1<span class="token punctuation">,</span> n2</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> el <span class="token operator">=</span> n2<span class="token punctuation">.</span>_el <span class="token operator">=</span> n1<span class="token punctuation">.</span>_el
        <span class="token keyword">const</span> oProps <span class="token operator">=</span> n1<span class="token punctuation">.</span>props
        <span class="token keyword">const</span> nProps <span class="token operator">=</span> n2<span class="token punctuation">.</span>props

        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">const</span> key <span class="token keyword">in</span> nProps<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>Object<span class="token punctuation">.</span><span class="token function">hasOwnProperty</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span>nProps<span class="token punctuation">,</span> key<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token comment">// 此判断模拟情形</span>
                <span class="token comment">// 1. 新旧节点都存在 key，但是值不同，更新新值</span>
                <span class="token comment">// 2. 新节点存在 key，但旧节点不存在 key，更新新值</span>
                <span class="token comment">// 3. 新节点不存在 key，但旧节点存在 key，更新新值</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>nProps<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">!==</span> oProps<span class="token punctuation">[</span>key<span class="token punctuation">]</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token function">patchProps</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> el<span class="token punctuation">,</span> nProps<span class="token punctuation">[</span>key<span class="token punctuation">]</span><span class="token punctuation">)</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>

        <span class="token function">patchChild</span><span class="token punctuation">(</span>n1<span class="token punctuation">,</span> n2<span class="token punctuation">,</span> el<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 比较新旧节点的 children 部分，并更新</span>
    <span class="token keyword">function</span> <span class="token function">patchChild</span><span class="token punctuation">(</span><span class="token parameter">n1<span class="token punctuation">,</span> n2<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> n2<span class="token punctuation">.</span>children <span class="token operator">===</span> <span class="token string">&#39;string&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>Array<span class="token punctuation">.</span><span class="token function">isArray</span><span class="token punctuation">(</span>n1<span class="token punctuation">.</span>children<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                n1<span class="token punctuation">.</span>children<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">v</span> <span class="token operator">=&gt;</span> <span class="token function">unmount</span><span class="token punctuation">(</span>v<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
            <span class="token function">setTextContent</span><span class="token punctuation">(</span>container<span class="token punctuation">,</span> n2<span class="token punctuation">.</span>children<span class="token punctuation">)</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>Array<span class="token punctuation">.</span><span class="token function">isArray</span><span class="token punctuation">(</span>n2<span class="token punctuation">.</span>children<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>Array<span class="token punctuation">.</span><span class="token function">isArray</span><span class="token punctuation">(</span>n1<span class="token punctuation">.</span>children<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">quickDiff</span><span class="token punctuation">(</span>n1<span class="token punctuation">,</span> n2<span class="token punctuation">,</span> container<span class="token punctuation">)</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token function">setTextContent</span><span class="token punctuation">(</span>el<span class="token punctuation">,</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">)</span>
                n2<span class="token punctuation">.</span>children<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">v</span> <span class="token operator">=&gt;</span> <span class="token function">patch</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> v<span class="token punctuation">,</span> container<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>Array<span class="token punctuation">.</span><span class="token function">isArray</span><span class="token punctuation">(</span>n1<span class="token punctuation">.</span>children<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                n1<span class="token punctuation">.</span>children<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">v</span> <span class="token operator">=&gt;</span> <span class="token function">unmount</span><span class="token punctuation">(</span>v<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token function">setTextContent</span><span class="token punctuation">(</span>container<span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 简单比较 diff</span>
    <span class="token keyword">function</span> <span class="token function">diff</span><span class="token punctuation">(</span><span class="token parameter">n1<span class="token punctuation">,</span> n2<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> oChild <span class="token operator">=</span> n1<span class="token punctuation">.</span>children
        <span class="token keyword">const</span> nChild <span class="token operator">=</span> n2<span class="token punctuation">.</span>children

        <span class="token comment">// 定义旧节点要比较的基准值，并设置初始值为 0——和新节点循环的初始角标一致</span>
        <span class="token keyword">let</span> lastestIndex <span class="token operator">=</span> <span class="token number">0</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> nChild<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">const</span> nv <span class="token operator">=</span> nChild<span class="token punctuation">[</span>i<span class="token punctuation">]</span>

            <span class="token comment">// 挂载新增的节点</span>
            <span class="token keyword">const</span> hasEl <span class="token operator">=</span> oChild<span class="token punctuation">.</span><span class="token function">find</span><span class="token punctuation">(</span><span class="token parameter">v</span> <span class="token operator">=&gt;</span> v<span class="token punctuation">.</span>key <span class="token operator">===</span> nv<span class="token punctuation">.</span>key<span class="token punctuation">)</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>hasEl<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">mountEl</span><span class="token punctuation">(</span>nv<span class="token punctuation">,</span> container<span class="token punctuation">)</span>
            <span class="token punctuation">}</span>

            <span class="token keyword">let</span> find <span class="token operator">=</span> <span class="token boolean">false</span>
            <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> j <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> j <span class="token operator">&lt;</span> oChild<span class="token punctuation">.</span>length<span class="token punctuation">;</span> j<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">const</span> ov <span class="token operator">=</span> oChild<span class="token punctuation">[</span>j<span class="token punctuation">]</span>

                <span class="token comment">// 满足可复用的条件</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>nv<span class="token punctuation">.</span>key <span class="token operator">===</span> ov<span class="token punctuation">.</span>key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    find <span class="token operator">=</span> <span class="token boolean">true</span>

                    <span class="token function">patch</span><span class="token punctuation">(</span>ov<span class="token punctuation">,</span> nv<span class="token punctuation">,</span> container<span class="token punctuation">)</span>

                    <span class="token keyword">if</span> <span class="token punctuation">(</span>j <span class="token operator">&lt;</span> lastestIndex<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                        <span class="token comment">// 找到新节点对应的上一个节点</span>
                        <span class="token comment">// 注意，新旧节点的 DOM 指向都是一样的，都是指向的旧节点对应的真实节点</span>
                        <span class="token keyword">const</span> prevNode <span class="token operator">=</span> nChild<span class="token punctuation">[</span>i<span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">]</span>

                        <span class="token comment">// 如果不存在，说明是第一个，不需要移动</span>
                        <span class="token keyword">if</span> <span class="token punctuation">(</span>prevNode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                            <span class="token comment">// 找到上一个节点的对应的下一个兄弟节点</span>
                            <span class="token keyword">const</span> anchor <span class="token operator">=</span> prevNode<span class="token punctuation">.</span>_el<span class="token punctuation">.</span>nextSibling

                            <span class="token comment">// 将当前兄弟节点作为锚点插入到父节点下的指定位置</span>
                            <span class="token function">insert</span><span class="token punctuation">(</span>nv<span class="token punctuation">.</span>_el<span class="token punctuation">,</span> container<span class="token punctuation">,</span> anchor<span class="token punctuation">)</span>
                        <span class="token punctuation">}</span>

                    <span class="token punctuation">}</span>
                    <span class="token comment">// 在满足可复用的条件下，如果当前旧节点的角标不小于要比较的基准值，则更新基准值为当前旧节点的角标值</span>
                    <span class="token keyword">else</span> <span class="token punctuation">{</span>
                        lastestIndex <span class="token operator">=</span> j
                    <span class="token punctuation">}</span>
                    <span class="token keyword">break</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>

            <span class="token comment">// 如果到这里仍然为 false，说明没有可复用节点，即为新增节点</span>
            <span class="token comment">// 注意：上面判断是否为可复用节点时，并没有判断 type，所以这里不严谨</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>find<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">const</span> prevNode <span class="token operator">=</span> nChild<span class="token punctuation">[</span>i<span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">]</span>
                <span class="token keyword">let</span> anchor
                <span class="token keyword">if</span> <span class="token punctuation">(</span>prevNode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    anchor <span class="token operator">=</span> prevNode<span class="token punctuation">.</span>_el<span class="token punctuation">.</span>nextSibling
                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                    anchor <span class="token operator">=</span> container<span class="token punctuation">.</span>firstChild
                <span class="token punctuation">}</span>
                <span class="token function">patch</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> nv<span class="token punctuation">,</span> container<span class="token punctuation">,</span> anchor<span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// 卸载不存在的旧节点</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> oChild<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">const</span> ov <span class="token operator">=</span> oChild<span class="token punctuation">[</span>i<span class="token punctuation">]</span>
            <span class="token keyword">const</span> hasEl <span class="token operator">=</span> nChild<span class="token punctuation">.</span><span class="token function">find</span><span class="token punctuation">(</span><span class="token parameter">v</span> <span class="token operator">=&gt;</span> v<span class="token punctuation">.</span>key <span class="token operator">===</span> ov<span class="token punctuation">.</span>key<span class="token punctuation">)</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>hasEl<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">unmount</span><span class="token punctuation">(</span>ov<span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 双端比较 diff</span>
    <span class="token keyword">function</span> <span class="token function">doubleEndDiff</span><span class="token punctuation">(</span><span class="token parameter">n1<span class="token punctuation">,</span> n2<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> oChild <span class="token operator">=</span> n1<span class="token punctuation">.</span>children
        <span class="token keyword">const</span> nChild <span class="token operator">=</span> n2<span class="token punctuation">.</span>children

        <span class="token keyword">let</span> oStartIndex <span class="token operator">=</span> <span class="token number">0</span>
        <span class="token keyword">let</span> oEndIndex <span class="token operator">=</span> oChild<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span>
        <span class="token keyword">let</span> nStartIndex <span class="token operator">=</span> <span class="token number">0</span>
        <span class="token keyword">let</span> nEndIndex <span class="token operator">=</span> nChild<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span>

        <span class="token keyword">let</span> oStartV <span class="token operator">=</span> oChild<span class="token punctuation">[</span>oStartIndex<span class="token punctuation">]</span>
        <span class="token keyword">let</span> oEndV <span class="token operator">=</span> oChild<span class="token punctuation">[</span>oEndIndex<span class="token punctuation">]</span>
        <span class="token keyword">let</span> nStartV <span class="token operator">=</span> nChild<span class="token punctuation">[</span>nStartIndex<span class="token punctuation">]</span>
        <span class="token keyword">let</span> nEndV <span class="token operator">=</span> nChild<span class="token punctuation">[</span>nEndIndex<span class="token punctuation">]</span>

        <span class="token keyword">while</span> <span class="token punctuation">(</span>oStartIndex <span class="token operator">&lt;=</span> oEndIndex <span class="token operator">&amp;&amp;</span> nStartIndex <span class="token operator">&lt;=</span> nEndIndex<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>oStartV<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                oStartV <span class="token operator">=</span> oChild<span class="token punctuation">[</span><span class="token operator">++</span>oStartIndex<span class="token punctuation">]</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>oEndV<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                oEndV <span class="token operator">=</span> oChild<span class="token punctuation">[</span><span class="token operator">--</span>oEndIndex<span class="token punctuation">]</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>oStartV<span class="token punctuation">.</span>key <span class="token operator">===</span> nStartV<span class="token punctuation">.</span>key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">patch</span><span class="token punctuation">(</span>oStartV<span class="token punctuation">,</span> nStartV<span class="token punctuation">,</span> container<span class="token punctuation">)</span>
                oStartV <span class="token operator">=</span> oChild<span class="token punctuation">[</span><span class="token operator">++</span>oStartIndex<span class="token punctuation">]</span>
                nStartV <span class="token operator">=</span> nChild<span class="token punctuation">[</span><span class="token operator">++</span>nStartIndex<span class="token punctuation">]</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>oEndV<span class="token punctuation">.</span>key <span class="token operator">===</span> nEndV<span class="token punctuation">.</span>key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">patch</span><span class="token punctuation">(</span>oEndV<span class="token punctuation">,</span> nEndV<span class="token punctuation">,</span> container<span class="token punctuation">)</span>
                oStartV <span class="token operator">=</span> oChild<span class="token punctuation">[</span><span class="token operator">--</span>oStartIndex<span class="token punctuation">]</span>
                nStartV <span class="token operator">=</span> nChild<span class="token punctuation">[</span><span class="token operator">--</span>nStartIndex<span class="token punctuation">]</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>oStartV<span class="token punctuation">.</span>key <span class="token operator">===</span> nEndV<span class="token punctuation">.</span>key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">patch</span><span class="token punctuation">(</span>oStartV<span class="token punctuation">,</span> nEndV<span class="token punctuation">,</span> container<span class="token punctuation">)</span>
                <span class="token function">insert</span><span class="token punctuation">(</span>oStartV<span class="token punctuation">.</span>_el<span class="token punctuation">,</span> container<span class="token punctuation">,</span> oEndV<span class="token punctuation">.</span>_el<span class="token punctuation">.</span>nextSibling<span class="token punctuation">)</span>
                oStartV <span class="token operator">=</span> oChild<span class="token punctuation">[</span><span class="token operator">++</span>oStartIndex<span class="token punctuation">]</span>
                nEndV <span class="token operator">=</span> nChild<span class="token punctuation">[</span><span class="token operator">--</span>nEndIndex<span class="token punctuation">]</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>oEndV<span class="token punctuation">.</span>key <span class="token operator">===</span> nStartV<span class="token punctuation">.</span>key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token comment">// 比较更新</span>
                <span class="token function">patch</span><span class="token punctuation">(</span>oEndV<span class="token punctuation">,</span> nStartV<span class="token punctuation">,</span> container<span class="token punctuation">)</span>
                <span class="token comment">// 将尾部节点插入到头部元素前</span>
                <span class="token function">insert</span><span class="token punctuation">(</span>oEndV<span class="token punctuation">.</span>_el<span class="token punctuation">,</span> container<span class="token punctuation">,</span> oStartV<span class="token punctuation">.</span>_el<span class="token punctuation">)</span>
                <span class="token comment">// 将尾部角标--，同时将尾部元素向上挪动至最新（依据角标向上挪动一位）</span>
                oEndV <span class="token operator">=</span> oChild<span class="token punctuation">[</span><span class="token operator">--</span>oEndIndex<span class="token punctuation">]</span>
                <span class="token comment">// 将头部角标++，同时将头部元素乡下挪动至最新（依据角标向下挪动一位）</span>
                nStartV <span class="token operator">=</span> nChild<span class="token punctuation">[</span><span class="token operator">++</span>nStartIndex<span class="token punctuation">]</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token keyword">const</span> fIndex <span class="token operator">=</span> oChild<span class="token punctuation">.</span><span class="token function">findIndex</span><span class="token punctuation">(</span><span class="token parameter">v</span> <span class="token operator">=&gt;</span> v<span class="token punctuation">.</span>key <span class="token operator">===</span> nStartV<span class="token punctuation">.</span>key<span class="token punctuation">)</span>
                <span class="token comment">// 因为双边都已经比较过，这个时候如果存在，则 &gt; 0</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>fIndex <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token keyword">const</span> moveV <span class="token operator">=</span> oChild<span class="token punctuation">[</span>fIndex<span class="token punctuation">]</span>
                    <span class="token function">patch</span><span class="token punctuation">(</span>moveV<span class="token punctuation">,</span> nStartV<span class="token punctuation">,</span> container<span class="token punctuation">)</span>
                    <span class="token comment">// 因为双边比较不存在，这个时候存在，说明不在元素头部，所以需要将该元素移动到头部位置</span>
                    <span class="token function">insert</span><span class="token punctuation">(</span>moveV<span class="token punctuation">.</span>_el<span class="token punctuation">,</span> container<span class="token punctuation">,</span> oStartV<span class="token punctuation">.</span>_el<span class="token punctuation">)</span>
                    <span class="token comment">// 因为这是双边比较不存在的特殊情况，虽然将对应的真实 DOM 移走了，</span>
                    <span class="token comment">// 但是该虚拟节点还是在遍历的规则内，所以设置空 undifined ，方便后续判断</span>
                    oChild<span class="token punctuation">[</span>fIndex<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token keyword">undefined</span>
                    <span class="token comment">// 相当于旧节点内部已经特殊处理过，这个时候新节点的头部节点顺序改变</span>
                    nStartV <span class="token operator">=</span> nChild<span class="token punctuation">[</span><span class="token operator">++</span>nStartIndex<span class="token punctuation">]</span>
                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                    <span class="token function">patch</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> nStartV<span class="token punctuation">,</span> container<span class="token punctuation">,</span> oStartV<span class="token punctuation">.</span>_el<span class="token punctuation">)</span>
                    nStartV <span class="token operator">=</span> nChild<span class="token punctuation">[</span><span class="token operator">++</span>nStartIndex<span class="token punctuation">]</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// 卸载旧节点</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> oStartIndex<span class="token punctuation">;</span> i <span class="token operator">&lt;</span> oChild<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">unmount</span><span class="token punctuation">(</span>oChild<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 快速 diff</span>
    <span class="token keyword">function</span> <span class="token function">quickDiff</span><span class="token punctuation">(</span><span class="token parameter">n1<span class="token punctuation">,</span> n2<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> oChild <span class="token operator">=</span> n1<span class="token punctuation">.</span>children
        <span class="token keyword">const</span> nChild <span class="token operator">=</span> n2<span class="token punctuation">.</span>children
        <span class="token keyword">let</span> startIndex <span class="token operator">=</span> <span class="token number">0</span>
        <span class="token keyword">let</span> ov <span class="token operator">=</span> <span class="token keyword">null</span>
        <span class="token keyword">let</span> nv <span class="token operator">=</span> <span class="token keyword">null</span>
        
        <span class="token comment">// 从起始角标 0 开始，比较前置节点不可复用的范围</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> nChild<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            ov <span class="token operator">=</span> oChild<span class="token punctuation">[</span>i<span class="token punctuation">]</span>
            nv <span class="token operator">=</span> nChild<span class="token punctuation">[</span>i<span class="token punctuation">]</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>nv<span class="token punctuation">.</span>key <span class="token operator">===</span> ov<span class="token punctuation">.</span>key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">patch</span><span class="token punctuation">(</span>ov<span class="token punctuation">,</span> nv<span class="token punctuation">,</span> container<span class="token punctuation">)</span>
                startIndex<span class="token operator">++</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token keyword">break</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>

        <span class="token keyword">const</span> oLen <span class="token operator">=</span> oChild<span class="token punctuation">.</span>length
        <span class="token keyword">const</span> nLen <span class="token operator">=</span> nChild<span class="token punctuation">.</span>length
        <span class="token keyword">const</span> mLen <span class="token operator">=</span> Math<span class="token punctuation">.</span><span class="token function">max</span><span class="token punctuation">(</span>oLen<span class="token punctuation">,</span> nLen<span class="token punctuation">)</span>
        <span class="token keyword">let</span> oLastIndex <span class="token operator">=</span> oLen <span class="token operator">-</span> <span class="token number">1</span>
        <span class="token keyword">let</span> nLastIndex <span class="token operator">=</span> nLen <span class="token operator">-</span> <span class="token number">1</span>

        <span class="token comment">// 从尾部角标开始，比较后置节点不可复用范围</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> mLen<span class="token punctuation">;</span> i <span class="token operator">&gt;=</span> <span class="token number">0</span><span class="token punctuation">;</span> i<span class="token operator">--</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            ov <span class="token operator">=</span> oChild<span class="token punctuation">[</span>oLastIndex<span class="token punctuation">]</span>
            nv <span class="token operator">=</span> nChild<span class="token punctuation">[</span>nLastIndex<span class="token punctuation">]</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>nv<span class="token punctuation">.</span>key <span class="token operator">===</span> ov<span class="token punctuation">.</span>key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">patch</span><span class="token punctuation">(</span>ov<span class="token punctuation">,</span> nv<span class="token punctuation">,</span> container<span class="token punctuation">)</span>
                oLastIndex<span class="token operator">--</span>
                nLastIndex<span class="token operator">--</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token keyword">break</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// 如果循环结束，且新节点还存在未执行情况，则未执行节点为新节点，需循环挂载</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>oLastIndex <span class="token operator">&lt;</span> startIndex <span class="token operator">&amp;&amp;</span> nLastIndex <span class="token operator">&gt;=</span> startIndex<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> startIndex<span class="token punctuation">;</span> i <span class="token operator">&lt;=</span> nLastIndex<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">patch</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> nChild<span class="token punctuation">[</span>startIndex<span class="token punctuation">]</span><span class="token punctuation">,</span> container<span class="token punctuation">,</span> <span class="token function">setAnchor</span><span class="token punctuation">(</span>startIndex<span class="token punctuation">,</span> nChild<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// 如果循环结束，且旧节点还存在有节点未执行情况，则未执行节点循环卸载</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>nLastIndex <span class="token operator">&lt;</span> startIndex <span class="token operator">&amp;&amp;</span> oLastIndex <span class="token operator">&gt;=</span> startIndex<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> startIndex<span class="token punctuation">;</span> i <span class="token operator">&lt;=</span> oLastIndex<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">unmount</span><span class="token punctuation">(</span>oChild<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// 创建一个长度和新节点树中未执行节点数量一致的数组，并以 -1 填充</span>
        <span class="token comment">// 目的：移动、挂载、更新旧节点</span>
        <span class="token comment">// 存储值：当前角标下新节点对应可复用的旧节点的 key 值</span>
        <span class="token comment">// 注意：该序列和新节点中未执行节点角标顺序一致</span>
        <span class="token keyword">const</span> inCrementalArr <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Array</span><span class="token punctuation">(</span>nLastIndex <span class="token operator">-</span> startIndex <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">fill</span><span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>

        <span class="token comment">// 创建新节点中未执行节点 key 与 角标 关联</span>
        <span class="token comment">// 注意：是将新节点树中未执行的节点的 key 值与当前所在新节点树中的角标进行 key - value 格式绑定</span>
        <span class="token keyword">const</span> nResetMapping <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> startIndex<span class="token punctuation">;</span> i <span class="token operator">&lt;=</span> nLastIndex<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            nResetMapping<span class="token punctuation">[</span>nChild<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> i
        <span class="token punctuation">}</span>

        <span class="token comment">// 遍历旧节点中未执行节点，找到可复用节点，并执行相应操作</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> startIndex<span class="token punctuation">;</span> i <span class="token operator">&lt;=</span> oLastIndex<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

            ov <span class="token operator">=</span> oChild<span class="token punctuation">[</span>i<span class="token punctuation">]</span>

            <span class="token comment">// 通过新节点未执行的节点树映射的 map 结构，找到旧节点中的 key 值是否在新节点中存在，</span>
            <span class="token comment">// 如果存在，则新节点对应角标 &gt; -1，如果不存在则卸载</span>
            <span class="token keyword">const</span> k <span class="token operator">=</span> nResetMapping<span class="token punctuation">[</span>ov<span class="token punctuation">.</span>key<span class="token punctuation">]</span>

            nv <span class="token operator">=</span> nChild<span class="token punctuation">[</span>k<span class="token punctuation">]</span>

            <span class="token keyword">if</span> <span class="token punctuation">(</span>k <span class="token operator">&gt;</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">patch</span><span class="token punctuation">(</span>ov<span class="token punctuation">,</span> nv<span class="token punctuation">,</span> container<span class="token punctuation">)</span>

                <span class="token comment">// 关联填充数组中角标存储的旧节点中可复用的节点对应的角标</span>
                inCrementalArr<span class="token punctuation">[</span>k <span class="token operator">-</span> startIndex<span class="token punctuation">]</span> <span class="token operator">=</span> i
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token function">unmount</span><span class="token punctuation">(</span>ov<span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// 取当前序列数组中的最长子序列</span>
        <span class="token keyword">const</span> sonArr <span class="token operator">=</span> <span class="token function">lis</span><span class="token punctuation">(</span>inCrementalArr<span class="token punctuation">)</span>

        <span class="token comment">// 判断是否有新增节点</span>
        <span class="token keyword">const</span> needAdd <span class="token operator">=</span> inCrementalArr<span class="token punctuation">.</span><span class="token function">includes</span><span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>

        <span class="token comment">// 如果有任一值为 true，则执行移动或挂载操作</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>sonArr<span class="token punctuation">.</span>length <span class="token operator">&lt;</span> inCrementalArr<span class="token punctuation">.</span>length <span class="token operator">||</span> needAdd<span class="token punctuation">)</span> <span class="token punctuation">{</span>

            <span class="token comment">// 取最长子序列尾部角标</span>
            <span class="token keyword">let</span> s <span class="token operator">=</span> sonArr<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span>

            <span class="token comment">// 取填充数组的尾部角标</span>
            <span class="token comment">// 注意：它和新节点中的未执行节点数组尾部角标保持一致</span>
            <span class="token keyword">let</span> j <span class="token operator">=</span> inCrementalArr<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span>

            <span class="token keyword">for</span> <span class="token punctuation">(</span>j<span class="token punctuation">;</span> j <span class="token operator">&gt;=</span> <span class="token number">0</span><span class="token punctuation">;</span> j<span class="token operator">--</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

                <span class="token comment">// 挂载新节点</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>inCrementalArr<span class="token punctuation">[</span>j<span class="token punctuation">]</span> <span class="token operator">===</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

                    <span class="token comment">// 当前节点角标</span>
                    <span class="token keyword">const</span> curIndex <span class="token operator">=</span> j <span class="token operator">+</span> startIndex

                    <span class="token comment">// 当前节点</span>
                    <span class="token keyword">const</span> curV <span class="token operator">=</span> nChild<span class="token punctuation">[</span>curIndex<span class="token punctuation">]</span>

                    <span class="token function">patch</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> curV<span class="token punctuation">,</span> container<span class="token punctuation">,</span> <span class="token function">setAnchor</span><span class="token punctuation">(</span>curIndex<span class="token punctuation">,</span> nChild<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>j <span class="token operator">!==</span> sonArr<span class="token punctuation">[</span>s<span class="token punctuation">]</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

                    <span class="token keyword">let</span> curIndex <span class="token operator">=</span> j <span class="token operator">+</span> startIndex

                    <span class="token keyword">const</span> curV <span class="token operator">=</span> nChild<span class="token punctuation">[</span>curIndex<span class="token punctuation">]</span>

                    <span class="token function">insert</span><span class="token punctuation">(</span>curV<span class="token punctuation">.</span>_el<span class="token punctuation">,</span> container<span class="token punctuation">,</span> <span class="token function">setAnchor</span><span class="token punctuation">(</span>curIndex<span class="token punctuation">,</span> nChild<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                    s<span class="token operator">--</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 获取最长递增子序列</span>
    <span class="token keyword">function</span> <span class="token function">lis</span><span class="token punctuation">(</span><span class="token parameter">arr</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> p <span class="token operator">=</span> arr<span class="token punctuation">.</span><span class="token function">slice</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token keyword">const</span> result <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span>
        <span class="token keyword">let</span> i<span class="token punctuation">,</span> j<span class="token punctuation">,</span> u<span class="token punctuation">,</span> v<span class="token punctuation">,</span> c
        <span class="token keyword">const</span> len <span class="token operator">=</span> arr<span class="token punctuation">.</span>length
        <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> len<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">const</span> arrI <span class="token operator">=</span> arr<span class="token punctuation">[</span>i<span class="token punctuation">]</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>arrI <span class="token operator">!==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                j <span class="token operator">=</span> result<span class="token punctuation">[</span>result<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">]</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>arr<span class="token punctuation">[</span>j<span class="token punctuation">]</span> <span class="token operator">&lt;</span> arrI<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    p<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> j
                    result<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span>
                    <span class="token keyword">continue</span>
                <span class="token punctuation">}</span>
                u <span class="token operator">=</span> <span class="token number">0</span>
                v <span class="token operator">=</span> result<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span>
                <span class="token keyword">while</span> <span class="token punctuation">(</span>u <span class="token operator">&lt;</span> v<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    c <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>u <span class="token operator">+</span> v<span class="token punctuation">)</span> <span class="token operator">/</span> <span class="token number">2</span><span class="token punctuation">)</span> <span class="token operator">|</span> <span class="token number">0</span>
                    <span class="token keyword">if</span> <span class="token punctuation">(</span>arr<span class="token punctuation">[</span>result<span class="token punctuation">[</span>c<span class="token punctuation">]</span><span class="token punctuation">]</span> <span class="token operator">&lt;</span> arrI<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                        u <span class="token operator">=</span> c <span class="token operator">+</span> <span class="token number">1</span>
                    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                        v <span class="token operator">=</span> c
                    <span class="token punctuation">}</span>
                <span class="token punctuation">}</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>arrI <span class="token operator">&lt;</span> arr<span class="token punctuation">[</span>result<span class="token punctuation">[</span>u<span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token keyword">if</span> <span class="token punctuation">(</span>u <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                        p<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> result<span class="token punctuation">[</span>u <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">]</span>
                    <span class="token punctuation">}</span>
                    result<span class="token punctuation">[</span>u<span class="token punctuation">]</span> <span class="token operator">=</span> i
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        u <span class="token operator">=</span> result<span class="token punctuation">.</span>length
        v <span class="token operator">=</span> result<span class="token punctuation">[</span>u <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">]</span>
        <span class="token keyword">while</span> <span class="token punctuation">(</span>u<span class="token operator">--</span> <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            result<span class="token punctuation">[</span>u<span class="token punctuation">]</span> <span class="token operator">=</span> v
            v <span class="token operator">=</span> p<span class="token punctuation">[</span>v<span class="token punctuation">]</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> result
    <span class="token punctuation">}</span>

    <span class="token comment">// 设置要插入的节点的下一个节点</span>
    <span class="token keyword">function</span> <span class="token function">setAnchor</span><span class="token punctuation">(</span><span class="token parameter">index<span class="token punctuation">,</span> child</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

        <span class="token comment">// 当前节点的下一节点</span>
        <span class="token keyword">const</span> nextNode <span class="token operator">=</span> child<span class="token punctuation">[</span>index <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">]</span>

        <span class="token keyword">return</span> nextNode <span class="token operator">?</span> nextNode<span class="token punctuation">.</span>_el <span class="token operator">:</span> <span class="token keyword">null</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> <span class="token punctuation">{</span>
        render<span class="token punctuation">,</span>
        patch
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> renderer <span class="token operator">=</span> <span class="token function">createRenderer</span><span class="token punctuation">(</span><span class="token punctuation">{</span> createElement<span class="token punctuation">,</span> setTextContent<span class="token punctuation">,</span> insert <span class="token punctuation">}</span><span class="token punctuation">)</span>

<span class="token keyword">const</span> MyComponent <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token function">data</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">count</span><span class="token operator">:</span> <span class="token number">1</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token literal-property property">props</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
        <span class="token literal-property property">age</span><span class="token operator">:</span> <span class="token keyword">null</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;div&#39;</span><span class="token punctuation">,</span>
            <span class="token literal-property property">children</span><span class="token operator">:</span> <span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">我是小黑，我今年 </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span><span class="token keyword">this</span><span class="token punctuation">.</span>count<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> 岁了</span><span class="token template-punctuation string">\`</span></span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> vnode <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">type</span><span class="token operator">:</span> MyComponent<span class="token punctuation">,</span>
    <span class="token literal-property property">props</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;小黑&#39;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">age</span><span class="token operator">:</span> <span class="token number">1</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

renderer<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span>vnode<span class="token punctuation">,</span> document<span class="token punctuation">.</span><span class="token function">getElementById</span><span class="token punctuation">(</span><span class="token string">&#39;app&#39;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><p>至这里，我们实现了 emit 的逻辑，了解了其内部为什么在调用时能够触发的逻辑，也明白了在设计 vnode 结构的时候，props 属性与 type 指向的组件选项内容对象有多么强大的联系——它完全把组件间相互包裹的关系给联系起来了。这里的表现则是通过合法的 props 拿到了父组件定义在子组件上的事件属性，而子组件本身又有 emit 的抛出，这就给联系了起来。揭开了 emit 的神秘面纱。</p>`,12),o=[e];function c(l,i){return s(),a("div",null,o)}const k=n(t,[["render",c],["__file","achieveAssemblyEmit.html.vue"]]);export{k as default};
