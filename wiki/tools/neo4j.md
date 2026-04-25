---
title: Neo4j
category: tools
aliases:
  - Neo4j
sourceLabels:
  - Transcript-derived
  - Public-web supporting context
last_auto_summarized: '2026-04-25T05:18:25.033Z'
---
# Neo4j

## Summary

Neo4j is a graph database company and platform used for storing, querying, and analyzing connected data. In this wiki's conference context, Neo4j is important because it gives a concrete implementation surface to the ideas behind [[knowledge-graphs]] and [[context-graphs]]: representing entities, relationships, evidence, and provenance as inspectable structure rather than as flattened prompt text.

The linked Nyah Macklin talk frames Neo4j less as a generic database vendor and more as part of the production vocabulary for auditable agents. When an agent system needs to explain what context it used, where that context came from, and how pieces of evidence relate to one another, a graph database can make those links durable and queryable.

## Why It Matters

Neo4j matters in AI engineering because graph infrastructure gives teams a way to model relationships that are otherwise easy to lose in vector stores, logs, or long text blobs. A knowledge graph can connect users, documents, claims, tool calls, retrieved passages, decisions, and downstream actions, preserving the relational context that makes an agent's behavior easier to inspect.

That connects directly to [[knowledge-graphs]], where the value is not just storing facts but preserving the links that make those facts explainable and reusable. It also connects to [[agent-auditability]]: if context is represented as a graph, engineers can ask sharper questions about what information was available, which nodes or edges influenced a response, and where a failure may have entered the system.

For production agent systems, this puts Neo4j in the memory, context, and infrastructure layer of the stack. The engineering pressure is not simply to remember more, but to make remembered context structured enough that teams can trace, debug, govern, and improve agent behavior after the fact.

## Why It Mattered at AI Engineer Miami

The transcript ties Neo4j to [[agent-auditability]], [[context-graphs]], and [[knowledge-graphs]] through Nyah Macklin's talk on auditable agents. The conference signal is that graph databases were being discussed as part of an implementation strategy for agent transparency: representing context as a graph so relationships, provenance, and reasoning paths are not flattened into unstructured text.

That makes Neo4j a concrete example of the broader theme behind context graphs. Agents need more than larger prompts or ad hoc memory stores when their behavior must be inspected later. A graph model can expose the structure of context: what entities were involved, what evidence supported them, how they were connected, and how those connections changed over time.

In that sense, Neo4j appears here alongside auditability and knowledge-graph practice because it anchors a practical question raised by the conference: how do teams build agent systems whose context can be queried and audited after the agent acts?

## Conference Reading

When this page links to a single talk, treat Neo4j as part of that talk's implementation story for context graphs and auditable agents. The useful reading is not simply that Neo4j was named, but that graph databases are one way to make agent context durable, relational, and inspectable.

Read the official public-web context only as background on what Neo4j provides outside the transcript. The conference evidence remains primary: Neo4j matters here because it helps anchor the discussion of [[context-graphs]] and [[knowledge-graphs]] in a concrete tool that can support traceable agent systems.

## Talks That Mention or Center It

- [[2026-04-21-nyah-macklin-context-graphs-for-auditable-agents|Context Graphs for Auditable Agents]] by Nyah Macklin

## Related Pages

- Topics: [[agent-auditability]], [[context-graphs]], [[knowledge-graphs]]
- Companies: [[neo4j]]

## Sources

- **Transcript-derived:** `/tmp/aie-miami-transcript.txt` and `/tmp/aie-miami-part2-transcript.txt`.
- **Official conference site:** [https://www.ai.engineer/miami](https://www.ai.engineer/miami).
- **Public-web supporting context:** [https://neo4j.com/](https://neo4j.com/).
