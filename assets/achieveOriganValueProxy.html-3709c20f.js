import{_ as u,r as o,o as i,c as r,e as a,w as t,d as p,a as n,b as s}from"./app-13115eff.js";const k="/record-moments/img/43.png",d="/record-moments/img/44.png",c="/record-moments/img/45.png",v="/record-moments/img/46.png",m={},b=p(`<p>朋友们，上一节学习了数组的代理方案后，非原始值的响应设计就暂时告一段落了。这一节我们将学习如何实现原始值的响应设计。原始值指的就是：<code>Boolean、Number、String、Symbol、undefined、null、BigInt</code>这类型的值。</p><p>我们知晓，目前的响应设计中，我们代理的都是对象，包括基本对象和数组对象等，其中在实现 watch 监听的响应设计中也曾提过，如果是单个属性的话还需要再进行一次包装，如 data 中 return 的 a，或单独的 <code>p.a</code> 字符串。而原始值的响应也是借鉴了这种思想——既然单独的原始值无法实现监听，那就再包裹一层变成对象， 这样就可以借助 Proxy 实现原始值的响应了。如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// origanProxy.js</span>

<span class="token keyword">import</span> <span class="token punctuation">{</span> reactive <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;./proxy.js&quot;</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token function-variable function">ref</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">val</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> wrapper <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">value</span><span class="token operator">:</span> val
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> <span class="token function">reactive</span><span class="token punctuation">(</span>wrapper<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">export</span> <span class="token punctuation">{</span>
    ref
<span class="token punctuation">}</span>


<span class="token comment">// index.js</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> ref <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;./origanProxy.js&#39;</span>

<span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token number">1</span>

<span class="token keyword">let</span> p <span class="token operator">=</span> <span class="token function">ref</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>

<span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;ref&#39;</span><span class="token punctuation">,</span> p<span class="token punctuation">)</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;ref value&#39;</span><span class="token punctuation">,</span> p<span class="token punctuation">.</span>value<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>

p<span class="token punctuation">.</span>value <span class="token operator">=</span> <span class="token number">2</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="`+k+`" alt="图片"></p><p>从结果得知，我们将原始值 <code>data = 1</code> 变为了代理响应对象，并成功实现了 get 和 set。但是也能从打印的代理对象中看到，从日志中并不能区分该代理对象是 ref 对象，还是非原始值的代理对象。所以，ref 对象中我们还要加一个标识，表明它是 ref 对象。如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> <span class="token function-variable function">ref</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">val</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> wrapper <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">value</span><span class="token operator">:</span> val
    <span class="token punctuation">}</span>

    <span class="token comment">// 添加 ref 对象标识符</span>
    Object<span class="token punctuation">.</span><span class="token function">defineProperty</span><span class="token punctuation">(</span>wrapper<span class="token punctuation">,</span> <span class="token string">&#39;__v_isRef&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">value</span><span class="token operator">:</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>

    <span class="token keyword">return</span> <span class="token function">reactive</span><span class="token punctuation">(</span>wrapper<span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">TIP</p><p><code>Object.defineProperty()</code>默认是不可更改的，且不会被触发<code>[[set]]</code>方法，这样就避免了不必要的消耗。</p></div><p>好，那我们继续探讨 ref 对象能解决哪些问题。如以下场景：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token function">setup</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> p <span class="token operator">=</span> <span class="token function">reactive</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">foo</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token literal-property property">bar</span><span class="token operator">:</span> <span class="token number">2</span> <span class="token punctuation">}</span><span class="token punctuation">)</span>

    <span class="token keyword">return</span> <span class="token punctuation">{</span>
        <span class="token operator">...</span>p
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们知晓，当将代理对象展开之后，我们得到就是一个返回的普通对象，这种情况并不具备响应追踪的能力，我们用目前的代码验证实现一下效果：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span> <span class="token literal-property property">foo</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token literal-property property">bar</span><span class="token operator">:</span> <span class="token number">2</span> <span class="token punctuation">}</span>

<span class="token keyword">let</span> p <span class="token operator">=</span> <span class="token function">reactive</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>

<span class="token keyword">const</span> nObj <span class="token operator">=</span> <span class="token punctuation">{</span> <span class="token operator">...</span>p <span class="token punctuation">}</span>

<span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;nObj&#39;</span><span class="token punctuation">,</span> nObj<span class="token punctuation">.</span>foo<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>

p<span class="token punctuation">.</span>foo<span class="token operator">++</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="`+d+`" alt="图片"></p><p>从结果中发现，修改 p.foo 的值后，副作用并没有触发，所以，nObj 是一个普通对象。但是，我们也发现，只要把普通对象中的属性关联到了响应对象的属性身上，相应变化也能实现，如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token punctuation">{</span> <span class="token literal-property property">foo</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token literal-property property">bar</span><span class="token operator">:</span> <span class="token number">2</span> <span class="token punctuation">}</span>

<span class="token keyword">let</span> p <span class="token operator">=</span> <span class="token function">reactive</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>

<span class="token keyword">const</span> nObj <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">a</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token keyword">get</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> p<span class="token punctuation">.</span>foo
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token literal-property property">b</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token keyword">get</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> p<span class="token punctuation">.</span>bar
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;nObj&#39;</span><span class="token punctuation">,</span> nObj<span class="token punctuation">.</span>a<span class="token punctuation">.</span>value<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>

p<span class="token punctuation">.</span>foo <span class="token operator">=</span> <span class="token number">2</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="`+c+`" alt="图片"></p><div class="custom-container tip"><p class="custom-container-title">TIP</p><p>注意，这里普通对象具备响应式的能力一定是要通过访问器属性实现，单纯的 <code>a: p.for</code> 这种并不行。这是因为访问器属性具备了运算的能力，当执行 <code>nObj.a.value</code> 的时候，也执行了 <code>p.foo</code>，这样就将其关联起来。但如果是 <code>a: p.foo</code> 这样的话，<code>nObj.a</code> 仅仅只是一个指向的 <code>p.foo</code> 的结果的问题，并没有进行关联。</p></div><p>从实验结果来看，普通对象也就有了响应式的能力。且 a、b 两个属性具备共性，优化后如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> <span class="token function-variable function">toRef</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">obj<span class="token punctuation">,</span> prop</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> wrapper <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token keyword">get</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> obj<span class="token punctuation">[</span>prop<span class="token punctuation">]</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> wrapper
<span class="token punctuation">}</span>

<span class="token keyword">const</span> nObj <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">a</span><span class="token operator">:</span> <span class="token function">toRef</span><span class="token punctuation">(</span>p<span class="token punctuation">,</span> <span class="token string">&#39;foo&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token literal-property property">b</span><span class="token operator">:</span> <span class="token function">toRef</span><span class="token punctuation">(</span>p<span class="token punctuation">,</span> <span class="token string">&#39;bar&#39;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token comment">// 其他代码省略</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后，我们发现 nObj 还是具备共性的，且 nObj 的属性完全可以和代理对象的属性完全一样，优化如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> <span class="token function-variable function">toRefs</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">proxyObj</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> nObj <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
    <span class="token keyword">const</span> props <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">keys</span><span class="token punctuation">(</span>proxyObj<span class="token punctuation">)</span>
    props<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">prop</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        nObj<span class="token punctuation">[</span>prop<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">toRef</span><span class="token punctuation">(</span>proxyObj<span class="token punctuation">,</span> prop<span class="token punctuation">)</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>

    <span class="token keyword">return</span> nObj
<span class="token punctuation">}</span>

<span class="token keyword">const</span> nObj <span class="token operator">=</span> <span class="token function">toRefs</span><span class="token punctuation">(</span>p<span class="token punctuation">)</span>

<span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;nObj&#39;</span><span class="token punctuation">,</span> nObj<span class="token punctuation">.</span>foo<span class="token punctuation">.</span>value<span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="`+c+`" alt="图片"></p><p>好，我们执行后发现，所有的结果都是相同的，但是我们忽略了一种情况，就是我修改普通属性后，能不能触发更新。目前发现不能，因为它会提示我们不能在仅有 getter 属性的对象上操作。优化如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> <span class="token function-variable function">toRef</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">obj<span class="token punctuation">,</span> prop</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> wrapper <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token keyword">get</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> obj<span class="token punctuation">[</span>prop<span class="token punctuation">]</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token keyword">set</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token parameter">val</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            obj<span class="token punctuation">[</span>prop<span class="token punctuation">]</span> <span class="token operator">=</span> val
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> wrapper
<span class="token punctuation">}</span>

nObj<span class="token punctuation">.</span>foo<span class="token punctuation">.</span>value <span class="token operator">=</span> <span class="token number">3</span>

<span class="token comment">// 其他代码省略</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="`+v+`" alt="图片"></p><p>好，从结果中发现，设置后也都能正常更新。且也发现，ref 和 toRef 本身封包的结构是很相似的，只不过后者是添加了访问器属性实现，那我们也把它认为是 ref 对象。代码如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> <span class="token function-variable function">toRef</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">obj<span class="token punctuation">,</span> prop</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> wrapper <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token keyword">get</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> obj<span class="token punctuation">[</span>prop<span class="token punctuation">]</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token keyword">set</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token parameter">val</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            obj<span class="token punctuation">[</span>prop<span class="token punctuation">]</span> <span class="token operator">=</span> val
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 添加 ref 对象标识符</span>
    Object<span class="token punctuation">.</span><span class="token function">defineProperty</span><span class="token punctuation">(</span>wrapper<span class="token punctuation">,</span> <span class="token string">&#39;__v_isRef&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">value</span><span class="token operator">:</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>

    <span class="token keyword">return</span> wrapper
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>但是我们也发现一些问题，就是无论是取值还是赋值都要带上 value，感觉上就没有非代理对象那么好用。修改如下：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> <span class="token function-variable function">proxyRef</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">data</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">Proxy</span><span class="token punctuation">(</span>data<span class="token punctuation">,</span> <span class="token punctuation">{</span>
        <span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> prop<span class="token punctuation">,</span> receiver<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">const</span> value <span class="token operator">=</span> Reflect<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> prop<span class="token punctuation">,</span> receiver<span class="token punctuation">)</span>
            <span class="token keyword">return</span> value<span class="token punctuation">.</span>__v_isRef <span class="token operator">?</span> value<span class="token punctuation">.</span>value <span class="token operator">:</span> value
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token function">set</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> prop<span class="token punctuation">,</span> nVal<span class="token punctuation">,</span> receiver<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">const</span> value <span class="token operator">=</span> target<span class="token punctuation">[</span>prop<span class="token punctuation">]</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>value<span class="token punctuation">.</span>__v_isRef<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                value<span class="token punctuation">.</span>value <span class="token operator">=</span> nVal
                <span class="token keyword">return</span> <span class="token boolean">true</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">return</span> Reflect<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> prop<span class="token punctuation">,</span> nVal<span class="token punctuation">,</span> receiver<span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>完整代码如下：</p>`,29),f=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" reactive"),n("span",{class:"token punctuation"},","),s(" shallowReactive"),n("span",{class:"token punctuation"},","),s(" readOnly"),n("span",{class:"token punctuation"},","),s(" shallowReadOnly"),n("span",{class:"token punctuation"},","),s(" effect "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},"'./proxy.js'"),s(`
`),n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" ref"),n("span",{class:"token punctuation"},","),s(" toRef"),n("span",{class:"token punctuation"},","),s(" toRefs"),n("span",{class:"token punctuation"},","),s(" proxyRef "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},"'./origanProxy.js'"),s(`

`),n("span",{class:"token comment"},"// 响应式的基本实现"),s(`
`),n("span",{class:"token keyword"},"const"),s(" data "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),s(),n("span",{class:"token literal-property property"},"foo"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token number"},"1"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token literal-property property"},"bar"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token number"},"2"),s(),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token keyword"},"let"),s(" p "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"reactive"),n("span",{class:"token punctuation"},"("),s("data"),n("span",{class:"token punctuation"},")"),s(`

`),n("span",{class:"token keyword"},"const"),s(" nObj "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"proxyRef"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},"{"),s(),n("span",{class:"token operator"},"..."),n("span",{class:"token function"},"toRefs"),n("span",{class:"token punctuation"},"("),s("p"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`

`),n("span",{class:"token function"},"effect"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
    console`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"log"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},"'nObj'"),n("span",{class:"token punctuation"},","),s(" nObj"),n("span",{class:"token punctuation"},"."),s("foo"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`

p`),n("span",{class:"token punctuation"},"."),s("foo "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token number"},"2"),s(`
nObj`),n("span",{class:"token punctuation"},"."),s("foo "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token number"},"3"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),y=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" activeEffect"),n("span",{class:"token punctuation"},","),s(" effect "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},"'./effect.js'"),s(`
`),n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" rewriteArrReadRecord"),n("span",{class:"token punctuation"},","),s(" blockTrack"),n("span",{class:"token punctuation"},","),s(" rewriteArrWriteRecord "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},"'./rewriteArray.js'"),s(`

`),n("span",{class:"token keyword"},"let"),s(" bucket "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token keyword"},"new"),s(),n("span",{class:"token class-name"},"WeakMap"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token keyword"},"let"),s(),n("span",{class:"token constant"},"ITERATE_KEY"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"Symbol"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(`

`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token constant"},"RECORD"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token constant"},"ADD"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'ADD'"),n("span",{class:"token punctuation"},","),s(`
    `),n("span",{class:"token constant"},"SET"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'SET'"),n("span",{class:"token punctuation"},","),s(`
    `),n("span",{class:"token constant"},"DEL"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'DEL'"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token constant"},"RECEIVER_TARGET"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token string"},"'raw'"),s(`
`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token constant"},"ARRAY_LENGTH"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token string"},"'length'"),s(`

`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token function-variable function"},"handler"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("isShallow "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token boolean"},"false"),n("span",{class:"token punctuation"},","),s(" isReadOnly "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token boolean"},"false")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        console`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"log"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},"'get:'"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
        `),n("span",{class:"token comment"},"// 将 receiver.raw 指向目标对象"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("prop "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token constant"},"RECEIVER_TARGET"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"return"),s(` target
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token comment"},"// 判断如果目标对象是数组，且操作方式是拦截的读取属性，就触发拦截效果"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("Array"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"isArray"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"&&"),s(" rewriteArrReadRecord"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"hasOwnProperty"),n("span",{class:"token punctuation"},"("),s("prop"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
           `),n("span",{class:"token keyword"},"return"),s(" Reflect"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("rewriteArrReadRecord"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token comment"},"// 判断如果目标对象是数组，且操作方式是拦截的修改属性，就触发拦截效果"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("Array"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"isArray"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"&&"),s(" rewriteArrWriteRecord"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"hasOwnProperty"),n("span",{class:"token punctuation"},"("),s("prop"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"return"),s(" Reflect"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("rewriteArrWriteRecord"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token comment"},"// 非只读属性且 prop 值类型不为 symbol 时跟踪依赖"),s(`
        `),n("span",{class:"token comment"},"// 注意其他手动触发 track 的区别，如 has、ownKeys，它们并不是走 get 收集的"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"!"),s("isReadOnly "),n("span",{class:"token operator"},"&&"),s(),n("span",{class:"token keyword"},"typeof"),s(" prop "),n("span",{class:"token operator"},"!=="),s(),n("span",{class:"token string"},"'symbol'"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token function"},"track"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token keyword"},"const"),s(" res "),n("span",{class:"token operator"},"="),s(" Reflect"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(`

        `),n("span",{class:"token comment"},"// 浅响应时阻断递归，直接返回当前响应对象"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("isShallow"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"return"),s(` res
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token comment"},"// 当前对象类型为 object，且不为空时递归建立深响应"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"typeof"),s(" res "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token string"},"'object'"),s(),n("span",{class:"token operator"},"&&"),s(" res "),n("span",{class:"token operator"},"!=="),s(),n("span",{class:"token keyword"},"null"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"return"),s(" isReadOnly "),n("span",{class:"token operator"},"?"),s(),n("span",{class:"token function"},"readOnly"),n("span",{class:"token punctuation"},"("),s("res"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},":"),s(),n("span",{class:"token function"},"reactive"),n("span",{class:"token punctuation"},"("),s("res"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token comment"},"// 其他情况直接 return res"),s(`
        `),n("span",{class:"token keyword"},"return"),s(` res
    `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},","),s(`
    `),n("span",{class:"token function"},"set"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" nVal"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        console`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"log"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},"'set:'"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("isReadOnly"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            console`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"warn"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},"'当前为只读对象，不可编辑！'"),n("span",{class:"token punctuation"},")"),s(`
            `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token boolean"},"false"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token keyword"},"const"),s(" oVal "),n("span",{class:"token operator"},"="),s(" target"),n("span",{class:"token punctuation"},"["),s("prop"),n("span",{class:"token punctuation"},"]"),s(`

        `),n("span",{class:"token comment"},"// 判断当前操作类型"),s(`
        `),n("span",{class:"token keyword"},"const"),s(" type "),n("span",{class:"token operator"},"="),s(" Array"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"isArray"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},")"),s(` 
            `),n("span",{class:"token operator"},"?"),s(),n("span",{class:"token function"},"Number"),n("span",{class:"token punctuation"},"("),s("prop"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},">"),s(),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},"["),n("span",{class:"token constant"},"ARRAY_LENGTH"),n("span",{class:"token punctuation"},"]"),s(),n("span",{class:"token operator"},"-"),s(),n("span",{class:"token number"},"1"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"?"),s(),n("span",{class:"token constant"},"RECORD"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"ADD"),s(),n("span",{class:"token operator"},":"),s(),n("span",{class:"token constant"},"RECORD"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"SET"),s(` 
            `),n("span",{class:"token operator"},":"),s(),n("span",{class:"token class-name"},"Object"),n("span",{class:"token punctuation"},"."),s("prototype"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"hasOwnProperty"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"call"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"?"),s(),n("span",{class:"token constant"},"RECORD"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"SET"),s(),n("span",{class:"token operator"},":"),s(),n("span",{class:"token constant"},"RECORD"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"ADD"),s(`

        `),n("span",{class:"token keyword"},"const"),s(" res "),n("span",{class:"token operator"},"="),s(" Reflect"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"set"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" nVal"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(`

        `),n("span",{class:"token comment"},"// 判断目标对象和 receiver.raw 代理对象是否相同"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("target "),n("span",{class:"token operator"},"==="),s(" receiver"),n("span",{class:"token punctuation"},"["),n("span",{class:"token constant"},"RECEIVER_TARGET"),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`

            `),n("span",{class:"token comment"},"// 判断新/旧值是否不等，且其中任一值不为 NaN 是触发更新"),s(`
            `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("oVal "),n("span",{class:"token operator"},"!=="),s(" nVal "),n("span",{class:"token operator"},"&&"),s(),n("span",{class:"token punctuation"},"("),s("oVal "),n("span",{class:"token operator"},"==="),s(" oVal "),n("span",{class:"token operator"},"||"),s(" nVal "),n("span",{class:"token operator"},"==="),s(" nVal"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
                `),n("span",{class:"token function"},"trigger"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" type"),n("span",{class:"token punctuation"},","),s(" nVal"),n("span",{class:"token punctuation"},")"),s(`
            `),n("span",{class:"token punctuation"},"}"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token comment"},"// 其他情况直接 return res"),s(`
        `),n("span",{class:"token keyword"},"return"),s(` res
    `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},","),s(`
    `),n("span",{class:"token function"},"has"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("target"),n("span",{class:"token punctuation"},","),s(" prop")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token comment"},"// 拦截 in 操作符并实现依赖跟踪——in 也是读取的一种"),s(`
        `),n("span",{class:"token function"},"track"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token keyword"},"return"),s(" Reflect"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"has"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},","),s(`
    `),n("span",{class:"token function"},"deleteProperty"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("target"),n("span",{class:"token punctuation"},","),s(" prop")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("isReadOnly"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            console`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"warn"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},"'当前为只读对象，不可删除！'"),n("span",{class:"token punctuation"},")"),s(`
            `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token boolean"},"false"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
        
        `),n("span",{class:"token comment"},"// 判断是否为自身的属性，而不是继承属性"),s(`
        `),n("span",{class:"token keyword"},"const"),s(" privateProp "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token class-name"},"Object"),n("span",{class:"token punctuation"},"."),s("prototype"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"hasOwnProperty"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"call"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},")"),s(`
        
        `),n("span",{class:"token keyword"},"const"),s(" res "),n("span",{class:"token operator"},"="),s(" Reflect"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"deleteProperty"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},")"),s(`
 
        `),n("span",{class:"token comment"},"// 是自身的属性，且删除成功，才触发更新"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("privateProp "),n("span",{class:"token operator"},"&&"),s(" res"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token function"},"trigger"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token constant"},"RECORD"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"DEL"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token comment"},"// 其他情况直接返回 res"),s(`
        `),n("span",{class:"token keyword"},"return"),s(` res
    `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},","),s(`
    `),n("span",{class:"token function"},"ownKeys"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"target"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token comment"},"// 追踪目标对象本身循环情况，根据其类型不同，关联不同的依赖桶"),s(`
        `),n("span",{class:"token keyword"},"const"),s(" prop "),n("span",{class:"token operator"},"="),s(" Array"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"isArray"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"?"),s(),n("span",{class:"token constant"},"ARRAY_LENGTH"),s(),n("span",{class:"token operator"},":"),s(),n("span",{class:"token constant"},"ITERATE_KEY"),s(`
        `),n("span",{class:"token function"},"track"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token keyword"},"return"),s(" Reflect"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"ownKeys"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`

`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token function-variable function"},"track"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("target"),n("span",{class:"token punctuation"},","),s(" prop")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token comment"},"// 当前无副作用或设置不跟踪依赖时，直接返回"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"!"),s("activeEffect "),n("span",{class:"token operator"},"||"),s(" blockTrack"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token keyword"},"return"),s(" target"),n("span",{class:"token punctuation"},"["),s("prop"),n("span",{class:"token punctuation"},"]"),s(`

    `),n("span",{class:"token comment"},"// 获取目标对象的 Map 集合"),s(`
    `),n("span",{class:"token keyword"},"let"),s(" depsMap "),n("span",{class:"token operator"},"="),s(" bucket"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"!"),s("depsMap"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        bucket`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"set"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"("),s("depsMap "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token keyword"},"new"),s(),n("span",{class:"token class-name"},"Map"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token comment"},"// 获取目标属性的 Set 集合——依赖收集器"),s(`
    `),n("span",{class:"token keyword"},"let"),s(" deps "),n("span",{class:"token operator"},"="),s(" depsMap"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("prop"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"!"),s("deps"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        depsMap`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"set"),n("span",{class:"token punctuation"},"("),s("prop"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"("),s("deps "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token keyword"},"new"),s(),n("span",{class:"token class-name"},"Set"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token comment"},"// 在依赖集合中添加当前副作用"),s(`
    deps`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"add"),n("span",{class:"token punctuation"},"("),s("activeEffect"),n("span",{class:"token punctuation"},")"),s(`

    `),n("span",{class:"token comment"},"// 把当前依赖集合存入当前副作用的收集器中"),s(`
    activeEffect`),n("span",{class:"token punctuation"},"."),s("deps"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"push"),n("span",{class:"token punctuation"},"("),s("deps"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token function-variable function"},"trigger"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" type"),n("span",{class:"token punctuation"},","),s(" nVal")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
    console`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"log"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},"'type'"),n("span",{class:"token punctuation"},","),s(" type"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
    `),n("span",{class:"token comment"},"// 获取目标对象 Map 集合"),s(`
    `),n("span",{class:"token keyword"},"const"),s(" depsMap "),n("span",{class:"token operator"},"="),s(" bucket"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"!"),s("depsMap"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token keyword"},"return"),s(`

    `),n("span",{class:"token comment"},"// 获取目标属性 Set 集合——依赖收集器"),s(`
    `),n("span",{class:"token keyword"},"const"),s(" deps "),n("span",{class:"token operator"},"="),s(" depsMap"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("prop"),n("span",{class:"token punctuation"},")"),s(`
    
    `),n("span",{class:"token comment"},"// 创建有效副作用更新器并存入桶中"),s(`
    `),n("span",{class:"token keyword"},"const"),s(" effectsToRun "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token keyword"},"new"),s(),n("span",{class:"token class-name"},"Set"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token function-variable function"},"addEffectFn"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"arr"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
        arr `),n("span",{class:"token operator"},"&&"),s(" arr"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"forEach"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"effectFn"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("effectFn "),n("span",{class:"token operator"},"!=="),s(" activeEffect"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
                effectsToRun`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"add"),n("span",{class:"token punctuation"},"("),s("effectFn"),n("span",{class:"token punctuation"},")"),s(`
            `),n("span",{class:"token punctuation"},"}"),s(`
        `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`
    `),n("span",{class:"token function"},"addEffectFn"),n("span",{class:"token punctuation"},"("),s("deps"),n("span",{class:"token punctuation"},")"),s(`
    
    `),n("span",{class:"token comment"},"// 稀有操作类型时，收集特殊依赖（Symbol相关）并存入桶中"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("type "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token constant"},"RECORD"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"ADD"),s(),n("span",{class:"token operator"},"||"),s(" type "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token constant"},"RECORD"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"DEL"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token constant"},"ITEARR"),s(),n("span",{class:"token operator"},"="),s(" depsMap"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),n("span",{class:"token constant"},"ITERATE_KEY"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token function"},"addEffectFn"),n("span",{class:"token punctuation"},"("),n("span",{class:"token constant"},"ITEARR"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token comment"},"// 当目标对象为数组且为新增时，收集特殊依赖（length相关）并存入桶中"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("type "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token constant"},"RECORD"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"ADD"),s(),n("span",{class:"token operator"},"&&"),s(" Array"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"isArray"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        console`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"log"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},"'01'"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
        `),n("span",{class:"token keyword"},"const"),s(" lenDeps "),n("span",{class:"token operator"},"="),s(" depsMap"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),n("span",{class:"token constant"},"ARRAY_LENGTH"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token function"},"addEffectFn"),n("span",{class:"token punctuation"},"("),s("lenDeps"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token comment"},"// 当目标对象是数组且修改了 length 长度后，循环 Map 结构，更新相关依赖"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("Array"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"isArray"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"&&"),s(" prop "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token constant"},"ARRAY_LENGTH"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        console`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"log"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},"'02'"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
        depsMap`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"forEach"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("effects"),n("span",{class:"token punctuation"},","),s(" i")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("i "),n("span",{class:"token operator"},">="),s(" nVal"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
                `),n("span",{class:"token function"},"addEffectFn"),n("span",{class:"token punctuation"},"("),s("effects"),n("span",{class:"token punctuation"},")"),s(`
            `),n("span",{class:"token punctuation"},"}"),s(`
        `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token comment"},"// 将有效的依赖收集器遍历执行"),s(`
    effectsToRun`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"forEach"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"effectFn"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`

        `),n("span",{class:"token comment"},"// 如果存在调度特性则执行回调，否则直接执行当前副作用"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("effectFn"),n("span",{class:"token punctuation"},"."),s("options"),n("span",{class:"token punctuation"},"."),s("scheduler"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            effectFn`),n("span",{class:"token punctuation"},"."),s("options"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"scheduler"),n("span",{class:"token punctuation"},"("),s("effectFn"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"else"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token function"},"effectFn"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
    `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 实现响应式逻辑"),s(`
`),n("span",{class:"token comment"},"// isShallow 是否为浅响应式 false-不是 true-是"),s(`
`),n("span",{class:"token comment"},"// isReadOnly 是否为只读 false-不是 true-是"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"createReactive"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("data"),n("span",{class:"token punctuation"},","),s(" isShallow "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token boolean"},"false"),n("span",{class:"token punctuation"},","),s(" isReadOnly "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token boolean"},"false")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token keyword"},"new"),s(),n("span",{class:"token class-name"},"Proxy"),n("span",{class:"token punctuation"},"("),s("data"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token function"},"handler"),n("span",{class:"token punctuation"},"("),s("isShallow"),n("span",{class:"token punctuation"},","),s(" isReadOnly"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 传递给外部的深响应式"),s(`
`),n("span",{class:"token comment"},"// 收集目标对象的代理响应集合"),s(`
`),n("span",{class:"token keyword"},"let"),s(" reactiveMap "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token keyword"},"new"),s(),n("span",{class:"token class-name"},"Map"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"reactive"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"data"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    
    `),n("span",{class:"token comment"},"// 如果已经存在响应代理，则直接返回"),s(`
    `),n("span",{class:"token keyword"},"const"),s(" expiredProxy "),n("span",{class:"token operator"},"="),s(" reactiveMap"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("data"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("expiredProxy"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token keyword"},"return"),s(` expiredProxy

    `),n("span",{class:"token comment"},"// 如果不存在响应代理，则创建并添加进收集器内，并返回"),s(`
    `),n("span",{class:"token keyword"},"const"),s(" proxy "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"createReactive"),n("span",{class:"token punctuation"},"("),s("data"),n("span",{class:"token punctuation"},")"),s(`
    reactiveMap`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"set"),n("span",{class:"token punctuation"},"("),s("data"),n("span",{class:"token punctuation"},","),s(" proxy"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token keyword"},"return"),s(` proxy
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 传递给外部的浅响应式"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"shallowReactive"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"data"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token function"},"createReactive"),n("span",{class:"token punctuation"},"("),s("data"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token boolean"},"true"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 传递给外部的深只读"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"readOnly"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"data"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token function"},"createReactive"),n("span",{class:"token punctuation"},"("),s("data"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token boolean"},"false"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token boolean"},"true"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 传递给外部的浅只读"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"shallowReadOnly"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"data"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token function"},"createReactive"),n("span",{class:"token punctuation"},"("),s("data"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token boolean"},"true"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token boolean"},"true"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token keyword"},"export"),s(),n("span",{class:"token punctuation"},"{"),s(`
    reactive`),n("span",{class:"token punctuation"},","),s(`
    shallowReactive`),n("span",{class:"token punctuation"},","),s(`
    readOnly`),n("span",{class:"token punctuation"},","),s(`
    shallowReadOnly`),n("span",{class:"token punctuation"},","),s(`
    effect
`),n("span",{class:"token punctuation"},"}"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),w=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" reactive "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},'"./proxy.js"'),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token comment"},"// 将原始值转为 ref 式代理响应对象"),s(`
`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token function-variable function"},"ref"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"val"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"const"),s(" wrapper "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token literal-property property"},"value"),n("span",{class:"token operator"},":"),s(` val
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token comment"},"// 添加 ref 对象标识符"),s(`
    Object`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"defineProperty"),n("span",{class:"token punctuation"},"("),s("wrapper"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token string"},"'__v_isRef'"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token literal-property property"},"value"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token boolean"},"true"),s(`
    `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`

    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token function"},"reactive"),n("span",{class:"token punctuation"},"("),s("wrapper"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 将普通对象中的属性与代理对象的属性进行关联，进而实现响应式"),s(`
`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token function-variable function"},"toRef"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("obj"),n("span",{class:"token punctuation"},","),s(" prop")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"const"),s(" wrapper "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"get"),s(),n("span",{class:"token function"},"value"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"return"),s(" obj"),n("span",{class:"token punctuation"},"["),s("prop"),n("span",{class:"token punctuation"},"]"),s(`
        `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},","),s(`
        `),n("span",{class:"token keyword"},"set"),s(),n("span",{class:"token function"},"value"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"val"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            obj`),n("span",{class:"token punctuation"},"["),s("prop"),n("span",{class:"token punctuation"},"]"),s(),n("span",{class:"token operator"},"="),s(` val
        `),n("span",{class:"token punctuation"},"}"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token comment"},"// 添加 ref 对象标识符"),s(`
    Object`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"defineProperty"),n("span",{class:"token punctuation"},"("),s("wrapper"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token string"},"'__v_isRef'"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token literal-property property"},"value"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token boolean"},"true"),s(`
    `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`

    console`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"log"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},"'wrapper'"),n("span",{class:"token punctuation"},","),s(" wrapper"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

    `),n("span",{class:"token keyword"},"return"),s(` wrapper
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 将代理对象中的所有属性映射到普通对象上，且进行关联，进而实现普通对象的响应式"),s(`
`),n("span",{class:"token comment"},"// 注意这种遍历的写法，生成的属性两者是相同的"),s(`
`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token function-variable function"},"toRefs"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"proxyObj"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"let"),s(" nObj "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),n("span",{class:"token punctuation"},"}"),s(`
    `),n("span",{class:"token keyword"},"const"),s(" props "),n("span",{class:"token operator"},"="),s(" Object"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"keys"),n("span",{class:"token punctuation"},"("),s("proxyObj"),n("span",{class:"token punctuation"},")"),s(`
    props`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"forEach"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"prop"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
        nObj`),n("span",{class:"token punctuation"},"["),s("prop"),n("span",{class:"token punctuation"},"]"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"toRef"),n("span",{class:"token punctuation"},"("),s("proxyObj"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`

    `),n("span",{class:"token keyword"},"return"),s(` nObj
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// ref 对象自动脱钩——脱离 .value 属性的访问和设置"),s(`
`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token function-variable function"},"proxyRef"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"data"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token keyword"},"new"),s(),n("span",{class:"token class-name"},"Proxy"),n("span",{class:"token punctuation"},"("),s("data"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"const"),s(" value "),n("span",{class:"token operator"},"="),s(" Reflect"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(`
            `),n("span",{class:"token keyword"},"return"),s(" value"),n("span",{class:"token punctuation"},"."),s("__v_isRef "),n("span",{class:"token operator"},"?"),s(" value"),n("span",{class:"token punctuation"},"."),s("value "),n("span",{class:"token operator"},":"),s(` value
        `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},","),s(`
        `),n("span",{class:"token function"},"set"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" nVal"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"const"),s(" value "),n("span",{class:"token operator"},"="),s(" target"),n("span",{class:"token punctuation"},"["),s("prop"),n("span",{class:"token punctuation"},"]"),s(`
            `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("value"),n("span",{class:"token punctuation"},"."),s("__v_isRef"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
                value`),n("span",{class:"token punctuation"},"."),s("value "),n("span",{class:"token operator"},"="),s(` nVal
                `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token boolean"},"true"),s(`
            `),n("span",{class:"token punctuation"},"}"),s(`
            `),n("span",{class:"token keyword"},"return"),s(" Reflect"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"set"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" nVal"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
    `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token keyword"},"export"),s(),n("span",{class:"token punctuation"},"{"),s(`
    ref`),n("span",{class:"token punctuation"},","),s(`
    toRef`),n("span",{class:"token punctuation"},","),s(`
    toRefs`),n("span",{class:"token punctuation"},","),s(`
    proxyRef
`),n("span",{class:"token punctuation"},"}"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),g=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token comment"},"// 创建当前副作用指向"),s(`
`),n("span",{class:"token keyword"},"let"),s(` activeEffect

`),n("span",{class:"token comment"},"// 创建副作用收集器"),s(`
`),n("span",{class:"token keyword"},"let"),s(" effectStack "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"["),n("span",{class:"token punctuation"},"]"),s(`

`),n("span",{class:"token comment"},"// 创建固定副作用调用钩子"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"effect"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("fn"),n("span",{class:"token punctuation"},","),s(" options "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),n("span",{class:"token punctuation"},"}")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`

    `),n("span",{class:"token comment"},"// 创建真实副作用辅助钩子——收集对应属性、对应依赖收集器等"),s(`
    `),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token function-variable function"},"effectFn"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token function"},"cleanup"),n("span",{class:"token punctuation"},"("),s("effectFn"),n("span",{class:"token punctuation"},")"),s(`

        `),n("span",{class:"token comment"},"// 当前副作用函数指向 effectFn"),s(`
        activeEffect `),n("span",{class:"token operator"},"="),s(` effectFn

        `),n("span",{class:"token comment"},"// 当前副作用存入副作用收集器中——压栈"),s(`
        effectStack`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"push"),n("span",{class:"token punctuation"},"("),s("activeEffect"),n("span",{class:"token punctuation"},")"),s(`

        `),n("span",{class:"token comment"},"// 执行真实副作用并存入结果"),s(`
        `),n("span",{class:"token keyword"},"const"),s(" fnRes "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"fn"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(`

        `),n("span",{class:"token comment"},"// 当前副作用执行完毕后弹出副作用收集器——弹栈"),s(`
        effectStack`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"pop"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(`

        `),n("span",{class:"token comment"},"// 当前副作用指向栈顶副作用——存储器中最后一值"),s(`
        activeEffect `),n("span",{class:"token operator"},"="),s(" effectStack"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"at"),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"-"),n("span",{class:"token number"},"1"),n("span",{class:"token punctuation"},")"),s(`

        `),n("span",{class:"token comment"},"// 返回真实副作用结果"),s(`
        `),n("span",{class:"token keyword"},"return"),s(` fnRes
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token comment"},"// 收集属性"),s(`
    effectFn`),n("span",{class:"token punctuation"},"."),s("options "),n("span",{class:"token operator"},"="),s(` options

    `),n("span",{class:"token comment"},"// 建立依赖收集器存储桶——存储依赖集合"),s(`
    effectFn`),n("span",{class:"token punctuation"},"."),s("deps "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"["),n("span",{class:"token punctuation"},"]"),s(`

    `),n("span",{class:"token comment"},"// 非懒运行时直接执行"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"!"),s("options"),n("span",{class:"token punctuation"},"."),s("lazy"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token function"},"effectFn"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`

    `),n("span",{class:"token comment"},"// 其他情况返回辅助钩子"),s(`
    `),n("span",{class:"token keyword"},"return"),s(` effectFn
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 清除当前辅助钩子上所有依赖收集器"),s(`
`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token function-variable function"},"cleanup"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"effectFn"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"for"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"let"),s(" i "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token number"},"0"),n("span",{class:"token punctuation"},";"),s(" i "),n("span",{class:"token operator"},"<"),s(" effectFn"),n("span",{class:"token punctuation"},"."),s("deps"),n("span",{class:"token punctuation"},"."),s("length"),n("span",{class:"token punctuation"},";"),s(" i"),n("span",{class:"token operator"},"++"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"const"),s(" deps "),n("span",{class:"token operator"},"="),s(" effectFn"),n("span",{class:"token punctuation"},"."),s("deps"),n("span",{class:"token punctuation"},"["),s("i"),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},";"),s(`
        deps`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"delete"),n("span",{class:"token punctuation"},"("),s("effectFn"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`
    effectFn`),n("span",{class:"token punctuation"},"."),s("deps"),n("span",{class:"token punctuation"},"."),s("length "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token number"},"0"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token keyword"},"export"),s(),n("span",{class:"token punctuation"},"{"),s(`
    activeEffect`),n("span",{class:"token punctuation"},","),s(`
    effect
`),n("span",{class:"token punctuation"},"}"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),R=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token comment"},"// 重写数组的读取方法"),s(`
`),n("span",{class:"token keyword"},"const"),s(" rewriteArrReadRecordMap "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"["),n("span",{class:"token string"},"'includes'"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token string"},"'indexOf'"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token string"},"'lastIndexOf'"),n("span",{class:"token punctuation"},"]"),s(`
`),n("span",{class:"token keyword"},"const"),s(" rewriteArrReadRecord "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),n("span",{class:"token punctuation"},"}"),s(`
rewriteArrReadRecordMap`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"forEach"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"method"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"const"),s(" origanMethod "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token class-name"},"Array"),n("span",{class:"token punctuation"},"."),s("prototype"),n("span",{class:"token punctuation"},"["),s("method"),n("span",{class:"token punctuation"},"]"),s(`
    rewriteArrReadRecord`),n("span",{class:"token punctuation"},"["),s("method"),n("span",{class:"token punctuation"},"]"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token keyword"},"function"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[n("span",{class:"token operator"},"..."),s("args")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"let"),s(" res "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"origanMethod"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"apply"),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"this"),n("span",{class:"token punctuation"},","),s(" args"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"!"),s("res"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            res `),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"origanMethod"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"apply"),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"this"),n("span",{class:"token punctuation"},"."),s("raw"),n("span",{class:"token punctuation"},","),s(" args"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
        
        `),n("span",{class:"token keyword"},"return"),s(` res
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`

`),n("span",{class:"token comment"},"// 重写数组的修改方法"),s(`
`),n("span",{class:"token keyword"},"let"),s(" blockTrack "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token boolean"},"false"),s(`
`),n("span",{class:"token keyword"},"const"),s(" rewriteArrWriteRecordMap "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"["),n("span",{class:"token string"},"'push'"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token string"},"'pop'"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token string"},"'shift'"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token string"},"'unshift'"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token string"},"'splice'"),n("span",{class:"token punctuation"},"]"),s(`
`),n("span",{class:"token keyword"},"const"),s(" rewriteArrWriteRecord "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),n("span",{class:"token punctuation"},"}"),s(`
rewriteArrWriteRecordMap`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"forEach"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"method"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"const"),s(" origanMethod "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token class-name"},"Array"),n("span",{class:"token punctuation"},"."),s("prototype"),n("span",{class:"token punctuation"},"["),s("method"),n("span",{class:"token punctuation"},"]"),s(`
    rewriteArrWriteRecord`),n("span",{class:"token punctuation"},"["),s("method"),n("span",{class:"token punctuation"},"]"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token keyword"},"function"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[n("span",{class:"token operator"},"..."),s("args")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        blockTrack `),n("span",{class:"token operator"},"="),s(),n("span",{class:"token boolean"},"true"),s(`
        `),n("span",{class:"token keyword"},"const"),s(" res "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"origanMethod"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"apply"),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"this"),n("span",{class:"token punctuation"},","),s(" args"),n("span",{class:"token punctuation"},")"),s(`
        blockTrack `),n("span",{class:"token operator"},"="),s(),n("span",{class:"token boolean"},"false"),s(`
        `),n("span",{class:"token keyword"},"return"),s(` res
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`

`),n("span",{class:"token keyword"},"export"),s(),n("span",{class:"token punctuation"},"{"),s(`
    rewriteArrReadRecord`),n("span",{class:"token punctuation"},","),s(`
    blockTrack`),n("span",{class:"token punctuation"},","),s(`
    rewriteArrWriteRecord
`),n("span",{class:"token punctuation"},"}"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),j=p(`<p>最后，我们发现，ref 响应对象的出现填补了非响应式对象的空白，实现了原始值的代理响应，解决了代理对象使用展开运算符后的失去响应式问题，且实现了普通对象关联代理对象进而实现响应式的问题。最后，又通过 proxyRef 解决了取值赋值都要使用 .value 的问题。</p><p>至这里，我们已经实现了小型的 proxy 响应式系统，为了方便使用，减少 copy 成本，将这部分代码实现了插件化，可持续享用。</p><p>安装方式：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>npm i <span class="token operator">-</span><span class="token constant">D</span> @zxn2889<span class="token operator">/</span>achieve<span class="token operator">-</span>proxy
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>or (推荐)</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>pnpm add <span class="token operator">-</span><span class="token constant">D</span> @zxn2889<span class="token operator">/</span>achieve<span class="token operator">-</span>proxy
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,6);function h(_,O){const e=o("CodeGroupItem"),l=o("CodeGroup");return i(),r("div",null,[b,a(l,null,{default:t(()=>[a(e,{title:"index.js"},{default:t(()=>[f]),_:1}),a(e,{title:"proxy.js"},{default:t(()=>[y]),_:1}),a(e,{title:"origanProxy.js"},{default:t(()=>[w]),_:1}),a(e,{title:"effect.js"},{default:t(()=>[g]),_:1}),a(e,{title:"rewriteArray.js"},{default:t(()=>[R]),_:1})]),_:1}),j])}const E=u(m,[["render",h],["__file","achieveOriganValueProxy.html.vue"]]);export{E as default};
