param(
    [string]$NovelName = "2040Iris",
    [switch]$SkipImages = $false
)

Write-Host "🚀 Starting Publish Process for '$NovelName'..." -ForegroundColor Cyan

# Ensure we are in the root directory
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootPath = Split-Path -Parent $ScriptPath
# Assuming this script is in /scripts/, root is one level up. 
# But if run from root, we need to be careful.
# Let's trust the CWD is usually the root in this workflow.

# 1. Insert Images
if (-not $SkipImages) {
    Write-Host "`n📸 Step 1: Auto-inserting images..." -ForegroundColor Yellow
    node scripts/auto-insert-images.js $NovelName
} else {
    Write-Host "`n⏭️ Step 1: Skipping image insertion (Text-Only Mode)." -ForegroundColor Gray
}

# 2. Sync Content
Write-Host "`n🔄 Step 2: Syncing chapters and assets..." -ForegroundColor Yellow
node scripts/sync-chapters.js $NovelName

# 3. Build Site
Write-Host "`n🏗️ Step 3: Building Astro site..." -ForegroundColor Yellow
if (Test-Path "site") {
    Push-Location site
    try {
        npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Build Successful!" -ForegroundColor Green
        } else {
            Write-Host "`n❌ Build Failed!" -ForegroundColor Red
            exit 1
        }
    } finally {
        Pop-Location
    }
} else {
    Write-Host "`n❌ Error: 'site' directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✨ Done! Ready to commit and push." -ForegroundColor Cyan
