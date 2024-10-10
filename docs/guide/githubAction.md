# Github Action
Github Action 是一个自动化部署平台，可以用来自动部署代码。若要使他工作，需要一个.yml or .yaml配置文件，且放在 `.github/workflows` 目录下。

## 工作流
工作流是一个可配置的自动化过程，一个工作流由多个作业组成。每个作业由多个步骤构成，每个步骤可以执行操作或运行脚本。

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

#### jobs.<job_id>.runs-on
指定运行环境。
- Github 提供的虚拟机环境：ubuntu-latest、windows-latest、macos-latest
- 自己搭建的虚拟机环境：self-hosted

#### jobs.<job_id>.environment
指定作业引用的环境。

#### jobs.<job_id>.concurrency
控制作业中并发运行的工作流。

#### jobs.<job_id>.outputs
指定输出变量。

#### jobs.<job_id>.steps
指定作业中每个步骤的执行操作。
- id：步骤的唯一标识符。
- if：指定触发条件，满足条件时执行当前步骤。
- name：步骤名称。
- uses：指定操作。
- run：执行命令。
- working-directory：指定工作目录。
- shell：指定 shell 环境。
- with：指定操作参数，每一个参数都是一个键值对。
- with.args: Docker容器中指定参数。
- env：设置环境变量。
- continue-on-error：指定是否继续执行后续步骤。
- timeout-minutes：指定超时时间。

#### jobs.<job_id>.timeout-minutes
指定作业超时时间。

#### jobs.<job_id>.strategy
指定作业策略。

#### jobs.<job_id>.continue-on-error
指定是否继续执行后续步骤。

#### jobs.<job_id>.container
指定容器。

#### jobs.<job_id>.uses
指定作业运行时工作流文件的位置和版本。