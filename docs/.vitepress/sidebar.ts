import { generateSidebar } from 'vitepress-sidebar'

export default () => generateSidebar([{
    documentRootPath: 'docs',
    scanStartPath: 'guide',
    resolvePath: '/guide/',
    includeFolderIndexFile: true,
    useTitleFromFrontmatter: true,
    excludePattern: ['README.md'],
},{
    documentRootPath: 'docs',
    scanStartPath: 'vue',
    resolvePath: '/vue/',
    includeFolderIndexFile: true,
    excludePattern: ['README.md'],
    useTitleFromFrontmatter: true,
    sortMenusOrderNumericallyFromTitle: true,
    prefixSeparator: '-',
    removePrefixAfterOrdering: true,
}])