#!/usr/bin/env node
/** PreToolUse hook: data/ is read-only. Claude Code runs this before every Edit/Write/Bash call; exit 2 refuses the
 *  call and hands the reason back to Claude. This is the enforced half of AGENTS.md's "Never edit data/": the rule
 *  tells Claude, this makes sure. A Bash command is judged by its text, so it is a net, not a proof. */
import path from "node:path";
import { pathToFileURL } from "node:url";

const DATA_DIR = "data";
const REASON = "Blocked by the Life Harness hook: data/ is read-only (AGENTS.md, Never). The calendar and the job tracker are owned by other systems. Tell the user what you wanted to change and let them do it.";

const FILE_TOOLS = { Edit: "file_path", Write: "file_path", MultiEdit: "file_path", NotebookEdit: "notebook_path" };

/** Shell text that mentions the data folder as a path: "data/…", "./data", a bare "data" argument, or the absolute path. */
function mentionsData(command, root) {
  const relative = /(^|[\s"'`=(;|&<>])(\.\/)?data(\/|$|[\s"'`)>;|&])/m;
  const escaped = path.join(root, DATA_DIR).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const absolute = new RegExp(`${escaped}(/|$|[\\s"'\`)>;|&])`, "m");
  return relative.test(command) || absolute.test(command);
}

/** Anything that can change a file: redirects, file commands, in-place editors, interpreters, git working-tree commands. */
const WRITES = [
  />/,
  /(^|[\s;|&(])(rm|mv|cp|tee|truncate|touch|chmod|chown|install|rsync|dd|shred|ln|mkdir|rmdir|unzip|tar)(\s|$)/m,
  /(^|[\s;|&(])(python3?|node|deno|bun|perl|ruby|php|sh|bash|zsh)(\s|$)/m,
  /\bsed\s+(-[a-zA-Z]*i|--in-place)/,
  /\bgit\s+(checkout|restore|rm|mv|clean|stash|reset)\b/,
];

function isUnderData(filePath, root) {
  if (typeof filePath !== "string" || filePath === "") return false;
  const resolved = path.resolve(root, filePath);
  const dataDir = path.join(root, DATA_DIR);
  return resolved === dataDir || resolved.startsWith(dataDir + path.sep);
}

/** @returns {{allow: boolean, reason: string}} */
export function decide(toolName, toolInput, root) {
  const input = toolInput ?? {};
  const field = FILE_TOOLS[toolName];
  if (field) return isUnderData(input[field], root) ? { allow: false, reason: REASON } : { allow: true, reason: "" };
  if (toolName === "Bash") {
    const command = typeof input.command === "string" ? input.command : "";
    const writes = WRITES.some((re) => re.test(command));
    return writes && mentionsData(command, root) ? { allow: false, reason: REASON } : { allow: true, reason: "" };
  }
  return { allow: true, reason: "" };
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  let event;
  try {
    event = JSON.parse(raw);
  } catch (error) {
    console.error("protect-data hook: could not parse the event, allowing the call", error);
    return;
  }
  const root = process.env.CLAUDE_PROJECT_DIR || event.cwd || process.cwd();
  const verdict = decide(event.tool_name, event.tool_input, root);
  if (!verdict.allow) {
    console.error(verdict.reason);
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
