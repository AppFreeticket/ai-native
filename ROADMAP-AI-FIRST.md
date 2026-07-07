# Roadmap AI-first — ai-native

Documento de ejecución y trazabilidad, de inicio a fin, para convertir FreeTicket
en plataforma AI-first: **MCP con cobertura total del contrato (B2B + admin + B2C)**,
accesible desde **claude.ai en el navegador** (HTTP remoto + OAuth), con **mcp-ui**
para interacción visual, y distribución vía **plugin de Claude Code**.

**Cómo se traza:** cada tarea es un checkbox. Se marca en el mismo PR que la
completa. La tabla de hitos (abajo) refleja el estado agregado. Los huecos de
contrato se registran en [CONTRACT-GAPS.md](CONTRACT-GAPS.md) — nunca se
inventan en el cliente (regla de oro).

---

## Tabla de hitos

| # | Hito | Versión mcp | Estado | Depende de |
|---|---|---|---|---|
| 0 | Fundaciones (codegen, submódulo, auth compartida) | 0.3.0 | ✅ jul 2026 | — |
| 1 | Ola A — reads B2B (27 tools) | 0.3.0 | ✅ jul 2026 | — |
| 2 | Ola B — writes B2B (24/29 tools; 5 con hueco de contrato) | 0.4.0 | ✅ jul 2026 | nada |
| 3 | Ola C — admin completo (15 tools) | 0.5.0 | ✅ jul 2026 | nada |
| 4 | HTTP remoto + OAuth → claude.ai navegador | 0.6.0–0.7.0 | 🔶 transporte 0.6.0 ✅; OAuth 0.7.0 bloqueado | OAuth AS en free-admin |
| 5 | mcp-ui en tools clave | 0.8.0 | ⬜ | hito 2 (writes) |
| 6 | Plugin Claude Code + marketplace | — (plugin 1.0.0) | ⬜ | hitos 2–3 |
| 7 | Contrato B2C shipped en free-admin | — | ⬜ requested | free-admin #189–191 |
| 8 | Tools `public_*` + mcp-ui B2C | 0.9.0 | ⬜ | hitos 4 y 7 |
| 9 | Skill `freeticket-comprar` + GA 1.0.0 | 1.0.0 | ⬜ | hito 8 |

Estados: ✅ hecho · 🔶 en curso · ⬜ pendiente.

---

## Hito 0 — Fundaciones ✅ (jul 2026)

- [x] Codegen real desde los dos specs (`pnpm generate` → `src/client/`, `src/admin-client/`)
- [x] Estructura `src/tools/b2b.ts` + `src/tools/admin.ts`, un tool = un operationId
- [x] Auth compartida con el CLI: env > `~/.freeticket/config.json` (`ft login` autentica el MCP)
- [x] Tools `admin_*` gateados por `FT_ADMIN_SESSION`
- [x] `mcp/` convertido en submódulo (`AppFreeticket/freeticket-mcp`, público)
- [x] Metadata publicable (repository, bugs, license MIT) + tests de registro (vitest)

## Hito 1 — Ola A: reads B2B ✅ (v0.3.0)

27/27 reads del contrato `/api/v1`:

- [x] Sesión: `whoami`
- [x] Eventos: `events_list` · `events_get` · `event_dates_list`
- [x] Tickets: `ticket_types_list` · `ticket_types_get` · `tickets_access`
- [x] Ventas: `sales_list` · `sales_get` · `sales_tickets`
- [x] Membresías: `plans_list` · `plans_get` · `plans_subscribers`
- [x] Comercial: `discounts_list` · `webhooks_list` · `venues_list` · `venues_get` · `staff_list`
- [x] Reportes: `reports_summary` · `reports_by_event` · `reports_timeseries` · `reports_inventory` · `reconciliation`
- [x] Exports: `reports_export_buyers` · `reports_export_attendees` · `reports_export_subscribers` · `reports_export_reconciliation`

## Hito 2 — Ola B: writes B2B (v0.4.0)

Objetivo: **todo lo que hace `ft` se puede hacer por tools**. 29 tools nuevos,
generados del SDK igual que los reads. Sin dependencias de backend: el contrato
ya expone las 29 operaciones.

Preparación:

- [x] Correr `contract-sync` (spec fresco antes de empezar)
- [x] Helper de registro para writes: `annotations` MCP (`destructiveHint`,
      `idempotentHint`) + descripción que exige confirmación humana explícita
      en deletes/refunds/cancels

Eventos (7):

