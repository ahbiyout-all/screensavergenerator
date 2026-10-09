# 작업 로그 (Work Log)

> **프로젝트**: Windows 10/11 화면 보호기 설정 관리자 및 배치 파일 생성기 (`screensavergenerator`)  
> **개발자**: AhBiYout (Git: `AhBiYout-all`)  
> **소속**: [http://www.cisnet.co.kr/](http://www.cisnet.co.kr/) | **공식 블로그**: [https://ahbiyoutvibe.blogspot.com/](https://ahbiyoutvibe.blogspot.com/)  
> **GitHub 저장소**: [https://github.com/AhBiYout/screensavergenerator](https://github.com/AhBiYout/screensavergenerator)

---

## 📅 2026-10-09: 화면 보호기(.scr) 만들기 스튜디오 개발 및 다중 모니터 (듀얼/트리플) 완벽 대응 아키텍처 구현

### 1. 작업 개요
- 사용자가 직접 나만의 Windows 화면 보호기(`.scr` 실행 파일)를 생성할 수 있는 **화면 보호기 만들기 스튜디오 (`ScrMakerModal.tsx`)** 구축.
- 5대 캔버스 프리셋 (Matrix Rain, Mystic Starfield 3D Warp, Retro Bouncing DVD, Cyber HUD & Clock, Neon Particle Mesh) 구현 및 60FPS 실시간 반응형 프리뷰.
- Win32 화면 보호기 표준 CLI 매개변수 (`/s`, `/c`, `/p <HWND>`) 및 C# P/Invoke 렌더링 엔진(`scrGenerator.ts`) 구현.
- **다중 모니터(듀얼/트리플) 완벽 대응 아키텍처 구현**:
  - `Screen.AllScreens` 기반 모니터별 독립 전체화면 창 생성
  - WinForms의 `WindowState.Maximized` 주 모니터 튕김 버그 방지 (`Manual` + `Bounds` + `Normal`)
  - `SetProcessDpiAwareness(2)` (Per-Monitor v2 DPI) 지원으로 이종 해상도/배율 왜곡 방지
  - 15px 마우스 지터 필터 및 일괄 동시 종료 (Exit Sync)
  - 다중 모니터 운영 모드 (`all_screens` vs `primary_active_black_secondary` OLED 번인 방지 모드) 탑재
- `JSZip` 기반 C# 소스, 아이콘, 리소스, csc.exe 자동 감지 `build.bat`을 포함한 **1-클릭 빌드 패키지 (.zip)** 다운로더 탑재.
- 기술 가이드 `docs/SCREENSAVER_SCR_MAKER_GUIDE.md` 등록 및 `docs/` 전체 문서 최신 동기화 완료.

### 2. 세부 산출물
1. `src/types/screensaverMaker.ts`: 화면 보호기 제작 스펙, 프리셋 정의, 다중 모니터 모드 타입.
2. `src/utils/scrGenerator.ts`: C# 소스코드 실시간 제너레이터 (DPI Aware, 멀티 모니터, 프리뷰 핸들 임베딩, 더블 버퍼링 GDI+).
3. `src/components/ScrMakerModal.tsx`: 스튜디오 UI, 실시간 캔버스 렌더러, 다중 모니터 컨트롤, 원클릭 ZIP 빌더.
4. `docs/SCREENSAVER_SCR_MAKER_GUIDE.md`: 화면 보호기 Win32 스펙 및 다중 모니터 고려사항/해결책 문서.

---

## 📅 2026-10-09: 순수 창작 DLL (`ScreensaverCore.dll`) 개발 및 기존 DLL 문제 분석/개선 완료

### 1. 작업 개요
- 기존 Windows 배치/외부 프로세스(`reg.exe`, `powershell.exe`) 및 레거시 DLL(`desk.cpl`, `user32.dll`)의 오류/한계점 정밀 분석.
- 고속 원자적 Win32 입출력 및 실시간 브로드캐스트를 전담하는 **순수 창작 Win32 네이티브 DLL (`ScreensaverCore.dll`)** C-ABI 구현.
- `docs/DLL_SPECIFICATION.md` 상세 명세서 작성 및 등록.
- 프론트엔드 UI에 `ScreensaverCore.dll` 명세 인스펙터 모달(`DllInfoModal.tsx`) 및 실시간 미리보기 테스트(`handlePreviewScreensaver`) 기능 통합.
- 배치 파일 생성기(`useScreensaver.ts`)에 `ScreensaverCore.dll`이 존재할 경우 rundll32 0ms 고속 처리하도록 우선 분기 탑재.

### 2. 세부 산출물
1. `native/ScreensaverCore/include/ScreensaverCore.h`:
   - C-ABI 내보내기 함수 헤더, 구조체 정의, 에러 코드 정의.
2. `native/ScreensaverCore/src/ScreensaverCore.c`:
   - Win32 API(`Advapi32`, `User32`, `Shell32`) 직접 바인딩 C 구현체.
   - `DllMain` 내 `SetDefaultDllDirectories(LOAD_LIBRARY_SEARCH_SYSTEM32)`를 통한 CWE-427 DLL 하이재킹 원천 방어.
   - `ApplyScreensaverSettingsRundll32` 및 `TriggerPreviewRundll32`로 100% 스택 안전 rundll32 엔트리포인트 제공.
3. `native/ScreensaverCore/ScreensaverCore.def`:
   - C++ 네임 맹글링 없는 C-ABI 표준 심볼 내보내기 정의.
4. `native/ScreensaverCore/build_dll.bat`:
   - MSVC (`cl.exe /MT /O2`) 및 MinGW (`gcc`) 자동 감지 빌드 스크립트 (CRLF 적용).
5. `src-tauri/src/lib.rs`:
   - `preview_screensaver`, `get_dll_engine_info` 네이티브 핸들러 추가.
6. `docs/DLL_SPECIFICATION.md`:
   - 동작 원리 다이어그램, 기존 DLL 결함 분석, API 명세, rundll32 규격, 언어별 연동 예제, 벤치마크 총망라.


## 📅 2026-10-05: GitHub 자동 푸시 및 배포 파이프라인 구축 (v1.1.0)

### 1. 작업 개요
- 모바일(APK) 및 iOS 설정 제거 후 **Windows 전용(PC) 단독 타겟 최적화**.
- GitHub 자동 푸시 스크립트(`scripts/github-push.bat`, `push.bat`, `github-push.bat`, `scripts/github-push.ps1`, `scripts/github-sync.sh`) 구현.
- Single Source of Truth 기반 다단 동적 버전 추출 메커니즘 (Node.js `package.json` ➔ PowerShell ➔ `docs/PATCHNOTES.md` 정규식 파싱 ➔ v%APP_VER%).
- GitHub Actions CI/CD 워크플로우(`.github/workflows/release.yml`)와 태그(`v%APP_VER%`) 연동.
- GitHub Releases 기반 실시간 자동 업데이트 알림 팝업 모달(`UpdateModal.tsx`, `useUpdateChecker.ts`) 탑재.
- 대용량 캐시 및 바이너리 누출 방지를 위한 `.gitignore` 정밀 고도화.

### 2. 세부 산출물
1. `push.bat` / `github-push.bat`:
   - 루트 경로에서 원클릭으로 Git 초기화, 원격 저장소(`origin`) 연결, 커밋, 태깅(`vX.Y.Z`), 푸시를 자동 수행.
2. `scripts/github-push.bat` & `scripts/github-push.ps1`:
   - 콘솔 창 타이틀 동적 동기화 (`title AhBiYout Screensaver Generator - GitHub Push Pipeline [v%APP_VER%]`).
   - Windows CRLF 인코딩 적용.
3. `scripts/ensure-crlf.js`:
   - 모든 배치 스크립트의 CRLF 줄바꿈 규격 자동 검증 및 보정.
4. `.github/workflows/release.yml`:
   - `v*.*.*` 태그 푸시 시 `windows-latest` 러너에서 Tauri 데스크톱 앱(`.exe` / `.msi`) 빌드 및 GitHub Releases 자산 자동 첨부.
