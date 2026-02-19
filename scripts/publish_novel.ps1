param(
    [string]$NovelName = "2040Iris",
    [switch]$SkipImages = $false,
    [switch]$UsePlaceholders = $false
)

Write-Host "🚀 Starting Publish Process for '$NovelName'..." -ForegroundColor Cyan

# 0. Apply Titles & Metadata
Write-Host "`n📝 Step 0: Applying Titles & Order..." -ForegroundColor Yellow
node scripts/apply-titles.js $NovelName

# 1. Insert Images
if ($UsePlaceholders) {
    Write-Host "`n🎨 Step 1b: Generating & Inserting Placeholder Images..." -ForegroundColor Yellow
    node scripts/auto-insert-images.js $NovelName --placeholder
}
elseif (-not $SkipImages) {
    Write-Host "`n📸 Step 1: Auto-inserting images..." -ForegroundColor Yellow
    node scripts/auto-insert-images.js $NovelName
}
else {
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
        }
        else {
            Write-Host "`n❌ Build Failed!" -ForegroundColor Red
            exit 1
        }
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Host "`n❌ Error: 'site' directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✨ Done! Ready to commit and push." -ForegroundColor Cyan
