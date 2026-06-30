# ai-native

Tooling **open source** de FreeTicket para agentes de IA (Claude Code y compatibles).
Repo paraguas: agrupa, vía git submodules, las piezas que orbitan el contrato
**B2B OpenAPI** de FreeTicket (`/api/v1`).

| Submódulo | Repo | Qué es |
|---|---|---|
| [`cli/`](cli) | [AppFreeticket/freeticket-cli](https://github.com/AppFreeticket/freeticket-cli) | Binario `ft` (npm `@freeticket/cli`). Opera el dominio B2B desde la terminal. |
| [`skills/`](skills) | [AppFreeticket/agent-skills](https://github.com/AppFreeticket/agent-skills) | Agent skills instalables (`npx skills add AppFreeticket/agent-skills@<skill>`). |
| [`mcp/`](mcp) | _por publicar_ | Servidor MCP de FreeTicket. Expone el dominio B2B como tools a cualquier cliente MCP. |

`free-admin` (la app) es el **backend**: define el contrato `/api/v1/openapi.json`
que `cli` y `mcp` consumen. Esa es la única fuente de verdad; los clientes se
regeneran desde el spec, nunca al revés.

## Por qué un paraguas y no un monorepo

Cada pieza se publica por separado (npm, `npx skills`, registro MCP) y tiene su
propio ciclo de release. Los submodules mantienen historiales y CI independientes;
este repo solo da una vista unificada y la capa de agentes cross-cutting en
[`.claude/agents/`](.claude/agents).

## Trabajar con submodules

```bash
git clone --recurse-submodules https://github.com/AppFreeticket/ai-native.git
git submodule update --remote        # traer último de cada pieza
```

## Convenciones

- **El contrato manda.** Un cambio en `/api/v1` se propaga a `cli` y `mcp`
  regenerando su cliente desde `openapi.json` (ver agente `contract-sync`).
- **Todo open source, licencia MIT.** README + LICENSE + CHANGELOG en cada pieza.
- **Docs de skills/MCP en inglés** (discovery global); el copy de cara al usuario
  final sigue en español neutro (audiencia LATAM).
