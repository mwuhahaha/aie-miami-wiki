---
title: Ben Vinegar
category: people
aliases:
  - Ben Vinegar
sourceLabels:
  - Transcript-derived
  - Official conference site
  - Public-web supporting context
last_auto_summarized: '2026-04-25T16:33:03.672Z'
---
# Ben Vinegar

## Summary

Ben Vinegar is an AI Engineer Miami 2026 speaker connected to [[2026-04-20-ben-vinegar-from-local-to-remote-working-with-coding-agents-over-ssh|From Local to Remote: Working with Coding Agents over SSH]]. Their conference affiliation is [[modem|Modem]]. In this wiki, Ben is most useful as the person who made [[remote-coding-agents]] feel like an engineering operations problem rather than a novelty demo: where the agent runs, how long its session survives, how a human reconnects, and how review happens when the work is no longer trapped on one laptop. His talk ties [[agent-workflows]] to concrete [[terminal-workflows]] such as SSH access, tmux persistence, CLI-native control, remote environments, and repeatable human review loops.

## Public Links

The public supporting context used here is the official conference site plus the public company/product URL for [[modem|Modem]]: [https://www.modem.com/](https://www.modem.com/).

## Why They Matter Here

Within this wiki, Ben Vinegar's ecosystem role is best understood through the workflow problem his talk made concrete: coding agents need a durable place to work. The connected topic pages frame that problem as a shift from local, fragile, single-user sessions toward remote terminals that can keep running, be re-entered over SSH, preserve state through tmux, and support review close to the commands, tests, logs, and files that shaped the agent's changes. That makes Ben a bridge between the human side of [[agent-workflows]] and the infrastructure side of [[remote-coding-agents]].

His page belongs near [[terminal-workflows]] because the talk treated the shell as more than a launch surface. The terminal becomes the shared operating layer for supervising agents, recovering interrupted work, checking diffs, running tests, and handing control back and forth between developer and model. In that framing, remote coding agents are not just faster autocomplete or background chatbots; they are long-running collaborators that need persistence, observability, and practical control surfaces.

## Contribution at AI Engineer Miami

Ben Vinegar's talk added a terminal-native perspective to the conference's broader production-agent arc. Instead of centering only IDE extensions or chat interfaces, it argued for remote shells and persistent sessions as a practical substrate for agent work: agents can continue beyond a local machine's lifetime, developers can reconnect from elsewhere, and review can happen in the same command-line context where the code is built, tested, and debugged. That made the session especially relevant to teams trying to move coding agents from impressive one-off demos into dependable engineering infrastructure.

The contribution was also methodological. By emphasizing SSH, tmux, CLI agents, and review loops, Ben connected agent adoption to familiar systems habits: keep processes reachable, preserve context, make state inspectable, and do not separate generated work from the environment that proves it works. In this wiki, that positions the session as a practical reference point for anyone comparing local agent experiments with remote, team-ready coding workflows.

## Talks

- [[2026-04-20-ben-vinegar-from-local-to-remote-working-with-coding-agents-over-ssh|From Local to Remote: Working with Coding Agents over SSH]] (2026-04-20) - Ben Vinegar argued that coding agents become more practical when their work moves from fragile local laptops into durable remote terminal environments.

## Related Pages

- Company: [[modem|Modem]]
- Topics: [[agent-workflows]], [[remote-coding-agents]], [[terminal-workflows]]

## Sources

- **Transcript-derived:** `/tmp/aie-miami-transcript.txt` and `/tmp/aie-miami-part2-transcript.txt`.
- **Official conference site:** [https://www.ai.engineer/miami](https://www.ai.engineer/miami).
- **Public-web supporting context:** [https://www.modem.com/](https://www.modem.com/).
