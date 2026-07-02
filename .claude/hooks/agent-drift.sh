#!/bin/bash
# SessionStart hook: si el contrato o el ledger cambiaron desde la última
# auditoría de agentes, inyecta una orden de refrescar .claude/agents/*.md.
# ponytail: hash plano de 3 archivos; si hiciera falta granularidad por agente,
# pasar a un stamp por archivo.
cd "$(dirname "$0")/../.." || exit 0
stamp=".claude/.agent-drift-stamp"
cur=$(cat cli/openapi.json cli/admin-openapi.json CONTRACT-GAPS.md 2>/dev/null | shasum -a 256 | cut -d' ' -f1)
[ -z "$cur" ] && exit 0
[ "$cur" = "$(cat "$stamp" 2>/dev/null)" ] && exit 0
echo "$cur" > "$stamp"
cat <<'EOF'
El contrato OpenAPI (cli/openapi.json, cli/admin-openapi.json) o CONTRACT-GAPS.md
cambiaron desde la última auditoría de agentes. Antes de seguir con otra tarea:
revisa .claude/agents/*.md (ai-architect, contract-sync, endpoint-requester,
oss-maintainer) y corrige afirmaciones que quedaron viejas — cobertura de
endpoints ("hoy sin cobertura", "pendiente"), estados del ledger, procedimientos
que referencien paths/comandos que ya cambiaron. Aplica los fixes directamente
en los .md y menciona al usuario qué actualizaste.
EOF
