"use client";

import { useEffect, useState } from "react";
import type { CalendarEvent } from "@/lib/sources";
import { agenda, nowSlot, type AgendaEvent } from "@/lib/timeline";

type Props = { events: CalendarEvent[]; isToday: boolean; taskNumbers: Map<string, number> };

function clock(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** The wall clock as HH:MM, re-read once a minute. Only rendered after data arrives, so never on the server. */
function useNow(enabled: boolean): string | null {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [enabled]);
  return enabled ? clock() : null;
}

function Badge({ number }: { number: number | undefined }) {
  if (number === undefined) return null;
  return <span className="rounded-full bg-reward-deep px-1.5 py-0.5 text-[10px] font-semibold text-page">{number}</span>;
}

function NowLine({ now }: { now: string }) {
  return (
    <li aria-label={`Now, ${now}`} className="flex items-center gap-2 py-0.5">
      <span className="w-14 text-right text-[11px] font-semibold text-flag tabular-nums">{now}</span>
      <span className="h-0.5 flex-1 rounded bg-flag" />
    </li>
  );
}

function Row({ event, number }: { event: AgendaEvent; number: number | undefined }) {
  const tone = event.state === "past" ? "text-muted line-through decoration-hairline" : event.state === "now" ? "font-semibold" : "";
  const name = event.url ? (
    <a href={event.url} target="_blank" rel="noreferrer" className="underline decoration-hairline underline-offset-2 hover:decoration-ink">
      {event.summary}
    </a>
  ) : (
    event.summary
  );
  return (
    <li className={`flex items-baseline gap-2 py-1 text-sm ${tone}`}>
      <span className="w-14 shrink-0 text-right text-xs text-muted tabular-nums">
        {event.start}
        {event.end ? <span className="block text-[10px] leading-tight opacity-70">{event.end}</span> : null}
      </span>
      <span className={`h-5 w-1 shrink-0 self-center rounded ${event.state === "now" ? "bg-flag" : "bg-reward"}`} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        {name}
        {event.location && <span className="ml-2 text-xs text-muted">{event.location}</span>}
      </span>
      <Badge number={number} />
    </li>
  );
}

/** The day's calendar as an agenda: time, name, place. A numbered badge ties an event to the plan task it came from;
 *  on today, past events are struck through and a red line marks the current time. */
export function Timeline({ events, isToday, taskNumbers }: Props) {
  const now = useNow(isToday);
  const { timed, allDay } = agenda(events, now);
  if (timed.length === 0 && allDay.length === 0) {
    return <p className="mt-4 text-sm text-muted">Nothing on the calendar this day.</p>;
  }
  const slot = now ? nowSlot(timed, now) : -1;
  return (
    <section aria-label="Calendar for the day" className="flat mt-4 rounded-2xl bg-surface px-4 py-3">
      {allDay.length > 0 && (
        <ul className="mb-1 flex flex-wrap gap-1.5">
          {allDay.map((e, i) => (
            <li key={`${e.summary}-${i}`} className="rounded-full bg-wash-strong px-2.5 py-0.5 text-xs text-ink">
              {taskNumbers.has(e.summary) && <span className="mr-1 font-semibold text-reward-deep">{taskNumbers.get(e.summary)}</span>}
              {e.summary}
            </li>
          ))}
        </ul>
      )}
      <ol>
        {timed.flatMap((e, i) => {
          const row = <Row key={`${e.summary}-${i}`} event={e} number={taskNumbers.get(e.summary)} />;
          return i === slot && now ? [<NowLine key="now" now={now} />, row] : [row];
        })}
        {slot === timed.length && now && <NowLine now={now} />}
      </ol>
    </section>
  );
}
