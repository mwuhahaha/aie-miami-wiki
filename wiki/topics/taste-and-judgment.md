---
title: Taste And Judgment
category: topics
aliases:
  - Taste And Judgment
sourceLabels:
  - Transcript-derived
  - Official conference site
  - Public-web supporting context
last_auto_summarized: '2026-04-25T18:36:58.386Z'
---
# Taste And Judgment

## Summary

Taste and judgment names the part of AI engineering that faster generation does not automate away. On this page it is anchored by two AI Engineer Miami talks that approach the same problem from opposite sides of the build process. Dax Raad's You Don't Have Any Good Ideas used product ideation as the pressure test: agents can multiply prototypes, drafts, and experiments, but they cannot supply the underlying product taste that decides whether an idea deserves that work. Max Stoiber's What Does Good Taste in DX Look Like in the Age of Agents? carried the question into developer tools, arguing that agent-era DX has to serve both humans and machines through interfaces that are legible, composable, reviewable, and explicit about where human judgment still owns the decision.

## Why It Matters

This topic matters outside the conference because agent adoption tends to expose the gap between output volume and quality. Product judgment is needed before a team asks an agent to build the wrong thing faster; engineering judgment is needed afterward, when humans review PRs, choose abstractions, expose tool interfaces, and decide whether generated work actually matches intent. The connected pages make the topic concrete through OpenAI and ChatGPT Apps, where agents and apps depend on platform choices, and through tools like Cloudflare Workers and opencode, where taste shows up in deployment surfaces, command interfaces, and the reviewability of agent-produced code. In this framing, taste is not personal preference. It is an operational skill that shapes product bets, developer workflows, agent boundaries, and the moment a human has to say whether something is good enough to ship.

## Why It Mattered at AI Engineer Miami

At AI Engineer Miami, [[taste-and-judgment]] connected 2 talk(s). Dax Raad's session challenged the audience to separate the thrill of agent-amplified building from the harder work of having a worthwhile idea in the first place. Max Stoiber's session, tied in the wiki to his OpenAI and ChatGPT Apps context, treated agents as a new class of user for developer experience: tools have to be understandable to engineers, usable by agents, and clear about responsibility when automation reaches its limits. Together, the talks made taste and judgment a shared conference concern because they placed the same question at both ends of the workflow: what should be built, and how should humans and agents know when it has been built well?

## Synthesis Pattern

The pattern is not that agents remove judgment, but that they move it earlier, distribute it across more interfaces, and make its absence more visible. In the product frame, poor taste shows up as polished agent output wrapped around a thin or derivative idea. In the DX frame, poor taste shows up as tools that are technically capable but hard for humans to inspect, brittle for agents to compose, or vague about who owns the final call. Read together, the talks argue that AI engineering needs better judgment surfaces: sharper intent before generation, clearer tool contracts for agent use, stronger review loops for generated work, and product taste that can say no before automation turns a weak direction into a large pile of artifacts.

## Talks That Mention or Center It

- [[2026-04-20-dax-raad-you-don-t-have-any-good-ideas|You Don't Have Any Good Ideas]] by Dax Raad - Dax Raad's talk used provocation to separate agent-amplified output from judgment: faster building does not rescue weak product taste or unclear intent.
- [[2026-04-20-max-stoiber-what-does-good-taste-in-dx-look-like-in-the-age-of-agents|What Does Good Taste in DX Look Like in the Age of Agents?]] by Max Stoiber - The DX panel treated agents as a new class of user: tools must be legible to humans, composable for agents, and explicit about where judgment remains with the engineer.

## Related Companies, Tools, and Topics

- Companies: [[openai]], [[opencode]]
- Tools/products: [[chatgpt-apps]], [[cloudflare-workers]], [[opencode]]

## Source Labels

- **Transcript-derived:** cross-talk pattern and talk connections.
- **Official conference site:** official schedule, speaker, affiliation, and abstract context.
- **Public-web supporting context:** official URLs for linked tools/products where present.

## Sources

- **Transcript-derived:** `/tmp/aie-miami-transcript.txt` and `/tmp/aie-miami-part2-transcript.txt`.
- **Official conference site:** [https://www.ai.engineer/miami](https://www.ai.engineer/miami).
- **Public-web supporting context:** [https://developers.openai.com/apps-sdk/](https://developers.openai.com/apps-sdk/).
- **Public-web supporting context:** [https://opencode.ai/](https://opencode.ai/).
- **Public-web supporting context:** [https://workers.cloudflare.com/](https://workers.cloudflare.com/).
