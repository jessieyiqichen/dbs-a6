"use client";

import { useEffect, useState } from "react";
import { OpenItems } from "./OpenItems";
import { PlanCard } from "./PlanCard";
import type { DayPayload } from "./types";

/** How often the page asks the API whether a new plan was saved. Short enough that a save shows during a demo. */
const POLL_MS = 3000;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

function useDay(): { data: DayPayload | null; error: string | null } {
  const [data, setData] = useState<DayPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    async function poll() {
      try {
        const res = await fetch("/api/day", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const next = (await res.json()) as DayPayload;
        if (alive) {
          setData(next);
          setError(null);
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "fetch failed");
      }
    }
    void poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);
  return { data, error };
}

function Header({ data }: { data: DayPayload }) {
  const plan = data.plan;
  const label = !plan ? "No plan yet" : plan.date === data.today ? "Today" : plan.date > data.today ? "Next planned day" : "Last plan";
  return (
    <header>
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">{label}</p>
      <h1 className="font-display mt-1 text-3xl font-semibold">{longDate(plan?.date ?? data.today)}</h1>
    </header>
  );
}

export function DayView() {
  const { data, error } = useDay();
  if (!data) return <p className="text-muted">{error ? `The page cannot reach the harness: ${error}` : "Loading…"}</p>;
  return (
    <>
      <Header data={data} />
      <div className="mt-6">
        {data.plan ? (
          <PlanCard plan={data.plan} />
        ) : (
          <p className="text-muted">
            Ask Claude Code to plan your day. When you agree to a plan it is saved to <code>plans/</code> and appears here.
          </p>
        )}
      </div>
      <OpenItems items={data.openItems} />
      <footer className="mt-10 text-xs text-muted">
        {data.plan?.saved ? `Plan saved ${savedAt(data.plan.saved)}. ` : ""}
        Checks for a new plan every {POLL_MS / 1000}s.{error ? ` Last check failed: ${error}.` : ""}
      </footer>
    </>
  );
}