- [x] `events_create` — `POST /events`
- [x] `events_update` — `PATCH /events/{id}`
- [x] `events_delete` — `DELETE /events/{id}` ⚠️ destructivo
- [x] `events_publish` — `POST /events/{id}/publish`
- [ ] `event_dates_create` — `POST /events/{id}/dates`  ← hueco de contrato (sin `requestBody`), ver CONTRACT-GAPS.md
- [ ] `event_dates_update` — `PATCH /events/{id}/dates/{dateId}`  ← hueco de contrato (sin `requestBody`), ver CONTRACT-GAPS.md
- [x] `event_dates_delete` — `DELETE /events/{id}/dates/{dateId}` ⚠️ destructivo

Ticket types (3):

- [x] `ticket_types_create` — `POST /ticket-types`
- [ ] `ticket_types_update` — `PATCH /ticket-types/{id}`  ← hueco de contrato (sin `requestBody`), ver CONTRACT-GAPS.md
- [x] `ticket_types_delete` — `DELETE /ticket-types/{id}` ⚠️ destructivo

Ventas y tickets (5):

- [x] `sales_create` — `POST /sales` (comps / venta programática)
- [x] `sales_cancel` — `POST /sales/{id}/cancel` ⚠️ destructivo
- [x] `sales_refund` — `POST /sales/{id}/refund` ⚠️ destructivo
- [x] `tickets_checkin` — `POST /tickets/{ticketCode}/checkin`
- [x] `tickets_resend` — `POST /tickets/{ticketCode}/resend`

Membresías (4):

- [x] `plans_create` — `POST /membership-plans`
- [ ] `plans_update` — `PATCH /membership-plans/{id}`  ← hueco de contrato (sin `requestBody`), ver CONTRACT-GAPS.md
- [x] `plans_delete` — `DELETE /membership-plans/{id}` ⚠️ destructivo
- [x] `subscriptions_cancel` — `POST /subscriptions/{id}/cancel` ⚠️ destructivo

Venues y staff (5):

- [x] `venues_create` — `POST /venues`
- [ ] `venues_update` — `PATCH /venues/{id}`  ← hueco de contrato (sin `requestBody`), ver CONTRACT-GAPS.md
- [x] `venues_delete` — `DELETE /venues/{id}` ⚠️ destructivo
- [x] `staff_create` — `POST /staff`
- [x] `staff_update_role` — `PATCH /staff/{id}/role`

Comercial (5):

- [x] `discounts_create` — `POST /discounts`
- [x] `discounts_update` — `PATCH /discounts/{id}`
- [x] `discounts_delete` — `DELETE /discounts/{id}` ⚠️ destructivo
- [x] `webhooks_create` — `POST /webhooks`
- [x] `webhooks_delete` — `DELETE /webhooks/{id}` ⚠️ destructivo

Fuera de alcance: `POST /auth/device/{code,token}` — es auth del cliente
(la consume `ft login`), no un tool.

Cierre del hito:

- [x] Tests de registro para los 29 tools (patrón de `b2b.test.ts`)
- [x] README del mcp: tabla de tools actualizada
- [x] `oss-maintainer` (CHANGELOG, semver) → publicar **0.4.0**

**Criterio de salida:** crear un evento con fecha y ticket type, publicarlo,
emitir una comp y hacerle checkin — todo por tools MCP, cero `ft`.

## Hito 3 — Ola C: admin completo (v0.5.0)

15 tools para las ops restantes de `/api/admin`. Todos gateados por
`FT_ADMIN_SESSION` (igual que los 4 existentes).

- [x] Correr `contract-sync` (spec admin fresco)

Workspaces (5):

- [x] `admin_workspaces_get` — `GET /workspaces/{id}`
- [x] `admin_workspaces_create` — `POST /workspaces`
- [x] `admin_workspaces_update` — `PATCH /workspaces/{id}`
- [x] `admin_workspaces_suspend` — `POST /workspaces/{id}/suspend` ⚠️ destructivo
- [x] `admin_workspaces_restore` — `POST /workspaces/{id}/restore`

Users e impersonation (4):

- [x] `admin_users_get` — `GET /users/{id}`
- [x] `admin_users_update` — `PATCH /users/{id}`
- [x] `admin_impersonate` — `POST /impersonate` ⚠️ sensible
- [x] `admin_impersonate_stop` — `POST /impersonate/stop`

Platform plans y flags (6):

- [x] `admin_platform_plans_list` — `GET /platform-plans`
- [x] `admin_platform_plans_get` — `GET /platform-plans/{id}`
- [x] `admin_platform_plans_create` — `POST /platform-plans`
- [x] `admin_platform_plans_update` — `PATCH /platform-plans/{id}`
- [x] `admin_feature_flags_list` — `GET /feature-flags`
- [x] `admin_feature_flags_set` — `PUT /feature-flags/{key}`

Cierre:

