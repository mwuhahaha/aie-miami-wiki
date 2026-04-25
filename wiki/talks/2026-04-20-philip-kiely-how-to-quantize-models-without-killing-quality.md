---
title: "How to quantize models without killing quality"
category: "talks"
aliases:
  - "How to quantize models without killing quality"
sourceLabels:
  - "Transcript-derived"
  - "Official conference site"
  - "Public-web supporting context"
---
# How to quantize models without killing quality

## Summary

How to quantize models without killing quality was an AI Engineer Miami 2026 Day 1 session by Philip Kiely about the conference themes around Model Quantization and Inference Optimization.

For a new reader, the main value of the page is orientation: what problem the session was addressing, why it mattered to AI engineers, and where to continue reading next. In this wiki it connects most directly to Model Quantization and Inference Optimization, giving readers a path from the talk into the broader conference themes. The related tools and concepts (Baseten) and company links (Baseten) show where the session touches concrete products, platforms, or engineering practices.
Transcript evidence emphasizes "Today on trial, we have Philip Kiley trying to redeem himself with a talk, how to quantize models without killing quality." and "You know, all of those greedy influence providers are out there trying to rip you off, selling you poor-quality tokens at frontier prices by just squishing their models into these little tiny 4-bit number formats.", which anchors the summary in the public transcript.

## Talk Thesis

Philip Kiely explained quantization as an engineering control surface rather than a blunt compression trick: the right low-precision format can reduce cost without destroying quality.

## Detailed Transcript-Derived Summary

The transcript segment for this talk runs across lines 4446-4821 of `/tmp/aie-miami-transcript.txt`. Read as part of the full conference, the talk contributes to [[model-quantization]], [[inference-optimization]].

The strongest transcript pattern is that this session turns a broad AI-engineering claim into operational detail. It discusses concrete constraints, tradeoffs, or product surfaces rather than leaving the topic at trend level. In the local conference arc, it sits near talks about model-quantization, inference-optimization, so the page should be read as part of a larger argument about how agents move from demos into engineering practice.

## Transcript Evidence

- Today on trial, we have Philip Kiley trying to redeem himself with a talk, how to quantize models without killing quality.
- You know, all of those greedy influence providers are out there trying to rip you off, selling you poor-quality tokens at frontier prices by just squishing their models into these little tiny 4-bit number formats.
- He you know he's good with it He says some of the highest quality providers serve models and and in FP4, you know Maybe there's more to quality than just quantization.
- We're going to talk about what is safe to quantize within models, what is more risky, and then take a look at some real-world performance and quality results.
- You might only want to quantize part of the, you might want to, for example, in a vision language model, leave the vision encoder alone because it's small and it's more sensitive and just focus on the main LLM layers.
- If you look at, for example, GPT-LSS, that has an MXFP4 native quantization, which is one of the reasons that models had so much staying power on the market because it does resist quantization very, very well.

## Why It Matters

Outside the conference, this topic matters because AI engineering is becoming a systems discipline. The relevant decisions are not only which model to call; they include where context comes from, how outputs are reviewed, what runtime executes agent work, and which interfaces are safe enough for repeated use. This talk gives one slice of that larger production problem.

## Why It Mattered at AI Engineer Miami

At AI Engineer Miami, the session gave readers a concrete anchor for [[model-quantization]], [[inference-optimization]]. It also connected conference-level ideas to [[baseten|Baseten]], where the public context is: Baseten is an AI infrastructure company focused on deploying, serving, and scaling model inference.

## Important Concepts and Tools

- [[baseten|Baseten]]: Inference platform tied to model serving and quantization.

## Connections to Other Talks

- This session is a standalone framing talk with fewer direct shared-tool links than the rest of the program.

## Representative Quote

> You know, all of those greedy influence providers are out there trying to rip you off, selling you poor-quality tokens at frontier prices by just squishing their models into these little tiny 4-bit number formats.

Quote label: **Transcript-derived**.

## Related Pages

- Speakers: [[philip-kiely|Philip Kiely]]
- Company: [[baseten|Baseten]]
- Topics: [[model-quantization]], [[inference-optimization]]
- Tools/products: [[baseten]]

## Sources

- **Transcript-derived:** `/tmp/aie-miami-transcript.txt` and `/tmp/aie-miami-part2-transcript.txt`.
- **Conference website reference:** [https://www.ai.engineer/miami](https://www.ai.engineer/miami).
- **Public-web supporting context:** [https://www.baseten.co/](https://www.baseten.co/).
