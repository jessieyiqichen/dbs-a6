# How the user plans

Read this before proposing a plan or writing notes. These rules came from a planning interview on 2026-11-07; change them only when the user says so, and record the change in `log.md`.

## Rhythm

| Rule | Detail |
|---|---|
| Plans ahead | The user decides a few days in advance. A plan for a future date is normal; store it under that date in `plans/`. |
| Day starts late | Nothing before 10:00. Do not schedule anything earlier. |
| Tuesday is class day | On Tuesdays only coursework goes on the plan. No job search, no side tasks. |
| Three things a day | A day holds three real tasks. A fourth goes in a separate "if there is time" line, never in the main list. |
| Count, not clock | The user plans by number of tasks, not by hours. Do not produce time blocks. |

## Job search

| Rule | Detail |
|---|---|
| One of the three | Job search counts as one of the day's three tasks, not an extra. |
| Assessments and interviews first | Anything with a date in the tracker (assessment window, interview, coffee chat) outranks coursework on the same day. |
| Daily target | Five applications on a job-search day. |
| Weekly target | One round of follow-ups per week. |
| Coffee chats | No fixed number; depends on replies. Suggest one only when the tracker shows an invitation. |

## What a plan looks like

One sentence, then a table, then at most one "if there is time" line. Ten seconds to read.

| Column | Meaning |
|---|---|
| Task | What to do, in the user's words |
| From | `calendar`, `tracker` or `notes` |
| Why today | The deadline or rule that puts it on today's list |

A task may carry one markdown link, `[text](https://…)`, when the source row or the user gives a URL; the page shows it as a button. Never invent a URL.

Propose directly. Do not open with questions. Ask one question only when a rule above cannot be applied without an answer (for example, two dated items collide). After the user agrees, repeat the plan once, wait for a yes, then save it to `plans/YYYY-MM-DD.md` and update `notes/`.

## Notes

`notes/` is the memory layer. Write to it only after the user confirms a plan or reports on a day.

| Record | Example |
|---|---|
| Done or not done | "PS3: done." |
| The user's own reason | "Northwind assessment: not done, no quiet 90 minutes; moved to Thu 11-12." |
| Where an item moved | Date it was pushed to, or "dropped" with the user's reason |
| Changes of preference | "User said: coffee chats only after a reply." Then suggest updating this file; do not edit it yourself. |

Unfinished items never carry over on their own. Each one gets a question: drop, or move to today?
