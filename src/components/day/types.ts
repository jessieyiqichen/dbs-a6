import type { OpenItem, Plan } from "@/lib/plans";

/** Shape of GET /api/day. */
export type DayPayload = { today: string; plan: Plan | null; openItems: OpenItem[]; planCount: number };
