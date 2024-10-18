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
            link: '/vue/4-第四章/proxyAchieve',
            activeMatch: '/vue/'
        }
    ]
}