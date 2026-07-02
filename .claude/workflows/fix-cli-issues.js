export const meta = {
  name: 'fix-cli-issues',
  description: 'Triage open freeticket-cli issues against the OpenAPI contract, fix the client-fixable ones in a single branch, open one PR, and log contract-blocked gaps to CONTRACT-GAPS.md',
  whenToUse: 'When freeticket-cli has accumulated open issues and you want them resolved together in one PR without violating the golden rule (client never invents the contract).',
  phases: [
    { title: 'Triage', detail: 'classify each open issue: client-fixable vs contract-blocked' },
    { title: 'Verify', detail: 'adversarially confirm each client-fixable issue needs no new endpoint' },
    { title: 'Implement', detail: 'one agent applies all client fixes on a single branch, build + lint' },
    { title: 'Ledger + PR', detail: 'log contract gaps, open one PR closing the fixed issues' },
  ],
}

// Reusable across the umbrella. args overrides let it target another client repo.
const REPO = (args && args.repo) || 'AppFreeticket/freeticket-cli'
const DIR = (args && args.dir) || 'cli' // submodule path, relative to umbrella root
const CONTRACTS = 'cli/openapi.json (B2B v1) and cli/admin-openapi.json (superadmin)'

const CLASSIFY = {
  type: 'object',
  additionalProperties: false,
  required: ['number', 'title', 'verdict', 'reason'],
  properties: {
    number: { type: 'integer' },
    title: { type: 'string' },
    verdict: { enum: ['client-fixable', 'contract-blocked'] },
    reason: { type: 'string', description: 'One line, cite the contract field/endpoint that does or does not exist.' },
    files: { type: 'array', items: { type: 'string' }, description: 'CLI source files a fix would touch (empty if contract-blocked).' },
    missingEndpoints: { type: 'array', items: { type: 'string' }, description: 'Endpoints/fields the contract must add (empty if client-fixable).' },
  },
}

const VERDICT = {
  type: 'object',
  additionalProperties: false,
  required: ['number', 'stillClientFixable', 'reason'],
  properties: {
    number: { type: 'integer' },
    stillClientFixable: { type: 'boolean' },
    reason: { type: 'string' },
    missingEndpoints: { type: 'array', items: { type: 'string' } },
  },
}

// ── Phase 1: triage every open issue ──────────────────────────────────────
phase('Triage')
const triage = await agent(
  `List every OPEN issue in ${REPO}: run \`gh issue list --repo ${REPO} --state open --limit 100 --json number,title,body\`.
For EACH issue, classify it against the committed contract files ${CONTRACTS} (read them under ${DIR}/).
- 'client-fixable' = fixable purely in the CLI client: column/output/formatting bugs, flags that wrap query params the contract ALREADY exposes, autopagination over an existing cursor, docs/README drift, local config/workspace persistence.
- 'contract-blocked' = the fix needs an endpoint, query param, or response field the contract does NOT expose yet. GOLDEN RULE: the client never invents the contract.
Return one classification object per open issue.`,
  { phase: 'Triage', label: 'triage:issues', schema: { type: 'object', required: ['issues'], properties: { issues: { type: 'array', items: CLASSIFY } } } },
)

const issues = (triage && triage.issues) || []
log(`${issues.length} open issues: ${issues.filter(i => i.verdict === 'client-fixable').length} client-fixable, ${issues.filter(i => i.verdict === 'contract-blocked').length} contract-blocked (pre-verify)`)

// ── Phase 2: adversarially verify each "client-fixable" needs no new endpoint ──
phase('Verify')
const claimed = issues.filter(i => i.verdict === 'client-fixable')
const verdicts = await parallel(claimed.map(i => () =>
  agent(
    `Issue #${i.number} "${i.title}" of ${REPO} was classified CLIENT-FIXABLE, meaning it can be fixed without any contract change. Reason given: "${i.reason}".
Try to REFUTE that. Read the contract files ${CONTRACTS} under ${DIR}/ and the issue body (\`gh issue view ${i.number} --repo ${REPO}\`). If the fix actually requires an endpoint, query param, or response field the contract does not already expose, set stillClientFixable=false and list what is missing. Default to true only if the contract genuinely already has everything the fix needs.`,
    { phase: 'Verify', label: `verify:#${i.number}`, schema: VERDICT },
  )))

const verified = verdicts.filter(Boolean)
// Demote any that failed adversarial verification.
const demoted = verified.filter(v => !v.stillClientFixable)
for (const d of demoted) {
  const it = issues.find(i => i.number === d.number)
  if (it) { it.verdict = 'contract-blocked'; it.reason = d.reason; it.missingEndpoints = d.missingEndpoints || it.missingEndpoints }
}

const fixable = issues.filter(i => i.verdict === 'client-fixable')
const blocked = issues.filter(i => i.verdict === 'contract-blocked')
log(`After verify: ${fixable.length} client-fixable (#${fixable.map(i => i.number).join(' #')}), ${blocked.length} contract-blocked (#${blocked.map(i => i.number).join(' #')})`)

