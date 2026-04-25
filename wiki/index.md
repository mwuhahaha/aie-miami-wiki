---
title: "AIE Wiki Index"
category: "root"
aliases:
  - "AIE Wiki"
sourceLabels:
  - "Transcript-derived"
  - "Conference website reference"
  - "Public-web supporting context"
---

# AIE Wiki Index

AIE Wiki is a standalone read-only public wiki for AI Engineer Miami 2026. It combines two allowed transcript files, the official conference website, and clearly labeled public-web supporting context from official company/product/docs pages. The original concept was inspired by Andrej Karpathy's public [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) pattern: instead of using raw transcripts as one-off retrieval input, an LLM agent maintains a persistent, interlinked markdown wiki that compounds as sources are processed.

## What This Wiki Is For

The goal is synthesis. Talk pages explain what was argued and why it mattered. Topic pages connect talks into conference-level patterns such as [[topics/coding-agents|coding-agents]], [[topics/mcp-vs-skills|mcp-vs-skills]], [[topics/agent-runtime|agent-runtime]], [[topics/context-engineering|context-engineering]], [[topics/agent-ready-interfaces|agent-ready-interfaces]], [[topics/latency-debt|latency-debt]], and [[topics/future-of-ides|future-of-ides]].

## How It Was Built

The source videos did not have directly available transcripts, so their YouTube audio was downloaded and transcribed with Whisper before wiki generation. Those two transcript files became the primary source corpus: `/tmp/aie-miami-transcript.txt` for April 20 and `/tmp/aie-miami-part2-transcript.txt` for April 21.

From there, an LLM-assisted pipeline turned the transcripts into a public markdown knowledge base: talk pages, speaker pages, company/tool/topic pages, event day indexes, quotes, source labels, and cross-links. The static Express app reads those markdown files, renders wikilinks into navigable public pages, builds backlinks and graph data at request time, and exposes only read-only API routes. Mutating authoring endpoints are intentionally blocked for this public deployment.

The implementation follows the spirit of Karpathy's LLM Wiki idea while adapting it for a public event wiki: raw sources remain bounded, the generated wiki is the readable synthesis layer, `AGENT.md` documents the source and read-only rules, and run receipts under `.ops/state/runs/` record rebuild and generation passes.

## Source Labels

