# Control · 项目说明（CLAUDE.md）

> 给后续协作者 / Claude 的项目级持久指令与现状速览。改动前请先读这份文件。

## 一句话定位

Control 是一个**自制力工程**任务/项目管理应用，理念基于 CTDP（神圣座位 / 下必为例 / 线性时延）+ RSIP（负面稳态→干预节点→定式/国策）。底层以 **Org mode 语法**为唯一数据真相（single source of truth），界面是 org 文档的可视化视图。已 PWA 化，可安装、离线优先。

## 技术形态

- **单文件 Design Component**：`index.html` 是入口，写成 `<x-dc>` 模板 + `class Component extends DCLogic` 逻辑类。运行时是 `support.js`（**勿手改**）。
- 不要把它当普通 React/JSX 页面改写。编辑模板用 `dc_html_str_replace`，编辑逻辑用 `dc_js_str_replace`，整体重写用 `dc_write`。`str_replace_edit` 仅用于改不到的地方（如 `<head>`、`data-props`）。
- **样式一律内联**。helmet 里的 `<style>` 只放无法内联的东西：CSS 变量主题定义、`@keyframes`、`@media`、body reset。新增颜色必须走 CSS 变量（见下「深色模式」），不要硬编码 hex。

## 文件清单

| 文件 | 作用 |
|---|---|
| `index.html` | 应用本体（DC：模板 + 逻辑类）。~2700 行，单文件正常。 |
| `support.js` | DC 运行时，自动生成，**永不手改**。 |
| `manifest.webmanifest` | PWA 清单（standalone、图标、主题色）。 |
| `sw.js` | service worker：离线缓存应用外壳 + 本地通知调度。S3/备份请求不被拦截。 |
| `icons/` | 全套图标（192/512/maskable/apple-touch/favicon），「链节点环 C」母题。 |
| `README.md` | 面向用户/部署的说明。 |

## 已实现功能（当前状态：功能完整，可用）

导航共 10 项，分三组：**任务链 / 今日 / 项目 / 任务组 / 习惯** ｜ **国策 / 判例** ｜ **统计 / 回收站 / 设置**。≤760px 底栏只放 任务链·今日·习惯·国策 + 「更多」面板（其余页面、org 源码、主题切换）。

- **任务链（主屏）**：精锐链 + 普通链（储君继承制）；大号 `#N` 连胜；神圣座位是主屏唯一的主操作区：选任务（今日任务 + 项目里的 NEXT，或「自由专注」）→「坐上神圣座位」或「预约 15 分钟」；预约生效后倒计时与「已就位 · 开始」也在同一面板。每条链有**完成条件** `mins`（分钟），满了才出现「完成节点」，之前只能「提前结束…」走判定。完成节点写真实 `CLOCK`（含 tags）进 `:LOGBOOK:`。专注中不能切换链。触发标志 / 预约信号 / 完成条件折叠成座位上方一行摘要，「✎ 调整」展开。
- **下必为例**：判定弹窗分「疑似违规」与「提前结束」两种（`judgeKind`），先列出同类已有判例（`cases[].kind` 区分 early / distract），属于判例可直接放行；否则二选一不可撤销（断链清零 / 永久写入判例库；提前结束允许后同时完成节点）。
- **今日 Agenda**：快速捕获（`标题 :标签:` 回车）、TODO⇄DONE、「去专注 →」放上座位、× 删除进回收站。
- **项目**：org outline 编辑器——TODO 状态循环（TODO→NEXT→WAITING→DONE→CANCELLED）、优先级 `[#A/B/C]`、标签、SCHEDULED/DEADLINE、升降级/上下移/加子项同级、`[n/m]` 进度 cookie、备注、折叠。
- **任务组**：嵌套链（org 子树 + `:REPEAT:` + `[/]`），可运行的循环执行器（顺序推进、计时、到点切换，整组完成 = 活动链 +1）。
- **习惯**：org `:STYLE: habit`，连续性网格 + 连胜/最佳/30天完成率，一键打卡。
- **国策（RSIP）**：层级规则树；立规表单按「① 负面稳态 → ② 干预节点 → ③ 规则」引导（存 `stale`/`node`，org 里是 `:STALE:`/`:NODE:`）；每日限新增一条；「今日全部坚守 +1」每天只能结算一次（`ruleBumpDate`）；违规级联作废（连子规则一并进回收站）。
- **引导**：①分步设置向导（`welcomeSeen` / `guideStep` / `guideMins`，7 步：欢迎→触发标志→完成条件→下必为例→线性时延→第一条国策→确认并选「从零开始 / 保留示例」）；②任务链页「上手清单」，按真实操作打勾（`onboard.done`：ritual/capture/snap/node/rule/notify/backup），默认只显示下一步；③各页「? 怎么用」说明卡（`TIPS`，首次进入自动展开，关掉记在 `onboard.tips`）。设置页可重看向导 / 重新显示清单与说明。
- **操作反馈**：关键操作弹 toast（`state.toast`，3.8 秒后由 tick 清除）。
- **回收站**：软删除（org `:ARCHIVE:`），可恢复 / 永久删除。任务/项目/国策/任务组/习惯删除都先进这里。
- **押注 + 虚拟宠物**：积分激励（完成节点 +3、整组循环 +5），宠物情绪由近期一致性派生。
- **存储**：应用设置（主题、本地提醒开关）+ S3/R2 备份配置 + 导入/导出 `.org`。
- **org 抽屉**：左下「org」按钮，实时显示由状态生成的合法 `.org`，可下载/导入。

