import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { backToTopPlugin } from '@vuepress/plugin-back-to-top'

export default defineUserConfig({
    lang: 'zh-CN',
    title: '你好，生活！',
    description: '这是我的第一个 VuePress 站点',
    plugins: [backToTopPlugin()],
    // charset: 'utf-8',
    theme: defaultTheme({
        sidebar: [
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
            }
        ]
    })
})