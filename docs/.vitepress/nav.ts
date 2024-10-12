import { type DefaultTheme } from 'vitepress'

export default function nav(): DefaultTheme.NavItem[] {
    return [
        {
            text: '指南',
            link: '/guide/husky',
            activeMatch: '/guide/'
        },
        {
            text: 'VUE原理',
            link: '/vue/chapter-4/proxyAchieve',
            activeMatch: '/vue/'
        }
    ]
}