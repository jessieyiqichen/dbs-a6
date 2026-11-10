import { describe, expect, it } from "vitest";
import { agenda, nowSlot } from "./timeline";
import type { CalendarEvent } from "./sources";

const ev = (summary: string, start: string | null, end: string | null): CalendarEvent => ({
  summary,
  date: "2026-11-10",
  start,
  end,
  location: null,
  url: null,
  allDay: start === null,
});

describe("agenda", () => {
  it("sorts timed events by start and separates all-day ones", () => {
    const { timed, allDay } = agenda([ev("B", "15:00", "16:00"), ev("Deadline", null, null), ev("A", "10:00", "11:00")]);
    expect(timed.map((e) => e.summary)).toEqual(["A", "B"]);
    expect(allDay.map((e) => e.summary)).toEqual(["Deadline"]);
  });
  it("marks events that are over and the one happening now", () => {
    const { timed } = agenda([ev("A", "10:00", "11:00"), ev("B", "12:00", "13:00"), ev("C", "15:00", "16:00")], "12:30");
    expect(timed.map((e) => e.state)).toEqual(["past", "now", "later"]);
  });
  it("marks nothing without a clock", () => {
    const { timed } = agenda([ev("A", "10:00", "11:00")]);
    expect(timed[0].state).toBe("later");
  });
});

describe("nowSlot", () => {
  it("is the index where a now line goes: after every event that has started", () => {
    const { timed } = agenda([ev("A", "10:00", "11:00"), ev("B", "12:00", "13:00"), ev("C", "15:00", "16:00")]);
    expect(nowSlot(timed, "09:00")).toBe(0);
    expect(nowSlot(timed, "12:30")).toBe(2);
    expect(nowSlot(timed, "20:00")).toBe(3);
  });
});
