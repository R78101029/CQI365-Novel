$ErrorActionPreference = "Stop"

Write-Host "Starting Git Sync: Remote Main -> Local Dev" -ForegroundColor Cyan

# Check for uncommitted changes
if ($(git status --porcelain) -ne $null) {
    Write-Host "Error: You have uncommitted changes. Please commit or stash them before syncing." -ForegroundColor Red
    exit 1
}

# 1. Fetch latest main from remote
Write-Host "1. Fetching origin/main..." -ForegroundColor Yellow
git fetch origin main
if ($LASTEXITCODE -ne 0) { exit 1 }

# 2. Merge origin/main into current branch (dev)
Write-Host "2. Merging origin/main into dev branch..." -ForegroundColor Yellow
git merge origin/main
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Sync Completed Successfully!" -ForegroundColor Green
