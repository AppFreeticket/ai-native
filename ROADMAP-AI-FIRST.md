# Roadmap AI-first — ai-native

Documento de ejecución y trazabilidad, de inicio a fin, para convertir FreeTicket
en plataforma AI-first: **MCP con cobertura total del contrato (B2B + admin + B2C)**,
accesible desde **claude.ai en el navegador** (HTTP remoto + OAuth), con
**MCP Apps** para interacción visual, distribución como **plugin portable
([Agent Plugins 1.0.0](https://agent-plugins.org))**, y una sesión B2B que vale
en **todos los workspaces del usuario con el permiso real de cada uno**.

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
| 2 | Ola B — writes B2B (29/29 tools; el hueco de contrato cerró en 1.5.0) | 0.4.0 | ✅ jul 2026 | nada |
| 3 | Ola C — admin completo (15 tools) | 0.5.0 | ✅ jul 2026 | nada |
| 4 | HTTP remoto + OAuth → claude.ai navegador | 0.6.0–0.7.0 | ✅ AS embebido en el mcp (0.10.0) | — |
| 5 | UI en el host — MCP Apps, no `mcp-ui` | 0.12.0 | ✅ ago 2026 | hito 2 (writes) |
| 6 | Plugin portable (estándar Agent Plugins 1.0.0) + marketplace | — (plugin 0.1.1) | ✅ instalable, PR #13 sin mergear | hitos 2–3 |
| 7 | Contrato B2C shipped en free-admin (catálogo + checkout + post-venta) | — | ✅ jul 2026 | — |
| 8 | Tools `public_*` + vista | 0.9.0 / 0.12.0 | ✅ ago 2026 | hitos 4 y 7 |
| 9 | Skill `freeticket-comprar` + GA 1.0.0 | 1.0.0 | ⬜ | hito 8 |
| 10 | Permisos por workspace (sesión B2B multi-workspace con el rol real de cada uno) | 0.14.0 | 🔶 issue #403 abierto | free-admin #403 |
| 11 | Publicar `@freeticket/mcp` en npm (hoy no existe en el registry) | 0.13.0 | ⬜ falta `npm login` | — |

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
- [x] Deploy en Vercel (`mcp.appfreeticket.com/mcp`) con `mcp-handler` /
      route handler — vivo (metadata RFC 8414 responde 200)
- [x] Server remoto **stateless**: credenciales solo del request (clients
      aislados por sesión), nunca lee `~/.freeticket/config.json`
- [x] Interim de prueba: Bearer `FT_API_KEY` por header (sirve para Claude Code
      remoto y curl; claude.ai requiere OAuth) — verificado E2E (`tools/list`
      devuelve 51 B2B, 70 con `X-Admin-Session`)
- [ ] Rate limit por workspace en el edge

OAuth 2.1 (0.7.0) — claude.ai lo exige para connectors con credenciales:

- [x] Resource-server side en el mcp: `WWW-Authenticate` + protected resource
      metadata (RFC 9728) en `/.well-known/oauth-protected-resource`
- [x] Authorization server — resuelto **embebiéndolo en el propio mcp** (0.10.0)
      en vez de pedirlo en free-admin: tokens stateless que sellan API key +
      workspace + sesión admin. `FT_OAUTH_ISSUER` permite delegar a un AS de
      free-admin si algún día existe. Ver fila `shipped` en CONTRACT-GAPS.md
- [x] Validar el token OAuth en el mcp (además del Bearer API key)
- [x] Página de consentimiento servida por el mcp, con login por device flow
      contra la sesión de free-admin (0.11.0)

Cierre:

- [ ] Smoke E2E: desde claude.ai web, agregar connector → autorizar → `whoami`,
      `events_list` y un write con confirmación
- [x] Docs: sección "Uso remoto por URL (HTTP)" en README del mcp
- [x] Publicar **0.6.0** (HTTP) — pendiente **0.7.0** (OAuth, tras el AS)

**Criterio de salida:** un usuario sin terminal opera su workspace desde el
chat del navegador.

## Hito 5 — UI en el host ✅ (v0.12.0, ago 2026)

Objetivo cumplido, **por otro camino que el planeado**: en vez de `@mcp-ui/server`
(librería de terceros) se implementó la extensión oficial
**`io.modelcontextprotocol/ui`** (MCP Apps, spec `2026-01-26`) a mano, sin
dependencia nueva. El dialecto JSON-RPC son ~40 líneas; traer un bundler y un
paso de build para eso no se pagaba, y la extensión oficial es la que entiende
claude.ai. El agente razona con el JSON; el humano ve la vista.

Infraestructura:

- [x] Recurso `ui://freeticket/view.html` (`text/html;profile=mcp-app`), servido
      desde el bundle — sin lecturas de disco, así funciona igual en stdio y en
      la Vercel Function
- [x] Helper `uiTool()` que adjunta `_meta.ui.resourceUri` sin tocar el payload;
      el resultado viaja también en `structuredContent`
- [x] Fallback: los hosts sin la extensión ignoran `_meta` y ven el mismo texto

Un solo view en vez de una plantilla por tool: el render se decide por la forma
del payload (**array → tabla**, **objeto → tiles de KPI**), así no hay N
plantillas que mantener contra un contrato que cambia.

- [x] 25 tools con vista: todos los listados y todos los reportes
- [x] Marca garantizada: logo y acento de FreeTicket no sobreescribibles por el
      host; del host se adoptan solo `--color-*` / `--font-*`
- [x] `data-theme` + `color-scheme`, moneda en el `locale` del host,
      `event.source` validado, `ui/resource-teardown` respondido

Cierre:

- [x] Tests reales del view en jsdom (tabla, tiles, error, escape de payloads,
      invariantes de marca) + guarda que falla si un listado nuevo no tiene vista
- [x] README con el detalle → publicado **0.12.0**

Quedó fuera a propósito: preview de confirmación en los writes destructivos y
resultado visual del check-in. La confirmación ya la pide el host por
`destructiveHint`; duplicarla en una vista es UI que hay que mantener para
repetir algo que ya pasa.

## Hito 6 — Plugin portable: estándar Agent Plugins 1.0.0 (fin del drift de skills)

Objetivo: una instalación versionada que empaqueta skills + MCP. Reemplaza
`npx skills add` (copia one-shot → drift) como canal de distribución.

**Cambio de plan (ago 2026):** en vez de un formato propio de Claude Code
(`.claude-plugin/`), se adopta [**Agent Plugins 1.0.0**](https://agent-plugins.org)
— estándar abierto y vendor-neutral (Vercel, VS Code, GitHub CLI lo implementan)
con el mismo contenido: `plugin.json` + `skills/` + `mcp.json`. Un solo paquete
sirve a todos los clientes compatibles en vez de uno por host.

**Y no hace falta repo nuevo:** `AppFreeticket/agent-skills` ya tiene el layout
exacto que pide el spec (`skills/<name>/SKILL.md` en la raíz). Se le agregan dos
manifests y ese repo *es* el plugin. Crear `freeticket-plugin` para duplicar
tres skills era mover archivos para nada.

- [x] `plugin.json` + `mcp.json` en `agent-skills` (Agent Plugins 1.0.0,
      `name: freeticket`), validados contra los schemas oficiales
- [x] `.claude-plugin/plugin.json` — Claude Code todavía **no** lee el layout del
      estándar (espera el manifest en `.claude-plugin/`). Los dos manifests
      declaran el mismo server con distinto nombre de transporte
      (`streamable-http` en el estándar, `http` en Claude Code): la duplicación
      es esa divergencia de formatos, no dos configuraciones.
- [x] `.claude-plugin/marketplace.json` **en el mismo repo** — un repo de
      marketplace aparte para listar un solo plugin no se paga
- [x] README de `agent-skills`: instalación como plugin además de `npx skills`
- [x] Instalación E2E verificada (no solo `plugin validate`): marketplace add →
      install → las 3 skills en el cache y el server en `claude mcp list`
- [ ] Release pipeline (`ft-devops-ci`): tag en cli/mcp/skills → bump del
      `version` en **los dos** `plugin.json`. No es cosmético: el string de
      versión es la señal de update del cache — sin bump, `plugin update` deja
      al usuario en la copia vieja (verificado).
- [ ] Merge de [agent-skills#13](https://github.com/AppFreeticket/agent-skills/pull/13)
      → `/plugin marketplace add AppFreeticket/agent-skills` sin `@ref`

Transporte: el plugin declara el **server remoto** `mcp.appfreeticket.com/mcp`
(OAuth en el browser al primer uso). El stdio `npx -y @freeticket/mcp` que se
había puesto primero **no funciona: el paquete no está publicado en npm** — el
plugin registraba el server y moría con "Connection closed". Ver hito 11.

Fuera de alcance: `extensions` con namespace de cliente. Hoy no hay nada que
configurar por host; el día que lo haya, es una clave más en `plugin.json`.

## Hito 11 — Publicar `@freeticket/mcp` en npm

`@freeticket/cli` está publicado (0.8.0); `@freeticket/mcp` **nunca se publicó**,
aunque el skill `freeticket-mcp`, el README del mcp y el roadmap lo dan por
hecho. Sin eso no existe el camino stdio local: ni `npx -y @freeticket/mcp`, ni
Claude Desktop, ni Cursor sin connector remoto.

- [ ] `npm login` (falta auth: `npm whoami` da 401) y publicar `@freeticket/mcp`
      0.13.0 con `--access public`
- [ ] Verificar `npx -y @freeticket/mcp` contra el server real
- [ ] Quitar el aviso "no está en npm" del skill `freeticket-mcp`
- [ ] Decidir el transporte del plugin: seguir en remoto (cero instalación) o
      sumar el stdio como segundo server. Dos servers = tools duplicados en el
      host, así que probablemente sea remoto por defecto y stdio documentado.
- [ ] Publicar el server en directorios MCP (va con el hito 9)

## Hito 10 — Permisos por workspace (v0.14.0)

Objetivo: que una sesión B2B valga **en todos los workspaces del usuario con el
permiso real que tiene en cada uno**. Hoy vale la mitad: el alcance
multi-workspace ya funciona, los permisos no.

Diagnóstico (ago 2026, auditoría del flujo de login de punta a punta):

- ✅ El device flow ya devuelve `workspaces[]` completo y `pickActiveOrg` acepta
      cualquier workspace accesible por `X-Workspace-Id`. El alcance está.
- ❌ `requireApiAuth` (`free-admin/src/lib/api/auth.ts`) devuelve `user.role` —
      el rol **global**, idéntico en todos los workspaces.
- ❌ `WorkspaceMember.role`, `AccessGrant` (secciones + `expires_at`) y la
      elevación de `OrgMember` OWNER/ADMIN existen en la DB y los aplica **solo**
      el dashboard (`elevateOrgAdmin`, `resolveSectionAccess`). La API v1 no.
- ⚠️ Consecuencia: un usuario acotado desde `/dashboard/accesos` en el workspace B
      conserva el límite en el panel y lo pierde con su propia API key de
      `ft login`. Y el inverso: un OWNER elevado en el panel come 403 por API.
- ❌ `GET /me` no dice permisos: `Workspace = {id, name, slug}`. El fan-out
      `workspace: "all"` del mcp los descubre a fuerza de 403.

Backend (bloqueante, [free-admin #403](https://github.com/AppFreeticket/free-admin/issues/403)):

- [ ] `Workspace` gana `role` y `sections` por fila en `GET /me` (aditivo, B2B 1.6.0)
- [ ] Rol efectivo por workspace dentro de `requireApiAuth` — extraer lo que ya
      hace `elevateOrgAdmin`, parametrizado por workspace en vez de por cookie
- [ ] `AccessGrant` acotado y vencido cortan igual por API que por panel

Clientes (después del contrato, nunca antes — regla de oro):

- [ ] `contract-sync` → propagar 1.6.0 a `cli` y `mcp`
- [ ] `ft workspace list`: columnas `role` y `access`
- [ ] `ft login`: si hay >1 workspace, listarlos con su rol (hoy toma
      `workspaces[0]` en silencio, `cli/src/commands/auth.ts:143`)
- [ ] `whoami` del mcp: rol por workspace en la respuesta
- [ ] Fan-out `workspace: "all"`: filtrar targets por permiso antes de disparar,
      en vez de coleccionar 403 en `errors[]`
- [ ] Consent del mcp remoto: mostrar el rol junto a cada workspace elegible

**Criterio de salida:** un usuario con permisos distintos en dos workspaces hace
`ft login` una vez, ve ambos con su rol, y una escritura que su rol no permite en
el workspace B es rechazada por API **igual que la rechaza el panel**.

## Hito 7 — Contrato B2C shipped (free-admin) ✅ (jul 2026)

Tercer linaje semver: `/api/public/openapi.json` 0.3.0, sin auth. Implementado
en `free-admin/src/app/api/public/` + `src/lib/public-api/`.

- [x] `GET /public/events` (filtros `city`, `q`, `from`/`to`, `page`, `sort`;
      reusa la query autoritativa del portal). Nota: `category` no existe como
      campo en el modelo — se omitió en vez de inventarlo.
- [x] `GET /public/events/{slug}`
- [x] `GET /public/events/{slug}/availability` (stock en vivo vía `getTicketAvailability`)
- [x] `POST /public/orders` → venta PENDING + reserva (tx Serializable) +
      `checkoutUrl` de Mercado Pago. Alcance acotado: admisión general (no
      numerado / no members-only), un organizador por orden. **Idempotency-Key
      por header: pendiente** (el builder OpenAPI no soporta header params aún y
      no hay store de dedupe — ponytail, sin infra nueva).
- [x] `GET /public/orders/{id}` (`pending|paid|expired|cancelled` + tickets al pagar)
- [x] `POST /public/tickets/{code}/resend` (ya existía; rate-limited, email enmascarado)
- [x] `contract-sync` (dump del spec → `mcp/public-openapi.json`) + filas
      `shipped` en CONTRACT-GAPS.md

⚠️ **Pendiente de QA antes de prod:** el checkout anónimo crea ventas + preferencias
MP reales. Habilitar compra guest por API es además una decisión de producto (el
checkout web exige cuenta con correo verificado). Falta test de integración con DB.

## Hito 8 — B2C en el MCP: tools `public_*` + mcp-ui (v0.9.0)

Objetivo: el agente de un comprador descubre eventos y completa una compra.
El agente **nunca** toca datos de pago — el humano paga en el checkout de
Mercado Pago (patrón agentic-commerce seguro).

Tools (sin credenciales, viven en el mismo server remoto del hito 4):

- [x] `public_events_list` — catálogo con filtros
- [x] `public_events_get` — detalle por slug
- [x] `public_events_availability` — fechas, tipos, precios, stock
- [x] `public_orders_create` — crea orden → devuelve `checkout_url` (genera y
      pasa `Idempotency-Key` automáticamente)
- [x] `public_orders_get` — estado post-pago + tickets emitidos
- [x] `public_tickets_resend` — reenvío al mail del comprador

Vista B2C:

- [x] Catálogo (`public_events_list`) → tabla con el view compartido (v0.12.0)
- [ ] Availability → selector de fecha + tipo. Requiere un view interactivo que
      llame tools desde el iframe: es otra clase de trabajo, no el render del
      hito 5. Va con el hito 9, donde la skill de compra define el flujo.
- [ ] Orden → resumen con botón al `checkout_url`; estado con polling visual

Cierre:

- [x] Codegen del tercer spec (`openapi-ts.public.config.ts` → `src/public-client/`)
- [x] Tests + README → publicar **0.9.0**

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
      stdio + HTTP, MCP Apps

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
