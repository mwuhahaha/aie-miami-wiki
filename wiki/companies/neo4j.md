---
title: Neo4j
category: companies
aliases:
  - Neo4j
sourceLabels:
  - Transcript-derived
  - Conference website reference
  - Public-web supporting context
last_auto_summarized: '2026-04-25T05:14:44.233Z'
---
# Neo4j

## Summary

Neo4j is the graph database company connected here through Nyah Macklin's AI Engineer Miami talk, [[2026-04-21-nyah-macklin-context-graphs-for-auditable-agents|Context Graphs for Auditable Agents]]. The connection is not a generic vendor mention: Macklin's talk used graph structure as the core mechanism for making agent context inspectable. In that framing, the important objects around an agent - entities, relationships, retrieved evidence, intermediate state, and later actions - are represented as connected data rather than scattered logs or opaque prompt history. Neo4j therefore enters the wiki as an example of graph infrastructure applied to a specific AI engineering problem: making it possible to ask what an agent knew, how pieces of evidence were connected, and why one step followed from another.

## Why It Matters

Neo4j matters to AI engineering in this wiki because it gives a database-shaped vocabulary to [[knowledge-graphs]], [[context-graphs]], and [[agent-auditability]]. Those topics all point at the same operational pressure: once agents move beyond chat and begin recommending or taking consequential actions, teams need ways to reconstruct the path from input to decision. A graph database treats relationships as first-class data, which makes it easier to traverse from an output back to the entities, documents, claims, tool calls, and state transitions that influenced it. That is the practical distinction highlighted by the connected talk: auditability improves when context is modeled as a queryable graph instead of being left as disconnected chunks of text or chronological logs.

## Why It Mattered at AI Engineer Miami

At AI Engineer Miami, [[neo4j|Neo4j]] was attached to 1 session(s). Those sessions were not interchangeable sponsor mentions; they supplied evidence for [[agent-auditability]], [[context-graphs]], [[knowledge-graphs]]. In Nyah Macklin's talk, the Neo4j connection framed graphs as infrastructure for trust in agent systems. The point was that agent memory and retrieved context can be organized around explicit relationships: which entity was involved, which source supported a claim, what state changed, and how a later recommendation depended on earlier evidence. That made Neo4j a concrete example of how graph tooling can support audit trails for agent behavior, especially when teams need to inspect links between entities, evidence, decisions, and state transitions after the fact.

## Conference Interpretation

Neo4j's appearance at the conference marked graph infrastructure as part of the practical agent stack. The conference-relevant idea was not simply that knowledge graphs are useful background data structures; it was that context graphs can preserve the relationship structure an agent used while reasoning or acting. In that interpretation, Neo4j stood for a shift away from retrieval as a bag of isolated snippets and toward context as an inspectable graph of evidence, state, and downstream action. That made the company relevant to the event's broader concern with production agents: systems need not only better context, but context that can be queried, checked, and explained later.

## Talks That Mention or Center It

- [[2026-04-21-nyah-macklin-context-graphs-for-auditable-agents|Context Graphs for Auditable Agents]] by Nyah Macklin - Nyah Macklin used graph thinking to connect context engineering and auditability: agent state becomes more trustworthy when relationships and evidence are queryable.

## Related Topics and Tools

- Topics: [[agent-auditability]], [[context-graphs]], [[knowledge-graphs]]
- Tools/products: [[neo4j]]

## Sources

- **Transcript-derived:** `/tmp/aie-miami-transcript.txt` and `/tmp/aie-miami-part2-transcript.txt`.
- **Conference website reference:** [https://www.ai.engineer/miami](https://www.ai.engineer/miami).
- **Public-web supporting context:** [https://neo4j.com/](https://neo4j.com/).
