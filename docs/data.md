# Data sources

Two read-only files in `data/`. Both are fictional. A hook blocks every edit to this folder; if something in the data looks wrong, tell the user and let them fix it.

## `data/calendar.ics`

iCalendar. Each `BEGIN:VEVENT … END:VEVENT` block is one event. Recurring events are already expanded into separate dated blocks, so there are no `RRULE` lines; the file covers 2026-11-08 to 2026-11-21 plus one December deadline.

| Field | Form | Meaning |
|---|---|---|
| `DTSTART;TZID=America/Chicago:20261109T103000` | local time | Timed event |
| `DTEND;TZID=America/Chicago:…` | local time | End of a timed event |
| `DTSTART;VALUE=DATE:20261110` | date only | All-day item, used for deadlines |
| `SUMMARY` | text | Title. Deadlines start with `Due:` |
| `LOCATION` | text | Room or place, may be absent |
| `URL` | https link | Course page on Canvas for classes, office hours and course deadlines; absent otherwise |

Read it with a small script or by hand; do not guess dates from memory. When comparing to the tracker, match on company name and date.

## `data/job-tracker.md`

Markdown with three sections.

| Section | Columns | Use |
|---|---|---|
| Applications | Applied, Company, Role, Location, Status, Next step and deadline, Link, Notes | Status is one of Applied, Assessment, Interviewing, Rejected. Dates of the next step live in the Next step column. |
| Targets not yet applied | Company, Role, Location, Application closes, Link, Why | Candidates for the daily application target; sort by Application closes |
| Goals | free text | Daily and weekly targets; `docs/planning.md` is the authority if they disagree |

Link is the posting or application page. The companies are made up, so these point at placeholder pages under example.com; a real tracker would hold the real posting URLs. The /day page shows the link of the matched row as a button.

Items with a date in the Applications table outrank coursework on that date (see `docs/planning.md`).
