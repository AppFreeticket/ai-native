# CLAUDE.md — ai-native

Tooling open source de FreeTicket para agentes de IA. Repo paraguas con submodules:
`cli/`, `skills/`, `mcp/`. Lee el [README](README.md) para el mapa.

## La constelación

Todo orbita un punto: el **contrato OpenAPI B2B** que sirve `free-admin` en
`/api/v1/openapi.json`. `cli` y `mcp` son clientes generados de ese spec; `skills`
documenta cómo usarlos. El flujo de datos es siempre el mismo:

```
free-admin (/api/v1)     ──contrato──▶  openapi.json        ──codegen──▶  cli / mcp
free-admin (/api/admin)  ──contrato──▶  admin-openapi.json  ──codegen──▶  cli / mcp (ft admin · admin_*)
```

Dos contratos, dos linajes semver. B2B v1 usa API key Bearer + workspace; el
superadmin (`/api/admin`) usa sesión SUPER_ADMIN por cookie (`FT_ADMIN_SESSION`),
no API key. Cada uno se baja con su `sync-openapi` / `sync-openapi:admin`.

Regla de oro: **el cliente nunca se edita a mano y nunca define el contrato**.
Si falta un endpoint, se pide en `free-admin`, no se inventa en el cliente.

## Capas de agentes

- **Aquí (umbrella `.claude/agents/`)**: agentes cross-cutting que cruzan repos
  (`contract-sync`, `endpoint-requester`, `oss-maintainer`). Úsalos parado en la
  raíz de `ai-native`. Falta un endpoint → `endpoint-requester` lo pide en
  free-admin y lo anota en [`CONTRACT-GAPS.md`](CONTRACT-GAPS.md).
- **Dentro de cada submódulo**: agentes específicos de esa pieza (su propio
  `.claude/agents/`). Al entrar a `cli/` o `mcp/`, esos toman precedencia.

No dupliques un agente entre capas: si aplica a una sola pieza, vive en su submódulo.

## Convenciones

- Cada pieza se publica y versiona por separado. No acoples releases.
- MIT en todo. Docs en inglés; copy de usuario final en español neutro (sin voseo).
- Cambios al contrato → ejecutar `contract-sync` antes de tocar comandos/tools.
