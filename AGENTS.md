# AGENTS.md — ai-native

FreeTicket's open source tooling for AI agents. Umbrella repo, three submodules:
`cli/`, `skills/`, `mcp/`. See the [README](README.md) for the map.

This file is the single source of agent instructions for the umbrella.
`CLAUDE.md` points here; do not fork the content.

## The constellation

Everything orbits one point: the **B2B OpenAPI contract** that `free-admin`
serves at `/api/v1/openapi.json`. `cli` and `mcp` are clients generated from
that spec; `skills` documents how to use them. The data flow never changes:

```
free-admin (/api/v1)     ──contract──▶  openapi.json         ──codegen──▶  cli / mcp
free-admin (/api/admin)  ──contract──▶  admin-openapi.json   ──codegen──▶  cli / mcp (ft admin · admin_*)
free-admin (/api/public) ──contract──▶  public-openapi.json  ──codegen──▶  mcp (public_*)
```

Three contracts, three semver lineages. B2B v1 uses a Bearer API key plus a
workspace header; superadmin (`/api/admin`) uses a SUPER_ADMIN cookie session
(`FT_ADMIN_SESSION`), not an API key; the public contract (`/api/public`) takes
no auth at all. Each one is pulled with its own `sync-openapi`,
`sync-openapi:admin` and `sync-openapi:public`.

Golden rule: **a client is never hand-edited and never defines the contract.**
If an endpoint is missing, ask for it in `free-admin` — do not invent it
downstream.

## Agent layers

- **Here (umbrella `.claude/agents/`, mirrored as `.codex/agents/`)**:
  cross-cutting agents that span repos (`ai-architect`, `contract-sync`,
  `endpoint-requester`, `oss-maintainer`). Run them from the `ai-native` root.
  Missing an endpoint → `endpoint-requester` files it in free-admin and records
  it in [`CONTRACT-GAPS.md`](CONTRACT-GAPS.md).
- **Inside each submodule**: agents specific to that piece, in its own
  `.claude/agents/`. Once you `cd` into `cli/` or `mcp/`, those take precedence.

Never duplicate an agent across layers: if it applies to one piece only, it
lives in that submodule.

## Conventions

- Every piece is published and versioned separately. Do not couple releases.
- MIT throughout.
- **Everything open source is written in English** — READMEs, changelogs, this
  ledger, agent definitions, CLI help, MCP tool descriptions, commit messages
  and pull requests. The single exception is end-user event copy that
  `skills/freeticket-eventos` *generates*, which stays in neutral Spanish for a
  LatAm audience; the instructions that produce it are still English.
- Contract changes → run `contract-sync` before touching commands or tools.
