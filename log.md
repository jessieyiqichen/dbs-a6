# Log · Life Harness (DBS Assignment 6)

One row per decision or result, newest at the bottom. A5's log is in `docs/log-a5.md`.

| 日期 | 事项 | 结果 |
|---|---|---|
| 2026-11-07 | 读作业 PDF 与第 6 周 slides，向本人讲解 harness 概念、Architecture Challenge 与 A6 五步 | 本人选定方向：求职 + 日历两个数据源，全部虚构，不出现任何真实信息 |
| 2026-11-07 | 建仓库 | 从 dbs-a5 `main`（6867a71）完整复制历史到 `~/projects/dbs-a6`，去掉远程；A5 的 AGENTS.md、log.md、README.md、plan.md、flows.md、research.md 移到 `docs/` 并加 `-a5` 后缀；写临时 AGENTS.md（Step 2 后重写）。未在 GitHub 建仓库，推送待本人同意 |
| 2026-11-07 | Step 1：两个数据源 | `data/calendar.ics`：2026-11-08 至 11-21 两周 25 条事件（每周课、一次性日程、全天截止日、求职时间点），.ics 标准格式，由脚本生成；`data/job-tracker.md`：8 条申请（5 种状态）、4 家待投目标、每周目标。只有 Design, Build, Ship 这门课是真的，其余课名、教室、公司、人名全部虚构 |
| 2026-11-07 | Step 1：问 agent「你能看到什么，给我看明天，看不到什么」 | agent 用脚本解析两份文件回答：明天 11-08 周日无事件；之后两天与 7 天内截止事项列出；看不到的有邮件、课程公告、天气、交通、任务完成情况、申请链接与联系人、自己的历史笔记。答案见当日对话，结论：数据够排一天，缺「昨天做了什么」这一层，由 Step 3 的笔记补 |
| 2026-11-07 | Step 2 访谈 | 七问七答：提前几天定计划、十点开工、周二只做作业、一天三件、求职算一件、测评面试优先、每天投五家；计划直接给、短表；撞车与数据不一致都要问本人；计划定后复述一遍再存；没做完的事问「放弃还是挪」，不自动滚动 |
| 2026-11-07 | 分层 | 红线与「何时停下来问」进 AGENTS.md（37 行）；排计划规则、计划格式、笔记规则进 docs/planning.md；数据格式进 docs/data.md，只在排计划时读 |
| 2026-11-07 | 偏离作业原文 | 作业建议 skill「问一两个问题」，本人要求直接给计划，改为只在规则无法应用时问一个 |
| 2026-11-07 | 数据修订 | 投递记录的每周目标改为每天五家，与访谈口径一致 |
| 2026-11-07 | 待办（A6 之后） | 搜岗位的 agent 往 data/job-tracker.md 加新行，本 harness 只读；A6 内用静态文件代替，演示时说明一句 |
| 2026-11-08 | Step 2 验证 | 在仓库目录用 `claude -p` 开新会话提问，确认只加载了 AGENTS.md，能复述四条 Never 和 Map 里排计划前要读的四处；本地提交 e72a40f |
| 2026-11-08 | Step 3 skill | 写 .claude/skills/morning-check-in/SKILL.md（46 行）：先读 planning.md、data.md、数据、notes；三项检查不过才问；一句话加三行表；复述后才存 plans/ 与 notes/。建 notes/ 与 plans/ 各带格式说明 |
| 2026-11-08 | 触发测试 | 新会话三句：「安排一下明天」「周一有什么要交的」均自动选中 morning-check-in，读文件顺序与 SKILL.md 一致，格式正确，未写 plans/ 与 notes/；「AGENTS.md 有多少行」未误触，只跑了 wc -l。每次排计划约 10 轮、0.39 美元 |
| 2026-11-08 | 记忆管理 | 本人问 notes 变多会不会致幻。改为两层：notes/open-items.md 每次必读、解决即删；日流水只读最近 7 天。SKILL.md 第 1、2、4 步与 notes/README.md 同步修改 |
| 2026-11-08 | .gitignore | A5 的 .gitignore 忽略整个 .claude/，加 `!.claude/skills/` 放行，否则 skill 进不了仓库 |
| 2026-11-08 | Step 3 页面 | 本地页 /day：客户端每 3 秒轮询 /api/day，接口读 plans/ 与 notes/open-items.md；解析与挑选逻辑在 src/lib/plans.ts，先写 12 条测试再实现。挑选规则：今天的计划优先，否则最近的未来日期，否则最近的过去一天；同日取 saved 较晚的 |
| 2026-11-08 | 绕开登录 | 本仓库无 Clerk 密钥且页面只在本地用：proxy.ts 对 /day 与 /api/day 直接放行；根布局在没有 NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 时不挂 ClerkProvider，A5 页面在有密钥的环境不受影响 |
| 2026-11-08 | 意外 | next dev 启动时自动往 AGENTS.md 末尾追加一段 Next.js 自己的说明。AGENTS.md 是 harness 的常驻上下文，不能被工具改写，已在 next.config.ts 设 agentRules: false 并还原文件。演示可提：连框架都会往你的上下文里塞东西 |
| 2026-11-08 | 示例数据 | 为验证页面写了 plans/2026-11-09.md（内容取自触发测试中 agent 提的周一计划）和 open-items 一行 Northwind；是我写的夹具，不是 skill 的输出。页面在不刷新的情况下 3 秒内显示了新计划 |
| 2026-11-08 | 卡片可点 | 本人希望点卡片能看细节并跳转。实现：/api/day 顺带解析 data/ 两份文件（仍只读），按词面匹配把每张卡对应的日历事件或投递行附上；点卡片展开显示；Task 栏可写一个 markdown 链接，渲染成「Open link」按钮，只认 http(s)。不做页面打勾完成：那会让页面成为第二个写记忆的人。src/lib/sources.ts 与 mdtable.ts，先写 15 条测试，全套 436 条通过 |
| 2026-11-08 | docs/data.md 修正 | 投递记录的实际列名与 data.md 原写法不符（Applied、Company、Role、Location、Status、Next step and deadline、Notes），已按文件实际列名改正 |
| 2026-11-08 | 链接进数据 | 本人要岗位来源链接和 Canvas 链接。改为从数据来而不是让 skill 写：日历课程类事件加 `URL`（指向真实的 canvas.uchicago.edu，课程 ID 未知故只到域名，本人可换成真实课程页）；投递记录加 `Link` 列（公司虚构，用 example.com 占位页）。页面展开时按来源显示「Open in Canvas」「Open posting」，计划里自带的链接显示「Open link」，同地址不重复。所有链接只认 http(s) |
