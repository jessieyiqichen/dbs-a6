import { describe, expect, it } from "vitest";
import { parseOpenItems, parsePlan, pickPlan, type Plan } from "./plans";

const MONDAY = `---
date: 2026-11-09
saved: 2026-11-08T21:40:00-06:00
---

Monday is the last full day before A6 is due.

| Task | From | Why today |
|---|---|---|
| Finish PS3 | calendar | Due Fri 11-13 |
| Five applications, Fernwood first | tracker | Fernwood closes Fri 11-13 |
| DBS office hours, 16:00 | calendar | Only chance before Tue |

If there is time: outline Data Viz milestone 2.
`;

function plan(date: string, saved: string): Plan {
  return { date, saved, summary: "", tasks: [], ifTime: null };
}

describe("parsePlan", () => {
  it("reads the frontmatter, the summary, three tasks and the spare line", () => {
    const p = parsePlan(MONDAY);
    expect(p).not.toBeNull();
    expect(p?.date).toBe("2026-11-09");
    expect(p?.saved).toBe("2026-11-08T21:40:00-06:00");
    expect(p?.summary).toBe("Monday is the last full day before A6 is due.");
    expect(p?.tasks).toHaveLength(3);
    expect(p?.tasks[1]).toEqual({ task: "Five applications, Fernwood first", from: "tracker", why: "Fernwood closes Fri 11-13" });
    expect(p?.ifTime).toBe("outline Data Viz milestone 2.");
  });

  it("returns null without a date in the frontmatter", () => {
    expect(parsePlan("---\nsaved: 2026-11-08T21:40:00-06:00\n---\n\nHello\n")).toBeNull();
    expect(parsePlan("no frontmatter at all")).toBeNull();
  });

  it("rejects a date that is not YYYY-MM-DD", () => {
    expect(parsePlan("---\ndate: Nov 9\n---\n\nHello\n")).toBeNull();
  });

  it("tolerates a missing spare line and a missing table", () => {
    const p = parsePlan("---\ndate: 2026-11-10\nsaved: 2026-11-09T08:00:00-06:00\n---\n\nTuesday is class only.\n");
    expect(p?.tasks).toEqual([]);
    expect(p?.ifTime).toBeNull();
    expect(p?.summary).toBe("Tuesday is class only.");
  });

  it("ignores an unknown source and keeps the row", () => {
    const p = parsePlan("---\ndate: 2026-11-10\n---\n\n| Task | From | Why today |\n|---|---|---|\n| X | email | y |\n");
    expect(p?.tasks[0].from).toBe("email");
  });
});

describe("pickPlan", () => {
  const plans = [
    plan("2026-11-07", "2026-11-06T20:00:00-06:00"),
    plan("2026-11-09", "2026-11-08T21:40:00-06:00"),
    plan("2026-11-12", "2026-11-08T22:00:00-06:00"),
  ];

  it("prefers the plan for today", () => {
    expect(pickPlan(plans, "2026-11-09")?.date).toBe("2026-11-09");
  });

  it("falls back to the nearest future plan", () => {
    expect(pickPlan(plans, "2026-11-10")?.date).toBe("2026-11-12");
  });

  it("shows the most recent past plan when nothing is ahead", () => {
    expect(pickPlan(plans, "2026-11-20")?.date).toBe("2026-11-12");
  });

  it("returns null with no plans", () => {
    expect(pickPlan([], "2026-11-09")).toBeNull();
  });

  it("takes the later save when two plans share a date", () => {
    const twice = [plan("2026-11-09", "2026-11-08T09:00:00-06:00"), plan("2026-11-09", "2026-11-08T21:40:00-06:00")];
    expect(pickPlan(twice, "2026-11-09")?.saved).toBe("2026-11-08T21:40:00-06:00");
  });
});

describe("parseOpenItems", () => {
  it("reads the rows of the open-items table", () => {
    const md = "| Item | From | Status | Noted |\n|---|---|---|---|\n| Northwind assessment | tracker | moved to Thu 11-12 | 2026-11-08 |\n";
    expect(parseOpenItems(md)).toEqual([{ item: "Northwind assessment", from: "tracker", status: "moved to Thu 11-12", noted: "2026-11-08" }]);
  });

  it("returns an empty list for a header-only table", () => {
    expect(parseOpenItems("| Item | From | Status | Noted |\n|---|---|---|---|\n")).toEqual([]);
  });
});
