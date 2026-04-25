# AGENT

This project is the public read-only AIE Wiki for AI Engineer Miami 2026.

## Read-only rules

- Do not expose authoring controls in the public UI for this project.
- Do not create, edit, rename, delete, AI-edit, AI-create, fork, category-create, or config-write pages through the app for this project.
- Mutating API endpoints must return `403` or `404` when this project is selected.
- The standalone app in this directory must register only `aie-miami-wiki`; do not expose `/garage/obsidian` projects from this public server.

## Source boundary

Allowed original corpus:

- Day 1 transcript: `/tmp/aie-miami-transcript.txt`
- Day 2 transcript: `/tmp/aie-miami-part2-transcript.txt`
- Official conference website: `https://www.ai.engineer/miami`

Do not use private `/garage/obsidian/conference-ai-miami`, generated `/garage/obsidian/conference-ai-miami-transcript`, queue state, diary projects, personal notes, local recordings, prior generated pages, or mixed-vault content as source material.

## Public-web enrichment

- Use public web sources only.
- Prefer official/public primary sources: company websites, product docs, GitHub/org pages, official speaker/company pages, official bios, or public documentation.
- Clearly label facts as `Transcript-derived`, `Official conference site`, or `Public-web supporting context`.
- If identity cannot be confidently resolved from transcript + public web, skip the page or mark it as low-confidence transcript evidence.

## Regeneration expectations

- Rebuild from the two transcript files, the official conference site, and curated public URLs.
- Preserve project-local `wiki/quotes.md`; do not append these quotes to the repo-global quote book.
- Write receipts under `.ops/state/runs/`.
- Run wikilink validation, source-boundary leak scan, citation/source scan, quote coverage, read-only endpoint tests, UI smoke tests, and calendar exclusion checks before publishing.
