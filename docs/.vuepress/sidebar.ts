interface routeItem {
    text: string,
    link: string
}

const chapterIV: Array<routeItem> = [
    {
        text: '响应式实现过程',
        link: '/vue/chapter-4/proxyAchieve.md'
    },
    {
        text: 'effect嵌套实现过程',
        link: '/vue/chapter-4/effectNest.md'
    },
    {
        text: '避免无限递归',
        link: '/vue/chapter-4/solvingInfiniteRecursion.md'
    },
    {
        text: '调度执行',
        link: '/vue/chapter-4/schedulingExecution.md'
    },
    {
        text: '实现 computed',
        link: '/vue/chapter-4/achieveComputed.md'
    },
    {
        text: '实现 watch',
        link: '/vue/chapter-4/achieveWatch.md'
    },
    {
        text: '实现 watch 函数的立即执行与回调的调度执行',
        link: '/vue/chapter-4/achieveWatchSomeOptions.md'
    },
    {
        text: '过期的副作用',
        link: '/vue/chapter-4/expiredSideEffects.md'
    }
]

const chapterV: Array<routeItem> = [
    {
        text: '更近一步的 Proxy',
        link: '/vue/chapter-5/furtherAgency.md'
    },
    {
        text: '合理的触发响应',
        link: '/vue/chapter-5/reasonableTriggeringResponse.md'
    },
    {
        text: '浅响应与深响应',
        link: '/vue/chapter-5/shallowOrDeepResponse.md'
    },
    {
        text: '只读与浅只读',
        link: '/vue/chapter-5/shallowOrDeepReadOnly.md'
    },
    {
        text: '数组的代理',
        link: '/vue/chapter-5/achieveArrayProxy.md'
    }
]

const chapterVI: Array<routeItem> = [
    {
        text: '原始值的响应方案',
        link: '/vue/chapter-6/achieveOriganValueProxy.md'
    }
]

const chapterVII: Array<routeItem> = [
    {
        text: '渲染器的设计',
        link: '/vue/chapter-7/designRenderer.md'
    }
]

const chapterVIII: Array<routeItem> = [
    {
        text: '子节点和 props 属性的挂载',
        link: '/vue/chapter-8/mountChildVnodeAndProps.md'
    }
]

const sidebar: Array<routeItem> = [
    ...chapterIV,
    ...chapterV,
    ...chapterVI,
    ...chapterVII,
    ...chapterVIII
]

export default sidebar