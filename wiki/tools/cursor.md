---
title: Cursor
category: tools
aliases:
  - Cursor
sourceLabels:
  - Transcript-derived
  - Public-web supporting context
last_auto_summarized: '2026-04-25T17:33:19.337Z'
---
# Cursor

## Summary

Cursor is an AI-native code editor and agentic development environment built around the full software loop: reading a repository, selecting context, asking a model for help, editing files, running commands, inspecting diffs, and deciding what should actually ship.

In the Miami wiki, Cursor is not just a popular developer tool. It is one of the clearest examples of the IDE becoming an orchestration layer for AI engineering. The editor is where project context, model calls, terminal execution, background agent work, code review, and human judgment meet. That makes Cursor a useful lens for the conference's larger claim that coding agents become valuable when they are embedded in real development workflows rather than treated as separate chat windows.

The connected talks made that role specific from several angles. David Gomes's Cursor-affiliated session treated the IDE as a changing workplace rather than a vanishing category: a place that increasingly coordinates agents, background implementation, terminal actions, context, and review. Diane Macklin's talk framed adoption around everyday builders learning how to fit coding agents into normal development habits. Geoffrey Huntley's economics argument pushed the same tool in another direction: if code generation gets dramatically cheaper, the production environment still has to make generated changes understandable, testable, reviewable, and maintainable.

## Why It Matters

Cursor matters because it sits at the point where model capability turns into developer behavior. A stronger coding model is only useful if the working environment can show it the right files, constrain the requested change, run the relevant commands, expose the diff clearly, and keep the human reviewer oriented. Cursor turns those concerns into interface and workflow questions rather than abstract AI capability questions.

That connects it directly to [[ai-adoption]] and [[developer-experience]]. Diane Macklin's everyday-coding-agents framing treats adoption as a practical matter: can individual builders and teams fit agents into ordinary work without losing control of the codebase? Cursor is one of the places where that fit is tested. The relevant questions are concrete: does the agent have enough context, does the developer understand what changed, can the workflow recover from mistakes, and does the tool feel reliable enough to become a daily habit?

It also anchors [[future-of-ides]]. David Gomes's Cursor-affiliated talk, [[2026-04-21-david-gomes-ides-are-dead-long-live-ides|IDEs Are Dead, Long Live IDEs]], frames the IDE not as disappearing, but as changing jobs. In that view, the IDE becomes a control plane for local context, background workers, terminal actions, review surfaces, and agent-mediated implementation. Cursor is one of the clearest product examples of that shift because it keeps the familiar editor surface while expanding what the editor is responsible for coordinating.

For [[software-3]] and [[software-economics]], Cursor is where the cost curve becomes operational. Geoffrey Huntley's argument about software development costs falling only matters if generated code can move through the actual production system: context gathering, implementation, verification, review, and maintenance. Cursor represents one attempt to make cheaper code generation useful without pretending that engineering judgment, testing, or maintainability have disappeared.

## Why It Mattered at AI Engineer Miami

The transcript ties Cursor to [[ai-adoption]], [[coding-agents]], [[developer-experience]], [[future-of-ides]], [[software-3]], [[software-economics]]. Across those connections, Cursor stood for a specific pressure point: if agents are going to write more code, the development environment has to make that work visible, reviewable, and economically useful.

Geoffrey Huntley's session used AI-assisted development as part of a broader claim that software production costs are falling sharply. In that context, Cursor is one of the practical tools through which lower-cost generation can enter a real repository. The point is not just that an editor can call a model. The point is that generated code still has to pass through the same production loop as any other change: local context, command execution, inspection, review, debugging, and maintenance.

Diane Macklin's session connected everyday coding agents to adoption by builders and teams. Cursor fits that story as an interface where agent work can become part of ordinary development rather than a side experiment. Its relevance to [[developer-experience]] is practical: the tool has to keep the developer aware of what the agent is doing, what files are changing, which commands have run, and when human judgment should override automation.

David Gomes's talk made Cursor especially central. [[2026-04-21-david-gomes-ides-are-dead-long-live-ides|IDEs Are Dead, Long Live IDEs]] treated the IDE itself as the object of change: still the developer's workplace, but increasingly responsible for coordinating agents, context, execution, and review. That made Cursor one of the conference's most concrete examples of a tool category being redefined by agentic software work.

## Conference Reading

Read Cursor as one of the conference's clearest examples of tool pressure becoming workflow pressure. The important question is not only what Cursor can generate, but what kind of development loop it creates around generation: who supplies context, where commands run, how diffs are inspected, how mistakes are caught, and how the developer keeps enough situational awareness to trust, revise, or reject the result.

When this page links to a single talk, treat Cursor as part of that talk's implementation story. When it links to several talks, treat it as a cross-cutting primitive in the AI engineering stack: an adoption surface, an IDE redesign signal, and a practical test of whether coding agents can improve software economics while preserving the review habits that make software work reliable.

## Talks That Mention or Center It

- [[2026-04-20-geoffrey-huntley-software-development-now-costs-less-than-minimum-wage|Software Development Now Costs Less Than Minimum Wage]] by Geoffrey Huntley
- [[2026-04-21-diane-macklin-building-ai-apps-with-everyday-coding-agents|Building AI Apps with Everyday Coding Agents]] by Diane Macklin
- [[2026-04-21-david-gomes-ides-are-dead-long-live-ides|IDEs Are Dead, Long Live IDEs]] by David Gomes

## Related Pages

- Topics: [[ai-adoption]], [[coding-agents]], [[developer-experience]], [[future-of-ides]], [[software-3]], [[software-economics]]
- Companies: [[cursor]], [[independent]], [[latent-patterns]]

## Sources

- **Transcript-derived:** `/tmp/aie-miami-transcript.txt` and `/tmp/aie-miami-part2-transcript.txt`.
- **Conference website reference:** [https://www.ai.engineer/miami](https://www.ai.engineer/miami).
- **Public-web supporting context:** [https://cursor.com/](https://cursor.com/).