if (fixable.length === 0) {
  return { fixable: [], blocked, note: 'Nothing client-fixable; only contract gaps remain. Route them via endpoint-requester.' }
}

// ── Phase 3: one agent implements all client fixes on a single branch ──────
// Single implementer (not fan-out): the fixes overlap files (resource.ts, output.ts,
// index.ts) — one coherent branch beats parallel worktrees fighting a merge.
phase('Implement')
const fixList = fixable.map(i => `#${i.number} ${i.title} — ${i.reason}${i.files && i.files.length ? ` [${i.files.join(', ')}]` : ''}`).join('\n')
const impl = await agent(
  `Work inside ${DIR}/ (the freeticket-cli submodule). Create a branch \`fix/cli-issues-batch\` off the default branch.
Implement ALL of these client-fixable issues in that ONE branch:
${fixList}

Rules:
- The client consumes the generated SDK; never hand-edit files under src/client/ or src/admin-client/, and never invent an endpoint or query param. If while implementing you find an issue actually needs the contract, STOP that one and report it in skipped[] with why.
- Match surrounding code style. Keep the diff minimal and coherent.
- Update README.md and any --help text when behaviour or output changes.
- Run the build and lint (\`pnpm build\` / \`pnpm lint\`, or whatever package.json defines). Fix what you break.
Return the branch name, a per-issue summary of what changed, the list of changed files, whether build+lint passed, and any issues you had to skip.`,
  {
    phase: 'Implement', label: 'implement:batch', isolation: 'worktree', effort: 'high',
    schema: {
      type: 'object', additionalProperties: false,
      required: ['branch', 'changed', 'buildPassed'],
      properties: {
        branch: { type: 'string' },
        changed: { type: 'array', items: { type: 'string' } },
        perIssue: { type: 'array', items: { type: 'object', properties: { number: { type: 'integer' }, summary: { type: 'string' } } } },
        buildPassed: { type: 'boolean' },
        lintPassed: { type: 'boolean' },
        skipped: { type: 'array', items: { type: 'object', properties: { number: { type: 'integer' }, reason: { type: 'string' } } } },
      },
    },
  },
)

if (!impl) return { error: 'implementer produced no result', fixable, blocked }

// Fixes the implementer bailed on become contract-blocked too.
const skippedNums = new Set((impl.skipped || []).map(s => s.number))
const actuallyFixed = fixable.filter(i => !skippedNums.has(i.number))
const finalBlocked = blocked.concat(fixable.filter(i => skippedNums.has(i.number)))

// ── Phase 4: log contract gaps + open ONE PR ──────────────────────────────
phase('Ledger + PR')
const gapRows = finalBlocked.map(i => `- #${i.number} "${i.title}" — missing: ${(i.missingEndpoints || []).join(', ') || 'see issue'} — ${i.reason}`).join('\n')
const closes = actuallyFixed.map(i => `Closes #${i.number}`).join('\n')
const perIssueBody = (impl.perIssue || []).map(p => `- #${p.number}: ${p.summary}`).join('\n')

const pr = await agent(
  `Two tasks, in order:

1. LEDGER (umbrella repo, not the submodule): edit CONTRACT-GAPS.md at the umbrella root. For each contract-blocked issue below that is NOT already a row, add a row above the endpoint-requester marker line, ordered by priority, using the existing table columns. Do not duplicate rows that already cover the same endpoint. Contract-blocked issues:
${gapRows || '(none)'}

2. PR (submodule ${DIR}/, remote ${REPO}): the branch \`${impl.branch}\` holds the client fixes. Commit anything uncommitted, push the branch, and open ONE pull request against ${REPO} with \`gh pr create\`. PR title: "fix: batch CLI issue fixes". PR body must include:
   - a "Fixed" section with the per-issue summary:
${perIssueBody || '(see commits)'}
   - the closing keywords so merging closes them:
${closes}
   - a "Contract-blocked (not in this PR)" section listing ${finalBlocked.map(i => '#' + i.number).join(', ') || 'none'} and noting they are tracked in CONTRACT-GAPS.md / need endpoint-requester.
   - build passed: ${impl.buildPassed}, lint passed: ${impl.lintPassed}.
   End the PR body with the Claude Code attribution line.
Return the PR url.`,
  { phase: 'Ledger + PR', label: 'ledger+pr', effort: 'high', schema: { type: 'object', required: ['prUrl'], properties: { prUrl: { type: 'string' }, ledgerUpdated: { type: 'boolean' } } } },
)

return {
  fixed: actuallyFixed.map(i => i.number),
  contractBlocked: finalBlocked.map(i => i.number),
  branch: impl.branch,
  buildPassed: impl.buildPassed,
  lintPassed: impl.lintPassed,
  pr: pr && pr.prUrl,
}
