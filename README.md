# ai-native

FreeTicket's **open source** tooling for AI agents (Claude Code and compatible
clients). This umbrella repo groups, through git submodules, the pieces that
orbit FreeTicket's **OpenAPI contracts**.

| Submodule | Repo | What it is |
|---|---|---|
| [`cli/`](cli) | [AppFreeticket/freeticket-cli](https://github.com/AppFreeticket/freeticket-cli) | The `ft` binary (npm `@freeticket/cli`). Operates the B2B domain from your terminal. |
| [`skills/`](skills) | [AppFreeticket/agent-skills](https://github.com/AppFreeticket/agent-skills) | Installable agent skills, packaged as the `freeticket` plugin (`npx skills add AppFreeticket/agent-skills@<skill>`). |
| [`mcp/`](mcp) | [AppFreeticket/freeticket-mcp](https://github.com/AppFreeticket/freeticket-mcp) | FreeTicket's MCP server, live at `mcp.appfreeticket.com`. Exposes the B2B, superadmin and public contracts as tools. |

`free-admin` (the app) is the **backend**: it defines the contracts that `cli`
and `mcp` consume. That is the only source of truth — clients are regenerated
from the spec, never the other way around.

## Why an umbrella and not a monorepo

Each piece ships separately (npm, `npx skills`, the MCP registry) and has its
own release cycle. Submodules keep their histories and CI independent; this repo
only provides the unified view and the cross-cutting agent layer in
[`.claude/agents/`](.claude/agents) (mirrored for Codex in `.codex/agents/`).

## Working with submodules

```bash
git clone --recurse-submodules https://github.com/AppFreeticket/ai-native.git
git submodule update --remote        # pull the latest of each piece
```

## Conventions

- **The contract rules.** A change in `/api/v1` propagates to `cli` and `mcp` by
  regenerating their client from `openapi.json` (see the `contract-sync` agent).
  A missing endpoint is requested upstream and tracked in
  [`CONTRACT-GAPS.md`](CONTRACT-GAPS.md), never invented downstream.
- **All open source, MIT licensed.** README + LICENSE + CHANGELOG in every piece.
- **Everything open source is written in English** — docs, changelogs, agent
  definitions, CLI help, MCP tool descriptions, commits and pull requests. The
  one exception is the end-user event copy that `skills/freeticket-eventos`
  *generates*, which stays in neutral Spanish for its LatAm audience.

See [AGENTS.md](AGENTS.md) for how agents should work in this repo.
