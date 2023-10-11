import{_ as l,r as o,o as p,c as u,e as a,w as t,a as n,b as s}from"./app-13115eff.js";const i="/record-moments/img/32.png",k={},r=n("p",null,"朋友们，上节我们学习了如何实现深响应和浅响应，这节我们学习如何实现只读和浅只读。",-1),d=n("p",null,"在此之前，先优化了代码，如下：",-1),m=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" activeEffect"),n("span",{class:"token punctuation"},","),s(" effect "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},"'./effect.js'"),s(`

`),n("span",{class:"token keyword"},"let"),s(" bucket "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token keyword"},"new"),s(),n("span",{class:"token class-name"},"WeakMap"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token keyword"},"let"),s(),n("span",{class:"token constant"},"ITERATE_KEY"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"Symbol"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(`

`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token constant"},"RECORD"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token constant"},"ADD"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'ADD'"),n("span",{class:"token punctuation"},","),s(`
    `),n("span",{class:"token constant"},"SET"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'SET'"),n("span",{class:"token punctuation"},","),s(`
    `),n("span",{class:"token constant"},"DEL"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'DEL'"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token constant"},"RECEIVER_TARGET"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token string"},"'raw'"),s(`

`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token function-variable function"},"handler"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("isShallow "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token boolean"},"true")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token comment"},"// 将 receiver.raw 指向目标对象"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("prop "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token constant"},"RECEIVER_TARGET"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"return"),s(` target
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token comment"},"// 跟踪依赖"),s(`
        `),n("span",{class:"token function"},"track"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},")"),s(`

        `),n("span",{class:"token keyword"},"const"),s(" res "),n("span",{class:"token operator"},"="),s(" Reflect"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(`

        `),n("span",{class:"token comment"},"// 浅响应时阻断递归，直接返回当前响应对象"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("isShallow"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"return"),s(` res
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token comment"},"// 当前对象类型为 object，且不为空时递归建立深响应"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"typeof"),s(" res "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token string"},"'object'"),s(),n("span",{class:"token operator"},"&&"),s(" res "),n("span",{class:"token operator"},"!=="),s(),n("span",{class:"token keyword"},"null"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token function"},"createReactive"),n("span",{class:"token punctuation"},"("),s("res"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token comment"},"// 其他情况直接 return res"),s(`
        `),n("span",{class:"token keyword"},"return"),s(` res
    `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},","),s(`
    `),n("span",{class:"token function"},"set"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" nVal"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"const"),s(" oVal "),n("span",{class:"token operator"},"="),s(" target"),n("span",{class:"token punctuation"},"["),s("prop"),n("span",{class:"token punctuation"},"]"),s(`

        `),n("span",{class:"token comment"},"// 判断当前操作类型"),s(`
        `),n("span",{class:"token keyword"},"const"),s(" type "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token class-name"},"Object"),n("span",{class:"token punctuation"},"."),s("prototype"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"hasOwnProperty"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"call"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"?"),s(),n("span",{class:"token constant"},"RECORD"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"SET"),s(),n("span",{class:"token operator"},":"),s(),n("span",{class:"token constant"},"RECORD"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"ADD"),s(`

        `),n("span",{class:"token keyword"},"const"),s(" res "),n("span",{class:"token operator"},"="),s(" Reflect"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"set"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" nVal"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(`

        `),n("span",{class:"token comment"},"// 判断目标对象和 receiver.raw 代理对象是否相同"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("target "),n("span",{class:"token operator"},"==="),s(" receiver"),n("span",{class:"token punctuation"},"["),n("span",{class:"token constant"},"RECEIVER_TARGET"),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`

            `),n("span",{class:"token comment"},"// 判断新/旧值是否不等，且其中任一值不为 NaN 是触发更新"),s(`
            `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("oVal "),n("span",{class:"token operator"},"!=="),s(" nVal "),n("span",{class:"token operator"},"&&"),s(),n("span",{class:"token punctuation"},"("),s("oVal "),n("span",{class:"token operator"},"==="),s(" oVal "),n("span",{class:"token operator"},"||"),s(" nVal "),n("span",{class:"token operator"},"==="),s(" nVal"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
                `),n("span",{class:"token function"},"trigger"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" type"),n("span",{class:"token punctuation"},")"),s(`
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
        `),n("span",{class:"token comment"},"// 追踪自身新增属性，因无法读取 key 值，所以用唯一值 Symbol 替代，set 中针对此情况特殊处理"),s(`
        `),n("span",{class:"token function"},"track"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token constant"},"ITERATE_KEY"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token keyword"},"return"),s(" Reflect"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"ownKeys"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`

`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token function-variable function"},"track"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("target"),n("span",{class:"token punctuation"},","),s(" prop")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token comment"},"// 当前无副作用时，直接返回"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"!"),s("activeEffect"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token keyword"},"return"),s(" target"),n("span",{class:"token punctuation"},"["),s("prop"),n("span",{class:"token punctuation"},"]"),s(`

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

`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token function-variable function"},"trigger"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" type")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token comment"},"// 获取目标对象 Map 集合"),s(`
    `),n("span",{class:"token keyword"},"const"),s(" depsMap "),n("span",{class:"token operator"},"="),s(" bucket"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"!"),s("depsMap"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token keyword"},"return"),s(`

    `),n("span",{class:"token comment"},"// 获取目标属性 Set 集合——依赖收集器"),s(`
    `),n("span",{class:"token keyword"},"const"),s(" deps "),n("span",{class:"token operator"},"="),s(" depsMap"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("prop"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token constant"},"ITEARR"),s(),n("span",{class:"token operator"},"="),s(" depsMap"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),n("span",{class:"token constant"},"ITERATE_KEY"),n("span",{class:"token punctuation"},")"),s(`

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

    `),n("span",{class:"token comment"},"// 稀有操作类型时，收集特殊依赖并存入桶中"),s(`
    `),n("span",{class:"token comment"},"// 注意 DEL 会触发 ownKeys"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("type "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token constant"},"RECORD"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"ADD"),s(),n("span",{class:"token operator"},"||"),s(" type "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token constant"},"RECORD"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"DEL"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token function"},"addEffectFn"),n("span",{class:"token punctuation"},"("),n("span",{class:"token constant"},"ITEARR"),n("span",{class:"token punctuation"},")"),s(`
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
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"createReactive"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("data"),n("span",{class:"token punctuation"},","),s(" isShallow "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token boolean"},"true")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token keyword"},"new"),s(),n("span",{class:"token class-name"},"Proxy"),n("span",{class:"token punctuation"},"("),s("data"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token function"},"handler"),n("span",{class:"token punctuation"},"("),s("isShallow"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 传递给外部的深响应式"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"reactive"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"data"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token function"},"createReactive"),n("span",{class:"token punctuation"},"("),s("data"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"// 传递给外部的浅响应式"),s(`
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"shallowReactive"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"data"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token function"},"createReactive"),n("span",{class:"token punctuation"},"("),s("data"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token boolean"},"false"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token keyword"},"export"),s(),n("span",{class:"token punctuation"},"{"),s(`
    reactive`),n("span",{class:"token punctuation"},","),s(`
    shallowReactive`),n("span",{class:"token punctuation"},","),s(`
    effect
`),n("span",{class:"token punctuation"},"}"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),v=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token comment"},"// 创建当前副作用指向"),s(`
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
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),b=n("p",null,"首先，我们分析一下需求——只读。那只读的目的是什么？只读不改。好，那所有的增删改查动作都要进行判断，并且不需要再进行更新和追踪依赖操作。但是，我们要让用户有感知，知道目前的操作是不合规的，所以要进行提示。代码如下：",-1),f=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" reactive"),n("span",{class:"token punctuation"},","),s(" shallowReactive"),n("span",{class:"token punctuation"},","),s(" readOnly"),n("span",{class:"token punctuation"},","),s(" shallowReadOnly"),n("span",{class:"token punctuation"},","),s(" effect "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},"'./proxy.js'"),s(`

`),n("span",{class:"token comment"},"// 响应式的基本实现"),s(`
`),n("span",{class:"token keyword"},"const"),s(" data "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),s(),n("span",{class:"token literal-property property"},"foo"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token number"},"1"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token literal-property property"},"bar"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token punctuation"},"{"),s(),n("span",{class:"token literal-property property"},"cat"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'小黑'"),s(),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token keyword"},"const"),s(" p "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"shallowReadOnly"),n("span",{class:"token punctuation"},"("),s("data"),n("span",{class:"token punctuation"},")"),s(`

`),n("span",{class:"token function"},"effect"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
    console`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"log"),n("span",{class:"token punctuation"},"("),s("p"),n("span",{class:"token punctuation"},"."),s("bar"),n("span",{class:"token punctuation"},"."),s("cat"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
    console`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"log"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},"'-----------'"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`

`),n("span",{class:"token comment"},"// p.bar.cat = '小黑战纪'"),s(`
`),n("span",{class:"token comment"},"// p.foo++"),s(`
`),n("span",{class:"token keyword"},"delete"),s(" p"),n("span",{class:"token punctuation"},"."),s(`foo
`),n("span",{class:"token comment"},"// p.banana = '香蕉'"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),y=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" activeEffect"),n("span",{class:"token punctuation"},","),s(" effect "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},"'./effect.js'"),s(`

`),n("span",{class:"token keyword"},"let"),s(" bucket "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token keyword"},"new"),s(),n("span",{class:"token class-name"},"WeakMap"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token keyword"},"let"),s(),n("span",{class:"token constant"},"ITERATE_KEY"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"Symbol"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(`

`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token constant"},"RECORD"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token constant"},"ADD"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'ADD'"),n("span",{class:"token punctuation"},","),s(`
    `),n("span",{class:"token constant"},"SET"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'SET'"),n("span",{class:"token punctuation"},","),s(`
    `),n("span",{class:"token constant"},"DEL"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},"'DEL'"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token constant"},"RECEIVER_TARGET"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token string"},"'raw'"),s(`

`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token function-variable function"},"handler"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("isShallow "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token boolean"},"false"),n("span",{class:"token punctuation"},","),s(" isReadOnly "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token boolean"},"false")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token comment"},"// 将 receiver.raw 指向目标对象"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("prop "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token constant"},"RECEIVER_TARGET"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"return"),s(` target
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token comment"},"// 跟踪依赖"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"!"),s("isReadOnly"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token function"},"track"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token keyword"},"const"),s(" res "),n("span",{class:"token operator"},"="),s(" Reflect"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(`

        `),n("span",{class:"token comment"},"// 浅响应时阻断递归，直接返回当前响应对象"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("isShallow"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"return"),s(` res
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token comment"},"// 当前对象类型为 object，且不为空时递归建立深响应"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token keyword"},"typeof"),s(" res "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token string"},"'object'"),s(),n("span",{class:"token operator"},"&&"),s(" res "),n("span",{class:"token operator"},"!=="),s(),n("span",{class:"token keyword"},"null"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token operator"},"!"),s("isReadOnly "),n("span",{class:"token operator"},"?"),s(),n("span",{class:"token function"},"reactive"),n("span",{class:"token punctuation"},"("),s("res"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},":"),s(),n("span",{class:"token function"},"readOnly"),n("span",{class:"token punctuation"},"("),s("res"),n("span",{class:"token punctuation"},","),s(" isShallow"),n("span",{class:"token punctuation"},","),s(" isReadOnly"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token comment"},"// 其他情况直接 return res"),s(`
        `),n("span",{class:"token keyword"},"return"),s(` res
    `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},","),s(`
    `),n("span",{class:"token function"},"set"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" nVal"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("isReadOnly"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
            console`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"warn"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},"'当前为只读对象，不可编辑！'"),n("span",{class:"token punctuation"},")"),s(`
            `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token boolean"},"false"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`

        `),n("span",{class:"token keyword"},"const"),s(" oVal "),n("span",{class:"token operator"},"="),s(" target"),n("span",{class:"token punctuation"},"["),s("prop"),n("span",{class:"token punctuation"},"]"),s(`

        `),n("span",{class:"token comment"},"// 判断当前操作类型"),s(`
        `),n("span",{class:"token keyword"},"const"),s(" type "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token class-name"},"Object"),n("span",{class:"token punctuation"},"."),s("prototype"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"hasOwnProperty"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"call"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"?"),s(),n("span",{class:"token constant"},"RECORD"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"SET"),s(),n("span",{class:"token operator"},":"),s(),n("span",{class:"token constant"},"RECORD"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"ADD"),s(`

        `),n("span",{class:"token keyword"},"const"),s(" res "),n("span",{class:"token operator"},"="),s(" Reflect"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"set"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" nVal"),n("span",{class:"token punctuation"},","),s(" receiver"),n("span",{class:"token punctuation"},")"),s(`

        `),n("span",{class:"token comment"},"// 判断目标对象和 receiver.raw 代理对象是否相同"),s(`
        `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("target "),n("span",{class:"token operator"},"==="),s(" receiver"),n("span",{class:"token punctuation"},"["),n("span",{class:"token constant"},"RECEIVER_TARGET"),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`

            `),n("span",{class:"token comment"},"// 判断新/旧值是否不等，且其中任一值不为 NaN 是触发更新"),s(`
            `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("oVal "),n("span",{class:"token operator"},"!=="),s(" nVal "),n("span",{class:"token operator"},"&&"),s(),n("span",{class:"token punctuation"},"("),s("oVal "),n("span",{class:"token operator"},"==="),s(" oVal "),n("span",{class:"token operator"},"||"),s(" nVal "),n("span",{class:"token operator"},"==="),s(" nVal"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
                `),n("span",{class:"token function"},"trigger"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" type"),n("span",{class:"token punctuation"},")"),s(`
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
        `),n("span",{class:"token comment"},"// 追踪自身新增属性，因无法读取 key 值，所以用唯一值 Symbol 替代，set 中针对此情况特殊处理"),s(`
        `),n("span",{class:"token function"},"track"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token constant"},"ITERATE_KEY"),n("span",{class:"token punctuation"},")"),s(`
        `),n("span",{class:"token keyword"},"return"),s(" Reflect"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"ownKeys"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`

