interface routeItem {
    text: string,
    link: string
}

const sidebar: Array<routeItem> = [
    {
        text: '响应式实现过程',
        link: '/vue/proxyAchieve.md'
    },
    {
        text: 'effect嵌套实现过程',
        link: '/vue/effectNest.md'
    },
    {
        text: '避免无限递归',
        link: '/vue/solvingInfiniteRecursion.md'
    },
    {
        text: '调度执行',
        link: '/vue/schedulingExecution.md'
    },
    {
        text: '实现 computed',
        link: '/vue/achieveComputed.md'
    },
    {
        text: '实现 watch',
        link: '/vue/achieveWatch.md'
    },
    {
        text: '实现 watch 函数的立即执行与回调的调度执行',
        link: '/vue/achieveWatchSomeOptions.md'
    },
    {
        text: '过期的副作用',
        link: '/vue/expiredSideEffects.md'
    }
]

export default sidebar