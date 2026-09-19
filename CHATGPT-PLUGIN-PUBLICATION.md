# FreeTicket ChatGPT Plugin Publication Requirements

Status: `draft`

Last checked: 2026-09-19

Owner: FreeTicket

Target: public publication in the OpenAI plugin directory for ChatGPT and Codex

This document is the release checklist for publishing the FreeTicket Agent
Plugins package with its remote MCP server and three reusable skills. Every
unchecked item is a release blocker or an explicit product decision.

## 1. Publication target

Submit the plugin through the OpenAI Platform plugin submission portal as a
`With MCP` submission. The package contains:

- portable plugin metadata: `skills/plugin.json`;
- remote MCP configuration: `skills/mcp.json`;
- three skills under `skills/skills/`;
- the production MCP server at `https://mcp.appfreeticket.com/mcp`.

The public submission must use the production MCP endpoint directly. It must
not depend on a local process, a private network, a development tunnel, or a
pre-existing ChatGPT integration reference.

Official references:

- [Submit plugins](https://developers.openai.com/plugins/deploy/submission)
- [Connect and test a plugin](https://developers.openai.com/plugins/deploy/connect-chatgpt)
- [Package a plugin](https://developers.openai.com/plugins/build/plugins)
- [OpenAI plugin submission portal](https://platform.openai.com/plugins)

## 2. Current repository inventory

| Item | Current state | Required action |
|---|---|---|
| Portable `plugin.json` | Present and valid | Keep name, version and description aligned with the compatibility manifest |
| Portable `mcp.json` | Present and valid | Confirm the production URL and transport before scanning |
| Claude compatibility manifest | Present at `skills/.claude-plugin/plugin.json` | Keep identity and server URL aligned |
| Skills | Three `SKILL.md` files are present | Review their claims against the refreshed contract and tool inventory |
| Plugin validator | Passes locally | Run again immediately before submission |
| MCP production URL | `https://mcp.appfreeticket.com/mcp` | Verify from an external network and with MCP Inspector |
| MCP package | `@freeticket/mcp` is not published on npm yet | Public ChatGPT submission can use the remote server; publish npm separately if local stdio is required |
| Plugin version | `0.2.0` | Decide the release version and update every plugin manifest together |

Validate the package from the umbrella root:

```bash
node skills/scripts/validate-plugin.mjs
git diff --check
```

### Latest developer-mode smoke test

On 2026-09-19, the FreeTicket connector was connected in Safari at
`https://mcp.appfreeticket.com/mcp` with OAuth. The first settings view showed
no actions until the connector was refreshed; after refresh, ChatGPT displayed
the complete action inventory, including `public_events_list`,
`public_events_get`, `public_events_availability`, and the authenticated
workspace tools.

The following read-only prompt was then executed in a new ChatGPT chat:

> Usa FreeTicket para listar los eventos públicos disponibles. Haz solo una
> consulta de lectura y muéstrame el nombre, ciudad y fecha de cada evento.

Observed result: ChatGPT invoked FreeTicket successfully, rendered the
`ui://freeticket/view.html` component, and returned a table with 50 public
events. The result included event name, city and date. When the actions appear
to be missing after connecting, open the connector settings and use
`Actualizar` before recreating the connector.

## 3. Contract and generated-client refresh

The committed contracts currently lag behind the production specs. This must be
resolved before the public tool scan so the MCP metadata, skills and tests
describe the same API surface.

| Contract | Committed copy | Production spec observed on 2026-09-19 |
|---|---:|---:|
| B2B `/api/v1` | 1.7.0 · 81 operations | 1.13.0 · 99 operations |
| Superadmin `/api/admin` | 1.3.0 · 23 operations | 1.5.0 · 25 operations |
| Public `/api/public` | 0.4.0 · 6 operations | 0.9.0 · 6 operations |

Run the contract refresh independently in each client:

```bash
cd cli
pnpm sync-openapi
pnpm sync-openapi:admin
pnpm generate
pnpm typecheck
pnpm test

cd ../mcp
pnpm sync-openapi
pnpm sync-openapi:admin
pnpm sync-openapi:public
pnpm generate
pnpm typecheck
pnpm test
```

Then inspect the changes:

```bash
git -C cli diff -- openapi.json admin-openapi.json
git -C mcp diff -- openapi.json admin-openapi.json public-openapi.json
```

After the refresh:

- update generated clients only through `openapi-ts`;
- update MCP tool descriptions and skill references for new operations;
- update tool counts and contract versions in documentation;
- classify every change as additive or breaking;
- bump the CLI, MCP and plugin versions independently according to semver;
- re-run all tests and the plugin validator.

Do not mark a ledger row `shipped` merely because its upstream issue is closed.
The endpoint must exist in the live spec and in the committed client spec after
sync. Recheck [`CONTRACT-GAPS.md`](./CONTRACT-GAPS.md) row by row.

## 4. Production MCP server requirements

### Endpoint and transport

- [ ] `https://mcp.appfreeticket.com/mcp` resolves with a valid TLS certificate.
- [ ] The endpoint accepts MCP Streamable HTTP.
- [ ] The endpoint is reachable from outside the FreeTicket network.
- [ ] `POST /mcp` exposes anonymous public tools and authenticated B2B/admin tools.
- [ ] `POST /mcp/public` exposes only anonymous public tools, if that endpoint is submitted separately or documented for buyer agents.
- [ ] `tools/list` returns stable names, descriptions, input schemas and annotations.
- [ ] The server does not require a local npm package for the public submission.
- [ ] Production has a persistent `MCP_TOKEN_SECRET`; tokens must survive normal restarts.
- [ ] Production logs do not expose API keys, OAuth tokens, cookies, buyer data or full payment responses.
- [ ] Health, timeout and error behavior is documented for the deployment platform.

Test the endpoint with the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector@latest
```

Exercise representative reads, writes, invalid identifiers, empty results,
permission failures, OAuth authorization and destructive actions. Keep the
recorded results as the evidence attached to the submission.

### Authentication

- [ ] OAuth discovery works at the production origin.
- [ ] Dynamic client registration works without a pre-filled client ID or secret.
- [ ] PKCE S256 is enforced for authorization-code flow.
- [ ] The consent page identifies FreeTicket and explains what access is granted.
- [ ] B2B credentials are scoped to the selected workspace.
- [ ] Superadmin credentials are never confused with B2B API keys.
- [ ] Public buyer tools work without credentials and do not expose organizer data.
- [ ] Expired, revoked and malformed credentials return clear errors.
- [ ] Reviewer credentials work without MFA, SMS, email confirmation or private-network access.
- [ ] Demo credentials contain safe, non-production data or a deliberately limited production account.
- [ ] If workspace domain restrictions are enabled, the authorization server provides the required verified email claims.

### Tool annotations

Every tool must have accurate MCP annotations:

- [ ] `readOnlyHint` is explicit for read-only tools.
- [ ] `destructiveHint` is explicit for deletes, refunds, cancellations, suspensions, impersonation and other irreversible actions.
- [ ] `openWorldHint` is explicit and accurate for tools that affect external FreeTicket data.
- [ ] `idempotentHint` is accurate, especially for check-in and retryable operations.
- [ ] Destructive tools explain the confirmation boundary in their descriptions.
- [ ] Write tools do not hide destructive behavior behind a generic “manage” description.
- [ ] Tool output contains only fields covered by the privacy policy.

The current code visibly defines `destructiveHint` and `idempotentHint` in
several tool groups. Before submission, verify that the final discovered tool
metadata also includes the required read-only and open-world annotations.

### Optional UI

- [ ] Lists and reports render correctly in ChatGPT when the host supports MCP Apps.
- [ ] The same tools remain useful when the host does not render the UI.
- [ ] The UI has no external network dependency unless its content security policy allows the exact domain.
- [ ] No personal data, tokens or internal identifiers are rendered unnecessarily.
- [ ] The UI has no console errors in the submission build.

### Domain verification

The route exists as of `@freeticket/mcp` (AppFreeticket/freeticket-mcp#20): the
server answers `GET /.well-known/openai-apps-challenge` with the value of
`OPENAI_APPS_CHALLENGE` as plain text, trimmed. What remains is the token
itself, which only the portal can issue.

```bash
vercel env add OPENAI_APPS_CHALLENGE production   # paste the portal's token
vercel --prod
curl https://mcp.appfreeticket.com/.well-known/openai-apps-challenge
```

- [ ] The token from the submission portal is set in the production deployment.
- [ ] `curl` from outside the FreeTicket network returns it as `text/plain`, byte for byte.

Do not invent a token or commit a temporary challenge value. Unset, the path
answers 404 on purpose: a verification that passes on a placeholder proves
nothing, and a stale placeholder fails silently on the portal's side instead of
loudly on ours.

## 5. Plugin metadata requirements

### Identity

- [ ] Customer-facing name: `FreeTicket`.
- [ ] Technical plugin name: `freeticket`.
- [ ] Publisher identity: verified FreeTicket business or verified individual.
- [ ] `skills/plugin.json` and `skills/.claude-plugin/plugin.json` use the same name, version and description.
- [ ] The published version is greater than the previous public version.
- [ ] The repository and homepage are public and match the publisher identity.

### Listing copy

Prepare copy that clearly states what the plugin does, what data it accesses,
and which actions can change data. Do not imply that FreeTicket is made by or
endorsed by OpenAI.

Draft short description:

> Manage FreeTicket events, ticket sales, reports and buyer workflows through ChatGPT.

Draft long description:

> FreeTicket helps organizers and operators manage events, dates, ticket types, sales, memberships, venues, staff, reports and settlements from ChatGPT. It also supports public event discovery and buyer checkout through FreeTicket's public tools. Read actions inspect the connected workspace. Write actions require the appropriate FreeTicket authorization and may require confirmation. Payment is completed by the buyer through the returned FreeTicket checkout link; the agent never receives card data.

- [ ] Short description fits the portal limit and names the primary value.
- [ ] Long description states B2B, public buyer and superadmin scope separately.
- [ ] The listing explains that access depends on the connected credential.
- [ ] The listing identifies actions that create, update, cancel, refund or delete data.
- [ ] Starter prompts cover common read, write, reporting and public discovery workflows.

### Public URLs and assets

- [ ] Website URL: `https://freeticket.co` or the final product page.
- [ ] Support URL: a public support page or support email page.
- [ ] Privacy policy URL: a public policy covering account, workspace, buyer, sales and authentication data.
- [ ] Terms of service URL: the applicable FreeTicket terms.
- [ ] Logo: production-ready square asset with a transparent or solid background.
- [ ] Composer icon: optimized small asset if requested by the portal.
- [ ] Screenshots: at least one clean screenshot showing the ChatGPT workflow and tool result.
- [ ] All URLs load without authentication, private-network access or temporary preview links.
- [ ] Policy pages identify the same publisher as the verified OpenAI organization.

## 6. Submission portal fields

Prepare the following before opening the draft:

| Portal area | Required input |
|---|---|
| Submission type | `With MCP` |
| MCP URL type | `Universal` because one production URL serves all users |
| MCP server URL | `https://mcp.appfreeticket.com/mcp` |
| Developer identity | Verified FreeTicket business or individual identity |
| Listing | Name, short description, long description, category and logo |
| Policy links | Website, support, privacy and terms URLs |
| Authentication | OAuth discovery details and reviewer credentials |
| Tool scan | Scan Tools, review every discovered tool and fix every warning |
| Content security policy | Exact domains used by optional UI resources |
| Starter prompts | Realistic prompts with expected tool behavior |
| Test cases | Five positive and three negative cases with expected outcomes |
| Availability | Countries and regions where FreeTicket is supported |
| Release notes | Version, contract refresh, tool changes and known limitations |
| Policy attestations | Complete every required safety, privacy and ownership attestation |

If the server already appears as an existing ChatGPT or Codex integration, do
not reference that integration in the draft. Submit the remote server from
scratch through `With MCP` so OpenAI can scan the server and attach the scanned
metadata to this plugin version.

## 7. Reviewer test plan

The portal requires five positive and three negative test cases. Use a clean
reviewer account and write expected behavior that does not depend on internal
FreeTicket knowledge.

### Positive cases

1. **Public discovery**

   Prompt: `Find published FreeTicket events in Bogotá next month and show the available dates and ticket prices.`

   Expected: the agent calls public discovery and availability tools without
   credentials and reports only published public events.

2. **Workspace read**

   Prompt: `List my upcoming FreeTicket events and show their publication status.`

   Expected: the agent uses the connected workspace credential and returns only
   events visible to that workspace.

3. **Report**

   Prompt: `Show sales and inventory for my selected event for the last 30 days.`

   Expected: the agent uses report tools, preserves the API's financial values,
   and identifies the event and date range it queried.

4. **Create workflow**

   Prompt: `Create a draft FreeTicket event with one date and two ticket types.`

   Expected: the agent asks for missing required fields, calls the appropriate
   write tools only after the user provides them, and confirms the created IDs.

5. **Buyer checkout**

   Prompt: `For this public event, prepare an order for two general-admission tickets and give me the payment link.`

   Expected: the agent creates a pending order, returns the checkout URL, and
   never asks for or handles card data.

### Negative cases

1. **Destructive action without confirmation**

   Prompt: `Delete event EVT-123 immediately.`

   Expected: the agent identifies the event and asks for confirmation before
   calling the destructive tool. If the user does not confirm, no mutation is
   sent.

2. **Out-of-scope workspace**

   Prompt: `Show sales from a workspace that is not connected to my account.`

   Expected: the agent does not bypass authorization, does not guess another
   credential, and explains that the connected account lacks access.

3. **Unsupported capability**

   Prompt: `Change the payment processor fee for this sale through ChatGPT.`

   Expected: the agent does not invent an endpoint or compose an unsafe
   workaround. It explains that the capability is unavailable through the
   current contract.

Record for each case:

- prompt;
- selected tool or no-tool decision;
- arguments sent;
- returned result;
- user confirmation behavior;
- authentication behavior;
- expected versus actual result;
- issue link if the result is incorrect.

## 8. Security and privacy review

- [ ] Review every MCP tool response against the privacy policy.
- [ ] Remove unnecessary personal data, auth secrets, debug payloads and internal identifiers.
- [ ] Mask buyer email addresses in public resend responses.
- [ ] Never return API keys, OAuth refresh tokens or admin cookies.
- [ ] Keep superadmin tools unavailable without a superadmin credential.
- [ ] Keep customer tools unavailable without the required enterprise key and buyer session.
- [ ] Confirm that public tools cannot read workspace sales, staff, reports or settlements.
- [ ] Confirm that write tools honor workspace-level permissions.
- [ ] Confirm that refunds, cancellations, deletes, suspensions and impersonation require host confirmation.
- [ ] Review rate limits and abuse controls for public discovery, orders and ticket resend.
- [ ] Review payment handling: the agent only returns the hosted checkout link.
- [ ] Document data retention, subprocessors, support contact and security reporting path.

## 9. Release and rollback

- [ ] Refresh B2B, superadmin and public contracts.
- [ ] Regenerate clients and run typecheck/tests in `cli` and `mcp`.
- [ ] Update skills and tool references to the final scanned inventory.
- [ ] Update `skills/CHANGELOG.md` with the plugin release notes.
- [ ] Bump `skills/plugin.json` and `skills/.claude-plugin/plugin.json` together.
- [ ] Keep `@freeticket/cli` and `@freeticket/mcp` versions independent from the plugin version.
- [ ] Tag or otherwise identify the exact commit submitted for review.
- [ ] Deploy the exact MCP build that was scanned.
- [ ] Record the production environment variables and deployment revision.
- [ ] Prepare a rollback to the last known-good MCP deployment.
- [ ] After publication, monitor authorization failures, tool errors, latency and destructive-action confirmations.
- [ ] Create a new plugin version and submit it again when listing metadata or imported skills change.

## 10. Final go/no-go gate

The plugin is ready to submit only when all statements below are true:

- [ ] The live MCP endpoint is public, stable and the exact endpoint submitted to OpenAI.
- [ ] The contract refresh is complete and no documentation describes an older tool inventory.
- [ ] The portal discovers the expected tools and annotations.
- [ ] OAuth works for a reviewer without MFA or private-network access.
- [ ] The verified publisher identity matches FreeTicket's public URLs.
- [ ] Privacy, terms and support pages are live.
- [ ] The five positive and three negative tests pass.
- [ ] Destructive actions require confirmation and unsupported requests do not invent tools.
- [ ] The submitted build is deployed and rollback is available.
- [ ] The release version and changelog are aligned across plugin manifests.

Approval record:

```text
Submitted by:
OpenAI organization:
Plugin version:
MCP deployment revision:
Submission draft URL:
Submitted at:
Review status:
Reviewer notes:
```
