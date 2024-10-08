# Github Action
Github Action 是一个自动化部署平台，可以用来自动部署代码。若要使他工作，需要一个.yml or .yaml配置文件，且放在 `.github/workflows` 目录下。

## 工作流种类
- CI：持续集成工作流
- 部署: 部署工作流
- 自动化：自动化工作流
- 代码扫描：代码扫描工作流
- 页面：页面工作流

## YAML 配置

### name
工作流名称，显示在Actions页面左侧列表。

### run-name
从工作流生成的工作流运行名称。

### on
触发工作流，可以是多个事件。

### permissions
控制访问权限。

### env
设置环境变量。

### concurrency
控制并发运行的工作流。

### jobs
工作流中需要执行的作业，可指定多个，默认并发执行。

#### jobs.<job_id>
工作流中每个作业的唯一标识符。

#### jobs.<job_id>.name
作业名称。

#### jobs.<job_id>.needs
指定依赖作业，当前作业会等待所有依赖作业执行完成后再开始。

#### jobs.<job_id>.if
指定触发条件，满足条件时执行当前作业。

