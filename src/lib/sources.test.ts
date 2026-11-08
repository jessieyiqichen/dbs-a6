import { describe, expect, it } from "vitest";
import { findDetail, parseCalendar, parseTaskLink, parseTracker } from "./sources";

const ICS = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:a
SUMMARY:Design, Build, Ship office hours
DTSTART;TZID=America/Chicago:20261109T160000
DTEND;TZID=America/Chicago:20261109T170000
LOCATION:Ryerson 255
URL:https://canvas.uchicago.edu/courses/51238
END:VEVENT
BEGIN:VEVENT
UID:b
SUMMARY:Due: Assignment 6 Life Harness
DTSTART;VALUE=DATE:20261110
DTEND;VALUE=DATE:20261111
END:VEVENT
BEGIN:VEVENT
UID:c
SUMMARY:ECON 31720 Causal Inference
DTSTART;TZID=America/Chicago:20261109T103000
DTEND;TZID=America/Chicago:20261109T115000
LOCATION:Saieh Hall 203
END:VEVENT
BEGIN:VEVENT
UID:d
SUMMARY:Due: Causal Inference Problem Set 3
DTSTART;VALUE=DATE:20261113
END:VEVENT
END:VCALENDAR
`;

const TRACKER = `# Tracker

## Applications

| Applied | Company | Role | Location | Status | Next step and deadline | Link | Notes |
|---|---|---|---|---|---|---|---|
| 2026-11-02 | Northwind Analytics | Data Product Analyst | Chicago | Assessment | Online assessment, window closes Thu 2026-11-12 23:59 | https://example.com/careers/northwind | 90 minutes, timed |

## Targets not yet applied

| Company | Role | Location | Application closes | Link | Why |
|---|---|---|---|---|---|
| Fernwood Labs | Product Manager, AI Tools | San Francisco | 2026-11-13 | | Small team, ships weekly |
`;

describe("parseCalendar", () => {
  const events = parseCalendar(ICS);

  it("reads a timed event with its local times and place", () => {
    expect(events[0]).toEqual({
      summary: "Design, Build, Ship office hours",
      date: "2026-11-09",
      start: "16:00",
      end: "17:00",
      location: "Ryerson 255",
      url: "https://canvas.uchicago.edu/courses/51238",
      allDay: false,
    });
  });

  it("reads an all-day event as a date with no times", () => {
    const due = events.find((e) => e.summary.startsWith("Due: Assignment"));
    expect(due).toMatchObject({ date: "2026-11-10", start: null, end: null, location: null, url: null, allDay: true });
  });

  it("returns an empty list for text with no events", () => {
    expect(parseCalendar("hello")).toEqual([]);
  });
});

describe("parseTracker", () => {
  const tracker = parseTracker(TRACKER);

  it("reads applications by column name", () => {
    expect(tracker.applications).toEqual([
      {
        company: "Northwind Analytics",
        role: "Data Product Analyst",
        location: "Chicago",
        status: "Assessment",
        next: "Online assessment, window closes Thu 2026-11-12 23:59",
        applied: "2026-11-02",
        link: "https://example.com/careers/northwind",
      },
    ]);
  });

  it("reads targets by column name", () => {
    expect(tracker.targets).toEqual([
      { company: "Fernwood Labs", role: "Product Manager, AI Tools", location: "San Francisco", closes: "2026-11-13", why: "Small team, ships weekly", link: null },
    ]);
  });

  it("drops a link that is not http(s)", () => {
    const md = "## Applications\n\n| Company | Link |\n|---|---|\n| X | ftp://x |\n";
    expect(parseTracker(md).applications[0].link).toBeNull();
  });

  it("copes with a file that has neither section", () => {
    expect(parseTracker("# nothing")).toEqual({ applications: [], targets: [] });
  });
});

describe("parseTaskLink", () => {
  it("splits a markdown link out of the task text", () => {
    expect(parseTaskLink("Five applications, [Fernwood Labs](https://example.com/jobs) first")).toEqual({
      text: "Five applications, Fernwood Labs first",
      href: "https://example.com/jobs",
    });
  });

  it("leaves plain text alone", () => {
    expect(parseTaskLink("Finish PS3")).toEqual({ text: "Finish PS3", href: null });
  });

  it("drops a link that is not http(s)", () => {
    expect(parseTaskLink("[x](javascript:alert(1))")).toEqual({ text: "x", href: null });
  });
});

describe("findDetail", () => {
  const sources = { events: parseCalendar(ICS), tracker: parseTracker(TRACKER), openItems: [] };

  it("prefers the calendar event on the plan's date when several match", () => {
    const d = findDetail({ task: "Finish Assignment 6 and bring questions to DBS office hours at 16:00", from: "calendar" }, "2026-11-09", sources);
    expect(d).toMatchObject({ kind: "event", summary: "Design, Build, Ship office hours", start: "16:00" });
  });

  it("picks the event with the most words in common", () => {
    const d = findDetail({ task: "Start Causal Inference problem set 3", from: "calendar" }, "2026-11-09", sources);
    expect(d).toMatchObject({ kind: "event", summary: "Due: Causal Inference Problem Set 3", date: "2026-11-13" });
  });

  it("matches a tracker target by company name", () => {
    const d = findDetail({ task: "Five applications, Fernwood Labs first", from: "tracker" }, "2026-11-09", sources);
    expect(d).toMatchObject({ kind: "target", company: "Fernwood Labs", closes: "2026-11-13" });
  });

  it("matches an application by company name", () => {
    const d = findDetail({ task: "Do the Northwind assessment", from: "tracker" }, "2026-11-09", sources);
    expect(d).toMatchObject({ kind: "application", company: "Northwind Analytics", status: "Assessment" });
  });

  it("returns null when nothing matches", () => {
    expect(findDetail({ task: "Call the dentist", from: "calendar" }, "2026-11-09", sources)).toBeNull();
    expect(findDetail({ task: "Email Dana", from: "tracker" }, "2026-11-09", sources)).toBeNull();
  });

  it("matches an open item by its words", () => {
    const withOpen = { ...sources, openItems: [{ item: "Northwind assessment (90 min)", from: "tracker", status: "window closes Thu", noted: "2026-11-08" }] };
    expect(findDetail({ task: "Northwind assessment", from: "notes" }, "2026-11-09", withOpen)).toMatchObject({ kind: "open", item: "Northwind assessment (90 min)" });
  });
});
