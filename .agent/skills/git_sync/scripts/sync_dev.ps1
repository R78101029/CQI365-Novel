$ErrorActionPreference = "Stop"

Write-Host "Starting Git Sync: Remote Main -> Local Dev" -ForegroundColor Cyan

# Check for uncommitted changes
if ($(git status --porcelain) -ne $null) {
    Write-Host "Error: You have uncommitted changes. Please commit or stash them before syncing." -ForegroundColor Red
    exit 1
}

# 1. Switch to main and pull
Write-Host "1. Updating main branch..." -ForegroundColor Yellow
git checkout main
if ($LASTEXITCODE -ne 0) { exit 1 }
git pull origin main
if ($LASTEXITCODE -ne 0) { exit 1 }

# 2. Switch to dev and merge
Write-Host "2. Merging updates into dev branch..." -ForegroundColor Yellow
git checkout dev
if ($LASTEXITCODE -ne 0) { exit 1 }
git merge main
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Sync Completed Successfully!" -ForegroundColor Green
