<#
PowerShell helper to stage specific files modified by the assistant and create a single commit.

Run this from the repository root in PowerShell:

# Preview changes
.\scripts\commit-changes.ps1 -WhatIf

# Then run to actually commit
.\scripts\commit-changes.ps1

# This script only stages files that were edited/added during the assistant session.
# It does not push to any remote. Review the staged changes before running.
# If you want to include more files, edit the $files array.
#>

param(
    [switch]$WhatIf
)

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $repoRoot

$files = @( 
    '.env.local.example',
    'README.md',
    'app/page.tsx',
    'app/tutor/dashboard/page.tsx',
    'app/service/[id]/page.tsx',
    'app/orders/[orderId]/review/page.tsx',
    'app/orders/[orderId]/page.tsx',
    'app/dashboard/page.tsx',
    'app/checkout/[serviceId]/page.tsx'
)

Write-Host "Staging files:" -ForegroundColor Cyan
$files | ForEach-Object { Write-Host " - $_" }

if ($WhatIf) {
    Write-Host "WhatIf: showing git status and diff for the listed files" -ForegroundColor Yellow
    git status --porcelain --untracked-files=all
    foreach ($f in $files) { Write-Host "\n--- diff: $f ---"; git --no-pager diff -- $f }
    return
}

git add -- $files

$message = 'chore: add env example, README instructions; tighten user typing across pages'

Write-Host "Creating commit: $message" -ForegroundColor Green
git commit -m $message

if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit failed. Inspect git status." -ForegroundColor Red
    git status
} else {
    Write-Host "Commit created locally." -ForegroundColor Green
}
