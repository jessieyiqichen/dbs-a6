import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { DayPayload, DayPlan } from "@/components/day/types";
import { toISODate } from "@/lib/dates";
import { parseOpenItems, parsePlan, pickPlan, type OpenItem, type Plan } from "@/lib/plans";
import { findDetail, parseCalendar, parseTaskLink, parseTracker, type Sources } from "@/lib/sources";

/** What the /day page polls. Reads plans/, notes/open-items.md and the two data files on every call, so a plan the
 *  skill just saved shows on the next poll. Local only: never deployed, no auth, and it only ever reads. */
export const dynamic = "force-dynamic";

const ROOT = process.cwd();
const PLANS_DIR = path.join(ROOT, "plans");
const OPEN_ITEMS = path.join(ROOT, "notes", "open-items.md");
const CALENDAR = path.join(ROOT, "data", "calendar.ics");
const TRACKER = path.join(ROOT, "data", "job-tracker.md");
const PLAN_FILE = /^\d{4}-\d{2}-\d{2}\.md$/;

/** A file's text, or "" with a logged reason; the page degrades to showing less rather than failing. */
async function readOrEmpty(file: string): Promise<string> {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    console.error("file could not be read", { file, error });
    return "";
  }
}

async function readPlans(): Promise<Plan[]> {
  let names: string[];
  try {
    names = await readdir(PLANS_DIR);
  } catch (error) {
    console.error("plans/ could not be listed", { dir: PLANS_DIR, error });
    return [];
  }
  const texts = await Promise.all(names.filter((n) => PLAN_FILE.test(n)).map((n) => readOrEmpty(path.join(PLANS_DIR, n))));
  return texts.map(parsePlan).filter((p): p is Plan => p !== null);
}

function enrich(plan: Plan, sources: Sources): DayPlan {
  const tasks = plan.tasks.map((t) => ({
    ...t,
    ...parseTaskLink(t.task),
    detail: findDetail(t, plan.date, sources),
  }));
  return { ...plan, tasks };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** `?date=YYYY-MM-DD` shows that day; anything else (or nothing) shows the plan nearest today. */
function requestedDate(request: Request): string | null {
  const value = new URL(request.url).searchParams.get("date");
  return value && ISO_DATE.test(value) ? value : null;
}

/** The plan saved for one day; when the skill saved that day twice, the later save. */
function latestFor(plans: Plan[], date: string): Plan | null {
  const same = plans.filter((p) => p.date === date).sort((a, b) => (a.saved < b.saved ? 1 : -1));
  return same[0] ?? null;
}

export async function GET(request: Request) {
  const today = toISODate(new Date());
  const wanted = requestedDate(request);
  const [plans, openText, icsText, trackerText] = await Promise.all([
    readPlans(),
    readOrEmpty(OPEN_ITEMS),
    readOrEmpty(CALENDAR),
    readOrEmpty(TRACKER),
  ]);
  const openItems: OpenItem[] = parseOpenItems(openText);
  const sources: Sources = { events: parseCalendar(icsText), tracker: parseTracker(trackerText), openItems };
  const picked = wanted ? latestFor(plans, wanted) : pickPlan(plans, today);
  const date = wanted ?? picked?.date ?? today;
  const payload: DayPayload = {
    today,
    date,
    plan: picked ? enrich(picked, sources) : null,
    events: sources.events.filter((e) => e.date === date),
    openItems,
    planDates: plans.map((p) => p.date).sort(),
    planCount: plans.length,
  };
  return NextResponse.json(payload);
}
