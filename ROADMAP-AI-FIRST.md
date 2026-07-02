# Roadmap AI-first — ai-native

Plan de implementación para convertir FreeTicket en un entorno AI-first:
MCP completo, distribución vía **plugin de Claude Code** (fin del drift de skills),
y la capa B2C (agentes que descubren y compran tickets).

Regla de oro vigente en todo el plan: **el cliente nunca inventa el contrato**.
Todo endpoint faltante se pide en `free-admin` vía `endpoint-requester` y queda
en [CONTRACT-GAPS.md](CONTRACT-GAPS.md).

---

## Estado actual (jul 2026)

| Pieza | Estado | Nota |
|---|---|---|
| `cli` | ✅ v0.7.0 publicado (`@freeticket/cli`, bin `ft`) | Cobertura B2B completa + `ft admin`. Cliente 100 % generado. |
| `skills` | ✅ 2 skills B2B (`freeticket-cli`, `freeticket-eventos`) | Sin mecanismo de update: `npx skills add` es copia one-shot → **drift** (hay copias instaladas que aún dicen `@appfreeticket/cli`). |
| `mcp` | ⚠️ v0.2.0 scaffold, 1 archivo, stdio | Solo `whoami` + `reconciliation` (B2B) y 4 tools admin read-only. Fetch a mano, codegen sin correr, **no es submódulo** todavía. |
| Contrato B2B `/api/v1` | ✅ | Gaps #160–#178 shipped; columna `mcp` del ledger pendiente de cablear. |
| Contrato admin `/api/admin` | ✅ | Cookie de sesión (MVP); token de servicio pendiente (free-admin#157). |
| Contrato B2C | ⛔ no existe | Es el trabajo de la fase 3. |

---

## Fase 1 — MCP a paridad B2B (`@freeticket/mcp` 0.2 → 1.0)

Objetivo: que un agente pueda operar un workspace igual que con `ft`, pero por tools.

1. **Codegen real.** Correr `pnpm generate` y migrar el fetch a mano
   (`src/index.ts:36-59`) al cliente `@hey-api/client-fetch` generado en
   `src/client/`. Agregar `openapi-ts.admin.config.ts` (copiar patrón del cli)
   para `admin-openapi.json` → `src/admin-client/`.
2. **Estructura espejo del cli.** `src/tools/<recurso>.ts` + un registrador
   genérico (equivalente a `registerResource`) que derive tools de las funciones
   del SDK: mismo nombre de dominio que el cli (`events_list`, `sales_get`, …).
   Un tool = un operationId. Nada de lógica de negocio en el server.
3. **Cobertura por olas** (semver `minor` por ola):
   - Ola A (reads): events, event-dates, ticket-types, sales, plans, venues,
     staff, discounts, webhooks, reports (todos los `GET`).
   - Ola B (writes B2B): create/update/delete/publish, sales create/cancel/refund,
     tickets checkin/resend. Writes destructivos con descripción que exija
     confirmación del usuario en el prompt del tool.
   - Ola C (admin): paridad con `ft admin` (workspaces, users, plans,
     feature-flags, audit-log, impersonate). Solo si `FT_ADMIN_SESSION` existe.
4. **Auth alineada con el cli.** Reusar `~/.freeticket/config.json` como fallback
   de `FT_API_KEY` — así `ft login` (device flow) también autentica el MCP y
   desaparece la contradicción "la skill prohíbe pedir key / el MCP la exige".
5. **Higiene.** vitest + tests de registro de tools, `oss-maintainer` antes de
   publicar, y **convertir `mcp/` en submódulo** (repo `AppFreeticket/freeticket-mcp`,
   alta en `.gitmodules`) — hoy está untracked en el paraguas.
6. **Transporte.** stdio alcanza para Claude Code/Desktop. HTTP remoto recién en
   fase 3 (B2C), no antes.

Dependencias: ninguna de backend — todo el contrato ya existe. Ejecuta
`contract-sync` antes de cada ola para partir del spec fresco.

## Fase 2 — Plugin de Claude Code (fin del drift)

Objetivo: una sola instalación versionada que empaqueta skills + MCP + agentes,
con updates centralizados. Esto reemplaza `npx skills add` como canal de
distribución (el repo `skills` queda como fuente, el plugin como empaque).

1. **Repo del plugin** (`AppFreeticket/freeticket-plugin` o dentro de `skills`):
   ```
   .claude-plugin/plugin.json      # name: freeticket, version, description
   skills/freeticket-cli/          # las skills actuales, movidas/symlinkeadas
   skills/freeticket-eventos/
   agents/                         # subagentes de cara al usuario (operador B2B)
   .mcp.json                       # servidor MCP: npx -y @freeticket/mcp
   ```
2. **Marketplace propio**: `.claude-plugin/marketplace.json` en un repo
   `AppFreeticket/claude-marketplace`. Instalación del usuario final:
   ```
   /plugin marketplace add AppFreeticket/claude-marketplace
   /plugin install freeticket
   ```
   Los updates llegan re-sincronizando el marketplace — se acabó el copy-paste
   congelado de skills.
3. **Release pipeline**: al taggear `cli`/`mcp`/`skills`, un workflow (delegar en
   `ft-devops-ci`) bumpea el plugin y commitea el marketplace. El plugin tiene su
   propio semver; pinnea versiones de `@freeticket/mcp` explícitas.
4. **Criterio de salida**: desinstalar las skills sueltas, instalar el plugin, y
   verificar que `ft` + tools MCP + skills quedan disponibles en una sesión limpia.

## Fase 3 — B2C (agentes que compran)

Objetivo: que un agente de un comprador descubra eventos y complete una compra.
Todo empieza por el contrato: **no hay endpoints B2C hoy**, así que la fase abre
con `endpoint-requester`.

1. **Pedir el contrato B2C en free-admin** (`/api/public/openapi.json`, tercer
   linaje semver, sin auth para catálogo):
   - `GET /public/events` + `GET /public/events/{slug}` — catálogo publicado,
     filtros ciudad/fecha/categoría.
   - `GET /public/events/{slug}/availability` — fechas, tipos, precios, stock.
   - `POST /public/orders` — crear orden (buyer email + items) → devuelve
     `checkout_url` de Mercado Pago + `order_id`. El pago vive en MP, no en el agente.
   - `GET /public/orders/{id}` — estado post-pago (polling) + tickets emitidos.
   - `POST /public/tickets/{code}/resend` — reenvío al mail del comprador.
   - Rate limit + idempotency-key en `POST /public/orders`.
2. **MCP B2C**: los mismos 5 tools en `@freeticket/mcp` (namespace `public_*`),
   sin credenciales. Aquí sí: **transporte HTTP remoto** (Streamable HTTP en
   Vercel) para que funcione desde claude.ai/web sin instalar nada.
3. **Skill B2C** (`freeticket-comprar`): copy en español neutro; flujo
   descubrir → verificar disponibilidad → crear orden → entregar `checkout_url`
   al humano → confirmar tickets. El agente **nunca** toca datos de pago; el
   humano paga en el checkout de MP (patrón agentic-commerce seguro).
4. **Distribución**: se suma al plugin de la fase 2 (`skills/freeticket-comprar`
   + tools ya presentes). Publicar el server remoto en directorios MCP.

Dependencia dura: fase 3 no arranca hasta que el contrato público esté shipped.
Mientras el backend lo construye, fases 1–2 avanzan en paralelo.

## Orden y ownership

| # | Entregable | Pieza | Agente que gobierna | Bump |
|---|---|---|---|---|
| 1 | MCP con codegen + Ola A ✅ (jul 2026) | mcp | contract-sync → mcp | 0.3.0 |
| 2 | MCP Olas B y C + submódulo | mcp | contract-sync / oss-maintainer | 0.4–0.6 |
| 3 | Plugin + marketplace | plugin | oss-maintainer / ft-devops-ci | 1.0.0 |
| 4 | Contrato B2C pedido | free-admin | endpoint-requester | — |
| 5 | Tools `public_*` + HTTP remoto | mcp | contract-sync | 1.0.0 |
| 6 | Skill `freeticket-comprar` | skills/plugin | oss-maintainer | — |
