# Contract gaps — ai-native

Ledger of capabilities the business or the CLI needs but the OpenAPI contract
**does not expose yet**. Maintained by the
[`endpoint-requester`](.claude/agents/endpoint-requester.md) agent: it spots the
hole, opens an issue in `AppFreeticket/free-admin` and leaves the row here. Once
the endpoint lands in the spec, the row turns `shipped` and `contract-sync`
propagates the change to the clients.

**Golden rule:** a client (`cli`/`mcp`) never invents an endpoint. If it is
missing, it gets requested upstream — never papered over downstream.

Statuses: `identified` (spotted, no issue) · `requested` (issue open) ·
`in-progress` · `shipped` · `wontfix`.

| Capability | Missing endpoint(s) | Contract | Client | free-admin issue | Status |
|---|---|---|---|---|---|
| **Event and date statuses cannot be written** ⚠️ — the enum carries `CANCELLED`/`SOLD_OUT`/`COMPLETED` and the only exposed transition is `DRAFT→PUBLISHED`. Cancelling a show forces a `DELETE`, which destroys the sales history. A date added after publishing cannot be published | `POST /events/{id}/cancel` + a writable `status` in `EventDateUpdate` | B2B | cli, mcp | [#683](https://github.com/AppFreeticket/free-admin/issues/683) | requested |
| **Removing a staff member is impossible** ⚠️ — you can invite and change a role; `/staff/{id}` does not exist. Downgrading to `VIEWER` does not revoke: the person keeps seeing sales and buyers | `DELETE /staff/{id}` + `GET /staff/{id}` | B2B | cli, mcp | [#684](https://github.com/AppFreeticket/free-admin/issues/684) | requested |
| `Sale` does not say why it failed — `ABANDONED` with `confirmedAt: null` is indistinguishable from an expired order. Diagnosing means leaving the API and reading gateway logs in production | `failureReason`/`declineCode` on `Sale`, or `GET /sales/{id}/attempts` | B2B | cli, mcp | [#685](https://github.com/AppFreeticket/free-admin/issues/685) | requested |
| The settlement cycle does not close headless — two file sub-resources hang off an id that cannot be read, and there is no `POST` under `settlement` | `GET /settlements/{id}` + `POST /settlements/{id}/resend` | B2B | cli, mcp | [#686](https://github.com/AppFreeticket/free-admin/issues/686) | requested |
| Webhooks have neither editing nor history — no way to see whether a delivery failed or to retry it; editing forces delete-and-recreate, which rotates the `signingSecret` | `PATCH /webhooks/{id}` + `GET /webhooks/{id}/deliveries` + retry | B2B | cli, mcp | [#687](https://github.com/AppFreeticket/free-admin/issues/687) | requested |
| Reassigning a sold ticket to another date — a postponement forces a refund and a resale, losing the gateway fee, the attendance and the seat | `PATCH /tickets/{ticketCode}` with `eventDateId`/`ticketTypeId` | B2B | cli, mcp | [#688](https://github.com/AppFreeticket/free-admin/issues/688) | requested |
| Exports have no schema and no tax data — `/reports/exports/*` answers `{type: object}` with no properties, and `Sale` carries no identity document to invoice against | type the response of all three exports + `buyerDocumentType`/`buyerDocumentNumber` | B2B | cli, mcp | [#689](https://github.com/AppFreeticket/free-admin/issues/689) | requested |
| Reconciliation has no event filter — you must pull the whole workspace and cross-reference by `sale_reference` by hand; the row does not say which event it belongs to either | `event`/`eventDate` on `/reports/reconciliation` + `eventId`/`eventName` on `ReconciliationRow` | B2B | cli, mcp | [#690](https://github.com/AppFreeticket/free-admin/issues/690) | requested |
| Superadmin: plans are assigned blind and `deletedAt` is unreachable — `POST /workspaces/{id}/plan` cancels Stripe with no way to read the current plan; the schema declares a soft delete no endpoint performs | `plan` on `AdminWorkspace` + `DELETE /workspaces/{id}` | Superadmin | cli, mcp | [#691](https://github.com/AppFreeticket/free-admin/issues/691) | requested |
| **Write schemas do not cover the read schemas** — `saleStartsAt`/`saleEndsAt`, `EventDate.status`, `streamType` and the Seats.io keys can be read and not written. Scheduling when sales open is impossible headless | those fields in the `*Create`/`*Update` schemas, or `readOnly: true` if the omission is deliberate | B2B | cli, mcp | [#692](https://github.com/AppFreeticket/free-admin/issues/692) | requested |
| Public checkout does not accept seats — `SaleCreate` has `items[].seats` and `CreateOrderRequest` does not: agent purchase is closed for every seated event | `items[].seats` on `CreateOrderRequest` + seats in `/availability` | B2C (`/api/public`) | mcp | [#693](https://github.com/AppFreeticket/free-admin/issues/693) | requested |
| Members-only presale has no counterpart — `benefitPresale` is a boolean on the plan and no event can declare itself restricted to members. Needs a product decision before an endpoint | confirm whether the feature exists in the panel, then put it in the contract | B2B | skills | [#694](https://github.com/AppFreeticket/free-admin/issues/694) | requested |
| An organizer cannot upgrade their own plan — a buyer has `POST /customer/subscriptions` with a Stripe link; the organizer depends on an assisted superadmin sale. May be deliberate | `POST /billing/checkout` in v1, or close it as a commercial decision | B2B | cli, mcp | [#695](https://github.com/AppFreeticket/free-admin/issues/695) | requested |
| **`buyerTotal` lies on seated events** ⚠️ — `/api/v1` does not add the per-seat surcharge (COP 3,000 a seat) that checkout does charge. An agent quoting from the contract tells the buyer a price lower than what they will pay. It is money, and the wrong number is one we hand out | `TicketTypeDTO.buyerTotal` must include `SEATING_SURCHARGE_PER_SEAT` when the date is seated, or the contract must expose the surcharge separately so the client can add it | B2B | cli, mcp | [#529](https://github.com/AppFreeticket/free-admin/issues/529) | requested |
| Transferring a ticket to another person through the API — split out of #355, its only remaining point. A buyer who wants to pass their ticket on depends on the panel | a transfer endpoint on the ticket (reassigns the holder and reissues the QR) | B2B (`/customer`) | mcp | [#507](https://github.com/AppFreeticket/free-admin/issues/507) | requested |
| **Safe retries for agents** — an agent retries on timeout or 5xx: today it cannot do so without duplicating, nor know whether it should. `POST /sales` takes no idempotency key (`/public/orders` does) and the error envelope does not say whether the failure is transient | `Idempotency-Key` header on `POST /sales` with the same semantics as `/public/orders` **+** `retryable: boolean` on `components.schemas.Error`. Both additive: they break no existing client | B2B | cli, mcp | [#677](https://github.com/AppFreeticket/free-admin/issues/677) | requested |
| Partial refunds — `SaleRefundRequest` only accepts `acknowledge_manual` and is `additionalProperties: false`; the CLI promised a partial amount in its `--help` and README, which meant a guaranteed 422. The text is fixed; whether the capability should exist is still open | optional `amount` on `SaleRefundRequest` **+** rules for the service fee and the 4x1000 tax on a partial, and behaviour across successive partials | B2B | cli ✓ (text) | [#681](https://github.com/AppFreeticket/free-admin/issues/681) | requested |
| **Silent empty responses** — an empty list or report never says why: an out-of-scope `eventId` returns `[]` exactly like an event with no inventory, and `GET /events` does not say which workspace it queried. An agent cannot self-correct; it cost 9 calls where 3 would do | additive `warnings[]` on lists and reports (`empty_in_active_workspace`, `resource_out_of_scope`) carrying the active workspace, the credential's scope and the offending field. Additive, not a hard error: it breaks nobody who treats `[]` as valid | B2B | mcp, cli | [#674](https://github.com/AppFreeticket/free-admin/issues/674) | requested |
| **Headless onboarding** — an agent operates the whole product but cannot start using it: no contract has a signup, `ft login` (device flow) mints a credential for an account that already exists, B2B v1 has no `/workspaces` (creating a tenant is superadmin-only) and the entire `/customer/*` surface demands an enterprise service key — there is a `POST /customer/logout` and no login ⚠️ | **B2B:** `POST /auth/signup` (public, verify-first) + `POST /workspaces` in v1 (the user creates their own tenant) + nullable `Me.activeWorkspaceId`. **B2C:** `POST /customer/auth/request` + `/customer/auth/verify` (magic link, signup = login) **+** `/customer/*` accepting `X-Customer-Session` without the enterprise key | B2B + B2C (`/customer`) | cli, mcp | [#673](https://github.com/AppFreeticket/free-admin/issues/673) | requested |
| **Per-workspace permissions** — a B2B session reached every workspace the user belonged to carrying their **global** role, not the one effective in each: a user restricted in the panel operated that workspace without limits through the CLI or MCP ⚠️ | `GET /me` → `WorkspaceAccess` with a per-row `role` and `sections` **+** the effective per-workspace role enforced inside `requireApiAuth` (enforcement, not just discovery). `Me.role` becomes deprecated | B2B | cli ✓, mcp ✓ | [#403](https://github.com/AppFreeticket/free-admin/issues/403) | shipped |
| Staff across several workspaces in one call — `GET /staff` only took `limit`/`cursor`, so a multi-workspace panel made N requests | `GET /staff` with `workspaceIds` (max 25, rows tagged with `workspaceId`/`workspaceName`, intersected against what the credential already administers) | B2B | cli ✓, mcp ✓ | [#382](https://github.com/AppFreeticket/free-admin/issues/382) | shipped |
| Settlement receipts through the API — `GET /settlements` existed but the PDF was panel-only | `GET /settlements/{id}/document` + `GET /settlements/{id}/proofs/{fileName}` — 302 to a signed URL with a 5-minute TTL (the client stops at the redirect and returns the link) | B2B | cli ✓, mcp ✓ | [#381](https://github.com/AppFreeticket/free-admin/issues/381) | shipped |
| Superadmin: web template, custom domain and manual plan assignment — `AdminWorkspaceUpdate` only exposed `name`, `slug`, `type`, `isPublished` | `PATCH /workspaces/{id}` with `webTemplate` / `customDomain` / `customDomainVerifiedAt` **+** `POST /workspaces/{id}/plan` (assisted sale: cancels the Stripe subscription before reassigning, aborts with 409 if that fails) | Superadmin | cli ✓, mcp ✓ | [#383](https://github.com/AppFreeticket/free-admin/issues/383) | shipped |
| Contract DX for headless integrations — spec out of sync, heterogeneous pagination and errors, a VIEWER role ceiling. **Partial (1.7.0)**: `status` and `withTotal` landed on `GET /events` (plus `page.total`), as did the buyer session lifecycle (`/customer/logout`); the remaining filters (date, venue) and the cross-cutting normalization are still missing | filters on `GET /events` + cross-cutting normalization | B2B | cli ✓ (partial), mcp ✓ (partial) | [#357](https://github.com/AppFreeticket/free-admin/issues/357) | in-progress |
| Content (ContentVideo / LiveStream) unreachable headless — zero paths in the contract | `GET /content/videos`, `/content/posts`, `/content/lives`, `/content/lives/{id}` + `POST /content/playback-token` (signed token: 30 min for live, 1 h for video; `memberOnly` requires a buyer session with a membership) | B2B | mcp ✓ | [#356](https://github.com/AppFreeticket/free-admin/issues/356) | shipped |
| Members area: the buyer surface was too thin — only `GET /customer/me` and `/customer/tickets` | `GET/PATCH /customer/profile`, `GET /customer/membership`, `POST /customer/subscriptions` (+ `/cancel`), `GET /customer/tickets/{id}`, `POST /customer/tickets/{id}/cancel`, `POST /customer/logout` | B2B (`/customer`) | mcp ✓ | [#355](https://github.com/AppFreeticket/free-admin/issues/355) | shipped |
| Self-service browser login (device flow, RFC 8628) — the user signs in with their own session and mints their own token, with no server-side `pnpm api:key` | `POST /auth/device/code`, `POST /auth/device/token` (+ a `/cli` approval page in free-admin) | B2B | cli ✓, mcp | [#160](https://github.com/AppFreeticket/free-admin/issues/160) | shipped |
| Check-in / door access control | `POST /tickets/{code}/checkin`, `GET /tickets/{code}/access` | B2B | cli ✓, mcp | [#172](https://github.com/AppFreeticket/free-admin/issues/172) | shipped |
| Individual tickets and attendees, plus resend | `GET /sales/{id}/tickets`, `POST /tickets/{code}/resend` (reissue QR and email) | B2B | cli ✓ | [#173](https://github.com/AppFreeticket/free-admin/issues/173) | shipped |
| Creating a sale or order through the API (comp / programmatic sale) | `POST /sales` | B2B | cli ✓ | [#174](https://github.com/AppFreeticket/free-admin/issues/174) | shipped |
| Subscriptions and members of a plan | `GET /membership-plans/{id}/subscribers`, `POST /subscriptions/{id}/cancel` | B2B | cli ✓ | [#175](https://github.com/AppFreeticket/free-admin/issues/175) | shipped |
| Coupons and discounts | `GET/POST/PATCH/DELETE /discounts` | B2B | cli ✓ | [#176](https://github.com/AppFreeticket/free-admin/issues/176) | shipped |
| Webhooks (register endpoints for sale and refund events) | `GET/POST/DELETE /webhooks` | B2B | cli ✓, mcp | [#177](https://github.com/AppFreeticket/free-admin/issues/177) | shipped |
| Per-event and time-series reports | `GET /reports/by-event`, `GET /reports/timeseries` | B2B | cli ✓ | [#178](https://github.com/AppFreeticket/free-admin/issues/178) | shipped |
| Available-inventory report by event, date and ticket type | `GET /reports/inventory` (capacity/sold/reserved/available per event·date·type; params `eventId`, `eventDateId`, `from`, `to`, `includeDrafts`, `groupBy=ticketType\|date\|event`) | B2B | cli ✓ | [#165](https://github.com/AppFreeticket/free-admin/issues/165) | shipped |
| Useful filters on the sales list | `GET /sales` query params `event`, `eventDate`, `reference`, `buyer`, `from`, `to`, `channel` (on top of `status`, `limit`, `cursor`) | B2B | cli ✓ | [#167](https://github.com/AppFreeticket/free-admin/issues/167) | shipped |
| Buyer and attendee exports with filters and ticket detail | `GET /reports/exports/buyers` (one row per sale) + `GET /reports/exports/attendees` (one row per ticket), both with `event`, `eventDate`, `from`, `to`, `status` filters and event/date/type detail | B2B | cli ✓ | [#168](https://github.com/AppFreeticket/free-admin/issues/168) | shipped |
| Public B2C discovery (a catalogue for buyer-side agents) | `GET /public/events` (filters `city`, `date`, `category`, `q`, cursor), `GET /public/events/{slug}`, `GET /public/events/{slug}/availability` (dates, types, prices, stock) — no auth, cache-friendly, published events only | B2C (`/api/public`) | mcp ✓ | [#189](https://github.com/AppFreeticket/free-admin/issues/189) | shipped |
| Agent purchase, B2C (checkout through Mercado Pago; the agent never touches the payment) | `POST /public/orders` (buyer email + items, mandatory `Idempotency-Key` header, rate limited → `order_id` + Mercado Pago `checkout_url`), `GET /public/orders/{id}` (status `pending\|paid\|expired\|cancelled` + tickets once paid) | B2C (`/api/public`) | mcp ✓ | [#190](https://github.com/AppFreeticket/free-admin/issues/190) | shipped |
| B2C buyer post-sale (resend a ticket without credentials) | `POST /public/tickets/{code}/resend` (resends the QR and email to the buyer's address, rate limited, address masked in the response) | B2C (`/api/public`) | mcp ✓ | [#191](https://github.com/AppFreeticket/free-admin/issues/191) | shipped |
| OAuth 2.1 authorization server for the remote MCP — claude.ai requires OAuth for connectors that hold credentials. Solved by **embedding the AS in the mcp itself** (v0.10.0): stateless tokens that seal the API key, workspace and admin session; it needed no new endpoint in free-admin. `FT_OAUTH_ISSUER` allows delegating to a free-admin AS if one ever exists | `/.well-known/oauth-authorization-server` (RFC 8414), dynamic client registration (RFC 7591), `/authorize` + `/token` with PKCE and a consent page — all served by the mcp | B2B | mcp ✓ | — | shipped |
| Update endpoints with no `requestBody` in the spec — with no declared body the mcp could not type `event_dates_create/update`, `ticket_types_update`, `plans_update` or `venues_update` | `POST /events/{id}/dates`, `PATCH /events/{id}/dates/{dateId}`, `PATCH /ticket-types/{id}`, `PATCH /membership-plans/{id}`, `PATCH /venues/{id}` — with a `requestBody` as of contract 1.5.0 | B2B | cli ✓, mcp ✓ | — | shipped |

<!-- endpoint-requester: add new rows above this line, ordered by priority. -->

## Current coverage (sweep of 2026-09-02)

Contracts the clients are built against: B2B **1.7.0** · superadmin **1.3.0** ·
public **0.4.0**.

> ⚠️ **The committed contracts are behind what free-admin serves** — live as of
> 2026-09-09: B2B **1.12.0**, superadmin **1.5.0**, public **0.7.0**. The
> coverage numbers below describe 1.7.0/1.3.0/0.4.0, so they are a floor, not a
> current reading. Run `contract-sync` before trusting them, and before adding a
> gap row: an endpoint that is missing here may already exist upstream.

**Coverage ≠ no holes.** The 110 operations the contract *exposes* all have a
tool in the mcp (bar 7 excluded on purpose) — that is what the table below
measures. What the contract **does not expose**, or exposes wrongly, is the
**twenty open rows** above, and no automated sweep sees them: they come from
auditing the product from an agent's seat. The most urgent: #529 (`buyerTotal`
lies on seated events — that is money), #673 (there is no onboarding), #683
(cancelling an event forces deleting it) and #684 (a staff member cannot be
removed). The sweep detects new endpoints without a tool, never functionality
nobody has asked for yet.

The sweep is automated in
[`mcp/src/coverage.test.ts`](mcp/src/coverage.test.ts) — if `sync-openapi` pulls
a new endpoint and nobody writes it a tool, the test fails with its method and path.

| Contract | Operations | With a tool | Excluded |
|---|---|---|---|
| B2B `/api/v1` | 81 | 76 | 5 |
| Superadmin `/api/admin` | 23 | 21 | 2 |
| Public `/api/public` | 6 | 6 | 0 |

Deliberate exclusions (the reasoning lives next to the test, not only here):

- `postAuthDeviceCode`, `postAuthDeviceToken` — device flow mechanics; used by
  the mcp's embedded authorization server, not by an agent.
- `postApiKeys`, `deleteApiKeysId`, `postTokens`, `deleteTokensId` — minting and
  revoking credentials happens from the CLI, with a human at the keyboard.
- `postApiCustomerAuthEnterpriseExchange` — mints third-party buyer sessions;
  it is server-to-server between free-admin and the integrator.
