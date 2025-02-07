import { defineConfig } from 'vitepress'
import nav from './nav'
import sidebar from './sidebar'

export default defineConfig({
    base: '/record-moments/',
    lang: 'zh-CN',
    title: '火箭吧！',
    description: '越记录，越美好！',
    cleanUrls: true,
    metaChunk: true,
    lastUpdated: true,
    markdown: {
        lineNumbers: true
    },
    head: [
        ['link', { rel: 'icon', type: 'image/png', href: '/record-moments/img/logo-mini.png' }],
        ['link', { rel: 'apple-touch-icon', href: '/record-moments/img/logo.png' }],
        ['meta', { name: 'theme-color', content: '#3eaf7c' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:locale', content: 'en' }],
        ['meta', { property: 'og:title', content: '火箭吧 | 一个记录美好生活的网站' }],
        ['meta', { property: 'og:site_name', content: '火箭吧' }],
        ['meta', { property: 'og:url', content: 'https://vitepress.dev/' }],
    ],
    themeConfig: {
        logo: '/img/logo-mini.png',
        socialLinks: [
            { icon: 'github', link: 'https://github.com/zxn2889/record-moments' },
        ],
        carbonAds: { code: 'CEBDT27Y', placement: 'vuejsorg' },
        editLink: {
            pattern: 'https://github.com/zxn2889/record-moments/tree/main/docs/:path',
            text: '在 GitHub 上编辑此页面'
        },
        footer: {
            message: '基于 ISC 许可发布',
            copyright: `版权所有 © 2023-${new Date().getFullYear()} Spade A`
        },
        docFooter: {
            prev: '上一页',
            next: '下一页'
        },
        outline: {
            label: '页面导航',
            level: [2, 5]
        },
        lastUpdated: {
            text: '最后更新于',
            formatOptions: {
              dateStyle: 'short',
              timeStyle: 'medium'
            }
        },
        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '主题',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
        nav: nav(),
        sidebar: sidebar()
    },
})



