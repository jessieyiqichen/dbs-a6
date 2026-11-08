"use client";

import { useState } from "react";
import { TaskDetail } from "./TaskDetail";
import type { DayPlan, DayTask } from "./types";

const SOURCE_LABEL: Record<string, string> = { calendar: "Calendar", tracker: "Job tracker", notes: "Notes" };

/** One task. The whole card is a button: press it to see the source row behind the line and, if there is one, a link. */
function TaskRow({ task, index }: { task: DayTask; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = `task-detail-${index}`;
  return (
    <li className="flat rounded-2xl bg-surface">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full gap-4 rounded-2xl px-5 py-4 text-left hover:bg-wash/60 focus:outline-2 focus:outline-offset-2 focus:outline-focus"
      >
        <span className="font-display text-2xl font-semibold text-reward-deep tabular-nums">{index + 1}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-snug">{task.text}</span>
          <span className="mt-1 block text-sm text-muted">{task.why}</span>
        </span>
        <span className="self-start rounded-full bg-wash px-2.5 py-1 text-xs font-semibold text-muted">
          {SOURCE_LABEL[task.from] ?? task.from}
        </span>
      </button>
      {open && (
        <div id={panelId} className="px-5 pb-4">
          <TaskDetail detail={task.detail} href={task.href} />
        </div>
      )}
    </li>
  );
}

export function PlanCard({ plan }: { plan: DayPlan }) {
  return (
    <section aria-labelledby="plan-heading">
      <p id="plan-heading" className="text-lg leading-snug">
        {plan.summary}
      </p>
      <ol className="mt-5 space-y-3">
        {plan.tasks.map((task, i) => (
          <TaskRow key={`${task.text}-${i}`} task={task} index={i} />
        ))}
      </ol>
      {plan.ifTime && (
        <p className="mt-4 text-sm text-muted">
          <span className="font-semibold">If there is time:</span> {plan.ifTime}
        </p>
      )}
      <p className="mt-3 text-xs text-muted">Press a task to see where it came from.</p>
    </section>
  );
}
