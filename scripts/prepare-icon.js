import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const targetPngPath = path.join(rootDir, 'Windows Screensaver Setup Generator.png');
const fallbackImgPath = path.join(rootDir, 'src/assets/images/screensaver_setup_icon_1784701340842.jpg');

console.log('[Icon Preparation] Checking Windows Screensaver Setup Generator.png...');

// 1. Ensure Windows Screensaver Setup Generator.png exists and is not empty
let needsCopy = false;
if (!fs.existsSync(targetPngPath)) {
  needsCopy = true;
} else {
  const stats = fs.statSync(targetPngPath);
  if (stats.size === 0) {
    needsCopy = true;
  }
}

if (needsCopy && fs.existsSync(fallbackImgPath)) {
  console.log('[Icon Preparation] Copying fallback image to Windows Screensaver Setup Generator.png...');
  fs.copyFileSync(fallbackImgPath, targetPngPath);
}

// 2. Generate icons using Tauri CLI if PNG exists and has size
if (fs.existsSync(targetPngPath) && fs.statSync(targetPngPath).size > 0) {
  try {
    console.log('[Icon Preparation] Generating icon files with Tauri CLI...');
    execSync(`npx tauri icon "${targetPngPath}"`, { stdio: 'inherit' });

    // Also sync generated icon.ico to root icon.ico if created in src-tauri/icons/icon.ico
    const tauriIco = path.join(rootDir, 'src-tauri/icons/icon.ico');
    const rootIco = path.join(rootDir, 'icon.ico');
    if (fs.existsSync(tauriIco)) {
      fs.copyFileSync(tauriIco, rootIco);
      console.log('[Icon Preparation] Synced icon.ico to root directory.');
    }
  } catch (err) {
    console.warn('[Icon Preparation] Notice: Tauri icon generation warning or skip:', err.message);
  }
} else {
  console.log('[Icon Preparation] No valid Windows Screensaver Setup Generator.png found, skipping icon generation.');
}
