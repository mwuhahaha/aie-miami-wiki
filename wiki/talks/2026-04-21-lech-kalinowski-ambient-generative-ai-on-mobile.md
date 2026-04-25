---
title: "Ambient Generative AI on Mobile"
category: "talks"
aliases:
  - "Ambient Generative AI on Mobile"
sourceLabels:
  - "Transcript-derived"
  - "Official conference site"
  - "Public-web supporting context"
---

# Ambient Generative AI on Mobile

## Summary

Ambient Generative AI on Mobile was a 2026-04-21 AI Engineer Miami 2026 session by [[lech-kalinowski|Lech Kalinowski]], affiliated in the conference materials with [[callstack|CallStack]]. The official schedule placed it at **Day 2 morning**.

## Talk Thesis

Lech Kalinowski connected generative AI to mobile context, where sensors, on-device hardware, and edge constraints make the application feel ambient rather than chat-shaped.

## Detailed Transcript-Derived Summary

The transcript segment for this talk runs across lines 616-872 of `/tmp/aie-miami-part2-transcript.txt`. Read as part of the full conference, the talk contributes to [[ambient-generative-ai]], [[edge-ai]], [[mobile-ai]].

The strongest transcript pattern is that this session turns a broad AI-engineering claim into operational detail. It discusses concrete constraints, tradeoffs, or product surfaces rather than leaving the topic at trend level. In the local conference arc, it sits near talks about ambient-generative-ai, edge-ai, mobile-ai, so the page should be read as part of a larger argument about how agents move from demos into engineering practice.

## Transcript Evidence

- So Lech is gonna tell us about ambient generative AI and how he deployed latent diffusion models on his mobile phone and PUs.
- So what I did, I just designed the full pipeline with the zero cloud APA scores to the outside, not local, LLMs and I build a full measurement durable system to check it out and prove that diffusion models are possible on the local mobile devices.
- So I decided to generate a heart and try to force, with some geometrical tricks and constraints, and try to force the model to generate a real heart with the model.
- But this is the reason why I just wanted to try to deploy the diffusion models on a mobile application in the really best possible optimal way.
- And today I want to present to you my research, original research about the deployment of the diffusion models on mobile.
- He even has a flashlight, he has a pointer, a laser pointer and his LLM models are deployed locally on his mobile.

## Why It Matters

Outside the conference, this topic matters because AI engineering is becoming a systems discipline. The relevant decisions are not only which model to call; they include where context comes from, how outputs are reviewed, what runtime executes agent work, and which interfaces are safe enough for repeated use. This talk gives one slice of that larger production problem.

## Why It Mattered at AI Engineer Miami

At AI Engineer Miami, the session gave readers a concrete anchor for [[ambient-generative-ai]], [[edge-ai]], [[mobile-ai]]. It also connected conference-level ideas to [[callstack|CallStack]], where the public context is: CallStack is Lech Kalinowski's official affiliation and connects to mobile AI engineering.

## Important Concepts and Tools

- [[mobile-npu|Mobile NPU]]: On-device neural processing hardware discussed as part of ambient mobile AI.

## Connections to Other Talks

- This session is a standalone framing talk with fewer direct shared-tool links than the rest of the program.

## Representative Quote

> So I decided to generate a heart and try to force, with some geometrical tricks and constraints, and try to force the model to generate a real heart with the model.

Quote label: **Transcript-derived**.

## Related Pages

- Speakers: [[lech-kalinowski|Lech Kalinowski]]
- Company: [[callstack|CallStack]]
- Topics: [[ambient-generative-ai]], [[edge-ai]], [[mobile-ai]]
- Tools/products: [[mobile-npu]]

## Sources

- **Transcript-derived:** `/tmp/aie-miami-transcript.txt` and `/tmp/aie-miami-part2-transcript.txt`.
- **Official conference site:** [https://www.ai.engineer/miami](https://www.ai.engineer/miami).
- **Public-web supporting context:** [https://developer.android.com/ai](https://developer.android.com/ai).
- **Public-web supporting context:** [https://www.callstack.com/](https://www.callstack.com/).
