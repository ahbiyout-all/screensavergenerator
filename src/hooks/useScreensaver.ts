import { useState, useEffect } from 'react';
import { SCREENSAVERS_DATA, Language } from '../i18n';

export function useScreensaver(language: Language = 'ko') {
  const [isActive, setIsActive] = useState(true);
  const [screensaver, setScreensaver] = useState('Mystify.scr');
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [timeoutMinutes, setTimeoutMinutes] = useState<number>(10);
  const [isSecure, setIsSecure] = useState(true);
  
  const [batchScript, setBatchScript] = useState('');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [isApplying, setIsApplying] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [systemSettings, setSystemSettings] = useState<any>(null);

  useEffect(() => {
    const fetchCurrentSettings = async () => {
      setIsFetching(true);
      if ('__TAURI_INTERNALS__' in window) {
        try {
          const { invoke } = await import('@tauri-apps/api/core');
          const settings: any = await invoke('get_current_settings');
          
          setSystemSettings(settings);
          setIsActive(settings.is_active);
          
          // Check if the screensaver is in our predefined list
          const isKnown = SCREENSAVERS_DATA.some(s => s.id.toLowerCase() === settings.screensaver.toLowerCase());
          if (isKnown) {
            setScreensaver(settings.screensaver);
          } else if (settings.screensaver) {
            // If it's not known but exists, treat it as custom
            setScreensaver('custom');
          }
          
          let t = settings.timeout_minutes;
          t = Math.round(t / 5) * 5;
          if (t < 0) t = 0;
          if (t > 60) t = 60;
          setTimeoutMinutes(t);
          setIsSecure(settings.is_secure);
        } catch (e) {
          console.error('Failed to fetch current settings:', e);
        }
      }
      setIsFetching(false);
    };

    fetchCurrentSettings();
  }, []);

  useEffect(() => {
    generateScript();
  }, [isActive, screensaver, customFile, timeoutMinutes, isSecure, language]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const generateScript = () => {
    const isCustom = screensaver === 'custom' && customFile;
    const finalScreensaver = isCustom ? customFile.name : (screensaver === 'custom' ? 'scrnsave.scr' : screensaver);
    const finalTimeout = timeoutMinutes;
    const timeoutSeconds = finalTimeout * 60;
    
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dt = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    
    const isEn = language === 'en';

    let saverText = isEn ? 'Unknown' : '알 수 없음';
    if (!isActive) {
      saverText = isEn ? 'Disabled (Off)' : '꺼짐';
    } else {
      const found = SCREENSAVERS_DATA.find(s => s.id.toLowerCase() === finalScreensaver.toLowerCase());
      if (found) {
        saverText = isEn ? found.name.en : found.name.ko.split(' (')[0];
      } else if (isCustom) {
        saverText = finalScreensaver;
      }
    }

    const timeoutText = isEn 
      ? (finalTimeout === 0 ? `${timeoutSeconds} sec (Immediate)` : `${finalTimeout} min`)
      : (finalTimeout === 0 ? `${timeoutSeconds}초 (즉시)` : `${finalTimeout}분`);

    const secureText = isEn
      ? (isSecure ? 'Enabled (Password Required)' : 'Disabled')
      : (isSecure ? '암호 보호 사용됨' : '암호 보호 꺼짐');

    const activeVal = isActive ? '1' : '0';

    let script = `@echo off\r\n\r\n`;
    script += `chcp 65001 >nul\r\n\r\n`;
    
    if (isEn) {
      script += `echo ===== Screensaver Setup BAT =====\r\n\r\n`;
      script += `echo Saved At: ${dt}\r\n\r\n`;
      script += `echo Screensaver Status: ${saverText}\r\n\r\n`;
      script += `echo Wait Time: ${timeoutText}\r\n\r\n`;
      script += `echo Password Protection: ${secureText}\r\n\r\n`;

      if (!isActive) {
        script += `echo Saved in disabled state.\r\n\r\n`;
        script += `echo This BAT script will only disable the screensaver.\r\n\r\n`;
      }

      script += `reg add "HKCU\\Control Panel\\Desktop" /v ScreenSaveActive /t REG_SZ /d ${activeVal} /f >nul\r\n`;
      script += `if %errorlevel% neq 0 ( echo ERROR: Failed to configure screensaver active state. >&2 & exit /b %errorlevel% )\r\n\r\n`;

      if (isActive) {
        if (finalScreensaver !== 'scrnsave.scr') {
          script += `reg add "HKCU\\Control Panel\\Desktop" /v SCRNSAVE.EXE /t REG_SZ /d "${finalScreensaver}" /f >nul\r\n`;
          script += `if %errorlevel% neq 0 ( echo ERROR: Failed to configure screensaver file path. >&2 & exit /b %errorlevel% )\r\n\r\n`;
        } else {
          script += `reg delete "HKCU\\Control Panel\\Desktop" /v SCRNSAVE.EXE /f >nul 2>&1\r\n\r\n`;
        }
        script += `reg add "HKCU\\Control Panel\\Desktop" /v ScreenSaveTimeOut /t REG_SZ /d ${timeoutSeconds} /f >nul\r\n`;
        script += `if %errorlevel% neq 0 ( echo ERROR: Failed to configure screensaver timeout. >&2 & exit /b %errorlevel% )\r\n\r\n`;
        script += `reg add "HKCU\\Control Panel\\Desktop" /v ScreenSaverIsSecure /t REG_SZ /d ${isSecure ? '1' : '0'} /f >nul\r\n`;
        script += `if %errorlevel% neq 0 ( echo ERROR: Failed to configure password protection. >&2 & exit /b %errorlevel% )\r\n\r\n`;
      } else {
        script += `reg delete "HKCU\\Control Panel\\Desktop" /v SCRNSAVE.EXE /f >nul 2>&1\r\n\r\n`;
      }

      script += `echo Synchronizing system parameters...\r\n\r\n`;
      script += `echo $code = '[DllImport(\"user32.dll\")] public static extern bool SystemParametersInfo(uint a, uint b, IntPtr c, uint d);' > "%temp%\\refresh_ss.ps1"\r\n`;
      script += `echo Add-Type -MemberDefinition $code -Name 'Win32' -Namespace 'API' -ErrorAction SilentlyContinue >> "%temp%\\refresh_ss.ps1"\r\n`;
      script += `echo [API.Win32]::SystemParametersInfo(0x0011, ${activeVal}, [IntPtr]::Zero, 3) >> "%temp%\\refresh_ss.ps1"\r\n`;
      script += `echo [API.Win32]::SystemParametersInfo(0x000F, ${timeoutSeconds}, [IntPtr]::Zero, 3) >> "%temp%\\refresh_ss.ps1"\r\n`;
      script += `echo [API.Win32]::SystemParametersInfo(0x0077, ${isSecure ? '1' : '0'}, [IntPtr]::Zero, 3) >> "%temp%\\refresh_ss.ps1"\r\n\r\n`;
      script += `powershell -NoProfile -ExecutionPolicy Bypass -File "%temp%\\refresh_ss.ps1" >nul 2>&1\r\n\r\n`;
      script += `if %errorlevel% neq 0 ( rundll32.exe user32.dll,UpdatePerUserSystemParameters )\r\n\r\n`;
      script += `if exist "%temp%\\refresh_ss.ps1" del "%temp%\\refresh_ss.ps1" >nul 2>&1\r\n\r\n`;
      script += `if "%~1"=="TAURI_AUTO_APPLY" (\r\n`;
      script += `    exit /b 0\r\n`;
      script += `)\r\n\r\n`;
      script += `echo Done! Screensaver settings have been applied immediately.\r\n\r\n`;
      script += `echo Automatically closing in 10 seconds... (Close this window to exit now)\r\n\r\n`;
      script += `echo AhBiYout ^& Cisnet.co.kr \r\n\r\n`;
      script += `timeout /t 10 >nul 2>&1 || ping 127.0.0.1 -n 11 >nul 2>&1\r\n\r\n`;
      script += `exit /b 0\r\n\r\n`;
    } else {
      script += `echo ===== 화면 보호기 설정 BAT =====\r\n\r\n`;
      script += `echo 저장 시각: ${dt}\r\n\r\n`;
      script += `echo 화면 보호기 상태: ${saverText}\r\n\r\n`;
      script += `echo 대기 시간: ${timeoutText}\r\n\r\n`;
      script += `echo 암호 보호: ${secureText}\r\n\r\n`;

      if (!isActive) {
        script += `echo 현재는 꺼진 상태에서 저장됨\r\n\r\n`;
        script += `echo 이 BAT는 화면보호기 비활성만 수행합니다.\r\n\r\n`;
      }

      script += `reg add "HKCU\\Control Panel\\Desktop" /v ScreenSaveActive /t REG_SZ /d ${activeVal} /f >nul\r\n`;
      script += `if %errorlevel% neq 0 ( echo ERROR: 화면 보호기 활성화 상태 설정에 실패했습니다. >&2 & exit /b %errorlevel% )\r\n\r\n`;

      if (isActive) {
        if (finalScreensaver !== 'scrnsave.scr') {
          script += `reg add "HKCU\\Control Panel\\Desktop" /v SCRNSAVE.EXE /t REG_SZ /d "${finalScreensaver}" /f >nul\r\n`;
          script += `if %errorlevel% neq 0 ( echo ERROR: 화면 보호기 파일 경로 설정에 실패했습니다. >&2 & exit /b %errorlevel% )\r\n\r\n`;
        } else {
          script += `reg delete "HKCU\\Control Panel\\Desktop" /v SCRNSAVE.EXE /f >nul 2>&1\r\n\r\n`;
        }
        script += `reg add "HKCU\\Control Panel\\Desktop" /v ScreenSaveTimeOut /t REG_SZ /d ${timeoutSeconds} /f >nul\r\n`;
        script += `if %errorlevel% neq 0 ( echo ERROR: 대기 시간 설정에 실패했습니다. >&2 & exit /b %errorlevel% )\r\n\r\n`;
        script += `reg add "HKCU\\Control Panel\\Desktop" /v ScreenSaverIsSecure /t REG_SZ /d ${isSecure ? '1' : '0'} /f >nul\r\n`;
        script += `if %errorlevel% neq 0 ( echo ERROR: 암호 보호 설정에 실패했습니다. >&2 & exit /b %errorlevel% )\r\n\r\n`;
      } else {
        script += `reg delete "HKCU\\Control Panel\\Desktop" /v SCRNSAVE.EXE /f >nul 2>&1\r\n\r\n`;
      }

      script += `echo 시스템 설정을 동기화하는 중...\r\n\r\n`;
      script += `echo $code = '[DllImport(\"user32.dll\")] public static extern bool SystemParametersInfo(uint a, uint b, IntPtr c, uint d);' > "%temp%\\refresh_ss.ps1"\r\n`;
      script += `echo Add-Type -MemberDefinition $code -Name 'Win32' -Namespace 'API' -ErrorAction SilentlyContinue >> "%temp%\\refresh_ss.ps1"\r\n`;
      script += `echo [API.Win32]::SystemParametersInfo(0x0011, ${activeVal}, [IntPtr]::Zero, 3) >> "%temp%\\refresh_ss.ps1"\r\n`;
      script += `echo [API.Win32]::SystemParametersInfo(0x000F, ${timeoutSeconds}, [IntPtr]::Zero, 3) >> "%temp%\\refresh_ss.ps1"\r\n`;
      script += `echo [API.Win32]::SystemParametersInfo(0x0077, ${isSecure ? '1' : '0'}, [IntPtr]::Zero, 3) >> "%temp%\\refresh_ss.ps1"\r\n\r\n`;
      script += `powershell -NoProfile -ExecutionPolicy Bypass -File "%temp%\\refresh_ss.ps1" >nul 2>&1\r\n\r\n`;
      script += `if %errorlevel% neq 0 ( rundll32.exe user32.dll,UpdatePerUserSystemParameters )\r\n\r\n`;
      script += `if exist "%temp%\\refresh_ss.ps1" del "%temp%\\refresh_ss.ps1" >nul 2>&1\r\n\r\n`;
      script += `if "%~1"=="TAURI_AUTO_APPLY" (\r\n`;
      script += `    exit /b 0\r\n`;
      script += `)\r\n\r\n`;
      script += `echo 완료되었습니다. 설정이 즉시 적용되었습니다.\r\n\r\n`;
      script += `echo 10초후 자동으로 종료 됩니다. (종료하려면 창을 닫으세요)\r\n\r\n`;
      script += `echo AhBiYout ^& Cisnet.co.kr \r\n\r\n`;
      script += `timeout /t 10 >nul 2>&1 || ping 127.0.0.1 -n 11 >nul 2>&1\r\n\r\n`;
      script += `exit /b 0\r\n\r\n`;
    }

    setBatchScript(script);
  };

  const handleDownload = async () => {
    const isEn = language === 'en';
    // Tauri 환경 체크
    if (window && (window as any).__TAURI_INTERNALS__) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        
        const result = await invoke<string>('save_bat_with_dialog', {
          content: batchScript
        });
        
        showToast(result);
        return;
      } catch (e: any) {
        if (e && typeof e === 'string' && (e.includes('취소') || e.includes('canceled') || e.includes('cancelled'))) {
          return;
        }
        console.error('Tauri atomic save failed:', e);
        showToast(isEn ? `Failed to save: ${e}` : `저장 실패: ${e}`);
        return;
      }
    }
    
    // 웹 브라우저 환경
    try {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dt = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const filename = `Apply_Screensaver_${dt}.bat`;
      
      const blob = new Blob([batchScript], { type: 'application/x-bat;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(isEn ? 'Saved to your Downloads folder.' : '브라우저를 통해 다운로드 폴더에 저장되었습니다.');
    } catch (err) {
      console.error('Web download failed:', err);
    }
  };

  const handleApply = async () => {
    const isEn = language === 'en';
    setIsApplying(true);
    if ('__TAURI_INTERNALS__' in window) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('apply_settings', { script: batchScript });
        showToast(isEn ? 'Settings have been applied successfully.' : '설정이 성공적으로 적용되었습니다.');
        
        // Refresh system settings after applying
        const settings: any = await invoke('get_current_settings');
        setSystemSettings(settings);
      } catch (e) {
        console.error('Failed to apply settings:', e);
        showToast(isEn ? `Failed to apply settings: ${e}` : `설정 적용 실패: ${e}`);
      }
    } else {
      handleDownload();
      showToast(isEn ? 'Cannot apply directly in web mode. Downloading BAT file...' : '웹에서는 직접 적용할 수 없어 파일을 다운로드합니다.');
    }
    setIsApplying(false);
  };

  const handleCopy = async () => {
    const isEn = language === 'en';
    try {
      await navigator.clipboard.writeText(batchScript);
      setCopied(true);
      showToast(isEn ? 'Copied to clipboard.' : '복사되었습니다.');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return {
    isActive, setIsActive,
    screensaver, setScreensaver,
    customFile, setCustomFile,
    timeoutMinutes, setTimeoutMinutes,
    isSecure, setIsSecure,
    batchScript,
    copied,
    toastMessage,
    isApplying,
    isFetching,
    systemSettings,
    showToast,
    handleDownload,
    handleCopy,
    handleApply
  };
}
