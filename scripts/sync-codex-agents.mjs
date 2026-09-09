#!/usr/bin/env node
// Generates .codex/agents/*.toml from .claude/agents/*.md.
// The .md files are the source; the .toml mirror exists only so Codex can read
// the same agents. Hand-editing the mirror is how the two drifted apart before.
// ponytail: mechanical transform, no TOML library — the shape is fixed.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const SRC = '.claude/agents'
const OUT = '.codex/agents'

mkdirSync(OUT, { recursive: true })

for (const file of readdirSync(SRC).filter((f) => f.endsWith('.md') && f !== 'README.md')) {
  const raw = readFileSync(join(SRC, file), 'utf8')
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw)
  if (!match) throw new Error(`${file}: no YAML frontmatter`)
  const [, frontmatter, body] = match

  // Frontmatter is flat `key: value`, with values that may wrap onto indented lines.
  const fields = {}
  let key = null
  for (const line of frontmatter.split('\n')) {
    const start = /^([a-z_]+):\s*(.*)$/.exec(line)
    if (start) {
      key = start[1]
      fields[key] = start[2]
    } else if (key && line.trim()) {
      fields[key] += ' ' + line.trim()
    }
  }

  const instructions = body.trim()
  if (instructions.includes("'''")) throw new Error(`${file}: body contains ''' — breaks the TOML literal`)
  const quote = (v) => JSON.stringify(v)

  const toml =
    `# Generated from ${SRC}/${file} by scripts/sync-codex-agents.mjs — do not edit.\n` +
    `name = ${quote(fields.name)}\n` +
    `description = ${quote(fields.description)}\n` +
    `developer_instructions = '''\n${instructions}\n'''\n` +
    (fields.tools ? `tools = ${JSON.stringify(fields.tools.split(',').map((t) => t.trim()))}\n` : '')

  writeFileSync(join(OUT, file.replace(/\.md$/, '.toml')), toml)
  console.log(`${OUT}/${file.replace(/\.md$/, '.toml')}`)
}
