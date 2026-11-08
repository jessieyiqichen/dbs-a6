/** Minimal markdown table reading, shared by the plan and data parsers. No library: the files are small and ours. */

export type Table = { header: string[]; rows: string[][] };

/** Cells of one table row; null for anything that is not a row or is the |---| separator. */
export function tableCells(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) return null;
  const cells = trimmed.slice(1, trimmed.endsWith("|") ? -1 : undefined).split("|").map((c) => c.trim());
  if (cells.every((c) => /^:?-{3,}:?$/.test(c))) return null;
  return cells;
}

/** The first table in `lines`: header row plus body rows. */
export function firstTable(lines: string[]): Table | null {
  const rows = lines.map(tableCells).filter((cells): cells is string[] => cells !== null);
  if (rows.length === 0) return null;
  return { header: rows[0], rows: rows.slice(1) };
}

/** Body rows as objects keyed by the lower-cased header text. */
export function records(table: Table): Record<string, string>[] {
  const keys = table.header.map((h) => h.toLowerCase());
  return table.rows.map((row) => Object.fromEntries(keys.map((k, i) => [k, row[i] ?? ""])));
}

/** Lines under each `## Heading`, keyed by the heading text. Lines before the first heading are under "". */
export function sections(markdown: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  let current = "";
  out.set(current, []);
  for (const line of markdown.split(/\r?\n/)) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) {
      current = h[1].trim();
      out.set(current, []);
    } else {
      out.get(current)?.push(line);
    }
  }
  return out;
}
