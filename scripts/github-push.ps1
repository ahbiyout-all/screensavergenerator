# ========================================================
#   AhBiYout GitHub Automated Push & Release Pipeline
# ========================================================
#   Account  : AhBiYout
#   Username : AhBiYout-all
#   Repo     : screensavergenerator
# ========================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "AhBiYout GitHub Automated Push Pipeline"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  AhBiYout GitHub Automated Push & Release Pipeline     " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Account  : AhBiYout" -ForegroundColor Gray
Write-Host "  Username : AhBiYout-all" -ForegroundColor Gray
Write-Host "  Repo     : screensavergenerator" -ForegroundColor Gray
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 0. Check Git installation
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Git was not found in system PATH." -ForegroundColor Red
    Write-Host "Please install Git for Windows: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# 1. Multi-tier Dynamic Version Extraction (Single Source of Truth)
$appVersion = $null

# Tier 1: package.json
if (Test-Path "./package.json") {
    try {
        $pkg = Get-Content "./package.json" -Raw | ConvertFrom-Json
        $appVersion = $pkg.version
    } catch {}
}

# Tier 2: Fallback to docs/PATCH_NOTES.md or docs/PATCHNOTES.md
if ([string]::IsNullOrWhiteSpace($appVersion)) {
    $patchFile = if (Test-Path "docs/PATCH_NOTES.md") { "docs/PATCH_NOTES.md" } elseif (Test-Path "docs/PATCHNOTES.md") { "docs/PATCHNOTES.md" } else { $null }
    if ($patchFile) {
        $match = Select-String -Path $patchFile -Pattern '##\s*📌?\s*v?(\d+\.\d+\.\d+)' | Select-Object -First 1
        if ($match -and $match.Matches.Groups[1].Value) {
            $appVersion = $match.Matches.Groups[1].Value
        }
    }
}

if ([string]::IsNullOrWhiteSpace($appVersion)) {
    $appVersion = "1.1.0"
}

$Host.UI.RawUI.WindowTitle = "AhBiYout Screensaver Generator - GitHub Push Pipeline [v$appVersion]"
Write-Host "[1/6] Detected Target Version: v$appVersion" -ForegroundColor Green

# 2. Sync version constants
Write-Host "[2/6] Synchronizing version constants across project..." -ForegroundColor Gray
if (Get-Command node -ErrorAction SilentlyContinue) {
    if (Test-Path "scripts/sync-version.js") {
        node scripts/sync-version.js
    }
}

# 3. Configure Git
Write-Host "[3/6] Configuring Git workspace and credentials..." -ForegroundColor Gray
if (-not (Test-Path ".git")) {
    git init
    git branch -M main
}

git config user.name "AhBiYout-all"
git config user.email "redmunlight@gmail.com"

$remoteUrl = "https://github.com/AhBiYout/screensavergenerator.git"
$existingRemote = git remote get-url origin 2>$null
if (-not $existingRemote) {
    git remote add origin $remoteUrl
}

# 4. Commit
Write-Host "[4/6] Inspecting file status and staging..." -ForegroundColor Gray
git status --short

$defaultMsg = "Release v$appVersion - Windows Screensaver Setup Manager"
$userInput = Read-Host "Enter commit message (Press Enter for '$defaultMsg')"
$commitMsg = if ([string]::IsNullOrWhiteSpace($userInput)) { $defaultMsg } else { $userInput }

git add .
git commit -m "$commitMsg" 2>$null

# 5. Tagging
Write-Host "[5/6] Creating release tag: v$appVersion" -ForegroundColor Gray
git tag -d "v$appVersion" 2>$null
git tag -a "v$appVersion" -m "Release version $appVersion - Windows Screensaver Manager"

# 6. Push
Write-Host "[6/6] Pushing to GitHub (main branch and tag v$appVersion)..." -ForegroundColor Cyan
git push -u origin main
git push origin "v$appVersion" --force

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  ✅ GitHub synchronization completed successfully!" -ForegroundColor Green
Write-Host "  Repository : https://github.com/AhBiYout/screensavergenerator" -ForegroundColor White
Write-Host "  Release Tag: v$appVersion" -ForegroundColor White
Write-Host "  Actions CI : https://github.com/AhBiYout/screensavergenerator/actions" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
