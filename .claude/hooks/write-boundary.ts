#!/usr/bin/env npx tsx

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT = resolve(__dirname, "../..") + "/";

// Auto-allowed: no prompt, no block
const ALLOW = [
  "Knowledge/",
];

// Everything else in the vault: prompt the user before writing
function isAllowed(path: string): boolean {
  return ALLOW.some((w) => path.startsWith(VAULT + w));
}

function isInVault(path: string): boolean {
  return path.startsWith(VAULT);
}

function ask(reason: string) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: reason,
    },
  }));
}

function block(reason: string) {
  console.log(JSON.stringify({ decision: "block", reason }));
}

async function main() {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  const input = JSON.parse(Buffer.concat(chunks).toString());
  const toolName = input.tool_name;

  if (toolName === "Write" || toolName === "Edit") {
    const filePath = input.tool_input?.file_path ?? input.tool_input?.filePath ?? "";
    if (isInVault(filePath) && !isAllowed(filePath)) {
      ask(`This file is outside the auto-allowed paths (Knowledge/, Sources/, .claude/). Allow this edit?`);
    }
    return;
  }

  if (toolName === "Bash") {
    const command = input.tool_input?.command ?? "";
    const writePatterns = [">", ">>", "tee ", "mv ", "cp ", "rm ", "mkdir ", "touch "];
    const mightWrite = writePatterns.some((p) => command.includes(p));

    if (mightWrite && isInVault(command) && !ALLOW.some((w) => command.includes(VAULT + w))) {
      block("Write boundary: Bash writes outside Knowledge/, Sources/, and .claude/ are blocked");
    }
  }
}

main();
