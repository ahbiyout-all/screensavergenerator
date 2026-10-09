/**
 * ============================================================================
 * ScreensaverCore.c - Pure Custom Native DLL Implementation
 * Copyright (c) 2026 AhBiYout. All rights reserved.
 * 
 * Developer : AhBiYout (AhBiYout-all)
 * Company   : cisnet (http://www.cisnet.co.kr/)
 * Blog      : https://ahbiyoutvibe.blogspot.com/
 * ============================================================================
 */

#define SCREENSAVER_CORE_EXPORTS
#include "../include/ScreensaverCore.h"
#include <wchar.h>
#include <stdio.h>
#include <stdlib.h>

#define DESKTOP_REG_KEY L"Control Panel\\Desktop"

/* ============================================================================
 * DLL Entry Point (DllMain)
 * ============================================================================ */
BOOL WINAPI DllMain(HINSTANCE hinstDLL, DWORD fdwReason, LPVOID lpvReserved)
{
    UNREFERENCED_PARAMETER(lpvReserved);

    switch (fdwReason)
    {
    case DLL_PROCESS_ATTACH:
        /* 성능 최적화: 스레드 생성/소멸 통지 비활성화 (오버헤드 제거) */
        DisableThreadLibraryCalls(hinstDLL);

        /* 보안 강화: DLL 프리로딩 / 하이재킹(CWE-427) 원천 방어 */
        /* Windows 8 / Server 2012 이상 또는 KB2533623 적용 시스템에서 System32만 탐색 */
        #if defined(LOAD_LIBRARY_SEARCH_SYSTEM32)
        SetDefaultDllDirectories(LOAD_LIBRARY_SEARCH_SYSTEM32);
        #endif
        break;

    case DLL_PROCESS_DETACH:
    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
        break;
    }
    return TRUE;
}

/* ============================================================================
 * Helper: Resolve Screensaver Full Path
 * ============================================================================ */
static BOOL ResolveScreensaverPath(const WCHAR* pInputName, WCHAR* pOutFullPath, DWORD dwMaxLen)
{
    if (!pInputName || !pOutFullPath || dwMaxLen == 0) return FALSE;

    /* 이미 절대 경로이거나 백슬래시를 포함한 경우 */
    if (wcschr(pInputName, L'\\') || wcschr(pInputName, L'/')) {
        wcsncpy_s(pOutFullPath, dwMaxLen, pInputName, _TRUNCATE);
        return (GetFileAttributesW(pOutFullPath) != INVALID_FILE_ATTRIBUTES);
    }

    /* Windows System32 경로 탐색 */
    WCHAR szSysDir[MAX_PATH];
    if (GetSystemDirectoryW(szSysDir, MAX_PATH) > 0) {
        swprintf_s(pOutFullPath, dwMaxLen, L"%s\\%s", szSysDir, pInputName);
        if (GetFileAttributesW(pOutFullPath) != INVALID_FILE_ATTRIBUTES) {
            return TRUE;
        }
    }

    /* Windows SysWOW64 / Windows 루트 탐색 (64비트 호환) */
    WCHAR szWinDir[MAX_PATH];
    if (GetWindowsDirectoryW(szWinDir, MAX_PATH) > 0) {
        swprintf_s(pOutFullPath, dwMaxLen, L"%s\\SysWOW64\\%s", szWinDir, pInputName);
        if (GetFileAttributesW(pOutFullPath) != INVALID_FILE_ATTRIBUTES) {
            return TRUE;
        }
        swprintf_s(pOutFullPath, dwMaxLen, L"%s\\%s", szWinDir, pInputName);
        if (GetFileAttributesW(pOutFullPath) != INVALID_FILE_ATTRIBUTES) {
            return TRUE;
        }
    }

    /* fallback: 기본 입력 복사 */
    wcsncpy_s(pOutFullPath, dwMaxLen, pInputName, _TRUNCATE);
    return FALSE;
}

/* ============================================================================
 * Exported API: GetScreensaverSettingsNative
 * ============================================================================ */