- [x] Tests + README + CHANGELOG → publicar **0.5.0**
- [ ] (Backend, no bloqueante) free-admin #157: service token PAT para
      SUPER_ADMIN → migrar de cookie a Bearer cuando shipee

**Criterio de salida:** paridad total con `ft admin`; suspender y restaurar un
workspace de prueba por tools.

## Hito 4 — HTTP remoto: MCP en claude.ai del navegador (v0.6.0–0.7.0)

Objetivo: agregar FreeTicket como **custom connector en claude.ai**
(Settings → Connectors → Add custom connector) sin instalar nada local.

Transporte (0.6.0):

- [x] Transporte dual: mantener stdio y sumar **Streamable HTTP**
      (`StreamableHTTPServerTransport` del SDK); factoría común de server
      (`src/server.ts` `buildServer`) para ambos entrypoints
- [ ] Deploy en Vercel (`mcp.appfreeticket.com/mcp`) con `mcp-handler` /
      route handler; delegar pipeline en `ft-devops-ci`
- [x] Server remoto **stateless**: credenciales solo del request (clients
      aislados por sesión), nunca lee `~/.freeticket/config.json`
- [x] Interim de prueba: Bearer `FT_API_KEY` por header (sirve para Claude Code
      remoto y curl; claude.ai requiere OAuth) — verificado E2E (`tools/list`
      devuelve 51 B2B, 70 con `X-Admin-Session`)
- [ ] Rate limit por workspace en el edge

OAuth 2.1 (0.7.0) — claude.ai lo exige para connectors con credenciales:

- [x] Resource-server side en el mcp: `WWW-Authenticate` + protected resource
      metadata (RFC 9728) en `/.well-known/oauth-protected-resource`
- [ ] `endpoint-requester`: pedir en free-admin el authorization server OAuth
      (dynamic client registration + PKCE + token que mapea a API key +
      workspace) y registrar la fila en CONTRACT-GAPS.md  ← **bloqueante**
- [ ] Validar el token OAuth en el mcp (hoy sólo Bearer API key) una vez exista el AS
- [ ] Página de autorización en free-admin (reusar la de device flow `/cli`)

Cierre:

- [ ] Smoke E2E: desde claude.ai web, agregar connector → autorizar → `whoami`,
      `events_list` y un write con confirmación
- [x] Docs: sección "Uso remoto por URL (HTTP)" en README del mcp
- [x] Publicar **0.6.0** (HTTP) — pendiente **0.7.0** (OAuth, tras el AS)

**Criterio de salida:** un usuario sin terminal opera su workspace desde el
chat del navegador.

## Hito 5 — mcp-ui: interacción visual (v0.8.0)

Objetivo: los tools clave devuelven **UIResource embebida** (`@mcp-ui/server`)
además del JSON. El agente razona con el JSON; el humano ve UI. Render puro del
payload — cero lógica de negocio en la UI.

Infraestructura:

- [ ] Dependencia `@mcp-ui/server`; helper `withUi(tool, render)` que adjunta
      el recurso `ui://` al resultado sin tocar el payload estructurado
- [ ] Fallback verificado: clientes sin soporte UI ignoran el resource y usan
      el JSON (probar en Claude Code stdio)

UI por tool (HTML self-contained, sin requests externos):

- [ ] `reports_summary` / `reports_by_event` / `reports_timeseries` → dashboard:
      tarjetas KPI + gráfico de serie temporal
- [ ] `reports_inventory` → barras de capacidad (vendido/reservado/disponible)
- [ ] `events_list` / `events_get` → tarjetas de evento: estado, fechas, stock
- [ ] `sales_list` → tabla con filtros por estado/fecha
- [ ] Writes destructivos (`*_delete`, `sales_refund`, `sales_cancel`) →
      preview de confirmación: qué se va a borrar/reembolsar antes del commit
- [ ] `tickets_checkin` → resultado visual del acceso (verde/rojo + motivo)

Cierre:

- [ ] Snapshot tests del render (payload fijo → HTML estable)
- [ ] README: captura + lista de tools con UI → publicar **0.8.0**

**Criterio de salida:** en claude.ai, `reports_summary` muestra dashboard y un
delete muestra preview de confirmación.

## Hito 6 — Plugin de Claude Code (fin del drift de skills)

Objetivo: una instalación versionada que empaqueta skills + MCP + agentes.
Reemplaza `npx skills add` (copia one-shot → drift) como canal de distribución.

- [ ] Repo `AppFreeticket/freeticket-plugin`:
      `.claude-plugin/plugin.json` + `skills/` (freeticket-cli,
      freeticket-eventos) + `agents/` + `.mcp.json` (`npx -y @freeticket/mcp`)
