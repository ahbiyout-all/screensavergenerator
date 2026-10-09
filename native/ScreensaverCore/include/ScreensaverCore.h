/**
 * ============================================================================
 * ScreensaverCore.h - Pure Custom Native DLL for Windows Screensaver Manager
 * Copyright (c) 2026 AhBiYout. All rights reserved.
 * 
 * Developer : AhBiYout (AhBiYout-all)
 * Company   : cisnet (http://www.cisnet.co.kr/)
 * Blog      : https://ahbiyoutvibe.blogspot.com/
 * ============================================================================
 */

#ifndef SCREENSAVER_CORE_H
#define SCREENSAVER_CORE_H

#ifdef __cplusplus
extern "C" {
#endif

#include <windows.h>

#ifdef SCREENSAVER_CORE_EXPORTS
    #define SC_API __declspec(dllexport)
#else
    #define SC_API __declspec(dllimport)
#endif

#define SC_CALL __stdcall

/* ============================================================================
 * Return Codes & Status Constants
 * ============================================================================ */
#define SC_SUCCESS                     0
#define SC_ERR_INVALID_PARAM          -1
#define SC_ERR_REGISTRY_OPEN          -2
#define SC_ERR_REGISTRY_READ          -3
#define SC_ERR_REGISTRY_WRITE         -4
#define SC_ERR_SYSTEM_PARAMETERS_INFO -5
#define SC_ERR_FILE_NOT_FOUND         -6
#define SC_ERR_PROCESS_SPAWN          -7
#define SC_ERR_BUFFER_TOO_SMALL       -8

/* ============================================================================
 * Data Structures
 * ============================================================================ */
#pragma pack(push, 8)

typedef struct _ScreensaverConfig {
    BOOL    bIsActive;               /* ScreenSaveActive (1: 활성화, 0: 비활성화) */
    WCHAR   wszScreensaverName[260]; /* 파일명 또는 전체 경로 (예: Mystify.scr) */
    DWORD   dwTimeoutMinutes;        /* 화면 보호기 대기 시간 (분 단위) */
    BOOL    bIsSecure;               /* ScreenSaverIsSecure (1: 암호 보호, 0: 미보호) */
} ScreensaverConfig;

typedef struct _ScreensaverDiagnostics {
    BOOL    bIsPolicyOverridden;     /* 그룹 정책(GPO)에 의해 잠겨 있는지 여부 */
    BOOL    bIsPowerBlocked;         /* 전원 요청(동영상 재생 등)으로 차단 중인지 여부 */
    DWORD   dwActivePowerScheme;     /* 현재 활성 전원 관리 프로파일 식별자 */
    WCHAR   wszResolvedScrPath[260]; /* C:\Windows\System32 내 실제 탐색된 경로 */
} ScreensaverDiagnostics;

#pragma pack(pop)

/* ============================================================================
 * Core C-ABI Exported API Functions
 * ============================================================================ */

/**
 * 현재 Windows 시스템(HKCU\\Control Panel\\Desktop)의 화면 보호기 설정을 조회합니다.
 * @param pOutConfig 설정 값을 담을 ScreensaverConfig 구조체 포인터
 * @return SC_SUCCESS(0) 또는 음수 에러 코드
 */
SC_API int SC_CALL GetScreensaverSettingsNative(ScreensaverConfig* pOutConfig);

/**
 * 지정된 설정을 레지스트리에 원자적으로 기록하고 SystemParametersInfoW로 OS에 즉각 통보합니다.
 * @param pConfig 적용할 설정 값이 담긴 구조체 포인터
 * @return SC_SUCCESS(0) 또는 음수 에러 코드
 */
SC_API int SC_CALL ApplyScreensaverSettingsNative(const ScreensaverConfig* pConfig);

/**
 * 지정한 화면 보호기 파일(.scr)을 즉시 실시간 테스트/미리보기 모드로 실행합니다.
 * @param pwszScrPath 화면 보호기 파일명 또는 전체 경로 (예: L"Mystify.scr")
 * @param hWndParent 부모 윈도우 핸들 (전체화면일 경우 NULL)
 * @param bFullScreen TRUE면 전체화면(/s), FALSE면 부모 창 내부 미리보기(/p)
 * @return SC_SUCCESS(0) 또는 음수 에러 코드
 */
SC_API int SC_CALL TriggerScreensaverPreview(
    const WCHAR* pwszScrPath,
    HWND hWndParent,
    BOOL bFullScreen
);

/**
 * Windows Explorer 및 Shell 세션에 WM_SETTINGCHANGE 브로드캐스트를 전송하여
 * 재부팅 없이 즉시 설정을 갱신시킵니다.
 * @return SC_SUCCESS(0) 또는 음수 에러 코드
 */
SC_API int SC_CALL BroadcastScreensaverSettingChange(void);

/**
 * 시스템 전원 정책, 절전 차단 요인 및 그룹 정책(GPO) 충돌 여부를 진단합니다.
 * @param pOutDiag 진단 결과를 담을 ScreensaverDiagnostics 구조체 포인터
 * @return SC_SUCCESS(0) 또는 음수 에러 코드
 */
SC_API int SC_CALL DiagnoseScreensaverBlockers(ScreensaverDiagnostics* pOutDiag);

/* ============================================================================
 * rundll32.exe 표준 호환 엔트리포인트 (스택 오염 방지 표준 규격)
 * ============================================================================ */

/**
 * rundll32.exe를 통해 명령줄 또는 배치 파일(.bat)에서 안전하게 호출할 수 있는 함수.
 * 사용 예: rundll32.exe ScreensaverCore.dll,ApplyScreensaverSettingsRundll32 active=1;scr=Mystify.scr;timeout=10;secure=1
 */
SC_API void CALLBACK ApplyScreensaverSettingsRundll32(
    HWND hwnd,
    HINSTANCE hinst,
    LPCSTR lpszCmdLine,
    int nCmdShow
);

/**
 * rundll32.exe를 통해 특정 화면 보호기 미리보기를 즉시 구동하는 함수.
 * 사용 예: rundll32.exe ScreensaverCore.dll,TriggerPreviewRundll32 Mystify.scr
 */
SC_API void CALLBACK TriggerPreviewRundll32(
    HWND hwnd,
    HINSTANCE hinst,
    LPCSTR lpszCmdLine,
    int nCmdShow
);

#ifdef __cplusplus
}
#endif

#endif /* SCREENSAVER_CORE_H */