SC_API int SC_CALL GetScreensaverSettingsNative(ScreensaverConfig* pOutConfig)
{
    if (!pOutConfig) {
        return SC_ERR_INVALID_PARAM;
    }

    ZeroMemory(pOutConfig, sizeof(ScreensaverConfig));
    pOutConfig->dwTimeoutMinutes = 10; /* 기본값 10분 */
    wcscpy_s(pOutConfig->wszScreensaverName, 260, L"Mystify.scr");

    HKEY hKey = NULL;
    LSTATUS status = RegOpenKeyExW(HKEY_CURRENT_USER, DESKTOP_REG_KEY, 0, KEY_READ, &hKey);
    if (status != ERROR_SUCCESS) {
        return SC_ERR_REGISTRY_OPEN;
    }

    WCHAR szBuffer[MAX_PATH];
    DWORD dwType = 0;
    DWORD dwBytes = sizeof(szBuffer);

    /* 1. ScreenSaveActive */
    dwBytes = sizeof(szBuffer);
    if (RegQueryValueExW(hKey, L"ScreenSaveActive", NULL, &dwType, (LPBYTE)szBuffer, &dwBytes) == ERROR_SUCCESS) {
        pOutConfig->bIsActive = (wcscmp(szBuffer, L"1") == 0);
    }

    /* 2. SCRNSAVE.EXE */
    dwBytes = sizeof(szBuffer);
    if (RegQueryValueExW(hKey, L"SCRNSAVE.EXE", NULL, &dwType, (LPBYTE)szBuffer, &dwBytes) == ERROR_SUCCESS) {
        /* 파일명만 추출하거나 전체 경로 보존 */
        WCHAR* pFileName = wcsrchr(szBuffer, L'\\');
        if (pFileName) {
            wcscpy_s(pOutConfig->wszScreensaverName, 260, pFileName + 1);
        } else {
            wcscpy_s(pOutConfig->wszScreensaverName, 260, szBuffer);
        }
    }

    /* 3. ScreenSaveTimeOut (초 단위 -> 분 단위 변환) */
    dwBytes = sizeof(szBuffer);
    if (RegQueryValueExW(hKey, L"ScreenSaveTimeOut", NULL, &dwType, (LPBYTE)szBuffer, &dwBytes) == ERROR_SUCCESS) {
        int nSeconds = _wtoi(szBuffer);
        if (nSeconds > 0) {
            pOutConfig->dwTimeoutMinutes = (DWORD)(nSeconds / 60);
        } else {
            pOutConfig->dwTimeoutMinutes = 0;
        }
    }

    /* 4. ScreenSaverIsSecure */
    dwBytes = sizeof(szBuffer);
    if (RegQueryValueExW(hKey, L"ScreenSaverIsSecure", NULL, &dwType, (LPBYTE)szBuffer, &dwBytes) == ERROR_SUCCESS) {
        pOutConfig->bIsSecure = (wcscmp(szBuffer, L"1") == 0);
    }

    RegCloseKey(hKey);
    return SC_SUCCESS;
}

/* ============================================================================
 * Exported API: ApplyScreensaverSettingsNative
 * ============================================================================ */
