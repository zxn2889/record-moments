import{_ as n,o as s,c as a,d as p}from"./app-13115eff.js";const t="/record-moments/img/10.png",e="/record-moments/img/11.png",o="/record-moments/img/12.png",c="/record-moments/img/13.png",l={},i=p(`<p>  朋友们，到这里响应式的学习就进入另一个阶段了。前面我们学习了如何实现一个简单的响应式，拆分出了 track 跟踪函数和 trigger 触发副作用函数、及特定情况下的追踪调度等，对响应式有了一个简单的系统的了解。现在，将在此基础上实现 computed 的逻辑，一同进步吧。</p><p>  我们知晓 computed 实现的目标是需要时进行缓存计算，即用到它时再进行计算+缓存。计算是有结果和过程的，结果怎么拿呢——通过计算完成后返回，即 return；而过程呢——会触发 track，甚至 trigger 函数。而且还要缓存下来，避免每次读取时都要计算，所以，针对这些情况做处理就是：</p><ol><li>需要时才计算的判断条件，</li><li>结果要 return，</li><li>要把计算过程都执行完再 return，</li><li>return 的结果要缓存，</li><li>需要一个 computed 函数。</li></ol><p>  针对第一条我们发现，当前的 effect 函数不能满足当前场景，因为我们的 effect 包裹的副作用函数是立即执行的，要进行改造，如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token parameter">fn<span class="token punctuation">,</span> options</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> <span class="token function-variable function">effectFn</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token function">cleanup</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        activeEffect <span class="token operator">=</span> effectFn <span class="token comment">// 将要执行的副作用函数指向 effectFn</span>
        effectStack<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>activeEffect<span class="token punctuation">)</span> <span class="token comment">// 压栈</span>
        <span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// 当前的副作用函数里保留了要执行的入参指向并执行</span>
        effectStack<span class="token punctuation">.</span><span class="token function">pop</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// 弹栈</span>
        activeEffect <span class="token operator">=</span> effectStack<span class="token punctuation">.</span><span class="token function">at</span><span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    effectFn<span class="token punctuation">.</span>options <span class="token operator">=</span> options
    effectFn<span class="token punctuation">.</span>deps <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token comment">// 存储依赖集合</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>options<span class="token punctuation">.</span>lazy<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">// lazy 不为真时立即执行</span>
        <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> useOptions <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">false</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>  发现，lazy 为 false 时，是能满足我们之前实现的逻辑的，但是为 true 呢。结合 lazy 要实现的目标——控制副作用函数的立即执行，即，对代码改动如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token parameter">fn<span class="token punctuation">,</span> options</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> <span class="token function-variable function">effectFn</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token function">cleanup</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        activeEffect <span class="token operator">=</span> effectFn <span class="token comment">// 将要执行的副作用函数指向 effectFn</span>
        effectStack<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>activeEffect<span class="token punctuation">)</span> <span class="token comment">// 压栈</span>
        <span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// 当前的副作用函数里保留了要执行的入参指向并执行</span>
        effectStack<span class="token punctuation">.</span><span class="token function">pop</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// 弹栈</span>
        activeEffect <span class="token operator">=</span> effectStack<span class="token punctuation">.</span><span class="token function">at</span><span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    effectFn<span class="token punctuation">.</span>options <span class="token operator">=</span> options
    effectFn<span class="token punctuation">.</span>deps <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token comment">// 存储依赖集合</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>options<span class="token punctuation">.</span>lazy<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">// lazy 不为真时立即执行</span>
        <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> effectFn <span class="token comment">// 新增</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>  这样处理的话就一定程度上满足了为 true 时不立即触发副作用函数，而是改为抛出去这个执行的逻辑，交给其他场景下适时调用。但还可以再优化下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token parameter">fn<span class="token punctuation">,</span> options</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> <span class="token function-variable function">effectFn</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token function">cleanup</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        activeEffect <span class="token operator">=</span> effectFn <span class="token comment">// 将要执行的副作用函数指向 effectFn</span>
        effectStack<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>activeEffect<span class="token punctuation">)</span> <span class="token comment">// 压栈</span>
        <span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// 当前的副作用函数里保留了要执行的入参指向并执行</span>
        effectStack<span class="token punctuation">.</span><span class="token function">pop</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// 弹栈</span>
        activeEffect <span class="token operator">=</span> effectStack<span class="token punctuation">.</span><span class="token function">at</span><span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    effectFn<span class="token punctuation">.</span>options <span class="token operator">=</span> options
    effectFn<span class="token punctuation">.</span>deps <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token comment">// 存储依赖集合</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>options<span class="token punctuation">.</span>lazy<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">// lazy 不为真时立即执行</span>
        <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> effectFn
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>   这样就避免了等号两边都要计算的情况，如：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// 例子，没有具体意义</span>
<span class="token keyword">const</span> eff <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>   这样的话，第一条就满足了，代码如下：</p><details class="custom-container details"><summary>详情代码</summary><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// 响应式的基本实现</span>
<span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span> <span class="token literal-property property">foo</span><span class="token operator">:</span> <span class="token number">1</span> <span class="token punctuation">}</span>

<span class="token keyword">let</span> activeEffect
<span class="token keyword">let</span> effectStack <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>
<span class="token keyword">function</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token parameter">fn<span class="token punctuation">,</span> options</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> <span class="token function-variable function">effectFn</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token function">cleanup</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        activeEffect <span class="token operator">=</span> effectFn <span class="token comment">// 将要执行的副作用函数指向 effectFn</span>
        effectStack<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>activeEffect<span class="token punctuation">)</span> <span class="token comment">// 压栈</span>
        <span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// 当前的副作用函数里保留了要执行的入参指向并执行</span>
        effectStack<span class="token punctuation">.</span><span class="token function">pop</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// 弹栈</span>
        activeEffect <span class="token operator">=</span> effectStack<span class="token punctuation">.</span><span class="token function">at</span><span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>
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
    deps <span class="token operator">&amp;&amp;</span> deps<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">effectFn</span> <span class="token operator">=&gt;</span> effectFn <span class="token operator">!==</span> activeEffect <span class="token operator">&amp;&amp;</span> effectsToRun<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span><span class="token punctuation">)</span>
    effectsToRun<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">effectFn</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>effectFn<span class="token punctuation">.</span>options<span class="token punctuation">.</span>scheduler<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            effectFn<span class="token punctuation">.</span>options<span class="token punctuation">.</span><span class="token function">scheduler</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> p <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">,</span> handler<span class="token punctuation">)</span>

<span class="token keyword">function</span> <span class="token function">useFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>p<span class="token punctuation">.</span>foo<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> useOptions <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">false</span>
<span class="token punctuation">}</span>
<span class="token function">effect</span><span class="token punctuation">(</span>useFn<span class="token punctuation">,</span> useOptions<span class="token punctuation">)</span>

p<span class="token punctuation">.</span>foo<span class="token operator">++</span>

console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;结束了&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><p>  在此基础上，我们尝试下获取下 lazy 为 true 时结果，发现拿不到，如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">useFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> p<span class="token punctuation">.</span>foo
<span class="token punctuation">}</span>

<span class="token keyword">const</span> useOptions <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> effectResult <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>useFn<span class="token punctuation">,</span> useOptions<span class="token punctuation">)</span>

console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;effectResult&#39;</span><span class="token punctuation">,</span> <span class="token function">effectResult</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="`+t+`" alt="图片"></p><p>修改如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token parameter">fn<span class="token punctuation">,</span> options</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
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

<span class="token comment">// ...</span>

<span class="token keyword">function</span> <span class="token function">useFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> p<span class="token punctuation">.</span>foo
<span class="token punctuation">}</span>

<span class="token keyword">const</span> useOptions <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> effectResult <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>useFn<span class="token punctuation">,</span> useOptions<span class="token punctuation">)</span>

console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;effectResult&#39;</span><span class="token punctuation">,</span> <span class="token function">effectResult</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>  第二条也已经实现，为什么要给 effectFn 加一个返回值，因为 fn 才是真正的要执行的副作用函数，effectFn 只是我们包裹后的一个副作用，真正要计算的不是它，所以 fn 才要加，不然拿不到。</p><p>  好，代码再优化以下，加一个 computed 函数：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">useFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> p<span class="token punctuation">.</span>foo
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">computed</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    
    <span class="token keyword">const</span> useOptions <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">const</span> effectResult <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>fn<span class="token punctuation">,</span> useOptions<span class="token punctuation">)</span>

    <span class="token keyword">return</span> <span class="token function">effectResult</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> res <span class="token operator">=</span> <span class="token function">computed</span><span class="token punctuation">(</span>useFn<span class="token punctuation">)</span>

console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;res&#39;</span><span class="token punctuation">,</span> res<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="`+e+`" alt="图片"></p><p>  这样的话就有了一个计算器的雏形，当然还很简陋。实际工作中我们需要 res.value 才能拿到具体的值，明显这样是不行的，改造如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">computed</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    
    <span class="token keyword">const</span> useOptions <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token keyword">get</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token function">effect</span><span class="token punctuation">(</span>fn<span class="token punctuation">,</span> useOptions<span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> obj
<span class="token punctuation">}</span>

<span class="token keyword">const</span> res <span class="token operator">=</span> <span class="token function">computed</span><span class="token punctuation">(</span>useFn<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">TIP</p><p>发现，我们调用的明明是 res.value，但却返回了具体的值了；而在 computed 内部函数返回的对象里，value 是一个函数啊——这涉及到了一个知识点——getter 和 setter。对象中特定的访问属性，用于可能会有一些动态逻辑，但又不想显示操作的场景。使用 get 后，就有了一个“伪属性”——函数的名，但对象中不能同时存在相同的属性名哦。</p></div><p>  发现第 5 条也已经实现，但是要的计算属性缓存还没有加上，导致每次调用都会重新计算，所以继续优化，如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">computed</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    
    <span class="token keyword">const</span> useOptions <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">let</span> dity <span class="token operator">=</span> <span class="token boolean">false</span> <span class="token comment">// false 表示未计算过</span>
    <span class="token keyword">let</span> res

    <span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token keyword">get</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>dity<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;01&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                res <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>fn<span class="token punctuation">,</span> useOptions<span class="token punctuation">)</span>
                dity <span class="token operator">=</span> <span class="token boolean">true</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">return</span> <span class="token function">res</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> obj
<span class="token punctuation">}</span>

<span class="token keyword">const</span> res <span class="token operator">=</span> <span class="token function">computed</span><span class="token punctuation">(</span>useFn<span class="token punctuation">)</span>

console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;res&#39;</span><span class="token punctuation">,</span> res<span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">;</span>
console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;res&#39;</span><span class="token punctuation">,</span> res<span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">;</span>
console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;res&#39;</span><span class="token punctuation">,</span> res<span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="`+o+`" alt="图片"></p><p>  实验发现，这种方式能实现计算属性的缓存效果。但代码还可以继续优化，优化如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">computed</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    
    <span class="token keyword">const</span> useOptions <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">let</span> dity <span class="token operator">=</span> <span class="token boolean">false</span> <span class="token comment">// false 表示未计算过</span>
    <span class="token keyword">const</span> effectResult <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>fn<span class="token punctuation">,</span> useOptions<span class="token punctuation">)</span>

    <span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token keyword">get</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>dity<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                value <span class="token operator">=</span> <span class="token function">effectResult</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                dity <span class="token operator">=</span> <span class="token boolean">true</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">return</span> value
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> obj
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>  但到这里发现一个问题——如果读取过 value 值后，我改变了副作用函数中要监听的值呢？如：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> res <span class="token operator">=</span> <span class="token function">computed</span><span class="token punctuation">(</span>useFn<span class="token punctuation">)</span>

console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;res&#39;</span><span class="token punctuation">,</span> res<span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">;</span>

p<span class="token punctuation">.</span>foo <span class="token operator">=</span> <span class="token number">2</span>

console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;res update&#39;</span><span class="token punctuation">,</span> res<span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="`+c+`" alt="图片"></p><p>  发现值并没有更新啊，这怎么办？</p><p>  风暴：<br>   A：肯定是判断是否重新计算缓存的条件有问题对不对？<br>   B：对，有道理，嗯？不对。<br>   A：怎么不对了？<br>   B：不是还更改了 foo 的值么，它是我们监听的对象属性啊。<br>   A：咦！说的还蛮对的，要怎么改呢？<br>   B：是啊，要怎么改啊！？</p><p>  分析发现，是修改了属性值后，触发了要执行的副作用函数，所以要在这里搞事情——执行完后把 dity 的值给改回来。要怎么加呢，如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">computed</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    
    <span class="token keyword">let</span> dity <span class="token operator">=</span> <span class="token boolean">false</span> <span class="token comment">// false 表示未计算过</span>

    <span class="token keyword">const</span> useOptions <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            dity <span class="token operator">=</span> <span class="token boolean">false</span> <span class="token comment">// 新增</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">const</span> effectResult <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>fn<span class="token punctuation">,</span> useOptions<span class="token punctuation">)</span>

    <span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token keyword">get</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>dity<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                value <span class="token operator">=</span> <span class="token function">effectResult</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                dity <span class="token operator">=</span> <span class="token boolean">true</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">return</span> value
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> obj
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>  分析一下，我们借用了 scheduler 属性在这里做了个回调处理，这里 dity 的引用指向并没有变，所以能实现重新计算的想法。具体展示一下：</p><ol><li>执行第一遍的时候，读取的 foo 不会触发中心执行逻辑，所以 computed 方法里的 scheduler 属性不会被触发；</li><li>当执行到 p.foo = 2 时，监听到改变并执行 trigger 函数时，因为 lazy 设为了 true，所以包裹真正副作用函数的 effectFn 不会被执行，而是返回了手动引用项，就像是按住了暂停，但是 dity 属性值已经变为 false 了；</li><li>当再次执行到 res.value 时，一切才开始继续执行，就像第一次一样。 这就是它的完整逻辑。</li></ol><details class="custom-container details"><summary>详情代码</summary><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// 响应式的基本实现</span>
<span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span> <span class="token literal-property property">foo</span><span class="token operator">:</span> <span class="token number">1</span> <span class="token punctuation">}</span>

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
    deps <span class="token operator">&amp;&amp;</span> deps<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">effectFn</span> <span class="token operator">=&gt;</span> effectFn <span class="token operator">!==</span> activeEffect <span class="token operator">&amp;&amp;</span> effectsToRun<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span><span class="token punctuation">)</span>
    effectsToRun<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">effectFn</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;01&#39;</span><span class="token punctuation">,</span> effectFn<span class="token punctuation">.</span>options<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>effectFn<span class="token punctuation">.</span>options<span class="token punctuation">.</span>scheduler<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            effectFn<span class="token punctuation">.</span>options<span class="token punctuation">.</span><span class="token function">scheduler</span><span class="token punctuation">(</span>effectFn<span class="token punctuation">)</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token function">effectFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> p <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">,</span> handler<span class="token punctuation">)</span>

<span class="token keyword">function</span> <span class="token function">useFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    document<span class="token punctuation">.</span>body<span class="token punctuation">.</span>innerHTML <span class="token operator">=</span> p<span class="token punctuation">.</span>foo
    <span class="token keyword">return</span> p<span class="token punctuation">.</span>foo
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">computed</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    
    <span class="token keyword">let</span> dity <span class="token operator">=</span> <span class="token boolean">false</span> <span class="token comment">// false 表示未计算过</span>

    <span class="token keyword">const</span> useOptions <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            dity <span class="token operator">=</span> <span class="token boolean">false</span> <span class="token comment">// 新增</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">const</span> effectResult <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>fn<span class="token punctuation">,</span> useOptions<span class="token punctuation">)</span>

    <span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token keyword">get</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>dity<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                value <span class="token operator">=</span> <span class="token function">effectResult</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                dity <span class="token operator">=</span> <span class="token boolean">true</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">return</span> value
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> obj
<span class="token punctuation">}</span>

<span class="token keyword">const</span> res <span class="token operator">=</span> <span class="token function">computed</span><span class="token punctuation">(</span>useFn<span class="token punctuation">)</span>

console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;res&#39;</span><span class="token punctuation">,</span> res<span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">;</span>

p<span class="token punctuation">.</span>foo <span class="token operator">=</span> <span class="token number">2</span>

console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;res update&#39;</span><span class="token punctuation">,</span> res<span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><p>  貌似到这里就已经很完美了，但是还有一个问题，如果 computed 返回值在另外一个 effect 函数里引用了怎么办？</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> res <span class="token operator">=</span> <span class="token function">computed</span><span class="token punctuation">(</span>useFn<span class="token punctuation">)</span>

console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;res&#39;</span><span class="token punctuation">,</span> res<span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;other&#39;</span><span class="token punctuation">,</span> res<span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">)</span>

p<span class="token punctuation">.</span>foo<span class="token operator">++</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>  发现引用没有关系，但是更改 foo 的值后，effect 没有更新。这就出现问题了，不是计算属性的调用的话，那我是不是要重新执行，对不对。所以，修改如下：</p><details class="custom-container details"><summary>详情代码</summary><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// 响应式的基本实现</span>
<span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span> <span class="token literal-property property">foo</span><span class="token operator">:</span> <span class="token number">1</span> <span class="token punctuation">}</span>

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

<span class="token keyword">function</span> <span class="token function">useFn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> p<span class="token punctuation">.</span>foo
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">computed</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> value
    <span class="token keyword">let</span> dirty <span class="token operator">=</span> <span class="token boolean">true</span> <span class="token comment">// 这里修改了下，为 true 时代表没有计算过</span>

    <span class="token keyword">const</span> useOptions <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">lazy</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token function">scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>dirty<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                dirty <span class="token operator">=</span> <span class="token boolean">true</span> <span class="token comment">// 新增</span>
    
                <span class="token function">trigger</span><span class="token punctuation">(</span>obj<span class="token punctuation">,</span> <span class="token string">&#39;value&#39;</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">const</span> effectResult <span class="token operator">=</span> <span class="token function">effect</span><span class="token punctuation">(</span>fn<span class="token punctuation">,</span> useOptions<span class="token punctuation">)</span>

    <span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token keyword">get</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>dirty<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                value <span class="token operator">=</span> <span class="token function">effectResult</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                dirty <span class="token operator">=</span> <span class="token boolean">false</span>
            <span class="token punctuation">}</span>
            <span class="token function">track</span><span class="token punctuation">(</span>obj<span class="token punctuation">,</span> <span class="token string">&#39;value&#39;</span><span class="token punctuation">)</span>
            <span class="token keyword">return</span> value
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> obj
<span class="token punctuation">}</span>

<span class="token keyword">const</span> res <span class="token operator">=</span> <span class="token function">computed</span><span class="token punctuation">(</span>useFn<span class="token punctuation">)</span>

<span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;other&#39;</span><span class="token punctuation">,</span> res<span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">)</span>

p<span class="token punctuation">.</span>foo<span class="token operator">++</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><p>  但是这样有个问题——单独打印日志的时候，报无限循环问题，不知道为什么？书上也没说，不知道要不上 Q 一下作者呢还是留作作业哩。</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>res<span class="token punctuation">.</span>value<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,46),u=[i];function k(r,d){return s(),a("div",null,u)}const m=n(l,[["render",k],["__file","achieveComputed.html.vue"]]);export{m as default};
