import fs from 'fs';
import path from 'path';

const batFiles = [
  path.join(process.cwd(), 'build.bat'),
  path.join(process.cwd(), 'push.bat'),
  path.join(process.cwd(), 'github-push.bat'),
  path.join(process.cwd(), 'scripts', 'github-push.bat'),
  path.join(process.cwd(), 'native', 'ScreensaverCore', 'build_dll.bat'),
];

for (const batPath of batFiles) {
  if (fs.existsSync(batPath)) {
    let content = fs.readFileSync(batPath, 'utf8');
    content = content.replace(/\r?\n/g, '\r\n');
    fs.writeFileSync(batPath, content, 'utf8');
    console.log(`[CRLF Conversion] Converted ${path.basename(batPath)} to Windows CRLF line endings.`);
  }
}

