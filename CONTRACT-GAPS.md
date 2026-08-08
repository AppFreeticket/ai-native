# Contract gaps — ai-native

Ledger de funcionalidades que el negocio/CLI necesita pero el contrato OpenAPI
**aún no expone**. Lo mantiene el agente [`endpoint-requester`](.claude/agents/endpoint-requester.md):
detecta el hueco, abre un issue en `AppFreeticket/free-admin` y deja la fila acá.
Cuando el endpoint llega al spec, la fila pasa a `shipped` y `contract-sync`
propaga el cambio a los clientes.

**Regla de oro:** el cliente (`cli`/`mcp`) nunca inventa el endpoint. Si falta,
se pide arriba — no se tapa abajo.

Estados: `identified` (detectado, sin issue) · `requested` (issue abierto) ·
`in-progress` · `shipped` · `wontfix`.

| Funcionalidad | Endpoint(s) que faltan | Contrato | Cliente | Issue free-admin | Estado |
|---|---|---|---|---|---|
| **Permisos por workspace** — la sesión B2B ya alcanza todos los workspaces del usuario, pero el rol que devuelve la API es el **global**, no el efectivo en cada uno. `WorkspaceMember.role`, `AccessGrant` (secciones + `expires_at`) y la elevación de `OrgMember` existen en free-admin pero solo los aplica el dashboard. Consecuencia: un usuario acotado en el panel opera ese workspace sin límite por CLI/MCP ⚠️ | `GET /me` → `Workspace` con `role` y `sections` por fila (aditivo, B2B 1.6.0) **+** rol efectivo por workspace dentro de `requireApiAuth` (enforcement, no solo descubrimiento) | B2B | cli, mcp | [#403](https://github.com/AppFreeticket/free-admin/issues/403) | requested |
| Login self-service por browser (device flow RFC 8628) — el user se loguea con su sesión y acuña su propio token, sin `pnpm api:key` server-side | `POST /auth/device/code`, `POST /auth/device/token` (+ página `/cli` de aprobación en free-admin) | B2B | cli ✓, mcp | [#160](https://github.com/AppFreeticket/free-admin/issues/160) | shipped |
| Check-in / control de acceso en puerta | `POST /tickets/{code}/checkin`, `GET /tickets/{code}/access` | B2B | cli ✓, mcp | [#172](https://github.com/AppFreeticket/free-admin/issues/172) | shipped |
| Tickets/asistentes individuales + reenvío | `GET /sales/{id}/tickets`, `POST /tickets/{code}/resend` (reemitir QR/email) | B2B | cli ✓ | [#173](https://github.com/AppFreeticket/free-admin/issues/173) | shipped |
| Crear venta/orden por API (comp / venta programática) | `POST /sales` | B2B | cli ✓ | [#174](https://github.com/AppFreeticket/free-admin/issues/174) | shipped |
| Suscripciones / miembros de un plan | `GET /membership-plans/{id}/subscribers`, `POST /subscriptions/{id}/cancel` | B2B | cli ✓ | [#175](https://github.com/AppFreeticket/free-admin/issues/175) | shipped |
| Cupones / descuentos | `GET/POST/PATCH/DELETE /discounts` | B2B | cli ✓ | [#176](https://github.com/AppFreeticket/free-admin/issues/176) | shipped |
| Webhooks (registrar endpoints de eventos: venta, refund) | `GET/POST/DELETE /webhooks` | B2B | cli ✓, mcp | [#177](https://github.com/AppFreeticket/free-admin/issues/177) | shipped |
| Reportes por evento / serie temporal | `GET /reports/by-event`, `GET /reports/timeseries` | B2B | cli ✓ | [#178](https://github.com/AppFreeticket/free-admin/issues/178) | shipped |
| Reporte de inventario disponible por evento/fecha/ticket | `GET /reports/inventory` (capacity/sold/reserved/available por evento·fecha·tipo; params `eventId`, `eventDateId`, `from`, `to`, `includeDrafts`, `groupBy=ticketType\|date\|event`) | B2B | cli ✓ | [#165](https://github.com/AppFreeticket/free-admin/issues/165) | shipped |
| Filtros útiles en el listado de ventas | `GET /sales` query params `event`, `eventDate`, `reference`, `buyer`, `from`, `to`, `channel` (además de `status`, `limit`, `cursor`) | B2B | cli ✓ | [#167](https://github.com/AppFreeticket/free-admin/issues/167) | shipped |
| Exports de compradores/asistentes con filtros y detalle de ticket | `GET /reports/exports/buyers` (una fila por venta) + `GET /reports/exports/attendees` (una fila por ticket), ambos con filtros `event`, `eventDate`, `from`, `to`, `status` y detalle de evento/fecha/tipo | B2B | cli ✓ | [#168](https://github.com/AppFreeticket/free-admin/issues/168) | shipped |
| Descubrimiento público B2C (catálogo para agentes de compradores) | `GET /public/events` (filtros `city`, `date`, `category`, `q`, cursor), `GET /public/events/{slug}`, `GET /public/events/{slug}/availability` (fechas, tipos, precios, stock) — sin auth, cache-friendly, solo publicados | B2C (`/api/public`) | mcp ✓ | [#189](https://github.com/AppFreeticket/free-admin/issues/189) | shipped |
| Compra por agente B2C (checkout vía Mercado Pago, el agente nunca toca el pago) | `POST /public/orders` (buyer email + items, header `Idempotency-Key` obligatorio, rate limit → `order_id` + `checkout_url` MP), `GET /public/orders/{id}` (estado `pending\|paid\|expired\|cancelled` + tickets al pagar) | B2C (`/api/public`) | mcp ✓ | [#190](https://github.com/AppFreeticket/free-admin/issues/190) | shipped |
| Post-venta comprador B2C (reenvío de ticket sin credenciales) | `POST /public/tickets/{code}/resend` (reenvía QR/email al mail del comprador, rate-limited, email enmascarado en la respuesta) | B2C (`/api/public`) | mcp ✓ | [#191](https://github.com/AppFreeticket/free-admin/issues/191) | shipped |
| Authorization server OAuth 2.1 para el MCP remoto — claude.ai exige OAuth para connectors con credenciales. Resuelto **embebiendo el AS en el propio mcp** (v0.10.0): tokens stateless que sellan API key + workspace + sesión admin; no requirió endpoint nuevo en free-admin. `FT_OAUTH_ISSUER` permite delegar a un AS de free-admin si algún día existe | `/.well-known/oauth-authorization-server` (RFC 8414), dynamic client registration (RFC 7591), `/authorize` + `/token` con PKCE y página de consentimiento — todo servido por el mcp | B2B | mcp ✓ | — | shipped |
| Update endpoints sin `requestBody` en el spec — sin cuerpo declarado el mcp no podía tipar `event_dates_create/update`, `ticket_types_update`, `plans_update` ni `venues_update` | `POST /events/{id}/dates`, `PATCH /events/{id}/dates/{dateId}`, `PATCH /ticket-types/{id}`, `PATCH /membership-plans/{id}`, `PATCH /venues/{id}` — con `requestBody` desde el contrato 1.5.0 | B2B | cli ✓, mcp ✓ | — | shipped |

<!-- endpoint-requester: agregá filas nuevas arriba de esta línea, ordenadas por prioridad. -->

## Cobertura actual (barrido 2026-08-05)

Sin huecos abiertos: las 94 operaciones de los tres contratos tienen tool en el
mcp, salvo 7 excluidas a propósito. El barrido está automatizado en
[`mcp/src/coverage.test.ts`](mcp/src/coverage.test.ts) — si `sync-openapi` trae
un endpoint nuevo y nadie le hace tool, el test falla con su método y path.

| Contrato | Operaciones | Con tool | Excluidas |
|---|---|---|---|
| B2B `/api/v1` | 66 | 61 | 5 |
| Superadmin `/api/admin` | 22 | 20 | 2 |
| Público `/api/public` | 6 | 6 | 0 |

Exclusiones deliberadas (el motivo vive junto al test, no solo acá):

- `postAuthDeviceCode`, `postAuthDeviceToken` — mecánica del device flow; la usa
  el authorization server embebido del mcp, no un agente.
- `postApiKeys`, `deleteApiKeysId`, `postTokens`, `deleteTokensId` — acuñar y
  revocar credenciales se hace desde el CLI, con un humano en el teclado.
- `postApiCustomerAuthEnterpriseExchange` — mintea sesiones de comprador de
  terceros; es server-to-server entre free-admin y el integrador.
