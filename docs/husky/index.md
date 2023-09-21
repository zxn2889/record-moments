朋友们，之前我们学习到了很多 vue 底层的知识，今天我们来学习如何实现一个代码风格管控工具。

我们知道，团队作战比个人开发的情况要复杂的多，比如要规范团队内代码风格、提交信息规范等，如果有一套能实现风格统一的代码可以省去不少麻烦。那如何去做呢？这就是我们今天要学的 husky。

#### 如何使用 husky？

**No.1**

首先我们要安装它，安装方式有手动安装和自动安装两种，这里我们推荐自动安装，如下：
```js
// npm
npx husky-init && npm install

// pnpm
pnpm dlx husky-init && pnpm init
```

::: details 注意
如果您的编译工具不支持 ```&&``` 符号，可以使用 ```-and``` 代替。
:::

命令成功执行后，项目的根目录下就会自动生成 ```.husky``` 文件夹，这就是为什么项目中会有它的来历了。然后，点开 ```.husky``` 文件会发现自动生成了好几个文件，我们只看 ```pre-commit``` 文件。

::: details 注意
自动安装方式比手动安装要方便，自动安装后会直接帮我们生成或修改好相应文件，如下：

1. 生成 ```pre-commit``` 文件，指在 commit 之前执行的逻辑存放入口，如：修改代码风格
2. 修改 ```package.json``` 文件，增加 ```prepare: husky inistall``` 命令，让团队 pull 下代码后保持风格统一的方式

为什么说 ```prepare: husky inistall``` 能保持风格统一？

因为 pkg 的命令也是有生命周期的，团队成员在执行 ```npm install``` 或 ```pnpm install``` 后，会自动执行该命令，进而生成相应文件，保持统一。

```prepare``` 执行顺序：```npm install```、```npm prepare```、```npm publish```。
:::

**No.2**

然后我们打开 ```pre-commit``` 文件，会发现里面自动帮我们填充了内容 ```npm test```，这个就是在我们提交 ```commit``` 之前要执行的命令，但是如果没有配置相关内容的话会报错，然后抛出错误警告码 1。这就需要我们在 ```pkg.scripts``` 里配置 ```test``` 脚本了，当然也有其他解决方法，如下：

1. 直接删掉 ```npm test```
2. 执行 ```--no-verify``` 跳过校验
3. 更新为其他脚本，如：```npx lint-staged```

这里我们使用第三种方案，校验代码风格并强制修改。

::: details 注意
```lint-staged``` 是一个能读取文件缓存区的插件。
:::

**No.3**

我们开始安装 ```lint-staged```，安装方式如下：

```js
// npm
npm install -D lint-staged

// pnpm
pnpm add -D lint-staged
```

安装完成后，为了不仅能读取，还能修改，我们还要安装能让代码风格保持统一的工具，有 ```eslint、prettier```，这里我们选择使用 ```eslint```，安装如下：

```js
// npm
npm init @eslint/config

// pnpm
pnpm create @eslint/config
```

执行该命令后，终端面板内会开始让我们进行一系列的选择，大家可以根据需要配置自行选择。我的如下：

![图片](/img/55.png)

然后我们再创建一个 eslint 忽略文件 ```.eslintignore```，可根据需要自行定义内容：

```js
.eslintrc.js
**/node_modules
**/dist
**/*.md
**/*.json
/husky
```

然后我们再创建一个 ```lintstagedrc.js``` 配置文件，设置读取的内容以及如何修改：

```js
module.exports = {
    "src/**/*.{js, ts}": "eslint --fix"
}
```

::: details 注意
创建/修改文件内容等，不要通过 ```echo``` 命令，其生成的内容为 ```utf-16``` 编码，会导致运行错误。
:::

这个时候我们就可以更新 ```pre-commit``` 文件里的命令了，如下：

```npx lint-staged```

这样，在进行 commit 之前，就会执行我们的 ```lint-staged``` 命令，进而修改为统一格式，然后真正提交。

**No.4**

我们还可以对提交的描述信息进行风格统一，同样，我们执行命令如下：

```js
// 一步到位
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit ${1}'

// 分两步
npm pkg set scripts.commitlint="commitlint --edit"
npx husky add .husky/commit-msg 'npm run commitlint ${1}'
```

这样，```.husky``` 文件夹下就会生成 ```commit-msg``` 文件，文件内容如下：

```js
npx --no -- commitlint --edit ${1}
```

::: details 注意
1. ```npx --no``` 表示只执行本地的依赖，找不到不去安装
2. ```${1}``` 表示读取的文件名，指存储最后一次提交信息的文件 ```.git/COMMIT_EDITMSG```
3. ```commitlint --edit ${1}``` 表示从文件里读取内容进行校验
:::

然后，我们再安装相关依赖如下：

```js
// npm
npm install --save-dev @commitlint/config-conventional @commitlint/cli

// pnpm
pnpm add -D @commitlint/config-conventional @commitlint/cli
```

至这里，其实我们的 ```commitlint``` 就体现作用了，只不过，在提交信息时会提示我们创建一个 ```commitlint.config.js``` 配置文件，该文件存储的是我们对描述信息的校验规则，如下：

```js
module.exports = {
    entends: ['@commitlint/config-conventional'],
    rules: {
        "type-case": [2, 'always', 'lowerCase'], // enum 类型为小写
        "type-empty": [2, 'never'], // 类型不能为空
        "subject-case": [2, 'never'], // 内容以空格间隔时写法，范围-英文
        "subject-empty": [2, 'never'], // 内容不允许有空格
        "subject-full-stop": [2, 'never', '.'], // 匹配到描述内容的结尾符号报错
        "header-max-length": [2, 'never', 100], // 首行文本长度不能超过多少
        "type-enum": [2, 'always', ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test']]
    }
}
```

::: details 注意
这里的 ```rules``` 是一定要配置的，各个值也一定要是有效的命令，每个命令值为数组形式，接收多个参数（至多3个），每个位置的参数表示的含义不同：

1. 第一顺位参数值为 0 | 1 | 2，分别表示：禁用规则 | 警告 | 报错
2. 第二顺位参数值为 ```always``` | ```never```，```never``` 表示颠倒规则
3. 第三顺位参数为值，可不传
:::

这样，我们就完成了我们所有的配置工作，至此，我们的代码风格和提交描述信息等就都有了明确的规范，团队效率将会有很大的提高。