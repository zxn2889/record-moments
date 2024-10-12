import { type DefaultTheme } from 'vitepress'

function sidebarGuide(): DefaultTheme.SidebarItem[] {
    return [
        {
            text: '指南',
            collapsed: false,
            items: 
            [
                { text: '实现 .husky', link: '/guide/husky' },
                { text: 'Github Action', link: '/guide/githubAction' }
            ]
        }
    ]
}

export default sidebarGuide