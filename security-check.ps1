# Secret scan + JS security patterns before push. Local only (repo has no CI).
#   .\security-check.ps1
# Static demo (no backend, no package.json): only gitleaks + semgrep apply.
# Skipped: Biome/Knip (no npm toolchain/bundler), dependency-cruiser, Trivy, Schemathesis, Playwright E2E (no backend/container/OpenAPI).
# Baseline: gitleaks clean (2026-09-21); semgrep 1 accepted finding, detect-non-literal-regexp at assets/js/router.js:12 (dev-defined route patterns).
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== gitleaks (secret scan) ===" -ForegroundColor Cyan
& gitleaks detect --source $root -v --redact
if ($LASTEXITCODE -ne 0) { Write-Host "gitleaks: findings, see log above" -ForegroundColor Red }
else { Write-Host "gitleaks: PASS" -ForegroundColor Green }

Write-Host ""
Write-Host "=== semgrep (JS security patterns: assets, scripts) ===" -ForegroundColor Cyan
& semgrep --config auto (Join-Path $root 'assets') (Join-Path $root 'scripts')
if ($LASTEXITCODE -ne 0) { Write-Host "semgrep: findings, see log above (known baseline: assets/js/router.js:12, see AGENTS.md)" -ForegroundColor Yellow }
else { Write-Host "semgrep: PASS" -ForegroundColor Green }
