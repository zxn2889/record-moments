import { type DefaultTheme } from 'vitepress'

const chapterIV: DefaultTheme.SidebarItem[] = [
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

const chapterV: DefaultTheme.SidebarItem[] = [
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

const chapterVI: DefaultTheme.SidebarItem[] = [
    {
        text: '原始值的响应方案',
        link: '/vue/chapter-6/achieveOriganValueProxy.md'
    }
]

const chapterVII: DefaultTheme.SidebarItem[] = [
    {
        text: '渲染器的设计',
        link: '/vue/chapter-7/designRenderer.md'
    }
]

const chapterVIII: DefaultTheme.SidebarItem[] = [
    {
        text: '子节点和 props 属性的挂载',
        link: '/vue/chapter-8/mountChildVnodeAndProps.md'
    },
    {
        text: '卸载节点的几种情况',
        link: '/vue/chapter-8/unmountVnode.md'
    },
    {
        text: '如何挂载事件',
        link: '/vue/chapter-8/mountEvent.md'
    },
    {
        text: '更新子节点',
        link: '/vue/chapter-8/updateChildVnode.md'
    },
    {
        text: '认识其他的 vnode 类型',
        link: '/vue/chapter-8/vnodeTypes.md'
    }
]

const chapterIX: DefaultTheme.SidebarItem[] = [
    {
        text: '初识 diff',
        link: '/vue/chapter-9/firstMeetDiff.md'
    }
]

const chapterX: DefaultTheme.SidebarItem[] = [
    {
        text: '双端比较 diff',
        link: '/vue/chapter-10/doubleEndDiff.md'
    }
]

const chapterXI: DefaultTheme.SidebarItem[] = [
    {
        text: '快速 diff',
        link: '/vue/chapter-11/quickDiff.md'
    }
]

const chapterXII: DefaultTheme.SidebarItem[] = [
    {
        text: '组件的挂载与更新',
        link: '/vue/chapter-12/achieveAssemblyMountedAndUpdate.md'
    },
    {
        text: '实现 setup',
        link: '/vue/chapter-12/achieveAssemblySetup.md'
    },
    {
        text: '实现 emit',
        link: '/vue/chapter-12/achieveAssemblyEmit.md'
    },
    {
        text: '实现 slots',
        link: '/vue/chapter-12/achieveAssemblySlots.md'
    },
    {
        text: '实现生命周期',
        link: '/vue/chapter-12/achieveAssemblyMounted.md'
    }
]

const chapterXIII: DefaultTheme.SidebarItem[] = [
    {
        text: '函数式组件',
        link: '/vue/chapter-13/achieveAssemblyFun.md'
    }
]

const chapterXIV: DefaultTheme.SidebarItem[] = [
    {
        text: 'keep-alive',
        link: '/vue/chapter-14/achieveKeepAlive.md'
    }
]

const chapterXV: DefaultTheme.SidebarItem[] = [
    {
        text: '实现 tokens',
        link: '/vue/chapter-15/achieveTokens.md'
    },
    {
        text: '实现 parser',
        link: '/vue/chapter-15/achieveParser.md'
    },
    {
        text: 'parser 优化',
        link: '/vue/chapter-15/parserOptimize.md'
    },
    {
        text: '实现转换器',
        link: '/vue/chapter-15/achieveTransformer.md'
    },
    {
        text: '实现生成器',
        link: '/vue/chapter-15/achieveGenerator.md'
    }
]

function sidebarVue(): DefaultTheme.SidebarItem[] {
    return [
        {
            text: '第四章',
            collapsed: false,
            items: [...chapterIV]
        },
        {
            text: '第五章',
            collapsed: false,
            items: [...chapterV]
        },
        {
            text: '第六章',
            collapsed: false,
            items: [...chapterVI]
        },
        {
            text: '第七章',
            collapsed: false,
            items: [...chapterVII]
        },
        {
            text: '第八章',
            collapsed: false,
            items: [...chapterVIII]
        },
        {
            text: '第九章',
            collapsed: false,
            items: [...chapterIX]
        },
        {
            text: '第十章',
            collapsed: false,
            items: [...chapterX]
        },
        {
            text: '第十一章',
            collapsed: false,
            items: [...chapterXI]
        },
        {
            text: '第十二章',
            collapsed: false,
            items: [...chapterXII]
        },
        {
            text: '第十三章',
            collapsed: false,
            items: [...chapterXIII]
        },
        {
            text: '第十四章',
            collapsed: false,
            items: [...chapterXIV]
        },
        {
            text: '第十五章',
            collapsed: false,
            items: [...chapterXV]
        }
    ]
}

export default sidebarVue