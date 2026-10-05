import fs from 'fs';
import path from 'path';

let pkgVersion = '1.0.9';
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  if (pkg.version) pkgVersion = pkg.version;
} catch (e) {}

const version = process.argv[2] || pkgVersion;
const releaseDir = path.join(process.cwd(), 'release');
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

const targetDir = path.join(process.cwd(), 'src-tauri', 'target', 'release');

let sourceExe = null;

const candidates = [
  '화면보호기설정.exe',
  'AhBiYout Screensaver Setup.exe',
  'cisnet Screensaver Setup.exe',
  'app.exe'
];

for (const cand of candidates) {
  const p = path.join(targetDir, cand);
  if (fs.existsSync(p)) {
    sourceExe = p;
    break;
  }
}

if (!sourceExe && fs.existsSync(targetDir)) {
  try {
    const files = fs.readdirSync(targetDir);
    const exe = files.find(f => f.endsWith('.exe') && !f.includes('build') && !f.includes('deps'));
    if (exe) {
      sourceExe = path.join(targetDir, exe);
    }
  } catch (err) {
    console.error('[Release Artifacts] Error scanning directory:', err.message);
  }
}

if (sourceExe) {
  const koreanName = `화면보호기설정_v${version}.exe`;
  const koreanPlain = `화면보호기설정.exe`;
  const englishName = `ScreensaverSetup_v${version}.exe`;
  const englishPlain = `ScreensaverSetup.exe`;

  fs.copyFileSync(sourceExe, path.join(releaseDir, koreanName));
  fs.copyFileSync(sourceExe, path.join(releaseDir, koreanPlain));
  fs.copyFileSync(sourceExe, path.join(releaseDir, englishName));
  fs.copyFileSync(sourceExe, path.join(releaseDir, englishPlain));

  console.log(`\n===================================================`);
  console.log(`BUILD SUCCESSFUL!`);
  console.log(`Executable created in release/ directory:`);
  console.log(`  1. release/${koreanName}`);
  console.log(`  2. release/${koreanPlain}`);
  console.log(`  3. release/${englishName}`);
  console.log(`  4. release/${englishPlain}`);
  console.log(`===================================================\n`);
} else {
  console.error(`\n[Release Error] Could not find compiled executable in ${targetDir}\n`);
  process.exit(1);
}
