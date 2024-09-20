import { defineConfig } from 'vitepress'
import sidebar from './sidebar'

export default defineConfig({
    base: '/record-moments/',
    lang: 'zh-CN',
    title: '火箭吧！',
    description: 'The more recorded, the better.',
    markdown: {
        lineNumbers: true
    },
    cleanUrls: true,
    metaChunk: true,
    lastUpdated: true,
    themeConfig: {
        logo: '/hero.png',
        sidebar,
    },
    rewrites: {
        'vue/:chapter/:page': ':chapter/:page',
    }
})
