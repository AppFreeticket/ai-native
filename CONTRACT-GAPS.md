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
| Login self-service por browser (device flow RFC 8628) — el user se loguea con su sesión y acuña su propio token, sin `pnpm api:key` server-side | `POST /auth/device/code`, `POST /auth/device/token` (+ página `/cli` de aprobación en free-admin) | B2B | cli ✓, mcp | [#160](https://github.com/AppFreeticket/free-admin/issues/160) | shipped |
| Check-in / control de acceso en puerta | `POST /tickets/{id}/checkin`, `GET /tickets/{id}/access` | B2B | cli, mcp | — | identified |
| Tickets/asistentes individuales + reenvío | `GET /sales/{id}/tickets`, `POST /tickets/{id}/resend` (reemitir QR/email) | B2B | cli | — | identified |
| Crear venta/orden por API (comp / venta programática) | `POST /sales` | B2B | cli | — | identified |
| Suscripciones / miembros de un plan | `GET /membership-plans/{id}/subscribers`, `POST /subscriptions/{id}/cancel` | B2B | cli | — | identified |
| Cupones / descuentos | `GET/POST/PATCH/DELETE /discounts` | B2B | cli | — | identified |
| Webhooks (registrar endpoints de eventos: venta, refund) | `GET/POST/DELETE /webhooks` | B2B | cli, mcp | — | identified |
| Reportes por evento / serie temporal | `GET /reports/by-event`, `GET /reports/timeseries` | B2B | cli | — | identified |
| Reporte de inventario disponible por evento/fecha/ticket | `GET /reports/inventory` (agrega capacity/sold/reserved/available por evento·fecha·tipo) | B2B | cli | [#165](https://github.com/AppFreeticket/free-admin/issues/165) | requested |
| Filtros útiles en el listado de ventas | `GET /sales` query params `event`, `eventDate`, `reference`, `buyer`, `from`, `to`, `channel` (hoy sólo `status`, `limit`, `cursor`) | B2B | cli | [#167](https://github.com/AppFreeticket/free-admin/issues/167) | requested |
| Exports de compradores/asistentes con filtros y detalle de ticket | `GET /reports/exports/buyers` filtros (`event`, `eventDate`, `from`, `to`, `status`) + campos ticket/evento, o nuevo `GET /reports/exports/attendees` | B2B | cli | [#168](https://github.com/AppFreeticket/free-admin/issues/168) | requested |

<!-- endpoint-requester: agregá filas nuevas arriba de esta línea, ordenadas por prioridad. -->