## 关键架构约定（改动前必读）

1. **Org 是引擎，不是导出格式**。所有状态经 `buildOrg()` 序列化成合法 org（LOGBOOK/CLOCK/:STYLE: habit/:REPEAT:/:ARCHIVE:/`[n/m]` cookie/属性抽屉都是真实构造）。新增任何数据都要想清楚它的 org 表达，并补进 `buildOrg()`。
2. **持久化**：状态存 localStorage key `control-app-v1`（`componentDidUpdate` 里写，剔除 `now`）；主题存 `control-theme`。**绝不清除/覆盖非本次写入的 localStorage**。
3. **演示日期固定为 2026-06-11（周四）**，由 `todayIso()` 锚定，时间戳/星期都基于它。改演示数据时保持一致。
4. **自愈逻辑**：`loadState()` 会修复历史损坏的链数据（早期自动化测试留下的「新链 #0」），并为旧存档补齐新增集合字段（含链的 `mins`、`onboard`、`session.taskKey`）。新增顶层 state 字段时，在 `loadState()` 里加 `if (!st.x) st.x = ...` 迁移。
   **跨日结转**：`log`（70 天，末位 = 今天）/ `todayMins` / `todayNodes` 由 `rollDay()` 按 `logDate` 在加载时和每秒 tick 中滚动清零。
5. **深色模式**：`:root[data-theme=light|dark]` 两套 CSS 变量（`--bg/--card/--ink/--ac/--dg/...`）。`<head>` 有 pre-paint 脚本防闪烁。新 UI 用变量，别写死颜色。白底彩色按钮上的 `color:#fff` 是有意保留的。
6. **响应式**：桌面侧栏可折叠成 60px 图标条（`.app-sidebar.is-collapsed`，靠 `flex:0 0 60px` 生效，不是 `width`）；≤760px 侧栏变底部换行导航。响应式只在 helmet 的 `@media` 里，桌面由内联样式即时绘制，二者互不干扰。
7. **本地提醒**：基于 Notification API + sw.js，预约超时/任务组到点/番茄结束触发。App 完全关闭的后台推送需推送服务器——本项目刻意只做本地通知以契合离线优先，**不要**为此引入后端依赖，除非用户明确要求。

## 验证注意事项

- 后台 verifier 与用户标签页**共用 localStorage**，自动化点击可能改乱演示数据。验证用户可见态时尽量只读（eval_js 查询），别用破坏性点击；若改动了数据，结束前还原成上面的演示基线（精锐链 #12 等）。
- 改完调 `done({path:'index.html', fork_verifier:true})`。

## 风格与边界

- 克制中性的现代工具风。等宽用 IBM Plex Mono，正文用 Noto Sans SC。
- 军事/链条隐喻是产品语言（任务群、突击/侦查/工程标签、储君继承），保留。
- 不擅自加占位内容/填充板块；要加内容先问用户。
- 不要重建受版权保护的第三方专有 UI。
