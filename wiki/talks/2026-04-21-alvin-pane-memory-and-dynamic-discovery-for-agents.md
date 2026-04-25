---
title: Memory and Dynamic Discovery for Agents
category: talks
aliases:
  - Memory and Dynamic Discovery for Agents
sourceLabels:
  - Transcript-derived
  - Official conference site
  - Public-web supporting context
last_auto_summarized: '2026-04-25T12:02:49.359Z'
---
# Memory and Dynamic Discovery for Agents

## Summary

Memory and Dynamic Discovery for Agents was Alvin Pane's AI Engineer Miami 2026 talk on agentic memory. Pane started from the familiar failure mode where a productive agent session suddenly becomes less useful because the agent has lost the right context. He argued that the usual response, adding more retrieval infrastructure around the agent, should be questioned rather than assumed.

The core thesis was that memory is not a single retrieval trick. For real agents, memory includes state, curation, and lifecycle: where context lives, how the right context enters the model window, and how systems decide what to persist, update, or forget as the world changes.

## Key Ideas

- Dynamic memory discovery: Pane described a simple approach using raw JSON sessions on a file system, an agent orchestrator with file-system tools, recursive model calls, and a plan file for tracking what has been found or remains uncertain.
- Fewer assumptions: the talk used Occam's razor and the "bitter lesson" as design frames, arguing that extra components such as embedding models, chunking, and rerankers each add a bet about what relevance will mean later.
- Memory as a spectrum: Pane contrasted raw memory that lets an agent reason directly over stored state with more derived structures that may be necessary when production latency and cost constraints make pure reasoning too expensive.
- Production failure modes: the talk called out temporal reasoning, entity disambiguation, and principled forgetting as hard problems that remain even when benchmark scores look strong.

## Why It Matters Here

This talk is one of the wiki's clearest links between [[topics/agent-memory|agent memory]], [[topics/dynamic-context|dynamic context]], and production [[topics/enterprise-agents|enterprise agents]]. Pane's OutRival example grounded the topic in digital workers that must decide who to contact, when to contact them, how to contact them, and what to store from each interaction. That context makes memory a core application architecture concern rather than a secondary retrieval feature.

## Speaker

- [[people/alvin-pane|Alvin Pane]] - AI Engineer Miami 2026 speaker; the transcript introduces him as a Miami-based builder working on OutRival after earlier work at AMD.

## Related Pages

- Company: [[companies/outrival|OutRival]]
- Topics: [[topics/agent-memory|agent memory]], [[topics/dynamic-context|dynamic context]], [[topics/context-engineering|context engineering]], [[topics/enterprise-agents|enterprise agents]], [[topics/personal-agents|personal agents]]

## Sources

- **Transcript-derived:** `/tmp/aie-miami-part2-transcript.txt`, Day 2 segment beginning around the introduction of Alvin Pane and covering agentic memory, dynamic memory discovery, long-mem eval, production constraints, temporal reasoning, entity disambiguation, and forgetting.
- **Official conference site:** https://www.ai.engineer/miami
- **Public-web supporting context:** https://www.linkedin.com/in/alvin-pane for public identity and OutRival context.
