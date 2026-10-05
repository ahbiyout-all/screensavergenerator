import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Read Single Source of Truth from package.json
const pkgPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const currentVersion = pkg.version;

console.log(`[Version Sync] 🔍 Single Source of Truth Version: v${currentVersion}`);

let changedCount = 0;

// 2. Sync src/version.ts
const versionTsPath = path.join(rootDir, 'src', 'version.ts');
if (fs.existsSync(versionTsPath)) {
  let content = fs.readFileSync(versionTsPath, 'utf8');
  const updated = content.replace(/export const APP_VERSION = '.*?';/, `export const APP_VERSION = '${currentVersion}';`);
  if (content !== updated) {
    fs.writeFileSync(versionTsPath, updated, 'utf8');
    console.log(`[Version Sync] ✅ Updated src/version.ts -> v${currentVersion}`);
    changedCount++;
  } else {
    console.log(`[Version Sync] ⚡ src/version.ts already up-to-date`);
  }
}

// 3. Sync src-tauri/tauri.conf.json
const tauriConfPath = path.join(rootDir, 'src-tauri', 'tauri.conf.json');
if (fs.existsSync(tauriConfPath)) {
  try {
    const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
    if (tauriConf.version !== currentVersion) {
      tauriConf.version = currentVersion;
      fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n', 'utf8');
      console.log(`[Version Sync] ✅ Updated src-tauri/tauri.conf.json -> v${currentVersion}`);
      changedCount++;
    } else {
      console.log(`[Version Sync] ⚡ src-tauri/tauri.conf.json already up-to-date`);
    }
  } catch (err) {
    console.error(`[Version Sync] ❌ Failed to update tauri.conf.json:`, err);
  }
}

// 4. Sync src-tauri/Cargo.toml
const cargoTomlPath = path.join(rootDir, 'src-tauri', 'Cargo.toml');
if (fs.existsSync(cargoTomlPath)) {
  let cargoContent = fs.readFileSync(cargoTomlPath, 'utf8');
  const updatedCargo = cargoContent.replace(/version = ".*?"/, `version = "${currentVersion}"`);
  if (cargoContent !== updatedCargo) {
    fs.writeFileSync(cargoTomlPath, updatedCargo, 'utf8');
    console.log(`[Version Sync] ✅ Updated src-tauri/Cargo.toml -> v${currentVersion}`);
    changedCount++;
  } else {
    console.log(`[Version Sync] ⚡ src-tauri/Cargo.toml already up-to-date`);
  }
}

// 5. Check docs/PATCH_NOTES.md
const patchNotesPath = path.join(rootDir, 'docs', 'PATCH_NOTES.md');
if (fs.existsSync(patchNotesPath)) {
  const patchNotes = fs.readFileSync(patchNotesPath, 'utf8');
  if (!patchNotes.includes(`v${currentVersion}`) && !patchNotes.includes(`${currentVersion}`)) {
    console.warn(`[Version Sync] ⚠️ Notice: docs/PATCH_NOTES.md does not yet mention v${currentVersion}. Please add notes before release!`);
  } else {
    console.log(`[Version Sync] ✅ docs/PATCH_NOTES.md contains entry for v${currentVersion}`);
  }
}

console.log(`[Version Sync] 🚀 Synchronization complete! Total updated files: ${changedCount}`);
