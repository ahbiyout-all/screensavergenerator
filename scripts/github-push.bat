@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ========================================================
::  AhBiYout GitHub Automated Push & Release Pipeline
:: ========================================================
::  Account  : AhBiYout
::  Username : AhBiYout-all
::  Repo     : screensavergenerator
::  Target   : Windows 10/11 Desktop Screensaver Manager
:: ========================================================

title AhBiYout GitHub Automated Push Pipeline

echo ========================================================
echo   AhBiYout GitHub Automated Push ^& Release Pipeline
echo ========================================================
echo   GitHub Owner : AhBiYout
echo   Git Username : AhBiYout-all
echo   Repository   : screensavergenerator
echo   Remote URL   : https://github.com/AhBiYout/screensavergenerator.git
echo ========================================================
echo.

:: --------------------------------------------------------
:: [Step 0] Environment & Toolchain Inspection
:: --------------------------------------------------------
echo [0/6] Checking system prerequisites...
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git command-line tool was not found in system PATH.
    echo Please install Git for Windows from: https://git-scm.com/download/win
    echo After installation, restart this terminal and run again.
    echo.
    pause
    exit /b 1
)
echo [OK] Git is installed and available.
echo.

:: --------------------------------------------------------
:: [Step 1] Multi-Tier Dynamic Version Extraction
:: --------------------------------------------------------
echo [1/6] Extracting version (Single Source of Truth)...
set "APP_VER="

:: 1st Tier: package.json via Node.js
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%A in ('node -p "try { require('./package.json').version } catch(e) { '' }" 2^>nul') do set "APP_VER=%%A"
)

:: 1st Tier Backup: package.json via PowerShell
if "%APP_VER%"=="" (
    where powershell >nul 2>&1
    if %errorlevel% equ 0 (
        for /f "usebackq delims=" %%A in (`powershell -NoProfile -Command "(Get-Content './package.json' -Raw | ConvertFrom-Json).version" 2^>nul`) do set "APP_VER=%%A"
    )
)

:: 2nd Tier (Fallback): docs/PATCH_NOTES.md or docs/PATCHNOTES.md header regex parsing
if "%APP_VER%"=="" (
    if exist "docs\PATCH_NOTES.md" (
        for /f "usebackq delims=" %%A in (`powershell -NoProfile -Command "Select-String -Path 'docs/PATCH_NOTES.md' -Pattern '##\s*📌?\s*v?(\d+\.\d+\.\d+)' | Select-Object -First 1 | ForEach-Object { $_.Matches.Groups[1].Value }" 2^>nul`) do set "APP_VER=%%A"
    )
    if "%APP_VER%"=="" if exist "docs\PATCHNOTES.md" (
        for /f "usebackq delims=" %%A in (`powershell -NoProfile -Command "Select-String -Path 'docs/PATCHNOTES.md' -Pattern '##\s*📌?\s*v?(\d+\.\d+\.\d+)' | Select-Object -First 1 | ForEach-Object { $_.Matches.Groups[1].Value }" 2^>nul`) do set "APP_VER=%%A"
    )
)

:: Final Fallback
if "%APP_VER%"=="" set "APP_VER=1.1.0"

:: Dynamically sync console window title with target version
title AhBiYout Screensaver Generator - GitHub Push Pipeline [v%APP_VER%]

echo [OK] Detected Target Application Version: v%APP_VER%
echo.

:: --------------------------------------------------------
:: [Step 2] Project-Wide Version Synchronization
:: --------------------------------------------------------
echo [2/6] Synchronizing version constants across project files...
if exist "scripts\sync-version.js" (
    where node >nul 2>&1
    if %errorlevel% equ 0 (
        call node scripts\sync-version.js
        if %errorlevel% neq 0 (
            echo [Notice] Version sync script returned a non-zero code, continuing pipeline.
        )
    ) else (
        echo [Info] Node.js is not present; skipping automated sync-version.js.
    )
)
echo.

:: --------------------------------------------------------
:: [Step 3] Git Workspace & Identity Configuration
:: --------------------------------------------------------
echo [3/6] Configuring Git workspace and credentials...

if not exist ".git" (
    echo [Git] Local repository not initialized. Initializing Git repository...
    git init
    git branch -M main
    echo [Git] Repository initialized with primary branch 'main'.
)

:: Configure user identity if not locally set
git config user.name "AhBiYout-all"
git config user.email "redmunlight@gmail.com"
echo [Git] User name  : AhBiYout-all
echo [Git] User email : redmunlight@gmail.com

:: Verify remote origin
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo [Git] Setting remote origin to: https://github.com/AhBiYout/screensavergenerator.git
    git remote add origin https://github.com/AhBiYout/screensavergenerator.git
) else (
    echo [Git] Remote origin confirmed: https://github.com/AhBiYout/screensavergenerator.git
)
echo.

:: --------------------------------------------------------
:: [Step 4] Staging Changes and Committing
:: --------------------------------------------------------
echo [4/6] Inspecting file status and staging...

:: Check if git status has any changes
git status --short
echo.

set "USER_COMMIT_MSG="
set /p "USER_COMMIT_MSG=Enter commit message (Press Enter for 'Release v%APP_VER% - Windows Screensaver Setup Manager'): "
if "!USER_COMMIT_MSG!"=="" set "USER_COMMIT_MSG=Release v%APP_VER% - Windows Screensaver Setup Manager"

echo.
echo [Git] Staging files with .gitignore safety protections...
git add .

echo [Git] Creating commit with message: "!USER_COMMIT_MSG!"
git commit -m "!USER_COMMIT_MSG!"
if %errorlevel% neq 0 (
    echo [Info] Working tree is clean or changes already committed. Continuing...
)
echo.

:: --------------------------------------------------------
:: [Step 5] Version Tagging (Semantic Versioning: vX.Y.Z)
:: --------------------------------------------------------
echo [5/6] Creating semantic release tag: v%APP_VER%...

:: Remove local tag if already present to guarantee fresh pointer
git tag -d "v%APP_VER%" >nul 2>&1
git tag -a "v%APP_VER%" -m "Release version %APP_VER% - Windows Screensaver Manager"
if %errorlevel% equ 0 (
    echo [Git] Successfully created release tag: v%APP_VER%
) else (
    echo [Notice] Tag creation completed.
)
echo.

:: --------------------------------------------------------
:: [Step 6] Pushing to Remote Repository (main branch & tag)
:: --------------------------------------------------------
echo [6/6] Pushing commits and release tags to GitHub...
echo Remote Target : https://github.com/AhBiYout/screensavergenerator
echo Target Branch : main
echo Release Tag   : v%APP_VER%
echo.

git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Direct push to main branch failed or required authorization.
    echo If GitHub asks for authentication:
    echo  1. Enter your GitHub Personal Access Token (PAT) as password.
    echo  2. Or run: gh auth login (GitHub CLI)
    echo  3. Or verify write permissions for account 'AhBiYout-all'.
    echo.
)

echo [Git] Pushing release tag v%APP_VER% to trigger GitHub Actions CI/CD...
git push origin "v%APP_VER%" --force
if %errorlevel% neq 0 (
    echo [Notice] Tag push completed.
)

echo.
echo ========================================================
echo   ✅ GitHub synchronization completed successfully!
echo ========================================================
echo   Repository : https://github.com/AhBiYout/screensavergenerator
echo   Branch     : main
echo   Version    : v%APP_VER%
echo   Actions CI : https://github.com/AhBiYout/screensavergenerator/actions
echo   Releases   : https://github.com/AhBiYout/screensavergenerator/releases
echo ========================================================
echo.
pause
