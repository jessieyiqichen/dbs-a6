"use client";

import { useEffect, useRef, useState } from "react";
import { OpenItems } from "./OpenItems";
import { PlanCard } from "./PlanCard";
import { Timeline } from "./Timeline";
import { Weather } from "./Weather";
import { WeekStrip } from "./WeekStrip";
import type { DayPayload } from "./types";
import { POLL_MS, useDay, useWeather } from "./useDay";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FLASH_MS = 2500;

function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[m - 1]} ${d}`;
}

function savedAt(iso: string): string {
  if (!iso) return "";
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return iso;
  return t.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function headerLabel(data: DayPayload): string {
  if (data.date === data.today) return data.plan ? "Today" : "Today · no plan yet";
  if (data.date > data.today) return data.plan ? "Next planned day" : "Upcoming · no plan";
  return data.plan ? "Last plan" : "Past · no plan";
}

/** True for a moment after a new save arrives, so the page can show that it changed. */
function useFlash(saved: string | undefined): boolean {
  const [flash, setFlash] = useState(false);
  const previous = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (previous.current !== undefined && saved !== undefined && saved !== previous.current) {
      setFlash(true);
      const id = setTimeout(() => setFlash(false), FLASH_MS);
      previous.current = saved;
      return () => clearTimeout(id);
    }
    previous.current = saved;
  }, [saved]);
  return flash;
}

function taskNumbers(data: DayPayload): Map<string, number> {
  const map = new Map<string, number>();
  data.plan?.tasks.forEach((t, i) => {
    if (t.detail?.kind === "event" && t.detail.date === data.date) map.set(t.detail.summary, i + 1);
  });
  return map;
}

export function DayView() {
  const [selected, setSelected] = useState<string | null>(null);
  const { data, error } = useDay(selected);
  const weather = useWeather(data?.date);
  const flash = useFlash(data?.plan?.saved);
  if (!data) return <p className="text-muted">{error ? `The page cannot reach the harness: ${error}` : "Loading…"}</p>;
  const isToday = data.date === data.today;
  return (
    <>
      <WeekStrip shown={data.date} today={data.today} planDates={data.planDates} onPick={setSelected} />
      <header className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{headerLabel(data)}</p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="font-display text-3xl font-semibold">{longDate(data.date)}</h1>
          <Weather payload={weather} />
        </div>
      </header>
      <Timeline events={data.events} isToday={isToday} taskNumbers={taskNumbers(data)} />
      <div className={`mt-6 ${flash ? "plan-in" : ""}`}>
        {data.plan ? (
          <PlanCard plan={data.plan} />
        ) : (
          <p className="text-muted">
            {isToday ? "Ask Claude Code to plan your day. When you agree to a plan it is saved to " : "No plan was saved for this day. A plan is saved to "}
            <code>plans/</code> and appears here.
          </p>
        )}
      </div>
      <OpenItems items={data.openItems} />
      <footer className="mt-10 text-xs text-muted">
        {flash ? "Plan updated just now. " : data.plan?.saved ? `Plan saved ${savedAt(data.plan.saved)}. ` : ""}
        Checks for a new plan every {POLL_MS / 1000}s.{error ? ` Last check failed: ${error}.` : ""}
      </footer>
    </>
  );
}