SC_API int SC_CALL ApplyScreensaverSettingsNative(const ScreensaverConfig* pConfig)
{
    if (!pConfig) {
        return SC_ERR_INVALID_PARAM;
    }

    HKEY hKey = NULL;
    LSTATUS status = RegOpenKeyExW(HKEY_CURRENT_USER, DESKTOP_REG_KEY, 0, KEY_SET_VALUE | KEY_READ, &hKey);
    if (status != ERROR_SUCCESS) {
        return SC_ERR_REGISTRY_OPEN;
    }

    /* 1. ScreenSaveActive */
    const WCHAR* pwszActive = pConfig->bIsActive ? L"1" : L"0";
    RegSetValueExW(hKey, L"ScreenSaveActive", 0, REG_SZ, 
        (const BYTE*)pwszActive, (DWORD)((wcslen(pwszActive) + 1) * sizeof(WCHAR)));

    /* 2. SCRNSAVE.EXE */
    if (pConfig->bIsActive && wcslen(pConfig->wszScreensaverName) > 0) {
        WCHAR szResolvedPath[MAX_PATH];
        ResolveScreensaverPath(pConfig->wszScreensaverName, szResolvedPath, MAX_PATH);

        RegSetValueExW(hKey, L"SCRNSAVE.EXE", 0, REG_SZ, 
            (const BYTE*)szResolvedPath, (DWORD)((wcslen(szResolvedPath) + 1) * sizeof(WCHAR)));
    } else if (!pConfig->bIsActive) {
        /* 비활성화 시에도 설정값을 지우거나 유지할 수 있음 */
    }

    /* 3. ScreenSaveTimeOut (분 -> 초 단위 변환) */
    WCHAR szTimeoutStr[32];
    DWORD dwSeconds = pConfig->dwTimeoutMinutes * 60;
    swprintf_s(szTimeoutStr, 32, L"%u", dwSeconds);
    RegSetValueExW(hKey, L"ScreenSaveTimeOut", 0, REG_SZ, 
        (const BYTE*)szTimeoutStr, (DWORD)((wcslen(szTimeoutStr) + 1) * sizeof(WCHAR)));

    /* 4. ScreenSaverIsSecure */
    const WCHAR* pwszSecure = pConfig->bIsSecure ? L"1" : L"0";
    RegSetValueExW(hKey, L"ScreenSaverIsSecure", 0, REG_SZ, 
        (const BYTE*)pwszSecure, (DWORD)((wcslen(pwszSecure) + 1) * sizeof(WCHAR)));

    RegCloseKey(hKey);

    /* ========================================================================
     * [핵심 개선]: SystemParametersInfoW 실시간 반영
     * 레지스트리만 변경하면 Windows OS 메모리 캐시가 갱신되지 않는 결함을
     * 아래 SPI Win32 API로 즉시 동기화하여 완벽 해결.
     * ======================================================================== */
    SystemParametersInfoW(SPI_SETSCREENSAVEACTIVE, (UINT)pConfig->bIsActive, NULL, SPIF_SENDCHANGE | SPIF_UPDATEINIFILE);
    SystemParametersInfoW(SPI_SETSCREENSAVETIMEOUT, (UINT)dwSeconds, NULL, SPIF_SENDCHANGE | SPIF_UPDATEINIFILE);

    /* Explorer 및 Shell 윈도우에 WM_SETTINGCHANGE 브로드캐스트 */
    BroadcastScreensaverSettingChange();

    return SC_SUCCESS;
}

/* ============================================================================
 * Exported API: TriggerScreensaverPreview
 * ============================================================================ */
SC_API int SC_CALL TriggerScreensaverPreview(const WCHAR* pwszScrPath, HWND hWndParent, BOOL bFullScreen)
{
    if (!pwszScrPath || wcslen(pwszScrPath) == 0) {
        return SC_ERR_INVALID_PARAM;
    }

    WCHAR szResolved[MAX_PATH];
    ResolveScreensaverPath(pwszScrPath, szResolved, MAX_PATH);

    WCHAR szCmdArgs[MAX_PATH * 2];
    if (bFullScreen || hWndParent == NULL) {
        /* /s: 전체 화면 테스트 모드 */
        swprintf_s(szCmdArgs, MAX_PATH * 2, L"\"%s\" /s", szResolved);
    } else {
        /* /p <HWND>: 부모 창 임베디드 미리보기 모드 */
        swprintf_s(szCmdArgs, MAX_PATH * 2, L"\"%s\" /p %I64u", szResolved, (unsigned __int64)(UINT_PTR)hWndParent);
    }

    STARTUPINFOW si;
    PROCESS_INFORMATION pi;
    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);
    ZeroMemory(&pi, sizeof(pi));

    if (!CreateProcessW(NULL, szCmdArgs, NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi)) {
        return SC_ERR_PROCESS_SPAWN;
    }

    CloseHandle(pi.hThread);
    CloseHandle(pi.hProcess);

    return SC_SUCCESS;
}

/* ============================================================================
 * Exported API: BroadcastScreensaverSettingChange
 * ============================================================================ */
SC_API int SC_CALL BroadcastScreensaverSettingChange(void)
{
    DWORD_PTR dwResult = 0;
    /* 500ms 타임아웃으로 UI 블로킹 없이 모든 최상위 창에 설정 변경 통지 */
    LRESULT lr = SendMessageTimeoutW(
        HWND_BROADCAST,
        WM_SETTINGCHANGE,
        SPI_SETSCREENSAVEACTIVE,
        (LPARAM)L"Windows",
        SMTO_ABORTIFHUNG | SMTO_NOTIMEOUTIFNOTHUNG,
        500,
        &dwResult
    );
    return (lr != 0) ? SC_SUCCESS : SC_ERR_SYSTEM_PARAMETERS_INFO;
}

