---
name: morning-check-in
description: Plan the user's day. Use when they ask what to do today or on a given date, how to arrange their day, what is due, or to review how yesterday went. Reads the calendar, the job tracker and notes; proposes three tasks; saves the agreed plan.
---

# Morning check-in

Propose a short plan for one day, get the user's yes, save it. The user wants the plan directly, not a conversation.

## 1. Load the rules and the data

Read in this order, every time:

1. `docs/planning.md` for the rules and the plan format.
2. `docs/data.md` for the file formats.
3. `data/calendar.ics` and `data/job-tracker.md`. Parse the dates; never recall them from memory.
4. `notes/open-items.md`, then the daily files in `notes/` from the last 7 days, newest first. Do not read older daily files unless the user asks about that period.

The target date is today unless the user names another day. The user plans a few days ahead, so a future date is normal.

## 2. Check before proposing

| Check | If it fails |
|---|---|
| The calendar and the tracker agree on every shared item (company, date, time) | Stop. Show both lines and ask the user to check the data. Do not pick one. |
| No two dated items collide on the target date | Stop. Ask which comes first. |
| `notes/open-items.md` is empty | For each open item, ask: drop it, or move it to the target date? Wait for the answer. |

Otherwise ask nothing.

## 3. Propose

Apply `docs/planning.md`: nothing before 10:00; Tuesday is coursework only; three tasks, a fourth only as an "if there is time" line; job search counts as one task; dated tracker items outrank coursework; five applications on a job-search day.

Output exactly: one sentence, then a table with columns Task, From, Why today, then at most one "If there is time" line. Nothing else.

## 4. Confirm, then save

1. When the user agrees or edits, repeat the final plan once in full and wait for a yes.
2. Write `plans/YYYY-MM-DD.md` with the frontmatter and table described in `plans/README.md`. Overwrite if a plan for that date exists.
3. Append one entry to `notes/YYYY-MM-DD.md` (the date you wrote the plan on): what was planned, what the user said about earlier items (done, not done and why, moved to which date, dropped).
4. Update `notes/open-items.md`: add items the user moved or left open, remove items the user marked done or dropped. Keep it to one line per item.
5. Say in one line where the plan was saved.

## Never

Never edit `data/`. Never move a deadline, drop a company or delete an item without the user's word. Never write to `notes/` or `plans/` before the user's yes.
