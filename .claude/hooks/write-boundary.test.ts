#!/usr/bin/env npx tsx

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT = resolve(__dirname, "../..") + "/";

const ALLOW = ["Knowledge/"];

function isAllowed(path: string): boolean {
  return ALLOW.some((w) => path.startsWith(VAULT + w));
}

// Write/Edit: returns "allow", "ask", or null (outside vault, no action)
function checkWrite(filePath: string): string | null {
  if (!filePath.startsWith(VAULT)) return null;
  return isAllowed(filePath) ? "allow" : "ask";
}

// Bash: returns "allow", "block", or null (no write detected or outside vault)
function checkBash(command: string): string | null {
  const writePatterns = [">", ">>", "tee ", "mv ", "cp ", "rm ", "mkdir ", "touch "];
  const mightWrite = writePatterns.some((p) => command.includes(p));
  if (!mightWrite || !command.includes(VAULT)) return null;
  return ALLOW.some((w) => command.includes(VAULT + w)) ? "allow" : "block";
}

let passed = 0;
let failed = 0;

function test(name: string, result: string | null, expected: string | null) {
  if (result === expected) {
    console.log(`  pass: ${name}`);
    passed++;
  } else {
    console.log(`  FAIL: ${name} (got ${result}, expected ${expected})`);
    failed++;
  }
}

console.log("Write/Edit tests (auto-allowed):");
test("Knowledge/ allowed", checkWrite(`${VAULT}Knowledge/topic.md`), "allow");
test("Knowledge/ subdir allowed", checkWrite(`${VAULT}Knowledge/sub/topic.md`), "allow");

console.log("\nWrite/Edit tests (ask user):");
test(".claude/ asks", checkWrite(`${VAULT}.claude/settings.json`), "ask");
test(".claude/hooks/ asks", checkWrite(`${VAULT}.claude/hooks/test.ts`), "ask");
test("CLAUDE.md asks", checkWrite(`${VAULT}CLAUDE.md`), "ask");
test("CLAUDE.local.md asks", checkWrite(`${VAULT}CLAUDE.local.md`), "ask");
test("Sources/ asks", checkWrite(`${VAULT}Sources/article.md`), "ask");
test("Root note asks", checkWrite(`${VAULT}My Note.md`), "ask");
test("Library/ asks", checkWrite(`${VAULT}Library/book.md`), "ask");
test("Journal/ asks", checkWrite(`${VAULT}Journal/2026-04-07.md`), "ask");
test("Work/ asks", checkWrite(`${VAULT}Work/notes.md`), "ask");

console.log("\nWrite/Edit tests (outside vault):");
test("Outside vault no action", checkWrite("/tmp/test.md"), null);

console.log("\nBash tests:");
test("echo to Knowledge/ allowed", checkBash(`echo test > ${VAULT}Knowledge/test.md`), "allow");
test("echo to .claude/ blocked", checkBash(`echo test > ${VAULT}.claude/test.txt`), "block");
test("echo to Sources/ blocked", checkBash(`echo test > ${VAULT}Sources/test.md`), "block");
test("echo to root blocked", checkBash(`echo test > ${VAULT}test.md`), "block");
test("rm in Library/ blocked", checkBash(`rm ${VAULT}Library/book.md`), "block");
test("ls (no write) no action", checkBash("ls /tmp"), null);
test("git command no action", checkBash("git status"), null);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
