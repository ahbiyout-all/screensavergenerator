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

3. **원클릭 즉시 적용 (Rust 네이티브 커맨드)**
   - 백엔드(Rust)의 `apply_settings` 커맨드를 통해 사용자가 지정한 옵션을 Windows 레지스트리에 업데이트하고 `SystemParametersInfo` Win32 API를 호출하여 즉시 화면 보호기 설정을 적용합니다.

4. **네이티브 배치 파일 (.bat) 생성 및 다운로드**
   - 사용자가 설정한 옵션을 동일하게 적용할 수 있는 `.bat` 자동 생성.
   - **Windows 표준 인코딩 지원**: `UTF-8 (BOM 없음)` 인코딩, `CRLF` 줄바꿈, 및 스크립트 상단 `@chcp 65001` 명령어를 통해 Windows CMD 명령 프롬프트 환경에서 한글 깨짐 없이 동작하도록 처리.
   - **Rust 원스톱 파일 다이얼로그 (`save_bat_with_dialog`)**: Tauri 브라우저 샌드박스의 파일 다운로드 폴더 강제 저장 한계를 극복하고, Windows 네이티브 저장 창(`rfd`)을 통해 사용자가 직접 원하는 폴더에 파일이 영구 저장되도록 보장.

5. **스크립트 클립보드 복사**
   - 미리보기 영역에서 스크립트를 즉시 클립보드로 복사 가능.

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
├── scripts/                # 빌드 및 포트/배치 생성 헬퍼 스크립트
│   ├── update-port.js      # tauri.conf.json 포트 설정 자동 업데이트 스크립트
│   └── generate-bat.js     # CRLF 개행 호환 build.bat 자동 생성 스크립트
├── docs/                   # 프로젝트 문서 및 패치노트
│   ├── README.md           # 앱 전체 기능 및 설명서
│   ├── MANUAL.md           # 상세 사용 설명서
│   ├── PATCH_NOTES.md      # 버전별 변경 이력 (패치노트)
│   ├── VERSIONING.md       # Semantic Versioning 3단계 운영 규정
│   └── BLOG_POST.md        # 공식 구글 블로그 게시용 원고 및 태그 모음
├── release/                # 빌드 완료된 버전별 .exe 결과물 저장 폴더
├── src/                    # React 프론트엔드 소스
│   ├── components/         # Toggle 등 UI 공통 컴포넌트
│   ├── hooks/              # 화면 보호기 로직 및 배치 스크립트 생성 Hook
│   ├── App.tsx             # 메인 앱 화면 (v1.0.9 버전 배지 및 링크 포함)
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
> `build.bat` 스크립트 실행 시 **포트 번호(기본값 3036)**를 직접 입력할 수 있으며, 입력받은 포트에 맞춰 `tauri.conf.json` 및 빌드 설정을 자동 업데이트한 후 `release/화면보호기설정_v1.0.9.exe` 및 `release/ScreensaverSetup_v1.0.9.exe`로 `release/` 폴더에 생성 및 추출합니다.

---

## 📋 Windows 실행 파일 속성 정보 (파일 속성 - 자세히 / Details)

빌드된 실행 파일(`.exe`)을 마우스 오른쪽 버튼으로 클릭한 후 **[속성] -> [자세히]** 탭에서 확인 가능한 PE 메타데이터 정보입니다:

| 항목 (Property) | 상세 내용 (Value) |
| :--- | :--- |
| **파일 설명 (File description)** | 화면보호기설정 (Windows 화면 보호기 설정 관리자) |
| **유형 (Type)** | 응용 프로그램 (.exe) |
| **파일 버전 (File version)** | 1.0.9.0 |
| **제품 이름 (Product name)** | 화면보호기설정 |
| **제품 버전 (Product version)** | 1.0.9 |
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
