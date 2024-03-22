import{_ as n,o as s,c as a,d as p}from"./app-13115eff.js";const t="/record-moments/img/17.png",e={},o=p(`<p>朋友们，上一节我们完成了 watch 的基本实现，现在我们学习如何让它立即执行与实现回调的调度执行。</p><p>我们知晓立即执行是代码执行到这里就立即执行的，不管其他。所以就不能等待要监听的值改变后被动触发。这就要有一个开关，能控制住这段逻辑——immediate。且这段逻辑是在 watch 钩子内实现的，且还要有新值与旧值，实现如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// ...</span>

<span class="token keyword">function</span> <span class="token function">watch</span><span class="token punctuation">(</span><span class="token parameter">source<span class="token punctuation">,</span> cb<span class="token punctuation">,</span> options <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> getter

    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> source <span class="token operator">===</span> <span class="token string">&#39;function&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        getter <span class="token operator">=</span> source
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token function-variable function">getter</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">traverse</span><span class="token punctuation">(</span>source<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">let</span> nVal<span class="token punctuation">,</span> oVal

    <span class="token keyword">const</span> <span class="token function-variable function">job</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        nVal <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token function">cb</span><span class="token punctuation">(</span>nVal<span class="token punctuation">,</span> oVal<span class="token punctuation">)</span>
        oVal <span class="token operator">=</span> nVal
    <span class="token punctuation">}</span>

    <span class="token keyword">const</span> effectFn <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>getter<span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">job</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>options<span class="token punctuation">.</span>immediate<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">job</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        oVal <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// ...</span>

<span class="token function">watch</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> p<span class="token punctuation">.</span>foo<span class="token punctuation">,</span> callBack<span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">immediate</span><span class="token operator">:</span> <span class="token boolean">true</span> <span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="`+t+`" alt="图片"></p><p>完美实现，且 oVal 为 undefined 符合预期——因为没有定义初始值。好，那如何让 DOM 执行完之后再执行回调呢。所以，还需要有一个开关，实现如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// ...</span>

<span class="token keyword">function</span> <span class="token function">watch</span><span class="token punctuation">(</span><span class="token parameter">source<span class="token punctuation">,</span> cb<span class="token punctuation">,</span> options <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> getter

    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> source <span class="token operator">===</span> <span class="token string">&#39;function&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        getter <span class="token operator">=</span> source
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token function-variable function">getter</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">traverse</span><span class="token punctuation">(</span>source<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">let</span> nVal<span class="token punctuation">,</span> oVal

    <span class="token keyword">const</span> <span class="token function-variable function">job</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        nVal <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token function">cb</span><span class="token punctuation">(</span>nVal<span class="token punctuation">,</span> oVal<span class="token punctuation">)</span>
        oVal <span class="token operator">=</span> nVal
    <span class="token punctuation">}</span>

    <span class="token keyword">const</span> effectFn <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>getter<span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>options<span class="token punctuation">.</span>flush<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">// 新增</span>
                <span class="token keyword">const</span> pro <span class="token operator">=</span> Promise<span class="token punctuation">.</span><span class="token function">resolve</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                pro<span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token function">job</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>options<span class="token punctuation">.</span>immediate<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">job</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        oVal <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// ...</span>

<span class="token function">watch</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> p<span class="token punctuation">.</span>foo<span class="token punctuation">,</span> callBack<span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">immediate</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span> <span class="token literal-property property">flush</span><span class="token operator">:</span> <span class="token boolean">true</span> <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token comment">// flush 为 true 代表 DOM 更新完后再执行回调</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><details class="custom-container details"><summary>详情代码</summary><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// 响应式的基本实现</span>
<span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span> <span class="token literal-property property">foo</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token literal-property property">bar</span><span class="token operator">:</span> <span class="token number">3</span><span class="token punctuation">,</span> <span class="token literal-property property">cat</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">age</span><span class="token operator">:</span> <span class="token number">1</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span>

<span class="token keyword">let</span> activeEffect
<span class="token keyword">let</span> effectStack <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>
<span class="token keyword">function</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token parameter">fn<span class="token punctuation">,</span> options <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> <span class="token function-variable function">effectFn</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token function">cleanup</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        activeEffect <span class="token operator">=</span> effectFn <span class="token comment">// 将要执行的副作用函数指向 effectFn</span>
        effectStack<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>activeEffect<span class="token punctuation">)</span> <span class="token comment">// 压栈</span>
        <span class="token keyword">const</span> fnRes <span class="token operator">=</span> <span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// 当前的副作用函数里保留了要执行的入参指向并执行</span>
        effectStack<span class="token punctuation">.</span><span class="token function">pop</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// 弹栈</span>
        activeEffect <span class="token operator">=</span> effectStack<span class="token punctuation">.</span><span class="token function">at</span><span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> fnRes
    <span class="token punctuation">}</span>
    effectFn<span class="token punctuation">.</span>options <span class="token operator">=</span> options
    effectFn<span class="token punctuation">.</span>deps <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token comment">// 存储依赖集合</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>options<span class="token punctuation">.</span>lazy<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">// lazy 不为真时立即执行</span>
        <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> effectFn
<span class="token punctuation">}</span>

<span class="token keyword">const</span> <span class="token function-variable function">cleanup</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">effectFn</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> effectFn<span class="token punctuation">.</span>deps<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> deps <span class="token operator">=</span> effectFn<span class="token punctuation">.</span>deps<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">;</span>
        deps<span class="token punctuation">.</span><span class="token function">delete</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    effectFn<span class="token punctuation">.</span>deps<span class="token punctuation">.</span>length <span class="token operator">=</span> <span class="token number">0</span>
<span class="token punctuation">}</span>

<span class="token keyword">let</span> bucket <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">WeakMap</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

<span class="token keyword">const</span> handler <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> prop<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">track</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> prop<span class="token punctuation">)</span>
        <span class="token keyword">return</span> target<span class="token punctuation">[</span>prop<span class="token punctuation">]</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token function">set</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> prop<span class="token punctuation">,</span> nVal<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        target<span class="token punctuation">[</span>prop<span class="token punctuation">]</span> <span class="token operator">=</span> nVal
        <span class="token function">trigger</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> prop<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> <span class="token function-variable function">track</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">target<span class="token punctuation">,</span> prop</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>activeEffect<span class="token punctuation">)</span> <span class="token keyword">return</span> target<span class="token punctuation">[</span>prop<span class="token punctuation">]</span>
    <span class="token keyword">let</span> depsMap <span class="token operator">=</span> bucket<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>depsMap<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        bucket<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> <span class="token punctuation">(</span>depsMap <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Map</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">let</span> deps <span class="token operator">=</span> depsMap<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>prop<span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>deps<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        depsMap<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>prop<span class="token punctuation">,</span> <span class="token punctuation">(</span>deps <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    deps<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>activeEffect<span class="token punctuation">)</span>
    activeEffect<span class="token punctuation">.</span>deps<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>deps<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> <span class="token function-variable function">trigger</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">target<span class="token punctuation">,</span> prop</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> depsMap <span class="token operator">=</span> bucket<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>depsMap<span class="token punctuation">)</span> <span class="token keyword">return</span>
    <span class="token keyword">const</span> deps <span class="token operator">=</span> depsMap<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>prop<span class="token punctuation">)</span>
    <span class="token keyword">const</span> effectsToRun <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    deps <span class="token operator">&amp;&amp;</span> deps<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">effectFn</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>effectFn <span class="token operator">!==</span> activeEffect<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            effectsToRun<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    effectsToRun<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">effectFn</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>effectFn<span class="token punctuation">.</span>options<span class="token punctuation">.</span>scheduler<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            effectFn<span class="token punctuation">.</span>options<span class="token punctuation">.</span><span class="token function">scheduler</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> p <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">,</span> handler<span class="token punctuation">)</span>

<span class="token keyword">function</span> <span class="token function">callBack</span><span class="token punctuation">(</span><span class="token parameter">nVal<span class="token punctuation">,</span> oVal</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;执行了 callback&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;nVal&#39;</span><span class="token punctuation">,</span> nVal<span class="token punctuation">)</span><span class="token punctuation">;</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;oVal&#39;</span><span class="token punctuation">,</span> oVal<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">watch</span><span class="token punctuation">(</span><span class="token parameter">source<span class="token punctuation">,</span> cb<span class="token punctuation">,</span> options <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> getter

    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> source <span class="token operator">===</span> <span class="token string">&#39;function&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        getter <span class="token operator">=</span> source
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token function-variable function">getter</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">traverse</span><span class="token punctuation">(</span>source<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">let</span> nVal<span class="token punctuation">,</span> oVal

    <span class="token keyword">const</span> <span class="token function-variable function">job</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        nVal <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token function">cb</span><span class="token punctuation">(</span>nVal<span class="token punctuation">,</span> oVal<span class="token punctuation">)</span>
        oVal <span class="token operator">=</span> nVal
    <span class="token punctuation">}</span>

    <span class="token keyword">const</span> effectFn <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>getter<span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>options<span class="token punctuation">.</span>flush<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">const</span> pro <span class="token operator">=</span> Promise<span class="token punctuation">.</span><span class="token function">resolve</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                pro<span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token function">job</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>options<span class="token punctuation">.</span>immediate<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">job</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        oVal <span class="token operator">=</span> <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">traverse</span><span class="token punctuation">(</span>value<span class="token punctuation">,</span> seen <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> value <span class="token operator">!==</span> <span class="token string">&#39;object&#39;</span> <span class="token operator">||</span> value <span class="token operator">===</span> <span class="token keyword">null</span> <span class="token operator">||</span> seen<span class="token punctuation">.</span><span class="token function">has</span><span class="token punctuation">(</span>value<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token keyword">return</span>

    seen<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>value<span class="token punctuation">)</span>

    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">const</span> k <span class="token keyword">in</span> value<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">traverse</span><span class="token punctuation">(</span>value<span class="token punctuation">[</span>k<span class="token punctuation">]</span><span class="token punctuation">,</span> seen<span class="token punctuation">)</span> <span class="token comment">// 新增</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> value <span class="token comment">// 新增</span>
<span class="token punctuation">}</span>

<span class="token function">watch</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> p<span class="token punctuation">.</span>foo<span class="token punctuation">,</span> callBack<span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">immediate</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span> <span class="token literal-property property">flush</span><span class="token operator">:</span> <span class="token boolean">true</span> <span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details>`,7),c=[o];function l(i,u){return s(),a("div",null,c)}const r=n(e,[["render",l],["__file","achieveWatchSomeOptions.html.vue"]]);export{r as default};
