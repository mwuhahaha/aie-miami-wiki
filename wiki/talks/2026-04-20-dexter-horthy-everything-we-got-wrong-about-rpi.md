---
title: Everything We got Wrong About RPI
category: talks
aliases:
  - Everything We got Wrong About RPI
sourceLabels:
  - Transcript-derived
  - Official conference site
  - Public-web supporting context
last_auto_summarized: '2026-04-25T21:35:12.157Z'
---
# Everything We got Wrong About RPI

## Summary
Everything We got Wrong About RPI was an AI Engineer Miami 2026 Day 1 session by [[people/dexter-horthy|Dexter Horthy]] about why promising AI coding workflows break down once they have to be reviewed, executed, isolated, and trusted inside real engineering systems. In this wiki, the talk is best read as a concrete bridge between three implementation themes: [[topics/agent-runtime|Agent Runtime]], the execution layer that turns model output into running work; [[topics/sandboxed-compute|Sandboxed Compute]], the safety boundary needed when agents run code, touch repositories, or produce artifacts; and [[topics/pr-slop|Pr Slop]], the failure mode where AI-generated pull requests increase reviewer burden instead of increasing delivery confidence. The title points at a retrospective lesson: the hard part is not simply getting an AI system to propose code, but building the operational machinery around that proposal so humans can inspect it, reproduce it, and decide whether it belongs in production.

The linked Cloudflare pages add infrastructure context for that lesson. [[tools/cloudflare-workers|Cloudflare Workers]] and [[companies/cloudflare|Cloudflare]] sit adjacent to the talk because agent workloads need places to run that are fast, isolated, observable, and practical for developer-facing products. Read alongside [[events/2026-04-20-day1|AI Engineer Miami 2026 Day 1]], this session belongs to the conference's builder-oriented thread: moving from demos of autonomous coding to systems that handle runtime constraints, sandbox boundaries, pull request quality, and the day-to-day mechanics of shipping dependable AI engineering tools.

## Conference Context
The session belongs to the conference's practical AI engineering thread: how builders move from model capability to systems that can be shipped, inspected, operated, and improved. In this wiki, read it alongside [[topics/agent-runtime|Agent Runtime]], [[topics/sandboxed-compute|Sandboxed Compute]] because those pages describe the implementation pressures that the title and transcript evidence point toward.

## Related Pages
- Speaker: [[people/dexter-horthy|Dexter Horthy]]
- Topics: [[topics/agent-runtime|Agent Runtime]], [[topics/sandboxed-compute|Sandboxed Compute]]
- Tools/products: [[tools/cloudflare-workers|Cloudflare Workers]]
- Companies: [[companies/cloudflare|Cloudflare]]

## Sources

- **Transcript-derived:** `/tmp/aie-miami-transcript.txt`.
- **Conference website reference:** https://www.ai.engineer/miami
- **Public-web supporting context:** no additional public-web supporting context is cited on this page.
