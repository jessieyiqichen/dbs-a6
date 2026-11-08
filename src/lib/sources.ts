/** Reads the two read-only data files for the /day page's detail panels, and matches a plan task back to its source
 *  row. Everything here is read-only and text-based; a miss returns null and the page shows the plan line alone. */
import { daysBetween } from "./dates";
import { firstTable, records, sections } from "./mdtable";
import type { OpenItem } from "./plans";

export type CalendarEvent = {
  summary: string;
  date: string; // YYYY-MM-DD, local
  start: string | null; // HH:MM or null for all-day
  end: string | null;
  location: string | null;
  url: string | null;
  allDay: boolean;
};

export type Application = { company: string; role: string; location: string; status: string; next: string; applied: string; link: string | null };
export type Target = { company: string; role: string; location: string; closes: string; why: string; link: string | null };
export type Tracker = { applications: Application[]; targets: Target[] };

export type Detail =
  | ({ kind: "event" } & CalendarEvent)
  | ({ kind: "application" } & Application)
  | ({ kind: "target" } & Target)
  | ({ kind: "open" } & OpenItem);

export type Sources = { events: CalendarEvent[]; tracker: Tracker; openItems: OpenItem[] };

const EVENT_BLOCK = /BEGIN:VEVENT\r?\n([\s\S]*?)END:VEVENT/g;
const LINK = /\[([^\]]+)\]\(([^\s]+)\)/;

/** Only http(s) URLs are kept, from any source; anything else becomes null. */
export function safeUrl(value: string | undefined | null): string | null {
  const v = value?.trim() ?? "";
  return /^https?:\/\/\S+$/i.test(v) ? v : null;
}

function unescapeIcs(text: string): string {
  return text.replace(/\\n/g, "\n").replace(/\\([,;\\])/g, "$1");
}

/** Property lines of one VEVENT, folded continuation lines joined, keyed by name without parameters. */
function icsProps(block: string): Map<string, { params: string; value: string }> {
  const unfolded = block.replace(/\r?\n[ \t]/g, "");
  const out = new Map<string, { params: string; value: string }>();
  for (const line of unfolded.split(/\r?\n/)) {
    const m = line.match(/^([A-Z-]+)((?:;[^:]*)?):(.*)$/);
    if (m) out.set(m[1], { params: m[2], value: m[3] });
  }
  return out;
}

function icsDate(prop: { params: string; value: string } | undefined): { date: string; time: string | null } | null {
  if (!prop) return null;
  const m = prop.value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);
  if (!m) return null;
  const date = `${m[1]}-${m[2]}-${m[3]}`;
  const allDay = prop.params.includes("VALUE=DATE") || !m[4];
  return { date, time: allDay ? null : `${m[4]}:${m[5]}` };
}

export function parseCalendar(ics: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const match of ics.matchAll(EVENT_BLOCK)) {
    const props = icsProps(match[1]);
    const start = icsDate(props.get("DTSTART"));
    const summary = props.get("SUMMARY")?.value;
    if (!start || !summary) continue;
    const end = icsDate(props.get("DTEND"));
    const location = props.get("LOCATION")?.value;
    const url = props.get("URL")?.value;
    events.push({
      summary: unescapeIcs(summary),
      date: start.date,
      start: start.time,
      end: end?.time ?? null,
      location: location ? unescapeIcs(location) : null,
      url: safeUrl(url ? unescapeIcs(url) : null),
      allDay: start.time === null,
    });
  }
  return events;
}

function sectionRecords(markdown: string, heading: string): Record<string, string>[] {
  const lines = sections(markdown).get(heading);
  const table = lines ? firstTable(lines) : null;
  return table ? records(table) : [];
}

export function parseTracker(markdown: string): Tracker {
  const applications = sectionRecords(markdown, "Applications").map((r) => ({
    company: r.company ?? "",
    role: r.role ?? "",
    location: r.location ?? "",
    status: r.status ?? "",
    next: r["next step and deadline"] ?? r["next step"] ?? "",
    applied: r.applied ?? "",
    link: safeUrl(r.link),
  }));
  const targets = sectionRecords(markdown, "Targets not yet applied").map((r) => ({
    company: r.company ?? "",
    role: r.role ?? "",
    location: r.location ?? "",
    closes: r["application closes"] ?? r.closes ?? "",
    why: r.why ?? "",
    link: safeUrl(r.link),
  }));
  return { applications, targets };
}

/** One markdown link inside a task cell becomes the task's link; only http(s) is kept. */
export function parseTaskLink(task: string): { text: string; href: string | null } {
  const m = task.match(LINK);
  if (!m) return { text: task, href: null };
  const text = task.replace(LINK, m[1]).replace(/\s+/g, " ").trim();
  return { text, href: safeUrl(m[2]) };
}

const STOP = new Set(["the", "and", "for", "with", "due", "from", "that", "this", "then", "into", "your", "today", "first", "start", "finish"]);

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 3 && !STOP.has(t)),
  );
}

function overlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) if (b.has(t)) n += 1;
  return n;
}

function matchEvent(task: string, planDate: string, events: CalendarEvent[]): Detail | null {
  const want = tokens(task);
  const scored = events
    .map((e) => ({ e, score: overlap(tokens(e.summary), want) }))
    .filter(({ score }) => score > 0)
    .sort((x, y) => y.score - x.score || Math.abs(daysBetween(planDate, x.e.date)) - Math.abs(daysBetween(planDate, y.e.date)));
  return scored[0] ? { kind: "event", ...scored[0].e } : null;
}

function mentionsCompany(task: string, company: string): boolean {
  const lower = task.toLowerCase();
  if (lower.includes(company.toLowerCase())) return true;
  const first = company.toLowerCase().split(/\s+/)[0];
  return first.length >= 4 && tokens(task).has(first);
}

function matchTracker(task: string, tracker: Tracker): Detail | null {
  const app = tracker.applications.find((a) => mentionsCompany(task, a.company));
  if (app) return { kind: "application", ...app };
  const target = tracker.targets.find((t) => mentionsCompany(task, t.company));
  return target ? { kind: "target", ...target } : null;
}

function matchOpen(task: string, items: OpenItem[]): Detail | null {
  const want = tokens(task);
  const best = items
    .map((it) => ({ it, score: overlap(tokens(it.item), want) }))
    .filter(({ score }) => score > 0)
    .sort((x, y) => y.score - x.score)[0];
  return best ? { kind: "open", ...best.it } : null;
}

/** The source row behind a plan task: the named source first, the others as a fallback. */
export function findDetail(task: { task: string; from: string }, planDate: string, sources: Sources): Detail | null {
  const text = parseTaskLink(task.task).text;
  const order = [task.from, "calendar", "tracker", "notes"].filter((v, i, arr) => arr.indexOf(v) === i);
  for (const from of order) {
    const hit =
      from === "calendar" ? matchEvent(text, planDate, sources.events)
      : from === "tracker" ? matchTracker(text, sources.tracker)
      : from === "notes" ? matchOpen(text, sources.openItems)
      : null;
    if (hit) return hit;
  }
  return null;
}
