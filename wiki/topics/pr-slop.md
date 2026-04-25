---
title: Pr Slop
category: topics
aliases:
  - Pr Slop
sourceLabels:
  - Transcript-derived
  - Official conference site
  - Public-web supporting context
last_auto_summarized: '2026-04-25T12:19:47.584Z'
---
# Pr Slop

## Summary

A transcript-derived problem category for low-quality AI-generated pull requests that increase review load instead of increasing confidence in the software. In Dexter Horthy's RPI talk, PR slop is the visible failure mode of coding agents that start editing before they have gathered enough context, lose the research trail that explains the change, or produce a plausible diff without the evidence a reviewer needs to trust it. The page connects that failure to [[mcp]] as the tool-facing context layer and [[humanlayer]] as the approval layer: without reliable context access and human checkpoints, a coding agent can turn speed into an opaque review burden.

## Why It Matters

PR slop matters because it shifts the cost of agent work onto the reviewer. A pull request can look complete while hiding the assumptions, source context, tool calls, and decision points that produced it, forcing the human reviewer to reconstruct the agent's reasoning after the fact. The connected [[humanlayer]] and [[mcp]] pages make the control problem concrete: agents need scoped access to tools and data, inspectable context from those tools, and approval checkpoints for uncertain or consequential actions. Otherwise the generated pull request becomes another artifact the team has to debug before it can even evaluate the code.

## Why It Mattered at AI Engineer Miami

At AI Engineer Miami, [[pr-slop]] connected 1 talk(s). Dexter Horthy's [[2026-04-20-dexter-horthy-everything-we-got-wrong-about-rpi|Everything We got Wrong About RPI]] used the problem to show why Research / Plan / Implement is an operating pattern, not just a prompt format. The talk framed bad AI pull requests as a control-flow failure: agents need to gather evidence before editing, preserve intent through planning, implement against that plan, and route ambiguous or high-impact choices back through human approval instead of burying them inside a large diff that reviewers have to reverse-engineer.

## Synthesis Pattern

The pattern is clearest when [[pr-slop]] is read alongside the RPI talk, [[humanlayer]], and [[mcp]]. Together they describe a stack for making agent-written code reviewable: [[mcp]] gives agents a structured way to discover and call external capabilities, [[humanlayer]] supplies human-in-the-loop approvals and intervention points, and RPI gives the workflow a sequence that separates research, planning, and implementation. PR slop is what happens when those layers are weak or missing: the agent still produces code, but the surrounding evidence, intent, and review controls do not travel with it.

## Talks That Mention or Center It

- [[2026-04-20-dexter-horthy-everything-we-got-wrong-about-rpi|Everything We got Wrong About RPI]] by Dexter Horthy - Dexter Horthy reframed Research / Plan / Implement as an operating system for coding agents that needs evidence, control flow, context discipline, and review pressure rather than prompt vibes.

## Related Companies, Tools, and Topics

- Companies: [[humanlayer]]
- Tools/products: [[humanlayer]], [[mcp]]

## Source Labels

- **Transcript-derived:** cross-talk pattern and talk connections.
- **Official conference site:** official schedule, speaker, affiliation, and abstract context.
- **Public-web supporting context:** official URLs for linked tools/products where present.

## Sources

- **Transcript-derived:** `/tmp/aie-miami-transcript.txt` and `/tmp/aie-miami-part2-transcript.txt`.
- **Official conference site:** [https://www.ai.engineer/miami](https://www.ai.engineer/miami).
- **Public-web supporting context:** [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/).
- **Public-web supporting context:** [https://www.humanlayer.dev/](https://www.humanlayer.dev/).
