# Log · Life Harness (DBS Assignment 6)

One row per decision or result, newest at the bottom. A5's log is in `docs/log-a5.md`.

| 日期 | 事项 | 结果 |
|---|---|---|
| 2026-11-07 | 读作业 PDF 与第 6 周 slides，向本人讲解 harness 概念、Architecture Challenge 与 A6 五步 | 本人选定方向：求职 + 日历两个数据源，全部虚构，不出现任何真实信息 |
| 2026-11-07 | 建仓库 | 从 dbs-a5 `main`（6867a71）完整复制历史到 `~/projects/dbs-a6`，去掉远程；A5 的 AGENTS.md、log.md、README.md、plan.md、flows.md、research.md 移到 `docs/` 并加 `-a5` 后缀；写临时 AGENTS.md（Step 2 后重写）。未在 GitHub 建仓库，推送待本人同意 |
| 2026-11-07 | Step 1：两个数据源 | `data/calendar.ics`：2026-11-08 至 11-21 两周 25 条事件（每周课、一次性日程、全天截止日、求职时间点），.ics 标准格式，由脚本生成；`data/job-tracker.md`：8 条申请（5 种状态）、4 家待投目标、每周目标。只有 Design, Build, Ship 这门课是真的，其余课名、教室、公司、人名全部虚构 |
| 2026-11-07 | Step 1：问 agent「你能看到什么，给我看明天，看不到什么」 | agent 用脚本解析两份文件回答：明天 11-08 周日无事件；之后两天与 7 天内截止事项列出；看不到的有邮件、课程公告、天气、交通、任务完成情况、申请链接与联系人、自己的历史笔记。答案见当日对话，结论：数据够排一天，缺「昨天做了什么」这一层，由 Step 3 的笔记补 |
