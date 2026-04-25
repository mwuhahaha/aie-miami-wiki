---
title: Remote Coding Agents
category: topics
aliases:
  - Remote Coding Agents
sourceLabels:
  - Transcript-derived
  - Conference website reference
  - Public-web supporting context
last_auto_summarized: '2026-04-25T16:35:08.461Z'
---
## Overview

Remote coding agents are coding-agent workflows where the model's work runs in a durable environment away from a developer's local laptop. In the AI Engineer Miami context, this topic is anchored by [[people/ben-vinegar|Ben Vinegar]] and his talk, [[talks/2026-04-20-ben-vinegar-from-local-to-remote-working-with-coding-agents-over-ssh|From Local to Remote: Working with Coding Agents over SSH]], which framed remote agent work as an operations problem: where the workspace lives, how the session survives, how a developer reconnects, and how human review stays close to the actual commands and files.

The connected [[tools/modem|Modem]] page makes the topic concrete. Modem appears here as the workflow layer behind a remote setup, not just as a vendor mention. The relevant pattern is an agent working on a remote machine while the engineer continues to use familiar terminal-native controls: SSH into the environment, keep work alive in tmux, inspect diffs and logs, run tests, interrupt or redirect the process, and decide when the result is ready.

## Why It Matters Here

Remote coding agents matter in this wiki because they move coding agents from short-lived local demos toward engineering infrastructure. Ben Vinegar's framing shows that the hard part is not only whether an agent can edit code, but whether its work can persist, be observed, be resumed, and be reviewed when it is no longer bound to one laptop session. That places this topic near [[topics/agent-workflows|Agent Workflows]] and [[topics/terminal-workflows|Terminal Workflows]]: the agent needs a runtime, but the developer also needs a reliable control surface.

The practical value is especially clear for long-running or environment-heavy work. A remote agent can keep going while a local machine sleeps, run inside a prepared development environment, and preserve process state across reconnects. But that same move creates trust questions: what changed, which commands ran, what state is still active, and how does the human regain control? The answer in Ben's talk is a terminal-centered workflow built around SSH, tmux, inspectable state, and repeatable review.

## Notes

Read this topic through the specific remote-agent workflow described by Ben Vinegar rather than as a generic claim that "agents run in the cloud." The important details are persistence, re-entry, and reviewability. The agent can operate away from the laptop, but the developer should still be able to reconnect to the session, see what is happening, inspect the filesystem, run validation, and steer the work through tools they already trust.

[[tools/modem|Modem]] is useful here because it marks the layer between model capability and engineering adoption. It points to the infrastructure and product surface needed to make remote agent execution manageable: durable sessions, terminal access, visibility into intermediate work, and handoff between human and model. In the broader [[overview|AIE Wiki]] synthesis, remote coding agents belong with agent runtime and infrastructure topics because they expose the operational requirements that appear once coding agents become real collaborators instead of isolated prompts.

## Talks That Mention or Center It

- [[talks/2026-04-20-ben-vinegar-from-local-to-remote-working-with-coding-agents-over-ssh|From Local to Remote: Working with Coding Agents over SSH]] by [[people/ben-vinegar|Ben Vinegar]]

## Related Pages

- People: [[people/ben-vinegar|Ben Vinegar]]
- Tools: [[tools/modem|Modem]]
- Topics: [[topics/agent-workflows|Agent Workflows]], [[topics/terminal-workflows|Terminal Workflows]]
