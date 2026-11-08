# notes/

The harness's memory. Two kinds of file, both written by the morning-check-in skill after the user confirms a plan or reports on a day.

## `open-items.md`

The only file read every time. One line per item that is still open: unfinished, moved to a later date, or waiting on a reply. When the user marks an item done or dropped, the line is removed, so the file stays a few lines long.

```markdown
| Item | From | Status | Noted |
|---|---|---|---|
| Northwind assessment | tracker | moved to Thu 11-12, "no quiet 90 minutes" | 2026-11-08 |
| Orbital Commerce follow-up | tracker | waiting for a reply, check by 11-14 | 2026-11-08 |
```

## Daily files `YYYY-MM-DD.md`

One per day the harness was used. The skill reads only the last 7 days; older files are the archive and are opened only when the user asks about that period. Record only what the user said, in their words:

```markdown
# 2026-11-08

- Planned 11-09: PS3, five applications (Fernwood first), DBS office hours.
- Northwind assessment: not done on 11-07, "no quiet 90 minutes"; user moved it to Thu 11-12.
- User said: coffee chats only after a reply. Suggested updating docs/planning.md; not changed yet.
```

## Rules

Do not copy data from `data/` here, and do not record the agent's own reasoning. Long-lived rules belong in `docs/planning.md`, which only the user edits. Every line carries the date it was noted, so an old entry is never mistaken for a new one.

All content is fictional.
