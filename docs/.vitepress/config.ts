import { defineConfig } from 'vitepress'
import sidebar from './sidebar'

export default defineConfig({
    base: '/record-moments/',
    lang: 'zh-CN',
    title: '火箭吧！',
    description: 'The more recorded, the better.',
    cleanUrls: true,
    metaChunk: true,
    lastUpdated: true,
    markdown: {
        lineNumbers: true
    },
    head: [
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/record-moments/img/vitepress-logo-mini.svg' }],
        ['link', { rel: 'icon', type: 'image/png', href: '/record-moments/img/vitepress-logo-mini.png' }],
        ['link', { rel: 'mask-icon', color: '#3eaf7c', href: '/record-moments/img/vitepress-logo.svg' }],
        ['link', { rel: 'apple-touch-icon', href: '/record-moments/img/vitepress-logo.png' }],
        ['meta', { name: 'theme-color', content: '#3eaf7c' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:locale', content: 'en' }],
        ['meta', { property: 'og:title', content: '火箭吧 | 一个记录美好生活的网站' }],
        ['meta', { property: 'og:site_name', content: '火箭吧' }],
        ['meta', { property: 'og:image', content: 'https://vitepress.dev/vitepress-og.jpg' }],
        ['meta', { property: 'og:url', content: 'https://vitepress.dev/' }],
    ],
    themeConfig: {
        logo: '/img/vitepress-logo-mini.svg',
        socialLinks: [
            { icon: 'github', link: 'https://zxn2889.github.io/record-moments/' },
        ],
        carbonAds: { code: 'CEBDT27Y', placement: 'vuejsorg' },
        sidebar,
    },
    rewrites: {
        'vue/:chapter/:page': ':chapter/:page',
    }
})
