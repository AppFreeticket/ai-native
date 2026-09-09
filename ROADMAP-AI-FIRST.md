# AI-first roadmap — ai-native

An execution and traceability document, start to finish, for turning FreeTicket
into an AI-first platform: **an MCP with full coverage of the contract (B2B +
admin + B2C)**, reachable from **claude.ai in the browser** (remote HTTP +
OAuth), with **MCP Apps** for visual interaction, distributed as a **portable
plugin ([Agent Plugins 1.0.0](https://agent-plugins.org))**, and a B2B session
that holds **across every workspace the user belongs to, with the real
permission they have in each**.

**How it is traced:** every task is a checkbox, ticked in the same pull request
that completes it. The milestone table below reflects the aggregate state.
Contract holes are recorded in [CONTRACT-GAPS.md](CONTRACT-GAPS.md) — never
invented in a client (the golden rule).

---

## Milestones

| # | Milestone | mcp version | Status | Depends on |
|---|---|---|---|---|
| 0 | Foundations (codegen, submodule, shared auth) | 0.3.0 | ✅ Jul 2026 | — |
| 1 | Wave A — B2B reads (27 tools) | 0.3.0 | ✅ Jul 2026 | — |
| 2 | Wave B — B2B writes (29/29 tools; the contract hole closed in 1.5.0) | 0.4.0 | ✅ Jul 2026 | nothing |
| 3 | Wave C — full admin (15 tools) | 0.5.0 | ✅ Jul 2026 | nothing |
| 4 | Remote HTTP + OAuth → claude.ai in the browser | 0.6.0–0.7.0 | ✅ AS embedded in the mcp (0.10.0) | — |
| 5 | UI in the host — MCP Apps, not `mcp-ui` | 0.12.0 | ✅ Aug 2026 | milestone 2 (writes) |
| 6 | Portable plugin (Agent Plugins 1.0.0) + marketplace | — (plugin 0.2.0) | ✅ installable | milestones 2–3 |
| 7 | B2C contract shipped in free-admin (catalogue + checkout + post-sale) | — | ✅ Jul 2026 | — |
| 8 | `public_*` tools + view | 0.9.0 / 0.12.0 | ✅ Aug 2026 | milestones 4 and 7 |
| 9 | `freeticket-comprar` skill + GA 1.0.0 | 1.0.0 | ⬜ | milestone 8 |
| 10 | Per-workspace permissions (a multi-workspace B2B session carrying the real role in each) | 0.14.0 | ✅ contract 1.7.0 (the role in the consent page is still open) | free-admin #403 ✅ |
| 11 | Publish `@freeticket/mcp` on npm (it does not exist in the registry today) | 0.14.0 | ⬜ `npm login` missing | — |
| 12 | Parity with the website: members area, content and receipts through the contract | 0.14.0 | ✅ Sep 2026 | free-admin #355 #356 #381 #383 |

Statuses: ✅ done · 🔶 in progress · ⬜ pending.

---

## Milestone 0 — Foundations ✅ (Jul 2026)

- [x] Real codegen from both specs (`pnpm generate` → `src/client/`, `src/admin-client/`)
- [x] `src/tools/b2b.ts` + `src/tools/admin.ts` structure, one tool = one operationId
- [x] Auth shared with the CLI: env > `~/.freeticket/config.json` (`ft login` authenticates the MCP too)
- [x] `admin_*` tools gated behind `FT_ADMIN_SESSION`
- [x] `mcp/` turned into a submodule (`AppFreeticket/freeticket-mcp`, public)
- [x] Publishable metadata (repository, bugs, MIT license) + registration tests (vitest)

## Milestone 1 — Wave A: B2B reads ✅ (v0.3.0)

All 27 reads of the `/api/v1` contract:

- [x] Session: `whoami`
- [x] Events: `events_list` · `events_get` · `event_dates_list`
- [x] Tickets: `ticket_types_list` · `ticket_types_get` · `tickets_access`
- [x] Sales: `sales_list` · `sales_get` · `sales_tickets`
- [x] Memberships: `plans_list` · `plans_get` · `plans_subscribers`
- [x] Commercial: `discounts_list` · `webhooks_list` · `venues_list` · `venues_get` · `staff_list`
- [x] Reports: `reports_summary` · `reports_by_event` · `reports_timeseries` · `reports_inventory` · `reconciliation`
- [x] Exports: `reports_export_buyers` · `reports_export_attendees` · `reports_export_subscribers` · `reports_export_reconciliation`

## Milestone 2 — Wave B: B2B writes (v0.4.0)

Goal: **everything `ft` can do can be done through tools.** 29 new tools,
generated from the SDK just like the reads. No backend dependency: the contract
already exposes all 29 operations.

Preparation:

- [x] Run `contract-sync` (a fresh spec before starting)
- [x] Registration helper for writes: MCP `annotations` (`destructiveHint`,
      `idempotentHint`) plus a description demanding explicit human confirmation
      on deletes, refunds and cancels

Events (7):

- [x] `events_create` — `POST /events`
- [x] `events_update` — `PATCH /events/{id}`
- [x] `events_delete` — `DELETE /events/{id}` ⚠️ destructive
- [x] `events_publish` — `POST /events/{id}/publish`
- [x] `event_dates_create` — `POST /events/{id}/dates` (unblocked by contract 1.5.0)
- [x] `event_dates_update` — `PATCH /events/{id}/dates/{dateId}` (unblocked by contract 1.5.0)
- [x] `event_dates_delete` — `DELETE /events/{id}/dates/{dateId}` ⚠️ destructive

Ticket types (3):

- [x] `ticket_types_create` — `POST /ticket-types`
- [x] `ticket_types_update` — `PATCH /ticket-types/{id}` (unblocked by contract 1.5.0)
- [x] `ticket_types_delete` — `DELETE /ticket-types/{id}` ⚠️ destructive

Sales and tickets (5):

- [x] `sales_create` — `POST /sales` (comps / programmatic sales)
- [x] `sales_cancel` — `POST /sales/{id}/cancel` ⚠️ destructive
- [x] `sales_refund` — `POST /sales/{id}/refund` ⚠️ destructive
- [x] `tickets_checkin` — `POST /tickets/{ticketCode}/checkin`
- [x] `tickets_resend` — `POST /tickets/{ticketCode}/resend`

Memberships (4):

- [x] `plans_create` — `POST /membership-plans`
- [x] `plans_update` — `PATCH /membership-plans/{id}` (unblocked by contract 1.5.0)
- [x] `plans_delete` — `DELETE /membership-plans/{id}` ⚠️ destructive
- [x] `subscriptions_cancel` — `POST /subscriptions/{id}/cancel` ⚠️ destructive

Venues and staff (5):

- [x] `venues_create` — `POST /venues`
- [x] `venues_update` — `PATCH /venues/{id}` (unblocked by contract 1.5.0)
- [x] `venues_delete` — `DELETE /venues/{id}` ⚠️ destructive
- [x] `staff_create` — `POST /staff`
- [x] `staff_update_role` — `PATCH /staff/{id}/role`

Commercial (5):

- [x] `discounts_create` — `POST /discounts`
- [x] `discounts_update` — `PATCH /discounts/{id}`
- [x] `discounts_delete` — `DELETE /discounts/{id}` ⚠️ destructive
- [x] `webhooks_create` — `POST /webhooks`
- [x] `webhooks_delete` — `DELETE /webhooks/{id}` ⚠️ destructive

Out of scope: `POST /auth/device/{code,token}` — that is client auth (consumed
by `ft login`), not a tool.

Closing the milestone:

- [x] Registration tests for all 29 tools (the `b2b.test.ts` pattern)
- [x] mcp README: tool table updated
- [x] `oss-maintainer` (CHANGELOG, semver) → publish **0.4.0**

**Exit criterion:** create an event with a date and a ticket type, publish it,
issue a comp and check it in — entirely through MCP tools, zero `ft`.

## Milestone 3 — Wave C: full admin (v0.5.0)

15 tools for the remaining `/api/admin` operations. All gated behind
`FT_ADMIN_SESSION` (like the 4 that already existed).

- [x] Run `contract-sync` (a fresh admin spec)

Workspaces (5):

- [x] `admin_workspaces_get` — `GET /workspaces/{id}`
- [x] `admin_workspaces_create` — `POST /workspaces`
- [x] `admin_workspaces_update` — `PATCH /workspaces/{id}`
- [x] `admin_workspaces_suspend` — `POST /workspaces/{id}/suspend` ⚠️ destructive
- [x] `admin_workspaces_restore` — `POST /workspaces/{id}/restore`

Users and impersonation (4):

- [x] `admin_users_get` — `GET /users/{id}`
- [x] `admin_users_update` — `PATCH /users/{id}`
- [x] `admin_impersonate` — `POST /impersonate` ⚠️ sensitive
- [x] `admin_impersonate_stop` — `POST /impersonate/stop`

Platform plans and flags (6):

- [x] `admin_platform_plans_list` — `GET /platform-plans`
- [x] `admin_platform_plans_get` — `GET /platform-plans/{id}`
- [x] `admin_platform_plans_create` — `POST /platform-plans`
- [x] `admin_platform_plans_update` — `PATCH /platform-plans/{id}`
- [x] `admin_feature_flags_list` — `GET /feature-flags`
- [x] `admin_feature_flags_set` — `PUT /feature-flags/{key}`

Closing:

- [x] Tests + README + CHANGELOG → publish **0.5.0**
- [ ] (Backend, not blocking) free-admin #157: a PAT service token for
      SUPER_ADMIN → migrate from cookie to Bearer once it ships

**Exit criterion:** full parity with `ft admin`; suspend and restore a test
workspace through tools.

## Milestone 4 — Remote HTTP: the MCP inside claude.ai in the browser (v0.6.0–0.7.0)

Goal: add FreeTicket as a **custom connector in claude.ai** (Settings →
Connectors → Add custom connector) with nothing installed locally.

Transport (0.6.0):

- [x] Dual transport: keep stdio and add **Streamable HTTP**
      (the SDK's `StreamableHTTPServerTransport`); a shared server factory
      (`src/server.ts`, `buildServer`) for both entrypoints
- [x] Deployed on Vercel (`mcp.appfreeticket.com/mcp`) with `mcp-handler` /
      a route handler — live (RFC 8414 metadata answers 200)
- [x] The remote server is **stateless**: credentials come only from the request
      (clients isolated per session), it never reads `~/.freeticket/config.json`
- [x] Test interim: a Bearer `FT_API_KEY` header (good enough for remote Claude
      Code and curl; claude.ai requires OAuth) — verified end to end
      (`tools/list` returns 51 B2B, 70 with `X-Admin-Session`)
- [ ] Per-workspace rate limiting at the edge

OAuth 2.1 (0.7.0) — claude.ai requires it for connectors that hold credentials:

- [x] Resource-server side in the mcp: `WWW-Authenticate` + protected resource
      metadata (RFC 9728) at `/.well-known/oauth-protected-resource`
- [x] Authorization server — solved by **embedding it in the mcp itself**
      (0.10.0) instead of requesting it in free-admin: stateless tokens sealing
      the API key, workspace and admin session. `FT_OAUTH_ISSUER` allows
      delegating to a free-admin AS if one ever exists. See the `shipped` row in
      CONTRACT-GAPS.md
- [x] Validate the OAuth token in the mcp (alongside the Bearer API key)
- [x] Consent page served by the mcp, with device-flow login against the
      free-admin session (0.11.0)

Closing:

- [ ] E2E smoke test: from claude.ai on the web, add the connector → authorize →
      `whoami`, `events_list` and one write with confirmation
- [x] Docs: a "Remote use over URL (HTTP)" section in the mcp README
- [x] Publish **0.6.0** (HTTP) — **0.7.0** (OAuth, after the AS) still pending

**Exit criterion:** a user with no terminal operates their workspace from the
browser chat.

## Milestone 5 — UI in the host ✅ (v0.12.0, Aug 2026)

Goal met, **by a different route than planned**: instead of `@mcp-ui/server` (a
third-party library) we implemented the official
**`io.modelcontextprotocol/ui`** extension (MCP Apps, spec `2026-01-26`) by
hand, with no new dependency. The JSON-RPC dialect is about 40 lines; pulling in
a bundler and a build step for that did not pay off, and the official extension
is the one claude.ai understands. The agent reasons over the JSON; the human
sees the view.

Infrastructure:

- [x] A `ui://freeticket/view.html` resource (`text/html;profile=mcp-app`),
      served from the bundle — no disk reads, so it behaves identically over
      stdio and in the Vercel Function
- [x] A `uiTool()` helper that attaches `_meta.ui.resourceUri` without touching
      the payload; the result also travels in `structuredContent`
- [x] Fallback: hosts without the extension ignore `_meta` and see the same text

One single view instead of a template per tool: the render is chosen by the
shape of the payload (**array → table**, **object → KPI tiles**), so there are
no N templates to maintain against a contract that keeps moving.

- [x] 25 tools with a view: every list and every report
- [x] Guaranteed branding: the FreeTicket logo and accent cannot be overridden by
      the host; only `--color-*` / `--font-*` are adopted from it
- [x] `data-theme` + `color-scheme`, currency in the host's locale, validated
      `event.source`, `ui/resource-teardown` answered

Closing:

- [x] Real jsdom tests of the view (table, tiles, error, payload escaping, brand
      invariants) plus a guard that fails when a new list has no view
- [x] README with the detail → published **0.12.0**

Deliberately left out: a confirmation preview on destructive writes, and a
visual check-in result. The host already asks for the confirmation through
`destructiveHint`; duplicating it in a view is UI to maintain in order to repeat
something that already happens.

## Milestone 6 — Portable plugin: the Agent Plugins 1.0.0 standard (end of skill drift)

Goal: a versioned installation that packages skills plus the MCP. It replaces
`npx skills add` (a one-shot copy → drift) as the distribution channel.

**Change of plan (Aug 2026):** instead of a Claude Code-specific format
(`.claude-plugin/`), we adopted [**Agent Plugins 1.0.0**](https://agent-plugins.org)
— an open, vendor-neutral standard (Vercel, VS Code and the GitHub CLI implement
it) carrying the same content: `plugin.json` + `skills/` + `mcp.json`. One
package serves every compatible client instead of one package per host.

**And it needed no new repo:** `AppFreeticket/agent-skills` already had the exact
layout the spec asks for (`skills/<name>/SKILL.md` at the root). Two manifests
were added and that repo *is* the plugin. Creating `freeticket-plugin` to
duplicate three skills would have been moving files for nothing.

- [x] `plugin.json` + `mcp.json` in `agent-skills` (Agent Plugins 1.0.0,
      `name: freeticket`), validated against the official schemas
- [x] `.claude-plugin/plugin.json` — Claude Code does **not** yet read the
      standard's layout (it expects the manifest under `.claude-plugin/`). Both
      manifests declare the same server under a different transport name
      (`streamable-http` in the standard, `http` in Claude Code): the
      duplication is that format divergence, not two configurations.
- [x] `.claude-plugin/marketplace.json` **in the same repo** — a separate
      marketplace repo to list a single plugin does not pay for itself
- [x] `agent-skills` README: installation as a plugin alongside `npx skills`
- [x] E2E installation verified (not just `plugin validate`): marketplace add →
      install → all 3 skills in the cache and the server in `claude mcp list`
- [x] `scripts/validate-plugin.mjs` + CI: validates the repo against the Agent
      Plugins 1.0.0 specification on every push and pull request
- [ ] Release pipeline (`ft-devops-ci`): a tag in cli/mcp/skills → bump the
      `version` in **both** `plugin.json` files. Not cosmetic: the version
      string is the cache's update signal — without a bump, `plugin update`
      leaves the user on the old copy (verified).

Transport: the plugin declares the **remote server** `mcp.appfreeticket.com/mcp`
(OAuth in the browser on first use). The `npx -y @freeticket/mcp` stdio entry
that was configured first **does not work: the package is not published on
npm** — the plugin registered the server and died with "Connection closed". See
milestone 11.

Out of scope: `extensions` with a client namespace. There is nothing to
configure per host today; the day there is, it is one more key in `plugin.json`.

## Milestone 11 — Publish `@freeticket/mcp` on npm

`@freeticket/cli` is published (0.9.0); `@freeticket/mcp` has **never been
published**, even though the `freeticket-mcp` skill, the mcp README and this
roadmap all assume it has. Without it there is no local stdio path: no
`npx -y @freeticket/mcp`, no Claude Desktop, no Cursor without a remote connector.

- [ ] `npm login` (auth missing: `npm whoami` returns 401) and publish
      `@freeticket/mcp` with `--access public`
- [ ] Verify `npx -y @freeticket/mcp` against the real server
- [ ] Drop the "not on npm" warning from the `freeticket-mcp` skill
- [ ] Decide the plugin's transport: stay remote (zero installation) or add
      stdio as a second server. Two servers means duplicated tools in the host,
      so it will probably be remote by default with stdio documented.
- [ ] Publish the server in MCP directories (ships with milestone 9)

## Milestone 12 — Parity with the website ✅ (v0.14.0, Sep 2026)

free-admin closed six ledger gaps in one batch (contracts **1.7.0** / **1.3.0** /
**0.4.0**) while the clients were still standing on 1.5.0: 15 B2B operations and
1 superadmin operation with no client. The principle is the usual one — the
contract leads, the client follows — and here the client had fallen behind,
which is the other way to break it.

- [x] `sync-openapi` ×3 in `cli` and `mcp` + client regeneration
- [x] **Members area** (#355): 10 `customer_*` tools — membership, subscribing
      and cancelling, an editable profile, detail and cancellation of one's own
      purchase, logout. The same surface as the website's members area
- [x] **Content** (#356): `content_videos` · `content_posts` · `content_lives` ·
      `content_live_get` + `content_playback_token` (30 min live, 1 h video)
- [x] **Settlement receipts** (#381): `settlements_document` /
      `settlements_proof` and `ft settlements document <id>`. The API answers 302
      to private storage: the client stops at the redirect and returns the signed
      URL (5 min) instead of dropping a PDF into the model's context
- [x] **Superadmin** (#383): `admin_workspaces_assign_plan` + `webTemplate` /
      `customDomain` on the update; `ft admin workspaces plan`
- [x] **Native cross-workspace staff** (#382): the contract's `workspaceIds`, one
      call instead of a fan-out of N requests
- [x] `GET /events` filters (`status`, `withTotal`) — part of #357, which stays
      open for the rest (date, venue, cross-cutting normalization)
- [x] `coverage.test.ts` green against all three new specs: 110 operations,
      103 tools, 7 deliberate exclusions
- [x] Skills and plugin up to date (103 tools, new commands, plugin 0.2.0)

## Milestone 10 — Per-workspace permissions (v0.14.0)

Goal: a B2B session that holds **across every workspace the user belongs to,
with the real permission they have in each**. Today it holds halfway: the
multi-workspace scope works, the permissions do not.

Diagnosis (Aug 2026, an end-to-end audit of the login flow):

- ✅ The device flow already returns the full `workspaces[]` and `pickActiveOrg`
      accepts any workspace reachable through `X-Workspace-Id`. The scope is there.
- ❌ `requireApiAuth` (`free-admin/src/lib/api/auth.ts`) returns `user.role` —
      the **global** role, identical across every workspace.
- ❌ `WorkspaceMember.role`, `AccessGrant` (sections + `expires_at`) and the
      OWNER/ADMIN elevation of `OrgMember` exist in the database and are applied
      **only** by the dashboard (`elevateOrgAdmin`, `resolveSectionAccess`). The
      v1 API does not.
- ⚠️ Consequence: a user restricted through `/dashboard/accesos` in workspace B
      keeps the limit in the panel and loses it with their own `ft login` API
      key. And the inverse: an OWNER elevated in the panel eats a 403 over the API.
- ❌ `GET /me` says nothing about permissions: `Workspace = {id, name, slug}`.
      The mcp's `workspace: "all"` fan-out discovers them by collecting 403s.

Backend ✅ ([free-admin #403](https://github.com/AppFreeticket/free-admin/issues/403), contract **1.7.0** — not 1.6.0):

- [x] `GET /me` returns a per-row `WorkspaceAccess`: effective `role` + `sections`
      (`null` = unrestricted, `[]` = expired or revoked). `Me.role` is deprecated
- [x] Effective per-workspace role inside `requireApiAuth`
- [x] A restricted or expired `AccessGrant` cuts over the API exactly as it does
      in the panel

Clients (after the contract, never before — the golden rule):

- [x] `contract-sync` → 1.7.0 propagated to `cli` and `mcp`
- [x] `ft workspace list`: `role` and `access` columns
- [x] The mcp's `whoami`: the per-workspace role comes in the contract's response
- [x] `workspace: "all"` fan-out: discards workspaces with `sections: []` before
      firing, instead of collecting 403s in `errors[]`
- [ ] `ft login`: with more than one workspace, list them with their role.
      **Blocked**: `DeviceTokenResponse` still returns `Workspace` (id/name/slug)
      with no role; today it silently takes `workspaces[0]`
      (`cli/src/commands/auth.ts:143`)
- [ ] Remote mcp consent page: show the role next to each eligible workspace —
      blocked by the same thing (it would need an extra `GET /me` with the
      freshly minted token)

**Exit criterion:** a user with different permissions in two workspaces runs
`ft login` once, sees both with their role, and a write their role does not
allow in workspace B is rejected by the API **exactly as the panel rejects it**.

## Milestone 7 — B2C contract shipped (free-admin) ✅ (Jul 2026)

A third semver lineage: `/api/public/openapi.json` 0.3.0, no auth. Implemented
in `free-admin/src/app/api/public/` + `src/lib/public-api/`.

- [x] `GET /public/events` (filters `city`, `q`, `from`/`to`, `page`, `sort`;
      reuses the portal's authoritative query). Note: `category` does not exist
      as a field in the model — it was omitted rather than invented.
- [x] `GET /public/events/{slug}`
- [x] `GET /public/events/{slug}/availability` (live stock via `getTicketAvailability`)
- [x] `POST /public/orders` → a PENDING sale + reservation (Serializable
      transaction) + a Mercado Pago `checkoutUrl`. Narrow scope: general
      admission (not seated, not members-only), one organizer per order.
      **Idempotency-Key header: pending** (the OpenAPI builder does not support
      header params yet and there is no dedupe store — deliberately no new infra).
- [x] `GET /public/orders/{id}` (`pending|paid|expired|cancelled` + tickets once paid)
- [x] `POST /public/tickets/{code}/resend` (already existed; rate limited, address masked)
- [x] `contract-sync` (spec dump → `mcp/public-openapi.json`) + `shipped` rows in
      CONTRACT-GAPS.md

⚠️ **Pending QA before production:** anonymous checkout creates real sales and
real Mercado Pago preferences. Enabling guest purchase through the API is also a
product decision (web checkout requires an account with a verified email). An
integration test against the database is still missing.

## Milestone 8 — B2C in the MCP: `public_*` tools + view (v0.9.0)

Goal: a buyer's agent discovers events and completes a purchase. The agent
**never** touches payment data — the human pays in the Mercado Pago checkout
(the safe agentic-commerce pattern).

Tools (no credentials; they live in the same remote server from milestone 4):

- [x] `public_events_list` — catalogue with filters
- [x] `public_events_get` — detail by slug
- [x] `public_events_availability` — dates, types, prices, stock
- [x] `public_orders_create` — creates the order → returns `checkout_url`
      (generates and passes an `Idempotency-Key` automatically)
- [x] `public_orders_get` — post-payment status + issued tickets
- [x] `public_tickets_resend` — resend to the buyer's address

B2C view:

- [x] Catalogue (`public_events_list`) → a table using the shared view (v0.12.0)
- [ ] Availability → a date and type picker. It needs an interactive view that
      calls tools from the iframe: a different class of work than the milestone 5
      render. It ships with milestone 9, where the purchase skill defines the flow.
- [ ] Order → a summary with a button to the `checkout_url`; status with visual polling

Closing:

- [x] Codegen for the third spec (`openapi-ts.public.config.ts` → `src/public-client/`)
- [x] Tests + README → publish **0.9.0**

**Exit criterion:** from claude.ai with no login, find an event, build the order
and receive the payment link; after paying, see the tickets via `public_orders_get`.

## Milestone 9 — `freeticket-comprar` skill + GA (v1.0.0)

- [ ] A `freeticket-comprar` skill in `skills/`: discover → availability → order
      → human checkout → confirm tickets; it forbids asking for payment data.
      The skill's instructions are in English; the buyer-facing copy it produces
      stays in neutral Spanish
- [ ] Add it to the plugin (milestone 6) and bump the plugin
- [ ] Publish the remote server in MCP directories (the official registry, etc.)
- [ ] A final `oss-maintainer` audit across the three pieces
- [ ] Publish **@freeticket/mcp 1.0.0** — the complete B2B + admin + B2C
      contract, stdio + HTTP, MCP Apps

**GA exit criterion:** all three audiences operate through the MCP alone —
organizer (B2B), superadmin (admin) and buyer (B2C) — from a terminal or a browser.

---

## Cross-cutting rules

1. **Contract first.** A client never invents endpoints; holes go to
   `endpoint-requester` → CONTRACT-GAPS.md.
2. **`contract-sync` before every wave** — always start from a fresh spec.
3. **One tool = one operationId.** No business logic in the server.
4. **Semver per piece**, decoupled releases (cli, mcp, skills, plugin).
5. **`oss-maintainer` before every publish** (CHANGELOG, README, metadata).
6. **Destructive writes always require human confirmation** (annotations +
   description).
7. **Everything open source is written in English.** The single exception is the
   end-user event copy the skills *generate*, which stays in neutral Spanish for
   its LatAm audience.
