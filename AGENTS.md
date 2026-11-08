# Life Harness · DBS Assignment 6

A morning check-in harness built with Claude Code. It reads two read-only data sources, remembers what happened on earlier days, and proposes a short plan for today. The user is a graduate student who is also job hunting. Due Tue 2026-11-10 17:30.

Everything in `data/` and `notes/` is made up. Nothing here is the user's real calendar, tasks or job search.

## Map

| Path | What it is | Read it when |
|---|---|---|
| `data/calendar.ics` | Classes, deadlines, interviews (iCalendar) | Planning a day |
| `data/job-tracker.md` | Applications, targets, goals | Planning a day |
| `docs/planning.md` | How the user plans: rules, plan format, notes policy | Planning a day or writing notes |
| `docs/data.md` | Format of the two data files and how to parse them | Reading `data/` |
| `notes/` | What happened on earlier days, in the user's words | Planning a day |
| `plans/` | Saved plans, one file per day; the local page reads these | Saving a plan |
| `log.md` | Decisions and results, one dated row each | Making a decision about the harness itself |
| `docs/*-a5.md` | Notes from Assignment 5, the repo this one was copied from | Never, unless asked about A5 |

## Never

- Never edit anything in `data/`. A hook blocks it; do not look for a way around.
- Never move a deadline, drop a company, or delete an item from a plan on your own. Propose; the user decides.
- Never send anything outside this repo. No email, no calendar writes, no external systems.
- Never push, deploy or run migrations without the user saying so in this conversation.

## Ask before deciding

- Two things collide (an assessment and a problem set due the same day): ask which comes first.
- The calendar and the tracker disagree (an interview at different times): show both lines and ask the user to check. Do not pick one.
- A plan is agreed: repeat it once in full, wait for a yes, then save it and update `notes/`.
- An unfinished item from yesterday: ask whether to drop it or carry it to today. Never carry it over silently.

## Habits

- Decisions about the harness go in `log.md`, one dated row each, same day.
- Commit messages: `<type>: <description>`. `git add` names files, never `-A`.
