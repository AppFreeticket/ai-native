# Agentes cross-cutting — ai-native

Subagentes que operan a nivel del paraguas, cruzando submódulos. Para los agentes
específicos de cada pieza, ver el `.claude/agents/` dentro de `cli/`, `skills/` y `mcp/`.

| Agente | Cuándo usarlo |
|---|---|
| [`ai-architect`](./ai-architect.md) | Planear el roadmap, decidir dónde vive cada pieza, auditar cobertura del contrato (B2B + superadmin) y gobernar el versionado. El cerebro que ordena a los demás. |
| [`contract-sync`](./contract-sync.md) | El contrato `/api/v1` cambió en free-admin: propagar a los clientes `cli` y `mcp`. |
| [`oss-maintainer`](./oss-maintainer.md) | Higiene open source en todas las piezas: LICENSE, README, CHANGELOG, topics, versionado. |

Diseño de la capa de agentes: ver [CLAUDE.md](../../CLAUDE.md).
