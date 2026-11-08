import type { Plan, PlanTask } from "@/lib/plans";

const SOURCE_LABEL: Record<string, string> = { calendar: "Calendar", tracker: "Job tracker", notes: "Notes" };

function TaskRow({ task, index }: { task: PlanTask; index: number }) {
  return (
    <li className="flat flex gap-4 rounded-2xl bg-surface px-5 py-4">
      <span className="font-display text-2xl font-semibold text-reward-deep tabular-nums">{index + 1}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug">{task.task}</p>
        <p className="mt-1 text-sm text-muted">{task.why}</p>
      </div>
      <span className="self-start rounded-full bg-wash px-2.5 py-1 text-xs font-semibold text-muted">
        {SOURCE_LABEL[task.from] ?? task.from}
      </span>
    </li>
  );
}

export function PlanCard({ plan }: { plan: Plan }) {
  return (
    <section aria-labelledby="plan-heading">
      <p id="plan-heading" className="text-lg leading-snug">
        {plan.summary}
      </p>
      <ol className="mt-5 space-y-3">
        {plan.tasks.map((task, i) => (
          <TaskRow key={`${task.task}-${i}`} task={task} index={i} />
        ))}
      </ol>
      {plan.ifTime && (
        <p className="mt-4 text-sm text-muted">
          <span className="font-semibold">If there is time:</span> {plan.ifTime}
        </p>
      )}
    </section>
  );
}