- [ ] Marketplace `AppFreeticket/claude-marketplace`
      (`.claude-plugin/marketplace.json`); instalación:
      `/plugin marketplace add AppFreeticket/claude-marketplace` →
      `/plugin install freeticket`
- [ ] Release pipeline (`ft-devops-ci`): tag en cli/mcp/skills → bump del
      plugin + commit del marketplace; el plugin pinnea versión de
      `@freeticket/mcp`
- [ ] Criterio de salida: sesión limpia, desinstalar skills sueltas, instalar
      plugin → `ft` + tools MCP + skills disponibles

## Hito 7 — Contrato B2C shipped (free-admin)

Bloqueante externo. Issues ya abiertos, estado `requested`
([#189](https://github.com/AppFreeticket/free-admin/issues/189) catálogo ·
[#190](https://github.com/AppFreeticket/free-admin/issues/190) checkout ·
[#191](https://github.com/AppFreeticket/free-admin/issues/191) post-venta).
Tercer linaje semver: `/api/public/openapi.json`, sin auth para catálogo.

- [ ] `GET /public/events` (filtros `city`, `date`, `category`, `q`, cursor)
- [ ] `GET /public/events/{slug}`
- [ ] `GET /public/events/{slug}/availability` (fechas, tipos, precios, stock)
- [ ] `POST /public/orders` (Idempotency-Key obligatorio, rate limit →
      `order_id` + `checkout_url` de Mercado Pago)
- [ ] `GET /public/orders/{id}` (`pending|paid|expired|cancelled` + tickets)
- [ ] `POST /public/tickets/{code}/resend` (rate-limited, email enmascarado)
- [ ] Al shipear: `contract-sync` + marcar filas `shipped` en CONTRACT-GAPS.md

Seguimiento activo: revisar los issues en cada sesión de planificación.
Mientras tanto, hitos 2–6 avanzan en paralelo.

## Hito 8 — B2C en el MCP: tools `public_*` + mcp-ui (v0.9.0)

Objetivo: el agente de un comprador descubre eventos y completa una compra.
El agente **nunca** toca datos de pago — el humano paga en el checkout de
Mercado Pago (patrón agentic-commerce seguro).

Tools (sin credenciales, viven en el mismo server remoto del hito 4):

- [ ] `public_events_list` — catálogo con filtros
- [ ] `public_events_get` — detalle por slug
- [ ] `public_events_availability` — fechas, tipos, precios, stock
- [ ] `public_orders_create` — crea orden → devuelve `checkout_url` (genera y
      pasa `Idempotency-Key` automáticamente)
- [ ] `public_orders_get` — estado post-pago + tickets emitidos
- [ ] `public_tickets_resend` — reenvío al mail del comprador

mcp-ui B2C:

- [ ] Catálogo → tarjetas con imagen/precio/stock
- [ ] Availability → selector de fecha + tipo
- [ ] Orden → resumen con botón al `checkout_url`; estado con polling visual

Cierre:

- [ ] Codegen del tercer spec (`openapi-ts.public.config.ts` → `src/public-client/`)
- [ ] Tests + README → publicar **0.9.0**

**Criterio de salida:** desde claude.ai sin login, buscar un evento, armar la
orden y recibir el link de pago; tras pagar, ver los tickets con `public_orders_get`.

## Hito 9 — Skill `freeticket-comprar` + GA (v1.0.0)

- [ ] Skill `freeticket-comprar` en `skills/` (español neutro, sin voseo):
      flujo descubrir → disponibilidad → orden → checkout humano → confirmar
      tickets; prohíbe pedir datos de pago
- [ ] Sumarla al plugin (hito 6) y bump del plugin
- [ ] Publicar el server remoto en directorios MCP (registry oficial, etc.)
- [ ] Auditoría final `oss-maintainer` en las tres piezas
- [ ] Publicar **@freeticket/mcp 1.0.0** — contrato completo B2B + admin + B2C,
      stdio + HTTP, mcp-ui

**Criterio de salida GA:** los tres públicos operan solo con el MCP —
organizador (B2B), superadmin (admin) y comprador (B2C) — desde terminal o
navegador.

---

## Reglas transversales

1. **Contrato primero.** Cliente nunca inventa endpoints; huecos →
   `endpoint-requester` → CONTRACT-GAPS.md.
2. **`contract-sync` antes de cada ola** — partir siempre del spec fresco.
3. **Un tool = un operationId.** Nada de lógica de negocio en el server.
4. **Semver por pieza**, releases desacoplados (cli, mcp, skills, plugin).
5. **`oss-maintainer` antes de cada publish** (CHANGELOG, README, metadata).
6. **Writes destructivos siempre con confirmación humana** (annotations +
   descripción + preview mcp-ui cuando exista).
7. Docs en inglés dentro del código; copy de usuario final en español neutro.
