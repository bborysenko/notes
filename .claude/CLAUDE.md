# CLAUDE.md

## What this is

An Obsidian vault at `~/Notes/`. Not a code project. The AI agent's role is to compile knowledge and answer questions based on compiled knowledge, source materials, and personal notes.

## Write boundary

A PreToolUse hook (`.claude/hooks/write-boundary.ts`) enforces this. The agent can write freely to `Knowledge/`. For everything else, the hook prompts the user to approve or deny each edit.

## Vault structure

| Folder | Purpose | Who writes |
|--------|---------|------------|
| `Assets/` | Images and attachments | User |
| `Journal/` | Daily reflections (not work logs) | User |
| `Knowledge/` | AI-compiled topic articles | AI agent |
| `Library/` | User's notes on books, articles, podcasts | User |
| `Sources/` | Raw articles saved via Web Clipper | Web Clipper; AI updates descriptions and keyword tags |
| `Templates/` | Note templates | User |
| `Work/` | Employer-specific content (never synced) | User |
| Root (`*.md`) | Personal notes, reflections, decisions | User |

## Organization system

**Tags** handle all organization. No frontmatter properties for organizing notes.

- `#area/{context}` for work context: career, writing, learning, or company/client names
- `#collections/{name}` for grouping: books, people, writings
- `#keyword/{topic}` for topics: leadership, platform-engineering
- `#status/{value}` for state: to-read, reading, done, draft, published

Tags are flat, two levels max. No nesting like `#area/company/client`.

**Properties** (frontmatter) only on Sources. Web Clipper fills source, title, author, published, created. Claude Code fills description and suggests keyword tags based on existing ones.

**Bases** (`.base` files) use formulas to extract tag values into sortable table columns. The formula pattern:

```
file.tags.filter(value.startsWith("#status/")).map(value.split("/")[1].replace(/-/g, " ").title()).join("")
```

## Writing style

- No em dashes. Use colons, periods, or commas.
- Write concise, natural English.

## Hooks

Run tests after modifying hooks:

```sh
npx tsx .claude/hooks/write-boundary.test.ts
```
