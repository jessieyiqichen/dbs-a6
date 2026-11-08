# plans/

One file per planned day, written by the morning-check-in skill after the user says yes. The local page reads this folder and shows the newest plan for today or the nearest future date.

File name: `YYYY-MM-DD.md`. Format:

```markdown
---
date: 2026-11-09
saved: 2026-11-08T21:40:00-06:00
---

One sentence summary of the day.

| Task | From | Why today |
|---|---|---|
| Finish Causal Inference PS3 | calendar | Due Fri 11-13; Tuesday is class-only, so this is the last open weekday slot before it |
| Five applications, start with Fernwood Labs | tracker | Fernwood closes Fri 11-13 |
| DBS office hours, 16:00 | calendar | Only chance before Tue deadline |

If there is time: outline Data Viz milestone 2.
```

A Task cell may hold one markdown link when the source has a URL; the page renders it as an "Open link" button and shows the matching calendar or tracker row when the task is pressed.

The `date` line is the day the plan is for; `saved` is when it was written. The page sorts by `date`, then by `saved`.

All content is fictional.
