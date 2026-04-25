---
title: Terminal Workflows
category: topics
aliases:
  - Terminal Workflows
sourceLabels:
  - Transcript-derived
  - Official conference site
  - Public-web supporting context
last_auto_summarized: '2026-04-25T16:34:21.995Z'
---
## Overview

Terminal workflows are the shell-centered operating habits that make coding agents practical when their work moves beyond a local editor session. In the AI Engineer Miami context, this topic is anchored by [[people/ben-vinegar|Ben Vinegar]] and his talk, [[talks/2026-04-20-ben-vinegar-from-local-to-remote-working-with-coding-agents-over-ssh|From Local to Remote: Working with Coding Agents over SSH]], where the terminal is treated as the control surface for remote agent work: SSH into the environment, keep the session alive with tmux, inspect the filesystem and diffs, run tests, and decide when to intervene.

The connected [[tools/modem|Modem]] page makes the topic concrete. Modem is not just a vendor mention here; it represents the workflow layer between a developer and a remote coding agent. The important pattern is that an agent can work on a remote machine while the human still has familiar terminal-native ways to reconnect, watch progress, interrupt execution, review output, and keep authority over the result.

## Why It Matters Here

Terminal workflows matter in this wiki because they turn [[topics/remote-coding-agents|remote coding agents]] from an infrastructure idea into an engineering loop that people can actually supervise. Ben Vinegar's framing connects agent work to durable shells, SSH access, tmux persistence, command-line tools, diffs, logs, tests, and review loops. That makes the terminal more than a place to launch an agent; it becomes the shared workspace where human judgment and model-generated changes meet.

This is also why the topic belongs near [[topics/agent-workflows|agent workflows]]. When agent sessions are long-running, remote, and potentially detached from a laptop, teams need answers to practical questions: where the workspace lives, how a developer reconnects, how process state survives, how intermediate work is inspected, and how the final patch is reviewed. Terminal workflows are the operational answer in Ben's talk: keep the agent close to the tools engineers already use to understand and validate code.

## Notes

Read this topic through the concrete remote-agent setup described by Ben Vinegar rather than as a generic preference for command-line tools. The key details are SSH, tmux, persistent remote environments, CLI-native control, and repeatable human review. [[tools/modem|Modem]] appears as a marker for that workflow layer: agent execution can leave the local laptop, but the developer should still be able to observe state, recover context, run checks, and steer the work from a terminal.

The broader pattern is that coding agents need operational surfaces, not just model capability. A terminal workflow keeps generated code attached to commands, tests, logs, and filesystem state, which makes it easier to evaluate what happened and decide what should happen next.

## Talks That Mention or Center It

- [[talks/2026-04-20-ben-vinegar-from-local-to-remote-working-with-coding-agents-over-ssh|From Local to Remote: Working with Coding Agents over SSH]] by [[people/ben-vinegar|Ben Vinegar]]

## Related Pages

- People: [[people/ben-vinegar|Ben Vinegar]]
- Tools: [[tools/modem|Modem]]
- Topics: [[topics/agent-workflows|Agent Workflows]], [[topics/remote-coding-agents|Remote Coding Agents]]
