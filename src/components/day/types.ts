import type { OpenItem, Plan, PlanTask } from "@/lib/plans";
import type { CalendarEvent, Detail } from "@/lib/sources";

/** A plan task as the page receives it: the plan's own line, plus the link and source row the API found for it. */
export type DayTask = PlanTask & { text: string; href: string | null; detail: Detail | null };

export type DayPlan = Omit<Plan, "tasks"> & { tasks: DayTask[] };

/** Shape of GET /api/day. Without `?date=` the plan is the one nearest today; with it, that day's plan or null.
 *  `date` is the day shown, `events` that day's calendar, `planDates` every day that has a saved plan. */
export type DayPayload = {
  today: string;
  date: string;
  plan: DayPlan | null;
  events: CalendarEvent[];
  openItems: OpenItem[];
  planDates: string[];
  planCount: number;
};
