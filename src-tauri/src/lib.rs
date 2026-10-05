use serde::Serialize;
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
use std::process::Command;

#[derive(Serialize)]
struct ScreensaverSettings {
    is_active: bool,
    screensaver: String,
    timeout_minutes: u32,
    is_secure: bool,
}

#[tauri::command]
fn get_current_settings() -> Result<ScreensaverSettings, String> {
    #[cfg(target_os = "windows")]
    {
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        let query_reg = |value: &str| -> Option<String> {
            let output = Command::new("reg")
                .args(["query", "HKCU\\Control Panel\\Desktop", "/v", value])
                .creation_flags(CREATE_NO_WINDOW)
                .output()
                .ok()?;
            
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines() {
                if line.contains(value) {
                    let parts: Vec<&str> = line.split_whitespace().collect();
                    if parts.len() >= 3 {
                        return Some(parts[2..].join(" "));
                    }
                }
            }
            None
        };

        let is_active = query_reg("ScreenSaveActive").unwrap_or_else(|| "0".to_string()) == "1";
        
        let screensaver_path = query_reg("SCRNSAVE.EXE").unwrap_or_else(|| "".to_string());
        let screensaver = if screensaver_path.is_empty() {
            "Mystify.scr".to_string()
        } else {
            std::path::Path::new(&screensaver_path)
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("Mystify.scr")
                .to_string()
        };

        let timeout_seconds: u32 = query_reg("ScreenSaveTimeOut")
            .unwrap_or_else(|| "600".to_string())
            .parse()
            .unwrap_or(600);
        let timeout_minutes = std::cmp::max(1, timeout_seconds / 60);

        let is_secure = query_reg("ScreenSaverIsSecure").unwrap_or_else(|| "0".to_string()) == "1";

        Ok(ScreensaverSettings {
            is_active,
            screensaver,
            timeout_minutes,
            is_secure,
        })
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(ScreensaverSettings {
            is_active: true,
            screensaver: "Mystify.scr".to_string(),
            timeout_minutes: 10,
            is_secure: false,
        })
    }
}

#[tauri::command]
fn apply_settings(script: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        use std::env;
        use std::fs;

        let mut temp_path = env::temp_dir();
        temp_path.push("apply_screensaver.bat");

        // 줄바꿈을 Windows 스타일(CRLF)로 통일
        let normalized_script = script.replace("\r\n", "\n").replace("\n", "\r\n");

        // 순수 UTF-8로 저장 (BOM 제거)
        let content = normalized_script.as_bytes();

        if let Err(e) = fs::write(&temp_path, content) {
            return Err(format!("Failed to write script: {}", e));
        }

        const CREATE_NO_WINDOW: u32 = 0x08000000;

        let output = Command::new("cmd")
            .args(["/C", "call", temp_path.to_str().unwrap(), "TAURI_AUTO_APPLY"])
            .creation_flags(CREATE_NO_WINDOW)
            .stdin(std::process::Stdio::null())
            .output();

        // 임시 배치 파일 정리
        let _ = fs::remove_file(&temp_path);

        match output {
            Ok(out) => {
                if out.status.success() {
                    Ok("Settings applied successfully".to_string())
                } else {
                    // Try to extract the specific ERROR: message from stdout or stderr
                    let stdout_str = String::from_utf8_lossy(&out.stdout);
                    let stderr_str = String::from_utf8_lossy(&out.stderr);
                    
                    let mut specific_error = String::new();
                    for line in stderr_str.lines().chain(stdout_str.lines()) {
                        if line.contains("ERROR:") {
                            specific_error = line.trim().to_string();
                            break;
                        }
                    }

                    if !specific_error.is_empty() {
                        Err(specific_error)
                    } else if !stderr_str.trim().is_empty() {
                        Err(stderr_str.trim().to_string())
                    } else {
                        Err(format!("Script exited with status: {}", out.status))
                    }
                }
            }
            Err(e) => Err(format!("Failed to execute script: {}", e)),
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = script;
        Err("화면 보호기 직접 적용은 Windows PC에서만 지원됩니다. .bat 파일을 다운로드하여 Windows PC에서 실행하세요.".to_string())
    }
}

#[tauri::command]
fn save_bat_with_dialog(_app_handle: tauri::AppHandle, content: String) -> Result<String, String> {
    use std::fs;
    
    // 현재 날짜/시간 기반 기본 파일명 생성
    let now = chrono::Local::now();
    let filename = format!("Apply_Screensaver_{}.bat", now.format("%Y%m%d_%H%M%S"));

    // rfd는 tauri-plugin-dialog의 기반이므로 이를 직접 쓰면 가장 확실함.
    let path = rfd::FileDialog::new()
        .add_filter("Batch File", &["bat"])
        .set_file_name(&filename)
        .save_file();

    if let Some(path) = path {
        // 줄바꿈을 Windows 스타일(CRLF)로 통일
        let normalized_content = content.replace("\r\n", "\n").replace("\n", "\r\n");

        // 순수 UTF-8로 저장 (BOM 제거)
        let data = normalized_content.as_bytes();

        fs::write(&path, data).map_err(|e| format!("파일 저장 실패: {}", e))?;
        Ok(format!("파일이 성공적으로 저장되었습니다: {:?}", path))
    } else {
        Err("저장이 취소되었습니다.".to_string())
    }
}

#[tauri::command]
fn open_url(url: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        let res = Command::new("cmd")
            .args(["/C", "start", "", &url])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn();

        match res {
            Ok(_) => Ok("URL 열기 성공".to_string()),
            Err(e) => {
                Command::new("explorer.exe")
                    .arg(&url)
                    .spawn()
                    .map_err(|e2| format!("웹사이트 열기 실패: {} / {}", e, e2))?;
                Ok("URL 열기 성공 (explorer)".to_string())
            }
        }
    }
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| format!("URL 열기 실패: {}", e))?;
        Ok("URL 열기 성공 (macOS)".to_string())
    }
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&url)
            .spawn()
            .map_err(|e| format!("URL 열기 실패: {}", e))?;
        Ok("URL 열기 성공 (Linux)".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![apply_settings, get_current_settings, save_bat_with_dialog, open_url])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
