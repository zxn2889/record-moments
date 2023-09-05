import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { backToTopPlugin } from '@vuepress/plugin-back-to-top'
import { gitPlugin } from '@vuepress/plugin-git'
import sidebar from './sidebar'

export default defineUserConfig({
    lang: 'zh-CN',
    title: '你好，生活！',
    description: 'The more recorded, the better.',
    plugins: [backToTopPlugin(), gitPlugin()],
    // charset: 'utf-8',
    theme: defaultTheme({
        sidebar
    })
})