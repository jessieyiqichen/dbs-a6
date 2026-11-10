/** Orders a day's calendar events for the /day page's agenda and says where "now" falls. Pure functions. */
import type { CalendarEvent } from "./sources";

export type EventState = "past" | "now" | "later";
export type AgendaEvent = CalendarEvent & { state: EventState };
export type Agenda = { timed: AgendaEvent[]; allDay: CalendarEvent[] };

function minutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function stateOf(event: CalendarEvent, now: string | null): EventState {
  if (!now || !event.start) return "later";
  const t = minutes(now);
  if (t < minutes(event.start)) return "later";
  return t < minutes(event.end ?? event.start) ? "now" : "past";
}

/** Timed events in start order, each marked past / now / later against `now` (HH:MM, today only), and all-day ones apart. */
export function agenda(events: CalendarEvent[], now: string | null = null): Agenda {
  const timed = events
    .filter((e) => !e.allDay && e.start)
    .sort((a, b) => minutes(a.start as string) - minutes(b.start as string))
    .map((e) => ({ ...e, state: stateOf(e, now) }));
  return { timed, allDay: events.filter((e) => e.allDay) };
}

/** Index in `timed` before which a "now" line belongs: after every event that has already started. */
export function nowSlot(timed: AgendaEvent[], now: string): number {
  const t = minutes(now);
  return timed.filter((e) => minutes(e.start as string) <= t).length;
}