- **Transcript-derived:** claims grounded in `/tmp/aie-miami-transcript.txt` or `/tmp/aie-miami-part2-transcript.txt`.
- **Conference website reference:** dates, location, speaker roster, schedule, venue, and official talk framing from [https://www.ai.engineer/miami](https://www.ai.engineer/miami).
- **Public-web supporting context:** official company, product, documentation, or GitHub-style public URLs in article source sections.

## Start Here

- [[events/2026-04-20-day1|AI Engineer Miami 2026 Day 1]]
- [[events/2026-04-21-day2|AI Engineer Miami 2026 Day 2]]
- [[mcp-vs-skills|MCP vs Skills]]
- [[agent-runtime|Agent Runtime]]
- [[quotes|Quotes]]
- [[resources/source-boundary|Source Boundary]]

## Talk Index

- [[2026-04-20-gabe-greenberg-opening-remarks|Opening Remarks]] - Gabe Greenberg, [[companies/g2i|G2i]]
- [[2026-04-20-dax-raad-you-don-t-have-any-good-ideas|You Don't Have Any Good Ideas]] - Dax Raad, [[companies/opencode|OpenCode]]
- [[2026-04-20-dexter-horthy-everything-we-got-wrong-about-rpi|Everything We got Wrong About RPI]] - Dexter Horthy, [[companies/humanlayer|HumanLayer]]
- [[2026-04-20-max-stoiber-what-does-good-taste-in-dx-look-like-in-the-age-of-agents|What Does Good Taste in DX Look Like in the Age of Agents?]] - Max Stoiber, [[companies/openai|OpenAI]]
- [[2026-04-20-ben-vinegar-from-local-to-remote-working-with-coding-agents-over-ssh|From Local to Remote: Working with Coding Agents over SSH]] - Ben Vinegar, [[companies/modem|Modem]]
- [[2026-04-20-shashank-goyal-the-rise-of-ai-agents-in-the-wild|The Rise of AI Agents in the Wild]] - Shashank Goyal, [[companies/openrouter|OpenRouter]]
- [[2026-04-20-nnenna-ndukwe-how-to-embed-ai-code-quality-gates-in-your-sdlc|How to Embed AI Code Quality Gates in Your SDLC]] - Nnenna Ndukwe, [[companies/qodo|Qodo]]
- [[2026-04-20-geoffrey-huntley-software-development-now-costs-less-than-minimum-wage|Software Development Now Costs Less Than Minimum Wage]] - Geoffrey Huntley, [[companies/latent-patterns|Latent Patterns]]
- [[2026-04-20-philip-kiely-how-to-quantize-models-without-killing-quality|How to quantize models without killing quality]] - Philip Kiely, [[companies/baseten|Baseten]]
- [[2026-04-20-alisa-fortin-from-prompt-to-production-maximizing-value-with-google-s-genmedia-models|From Prompt to Production: Maximizing Value with Google's GenMedia Models]] - Alisa Fortin and Guillaume Vernade, [[companies/google-deepmind|Google DeepMind]]
- [[2026-04-20-anna-juchnicki-from-tickets-to-prs-shipping-a-governed-snowflake-ops-agent-with-langgraph-and-mcp|From Tickets to PRs: Shipping a Governed Snowflake Ops Agent with LangGraph and MCP]] - Anna Juchnicki, [[companies/pinterest|Pinterest]]
- [[2026-04-20-kent-c-dodds-build-a-free-agent|Build a Free Agent]] - Kent C. Dodds, [[companies/kent-c-dodds-tech-llc|Kent C. Dodds Tech LLC]]
- [[2026-04-20-rita-kozlov-building-infrastructure-that-scales-to-a-billion-agents|Building Infrastructure That Scales to a Billion Agents]] - Rita Kozlov, [[companies/cloudflare|Cloudflare]]
- [[2026-04-20-ben-davis-you-re-using-the-wrong-ai-sdk|You're using the wrong AI SDK]] - Ben Davis, [[companies/t3|T3]]
- [[2026-04-21-david-house-transforming-programming-mindsets-case-studies-in-agentic-coding-adoption|Transforming Programming Mindsets: Case Studies in Agentic Coding Adoption]] - David House, [[companies/g2i|G2i]]
- [[2026-04-21-sarah-chieng-latency-debt-and-fast-coding-models|Latency Debt and Fast Coding Models]] - Sarah Chieng, [[companies/cerebras|Cerebras]]
- [[2026-04-21-lech-kalinowski-ambient-generative-ai-on-mobile|Ambient Generative AI on Mobile]] - Lech Kalinowski, [[companies/callstack|CallStack]]
- [[2026-04-21-tejas-bhakta-sub-agents-and-specialized-models|Sub-agents and Specialized Models]] - Tejas Bhakta, [[companies/morph-llm|Morph LLM]]
- [[2026-04-21-rick-blalock-coding-agents-are-eating-software|Coding Agents Are Eating Software]] - Rick Blalock, [[companies/agentuity|Agentuity]]
- [[2026-04-21-nyah-macklin-context-graphs-for-auditable-agents|Context Graphs for Auditable Agents]] - Nyah Macklin, [[companies/neo4j|Neo4j]]
- [[2026-04-21-lena-hall-my-robot-thinks-you-re-a-10|My Robot Thinks You're a 10]] - Lena Hall, [[companies/akamai|Akamai]]
- [[2026-04-21-dave-kiss-agent-ready-interfaces|Agent-ready Interfaces]] - Dave Kiss, [[companies/mux|Mux]]
- [[2026-04-21-alvin-pane-memory-and-dynamic-discovery-for-agents|Memory and Dynamic Discovery for Agents]] - Alvin Pane, [[companies/outrival|OutRival]]
- [[2026-04-21-erik-thorelli-agent-skills|Agent Skills]] - Erik Thorelli, [[companies/coderabbit|CodeRabbit]]
- [[2026-04-21-diane-macklin-building-ai-apps-with-everyday-coding-agents|Building AI Apps with Everyday Coding Agents]] - Diane Macklin, [[companies/independent|Independent]]
- [[2026-04-21-stefan-avram-the-multimodal-future-is-open-source|The Multimodal Future Is Open Source]] - Stefan Avram, [[companies/opencode|OpenCode]]
- [[2026-04-21-laurie-voss-mcp-vs-skills-evaluating-tool-interfaces-for-agents|MCP vs Skills: Evaluating Tool Interfaces for Agents]] - Laurie Voss, [[companies/arize-ai|Arize AI]]
- [[2026-04-21-david-gomes-ides-are-dead-long-live-ides|IDEs Are Dead, Long Live IDEs]] - David Gomes, [[companies/cursor|Cursor]]

## Strong Synthesis Trails

- **Agent interface design:** [[topics/mcp-vs-skills|mcp-vs-skills]], [[topics/agent-ready-interfaces|agent-ready-interfaces]], [[topics/agent-skills|agent-skills]], [[topics/mcp-agent-runtime|mcp-agent-runtime]]
- **Agent runtime and infrastructure:** [[topics/agent-runtime|agent-runtime]], [[topics/agent-infrastructure|agent-infrastructure]], [[topics/sandboxed-compute|sandboxed-compute]], [[topics/remote-coding-agents|remote-coding-agents]]
- **Engineering governance:** [[topics/agent-auditability|agent-auditability]], [[topics/governed-agents|governed-agents]], [[topics/code-quality-gates|code-quality-gates]], [[topics/production-agents|production-agents]]
- **Developer workflow:** [[topics/coding-agents|coding-agents]], [[topics/future-of-ides|future-of-ides]], [[topics/latency-debt|latency-debt]], [[topics/research-plan-implement|research-plan-implement]]
