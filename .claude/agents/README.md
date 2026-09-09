# Cross-cutting agents — ai-native

Subagents that operate at the umbrella level, across submodules. For agents
specific to a single piece, see the `.claude/agents/` inside `cli/`, `skills/`
and `mcp/`.

| Agent | When to use it |
|---|---|
| [`ai-architect`](./ai-architect.md) | Plan the roadmap, decide where each capability lives, audit contract coverage (B2B + superadmin + public) and govern versioning. The brain that directs the others. |
| [`contract-sync`](./contract-sync.md) | A contract changed in free-admin: propagate it to the `cli` and `mcp` clients. |
| [`endpoint-requester`](./endpoint-requester.md) | A needed endpoint is not in any contract: open an issue in `free-admin` and record the gap in [`CONTRACT-GAPS.md`](../../CONTRACT-GAPS.md). The upstream counterpart of `contract-sync`. |
| [`oss-maintainer`](./oss-maintainer.md) | Open source hygiene across every piece: LICENSE, README, CHANGELOG, topics, versioning. |

The same four agents are mirrored for Codex in [`.codex/agents/`](../../.codex/agents).
For the design of the agent layer, see [AGENTS.md](../../AGENTS.md).
