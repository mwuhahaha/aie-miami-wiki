---
title: Modem
category: tools
aliases:
  - Modem
sourceLabels:
  - Transcript-derived
  - Public-web supporting context
last_auto_summarized: '2026-04-25T16:33:31.636Z'
---
# Modem

## Summary

Modem appears in Ben Vinegar's talk as the company and workflow layer behind a concrete remote coding-agent setup. The useful reading is not simply "Modem is an AI coding tool," but that it sits in the practical path from a local CLI session to agent work that runs somewhere else, remains reachable over SSH, and can be watched, interrupted, and steered through terminal-native habits.

That places Modem at the intersection of [[remote-coding-agents]], [[agent-workflows]], and [[terminal-workflows]]. In the talk's frame, the important surface is the engineer's working loop: SSH into a remote environment, keep long-running work alive in tmux, inspect what the agent is doing, and preserve enough control that the remote machine does not become a black box. Modem is therefore a marker for the operational side of coding agents: session persistence, visibility, handoff, and reviewability.

## Why It Matters

Modem matters here because it represents the workflow layer where remote coding agents become usable by engineers rather than just runnable on infrastructure. Ben Vinegar's talk connected [[remote-coding-agents]] to the tools developers already trust: SSH sessions, tmux panes, terminal CLIs, diffs, and review loops. The point was not that agents can execute code remotely in the abstract; it was that their work needs to stay close enough to normal development practice that a human can follow the state of the session and decide what happens next.

The broader engineering lesson is that agent tools become important when they change where work happens and how it is supervised. Moving agent execution off a laptop can help with long jobs, heavier environments, and persistent sessions, but it also creates new questions: where does the workspace live, how does a developer reconnect, how are intermediate changes inspected, and how does a team keep authority over the result? Modem is useful in the wiki as a marker for that pressure point: not just "AI writes code," but "AI works inside a remote workflow that engineers can observe and manage."

## Why It Mattered at AI Engineer Miami

The transcript ties Modem to [[agent-workflows]], [[remote-coding-agents]], and [[terminal-workflows]] through Ben Vinegar's remote coding-agent story. In that context, Modem represented the shift from local, single-machine agent demos toward development loops that run over SSH, survive longer sessions, and fit into terminal-native engineering habits.

That made the mention concrete for the conference synthesis. The important question was how teams keep agent work attached to familiar engineering surfaces: shells, tmux, code review, iterative inspection, and explicit developer control. Modem belongs to the part of the AI engineering stack concerned with making remote agent execution operational rather than merely possible.

## Conference Reading

When this page links to Ben Vinegar's talk, treat Modem as part of the implementation story for remote coding agents over SSH. It is evidence for a workflow pattern where agents run away from the laptop while developers continue to supervise them through terminal-based tools.

The public-web context should stay narrow. The conference evidence is primary: Modem helps name the practical layer between agent capability and engineering trust, especially around persistent remote sessions, terminal workflows, inspectable state, and reviewable agent output.

## Talks That Mention or Center It

- [[2026-04-20-ben-vinegar-from-local-to-remote-working-with-coding-agents-over-ssh|From Local to Remote: Working with Coding Agents over SSH]] by Ben Vinegar

## Related Pages

- Topics: [[agent-workflows]], [[remote-coding-agents]], [[terminal-workflows]]
- Companies: [[modem]]

## Sources

- **Transcript-derived:** `/tmp/aie-miami-transcript.txt` and `/tmp/aie-miami-part2-transcript.txt`.
- **Official conference site:** [https://www.ai.engineer/miami](https://www.ai.engineer/miami).
- **Public-web supporting context:** [https://www.modem.com/](https://www.modem.com/).
