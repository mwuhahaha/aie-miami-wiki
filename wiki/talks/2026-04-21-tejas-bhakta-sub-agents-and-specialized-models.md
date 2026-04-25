---
title: "Sub-agents and Specialized Models"
category: "talks"
aliases:
  - "Sub-agents and Specialized Models"
sourceLabels:
  - "Transcript-derived"
  - "Official conference site"
  - "Public-web supporting context"
---
# Sub-agents and Specialized Models

## Summary

Sub-agents and Specialized Models was an AI Engineer Miami 2026 Day 2 session by Tejas Bhakta about splitting agent work across specialized contexts and models.

For a new reader, the main value of the page is orientation: what problem the session was addressing, why it mattered to AI engineers, and where to continue reading next. In this wiki it connects most directly to Sub Agents, Specialized Models, and Coding Agents, giving readers a path from the talk into the broader conference themes. The related tools and concepts (Morph Llm) and company links (Morph LLM) show where the session touches concrete products, platforms, or engineering practices.
Transcript evidence emphasizes "So basically when your main model like Opus, for example, wants to spit out like three task agents, those should all share the same prefix, so you get the caching, it'll still be fast." and "So for task agents, which I think you should still be using a frontier model, not a specialized model, you should be sharing the prefix cache.", which anchors the summary in the public transcript.

## Talk Thesis

Tejas Bhakta argued for decomposing agent work: specialized models and sub-agents can improve speed, cost, and fit when orchestration is explicit.

## Detailed Transcript-Derived Summary

The transcript segment for this talk runs across lines 1075-1274 of `/tmp/aie-miami-part2-transcript.txt`. Read as part of the full conference, the talk contributes to [[sub-agents]], [[specialized-models]], [[coding-agents]].

The strongest transcript pattern is that this session turns a broad AI-engineering claim into operational detail. It discusses concrete constraints, tradeoffs, or product surfaces rather than leaving the topic at trend level. In the local conference arc, it sits near talks about sub-agents, specialized-models, coding-agents, so the page should be read as part of a larger argument about how agents move from demos into engineering practice.

## Transcript Evidence

- So basically when your main model like Opus, for example, wants to spit out like three task agents, those should all share the same prefix, so you get the caching, it'll still be fast.
- So for task agents, which I think you should still be using a frontier model, not a specialized model, you should be sharing the prefix cache.
- You should be doing this all on one board, but Reality plays out different in theory Yeah, getting back to the topic Specialized models are a great way to actually have a product mode because everyone is sort of building the same thing, right?
- Cool, yeah, and so hopefully you got out of this talk that everything is models.
- And again, context length matters, that's why you should use subagents.
- And so that's like marketing agents, like a customer support agent, the agent writes SQL, marketing agents, they do things that call Apollo APIs and send emails.

## Why It Matters

Outside the conference, this topic matters because AI engineering is becoming a systems discipline. The relevant decisions are not only which model to call; they include where context comes from, how outputs are reviewed, what runtime executes agent work, and which interfaces are safe enough for repeated use. This talk gives one slice of that larger production problem.

## Why It Mattered at AI Engineer Miami

At AI Engineer Miami, the session gave readers a concrete anchor for [[sub-agents]], [[specialized-models]], [[coding-agents]]. It also connected conference-level ideas to [[morph-llm|Morph LLM]], where the public context is: Specialized model company represented by Tejas Bhakta.

## Important Concepts and Tools

- [[morph-llm|Morph LLM]]: Specialized model company represented by Tejas Bhakta.

## Connections to Other Talks

- [[2026-04-21-diane-macklin-building-ai-apps-with-everyday-coding-agents|Building AI Apps with Everyday Coding Agents]] by Diane Macklin - shared thread: coding-agents
- [[2026-04-21-david-gomes-ides-are-dead-long-live-ides|IDEs Are Dead, Long Live IDEs]] by David Gomes - shared thread: coding-agents

## Representative Quote

> So basically when your main model like Opus, for example, wants to spit out like three task agents, those should all share the same prefix, so you get the caching, it'll still be fast.

Quote label: **Transcript-derived**.

## Related Pages

- Speakers: [[tejas-bhakta|Tejas Bhakta]]
- Company: [[morph-llm|Morph LLM]]
- Topics: [[sub-agents]], [[specialized-models]], [[coding-agents]]
- Tools/products: [[morph-llm]]

## Sources

- **Transcript-derived:** `/tmp/aie-miami-transcript.txt` and `/tmp/aie-miami-part2-transcript.txt`.
- **Conference website reference:** [https://www.ai.engineer/miami](https://www.ai.engineer/miami).
- **Public-web supporting context:** [https://www.morphllm.com/](https://www.morphllm.com/).
