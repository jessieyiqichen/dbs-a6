/** Reads the files the morning-check-in skill writes: plans/YYYY-MM-DD.md and notes/open-items.md.
 *  Pure functions on strings, so the page's API route and the tests share them. Formats: plans/README.md, notes/README.md. */

export type PlanTask = { task: string; from: string; why: string };

export type Plan = {
  date: string; // the day the plan is for, YYYY-MM-DD
  saved: string; // when the skill wrote it, ISO 8601, "" if missing
  summary: string;
  tasks: PlanTask[];
  ifTime: string | null;
};

import { firstTable, tableCells } from "./mdtable";

export type OpenItem = { item: string; from: string; status: string; noted: string };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const IF_TIME = /^if there is time:\s*(.+)$/i;

function readFrontmatter(block: string): Record<string, string> {
  const pairs = block
    .split(/\r?\n/)
    .map((line) => line.match(/^(\w+):\s*(.*)$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => [m[1], m[2].trim()] as const);
  return Object.fromEntries(pairs);
}

export function parsePlan(markdown: string): Plan | null {
  const match = markdown.match(FRONTMATTER);
  if (!match) return null;
  const meta = readFrontmatter(match[1]);
  if (!meta.date || !ISO_DATE.test(meta.date)) return null;

  const body = markdown.slice(match[0].length).split(/\r?\n/);
  const prose = body.filter((line) => line.trim() !== "" && tableCells(line) === null);
  const summary = prose.find((line) => !IF_TIME.test(line.trim()))?.trim() ?? "";
  const ifTime = prose.map((line) => line.trim().match(IF_TIME)).find((m) => m !== null)?.[1] ?? null;
  const tasks = (firstTable(body)?.rows ?? [])
    .filter((cells) => cells.length >= 3)
    .map(([task, from, why]) => ({ task, from, why }));

  return { date: meta.date, saved: meta.saved ?? "", summary, tasks, ifTime };
}

/** Today's plan if there is one; else the nearest future plan; else the most recent past one. Later saves win a date. */
export function pickPlan(plans: Plan[], today: string): Plan | null {
  if (plans.length === 0) return null;
  const bySavedDesc = [...plans].sort((a, b) => (a.saved < b.saved ? 1 : -1));
  const forDate = (date: string) => bySavedDesc.find((p) => p.date === date) ?? null;

  const todays = forDate(today);
  if (todays) return todays;

  const dates = [...new Set(plans.map((p) => p.date))].sort();
  const future = dates.find((d) => d > today);
  if (future) return forDate(future);

  return forDate(dates[dates.length - 1]);
}

export function parseOpenItems(markdown: string): OpenItem[] {
  return (firstTable(markdown.split(/\r?\n/))?.rows ?? [])
    .filter((cells) => cells.length >= 4)
    .map(([item, from, status, noted]) => ({ item, from, status, noted }));
}
