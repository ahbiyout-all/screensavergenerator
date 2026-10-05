import fs from 'fs';
import path from 'path';

const port = process.argv[2] || process.env.TARGET_PORT || '3036';
const filePath = path.join(process.cwd(), 'src-tauri', 'tauri.conf.json');

if (fs.existsSync(filePath)) {
  try {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (json.build) {
      json.build.devUrl = `http://localhost:${port}`;
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
      console.log(`[Port Config] Updated tauri.conf.json devUrl port to ${port}`);
    }
  } catch (err) {
    console.error('[Port Config] Failed to update tauri.conf.json:', err.message);
  }
}

// Ensure build.bat uses Windows CRLF line endings
const batPath = path.join(process.cwd(), 'build.bat');
if (fs.existsSync(batPath)) {
  try {
    let content = fs.readFileSync(batPath, 'utf8');
    if (!content.includes('\r\n')) {
      content = content.replace(/\r?\n/g, '\r\n');
      fs.writeFileSync(batPath, content, 'utf8');
      console.log('[Port Config] Fixed CRLF line endings in build.bat');
    }
  } catch (err) {
    console.error('[Port Config] Failed to format build.bat CRLF:', err.message);
  }
}
