import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { toISODate } from "@/lib/dates";
import { parseOpenItems, parsePlan, pickPlan, type Plan } from "@/lib/plans";

/** What the /day page polls. Reads the repo's plans/ and notes/open-items.md on every call, so a plan the skill just
 *  saved shows up on the next poll. Local only: this route is never deployed and has no auth. */
export const dynamic = "force-dynamic";

const ROOT = process.cwd();
const PLANS_DIR = path.join(ROOT, "plans");
const OPEN_ITEMS = path.join(ROOT, "notes", "open-items.md");
const PLAN_FILE = /^\d{4}-\d{2}-\d{2}\.md$/;

async function readPlans(): Promise<Plan[]> {
  let names: string[];
  try {
    names = await readdir(PLANS_DIR);
  } catch (error) {
    console.error("plans/ could not be listed", { dir: PLANS_DIR, error });
    return [];
  }
  const files = names.filter((n) => PLAN_FILE.test(n));
  const parsed = await Promise.all(
    files.map(async (name) => {
      try {
        return parsePlan(await readFile(path.join(PLANS_DIR, name), "utf8"));
      } catch (error) {
        console.error("plan file could not be read", { name, error });
        return null;
      }
    }),
  );
  return parsed.filter((p): p is Plan => p !== null);
}

async function readOpenItems() {
  try {
    return parseOpenItems(await readFile(OPEN_ITEMS, "utf8"));
  } catch (error) {
    console.error("notes/open-items.md could not be read", { path: OPEN_ITEMS, error });
    return [];
  }
}

export async function GET() {
  const today = toISODate(new Date());
  const [plans, openItems] = await Promise.all([readPlans(), readOpenItems()]);
  return NextResponse.json({ today, plan: pickPlan(plans, today), openItems, planCount: plans.length });
}
