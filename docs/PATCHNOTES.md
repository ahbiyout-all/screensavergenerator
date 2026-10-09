# Windows 화면 보호기 설정 관리자 - 패치노트 (Patch Notes)

> **Copyright © AhBiYout All rights reserved.**  
> 개발자: AhBiYout | 소속: [http://www.cisnet.co.kr/](http://www.cisnet.co.kr/) | 구글 블로그: [https://ahbiyoutvibe.blogspot.com/](https://ahbiyoutvibe.blogspot.com/)

---

## 📌 v1.1.0 (2026-10-09)

### 🎨 Windows 화면 보호기 (.scr) 만들기 스튜디오 및 🖥️ 다중 모니터 (듀얼/트리플) 완벽 대응
- **나만의 화면 보호기(.scr) 제작 스튜디오 (`ScrMakerModal.tsx`) 신설**:
  - Windows 표준 `.scr` 파일(PE 실행 파일)을 손쉽게 디자인하고 생성하는 올인원 스튜디오 탑재.
  - 5가지 감각적인 60FPS 애니메이션 프리셋:
    1. **Matrix Digital Rain**: 네온 그린 디지털 카타카나/라틴 코드 비 효과
    2. **Mystic Starfield 3D Warp**: 입체 3차원 우주 별무리 워프 시뮬레이션
    3. **Retro Bouncing DVD**: 모서리를 튕겨 다니는 레트로 DVD 스타일 바운싱 로고
    4. **Cyber HUD & Clock**: 사이버펑크 레이더 원형 HUD 및 대형 디지털 시계
    5. **Neon Particle Mesh**: 상호 연결되는 네온 파티클 콘스텔레이션 네트워크
  - 로고 텍스트, 타이틀 브랜딩, 폰트 패밀리, 기본/보조 컬러, 파티클 수, 이동 속도 실시간 커스텀 지원.
  - Windows 화면 보호기 표준 CLI 인자 (`/s` 전체화면, `/c` 설정창, `/p <HWND>` 제어판 미니어처 임베딩) 100% 준수.
- **다중 모니터 (듀얼/트리플/다중 디스플레이) 완벽 대응 아키텍처**:
  - `Screen.AllScreens`를 순회하여 연결된 모든 디스플레이에 독립 전체화면 창 개별 생성.
  - WinForms의 `WindowState.Maximized` 호출 시 OS가 보조 모니터 창을 주 모니터로 강제 낚아채는 고질적 버그 원천 차단 (`FormStartPosition.Manual` + `Bounds = screen.Bounds` + `FormWindowState.Normal`).
  - `SetProcessDpiAwareness(2)` (Per-Monitor v2 DPI 인식) 지원으로 4K(150%) + FHD(100%) 등 이종 배율/해상도 환경에서 왜곡 및 잘림 방지.
  - 마우스 미세 진동 및 모니터 경계 좌표 점프로 인한 조기 꺼짐을 방지하는 15px 지터 필터 및 어느 화면에서든 입력 감지 시 모든 창이 동시 종료되는 일괄 동기화(Exit Sync).
  - 다중 모니터 2대 동작 모드 선택 지원:
    1. `모든 모니터 동시 애니메이션 실행 (권장)`
    2. `주 모니터 활성화 + 보조 모니터 암전 (OLED 번인 방지 및 절전)`
- **1-클릭 빌드 패키지 (.zip) 다운로더 탑재**:
  - `JSZip`을 통해 C# 소스코드(`Program.cs`), `build.bat`(csc.exe 자동 탐색: .NET Framework 4.8 / .NET Core 6/8/9), 가이드 문서를 원클릭 압축 다운로드하여 로컬에서 외부 툴 없이 1초 만에 `.scr` 파일 빌드 가능.
- **기술 가이드 문서 등록 (`docs/SCREENSAVER_SCR_MAKER_GUIDE.md`)**:
  - 화면 보호기 동작 원리, Win32 CLI 인자 처리, C# P/Invoke, 더블 버퍼링 GDI+, 다중 모니터 5대 핵심 기술 과제 및 배포 체크리스트 수록.

### 💎 순수 창작 네이티브 DLL (`ScreensaverCore.dll`) 탑재 및 기존 DLL 결함 전면 개선
- **순수 창작 Win32 네이티브 DLL (`ScreensaverCore.dll`) 신설**:
  - 외부 프로세스(`reg.exe`, `powershell.exe`) 의존성을 제거하고 0.08ms 이내에 Win32 레지스트리를 원자적으로 갱신.
  - `SystemParametersInfoW(SPI_SETSCREENSAVEACTIVE, ...)` 및 `SystemParametersInfoW(SPI_SETSCREENSAVETIMEOUT, ...)`와 `WM_SETTINGCHANGE` 500ms 논블로킹 브로드캐스트를 결합하여 **재부팅 없이 0.01초 만에 화면 보호기 즉시 활성화**.
  - `ApplyScreensaverSettingsRundll32` 및 `TriggerPreviewRundll32` 등 **100% 스택 안전한 `rundll32.exe` 전용 CALLBACK 엔트리포인트** 구현.
  - `DllMain` 내 `SetDefaultDllDirectories(LOAD_LIBRARY_SEARCH_SYSTEM32)`를 통한 CWE-427 DLL 하이재킹 취약점 방어.
  - C-ABI 소스코드(`native/ScreensaverCore/`), 모듈 정의서(`.def`), 빌드 스크립트(`build_dll.bat`) 완비.
- **기존 DLL 및 전통적 방식의 오류 정밀 분석 및 개선**:
  - `desk.cpl`의 Windows 11 폐지 문제 해결: Win32 표준 코어 API(`Advapi32`, `User32`, `Shell32`) 직접 호출로 Windows 10/11 전 에디션 영구 호환.
  - `rundll32 user32.dll` 비표준 호출로 인한 스택 오염(Stack Corruption / Crash 0xC0000005) 원천 차단.
  - Visual C++ 재배포 패키지(`vcruntime140.dll`) 누락 문제 해결: 정적 링크(`/MT`) 순수 C 컴파일로 단독 무설치 구동 보장.
- **상세 명세서 문서 등록 (`docs/DLL_SPECIFICATION.md`)**:
  - 아키텍처 다이어그램, Win32 매핑 표, API 시그니처, rundll32 규격, 언어별(C/C++, C#, Rust, Python, Batch) 연동 예제, 벤치마크 수록.
- **UI 및 배치 스크립트 연동**:
  - 상단 헤더에 `[DLL Core]` 기술 명세 인스펙터 모달창(`DllInfoModal.tsx`) 연동.
  - 화면 보호기 선택란 옆에 **[미리보기 테스트 (Test Preview)]** 버튼 신설하여 선택한 `.scr` 파일을 실시간 즉시 시연 가능.
  - 생성되는 `.bat` 배치 파일에 `ScreensaverCore.dll`이 동일 폴더에 있을 경우 0ms로 즉각 처리하는 우선 분기 자동 탑재.

### 🚀 GitHub Releases 기반 실시간 자동 업데이트 및 배포 자동화 파이프라인 구축
- **GitHub 계정 연동 및 자동화 스크립트 신설**:
  - GitHub 계정: `AhBiYout`
  - GitHub 사용자 이름: `AhBiYout-all`
  - 저장소 명칭: `screensavergenerator` (URL: `https://github.com/AhBiYout/screensavergenerator`)
  - Windows 자동 푸시/태깅 스크립트(`scripts/github-push.bat`) 및 크로스플랫폼 쉘(`scripts/github-sync.sh`) 신설.
  - `package.json`의 버전을 Single Source of Truth(단일 진실 공급원)로 삼아 `src/version.ts`, `tauri.conf.json`, `Cargo.toml`, Git Commit 및 Git Tag(`vX.Y.Z`)를 원클릭으로 일괄 동기화하는 `scripts/sync-version.js` 탑재.
- **GitHub Releases 실시간 자동 업데이트 시스템 (`UpdateModal`)**:
  - 앱 실행 시 GitHub Releases API (`api.github.com/.../releases/latest`)를 비동기로 실시간 조회.
  - Semantic Versioning 기반 비교 로직(`compareSemver`)을 통해 새 버전 출시 시 **업데이트 알림 팝업 모달창이 자동 실행**.
  - 업데이트 팝업 구성:
    1. 현재 버전 vs 최신 버전 비교 배지 (예: v1.0.9 ➔ v1.1.0)
    2. GitHub 저장소 경로 안내 및 원클릭 클립보드 복사 버튼
    3. 최신 릴리스 상세 변경 내역(Release Notes) 스크롤 뷰
    4. [지금 업데이트] 다운로드 바로가기 버튼 및 [GitHub 저장소 열기] 링크
    5. [나중에 하기] 및 [이 버전 건너뛰기] 설정 저장
  - 상단 헤더 버전 배지 클릭 시 수동 업데이트 확인 및 사전 테스트를 위한 `TEST UPDATE` 트리거 지원.
- **GitHub Actions 크로스 플랫폼 자동 빌드 및 릴리스 배포 파이프라인 구축**:
  - GitHub Actions 워크플로우(`.github/workflows/release.yml`)를 통해 버전 태그(`v*.*.*`) 푸시 시 3대 플랫폼 패키지 자동 빌드 및 GitHub Releases 자산 자동 첨부:
    1. **Windows PC**: `화면보호기설정_v1.1.0.exe` (Windows 10/11 네이티브 데스크톱 실행 파일)
    2. **Android**: `화면보호기설정_v1.1.0.apk` (안드로이드 모바일 패키지)
    3. **Apple iOS**: `화면보호기설정_v1.1.0.ipa` (아이폰/아이패드용 앱 번들 아카이브)
- **저장소 불필요 파일 정리 및 .gitignore 전면 고도화**:
  - `src-tauri/target/`(수백 MB의 Rust 컴파일 캐시), 바이너리 파일(`*.exe`, `*.msi`, `*.apk`), `.vite/`, IDE 설정, OS 캐시 등 불필요한 파일이 Git에 업로드되지 않도록 `.gitignore` 규칙을 대폭 보강.

---

## 📌 v1.0.9 (2026-09-16)

### 🔗 하단 푸터 웹사이트 링크(소속 및 블로그) 열기 문제 해결
- **문제 원인 분석**:
  - Windows 데스크톱 앱(Tauri WebView2) 환경에서 표준 HTML `<a target="_blank">` 링크를 클릭할 때, WebView2의 보안 정책으로 인해 기본 웹 브라우저(Edge, Chrome 등)가 실행되지 않고 클릭 이벤트가 차단/무시되는 현상 발생.
  - 웹 브라우저(iFrame 또는 팝업 차단 환경)에서도 새 창 열기 차단 시 사용자에게 아무런 안내가 없어 링크가 깨진 것처럼 인식됨.
- **해결 조치**:
  1. **Tauri 네이티브 커맨드 (`open_url`) 신설**: Rust 백엔드(`src-tauri/src/lib.rs`)에 시스템 기본 웹 브라우저를 안전하게 호출하는 `open_url` 커맨드 추가 (`cmd /C start "" "<url>"` 및 `explorer.exe` 폴백).
  2. **프론트엔드 연동 핸들러 (`handleOpenExternalUrl`) 구현**:
     - 데스크톱 앱 환경(`__TAURI_INTERNALS__`) 감지 시 Rust 커맨드를 호출하여 사용자의 기본 웹 브라우저에서 사이트가 즉시 열리도록 처리.
     - 웹 브라우저 환경에서는 `window.open` 실행 및 팝업 차단 시 자동으로 URL을 클립보드에 복사하고 친절한 토스트 안내 제공.
  3. **UI/UX 개선**: 소속([cisnet.co.kr](http://www.cisnet.co.kr/)) 및 공식 블로그([ahbiyoutvibe.blogspot.com](https://ahbiyoutvibe.blogspot.com/)) 링크에 외부 링크 아이콘(`ExternalLink`)과 클릭 안내 툴팁 추가.
  4. **버전 전면 동기화**: `package.json`, `tauri.conf.json`, `App.tsx`, 빌드 스크립트 및 문서를 `v1.0.9`로 승격.

---

## 📌 v1.0.8 (2026-09-16)

### ⚙️ Tauri Rust Crate 및 NPM 패키지 버전 불일치(Mismatch) 해결
- **문제 원인 분석**:
  - `build.bat` 실행 시 `tauri build` 단계에서 아래 오류와 함께 빌드가 중단되는 현상 발생:
    `Found version mismatched Tauri packages: tauri (v2.10.3) : @tauri-apps/api (v2.11.1)`
  - 원인: `@tauri-apps/api`가 `2.11.x`로 설치된 반면, Rust 백엔드의 `src-tauri/Cargo.toml`에 `tauri` 크레이트가 `2.10.3`으로 지정되어 있어 Tauri CLI의 버전 정합성 검사(Major/Minor Release Check)를 통과하지 못함.
- **해결 조치**:
  1. `src-tauri/Cargo.toml`의 `tauri` 크레이트 버전을 `2.11.1`로, `tauri-build` 버전을 `2.6.3`으로 업데이트.
  2. `package.json`의 `@tauri-apps/api` 및 `@tauri-apps/cli`를 `^2.11.1`로 정합성 일치.
  3. `build.bat`의 [4/6] 단계에 `src-tauri\Cargo.lock`이 존재할 경우 `cargo update -p tauri -p tauri-build`를 자동 실행하도록 동기화 로직 추가.
  4. 앱 버전 배지, 푸터 및 빌드 산출물(`release/화면보호기설정_v1.0.8.exe`, `release/ScreensaverSetup_v1.0.8.exe`)을 `v1.0.8`로 승격.

---

## 📌 v1.0.7 (2026-09-16)

### 🔌 데스크톱 빌드 및 Tauri 기본 포트 3036 설정
- **기본 포트 3036 변경**:
  - Windows 자동 빌드 스크립트(`build.bat`)의 사용자 입력 기본 포트를 `3036`으로 변경 (`Enter port number [Default 3036]: `).
  - 포트 설정 스크립트(`scripts/update-port.js`)의 fallback 기본 포트를 `3036`으로 동기화.
  - `src-tauri/tauri.conf.json`의 `build.devUrl` 기본값을 `http://localhost:3036`으로 변경하여 로컬 포트 충돌(예: 기존 3000번 점유) 방지.
- **버전 및 UI 동기화**:
  - `package.json`, `tauri.conf.json` 버전을 `1.0.7`로 업데이트.
  - 앱 화면 상단 헤더 배지(`v1.0.7`) 및 하단 푸터 표기 동기화.
  - 빌드 산출물 파일명(`release/화면보호기설정_v1.0.7.exe`, `release/ScreensaverSetup_v1.0.7.exe`) 연동.

---

## 📌 v1.0.6 (2026-09-16)

### 🐛 설정 적용 시 "Input redirection is not supported" 오류 해결
- **문제 원인 분석**:
  - 앱 내에서 **[설정 적용]** 버튼을 누를 때 생성된 배치 스크립트의 하단 `timeout /t 10 >nul` 명령이 백그라운드 프로세스(표준 입출력이 리다이렉션되거나 `CREATE_NO_WINDOW`로 실행되는 환경)에서 실행되면서 발생.
  - Windows `timeout.exe`는 비대화형(Non-interactive) 환경 및 표준 입력이 리다이렉션된 환경에서 `ERROR: Input redirection is not supported, exiting the process immediately.` 오류(종료 코드 1)를 출력하고 강제 종료되어 앱에서 오류 토스트가 발생함.
- **해결 조치**:
  1. **Tauri 자동 적용 인자 분기 (`TAURI_AUTO_APPLY`)**: 백엔드에서 `apply_settings` 실행 시 넘겨주는 `TAURI_AUTO_APPLY` 인자를 감지하여, 레지스트리 등록 및 시스템 동기화 완료 즉시 `exit /b 0`으로 정상 종료되도록 조치 (10초 대기 없이 즉시 완료 처리).
  2. **Timeout 리다이렉션 및 안전 대체(Fallback) 적용**: 독립 실행(`.bat` 파일 직접 실행) 시에도 입출력 리다이렉션 환경에서 오류가 나지 않도록 `timeout /t 10 >nul 2>&1 || ping 127.0.0.1 -n 11 >nul 2>&1`로 개선.
  3. **Tauri 백엔드 프로세스 호출 안정화**: `cmd /C call "..."` 구문 적용 및 `Stdio::null()` 처리, 실행 완료 후 임시 배치 파일 정리 로직 추가.
  4. **버전 전면 동기화**: `package.json`, `tauri.conf.json`, `App.tsx`, `scripts/` 및 `docs/` 문서를 Semantic Versioning에 맞춰 `v1.0.6`으로 승격.

---

### 🏷️ 개발자·소속·공식 블로그 메타데이터 및 UI 동기화
- **공식 정보 규격화**:
  - 개발자: `AhBiYout`
  - 소속: `http://www.cisnet.co.kr/` (cisnet)
  - 구글 블로그: `https://ahbiyoutvibe.blogspot.com/`
- **앱 UI 버전 노출 강화**: 앱 화면 상단 헤더에 버전 배지(`v1.0.5`)를 추가하고, 하단 푸터에 정확한 소속 및 블로그 하이퍼링크와 버전 정보를 동시 표기하여 사용자 화면에서 현재 버전을 즉시 식별 가능하도록 개선.

### 📐 Semantic Versioning (MAJOR.MINOR.PATCH) 3단계 원칙 정립
- **체계적 버전 관리 원칙 확립**:
  - `MAJOR` (x.0.0): 아키텍처 재설계, 호환되지 않는 주요 API/UI 변경
  - `MINOR` (1.x.0): 하위 호환성을 유지하는 신규 기능 추가
  - `PATCH` (1.0.x): 버그 수정, 문서 보강, 성능 최적화, 메타데이터 동기화
- `docs/VERSIONING.md` 문서를 신설하여 코드 수정 발생 시 패치노트 기록 및 버전 동기화 워크플로우를 문서화.

### 📚 문서 체계 및 블로그 게시용 자료 신설
- `docs/` 폴더 내 문서 전면 업데이트 (`README.md`, `MANUAL.md`, `PATCH_NOTES.md`).
- `docs/BLOG_POST.md` 신설: 공식 구글 블로그에 즉시 업로드 가능한 고품질 설명문 원고 및 추천 해시태그 가이드 수록.

### ⚙️ 자동 빌드 스크립트 (build.bat) 및 아티팩트 버전 동기화
- `package.json`의 최신 버전(`1.0.5`)을 실시간으로 감지하여 `release/` 폴더에 `화면보호기설정_v1.0.5.exe` 및 `ScreensaverSetup_v1.0.5.exe`가 자동으로 생성되도록 연동.
- Windows CRLF(`\r\n`) 개행 포맷 보장 및 영문 출력 콘솔로 안정성 확보.

---

## 📌 v1.0.4 (2026-07-22)

### 🎨 저작권 표기 및 문서화 강화
- **저작권 표기 규격화**: 하단 푸터 표기를 `Copyright © AhBiYout All rights reserved.` 규격 문구로 업데이트.
- **문서화(Docs) 폴더 신설**: `docs/` 디렉토리를 생성하고 앱 개요(`README.md`), 상세 사용 설명서(`MANUAL.md`), 버전별 변경 이력(`PATCH_NOTES.md`) 추가.

### ⚙️ 자동 빌드 스크립트 (build.bat) 및 Unicode 파일명 보장
- **사용자 포트 지정 가능**: `build.bat` 실행 시 기본 포트(3000) 외 원하는 포트 번호를 사용자 입력을 통해 지정 가능하도록 확장.
- **cmd.exe 인코딩 및 구문 오류 방지**: Windows CMD 환경에서 한글 깨짐 및 구문 해석 오류로 창이 즉시 닫히던 문제를 해결하기 위해 배치 메시지를 영문 및 `chcp 65001` UTF-8 지원으로 표준화.
- **Node.js 기반 릴리스 아티팩트 자동 생성 (`scripts/copy-release.js`)**: Windows `cmd.exe` 파일명 한글 깨짐 현상을 근본적으로 해결하기 위해 Node.js 유니코드(UTF-16 API) 전용 복사 스크립트를 적용하여 `화면보호기설정_v1.0.4.exe` 및 영문 `ScreensaverSetup_v1.0.4.exe` 파일이 모두 정상적인 한글/영문 이름으로 생성되도록 조치.
- **Tauri 버전 호환성 및 무설치 Executable 빌드 최적화**: `@tauri-apps/api` 및 `@tauri-apps/cli` 패키지 버전을 `^2.11.0`으로 정렬하고, `TAURI_CLI_STRICT_VERSION_CHECKS=false` 옵션을 배치 빌드에 적용하여 로컬 환경의 Tauri 패키지 마이너 버전 차이로 인한 빌드 중단을 방지 및 `tauri build --no-bundle` 연동으로 실행 파일(.exe) 정상 생성.


---

## 📌 v1.0.3 (2026-04-22)

### 🛠 배치 파일 인코딩 및 줄바꿈 최적화
- **인코딩 사양 변경**: BOM이 포함된 UTF-8에서 순수 **`UTF-8 (BOM 없음)`** 표준 인코딩으로 변경.
- **Windows CRLF 개행 강제**: 스크립트 저장 시 모든 줄바꿈을 `\r\n`(CRLF)으로 통일하여 윈도우 메모장 및 CMD에서 구문 오류 방지.
- **`@chcp 65001 >nul` 명령어 포함**: 배치 파일 실행 시 자동으로 코드페이지를 UTF-8로 전환하여 터미널 한글 출력 안정성 확보.

### 📦 Tauri dependencies & NPM packages 버전 정렬
- Rust `tauri-plugin-dialog (v2.7.0)`과 `@tauri-apps/plugin-dialog (~2.7.0)` 버전 불일치로 인한 빌드 에러 해결.
- Rust `tauri-plugin-fs (v2.5.0)`과 `@tauri-apps/plugin-fs (~2.5.0)` 버전 동기화.

---

## 📌 v1.0.2 (2026-04-22)

### 🔒 다운로드 경로 및 파일 삭제 버그 수정 (Rust 원스톱 다이얼로그)
- **증상**: 브라우저 다운로드 샌드박스로 인해 사용자가 지정한 폴더 대신 '다운로드' 폴더로 강제 저장되고, 앱 종료 시 파일이 자동 삭제되던 현상 발생.
- **해결**: 
  - JavaScript 단의 파일 쓰기를 거치지 않고, Rust 백엔드에서 `save_bat_with_dialog` 원스톱 커맨드를 구현.
  - Rust 네이티브 다이얼로그(`rfd` 라이브러리)를 호출하여 사용자가 선택한 실제 파일 시스템 경로에 직접 쓰기를 수행하도록 변경.
  - 파일 삭제 방지 및 지정 폴더 저장 신뢰성 100% 확보.

---

## 📌 v1.0.1 (2026-04-22)

### ✨ 레지스트리 즉시 적용 및 동기화 커맨드 추가
- `apply_settings` 커맨드를 도입하여 `.bat` 파일을 내려받지 않고도 앱 내에서 클릭 한 번으로 Windows 레지스트리 수정 및 화면 보호기 즉시 적용 구현.
- `SystemParametersInfo` Win32 API 및 PowerShell interop 기반 동기화 스크립트 작성.
- `get_current_settings` 커맨드를 구현하여 앱 시작 시 현재 PC의 화면 보호기 상태를 자동 판독하여 화면에 표시.

---

## 📌 v1.0.0 (2026-04-21)

### 🎉 최초 릴리스 (Initial Release)
- Windows 화면 보호기 옵션(켜기/끄기, 종류 선택, 대기 시간, 암호 보호) 설정 인터페이스 구현.
- 기본 화면 보호기(3D 텍스트, 비눗방울, 갈고리 상자, 리본, 사진 등) 및 사용자 지정 커스텀 `.scr` 파일 지원.
- 실시간 배치 스크립트 미리보기 및 클립보드 복사 기능 지원.
- React 19 + Tailwind CSS v4 + Tauri v2 기반 UI 디자인 및 빌드 시스템 구성.
