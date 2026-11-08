import type { OpenItem } from "@/lib/plans";

/** The memory layer, as the page sees it: notes/open-items.md, one line per item still waiting. */
export function OpenItems({ items }: { items: OpenItem[] }) {
  return (
    <section aria-labelledby="open-heading" className="mt-10">
      <h2 id="open-heading" className="font-display text-base font-semibold text-muted">
        Still open
      </h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Nothing waiting. The harness has no unfinished items on record.</p>
      ) : (
        <ul className="mt-2 divide-y divide-hairline">
          {items.map((it, i) => (
            <li key={`${it.item}-${i}`} className="flex flex-wrap items-baseline gap-x-3 py-2 text-sm">
              <span className="font-semibold">{it.item}</span>
              <span className="text-muted">{it.status}</span>
              <span className="ml-auto text-xs text-muted tabular-nums">noted {it.noted}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
