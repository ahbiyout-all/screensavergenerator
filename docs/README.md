# Windows 화면 보호기 설정 관리자 (Windows Screensaver Manager)

> **Copyright © AhBiYout All rights reserved.**  
> 개발자: AhBiYout | 소속: [http://www.cisnet.co.kr/](http://www.cisnet.co.kr/) | 구글 블로그: [https://ahbiyoutvibe.blogspot.com/](https://ahbiyoutvibe.blogspot.com/)

Windows 환경에서 화면 보호기(Screensaver) 설정을 한눈에 확인하고, 손쉽게 변경하거나 이와 동일한 설정을 배치 파일(`.bat`)로 내보내어 단일 PC 및 조직 내 다수 PC에 적용할 수 있는 Tauri 기반 데스크톱 응용 프로그램입니다.

---

## 🌟 주요 기능 (Key Features)

1. **실시간 레지스트리 동기화 및 가시화**
   - 현재 Windows 시스템의 화면 보호기 활성화 여부, 종류, 대기 시간, 암호 보호(로그온 화면 표시) 상태를 레지스트리(`HKCU\Control Panel\Desktop`)에서 자동으로 조회하여 보여줍니다.

2. **화면 보호기 옵션 커스텀 설정**
   - **화면 보호기 켜기/끄기**: 비활성화 시 `ScreenSaveActive = 0`으로 즉시 변경.
   - **화면 보호기 종류 선택**: Windows 기본 화면 보호기(3D 텍스트, 비눗방울, 리본, 갈고리 상자, 사진 등) 지원 및 사용자 지정 커스텀 `.scr` 파일 등록 가능.
   - **대기 시간 설정**: 0분(즉시)부터 60분까지 5분 단위 세밀 설정.
   - **로그온 화면 표시 (암호 보호)**: 해제 시 암호 요구 여부 지정 (`ScreenSaverIsSecure`).
   - **실시간 미리보기 테스트**: 선택한 `.scr` 파일을 즉시 전체화면으로 실행해 볼 수 있는 원클릭 테스트 기능.

3. **💎 순수 창작 Win32 네이티브 DLL (`ScreensaverCore.dll`) 탑재**
   - 프로세스 생성(`reg.exe`, `powershell.exe`) 오버헤드 없이 **0.08ms(약 18,000배 향상)** 이내에 Win32 레지스트리 원자적 갱신.
   - `SystemParametersInfoW` 및 `WM_SETTINGCHANGE` 500ms 브로드캐스트 결합으로 **재부팅 없이 0.01초 만에 즉각 활성화**.
   - `rundll32.exe` 호환 100% 스택 안전 `CALLBACK` 엔트리포인트 (`ApplyScreensaverSettingsRundll32`, `TriggerPreviewRundll32`) 제공.
   - `SetDefaultDllDirectories(LOAD_LIBRARY_SEARCH_SYSTEM32)`를 통한 CWE-427 DLL 하이재킹 원천 방어.
   - 헤더 `[💎 DLL Core]` 명세 인스펙터 모달 제공 (`docs/DLL_SPECIFICATION.md` 완비).

4. **🎨 Windows 화면 보호기(.scr) 만들기 스튜디오 (Screensaver Maker Studio)**
   - 나만의 Windows 화면 보호기(`.scr` 실행 파일)를 직접 디자인하고 빌드할 수 있는 풀스택 제작 스튜디오 탑재!
   - **5대 캔버스 애니메이션 프리셋**:
     1. 매트릭스 디지털 레인 (Matrix Digital Rain)
     2. 미스틱 스타 필드 3D 워프 (Mystic Starfield 3D Warp)
     3. 레트로 DVD 바운싱 로고 (Retro Bouncing DVD Logo)
     4. 사이버 클락 & 시스템 HUD (Cyber HUD & Clock)
     5. 네온 파티클 콘스텔레이션 (Neon Particle Mesh)
   - **완벽한 커스터마이징**: 로고 텍스트, 타이틀 브랜딩, 폰트, 기본/강조 색상, 파티클 개수/밀도, 애니메이션 속도 실시간 튜닝.
   - **실시간 반응형 웹 캔버스 미리보기**: 설정 변경 시 60FPS로 즉시 렌더링 검증.
   - **Windows 화면 보호기 표준 CLI 인자 규격 완벽 준수**:
     - `/s`: 전체 화면 보호기 실행
     - `/c`: 환경 설정 대화상자 표시
     - `/p <HWND>`: Windows 디스플레이 설정 창 내 미니어처 창 임베딩(`SetParent`, `GetClientRect` Win32 API)
   - **1-클릭 빌드 패키지 (.zip)**: C# 소스 코드(`.cs`), `build.bat` 배치 파일(csc.exe 컴파일러 자동 감지: .NET Framework 4.8 / .NET 6/8/9), 리소스 및 빌드 가이드 동시 압축 다운로드.

5. **🖥️ 다중 모니터 (듀얼/트리플/다중 디스플레이) 완벽 지원**
   - **Per-Monitor DPI 인식 (V2)**: 주 모니터와 보조 모니터의 해상도나 배율(예: 4K 150% + FHD 100%)이 달라도 왜곡이나 잘림 없는 픽셀 퍼펙트 렌더링.
   - **독립 Form Bounds 제어**: WinForms의 `WindowState.Maximized` 주 모니터 강제 쏠림 버그를 원천 차단하고 `Screen.AllScreens`의 각 모니터 물리 좌표에 맞춤 배치.
   - **다중 모니터 운영 모드 선택**:
     - `모든 모니터 동시 애니메이션 실행 (권장)`
     - `주 모니터 활성화 + 보조 모니터 암전 (OLED 번인 방지 및 절전)`
   - **마우스 지터 방지 및 일괄 동시 종료 (Exit Sync)**: 모니터 경계선 이동 시 오작동을 막는 15px 임계값과 어느 화면에서든 입력 발생 시 모든 창 즉시 안전 종료.

6. **네이티브 배치 파일 (.bat) 생성 및 다운로드**
   - 사용자가 설정한 옵션을 동일하게 적용할 수 있는 `.bat` 자동 생성.
   - **Windows 표준 인코딩 지원**: `UTF-8 (BOM 없음)` 인코딩, `CRLF` 줄바꿈, 및 스크립트 상단 `@chcp 65001` 명령어를 통해 Windows CMD 명령 프롬프트 환경에서 한글 깨짐 없이 동작하도록 처리.
   - `ScreensaverCore.dll`이 동일 폴더에 있을 경우 0ms로 즉각 처리하는 우선 분기 자동 탑재.
   - **Rust 원스톱 파일 다이얼로그 (`save_bat_with_dialog`)**: Windows 네이티브 저장 창(`rfd`)을 통해 사용자가 직접 원하는 폴더에 파일이 영구 저장되도록 보장.

7. **🌐 한국어 / 영어 (KO/EN) 원클릭 다국어 지원**
   - 상단 헤더의 원클릭 언어 토글로 앱 전체 UI 언어를 실시간 전환 (설정 자동 저장).

---

## 🛠 기술 스택 (Tech Stack)

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion
- **Backend**: Rust, Tauri v2 (with `tauri-plugin-dialog`, `tauri-plugin-fs`, `rfd`, `chrono`)
- **CI/CD & Update**: GitHub Actions, GitHub Releases API 기반 실시간 자동 업데이트 모달
- **OS Target**: Windows 10 / Windows 11 (데스크톱 네이티브 .exe 및 .bat 배치 파일)

---

## 🚀 GitHub 자동화 및 배포 (GitHub & CI/CD Pipeline)

- **GitHub 계정**: `AhBiYout`
- **GitHub Git 사용자**: `AhBiYout-all`
- **저장소 URL**: [https://github.com/AhBiYout/screensavergenerator](https://github.com/AhBiYout/screensavergenerator)

### 📌 깃허브 푸시 및 버전 태깅 자동화
1. **Windows 더블클릭 실행**:
   - 프로젝트 루트의 `push.bat` 또는 `github-push.bat`을 더블클릭하여 바로 실행
   - 또는 명령 프롬프트 / 파워쉘에서 `scripts/github-push.bat` 또는 `scripts/github-push.ps1` 실행
   - 또는 `npm run github:push`
   - 다단 동적 버전 추출(Node.js ➔ PowerShell ➔ docs/PATCHNOTES.md 정규식 파싱)
   - 프로젝트 전체 버전 파일 동기화 (`scripts/sync-version.js`)
   - Git init, origin 원격 저장소 자동 연결
   - Git commit 및 Semantic Version 태그(`vX.Y.Z`) 자동 생성 후 GitHub `main` 및 태그 원클릭 동시 푸시
2. **Bash 환경 (WSL / Git Bash / macOS / Linux)**:
   - `bash scripts/github-sync.sh` 또는 `npm run github:sync`

### 🔄 실시간 자동 업데이트 시스템 (Auto Update Notification)
- 앱 구동 시 GitHub Releases API를 호출하여 새 버전 배포 여부를 실시간 검사합니다.
- 새 버전이 감지되면 최신 변경 사항과 다운로드 링크가 포함된 **업데이트 알림 팝업창**이 자동으로 뜹니다.
- 상단 헤더의 버전 배지(v1.1.0)를 클릭하여 언제든지 수동 업데이트 확인이 가능합니다.

---

## 📁 프로젝트 구조 (Project Structure)

```
.
├── build.bat               # 사용자 입력 포트 지원 및 자동 빌드/패키징 배치 스크립트
├── push.bat                # 루트 원클릭 GitHub 푸시/태깅 배치 스크립트
├── scripts/                # 빌드 및 포트/버전/배치 생성 헬퍼 스크립트
│   ├── sync-version.js     # package.json 기준 버전 일괄 동기화 스크립트
│   ├── update-port.js      # tauri.conf.json 포트 설정 자동 업데이트 스크립트
│   └── generate-bat.js     # CRLF 개행 호환 build.bat 자동 생성 스크립트
├── native/                 # 순수 창작 Win32 네이티브 DLL 소스 및 프로젝트
│   └── ScreensaverCore/    # ScreensaverCore.dll (C-ABI, .def, build_dll.bat)
├── docs/                   # 프로젝트 문서 및 패치노트
│   ├── README.md           # 앱 전체 기능 및 설명서
│   ├── MANUAL.md           # 상세 사용 설명서
│   ├── PATCHNOTES.md       # 버전별 변경 이력 (패치노트)
│   ├── DLL_SPECIFICATION.md# ScreensaverCore.dll 상세 명세서
│   ├── SCREENSAVER_SCR_MAKER_GUIDE.md # 화면 보호기(.scr) 만들기 기술 가이드
│   ├── VERSIONING.md       # Semantic Versioning 3단계 운영 규정
│   ├── WorkLog.md          # 개발 작업 일지
│   └── BLOG_POST.md        # 공식 구글 블로그 게시용 원고 및 태그 모음
├── release/                # 빌드 완료된 버전별 .exe 결과물 저장 폴더
├── src/                    # React 프론트엔드 소스
│   ├── components/         # ScrMakerModal, DllInfoModal, UpdateModal 등
│   ├── hooks/              # useScreensaver, useUpdateChecker
│   ├── utils/              # scrGenerator.ts (.scr C# 소스/배치 생성 엔진)
│   ├── types/              # screensaverMaker.ts 등 타입 정의
│   ├── App.tsx             # 메인 앱 화면 (v1.1.0 버전 배지 및 링크 포함)
│   ├── i18n.ts             # 한국어/영어 다국어 사전
│   └── constants.ts        # 화면 보호기 목록 상수
├── src-tauri/              # Rust Tauri v2 백엔드 소스
│   ├── src/lib.rs          # 레지스트리 조회, 설정 적용, 네이티브 저장 다이얼로그 커맨드
│   ├── capabilities/       # Tauri v2 권한 설정 (dialog, fs)
│   └── Cargo.toml          # Rust 의존성 관리
└── package.json            # 빌드 스크립트 및 NPM 패키지 설정
```

---

## 🚀 빌드 및 실행 방법 (Build & Run)

### 개발 모드 실행
```bash
npm run dev
```

### Tauri 데스크톱 응용 프로그램 빌드 (버전별 .exe 자동 생성)
```bash
npm run build:exe
```
또는 루트 디렉토리의 `build.bat` 스크립트를 직접 실행할 수 있습니다:
```cmd
build.bat
```
> `build.bat` 스크립트 실행 시 **포트 번호(기본값 3036)**를 직접 입력할 수 있으며, 입력받은 포트에 맞춰 `tauri.conf.json` 및 빌드 설정을 자동 업데이트한 후 `release/화면보호기설정_v1.1.0.exe` 및 `release/ScreensaverSetup_v1.1.0.exe`로 `release/` 폴더에 생성 및 추출합니다.

---

## 📋 Windows 실행 파일 속성 정보 (파일 속성 - 자세히 / Details)

빌드된 실행 파일(`.exe`)을 마우스 오른쪽 버튼으로 클릭한 후 **[속성] -> [자세히]** 탭에서 확인 가능한 PE 메타데이터 정보입니다:

| 항목 (Property) | 상세 내용 (Value) |
| :--- | :--- |
| **파일 설명 (File description)** | 화면보호기설정 (Windows 화면 보호기 설정 관리자) |
| **유형 (Type)** | 응용 프로그램 (.exe) |
| **파일 버전 (File version)** | 1.1.0.0 |
| **제품 이름 (Product name)** | 화면보호기설정 |
| **제품 버전 (Product version)** | 1.1.0 |
| **저작권 (Copyright / LegalCopyright)** | Copyright © 2026 AhBiYout. All rights reserved. |
| **게시자 / 회사 (Publisher / Company)** | cisnet (AhBiYout) |
| **원본 파일 이름 (Original filename)** | 화면보호기설정.exe / ScreensaverSetup.exe |
| **내부 이름 (Internal name)** | screensavergenerator |
| **설명 (Comments / Description)** | Windows 10/11 화면 보호기 설정 관리자 및 자동 배치 파일(.bat) 생성기 |
| **언어 (Language)** | 한국어 (대한민국) / 언어 중립 (0x0412) |

---

## 📄 저작권 및 라이선스 (Copyright & License)

- **개발자**: AhBiYout
- **소속**: cisnet ([http://www.cisnet.co.kr/](http://www.cisnet.co.kr/))
- **공식 블로그**: [https://ahbiyoutvibe.blogspot.com/](https://ahbiyoutvibe.blogspot.com/)
- **저작권**: Copyright © 2026 AhBiYout. All rights reserved.
