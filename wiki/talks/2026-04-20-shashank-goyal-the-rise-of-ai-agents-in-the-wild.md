---
title: "The Rise of AI Agents in the Wild"
category: "talks"
aliases:
  - "The Rise of AI Agents in the Wild"
sourceLabels:
  - "Transcript-derived"
  - "Official conference site"
  - "Public-web supporting context"
---

# The Rise of AI Agents in the Wild

## Summary

The Rise of AI Agents in the Wild was a 2026-04-20 AI Engineer Miami 2026 session by [[shashank-goyal|Shashank Goyal]], affiliated in the conference materials with [[openrouter|OpenRouter]]. The official schedule placed it at **11:25 AM**.

## Talk Thesis

Shashank Goyal used OpenRouter's production traffic lens to shift evaluation from static benchmarks toward real agent behavior: routing, long contexts, tool use, cost, and reliability.

## Detailed Transcript-Derived Summary

The transcript segment for this talk runs across lines 2327-2839 of `/tmp/aie-miami-transcript.txt`. Read as part of the full conference, the talk contributes to [[agent-evaluations]], [[llm-routing]], [[production-agents]].

The strongest transcript pattern is that this session turns a broad AI-engineering claim into operational detail. It discusses concrete constraints, tradeoffs, or product surfaces rather than leaving the topic at trend level. In the local conference arc, it sits near talks about agent-evaluations, llm-routing, production-agents, so the page should be read as part of a larger argument about how agents move from demos into engineering practice.

## Transcript Evidence

- And combining all of this, the growth in tokens, the growth in models, the growth in ability, is I would say why agents are now a primary workload on the platform.
- So today we'll be talking about the rise of AI agents, and I'm sure you guys are gonna hear this word so many times that I apologize.
- There are different agents that write code, that review code, that do security analysis, that do issue triaging.
- So again, go to the OpenRouter rankings chart whenever you guys have time, but it'll really help you see the ecosystem from this top-down view and understand what models, what apps, how people are using them, and what people are building.
- What I found really cool is that the full code base that sets up Spawn, all of the integrations with the different agents and different cloud providers where you can deploy it, it's 100% agent-run code base.
- And it's very important for the workflows that you guys are building to evaluate them against multiple models, because you will find there's a big Pareto frontier of quality versus cost.

## Why It Matters

Outside the conference, this topic matters because AI engineering is becoming a systems discipline. The relevant decisions are not only which model to call; they include where context comes from, how outputs are reviewed, what runtime executes agent work, and which interfaces are safe enough for repeated use. This talk gives one slice of that larger production problem.

## Why It Mattered at AI Engineer Miami

At AI Engineer Miami, the session gave readers a concrete anchor for [[agent-evaluations]], [[llm-routing]], [[production-agents]]. It also connected conference-level ideas to [[openrouter|OpenRouter]], where the public context is: OpenRouter provides a unified interface for accessing many models, which makes it relevant to model routing and real-world usage comparisons.

## Important Concepts and Tools

- [[openrouter|OpenRouter]]: Unified model gateway and marketplace used in the transcript as a data source for real-world agent/model usage.

## Connections to Other Talks

- This session is a standalone framing talk with fewer direct shared-tool links than the rest of the program.

## Representative Quote

> And combining all of this, the growth in tokens, the growth in models, the growth in ability, is I would say why agents are now a primary workload on the platform.

Quote label: **Transcript-derived**.

## Related Pages

- Speakers: [[shashank-goyal|Shashank Goyal]]
- Company: [[openrouter|OpenRouter]]
- Topics: [[agent-evaluations]], [[llm-routing]], [[production-agents]]
- Tools/products: [[openrouter]]

## Sources

- **Transcript-derived:** `/tmp/aie-miami-transcript.txt` and `/tmp/aie-miami-part2-transcript.txt`.
- **Official conference site:** [https://www.ai.engineer/miami](https://www.ai.engineer/miami).
- **Public-web supporting context:** [https://openrouter.ai/](https://openrouter.ai/).
