# Control

自制力工程工具 —— 基于[知乎：如何提高自制力？](https://www.zhihu.com/question/19888447/answer/1930799480401293785) 内的思想：CTDP（神圣座位 / 下必为例 / 线性时延）与 RSIP 思想的任务与项目管理 Web App，所有记录都以 [Org mode](https://orgmode.org/) 语法为底层引擎，支持s3备份同步。

欢迎访问测试：[control.ryc111.com](https://control.ryc111.com)（纯静态html，支持PWA安装，数据完全离线）

## 功能

- **任务链**：连胜节点（工作量证明）、精锐链 / 储君继承制、断链清零
- **预约链**：「打响指」15 分钟时延启动，超时判定
- **下必为例**：违规判定弹窗，永久写入判例库
- **任务组 · 嵌套链**：`:REPEAT:` + `[/]` 的可运行循环执行器
- **习惯**：`:STYLE: habit` 原生连续性网格
- **国策 · RSIP 规则树**：层级规则、每日限新增一条、违规级联回滚
- **项目大纲**：完整的 org outline 编辑器（TODO 状态机、优先级、SCHEDULED/DEADLINE、标签、进度 cookie、结构升降）
- **回收站**：软删除（`:ARCHIVE:`），可恢复
- **统计**：CLOCK 汇总、工作量证明热力图、兵种分布
- **押注 + 虚拟宠物**：积分激励与一致性反馈
- **存储与备份**：本地 `.org` 文件镜像（File System Access API）+ S3 兼容远端备份（Cloudflare R2 / AWS S3 / MinIO）

一切状态（链、判例、国策、习惯、任务组、CLOCK/LOGBOOK）都序列化进同一份合法的 `.org` 文档，可在「org」抽屉中实时查看、下载、导入。

## PWA（可安装 App）

本项目是一个 **离线优先的 PWA**，可安装到手机主屏 / 桌面：

- `manifest.webmanifest` —— 应用清单（名称、图标、`standalone` 全屏）
- `sw.js` —— service worker，缓存应用外壳，**断网也能完整使用**；S3 备份请求不被拦截
- `icons/` —— 全套图标（192/512/maskable/apple-touch/favicon）
- **深色模式** —— 跟随系统，亦可在侧边栏或「存储 → 应用设置」手动切换（CSS 变量主题）
- **本地提醒** —— 预约超时、任务组到点、番茄结束通过系统通知提醒（需在设置中授权）

> 安装：用 Chrome/Edge 打开后地址栏会出现「安装」图标；iOS Safari 用「添加到主屏幕」。
> 提醒说明：App 完全关闭时的后台推送需额外的推送服务器；此处为本地通知，离线优先、无需后端。

## 运行 / 部署

纯静态，无需构建。直接用浏览器打开 `index.html`，或托管于任意静态服务器 / GitHub Pages（HTTPS 下 PWA 与 service worker 才会生效）：

```sh
# 任意静态服务器，例如
python3 -m http.server
```

## 文件

- `index.html` —— 应用本体（Design Component）
- `support.js` —— 运行时（请与 `index.html` 一同部署）
- `manifest.webmanifest` · `sw.js` · `icons/` —— PWA 资产

# Credit

- 整个 App 的思想体系基于[知乎：如何提高自制力？](https://www.zhihu.com/question/19888447/answer/1930799480401293785)（CTDP / RSIP）。
- 虚拟宠物功能参考了 [KenXiao1/momentum](https://github.com/KenXiao1/momentum)。
