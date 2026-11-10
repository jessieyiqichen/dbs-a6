"use client";

import { addDays, weekKey } from "@/lib/dates";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Props = { shown: string; today: string; planDates: string[]; onPick: (date: string) => void };

function monthOf(iso: string): string {
  return MONTHS[Number(iso.slice(5, 7)) - 1];
}

function DayButton({ date, shown, today, hasPlan, onPick }: { date: string; shown: string; today: string; hasPlan: boolean; onPick: (d: string) => void }) {
  const isShown = date === shown;
  const isToday = date === today;
  const tone = isShown ? "bg-ink text-page" : isToday ? "bg-wash-strong text-ink" : "text-ink hover:bg-wash";
  return (
    <button
      type="button"
      aria-pressed={isShown}
      aria-label={`${date}${hasPlan ? ", has a plan" : ""}`}
      onClick={() => onPick(date)}
      className={`flex flex-col items-center rounded-xl px-2 py-1.5 focus:outline-2 focus:outline-offset-2 focus:outline-focus ${tone}`}
    >
      <span className="text-[11px] font-semibold uppercase opacity-70">{DAY_LETTERS[(new Date(date + "T12:00").getDay() + 6) % 7]}</span>
      <span className="font-display text-lg font-semibold tabular-nums leading-tight">{Number(date.slice(8, 10))}</span>
      <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${hasPlan ? (isShown ? "bg-reward" : "bg-reward-deep") : "bg-transparent"}`} aria-hidden="true" />
    </button>
  );
}

/** Seven days, Monday first, around the day shown. A dot marks a day with a saved plan; arrows move a week. */
export function WeekStrip({ shown, today, planDates, onPick }: Props) {
  const monday = weekKey(shown);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const planned = new Set(planDates);
  const arrow = "rounded-lg px-2 py-1 text-muted hover:bg-wash focus:outline-2 focus:outline-offset-2 focus:outline-focus";
  return (
    <nav aria-label="Pick a day" className="flat rounded-2xl bg-surface px-2 py-2">
      <div className="flex items-center justify-between px-1 text-xs font-semibold text-muted">
        <button type="button" className={arrow} aria-label="Previous week" onClick={() => onPick(addDays(shown, -7))}>‹</button>
        <span>{monthOf(days[0]) === monthOf(days[6]) ? monthOf(days[0]) : `${monthOf(days[0])} / ${monthOf(days[6])}`}</span>
        <button type="button" className={arrow} aria-label="Next week" onClick={() => onPick(addDays(shown, 7))}>›</button>
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d) => (
          <DayButton key={d} date={d} shown={shown} today={today} hasPlan={planned.has(d)} onPick={onPick} />
        ))}
      </div>
    </nav>
  );
}
