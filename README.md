# ai-native

**Open-source AI-agent tooling for FreeTicket** — the umbrella repo for everything
that lets an agent operate a ticketing business: a CLI, an MCP server, and an
installable skills plugin. All of it is generated from FreeTicket's OpenAPI
contracts, so the clients never drift from the API.

If you are building agents against FreeTicket, start here.

| Submodule | Repo | What it is |
|---|---|---|
| [`cli/`](cli) | [freeticket-cli](https://github.com/AppFreeticket/freeticket-cli) | The `ft` binary (npm [`@freeticket/cli`](https://www.npmjs.com/package/@freeticket/cli)). Runs the B2B domain from a terminal — events, sales, check-in, reports, exports. |
| [`mcp/`](mcp) | [freeticket-mcp](https://github.com/AppFreeticket/freeticket-mcp) | MCP server. Exposes 103 tools across three contracts to any MCP client (Claude, Claude Code, VS Code, Goose). |
| [`skills/`](skills) | [agent-skills](https://github.com/AppFreeticket/agent-skills) | The `freeticket` plugin: installable Agent Skills that teach an agent how to use the CLI and the MCP server, plus the hosted MCP server config. |

## The contracts are the source of truth

`free-admin` (the FreeTicket app) is the backend. It publishes the contracts;
everything in this repo is a generated client of them.

```
free-admin (/api/v1)     ──contract──▶  openapi.json        ──codegen──▶  cli · mcp
free-admin (/api/admin)  ──contract──▶  admin-openapi.json  ──codegen──▶  cli · mcp (ft admin · admin_*)
free-admin (/api/public) ──contract──▶  public-openapi.json ──codegen──▶  mcp (B2C discovery and checkout)
```

Three contracts, three independent semver lineages. B2B v1 authenticates with an
API key plus a workspace; the superadmin surface uses a `SUPER_ADMIN` session
cookie; the public surface needs no auth at all.

**The rule that keeps this honest: a client never edits the contract and never
invents an endpoint.** If something is missing, it gets requested upstream in
`free-admin` and recorded in [`CONTRACT-GAPS.md`](CONTRACT-GAPS.md) — never
patched over downstream. That ledger is the list of things an agent still cannot
do, and why.

## Why an umbrella and not a monorepo

Each piece ships on its own channel and its own release cycle: the CLI to npm,
the plugin through the Claude Code marketplace, the MCP server as a hosted
endpoint. Submodules keep their histories and CI independent; this repo only
adds a unified view and the cross-cutting agents in
[`.claude/agents/`](.claude/agents) that operate across all three.

## Working with the submodules

```bash
git clone --recurse-submodules https://github.com/AppFreeticket/ai-native.git
git submodule update --remote        # pull the latest of each piece
```

## Conventions

- **The contract rules.** A change in `/api/v1` propagates to `cli` and `mcp` by
  regenerating their clients from `openapi.json` (see the `contract-sync` agent).
- **Agent-first, not agent-compatible.** Every surface is designed so an agent
  can discover what exists, reach all of it, recover from failure, and never be
  handed instructions by data it reads. Open gaps live in
  [`CONTRACT-GAPS.md`](CONTRACT-GAPS.md); direction lives in
  [`ROADMAP-AI-FIRST.md`](ROADMAP-AI-FIRST.md).
- **MIT throughout.** README, LICENSE and CHANGELOG in every piece.
- **Docs in English** for global discovery; end-user copy stays in neutral
  Spanish for a LATAM audience.
