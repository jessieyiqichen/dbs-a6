import type { OpenItem, Plan, PlanTask } from "@/lib/plans";
import type { Detail } from "@/lib/sources";

/** A plan task as the page receives it: the plan's own line, plus the link and source row the API found for it. */
export type DayTask = PlanTask & { text: string; href: string | null; detail: Detail | null };

export type DayPlan = Omit<Plan, "tasks"> & { tasks: DayTask[] };

/** Shape of GET /api/day. */
export type DayPayload = { today: string; plan: DayPlan | null; openItems: OpenItem[]; planCount: number };