`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token function-variable function"},"track"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("target"),n("span",{class:"token punctuation"},","),s(" prop")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token comment"},"// 当前无副作用时，直接返回"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"!"),s("activeEffect"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token keyword"},"return"),s(" target"),n("span",{class:"token punctuation"},"["),s("prop"),n("span",{class:"token punctuation"},"]"),s(`

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

`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token function-variable function"},"trigger"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},[s("target"),n("span",{class:"token punctuation"},","),s(" prop"),n("span",{class:"token punctuation"},","),s(" type")]),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token comment"},"// 获取目标对象 Map 集合"),s(`
    `),n("span",{class:"token keyword"},"const"),s(" depsMap "),n("span",{class:"token operator"},"="),s(" bucket"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("target"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token operator"},"!"),s("depsMap"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token keyword"},"return"),s(`

    `),n("span",{class:"token comment"},"// 获取目标属性 Set 集合——依赖收集器"),s(`
    `),n("span",{class:"token keyword"},"const"),s(" deps "),n("span",{class:"token operator"},"="),s(" depsMap"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),s("prop"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token constant"},"ITEARR"),s(),n("span",{class:"token operator"},"="),s(" depsMap"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"get"),n("span",{class:"token punctuation"},"("),n("span",{class:"token constant"},"ITERATE_KEY"),n("span",{class:"token punctuation"},")"),s(`

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

    `),n("span",{class:"token comment"},"// 稀有操作类型时，收集特殊依赖并存入桶中"),s(`
    `),n("span",{class:"token comment"},"// 注意 DEL 会触发 ownKeys"),s(`
    `),n("span",{class:"token keyword"},"if"),s(),n("span",{class:"token punctuation"},"("),s("type "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token constant"},"RECORD"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"ADD"),s(),n("span",{class:"token operator"},"||"),s(" type "),n("span",{class:"token operator"},"==="),s(),n("span",{class:"token constant"},"RECORD"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"DEL"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
        `),n("span",{class:"token function"},"addEffectFn"),n("span",{class:"token punctuation"},"("),n("span",{class:"token constant"},"ITEARR"),n("span",{class:"token punctuation"},")"),s(`
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
`),n("span",{class:"token keyword"},"function"),s(),n("span",{class:"token function"},"reactive"),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"data"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token keyword"},"return"),s(),n("span",{class:"token function"},"createReactive"),n("span",{class:"token punctuation"},"("),s("data"),n("span",{class:"token punctuation"},")"),s(`
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
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),w=n("p",null,[n("img",{src:i,alt:"图片"})],-1),g=n("p",null,"从结果上得知，想要的效果也都实现了。",-1),R=n("div",{class:"custom-container tip"},[n("p",{class:"custom-container-title"},"TIP"),n("p",null,"注意这里将 isShallow 的默认值改为了 false，所以逻辑上有对应的变更。另外，也可以通过控制 return 返回的布尔值类型控制飘红提示。")],-1);function E(h,_){const e=o("CodeGroupItem"),c=o("CodeGroup");return p(),u("div",null,[r,d,a(c,null,{default:t(()=>[a(e,{title:"proxy.js"},{default:t(()=>[m]),_:1}),a(e,{title:"effect.js"},{default:t(()=>[v]),_:1})]),_:1}),b,a(c,null,{default:t(()=>[a(e,{title:"index.js"},{default:t(()=>[f]),_:1}),a(e,{title:"proxy.js"},{default:t(()=>[y]),_:1})]),_:1}),w,g,R])}const O=l(k,[["render",E],["__file","shallowOrDeepReadOnly.html.vue"]]);export{O as default};
