import { describe, expect, it } from "vitest";
// The hook itself lives with the other Claude Code files; it is plain Node so Claude Code can run it without a build.
import { decide } from "../../.claude/hooks/protect-data.mjs";

const ROOT = "/repo";

describe("protect-data hook", () => {
  it("blocks Edit and Write on files under data/", () => {
    expect(decide("Edit", { file_path: "/repo/data/calendar.ics" }, ROOT).allow).toBe(false);
    expect(decide("Write", { file_path: "data/job-tracker.md" }, ROOT).allow).toBe(false);
    expect(decide("MultiEdit", { file_path: "/repo/data/new.md" }, ROOT).allow).toBe(false);
  });

  it("allows edits everywhere else, including plans/ and notes/", () => {
    expect(decide("Write", { file_path: "/repo/plans/2026-11-09.md" }, ROOT).allow).toBe(true);
    expect(decide("Edit", { file_path: "/repo/notes/open-items.md" }, ROOT).allow).toBe(true);
    expect(decide("Edit", { file_path: "/repo/src/lib/plans.ts" }, ROOT).allow).toBe(true);
  });

  it("is not fooled by a path that only contains the word data", () => {
    expect(decide("Edit", { file_path: "/repo/src/dataset.ts" }, ROOT).allow).toBe(true);
    expect(decide("Edit", { file_path: "/repo/docs/data.md" }, ROOT).allow).toBe(true);
    expect(decide("Edit", { file_path: "/repo/data/../AGENTS.md" }, ROOT).allow).toBe(true);
  });

  it("blocks shell commands that write into data/", () => {
    const blocked = [
      "echo x >> data/job-tracker.md",
      "sed -i '' 's/Mon/Wed/' data/calendar.ics",
      "rm data/calendar.ics",
      "mv data/calendar.ics data/old.ics",
      "cp /tmp/x.ics data/calendar.ics",
      "python3 - <<'EOF'\nopen('data/calendar.ics','w')\nEOF",
      "cat > /repo/data/calendar.ics <<'EOF'\nx\nEOF",
      "tee data/job-tracker.md",
    ];
    for (const command of blocked) expect(decide("Bash", { command }, ROOT).allow, command).toBe(false);
  });

  it("allows shell commands that only read data/", () => {
    const allowed = ["cat data/calendar.ics", "grep -n SUMMARY data/calendar.ics | head", "ls -la data", "wc -l data/job-tracker.md", "sed -n '1,20p' data/calendar.ics"];
    for (const command of allowed) expect(decide("Bash", { command }, ROOT).allow, command).toBe(true);
  });

  it("allows shell commands that write elsewhere", () => {
    expect(decide("Bash", { command: "echo x >> notes/2026-11-08.md" }, ROOT).allow).toBe(true);
    expect(decide("Bash", { command: "git add plans/2026-11-09.md" }, ROOT).allow).toBe(true);
  });

  it("ignores tools it does not know and empty input", () => {
    expect(decide("Read", { file_path: "/repo/data/calendar.ics" }, ROOT).allow).toBe(true);
    expect(decide("Bash", {}, ROOT).allow).toBe(true);
  });

  it("gives a reason that names the rule", () => {
    expect(decide("Edit", { file_path: "/repo/data/calendar.ics" }, ROOT).reason).toMatch(/data\/ is read-only/);
  });
});
