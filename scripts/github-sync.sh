#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  AhBiYout GitHub Automated Push & Release Pipeline     "
echo "========================================================"
echo "  Account  : AhBiYout"
echo "  Username : AhBiYout-all"
echo "  Repo     : screensavergenerator"
echo "========================================================"

APP_VERSION=$(node -p "try { require('./package.json').version } catch(e) { '1.0.9' }")
echo "[1/5] Detected Version: v${APP_VERSION}"

echo "[2/5] Synchronizing version constants..."
node scripts/sync-version.js || true

echo "[3/5] Configuring Git..."
if [ ! -d ".git" ]; then
    git init
    git branch -M main
fi

git config user.name "AhBiYout-all"
git config user.email "redmunlight@gmail.com"

if ! git remote get-url origin > /dev/null 2>&1; then
    git remote add origin https://github.com/AhBiYout/screensavergenerator.git
fi

echo "[4/5] Staging and Committing..."
git add .
COMMIT_MSG="${1:-Release v${APP_VERSION} - Windows Screensaver Setup Manager}"
git commit -m "$COMMIT_MSG" || echo "No changes to commit."

echo "[5/5] Tagging and Pushing..."
git tag -fa "v${APP_VERSION}" -m "Release version ${APP_VERSION}"
git push -u origin main || true
git push origin "v${APP_VERSION}"

echo "✅ GitHub sync complete for v${APP_VERSION}!"
