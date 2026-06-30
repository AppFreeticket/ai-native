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
| Check-in / control de acceso en puerta | `POST /tickets/{id}/checkin`, `GET /tickets/{id}/access` | B2B | cli, mcp | — | identified |
| Tickets/asistentes individuales + reenvío | `GET /sales/{id}/tickets`, `POST /tickets/{id}/resend` (reemitir QR/email) | B2B | cli | — | identified |
| Crear venta/orden por API (comp / venta programática) | `POST /sales` | B2B | cli | — | identified |
| Suscripciones / miembros de un plan | `GET /membership-plans/{id}/subscribers`, `POST /subscriptions/{id}/cancel` | B2B | cli | — | identified |
| Cupones / descuentos | `GET/POST/PATCH/DELETE /discounts` | B2B | cli | — | identified |
| Webhooks (registrar endpoints de eventos: venta, refund) | `GET/POST/DELETE /webhooks` | B2B | cli, mcp | — | identified |
| Reportes por evento / serie temporal | `GET /reports/by-event`, `GET /reports/timeseries` | B2B | cli | — | identified |

<!-- endpoint-requester: agregá filas nuevas arriba de esta línea, ordenadas por prioridad. -->