/* ============================================================================
 * Exported API: DiagnoseScreensaverBlockers
 * ============================================================================ */
SC_API int SC_CALL DiagnoseScreensaverBlockers(ScreensaverDiagnostics* pOutDiag)
{
    if (!pOutDiag) return SC_ERR_INVALID_PARAM;

    ZeroMemory(pOutDiag, sizeof(ScreensaverDiagnostics));

    /* 1. 그룹 정책(GPO) 레지스트리 키 검사 */
    HKEY hGpoKey = NULL;
    if (RegOpenKeyExW(HKEY_CURRENT_USER, L"Software\\Policies\\Microsoft\\Windows\\Control Panel\\Desktop", 0, KEY_READ, &hGpoKey) == ERROR_SUCCESS) {
        DWORD dwType = 0;
        WCHAR szVal[32];
        DWORD dwSize = sizeof(szVal);
        if (RegQueryValueExW(hGpoKey, L"ScreenSaveActive", NULL, &dwType, (LPBYTE)szVal, &dwSize) == ERROR_SUCCESS) {
            pOutDiag->bIsPolicyOverridden = TRUE;
        }
        RegCloseKey(hGpoKey);
    }

    /* 2. System32 내 대표 화면보호기 확인 */
    WCHAR szSysDir[MAX_PATH];
    if (GetSystemDirectoryW(szSysDir, MAX_PATH) > 0) {
        swprintf_s(pOutDiag->wszResolvedScrPath, 260, L"%s\\Mystify.scr", szSysDir);
    }

    return SC_SUCCESS;
}

/* ============================================================================
 * Exported API: rundll32.exe 표준 호환 엔트리포인트
 * 규격: void CALLBACK EntryPoint(HWND hwnd, HINSTANCE hinst, LPCSTR lpszCmdLine, int nCmdShow)
 * ============================================================================ */
SC_API void CALLBACK ApplyScreensaverSettingsRundll32(HWND hwnd, HINSTANCE hinst, LPCSTR lpszCmdLine, int nCmdShow)
{
    UNREFERENCED_PARAMETER(hwnd);
    UNREFERENCED_PARAMETER(hinst);
    UNREFERENCED_PARAMETER(nCmdShow);

    ScreensaverConfig config;
    GetScreensaverSettingsNative(&config);

    if (lpszCmdLine && strlen(lpszCmdLine) > 0) {
        /* 간단한 명령줄 파싱 (예: active=1;scr=Mystify.scr;timeout=10;secure=1) */
        char buffer[512];
        strncpy_s(buffer, 512, lpszCmdLine, _TRUNCATE);

        char* context = NULL;
        char* token = strtok_s(buffer, "; ", &context);
        while (token) {
            if (strncmp(token, "active=", 7) == 0) {
                config.bIsActive = (atoi(token + 7) != 0);
            } else if (strncmp(token, "scr=", 4) == 0) {
                mbstowcs_s(NULL, config.wszScreensaverName, 260, token + 4, _TRUNCATE);
            } else if (strncmp(token, "timeout=", 8) == 0) {
                config.dwTimeoutMinutes = (DWORD)atoi(token + 8);
            } else if (strncmp(token, "secure=", 7) == 0) {
                config.bIsSecure = (atoi(token + 7) != 0);
            }
            token = strtok_s(NULL, "; ", &context);
        }
    }

    ApplyScreensaverSettingsNative(&config);
}

SC_API void CALLBACK TriggerPreviewRundll32(HWND hwnd, HINSTANCE hinst, LPCSTR lpszCmdLine, int nCmdShow)
{
    UNREFERENCED_PARAMETER(hinst);
    UNREFERENCED_PARAMETER(nCmdShow);

    WCHAR wszScr[MAX_PATH] = L"Mystify.scr";
    if (lpszCmdLine && strlen(lpszCmdLine) > 0) {
        mbstowcs_s(NULL, wszScr, MAX_PATH, lpszCmdLine, _TRUNCATE);
    }

    TriggerScreensaverPreview(wszScr, hwnd, TRUE);
}
