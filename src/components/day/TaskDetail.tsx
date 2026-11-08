import type { Detail } from "@/lib/sources";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function shortDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${WEEKDAYS[new Date(y, m - 1, d).getDay()]} ${m}-${String(d).padStart(2, "0")}`;
}

/** Label and value pairs for one source row. */
function rows(detail: Detail): [string, string][] {
  switch (detail.kind) {
    case "event":
      return [
        ["Calendar", detail.summary],
        ["When", detail.allDay ? `${shortDay(detail.date)}, all day` : `${shortDay(detail.date)}, ${detail.start}${detail.end ? ` to ${detail.end}` : ""}`],
        ...(detail.location ? ([["Where", detail.location]] as [string, string][]) : []),
      ];
    case "application":
      return [
        ["Company", `${detail.company}, ${detail.role}`],
        ["Status", detail.status],
        ["Next step", detail.next],
        ...(detail.applied ? ([["Applied", detail.applied]] as [string, string][]) : []),
      ];
    case "target":
      return [
        ["Company", `${detail.company}, ${detail.role}`],
        ["Closes", detail.closes],
        ...(detail.why ? ([["Why", detail.why]] as [string, string][]) : []),
      ];
    case "open":
      return [
        ["Open item", detail.item],
        ["Status", detail.status],
        ["Noted", detail.noted],
      ];
  }
}

/** Links to show under a task: the source row's own link first, then one written in the plan, without repeats. */
function links(detail: Detail | null, href: string | null): { label: string; href: string }[] {
  const out: { label: string; href: string }[] = [];
  if (detail?.kind === "event" && detail.url) out.push({ label: detail.url.includes("canvas") ? "Open in Canvas" : "Open event link", href: detail.url });
  if ((detail?.kind === "application" || detail?.kind === "target") && detail.link) out.push({ label: "Open posting", href: detail.link });
  if (href && !out.some((l) => l.href === href)) out.push({ label: "Open link", href });
  return out;
}

export function TaskDetail({ detail, href }: { detail: Detail | null; href: string | null }) {
  const buttons = links(detail, href);
  return (
    <div className="mt-3 border-t border-hairline pt-3 text-sm">
      {detail ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          {rows(detail).map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted">{label}</dt>
              <dd className="min-w-0">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-muted">No matching row in the calendar or the tracker.</p>
      )}
      {buttons.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {buttons.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-wash px-3 py-1.5 text-xs font-semibold text-ink hover:bg-wash-strong focus:outline-2 focus:outline-offset-2 focus:outline-focus"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
